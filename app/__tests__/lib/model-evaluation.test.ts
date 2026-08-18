import { describe, expect, it } from 'vitest';
import {
  isModelEvaluationRecord,
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
  return MODEL_EVALUATION_TASK_IDS.map((taskId) => ({
    candidateId,
    providerModelId: candidateId,
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

  it('stays evaluation-required when every catalog candidate misses', () => {
    const failed = freeCandidates.flatMap((candidate) => recordsFor(candidate.id, { qualityScore: 0.4, toolUseScore: 0.4, failed: true, repairRequired: true }));
    expect(selectModelRoutingPolicy(failed, freeCandidates)).toEqual(MODEL_ROUTING_POLICY);
  });

  it('keeps router probe candidates out of model selection', () => {
    const probe: ModelCandidate = { id: 'openrouter-free-router', label: 'Probe', kind: 'router-free', providerModelId: 'openrouter/free' };
    expect(selectModelRoutingPolicy(recordsFor(probe.id, { providerModelId: 'openrouter/free' }), [probe])).toEqual(MODEL_ROUTING_POLICY);
  });

  it('accepts finite provider-reported costs without a local dollar ceiling', () => {
    const record = recordsFor(freeCandidates[0].id, { costUsd: 5_000 })[0];
    expect(isModelEvaluationRecord(record)).toBe(true);
    expect(isModelEvaluationRecord({ ...record, costUsd: -1 })).toBe(false);
  });
});
