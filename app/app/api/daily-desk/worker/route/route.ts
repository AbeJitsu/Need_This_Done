import { NextResponse } from 'next/server';
import { z } from 'zod';
import { DAILY_DESK_PROVIDER_POLICY, selectDailyDeskTextModel, type DailyDeskEvaluation } from '@/lib/daily-desk';
import { OpenRouterClient } from '@/lib/openrouter-core';
import { getSupabaseAdmin } from '@/lib/supabase';
import { consumeWorkerNonce, isSignedWorkerFailure, verifySignedDailyDeskWorkerRequest } from '@/lib/private-worker-auth';

export const dynamic = 'force-dynamic';

const schema = z.object({
  workerId: z.string().trim().min(1).max(160),
  runId: z.string().uuid(),
  ownerId: z.string().uuid(),
}).strict();

function number(value: unknown) {
  const parsed = typeof value === 'number' ? value : typeof value === 'string' ? Number(value) : NaN;
  return Number.isFinite(parsed) ? parsed : null;
}

function nextMonthStart(localDate: string) {
  const match = /^(\d{4})-(\d{2})-\d{2}$/.exec(localDate);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  if (!Number.isInteger(year) || month < 1 || month > 12) return null;
  return `${month === 12 ? year + 1 : year}-${String(month === 12 ? 1 : month + 1).padStart(2, '0')}-01`;
}

function strictPolicy(value: unknown) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const policy = value as Record<string, unknown>;
  return policy.require_parameters === true
    && policy.data_collection === 'deny'
    && policy.zdr === true
    && policy.allow_fallbacks === false;
}

/**
 * The Vercel control plane resolves the live catalog and durable quality
 * evidence. The Mac mini only receives the resulting fixed route.
 */
export async function POST(request: Request) {
  const signed = await verifySignedDailyDeskWorkerRequest(request, '/api/daily-desk/worker/route');
  if (isSignedWorkerFailure(signed)) return signed;
  const parsed = schema.safeParse(await Promise.resolve().then(() => JSON.parse(signed.body)).catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message || 'Invalid Daily Desk route request.' }, { status: 400 });
  const replay = await consumeWorkerNonce(signed.nonce);
  if (replay) return replay;

  const admin = getSupabaseAdmin();
  const runResult = await admin
    .from('daily_desk_runs')
    .select('id, owner_id, local_date, status, leased_by, lease_expires_at, selected_model_id, route_estimated_cost, route_rationale, provider_policy')
    .eq('id', parsed.data.runId)
    .eq('owner_id', parsed.data.ownerId)
    .maybeSingle();
  const run = runResult.data;
  if (runResult.error || !run || run.status !== 'leased' || run.leased_by !== parsed.data.workerId || !run.lease_expires_at || new Date(run.lease_expires_at) <= new Date()) {
    return NextResponse.json({ error: 'The Daily Desk run lease is invalid or expired.' }, { status: 409 });
  }

  const existingCost = number(run.route_estimated_cost);
  if (run.selected_model_id && existingCost !== null && run.route_rationale && strictPolicy(run.provider_policy)) {
    return NextResponse.json({ route: {
      modelId: run.selected_model_id,
      estimatedCostUsd: existingCost,
      providerPolicy: DAILY_DESK_PROVIDER_POLICY,
      rationale: run.route_rationale,
    } });
  }
  if (run.selected_model_id || run.route_estimated_cost !== null || run.route_rationale) {
    return NextResponse.json({ error: 'The persisted Daily Desk route is incomplete.' }, { status: 409 });
  }

  const monthStart = `${run.local_date.slice(0, 7)}-01`;
  const monthEnd = nextMonthStart(run.local_date);
  if (!monthEnd) return NextResponse.json({ error: 'The Daily Desk run date is invalid.' }, { status: 409 });
  const [evaluationResult, costsResult] = await Promise.all([
    admin.from('model_evaluation_records').select('provider_model_id, task_id, quality_score, tool_use_score, failed, repair_required').eq('owner_id', parsed.data.ownerId),
    admin.from('daily_desk_cost_reservations').select('local_date, reserved_cost, actual_cost, status').eq('owner_id', parsed.data.ownerId).gte('local_date', monthStart).lt('local_date', monthEnd).in('status', ['reserved', 'reconciled', 'actual_cost_missing', 'overage']),
  ]);
  if (evaluationResult.error || costsResult.error) return NextResponse.json({ error: 'Daily Desk routing evidence is unavailable.' }, { status: 503 });
  const costs = costsResult.data || [];
  const committed = (row: { reserved_cost: unknown; actual_cost: unknown }) => number(row.actual_cost) ?? number(row.reserved_cost) ?? 0;
  const monthlyCommittedUsd = costs.reduce((total, row) => total + committed(row), 0);
  const dailyCommittedUsd = costs.filter((row) => row.local_date === run.local_date).reduce((total, row) => total + committed(row), 0);
  const evaluations: DailyDeskEvaluation[] = (evaluationResult.data || []).map((row) => ({
    providerModelId: String(row.provider_model_id), taskId: String(row.task_id), qualityScore: Number(row.quality_score), toolUseScore: Number(row.tool_use_score), failed: Boolean(row.failed), repairRequired: Boolean(row.repair_required),
  }));

  const key = process.env.OPENROUTER_API_KEY;
  if (!key) return NextResponse.json({ route: null, reason: 'The server has no configured text-model catalog credential.' });
  let models;
  try { models = await new OpenRouterClient(key).listModels(); }
  catch { return NextResponse.json({ route: null, reason: 'The live text-model catalog is unavailable.' }); }
  const route = selectDailyDeskTextModel({
    candidates: models.map((model) => ({
      id: model.id, availability: model.availability,
      supportedParameters: model.supportedParameters.map((value) => value.toLowerCase()),
      pricing: model.pricing,
    })),
    evaluations,
    dailyCommittedUsd,
    monthlyCommittedUsd,
  });
  if (!route) return NextResponse.json({ route: null, reason: 'No quality-approved, price-known candidate currently fits the Daily Desk policy and remaining budget.' });

  const recorded = await admin.rpc('record_daily_desk_model_route', {
    target_owner_id: parsed.data.ownerId,
    target_run_id: parsed.data.runId,
    target_worker: parsed.data.workerId,
    target_model_id: route.modelId,
    target_estimated_cost: route.estimatedCostUsd,
    target_provider_policy: route.providerPolicy,
    target_route_rationale: route.rationale,
  });
  if (recorded.error) return NextResponse.json({ error: 'The Daily Desk model route could not be recorded.' }, { status: 409 });
  return NextResponse.json({ route });
}
