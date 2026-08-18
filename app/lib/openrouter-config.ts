import 'server-only';

import { parseOpenRouterModelConfig, type OpenRouterModelConfig } from '@/lib/openrouter-model-config';

/** Read model routing configuration only in a server or private worker boundary. */
export function getOpenRouterModelConfig(): OpenRouterModelConfig {
  return parseOpenRouterModelConfig({
    OPENROUTER_PRIMARY_MODEL: process.env.OPENROUTER_PRIMARY_MODEL,
    OPENROUTER_TEST_MODEL: process.env.OPENROUTER_TEST_MODEL,
    OPENROUTER_BACKUP_MODEL: process.env.OPENROUTER_BACKUP_MODEL,
  });
}

export const loadOpenRouterModelConfig = getOpenRouterModelConfig;
