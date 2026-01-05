import { describe, it, expect } from 'vitest';
import { getEmbeddingLength } from '@/lib/embedding-utils';

describe('getEmbeddingLength', () => {
  it('should return array length when embedding is an array', () => {
    expect(getEmbeddingLength([1, 2, 3, 4, 5])).toBe(5);
    expect(getEmbeddingLength([])).toBe(0);
    expect(getEmbeddingLength(new Array(1536).fill(0))).toBe(1536);
  });

  it('should return "string" when embedding is a string', () => {
    expect(getEmbeddingLength('some-embedding-data')).toBe('string');
    expect(getEmbeddingLength('')).toBe('string');
  });

  it('should return 0 for null or undefined', () => {
    expect(getEmbeddingLength(null)).toBe(0);
    expect(getEmbeddingLength(undefined)).toBe(0);
  });

  it('should return 0 for other types', () => {
    expect(getEmbeddingLength(123 as any)).toBe(0);
    expect(getEmbeddingLength({} as any)).toBe(0);
    expect(getEmbeddingLength(true as any)).toBe(0);
  });
});