/**
 * The worker has no live model default until these fixed, sanitized tasks have
 * been measured. This module deliberately contains no provider client or
 * credential handling: recording an evaluation is separate from activating a
 * provider or allowing a worker to take an external action.
 */

export const MODEL_EVALUATION_DAILY_CAP_USD = 0.25;
export const MODEL_EVALUATION_PER_RUN_CAP_USD = 0.1;

export const MODEL_EVALUATION_TASK_IDS = [
  'classify-public-evidence',
  'draft-approved-message',
  'summarize-weekly-brief',
] as const;

export const MODEL_EVALUATION_TASKS = [
  {
    id: MODEL_EVALUATION_TASK_IDS[0],
    purpose: 'Classify sanitized public-business evidence and cite the supplied evidence only.',
  },
  {
    id: MODEL_EVALUATION_TASK_IDS[1],
    purpose: 'Draft a concise outreach message that preserves the supplied approval boundary.',
  },
  {
    id: MODEL_EVALUATION_TASK_IDS[2],
    purpose: 'Turn sanitized activity notes into a client-ready weekly brief without inventing outcomes.',
  },
] as const;

export type ModelEvaluationTaskId = (typeof MODEL_EVALUATION_TASK_IDS)[number];

export type ModelCandidate = {
  id: string;
  label: string;
  kind: 'free' | 'deepseek-fallback';
  providerModelId: string | null;
  catalogRequirement?: string;
};

// The two additional free candidates are intentionally catalog-resolved at the
// time of the test. Free-model availability changes, so a stale hard-coded
// provider ID must not silently become a worker default.
export const FREE_MODEL_CANDIDATES: readonly ModelCandidate[] = [
  {
    id: 'poolside-laguna-s-2.1-free',
    label: 'Poolside Laguna S 2.1 Free',
    kind: 'free',
    providerModelId: null,
    catalogRequirement: 'Resolve and pin the current eligible free catalog identifier before evaluation.',
  },
  {
    id: 'eligible-current-free-1',
    label: 'Eligible current free model #1',
    kind: 'free',
    providerModelId: null,
    catalogRequirement: 'Record the current catalog identifier, capabilities, and zero-cost terms before evaluation.',
  },
  {
    id: 'eligible-current-free-2',
    label: 'Eligible current free model #2',
    kind: 'free',
    providerModelId: null,
    catalogRequirement: 'Record the current catalog identifier, capabilities, and zero-cost terms before evaluation.',
  },
];

export const DEEPSEEK_V4_FLASH_FALLBACK: ModelCandidate = {
  id: 'deepseek-v4-flash',
  label: 'DeepSeek V4 Flash (pinned fallback)',
  kind: 'deepseek-fallback',
  providerModelId: 'deepseek/deepseek-v4-flash',
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
  rationale: 'No live model is selected until all free candidates complete the fixed evaluation set.',
};

const taskIds = new Set<string>(MODEL_EVALUATION_TASKS.map((task) => task.id));

export function isModelEvaluationRecord(value: ModelEvaluationRecord) {
  return taskIds.has(value.taskId)
    && typeof value.providerModelId === 'string' && value.providerModelId.trim().length > 0
    && Number.isFinite(value.qualityScore) && value.qualityScore >= 0 && value.qualityScore <= 1
    && Number.isFinite(value.toolUseScore) && value.toolUseScore >= 0 && value.toolUseScore <= 1
    && Number.isFinite(value.latencyMs) && value.latencyMs >= 0
    && Number.isFinite(value.costUsd) && value.costUsd >= 0 && value.costUsd <= MODEL_EVALUATION_PER_RUN_CAP_USD
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
  const modelIds = new Set(
    latestTaskRecords(records, candidateId).map((record) => record.providerModelId.trim()),
  );
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

export function evaluationSpendForDay(records: ModelEvaluationRecord[], date: string) {
  return records
    .filter((record) => record.evaluatedOn === date && isModelEvaluationRecord(record))
    .reduce((total, record) => total + record.costUsd, 0);
}

export function canRecordModelEvaluation(records: ModelEvaluationRecord[], record: ModelEvaluationRecord) {
  return isModelEvaluationRecord(record)
    && evaluationSpendForDay(records, record.evaluatedOn) + record.costUsd <= MODEL_EVALUATION_DAILY_CAP_USD;
}

export function selectModelRoutingPolicy(records: ModelEvaluationRecord[]): ModelRoutingPolicy {
  const freeSummaries = FREE_MODEL_CANDIDATES.map((candidate) => summarizeModelEvaluation(records, candidate.id));
  const allFreeCandidatesCompleted = freeSummaries.every(
    (summary) => summary.completedTasks === MODEL_EVALUATION_TASKS.length,
  );
  const selectedFree = allFreeCandidatesCompleted && freeSummaries.find((summary) => summary.clearsThreshold);
  if (selectedFree) {
    const providerModelId = pinnedProviderModelId(records, selectedFree.candidateId);
    if (!providerModelId) return MODEL_ROUTING_POLICY;
    return {
      status: 'selected-free',
      defaultModel: providerModelId,
      rationale: `${selectedFree.candidateId} cleared the fixed free-candidate threshold with a pinned provider model ID.`,
    };
  }

  // DeepSeek is not eligible until every free candidate has completed every
  // task and failed the shared threshold. This makes it a true fallback.
  const deepseekSummary = summarizeModelEvaluation(records, DEEPSEEK_V4_FLASH_FALLBACK.id);
  const deepseekModelId = pinnedProviderModelId(records, DEEPSEEK_V4_FLASH_FALLBACK.id);
  if (allFreeCandidatesCompleted && deepseekSummary.clearsThreshold && deepseekModelId === DEEPSEEK_V4_FLASH_FALLBACK.providerModelId) {
    return {
      status: 'selected-deepseek-fallback',
      defaultModel: DEEPSEEK_V4_FLASH_FALLBACK.providerModelId,
      rationale: 'All evaluated free candidates missed the threshold; pinned DeepSeek V4 Flash cleared it.',
    };
  }

  return MODEL_ROUTING_POLICY;
}
