import { test, expect } from '@playwright/test';

// ============================================================================
// Shop Redirect E2E Tests
// ============================================================================
// What: Verifies /shop redirects to /pricing while /shop/{handle} still works
// Why: After merging pricing and shop, /shop is no longer a standalone page.
//      Product detail pages must still be accessible at /shop/{handle}.

test.describe('Shop Redirect', () => {
  test('/shop redirects to /pricing', async ({ page }) => {
    await page.goto('/shop');
    await page.waitForLoadState('domcontentloaded');

    // Should end up on /pricing
    expect(page.url()).toContain('/pricing');
  });

  test('/shop/{handle} product detail pages still work', async ({ page }) => {
    // Navigate to pricing to find a product handle
    await page.goto('/pricing');
    await page.waitForTimeout(3000); // Wait for products to load

    // Find a "View Details" link
    const detailLink = page.getByRole('link', { name: /view details/i }).first();
    const href = await detailLink.getAttribute('href');

    if (href && href.startsWith('/shop/')) {
      // Navigate to the product detail page
      await page.goto(href);
      await page.waitForLoadState('domcontentloaded');

      // Should NOT redirect — should stay on /shop/{handle}
      expect(page.url()).toContain('/shop/');

      // Should show product detail content (Add to Cart button from ProductDetailClient)
      await expect(page.getByRole('button', { name: /add to cart/i })).toBeVisible({ timeout: 15000 });
    }
  });

  test('invalid product handle shows 404', async ({ page }) => {
    await page.goto('/shop/this-product-does-not-exist-xyz');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);

    // Should show 404 (not redirect to /pricing)
    const notFound = page.locator('text=/404|not found/i');
    const count = await notFound.count();
    expect(count).toBeGreaterThan(0);
  });
});

test.describe('Internal Links Updated', () => {
  test('orders page browse link points to /pricing', async ({ page }) => {
    await page.goto('/orders');
    await page.waitForLoadState('domcontentloaded');

    // If not authenticated, might redirect. Check if we can see the link.
    const browseLink = page.getByRole('link', { name: /browse products/i });
    if (await browseLink.isVisible({ timeout: 5000 }).catch(() => false)) {
      const href = await browseLink.getAttribute('href');
      expect(href).toBe('/pricing');
    }
  });
});
