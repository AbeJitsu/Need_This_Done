import { test } from '@playwright/test';

test('capture updated how-it-works', async ({ page }) => {
  await page.goto('/how-it-works');
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(2000);
  await page.screenshot({ 
    path: 'ux-screenshots/09-how-it-works.png',
    fullPage: true 
  });
});
