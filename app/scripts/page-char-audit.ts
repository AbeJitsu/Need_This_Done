/**
 * Page Character Audit
 *
 * Reports the full (untruncated) character and word count for each
 * page discovered in the site's nav. No AI, no API key needed.
 *
 * Usage:
 *   npx tsx scripts/page-char-audit.ts https://needthisdone.com
 */

import { JSDOM } from 'jsdom';

// ============================================
// INLINE TAGS (same as main reviewer)
// ============================================
const INLINE_TAGS = new Set([
  'span', 'a', 'em', 'strong', 'b', 'i', 'u', 'mark', 'small', 'sub', 'sup',
  'abbr', 'cite', 'code', 'kbd', 'samp', 'var', 'time', 'data', 'label',
]);

// ============================================
// FETCH
// ============================================
async function fetchHTML(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'NeedThisDone-SiteReviewer/1.0 (prototype)',
      Accept: 'text/html,application/xhtml+xml',
    },
    redirect: 'follow',
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.text();
}

// ============================================
// NAV DISCOVERY (same logic as main reviewer)
// ============================================
function discoverNavPages(html: string, baseUrl: string): string[] {
  const dom = new JSDOM(html, { url: baseUrl });
  const doc = dom.window.document;
  const parsedBase = new URL(baseUrl);
  const SKIP_PATHS = new Set(['/cart', '/wishlist', '/checkout', '/login', '/signup', '/register', '/privacy', '/terms', '/cookie-policy']);

  const seen = new Set<string>();
  const pages: string[] = [];

  const homepageUrl = `${parsedBase.origin}/`;
  seen.add(homepageUrl);
  pages.push(homepageUrl);

  doc.querySelectorAll('header, nav, footer').forEach((container: Element) => {
    container.querySelectorAll('a[href]').forEach((a: Element) => {
      const href = a.getAttribute('href') || '';
      if (href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('javascript:')) return;
      try {
        const linkUrl = new URL(href, baseUrl);
        if (linkUrl.hostname !== parsedBase.hostname) return;
        const path = linkUrl.pathname.replace(/\/$/, '') || '/';
        if (SKIP_PATHS.has(path)) return;
        linkUrl.hash = '';
        const normalized = linkUrl.href.replace(/\/$/, '') || linkUrl.origin;
        if (seen.has(normalized) || seen.has(normalized + '/')) return;
        seen.add(normalized);
        pages.push(linkUrl.href);
      } catch { /* skip */ }
    });
  });

  return pages;
}

// ============================================
// TEXT EXTRACTION — NO TRUNCATION
// ============================================
function getCleanText(el: Element): string {
  const parts: string[] = [];
  for (const child of el.childNodes) {
    if (child.nodeType === 3) {
      const text = child.textContent || '';
      if (text.trim()) parts.push(text.trim());
    } else if (child.nodeType === 1) {
      const tag = (child as Element).tagName.toLowerCase();
      if (tag === 'br') parts.push(' ');
      else {
        const childText = getCleanText(child as Element);
        if (childText) parts.push(childText);
      }
    }
  }
  return parts.join(' ').replace(/\s+/g, ' ').trim();
}

function extractFullContent(html: string, url: string): string {
  const dom = new JSDOM(html, { url });
  const doc = dom.window.document;
  const clone = doc.body?.cloneNode(true) as Element;
  if (!clone) return '';

  clone.querySelectorAll('script, style, noscript, svg, iframe, template').forEach((el) => el.remove());

  const parts: string[] = [];

  function walk(node: ChildNode) {
    if (node.nodeType === 3) {
      const text = node.textContent?.trim();
      if (text) parts.push(text);
      return;
    }
    if (node.nodeType !== 1) return;
    const el = node as Element;
    const tag = el.tagName.toLowerCase();
    const style = el.getAttribute('style') || '';
    if (style.includes('display: none') || style.includes('display:none')) return;
    if (style.includes('visibility: hidden') || style.includes('visibility:hidden')) return;

    if (tag === 'br') { parts.push('\n'); return; }
    if (/^h[1-6]$/.test(tag)) {
      const text = getCleanText(el);
      if (text) { parts.push(`\n\n[${tag.toUpperCase()}] ${text}\n`); return; }
    }

    const isBlock = ['p', 'div', 'section', 'article', 'li', 'tr', 'blockquote', 'header', 'footer', 'main', 'aside', 'figure'].includes(tag);
    if (isBlock) parts.push('\n');
    if (INLINE_TAGS.has(tag)) parts.push(' ');
    for (const child of node.childNodes) walk(child);
    if (isBlock) parts.push('\n');
  }

  walk(clone);

  // Same cleanup as main reviewer, but NO .slice()
  return parts.join('')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/^\s+|\s+$/gm, '')
    .trim();
}

// ============================================
// MAIN
// ============================================
async function main() {
  const url = process.argv[2];
  if (!url?.startsWith('http')) {
    console.error('Usage: npx tsx scripts/page-char-audit.ts <url>');
    process.exit(1);
  }

  const CAP = 2000; // current cap in the reviewer

  console.log(`\n  Fetching ${url}...`);
  const homepageHtml = await fetchHTML(url);
  const pageUrls = discoverNavPages(homepageHtml, url);
  console.log(`  Found ${pageUrls.length} pages\n`);

  const rows: { path: string; chars: number; words: number; truncated: number }[] = [];

  for (const pageUrl of pageUrls) {
    const path = new URL(pageUrl).pathname;
    const html = pageUrl === `${new URL(url).origin}/` ? homepageHtml : await fetchHTML(pageUrl);
    const full = extractFullContent(html, pageUrl);
    const words = full.split(/\s+/).filter(Boolean).length;
    const truncated = Math.max(0, full.length - CAP);
    rows.push({ path, chars: full.length, words, truncated });
  }

  // Table header
  const hPath = 'PAGE'.padEnd(20);
  const hChars = 'CHARS'.padStart(7);
  const hWords = 'WORDS'.padStart(7);
  const hCap = `>${CAP}?`.padStart(7);
  const hTrunc = 'LOST'.padStart(7);
  const hPct = '%LOST'.padStart(7);

  console.log(`  ${hPath} ${hChars} ${hWords} ${hCap} ${hTrunc} ${hPct}`);
  console.log(`  ${'─'.repeat(56)}`);

  let totalChars = 0;
  let totalLost = 0;

  for (const r of rows) {
    const over = r.chars > CAP ? '  YES' : '   no';
    const pct = r.chars > CAP ? `${Math.round((r.truncated / r.chars) * 100)}%` : '—';
    console.log(`  ${r.path.padEnd(20)} ${String(r.chars).padStart(7)} ${String(r.words).padStart(7)} ${over.padStart(7)} ${String(r.truncated).padStart(7)} ${pct.padStart(7)}`);
    totalChars += r.chars;
    totalLost += r.truncated;
  }

  console.log(`  ${'─'.repeat(56)}`);
  console.log(`  ${'TOTAL'.padEnd(20)} ${String(totalChars).padStart(7)} ${' '.repeat(7)} ${' '.repeat(7)} ${String(totalLost).padStart(7)} ${totalLost > 0 ? Math.round((totalLost / totalChars) * 100) + '%' : '—'}`);

  console.log(`\n  Current cap: ${CAP} chars/page`);
  if (totalLost > 0) {
    const newCap = Math.max(...rows.map((r) => r.chars));
    console.log(`  Suggested cap: ${newCap} chars (covers all pages)`);
    console.log(`  Total content at new cap: ${totalChars} chars (~${Math.round(totalChars / 4)} tokens)`);
  } else {
    console.log(`  All pages fit within the ${CAP} char cap — no change needed.`);
  }
  console.log();
}

main().catch((err) => {
  console.error('Error:', err.message);
  process.exit(1);
});
