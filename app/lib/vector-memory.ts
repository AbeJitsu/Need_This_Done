import 'server-only';

// Private semantic memory adapter.
//
// This is deliberately not a chatbot or a public search feature. It stores
// selected, provenance-bearing projections of durable Supabase records in an
// Upstash Vector index so Hermes/ChatGPT can retrieve relevant context later.
// Supabase remains authoritative; losing or disabling this projection must not
// remove workflow state.

const DEFAULT_NAMESPACE = 'needthisdone';
const DEFAULT_TOP_K = 5;
const MAX_TOP_K = 50;
const MAX_QUERY_LENGTH = 4_000;
const MAX_RECORDS_PER_WRITE = 50;
const MAX_RECORD_DATA_LENGTH = 12_000;
const MAX_ID_LENGTH = 256;
const REQUEST_TIMEOUT_MS = 5_000;

type FetchImplementation = typeof fetch;

export type VectorMemoryMetadata = Record<string, string | number | boolean | null>;

export type VectorMemoryRecord = {
  id: string;
  data: string;
  metadata?: VectorMemoryMetadata;
};

export type VectorMemoryMatch = {
  id: string;
  score: number;
  data?: string;
  metadata?: VectorMemoryMetadata;
};

export type VectorMemoryStatus = {
  enabled: boolean;
  state: 'configured' | 'not_configured' | 'incomplete' | 'invalid';
  namespace: string;
};

export type VectorMemoryWriteResult =
  | { status: 'disabled'; reason: Exclude<VectorMemoryStatus['state'], 'configured'>; count: 0 }
  | { status: 'upserted'; count: number };

export type VectorMemorySearchResult =
  | { status: 'disabled'; reason: Exclude<VectorMemoryStatus['state'], 'configured'>; matches: [] }
  | { status: 'searched'; matches: VectorMemoryMatch[] };

export class VectorMemoryError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'VectorMemoryError';
  }
}

type VectorMemoryConfig = VectorMemoryStatus & {
  url: string | null;
  token: string | null;
};

function configuredNamespace() {
  return process.env.VECTOR_MEMORY_NAMESPACE?.trim() || DEFAULT_NAMESPACE;
}

function readConfig(): VectorMemoryConfig {
  const url = process.env.UPSTASH_VECTOR_REST_URL?.trim() || null;
  const token = process.env.UPSTASH_VECTOR_REST_TOKEN?.trim() || null;
  const namespace = configuredNamespace();
  const namespaceIsValid = /^[A-Za-z0-9][A-Za-z0-9._:-]{0,63}$/.test(namespace);

  let urlIsValid = false;
  if (url) {
    try {
      urlIsValid = new URL(url).protocol === 'https:';
    } catch {
      urlIsValid = false;
    }
  }

  const state = !url && !token
    ? 'not_configured'
    : !url || !token
    ? 'incomplete'
    : !urlIsValid || !namespaceIsValid
    ? 'invalid'
    : 'configured';

  return {
    enabled: state === 'configured',
    state,
    namespace,
    url,
    token,
  };
}

export function getVectorMemoryStatus(): VectorMemoryStatus {
  const { enabled, state, namespace } = readConfig();
  return { enabled, state, namespace };
}

function endpoint(config: VectorMemoryConfig, operation: 'upsert-data' | 'query-data') {
  if (!config.url) throw new VectorMemoryError('Upstash Vector is not configured.');
  const url = new URL(config.url);
  const basePath = url.pathname.replace(/\/+$/, '');
  url.pathname = `${basePath}/${operation}/${encodeURIComponent(config.namespace)}`;
  url.search = '';
  return url.toString();
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function validateRecord(record: VectorMemoryRecord) {
  if (!record.id.trim() || record.id.length > MAX_ID_LENGTH) {
    throw new VectorMemoryError(`Vector memory IDs must be 1–${MAX_ID_LENGTH} characters.`);
  }
  if (!record.data.trim() || record.data.length > MAX_RECORD_DATA_LENGTH) {
    throw new VectorMemoryError(`Vector memory data must be 1–${MAX_RECORD_DATA_LENGTH} characters.`);
  }
}

function validateQuery(query: string) {
  const trimmed = query.trim();
  if (!trimmed || trimmed.length > MAX_QUERY_LENGTH) {
    throw new VectorMemoryError(`Vector memory queries must be 1–${MAX_QUERY_LENGTH} characters.`);
  }
  return trimmed;
}

function validateTopK(topK: number | undefined) {
  const value = topK ?? DEFAULT_TOP_K;
  if (!Number.isInteger(value) || value < 1 || value > MAX_TOP_K) {
    throw new VectorMemoryError(`Vector memory topK must be an integer from 1 to ${MAX_TOP_K}.`);
  }
  return value;
}

async function post<TResult>(
  config: VectorMemoryConfig,
  operation: 'upsert-data' | 'query-data',
  body: unknown,
  fetchImpl: FetchImplementation,
): Promise<TResult> {
  if (!config.enabled || !config.token) {
    throw new VectorMemoryError('Upstash Vector is not configured.');
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const response = await fetchImpl(endpoint(config, operation), {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${config.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    const payload: unknown = await response.json().catch(() => null);
    if (!response.ok) {
      // Do not echo Upstash response bodies because they may contain request
      // details or provider-specific information.
      throw new VectorMemoryError(`Upstash Vector request failed with HTTP ${response.status}.`);
    }
    if (!isRecord(payload) || !('result' in payload)) {
      throw new VectorMemoryError('Upstash Vector returned an invalid response.');
    }
    return payload.result as TResult;
  } catch (error) {
    if (error instanceof VectorMemoryError) throw error;
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new VectorMemoryError('Upstash Vector request timed out.');
    }
    throw new VectorMemoryError('Upstash Vector request could not be completed.');
  } finally {
    clearTimeout(timeout);
  }
}

export async function upsertVectorMemory(
  records: VectorMemoryRecord[],
  options: { fetchImpl?: FetchImplementation } = {},
): Promise<VectorMemoryWriteResult> {
  const config = readConfig();
  if (config.state !== 'configured') {
    return { status: 'disabled', reason: config.state, count: 0 };
  }
  if (records.length === 0) return { status: 'upserted', count: 0 };
  if (records.length > MAX_RECORDS_PER_WRITE) {
    throw new VectorMemoryError(`Vector memory writes are limited to ${MAX_RECORDS_PER_WRITE} records.`);
  }
  records.forEach(validateRecord);

  await post(config, 'upsert-data', records, options.fetchImpl || fetch);
  return { status: 'upserted', count: records.length };
}

export async function searchVectorMemory(
  query: string,
  options: { topK?: number; filter?: string; fetchImpl?: FetchImplementation } = {},
): Promise<VectorMemorySearchResult> {
  const config = readConfig();
  if (config.state !== 'configured') {
    return { status: 'disabled', reason: config.state, matches: [] };
  }

  const body: Record<string, unknown> = {
    data: validateQuery(query),
    topK: validateTopK(options.topK),
    includeMetadata: true,
    includeData: true,
  };
  if (options.filter?.trim()) body.filter = options.filter.trim().slice(0, 1_000);

  const result = await post<unknown>(config, 'query-data', body, options.fetchImpl || fetch);
  if (!Array.isArray(result)) {
    throw new VectorMemoryError('Upstash Vector returned an invalid search result.');
  }

  const matches = result.flatMap((item): VectorMemoryMatch[] => {
    if (!isRecord(item) || typeof item.id !== 'string' || typeof item.score !== 'number') return [];
    return [{
      id: item.id,
      score: item.score,
      ...(typeof item.data === 'string' ? { data: item.data } : {}),
      ...(isRecord(item.metadata) ? { metadata: item.metadata as VectorMemoryMetadata } : {}),
    }];
  });
  return { status: 'searched', matches };
}
