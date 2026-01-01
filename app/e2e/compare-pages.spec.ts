import { test } from '@playwright/test';
import { discoverPublicPages } from './utils/page-discovery';

// ============================================================================
// Compare Pages Screenshot Test
// ============================================================================
// Captures all public pages for visual comparison.
// Uses dynamic page discovery - no hardcoded list needed.

test('capture all customer-facing pages for comparison', async ({ page }) => {
  // Use page discovery instead of hardcoded list
  const pages = discoverPublicPages().filter(p =>
    // Exclude dashboard (needs auth) and shop product pages (need data)
    !p.path.startsWith('/dashboard') && !p.path.includes('[')
  );

  for (const p of pages) {
    await page.goto(p.path);
    await page.waitForLoadState('networkidle');
    const slug = p.path === '/' ? 'home' : p.path.slice(1).replace(/\//g, '-');
    await page.screenshot({
      path: `e2e/screenshots/compare-${slug}.png`,
      fullPage: true,
    });
    console.log(`Captured ${p.name} (${p.path})`);
  }
});
