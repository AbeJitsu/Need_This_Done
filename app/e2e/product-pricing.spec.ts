import { test, expect } from '@playwright/test';
import { navigateToPage } from './helpers';

// ============================================================================
// Product Pricing Regression Tests
// ============================================================================
// What: Ensures all products display correct (non-zero) prices everywhere
// Why: Medusa v2 requires region_id to return pricing data. Without it,
//      products show $0.00 — a critical sales-killing bug.
// How: Validates pricing at the API layer and on rendered product pages.
//
// Root cause this prevents:
//   medusaClient.products.getByHandle() was NOT passing region_id,
//   so Medusa v2 returned no pricing → ProductDetailClient showed $0.00.
//   The pricing API (/api/pricing/products) was unaffected because it
//   fetches region_id separately. The inconsistency was the bug.

test.describe('Product Pricing — No $0.00 Regression', () => {
  test('pricing API returns non-zero prices for all packages', async ({
    request,
  }) => {
    const response = await request.get('/api/pricing/products');
    expect(response.ok()).toBeTruthy();

    const data = await response.json();

    // All three package tiers must exist
    expect(data.packages.length).toBeGreaterThanOrEqual(3);

    // Every package must have a price greater than zero
    for (const pkg of data.packages) {
      expect(
        pkg.price,
        `Package "${pkg.title}" (${pkg.handle}) has $0 price — region_id likely missing from Medusa query`
      ).toBeGreaterThan(0);

      // Deposit percent must be set
      expect(pkg.depositPercent).toBeGreaterThan(0);

      // Features array must not be empty
      expect(
        pkg.features.length,
        `Package "${pkg.title}" has no features — metadata not included in Medusa query`
      ).toBeGreaterThan(0);
    }
  });

  test('pricing API returns non-zero prices for all add-ons', async ({
    request,
  }) => {
    const response = await request.get('/api/pricing/products');
    const data = await response.json();

    expect(data.addons.length).toBeGreaterThan(0);

    for (const addon of data.addons) {
      expect(
        addon.price,
        `Add-on "${addon.title}" (${addon.handle}) has $0 price`
      ).toBeGreaterThan(0);
    }
  });

  test('pricing API returns non-zero prices for all services', async ({
    request,
  }) => {
    const response = await request.get('/api/pricing/products');
    const data = await response.json();

    expect(data.services.length).toBeGreaterThan(0);

    for (const service of data.services) {
      expect(
        service.price,
        `Service "${service.title}" (${service.handle}) has $0 price`
      ).toBeGreaterThan(0);
    }
  });

  test('product detail page shows non-zero price for each package', async ({
    page,
  }) => {
    // Get the canonical package handles from the pricing API
    const handles = ['starter-site', 'growth-site', 'pro-site'];

    for (const handle of handles) {
      await navigateToPage(page, `/shop/${handle}`);

      // Wait for the price to render (server-side fetch, then client hydration)
      const priceElement = page.locator('text=/\\$\\d+/').first();
      await expect(priceElement).toBeVisible({ timeout: 15000 });

      // Extract the displayed price text
      const priceText = await priceElement.textContent();

      // Price must NOT be $0.00 — this is the exact bug we're preventing
      expect(
        priceText,
        `Product page /shop/${handle} shows $0.00 — medusaClient is not passing region_id to Medusa`
      ).not.toMatch(/^\$0\.00$/);

      // Price should be a real amount (at least $1)
      const priceMatch = priceText?.match(/\$([0-9,]+\.?\d*)/);
      expect(priceMatch, `Could not parse price from "${priceText}" on /shop/${handle}`).toBeTruthy();

      const dollars = parseFloat(priceMatch![1].replace(',', ''));
      expect(
        dollars,
        `Product /shop/${handle} displays $${dollars} — expected a real price > $0`
      ).toBeGreaterThan(0);
    }
  });

  test('pricing page and product detail page show consistent prices', async ({
    page,
    request,
  }) => {
    // Get prices from the API
    const response = await request.get('/api/pricing/products');
    const data = await response.json();

    // Check each package's detail page matches the API price
    for (const pkg of data.packages) {
      await navigateToPage(page, `/shop/${pkg.handle}`);

      // Wait for price to render
      const priceElement = page.locator('text=/\\$\\d+/').first();
      await expect(priceElement).toBeVisible({ timeout: 15000 });

      const priceText = await priceElement.textContent();
      const expectedDollars = (pkg.price / 100).toFixed(2);

      // The rendered price should match the API price
      expect(
        priceText,
        `Price mismatch on /shop/${pkg.handle}: page shows "${priceText}" but API says $${expectedDollars}`
      ).toContain(expectedDollars);
    }
  });
});
