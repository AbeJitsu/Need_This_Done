import { describe, expect, it } from 'vitest';
import {
  canRecordModelEvaluation,
  DEEPSEEK_V4_FLASH_FALLBACK,
  MODEL_EVALUATION_TASK_IDS,
  MODEL_ROUTING_POLICY,
  selectModelRoutingPolicy,
  summarizeModelEvaluation,
  type ModelCandidate,
  type ModelEvaluationRecord,
} from '@/lib/model-evaluation';

const freeCandidates: ModelCandidate[] = [
  { id: 'catalog/free-a', label: 'Free A', kind: 'free', providerModelId: 'catalog/free-a' },
  { id: 'catalog/free-b', label: 'Free B', kind: 'free', providerModelId: 'catalog/free-b' },
  { id: 'catalog/free-c', label: 'Free C', kind: 'free', providerModelId: 'catalog/free-c' },
];

function recordsFor(candidateId: string, values: Partial<ModelEvaluationRecord> = {}): ModelEvaluationRecord[] {
  const providerModelId = candidateId === DEEPSEEK_V4_FLASH_FALLBACK.id
    ? DEEPSEEK_V4_FLASH_FALLBACK.providerModelId
    : candidateId;
  return MODEL_EVALUATION_TASK_IDS.map((taskId) => ({
    candidateId,
    providerModelId,
    taskId,
    qualityScore: 0.95,
    toolUseScore: 0.95,
    latencyMs: 900,
    costUsd: 0.05,
    failed: false,
    repairRequired: false,
    evaluatedOn: '2026-08-08',
    ...values,
  }));
}

describe('model evaluation policy', () => {
  it('summarizes a catalog-persisted candidate from all fixed tasks', () => {
    const summary = summarizeModelEvaluation(recordsFor(freeCandidates[0].id), freeCandidates[0].id);
    expect(summary).toMatchObject({ completedTasks: 3, qualityScore: 0.95, toolUseScore: 0.95, latencyMs: 900, costUsd: 0.15, clearsThreshold: true });
  });

  it('does not pin a model until every resolved free candidate completes', () => {
    expect(selectModelRoutingPolicy(recordsFor(freeCandidates[0].id), freeCandidates)).toEqual(MODEL_ROUTING_POLICY);
    const records = [
      ...recordsFor(freeCandidates[0].id),
      ...recordsFor(freeCandidates[1].id, { qualityScore: 0.4, toolUseScore: 0.4, repairRequired: true }),
      ...recordsFor(freeCandidates[2].id, { qualityScore: 0.4, toolUseScore: 0.4, failed: true }),
    ];
    expect(selectModelRoutingPolicy(records, freeCandidates)).toMatchObject({ status: 'selected-free', defaultModel: freeCandidates[0].providerModelId });
  });

  it('permits the pinned DeepSeek fallback only after all free candidates miss', () => {
    const failedFree = freeCandidates.flatMap((candidate) => recordsFor(candidate.id, { qualityScore: 0.4, toolUseScore: 0.4, failed: true, repairRequired: true }));
    expect(selectModelRoutingPolicy([...failedFree, ...recordsFor(DEEPSEEK_V4_FLASH_FALLBACK.id)], freeCandidates)).toMatchObject({ status: 'selected-deepseek-fallback', defaultModel: DEEPSEEK_V4_FLASH_FALLBACK.providerModelId });
  });

  it('fails closed when model-evaluation observations would exceed the daily ceiling', () => {
    const existing = recordsFor(freeCandidates[0].id, { costUsd: 0.1 }).slice(0, 2);
    expect(canRecordModelEvaluation(existing, { ...existing[0], taskId: 'summarize-weekly-brief', costUsd: 0.05 })).toBe(true);
    expect(canRecordModelEvaluation(existing, { ...existing[0], taskId: 'summarize-weekly-brief', costUsd: 0.1 })).toBe(false);
  });
});
