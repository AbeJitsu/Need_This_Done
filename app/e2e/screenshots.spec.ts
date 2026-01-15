import { test, expect } from '@playwright/test';
import { loginAsAdmin, loginAsUser, waitForPageReady, setDarkMode, validatePageLoaded } from './helpers';
import { getPublicScreenshotPages, getAdminScreenshotPages } from './utils/page-discovery';

// ============================================================================
// Visual Regression Testing - All Pages
// ============================================================================
// Captures screenshots of all pages in both light and dark modes
// Playwright automatically runs tests across all projects (desktop/mobile)
//
// IMPORTANT: This site uses Tailwind's class-based dark mode (darkMode: 'class'),
// so we use setDarkMode() to add the 'dark' class to HTML instead of emulateMedia()
// which only affects the CSS prefers-color-scheme media query.
//
// Run with: npm run test:e2e -- screenshots.spec.ts --update-snapshots

// ============================================================================
// Page Configuration - Dynamic Discovery
// ============================================================================
// Uses page-discovery utility to automatically find pages.
// New pages are automatically included in screenshot tests.
// See: .claude/rules/testing-flexibility.md

const publicPages = getPublicScreenshotPages();

// Dashboard pages need special handling: same path with different auth contexts
// This cannot be auto-discovered since auth level affects what's rendered
const dashboardPages = [
  { path: '/dashboard', name: 'dashboard-user', folder: 'dashboard/user', auth: 'user' },
  { path: '/dashboard', name: 'dashboard-admin', folder: 'dashboard/admin', auth: 'admin' },
];

const adminPages = getAdminScreenshotPages();

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
      await validatePageLoaded(page, path); // Fail fast if page shows error
      await captureScreenshot(page, folder, 'light', testInfo.project.name);
    });
  });
});

test.describe('Public Pages - Dark Mode', () => {
  publicPages.forEach(({ path, name, folder }) => {
    test(`${name} - dark mode`, async ({ page }, testInfo) => {
      await page.goto(path);
      await setDarkMode(page);
      await waitForPageReady(page);
      await validatePageLoaded(page, path); // Fail fast if page shows error
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
      await validatePageLoaded(page, path); // Fail fast if page shows error
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
      await setDarkMode(page);
      await waitForPageReady(page);
      await validatePageLoaded(page, path); // Fail fast if page shows error
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
      await validatePageLoaded(page, path); // Fail fast if page shows error
      await captureScreenshot(page, folder, 'light', testInfo.project.name);
    });
  });
});

test.describe('Admin Pages - Dark Mode', () => {
  adminPages.forEach(({ path, name, folder }) => {
    test(`${name} - dark mode`, async ({ page }, testInfo) => {
      await loginAsAdmin(page);
      await page.goto(path);
      await setDarkMode(page);
      await waitForPageReady(page);
      await validatePageLoaded(page, path); // Fail fast if page shows error
      await captureScreenshot(page, folder, 'dark', testInfo.project.name);
    });
  });
});
