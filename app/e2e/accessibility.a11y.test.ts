import { test, expect } from '@playwright/test';
import { injectAxe, checkA11y } from 'axe-playwright';

// ============================================================================
// Pages to Test for Accessibility
// ============================================================================
// Testing pages that:
// 1. Don't depend on external services (Medusa, Stripe) - those need full stack
// 2. Have been migrated to use lib/colors.ts (DRY color system)
//
// NOT tested yet (need color system migration):
// - /contact, /login, /get-started (still have hardcoded grays)
// - /shop, /cart, /checkout (need backend services)

const PAGES = [
  { path: '/', name: 'Home' },
  { path: '/services', name: 'Services' },
  { path: '/pricing', name: 'Pricing' },
  { path: '/how-it-works', name: 'How It Works' },
  { path: '/faq', name: 'FAQ' },
];

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

// ============================================================================
// Axe Configuration
// ============================================================================
// Full accessibility testing including color contrast - this is the whole point!

const axeConfig = {
  detailedReport: true,
  detailedReportOptions: {
    html: true,
  },
};

// ============================================================================
// Test each page in light mode
// ============================================================================
for (const page of PAGES) {
  test(`${page.name} - Light Mode Accessibility`, async ({ page: browserPage }) => {
    // Explicitly set light mode to ensure consistent testing
    await browserPage.emulateMedia({ colorScheme: 'light' });
    await browserPage.goto(`${BASE_URL}${page.path}`, { waitUntil: 'load' });
    // Wait for styles to fully compute
    await browserPage.waitForTimeout(500);
    await injectAxe(browserPage);
    await checkA11y(browserPage, null, axeConfig);
  });
}

// ============================================================================
// Test each page in dark mode
// ============================================================================
// Use emulateMedia to set dark color scheme preference BEFORE page loads.
// This triggers the FOUC prevention script in layout.tsx which applies the
// 'dark' class properly. Then wait for styles to settle before running axe.
for (const page of PAGES) {
  test(`${page.name} - Dark Mode Accessibility`, async ({ page: browserPage }) => {
    // Set dark mode preference before navigating (triggers layout.tsx script)
    await browserPage.emulateMedia({ colorScheme: 'dark' });
    await browserPage.goto(`${BASE_URL}${page.path}`, { waitUntil: 'load' });
    // Wait for styles to fully compute
    await browserPage.waitForTimeout(500);
    await injectAxe(browserPage);
    await checkA11y(browserPage, null, axeConfig);
  });
}
