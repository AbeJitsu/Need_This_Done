import { describe, expect, it } from 'vitest';
import { GET } from '@/app/api/offerings/[slug]/checkout/route';

describe('offering checkout handoff', () => {
  it('keeps Website Fix on the project-request fallback', async () => {
    const response = await GET(new Request('https://needthisdone.com/api/offerings/website-improvement/checkout') as never, {
      params: Promise.resolve({ slug: 'website-improvement' }),
    });

    expect(response.status).toBe(303);
    expect(response.headers.get('location')).toBe('https://needthisdone.com/contact?offer=website-fix');
  });

  it('keeps Managed Automation on the project-request fallback', async () => {
    const response = await GET(new Request('https://needthisdone.com/api/offerings/ai-operator/checkout') as never, {
      params: Promise.resolve({ slug: 'ai-operator' }),
    });

    expect(response.status).toBe(303);
    expect(response.headers.get('location')).toBe('https://needthisdone.com/contact?offer=managed-automation');
  });

  it('returns not found for a retired package', async () => {
    const response = await GET(new Request('https://needthisdone.com/api/offerings/starter-site/checkout') as never, {
      params: Promise.resolve({ slug: 'starter-site' }),
    });

    expect(response.status).toBe(404);
  });
});
