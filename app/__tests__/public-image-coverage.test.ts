import { describe, expect, it } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { PUBLIC_PAGE_VISUALS } from '@/components/public/PublicPageVisual';

const appRoot = resolve(__dirname, '..');

const publicPageCoverage = [
  { route: '/', source: 'components/home/HomePageClient.tsx', markers: ['/images/portfolio-hero.png'] },
  { route: '/services', source: 'components/services/ServicesPageClient.tsx', markers: ['PublicPageVisual', 'interface-craft'] },
  { route: '/work', source: 'components/work/WorkPageClient.tsx', markers: ['/images/portfolio-hero.png'] },
  { route: '/about', source: 'app/about/page.tsx', markers: ['PublicPageVisual', 'problem-map'] },
  { route: '/how-it-works', source: 'app/how-it-works/page.tsx', markers: ['PublicPageVisual', 'workflow-path'] },
  { route: '/website-fix', source: 'components/public/OfferPage.tsx', markers: ['PublicPageVisual', 'interface-craft'] },
  { route: '/managed-automation', source: 'components/public/OfferPage.tsx', markers: ['PublicPageVisual', 'workflow-path'] },
  { route: '/pricing', source: 'components/pricing/UnifiedPricingPage.tsx', markers: ['PublicPageVisual', 'workflow-path'] },
  { route: '/contact', source: 'app/contact/page.tsx', markers: ['PublicPageVisual', 'conversation-start'] },
  { route: '/ada-compliance', source: 'app/ada-compliance/page.tsx', markers: ['PublicPageVisual', 'interface-craft'] },
  { route: '/faq', source: 'components/faq/FAQPageClient.tsx', markers: ['PublicPageVisual', 'conversation-start'] },
  { route: '/blog', source: 'components/blog/BlogPostCard.tsx', markers: ['featured_image'] },
  { route: '/blog/[slug]', source: 'app/blog/[slug]/page.tsx', markers: ['featured_image'] },
  { route: '/system', source: 'app/system/page.tsx', markers: ['PublicPageVisual', 'problem-map'] },
  { route: '/privacy and /terms', source: 'components/legal/LegalPageClient.tsx', markers: ['PublicPageVisual', 'conversation-start', 'workflow-path'] },
] as const;

describe('public page image coverage', () => {
  it('keeps every generated public visual local and accessible', () => {
    for (const visual of Object.values(PUBLIC_PAGE_VISUALS)) {
      expect(visual.src).toMatch(/^\/images\//);
      expect(visual.alt.trim().length).toBeGreaterThan(10);
      expect(existsSync(resolve(appRoot, 'public', visual.src.slice(1)))).toBe(true);
    }
  });

  it('keeps a real image path or visual component on every intended public page', () => {
    for (const page of publicPageCoverage) {
      const source = readFileSync(resolve(appRoot, page.source), 'utf8');
      for (const marker of page.markers) {
        expect(source, `${page.route} should retain ${marker}`).toContain(marker);
      }
    }
  });
});
