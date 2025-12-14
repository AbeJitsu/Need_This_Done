import { test } from '@playwright/test';

// ============================================================================
// UX Flow Evaluation Tests
// ============================================================================
// Purpose: Walk through user flows and capture screenshots for UX review
// Run: npx playwright test ux-flow.spec.ts --headed
// Output: Screenshots saved to ux-screenshots/

// Increase timeout for UX flow tests (screenshots take time)
test.setTimeout(60000);

test.describe('UX Flow Evaluation', () => {
  test.beforeEach(async ({ page }) => {
    // Clear any existing cart state
    await page.addInitScript(() => {
      localStorage.clear();
    });
  });

  // ==========================================================================
  // Customer Journey: Browse → Shop → Cart → Checkout
  // ==========================================================================
  test('Customer Purchase Flow', async ({ page }) => {
    // 1. Home Page - First impression
    await page.goto('/');
    await page.waitForLoadState('load');
    await page.waitForTimeout(2000); // Allow dynamic content to render
    await page.screenshot({
      path: 'ux-screenshots/01-home.png',
      fullPage: true,
    });

    // 2. Navigate to Shop via navigation link
    await page.click('a[href="/shop"]');
    await page.waitForLoadState('load');
    await page.waitForTimeout(2000); // Wait for products to load
    await page.screenshot({
      path: 'ux-screenshots/02-shop.png',
      fullPage: true,
    });

    // 3. Click first product card to see details
    const productCard = page.locator('a[href^="/shop/"]').first();
    await productCard.click();
    await page.waitForLoadState('load');
    await page.waitForTimeout(1000);
    await page.screenshot({
      path: 'ux-screenshots/03-product-detail.png',
      fullPage: true,
    });

    // 4. Add to cart
    const addToCartBtn = page.getByRole('button', { name: /add.*cart/i });
    await addToCartBtn.click();
    await page.waitForTimeout(1500); // Wait for toast/feedback
    await page.screenshot({
      path: 'ux-screenshots/04-added-to-cart.png',
      fullPage: true,
    });

    // 5. Navigate to cart
    await page.goto('/cart');
    await page.waitForLoadState('load');
    await page.waitForTimeout(1000);
    await page.screenshot({
      path: 'ux-screenshots/05-cart.png',
      fullPage: true,
    });

    // 6. Proceed to checkout
    const checkoutBtn = page.getByRole('link', { name: /checkout/i });
    if (await checkoutBtn.isVisible()) {
      await checkoutBtn.click();
      await page.waitForLoadState('load');
      await page.waitForTimeout(1000);
      await page.screenshot({
        path: 'ux-screenshots/06-checkout.png',
        fullPage: true,
      });
    }
  });

  // ==========================================================================
  // Marketing Pages Flow
  // ==========================================================================
  test('Marketing Pages Flow', async ({ page }) => {
    // Services page
    await page.goto('/services');
    await page.waitForLoadState('load');
    await page.waitForTimeout(1000);
    await page.screenshot({
      path: 'ux-screenshots/07-services.png',
      fullPage: true,
    });

    // Pricing page
    await page.goto('/pricing');
    await page.waitForLoadState('load');
    await page.waitForTimeout(1000);
    await page.screenshot({
      path: 'ux-screenshots/08-pricing.png',
      fullPage: true,
    });

    // How it works page
    await page.goto('/how-it-works');
    await page.waitForLoadState('load');
    await page.waitForTimeout(1000);
    await page.screenshot({
      path: 'ux-screenshots/09-how-it-works.png',
      fullPage: true,
    });

    // FAQ page
    await page.goto('/faq');
    await page.waitForLoadState('load');
    await page.waitForTimeout(1000);
    await page.screenshot({
      path: 'ux-screenshots/10-faq.png',
      fullPage: true,
    });

    // Contact page
    await page.goto('/contact');
    await page.waitForLoadState('load');
    await page.waitForTimeout(1000);
    await page.screenshot({
      path: 'ux-screenshots/11-contact.png',
      fullPage: true,
    });

    // Login page
    await page.goto('/login');
    await page.waitForLoadState('load');
    await page.waitForTimeout(1000);
    await page.screenshot({
      path: 'ux-screenshots/12-login.png',
      fullPage: true,
    });
  });

  // ==========================================================================
  // Admin Flow (requires login)
  // ==========================================================================
  test('Admin Dashboard Flow', async ({ page }) => {
    // Skip if no admin credentials
    const adminEmail = process.env.E2E_ADMIN_EMAIL;
    const adminPassword = process.env.E2E_ADMIN_PASSWORD;

    if (!adminEmail || !adminPassword) {
      console.log('Skipping admin flow - no credentials in env');
      test.skip();
      return;
    }

    // Login as admin
    await page.goto('/login');
    await page.waitForLoadState('load');
    await page.waitForTimeout(1000);

    await page.fill('input[type="email"]', adminEmail);
    await page.fill('input[type="password"]', adminPassword);
    await page.click('button[type="submit"]');

    // Wait for redirect to dashboard
    await page.waitForURL('**/dashboard', { timeout: 15000 });
    await page.waitForLoadState('load');
    await page.waitForTimeout(2000);
    await page.screenshot({
      path: 'ux-screenshots/13-dashboard.png',
      fullPage: true,
    });

    // Admin appointments
    await page.goto('/admin/appointments');
    await page.waitForLoadState('load');
    await page.waitForTimeout(1500);
    await page.screenshot({
      path: 'ux-screenshots/14-admin-appointments.png',
      fullPage: true,
    });

    // Admin orders
    await page.goto('/admin/orders');
    await page.waitForLoadState('load');
    await page.waitForTimeout(1500);
    await page.screenshot({
      path: 'ux-screenshots/15-admin-orders.png',
      fullPage: true,
    });

    // Admin shop
    await page.goto('/admin/shop');
    await page.waitForLoadState('load');
    await page.waitForTimeout(1500);
    await page.screenshot({
      path: 'ux-screenshots/16-admin-shop.png',
      fullPage: true,
    });
  });
});
