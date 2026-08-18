import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getSupabaseAdmin } from '@/lib/supabase';
import { getOpenRouterModelConfig } from '@/lib/openrouter-config';
import { DEEPSEEK_V4_FLASH_FALLBACK, freeCandidatesCompleted, selectModelRoutingPolicy, summarizeModelEvaluation, type ModelCandidate, type ModelEvaluationRecord, type ModelEvaluationTaskId } from '@/lib/model-evaluation';
import { localDateForTimezone } from '@/lib/prospecting';
import { consumeWorkerNonce, isSignedWorkerFailure, verifySignedWorkerRequest } from '@/lib/private-worker-auth';

export const dynamic = 'force-dynamic';

const schema = z.object({
  workerId: z.string().trim().min(1).max(160),
  profileId: z.string().uuid(),
  reservationKey: z.string().uuid(),
  candidateId: z.string().trim().min(1).max(240),
  providerModelId: z.string().trim().min(1).max(240),
  taskId: z.enum(['classify-public-evidence', 'draft-approved-message', 'summarize-weekly-brief']),
  qualityScore: z.number().finite().min(0).max(1),
  toolUseScore: z.number().finite().min(0).max(1),
  latencyMs: z.number().int().nonnegative().max(120_000),
  costUsd: z.number().finite().nonnegative(),
  failed: z.boolean(),
  repairRequired: z.boolean(),
  notes: z.string().trim().max(4_000).default(''),
  providerUsage: z.record(z.string(), z.unknown()).default({}),
  comparisonOnly: z.boolean().default(false),
}).strict();

function recordFromRow(row: Record<string, unknown>): ModelEvaluationRecord {
  return { candidateId: String(row.candidate_id), providerModelId: String(row.provider_model_id), taskId: row.task_id as ModelEvaluationTaskId, qualityScore: Number(row.quality_score), toolUseScore: Number(row.tool_use_score), latencyMs: Number(row.latency_ms), costUsd: Number(row.cost_usd), failed: Boolean(row.failed), repairRequired: Boolean(row.repair_required), evaluatedOn: String(row.evaluated_on) };
}

export async function POST(request: Request) {
  const signed = await verifySignedWorkerRequest(request, '/api/prospecting/worker/benchmark/result');
  if (isSignedWorkerFailure(signed)) return signed;
  let json: unknown;
  try { json = JSON.parse(signed.body); } catch { return NextResponse.json({ error: 'Invalid benchmark result JSON.' }, { status: 400 }); }
  const parsed = schema.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message || 'Invalid benchmark result.' }, { status: 400 });
  const replay = await consumeWorkerNonce(signed.nonce);
  if (replay) return replay;

  const admin = getSupabaseAdmin();
  const { data: profile } = await admin.from('growth_profiles').select('id, owner_id, timezone, emergency_stop, model_route, selected_model_id').eq('id', parsed.data.profileId).maybeSingle();
  if (!profile || profile.emergency_stop) return NextResponse.json({ error: 'Benchmarking is unavailable for this profile.' }, { status: 409 });
  const { data: candidate } = await admin.from('model_benchmark_candidates').select('*').eq('profile_id', profile.id).eq('candidate_id', parsed.data.candidateId).eq('provider_model_id', parsed.data.providerModelId).eq('is_active', true).maybeSingle();
  if (!candidate) return NextResponse.json({ error: 'The benchmark model was not catalog-persisted for this profile.' }, { status: 409 });
  const comparisonCandidate = candidate.candidate_kind === 'configured-primary' || candidate.candidate_kind === 'configured-test';
  if (parsed.data.comparisonOnly !== comparisonCandidate) return NextResponse.json({ error: 'The benchmark route does not match the registered candidate.' }, { status: 409 });
  if (comparisonCandidate) {
    if (profile.model_route !== 'evaluation-required' || profile.selected_model_id) {
      return NextResponse.json({ error: 'Model comparison is unavailable after a model selection.' }, { status: 409 });
    }
    let configured: ReturnType<typeof getOpenRouterModelConfig>;
    try { configured = getOpenRouterModelConfig(); } catch { return NextResponse.json({ error: 'Configured model comparison is unavailable.' }, { status: 503 }); }
    const expectedModel = candidate.candidate_kind === 'configured-primary' ? configured.primaryModel : configured.testModel;
    if (parsed.data.providerModelId !== expectedModel) return NextResponse.json({ error: 'The comparison model does not match the private model configuration.' }, { status: 409 });
  } else if (profile.model_route !== 'evaluation-required') {
    return NextResponse.json({ error: 'Benchmarking is unavailable after model selection or an emergency stop.' }, { status: 409 });
  }

  const { data: reconciliation, error: reconciliationError } = await admin.rpc('reconcile_private_model_usage', {
    target_reservation_key: parsed.data.reservationKey,
    target_actual_cost: parsed.data.costUsd,
    target_provider_usage: parsed.data.providerUsage,
  });
  if (reconciliationError || !reconciliation) return NextResponse.json({ error: 'Benchmark usage could not be reconciled.' }, { status: 409 });
  const [candidateResult, recordResult] = await Promise.all([
    admin.from('model_benchmark_candidates').select('*').eq('profile_id', profile.id).eq('is_active', true),
    admin.from('model_evaluation_records').select('*').eq('owner_id', profile.owner_id),
  ]);
  if (candidateResult.error || recordResult.error) return NextResponse.json({ error: 'Benchmark evidence is unavailable.' }, { status: 503 });
  const candidates = (candidateResult.data || []).map((row) => ({ id: row.candidate_id, label: String((row.catalog_metadata as Record<string, unknown>)?.label || row.provider_model_id), kind: row.candidate_kind, providerModelId: row.provider_model_id, catalogMetadata: row.catalog_metadata || {} })) as ModelCandidate[];
  const freeCandidates = candidates.filter((item) => item.kind === 'free');
  const existingRecords = (recordResult.data || []).map((row) => recordFromRow(row as Record<string, unknown>));
  if (candidate.candidate_kind === 'deepseek-fallback') {
    const fallbackAllowed = freeCandidatesCompleted(existingRecords, freeCandidates)
      && freeCandidates.every((free) => !summarizeModelEvaluation(existingRecords, free.id).clearsThreshold);
    if (!fallbackAllowed || parsed.data.providerModelId !== DEEPSEEK_V4_FLASH_FALLBACK.providerModelId) {
      return NextResponse.json({ error: 'The pinned fallback cannot be measured before every free candidate misses the threshold.' }, { status: 409 });
    }
  }

  const evaluatedOn = localDateForTimezone(profile.timezone);
  if (!evaluatedOn) return NextResponse.json({ error: 'The profile timezone is invalid.' }, { status: 409 });
  const { data: record, error: recordError } = await admin.from('model_evaluation_records').upsert({
    owner_id: profile.owner_id,
    candidate_id: parsed.data.candidateId,
    provider_model_id: parsed.data.providerModelId,
    task_id: parsed.data.taskId,
    quality_score: parsed.data.qualityScore,
    tool_use_score: parsed.data.toolUseScore,
    latency_ms: parsed.data.latencyMs,
    cost_usd: parsed.data.costUsd,
    failed: parsed.data.failed,
    repair_required: parsed.data.repairRequired,
    evaluated_on: evaluatedOn,
    notes: parsed.data.notes,
  }, { onConflict: 'owner_id,candidate_id,task_id,evaluated_on' }).select('*').single();
  if (recordError || !record) return NextResponse.json({ error: 'Benchmark evidence could not be recorded.' }, { status: 500 });

  const nextRecords = [...existingRecords.filter((entry) => !(entry.candidateId === parsed.data.candidateId && entry.taskId === parsed.data.taskId && entry.evaluatedOn === evaluatedOn)), recordFromRow(record as Record<string, unknown>)];
  if (comparisonCandidate) {
    return NextResponse.json({ record, comparisonOnly: true, primaryRoute: profile.model_route });
  }
  const fallback = candidates.find((item) => item.kind === 'deepseek-fallback') || DEEPSEEK_V4_FLASH_FALLBACK;
  const policy = selectModelRoutingPolicy(nextRecords, freeCandidates, fallback);
  const modelUpdate = policy.status === 'evaluation-required'
    ? { model_route: 'evaluation-required', selected_model_id: null, selected_model_rationale: '', model_selected_at: null }
    : { model_route: policy.status, selected_model_id: policy.defaultModel, selected_model_rationale: policy.rationale, model_selected_at: new Date().toISOString() };
  const { error: profileError } = await admin.from('growth_profiles').update(modelUpdate).eq('id', profile.id);
  if (profileError) return NextResponse.json({ error: 'The benchmark was recorded but the model route could not be pinned.' }, { status: 503 });
  return NextResponse.json({ record, policy });
}
