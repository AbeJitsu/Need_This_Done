import { describe, expect, it } from 'vitest';
import { GET } from '@/app/api/offerings/[slug]/checkout/route';

describe('offering checkout handoff', () => {
  it('keeps the pilot on the project-request fallback', async () => {
    const response = await GET(new Request('https://needthisdone.com/api/offerings/ai-growth-employee-pilot/checkout') as never, {
      params: Promise.resolve({ slug: 'ai-growth-employee-pilot' }),
    });

    expect(response.status).toBe(303);
    expect(response.headers.get('location')).toBe('https://needthisdone.com/contact?offering=ai-growth-employee-pilot');
  });

  it('keeps the managed stage on the project-request fallback', async () => {
    const response = await GET(new Request('https://needthisdone.com/api/offerings/managed-ai-growth-employee/checkout') as never, {
      params: Promise.resolve({ slug: 'managed-ai-growth-employee' }),
    });

    expect(response.status).toBe(303);
    expect(response.headers.get('location')).toBe('https://needthisdone.com/contact?offering=managed-ai-growth-employee');
  });

  it('returns not found for a retired package', async () => {
    const response = await GET(new Request('https://needthisdone.com/api/offerings/starter-site/checkout') as never, {
      params: Promise.resolve({ slug: 'starter-site' }),
    });

    expect(response.status).toBe(404);
  });
});
