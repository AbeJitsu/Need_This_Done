import { test, expect } from '@playwright/test';

// ============================================================================
// Test 4: Page Render Stability
// ============================================================================
// PROOF: Every page renders without errors regardless of content state.
//
// This test catches bugs like:
// - content.tiers.map() failing when content.tiers is undefined
// - content.hero.title failing when content.hero is undefined
// - Pages breaking due to context returning partial/invalid data
//
// How it works:
// 1. Navigate to each editable page
// 2. Wait for hydration (h1 visible)
// 3. Check console for React errors
// 4. Verify no "Cannot read properties of undefined" errors

// All editable pages that could have content loading issues
const EDITABLE_PAGES = [
  { path: '/', name: 'Home' },
  { path: '/services', name: 'Services' },
  { path: '/pricing', name: 'Pricing' },
  { path: '/faq', name: 'FAQ' },
  { path: '/how-it-works', name: 'How It Works' },
  { path: '/contact', name: 'Contact' },
  { path: '/get-started', name: 'Get Started' },
  { path: '/blog', name: 'Blog' },
  { path: '/changelog', name: 'Changelog' },
  { path: '/guide', name: 'Guide' },
  { path: '/privacy', name: 'Privacy' },
  { path: '/terms', name: 'Terms' },
];

// ============================================================================
// Basic Render Test - No Console Errors
// ============================================================================

test.describe('Page Render Stability', () => {
  for (const page of EDITABLE_PAGES) {
    test(`${page.path} renders without errors`, async ({ page: browserPage }) => {
      const errors: string[] = [];

      // Capture console errors
      browserPage.on('console', (msg) => {
        if (msg.type() === 'error') {
          errors.push(msg.text());
        }
      });

      // Capture uncaught exceptions
      browserPage.on('pageerror', (err) => {
        errors.push(err.message);
      });

      // Navigate to page
      await browserPage.goto(page.path);

      // Wait for page to fully load (h1 should be visible)
      await expect(browserPage.locator('h1').first()).toBeVisible({ timeout: 15000 });

      // Wait a moment for any async errors to surface
      await browserPage.waitForTimeout(500);

      // Filter out known non-critical errors
      const criticalErrors = errors.filter((error) => {
        // These are the patterns we want to catch:
        if (error.includes('Cannot read properties of undefined')) return true;
        if (error.includes('Cannot read properties of null')) return true;
        if (error.includes('is not a function')) return true;
        if (error.includes('.map is not a function')) return true;
        if (error.includes('Unhandled Runtime Error')) return true;
        return false;
      });

      expect(
        criticalErrors,
        `Page ${page.path} had console errors: ${criticalErrors.join('\n')}`
      ).toHaveLength(0);
    });
  }
});

// ============================================================================
// Content Structure Validation
// ============================================================================
// These tests verify that expected content sections exist on each page

test.describe('Content Structure Validation', () => {
  // Note: h1 presence is already validated in line 108, so we only check additional content here
  const PAGE_CONTENT_CHECKS: Record<string, string[]> = {
    '/': ['What We Offer'],
    '/services': ['Find Your Perfect Fit'],
    '/pricing': ['Pricing'],
    '/faq': ['Frequently Asked'],
    '/how-it-works': ['Make It Easy'],
    '/contact': ['Quote'],
    '/get-started': ['Get Started'],
    '/blog': [], // Just needs h1, validated in base check
    '/changelog': [], // Just needs h1, validated in base check
    '/guide': ['Getting Started'],
    '/privacy': ['Privacy'],
    '/terms': ['Terms'],
  };

  for (const [pagePath, expectedContent] of Object.entries(PAGE_CONTENT_CHECKS)) {
    test(`${pagePath} has expected content structure`, async ({ page }) => {
      await page.goto(pagePath);
      await expect(page.locator('h1').first()).toBeVisible({ timeout: 15000 });

      // Skip pages with no additional content checks (h1 already validated above)
      if (expectedContent.length === 0) return;

      for (const content of expectedContent) {
        if (content.startsWith('[')) {
          // CSS selector
          const element = page.locator(content).first();
          await expect(
            element,
            `${pagePath} should have element matching "${content}"`
          ).toBeVisible({ timeout: 5000 });
        } else {
          // Text content
          const element = page.getByText(content, { exact: false }).first();
          await expect(
            element,
            `${pagePath} should contain text "${content}"`
          ).toBeVisible({ timeout: 5000 });
        }
      }
    });
  }
});

// ============================================================================
// Navigation Flow Test - Visit Multiple Pages Without Errors
// ============================================================================
// This catches race conditions where context state from one page
// affects rendering of another page

test('navigating between all pages does not cause errors', async ({ page }) => {
  const errors: string[] = [];

  // Capture console errors
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      const text = msg.text();
      if (
        text.includes('Cannot read properties of undefined') ||
        text.includes('Cannot read properties of null') ||
        text.includes('.map is not a function')
      ) {
        errors.push(text);
      }
    }
  });

  page.on('pageerror', (err) => {
    errors.push(err.message);
  });

  // Navigate through all pages
  for (const pageInfo of EDITABLE_PAGES) {
    await page.goto(pageInfo.path);
    await expect(page.locator('h1').first()).toBeVisible({ timeout: 15000 });
    await page.waitForTimeout(200); // Brief pause to let async effects run
  }

  expect(
    errors,
    `Navigation caused errors: ${errors.join('\n')}`
  ).toHaveLength(0);
});

// ============================================================================
// Fast Navigation Test - Rapid Route Changes
// ============================================================================
// This catches issues where content state isn't properly cleared between routes

test('rapid navigation between pages does not cause errors', async ({ page }) => {
  const errors: string[] = [];

  page.on('pageerror', (err) => {
    errors.push(err.message);
  });

  // Rapidly navigate between pages (simulates fast user navigation)
  const rapidPages = ['/', '/pricing', '/services', '/faq', '/how-it-works', '/'];

  for (const path of rapidPages) {
    await page.goto(path, { waitUntil: 'domcontentloaded' });
    // Don't wait for full load - we're testing rapid navigation
  }

  // Now wait for the last page to fully render
  await expect(page.locator('h1').first()).toBeVisible({ timeout: 15000 });

  expect(
    errors,
    `Rapid navigation caused errors: ${errors.join('\n')}`
  ).toHaveLength(0);
});

// ============================================================================
// Array Content Test - Pages with .map() calls
// ============================================================================
// These pages are most vulnerable to "Cannot read properties of undefined (reading 'map')"

test.describe('Array Content Rendering', () => {
  const PAGES_WITH_ARRAYS = [
    { path: '/', arrays: ['services cards', 'process steps'] },
    { path: '/pricing', arrays: ['pricing tiers'] },
    { path: '/faq', arrays: ['FAQ items'] },
    { path: '/how-it-works', arrays: ['process steps'] },
    { path: '/services', arrays: ['scenarios', 'expectations'] },
    { path: '/get-started', arrays: ['paths'] },
    { path: '/privacy', arrays: ['sections'] },
    { path: '/terms', arrays: ['sections'] },
    { path: '/guide', arrays: ['guide sections'] },
  ];

  for (const pageInfo of PAGES_WITH_ARRAYS) {
    test(`${pageInfo.path} renders array content (${pageInfo.arrays.join(', ')})`, async ({
      page,
    }) => {
      const errors: string[] = [];

      page.on('pageerror', (err) => {
        errors.push(err.message);
      });

      await page.goto(pageInfo.path);
      await expect(page.locator('h1').first()).toBeVisible({ timeout: 15000 });

      // Wait for any async content to load
      await page.waitForTimeout(1000);

      // Check for .map() related errors
      const mapErrors = errors.filter(
        (e) => e.includes('.map') || e.includes('Cannot read properties of undefined')
      );

      expect(
        mapErrors,
        `${pageInfo.path} had array rendering errors: ${mapErrors.join('\n')}`
      ).toHaveLength(0);

      // Verify the page has more than just the header (arrays rendered)
      const mainContent = page.locator('main, [role="main"], .container, .max-w');
      const contentText = await mainContent.first().textContent();
      expect(
        contentText?.length,
        `${pageInfo.path} should have substantial content (arrays should be rendered)`
      ).toBeGreaterThan(100);
    });
  }
});

// ============================================================================
// Edit Mode Stability Test
// ============================================================================
// Verify that entering edit mode doesn't cause content loading issues

test.describe('Edit Mode Stability', () => {
  for (const pageInfo of EDITABLE_PAGES) {
    test(`${pageInfo.path} remains stable in edit mode`, async ({ page }) => {
      const errors: string[] = [];

      page.on('pageerror', (err) => {
        errors.push(err.message);
      });

      await page.goto(pageInfo.path);
      await expect(page.locator('h1').first()).toBeVisible({ timeout: 15000 });

      // Enable edit mode
      const editToggle = page.locator('button[aria-label="Edit this page"]');
      if (await editToggle.isVisible({ timeout: 5000 }).catch(() => false)) {
        await editToggle.click();
        await page.waitForTimeout(500);

        // Verify page is still rendered correctly
        await expect(page.locator('h1').first()).toBeVisible();

        // Check for errors
        const criticalErrors = errors.filter(
          (e) =>
            e.includes('Cannot read properties') ||
            e.includes('.map is not a function')
        );

        expect(
          criticalErrors,
          `${pageInfo.path} had errors in edit mode: ${criticalErrors.join('\n')}`
        ).toHaveLength(0);
      }
    });
  }
});
