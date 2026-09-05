import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { normalizePublicOfferId, PUBLIC_OFFERS } from '@/lib/public-offers';
import { PUBLIC_NAVIGATION, PUBLIC_FOOTER_GROUPS, PUBLIC_PRIMARY_ACTION } from '@/lib/public-journey';
import { contrastRatio } from '@/lib/wcag-contrast';

const appRoot = resolve(__dirname, '..');
const repositoryRoot = resolve(appRoot, '..');
const source = (path: string) => readFileSync(resolve(appRoot, path), 'utf8');

describe('vision-first public journey', () => {
  it('leads with the approved audience, promise, and actions', () => {
    const home = source('components/home/HomePageClient.tsx');
    expect(home).toContain('For owners and founders');
    expect(home).toContain('Your vision, brought to life.');
    expect(home).toContain('help you find a useful place to start');
    expect(home).toContain('href="/contact"');
    expect(home).toContain('Share Your Vision');
    expect(home).toContain('href="/services"');
    expect(home).toContain('See what we do');
    expect(home).not.toMatch(/\b(?:LLMs?|RLS|provider|worker)\b/i);
  });

  it('uses the approved public navigation while retaining support links in the footer', () => {
    expect(PUBLIC_NAVIGATION.map(link => link.label)).toEqual(['What We Do', 'How We Work', 'Examples', 'Why Us']);
    expect(PUBLIC_PRIMARY_ACTION).toEqual({ href: '/contact', label: 'Share Your Vision' });
    const destinations = PUBLIC_FOOTER_GROUPS.flatMap(group => group.links.map(link => link.href));
    for (const route of ['/about', '/pricing', '/faq', '/contact', '/privacy', '/terms']) expect(destinations).toContain(route);

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
    expect(contact).toContain('Do either of these sound like the place to start?');
    expect(contact).toMatch(/body\.append\(["']intakeContext["']/);
    for (const field of ['name', 'email', 'company']) expect(contact).toMatch(new RegExp(`body\\.append\\(["']${field}["']`));
    expect(source('app/api/projects/route.ts')).toContain("formData.get('message')");
  });

  it('explains the problem, prior attempts, and next action for every example', () => {
    const work = source('components/work/WorkPageClient.tsx');
    const home = source('components/home/HomePageClient.tsx');
    expect(home).toContain('How we move a stuck problem forward');
    expect(home).toContain('What might be tried');
    expect(work).toContain('What is happening');
    expect(work).toContain('What might be tried');
    expect(work).toContain('How we help resolve it');
    expect(work).not.toMatch(/we (?:increased|grew|saved|delivered) .*%/i);
  });

  it('keeps public styles scoped away from the authenticated interface', () => {
    expect(source('components/public/PublicChrome.tsx')).toContain('className="public-shell"');
    expect(source('app/globals.css')).toContain('.public-shell');
    expect(source('components/public/PublicChrome.tsx')).toContain('if (isPrivate)');
    expect(source('lib/page-config.ts')).toContain("{ href: '/website-fix', label: 'Website Fix' }");
    expect(source('lib/page-config.ts')).toContain("{ href: '/managed-automation', label: 'Managed Automation' }");
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
