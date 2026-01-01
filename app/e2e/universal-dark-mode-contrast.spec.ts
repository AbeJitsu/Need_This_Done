import { test, expect, Page } from '@playwright/test';
import { setDarkMode, waitForPageReady } from './helpers';
import { discoverAllPages } from './utils/page-discovery';

// ============================================================================
// Universal Dark Mode Contrast Scanner
// ============================================================================
// Scans ALL interactive and text elements on a page for contrast issues.
// This catches issues that individual component tests might miss.
//
// WCAG AA Requirements:
// - Normal text: 4.5:1 minimum
// - Large text (18pt+ or 14pt bold): 3:1 minimum
// - UI components: 3:1 minimum

/**
 * Calculate WCAG contrast ratio between two RGB colors
 */
function getContrastRatio(
  fg: { r: number; g: number; b: number },
  bg: { r: number; g: number; b: number }
): number {
  const luminance = (r: number, g: number, b: number): number => {
    const [rs, gs, bs] = [r, g, b].map((c) => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  };

  const l1 = luminance(fg.r, fg.g, fg.b);
  const l2 = luminance(bg.r, bg.g, bg.b);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);

  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Parse RGB color string to RGB object
 */
function parseRgb(color: string): { r: number; g: number; b: number } | null {
  const match = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (!match) return null;
  return {
    r: parseInt(match[1], 10),
    g: parseInt(match[2], 10),
    b: parseInt(match[3], 10),
  };
}

interface ContrastIssue {
  selector: string;
  text: string;
  textColor: string;
  bgColor: string;
  ratio: number;
  required: number;
  element: string;
}

/**
 * Scan a page for all contrast issues in dark mode
 */
async function scanPageForContrastIssues(page: Page): Promise<ContrastIssue[]> {
  const issues: ContrastIssue[] = [];

  // Get all interactive and text elements
  const elements = await page.evaluate(() => {
    const results: Array<{
      selector: string;
      text: string;
      textColor: string;
      bgColor: string;
      fontSize: number;
      fontWeight: number;
      tagName: string;
    }> = [];

    // Selectors for interactive and important text elements
    const selectors = [
      'button',
      'a',
      '[role="button"]',
      'input',
      'select',
      'textarea',
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'p',
      'span',
      'label',
      'li',
      '[class*="badge"]',
      '[class*="tag"]',
      '[class*="chip"]',
    ];

    const allElements = document.querySelectorAll(selectors.join(', '));

    allElements.forEach((el, index) => {
      const style = window.getComputedStyle(el);
      const textColor = style.color;
      let bgColor = style.backgroundColor;

      // Walk up to find actual background color if transparent
      if (bgColor === 'rgba(0, 0, 0, 0)' || bgColor === 'transparent') {
        let parent = el.parentElement;
        while (parent) {
          const parentStyle = window.getComputedStyle(parent);
          if (parentStyle.backgroundColor !== 'rgba(0, 0, 0, 0)' &&
              parentStyle.backgroundColor !== 'transparent') {
            bgColor = parentStyle.backgroundColor;
            break;
          }
          parent = parent.parentElement;
        }
        // Default to white/black based on dark mode
        if (bgColor === 'rgba(0, 0, 0, 0)' || bgColor === 'transparent') {
          bgColor = document.documentElement.classList.contains('dark')
            ? 'rgb(17, 24, 39)' // gray-900
            : 'rgb(255, 255, 255)';
        }
      }

      const text = (el.textContent || '').trim().substring(0, 50);
      const fontSize = parseFloat(style.fontSize);
      const fontWeight = parseInt(style.fontWeight, 10);

      // Only check visible elements with text
      if (text && style.visibility !== 'hidden' && style.display !== 'none') {
        results.push({
          selector: `${el.tagName.toLowerCase()}:nth-of-type(${index + 1})`,
          text,
          textColor,
          bgColor,
          fontSize,
          fontWeight,
          tagName: el.tagName.toLowerCase(),
        });
      }
    });

    return results;
  });

  // Check each element for contrast
  for (const el of elements) {
    const fgRgb = parseRgb(el.textColor);
    const bgRgb = parseRgb(el.bgColor);

    if (!fgRgb || !bgRgb) continue;

    const ratio = getContrastRatio(fgRgb, bgRgb);

    // Determine required contrast
    // Large text: >= 18pt (24px) or >= 14pt (18.67px) and bold
    const isLargeText = el.fontSize >= 24 || (el.fontSize >= 18.67 && el.fontWeight >= 700);
    const required = isLargeText ? 3 : 4.5;

    if (ratio < required) {
      issues.push({
        selector: el.selector,
        text: el.text,
        textColor: el.textColor,
        bgColor: el.bgColor,
        ratio,
        required,
        element: el.tagName,
      });
    }
  }

  return issues;
}

// ============================================================================
// Page Discovery - Uses shared utility for flexibility
// ============================================================================
// See: .claude/rules/testing-flexibility.md
// See: e2e/utils/page-discovery.ts

const pagesToScan = discoverAllPages();
console.log(`[Dark Mode Scanner] Discovered ${pagesToScan.length} pages to scan`);

test.describe('Universal Dark Mode Contrast Scanner', () => {
  for (const pageInfo of pagesToScan) {
    test(`${pageInfo.name} page has no contrast issues in dark mode`, async ({ page }) => {
      await page.goto(pageInfo.path);
      await waitForPageReady(page);
      await setDarkMode(page);
      await page.waitForTimeout(500); // Allow CSS to fully apply

      const issues = await scanPageForContrastIssues(page);

      // Filter out minor issues (within 0.5 of required)
      const significantIssues = issues.filter((issue) => issue.ratio < issue.required - 0.5);

      if (significantIssues.length > 0) {
        console.log(`\n❌ ${pageInfo.name} page has ${significantIssues.length} contrast issues:`);
        significantIssues.slice(0, 10).forEach((issue) => {
          console.log(`  - "${issue.text.substring(0, 30)}..." (${issue.element})`);
          console.log(`    Ratio: ${issue.ratio.toFixed(2)}:1 (needs ${issue.required}:1)`);
          console.log(`    Text: ${issue.textColor}, BG: ${issue.bgColor}`);
        });
        if (significantIssues.length > 10) {
          console.log(`  ... and ${significantIssues.length - 10} more`);
        }
      }

      // Take screenshot for debugging
      await page.screenshot({
        path: `e2e/visual-regression/contrast-scan-${pageInfo.name.toLowerCase().replace(/\s/g, '-')}.png`,
        fullPage: true,
      });

      expect(
        significantIssues.length,
        `${pageInfo.name} has ${significantIssues.length} significant contrast issues in dark mode`
      ).toBe(0);
    });
  }
});

test.describe('Critical Element Contrast Checks', () => {
  test('all buttons have minimum 4.5:1 contrast in dark mode', async ({ page }) => {
    await page.goto('/');
    await waitForPageReady(page);
    await setDarkMode(page);
    await page.waitForTimeout(300);

    const buttonIssues = await page.evaluate(() => {
      const issues: Array<{
        text: string;
        textColor: string;
        bgColor: string;
      }> = [];

      const buttons = document.querySelectorAll('button, a[class*="button"], [role="button"], a[class*="rounded-full"]');

      buttons.forEach((btn) => {
        const style = window.getComputedStyle(btn);
        const text = (btn.textContent || '').trim();

        if (!text || style.display === 'none') return;

        let bgColor = style.backgroundColor;
        if (bgColor === 'rgba(0, 0, 0, 0)') {
          // Try to get from parent
          let parent = btn.parentElement;
          while (parent) {
            const parentStyle = window.getComputedStyle(parent);
            if (parentStyle.backgroundColor !== 'rgba(0, 0, 0, 0)') {
              bgColor = parentStyle.backgroundColor;
              break;
            }
            parent = parent.parentElement;
          }
        }

        issues.push({
          text: text.substring(0, 30),
          textColor: style.color,
          bgColor,
        });
      });

      return issues;
    });

    // Check each button's contrast
    const failingButtons: string[] = [];
    for (const btn of buttonIssues) {
      const fgRgb = parseRgb(btn.textColor);
      const bgRgb = parseRgb(btn.bgColor);

      if (!fgRgb || !bgRgb) continue;

      const ratio = getContrastRatio(fgRgb, bgRgb);
      if (ratio < 4.5) {
        failingButtons.push(`"${btn.text}" (${ratio.toFixed(2)}:1) - text: ${btn.textColor}, bg: ${btn.bgColor}`);
      }
    }

    if (failingButtons.length > 0) {
      console.log('\n❌ Buttons with insufficient contrast:');
      failingButtons.forEach((b) => console.log(`  - ${b}`));
    }

    expect(failingButtons.length, `${failingButtons.length} buttons have insufficient contrast`).toBe(0);
  });
});
