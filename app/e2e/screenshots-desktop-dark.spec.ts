import { test, expect } from '@playwright/test';
import { loginAsAdmin, loginAsUser, waitForPageReady, enableDarkMode } from './helpers';

// ============================================================================
// Desktop Dark Mode Screenshots
// ============================================================================
// Captures screenshots of all pages in desktop viewport (1280×720) with dark theme
// Run with: npm run test:e2e -- screenshots-desktop-dark.spec.ts --update-snapshots --project=chromium

test.describe('Screenshots - Desktop - Dark Mode', () => {
  // ============================================================================
  // Public Pages
  // ============================================================================

  test('Home page', async ({ page }) => {
    await page.goto('/');
    await enableDarkMode(page);
    await waitForPageReady(page);
    await expect(page).toHaveScreenshot('public/home/desktop-dark.png');
  });

  test('Pricing page', async ({ page }) => {
    await page.goto('/pricing');
    await enableDarkMode(page);
    await waitForPageReady(page);
    await expect(page).toHaveScreenshot('public/pricing/desktop-dark.png');
  });

  test('Services page', async ({ page }) => {
    await page.goto('/services');
    await enableDarkMode(page);
    await waitForPageReady(page);
    await expect(page).toHaveScreenshot('public/services/desktop-dark.png');
  });

  test('How It Works page', async ({ page }) => {
    await page.goto('/how-it-works');
    await enableDarkMode(page);
    await waitForPageReady(page);
    await expect(page).toHaveScreenshot('public/how-it-works/desktop-dark.png');
  });

  test('FAQ page', async ({ page }) => {
    await page.goto('/faq');
    await enableDarkMode(page);
    await waitForPageReady(page);
    await expect(page).toHaveScreenshot('public/faq/desktop-dark.png');
  });

  test('Get Started page', async ({ page }) => {
    await page.goto('/get-started');
    await enableDarkMode(page);
    await waitForPageReady(page);
    await expect(page).toHaveScreenshot('public/get-started/desktop-dark.png');
  });

  test('Contact page', async ({ page }) => {
    await page.goto('/contact');
    await enableDarkMode(page);
    await waitForPageReady(page);
    await expect(page).toHaveScreenshot('public/contact/desktop-dark.png');
  });

  test('Shop page', async ({ page }) => {
    await page.goto('/shop');
    await enableDarkMode(page);
    await waitForPageReady(page);
    await expect(page).toHaveScreenshot('public/shop/desktop-dark.png');
  });

  test('Cart page', async ({ page }) => {
    await page.goto('/cart');
    await enableDarkMode(page);
    await waitForPageReady(page);
    await expect(page).toHaveScreenshot('public/cart/desktop-dark.png');
  });

  test('Checkout page', async ({ page }) => {
    await page.goto('/checkout');
    await enableDarkMode(page);
    await waitForPageReady(page);
    await expect(page).toHaveScreenshot('public/checkout/desktop-dark.png');
  });

  test('Login page', async ({ page }) => {
    await page.goto('/login');
    await enableDarkMode(page);
    await waitForPageReady(page);
    await expect(page).toHaveScreenshot('public/login/desktop-dark.png');
  });

  // ============================================================================
  // Dashboard Pages
  // ============================================================================

  test('Dashboard - User view', async ({ page }) => {
    await loginAsUser(page);
    await page.goto('/dashboard');
    await enableDarkMode(page);
    await waitForPageReady(page);
    await expect(page).toHaveScreenshot('dashboard/user/desktop-dark.png');
  });

  test('Dashboard - Admin view', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/dashboard');
    await enableDarkMode(page);
    await waitForPageReady(page);
    await expect(page).toHaveScreenshot('dashboard/admin/desktop-dark.png');
  });

  // ============================================================================
  // Admin Pages
  // ============================================================================

  test('Admin - Products page', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/admin/products');
    await enableDarkMode(page);
    await waitForPageReady(page);
    await expect(page).toHaveScreenshot('admin/products/desktop-dark.png');
  });

  test('Admin - Orders page', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/admin/orders');
    await enableDarkMode(page);
    await waitForPageReady(page);
    await expect(page).toHaveScreenshot('admin/orders/desktop-dark.png');
  });

  test('Admin - Appointments page', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/admin/appointments');
    await enableDarkMode(page);
    await waitForPageReady(page);
    await expect(page).toHaveScreenshot('admin/appointments/desktop-dark.png');
  });

  test('Admin - Users page', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/admin/users');
    await enableDarkMode(page);
    await waitForPageReady(page);
    await expect(page).toHaveScreenshot('admin/users/desktop-dark.png');
  });

  test('Admin - Pages list', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/admin/pages');
    await enableDarkMode(page);
    await waitForPageReady(page);
    await expect(page).toHaveScreenshot('admin/pages/desktop-dark.png');
  });

  test('Admin - New page', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/admin/pages/new');
    await enableDarkMode(page);
    await waitForPageReady(page);
    await expect(page).toHaveScreenshot('admin/pages-new/desktop-dark.png');
  });

  test('Admin - Content list', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/admin/content');
    await enableDarkMode(page);
    await waitForPageReady(page);
    await expect(page).toHaveScreenshot('admin/content/desktop-dark.png');
  });

  test('Admin - Shop dashboard', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/admin/shop');
    await enableDarkMode(page);
    await waitForPageReady(page);
    await expect(page).toHaveScreenshot('admin/shop/desktop-dark.png');
  });

  test('Admin - Shop orders', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/admin/shop/orders');
    await enableDarkMode(page);
    await waitForPageReady(page);
    await expect(page).toHaveScreenshot('admin/shop-orders/desktop-dark.png');
  });

  test('Admin - New product', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/admin/shop/products/new');
    await enableDarkMode(page);
    await waitForPageReady(page);
    await expect(page).toHaveScreenshot('admin/shop-products-new/desktop-dark.png');
  });

  test('Admin - Dev tools', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/admin/dev');
    await enableDarkMode(page);
    await waitForPageReady(page);
    await expect(page).toHaveScreenshot('admin/dev/desktop-dark.png');
  });
});
