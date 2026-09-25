import 'server-only';

import { extractMetrics } from '@/lib/site-analyzer';
import { getPortfolioPage, type PortfolioPageId } from '@/lib/portfolio-pages';

const SITE_ORIGIN = 'https://needthisdone.com';
const MAX_HTML_BYTES = 512_000;

async function readBoundedHtml(response: Response): Promise<string> {
  if (!response.body) throw new Error('The page did not return content.');
  const declaredSize = Number(response.headers.get('content-length'));
  if (declaredSize > MAX_HTML_BYTES) throw new Error('The page is too large to check.');

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let bytes = 0;
  let html = '';
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      bytes += value.byteLength;
      if (bytes > MAX_HTML_BYTES) throw new Error('The page is too large to check.');
      html += decoder.decode(value, { stream: true });
    }
    return html + decoder.decode();
  } finally {
    await reader.cancel().catch(() => undefined);
    reader.releaseLock();
  }
}

export async function inspectPortfolioPage(id: PortfolioPageId) {
  const page = getPortfolioPage(id);
  if (!page) throw new Error('Unknown page.');

  // The visitor selects only from these three fixed paths. No user URL is fetched.
  const url = new URL(page.path, SITE_ORIGIN).href;
  const response = await fetch(url, {
    signal: AbortSignal.timeout(8_000),
    redirect: 'error',
    cache: 'no-store',
    headers: { Accept: 'text/html' },
  });
  if (!response.ok) throw new Error('The page is unavailable right now.');
  if (!response.headers.get('content-type')?.includes('text/html')) {
    throw new Error('The page did not return HTML.');
  }

  const metrics = extractMetrics(await readBoundedHtml(response), url, response.status);
  const mainHeading = metrics.headings.find((heading) => heading.tag === 'h1')?.text;

  return {
    page: { id: page.id, label: page.label, path: page.path },
    checkedAt: new Date().toISOString(),
    title: metrics.title,
    mainHeading: mainHeading || null,
    headings: metrics.headings.slice(0, 7),
    links: metrics.links.total,
    checks: [
      {
        label: 'Page title',
        passed: Boolean(metrics.title),
        detail: metrics.title ? 'A descriptive browser tab title is present.' : 'No page title found.',
      },
      {
        label: 'Main heading',
        passed: metrics.h1Count === 1,
        detail: metrics.h1Count === 1 ? 'One clear H1 introduces the page.' : `${metrics.h1Count} H1 headings found.`,
      },
      {
        label: 'Search description',
        passed: Boolean(metrics.metaDescription),
        detail: metrics.metaDescription ? 'A page description is present.' : 'No page description found.',
      },
      {
        label: 'Heading order',
        passed: metrics.headingHierarchyGaps.length === 0,
        detail: metrics.headingHierarchyGaps.length === 0
          ? 'Heading levels follow a readable order.'
          : `${metrics.headingHierarchyGaps.length} heading-level jump(s) found.`,
      },
    ],
  };
}
