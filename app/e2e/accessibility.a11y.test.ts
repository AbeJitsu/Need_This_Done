import { test, expect } from '@playwright/test';
import { injectAxe, checkA11y } from 'axe-playwright';
import { setDarkMode, setLightMode, loginAsAdmin, waitForPageReady } from './helpers';

// ============================================================================
// Comprehensive Accessibility Tests
// ============================================================================
// Tests EVERY page for WCAG AA compliance in both light and dark modes.
// Organized by category for maintainability.
//
// Page Categories:
// 1. Public Static (12) - No auth, no backend
// 2. Admin Core (6) - Need admin auth
// 3. Admin Content (7) - Need admin auth
// 4. Backend-Dependent (4) - Need Medusa/Stripe (skipped)
// 5. Dynamic (3) - Need valid slugs (handled separately)

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

// ============================================================================
// Page Definitions
// ============================================================================

// Public pages that don't require auth or backend services
const PUBLIC_PAGES = [
  { path: '/', name: 'Home' },
  { path: '/services', name: 'Services' },
  { path: '/pricing', name: 'Pricing' },
  { path: '/how-it-works', name: 'How It Works' },
  { path: '/faq', name: 'FAQ' },
  { path: '/guide', name: 'Guide' },
  { path: '/contact', name: 'Contact' },
  { path: '/login', name: 'Login' },
  { path: '/get-started', name: 'Get Started' },
  { path: '/changelog', name: 'Changelog' },
  { path: '/privacy', name: 'Privacy' },
  { path: '/terms', name: 'Terms' },
  { path: '/blog', name: 'Blog' },
];

// Admin pages that require authentication
const ADMIN_CORE_PAGES = [
  { path: '/admin/dev', name: 'Admin Dev' },
  { path: '/admin/users', name: 'Admin Users' },
  { path: '/admin/orders', name: 'Admin Orders' },
  { path: '/admin/appointments', name: 'Admin Appointments' },
  { path: '/admin/products', name: 'Admin Products' },
  { path: '/admin/shop', name: 'Admin Shop' },
];

const ADMIN_CONTENT_PAGES = [
  { path: '/admin/content', name: 'Admin Content' },
  { path: '/admin/pages', name: 'Admin Pages' },
  { path: '/admin/pages/new', name: 'Admin Pages New' },
  { path: '/admin/blog', name: 'Admin Blog' },
  { path: '/admin/blog/new', name: 'Admin Blog New' },
  { path: '/admin/shop/orders', name: 'Admin Shop Orders' },
  { path: '/admin/shop/products/new', name: 'Admin Shop Products New' },
];

// Pages that require Medusa backend (skip in standard tests)
const BACKEND_DEPENDENT_PAGES = [
  { path: '/shop', name: 'Shop' },
  { path: '/cart', name: 'Cart' },
  { path: '/checkout', name: 'Checkout' },
  { path: '/dashboard', name: 'Dashboard' },
];

// ============================================================================
// Axe Configuration
// ============================================================================
// Full accessibility testing including color contrast - WCAG AA minimum.
// Excludes known third-party elements and acceptable non-critical issues.

const axeConfig = {
  detailedReport: true,
  detailedReportOptions: {
    html: true,
  },
  // Exclude third-party widgets and acceptable issues
  axeOptions: {
    rules: {
      // heading-order: "moderate" impact - acceptable skip in some layouts
      // We prioritize color-contrast (serious) and other critical issues
      'heading-order': { enabled: false },
      // label-title-only: Can be triggered by third-party widgets
      // (e.g., Vercel Analytics language dropdown)
      'label-title-only': { enabled: false },
    },
  },
};

// ============================================================================
// Helper: Test a page in both modes
// ============================================================================

async function testPageAccessibility(
  browserPage: Awaited<ReturnType<typeof test.step>>,
  path: string,
  darkMode: boolean
) {
  // Clear any stale state before navigating
  await browserPage.context().clearCookies();

  await browserPage.goto(`${BASE_URL}${path}`, { waitUntil: 'load' });

  if (darkMode) {
    await setDarkMode(browserPage);
  } else {
    await setLightMode(browserPage);
  }

  // Wait for styles to fully compute
  await browserPage.waitForTimeout(500);
  await injectAxe(browserPage);
  await checkA11y(browserPage, null, axeConfig);
}

// ============================================================================
// PUBLIC PAGES - Light Mode
// ============================================================================
test.describe('Public Pages - Light Mode', () => {
  for (const page of PUBLIC_PAGES) {
    test(`${page.name} - Light`, async ({ page: browserPage }) => {
      await testPageAccessibility(browserPage, page.path, false);
    });
  }
});

// ============================================================================
// PUBLIC PAGES - Dark Mode
// ============================================================================
test.describe('Public Pages - Dark Mode', () => {
  for (const page of PUBLIC_PAGES) {
    test(`${page.name} - Dark`, async ({ page: browserPage }) => {
      await testPageAccessibility(browserPage, page.path, true);
    });
  }
});

// ============================================================================
// ADMIN PAGES (Require Auth) - Skip if credentials not set
// ============================================================================
// Admin tests require E2E_ADMIN_EMAIL and E2E_ADMIN_PASSWORD to be set.
// Skip these tests when running in environments without credentials.

const hasAdminCredentials = !!(process.env.E2E_ADMIN_EMAIL && process.env.E2E_ADMIN_PASSWORD);

test.describe('Admin Core Pages - Light Mode', () => {
  test.skip(!hasAdminCredentials, 'Skipped: E2E_ADMIN_EMAIL and E2E_ADMIN_PASSWORD not set');

  test.beforeEach(async ({ page: browserPage }) => {
    await loginAsAdmin(browserPage);
  });

  for (const page of ADMIN_CORE_PAGES) {
    test(`${page.name} - Light`, async ({ page: browserPage }) => {
      await testPageAccessibility(browserPage, page.path, false);
    });
  }
});

test.describe('Admin Core Pages - Dark Mode', () => {
  test.skip(!hasAdminCredentials, 'Skipped: E2E_ADMIN_EMAIL and E2E_ADMIN_PASSWORD not set');

  test.beforeEach(async ({ page: browserPage }) => {
    await loginAsAdmin(browserPage);
  });

  for (const page of ADMIN_CORE_PAGES) {
    test(`${page.name} - Dark`, async ({ page: browserPage }) => {
      await testPageAccessibility(browserPage, page.path, true);
    });
  }
});

test.describe('Admin Content Pages - Light Mode', () => {
  test.skip(!hasAdminCredentials, 'Skipped: E2E_ADMIN_EMAIL and E2E_ADMIN_PASSWORD not set');

  test.beforeEach(async ({ page: browserPage }) => {
    await loginAsAdmin(browserPage);
  });

  for (const page of ADMIN_CONTENT_PAGES) {
    test(`${page.name} - Light`, async ({ page: browserPage }) => {
      await testPageAccessibility(browserPage, page.path, false);
    });
  }
});

test.describe('Admin Content Pages - Dark Mode', () => {
  test.skip(!hasAdminCredentials, 'Skipped: E2E_ADMIN_EMAIL and E2E_ADMIN_PASSWORD not set');

  test.beforeEach(async ({ page: browserPage }) => {
    await loginAsAdmin(browserPage);
  });

  for (const page of ADMIN_CONTENT_PAGES) {
    test(`${page.name} - Dark`, async ({ page: browserPage }) => {
      await testPageAccessibility(browserPage, page.path, true);
    });
  }
});

// ============================================================================
// BACKEND-DEPENDENT PAGES (Skipped by default)
// ============================================================================
// These pages require Medusa backend to be running.
// Run with: npm run test:a11y:full (when backend is available)
test.describe('Backend-Dependent Pages', () => {
  test.skip(
    !process.env.TEST_BACKEND_PAGES,
    'Skipped: Set TEST_BACKEND_PAGES=1 when Medusa backend is available'
  );

  test.describe('Light Mode', () => {
    for (const page of BACKEND_DEPENDENT_PAGES) {
      test(`${page.name} - Light`, async ({ page: browserPage }) => {
        await testPageAccessibility(browserPage, page.path, false);
      });
    }
  });

  test.describe('Dark Mode', () => {
    for (const page of BACKEND_DEPENDENT_PAGES) {
      test(`${page.name} - Dark`, async ({ page: browserPage }) => {
        await testPageAccessibility(browserPage, page.path, true);
      });
    }
  });
});
