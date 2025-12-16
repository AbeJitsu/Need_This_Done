import { test, expect } from '@playwright/test';

test('verify product images load', async ({ page }) => {
  // Track failed requests
  const failedRequests: string[] = [];
  page.on('response', response => {
    if (!response.ok() && response.url().includes('image')) {
      failedRequests.push(`${response.status()} - ${response.url()}`);
    }
  });

  // Visit shop page
  await page.goto('https://localhost/shop', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(5000);

  // Take screenshot
  await page.screenshot({
    path: '/tmp/shop-with-images.png',
    fullPage: true
  });

  // Check for product images
  const images = page.locator('img[alt*="Consultation"]').or(page.locator('img[src*="supabase"]'));
  const imageCount = await images.count();

  console.log(`\n=== VERIFICATION RESULTS ===`);
  console.log(`Product images found: ${imageCount}`);
  console.log(`Failed image requests: ${failedRequests.length}`);

  if (failedRequests.length > 0) {
    console.log('\nFailed requests:');
    failedRequests.forEach(req => console.log(`  ${req}`));
  }

  console.log(`\nScreenshot saved: /tmp/shop-with-images.png`);

  // Fail the test if images didn't load
  expect(imageCount, 'Expected 3 product images').toBeGreaterThanOrEqual(3);
  expect(failedRequests.length, 'Expected no failed image requests').toBe(0);
});
