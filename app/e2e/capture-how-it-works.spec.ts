import { test } from '@playwright/test';

test('capture redesigned how-it-works page', async ({ page }) => {
  await page.goto('/how-it-works');
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(2000); // Wait for any animations
  await page.screenshot({ 
    path: 'ux-screenshots/09-how-it-works.png',
    fullPage: true 
  });
  console.log('Screenshot captured!');
});
