import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));

import { GET } from '@/app/api/portfolio/page-check/route';

const html = `<!doctype html><html lang="en"><head>
  <title>Selected Work | NeedThisDone</title>
  <meta name="description" content="See selected work and live features.">
</head><body><main><h1>Selected work</h1><h2>Live features</h2>
  <a href="/">Home</a><a href="/contact">Contact</a>
</main></body></html>`;

function request(page: string) {
  return new Request(`https://needthisdone.com/api/portfolio/page-check?page=${page}`);
}

describe('public portfolio page check', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(html, {
      status: 200,
      headers: { 'Content-Type': 'text/html' },
    })));
  });

  afterEach(() => vi.unstubAllGlobals());

  it('checks a fixed public page and returns only bounded, readable metrics', async () => {
    const response = await GET(request('work'));
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(fetch).toHaveBeenCalledWith('https://needthisdone.com/work', expect.objectContaining({
      redirect: 'error', cache: 'no-store',
    }));
    expect(data).toMatchObject({
      page: { id: 'work', path: '/work' },
      title: 'Selected Work | NeedThisDone',
      mainHeading: 'Selected work',
      links: 2,
      checks: [
        { label: 'Page title', passed: true },
        { label: 'Main heading', passed: true },
        { label: 'Search description', passed: true },
        { label: 'Heading order', passed: true },
      ],
    });
    expect(JSON.stringify(data)).not.toContain('<!doctype');
  });

  it('rejects a visitor-supplied URL before making a network request', async () => {
    const response = await GET(request('https://127.0.0.1/admin'));
    expect(response.status).toBe(400);
    expect(fetch).not.toHaveBeenCalled();
  });

  it('does not parse unexpected or oversized responses', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce(new Response('{}', {
      headers: { 'Content-Type': 'application/json' },
    })).mockResolvedValueOnce(new Response(html, {
      headers: { 'Content-Type': 'text/html', 'Content-Length': '512001' },
    })));
    expect((await GET(request('home'))).status).toBe(503);
    expect((await GET(request('work'))).status).toBe(503);
  });
});
