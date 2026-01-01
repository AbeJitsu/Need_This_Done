import { test, expect } from '@playwright/test';
import { setDarkMode } from './helpers';

test('debug button classes', async ({ page }) => {
  await page.goto('/admin/blog');
  await page.waitForLoadState('networkidle');
  
  // Enable dark mode
  await setDarkMode(page);
  
  // Get the button
  const button = page.locator('a:has-text("Get a Quote")').first();
  
  // Check if button exists
  const isVisible = await button.isVisible().catch(() => false);
  console.log('Button visible:', isVisible);
  
  if (isVisible) {
    // Get ALL attributes
    const className = await button.getAttribute('class');
    console.log('\nClass attribute:', className);
    
    // Get computed styles
    const styles = await button.evaluate((el) => {
      const s = window.getComputedStyle(el);
      return {
        color: s.color,
        backgroundColor: s.backgroundColor,
        borderColor: s.borderColor,
      };
    });
    console.log('\nComputed styles:', styles);
    
    // Check HTML element for dark class
    const htmlClass = await page.evaluate(() => document.documentElement.className);
    console.log('\nHTML className:', htmlClass);
    
    // Check if dark mode is actually applied
    const hasDark = await page.evaluate(() => document.documentElement.classList.contains('dark'));
    const hasLight = await page.evaluate(() => document.documentElement.classList.contains('light'));
    console.log('Has dark class:', hasDark);
    console.log('Has light class:', hasLight);
    
    // Check the parent nav element
    const navStyles = await page.locator('nav').first().evaluate((el) => {
      const s = window.getComputedStyle(el);
      return {
        backgroundColor: s.backgroundColor,
      };
    });
    console.log('\nNav background:', navStyles.backgroundColor);
  }
});
