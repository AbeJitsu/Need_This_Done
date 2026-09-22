import { describe, expect, it } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { PUBLIC_NAVIGATION, PUBLIC_PRIMARY_ACTION } from '@/lib/public-journey';
import { PUBLIC_OFFERS } from '@/lib/public-offers';
import { getBlogPost, listBlogPosts } from '@/lib/blog-content';
import { seoConfig } from '@/lib/seo-config';
import sitemap from '@/app/sitemap';
import robots from '@/app/robots';

const appRoot = resolve(__dirname, '..');
const repositoryRoot = resolve(appRoot, '..');

describe('public route hygiene', () => {
  it('keeps the public navigation on the intended page progression', () => {
    expect(PUBLIC_NAVIGATION.map(link => link.href)).toEqual(['/services', '/work', '/about', '/blog']);
    expect(PUBLIC_PRIMARY_ACTION.label).toBe('Start a conversation');
  });

  it('indexes every intended public route and keeps private surfaces out of indexing', async () => {
    const urls = (await sitemap()).map((entry) => new URL(entry.url).pathname);
    const expectedPublicStaticRoutes = [
      '/',
      '/work',
      '/services',
      '/about',
      '/website-fix',
      '/managed-automation',
      '/pricing',
      '/how-it-works',
      '/system',
      '/contact',
      '/ada-compliance',
      '/faq',
      '/blog',
      '/privacy',
      '/terms',
    ];
    const expectedBlogRoutes = listBlogPosts().map((post) => `/blog/${post.slug}`);
    expect(urls).toEqual(expect.arrayContaining([...expectedPublicStaticRoutes, ...expectedBlogRoutes]));
    for (const nonIndexable of ['/login', '/dashboard', '/account', '/report', '/resume', '/guide', '/build']) {
      expect(urls).not.toContain(nonIndexable);
    }

    const robotsConfig = robots();
    expect(robotsConfig.sitemap).toBe(`${seoConfig.baseUrl}/sitemap.xml`);
    const disallow = robotsConfig.rules?.[0]?.disallow || [];
    expect(disallow).toEqual(expect.arrayContaining(['/dashboard/', '/employee/', '/prospecting/', '/admin/', '/report/', '/login']));
  });

  it('keeps the refreshed notes short and visually distinct', () => {
    for (const [slug, image] of [
      ['finding-the-useful-shape', '/images/notes/clear-next-step.jpg'],
      ['build-the-smallest-useful-slice', '/images/notes/useful-slice.jpg'],
    ]) {
      const post = getBlogPost(slug);
      expect(post).toBeTruthy();
      expect(post?.featured_image).toBe(image);
      expect(post?.content.trim().split(/\n\s*\n/)).toHaveLength(4);
    }
  });

  it('gives every public note a distinct local featured image', () => {
    const posts = listBlogPosts();
    const images = posts.map((post) => post.featured_image);

    expect(posts.length).toBeGreaterThan(0);
    expect(images.every(Boolean)).toBe(true);
    expect(new Set(images).size).toBe(images.length);

    for (const image of images) {
      expect(image).toMatch(/^\/images\//);
      expect(existsSync(resolve(appRoot, 'public', image!.slice(1)))).toBe(true);
    }
  });

  it('keeps permanent redirects and retired public paths aligned', () => {
    const config = readFileSync(resolve(appRoot, 'next.config.mjs'), 'utf8');
    expect(config).not.toContain("source: '/about'");
    expect(config).toContain("source: '/resume'");
    expect(config).toContain("source: '/guide'");
    expect(config).toContain("destination: '/faq'");
    expect(config).toContain("source: '/build'");
    expect(config).toContain("destination: '/contact?offer=website-fix'");
    expect(config).toContain("source: '/site-analyzer'");
    expect(config).toContain("destination: '/work'");

    for (const page of ['resume', 'guide']) {
      expect(readFileSync(resolve(appRoot, `app/${page}/page.tsx`), 'utf8')).toContain('permanentRedirect');
    }
    const about = readFileSync(resolve(appRoot, 'app/about/page.tsx'), 'utf8');
    expect(about).toMatch(/title:\s*['\"]About Me \| NeedThisDone['\"]/);
    expect(about).not.toContain('permanentRedirect');
    expect(PUBLIC_OFFERS['website-improvement'].detailHref).toBe('/website-fix');
    const modelEvaluationMigration = readFileSync(resolve(repositoryRoot, 'supabase/migrations/081_bound_model_evaluation_budget.sql'), 'utf8');
    expect(modelEvaluationMigration).toContain('model_evaluation_records');
    expect(modelEvaluationMigration).not.toContain('daily_model_cap');
    expect(modelEvaluationMigration).not.toContain('per_run_model_cap');
  });
});
