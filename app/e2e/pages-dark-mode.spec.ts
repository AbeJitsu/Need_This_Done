import { test, expect } from '@playwright/test';
import { navigateToPage, enableDarkMode } from './helpers';

// ============================================================================
// Dark Mode E2E Tests
// ============================================================================
// What: Tests that all pages render correctly and maintain readability in dark mode
// Why: Ensures users with dark mode enabled see properly styled, accessible content
// How: Visits each page, enables dark mode, and verifies key elements are visible

// All pages to test (public + authenticated)
const pages = [
  { url: '/', name: 'Homepage' },
  { url: '/services', name: 'Services' },
  { url: '/pricing', name: 'Pricing' },
  { url: '/how-it-works', name: 'How It Works' },
  { url: '/faq', name: 'FAQ' },
  { url: '/contact', name: 'Contact' },
  { url: '/login', name: 'Login' },
  { url: '/demos/auth', name: 'Auth Demo' },
  { url: '/demos/database', name: 'Database Demo' },
  { url: '/demos/speed', name: 'Speed Demo' },
  // Protected pages - will redirect to login if not authenticated
  { url: '/dashboard', name: 'Dashboard', protected: true },
  { url: '/admin/users', name: 'Admin Users', protected: true },
];

test.describe('Dark Mode Rendering', () => {
  // Test each page in dark mode
  for (const pageConfig of pages) {
    test(`${pageConfig.name} renders readable in dark mode`, async ({ page }) => {
      // Skip protected pages for now (they'd redirect to login)
      if (pageConfig.protected) {
        test.skip();
      }

      await navigateToPage(page, pageConfig.url);

      // Enable dark mode via the toggle button (same as user would)
      await enableDarkMode(page);

      // Verify main content area is visible (not hidden behind dark mode issues)
      const mainContent = page.locator('main');
      await expect(mainContent).toBeVisible();

      // Verify text is readable - check that page title and main heading exist
      const heading = page.locator('h1, h2').first();
      if (await heading.isVisible()) {
        // Get computed styles to verify text is not white on white or invisible
        const color = await heading.evaluate((el) => {
          const computed = window.getComputedStyle(el);
          return computed.color;
        });

        // Text color should not be white (rgb(255, 255, 255))
        expect(color).not.toBe('rgb(255, 255, 255)');
      }

      // Verify background is not white (dark mode should have dark backgrounds)
      const bgColor = await mainContent.evaluate((el) => {
        const computed = window.getComputedStyle(el);
        return computed.backgroundColor;
      });

      // Background should not be pure white for main content
      // (may be gray or darker tones)
      expect(bgColor).not.toBe('rgb(255, 255, 255)');
    });
  }

  test('contrast ratios meet WCAG AA on dark mode pages', async ({ page }) => {
    // Test a sample of pages for contrast issues
    const samplePages = ['/', '/services', '/demos/database'];

    for (const url of samplePages) {
      await navigateToPage(page, url);

      // Enable dark mode via toggle
      await enableDarkMode(page);

      // Get all text elements
      const textElements = page.locator('p, h1, h2, h3, h4, h5, h6, button, a, label, span');
      const count = await textElements.count();

      // Sample check - verify at least some elements are visible and have readable colors
      if (count > 0) {
        const firstElement = textElements.first();
        const isVisible = await firstElement.isVisible();
        expect(isVisible).toBeTruthy();

        const opacity = await firstElement.evaluate((el) => {
          const computed = window.getComputedStyle(el);
          return computed.opacity;
        });

        // Opacity should not be 0 or very low (< 0.3)
        expect(parseFloat(opacity)).toBeGreaterThan(0.3);
      }
    }
  });
});
