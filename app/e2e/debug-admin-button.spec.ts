import { test } from '@playwright/test';

test('debug admin button', async ({ page }) => {
  await page.goto('/admin/blog');
  await page.waitForLoadState('networkidle');

  const button = page.locator('a:has-text("Get a Quote")').first();
  const isVisible = await button.isVisible().catch(() => false);
  
  if (!isVisible) {
    console.log('Button not visible on admin page');
    return;
  }

  const className = await button.getAttribute('class');
  console.log('\\nAdmin button className:', className);

  // Enable dark mode
  await page.evaluate(() => document.documentElement.classList.add('dark'));
  await page.waitForTimeout(500);

  const hasDark = await page.evaluate(() => document.documentElement.classList.contains('dark'));
  console.log('Has dark class:', hasDark);

  const darkStyles = await button.evaluate((el) => {
    const s = window.getComputedStyle(el);
    return { color: s.color, bg: s.backgroundColor, border: s.borderColor };
  });
  console.log('Dark mode styles:', darkStyles);
  
  // Check html element for dark class
  const htmlClass = await page.evaluate(() => document.documentElement.className);
  console.log('HTML className:', htmlClass);
});
