/**
 * Model selection stays fail-closed. The Mac-mini resolves free candidates
 * from the live OpenRouter catalog and persists those exact IDs before any
 * benchmark runs; this module only evaluates durable measurements.
 */

export const MODEL_EVALUATION_TASK_IDS = [
  'classify-public-evidence',
  'draft-approved-message',
  'summarize-weekly-brief',
] as const;

export const MODEL_EVALUATION_TASKS = [
  {
    id: MODEL_EVALUATION_TASK_IDS[0],
    purpose: 'Classify supplied public-business evidence and cite supplied evidence only.',
  },
  {
    id: MODEL_EVALUATION_TASK_IDS[1],
    purpose: 'Draft a concise message that keeps the human approval boundary intact.',
  },
  {
    id: MODEL_EVALUATION_TASK_IDS[2],
    purpose: 'Turn sanitized activity notes into a client-ready brief without inventing outcomes.',
  },
] as const;

export type ModelEvaluationTaskId = (typeof MODEL_EVALUATION_TASK_IDS)[number];

export type ModelCandidate = {
  id: string;
  label: string;
  kind: 'free' | 'deepseek-fallback' | 'configured-primary' | 'configured-test';
  providerModelId: string;
  catalogMetadata?: Record<string, unknown>;
};

/** This is intentionally a pinned free fallback, not a moving "latest" alias. */
export const DEEPSEEK_V4_FLASH_FALLBACK: ModelCandidate = {
  id: 'deepseek-v4-flash-free',
  label: 'DeepSeek V4 Flash (free fallback)',
  kind: 'deepseek-fallback',
  providerModelId: 'deepseek/deepseek-v4-flash:free',
};

export const MODEL_QUALITY_THRESHOLD = 0.8;
export const MODEL_TOOL_USE_THRESHOLD = 0.9;
export const MODEL_FAILURE_RATE_MAX = 0.1;
export const MODEL_REPAIR_RATE_MAX = 0.2;

export type ModelEvaluationRecord = {
  candidateId: string;
  providerModelId: string;
  taskId: ModelEvaluationTaskId;
  qualityScore: number;
  toolUseScore: number;
  latencyMs: number;
  costUsd: number;
  failed: boolean;
  repairRequired: boolean;
  evaluatedOn: string;
};

export type ModelEvaluationSummary = {
  candidateId: string;
  completedTasks: number;
  qualityScore: number;
  toolUseScore: number;
  latencyMs: number;
  costUsd: number;
  failureRate: number;
  repairRate: number;
  clearsThreshold: boolean;
};

export type ModelRoutingPolicy = {
  status: 'evaluation-required' | 'selected-free' | 'selected-deepseek-fallback';
  defaultModel: string | null;
  rationale: string;
};

export const MODEL_ROUTING_POLICY: ModelRoutingPolicy = {
  status: 'evaluation-required',
  defaultModel: null,
  rationale: 'No live model is selected until the catalog-resolved free candidates complete the fixed evaluation set.',
};

const taskIds = new Set<string>(MODEL_EVALUATION_TASKS.map((task) => task.id));

export function isModelEvaluationRecord(value: ModelEvaluationRecord) {
  return taskIds.has(value.taskId)
    && typeof value.providerModelId === 'string' && value.providerModelId.trim().length > 0
    && Number.isFinite(value.qualityScore) && value.qualityScore >= 0 && value.qualityScore <= 1
    && Number.isFinite(value.toolUseScore) && value.toolUseScore >= 0 && value.toolUseScore <= 1
    && Number.isFinite(value.latencyMs) && value.latencyMs >= 0
    && Number.isFinite(value.costUsd) && value.costUsd >= 0
    && /^\d{4}-\d{2}-\d{2}$/.test(value.evaluatedOn);
}

function latestTaskRecords(records: ModelEvaluationRecord[], candidateId: string) {
  const latest = new Map<ModelEvaluationTaskId, ModelEvaluationRecord>();
  for (const record of records) {
    if (record.candidateId !== candidateId || !isModelEvaluationRecord(record)) continue;
    const current = latest.get(record.taskId);
    if (!current || record.evaluatedOn >= current.evaluatedOn) latest.set(record.taskId, record);
  }
  return [...latest.values()];
}

function pinnedProviderModelId(records: ModelEvaluationRecord[], candidateId: string) {
  const modelIds = new Set(latestTaskRecords(records, candidateId).map((record) => record.providerModelId.trim()));
  return modelIds.size === 1 ? [...modelIds][0] : null;
}

function rounded(value: number, places = 4) {
  const factor = 10 ** places;
  return Math.round((value + Number.EPSILON) * factor) / factor;
}

export function summarizeModelEvaluation(records: ModelEvaluationRecord[], candidateId: string): ModelEvaluationSummary {
  const sample = latestTaskRecords(records, candidateId);
  const count = sample.length;
  const average = (value: (record: ModelEvaluationRecord) => number) => count
    ? sample.reduce((total, record) => total + value(record), 0) / count
    : 0;
  const qualityScore = rounded(average((record) => record.qualityScore));
  const toolUseScore = rounded(average((record) => record.toolUseScore));
  const failureRate = rounded(average((record) => Number(record.failed)));
  const repairRate = rounded(average((record) => Number(record.repairRequired)));
  const costUsd = rounded(sample.reduce((total, record) => total + record.costUsd, 0));
  const completedTasks = sample.length;
  return {
    candidateId,
    completedTasks,
    qualityScore,
    toolUseScore,
    latencyMs: Math.round(average((record) => record.latencyMs)),
    costUsd,
    failureRate,
    repairRate,
    clearsThreshold: completedTasks === MODEL_EVALUATION_TASKS.length
      && qualityScore >= MODEL_QUALITY_THRESHOLD
      && toolUseScore >= MODEL_TOOL_USE_THRESHOLD
      && failureRate <= MODEL_FAILURE_RATE_MAX
      && repairRate <= MODEL_REPAIR_RATE_MAX,
  };
}

export function freeCandidatesCompleted(records: ModelEvaluationRecord[], freeCandidates: readonly ModelCandidate[]) {
  return freeCandidates.length > 0 && freeCandidates.every(
    (candidate) => summarizeModelEvaluation(records, candidate.id).completedTasks === MODEL_EVALUATION_TASKS.length,
  );
}

/**
 * Select only from catalog-persisted free candidates. DeepSeek becomes eligible
 * only after every selected free candidate has completed and missed the shared
 * threshold.
 */
export function selectModelRoutingPolicy(
  records: ModelEvaluationRecord[],
  freeCandidates: readonly ModelCandidate[],
  fallback: ModelCandidate = DEEPSEEK_V4_FLASH_FALLBACK,
): ModelRoutingPolicy {
  const allFreeCandidatesCompleted = freeCandidatesCompleted(records, freeCandidates);
  const selectedFree = allFreeCandidatesCompleted
    ? freeCandidates
      .map((candidate) => ({ candidate, summary: summarizeModelEvaluation(records, candidate.id) }))
      .find(({ summary }) => summary.clearsThreshold)
    : undefined;
  if (selectedFree) {
    const providerModelId = pinnedProviderModelId(records, selectedFree.candidate.id);
    if (providerModelId === selectedFree.candidate.providerModelId) {
      return {
        status: 'selected-free',
        defaultModel: providerModelId,
        rationale: `${selectedFree.candidate.label} cleared the fixed threshold with its catalog-persisted model ID.`,
      };
    }
  }

  const everyFreeCandidateMissed = allFreeCandidatesCompleted
    && freeCandidates.every((candidate) => !summarizeModelEvaluation(records, candidate.id).clearsThreshold);
  const fallbackSummary = summarizeModelEvaluation(records, fallback.id);
  const fallbackModelId = pinnedProviderModelId(records, fallback.id);
  if (everyFreeCandidateMissed && fallbackSummary.clearsThreshold && fallbackModelId === fallback.providerModelId) {
    return {
      status: 'selected-deepseek-fallback',
      defaultModel: fallback.providerModelId,
      rationale: 'Every catalog-resolved free candidate missed the threshold; the pinned DeepSeek fallback cleared it.',
    };
  }

  return MODEL_ROUTING_POLICY;
}
