import { describe, expect, it } from 'vitest';
import { OpenRouterClient } from '@/lib/openrouter-core';
import { runConfiguredModelComparison, SignedBenchmarkTransport } from '@/lib/prospecting-benchmark';

describe('configured model comparison', () => {
  it('runs the same sanitized tasks against primary and test models without a route update', async () => {
    const primaryModel = 'provider/primary-2026';
    const testModel = 'provider/test-2026';
    const completionModels: string[] = [];
    const completionPrompts: string[] = [];
    const resultPayloads: Array<Record<string, unknown>> = [];

    const openRouter = new OpenRouterClient('test-key', async (input, init) => {
      const url = String(input);
      if (url.endsWith('/models')) {
        return new Response(JSON.stringify({ data: [
          { id: primaryModel, name: 'Primary', context_length: 32_000, pricing: { prompt: 0, completion: 0, request: 0, web_search: 0 }, supported_parameters: ['response_format'] },
          { id: testModel, name: 'Test', context_length: 32_000, pricing: { prompt: 0, completion: 0, request: 0, web_search: 0 }, supported_parameters: ['tools'] },
        ] }), { status: 200 });
      }
      if (url.endsWith('/chat/completions')) {
        const body = JSON.parse(String(init?.body)) as { model: string; messages: Array<{ role: string; content: string }>; response_format?: unknown };
        completionModels.push(body.model);
        completionPrompts.push(body.messages[1].content);
        if (body.model === primaryModel) expect(body.response_format).toBeDefined();
        if (body.model === testModel) expect(body.response_format).toBeUndefined();
        return new Response(JSON.stringify({ choices: [{ message: { content: '{"answer":"ok"}' } }], usage: { prompt_tokens: 10, completion_tokens: 3, cost: 0 } }), { status: 200 });
      }
      throw new Error(`Unexpected provider request: ${url}`);
    });

    const transport = new SignedBenchmarkTransport('http://127.0.0.1:3000', 'test-secret', async (input, init) => {
      const url = String(input);
      if (url.endsWith('/benchmark/config')) {
        return new Response(JSON.stringify({
          profile: { id: 'profile-1', timezone: 'UTC', modelRoute: 'evaluation-required', selectedModelId: null },
          candidates: [],
          policy: { status: 'evaluation-required', defaultModel: null, rationale: 'Evaluation required.' },
        }), { status: 200 });
      }
      if (url.endsWith('/benchmark/candidates')) return new Response(JSON.stringify({ candidates: [] }), { status: 201 });
      if (url.endsWith('/benchmark/reserve')) return new Response(JSON.stringify({ reservation: { reservation_key: '00000000-0000-4000-8000-000000000001', reserved_cost: 0 } }), { status: 200 });
      if (url.endsWith('/benchmark/result')) {
        resultPayloads.push(JSON.parse(String(init?.body)) as Record<string, unknown>);
        return new Response(JSON.stringify({ comparisonOnly: true }), { status: 200 });
      }
      throw new Error(`Unexpected benchmark request: ${url}`);
    });

    const result = await runConfiguredModelComparison({
      workerId: 'worker-1',
      profileId: 'profile-1',
      transport,
      openRouter,
      modelConfig: { primaryModel, testModel },
    });

    expect(result).toEqual({ comparedModels: 2, comparedTasks: 6 });
    expect(completionModels).toEqual([primaryModel, primaryModel, primaryModel, testModel, testModel, testModel]);
    expect(completionPrompts.slice(0, 3)).toEqual(completionPrompts.slice(3));
    expect(resultPayloads).toHaveLength(6);
    expect(resultPayloads.every((payload) => payload.comparisonOnly === true)).toBe(true);
    expect(resultPayloads.some((payload) => payload.providerModelId === primaryModel)).toBe(true);
    expect(resultPayloads.some((payload) => payload.providerModelId === testModel)).toBe(true);
  });
});
