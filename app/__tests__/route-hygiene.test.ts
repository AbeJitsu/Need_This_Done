import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import sitemap from '@/app/sitemap';
import robots from '@/app/robots';

const appRoot = resolve(__dirname, '..');
const repositoryRoot = resolve(appRoot, '..');

describe('public route hygiene', () => {
  it('keeps the public navigation on the intended page progression', () => {
    const header = readFileSync(resolve(appRoot, 'components/public/PublicHeader.tsx'), 'utf8');
    expect(header).toContain("{ href: '/services', label: 'What We Do' }");
    expect(header).toContain("{ href: '/#why-us', label: 'Why Us' }");
    expect(header).toContain("{ href: '/work', label: 'Examples' }");
    expect(header).toContain("{ href: '/blog', label: 'Insights' }");
    expect(header).toContain('Share Your Vision');
  });

  it('does not publish retired route entries in the sitemap and keeps private surfaces out of indexing', async () => {
    const urls = (await sitemap()).map((entry) => new URL(entry.url).pathname);
    expect(urls).toEqual(expect.arrayContaining(['/services', '/pricing', '/how-it-works', '/site-analyzer', '/work', '/blog']));
    for (const retired of ['/about', '/resume', '/guide', '/build']) expect(urls).not.toContain(retired);

    const disallow = robots().rules?.[0]?.disallow || [];
    expect(disallow).toEqual(expect.arrayContaining(['/dashboard/', '/employee/', '/prospecting/', '/admin/', '/report/']));
  });

  it('keeps permanent redirects and the audit-to-intake handoff aligned', () => {
    const config = readFileSync(resolve(appRoot, 'next.config.mjs'), 'utf8');
    expect(config).toContain("source: '/about'");
    expect(config).toContain("destination: '/#why-us'");
    expect(config).toContain("source: '/resume'");
    expect(config).toContain("source: '/guide'");
    expect(config).toContain("destination: '/faq'");
    expect(config).toContain("source: '/build'");
    expect(config).toContain("destination: '/contact?offer=website-fix'");

    for (const page of ['about', 'resume', 'guide']) {
      expect(readFileSync(resolve(appRoot, `app/${page}/page.tsx`), 'utf8')).toContain('permanentRedirect');
    }
    expect(readFileSync(resolve(appRoot, 'components/report/ReportCTA.tsx'), 'utf8')).toContain('href="/contact?offer=website-fix"');
    const modelEvaluationMigration = readFileSync(resolve(repositoryRoot, 'supabase/migrations/081_bound_model_evaluation_budget.sql'), 'utf8');
    expect(modelEvaluationMigration).toContain('model_evaluation_records');
    expect(modelEvaluationMigration).not.toContain('daily_model_cap');
    expect(modelEvaluationMigration).not.toContain('per_run_model_cap');
  });
});
