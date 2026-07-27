import { describe, expect, it } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const APP_ROOT = resolve(__dirname, '..');

const retiredPaths = [
  'app/shop',
  'app/wishlist',
  'app/recently-viewed',
  'app/admin/shop',
  'app/admin/products',
  'app/admin/product-analytics',
  'app/api/pricing/products',
  'app/api/shop/products',
  'app/api/recommendations',
  'app/api/wishlist',
  'components/ProductCard.tsx',
  'context/WishlistContext.tsx',
  'context/ComparisonContext.tsx',
  'context/BrowsingHistoryContext.tsx',
];

describe('retired storefront surface', () => {
  it('keeps product storefront and administration paths retired', () => {
    for (const retiredPath of retiredPaths) {
      expect(existsSync(resolve(APP_ROOT, retiredPath)), `${retiredPath} should remain retired`).toBe(false);
    }
  });

  it('keeps storefront links and global providers out of retained shells', () => {
    const sources = [
      'app/layout.tsx',
      'app/sitemap.ts',
      'components/Navigation.tsx',
      'components/AdminSidebar.tsx',
      'components/AdminDashboard.tsx',
      'lib/page-config.ts',
    ].map((source) => readFileSync(resolve(APP_ROOT, source), 'utf8'));

    for (const source of sources) {
      expect(source).not.toContain("href: '/shop'");
      expect(source).not.toContain('href="/shop"');
      expect(source).not.toContain('/admin/shop');
      expect(source).not.toContain('WishlistProvider');
      expect(source).not.toContain('ComparisonProvider');
      expect(source).not.toContain('BrowsingHistoryProvider');
    }
  });
});
