import { test, expect } from '@playwright/test';
import { loginAsAdmin, loginAsUser, waitForPageReady, enableDarkMode } from './helpers';

// ============================================================================
// Mobile Dark Mode Screenshots
// ============================================================================
// Captures screenshots of all pages in mobile viewport (390×844 iPhone 12) with dark theme
// Run with: npm run test:e2e -- screenshots-mobile-dark.spec.ts --update-snapshots --project=mobile

test.describe('Screenshots - Mobile - Dark Mode', () => {
  // ============================================================================
  // Public Pages
  // ============================================================================

  test('Home page', async ({ page }) => {
    await page.goto('/');
    await enableDarkMode(page);
    await waitForPageReady(page);
    await expect(page).toHaveScreenshot('public/home/mobile-dark.png');
  });

  test('Pricing page', async ({ page }) => {
    await page.goto('/pricing');
    await enableDarkMode(page);
    await waitForPageReady(page);
    await expect(page).toHaveScreenshot('public/pricing/mobile-dark.png');
  });

  test('Services page', async ({ page }) => {
    await page.goto('/services');
    await enableDarkMode(page);
    await waitForPageReady(page);
    await expect(page).toHaveScreenshot('public/services/mobile-dark.png');
  });

  test('How It Works page', async ({ page }) => {
    await page.goto('/how-it-works');
    await enableDarkMode(page);
    await waitForPageReady(page);
    await expect(page).toHaveScreenshot('public/how-it-works/mobile-dark.png');
  });

  test('FAQ page', async ({ page }) => {
    await page.goto('/faq');
    await enableDarkMode(page);
    await waitForPageReady(page);
    await expect(page).toHaveScreenshot('public/faq/mobile-dark.png');
  });

  test('Get Started page', async ({ page }) => {
    await page.goto('/get-started');
    await enableDarkMode(page);
    await waitForPageReady(page);
    await expect(page).toHaveScreenshot('public/get-started/mobile-dark.png');
  });

  test('Contact page', async ({ page }) => {
    await page.goto('/contact');
    await enableDarkMode(page);
    await waitForPageReady(page);
    await expect(page).toHaveScreenshot('public/contact/mobile-dark.png');
  });

  test('Shop page', async ({ page }) => {
    await page.goto('/shop');
    await enableDarkMode(page);
    await waitForPageReady(page);
    await expect(page).toHaveScreenshot('public/shop/mobile-dark.png');
  });

  test('Cart page', async ({ page }) => {
    await page.goto('/cart');
    await enableDarkMode(page);
    await waitForPageReady(page);
    await expect(page).toHaveScreenshot('public/cart/mobile-dark.png');
  });

  test('Checkout page', async ({ page }) => {
    await page.goto('/checkout');
    await enableDarkMode(page);
    await waitForPageReady(page);
    await expect(page).toHaveScreenshot('public/checkout/mobile-dark.png');
  });

  test('Login page', async ({ page }) => {
    await page.goto('/login');
    await enableDarkMode(page);
    await waitForPageReady(page);
    await expect(page).toHaveScreenshot('public/login/mobile-dark.png');
  });

  // ============================================================================
  // Dashboard Pages
  // ============================================================================

  test('Dashboard - User view', async ({ page }) => {
    await loginAsUser(page);
    await page.goto('/dashboard');
    await enableDarkMode(page);
    await waitForPageReady(page);
    await expect(page).toHaveScreenshot('dashboard/user/mobile-dark.png');
  });

  test('Dashboard - Admin view', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/dashboard');
    await enableDarkMode(page);
    await waitForPageReady(page);
    await expect(page).toHaveScreenshot('dashboard/admin/mobile-dark.png');
  });

  // ============================================================================
  // Admin Pages
  // ============================================================================

  test('Admin - Products page', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/admin/products');
    await enableDarkMode(page);
    await waitForPageReady(page);
    await expect(page).toHaveScreenshot('admin/products/mobile-dark.png');
  });

  test('Admin - Orders page', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/admin/orders');
    await enableDarkMode(page);
    await waitForPageReady(page);
    await expect(page).toHaveScreenshot('admin/orders/mobile-dark.png');
  });

  test('Admin - Appointments page', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/admin/appointments');
    await enableDarkMode(page);
    await waitForPageReady(page);
    await expect(page).toHaveScreenshot('admin/appointments/mobile-dark.png');
  });

  test('Admin - Users page', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/admin/users');
    await enableDarkMode(page);
    await waitForPageReady(page);
    await expect(page).toHaveScreenshot('admin/users/mobile-dark.png');
  });

  test('Admin - Pages list', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/admin/pages');
    await enableDarkMode(page);
    await waitForPageReady(page);
    await expect(page).toHaveScreenshot('admin/pages/mobile-dark.png');
  });

  test('Admin - New page', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/admin/pages/new');
    await enableDarkMode(page);
    await waitForPageReady(page);
    await expect(page).toHaveScreenshot('admin/pages-new/mobile-dark.png');
  });

  test('Admin - Content list', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/admin/content');
    await enableDarkMode(page);
    await waitForPageReady(page);
    await expect(page).toHaveScreenshot('admin/content/mobile-dark.png');
  });

  test('Admin - Shop dashboard', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/admin/shop');
    await enableDarkMode(page);
    await waitForPageReady(page);
    await expect(page).toHaveScreenshot('admin/shop/mobile-dark.png');
  });

  test('Admin - Shop orders', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/admin/shop/orders');
    await enableDarkMode(page);
    await waitForPageReady(page);
    await expect(page).toHaveScreenshot('admin/shop-orders/mobile-dark.png');
  });

  test('Admin - New product', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/admin/shop/products/new');
    await enableDarkMode(page);
    await waitForPageReady(page);
    await expect(page).toHaveScreenshot('admin/shop-products-new/mobile-dark.png');
  });

  test('Admin - Dev tools', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/admin/dev');
    await enableDarkMode(page);
    await waitForPageReady(page);
    await expect(page).toHaveScreenshot('admin/dev/mobile-dark.png');
  });
});
