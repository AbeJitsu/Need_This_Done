import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getSupabaseAdmin } from '@/lib/supabase';
import { getOpenRouterModelConfig } from '@/lib/openrouter-config';
import { DEEPSEEK_V4_FLASH_FALLBACK, freeCandidatesCompleted, summarizeModelEvaluation, type ModelCandidate, type ModelEvaluationRecord, type ModelEvaluationTaskId } from '@/lib/model-evaluation';
import { consumeWorkerNonce, isSignedWorkerFailure, verifySignedWorkerRequest } from '@/lib/private-worker-auth';

export const dynamic = 'force-dynamic';

const candidateSchema = z.object({
  candidateId: z.string().trim().min(1).max(240),
  providerModelId: z.string().trim().min(1).max(240),
  label: z.string().trim().min(1).max(300),
  candidateKind: z.enum(['free', 'deepseek-fallback', 'configured-primary', 'configured-test']),
  catalogMetadata: z.record(z.string(), z.unknown()),
}).strict();
const schema = z.object({ workerId: z.string().trim().min(1).max(160), profileId: z.string().uuid(), candidates: z.array(candidateSchema).min(1).max(3) }).strict();

function recordFromRow(row: Record<string, unknown>): ModelEvaluationRecord {
  return { candidateId: String(row.candidate_id), providerModelId: String(row.provider_model_id), taskId: row.task_id as ModelEvaluationTaskId, qualityScore: Number(row.quality_score), toolUseScore: Number(row.tool_use_score), latencyMs: Number(row.latency_ms), costUsd: Number(row.cost_usd), failed: Boolean(row.failed), repairRequired: Boolean(row.repair_required), evaluatedOn: String(row.evaluated_on) };
}

function movingAlias(value: string) {
  return /(^|[/:_-])latest($|[/:_-])/i.test(value);
}

export async function POST(request: Request) {
  const signed = await verifySignedWorkerRequest(request, '/api/prospecting/worker/benchmark/candidates');
  if (isSignedWorkerFailure(signed)) return signed;
  let json: unknown;
  try { json = JSON.parse(signed.body); } catch { return NextResponse.json({ error: 'Invalid benchmark candidate JSON.' }, { status: 400 }); }
  const parsed = schema.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message || 'Invalid benchmark candidates.' }, { status: 400 });
  if (parsed.data.candidates.some((candidate) => movingAlias(candidate.providerModelId))) return NextResponse.json({ error: 'Moving latest aliases cannot be benchmark candidates.' }, { status: 400 });
  const replay = await consumeWorkerNonce(signed.nonce);
  if (replay) return replay;

  const kinds = new Set(parsed.data.candidates.map((candidate) => candidate.candidateKind));
  const isConfiguredComparison = parsed.data.candidates.length === 2
    && kinds.size === 2
    && parsed.data.candidates.every((candidate) => candidate.candidateKind === 'configured-primary' || candidate.candidateKind === 'configured-test');
  if (!isConfiguredComparison && kinds.size !== 1) return NextResponse.json({ error: 'Register free candidates and the fallback in separate requests.' }, { status: 400 });
  const kind = parsed.data.candidates[0].candidateKind;
  const uniqueModels = new Set(parsed.data.candidates.map((candidate) => candidate.providerModelId));
  if (uniqueModels.size !== parsed.data.candidates.length) return NextResponse.json({ error: 'Benchmark candidates must have unique model IDs.' }, { status: 400 });

  const admin = getSupabaseAdmin();
  const { data: profile } = await admin.from('growth_profiles').select('id, owner_id, emergency_stop, model_route').eq('id', parsed.data.profileId).maybeSingle();
  if (!profile || profile.emergency_stop) return NextResponse.json({ error: 'Candidate selection is unavailable for this profile.' }, { status: 409 });

  if (isConfiguredComparison) {
    let configured: ReturnType<typeof getOpenRouterModelConfig>;
    try { configured = getOpenRouterModelConfig(); } catch { return NextResponse.json({ error: 'Configured model comparison is unavailable.' }, { status: 503 }); }
    const expected = new Map([
      ['configured-primary', configured.primaryModel],
      ['configured-test', configured.testModel],
    ] as const);
    if (parsed.data.candidates.some((candidate) => candidate.candidateId !== candidate.candidateKind || candidate.providerModelId !== expected.get(candidate.candidateKind as 'configured-primary' | 'configured-test'))) {
      return NextResponse.json({ error: 'Comparison candidates do not match the private model configuration.' }, { status: 409 });
    }
  } else if (profile.model_route !== 'evaluation-required') {
    return NextResponse.json({ error: 'Candidate selection is unavailable after model selection or an emergency stop.' }, { status: 409 });
  }

  if (kind === 'deepseek-fallback') {
    const candidate = parsed.data.candidates[0];
    if (parsed.data.candidates.length !== 1 || candidate.providerModelId !== DEEPSEEK_V4_FLASH_FALLBACK.providerModelId) {
      return NextResponse.json({ error: 'Only the pinned DeepSeek fallback may be registered as a fallback candidate.' }, { status: 400 });
    }
    const [freeResult, recordsResult] = await Promise.all([
      admin.from('model_benchmark_candidates').select('*').eq('profile_id', profile.id).eq('candidate_kind', 'free').eq('is_active', true),
      admin.from('model_evaluation_records').select('*').eq('owner_id', profile.owner_id),
    ]);
    const freeCandidates = (freeResult.data || []).map((row) => ({ id: row.candidate_id, label: row.provider_model_id, kind: 'free', providerModelId: row.provider_model_id })) as ModelCandidate[];
    const records = (recordsResult.data || []).map((row) => recordFromRow(row as Record<string, unknown>));
    const eligible = freeCandidatesCompleted(records, freeCandidates)
      && freeCandidates.every((free) => !summarizeModelEvaluation(records, free.id).clearsThreshold);
    if (!eligible) return NextResponse.json({ error: 'The pinned fallback is unavailable until every free candidate finishes and misses the threshold.' }, { status: 409 });
  } else if (kind === 'free') {
    await admin.from('model_benchmark_candidates').update({ is_active: false }).eq('profile_id', profile.id).eq('candidate_kind', 'free');
  }

  const rows = parsed.data.candidates.map((candidate) => ({
    profile_id: profile.id,
    candidate_id: candidate.candidateId,
    provider_model_id: candidate.providerModelId,
    candidate_kind: candidate.candidateKind,
    catalog_metadata: { ...candidate.catalogMetadata, label: candidate.label },
    is_active: true,
    updated_at: new Date().toISOString(),
  }));
  const { data, error } = await admin.from('model_benchmark_candidates').upsert(rows, { onConflict: 'profile_id,candidate_id' }).select('*');
  if (error) return NextResponse.json({ error: 'Benchmark candidates could not be persisted.' }, { status: 500 });
  return NextResponse.json({ candidates: data }, { status: 201 });
}
