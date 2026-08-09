import { NextResponse } from 'next/server';
import { z } from 'zod';
import { verifyAdmin } from '@/lib/api-auth';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import {
  canRecordModelEvaluation,
  DEEPSEEK_V4_FLASH_FALLBACK,
  FREE_MODEL_CANDIDATES,
  MODEL_EVALUATION_TASK_IDS,
  type ModelEvaluationRecord,
  type ModelEvaluationTaskId,
  selectModelRoutingPolicy,
} from '@/lib/model-evaluation';

const candidateIds = new Set([
  ...FREE_MODEL_CANDIDATES.map((candidate) => candidate.id),
  DEEPSEEK_V4_FLASH_FALLBACK.id,
]);

const evaluationSchema = z.object({
  candidateId: z.string().trim().min(1).max(160).refine((value) => candidateIds.has(value), 'Unknown evaluation candidate.'),
  providerModelId: z.string().trim().min(1).max(240),
  taskId: z.enum(MODEL_EVALUATION_TASK_IDS),
  qualityScore: z.number().min(0).max(1),
  toolUseScore: z.number().min(0).max(1),
  latencyMs: z.number().int().nonnegative().max(120_000),
  costUsd: z.number().min(0).max(0.1),
  failed: z.boolean(),
  repairRequired: z.boolean(),
  evaluatedOn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  notes: z.string().trim().max(4_000).optional().default(''),
});

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

export async function GET() {
  const auth = await verifyAdmin();
  if (auth.error) return auth.error;
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from('model_evaluation_records')
    .select('*')
    .eq('owner_id', auth.user.id)
    .order('evaluated_on', { ascending: false });
  if (error) return NextResponse.json({ error: 'Model evaluations are not available yet.' }, { status: 503 });
  const records = (data || []).map((row) => recordFromRow(row as Record<string, unknown>));
  return NextResponse.json({ records: data || [], policy: selectModelRoutingPolicy(records) });
}

export async function POST(request: Request) {
  const auth = await verifyAdmin();
  if (auth.error) return auth.error;
  const parsed = evaluationSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message || 'Invalid model evaluation.' }, { status: 400 });

  const supabase = await createSupabaseServerClient();
  const { data: existing, error: existingError } = await supabase
    .from('model_evaluation_records')
    .select('*')
    .eq('owner_id', auth.user.id)
    .eq('evaluated_on', parsed.data.evaluatedOn);
  if (existingError) return NextResponse.json({ error: 'Model evaluations are not available yet.' }, { status: 503 });

  const record: ModelEvaluationRecord = parsed.data;
  if (record.candidateId === DEEPSEEK_V4_FLASH_FALLBACK.id && record.providerModelId !== DEEPSEEK_V4_FLASH_FALLBACK.providerModelId) {
    return NextResponse.json({ error: 'DeepSeek evaluation records must use the pinned DeepSeek V4 Flash model ID.' }, { status: 400 });
  }
  const existingRecords = (existing || []).map((row) => recordFromRow(row as Record<string, unknown>));
  if (!canRecordModelEvaluation(existingRecords, record)) {
    return NextResponse.json({ error: 'The $0.25 daily model-evaluation budget would be exceeded.' }, { status: 409 });
  }

  const { data, error } = await supabase.from('model_evaluation_records').insert({
    owner_id: auth.user.id,
    candidate_id: record.candidateId,
    provider_model_id: parsed.data.providerModelId,
    task_id: record.taskId,
    quality_score: record.qualityScore,
    tool_use_score: record.toolUseScore,
    latency_ms: record.latencyMs,
    cost_usd: record.costUsd,
    failed: record.failed,
    repair_required: record.repairRequired,
    evaluated_on: record.evaluatedOn,
    notes: parsed.data.notes,
  }).select('*').single();
  if (error) return NextResponse.json({ error: 'Model evaluation could not be recorded.' }, { status: 500 });

  return NextResponse.json({ record: data }, { status: 201 });
}
