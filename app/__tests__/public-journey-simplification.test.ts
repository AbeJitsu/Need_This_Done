import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { normalizePublicOfferId, PUBLIC_OFFERS } from '@/lib/public-offers';
import {
  getPublicHomeNextStep,
  getPublicHomeHref,
  PUBLIC_HOME_JOURNEY,
  PUBLIC_NAVIGATION,
  PUBLIC_FOOTER_GROUPS,
  PUBLIC_PRIMARY_ACTION,
} from '@/lib/public-journey';
import { contrastRatio } from '@/lib/wcag-contrast';
import { PUBLIC_BRAND_TITLE } from '@/lib/public-copy';
import { seoConfig } from '@/lib/seo-config';

const appRoot = resolve(__dirname, '..');
const repositoryRoot = resolve(appRoot, '..');
const source = (path: string) => readFileSync(resolve(appRoot, path), 'utf8');

describe('vision-first public journey', () => {
  it('leads with the promise and actions', () => {
    const home = source('components/home/HomePageClient.tsx');
    for (const line of ['Your vision,', 'brought', 'to life.']) expect(home).toContain(line);
    expect(home).toContain('Bring us the problem');
    expect(home).toContain('href="/contact"');
    expect(home).toContain('Share Your Vision');
    expect(home).toContain('href="#what-we-do"');
    expect(home).toContain('Follow the path');
    expect(home).not.toContain('homepage-bridge');
    expect(home).not.toContain('Inspect the system behind the work');
    expect(home).not.toMatch(/\b(?:LLMs?|RLS|provider|worker)\b/i);
  });

  it('uses the approved public navigation while retaining support links in the footer', () => {
    expect(PUBLIC_NAVIGATION.map(link => link.label)).toEqual(['What We Do', 'How We Work', 'Examples', 'Why Us']);
    expect(PUBLIC_HOME_JOURNEY.map(link => link.id)).toEqual(['what-we-do', 'how-it-works', 'examples', 'why-us']);
    for (const link of PUBLIC_NAVIGATION) expect(getPublicHomeHref(link.href)).toMatch(/^\/#/);
    expect(PUBLIC_PRIMARY_ACTION).toEqual({ href: '/contact', label: 'Share Your Vision' });
    const destinations = PUBLIC_FOOTER_GROUPS.flatMap(group => group.links.map(link => link.href));
    for (const route of ['/about', '/pricing', '/faq', '/contact', '/privacy', '/terms', '/system']) expect(destinations).toContain(route);
    expect(PUBLIC_FOOTER_GROUPS.find(group => group.title === 'Explore')?.links).toContainEqual({ href: '/system', label: 'The System' });

    expect(getPublicHomeNextStep('what-we-do')).toEqual({ href: '#how-it-works', label: 'Next: How We Work' });
    expect(getPublicHomeNextStep('how-it-works')).toEqual({ href: '#examples', label: 'Next: Examples' });
    expect(getPublicHomeNextStep('examples')).toEqual({ href: '#why-us', label: 'Next: Why Us' });
    expect(getPublicHomeNextStep('why-us')).toEqual({ href: '#share-your-vision', label: 'Next: Share Your Vision' });

  });

  it('keeps the system case study on purposeful route exits', () => {
    const system = source('app/system/page.tsx');
    const sitemap = source('app/sitemap.ts');
    expect(system).toContain('A private system for follow-through');
    expect(system).toContain('Important work, kept moving.');
    expect(system).toContain('We are building a private coordination system that turns a goal into a clear plan, asks for approval, and brings back the result.');
    expect(system).toContain('NeedThisDone keeps requests, approvals, execution, and results together.');
    expect(system).toContain('Every card starts with a plain-English explanation');
    expect(system).toContain('The simple version of how it works.');
    expect(system).toContain('What is happening behind the scenes.');
    expect(system).toContain('Plain English');
    expect(system).toContain('Technical detail');
    expect(system).toContain('Your authenticated workspace shows a compact summary');
    expect(system).toContain('title: "Upstash Vector"');
    expect(system).toContain('An answer can start the work. NeedThisDone carries it forward.');
    expect(system).toContain('Supabase keeps the goal, approval, status, result, and ownership durable');
    expect(system).toContain('href="/contact"');
    expect(system).toContain('Inspect the implementation');
    expect(system).toContain('https://github.com/AbeJitsu/Need_This_Done/tree/dev');
    expect(system).not.toMatch(/href=["']#/);
    expect(system).not.toMatch(/ChatGPT|Claude|chatbot|\bchat\b/i);
    expect(system).toContain('alternates: { canonical: "/system" }');
    expect(sitemap).toContain("{ path: '/system'");
    for (const stage of ['Goal', 'Owner approval', 'Private execution', 'Reviewable proof']) {
      expect(system).toContain(`title: "${stage}"`);
    }
  });

  it('keeps both offers bounded, priced, and compatible', () => {
    expect(PUBLIC_OFFERS['website-improvement']).toMatchObject({
      name: 'Website Fix',
      contactHref: '/contact?offer=website-fix',
      price: '$500 total',
    });
    expect(PUBLIC_OFFERS['ai-operator']).toMatchObject({
      name: 'Managed Automation',
      contactHref: '/contact?offer=managed-automation',
      price: 'Priced by proposal',
    });
    expect(PUBLIC_OFFERS['website-improvement'].summary).not.toContain('$');
    expect(normalizePublicOfferId('website-fix')).toBe('website-improvement');
    expect(normalizePublicOfferId('managed-automation')).toBe('ai-operator');
    expect(normalizePublicOfferId('website-improvement')).toBe('website-improvement');
    expect(normalizePublicOfferId('ai-operator')).toBe('ai-operator');
  });

  it('makes service choice optional and extends the projects contract compatibly', () => {
    const contact = source('app/contact/page.tsx');
    expect(contact).toContain('Step {step} of 4');
    expect(contact).toContain('Which starting point fits?');
    expect(contact).toMatch(/body\.append\(["']intakeContext["']/);
    for (const field of ['name', 'email', 'company']) expect(contact).toMatch(new RegExp(`body\\.append\\(["']${field}["']`));
    expect(source('app/api/projects/route.ts')).toContain("formData.get('message')");
  });

  it('gives services and examples separate jobs in the public journey', () => {
    const services = source('components/services/ServicesPageClient.tsx');
    const work = source('components/work/WorkPageClient.tsx');
    const home = source('components/home/HomePageClient.tsx');
    expect(services).toContain('PUBLIC_OFFERS');
    expect(services).toContain('offer.fit');
    expect(services).toContain('offer.summary');
    expect(services).toContain('offer.price');
    expect(services).toContain('offer.detailHref');
    expect(services).not.toContain('ThreeStepFlow');
    expect(services).not.toContain('ServiceIllustration');
    expect(services).not.toContain('Before');
    expect(work).toContain('PUBLIC_EXAMPLES');
    expect(work).toContain('Before');
    expect(work).toContain('After');
    expect(work).toContain('What changed');
    expect(work).not.toContain('What is happening');
    expect(work).not.toContain('What might be tried');
    expect(work).not.toContain('How we help resolve it');
    expect(work).not.toContain('ServiceIllustration');
    expect(work).not.toMatch(/\$500|priced by proposal/i);
    expect(home).toContain('PUBLIC_EXAMPLES');
    expect(home).toContain('getPublicExampleHref');
    expect(home).toContain('offer.fit');
    expect(home).not.toContain('What might be tried');
  });

  it('gives How We Work and Why Us distinct jobs', () => {
    const howItWorks = source('app/how-it-works/page.tsx');
    const about = source('app/about/page.tsx');
    expect(howItWorks).toContain('Tell us what is going on');
    expect(howItWorks).toContain('You decide, then we do the agreed work');
    expect(about).toContain('Bounded work, on purpose');
    expect(about).toContain('Decisions stay yours');
    expect(about).toContain('Proof over promises');
    expect(about).not.toContain('Tell us what is going on');
    expect(about).not.toContain('You decide, then we do the agreed work');
  });

  it('keeps public styles scoped away from the authenticated interface', () => {
    expect(source('components/public/PublicChrome.tsx')).toContain('className="public-shell"');
    expect(source('app/globals.css')).toContain('.public-shell');
    expect(source('components/public/PublicChrome.tsx')).toContain('if (isPrivate)');
    expect(source('lib/page-config.ts')).toContain("{ href: '/website-fix', label: 'Website Fix' }");
    expect(source('lib/page-config.ts')).toContain("{ href: '/managed-automation', label: 'Managed Automation' }");
    expect(source('components/public/PublicChrome.tsx')).not.toContain('HomeJourneyProgress');
    expect(source('app/globals.css')).not.toContain('homepage-journey-progress');
    expect(source('components/public/PublicHeader.tsx')).toContain('href="/login"');
    expect(source('components/public/PublicHeader.tsx')).toContain('>Sign in</Link>');
  });

  it('keeps the editorial palette readable and honors reduced motion', () => {
    for (const [foreground, background] of [
      ['#50675e', '#f7f4ed'],
      ['#126b4e', '#f7f4ed'],
      ['#ffffff', '#126b4e'],
      ['#183229', '#e8e2d5'],
      ['#dce8dd', '#18372e'],
    ]) expect(contrastRatio(foreground, background)).toBeGreaterThanOrEqual(4.5);
    const styles = source('app/globals.css');
    expect(styles).toContain('@media (prefers-reduced-motion: reduce)');
    expect(styles).toContain('scroll-behavior: auto');
  });

  it('keeps the public front door separate from the assistant roadmap', () => {
    const readme = readFileSync(resolve(repositoryRoot, 'README.md'), 'utf8');
    const roadmap = readFileSync(resolve(repositoryRoot, 'ROADMAP.md'), 'utf8');
    expect(readme).toContain('# NeedThisDone');
    expect(readme).toContain('## Public website and private assistant');
    expect(readme).toContain('The public [`/system` case study](app/app/system/page.tsx) is a visual explanation');
    expect(roadmap).toContain('Assistant-first finish line');
    expect(roadmap).toContain('## Public homepage and optional `/system` proof');
  });

  it('updates the social preview and root metadata to the new promise', () => {
    expect(PUBLIC_BRAND_TITLE).toBe('Your Vision, Brought to Life');
    expect(source('app/layout.tsx')).toContain('PUBLIC_BRAND_TITLE');
    expect(source('public/og-image.svg')).toContain('Your vision,');
    expect(source('public/og-image.svg')).toContain('brought to life.');
    expect(seoConfig.description).toContain('teams and individuals');
  });
});
