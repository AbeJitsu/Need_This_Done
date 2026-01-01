import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('Medusa Products Pagination', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
    process.env.NEXT_PUBLIC_MEDUSA_URL = 'https://medusa.test';
  });

  describe('products.list()', () => {
    it('fetches all products without pagination by default', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          products: [{ id: '1' }, { id: '2' }, { id: '3' }],
        }),
      });

      // Dynamic import after env is set
      const { products } = await import('@/lib/medusa-client');
      const result = await products.list();

      expect(mockFetch).toHaveBeenCalledTimes(1);
      const calledUrl = mockFetch.mock.calls[0][0];
      expect(calledUrl).toContain('/store/products');
      expect(calledUrl).not.toContain('?');
      expect(result).toHaveLength(3);
    });

    it('supports pagination with limit and offset', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          products: [{ id: '1' }, { id: '2' }],
          count: 10,
        }),
      });

      const { products } = await import('@/lib/medusa-client');
      const result = await products.list({ limit: 2, offset: 0 });

      expect(mockFetch).toHaveBeenCalledTimes(1);
      const calledUrl = mockFetch.mock.calls[0][0];
      expect(calledUrl).toContain('limit=2');
      expect(calledUrl).toContain('offset=0');
      expect((result as { products: unknown[]; count: number }).products).toHaveLength(2);
      expect((result as { products: unknown[]; count: number }).count).toBe(10);
    });

    it('supports only limit parameter', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          products: [{ id: '1' }],
          count: 5,
        }),
      });

      const { products } = await import('@/lib/medusa-client');
      await products.list({ limit: 1 });

      expect(mockFetch).toHaveBeenCalledTimes(1);
      const calledUrl = mockFetch.mock.calls[0][0];
      expect(calledUrl).toContain('limit=1');
      expect(calledUrl).not.toContain('offset=');
    });

    it('supports only offset parameter', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          products: [{ id: '3' }],
          count: 3,
        }),
      });

      const { products } = await import('@/lib/medusa-client');
      await products.list({ offset: 2 });

      expect(mockFetch).toHaveBeenCalledTimes(1);
      const calledUrl = mockFetch.mock.calls[0][0];
      expect(calledUrl).toContain('offset=2');
      expect(calledUrl).not.toContain('limit=');
    });

    it('returns count with paginated results', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          products: [{ id: '1' }],
          count: 100,
        }),
      });

      const { products } = await import('@/lib/medusa-client');
      const result = await products.list({ limit: 1 });

      expect((result as { count: number }).count).toBe(100);
    });
  });
});
