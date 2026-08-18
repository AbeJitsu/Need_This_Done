import { z } from 'zod';

export const OPENROUTER_API_BASE_URL = 'https://openrouter.ai/api/v1';

type FetchLike = typeof fetch;

export type OpenRouterPricing = {
  prompt: number | null;
  completion: number | null;
  request: number | null;
  webSearch: number | null;
};

export type OpenRouterModel = {
  id: string;
  name: string;
  contextLength: number;
  pricing: OpenRouterPricing;
  supportedParameters: string[];
  availability: 'available' | 'unavailable';
  raw: Record<string, unknown>;
};

export type OpenRouterCitation = {
  url: string;
  title: string;
  excerpt: string;
};

export type OpenRouterUsage = {
  promptTokens: number | null;
  completionTokens: number | null;
  costUsd: number | null;
  raw: Record<string, unknown>;
};

export type OpenRouterCompletion = {
  content: string;
  citations: OpenRouterCitation[];
  usage: OpenRouterUsage;
  raw: Record<string, unknown>;
};

export type OpenRouterMessage = { role: 'system' | 'user'; content: string };

export type OpenRouterCompletionRequest = {
  model: string;
  messages: OpenRouterMessage[];
  maxTokens: number;
  responseSchema?: Record<string, unknown>;
  webSearch?: { maxResults: number };
};

const modelResponseSchema = z.object({
  data: z.array(z.object({
    id: z.string().trim().min(1),
    name: z.string().nullable().optional(),
    context_length: z.number().nullable().optional(),
    // OpenRouter adds provider-specific pricing extensions such as `overrides`.
    // Parse the fields this app uses below and preserve the rest in `raw`.
    pricing: z.record(z.string(), z.unknown()).nullable().optional(),
    supported_parameters: z.array(z.string()).nullable().optional(),
  }).passthrough()),
});

function finiteNumber(value: unknown) {
  const parsed = typeof value === 'number' ? value : typeof value === 'string' ? Number(value) : NaN;
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}

function pricingValue(value: Record<string, unknown> | undefined, key: string) {
  return finiteNumber(value?.[key]);
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

function isModelUnavailable(raw: Record<string, unknown>) {
  const status = String(raw.status || raw.availability || '').toLowerCase();
  return raw.deprecated === true
    || raw.is_available === false
    || ['unavailable', 'disabled', 'deprecated', 'offline'].includes(status);
}

function safeResponseText(value: string) {
  return value.replace(/[\r\n]+/g, ' ').slice(0, 600);
}

function citationUrl(value: unknown) {
  if (typeof value !== 'string') return null;
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:' || ['localhost', '127.0.0.1', '::1'].includes(url.hostname)) return null;
    url.hash = '';
    return url.toString();
  } catch {
    return null;
  }
}

function firstString(...values: unknown[]) {
  for (const value of values) if (typeof value === 'string' && value.trim()) return value.trim();
  return '';
}

function citationFromUnknown(value: unknown): OpenRouterCitation | null {
  const item = asRecord(value);
  const nested = asRecord(item.url_citation || item.citation || item.source);
  const url = citationUrl(firstString(item.url, nested.url, item.source_url, nested.source_url));
  if (!url) return null;
  return {
    url,
    title: firstString(item.title, nested.title, item.name, nested.name, url),
    excerpt: firstString(item.content, nested.content, item.excerpt, nested.excerpt, item.text, nested.text, 'OpenRouter web-search source.'),
  };
}

/** Extract URL citations from the documented annotations shape and its current compatible variants. */
export function extractOpenRouterCitations(value: Record<string, unknown>): OpenRouterCitation[] {
  const choices = Array.isArray(value.choices) ? value.choices : [];
  const firstChoice = asRecord(choices[0]);
  const message = asRecord(firstChoice.message);
  const candidates = [
    ...(Array.isArray(value.citations) ? value.citations : []),
    ...(Array.isArray(value.annotations) ? value.annotations : []),
    ...(Array.isArray(message.citations) ? message.citations : []),
    ...(Array.isArray(message.annotations) ? message.annotations : []),
  ];
  const unique = new Map<string, OpenRouterCitation>();
  for (const candidate of candidates) {
    const citation = citationFromUnknown(candidate);
    if (citation && !unique.has(citation.url)) unique.set(citation.url, citation);
  }
  return [...unique.values()];
}

export function supportsStructuredOutput(model: OpenRouterModel) {
  const supported = new Set(model.supportedParameters.map((value) => value.toLowerCase()));
  return supported.has('response_format')
    || supported.has('structured_outputs')
    || supported.has('structured_output')
    || supported.has('json_schema');
}

export function supportsToolUse(model: OpenRouterModel) {
  const supported = new Set(model.supportedParameters.map((value) => value.toLowerCase()));
  return supported.has('tools') || supported.has('tool_choice');
}

export function isEligibleFreeBenchmarkModel(model: OpenRouterModel) {
  const paidRates = [model.pricing.prompt, model.pricing.completion, model.pricing.request]
    .filter((value): value is number => value !== null);
  return model.availability === 'available'
    && !/(^|[/:_-])latest($|[/:_-])/i.test(model.id)
    && model.contextLength >= 8_000
    && supportsStructuredOutput(model)
    && supportsToolUse(model)
    && paidRates.length >= 2
    && paidRates.every((value) => value === 0);
}

export type ResolvedBenchmarkCandidate = {
  candidateId: string;
  providerModelId: string;
  label: string;
  catalogMetadata: Record<string, unknown>;
};

/**
 * Resolve current free candidates from the catalog rather than relying on a
 * provider's moving alias. The caller persists the returned exact IDs before
 * it runs any measurements.
 */
export function resolveBenchmarkCandidates(models: OpenRouterModel[], maximum = 3): ResolvedBenchmarkCandidate[] {
  return models
    .filter(isEligibleFreeBenchmarkModel)
    .sort((left, right) => {
      const leftSearch = left.pricing.webSearch ?? Number.POSITIVE_INFINITY;
      const rightSearch = right.pricing.webSearch ?? Number.POSITIVE_INFINITY;
      if (leftSearch !== rightSearch) return leftSearch - rightSearch;
      if (left.contextLength !== right.contextLength) return right.contextLength - left.contextLength;
      return left.id.localeCompare(right.id);
    })
    .slice(0, maximum)
    .map((model) => ({
      candidateId: model.id,
      providerModelId: model.id,
      label: model.name,
      catalogMetadata: {
        contextLength: model.contextLength,
        pricing: model.pricing,
        supportedParameters: model.supportedParameters,
        availability: model.availability,
      },
    }));
}

/** Upper bound using catalog per-token / per-request prices and bounded web search. */
export function estimateOpenRouterRequestCost(model: OpenRouterModel, options: {
  maxPromptTokens: number;
  maxCompletionTokens: number;
  maxWebSearchCalls: number;
}) {
  const { prompt, completion, request, webSearch } = model.pricing;
  if (prompt === null || completion === null || request === null || (options.maxWebSearchCalls > 0 && webSearch === null)) return null;
  const estimate = prompt * options.maxPromptTokens
    + completion * options.maxCompletionTokens
    + request
    + (webSearch || 0) * options.maxWebSearchCalls;
  return Number.isFinite(estimate) && estimate >= 0 ? estimate : null;
}

export class OpenRouterClient {
  constructor(
    private readonly apiKey: string,
    private readonly fetchImpl: FetchLike = fetch,
    private readonly baseUrl = OPENROUTER_API_BASE_URL,
  ) {
    if (!apiKey.trim()) throw new Error('OPENROUTER_API_KEY is required for OpenRouter requests.');
  }

  private async request(path: string, init: RequestInit) {
    const response = await this.fetchImpl(`${this.baseUrl}${path}`, {
      ...init,
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        Accept: 'application/json',
        ...(init.headers || {}),
      },
    });
    const text = await response.text();
    let json: unknown;
    try { json = text ? JSON.parse(text) : {}; } catch { throw new Error(`OpenRouter returned invalid JSON (${response.status}).`); }
    if (!response.ok) {
      const error = asRecord(asRecord(json).error);
      throw new Error(`OpenRouter request failed (${response.status}): ${safeResponseText(firstString(error.message, asRecord(json).message, text))}`);
    }
    return asRecord(json);
  }

  async listModels(): Promise<OpenRouterModel[]> {
    const json = await this.request('/models', { method: 'GET' });
    const parsed = modelResponseSchema.safeParse(json);
    if (!parsed.success) throw new Error('OpenRouter Models API response did not include a valid catalog.');
    return parsed.data.data.map((item) => {
      const raw = item as Record<string, unknown>;
      const pricing = asRecord(item.pricing);
      return {
        id: item.id,
        name: item.name?.trim() || item.id,
        contextLength: Math.max(0, Number(item.context_length || 0)),
        pricing: {
          prompt: pricingValue(pricing, 'prompt'),
          completion: pricingValue(pricing, 'completion'),
          request: pricingValue(pricing, 'request'),
          webSearch: pricingValue(pricing, 'web_search'),
        },
        supportedParameters: item.supported_parameters || [],
        availability: isModelUnavailable(raw) ? 'unavailable' : 'available',
        raw,
      };
    });
  }

  async chatCompletion(request: OpenRouterCompletionRequest): Promise<OpenRouterCompletion> {
    const payload: Record<string, unknown> = {
      model: request.model,
      messages: request.messages,
      max_tokens: request.maxTokens,
    };
    if (request.responseSchema) {
      payload.response_format = {
        type: 'json_schema',
        json_schema: { name: 'prospecting_response', strict: true, schema: request.responseSchema },
      };
    }
    if (request.webSearch) {
      // OpenRouter exposes its openrouter:web_search server tool through the
      // Chat Completions web_search tool type. Bound results limit both scope
      // and variable tool cost.
      payload.tools = [{ type: 'web_search', max_results: request.webSearch.maxResults }];
    }
    const json = await this.request('/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const choices = Array.isArray(json.choices) ? json.choices : [];
    const message = asRecord(asRecord(choices[0]).message);
    const content = typeof message.content === 'string' ? message.content.trim() : '';
    if (!content) throw new Error('OpenRouter completion did not contain a text response.');
    const usage = asRecord(json.usage);
    return {
      content,
      citations: extractOpenRouterCitations(json),
      usage: {
        promptTokens: finiteNumber(usage.prompt_tokens),
        completionTokens: finiteNumber(usage.completion_tokens),
        costUsd: finiteNumber(usage.cost) ?? finiteNumber(usage.total_cost) ?? finiteNumber(json.cost),
        raw: usage,
      },
      raw: json,
    };
  }
}
