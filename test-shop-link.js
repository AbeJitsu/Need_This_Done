/**
 * Standalone Playwright test for shop navigation link
 * Tests the production site at https://needthisdone.com
 */

const { chromium } = require('playwright');

(async () => {
  console.log('🔍 Testing shop navigation link on production site...\n');

  const browser = await chromium.launch({
    headless: false,
    slowMo: 500 // Slow down actions to see what's happening
  });

  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 }
  });

  const page = await context.newPage();

  try {
    // Navigate to production site
    console.log('📍 Navigating to https://needthisdone.com...');
    await page.goto('https://needthisdone.com', {
      waitUntil: 'networkidle',
      timeout: 30000
    });
    console.log('✓ Page loaded\n');

    // Wait for header to be visible
    console.log('🔎 Looking for header navigation...');
    await page.waitForSelector('header', { timeout: 10000 });
    console.log('✓ Header found\n');

    // Find all links in the header
    console.log('🔎 Finding all links in header...');
    const headerLinks = await page.$$eval('header a', links =>
      links.map(link => ({
        text: link.textContent?.trim(),
        href: link.href,
        visible: link.offsetParent !== null,
        classes: link.className
      }))
    );

    console.log('📋 Header links found:');
    headerLinks.forEach((link, i) => {
      console.log(`  ${i + 1}. "${link.text}" → ${link.href}`);
      console.log(`     Visible: ${link.visible}, Classes: ${link.classes}`);
    });
    console.log('');

    // Try to find and click the shop link
    console.log('🎯 Looking for shop link...');

    // Try multiple selectors
    const shopSelectors = [
      'header a:has-text("Shop")',
      'header a:has-text("shop")',
      'header a[href*="/shop"]',
      'nav a:has-text("Shop")',
      'a:has-text("Shop")'
    ];

    let shopLink = null;
    let usedSelector = '';

    for (const selector of shopSelectors) {
      try {
        shopLink = await page.$(selector);
        if (shopLink) {
          usedSelector = selector;
          console.log(`✓ Found shop link using selector: ${selector}\n`);
          break;
        }
      } catch (e) {
        // Continue trying next selector
      }
    }

    if (!shopLink) {
      console.log('❌ Shop link not found in header!');
      console.log('📸 Taking screenshot for debugging...');
      await page.screenshot({ path: 'shop-link-not-found.png', fullPage: true });
      console.log('✓ Screenshot saved to shop-link-not-found.png');
    } else {
      // Check if link is clickable
      console.log('🖱️  Testing if shop link is clickable...');
      const isVisible = await shopLink.isVisible();
      const isEnabled = await shopLink.isEnabled();

      console.log(`   Visible: ${isVisible}`);
      console.log(`   Enabled: ${isEnabled}\n`);

      if (!isVisible || !isEnabled) {
        console.log('⚠️  Shop link exists but is not clickable!');
        await page.screenshot({ path: 'shop-link-not-clickable.png', fullPage: true });
        console.log('✓ Screenshot saved to shop-link-not-clickable.png');
      } else {
        console.log('🖱️  Clicking shop link...');

        // Get current URL before click
        const beforeUrl = page.url();

        // Click and wait for navigation
        await Promise.all([
          page.waitForLoadState('networkidle', { timeout: 10000 }),
          shopLink.click()
        ]);

        const afterUrl = page.url();

        console.log(`   Before: ${beforeUrl}`);
        console.log(`   After:  ${afterUrl}\n`);

        if (afterUrl.includes('/shop')) {
          console.log('✅ SUCCESS: Shop link navigated to /shop page!');
          await page.screenshot({ path: 'shop-page-success.png', fullPage: true });
          console.log('✓ Screenshot saved to shop-page-success.png');
        } else if (beforeUrl === afterUrl) {
          console.log('❌ FAIL: Shop link did not navigate (URL unchanged)');
          await page.screenshot({ path: 'shop-link-no-navigation.png', fullPage: true });
          console.log('✓ Screenshot saved to shop-link-no-navigation.png');
        } else {
          console.log(`⚠️  UNEXPECTED: Navigated to different page: ${afterUrl}`);
          await page.screenshot({ path: 'shop-link-unexpected-nav.png', fullPage: true });
          console.log('✓ Screenshot saved to shop-link-unexpected-nav.png');
        }
      }
    }

  } catch (error) {
    console.error('❌ Error during test:');
    console.error(error.message);

    try {
      await page.screenshot({ path: 'shop-link-error.png', fullPage: true });
      console.log('✓ Error screenshot saved to shop-link-error.png');
    } catch (screenshotError) {
      console.error('Could not save screenshot');
    }
  } finally {
    console.log('\n🏁 Test complete. Browser will close in 3 seconds...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    await browser.close();
  }
})();
