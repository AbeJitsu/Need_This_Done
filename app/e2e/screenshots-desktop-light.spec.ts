import { test, expect } from '@playwright/test';
import { loginAsAdmin, loginAsUser, waitForPageReady } from './helpers';

// ============================================================================
// Desktop Light Mode Screenshots
// ============================================================================
// Captures screenshots of all pages in desktop viewport (1280×720) with light theme
// Run with: npm run test:e2e -- screenshots-desktop-light.spec.ts --update-snapshots --project=chromium

test.describe('Screenshots - Desktop - Light Mode', () => {
  // ============================================================================
  // Public Pages
  // ============================================================================

  test('Home page', async ({ page }) => {
    await page.goto('/');
    await waitForPageReady(page);
    await expect(page).toHaveScreenshot('public/home/desktop-light.png');
  });

  test('Pricing page', async ({ page }) => {
    await page.goto('/pricing');
    await waitForPageReady(page);
    await expect(page).toHaveScreenshot('public/pricing/desktop-light.png');
  });

  test('Services page', async ({ page }) => {
    await page.goto('/services');
    await waitForPageReady(page);
    await expect(page).toHaveScreenshot('public/services/desktop-light.png');
  });

  test('How It Works page', async ({ page }) => {
    await page.goto('/how-it-works');
    await waitForPageReady(page);
    await expect(page).toHaveScreenshot('public/how-it-works/desktop-light.png');
  });

  test('FAQ page', async ({ page }) => {
    await page.goto('/faq');
    await waitForPageReady(page);
    await expect(page).toHaveScreenshot('public/faq/desktop-light.png');
  });

  test('Get Started page', async ({ page }) => {
    await page.goto('/get-started');
    await waitForPageReady(page);
    await expect(page).toHaveScreenshot('public/get-started/desktop-light.png');
  });

  test('Contact page', async ({ page }) => {
    await page.goto('/contact');
    await waitForPageReady(page);
    await expect(page).toHaveScreenshot('public/contact/desktop-light.png');
  });

  test('Shop page', async ({ page }) => {
    await page.goto('/shop');
    await waitForPageReady(page);
    await expect(page).toHaveScreenshot('public/shop/desktop-light.png');
  });

  test('Cart page', async ({ page }) => {
    await page.goto('/cart');
    await waitForPageReady(page);
    await expect(page).toHaveScreenshot('public/cart/desktop-light.png');
  });

  test('Checkout page', async ({ page }) => {
    await page.goto('/checkout');
    await waitForPageReady(page);
    await expect(page).toHaveScreenshot('public/checkout/desktop-light.png');
  });

  test('Login page', async ({ page }) => {
    await page.goto('/login');
    await waitForPageReady(page);
    await expect(page).toHaveScreenshot('public/login/desktop-light.png');
  });

  // ============================================================================
  // Dashboard Pages
  // ============================================================================

  test('Dashboard - User view', async ({ page }) => {
    await loginAsUser(page);
    await page.goto('/dashboard');
    await waitForPageReady(page);
    await expect(page).toHaveScreenshot('dashboard/user/desktop-light.png');
  });

  test('Dashboard - Admin view', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/dashboard');
    await waitForPageReady(page);
    await expect(page).toHaveScreenshot('dashboard/admin/desktop-light.png');
  });

  // ============================================================================
  // Admin Pages
  // ============================================================================

  test('Admin - Products page', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/admin/products');
    await waitForPageReady(page);
    await expect(page).toHaveScreenshot('admin/products/desktop-light.png');
  });

  test('Admin - Orders page', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/admin/orders');
    await waitForPageReady(page);
    await expect(page).toHaveScreenshot('admin/orders/desktop-light.png');
  });

  test('Admin - Appointments page', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/admin/appointments');
    await waitForPageReady(page);
    await expect(page).toHaveScreenshot('admin/appointments/desktop-light.png');
  });

  test('Admin - Users page', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/admin/users');
    await waitForPageReady(page);
    await expect(page).toHaveScreenshot('admin/users/desktop-light.png');
  });

  test('Admin - Pages list', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/admin/pages');
    await waitForPageReady(page);
    await expect(page).toHaveScreenshot('admin/pages/desktop-light.png');
  });

  test('Admin - New page', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/admin/pages/new');
    await waitForPageReady(page);
    await expect(page).toHaveScreenshot('admin/pages-new/desktop-light.png');
  });

  test('Admin - Content list', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/admin/content');
    await waitForPageReady(page);
    await expect(page).toHaveScreenshot('admin/content/desktop-light.png');
  });

  test('Admin - Shop dashboard', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/admin/shop');
    await waitForPageReady(page);
    await expect(page).toHaveScreenshot('admin/shop/desktop-light.png');
  });

  test('Admin - Shop orders', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/admin/shop/orders');
    await waitForPageReady(page);
    await expect(page).toHaveScreenshot('admin/shop-orders/desktop-light.png');
  });

  test('Admin - New product', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/admin/shop/products/new');
    await waitForPageReady(page);
    await expect(page).toHaveScreenshot('admin/shop-products-new/desktop-light.png');
  });

  test('Admin - Dev tools', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/admin/dev');
    await waitForPageReady(page);
    await expect(page).toHaveScreenshot('admin/dev/desktop-light.png');
  });
});
