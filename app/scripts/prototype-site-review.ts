/**
 * AI Website Reviewer — Prototype V4
 *
 * Multi-page site reviewer that crawls nav-linked pages and produces
 * specific, actionable feedback using AI analysis.
 *
 * V4 improvements:
 * - WCAG 2.1 AA accessibility audit (10 static HTML checks)
 * - Accessibility scoring category (20 points in rebalanced 100-point rubric)
 * - ADA compliance section in AI analysis (Section 5)
 * - Accessibility issues section in scorecard display
 *
 * V3 improvements:
 * - Scoring system (100-point rubric, A-F grade)
 * - Executive summary at top of report
 * - Technical findings fed to AI prompt
 * - CTA detection filters out FAQ questions
 * - SVG/background-image detection (not just <img>)
 * - Clean report output (no progress noise)
 * - 6 focused AI sections (no duplicate recommendations)
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
// OUTPUT — separate report (deliverable) from progress (debug)
// ============================================

const reportLines: string[] = [];

/** Write to the report deliverable AND console */
function report(line: string = '') {
  console.log(line);
  reportLines.push(line);
}

/** Write to console only (status/debug — not in the deliverable) */
function progress(line: string = '') {
  console.log(line);
}

// ============================================
// TYPES
// ============================================

interface AccessibilityMetrics {
  hasLangAttribute: boolean;
  langValue: string | null;
  hasSkipNav: boolean;
  landmarks: { main: number; nav: number; header: number; footer: number; complementary: number };
  formLabels: { total: number; labeled: number; unlabeled: string[] };
  emptyInteractives: string[];
  genericLinkText: string[];
  positiveTabindex: number;
  autoplayMedia: number;
  missingAutocomplete: string[];
  altTextIssues: { emptyAlt: number; longAlt: number };
}

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
  images: { total: number; withAlt: number; withoutAlt: number; altCoverage: string; svgCount: number; bgImageCount: number; pictureCount: number };
  links: { internal: number; external: number; total: number };
  ctas: string[];
  metaCompleteness: { title: boolean; description: boolean; viewport: boolean; ogTitle: boolean; ogDescription: boolean; ogImage: boolean };
  accessibility: AccessibilityMetrics;
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

  // Images — <img>, SVG, background-image, <picture>
  const allImages = doc.querySelectorAll('img');
  const withAlt = Array.from(allImages).filter((img: Element) => {
    const alt = img.getAttribute('alt');
    return alt && alt.trim().length > 0;
  });
  const svgCount = doc.querySelectorAll('svg').length;
  const pictureCount = doc.querySelectorAll('picture').length;
  let bgImageCount = 0;
  doc.querySelectorAll('[style]').forEach((el: Element) => {
    const style = el.getAttribute('style') || '';
    if (/background(-image)?\s*:/.test(style) && style.includes('url(')) {
      bgImageCount++;
    }
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

  // ── Accessibility checks (WCAG 2.1 AA, static HTML only) ──

  // 1. Language attribute (WCAG 3.1.1)
  const htmlEl = doc.querySelector('html');
  const langValue = htmlEl?.getAttribute('lang')?.trim() || null;
  const hasLangAttribute = !!langValue;

  // 2. Skip navigation (WCAG 2.4.1) — look for early links pointing to #main, #content, etc.
  const hasSkipNav = !!doc.querySelector('a[href^="#main"], a[href^="#content"], a[href="#skip"], a.skip-nav, a.skip-link, [class*="skip-to"]');

  // 3. Landmark regions (WCAG 1.3.1)
  const landmarks = {
    main: doc.querySelectorAll('main, [role="main"]').length,
    nav: doc.querySelectorAll('nav, [role="navigation"]').length,
    header: doc.querySelectorAll('header, [role="banner"]').length,
    footer: doc.querySelectorAll('footer, [role="contentinfo"]').length,
    complementary: doc.querySelectorAll('aside, [role="complementary"]').length,
  };

  // 4. Form labels (WCAG 1.3.1, 4.1.2)
  const formInputs = doc.querySelectorAll('input:not([type="hidden"]):not([type="submit"]):not([type="button"]):not([type="reset"]), select, textarea');
  const unlabeledInputs: string[] = [];
  formInputs.forEach((input: Element) => {
    const id = input.getAttribute('id');
    const hasLabel = !!(
      input.getAttribute('aria-label') ||
      input.getAttribute('aria-labelledby') ||
      input.getAttribute('title') ||
      (id && doc.querySelector(`label[for="${id}"]`)) ||
      input.closest('label')
    );
    if (!hasLabel) {
      const type = input.getAttribute('type') || input.tagName.toLowerCase();
      const name = input.getAttribute('name') || input.getAttribute('placeholder') || 'unnamed';
      unlabeledInputs.push(`${type}[${name}]`);
    }
  });
  const formLabels = { total: formInputs.length, labeled: formInputs.length - unlabeledInputs.length, unlabeled: unlabeledInputs };

  // 5. Empty interactive elements (WCAG 4.1.2, 2.4.4)
  const emptyInteractives: string[] = [];
  doc.querySelectorAll('a[href], button, [role="button"], [role="link"]').forEach((el: Element) => {
    const text = getCleanText(el).trim();
    const ariaLabel = el.getAttribute('aria-label')?.trim();
    const ariaLabelledBy = el.getAttribute('aria-labelledby');
    const hasImgAlt = !!el.querySelector('img[alt]:not([alt=""])');
    const hasSvgTitle = !!el.querySelector('svg title');
    if (!text && !ariaLabel && !ariaLabelledBy && !hasImgAlt && !hasSvgTitle) {
      const tag = el.tagName.toLowerCase();
      const href = el.getAttribute('href') || '';
      const cls = el.getAttribute('class')?.split(' ').slice(0, 2).join('.') || '';
      emptyInteractives.push(`<${tag}${cls ? '.' + cls : ''}${href ? ' href="' + href.slice(0, 40) + '"' : ''}>`);
    }
  });

  // 6. Generic link text (WCAG 2.4.4)
  const GENERIC_PATTERNS = /^(click here|here|read more|learn more|more|link|go|continue|details|info)$/i;
  const genericLinkText: string[] = [];
  doc.querySelectorAll('a[href]').forEach((a: Element) => {
    const text = getCleanText(a).trim();
    if (GENERIC_PATTERNS.test(text)) {
      const href = a.getAttribute('href') || '';
      genericLinkText.push(`"${text}" → ${href.slice(0, 50)}`);
    }
  });

  // 7. Positive tabindex (WCAG 2.4.3)
  let positiveTabindex = 0;
  doc.querySelectorAll('[tabindex]').forEach((el: Element) => {
    const val = parseInt(el.getAttribute('tabindex') || '0', 10);
    if (val > 0) positiveTabindex++;
  });

  // 8. Autocomplete on personal data inputs (WCAG 1.3.5)
  const AUTOCOMPLETE_TYPES = new Set(['text', 'email', 'tel', 'url', 'search']);
  const PERSONAL_NAMES = /\b(name|email|phone|tel|address|city|state|zip|postal|country|street)\b/i;
  const missingAutocomplete: string[] = [];
  formInputs.forEach((input: Element) => {
    const type = input.getAttribute('type') || 'text';
    const name = input.getAttribute('name') || '';
    const id = input.getAttribute('id') || '';
    if (AUTOCOMPLETE_TYPES.has(type) && PERSONAL_NAMES.test(name + ' ' + id)) {
      if (!input.getAttribute('autocomplete')) {
        missingAutocomplete.push(`${type}[${name || id}]`);
      }
    }
  });

  // 9. Auto-playing media (WCAG 1.4.2)
  let autoplayMedia = 0;
  doc.querySelectorAll('video[autoplay], audio[autoplay]').forEach((el: Element) => {
    if (!el.hasAttribute('muted')) autoplayMedia++;
  });

  // 10. Alt text quality — empty alt on non-decorative images, overly long alt
  let emptyAlt = 0;
  let longAlt = 0;
  allImages.forEach((img: Element) => {
    const alt = img.getAttribute('alt');
    if (alt === '') {
      // Empty alt is correct for decorative images, but flag if image has role or meaningful src
      const src = img.getAttribute('src') || '';
      const isLikelyContent = img.getAttribute('role') === 'img' || /logo|hero|product|team|photo/i.test(src);
      if (isLikelyContent) emptyAlt++;
    } else if (alt && alt.length > 125) {
      longAlt++;
    }
  });

  const accessibility: AccessibilityMetrics = {
    hasLangAttribute,
    langValue,
    hasSkipNav,
    landmarks,
    formLabels,
    emptyInteractives,
    genericLinkText,
    positiveTabindex,
    autoplayMedia,
    missingAutocomplete,
    altTextIssues: { emptyAlt, longAlt },
  };

  // CTA detection — buttons and links with action-oriented text
  // Filters: skip questions (FAQ), long sentences, require word boundaries
  const ctas: string[] = [];
  const ctaSelectors = 'a, button, [role="button"]';
  doc.querySelectorAll(ctaSelectors).forEach((el: Element) => {
    let text = getCleanText(el);
    if (text.length > 2 && text.length < 80) {
      // Skip FAQ-style questions
      if (text.includes('?')) return;
      // Skip long sentences (real CTAs are short)
      if (text.split(/\s+/).length > 10) return;
      // Strip leading numbers (e.g., "8 Can I start...")
      text = text.replace(/^\d+\s+/, '');
      const actionWords = /\b(get|start|book|schedule|contact|buy|order|sign up|join|try|learn|download|request|claim|grab|reserve)\b/i;
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
        : 'N/A (no <img>)',
      svgCount,
      bgImageCount,
      pictureCount,
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
    accessibility,
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

function buildTechnicalFindings(allMetrics: TechnicalMetrics[], score: ScoreBreakdown): string {
  const lines: string[] = [];
  lines.push(`- Overall Score: ${score.total}/100 (${score.grade})`);

  // Call out specific issues from low-scoring categories
  for (const cat of score.categories) {
    if (cat.earned < cat.possible) {
      lines.push(`- ${cat.name}: ${cat.note}`);
    }
  }

  // Heading gaps by page
  const allGaps = allMetrics.flatMap((m) =>
    m.headingHierarchyGaps.map((gap) => `${new URL(m.url).pathname}: ${gap}`)
  );
  if (allGaps.length > 0) {
    lines.push(`- Heading Gaps: ${allGaps.join(', ')}`);
  }

  // Per-page readability
  const readabilities = allMetrics.map((m) => {
    const path = new URL(m.url).pathname;
    return `${path} ${m.readingLevel}`;
  });
  lines.push(`- Readability: ${readabilities.join(', ')}`);

  // Accessibility findings for AI
  const a11y = allMetrics[0].accessibility;
  const a11yFindings: string[] = [];
  if (!a11y.hasLangAttribute) a11yFindings.push('missing <html lang>');
  if (!a11y.hasSkipNav) a11yFindings.push('no skip-nav link');
  if (!allMetrics.some((m) => m.accessibility.landmarks.main > 0)) a11yFindings.push('no <main> landmark');
  const unlabeledTotal = allMetrics.reduce((s, m) => s + m.accessibility.formLabels.unlabeled.length, 0);
  if (unlabeledTotal > 0) a11yFindings.push(`${unlabeledTotal} unlabeled form inputs`);
  const emptyTotal = allMetrics.reduce((s, m) => s + m.accessibility.emptyInteractives.length, 0);
  if (emptyTotal > 0) a11yFindings.push(`${emptyTotal} empty links/buttons`);
  const genericTotal = allMetrics.reduce((s, m) => s + m.accessibility.genericLinkText.length, 0);
  if (genericTotal > 0) a11yFindings.push(`${genericTotal} generic link text instances`);
  const tabTotal = allMetrics.reduce((s, m) => s + m.accessibility.positiveTabindex, 0);
  if (tabTotal > 0) a11yFindings.push(`${tabTotal} positive tabindex elements`);

  if (a11yFindings.length > 0) {
    lines.push(`- Accessibility Issues: ${a11yFindings.join(', ')}`);
  } else {
    lines.push(`- Accessibility: No static HTML issues detected`);
  }

  return lines.join('\n');
}

function buildEvaluationPrompt(allMetrics: TechnicalMetrics[], score: ScoreBreakdown): string {
  const homepage = allMetrics[0];
  const totalPages = allMetrics.length;

  // Build per-page technical summary (with readability)
  const perPageSummary = allMetrics.map((m) => {
    const path = new URL(m.url).pathname;
    const gradeMatch = m.readingLevel.match(/Grade (\d+)/);
    const readGrade = gradeMatch ? `G${gradeMatch[1]}` : 'N/A';
    return `  ${path.padEnd(25)} | ${(m.title || 'NO TITLE').slice(0, 30).padEnd(30)} | ${String(m.wordCount).padStart(5)} words | H1: ${m.h1Count} | Read: ${readGrade}`;
  }).join('\n');

  // Aggregate CTAs across all pages
  const allCtas = [...new Set(allMetrics.flatMap((m) => m.ctas))];

  // Technical findings block
  const technicalFindings = buildTechnicalFindings(allMetrics, score);

  return `You are a senior website consultant who reviews small business websites. You give specific, actionable feedback — never generic advice.

RULES:
- Reference specific text, headlines, and CTAs from the page content. Quote them.
- Every recommendation must reference something concrete on a specific page. Include the page path.
- Do NOT say things like "add more keywords" or "improve your SEO." Those are useless.
- Write as if speaking to a non-technical small business owner.
- Be direct but encouraging. Start with what's working before what needs fixing.
- Reference technical findings where relevant (e.g., missing OG tags, heading gaps).
- Do NOT repeat the same recommendation across sections. Each insight should appear only once.

SITE OVERVIEW:
- Pages crawled: ${totalPages}
- HTTPS: ${homepage.https ? 'Yes' : 'NO — security risk'}
- Homepage title: ${homepage.title ? `"${homepage.title}"` : 'MISSING'}
- Homepage meta description: ${homepage.metaDescription ? `"${homepage.metaDescription.slice(0, 120)}"` : 'MISSING'}

TECHNICAL FINDINGS (reference these in your analysis):
${technicalFindings}

PER-PAGE METRICS:
${perPageSummary}

DETECTED CTAs ACROSS SITE:
${allCtas.length > 0 ? allCtas.map(c => `  "${c}"`).join('\n') : '  None detected'}

ANALYZE THESE 6 AREAS:

## 1. First Impression & Messaging
Is it immediately clear what this business does and who it's for? Quote the homepage headline. Do pages tell a cohesive story, or does each feel disconnected? Reference specific messaging from at least 2 pages.

## 2. Service & Offer Clarity
Are services and pricing explained clearly? Can a visitor understand what they'd get and what it costs? Quote specific descriptions — flag any that are vague, jargon-heavy, or missing key details.

## 3. Trust Signals
What trust elements exist (testimonials, case studies, credentials, guarantees, social proof)? What's missing? Be specific about where trust signals should appear and what form they should take.

## 4. Technical Health
Reference the technical findings above. Explain in plain language what the OG tag gaps, heading issues, readability scores, or other technical problems mean for the business. Focus on business impact, not developer jargon.

## 5. Accessibility & ADA Compliance
Based on the technical findings, what accessibility barriers exist? Explain each issue in plain language — what does it mean for someone using a screen reader, keyboard navigation, or assistive technology? Reference specific pages and elements. Prioritize fixes by legal risk (ADA lawsuits target missing alt text, missing form labels, and keyboard navigation issues most often).

## 6. Top 5 Action Items
The 5 highest-impact changes this business owner could make this week, in priority order. Be specific — "Change the headline on /services from X to Y" not "improve your headlines." Do NOT repeat recommendations already made in sections 1-5. These should be NEW, additional improvements.

FORMAT: Use markdown with ## headers for each section. Keep each section to 3-5 sentences. End with Action Items as a numbered list.`;
}

// ============================================
// SCORING SYSTEM (100 points, A-F grade)
// ============================================

interface ScoreBreakdown {
  total: number;
  grade: string;
  categories: { name: string; earned: number; possible: number; note: string }[];
}

function computeSiteScore(allMetrics: TechnicalMetrics[]): ScoreBreakdown {
  const total = allMetrics.length;
  const categories: ScoreBreakdown['categories'] = [];

  // 1. HTTPS (5 points — unchanged)
  const httpsScore = allMetrics[0].https ? 5 : 0;
  categories.push({ name: 'HTTPS', earned: httpsScore, possible: 5, note: httpsScore === 5 ? 'Secure' : 'Not secure — visitors see a warning' });

  // 2. Meta completeness (10 points, was 15) — pages with both title AND description
  const pagesWithMeta = allMetrics.filter((m) => m.metaCompleteness.title && m.metaCompleteness.description).length;
  const metaScore = Math.round((pagesWithMeta / total) * 10);
  categories.push({ name: 'Meta Tags', earned: metaScore, possible: 10, note: `${pagesWithMeta}/${total} pages have title + description` });

  // 3. OG tags (10 points — unchanged)
  const pagesWithOg = allMetrics.filter((m) => m.metaCompleteness.ogTitle && m.metaCompleteness.ogImage).length;
  const ogScore = Math.round((pagesWithOg / total) * 10);
  categories.push({ name: 'OG Tags', earned: ogScore, possible: 10, note: `${pagesWithOg}/${total} pages — social shares ${pagesWithOg === 0 ? 'look broken' : pagesWithOg < total ? 'partially covered' : 'look great'}` });

  // 4. Heading structure (10 points, was 15) — penalize pages with hierarchy gaps
  const pagesWithGaps = allMetrics.filter((m) => m.headingHierarchyGaps.length > 0).length;
  const headingScore = Math.max(0, 10 - (2 * pagesWithGaps));
  categories.push({ name: 'Heading Structure', earned: headingScore, possible: 10, note: pagesWithGaps === 0 ? 'Clean hierarchy on all pages' : `${pagesWithGaps} page(s) have heading gaps` });

  // 5. Content depth (10 points, was 15) — average word count
  const avgWords = Math.round(allMetrics.reduce((sum, m) => sum + m.wordCount, 0) / total);
  let contentScore: number;
  if (avgWords >= 400) contentScore = 10;
  else if (avgWords >= 200) contentScore = 7;
  else if (avgWords >= 100) contentScore = 4;
  else contentScore = 0;
  categories.push({ name: 'Content Depth', earned: contentScore, possible: 10, note: `Avg ${avgWords} words/page` });

  // 6. CTA presence (10 points — unchanged)
  const uniqueCtas = [...new Set(allMetrics.flatMap((m) => m.ctas))];
  const ctaScore = Math.round(Math.min(uniqueCtas.length / 3, 1) * 10);
  categories.push({ name: 'CTA Presence', earned: ctaScore, possible: 10, note: `${uniqueCtas.length} unique CTAs detected` });

  // 7. H1 consistency (5 points, was 10) — pages with exactly 1 H1
  const pagesWithOneH1 = allMetrics.filter((m) => m.h1Count === 1).length;
  const h1Score = Math.round((pagesWithOneH1 / total) * 5);
  categories.push({ name: 'H1 Consistency', earned: h1Score, possible: 5, note: `${pagesWithOneH1}/${total} pages have exactly 1 H1` });

  // 8. Page coverage (10 points — unchanged)
  const coverageScore = Math.round(Math.min(total / 5, 1) * 10);
  categories.push({ name: 'Page Coverage', earned: coverageScore, possible: 10, note: `${total} pages crawled` });

  // 9. Readability (10 points — unchanged)
  const gradeNumbers = allMetrics.map((m) => {
    const match = m.readingLevel.match(/Grade (\d+)/);
    return match ? parseInt(match[1]) : 8;
  });
  const avgGrade = Math.round(gradeNumbers.reduce((s, g) => s + g, 0) / gradeNumbers.length);
  let readabilityScore: number;
  if (avgGrade >= 6 && avgGrade <= 8) readabilityScore = 10;
  else if (avgGrade === 5 || avgGrade === 9) readabilityScore = 7;
  else readabilityScore = 4;
  categories.push({ name: 'Readability', earned: readabilityScore, possible: 10, note: `Avg Grade ${avgGrade}` });

  // 10. Accessibility (20 points — NEW)
  const a11y = computeAccessibilityScore(allMetrics);
  categories.push(a11y);

  const totalScore = categories.reduce((sum, c) => sum + c.earned, 0);

  let grade: string;
  if (totalScore >= 90) grade = 'A';
  else if (totalScore >= 80) grade = 'B';
  else if (totalScore >= 70) grade = 'C';
  else if (totalScore >= 60) grade = 'D';
  else grade = 'F';

  return { total: totalScore, grade, categories };
}

function computeAccessibilityScore(allMetrics: TechnicalMetrics[]): ScoreBreakdown['categories'][0] {
  let earned = 0;
  const issues: string[] = [];

  // Language attribute present (2 pts) — check homepage
  if (allMetrics[0].accessibility.hasLangAttribute) {
    earned += 2;
  } else {
    issues.push('missing lang attribute');
  }

  // Skip navigation link (2 pts) — check homepage
  if (allMetrics[0].accessibility.hasSkipNav) {
    earned += 2;
  } else {
    issues.push('no skip navigation link');
  }

  // Landmarks: <main> + <nav> present (3 pts)
  const hasMain = allMetrics.some((m) => m.accessibility.landmarks.main > 0);
  const hasNav = allMetrics.some((m) => m.accessibility.landmarks.nav > 0);
  if (hasMain && hasNav) earned += 3;
  else if (hasMain || hasNav) { earned += 1; issues.push(`missing ${hasMain ? '<nav>' : '<main>'} landmark`); }
  else issues.push('missing <main> and <nav> landmarks');

  // Form labels — % labeled across all pages (4 pts)
  const totalInputs = allMetrics.reduce((s, m) => s + m.accessibility.formLabels.total, 0);
  const totalLabeled = allMetrics.reduce((s, m) => s + m.accessibility.formLabels.labeled, 0);
  if (totalInputs === 0) {
    earned += 4; // No forms = no label issues
  } else {
    const labelPct = totalLabeled / totalInputs;
    const labelPts = Math.round(labelPct * 4);
    earned += labelPts;
    if (labelPts < 4) {
      const unlabeledCount = totalInputs - totalLabeled;
      issues.push(`${unlabeledCount} form input(s) without labels`);
    }
  }

  // No empty interactive elements (3 pts)
  const totalEmpty = allMetrics.reduce((s, m) => s + m.accessibility.emptyInteractives.length, 0);
  if (totalEmpty === 0) {
    earned += 3;
  } else {
    earned += Math.max(0, 3 - totalEmpty); // lose 1pt per empty element, min 0
    issues.push(`${totalEmpty} empty link(s)/button(s)`);
  }

  // No generic link text (2 pts)
  const totalGeneric = allMetrics.reduce((s, m) => s + m.accessibility.genericLinkText.length, 0);
  if (totalGeneric === 0) {
    earned += 2;
  } else {
    earned += Math.max(0, 2 - totalGeneric);
    issues.push(`${totalGeneric} generic link text ("click here", "read more")`);
  }

  // No positive tabindex (2 pts)
  const totalTabindex = allMetrics.reduce((s, m) => s + m.accessibility.positiveTabindex, 0);
  if (totalTabindex === 0) {
    earned += 2;
  } else {
    issues.push(`${totalTabindex} element(s) with positive tabindex`);
  }

  // No autoplay media (2 pts)
  const totalAutoplay = allMetrics.reduce((s, m) => s + m.accessibility.autoplayMedia, 0);
  if (totalAutoplay === 0) {
    earned += 2;
  } else {
    issues.push(`${totalAutoplay} auto-playing media without muted`);
  }

  earned = Math.max(0, Math.min(20, earned));

  const note = issues.length === 0
    ? 'No accessibility issues detected'
    : issues.slice(0, 3).join(', ');

  return { name: 'Accessibility', earned, possible: 20, note };
}

// ============================================
// EXECUTIVE SUMMARY (template-based, no AI)
// ============================================

function buildExecutiveSummary(score: ScoreBreakdown, allMetrics: TechnicalMetrics[]): string {
  const lines: string[] = [];

  // Opener based on grade
  switch (score.grade) {
    case 'A':
      lines.push('This site is in excellent shape. The fundamentals are solid and it\'s well-positioned to convert visitors.');
      break;
    case 'B':
      lines.push('This site has a strong foundation with a few areas that could be tightened up to improve performance.');
      break;
    case 'C':
      lines.push('This site covers the basics but has notable gaps that are likely costing it visitors and conversions.');
      break;
    case 'D':
      lines.push('This site needs significant work. Several key areas are underperforming and likely hurting first impressions.');
      break;
    case 'F':
      lines.push('This site has critical issues across multiple areas that need immediate attention before other improvements will matter.');
      break;
  }

  // Call out top issues (categories that lost the most points)
  const lostPoints = score.categories
    .map((c) => ({ ...c, lost: c.possible - c.earned }))
    .filter((c) => c.lost > 0)
    .sort((a, b) => b.lost - a.lost);

  if (lostPoints.length > 0) {
    const topIssues: string[] = [];
    for (const issue of lostPoints.slice(0, 3)) {
      if (issue.name === 'OG Tags' && issue.earned === 0) {
        topIssues.push('no Open Graph tags (social media shares will look broken)');
      } else if (issue.name === 'Heading Structure') {
        topIssues.push('heading hierarchy gaps that hurt SEO');
      } else if (issue.name === 'Content Depth' && issue.earned <= 5) {
        const avgWords = Math.round(allMetrics.reduce((s, m) => s + m.wordCount, 0) / allMetrics.length);
        topIssues.push(`thin content (avg ${avgWords} words/page)`);
      } else if (issue.name === 'Meta Tags') {
        topIssues.push('incomplete meta tags on some pages');
      } else if (issue.name === 'CTA Presence' && issue.earned < 7) {
        topIssues.push('too few clear calls-to-action');
      } else if (issue.name === 'H1 Consistency') {
        topIssues.push('inconsistent H1 usage');
      } else if (issue.name === 'Accessibility') {
        // Build specific a11y summary from the data
        const a11yParts: string[] = [];
        const unlabeledCount = allMetrics.reduce((s, m) => s + m.accessibility.formLabels.unlabeled.length, 0);
        if (unlabeledCount > 0) a11yParts.push(`missing form labels`);
        if (!allMetrics[0].accessibility.hasSkipNav) a11yParts.push(`skip navigation link`);
        if (!allMetrics[0].accessibility.hasLangAttribute) a11yParts.push(`lang attribute`);
        const emptyCount = allMetrics.reduce((s, m) => s + m.accessibility.emptyInteractives.length, 0);
        if (emptyCount > 0) a11yParts.push(`empty links/buttons`);
        topIssues.push(a11yParts.length > 0
          ? `accessibility gaps: ${a11yParts.join(', ')} (hurts screen reader users)`
          : 'accessibility issues detected');
      }
    }

    if (topIssues.length > 0) {
      lines.push(`The biggest opportunities: ${topIssues.join(', ')}.`);
    }
  }

  return lines.join(' ');
}

// ============================================
// DISPLAY RESULTS
// ============================================

function printSiteScorecard(allMetrics: TechnicalMetrics[], score: ScoreBreakdown) {
  const LINE = '─'.repeat(70);
  const homepage = allMetrics[0];

  report(`\n${LINE}`);
  report(`  SITE SCORE: ${score.total}/100 (${score.grade})`);
  report(`  ${allMetrics.length} pages crawled | ${homepage.https ? 'HTTPS ✓' : 'HTTPS ✗'}`);
  report(LINE);

  // Per-category score breakdown
  report();
  report('  Score Breakdown:');
  for (const cat of score.categories) {
    const bar = cat.earned === cat.possible ? '✓' : `${cat.earned}/${cat.possible}`;
    report(`    ${cat.name.padEnd(20)} ${bar.padStart(5)}  ${cat.note}`);
  }
  report();

  // Per-page summary table
  report('  PATH                      TITLE                                WORDS  H1  ALT');
  report('  ' + '─'.repeat(66));

  for (const m of allMetrics) {
    const path = new URL(m.url).pathname;
    const title = (m.title || 'NO TITLE').slice(0, 35);
    report(`  ${path.padEnd(26)} ${title.padEnd(37)} ${String(m.wordCount).padStart(5)}  ${String(m.h1Count).padStart(2)}  ${m.images.altCoverage}`);
  }

  report();

  // Site-wide meta coverage
  const pagesWithTitle = allMetrics.filter((m) => m.metaCompleteness.title).length;
  const pagesWithDesc = allMetrics.filter((m) => m.metaCompleteness.description).length;
  const pagesWithOg = allMetrics.filter((m) => m.metaCompleteness.ogTitle && m.metaCompleteness.ogImage).length;
  report(`  Meta Coverage:`);
  report(`    Title .............. ${pagesWithTitle}/${allMetrics.length} pages`);
  report(`    Description ........ ${pagesWithDesc}/${allMetrics.length} pages`);
  report(`    OG Tags ............ ${pagesWithOg}/${allMetrics.length} pages`);

  // Aggregate stats
  const totalWords = allMetrics.reduce((sum, m) => sum + m.wordCount, 0);
  const totalImages = allMetrics.reduce((sum, m) => sum + m.images.total, 0);
  const totalImagesWithAlt = allMetrics.reduce((sum, m) => sum + m.images.withAlt, 0);
  const totalSvgs = allMetrics.reduce((sum, m) => sum + m.images.svgCount, 0);
  const totalBgImages = allMetrics.reduce((sum, m) => sum + m.images.bgImageCount, 0);
  const totalPictures = allMetrics.reduce((sum, m) => sum + m.images.pictureCount, 0);
  const allCtas = [...new Set(allMetrics.flatMap((m) => m.ctas))];

  report();
  report(`  Totals:`);
  report(`    Total Words ........ ${totalWords}`);
  const imgParts = [`${totalImages} <img>`];
  if (totalSvgs > 0) imgParts.push(`${totalSvgs} SVG`);
  if (totalBgImages > 0) imgParts.push(`${totalBgImages} bg-image`);
  if (totalPictures > 0) imgParts.push(`${totalPictures} <picture>`);
  report(`    Visual Assets ...... ${imgParts.join(' | ')}${totalImages > 0 ? ` (${Math.round((totalImagesWithAlt / totalImages) * 100)}% <img> alt text)` : ''}`);
  report(`    Unique CTAs ........ ${allCtas.length}`);

  if (allCtas.length > 0) {
    allCtas.slice(0, 10).forEach((cta) => {
      report(`      → "${cta}"`);
    });
  }

  // Heading hierarchy issues across all pages
  const allGaps = allMetrics.flatMap((m) =>
    m.headingHierarchyGaps.map((gap) => `${new URL(m.url).pathname}: ${gap}`)
  );
  if (allGaps.length > 0) {
    report();
    report(`  Heading Hierarchy Issues:`);
    allGaps.forEach((gap) => report(`    ⚠ ${gap}`));
  }

  // Accessibility issues across all pages
  const a11yIssues: string[] = [];
  if (!allMetrics[0].accessibility.hasLangAttribute) {
    a11yIssues.push('Missing lang attribute on <html>');
  }
  if (!allMetrics[0].accessibility.hasSkipNav) {
    a11yIssues.push('No skip navigation link');
  }
  if (!allMetrics.some((m) => m.accessibility.landmarks.main > 0)) {
    a11yIssues.push('No <main> landmark');
  }
  if (!allMetrics.some((m) => m.accessibility.landmarks.nav > 0)) {
    a11yIssues.push('No <nav> landmark');
  }
  const totalUnlabeled = allMetrics.reduce((s, m) => s + m.accessibility.formLabels.unlabeled.length, 0);
  if (totalUnlabeled > 0) {
    a11yIssues.push(`${totalUnlabeled} form input(s) without labels`);
  }
  const totalEmpty = allMetrics.reduce((s, m) => s + m.accessibility.emptyInteractives.length, 0);
  if (totalEmpty > 0) {
    a11yIssues.push(`${totalEmpty} empty link(s)/button(s) (no text or aria-label)`);
  }
  const totalGenericLinks = allMetrics.reduce((s, m) => s + m.accessibility.genericLinkText.length, 0);
  if (totalGenericLinks > 0) {
    a11yIssues.push(`${totalGenericLinks} generic link text ("click here", "read more")`);
  }
  const totalPosTab = allMetrics.reduce((s, m) => s + m.accessibility.positiveTabindex, 0);
  if (totalPosTab > 0) {
    a11yIssues.push(`${totalPosTab} element(s) with positive tabindex (disrupts tab order)`);
  }
  const totalAutoplayMedia = allMetrics.reduce((s, m) => s + m.accessibility.autoplayMedia, 0);
  if (totalAutoplayMedia > 0) {
    a11yIssues.push(`${totalAutoplayMedia} auto-playing media without muted attribute`);
  }
  const totalMissingAuto = allMetrics.reduce((s, m) => s + m.accessibility.missingAutocomplete.length, 0);
  if (totalMissingAuto > 0) {
    a11yIssues.push(`${totalMissingAuto} personal data input(s) missing autocomplete`);
  }
  const totalEmptyAlt = allMetrics.reduce((s, m) => s + m.accessibility.altTextIssues.emptyAlt, 0);
  const totalLongAlt = allMetrics.reduce((s, m) => s + m.accessibility.altTextIssues.longAlt, 0);
  if (totalEmptyAlt > 0) {
    a11yIssues.push(`${totalEmptyAlt} content image(s) with empty alt text`);
  }
  if (totalLongAlt > 0) {
    a11yIssues.push(`${totalLongAlt} image(s) with alt text > 125 characters`);
  }

  if (a11yIssues.length > 0) {
    report();
    report(`  Accessibility Issues:`);
    a11yIssues.forEach((issue) => report(`    ⚠ ${issue}`));
  } else {
    report();
    report(`  Accessibility: No issues detected ✓`);
  }

  report(LINE);
}

// ============================================
// MAIN
// ============================================

async function reviewSite(url: string) {
  report(`\n${'═'.repeat(70)}`);
  report(`  Reviewing: ${url}`);
  report(`${'═'.repeat(70)}`);

  // Step 1: Fetch homepage HTML
  process.stdout.write('  Fetching homepage... ');
  const { html: homepageHtml, status: homepageStatus } = await fetchHTML(url);
  progress(`  Fetching homepage... done (${homepageStatus}, ${Math.round(homepageHtml.length / 1024)}KB)`);

  // Step 2: Discover pages from nav/header/footer links
  process.stdout.write('  Discovering nav pages... ');
  const pageUrls = discoverNavPages(homepageHtml, url);
  progress(`  Discovering nav pages... found ${pageUrls.length} pages`);
  pageUrls.forEach((p) => progress(`    → ${new URL(p).pathname}`));

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
      progress(`  Processing ${path}... done (${metrics.wordCount} words, ${content.length} chars)`);
    } catch (err) {
      progress(`  Processing ${path}... FAILED: ${err instanceof Error ? err.message : err}`);
    }
  }

  if (pages.length === 0) {
    progress('  No pages could be processed. Aborting.');
    return;
  }

  // Step 4: Compute score, executive summary, and scorecard
  const allPageMetrics = pages.map((p) => p.metrics);
  const score = computeSiteScore(allPageMetrics);

  // Executive summary — printed first for at-a-glance orientation
  const LINE = '─'.repeat(70);
  report(`\n${LINE}`);
  report(`  EXECUTIVE SUMMARY`);
  report(LINE);
  report();
  report(`  ${buildExecutiveSummary(score, allPageMetrics)}`);
  report();

  printSiteScorecard(allPageMetrics, score);

  // Step 5: Build combined content for AI
  const combinedContent = pages.map((p) => {
    const path = new URL(p.url).pathname;
    return `PAGE: ${path}\n[title] ${p.metrics.title || 'No title'}\n[content]\n${p.content}`;
  }).join('\n\n---\n\n');

  progress(`\n  Combined content for AI: ${combinedContent.length} chars across ${pages.length} pages`);

  // Step 6: AI analysis
  const model = process.env.NEXT_PUBLIC_CHATBOT_MODEL || 'gpt-4.1-nano';
  process.stdout.write(`  Running AI analysis (${model})... `);
  const startTime = performance.now();

  const { text, usage } = await generateText({
    model: openai(model),
    system: buildEvaluationPrompt(allPageMetrics, score),
    messages: [{ role: 'user', content: `Here is the visible content from all pages on ${url}:\n\n${combinedContent}` }],
    temperature: 0.3,
    maxOutputTokens: 2000,
  });

  const elapsed = Math.round(performance.now() - startTime);
  progress(`  Running AI analysis (${model})... done (${elapsed}ms)`);

  if (usage?.inputTokens) {
    progress(`  Tokens: ${usage.inputTokens} in / ${usage.outputTokens} out`);
  }

  // Step 7: Print AI analysis
  report(`\n${LINE}`);
  report(`  AI SITE ANALYSIS`);
  report(LINE);
  report(text);
  report(LINE);
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
  report('═'.repeat(70));
  report('  AI Website Reviewer — V4');
  report(`  Model: ${model}`);
  report(`  Sites: ${urls.length}`);
  report(`  Time: ${new Date().toISOString()}`);
  report('═'.repeat(70));

  for (const url of urls) {
    try {
      await reviewSite(url);
    } catch (err) {
      report(`\n  ERROR reviewing ${url}: ${err instanceof Error ? err.message : err}`);
    }
  }

  report(`\n${'═'.repeat(70)}`);
  report('  Done.');
  report('═'.repeat(70));

  // Write report (clean deliverable) to file
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);
  const outputPath = join(__dirname, 'review-output.txt');
  writeFileSync(outputPath, reportLines.join('\n'), 'utf-8');
  console.log(`\n  Report saved to: ${outputPath}`);
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
