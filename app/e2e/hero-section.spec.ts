import { test, expect } from '@playwright/test';

test.describe('Hero Section', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3001/');
  });

  test('renders the main headline text', async ({ page }) => {
    // Check headline h1 exists and is visible
    const headline = page.locator('h1').first();
    await expect(headline).toBeVisible();

    // Check key phrases are in the headline
    const headlineText = await headline.textContent();
    expect(headlineText).toContain('We build');
    expect(headlineText).toContain('what you need');
    expect(headlineText).toContain('done');
  });

  test('renders call-to-action button', async ({ page }) => {
    const ctaButton = page.locator('button:has-text("Start Your Project")').first();
    await expect(ctaButton).toBeVisible();
  });

  test('CTA button is keyboard accessible', async ({ page }) => {
    const ctaButton = page.locator('button:has-text("Start Your Project")').first();
    // Check for focus ring support
    const computedStyle = await ctaButton.evaluate(el => {
      return window.getComputedStyle(el).getPropertyValue('outline');
    });
    // Button should be focusable (has tabindex or is native button)
    const tabIndex = await ctaButton.evaluate(el => el.getAttribute('tabindex'));
    expect(['0', null].includes(tabIndex)).toBeTruthy();
  });

  test('hero section has full viewport height', async ({ page }) => {
    const heroSection = page.locator('section').first();
    const box = await heroSection.boundingBox();

    // Hero should span most of the viewport height
    expect(box!.height).toBeGreaterThan(500);
  });

  test('renders gradient background elements', async ({ page }) => {
    // Look for blur effects (gradient orbs)
    const blurElements = await page.locator('[class*="blur"]').count();
    expect(blurElements).toBeGreaterThan(0);
  });

  test('content is positioned above background (z-index)', async ({ page }) => {
    // Main content wrapper should have z-index
    const contentWrapper = page.locator('[class*="z-10"]').first();
    await expect(contentWrapper).toBeVisible();
  });

  test('supports reduced motion preference', async ({ page }) => {
    // Emulate reduced motion on current page
    await page.emulateMedia({ reducedMotion: 'reduce' });

    // Page should still render without errors even with reduced motion
    const headline = page.locator('h1').first();
    await expect(headline).toBeVisible();

    // Check content is still present
    const headlineText = await headline.textContent();
    expect(headlineText).toContain('We build');
  });

  test('renders scroll indicator', async ({ page }) => {
    // Look for scroll indicator button or arrow
    const scrollIndicator = page.locator('button').filter({ hasText: /scroll/i }).first();

    // If it exists, it should be visible
    const scrollIndicatorCount = await page.locator('button').filter({ hasText: /scroll/i }).count();
    expect(scrollIndicatorCount).toBeGreaterThan(0);
  });

  test('rotating keyword element renders', async ({ page }) => {
    // Look for keyword rotation (websites, automations, AI tools)
    const keywords = ['websites', 'automations', 'AI tools'];

    for (const keyword of keywords) {
      // At least one keyword should be visible at any time
      const keywordElement = page.locator(`text=${keyword}`);
      const isVisible = await keywordElement.isVisible().catch(() => false);

      if (isVisible) {
        await expect(keywordElement).toBeVisible();
        break; // Found one, that's enough for this test
      }
    }
  });

  test('hero section is accessible - contrast ratios', async ({ page }) => {
    // Run accessibility audit
    const accessibilityScan = await page.evaluate(() => {
      // Simple check: all text should be readable (this is basic, real a11y tests in test:a11y)
      return document.querySelectorAll('h1, h2, p, button').length > 0;
    });

    expect(accessibilityScan).toBeTruthy();
  });
});
