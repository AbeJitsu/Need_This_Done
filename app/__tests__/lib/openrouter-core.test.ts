import { describe, expect, it } from 'vitest';
import { estimateOpenRouterRequestCost, resolveBenchmarkCandidates, type OpenRouterModel } from '@/lib/openrouter-core';

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
});
