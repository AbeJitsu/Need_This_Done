import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { DEFAULT_LAYOUT_CONTENT } from '@/lib/page-config';
import { normalizePublicOfferId, PUBLIC_OFFERS } from '@/lib/public-offers';
import { contrastRatio } from '@/lib/wcag-contrast';

const appRoot = resolve(__dirname, '..');
const repositoryRoot = resolve(appRoot, '..');
const source = (path: string) => readFileSync(resolve(appRoot, path), 'utf8');

const publicCopySources = [
  'app/page.tsx',
  'app/managed-automation/page.tsx',
  'app/services/page.tsx',
  'app/pricing/page.tsx',
  'app/how-it-works/page.tsx',
  'app/work/page.tsx',
  'app/faq/page.tsx',
  'app/contact/page.tsx',
  'app/privacy/page.tsx',
  'app/terms/page.tsx',
  'components/home/HomePageClient.tsx',
  'components/services/ServicesPageClient.tsx',
  'components/pricing/UnifiedPricingPage.tsx',
  'components/work/WorkPageClient.tsx',
  'components/public/PublicFooter.tsx',
  'components/public/PublicHeader.tsx',
  'components/public/PublicServiceVisuals.tsx',
  'components/report/ReportCTA.tsx',
  'lib/page-config.ts',
  'lib/public-offers.ts',
  'lib/seo-config.ts',
].map(source).join('\n');

describe('simplified public journey', () => {
  it('uses the canonical offer names, descriptions, and new query values', () => {
    expect(PUBLIC_OFFERS['website-improvement']).toMatchObject({
      name: 'Website Fix',
      contactHref: '/contact?offer=website-fix',
      summary: 'We review one website problem, agree on one contained fix, and deliver it for $500.',
    });
    expect(PUBLIC_OFFERS['ai-operator']).toMatchObject({
      name: 'Managed Automation',
      contactHref: '/contact?offer=managed-automation',
      summary: 'A proposal-based way to improve one repeated problem at work.',
    });
    expect(normalizePublicOfferId('website-fix')).toBe('website-improvement');
    expect(normalizePublicOfferId('managed-automation')).toBe('ai-operator');
    expect(normalizePublicOfferId('website-improvement')).toBe('website-improvement');
    expect(normalizePublicOfferId('ai-operator')).toBe('ai-operator');
  });

  it('standardizes public navigation and calls to action without promoting sign-in', () => {
    expect(DEFAULT_LAYOUT_CONTENT.header.navLinks).toEqual([
      { href: '/services#website-fix', label: 'Website Fix' },
      { href: '/services#managed-automation', label: 'Managed Automation' },
      { href: '/how-it-works', label: 'How It Works' },
      { href: '/work', label: 'Work' },
    ]);
    expect(DEFAULT_LAYOUT_CONTENT.header.ctaButton).toEqual({ text: "Tell us what's stuck", href: '/contact' });
    expect(source('components/Navigation.tsx')).not.toMatch(/<Link\s+href="\/login"/);
    expect(source('components/Footer.tsx')).not.toContain('/login');
  });

  it('leads with the agreed plain-language promise and standardized CTAs', () => {
    const home = source('components/home/HomePageClient.tsx');
    expect(home).toContain("Fix the work that’s slowing you down.");
    for (const cta of ["Tell us what’s stuck", 'Start a Website Fix', 'Discuss Managed Automation']) {
      expect(publicCopySources).toContain(cta);
    }
    for (const staleName of ['Website Improvement', 'Managed AI Operator', 'Targeted Fix', 'Automation System Setup']) {
      expect(publicCopySources).not.toContain(staleName);
    }
  });

  it('uses three reusable semantic visuals instead of public card-wall diagrams', () => {
    const visualsPath = 'components/public/PublicServiceVisuals.tsx';
    expect(existsSync(resolve(appRoot, visualsPath))).toBe(true);
    const visuals = source(visualsPath);
    for (const component of ['OfferComparison', 'ThreeStepFlow', 'OutcomeFocusFlow']) {
      expect(visuals).toContain(`export function ${component}`);
    }
    expect(visuals).toContain('Choose this when');
    expect(visuals).toContain('You get');
    expect(visuals).toContain('Price');
    expect(visuals).toContain('Next step');
    expect(visuals).toContain('Tell us what’s stuck');
    expect(visuals).toContain('Agree on one outcome');
    expect(visuals).toContain('We do the work and hand it off');
    expect(visuals).toContain('Repeated problem');
    expect(visuals).toContain('Better result');
    expect(visuals).toContain('Focused work');
    expect(visuals).toMatch(/<(?:dl|ol)\b/);
  });

  it('keeps technical implementation vocabulary out of first-facing public copy', () => {
    expect(publicCopySources).not.toMatch(/\b(?:LLMs?|RLS|provider|worker)\b/i);
    expect(publicCopySources).not.toMatch(/(?:client|customer) portal|approval boundary/i);
  });

  it('keeps Managed Automation public copy focused on a repeated problem and better result', () => {
    const managedPage = source('app/managed-automation/page.tsx');
    expect(managedPage).toContain('Make one repeated problem at work easier to solve.');
    expect(managedPage).toContain('One repeated problem worth fixing.');
    expect(managedPage).toContain('A shared picture of the better result and what success means.');
    expect(managedPage).toContain('Focused work that moves that result forward.');
    expect(PUBLIC_OFFERS['ai-operator'].payment).toBe('The proposal sets the problem, better result, scope, price, and payment terms.');

    const managedMarketingSources = [
      'app/managed-automation/page.tsx',
      'app/page.tsx',
      'app/services/page.tsx',
      'app/pricing/page.tsx',
      'app/work/page.tsx',
      'app/layout.tsx',
      'app/contact/page.tsx',
      'components/home/HomePageClient.tsx',
      'components/pricing/UnifiedPricingPage.tsx',
      'components/work/WorkPageClient.tsx',
      'components/public/PublicFooter.tsx',
      'components/public/PublicServiceVisuals.tsx',
      'lib/public-offers.ts',
      'lib/seo-config.ts',
      'lib/service-modal-content.ts',
    ].map(source).join('\n');

    expect(managedMarketingSources).not.toMatch(/\b(?:Abe|Andrea)\b/i);
    expect(managedMarketingSources).not.toMatch(/human[- ](?:led|run)/i);
    expect(managedMarketingSources).not.toMatch(/\b30[- ]day\b/i);
    expect(managedMarketingSources).not.toMatch(/weekly (?:brief|client)/i);
    expect(managedMarketingSources).not.toMatch(/privately operated|private operation/i);
    expect(managedMarketingSources).not.toMatch(/\bapproval\b/i);

    const jsonLd = source('components/seo/JsonLd.tsx');
    expect(jsonLd).toContain('proposal-based way to improve one repeated problem at work');
    expect(jsonLd).not.toContain('human-run 30-day pilot');
    expect(jsonLd).not.toContain('short weekly brief');
  });

  it('gives the desktop public-nav CTA vertical breathing room without changing the mobile CTA', () => {
    const header = source('components/public/PublicHeader.tsx');
    expect(header).toContain('min-h-18 max-w-6xl items-center justify-between px-5 sm:px-8 lg:min-h-[80px]');
    expect(header).toContain('hidden items-center rounded-full bg-[#126b4e] px-6 py-2.5');
    expect(header).toContain('href="/contact"');
    expect(header).toContain('mt-2 block rounded-lg bg-[#126b4e] px-3 py-3 text-center');
  });

  it('labels Work as examples until paid outcomes exist and keeps old boundaries compatible', () => {
    const work = source('components/work/WorkPageClient.tsx');
    expect(work).toContain('Process examples');
    expect(work).toContain('These are examples of how we work—not paid client outcomes.');
    expect(source('components/services/ServicesPageClient.tsx')).toContain('id="website-improvement"');
    expect(source('components/services/ServicesPageClient.tsx')).toContain('id="ai-operator"');
    expect(source('components/report/ReportCTA.tsx')).toContain('href="/contact?offer=website-fix"');
  });

  it('uses a text-led two-offer homepage without a decorative hero image', () => {
    const home = source('components/home/HomePageClient.tsx');
    expect(home).toContain('href="/website-fix"');
    expect(home).toContain('href="/managed-automation"');
    expect(home).not.toContain('needthisdone-work-to-outcome');
    expect(home).not.toContain("from 'next/image'");
  });

  it('keeps the public palette readable and honors reduced-motion preferences', () => {
    for (const [foreground, background] of [
      ['#50675e', '#f7f4ed'],
      ['#126b4e', '#f7f4ed'],
      ['#ffffff', '#126b4e'],
      ['#183229', '#e4eee6'],
      ['#d1fae5', '#18372e'],
      ['#ffffff', '#18372e'],
    ]) {
      expect(contrastRatio(foreground, background)).toBeGreaterThanOrEqual(4.5);
    }
    const globalStyles = source('app/globals.css');
    expect(globalStyles).toContain('@media (prefers-reduced-motion: reduce)');
    expect(globalStyles).toContain('animation: none');
    expect(globalStyles).toContain('scroll-behavior: auto');
  });

  it('updates the root product boundary while retaining compatibility identifiers', () => {
    const rootDocs = ['AGENTS.md', 'README.md', 'ROADMAP.md']
      .map((path) => readFileSync(resolve(repositoryRoot, path), 'utf8'))
      .join('\n');
    expect(rootDocs).toContain('Website Fix');
    expect(rootDocs).toContain('Managed Automation');
    expect(rootDocs).not.toContain('Website Improvement');
    expect(rootDocs).not.toContain('Managed AI Operator');
  });
});
