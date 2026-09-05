import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { PUBLIC_NAVIGATION, PUBLIC_PRIMARY_ACTION } from '@/lib/public-journey';
import { PUBLIC_OFFERS } from '@/lib/public-offers';
import sitemap from '@/app/sitemap';
import robots from '@/app/robots';

const appRoot = resolve(__dirname, '..');
const repositoryRoot = resolve(appRoot, '..');

describe('public route hygiene', () => {
  it('keeps the public navigation on the intended page progression', () => {
    expect(PUBLIC_NAVIGATION.map(link => link.href)).toEqual(['/services', '/how-it-works', '/work', '/about']);
    expect(PUBLIC_PRIMARY_ACTION.label).toBe('Share Your Vision');
  });

  it('does not publish retired route entries in the sitemap and keeps private surfaces out of indexing', async () => {
    const urls = (await sitemap()).map((entry) => new URL(entry.url).pathname);
    expect(urls).toEqual(expect.arrayContaining(['/services', '/about', '/pricing', '/how-it-works', '/site-analyzer', '/work', '/blog']));
    for (const retired of ['/resume', '/guide', '/build']) expect(urls).not.toContain(retired);

    const disallow = robots().rules?.[0]?.disallow || [];
    expect(disallow).toEqual(expect.arrayContaining(['/dashboard/', '/employee/', '/prospecting/', '/admin/', '/report/']));
  });

  it('keeps permanent redirects and the audit-to-intake handoff aligned', () => {
    const config = readFileSync(resolve(appRoot, 'next.config.mjs'), 'utf8');
    expect(config).not.toContain("source: '/about'");
    expect(config).toContain("source: '/resume'");
    expect(config).toContain("source: '/guide'");
    expect(config).toContain("destination: '/faq'");
    expect(config).toContain("source: '/build'");
    expect(config).toContain("destination: '/contact?offer=website-fix'");

    for (const page of ['resume', 'guide']) {
      expect(readFileSync(resolve(appRoot, `app/${page}/page.tsx`), 'utf8')).toContain('permanentRedirect');
    }
    const about = readFileSync(resolve(appRoot, 'app/about/page.tsx'), 'utf8');
    expect(about).toMatch(/title:\s*['\"]Why Us \| NeedThisDone['\"]/);
    expect(about).not.toContain('permanentRedirect');
    expect(PUBLIC_OFFERS['website-improvement'].detailHref).toBe('/website-fix');
    const modelEvaluationMigration = readFileSync(resolve(repositoryRoot, 'supabase/migrations/081_bound_model_evaluation_budget.sql'), 'utf8');
    expect(modelEvaluationMigration).toContain('model_evaluation_records');
    expect(modelEvaluationMigration).not.toContain('daily_model_cap');
    expect(modelEvaluationMigration).not.toContain('per_run_model_cap');
  });
});
