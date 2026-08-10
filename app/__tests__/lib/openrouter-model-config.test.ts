import { describe, expect, it } from 'vitest';
import { parseOpenRouterModelConfig, validateOpenRouterModelId } from '@/lib/openrouter-model-config';

describe('OpenRouter model environment configuration', () => {
  it('normalizes the two private model variables without exposing their values', () => {
    expect(parseOpenRouterModelConfig({
      OPENROUTER_PRIMARY_MODEL: '  deepseek/provider-model-0731  ',
      OPENROUTER_TEST_MODEL: 'nvidia/provider-model:free',
    })).toEqual({
      primaryModel: 'deepseek/provider-model-0731',
      testModel: 'nvidia/provider-model:free',
    });
  });

  it('rejects missing values and moving aliases', () => {
    expect(() => parseOpenRouterModelConfig({ OPENROUTER_TEST_MODEL: 'nvidia/provider-model:free' })).toThrow('OPENROUTER_PRIMARY_MODEL');
    expect(() => validateOpenRouterModelId('provider/model-latest', 'OPENROUTER_PRIMARY_MODEL')).toThrow('pinned model ID');
    expect(() => validateOpenRouterModelId('latest', 'OPENROUTER_TEST_MODEL')).toThrow('pinned model ID');
  });

  it('rejects malformed IDs and does not echo the supplied value', () => {
    const secretLikeValue = 'provider/not-a-valid value';
    let message = '';
    try {
      validateOpenRouterModelId(secretLikeValue, 'OPENROUTER_PRIMARY_MODEL');
    } catch (error) {
      message = error instanceof Error ? error.message : '';
    }
    expect(message).toContain('OPENROUTER_PRIMARY_MODEL');
    expect(message).not.toContain(secretLikeValue);
  });
});
