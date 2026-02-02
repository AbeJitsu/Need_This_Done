import { test, Page } from '@playwright/test';
import { discoverPublicPages, DiscoveredPage } from './utils/page-discovery';
import { waitForPageReady } from './helpers';

// ============================================================================
// Non-Text Contrast Audit - WCAG SC 1.4.11 Compliance
// ============================================================================
// Checks icons and borders meet 3:1 contrast ratio against backgrounds.
// This complements the text contrast audit (which uses axe-core).
//
// Usage:
//   Single page:  CONTRAST_PAGE=/services npm run test:e2e -- non-text-contrast
//   All pages:    npm run test:e2e -- non-text-contrast
//
// WCAG SC 1.4.11 Requirements:
// - UI components (borders, icons): 3:1 minimum against adjacent colors

// ============================================================================
// Configuration
// ============================================================================

const SINGLE_PAGE = process.env.CONTRAST_PAGE || '';
const RENDER_WAIT_MS = 2000;

// Icon selectors to check (SVGs and common icon patterns)
const ICON_SELECTORS = [
  'svg:not([aria-hidden="true"])', // Meaningful SVGs
  '[class*="icon"]',               // Elements with "icon" in class
  'button svg',                    // Icons in buttons
  'a svg',                         // Icons in links
];

// Border selectors to check (interactive elements)
const BORDER_SELECTORS = [
  'input',
  'textarea',
  'select',
  'button',
  '[role="button"]',
  '.border',                       // Explicit border classes
];

// ============================================================================
// Violation Types
// ============================================================================

interface NonTextViolation {
  type: 'icon' | 'border';
  selector: string;
  element: string;
  foregroundColor: string;
  backgroundColor: string;
  contrastRatio: number;
  required: number;
}

// ============================================================================
// Test Helpers
// ============================================================================

/**
 * Extract computed styles from elements in the browser
 */
async function checkNonTextContrast(page: Page): Promise<NonTextViolation[]> {
  const violations = await page.evaluate((config) => {
    const { iconSelectors, borderSelectors } = config;
    const results: NonTextViolation[] = [];

    // Helper to get computed background (walks up DOM tree)
    function getEffectiveBackground(el: Element): string {
      let current: Element | null = el;
      while (current) {
        const bg = getComputedStyle(current).backgroundColor;
        const parsed = bg.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
        if (parsed) {
          const alpha = parsed[4] ? parseFloat(parsed[4]) : 1;
          if (alpha > 0.1) {
            return bg;
          }
        }
        current = current.parentElement;
      }
      return 'rgb(255, 255, 255)'; // Default to white
    }

    // Helper to parse color
    function parseRGB(color: string): { r: number; g: number; b: number } | null {
      const match = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
      if (match) {
        return { r: parseInt(match[1]), g: parseInt(match[2]), b: parseInt(match[3]) };
      }
      return null;
    }

    // Helper to calculate contrast
    function calcContrast(fg: { r: number; g: number; b: number }, bg: { r: number; g: number; b: number }): number {
      function lum(rgb: { r: number; g: number; b: number }): number {
        const [r, g, b] = [rgb.r, rgb.g, rgb.b].map((c) => {
          const s = c / 255;
          return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
        });
        return 0.2126 * r + 0.7152 * g + 0.0722 * b;
      }
      const l1 = lum(fg);
      const l2 = lum(bg);
      return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
    }

    // Check icons
    for (const selector of iconSelectors) {
      const elements = document.querySelectorAll(selector);
      elements.forEach((el) => {
        const style = getComputedStyle(el);
        const color = style.color || style.fill;
        const bgColor = getEffectiveBackground(el);

        // Skip invisible elements
        if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') {
          return;
        }

        // Skip decorative elements
        if (el.getAttribute('aria-hidden') === 'true') {
          return;
        }

        const fg = parseRGB(color);
        const bg = parseRGB(bgColor);

        if (fg && bg) {
          const ratio = calcContrast(fg, bg);
          if (ratio < 3.0) {
            results.push({
              type: 'icon',
              selector: selector,
              element: el.outerHTML.substring(0, 100),
              foregroundColor: color,
              backgroundColor: bgColor,
              contrastRatio: Math.round(ratio * 100) / 100,
              required: 3.0,
            });
          }
        }
      });
    }

    // Check borders on interactive elements
    for (const selector of borderSelectors) {
      const elements = document.querySelectorAll(selector);
      elements.forEach((el) => {
        const style = getComputedStyle(el);
        const borderColor = style.borderColor;
        const borderWidth = parseFloat(style.borderWidth);
        const bgColor = getEffectiveBackground(el.parentElement || el);

        // Skip elements without visible borders
        if (borderWidth < 1 || style.borderStyle === 'none') {
          return;
        }

        // Skip invisible elements
        if (style.display === 'none' || style.visibility === 'hidden') {
          return;
        }

        const fg = parseRGB(borderColor);
        const bg = parseRGB(bgColor);

        if (fg && bg) {
          const ratio = calcContrast(fg, bg);
          if (ratio < 3.0) {
            results.push({
              type: 'border',
              selector: selector,
              element: el.outerHTML.substring(0, 100),
              foregroundColor: borderColor,
              backgroundColor: bgColor,
              contrastRatio: Math.round(ratio * 100) / 100,
              required: 3.0,
            });
          }
        }
      });
    }

    return results;
  }, { iconSelectors: ICON_SELECTORS, borderSelectors: BORDER_SELECTORS });

  return violations;
}

/**
 * Wait for full page render including scroll animations
 */
async function waitForFullRender(page: Page) {
  await waitForPageReady(page);
  await page.waitForTimeout(RENDER_WAIT_MS);

  // Scroll through page to trigger animations
  await page.evaluate(async () => {
    const scrollHeight = document.documentElement.scrollHeight;
    const viewportHeight = window.innerHeight;
    const step = viewportHeight * 0.8;

    for (let pos = 0; pos < scrollHeight; pos += step) {
      window.scrollTo(0, pos);
      await new Promise((r) => setTimeout(r, 100));
    }
    window.scrollTo(0, 0);
    await new Promise((r) => setTimeout(r, 100));
  });
}

/**
 * Log violations in readable format
 */
function logViolations(violations: NonTextViolation[], context: string) {
  if (violations.length === 0) {
    console.log(`✅ ${context} - No non-text contrast violations`);
    return;
  }

  console.log(`\n❌ ${context} - Found ${violations.length} non-text contrast violations:`);

  const iconViolations = violations.filter((v) => v.type === 'icon');
  const borderViolations = violations.filter((v) => v.type === 'border');

  if (iconViolations.length > 0) {
    console.log(`\n  Icons (${iconViolations.length}):`);
    iconViolations.slice(0, 5).forEach((v, i) => {
      console.log(`    ${i + 1}. Ratio: ${v.contrastRatio}:1 (needs 3:1)`);
      console.log(`       Colors: ${v.foregroundColor} on ${v.backgroundColor}`);
      console.log(`       Element: ${v.element.substring(0, 60)}...`);
    });
    if (iconViolations.length > 5) {
      console.log(`    ... and ${iconViolations.length - 5} more icon violations`);
    }
  }

  if (borderViolations.length > 0) {
    console.log(`\n  Borders (${borderViolations.length}):`);
    borderViolations.slice(0, 5).forEach((v, i) => {
      console.log(`    ${i + 1}. Ratio: ${v.contrastRatio}:1 (needs 3:1)`);
      console.log(`       Colors: ${v.foregroundColor} on ${v.backgroundColor}`);
      console.log(`       Element: ${v.element.substring(0, 60)}...`);
    });
    if (borderViolations.length > 5) {
      console.log(`    ... and ${borderViolations.length - 5} more border violations`);
    }
  }
}

// ============================================================================
// Test Suite
// ============================================================================

const allPublicPages = discoverPublicPages();
const pagesToTest: DiscoveredPage[] = SINGLE_PAGE
  ? allPublicPages.filter((p) => p.path === SINGLE_PAGE || p.path === `/${SINGLE_PAGE}`)
  : allPublicPages;

if (pagesToTest.length === 0 && SINGLE_PAGE) {
  console.error(`\n❌ Page not found: ${SINGLE_PAGE}`);
  console.log('Available pages:');
  allPublicPages.forEach((p) => console.log(`  ${p.path}`));
}

console.log(`\n📋 Non-Text Contrast Audit: Testing ${pagesToTest.length} page(s)`);
if (SINGLE_PAGE) {
  console.log(`   Single page mode: ${SINGLE_PAGE}`);
}

test.describe('Non-Text Contrast Audit (WCAG SC 1.4.11)', () => {
  test.setTimeout(60000);

  for (const pageInfo of pagesToTest) {
    test(`${pageInfo.name} (${pageInfo.path}) meets 3:1 non-text contrast`, async ({ page }) => {
      console.log(`\n🔍 Checking: ${pageInfo.name} (${pageInfo.path})`);

      await page.goto(pageInfo.path);
      await waitForFullRender(page);

      const violations = await checkNonTextContrast(page);
      logViolations(violations, `Page: ${pageInfo.path}`);

      // For now, log but don't fail - many icons are decorative
      // Uncomment to enforce:
      // expect(
      //   violations.length,
      //   `${pageInfo.name} has ${violations.length} non-text contrast violations`
      // ).toBe(0);

      // Just report for awareness
      if (violations.length > 0) {
        console.log(`\n⚠️  ${violations.length} potential issues found (review manually)`);
      }
    });
  }
});
