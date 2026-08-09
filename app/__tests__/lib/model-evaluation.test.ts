import { describe, expect, it } from 'vitest';
import {
  canRecordModelEvaluation,
  DEEPSEEK_V4_FLASH_FALLBACK,
  FREE_MODEL_CANDIDATES,
  MODEL_EVALUATION_TASK_IDS,
  MODEL_ROUTING_POLICY,
  selectModelRoutingPolicy,
  summarizeModelEvaluation,
  type ModelEvaluationRecord,
} from '@/lib/model-evaluation';

function recordsFor(candidateId: string, values: Partial<ModelEvaluationRecord> = {}): ModelEvaluationRecord[] {
  return MODEL_EVALUATION_TASK_IDS.map((taskId) => ({
    candidateId,
    providerModelId: candidateId === DEEPSEEK_V4_FLASH_FALLBACK.id
      ? 'deepseek/deepseek-v4-flash'
      : `catalog/${candidateId}`,
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
  it('records all required measurement fields and summarizes a passing candidate', () => {
    const summary = summarizeModelEvaluation(recordsFor(FREE_MODEL_CANDIDATES[0].id), FREE_MODEL_CANDIDATES[0].id);
    expect(summary).toMatchObject({
      completedTasks: 3,
      qualityScore: 0.95,
      toolUseScore: 0.95,
      latencyMs: 900,
      costUsd: 0.15,
      failureRate: 0,
      repairRate: 0,
      clearsThreshold: true,
    });
  });

  it('does not select a worker default until every free candidate completes the fixed task set', () => {
    expect(selectModelRoutingPolicy(recordsFor(FREE_MODEL_CANDIDATES[0].id))).toEqual(MODEL_ROUTING_POLICY);

    const records = [
      ...recordsFor(FREE_MODEL_CANDIDATES[0].id),
      ...recordsFor(FREE_MODEL_CANDIDATES[1].id, { qualityScore: 0.4, toolUseScore: 0.4, repairRequired: true }),
      ...recordsFor(FREE_MODEL_CANDIDATES[2].id, { qualityScore: 0.4, toolUseScore: 0.4, failed: true }),
    ];
    expect(selectModelRoutingPolicy(records)).toMatchObject({
      status: 'selected-free',
      defaultModel: `catalog/${FREE_MODEL_CANDIDATES[0].id}`,
    });
  });

  it('allows pinned DeepSeek V4 Flash only after every free candidate fails', () => {
    const failedFree = FREE_MODEL_CANDIDATES.flatMap((candidate) => recordsFor(candidate.id, {
      qualityScore: 0.4,
      toolUseScore: 0.4,
      failed: true,
      repairRequired: true,
    }));
    expect(selectModelRoutingPolicy([...failedFree, ...recordsFor(DEEPSEEK_V4_FLASH_FALLBACK.id)])).toMatchObject({
      status: 'selected-deepseek-fallback',
      defaultModel: 'deepseek/deepseek-v4-flash',
    });
  });

  it('fails closed when one day would exceed the $0.25 evaluation cap', () => {
    const existing = recordsFor(FREE_MODEL_CANDIDATES[0].id, { costUsd: 0.1 }).slice(0, 2);
    expect(canRecordModelEvaluation(existing, { ...existing[0], taskId: 'summarize-weekly-brief', costUsd: 0.05 })).toBe(true);
    expect(canRecordModelEvaluation(existing, { ...existing[0], taskId: 'summarize-weekly-brief', costUsd: 0.1 })).toBe(false);
  });
});
