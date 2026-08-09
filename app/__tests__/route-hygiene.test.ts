import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import sitemap from '@/app/sitemap';
import robots from '@/app/robots';
import { DEFAULT_LAYOUT_CONTENT } from '@/lib/page-config';

const appRoot = resolve(__dirname, '..');
const repositoryRoot = resolve(appRoot, '..');

describe('dual-offer route hygiene', () => {
  it('keeps the public navigation limited to the two offers and maintained destinations', () => {
    expect(DEFAULT_LAYOUT_CONTENT.header.navLinks).toEqual([
      { href: '/services#website-improvement', label: 'Website Improvement' },
      { href: '/services#ai-operator', label: 'AI Operator' },
      { href: '/how-it-works', label: 'How It Works' },
      { href: '/work', label: 'Work' },
      { href: '/blog', label: 'Insights' },
    ]);
    expect(DEFAULT_LAYOUT_CONTENT.header.ctaButton).toEqual({ text: 'Start a Project', href: '/contact' });
  });

  it('does not publish retired route entries in the sitemap and keeps private surfaces out of indexing', async () => {
    const urls = (await sitemap()).map((entry) => new URL(entry.url).pathname);
    expect(urls).toEqual(expect.arrayContaining(['/services', '/pricing', '/how-it-works', '/site-analyzer', '/work', '/blog']));
    for (const retired of ['/about', '/resume', '/guide', '/build']) expect(urls).not.toContain(retired);

    const disallow = robots().rules?.[0]?.disallow || [];
    expect(disallow).toEqual(expect.arrayContaining(['/dashboard/', '/employee/', '/prospecting/', '/admin/', '/report/']));
  });

  it('keeps permanent redirects and the audit-to-intake handoff aligned', () => {
    const config = readFileSync(resolve(appRoot, 'next.config.cjs'), 'utf8');
    expect(config).toContain("source: '/about'");
    expect(config).toContain("destination: '/work'");
    expect(config).toContain("source: '/resume'");
    expect(config).toContain("source: '/guide'");
    expect(config).toContain("destination: '/faq'");
    expect(config).toContain("source: '/build'");
    expect(config).toContain("destination: '/contact?offer=website-improvement'");

    for (const page of ['about', 'resume', 'guide']) {
      expect(readFileSync(resolve(appRoot, `app/${page}/page.tsx`), 'utf8')).toContain('permanentRedirect');
    }
    expect(readFileSync(resolve(appRoot, 'components/report/ReportCTA.tsx'), 'utf8')).toContain('href="/contact?offer=website-improvement"');
    expect(readFileSync(resolve(repositoryRoot, 'supabase/migrations/084_bound_model_evaluation_budget.sql'), 'utf8')).toContain('daily_model_cap <= 0.25');
  });
});
