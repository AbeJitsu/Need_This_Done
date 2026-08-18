import { describe, expect, it } from 'vitest';
import { estimateOpenRouterRequestCost, OpenRouterClient, resolveBenchmarkCandidates, type OpenRouterModel } from '@/lib/openrouter-core';

function model(id: string, options: Partial<OpenRouterModel> = {}): OpenRouterModel {
  return {
    id,
    name: id,
    contextLength: 32_000,
    pricing: { prompt: 0, completion: 0, request: 0, webSearch: 0.004 },
    supportedParameters: ['tools', 'response_format'],
    availability: 'available',
    raw: {},
    ...options,
  };
}

describe('OpenRouter catalog resolution', () => {
  it('accepts provider-specific catalog extensions while preserving benchmark metadata', async () => {
    const client = new OpenRouterClient('test-key', async () => new Response(JSON.stringify({ data: [
      {
        id: 'provider/model-with-extension',
        name: 'Model with provider extension',
        context_length: 32_000,
        pricing: { prompt: '0', completion: '0', overrides: { request: '0' } },
        supported_parameters: ['tools'],
      },
    ] }), { status: 200 }));

    await expect(client.listModels()).resolves.toMatchObject([
      { id: 'provider/model-with-extension', pricing: { prompt: 0, completion: 0, request: null }, supportedParameters: ['tools'] },
    ]);
  });

  it('filters for available free models with tools and structured output, without a moving alias', () => {
    const candidates = resolveBenchmarkCandidates([
      model('catalog/free-good'),
      model('catalog/latest', { name: 'Moving alias' }),
      model('catalog/no-schema', { supportedParameters: ['tools'] }),
      model('catalog/paid', { pricing: { prompt: 0.000001, completion: 0, request: 0, webSearch: 0.004 } }),
      model('catalog/unavailable', { availability: 'unavailable' }),
    ]);
    expect(candidates).toHaveLength(1);
    expect(candidates[0]).toMatchObject({ candidateId: 'catalog/free-good', providerModelId: 'catalog/free-good' });
  });

  it('uses catalog pricing to bound a web-search request and fails closed when price metadata is absent', () => {
    expect(estimateOpenRouterRequestCost(model('catalog/free-good'), { maxPromptTokens: 6_000, maxCompletionTokens: 1_500, maxWebSearchCalls: 1 })).toBe(0.004);
    expect(estimateOpenRouterRequestCost(model('catalog/unknown', { pricing: { prompt: null, completion: null, request: null, webSearch: null } }), { maxPromptTokens: 6_000, maxCompletionTokens: 1_500, maxWebSearchCalls: 1 })).toBeNull();
  });

  it('requires capable providers for structured/tool requests and captures a dynamic router model', async () => {
    const requests: Array<Record<string, unknown>> = [];
    const client = new OpenRouterClient('test-key', async (_input, init) => {
      const body = JSON.parse(String(init?.body)) as Record<string, unknown>;
      requests.push(body);
      return new Response(JSON.stringify({
        model: 'google/gemma-4-26b-a4b-it:free',
        choices: [{ message: { content: body.response_format ? '{"answer":"ok"}' : 'ok' } }],
        usage: { prompt_tokens: 2, completion_tokens: 1, cost: 0 },
      }), { status: 200 });
    });

    await expect(client.chatCompletion({
      model: 'openrouter/free',
      messages: [{ role: 'user', content: 'Say hello.' }],
      maxTokens: 20,
    })).resolves.toMatchObject({ model: 'google/gemma-4-26b-a4b-it:free', content: 'ok' });
    await expect(client.chatCompletion({
      model: 'openrouter/free',
      messages: [{ role: 'user', content: 'Return JSON.' }],
      maxTokens: 20,
      responseSchema: { type: 'object', properties: { answer: { type: 'string' } }, required: ['answer'], additionalProperties: false },
      tools: [{ type: 'function', function: { name: 'noop', parameters: { type: 'object', properties: {} } } }],
      toolChoice: 'none',
    })).resolves.toMatchObject({ model: 'google/gemma-4-26b-a4b-it:free', content: '{"answer":"ok"}' });

    expect(requests[0]).toMatchObject({ model: 'openrouter/free', stream: false });
    expect(requests[0].provider).toBeUndefined();
    expect(requests[1]).toMatchObject({
      provider: { require_parameters: true },
      tool_choice: 'none',
    });
    expect(requests[1].tools).toHaveLength(1);
  });

  it('fails closed when a dynamic router omits the actual model ID', async () => {
    const client = new OpenRouterClient('test-key', async () => new Response(JSON.stringify({
      choices: [{ message: { content: 'ok' } }],
      usage: { cost: 0 },
    }), { status: 200 }));
    await expect(client.chatCompletion({
      model: 'openrouter/free',
      messages: [{ role: 'user', content: 'Say hello.' }],
      maxTokens: 20,
    })).rejects.toThrow('actual model ID');
  });
});
