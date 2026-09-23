import { describe, expect, it } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { PUBLIC_PAGE_VISUALS } from '@/components/public/PublicPageVisual';
import { listBlogPosts } from '@/lib/blog-content';

const appRoot = resolve(__dirname, '..');

const publicPageCoverage = [
  { route: '/', source: 'components/home/HomePageClient.tsx', marker: 'messy-problems', image: '/images/public/messy-problems.webp' },
  { route: '/work', source: 'components/work/WorkPageClient.tsx', marker: '/images/portfolio-hero.png', image: '/images/portfolio-hero.png' },
  { route: '/services', source: 'components/services/ServicesPageClient.tsx', marker: 'interface-craft', image: '/images/public/interface-craft.webp' },
  { route: '/about', source: 'app/about/page.tsx', marker: 'problem-map', image: '/images/public/problem-map.webp' },
  { route: '/website-fix', source: 'app/website-fix/page.tsx', marker: 'visualKind="website-fix"', image: '/images/public/website-fix.webp' },
  { route: '/managed-automation', source: 'app/managed-automation/page.tsx', marker: 'visualKind="managed-automation"', image: '/images/public/managed-automation.webp' },
  { route: '/pricing', source: 'components/pricing/UnifiedPricingPage.tsx', marker: 'pricing-scope', image: '/images/public/pricing-scope.webp' },
  { route: '/how-it-works', source: 'app/how-it-works/page.tsx', marker: 'workflow-path', image: '/images/public/workflow-path.webp' },
  { route: '/system', source: 'app/system/page.tsx', marker: 'system-bridge', image: '/images/public/system-bridge.webp' },
  { route: '/contact', source: 'app/contact/page.tsx', marker: 'conversation-start', image: '/images/public/conversation-start.webp' },
  { route: '/ada-compliance', source: 'app/ada-compliance/page.tsx', marker: 'accessibility-craft', image: '/images/public/accessibility-craft.webp' },
  { route: '/faq', source: 'components/faq/FAQPageClient.tsx', marker: 'faq-answers', image: '/images/public/faq-answers.webp' },
  { route: '/blog', source: 'components/blog/BlogPageClient.tsx', marker: 'notes-library', image: '/images/public/notes-library.webp' },
  { route: '/privacy', source: 'components/privacy/PrivacyPageClient.tsx', marker: 'visualKind="privacy-boundary"', image: '/images/public/privacy-boundary.webp' },
  { route: '/terms', source: 'components/terms/TermsPageClient.tsx', marker: 'visualKind="terms-agreement"', image: '/images/public/terms-agreement.webp' },
] as const;

describe('public page image coverage', () => {
  it('keeps every generated public visual local and accessible', () => {
    const sources = Object.values(PUBLIC_PAGE_VISUALS).map((visual) => visual.src);
    expect(new Set(sources).size).toBe(sources.length);

    for (const visual of Object.values(PUBLIC_PAGE_VISUALS)) {
      expect(visual.src).toMatch(/^\/images\//);
      expect(visual.alt.trim().length).toBeGreaterThan(10);
      expect(existsSync(resolve(appRoot, 'public', visual.src.slice(1)))).toBe(true);
    }
  });

  it('keeps article imagery on note pages instead of repeating it in the archive', () => {
    const archive = readFileSync(resolve(appRoot, 'components/blog/BlogPageClient.tsx'), 'utf8');
    const card = readFileSync(resolve(appRoot, 'components/blog/BlogPostCard.tsx'), 'utf8');
    expect(archive).toContain('showImage={false}');
    expect(card).toContain('showImage?: boolean');
  });

  it('gives every published note article its own local image', () => {
    const noteImages = listBlogPosts().map((post) => {
      expect(post.featured_image, `${post.slug} should have a featured image`).toBeTruthy();
      return post.featured_image as string;
    });
    const allImages = [...publicPageCoverage.map((page) => page.image), ...noteImages];

    expect(new Set(allImages).size).toBe(allImages.length);

    for (const image of noteImages) {
      expect(image).toMatch(/^\/images\/notes\//);
      expect(existsSync(resolve(appRoot, 'public', image.slice(1)))).toBe(true);
    }
  });

  it('gives every intended public static page one distinct primary image', () => {
    const images = publicPageCoverage.map((page) => page.image);
    expect(new Set(images).size).toBe(images.length);

    for (const page of publicPageCoverage) {
      const source = readFileSync(resolve(appRoot, page.source), 'utf8');
      expect(source, `${page.route} should retain ${page.marker}`).toContain(page.marker);
      expect(existsSync(resolve(appRoot, 'public', page.image.slice(1)))).toBe(true);
    }
  });
});
