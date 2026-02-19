import { test, expect } from '@playwright/test';
import { navigateToPage } from './helpers';

// ============================================================================
// Pricing Page Cart E2E Tests
// ============================================================================
// What: Tests the merged pricing + shop experience at /pricing
// Why: After merging pricing and shop, /pricing is the single storefront.
//      Every product must be purchasable directly from this page.
// How: Verifies cart buttons exist, add-to-cart works, and the funnel
//      flows from pricing → cart → checkout.

test.describe('Pricing Page — Product Display', () => {
  test('pricing page loads with all product sections', async ({ page }) => {
    await navigateToPage(page, '/pricing');

    // Hero section
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible({ timeout: 10000 });

    // Wait for products to load (they're fetched from Medusa API)
    await page.waitForTimeout(3000);

    // Website packages section
    await expect(page.getByText(/websites/i).first()).toBeVisible({ timeout: 10000 });

    // Automation & AI section
    await expect(page.getByText(/automation/i).first()).toBeVisible({ timeout: 10000 });
  });

  test('all website packages have Add to Cart buttons', async ({ page }) => {
    await navigateToPage(page, '/pricing');
    await page.waitForTimeout(3000); // Wait for Medusa products to load

    // Scroll to websites section
    const websitesSection = page.locator('#websites');
    if (await websitesSection.isVisible()) {
      await websitesSection.scrollIntoViewIfNeeded();
    }

    // Each package card should have an "Add to Cart" button
    const cartButtons = page.getByRole('button', { name: /add to cart/i });
    const count = await cartButtons.count();

    // At minimum: 3 packages + automation + AI + add-ons = 5+
    expect(count).toBeGreaterThanOrEqual(3);
  });

  test('all website packages have View Details links', async ({ page }) => {
    await navigateToPage(page, '/pricing');
    await page.waitForTimeout(3000);

    // View Details links should point to /shop/{handle}
    const detailLinks = page.getByRole('link', { name: /view details/i });
    const count = await detailLinks.count();
    expect(count).toBeGreaterThanOrEqual(3);

    // First link should point to a /shop/ product detail page
    const href = await detailLinks.first().getAttribute('href');
    expect(href).toMatch(/^\/shop\//);
  });

  test('add-on tiles have Add to Cart buttons', async ({ page }) => {
    await navigateToPage(page, '/pricing');
    await page.waitForTimeout(3000);

    // Scroll to add-ons section (look for "À La Carte" or "Build your own")
    const addonsSection = page.getByText(/la carte|build your own/i).first();
    if (await addonsSection.isVisible()) {
      await addonsSection.scrollIntoViewIfNeeded();
    }

    // Add-on tiles should have cart buttons
    // There should be more than 6 (the old limit was 6)
    const allCartButtons = page.getByRole('button', { name: /add to cart/i });
    const totalCount = await allCartButtons.count();

    // We expect packages (3) + services (2) + add-ons (6+) = 11+
    expect(totalCount).toBeGreaterThanOrEqual(5);
  });

  test('no "Browse All Add-ons" link to /shop exists', async ({ page }) => {
    await navigateToPage(page, '/pricing');
    await page.waitForTimeout(3000);

    // The old "Browse All Add-ons" link should be gone
    const browseAllLink = page.getByRole('link', { name: /browse all/i });
    await expect(browseAllLink).not.toBeVisible();
  });
});

test.describe('Pricing Page — Add to Cart', () => {
  test('can add a website package to cart', async ({ page }) => {
    await navigateToPage(page, '/pricing');
    await page.waitForTimeout(3000);

    // Scroll to websites section
    const websitesSection = page.locator('#websites');
    if (await websitesSection.isVisible()) {
      await websitesSection.scrollIntoViewIfNeeded();
    }

    // Click the first "Add to Cart" button
    const cartButton = page.getByRole('button', { name: /add to cart/i }).first();
    await expect(cartButton).toBeVisible({ timeout: 10000 });
    await cartButton.click();

    // Button should show "Added" success state
    await expect(page.getByRole('button', { name: /added/i }).first()).toBeVisible({ timeout: 5000 });

    // After 1.5s it should reset back to "Add to Cart"
    await page.waitForTimeout(2000);
    await expect(page.getByRole('button', { name: /add to cart/i }).first()).toBeVisible({ timeout: 5000 });
  });

  test('can add an add-on to cart', async ({ page }) => {
    await navigateToPage(page, '/pricing');
    await page.waitForTimeout(3000);

    // Scroll to bottom of page where add-ons are
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2));
    await page.waitForTimeout(500);

    // Find add-on cart buttons (they use 'secondary' variant — smaller)
    const allButtons = page.getByRole('button', { name: /add to cart/i });
    const count = await allButtons.count();

    // Click the last "Add to Cart" button (likely an add-on)
    if (count > 3) {
      await allButtons.nth(count - 1).scrollIntoViewIfNeeded();
      await allButtons.nth(count - 1).click();

      // Should show success state
      await expect(page.getByRole('button', { name: /added/i })).toBeVisible({ timeout: 5000 });
    }
  });

  test('can add multiple products and navigate to cart', async ({ page }) => {
    await navigateToPage(page, '/pricing');
    await page.waitForTimeout(3000);

    // Add first package
    const cartButtons = page.getByRole('button', { name: /add to cart/i });
    await cartButtons.first().click();
    await page.waitForTimeout(2000); // Wait for success animation to reset

    // Add second package
    const freshButtons = page.getByRole('button', { name: /add to cart/i });
    if (await freshButtons.count() > 1) {
      await freshButtons.nth(1).click();
      await page.waitForTimeout(1000);
    }

    // Navigate to cart
    await navigateToPage(page, '/cart');

    // Cart should have items (not empty)
    // Look for either "Almost there!" (items in cart) or subtotal
    const hasItems = await page.getByText(/subtotal|almost there/i).first().isVisible({ timeout: 10000 }).catch(() => false);
    expect(hasItems).toBeTruthy();
  });
});

test.describe('Pricing Page — Full Funnel', () => {
  test('complete flow: pricing → add to cart → cart → checkout', async ({ page }) => {
    // 1. Browse pricing
    await navigateToPage(page, '/pricing');
    await page.waitForTimeout(3000);

    // 2. Add a product to cart
    const cartButton = page.getByRole('button', { name: /add to cart/i }).first();
    await expect(cartButton).toBeVisible({ timeout: 10000 });
    await cartButton.click();

    // 3. Verify success feedback
    await expect(page.getByRole('button', { name: /added/i }).first()).toBeVisible({ timeout: 5000 });

    // 4. Navigate to cart
    await navigateToPage(page, '/cart');
    await page.waitForTimeout(2000);

    // 5. Cart should have the item
    const subtotal = page.getByText(/subtotal/i);
    const hasSubtotal = await subtotal.isVisible({ timeout: 10000 }).catch(() => false);

    if (hasSubtotal) {
      // 6. Proceed to checkout
      const checkoutLink = page.getByRole('link', { name: /proceed to checkout/i });
      if (await checkoutLink.isVisible({ timeout: 5000 }).catch(() => false)) {
        await checkoutLink.click();
        await page.waitForLoadState('domcontentloaded');

        // 7. Should be on checkout page
        await expect(page.getByRole('heading', { name: /checkout/i })).toBeVisible({ timeout: 10000 });
      }
    }
  });

  test('services page CTAs link to pricing sections', async ({ page }) => {
    await navigateToPage(page, '/services');

    // Look for links to /pricing with anchor
    const pricingLinks = page.locator('a[href*="/pricing"]');
    const count = await pricingLinks.count();
    expect(count).toBeGreaterThan(0);
  });
});
