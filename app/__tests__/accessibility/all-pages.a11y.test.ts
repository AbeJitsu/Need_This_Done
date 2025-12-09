import { test, expect } from '@playwright/test';
import { injectAxe, checkA11y } from 'axe-playwright';

// All public pages to test
const PAGES = [
  { path: '/', name: 'Home' },
  { path: '/services', name: 'Services' },
  { path: '/pricing', name: 'Pricing' },
  { path: '/how-it-works', name: 'How It Works' },
  { path: '/faq', name: 'FAQ' },
];

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

// Test each page in light mode
for (const page of PAGES) {
  test(`${page.name} - Light Mode Accessibility`, async ({ page: browserPage }) => {
    await browserPage.goto(`${BASE_URL}${page.path}`);
    await injectAxe(browserPage);

    // Run axe accessibility checks
    await checkA11y(browserPage, null, {
      detailedReport: true,
      detailedReportOptions: {
        html: true,
      },
    });
  });
}

// Test each page in dark mode
for (const page of PAGES) {
  test(`${page.name} - Dark Mode Accessibility`, async ({ page: browserPage }) => {
    await browserPage.goto(`${BASE_URL}${page.path}`);

    // Enable dark mode
    await browserPage.evaluate(() => {
      document.documentElement.classList.add('dark');
    });

    await injectAxe(browserPage);

    // Run axe accessibility checks
    await checkA11y(browserPage, null, {
      detailedReport: true,
      detailedReportOptions: {
        html: true,
      },
    });
  });
}
