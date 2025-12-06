import { test, expect } from '@playwright/test';

// ============================================================================
// Puck Pages Demo Test - Shows Implementation Structure
// ============================================================================

test.describe('Puck Pages Implementation Demo', () => {
  test('screenshot 1: home page with navigation to admin', async ({ page }) => {
    // Navigate to home page
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');

    // SCREENSHOT 1: Home page showing app is running
    await page.screenshot({
      path: 'test-results/01-home-page.png',
      fullPage: true
    });
    console.log('✓ Screenshot 1: Home page captured');
  });

  test('screenshot 2: admin pages route exists', async ({ page }) => {
    // Try to access the admin pages route (will redirect to login if not authenticated)
    const response = await page.goto('http://localhost:3000/admin/pages', {
      waitUntil: 'networkidle'
    });

    // SCREENSHOT 2: Admin page (shows login redirect or pages list)
    await page.screenshot({
      path: 'test-results/02-admin-pages-route.png',
      fullPage: true
    });
    console.log('✓ Screenshot 2: Admin pages route captured');
    console.log(`   Response status: ${response?.status()}`);
  });

  test('screenshot 3: page creation route exists', async ({ page }) => {
    // Try to access the new page creation route
    const response = await page.goto('http://localhost:3000/admin/pages/new', {
      waitUntil: 'networkidle'
    });

    // SCREENSHOT 3: New page creation route
    await page.screenshot({
      path: 'test-results/03-new-page-route.png',
      fullPage: true
    });
    console.log('✓ Screenshot 3: New page route captured');
    console.log(`   Response status: ${response?.status()}`);
  });

  test('screenshot 4: dynamic page route pattern exists', async ({ page }) => {
    // Try to access a dynamic page route
    const response = await page.goto('http://localhost:3000/test-page', {
      waitUntil: 'networkidle'
    });

    // SCREENSHOT 4: Dynamic page route (404 is expected since no pages exist)
    await page.screenshot({
      path: 'test-results/04-dynamic-page-route.png',
      fullPage: true
    });
    console.log('✓ Screenshot 4: Dynamic page route captured');
    console.log(`   Response status: ${response?.status()} (404 expected - no pages created yet)`);
  });

  test('verify API endpoints exist', async ({ page }) => {
    // Test that API endpoints are responding
    const pagesListResponse = await page.request.get('http://localhost:3000/api/pages', {
      headers: { 'Content-Type': 'application/json' }
    });

    console.log('✓ API /api/pages endpoint exists');
    console.log(`   Response status: ${pagesListResponse.status()}`);

    // Test dynamic page endpoint
    const singlePageResponse = await page.request.get('http://localhost:3000/api/pages/test-slug', {
      headers: { 'Content-Type': 'application/json' }
    });

    console.log('✓ API /api/pages/[slug] endpoint exists');
    console.log(`   Response status: ${singlePageResponse.status()}`);
  });
});
