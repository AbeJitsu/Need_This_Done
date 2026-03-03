/**
 * Site Analyzer Library
 *
 * Core analysis engine extracted from the CLI prototype. Importable by
 * API routes, scripts, and any other consumer.
 *
 * Uses cheerio for HTML parsing — lightweight, serverless-compatible,
 * no native dependencies. Replaced jsdom which fails on Vercel due to
 * ESM/CJS incompatibilities with parse5.
 */

import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';
import * as cheerio from 'cheerio';
import type { Element as DomElement } from 'domhandler';

// ============================================
// TYPES
// ============================================

export interface AccessibilityMetrics {
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

export interface TechnicalMetrics {
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

export interface ScoreBreakdown {
  total: number;
  grade: string;
  categories: { name: string; earned: number; possible: number; note: string }[];
}

export interface SiteReport {
  url: string;
  score: number;
  grade: string;
  categories: ScoreBreakdown['categories'];
  executiveSummary: string;
  aiAnalysis: string;
  metrics: TechnicalMetrics[];
  pagesCrawled: number;
}

interface PageData {
  url: string;
  metrics: TechnicalMetrics;
  content: string;
}

// Cheerio's loaded document type
type CheerioAPI = ReturnType<typeof cheerio.load>;

// ============================================
// HTML FETCHING
// ============================================

export async function fetchHTML(url: string): Promise<{ html: string; status: number }> {
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'NeedThisDone-SiteReviewer/1.0',
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

const INLINE_TAGS = new Set([
  'span', 'a', 'em', 'strong', 'b', 'i', 'u', 'mark', 'small', 'sub', 'sup',
  'abbr', 'cite', 'code', 'kbd', 'samp', 'var', 'time', 'data', 'label',
]);

/**
 * Extract clean text from a cheerio element, walking child nodes.
 * Equivalent to the old jsdom getCleanText but uses cheerio's node tree.
 */
export function getCleanText($: CheerioAPI, el: DomElement): string {
  const parts: string[] = [];

  for (const child of el.childNodes) {
    if (child.type === 'text') {
      const text = (child as any).data || '';
      if (text.trim()) parts.push(text.trim());
    } else if (child.type === 'tag') {
      const tag = (child as DomElement).tagName.toLowerCase();
      if (tag === 'br') {
        parts.push(' ');
      } else {
        const childText = getCleanText($, child as DomElement);
        if (childText) parts.push(childText);
      }
    }
  }

  return parts.join(' ').replace(/\s+/g, ' ').trim();
}

// ============================================
// READABILITY (Flesch-Kincaid approximation)
// ============================================

function countSyllables(word: string): number {
  word = word.toLowerCase().replace(/[^a-z]/g, '');
  if (word.length <= 3) return 1;
  word = word.replace(/e$/, '');
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

  const grade = 0.39 * avgWordsPerSentence + 11.8 * avgSyllablesPerWord - 15.59;
  const clampedGrade = Math.max(1, Math.min(18, Math.round(grade)));

  if (clampedGrade <= 6) return `Grade ${clampedGrade} (Easy — great for general audience)`;
  if (clampedGrade <= 8) return `Grade ${clampedGrade} (Conversational — good for most websites)`;
  if (clampedGrade <= 12) return `Grade ${clampedGrade} (Moderate — may lose some readers)`;
  return `Grade ${clampedGrade} (Complex — consider simplifying)`;
}

// ============================================
// CONTENT EXTRACTION (cheerio-based)
// ============================================

export function extractMetrics(html: string, url: string, httpStatus: number): TechnicalMetrics {
  const $ = cheerio.load(html);
  const parsedUrl = new URL(url);

  // Title & meta tags
  const title = $('title').text().trim() || null;
  const metaDescription = $('meta[name="description"]').attr('content') || null;
  const hasViewportMeta = $('meta[name="viewport"]').length > 0;
  const ogTitle = $('meta[property="og:title"]').attr('content') || null;
  const ogDescription = $('meta[property="og:description"]').attr('content') || null;
  const ogImage = $('meta[property="og:image"]').attr('content') || null;

  // Headings
  const headings: { tag: string; text: string }[] = [];
  $('h1, h2, h3, h4, h5, h6').each((_, el) => {
    const text = getCleanText($, el);
    if (text) headings.push({ tag: el.tagName.toLowerCase(), text });
  });

  const h1Count = headings.filter((h) => h.tag === 'h1').length;

  // Heading hierarchy gap detection
  const headingHierarchyGaps: string[] = [];
  for (let i = 1; i < headings.length; i++) {
    const prevLevel = parseInt(headings[i - 1].tag[1]);
    const currLevel = parseInt(headings[i].tag[1]);
    if (currLevel > prevLevel + 1) {
      headingHierarchyGaps.push(`${headings[i - 1].tag} → ${headings[i].tag} (skipped ${currLevel - prevLevel - 1} level(s))`);
    }
  }

  // Images
  const allImages = $('img').toArray();
  const withAlt = allImages.filter((img) => {
    const alt = $(img).attr('alt');
    return alt && alt.trim().length > 0;
  });
  const svgCount = $('svg').length;
  const pictureCount = $('picture').length;
  let bgImageCount = 0;
  $('[style]').each((_, el) => {
    const style = $(el).attr('style') || '';
    if (/background(-image)?\s*:/.test(style) && style.includes('url(')) {
      bgImageCount++;
    }
  });

  // Links
  let internalCount = 0;
  let externalCount = 0;

  $('a[href]').each((_, a) => {
    const href = $(a).attr('href') || '';
    if (href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) return;
    try {
      const linkUrl = new URL(href, url);
      if (linkUrl.hostname === parsedUrl.hostname) {
        internalCount++;
      } else {
        externalCount++;
      }
    } catch {
      internalCount++;
    }
  });

  // Visible text content — clone body, strip non-content elements
  const $clone = $.load($('body').html() || '');
  $clone('script, style, noscript, svg, nav').remove();
  const visibleText = $clone.text().replace(/\s+/g, ' ').trim();
  const wordCount = visibleText.split(/\s+/).filter((w) => w.length > 0).length;

  const readingLevel = computeReadingLevel(visibleText);

  // ── Accessibility checks (WCAG 2.1 AA, static HTML only) ──

  const langValue = $('html').attr('lang')?.trim() || null;
  const hasLangAttribute = !!langValue;

  const hasSkipNav = $('a[href^="#main"], a[href^="#content"], a[href="#skip"], a.skip-nav, a.skip-link, [class*="skip-to"]').length > 0;

  const landmarks = {
    main: $('main, [role="main"]').length,
    nav: $('nav, [role="navigation"]').length,
    header: $('header, [role="banner"]').length,
    footer: $('footer, [role="contentinfo"]').length,
    complementary: $('aside, [role="complementary"]').length,
  };

  const formInputSelector = 'input:not([type="hidden"]):not([type="submit"]):not([type="button"]):not([type="reset"]), select, textarea';
  const formInputs = $(formInputSelector).toArray();
  const unlabeledInputs: string[] = [];
  formInputs.forEach((input) => {
    const id = $(input).attr('id');
    const hasLabel = !!(
      $(input).attr('aria-label') ||
      $(input).attr('aria-labelledby') ||
      $(input).attr('title') ||
      (id && $(`label[for="${id}"]`).length > 0) ||
      $(input).closest('label').length > 0
    );
    if (!hasLabel) {
      const type = $(input).attr('type') || input.tagName.toLowerCase();
      const name = $(input).attr('name') || $(input).attr('placeholder') || 'unnamed';
      unlabeledInputs.push(`${type}[${name}]`);
    }
  });
  const formLabels = { total: formInputs.length, labeled: formInputs.length - unlabeledInputs.length, unlabeled: unlabeledInputs };

  const emptyInteractives: string[] = [];
  $('a[href], button, [role="button"], [role="link"]').each((_, el) => {
    const text = getCleanText($, el).trim();
    const ariaLabel = $(el).attr('aria-label')?.trim();
    const ariaLabelledBy = $(el).attr('aria-labelledby');
    const hasImgAlt = $(el).find('img[alt]:not([alt=""])').length > 0;
    const hasSvgTitle = $(el).find('svg title').length > 0;
    if (!text && !ariaLabel && !ariaLabelledBy && !hasImgAlt && !hasSvgTitle) {
      const tag = el.tagName.toLowerCase();
      const href = $(el).attr('href') || '';
      const cls = ($(el).attr('class') || '').split(' ').slice(0, 2).join('.');
      emptyInteractives.push(`<${tag}${cls ? '.' + cls : ''}${href ? ' href="' + href.slice(0, 40) + '"' : ''}>`);
    }
  });

  const GENERIC_PATTERNS = /^(click here|here|read more|learn more|more|link|go|continue|details|info)$/i;
  const genericLinkText: string[] = [];
  $('a[href]').each((_, a) => {
    const text = getCleanText($, a).trim();
    if (GENERIC_PATTERNS.test(text)) {
      const href = $(a).attr('href') || '';
      genericLinkText.push(`"${text}" → ${href.slice(0, 50)}`);
    }
  });

  let positiveTabindex = 0;
  $('[tabindex]').each((_, el) => {
    const val = parseInt($(el).attr('tabindex') || '0', 10);
    if (val > 0) positiveTabindex++;
  });

  const AUTOCOMPLETE_TYPES = new Set(['text', 'email', 'tel', 'url', 'search']);
  const PERSONAL_NAMES = /\b(name|email|phone|tel|address|city|state|zip|postal|country|street)\b/i;
  const missingAutocomplete: string[] = [];
  formInputs.forEach((input) => {
    const type = $(input).attr('type') || 'text';
    const name = $(input).attr('name') || '';
    const id = $(input).attr('id') || '';
    if (AUTOCOMPLETE_TYPES.has(type) && PERSONAL_NAMES.test(name + ' ' + id)) {
      if (!$(input).attr('autocomplete')) {
        missingAutocomplete.push(`${type}[${name || id}]`);
      }
    }
  });

  let autoplayMedia = 0;
  $('video[autoplay], audio[autoplay]').each((_, el) => {
    if (!$(el).attr('muted')) autoplayMedia++;
  });

  let emptyAlt = 0;
  let longAlt = 0;
  allImages.forEach((img) => {
    const alt = $(img).attr('alt');
    if (alt === '') {
      const src = $(img).attr('src') || '';
      const isLikelyContent = $(img).attr('role') === 'img' || /logo|hero|product|team|photo/i.test(src);
      if (isLikelyContent) emptyAlt++;
    } else if (alt && alt.length > 125) {
      longAlt++;
    }
  });

  const accessibility: AccessibilityMetrics = {
    hasLangAttribute, langValue, hasSkipNav, landmarks, formLabels,
    emptyInteractives, genericLinkText, positiveTabindex, autoplayMedia,
    missingAutocomplete, altTextIssues: { emptyAlt, longAlt },
  };

  // CTA detection
  const ctas: string[] = [];
  const ctaSelectors = 'a, button, [role="button"]';
  $(ctaSelectors).each((_, el) => {
    let text = getCleanText($, el);
    if (text.length > 2 && text.length < 80) {
      if (text.includes('?')) return;
      if (text.split(/\s+/).length > 10) return;
      text = text.replace(/^\d+\s+/, '');
      const actionWords = /\b(get|start|book|schedule|contact|buy|order|sign up|join|try|learn|download|request|claim|grab|reserve)\b/i;
      if (actionWords.test(text)) {
        ctas.push(text);
      }
    }
  });

  return {
    url, httpStatus,
    https: parsedUrl.protocol === 'https:',
    title, metaDescription, hasViewportMeta, wordCount, readingLevel,
    headings, h1Count, headingHierarchyGaps,
    images: {
      total: allImages.length, withAlt: withAlt.length,
      withoutAlt: allImages.length - withAlt.length,
      altCoverage: allImages.length > 0
        ? `${Math.round((withAlt.length / allImages.length) * 100)}%`
        : 'N/A (no <img>)',
      svgCount, bgImageCount, pictureCount,
    },
    links: { internal: internalCount, external: externalCount, total: internalCount + externalCount },
    ctas: Array.from(new Set(ctas)),
    metaCompleteness: {
      title: !!title, description: !!metaDescription, viewport: hasViewportMeta,
      ogTitle: !!ogTitle, ogDescription: !!ogDescription, ogImage: !!ogImage,
    },
    accessibility,
  };
}

// ============================================
// EXTRACT VISIBLE TEXT FOR AI PROMPT
// ============================================

export function extractVisibleContent(html: string, _url: string, maxChars: number = 2000): string {
  const $ = cheerio.load(html);

  // Remove non-content elements
  $('script, style, noscript, svg, iframe, template').remove();

  const parts: string[] = [];

  function walk(node: any) {
    if (node.type === 'text') {
      const text = (node.data || '').trim();
      if (text) parts.push(text);
      return;
    }

    if (node.type !== 'tag') return;

    const tag = node.tagName.toLowerCase();

    const style = $(node).attr('style') || '';
    if (style.includes('display: none') || style.includes('display:none')) return;
    if (style.includes('visibility: hidden') || style.includes('visibility:hidden')) return;

    if (tag === 'br') { parts.push('\n'); return; }

    if (/^h[1-6]$/.test(tag)) {
      const text = getCleanText($, node);
      if (text) { parts.push(`\n\n[${tag.toUpperCase()}] ${text}\n`); return; }
    }

    const isBlock = ['p', 'div', 'section', 'article', 'li', 'tr', 'blockquote', 'header', 'footer', 'main', 'aside', 'figure'].includes(tag);

    if (isBlock) parts.push('\n');
    if (INLINE_TAGS.has(tag)) parts.push(' ');

    for (const child of node.childNodes || []) { walk(child); }

    if (isBlock) parts.push('\n');
  }

  const body = $('body')[0];
  if (body) {
    for (const child of body.childNodes) { walk(child); }
  }

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

export function discoverNavPages(html: string, baseUrl: string): string[] {
  const $ = cheerio.load(html);
  const parsedBase = new URL(baseUrl);

  const seen = new Set<string>();
  const pages: string[] = [];

  const homepageUrl = `${parsedBase.origin}/`;
  seen.add(homepageUrl);
  pages.push(homepageUrl);

  const SKIP_PATHS = new Set(['/cart', '/wishlist', '/checkout', '/login', '/signup', '/register', '/privacy', '/terms', '/cookie-policy']);

  $('header, nav, footer').find('a[href]').each((_, a) => {
    const href = $(a).attr('href') || '';
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
    } catch {
      // Malformed URL — skip
    }
  });

  return pages;
}

// ============================================
// AI EVALUATION PROMPT
// ============================================

export function buildTechnicalFindings(allMetrics: TechnicalMetrics[], score: ScoreBreakdown): string {
  const lines: string[] = [];
  lines.push(`- Overall Score: ${score.total}/100 (${score.grade})`);

  for (const cat of score.categories) {
    if (cat.earned < cat.possible) {
      lines.push(`- ${cat.name}: ${cat.note}`);
    }
  }

  const allGaps = allMetrics.flatMap((m) =>
    m.headingHierarchyGaps.map((gap) => `${new URL(m.url).pathname}: ${gap}`)
  );
  if (allGaps.length > 0) {
    lines.push(`- Heading Gaps: ${allGaps.join(', ')}`);
  }

  const readabilities = allMetrics.map((m) => {
    const path = new URL(m.url).pathname;
    return `${path} ${m.readingLevel}`;
  });
  lines.push(`- Readability: ${readabilities.join(', ')}`);

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

export function buildEvaluationPrompt(allMetrics: TechnicalMetrics[], score: ScoreBreakdown): string {
  const homepage = allMetrics[0];
  const totalPages = allMetrics.length;

  const perPageSummary = allMetrics.map((m) => {
    const path = new URL(m.url).pathname;
    const gradeMatch = m.readingLevel.match(/Grade (\d+)/);
    const readGrade = gradeMatch ? `G${gradeMatch[1]}` : 'N/A';
    return `  ${path.padEnd(25)} | ${(m.title || 'NO TITLE').slice(0, 30).padEnd(30)} | ${String(m.wordCount).padStart(5)} words | H1: ${m.h1Count} | Read: ${readGrade}`;
  }).join('\n');

  const allCtas = Array.from(new Set(allMetrics.flatMap((m) => m.ctas)));
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

function computeAccessibilityScore(allMetrics: TechnicalMetrics[]): ScoreBreakdown['categories'][0] {
  let earned = 0;
  const issues: string[] = [];

  if (allMetrics[0].accessibility.hasLangAttribute) { earned += 2; } else { issues.push('missing lang attribute'); }
  if (allMetrics[0].accessibility.hasSkipNav) { earned += 2; } else { issues.push('no skip navigation link'); }

  const hasMain = allMetrics.some((m) => m.accessibility.landmarks.main > 0);
  const hasNav = allMetrics.some((m) => m.accessibility.landmarks.nav > 0);
  if (hasMain && hasNav) earned += 3;
  else if (hasMain || hasNav) { earned += 1; issues.push(`missing ${hasMain ? '<nav>' : '<main>'} landmark`); }
  else issues.push('missing <main> and <nav> landmarks');

  const totalInputs = allMetrics.reduce((s, m) => s + m.accessibility.formLabels.total, 0);
  const totalLabeled = allMetrics.reduce((s, m) => s + m.accessibility.formLabels.labeled, 0);
  if (totalInputs === 0) { earned += 4; }
  else {
    const labelPts = Math.round((totalLabeled / totalInputs) * 4);
    earned += labelPts;
    if (labelPts < 4) issues.push(`${totalInputs - totalLabeled} form input(s) without labels`);
  }

  const totalEmpty = allMetrics.reduce((s, m) => s + m.accessibility.emptyInteractives.length, 0);
  if (totalEmpty === 0) { earned += 3; }
  else { earned += Math.max(0, 3 - totalEmpty); issues.push(`${totalEmpty} empty link(s)/button(s)`); }

  const totalGeneric = allMetrics.reduce((s, m) => s + m.accessibility.genericLinkText.length, 0);
  if (totalGeneric === 0) { earned += 2; }
  else { earned += Math.max(0, 2 - totalGeneric); issues.push(`${totalGeneric} generic link text ("click here", "read more")`); }

  const totalTabindex = allMetrics.reduce((s, m) => s + m.accessibility.positiveTabindex, 0);
  if (totalTabindex === 0) { earned += 2; } else { issues.push(`${totalTabindex} element(s) with positive tabindex`); }

  const totalAutoplay = allMetrics.reduce((s, m) => s + m.accessibility.autoplayMedia, 0);
  if (totalAutoplay === 0) { earned += 2; } else { issues.push(`${totalAutoplay} auto-playing media without muted`); }

  earned = Math.max(0, Math.min(20, earned));

  const note = issues.length === 0
    ? 'No accessibility issues detected'
    : issues.slice(0, 3).join(', ');

  return { name: 'Accessibility', earned, possible: 20, note };
}

export function computeSiteScore(allMetrics: TechnicalMetrics[]): ScoreBreakdown {
  const total = allMetrics.length;
  const categories: ScoreBreakdown['categories'] = [];

  const httpsScore = allMetrics[0].https ? 5 : 0;
  categories.push({ name: 'HTTPS', earned: httpsScore, possible: 5, note: httpsScore === 5 ? 'Secure' : 'Not secure — visitors see a warning' });

  const pagesWithMeta = allMetrics.filter((m) => m.metaCompleteness.title && m.metaCompleteness.description).length;
  const metaScore = Math.round((pagesWithMeta / total) * 10);
  categories.push({ name: 'Meta Tags', earned: metaScore, possible: 10, note: `${pagesWithMeta}/${total} pages have title + description` });

  const pagesWithOg = allMetrics.filter((m) => m.metaCompleteness.ogTitle && m.metaCompleteness.ogImage).length;
  const ogScore = Math.round((pagesWithOg / total) * 10);
  categories.push({ name: 'OG Tags', earned: ogScore, possible: 10, note: `${pagesWithOg}/${total} pages — social shares ${pagesWithOg === 0 ? 'look broken' : pagesWithOg < total ? 'partially covered' : 'look great'}` });

  const pagesWithGaps = allMetrics.filter((m) => m.headingHierarchyGaps.length > 0).length;
  const headingScore = Math.max(0, 10 - (2 * pagesWithGaps));
  categories.push({ name: 'Heading Structure', earned: headingScore, possible: 10, note: pagesWithGaps === 0 ? 'Clean hierarchy on all pages' : `${pagesWithGaps} page(s) have heading gaps` });

  const avgWords = Math.round(allMetrics.reduce((sum, m) => sum + m.wordCount, 0) / total);
  let contentScore: number;
  if (avgWords >= 400) contentScore = 10;
  else if (avgWords >= 200) contentScore = 7;
  else if (avgWords >= 100) contentScore = 4;
  else contentScore = 0;
  categories.push({ name: 'Content Depth', earned: contentScore, possible: 10, note: `Avg ${avgWords} words/page` });

  const uniqueCtas = Array.from(new Set(allMetrics.flatMap((m) => m.ctas)));
  const ctaScore = Math.round(Math.min(uniqueCtas.length / 3, 1) * 10);
  categories.push({ name: 'CTA Presence', earned: ctaScore, possible: 10, note: `${uniqueCtas.length} unique CTAs detected` });

  const pagesWithOneH1 = allMetrics.filter((m) => m.h1Count === 1).length;
  const h1Score = Math.round((pagesWithOneH1 / total) * 5);
  categories.push({ name: 'H1 Consistency', earned: h1Score, possible: 5, note: `${pagesWithOneH1}/${total} pages have exactly 1 H1` });

  const coverageScore = Math.round(Math.min(total / 5, 1) * 10);
  categories.push({ name: 'Page Coverage', earned: coverageScore, possible: 10, note: `${total} pages crawled` });

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

// ============================================
// EXECUTIVE SUMMARY (template-based, no AI)
// ============================================

export function buildExecutiveSummary(score: ScoreBreakdown, allMetrics: TechnicalMetrics[]): string {
  const lines: string[] = [];

  switch (score.grade) {
    case 'A': lines.push('This site is in excellent shape. The fundamentals are solid and it\'s well-positioned to convert visitors.'); break;
    case 'B': lines.push('This site has a strong foundation with a few areas that could be tightened up to improve performance.'); break;
    case 'C': lines.push('This site covers the basics but has notable gaps that are likely costing it visitors and conversions.'); break;
    case 'D': lines.push('This site needs significant work. Several key areas are underperforming and likely hurting first impressions.'); break;
    case 'F': lines.push('This site has critical issues across multiple areas that need immediate attention before other improvements will matter.'); break;
  }

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
        const a11yParts: string[] = [];
        const unlabeledCount = allMetrics.reduce((s, m) => s + m.accessibility.formLabels.unlabeled.length, 0);
        if (unlabeledCount > 0) a11yParts.push('missing form labels');
        if (!allMetrics[0].accessibility.hasSkipNav) a11yParts.push('skip navigation link');
        if (!allMetrics[0].accessibility.hasLangAttribute) a11yParts.push('lang attribute');
        const emptyCount = allMetrics.reduce((s, m) => s + m.accessibility.emptyInteractives.length, 0);
        if (emptyCount > 0) a11yParts.push('empty links/buttons');
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
// ORCHESTRATOR — Full site analysis
// ============================================

export async function analyzeSite(url: string, onProgress?: (msg: string) => void): Promise<SiteReport> {
  const log = onProgress || (() => {});

  // 1. Fetch homepage
  log('Fetching homepage...');
  const { html: homepageHtml, status: homepageStatus } = await fetchHTML(url);

  // 2. Discover nav pages
  log('Discovering pages...');
  const pageUrls = discoverNavPages(homepageHtml, url);
  log(`Found ${pageUrls.length} pages`);

  // 3. Fetch + extract metrics for each page
  const pages: PageData[] = [];

  for (const pageUrl of pageUrls) {
    const path = new URL(pageUrl).pathname;
    log(`Analyzing ${path}...`);

    try {
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
    } catch {
      log(`Failed to process ${path}`);
    }
  }

  if (pages.length === 0) {
    throw new Error('No pages could be processed');
  }

  // 4. Compute score
  const allMetrics = pages.map((p) => p.metrics);
  const score = computeSiteScore(allMetrics);

  // 5. Build executive summary
  const executiveSummary = buildExecutiveSummary(score, allMetrics);

  // 6. Run AI analysis
  log('Running AI analysis...');
  const model = process.env.NEXT_PUBLIC_CHATBOT_MODEL || 'gpt-4.1-nano';

  const combinedContent = pages.map((p) => {
    const path = new URL(p.url).pathname;
    return `PAGE: ${path}\n[title] ${p.metrics.title || 'No title'}\n[content]\n${p.content}`;
  }).join('\n\n---\n\n');

  const { text: aiAnalysis } = await generateText({
    model: openai(model),
    system: buildEvaluationPrompt(allMetrics, score),
    messages: [{ role: 'user', content: `Here is the visible content from all pages on ${url}:\n\n${combinedContent}` }],
    temperature: 0.3,
    maxOutputTokens: 2000,
  });

  // 7. Return structured result
  return {
    url,
    score: score.total,
    grade: score.grade,
    categories: score.categories,
    executiveSummary,
    aiAnalysis,
    metrics: allMetrics,
    pagesCrawled: pages.length,
  };
}
