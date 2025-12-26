import { test } from '@playwright/test';

test('capture all customer-facing pages for comparison', async ({ page }) => {
  const pages = [
    { name: 'home', path: '/' },
    { name: 'services', path: '/services' },
    { name: 'pricing', path: '/pricing' },
    { name: 'how-it-works', path: '/how-it-works' },
    { name: 'faq', path: '/faq' },
    { name: 'contact', path: '/contact' },
  ];
  
  for (const p of pages) {
    await page.goto(p.path);
    await page.waitForLoadState('networkidle');
    await page.screenshot({ 
      path: `e2e/screenshots/compare-${p.name}.png`,
      fullPage: true 
    });
    console.log(`Captured ${p.name}`);
  }
});
