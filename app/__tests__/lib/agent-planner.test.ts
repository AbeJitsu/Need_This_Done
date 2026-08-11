import { describe, expect, it } from 'vitest';
import { buildOpenClawInstruction, estimatePlannerRequest, parsePlannerOutput, planWithOpenRouter } from '@/lib/agent-planner';
import type { OpenRouterModel } from '@/lib/openrouter-core';

const step = {
  key: 'research',
  title: 'Research public evidence',
  instruction: 'Find public evidence and cite every claim.',
  taskType: 'research_public_web',
  agentRole: 'public_web_researcher',
  capabilities: ['read_public_web', 'research_public_web'],
  expectedArtifacts: ['research dossier'],
  estimatedCostUsd: 0.02,
};

const raw = JSON.stringify({
  rewrittenInstruction: 'Research and prepare a reviewable result.',
  steps: [step],
  allowedCapabilities: ['research_public_web'],
  forbiddenActions: ['send_external_messages'],
  expectedArtifacts: ['research dossier'],
  estimatedUsage: { promptTokens: 300, completionTokens: 500, webSearchCalls: 0, estimatedCostUsd: 0.01 },
});

function model(): OpenRouterModel {
  return {
    id: 'provider/pinned-model', name: 'Pinned model', contextLength: 32_000,
    pricing: { prompt: 0.000001, completion: 0.000002, request: 0, webSearch: 0 },
    supportedParameters: ['response_format'], availability: 'available', raw: {},
  };
}

describe('app-side agent planner', () => {
  it('normalizes mandatory forbidden actions and creates a delivery-disabled OpenClaw instruction', () => {
    const plan = parsePlannerOutput(raw, 'research_outreach');
    expect(plan.forbiddenActions).toEqual(expect.arrayContaining([
      'send_external_messages', 'publish_content', 'spend_money',
      'change_connected_accounts', 'deliver_external_content',
    ]));
    expect(plan.openclawInstruction).toMatchObject({ executor: 'openclaw', approvalRequired: true, delivery: { deliver: false, bestEffortDeliver: false } });
  });

  it('rejects a task whose role does not match its safe task type', () => {
    const invalid = raw.replace('public_web_researcher', 'outreach_writer');
    expect(() => parsePlannerOutput(invalid, 'research_outreach')).toThrow('does not match task type');
  });

  it('fails closed when pinned pricing cannot produce an estimate', () => {
    const plan = parsePlannerOutput(raw, 'research_outreach');
    expect(() => estimatePlannerRequest({ ...model(), pricing: { prompt: null, completion: null, request: null, webSearch: null } }, 'bounded prompt', {
      ...plan,
      estimatedUsage: { ...plan.estimatedUsage, completionTokens: 200 },
    })).toThrow('pricing metadata');
  });

  it('keeps the instruction server-authored when a plan is persisted', () => {
    const instruction = buildOpenClawInstruction({
      workflowType: 'research_outreach', growthProfileId: '00000000-0000-4000-8000-000000000001',
      rewrittenInstruction: 'Do bounded work.', steps: [step], allowedCapabilities: ['research_public_web'],
      forbiddenActions: ['send_external_messages'], expectedArtifacts: ['dossier'],
    });
    expect(instruction).toMatchObject({ growthProfileId: '00000000-0000-4000-8000-000000000001', delivery: { deliver: false, bestEffortDeliver: false } });
  });

  it('runs against a fake completion client without dispatching work', async () => {
    const result = await planWithOpenRouter({
      model: model(),
      prompt: 'bounded fake planning request',
      workflowType: 'research_outreach',
      client: {
        async chatCompletion(request) {
          expect(request.model).toBe('provider/pinned-model');
          expect(request.maxTokens).toBe(4_000);
          expect(request.responseSchema).toBeDefined();
          return {
            content: raw,
            citations: [],
            usage: { promptTokens: 12, completionTokens: 34, costUsd: 0.001, raw: {} },
            raw: {},
          };
        },
      },
    });
    expect(result.plan.openclawInstruction).toMatchObject({ executor: 'openclaw', approvalRequired: true });
    expect(result.usage).toMatchObject({ promptTokens: 12, completionTokens: 34, costUsd: 0.001 });
  });
});
