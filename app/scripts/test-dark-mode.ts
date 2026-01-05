import { chromium } from 'playwright';

async function testDarkMode() {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    colorScheme: 'light'
  });
  const page = await context.newPage();

  // Test pages that use neutralAccentBg
  const testPages = [
    { url: 'http://localhost:3000/', name: 'homepage' },
    { url: 'http://localhost:3000/services', name: 'services' },
    { url: 'http://localhost:3000/how-it-works', name: 'how-it-works' }
  ];

  for (const testPage of testPages) {
    await page.goto(testPage.url, { waitUntil: 'networkidle' });
    
    // Light mode screenshot
    await page.screenshot({ 
      path: `./screenshots/dark-mode-test/${testPage.name}-light.png`,
      fullPage: true
    });

    // Dark mode screenshot
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.screenshot({ 
      path: `./screenshots/dark-mode-test/${testPage.name}-dark.png`,
      fullPage: true
    });

    console.log(`✓ Captured ${testPage.name}`);
  }

  // Specifically test HowItWorks component sections
  await page.goto('http://localhost:3000/how-it-works', { waitUntil: 'networkidle' });
  await page.emulateMedia({ colorScheme: 'dark' });
  
  // Capture the explanation boxes section
  const explanationBoxes = await page.locator('.grid.md\\:grid-cols-2').first();
  await explanationBoxes.screenshot({ 
    path: './screenshots/dark-mode-test/how-it-works-boxes-dark.png' 
  });

  await browser.close();
  console.log('✓ All screenshots captured');
}

testDarkMode().catch(console.error);