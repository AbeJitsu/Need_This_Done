import { NextResponse } from 'next/server';
import { z } from 'zod';
import { validateDailyDeskProspectBatch } from '@/lib/daily-desk';
import { getSupabaseAdmin } from '@/lib/supabase';
import { consumeWorkerNonce, isSignedWorkerFailure, verifySignedDailyDeskWorkerRequest } from '@/lib/private-worker-auth';

export const dynamic = 'force-dynamic';

const citationSchema = z.object({ url: z.string().url().max(2_000), title: z.string().trim().min(1).max(500), excerpt: z.string().trim().min(1).max(2_000) }).strict();
const schema = z.object({
  runId: z.string().uuid(),
  workerId: z.string().trim().min(1).max(160),
  status: z.enum(['succeeded', 'shortfall', 'failed']),
  prospects: z.array(z.unknown()).max(2),
  shortfallReason: z.string().trim().min(1).max(2_000).optional(),
  reservationKey: z.string().uuid().optional(),
  actualModelId: z.string().trim().min(1).max(240).optional(),
  actualCostUsd: z.number().finite().nonnegative().nullable().optional(),
  providerUsage: z.record(z.string(), z.unknown()).optional(),
  providerCitations: z.array(citationSchema).max(20).optional(),
  promptTokens: z.number().int().nonnegative().nullable().optional(),
  completionTokens: z.number().int().nonnegative().nullable().optional(),
  error: z.string().trim().min(1).max(4_000).optional(),
}).strict().superRefine((value, context) => {
  if (value.reservationKey && value.actualCostUsd === undefined) {
    context.addIssue({ code: 'custom', path: ['actualCostUsd'], message: 'A reserved provider request must report actual cost or an explicit missing cost.' });
  }
});

function safeFailureMessage(value: unknown) {
  return value instanceof Error ? value.message : 'The Daily Desk result did not pass bounded validation.';
}

/**
 * Store the signed public-web result. A missing or over-budget actual cost
 * stays visible in the ledger but prevents prospect cards from being accepted.
 */
export async function POST(request: Request) {
  const signed = await verifySignedDailyDeskWorkerRequest(request, '/api/daily-desk/worker/result');
  if (isSignedWorkerFailure(signed)) return signed;
  const parsed = schema.safeParse(await Promise.resolve().then(() => JSON.parse(signed.body)).catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message || 'Invalid Daily Desk result.' }, { status: 400 });
  const replay = await consumeWorkerNonce(signed.nonce);
  if (replay) return replay;

  const admin = getSupabaseAdmin();
  const runResult = await admin
    .from('daily_desk_runs')
    .select('id, status, leased_by, lease_expires_at, selected_model_id')
    .eq('id', parsed.data.runId)
    .maybeSingle();
  const run = runResult.data;
  if (runResult.error || !run || run.status !== 'leased' || run.leased_by !== parsed.data.workerId || !run.lease_expires_at || new Date(run.lease_expires_at) <= new Date()) {
    return NextResponse.json({ error: 'The Daily Desk run lease is invalid or expired.' }, { status: 409 });
  }

  let finalStatus = parsed.data.status;
  let prospects: unknown[] = finalStatus === 'failed' ? [] : parsed.data.prospects;
  let shortfallReason = parsed.data.shortfallReason || null;
  let validationError: string | null = null;
  if (finalStatus !== 'failed') {
    try {
      if (parsed.data.prospects.length > 0 && !parsed.data.providerCitations?.length) {
        throw new Error('A Daily Desk prospect result requires provider public-web citations.');
      }
      const batch = validateDailyDeskProspectBatch({ prospects: parsed.data.prospects, ...(shortfallReason ? { shortfallReason } : {}) }, parsed.data.providerCitations || []);
      prospects = batch.prospects;
      shortfallReason = batch.shortfallReason || null;
      finalStatus = batch.prospects.length === 2 ? 'succeeded' : 'shortfall';
    } catch (error) {
      finalStatus = 'failed';
      prospects = [];
      shortfallReason = null;
      validationError = safeFailureMessage(error);
    }
  }

  let reconciliationStatus: string | null = null;
  if (parsed.data.reservationKey) {
    const reconciliation = await admin.rpc('reconcile_daily_desk_cost', {
      target_reservation_key: parsed.data.reservationKey,
      target_actual_cost: parsed.data.actualCostUsd,
      target_provider_usage: {
        ...(parsed.data.providerUsage || {}),
        ...(parsed.data.providerCitations ? { citations: parsed.data.providerCitations } : {}),
      },
    });
    if (reconciliation.error || !reconciliation.data) return NextResponse.json({ error: 'The Daily Desk provider cost could not be reconciled.' }, { status: 409 });
    reconciliationStatus = String((reconciliation.data as { status?: unknown }).status || '');
    if (parsed.data.actualCostUsd === null || reconciliationStatus !== 'reconciled') {
      finalStatus = 'failed';
      prospects = [];
      shortfallReason = null;
      validationError ||= 'The provider cost is missing or exceeds the reservation, so this result is not accepted.';
    }
    if (!parsed.data.actualModelId || parsed.data.actualModelId !== run.selected_model_id) {
      finalStatus = 'failed';
      prospects = [];
      shortfallReason = null;
      validationError ||= 'The provider did not confirm the server-selected model.';
    }
  }
  if ((finalStatus === 'succeeded' || (finalStatus === 'shortfall' && prospects.length > 0)) && !parsed.data.reservationKey) {
    finalStatus = 'failed';
    prospects = [];
    shortfallReason = null;
    validationError ||= 'A provider-backed prospect result requires a cost reservation.';
  }

  const completed = await admin.rpc('complete_daily_desk_run', {
    target_run_id: parsed.data.runId,
    target_worker: parsed.data.workerId,
    target_status: finalStatus,
    target_prospects: prospects,
    target_shortfall_reason: finalStatus === 'shortfall' ? shortfallReason : null,
    target_reservation_key: parsed.data.reservationKey || null,
    target_actual_model_id: parsed.data.actualModelId || null,
    target_provider_usage: {
      ...(parsed.data.providerUsage || {}),
      ...(validationError ? { resultError: validationError } : {}),
      ...(reconciliationStatus ? { reconciliationStatus } : {}),
    },
  });
  if (completed.error || !completed.data) return NextResponse.json({ error: 'The Daily Desk result could not be completed.' }, { status: 409 });
  return NextResponse.json({ run: completed.data, accepted: finalStatus !== 'failed', ...(validationError ? { error: validationError } : {}) });
}
