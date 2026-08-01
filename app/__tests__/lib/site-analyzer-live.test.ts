import { describe, expect, it } from 'vitest';
import { computeSiteScore, discoverNavPages, extractMetrics, fetchHTML } from '@/lib/site-analyzer';

const describeLiveSite = process.env.RUN_LIVE_SITE_TESTS === 'true' ? describe : describe.skip;

describeLiveSite('Live site analysis (needthisdone.com)', () => {
  it('fetches and analyzes the public site', async () => {
    const { html, status } = await fetchHTML('https://needthisdone.com');
    expect(status).toBe(200);
    expect(html.length).toBeGreaterThan(1000);

    const metrics = extractMetrics(html, 'https://needthisdone.com/', status);
    expect(metrics.title).toBeTruthy();
    expect(metrics.https).toBe(true);
    expect(metrics.wordCount).toBeGreaterThan(50);
    expect(metrics.h1Count).toBeGreaterThanOrEqual(1);
    expect(metrics.links.total).toBeGreaterThan(5);

    const pages = discoverNavPages(html, 'https://needthisdone.com');
    expect(pages.length).toBeGreaterThanOrEqual(3);
    expect(pages[0]).toContain('needthisdone.com');

    const score = computeSiteScore([metrics]);
    expect(score.total).toBeGreaterThanOrEqual(30);
    expect(score.total).toBeLessThanOrEqual(100);
    expect(['A', 'B', 'C', 'D', 'F']).toContain(score.grade);
    expect(score.categories.length).toBe(10);
  }, 15000);
});
