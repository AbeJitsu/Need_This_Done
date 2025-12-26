import { test, expect } from '@playwright/test';
import { enableDarkMode } from './helpers';

// ============================================================================
// Service Modal Tests - Light & Dark Mode Contrast
// ============================================================================
// Purpose: Verify service modals are readable in both light and dark mode
// Run: SKIP_WEBSERVER=true BASE_URL=https://localhost npx playwright test service-modals.spec.ts
// Screenshots: Saved to e2e/screenshots/service-modals/

// ============================================================================
// WCAG Contrast Ratio Calculator
// ============================================================================
// WCAG AA requires 4.5:1 for normal text, 3:1 for large text
// Formula: https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html

function getLuminance(r: number, g: number, b: number): number {
  // Convert 8-bit RGB to sRGB (0-1 range)
  const [rs, gs, bs] = [r, g, b].map((c) => {
    const srgb = c / 255;
    return srgb <= 0.03928 ? srgb / 12.92 : Math.pow((srgb + 0.055) / 1.055, 2.4);
  });
  // Calculate relative luminance
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function getContrastRatio(rgb1: [number, number, number], rgb2: [number, number, number]): number {
  const l1 = getLuminance(...rgb1);
  const l2 = getLuminance(...rgb2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

function parseRgb(rgbString: string): [number, number, number] | null {
  // Handle both comma-separated (legacy) and space-separated (modern) CSS color syntax
  // Legacy: rgba(30, 58, 138, 0.3) or rgb(30, 58, 138)
  // Modern: rgb(30 58 138 / 0.3) or rgb(30 58 138)
  const commaMatch = rgbString.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (commaMatch) {
    return [parseInt(commaMatch[1]), parseInt(commaMatch[2]), parseInt(commaMatch[3])];
  }
  const spaceMatch = rgbString.match(/rgba?\((\d+)\s+(\d+)\s+(\d+)/);
  if (spaceMatch) {
    return [parseInt(spaceMatch[1]), parseInt(spaceMatch[2]), parseInt(spaceMatch[3])];
  }
  return null;
}

// WCAG AA minimum contrast ratio for normal text
const WCAG_AA_NORMAL_TEXT = 4.5;

test.describe('Service Modals - Contrast & Accessibility', () => {
  const services = [
    { name: 'Virtual Assistant', color: 'green' },
    { name: 'Data & Documents', color: 'blue' },
    { name: 'Website Services', color: 'purple' },
  ];

  test.beforeEach(async ({ page }) => {
    // Start fresh
    await page.addInitScript(() => {
      localStorage.clear();
    });
  });

  // ==========================================================================
  // Light Mode Tests
  // ==========================================================================
  test.describe('Light Mode', () => {
    test.beforeEach(async ({ page }) => {
      // Force light mode
      await page.addInitScript(() => {
        localStorage.setItem('darkMode', 'false');
      });
      await page.goto('/');
      await page.waitForLoadState('load');
    });

    for (const service of services) {
      test(`${service.name} modal has readable contrast`, async ({ page }) => {
        // Click on the service card to open modal
        const serviceCard = page.getByRole('button', { name: new RegExp(service.name, 'i') });
        await serviceCard.click();

        // Wait for modal to appear
        const modal = page.getByRole('dialog');
        await expect(modal).toBeVisible();

        // Take screenshot for visual review - clear naming shows what's being tested
        await page.screenshot({
          path: `ux-screenshots/service-modal-${service.color}-light-contrast-test.png`,
          fullPage: false,
        });

        // Find the examples section (has the colored background)
        const examplesSection = modal.locator('ul').last();
        await expect(examplesSection).toBeVisible();

        // Get the first example item and verify it's readable
        const exampleItem = examplesSection.locator('li').first();
        await expect(exampleItem).toBeVisible();

        // Get BOTH text color AND background color to calculate contrast ratio
        const { textColor, bgColor } = await exampleItem.evaluate((el) => {
          const style = window.getComputedStyle(el);
          // Walk up the tree to find the actual background color (may be on parent)
          let currentEl: Element | null = el;
          let bg = 'rgba(0, 0, 0, 0)';
          while (currentEl) {
            const parentStyle = window.getComputedStyle(currentEl);
            const parentBg = parentStyle.backgroundColor;
            if (parentBg && parentBg !== 'rgba(0, 0, 0, 0)' && parentBg !== 'transparent') {
              bg = parentBg;
              break;
            }
            currentEl = currentEl.parentElement;
          }
          return {
            textColor: style.color,
            bgColor: bg,
          };
        });

        // Parse RGB values
        const textRgb = parseRgb(textColor);
        const bgRgb = parseRgb(bgColor);

        expect(textRgb).toBeTruthy();
        expect(bgRgb).toBeTruthy();

        if (textRgb && bgRgb) {
          const ratio = getContrastRatio(textRgb, bgRgb);
          // WCAG AA requires 4.5:1 for normal text
          expect(ratio).toBeGreaterThanOrEqual(WCAG_AA_NORMAL_TEXT);
        }

        // Close modal
        await page.keyboard.press('Escape');
        await expect(modal).not.toBeVisible();
      });
    }
  });

  // ==========================================================================
  // Dark Mode Tests
  // ==========================================================================
  test.describe('Dark Mode', () => {
    for (const service of services) {
      test(`${service.name} modal has readable contrast`, async ({ page }) => {
        // Set light mode first via localStorage so we can toggle to dark
        await page.addInitScript(() => {
          localStorage.setItem('darkMode', 'false');
        });
        await page.goto('/');
        await page.waitForLoadState('load');
        // Now toggle to dark mode
        await enableDarkMode(page);
        await page.waitForTimeout(500);

        // Click on the service card to open modal
        const serviceCard = page.getByRole('button', { name: new RegExp(service.name, 'i') });
        await serviceCard.click();

        // Wait for modal to appear
        const modal = page.getByRole('dialog');
        await expect(modal).toBeVisible();

        // Take screenshot for visual review - clear naming shows what's being tested
        await page.screenshot({
          path: `ux-screenshots/service-modal-${service.color}-dark-contrast-test.png`,
          fullPage: false,
        });

        // Find the examples section
        const examplesSection = modal.locator('ul').last();
        await expect(examplesSection).toBeVisible();

        // Get the first example item and verify it's readable
        const exampleItem = examplesSection.locator('li').first();
        await expect(exampleItem).toBeVisible();

        // Get BOTH text color AND background color to calculate contrast ratio
        const { textColor, bgColor } = await exampleItem.evaluate((el) => {
          const style = window.getComputedStyle(el);
          // Walk up the tree to find the actual background color (may be on parent)
          let currentEl: Element | null = el;
          let bg = 'rgba(0, 0, 0, 0)';
          while (currentEl) {
            const parentStyle = window.getComputedStyle(currentEl);
            const parentBg = parentStyle.backgroundColor;
            if (parentBg && parentBg !== 'rgba(0, 0, 0, 0)' && parentBg !== 'transparent') {
              bg = parentBg;
              break;
            }
            currentEl = currentEl.parentElement;
          }
          return {
            textColor: style.color,
            bgColor: bg,
          };
        });

        // Parse RGB values
        const textRgb = parseRgb(textColor);
        const bgRgb = parseRgb(bgColor);

        expect(textRgb).toBeTruthy();
        expect(bgRgb).toBeTruthy();

        if (textRgb && bgRgb) {
          const ratio = getContrastRatio(textRgb, bgRgb);
          // WCAG AA requires 4.5:1 for normal text
          expect(ratio).toBeGreaterThanOrEqual(WCAG_AA_NORMAL_TEXT);
        }

        // Close modal
        await page.keyboard.press('Escape');
        await expect(modal).not.toBeVisible();
      });
    }
  });

  // ==========================================================================
  // Modal Functionality Tests
  // ==========================================================================
  test('Modal opens and closes correctly', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('load');

    // Click Virtual Assistant card
    const serviceCard = page.getByRole('button', { name: /virtual assistant/i });
    await serviceCard.click();

    // Modal should be visible
    const modal = page.getByRole('dialog');
    await expect(modal).toBeVisible();

    // Title should match
    await expect(modal.getByRole('heading', { name: /virtual assistant/i })).toBeVisible();

    // Close with X button
    const closeButton = modal.getByRole('button', { name: /close/i });
    await closeButton.click();
    await expect(modal).not.toBeVisible();

    // Reopen and close with Escape
    await serviceCard.click();
    await expect(modal).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(modal).not.toBeVisible();

    // Reopen and close by clicking backdrop
    await serviceCard.click();
    await expect(modal).toBeVisible();
    // Click outside the modal (on backdrop)
    await page.mouse.click(10, 10);
    await expect(modal).not.toBeVisible();
  });
});
