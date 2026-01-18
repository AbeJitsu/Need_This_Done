import { test, expect, Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { discoverPublicPages, DiscoveredPage } from './utils/page-discovery';
import { waitForPageReady } from './helpers';

// ============================================================================
// Contrast Audit - WCAG AA Compliance Testing
// ============================================================================
// Uses axe-core to check actual rendered contrast ratios.
// Run on a single page or all public pages.
//
// Usage:
//   Single page:  CONTRAST_PAGE=/services npm run test:e2e -- contrast-audit
//   All pages:    npm run test:e2e -- contrast-audit
//
// WCAG AA Requirements:
// - Normal text (<18pt): 4.5:1 minimum
// - Large text (>=18pt or >=14pt bold): 3:1 minimum

// ============================================================================
// Configuration
// ============================================================================

// Set via env var to test a single page, or leave empty for all
const SINGLE_PAGE = process.env.CONTRAST_PAGE || '';

// Additional wait time for full render (CSS, fonts, hydration)
const RENDER_WAIT_MS = 2000;

// Modal triggers to check (selector -> modal wait selector)
const MODAL_TRIGGERS: Record<string, { trigger: string; modal: string }[]> = {
  '/services': [
    { trigger: '[data-service="website-services"]', modal: '[role="dialog"]' },
  ],
};

// ============================================================================
// Helpers
// ============================================================================

interface ContrastViolation {
  element: string;
  text: string;
  selector: string;
  contrastRatio: string;
  requiredRatio: string;
  fgColor: string;
  bgColor: string;
}

/**
 * Parse axe-core color contrast violations into readable format
 */
function parseContrastViolations(violations: any[]): ContrastViolation[] {
  const contrastViolations = violations.filter(v => v.id === 'color-contrast');
  const results: ContrastViolation[] = [];

  for (const violation of contrastViolations) {
    for (const node of violation.nodes) {
      const data = node.any?.[0]?.data || {};
      const ratio = typeof data.contrastRatio === 'number'
        ? data.contrastRatio.toFixed(2)
        : String(data.contrastRatio || 'N/A');
      const required = typeof data.expectedContrastRatio === 'number'
        ? data.expectedContrastRatio.toFixed(2)
        : String(data.expectedContrastRatio || '4.5');

      results.push({
        element: node.html?.substring(0, 100) || 'unknown',
        text: data.contrastRatio ? `${data.fgColor} on ${data.bgColor}` : 'unknown',
        selector: node.target?.[0] || 'unknown',
        contrastRatio: ratio,
        requiredRatio: required,
        fgColor: data.fgColor || 'unknown',
        bgColor: data.bgColor || 'unknown',
      });
    }
  }

  return results;
}

/**
 * Run axe-core contrast check on current page state
 */
async function checkContrast(page: Page, context: string): Promise<ContrastViolation[]> {
  const results = await new AxeBuilder({ page })
    .withRules(['color-contrast'])
    .analyze();

  const violations = parseContrastViolations(results.violations);

  if (violations.length > 0) {
    console.log(`\n❌ ${context} - Found ${violations.length} contrast violations:`);
    violations.slice(0, 10).forEach((v, i) => {
      console.log(`  ${i + 1}. Ratio: ${v.contrastRatio}:1 (needs ${v.requiredRatio}:1)`);
      console.log(`     Colors: ${v.fgColor} on ${v.bgColor}`);
      console.log(`     Element: ${v.element.substring(0, 80)}...`);
    });
    if (violations.length > 10) {
      console.log(`  ... and ${violations.length - 10} more`);
    }
  } else {
    console.log(`✅ ${context} - No contrast violations`);
  }

  return violations;
}

/**
 * Wait for page to be fully rendered
 */
async function waitForFullRender(page: Page) {
  await waitForPageReady(page);
  // Wait for fonts, CSS, and hydration
  await page.waitForTimeout(RENDER_WAIT_MS);
  // Wait for any lazy-loaded content
  await page.evaluate(() => {
    return new Promise<void>((resolve) => {
      if (document.readyState === 'complete') {
        resolve();
      } else {
        window.addEventListener('load', () => resolve());
      }
    });
  });

  // Scroll through the page to trigger scroll-based animations
  await scrollFullPage(page);
}

/**
 * Scroll through the entire page to trigger scroll-based animations
 */
async function scrollFullPage(page: Page) {
  await page.evaluate(async () => {
    const scrollHeight = document.documentElement.scrollHeight;
    const viewportHeight = window.innerHeight;
    const scrollStep = viewportHeight * 0.8; // Scroll 80% of viewport each step

    // Scroll down in steps
    for (let scrollPos = 0; scrollPos < scrollHeight; scrollPos += scrollStep) {
      window.scrollTo(0, scrollPos);
      // Small delay to let animations trigger
      await new Promise(r => setTimeout(r, 100));
    }

    // Scroll to bottom to ensure everything is triggered
    window.scrollTo(0, scrollHeight);
    await new Promise(r => setTimeout(r, 200));

    // Scroll back to top for the screenshot
    window.scrollTo(0, 0);
    await new Promise(r => setTimeout(r, 100));
  });
}

/**
 * Check modals on a page if configured
 */
async function checkModals(page: Page, pagePath: string): Promise<ContrastViolation[]> {
  const triggers = MODAL_TRIGGERS[pagePath];
  if (!triggers) return [];

  const allViolations: ContrastViolation[] = [];

  for (const { trigger, modal } of triggers) {
    try {
      // Click to open modal
      const triggerEl = page.locator(trigger).first();
      if (await triggerEl.isVisible()) {
        await triggerEl.click();

        // Wait for modal to appear
        await page.waitForSelector(modal, { timeout: 5000 });
        await page.waitForTimeout(500); // Let modal fully render

        // Check modal contrast
        const violations = await checkContrast(page, `Modal (${trigger})`);
        allViolations.push(...violations);

        // Close modal
        await page.keyboard.press('Escape');
        await page.waitForTimeout(300);
      }
    } catch (e) {
      console.log(`  ⚠️ Could not check modal ${trigger}: ${(e as Error).message}`);
    }
  }

  return allViolations;
}

// ============================================================================
// Test Suite
// ============================================================================

// Determine which pages to test
const allPublicPages = discoverPublicPages();
const pagesToTest: DiscoveredPage[] = SINGLE_PAGE
  ? allPublicPages.filter(p => p.path === SINGLE_PAGE || p.path === `/${SINGLE_PAGE}`)
  : allPublicPages;

if (pagesToTest.length === 0 && SINGLE_PAGE) {
  console.error(`\n❌ Page not found: ${SINGLE_PAGE}`);
  console.log('Available pages:');
  allPublicPages.forEach(p => console.log(`  ${p.path}`));
}

console.log(`\n📋 Contrast Audit: Testing ${pagesToTest.length} page(s)`);
if (SINGLE_PAGE) {
  console.log(`   Single page mode: ${SINGLE_PAGE}`);
}

test.describe('Contrast Audit (WCAG AA)', () => {
  // Increase timeout for thorough checking
  test.setTimeout(60000);

  for (const pageInfo of pagesToTest) {
    test(`${pageInfo.name} (${pageInfo.path}) passes contrast requirements`, async ({ page }) => {
      console.log(`\n🔍 Checking: ${pageInfo.name} (${pageInfo.path})`);

      // Navigate and wait for full render
      await page.goto(pageInfo.path);
      await waitForFullRender(page);

      // Take screenshot for reference
      const screenshotName = pageInfo.path === '/' ? 'home' : pageInfo.path.replace(/\//g, '-').slice(1);
      await page.screenshot({
        path: `e2e/screenshots/contrast-audit-${screenshotName}.png`,
        fullPage: true,
      });

      // Check main page contrast
      const pageViolations = await checkContrast(page, `Page: ${pageInfo.path}`);

      // Check modals if this page has them
      const modalViolations = await checkModals(page, pageInfo.path);

      // Combine all violations
      const allViolations = [...pageViolations, ...modalViolations];

      // Report results
      if (allViolations.length > 0) {
        console.log(`\n📊 Summary: ${allViolations.length} total violations on ${pageInfo.path}`);
      }

      expect(
        allViolations.length,
        `${pageInfo.name} has ${allViolations.length} contrast violations. See console output for details.`
      ).toBe(0);
    });
  }
});

// ============================================================================
// Quick Single-Page Test (use test.only for rapid iteration)
// ============================================================================

test.describe('Quick Contrast Check', () => {
  test.skip(!!SINGLE_PAGE, 'Skipping quick check when CONTRAST_PAGE is set');

  test('services page contrast', async ({ page }) => {
    await page.goto('/services');
    await waitForFullRender(page);

    const violations = await checkContrast(page, '/services');

    // Save screenshot
    await page.screenshot({
      path: 'e2e/screenshots/contrast-services-quick.png',
      fullPage: true,
    });

    expect(violations.length).toBe(0);
  });
});
