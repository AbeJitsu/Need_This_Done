import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { normalizePublicOfferId, PUBLIC_OFFERS } from '@/lib/public-offers';
import { contrastRatio } from '@/lib/wcag-contrast';

const appRoot = resolve(__dirname, '..');
const repositoryRoot = resolve(appRoot, '..');
const source = (path: string) => readFileSync(resolve(appRoot, path), 'utf8');

describe('vision-first public journey', () => {
  it('leads with the approved audience, promise, and actions', () => {
    const home = source('components/home/HomePageClient.tsx');
    expect(home).toContain('For owners and founders');
    expect(home).toContain('Your vision, brought to life.');
    expect(home).toContain('You do not need to arrive with a technical brief');
    expect(home).toContain('href="/contact"');
    expect(home).toContain('Share your vision');
    expect(home).toContain('href="#what-we-do"');
    expect(home).toContain('See what we do');
    expect(home).not.toMatch(/\b(?:LLMs?|RLS|provider|worker)\b/i);
  });

  it('uses the approved public navigation while retaining support links in the footer', () => {
    const header = source('components/public/PublicHeader.tsx');
    for (const [href, label] of [['/services', 'What We Do'], ['/#why-us', 'Why Us'], ['/work', 'Examples'], ['/blog', 'Insights']]) {
      expect(header).toContain(`{ href: '${href}', label: '${label}' }`);
    }
    expect(header).toContain('Share Your Vision');
    const footer = source('components/public/PublicFooter.tsx');
    for (const route of ['/pricing', '/faq', '/contact', '/privacy', '/terms']) expect(footer).toContain(`href="${route}"`);
  });

  it('keeps both offers bounded, priced, and compatible', () => {
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

  it('makes service choice optional and keeps the projects contract unchanged', () => {
    const contact = source('app/contact/page.tsx');
    expect(contact).toContain('What do you want to bring to life?');
    expect(contact).toMatch(/required name="vision"/);
    expect(contact).toMatch(/required name="outcome"/);
    expect(contact).toContain('Current obstacle');
    expect(contact).toContain('Optional. Choose one if it clearly fits');
    expect(contact).toContain("if (offer) body.append('service'");
    for (const field of ['name', 'email', 'company', 'message']) expect(contact).toContain(`body.append('${field}'`);
    expect(contact).not.toContain("if (!offer)");
  });

  it('explains the problem, prior attempts, and next action for every example', () => {
    const work = source('components/work/WorkPageClient.tsx');
    const home = source('components/home/HomePageClient.tsx');
    expect(home).toContain('How we move a stuck problem forward');
    expect(home).toContain('What you have tried');
    expect(work).toContain('What is happening');
    expect(work).toContain('What you have tried');
    expect(work).toContain('What we will do');
    expect(work).not.toMatch(/we (?:increased|grew|saved|delivered) .*%/i);
  });

  it('keeps public styles scoped away from the authenticated interface', () => {
    expect(source('components/public/PublicChrome.tsx')).toContain('className="public-shell"');
    expect(source('app/globals.css')).toContain('.public-shell');
    expect(source('components/public/PublicChrome.tsx')).toContain('if (isPrivate)');
    expect(source('lib/page-config.ts')).toContain("{ href: '/services#website-fix', label: 'Website Fix' }");
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
    expect(readme).toContain('## The assistant vision — start here');
    expect(readme).toContain('## Public service front door');
    expect(readme).toContain('This public positioning does not expand the assistant roadmap');
    expect(roadmap).toContain('Assistant-first finish line');
    expect(roadmap).toContain('separately approved public outcome-partner front door');
  });

  it('updates the social preview and root metadata to the new promise', () => {
    expect(source('app/layout.tsx')).toContain('Your Vision, Brought to Life');
    expect(source('public/og-image.svg')).toContain('Your vision,');
    expect(source('public/og-image.svg')).toContain('brought to life.');
    expect(source('lib/seo-config.ts')).toContain('owners and founders');
  });
});
