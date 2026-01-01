import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// ============================================================================
// Page Views API Unit Tests
// ============================================================================
// Tests the page view tracking API with mocked database

// Mock Supabase
const mockSupabase = {
  auth: {
    getUser: vi.fn().mockResolvedValue({ data: { user: null } }),
  },
  from: vi.fn(() => ({
    insert: vi.fn().mockResolvedValue({ error: null }),
    select: vi.fn(() => ({
      eq: vi.fn(() => ({
        single: vi.fn().mockResolvedValue({
          data: {
            page_slug: 'test-page',
            total_views: 10,
            unique_sessions: 5,
            authenticated_views: 2,
            last_viewed_at: '2024-01-01T00:00:00Z',
            first_viewed_at: '2024-01-01T00:00:00Z',
          },
          error: null,
        }),
      })),
      order: vi.fn().mockResolvedValue({
        data: [
          { page_slug: 'page-1', total_views: 100 },
          { page_slug: 'page-2', total_views: 50 },
        ],
        error: null,
      }),
    })),
  })),
};

vi.mock('@/lib/supabase-server', () => ({
  createSupabaseServerClient: vi.fn().mockResolvedValue(mockSupabase),
}));

vi.mock('@/lib/auth', () => ({
  isAdmin: vi.fn().mockResolvedValue(true),
}));

describe('Page Views API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('POST /api/page-views', () => {
    it('should return 400 if page_slug is missing', async () => {
      // Reset modules to get fresh import
      vi.resetModules();
      const { POST } = await import('@/app/api/page-views/route');

      const request = new NextRequest('http://localhost:3000/api/page-views', {
        method: 'POST',
        body: JSON.stringify({}),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('page_slug');
    });

    it('should track a page view successfully', async () => {
      vi.resetModules();
      const { POST } = await import('@/app/api/page-views/route');

      const request = new NextRequest('http://localhost:3000/api/page-views', {
        method: 'POST',
        body: JSON.stringify({ page_slug: 'test-page', referrer: 'https://google.com' }),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.page_slug).toBe('test-page');
    });

    it('should include session_id if provided', async () => {
      vi.resetModules();
      const { POST } = await import('@/app/api/page-views/route');

      const request = new NextRequest('http://localhost:3000/api/page-views', {
        method: 'POST',
        body: JSON.stringify({ page_slug: 'test-page', session_id: 'sess_123' }),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);
      expect(response.status).toBe(201);
    });
  });

  describe('GET /api/page-views', () => {
    it('should return 400 if page_slug query param is missing', async () => {
      vi.resetModules();
      const { GET } = await import('@/app/api/page-views/route');

      const request = new NextRequest('http://localhost:3000/api/page-views');

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('page_slug');
    });

    it('should return page view stats for a given slug', async () => {
      vi.resetModules();
      const { GET } = await import('@/app/api/page-views/route');

      const request = new NextRequest(
        'http://localhost:3000/api/page-views?page_slug=test-page'
      );

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.page_slug).toBe('test-page');
      expect(data.total_views).toBe(10);
      expect(data.unique_sessions).toBe(5);
    });
  });

  describe('GET /api/page-views/all', () => {
    it('should return 401 for non-admin users', async () => {
      vi.resetModules();
      const { isAdmin } = await import('@/lib/auth');
      vi.mocked(isAdmin).mockResolvedValueOnce(false);

      const { GET } = await import('@/app/api/page-views/all/route');

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });

    it('should return all page stats for admin users', async () => {
      vi.resetModules();
      const { GET } = await import('@/app/api/page-views/all/route');

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(Array.isArray(data.pages)).toBe(true);
      expect(data.summary).toBeDefined();
      expect(data.summary.total_pages).toBe(2);
    });
  });
});
