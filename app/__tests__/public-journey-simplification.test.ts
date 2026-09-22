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

describe('portfolio public journey', () => {
  it('leads with an independent-practice promise and clear actions', () => {
    const home = source('components/home/HomePageClient.tsx');
    expect(home).toContain('Practical software');
    expect(home).toContain('for messy');
    expect(home).toContain('problems.');
    expect(home).toContain('See selected work');
    expect(home).toContain('href="/work#case-studies"');
    expect(home).toContain('Start a conversation');
    expect(home).not.toContain('Your vision,');
    expect(home).not.toContain('Bring us the problem');
    expect(home).not.toMatch(/\b(?:LLMs?|RLS|provider|worker)\b/i);
  });

  it('uses selected work, capabilities, about, and notes as the primary navigation', () => {
    expect(PUBLIC_NAVIGATION.map(link => link.label)).toEqual(['Capabilities', 'Selected Work', 'About', 'Notes']);
    expect(PUBLIC_NAVIGATION.map(link => link.href)).toEqual(['/services', '/work', '/about', '/blog']);
    expect(PUBLIC_HOME_JOURNEY.map(link => link.id)).toEqual(['capabilities', 'featured-work', 'approach', 'notes']);
    expect(PUBLIC_NAVIGATION.map(link => link.href)).toEqual(PUBLIC_HOME_JOURNEY.map(link => link.href));
    expect(PUBLIC_NAVIGATION.map(link => getPublicHomeHref(link.href))).toEqual([
      '/#capabilities', '/#featured-work', '/#approach', '/#notes',
    ]);
    expect(PUBLIC_PRIMARY_ACTION).toEqual({ href: '/contact', label: 'Start a conversation' });
    const destinations = PUBLIC_FOOTER_GROUPS.flatMap(group => group.links.map(link => link.href));
    for (const route of ['/about', '/faq', '/contact', '/privacy', '/terms', '/system']) expect(destinations).toContain(route);
    expect(destinations).toContain('/work#case-studies');
  });

  it('moves through the portfolio story and ends at contact', () => {
    expect(getPublicHomeNextStep('capabilities')).toEqual({ href: '#featured-work', label: 'Next: Selected Work' });
    expect(getPublicHomeNextStep('featured-work')).toEqual({ href: '#approach', label: 'Next: About' });
    expect(getPublicHomeNextStep('approach')).toEqual({ href: '#notes', label: 'Next: Notes' });
    expect(getPublicHomeNextStep('notes')).toBeNull();
  });

  it('keeps build notes concrete and the final contact action singular', () => {
    const home = source('components/home/HomePageClient.tsx');
    const notes = home.split('<section id="notes"')[1]?.split('</section>')[0] ?? '';

    expect(notes).toContain('Notes from the work behind the software.');
    expect(notes).toContain('Short write-ups share technical choices, small experiments, and lessons learned along the way.');
    expect(notes).not.toMatch(/\breasoning\b/i);
    expect(notes.match(/Start a conversation/g)).toHaveLength(1);
    expect(getPublicHomeNextStep('notes')).toBeNull();
  });

  it('keeps the system page as an optional conceptual case study', () => {
    const system = source('app/system/page.tsx');
    expect(system).toContain('Why this exists');
    expect(system).toContain('Chat can start the work. NeedThisDone carries it through.');
    expect(system).toContain('What chat alone leaves unresolved.');
    expect(system).toContain('From request to result');
    expect(system).toContain('Start with one outcome.');
    expect(system).toContain('Start a conversation');
    expect(system).not.toContain('SYSTEM_PROOF_LANES');
    expect(system).not.toMatch(/MCP|Supabase|Hermes|Redis|OpenClaw|Vector memory|Evidence:/i);
    expect(system).not.toMatch(/href=["']https:\/\/github\.com/);
    expect(system).toContain('alternates: { canonical: "/system" }');
  });

  it('keeps legacy offer aliases compatible while de-emphasizing them in the portfolio', () => {
    expect(PUBLIC_OFFERS['website-improvement']).toMatchObject({ name: 'Website Fix', contactHref: '/contact?offer=website-fix', price: '$500 total' });
    expect(PUBLIC_OFFERS['ai-operator']).toMatchObject({ name: 'Managed Automation', contactHref: '/contact?offer=managed-automation', price: 'Priced by proposal' });
    expect(normalizePublicOfferId('website-fix')).toBe('website-improvement');
    expect(normalizePublicOfferId('managed-automation')).toBe('ai-operator');
  });

  it('keeps contact concise and compatible with the projects API', () => {
    const contact = source('app/contact/page.tsx');
    expect(contact).toContain('What are you building or trying to fix?');
    expect(contact).toContain('body.append("message", data.message)');
    expect(contact).toContain('Is there a useful starting point?');
    expect(contact).not.toContain('intakeContext');
    for (const field of ['name', 'email', 'company']) expect(contact).toMatch(new RegExp(`body\\.append\\(["']${field}["']`));
    expect(source('app/api/projects/route.ts')).toContain("formData.get('message')");
  });

  it('gives home, capabilities, and work distinct jobs', () => {
    const services = source('components/services/ServicesPageClient.tsx');
    const work = source('components/work/WorkPageClient.tsx');
    const home = source('components/home/HomePageClient.tsx');
    expect(services).toContain('PUBLIC_CAPABILITIES');
    expect(services).toContain('PUBLIC_CAPABILITIES_INTRO');
    expect(services).toContain('React');
    expect(services).not.toContain('PUBLIC_OFFERS');
    expect(work).toContain('caseStudies');
    expect(work).toContain('portfolio-hero.png');
    expect(work).toContain('Useful things for messy problems.');
    expect(work).toContain('simpleSteps');
    expect(home).toContain('href="/work#case-studies"');
    expect(home).not.toContain('PUBLIC_EXAMPLES');
  });

  it('gives About and How It Works distinct portfolio jobs', () => {
    const howItWorks = source('app/how-it-works/page.tsx');
    const about = source('app/about/page.tsx');
    expect(howItWorks).toContain('Make the next technical decision easier to see.');
    expect(howItWorks).toContain('Make the problem observable');
    expect(about).toContain('About NeedThisDone');
    expect(about).toContain('Problems that cross more than one layer.');
    expect(about).toContain('Clarity is part of the implementation.');
    expect(about).not.toContain('Meet the team');
  });

  it('keeps public styles scoped away from the authenticated interface', () => {
    expect(source('components/public/PublicChrome.tsx')).toContain('className="public-shell"');
    expect(source('app/globals.css')).toContain('.public-shell');
    expect(source('components/public/PublicChrome.tsx')).toContain('if (isPrivate)');
    expect(source('components/public/PublicChrome.tsx')).not.toContain('HomeJourneyProgress');
    expect(source('app/globals.css')).not.toContain('homepage-journey-progress');
    expect(source('components/public/PublicHeader.tsx')).toContain('href="/login"');
  });

  it('keeps the editorial palette readable and honors reduced motion', () => {
    for (const [foreground, background] of [
      ['#50675e', '#f7f4ed'], ['#126b4e', '#f7f4ed'], ['#ffffff', '#126b4e'],
      ['#183229', '#e8e2d5'], ['#dce8dd', '#18372e'],
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
    expect(roadmap).toContain('Assistant-first finish line');
  });

  it('uses the independent-practice promise in metadata', () => {
    expect(PUBLIC_BRAND_TITLE).toBe('Independent Technology Practice');
    expect(source('app/layout.tsx')).toContain('PUBLIC_BRAND_TITLE');
    expect(source('public/og-image.svg')).toContain('Independent');
    expect(seoConfig.description).toContain('React and Next.js');
  });
});
