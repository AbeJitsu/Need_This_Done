import { test, expect } from '@playwright/test';
import { loginAsAdmin, loginAsUser, waitForPageReady } from './helpers';

// ============================================================================
// Visual Regression Testing - All Pages
// ============================================================================
// Captures screenshots of all pages in both light and dark modes
// Playwright automatically runs tests across all projects (desktop/mobile)
// Run with: npm run test:e2e -- screenshots.spec.ts --update-snapshots

// ============================================================================
// Page Configuration
// ============================================================================

const publicPages = [
  { path: '/', name: 'home', folder: 'public/home' },
  { path: '/pricing', name: 'pricing', folder: 'public/pricing' },
  { path: '/services', name: 'services', folder: 'public/services' },
  { path: '/how-it-works', name: 'how-it-works', folder: 'public/how-it-works' },
  { path: '/faq', name: 'faq', folder: 'public/faq' },
  { path: '/get-started', name: 'get-started', folder: 'public/get-started' },
  { path: '/contact', name: 'contact', folder: 'public/contact' },
  { path: '/shop', name: 'shop', folder: 'public/shop' },
  { path: '/cart', name: 'cart', folder: 'public/cart' },
  { path: '/checkout', name: 'checkout', folder: 'public/checkout' },
  { path: '/login', name: 'login', folder: 'public/login' },
];

const dashboardPages = [
  { path: '/dashboard', name: 'dashboard-user', folder: 'dashboard/user', auth: 'user' },
  { path: '/dashboard', name: 'dashboard-admin', folder: 'dashboard/admin', auth: 'admin' },
];

const adminPages = [
  { path: '/admin/products', name: 'admin-products', folder: 'admin/products' },
  { path: '/admin/orders', name: 'admin-orders', folder: 'admin/orders' },
  { path: '/admin/appointments', name: 'admin-appointments', folder: 'admin/appointments' },
  { path: '/admin/users', name: 'admin-users', folder: 'admin/users' },
  // Puck Pages - Disabled (not production ready)
  // { path: '/admin/pages', name: 'admin-pages', folder: 'admin/pages' },
  // { path: '/admin/pages/new', name: 'admin-pages-new', folder: 'admin/pages-new' },
  { path: '/admin/content', name: 'admin-content', folder: 'admin/content' },
  { path: '/admin/shop', name: 'admin-shop', folder: 'admin/shop' },
  { path: '/admin/shop/orders', name: 'admin-shop-orders', folder: 'admin/shop-orders' },
  { path: '/admin/shop/products/new', name: 'admin-shop-products-new', folder: 'admin/shop-products-new' },
  { path: '/admin/dev', name: 'admin-dev', folder: 'admin/dev' },
];

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get viewport name from project name
 * Projects are defined in playwright.config.ts as 'chromium' (desktop) and 'mobile'
 */
function getViewportName(projectName: string): string {
  return projectName === 'mobile' ? 'mobile' : 'desktop';
}

/**
 * Capture screenshot with proper naming based on viewport and color scheme
 */
async function captureScreenshot(
  page: any,
  folder: string,
  colorScheme: 'light' | 'dark',
  projectName: string
) {
  const viewport = getViewportName(projectName);
  const path = `${folder}/${viewport}-${colorScheme}.png`;
  await expect(page).toHaveScreenshot(path, { fullPage: true });
}

// ============================================================================
// Public Pages Tests
// ============================================================================

test.describe('Public Pages - Light Mode', () => {
  publicPages.forEach(({ path, name, folder }) => {
    test(`${name} - light mode`, async ({ page }, testInfo) => {
      await page.goto(path);
      await waitForPageReady(page);
      await captureScreenshot(page, folder, 'light', testInfo.project.name);
    });
  });
});

test.describe('Public Pages - Dark Mode', () => {
  publicPages.forEach(({ path, name, folder }) => {
    test(`${name} - dark mode`, async ({ page }, testInfo) => {
      await page.goto(path);
      await page.emulateMedia({ colorScheme: 'dark' });
      await waitForPageReady(page);
      await captureScreenshot(page, folder, 'dark', testInfo.project.name);
    });
  });
});

// ============================================================================
// Dashboard Pages Tests
// ============================================================================

test.describe('Dashboard Pages - Light Mode', () => {
  dashboardPages.forEach(({ path, name, folder, auth }) => {
    test(`${name} - light mode`, async ({ page }, testInfo) => {
      if (auth === 'user') {
        await loginAsUser(page);
      } else {
        await loginAsAdmin(page);
      }
      await page.goto(path);
      await waitForPageReady(page);
      await captureScreenshot(page, folder, 'light', testInfo.project.name);
    });
  });
});

test.describe('Dashboard Pages - Dark Mode', () => {
  dashboardPages.forEach(({ path, name, folder, auth }) => {
    test(`${name} - dark mode`, async ({ page }, testInfo) => {
      if (auth === 'user') {
        await loginAsUser(page);
      } else {
        await loginAsAdmin(page);
      }
      await page.goto(path);
      await page.emulateMedia({ colorScheme: 'dark' });
      await waitForPageReady(page);
      await captureScreenshot(page, folder, 'dark', testInfo.project.name);
    });
  });
});

// ============================================================================
// Admin Pages Tests
// ============================================================================

test.describe('Admin Pages - Light Mode', () => {
  adminPages.forEach(({ path, name, folder }) => {
    test(`${name} - light mode`, async ({ page }, testInfo) => {
      await loginAsAdmin(page);
      await page.goto(path);
      await waitForPageReady(page);
      await captureScreenshot(page, folder, 'light', testInfo.project.name);
    });
  });
});

test.describe('Admin Pages - Dark Mode', () => {
  adminPages.forEach(({ path, name, folder }) => {
    test(`${name} - dark mode`, async ({ page }, testInfo) => {
      await loginAsAdmin(page);
      await page.goto(path);
      await page.emulateMedia({ colorScheme: 'dark' });
      await waitForPageReady(page);
      await captureScreenshot(page, folder, 'dark', testInfo.project.name);
    });
  });
});
