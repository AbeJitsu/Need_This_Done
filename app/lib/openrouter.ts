import 'server-only';

import { OpenRouterClient } from '@/lib/openrouter-core';

export * from '@/lib/openrouter-core';
export { getOpenRouterModelConfig, loadOpenRouterModelConfig } from '@/lib/openrouter-config';

/** Server-only construction keeps OPENROUTER_API_KEY out of browser bundles. */
export function createServerOpenRouterClient() {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error('OPENROUTER_API_KEY is not configured on this private server.');
  return new OpenRouterClient(apiKey);
}
