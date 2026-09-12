import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  acceptPublicGeneratedCopy,
  findLongPublicSentences,
  hasBannedPublicReportTerm,
  isPublicCopyWithinLimit,
  isPublicCopyWithinHardLimit,
  PUBLIC_CORE_PROMISE,
  PUBLIC_REPORT_FALLBACK,
} from '@/lib/public-copy';
import { PUBLIC_EXAMPLES, PUBLIC_OFFERS } from '@/lib/public-offers';
import { RETAINED_ARTICLE_COPY } from '@/lib/public-article-copy';
import { defaultFAQContent, defaultPrivacyContent, defaultTermsContent } from '@/lib/default-page-content';
import { getRetiredBlogDestination, listBlogPosts } from '@/lib/blog-content';
import {
  buildDeterministicAnalysis,
  buildExecutiveSummary,
  computeSiteScore,
  extractMetrics,
} from '@/lib/site-analyzer';

const appRoot = resolve(__dirname, '..');
const readApp = (path: string) => readFileSync(resolve(appRoot, path), 'utf8');

function textValues(value: unknown): string[] {
  if (typeof value === 'string') return [value];
  if (Array.isArray(value)) return value.flatMap(textValues);
  if (value && typeof value === 'object') return Object.values(value).flatMap(textValues);
  return [];
}

describe('public language contract', () => {
  it('keeps the core promise centralized and within the sentence target', () => {
    expect(PUBLIC_CORE_PROMISE).toBe(
      'NeedThisDone helps teams and individuals solve technology problems and simplify repeated work with clear, focused solutions.',
    );
    expect(isPublicCopyWithinLimit(PUBLIC_CORE_PROMISE)).toBe(true);
  });

  it('keeps the retired narrow brand promise out of active public copy', () => {
    const retiredPromise = 'NeedThisDone helps owners and founders fix one website problem or one repeated task.';
    const activePublicSources = [
      'lib/public-copy.ts',
      'components/home/HomePageClient.tsx',
      'components/services/ServicesPageClient.tsx',
      'components/public/OfferPage.tsx',
      'app/how-it-works/page.tsx',
      'app/about/page.tsx',
      'app/contact/page.tsx',
      'components/faq/FAQPageClient.tsx',
      'lib/page-config.ts',
    ].map(readApp).join('\n');

    expect(activePublicSources).not.toContain(retiredPromise);
  });

  it('keeps the future-work reassurance in the FAQ defaults', () => {
    expect(defaultFAQContent.items).toContainEqual({
      question: 'Can we discuss another piece of work later?',
      answer: 'We start with one clear piece so you can see what you are agreeing to. If something else would help, we can discuss it separately.',
    });
  });

  it('keeps retained article copy to short sentences while preserving code blocks', () => {
    for (const article of Object.values(RETAINED_ARTICLE_COPY)) {
      for (const field of [article.title, article.excerpt, article.meta_title, article.meta_description, article.content]) {
        expect(findLongPublicSentences(field)).toEqual([]);
      }
    }
  });

  it('serves the reviewed copy for all three retained article routes', () => {
    const posts = listBlogPosts();
    expect(posts.map((post) => post.slug)).toEqual([
      'rewriting-copy-plain-language',
      'loading-tricks-feel-instant',
      'ai-context-budget-tips',
    ]);
    expect(posts.map((post) => post.title)).toEqual([
      'Plain-Language Copy Helps People Understand Technical Work',
      '4 Loading Tricks That Make a Site Feel Faster',
      'A Smaller AI Brief Works Better',
    ]);
  });

  it('keeps legal and offer copy readable', () => {
    const legalCopy = [
      ...textValues(defaultPrivacyContent),
      ...textValues(defaultTermsContent),
    ];
    for (const value of legalCopy) expect(findLongPublicSentences(value)).toEqual([]);
    for (const offer of Object.values(PUBLIC_OFFERS)) {
      expect(findLongPublicSentences(`${offer.fit} ${offer.summary}`)).toEqual([]);
    }
  });

  it('rejects unsafe or overlong generated report prose', () => {
    const long = 'This sentence has more than twenty words because generated report copy must stay short and clear for owners reading a limited website snapshot today.';
    expect(findLongPublicSentences(long)[0].words).toBeGreaterThan(20);
    expect(acceptPublicGeneratedCopy(long, PUBLIC_REPORT_FALLBACK)).toBe(PUBLIC_REPORT_FALLBACK);
    expect(acceptPublicGeneratedCopy('The site earned an A grade and carries legal risk.', PUBLIC_REPORT_FALLBACK)).toBe(PUBLIC_REPORT_FALLBACK);
    expect(hasBannedPublicReportTerm('This report is an accessibility certification.')).toBe(true);
    expect(isPublicCopyWithinHardLimit('One two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen sixteen seventeen eighteen nineteen twenty one two three four five six.')).toBe(false);
    expect(isPublicCopyWithinLimit('“One two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen sixteen seventeen eighteen nineteen twenty one two three four five six.”')).toBe(true);
  });

  it('keeps deterministic report summaries within the public language contract', () => {
    const html = '<html lang="en"><head><title>Example</title><meta name="description" content="A short page."></head><body><h1>Example</h1><p>One short paragraph.</p></body></html>';
    const metrics = [extractMetrics(html, 'https://example.com/')];
    const score = computeSiteScore(metrics);
    expect(findLongPublicSentences(buildExecutiveSummary(score, metrics))).toEqual([]);
    expect(findLongPublicSentences(buildDeterministicAnalysis(score))).toEqual([]);
    expect(hasBannedPublicReportTerm(buildExecutiveSummary(score, metrics))).toBe(false);
  });

  it('keeps offer names, prices, and intake destinations consistent', () => {
    expect(PUBLIC_OFFERS['website-improvement']).toMatchObject({
      name: 'Website Fix',
      price: '$500 total',
      contactHref: '/contact?offer=website-fix',
      detailHref: '/website-fix',
    });
    expect(PUBLIC_OFFERS['ai-operator']).toMatchObject({
      name: 'Managed Automation',
      price: 'Priced by proposal',
      contactHref: '/contact?offer=managed-automation',
      detailHref: '/managed-automation',
    });
    expect(PUBLIC_OFFERS['website-improvement'].summary).toContain(PUBLIC_CORE_PROMISE);
    expect(PUBLIC_OFFERS['ai-operator'].summary).toContain(PUBLIC_CORE_PROMISE);
    expect(readApp('lib/page-config.ts')).toContain('$250 manual invoice for Website Fix');
    expect(readApp('lib/page-config.ts')).toContain('No automatic renewal');
  });

  it('removes unsupported claims from public report and tool surfaces', () => {
    const publicSources = [
      'components/report/AccessibilityCallout.tsx',
      'components/report/ReportHero.tsx',
      'components/report/ScoreBreakdown.tsx',
      'components/home/sections/SiteAnalyzerTeaser.tsx',
      'app/site-analyzer/page.tsx',
    ].map(readApp).join('\n');

    expect(publicSources).not.toMatch(/lawsuit|legal risk|AI[- ]powered|\bgrade\b|certif(?:y|ication|ied)/i);
    expect(publicSources).not.toContain('100-point');
  });

  it('keeps the contact form focused and avoids duplicate invitation copy', () => {
    const contact = readApp('app/contact/page.tsx');
    const invitation = 'Tell us what is not working.';
    expect(contact.split(invitation).length - 1).toBe(1);
    expect(contact).toContain('Which starting point fits?');
    expect(contact).toContain('Your name');
    expect(contact).toContain('Your email');
  });

  it('keeps technical system terms in the technical explanation', () => {
    const system = readApp('app/system/page.tsx');
    const marker = system.indexOf('Technical map');
    expect(marker).toBeGreaterThan(-1);
    for (const term of ['Hermes', 'OpenClaw', 'Codex', 'worktree', 'MCP', 'Supabase', 'Redis', 'Upstash Vector']) {
      expect(system).toContain(term);
    }
  });

  it('keeps legacy redirect destinations unchanged', () => {
    expect(readApp('app/guide/page.tsx')).toContain("permanentRedirect('/faq')");
    expect(readApp('app/resume/page.tsx')).toContain("permanentRedirect('/work')");
    expect(readApp('app/build/page.tsx')).toContain("permanentRedirect('/contact?offer=website-fix')");
    expect(readApp('app/build/success/page.tsx')).toContain("permanentRedirect('/contact?offer=website-improvement')");
    expect(getRetiredBlogDestination('combat-medic-to-code-military-discipline-development')).toBe('/work');
    expect(getRetiredBlogDestination('rag-supabase-pgvector-nextjs-tutorial')).toBe('/services');
    expect(getRetiredBlogDestination('polish-day')).toBe('/blog');
  });
});
