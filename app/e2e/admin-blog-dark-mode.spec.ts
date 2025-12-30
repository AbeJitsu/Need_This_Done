import { test, expect } from '@playwright/test';
import { setDarkMode, waitForPageReady } from './helpers';

// ============================================================================
// Admin Blog Dark Mode Tests
// ============================================================================
// Tests for dark mode contrast and color rendering issues on /admin/blog
// Following TDD: Write failing tests first, then fix the code
// NOTE: Uses e2e-bypass mode (NEXT_PUBLIC_E2E_ADMIN_BYPASS=true)

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

test.describe('Admin Blog Dark Mode Contrast Tests', () => {
  // In e2e-bypass mode, admin pages are accessible without login

  test('page title has sufficient contrast in dark mode', async ({ page }) => {
    await page.goto('/admin/blog');
    await waitForPageReady(page);
    await setDarkMode(page);

    // Check page title contrast
    const title = page.locator('h1:has-text("Blog Posts")');
    await expect(title).toBeVisible();

    const textColor = await title.evaluate((el) => {
      const style = window.getComputedStyle(el);
      return style.color;
    });

    const bgColor = await title.evaluate((el) => {
      // Walk up to find the background color
      let current: HTMLElement | null = el as HTMLElement;
      while (current) {
        const style = window.getComputedStyle(current);
        const bg = style.backgroundColor;
        if (bg && bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent') {
          return bg;
        }
        current = current.parentElement;
      }
      return 'rgb(255, 255, 255)';
    });

    const fgRgb = parseRgb(textColor);
    const bgRgb = parseRgb(bgColor);

    expect(fgRgb).not.toBeNull();
    expect(bgRgb).not.toBeNull();

    if (fgRgb && bgRgb) {
      const ratio = getContrastRatio(fgRgb, bgRgb);
      expect(ratio, `Title contrast ratio ${ratio.toFixed(2)}:1 is below 4.5:1 minimum`).toBeGreaterThanOrEqual(4.5);
    }
  });

  test('status filter buttons have sufficient contrast in dark mode', async ({ page }) => {
    await page.goto('/admin/blog');
    await waitForPageReady(page);
    await setDarkMode(page);

    // Check all filter buttons (not the selected one which is blue)
    const buttons = page.locator('button[aria-pressed="false"]');
    const count = await buttons.count();

    for (let i = 0; i < Math.min(count, 4); i++) {
      const button = buttons.nth(i);
      const isVisible = await button.isVisible().catch(() => false);
      if (!isVisible) continue;

      const textColor = await button.evaluate((el) => window.getComputedStyle(el).color);
      const bgColor = await button.evaluate((el) => window.getComputedStyle(el).backgroundColor);

      const fgRgb = parseRgb(textColor);
      const bgRgb = parseRgb(bgColor);

      if (fgRgb && bgRgb) {
        const ratio = getContrastRatio(fgRgb, bgRgb);
        const buttonText = await button.textContent();
        expect(
          ratio,
          `Button "${buttonText}" contrast ratio ${ratio.toFixed(2)}:1 is below 4.5:1 minimum`
        ).toBeGreaterThanOrEqual(4.5);
      }
    }
  });

  test('breadcrumb links have sufficient contrast in dark mode', async ({ page }) => {
    await page.goto('/admin/blog');
    await waitForPageReady(page);
    await setDarkMode(page);

    // Check breadcrumb link
    const breadcrumbLink = page.locator('nav a:has-text("Admin")');
    const isVisible = await breadcrumbLink.isVisible().catch(() => false);

    if (isVisible) {
      const textColor = await breadcrumbLink.evaluate((el) => window.getComputedStyle(el).color);

      // Dark mode breadcrumb text should be at least gray-400 (#9CA3AF)
      const fgRgb = parseRgb(textColor);
      expect(fgRgb).not.toBeNull();

      // Check it's not too dark (at least some brightness)
      if (fgRgb) {
        const brightness = (fgRgb.r + fgRgb.g + fgRgb.b) / 3;
        expect(
          brightness,
          `Breadcrumb text is too dark: brightness ${brightness.toFixed(0)}/255`
        ).toBeGreaterThan(100);
      }
    }
  });

  test('empty state gradient background has visible text', async ({ page }) => {
    await page.goto('/admin/blog');
    await waitForPageReady(page);
    await setDarkMode(page);

    // The empty state should be visible if there are no posts
    const emptyState = page.locator('text=Start writing your first post').first();
    const isVisible = await emptyState.isVisible().catch(() => false);

    if (isVisible) {
      // Check the gradient background container
      const container = page.locator('.bg-gradient-to-br');
      const containerVisible = await container.isVisible().catch(() => false);

      if (containerVisible) {
        // Get the icon color inside the gradient
        const icon = container.locator('svg').first();
        const iconColor = await icon.evaluate((el) => window.getComputedStyle(el).color);

        const iconRgb = parseRgb(iconColor);
        expect(iconRgb).not.toBeNull();

        // Icon should be visible (not too dark)
        if (iconRgb) {
          const brightness = (iconRgb.r + iconRgb.g + iconRgb.b) / 3;
          expect(
            brightness,
            `Icon inside gradient is too dark: brightness ${brightness.toFixed(0)}/255`
          ).toBeGreaterThan(80);
        }
      }
    }
  });

  test('blog post cards have readable text in dark mode', async ({ page }) => {
    await page.goto('/admin/blog');
    await waitForPageReady(page);
    await setDarkMode(page);

    // Look for any post card content
    const postCards = page.locator('.grid > div').filter({ has: page.locator('h2') });
    const count = await postCards.count();

    if (count === 0) {
      // No posts, skip this test
      test.skip(true, 'No blog posts to test');
      return;
    }

    // Check first post card
    const firstCard = postCards.first();
    const title = firstCard.locator('h2');
    const isVisible = await title.isVisible().catch(() => false);

    if (isVisible) {
      const textColor = await title.evaluate((el) => window.getComputedStyle(el).color);
      const fgRgb = parseRgb(textColor);

      expect(fgRgb).not.toBeNull();
      if (fgRgb) {
        // In dark mode, text should be light (gray-100 = ~#F3F4F6)
        const brightness = (fgRgb.r + fgRgb.g + fgRgb.b) / 3;
        expect(
          brightness,
          `Post title text is too dark in dark mode: brightness ${brightness.toFixed(0)}/255`
        ).toBeGreaterThan(180);
      }
    }
  });

  test('tag badges have sufficient contrast in dark mode', async ({ page }) => {
    await page.goto('/admin/blog');
    await waitForPageReady(page);
    await setDarkMode(page);

    // Look for tag badges (text starting with #)
    const tags = page.locator('[class*="bg-gray-700"]').filter({ hasText: '#' });
    const count = await tags.count();

    if (count === 0) {
      // No tags visible, skip
      test.skip(true, 'No tags to test');
      return;
    }

    const firstTag = tags.first();
    const isVisible = await firstTag.isVisible().catch(() => false);

    if (isVisible) {
      const textColor = await firstTag.evaluate((el) => window.getComputedStyle(el).color);
      const bgColor = await firstTag.evaluate((el) => window.getComputedStyle(el).backgroundColor);

      const fgRgb = parseRgb(textColor);
      const bgRgb = parseRgb(bgColor);

      if (fgRgb && bgRgb) {
        const ratio = getContrastRatio(fgRgb, bgRgb);
        expect(
          ratio,
          `Tag badge contrast ratio ${ratio.toFixed(2)}:1 is below 4.5:1 minimum`
        ).toBeGreaterThanOrEqual(4.5);
      }
    }
  });

  test('action buttons maintain visibility in dark mode', async ({ page }) => {
    await page.goto('/admin/blog');
    await waitForPageReady(page);
    await setDarkMode(page);

    // Check the "New Post" button (should be blue variant)
    const newPostButton = page.locator('a:has-text("New Post"), button:has-text("New Post")');
    const isVisible = await newPostButton.first().isVisible().catch(() => false);

    if (isVisible) {
      const button = newPostButton.first();
      const textColor = await button.evaluate((el) => window.getComputedStyle(el).color);
      const bgColor = await button.evaluate((el) => window.getComputedStyle(el).backgroundColor);

      const fgRgb = parseRgb(textColor);
      const bgRgb = parseRgb(bgColor);

      if (fgRgb && bgRgb) {
        const ratio = getContrastRatio(fgRgb, bgRgb);
        expect(
          ratio,
          `"New Post" button contrast ratio ${ratio.toFixed(2)}:1 is below 4.5:1 minimum`
        ).toBeGreaterThanOrEqual(4.5);
      }
    }
  });
});

test.describe('Admin Blog Dark Mode Visual Regression', () => {
  // In e2e-bypass mode, admin pages are accessible without login

  test('capture admin blog page in dark mode', async ({ page }) => {
    await page.goto('/admin/blog');
    await waitForPageReady(page);
    await setDarkMode(page);
    await page.waitForTimeout(300);

    await page.screenshot({
      path: 'e2e/visual-regression/admin-blog-dark-mode.png',
      fullPage: true,
    });

    // Verify dark mode is active
    const hasDarkClass = await page.evaluate(() =>
      document.documentElement.classList.contains('dark')
    );
    expect(hasDarkClass).toBe(true);
  });
});
