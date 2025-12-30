import { test, expect } from '@playwright/test';

test('debug button', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');

  // Check initial state
  const button = page.locator('a:has-text("Get a Quote")').first();
  await expect(button).toBeVisible();

  // Get class attribute
  const className = await button.getAttribute('class');
  console.log('\nButton className:', className);

  // Get styles in light mode
  const lightStyles = await button.evaluate((el) => {
    const s = window.getComputedStyle(el);
    return { color: s.color, bg: s.backgroundColor, border: s.borderColor };
  });
  console.log('Light mode styles:', lightStyles);

  // Enable dark mode
  await page.evaluate(() => document.documentElement.classList.add('dark'));
  await page.waitForTimeout(500);

  // Check dark class
  const hasDark = await page.evaluate(() => document.documentElement.classList.contains('dark'));
  console.log('Has dark class:', hasDark);

  // Get styles in dark mode
  const darkStyles = await button.evaluate((el) => {
    const s = window.getComputedStyle(el);
    return { color: s.color, bg: s.backgroundColor, border: s.borderColor };
  });
  console.log('Dark mode styles:', darkStyles);

  expect(hasDark).toBe(true);
});
