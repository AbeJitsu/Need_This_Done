import { test, expect } from '@playwright/test';
import { loginAsAdmin, loginAsUser, waitForPageReady } from './helpers';

// ============================================================================
// Mobile Light Mode Screenshots
// ============================================================================
// Captures screenshots of all pages in mobile viewport (390×844 iPhone 12) with light theme
// Run with: npm run test:e2e -- screenshots-mobile-light.spec.ts --update-snapshots --project=mobile

test.describe('Screenshots - Mobile - Light Mode', () => {
  // ============================================================================
  // Public Pages
  // ============================================================================

  test('Home page', async ({ page }) => {
    await page.goto('/');
    await waitForPageReady(page);
    await expect(page).toHaveScreenshot('public/home/mobile-light.png');
  });

  test('Pricing page', async ({ page }) => {
    await page.goto('/pricing');
    await waitForPageReady(page);
    await expect(page).toHaveScreenshot('public/pricing/mobile-light.png');
  });

  test('Services page', async ({ page }) => {
    await page.goto('/services');
    await waitForPageReady(page);
    await expect(page).toHaveScreenshot('public/services/mobile-light.png');
  });

  test('How It Works page', async ({ page }) => {
    await page.goto('/how-it-works');
    await waitForPageReady(page);
    await expect(page).toHaveScreenshot('public/how-it-works/mobile-light.png');
  });

  test('FAQ page', async ({ page }) => {
    await page.goto('/faq');
    await waitForPageReady(page);
    await expect(page).toHaveScreenshot('public/faq/mobile-light.png');
  });

  test('Get Started page', async ({ page }) => {
    await page.goto('/get-started');
    await waitForPageReady(page);
    await expect(page).toHaveScreenshot('public/get-started/mobile-light.png');
  });

  test('Contact page', async ({ page }) => {
    await page.goto('/contact');
    await waitForPageReady(page);
    await expect(page).toHaveScreenshot('public/contact/mobile-light.png');
  });

  test('Shop page', async ({ page }) => {
    await page.goto('/shop');
    await waitForPageReady(page);
    await expect(page).toHaveScreenshot('public/shop/mobile-light.png');
  });

  test('Cart page', async ({ page }) => {
    await page.goto('/cart');
    await waitForPageReady(page);
    await expect(page).toHaveScreenshot('public/cart/mobile-light.png');
  });

  test('Checkout page', async ({ page }) => {
    await page.goto('/checkout');
    await waitForPageReady(page);
    await expect(page).toHaveScreenshot('public/checkout/mobile-light.png');
  });

  test('Login page', async ({ page }) => {
    await page.goto('/login');
    await waitForPageReady(page);
    await expect(page).toHaveScreenshot('public/login/mobile-light.png');
  });

  // ============================================================================
  // Dashboard Pages
  // ============================================================================

  test('Dashboard - User view', async ({ page }) => {
    await loginAsUser(page);
    await page.goto('/dashboard');
    await waitForPageReady(page);
    await expect(page).toHaveScreenshot('dashboard/user/mobile-light.png');
  });

  test('Dashboard - Admin view', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/dashboard');
    await waitForPageReady(page);
    await expect(page).toHaveScreenshot('dashboard/admin/mobile-light.png');
  });

  // ============================================================================
  // Admin Pages
  // ============================================================================

  test('Admin - Products page', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/admin/products');
    await waitForPageReady(page);
    await expect(page).toHaveScreenshot('admin/products/mobile-light.png');
  });

  test('Admin - Orders page', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/admin/orders');
    await waitForPageReady(page);
    await expect(page).toHaveScreenshot('admin/orders/mobile-light.png');
  });

  test('Admin - Appointments page', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/admin/appointments');
    await waitForPageReady(page);
    await expect(page).toHaveScreenshot('admin/appointments/mobile-light.png');
  });

  test('Admin - Users page', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/admin/users');
    await waitForPageReady(page);
    await expect(page).toHaveScreenshot('admin/users/mobile-light.png');
  });

  test('Admin - Pages list', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/admin/pages');
    await waitForPageReady(page);
    await expect(page).toHaveScreenshot('admin/pages/mobile-light.png');
  });

  test('Admin - New page', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/admin/pages/new');
    await waitForPageReady(page);
    await expect(page).toHaveScreenshot('admin/pages-new/mobile-light.png');
  });

  test('Admin - Content list', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/admin/content');
    await waitForPageReady(page);
    await expect(page).toHaveScreenshot('admin/content/mobile-light.png');
  });

  test('Admin - Shop dashboard', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/admin/shop');
    await waitForPageReady(page);
    await expect(page).toHaveScreenshot('admin/shop/mobile-light.png');
  });

  test('Admin - Shop orders', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/admin/shop/orders');
    await waitForPageReady(page);
    await expect(page).toHaveScreenshot('admin/shop-orders/mobile-light.png');
  });

  test('Admin - New product', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/admin/shop/products/new');
    await waitForPageReady(page);
    await expect(page).toHaveScreenshot('admin/shop-products-new/mobile-light.png');
  });

  test('Admin - Dev tools', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/admin/dev');
    await waitForPageReady(page);
    await expect(page).toHaveScreenshot('admin/dev/mobile-light.png');
  });
});
