import { describe, expect, it } from 'vitest';
import { OPENROUTER_FREE_ROUTER_MODEL, parseOpenRouterModelConfig, validateOpenRouterModelId } from '@/lib/openrouter-model-config';

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

  it('allows only the reviewed exact backup model', () => {
    expect(parseOpenRouterModelConfig({
      OPENROUTER_PRIMARY_MODEL: 'deepseek/deepseek-v4-flash-0731',
      OPENROUTER_BACKUP_MODEL: `  ${OPENROUTER_FREE_ROUTER_MODEL}  `,
    })).toEqual({
      primaryModel: 'deepseek/deepseek-v4-flash-0731',
      backupModel: OPENROUTER_FREE_ROUTER_MODEL,
    });
    expect(parseOpenRouterModelConfig({
      OPENROUTER_PRIMARY_MODEL: 'deepseek/deepseek-v4-flash-0731',
      OPENROUTER_BACKUP_MODEL: 'google/gemma-4-26b-a4b-it:free',
    }).backupModel).toBe('google/gemma-4-26b-a4b-it:free');
    expect(() => parseOpenRouterModelConfig({
      OPENROUTER_PRIMARY_MODEL: 'deepseek/deepseek-v4-flash-0731',
      OPENROUTER_BACKUP_MODEL: 'google/gemma-4-26b-a4b-it',
    })).toThrow('reviewed Gemma');
  });

  it('rejects missing values and moving aliases', () => {
    expect(() => parseOpenRouterModelConfig({ OPENROUTER_TEST_MODEL: 'nvidia/provider-model:free' })).toThrow('OPENROUTER_PRIMARY_MODEL');
    expect(() => validateOpenRouterModelId('provider/model-latest', 'OPENROUTER_PRIMARY_MODEL')).toThrow('pinned model ID');
    expect(() => validateOpenRouterModelId('latest', 'OPENROUTER_TEST_MODEL')).toThrow('pinned model ID');
    expect(parseOpenRouterModelConfig({
      OPENROUTER_PRIMARY_MODEL: 'provider/primary',
      OPENROUTER_TEST_MODEL: '',
      OPENROUTER_BACKUP_MODEL: ' ',
    })).toEqual({ primaryModel: 'provider/primary' });
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
