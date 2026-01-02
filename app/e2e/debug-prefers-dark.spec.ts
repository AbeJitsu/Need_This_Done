import { test } from '@playwright/test';

test('debug with prefers-color-scheme dark', async ({ browser }) => {
  // Create context with dark color scheme preference
  const context = await browser.newContext({
    colorScheme: 'dark',
  });
  const page = await context.newPage();
  
  await page.goto('/admin/blog');
  await page.waitForLoadState('networkidle');
  
  // Give the page time to apply dark mode from preference
  await page.waitForTimeout(500);
  
  // Get the button
  const button = page.locator('a:has-text("Get a Quote")').first();
  
  if (await button.isVisible()) {
    // Get computed styles
    const styles = await button.evaluate((el) => {
      const s = window.getComputedStyle(el);
      return {
        color: s.color,
        backgroundColor: s.backgroundColor,
        borderColor: s.borderColor,
      };
    });
    console.log('Computed styles (prefers-color-scheme: dark):', styles);
    
    // Check HTML element
    const htmlClass = await page.evaluate(() => document.documentElement.className);
    console.log('HTML className:', htmlClass);
    
    // Nav bg
    const navBg = await page.locator('nav').first().evaluate((el) => {
      return window.getComputedStyle(el).backgroundColor;
    });
    console.log('Nav bg:', navBg);
  }
  
  await context.close();
});
