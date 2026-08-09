import { NextResponse } from 'next/server';
import { verifyAdmin } from '@/lib/api-auth';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { DEEPSEEK_V4_FLASH_FALLBACK, selectModelRoutingPolicy, type ModelCandidate, type ModelEvaluationRecord, type ModelEvaluationTaskId } from '@/lib/model-evaluation';

function recordFromRow(row: Record<string, unknown>): ModelEvaluationRecord {
  return {
    candidateId: String(row.candidate_id),
    providerModelId: String(row.provider_model_id),
    taskId: row.task_id as ModelEvaluationTaskId,
    qualityScore: Number(row.quality_score),
    toolUseScore: Number(row.tool_use_score),
    latencyMs: Number(row.latency_ms),
    costUsd: Number(row.cost_usd),
    failed: Boolean(row.failed),
    repairRequired: Boolean(row.repair_required),
    evaluatedOn: String(row.evaluated_on),
  };
}

/** Read-only operator evidence. Only the signed Mac-mini can write benchmarks. */
export async function GET() {
  const auth = await verifyAdmin();
  if (auth.error) return auth.error;
  const supabase = await createSupabaseServerClient();
  const { data: profile, error: profileError } = await supabase
    .from('growth_profiles')
    .select('id')
    .eq('owner_id', auth.user.id)
    .maybeSingle();
  if (profileError || !profile) return NextResponse.json({ records: [], candidates: [], policy: { status: 'evaluation-required', defaultModel: null, rationale: 'Configure a growth profile before benchmarking.' } });
  const [recordsResult, candidatesResult] = await Promise.all([
    supabase.from('model_evaluation_records').select('*').eq('owner_id', auth.user.id).order('evaluated_on', { ascending: false }),
    supabase.from('model_benchmark_candidates').select('*').eq('profile_id', profile.id).eq('is_active', true).order('discovered_at'),
  ]);
  if (recordsResult.error || candidatesResult.error) return NextResponse.json({ error: 'Model evaluation evidence is not available yet.' }, { status: 503 });
  const candidates = (candidatesResult.data || []).map((row) => ({
    id: row.candidate_id,
    label: row.provider_model_id,
    kind: row.candidate_kind,
    providerModelId: row.provider_model_id,
    catalogMetadata: row.catalog_metadata || {},
  })) as ModelCandidate[];
  const freeCandidates = candidates.filter((candidate) => candidate.kind === 'free');
  const fallback = candidates.find((candidate) => candidate.kind === 'deepseek-fallback') || DEEPSEEK_V4_FLASH_FALLBACK;
  const records = (recordsResult.data || []).map((row) => recordFromRow(row as Record<string, unknown>));
  return NextResponse.json({ records: recordsResult.data || [], candidates: candidatesResult.data || [], policy: selectModelRoutingPolicy(records, freeCandidates, fallback) });
}

export async function POST() {
  return NextResponse.json({ error: 'Benchmarks are accepted only through the signed Mac-mini worker.' }, { status: 405, headers: { Allow: 'GET' } });
}
