/**
 * AI Website Reviewer — Prototype V2
 *
 * Multi-page site reviewer that crawls nav-linked pages and produces
 * specific, actionable feedback using AI analysis.
 *
 * V2 fixes:
 * - Text extraction handles <br> tags and inline sibling elements
 * - Crawls all pages linked from header/nav/footer (not just homepage)
 *
 * Usage: cd app && npx tsx scripts/prototype-site-review.ts https://needthisdone.com
 *        cd app && npx tsx scripts/prototype-site-review.ts https://needthisdone.com https://example.com
 */

import { config } from 'dotenv';
config({ path: '.env.local' });

import { writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { JSDOM } from 'jsdom';

// ============================================
// DUAL OUTPUT — console + file
// ============================================

const outputLines: string[] = [];

/** Log to both stdout and the output buffer */
function log(line: string = '') {
  console.log(line);
  outputLines.push(line);
}

// ============================================
// TYPES
// ============================================

interface TechnicalMetrics {
  url: string;
  httpStatus: number;
  https: boolean;
  title: string | null;
  metaDescription: string | null;
  hasViewportMeta: boolean;
  wordCount: number;
  readingLevel: string;
  headings: { tag: string; text: string }[];
  h1Count: number;
  headingHierarchyGaps: string[];
  images: { total: number; withAlt: number; withoutAlt: number; altCoverage: string };
  links: { internal: number; external: number; total: number };
  ctas: string[];
  metaCompleteness: { title: boolean; description: boolean; viewport: boolean; ogTitle: boolean; ogDescription: boolean; ogImage: boolean };
}

interface PageData {
  url: string;
  metrics: TechnicalMetrics;
  content: string;
}

// ============================================
// HTML FETCHING & PARSING
// ============================================

async function fetchHTML(url: string): Promise<{ html: string; status: number }> {
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'NeedThisDone-SiteReviewer/1.0 (prototype)',
      'Accept': 'text/html,application/xhtml+xml',
    },
    redirect: 'follow',
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  return { html: await response.text(), status: response.status };
}

// ============================================
// TEXT EXTRACTION HELPERS
// ============================================

// Inline elements that should get a space separator rather than a newline
const INLINE_TAGS = new Set([
  'span', 'a', 'em', 'strong', 'b', 'i', 'u', 'mark', 'small', 'sub', 'sup',
  'abbr', 'cite', 'code', 'kbd', 'samp', 'var', 'time', 'data', 'label',
]);

/**
 * Recursively extract text from an element, inserting spaces between
 * sibling inline elements and newlines for <br> tags.
 *
 * This fixes the "We buildwhat you needdone." bug where <br> and sibling
 * <span> elements produced no whitespace during DOM walking.
 */
function getCleanText(el: Element): string {
  const parts: string[] = [];

  for (const child of el.childNodes) {
    if (child.nodeType === 3 /* TEXT_NODE */) {
      const text = child.textContent || '';
      if (text.trim()) parts.push(text.trim());
    } else if (child.nodeType === 1 /* ELEMENT_NODE */) {
      const childEl = child as Element;
      const tag = childEl.tagName.toLowerCase();

      if (tag === 'br') {
        parts.push(' ');
      } else {
        // Recurse into child elements
        const childText = getCleanText(childEl);
        if (childText) parts.push(childText);
      }
    }
  }

  return parts.join(' ').replace(/\s+/g, ' ').trim();
}

// ============================================
// CONTENT EXTRACTION (jsdom-based)
// ============================================

function extractMetrics(html: string, url: string, httpStatus: number): TechnicalMetrics {
  const dom = new JSDOM(html, { url });
  const doc = dom.window.document;

  // Title & meta tags
  const title = doc.querySelector('title')?.textContent?.trim() || null;
  const metaDescription = doc.querySelector('meta[name="description"]')?.getAttribute('content') || null;
  const hasViewportMeta = !!doc.querySelector('meta[name="viewport"]');
  const ogTitle = doc.querySelector('meta[property="og:title"]')?.getAttribute('content') || null;
  const ogDescription = doc.querySelector('meta[property="og:description"]')?.getAttribute('content') || null;
  const ogImage = doc.querySelector('meta[property="og:image"]')?.getAttribute('content') || null;

  // Headings — use getCleanText() instead of raw textContent
  const headings: { tag: string; text: string }[] = [];
  doc.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach((el: Element) => {
    const text = getCleanText(el);
    if (text) headings.push({ tag: el.tagName.toLowerCase(), text });
  });

  const h1Count = headings.filter((h) => h.tag === 'h1').length;

  // Heading hierarchy gap detection (e.g., h1 -> h3 skipping h2)
  const headingHierarchyGaps: string[] = [];
  for (let i = 1; i < headings.length; i++) {
    const prevLevel = parseInt(headings[i - 1].tag[1]);
    const currLevel = parseInt(headings[i].tag[1]);
    if (currLevel > prevLevel + 1) {
      headingHierarchyGaps.push(`${headings[i - 1].tag} → ${headings[i].tag} (skipped ${currLevel - prevLevel - 1} level(s))`);
    }
  }

  // Images
  const allImages = doc.querySelectorAll('img');
  const withAlt = Array.from(allImages).filter((img: Element) => {
    const alt = img.getAttribute('alt');
    return alt && alt.trim().length > 0;
  });

  // Links
  const allLinks = doc.querySelectorAll('a[href]');
  const parsedUrl = new URL(url);
  let internalCount = 0;
  let externalCount = 0;

  allLinks.forEach((a: Element) => {
    const href = a.getAttribute('href') || '';
    if (href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) return;
    try {
      const linkUrl = new URL(href, url);
      if (linkUrl.hostname === parsedUrl.hostname) {
        internalCount++;
      } else {
        externalCount++;
      }
    } catch {
      // Relative or malformed — treat as internal
      internalCount++;
    }
  });

  // Visible text content (strip scripts, styles, nav)
  const clone = doc.body?.cloneNode(true) as Element;
  if (clone) {
    clone.querySelectorAll('script, style, noscript, svg, nav').forEach((el) => el.remove());
  }
  const visibleText = clone?.textContent?.replace(/\s+/g, ' ').trim() || '';
  const wordCount = visibleText.split(/\s+/).filter((w) => w.length > 0).length;

  // Flesch-Kincaid readability approximation
  const readingLevel = computeReadingLevel(visibleText);

  // CTA detection — buttons and links with action-oriented text
  const ctas: string[] = [];
  const ctaSelectors = 'a, button, [role="button"]';
  doc.querySelectorAll(ctaSelectors).forEach((el: Element) => {
    const text = getCleanText(el);
    if (text.length > 2 && text.length < 80) {
      const actionWords = /get|start|book|schedule|contact|buy|order|sign|join|try|learn|download|request|claim|grab|reserve/i;
      if (actionWords.test(text)) {
        ctas.push(text);
      }
    }
  });

  return {
    url,
    httpStatus,
    https: parsedUrl.protocol === 'https:',
    title,
    metaDescription,
    hasViewportMeta,
    wordCount,
    readingLevel,
    headings,
    h1Count,
    headingHierarchyGaps,
    images: {
      total: allImages.length,
      withAlt: withAlt.length,
      withoutAlt: allImages.length - withAlt.length,
      altCoverage: allImages.length > 0
        ? `${Math.round((withAlt.length / allImages.length) * 100)}%`
        : 'N/A (no images)',
    },
    links: { internal: internalCount, external: externalCount, total: internalCount + externalCount },
    ctas: [...new Set(ctas)],
    metaCompleteness: {
      title: !!title,
      description: !!metaDescription,
      viewport: hasViewportMeta,
      ogTitle: !!ogTitle,
      ogDescription: !!ogDescription,
      ogImage: !!ogImage,
    },
  };
}

// ============================================
// READABILITY (Flesch-Kincaid approximation)
// ============================================

function countSyllables(word: string): number {
  word = word.toLowerCase().replace(/[^a-z]/g, '');
  if (word.length <= 3) return 1;

  // Remove trailing silent e
  word = word.replace(/e$/, '');

  // Count vowel groups
  const vowelGroups = word.match(/[aeiouy]+/g);
  const count = vowelGroups ? vowelGroups.length : 1;

  return Math.max(1, count);
}

function computeReadingLevel(text: string): string {
  const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0);
  const words = text.split(/\s+/).filter((w) => w.length > 0);

  if (sentences.length === 0 || words.length === 0) return 'N/A';

  const totalSyllables = words.reduce((sum, w) => sum + countSyllables(w), 0);
  const avgWordsPerSentence = words.length / sentences.length;
  const avgSyllablesPerWord = totalSyllables / words.length;

  // Flesch-Kincaid Grade Level
  const grade = 0.39 * avgWordsPerSentence + 11.8 * avgSyllablesPerWord - 15.59;
  const clampedGrade = Math.max(1, Math.min(18, Math.round(grade)));

  if (clampedGrade <= 6) return `Grade ${clampedGrade} (Easy — great for general audience)`;
  if (clampedGrade <= 8) return `Grade ${clampedGrade} (Conversational — good for most websites)`;
  if (clampedGrade <= 12) return `Grade ${clampedGrade} (Moderate — may lose some readers)`;
  return `Grade ${clampedGrade} (Complex — consider simplifying)`;
}

// ============================================
// EXTRACT VISIBLE TEXT FOR AI PROMPT
// ============================================

function extractVisibleContent(html: string, url: string, maxChars: number = 2000): string {
  const dom = new JSDOM(html, { url });
  const doc = dom.window.document;

  // Remove non-content elements
  const clone = doc.body?.cloneNode(true) as Element;
  if (!clone) return '';

  clone.querySelectorAll('script, style, noscript, svg, iframe, template').forEach((el) => el.remove());

  // Walk the DOM and build structured text with proper whitespace
  const parts: string[] = [];

  function walk(node: ChildNode) {
    if (node.nodeType === 3 /* TEXT_NODE */) {
      const text = node.textContent?.trim();
      if (text) parts.push(text);
      return;
    }

    if (node.nodeType !== 1 /* ELEMENT_NODE */) return;

    const el = node as Element;
    const tag = el.tagName.toLowerCase();

    // Skip hidden elements
    const style = el.getAttribute('style') || '';
    if (style.includes('display: none') || style.includes('display:none')) return;
    if (style.includes('visibility: hidden') || style.includes('visibility:hidden')) return;

    // <br> becomes a newline
    if (tag === 'br') {
      parts.push('\n');
      return;
    }

    // Headings — use getCleanText for proper spacing
    if (/^h[1-6]$/.test(tag)) {
      const text = getCleanText(el);
      if (text) {
        parts.push(`\n\n[${tag.toUpperCase()}] ${text}\n`);
        return;
      }
    }

    // Block elements get line breaks
    const isBlock = ['p', 'div', 'section', 'article', 'li', 'tr', 'blockquote', 'header', 'footer', 'main', 'aside', 'figure'].includes(tag);

    if (isBlock) {
      parts.push('\n');
    }

    // Inline elements get a space separator
    if (INLINE_TAGS.has(tag)) {
      parts.push(' ');
    }

    for (const child of node.childNodes) {
      walk(child);
    }

    if (isBlock) {
      parts.push('\n');
    }
  }

  walk(clone);

  return parts.join('')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/^\s+|\s+$/gm, '')
    .trim()
    .slice(0, maxChars);
}

// ============================================
// MULTI-PAGE CRAWL — Discover nav-linked pages
// ============================================

function discoverNavPages(html: string, baseUrl: string): string[] {
  const dom = new JSDOM(html, { url: baseUrl });
  const doc = dom.window.document;
  const parsedBase = new URL(baseUrl);

  // Only look for links in header, nav, and footer elements
  const navContainers = doc.querySelectorAll('header, nav, footer');
  const seen = new Set<string>();
  const pages: string[] = [];

  // Always include homepage first
  const homepageUrl = `${parsedBase.origin}/`;
  seen.add(homepageUrl);
  pages.push(homepageUrl);

  // Skip utility/legal pages that don't help the AI produce useful feedback
  const SKIP_PATHS = new Set(['/cart', '/wishlist', '/checkout', '/login', '/signup', '/register', '/privacy', '/terms', '/cookie-policy']);

  navContainers.forEach((container: Element) => {
    container.querySelectorAll('a[href]').forEach((a: Element) => {
      const href = a.getAttribute('href') || '';

      // Skip anchors, mailto, tel, javascript
      if (href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('javascript:')) return;

      try {
        const linkUrl = new URL(href, baseUrl);

        // Same domain only
        if (linkUrl.hostname !== parsedBase.hostname) return;

        // Skip utility pages
        const path = linkUrl.pathname.replace(/\/$/, '') || '/';
        if (SKIP_PATHS.has(path)) return;

        // Strip hash and trailing slash for dedup
        linkUrl.hash = '';
        const normalized = linkUrl.href.replace(/\/$/, '') || linkUrl.origin;

        if (seen.has(normalized) || seen.has(normalized + '/')) return;
        seen.add(normalized);

        pages.push(linkUrl.href);
      } catch {
        // Malformed URL — skip
      }
    });
  });

  return pages;
}

// ============================================
// AI EVALUATION PROMPT (multi-page)
// ============================================

function buildEvaluationPrompt(allMetrics: TechnicalMetrics[]): string {
  const homepage = allMetrics[0];
  const totalPages = allMetrics.length;

  // Build per-page technical summary
  const perPageSummary = allMetrics.map((m) => {
    const path = new URL(m.url).pathname;
    return `  ${path.padEnd(25)} | ${(m.title || 'NO TITLE').slice(0, 35).padEnd(35)} | ${String(m.wordCount).padStart(5)} words | H1: ${m.h1Count} | Alt: ${m.images.altCoverage}`;
  }).join('\n');

  // Aggregate CTAs across all pages
  const allCtas = [...new Set(allMetrics.flatMap((m) => m.ctas))];

  return `You are a senior website consultant who reviews small business websites. You give specific, actionable feedback — never generic advice.

RULES:
- Reference specific text, headlines, and CTAs from the page content. Quote them.
- Every recommendation must reference something concrete on a specific page. Include the page path.
- Do NOT say things like "add more keywords" or "improve your SEO." Those are useless.
- Write as if speaking to a non-technical small business owner.
- Be direct but encouraging. Start with what's working before what needs fixing.

SITE OVERVIEW:
- Pages crawled: ${totalPages}
- HTTPS: ${homepage.https ? 'Yes' : 'NO — security risk'}
- Homepage title: ${homepage.title ? `"${homepage.title}"` : 'MISSING'}
- Homepage meta description: ${homepage.metaDescription ? `"${homepage.metaDescription.slice(0, 120)}"` : 'MISSING'}

PER-PAGE METRICS:
${perPageSummary}

DETECTED CTAs ACROSS SITE:
${allCtas.length > 0 ? allCtas.map(c => `  "${c}"`).join('\n') : '  None detected'}

ANALYZE THESE 7 AREAS:

## 1. First Impression
Is it immediately clear what this business does and who it's for? Quote the homepage headline. Would a visitor from Google know in 5 seconds whether this site is for them?

## 2. Messaging Consistency
Do pages tell a cohesive story? Or does each page feel disconnected? Reference specific messaging from at least 2 different pages.

## 3. Service Clarity
Are services explained clearly? Can a visitor understand what they'd get? Quote specific service descriptions — flag any that are vague or jargon-heavy.

## 4. CTA Quality
Quote CTAs from across the site. Are they specific and compelling? "Get Started" is weak. "Get Your Free Website Audit" is strong. Suggest improvements for weak ones.

## 5. Trust & Credibility
Are there reviews, testimonials, credentials, guarantees, case studies, or social proof anywhere on the site? What's present and what's missing?

## 6. Content Gaps
What's missing from the site? Compare what pages exist vs. what a visitor would expect. Is there an About page? Pricing? Testimonials? Portfolio?

## 7. Quick Wins (Top 5)
The 5 highest-impact changes this business owner could make this week, in priority order. Be specific — "Change the headline on /services from X to Y" not "improve your headlines." Reference specific pages and content.

FORMAT: Use markdown with ## headers for each section. Keep each section to 3-5 sentences. End with the Quick Wins as a numbered list.`;
}

// ============================================
// DISPLAY RESULTS
// ============================================

function printSiteScorecard(allMetrics: TechnicalMetrics[]) {
  const LINE = '─'.repeat(70);
  const homepage = allMetrics[0];

  log(`\n${LINE}`);
  log(`  SITE-WIDE TECHNICAL SCORECARD`);
  log(`  ${allMetrics.length} pages crawled | ${homepage.https ? 'HTTPS ✓' : 'HTTPS ✗'}`);
  log(LINE);

  // Per-page summary table
  log('  PATH                      TITLE                                WORDS  H1  ALT');
  log('  ' + '─'.repeat(66));

  for (const m of allMetrics) {
    const path = new URL(m.url).pathname;
    const title = (m.title || 'NO TITLE').slice(0, 35);
    log(`  ${path.padEnd(26)} ${title.padEnd(37)} ${String(m.wordCount).padStart(5)}  ${String(m.h1Count).padStart(2)}  ${m.images.altCoverage}`);
  }

  log();

  // Site-wide meta coverage
  const pagesWithTitle = allMetrics.filter((m) => m.metaCompleteness.title).length;
  const pagesWithDesc = allMetrics.filter((m) => m.metaCompleteness.description).length;
  const pagesWithOg = allMetrics.filter((m) => m.metaCompleteness.ogTitle && m.metaCompleteness.ogImage).length;
  log(`  Meta Coverage:`);
  log(`    Title .............. ${pagesWithTitle}/${allMetrics.length} pages`);
  log(`    Description ........ ${pagesWithDesc}/${allMetrics.length} pages`);
  log(`    OG Tags ............ ${pagesWithOg}/${allMetrics.length} pages`);

  // Aggregate stats
  const totalWords = allMetrics.reduce((sum, m) => sum + m.wordCount, 0);
  const totalImages = allMetrics.reduce((sum, m) => sum + m.images.total, 0);
  const totalImagesWithAlt = allMetrics.reduce((sum, m) => sum + m.images.withAlt, 0);
  const allCtas = [...new Set(allMetrics.flatMap((m) => m.ctas))];

  log();
  log(`  Totals:`);
  log(`    Total Words ........ ${totalWords}`);
  log(`    Total Images ....... ${totalImages} (${totalImages > 0 ? Math.round((totalImagesWithAlt / totalImages) * 100) : 'N/A'}% with alt text)`);
  log(`    Unique CTAs ........ ${allCtas.length}`);

  if (allCtas.length > 0) {
    allCtas.slice(0, 10).forEach((cta) => {
      log(`      → "${cta}"`);
    });
  }

  // Heading hierarchy issues across all pages
  const allGaps = allMetrics.flatMap((m) =>
    m.headingHierarchyGaps.map((gap) => `${new URL(m.url).pathname}: ${gap}`)
  );
  if (allGaps.length > 0) {
    log();
    log(`  Heading Hierarchy Issues:`);
    allGaps.forEach((gap) => log(`    ⚠ ${gap}`));
  }

  log(LINE);
}

// ============================================
// MAIN
// ============================================

async function reviewSite(url: string) {
  log(`\n${'═'.repeat(70)}`);
  log(`  Reviewing: ${url}`);
  log(`${'═'.repeat(70)}`);

  // Step 1: Fetch homepage HTML
  process.stdout.write('  Fetching homepage... ');
  const { html: homepageHtml, status: homepageStatus } = await fetchHTML(url);
  log(`  Fetching homepage... done (${homepageStatus}, ${Math.round(homepageHtml.length / 1024)}KB)`);

  // Step 2: Discover pages from nav/header/footer links
  process.stdout.write('  Discovering nav pages... ');
  const pageUrls = discoverNavPages(homepageHtml, url);
  log(`  Discovering nav pages... found ${pageUrls.length} pages`);
  pageUrls.forEach((p) => log(`    → ${new URL(p).pathname}`));

  // Step 3: Fetch and process each page
  const pages: PageData[] = [];

  for (const pageUrl of pageUrls) {
    const path = new URL(pageUrl).pathname;
    process.stdout.write(`  Processing ${path}... `);

    try {
      // Reuse homepage HTML if this is the homepage
      let html: string;
      let status: number;
      if (pageUrl === pageUrls[0]) {
        html = homepageHtml;
        status = homepageStatus;
      } else {
        const result = await fetchHTML(pageUrl);
        html = result.html;
        status = result.status;
      }

      const metrics = extractMetrics(html, pageUrl, status);
      const content = extractVisibleContent(html, pageUrl, 6000);
      pages.push({ url: pageUrl, metrics, content });
      log(`  Processing ${path}... done (${metrics.wordCount} words, ${content.length} chars)`);
    } catch (err) {
      log(`  Processing ${path}... FAILED: ${err instanceof Error ? err.message : err}`);
    }
  }

  if (pages.length === 0) {
    log('  No pages could be processed. Aborting.');
    return;
  }

  // Step 4: Print site-wide scorecard
  printSiteScorecard(pages.map((p) => p.metrics));

  // Step 5: Build combined content for AI
  const combinedContent = pages.map((p) => {
    const path = new URL(p.url).pathname;
    return `PAGE: ${path}\n[title] ${p.metrics.title || 'No title'}\n[content]\n${p.content}`;
  }).join('\n\n---\n\n');

  log(`\n  Combined content for AI: ${combinedContent.length} chars across ${pages.length} pages`);

  // Step 6: AI analysis
  const model = process.env.NEXT_PUBLIC_CHATBOT_MODEL || 'gpt-4.1-nano';
  process.stdout.write(`  Running AI analysis (${model})... `);
  const startTime = performance.now();

  const { text, usage } = await generateText({
    model: openai(model),
    system: buildEvaluationPrompt(pages.map((p) => p.metrics)),
    messages: [{ role: 'user', content: `Here is the visible content from all pages on ${url}:\n\n${combinedContent}` }],
    temperature: 0.3,
    maxOutputTokens: 2000,
  });

  const elapsed = Math.round(performance.now() - startTime);
  log(`  Running AI analysis (${model})... done (${elapsed}ms)`);

  if (usage?.inputTokens) {
    log(`  Tokens: ${usage.inputTokens} in / ${usage.outputTokens} out`);
  }

  // Step 7: Print AI analysis
  const LINE = '─'.repeat(70);
  log(`\n${LINE}`);
  log(`  AI SITE ANALYSIS`);
  log(LINE);
  log(text);
  log(LINE);
}

async function main() {
  // Validate environment
  if (!process.env.OPENAI_API_KEY) {
    console.error('Missing OPENAI_API_KEY in app/.env.local');
    process.exit(1);
  }

  // Get URLs from CLI args
  const urls = process.argv.slice(2).filter((arg) => arg.startsWith('http'));

  if (urls.length === 0) {
    console.error('Usage: npx tsx scripts/prototype-site-review.ts <url> [url2] [url3]');
    console.error('Example: npx tsx scripts/prototype-site-review.ts https://needthisdone.com');
    process.exit(1);
  }

  const model = process.env.NEXT_PUBLIC_CHATBOT_MODEL || 'gpt-4.1-nano';
  log('═'.repeat(70));
  log('  AI Website Reviewer — Prototype V2');
  log(`  Model: ${model}`);
  log(`  Sites: ${urls.length}`);
  log(`  Time: ${new Date().toISOString()}`);
  log('═'.repeat(70));

  for (const url of urls) {
    try {
      await reviewSite(url);
    } catch (err) {
      log(`\n  ERROR reviewing ${url}: ${err instanceof Error ? err.message : err}`);
    }
  }

  log(`\n${'═'.repeat(70)}`);
  log('  Done. Review the AI output above:');
  log('  - Does it quote actual headlines/CTAs from specific pages?');
  log('  - Does it reference content from multiple pages (not just homepage)?');
  log('  - Is the advice specific to THIS site (not interchangeable)?');
  log('  - Would a small business owner find it useful?');
  log('═'.repeat(70));

  // Write output to file for later review
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);
  const outputPath = join(__dirname, 'review-output.txt');
  writeFileSync(outputPath, outputLines.join('\n'), 'utf-8');
  console.log(`\n  Output saved to: ${outputPath}`);
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
