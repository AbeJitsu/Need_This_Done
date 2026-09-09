import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));

import {
  getVectorMemoryStatus,
  searchVectorMemory,
  upsertVectorMemory,
  VectorMemoryError,
} from '@/lib/vector-memory';

const VECTOR_ENV_KEYS = [
  'UPSTASH_VECTOR_REST_URL',
  'UPSTASH_VECTOR_REST_TOKEN',
  'VECTOR_MEMORY_NAMESPACE',
] as const;

const originalEnvironment = Object.fromEntries(
  VECTOR_ENV_KEYS.map((key) => [key, process.env[key]]),
);

describe('private Upstash Vector memory adapter', () => {
  beforeEach(() => {
    VECTOR_ENV_KEYS.forEach((key) => delete process.env[key]);
  });

  afterEach(() => {
    VECTOR_ENV_KEYS.forEach((key) => {
      const value = originalEnvironment[key];
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    });
  });

  it('reports the vector projection as optional and unconfigured by default', () => {
    expect(getVectorMemoryStatus()).toEqual({
      enabled: false,
      state: 'not_configured',
      namespace: 'needthisdone',
    });
  });

  it('reports incomplete configuration without attempting a request', async () => {
    process.env.UPSTASH_VECTOR_REST_URL = 'https://example-vector.upstash.io';
    const fetchImpl = vi.fn();

    expect(getVectorMemoryStatus()).toEqual({
      enabled: false,
      state: 'incomplete',
      namespace: 'needthisdone',
    });
    await expect(searchVectorMemory('architecture', { fetchImpl })).resolves.toEqual({
      status: 'disabled',
      reason: 'incomplete',
      matches: [],
    });
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it('upserts provenance-bearing raw text through the namespaced REST endpoint', async () => {
    process.env.UPSTASH_VECTOR_REST_URL = 'https://example-vector.upstash.io/';
    process.env.UPSTASH_VECTOR_REST_TOKEN = 'vector-secret';
    process.env.VECTOR_MEMORY_NAMESPACE = 'assistant-memory';
    const fetchImpl = vi.fn(async () => new Response(JSON.stringify({ result: 'Success' }), { status: 200 }));

    await expect(upsertVectorMemory([{
      id: 'architecture-1',
      data: 'Supabase remains the durable workflow source of truth.',
      metadata: { source_type: 'architecture_decision', source_id: 'README.md' },
    }], { fetchImpl })).resolves.toEqual({ status: 'upserted', count: 1 });

    expect(fetchImpl).toHaveBeenCalledTimes(1);
    const [url, init] = fetchImpl.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('https://example-vector.upstash.io/upsert-data/assistant-memory');
    expect(init.method).toBe('POST');
    expect(init.headers).toEqual({
      Authorization: 'Bearer vector-secret',
      'Content-Type': 'application/json',
    });
    expect(JSON.parse(String(init.body))).toEqual([expect.objectContaining({ id: 'architecture-1' })]);
  });

  it('searches raw text and returns only useful match fields', async () => {
    process.env.UPSTASH_VECTOR_REST_URL = 'https://example-vector.upstash.io';
    process.env.UPSTASH_VECTOR_REST_TOKEN = 'vector-secret';
    const fetchImpl = vi.fn(async () => new Response(JSON.stringify({
      result: [
        { id: 'memory-1', score: 0.91, data: 'Relevant decision', metadata: { source_id: 'README.md' }, vector: [0.1] },
        { id: 'malformed', score: 'not-a-number' },
      ],
    }), { status: 200 }));

    await expect(searchVectorMemory('What is the durable source of truth?', {
      topK: 3,
      filter: 'source_type = "architecture_decision"',
      fetchImpl,
    })).resolves.toEqual({
      status: 'searched',
      matches: [{
        id: 'memory-1',
        score: 0.91,
        data: 'Relevant decision',
        metadata: { source_id: 'README.md' },
      }],
    });

    const [, init] = fetchImpl.mock.calls[0] as [string, RequestInit];
    expect(JSON.parse(String(init.body))).toEqual({
      data: 'What is the durable source of truth?',
      topK: 3,
      includeMetadata: true,
      includeData: true,
      filter: 'source_type = "architecture_decision"',
    });
  });

  it('redacts provider response bodies from errors', async () => {
    process.env.UPSTASH_VECTOR_REST_URL = 'https://example-vector.upstash.io';
    process.env.UPSTASH_VECTOR_REST_TOKEN = 'vector-secret';
    const fetchImpl = vi.fn(async () => new Response(JSON.stringify({ error: 'token vector-secret leaked' }), { status: 401 }));

    const error = await upsertVectorMemory([{ id: 'memory-1', data: 'safe text' }], { fetchImpl }).catch((value) => value);
    expect(error).toBeInstanceOf(VectorMemoryError);
    expect(String(error)).toBe('VectorMemoryError: Upstash Vector request failed with HTTP 401.');
    expect(String(error)).not.toContain('vector-secret');
  });

  it('rejects oversized writes before making a provider request', async () => {
    process.env.UPSTASH_VECTOR_REST_URL = 'https://example-vector.upstash.io';
    process.env.UPSTASH_VECTOR_REST_TOKEN = 'vector-secret';
    const fetchImpl = vi.fn();

    await expect(upsertVectorMemory([{ id: 'memory-1', data: 'x'.repeat(12_001) }], { fetchImpl }))
      .rejects.toThrow('Vector memory data must be 1–12000 characters.');
    expect(fetchImpl).not.toHaveBeenCalled();
  });
});
