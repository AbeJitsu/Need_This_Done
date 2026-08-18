import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getSupabaseAdmin } from '@/lib/supabase';
import { selectModelRoutingPolicy, type ModelCandidate, type ModelEvaluationRecord, type ModelEvaluationTaskId } from '@/lib/model-evaluation';
import { consumeWorkerNonce, isSignedWorkerFailure, verifySignedWorkerRequest } from '@/lib/private-worker-auth';

export const dynamic = 'force-dynamic';

const schema = z.object({ workerId: z.string().trim().min(1).max(160), profileId: z.string().uuid() }).strict();

function recordFromRow(row: Record<string, unknown>): ModelEvaluationRecord {
  return {
    candidateId: String(row.candidate_id), providerModelId: String(row.provider_model_id), actualModelId: row.actual_model_id ? String(row.actual_model_id) : null, taskId: row.task_id as ModelEvaluationTaskId,
    qualityScore: Number(row.quality_score), toolUseScore: Number(row.tool_use_score), latencyMs: Number(row.latency_ms), costUsd: Number(row.cost_usd),
    failed: Boolean(row.failed), repairRequired: Boolean(row.repair_required), evaluatedOn: String(row.evaluated_on),
  };
}

export async function POST(request: Request) {
  const signed = await verifySignedWorkerRequest(request, '/api/prospecting/worker/benchmark/config');
  if (isSignedWorkerFailure(signed)) return signed;
  let json: unknown;
  try { json = JSON.parse(signed.body); } catch { return NextResponse.json({ error: 'Invalid benchmark config JSON.' }, { status: 400 }); }
  const parsed = schema.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message || 'Invalid benchmark config request.' }, { status: 400 });
  const replay = await consumeWorkerNonce(signed.nonce);
  if (replay) return replay;

  const admin = getSupabaseAdmin();
  const { data: profile } = await admin.from('growth_profiles').select('id, owner_id, timezone, emergency_stop, model_route, selected_model_id').eq('id', parsed.data.profileId).maybeSingle();
  if (!profile || profile.emergency_stop) return NextResponse.json({ error: 'The profile is unavailable or stopped.' }, { status: 409 });
  const [candidateResult, recordResult] = await Promise.all([
    admin.from('model_benchmark_candidates').select('*').eq('profile_id', profile.id).eq('is_active', true).order('discovered_at'),
    admin.from('model_evaluation_records').select('*').eq('owner_id', profile.owner_id).order('evaluated_on', { ascending: false }),
  ]);
  if (candidateResult.error || recordResult.error) return NextResponse.json({ error: 'Benchmark evidence is unavailable.' }, { status: 503 });
  const candidates = (candidateResult.data || []).map((row) => ({ id: row.candidate_id, label: row.provider_model_id, kind: row.candidate_kind, providerModelId: row.provider_model_id, catalogMetadata: row.catalog_metadata || {} })) as ModelCandidate[];
  const policy = selectModelRoutingPolicy(
    (recordResult.data || []).map((row) => recordFromRow(row as Record<string, unknown>)),
    candidates.filter((candidate) => candidate.kind === 'free'),
  );
  return NextResponse.json({ profile: { id: profile.id, timezone: profile.timezone, modelRoute: profile.model_route, selectedModelId: profile.selected_model_id }, candidates: candidateResult.data || [], policy });
}
