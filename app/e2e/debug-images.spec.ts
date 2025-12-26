import { test } from '@playwright/test';

test('debug product images on shop page', async ({ page }) => {
  // Capture all console messages
  const consoleMessages: string[] = [];
  page.on('console', msg => {
    consoleMessages.push(`[${msg.type()}] ${msg.text()}`);
  });

  // Capture failed requests
  const failedRequests: { url: string; status: number; statusText: string }[] = [];
  page.on('response', response => {
    if (!response.ok() && response.url().includes('image')) {
      failedRequests.push({
        url: response.url(),
        status: response.status(),
        statusText: response.statusText()
      });
    }
  });

  // Visit shop page
  await page.goto('https://localhost/shop');
  await page.waitForTimeout(5000); // Wait 5 seconds instead of networkidle

  // Log all console messages
  console.log('\n=== CONSOLE MESSAGES ===');
  consoleMessages.forEach(msg => console.log(msg));

  // Log failed image requests with details
  console.log('\n=== FAILED IMAGE REQUESTS ===');
  for (const req of failedRequests) {
    console.log(`\nURL: ${req.url}`);
    console.log(`Status: ${req.status} ${req.statusText}`);
  }

  // Try to get more details from the first failed request
  if (failedRequests.length > 0) {
    console.log('\n=== FETCHING FAILED REQUEST DETAILS ===');
    const response = await page.request.get(failedRequests[0].url);
    const body = await response.text();
    console.log('Response body:', body);
  }

  // Check if product cards exist
  const productCards = page.locator('[class*="product"]').or(page.locator('article'));
  const count = await productCards.count();
  console.log(`\n=== PRODUCT CARDS FOUND: ${count} ===`);

  // Take a screenshot
  await page.screenshot({ path: '/tmp/shop-page-debug.png', fullPage: true });
  console.log('\nScreenshot saved to: /tmp/shop-page-debug.png');
});
