import { Page, expect } from '@playwright/test';

// ============================================================================
// E2E Test Helpers
// ============================================================================
// Shared utilities to reduce boilerplate in E2E tests.
// Each test file can import and use these helpers.

// ============================================================================
// Navigation Helpers
// ============================================================================

/**
 * Navigate to a page and wait for DOM to be ready
 * Note: We use 'domcontentloaded' instead of 'networkidle' because
 * client-side rendered pages with continuous API calls may never reach
 * a truly idle network state, causing timeouts.
 * @param page Playwright page object
 * @param path URL path to navigate to
 */
export async function navigateToPage(page: Page, path: string) {
  await page.goto(path);
  await page.waitForLoadState('domcontentloaded');
}

/**
 * Navigate to a page and wait for a specific title
 * @param page Playwright page object
 * @param path URL path to navigate to
 * @param titlePattern RegExp pattern to match against page title
 */
export async function navigateAndVerifyTitle(
  page: Page,
  path: string,
  titlePattern: RegExp
) {
  await page.goto(path);
  await expect(page).toHaveTitle(titlePattern);
}

// ============================================================================
// Dark Mode Helpers
// ============================================================================

/**
 * Set dark mode by adding the 'dark' class to the HTML element.
 * This is the reliable way for Tailwind class-based dark mode (darkMode: 'class').
 * Use this for screenshot tests instead of emulateMedia which only affects CSS media queries.
 * IMPORTANT: Also removes 'light' class to avoid CSS conflicts.
 * @param page Playwright page object
 */
export async function setDarkMode(page: Page) {
  await page.evaluate(() => {
    // Set localStorage with the correct key that DarkModeToggle uses
    localStorage.setItem('darkMode', 'true');
    // Apply classes immediately
    document.documentElement.classList.remove('light');
    document.documentElement.classList.add('dark');
  });
  // Wait for CSS transitions to complete (buttons have transition-all duration-300)
  await page.waitForTimeout(400);
}

/**
 * Set light mode by removing the 'dark' class from the HTML element.
 * @param page Playwright page object
 */
export async function setLightMode(page: Page) {
  await page.evaluate(() => {
    // Set localStorage with the correct key that DarkModeToggle uses
    localStorage.setItem('darkMode', 'false');
    // Apply classes immediately
    document.documentElement.classList.remove('dark');
    document.documentElement.classList.add('light');
  });
  await page.waitForTimeout(100);
}

/**
 * Enable dark mode by clicking the dark mode toggle button
 * @param page Playwright page object
 */
export async function enableDarkMode(page: Page) {
  const darkModeButton = page.getByLabel('Switch to dark mode');
  await expect(darkModeButton).toBeVisible();
  await darkModeButton.click();
  await expect(page.locator('html')).toHaveClass(/dark/);
}

/**
 * Disable dark mode by clicking the light mode toggle button
 * @param page Playwright page object
 */
export async function disableDarkMode(page: Page) {
  const lightModeButton = page.getByLabel('Switch to light mode');
  await expect(lightModeButton).toBeVisible();
  await lightModeButton.click();
  // Verify dark class is removed
  const htmlElement = page.locator('html');
  const classList = await htmlElement.getAttribute('class');
  expect(classList).not.toContain('dark');
}

/**
 * Verify that a specific element has dark mode styles applied
 * @param page Playwright page object
 * @param selector CSS selector for the element to check
 */
export async function verifyDarkModeStyles(page: Page, selector: string) {
  const element = page.locator(selector);
  // Check that the element or its parent has dark-related classes
  const parentElement = await element.evaluateHandle((el) => el.parentElement);
  const isDarkMode = await page.evaluateHandle((parent) => {
    return (
      parent?.className.includes('dark') ||
      document.documentElement.classList.contains('dark')
    );
  }, parentElement);

  expect(isDarkMode).toBeTruthy();
}

// ============================================================================
// Form Helpers
// ============================================================================

/**
 * Fill a form field and clear any existing value first
 * @param page Playwright page object
 * @param label Form label text to find the field by
 * @param value Value to enter
 */
export async function fillFormField(
  page: Page,
  label: string,
  value: string
) {
  const field = page.getByLabel(label);
  await field.clear();
  await field.fill(value);
}

/**
 * Submit a form by clicking the submit button
 * @param page Playwright page object
 * @param buttonText The text of the submit button
 */
export async function submitForm(page: Page, buttonText: string) {
  // Use type='submit' selector to avoid matching OAuth buttons
  await page.locator('button[type="submit"]').filter({ hasText: buttonText }).click();
  await page.waitForLoadState('domcontentloaded');
}

// ============================================================================
// Visibility Helpers
// ============================================================================

/**
 * Wait for a specific text to appear on the page
 * @param page Playwright page object
 * @param text The text to wait for
 * @param timeout How long to wait in milliseconds (default: 5000)
 */
export async function waitForText(
  page: Page,
  text: string,
  timeout: number = 5000
) {
  await page.waitForSelector(`text=${text}`, { timeout });
}

/**
 * Wait for an element to be visible
 * @param page Playwright page object
 * @param selector CSS selector for the element
 */
export async function waitForElement(page: Page, selector: string) {
  const element = page.locator(selector);
  await expect(element).toBeVisible();
}

// ============================================================================
// Authentication Helpers
// ============================================================================

/**
 * Wait for page to be fully ready (DOM + network requests settled + content visible)
 * @param page Playwright page object
 * @param options Configuration options
 */
export async function waitForPageReady(
  page: Page,
  options: { waitForNetwork?: boolean; waitForContent?: boolean } = {}
) {
  const { waitForNetwork = true, waitForContent = true } = options;

  // Wait for DOM to be ready
  await page.waitForLoadState('domcontentloaded');

  // Wait for network to settle (API calls, images, etc.)
  if (waitForNetwork) {
    try {
      await page.waitForLoadState('networkidle', { timeout: 10000 });
    } catch {
      // Ignore timeout - some pages continuously fetch data
    }
  }

  // Wait for actual content to be visible (not just blank page)
  if (waitForContent) {
    try {
      // Wait for either h1, main content, or specific page markers
      await page.waitForSelector('h1, main, [data-page-ready], .page-content', {
        state: 'visible',
        timeout: 10000,
      });
    } catch {
      // Fall back to waiting for any visible text content
      try {
        await page.waitForSelector('body:not(:empty)', { timeout: 5000 });
      } catch {
        // Page might genuinely be empty, continue anyway
      }
    }
  }

  // Final wait for React hydration and animations to settle
  await page.waitForTimeout(1000);
}

// ============================================================================
// Page Validation - Fail fast on error pages
// ============================================================================

/**
 * Validate that a page loaded successfully (not an error page).
 * Call this BEFORE taking screenshots to avoid capturing error pages.
 *
 * @param page Playwright page object
 * @param pagePath The path being tested (for error messages)
 * @throws Error if page shows 404, error, or "not found" content
 */
export async function validatePageLoaded(page: Page, pagePath: string) {
  // Check for common error indicators in the page content
  const errorPatterns = [
    'file not found',
    'page not found',
    'not found',
    '404',
    'error occurred',
    'something went wrong',
    'this page doesn\'t exist',
    'could not be found',
  ];

  const bodyText = await page.locator('body').textContent() || '';
  const bodyLower = bodyText.toLowerCase();

  for (const pattern of errorPatterns) {
    if (bodyLower.includes(pattern)) {
      // Check if it's actually an error page, not just content mentioning these words
      const title = await page.title();
      const h1Text = await page.locator('h1').first().textContent().catch(() => '');

      // If the h1 or title contains error indicators, it's definitely an error page
      const titleLower = (title + ' ' + h1Text).toLowerCase();
      if (titleLower.includes('404') ||
          titleLower.includes('not found') ||
          titleLower.includes('error')) {
        throw new Error(
          `❌ Page "${pagePath}" failed to load!\n` +
          `   Title: "${title}"\n` +
          `   H1: "${h1Text}"\n` +
          `   Found error pattern: "${pattern}"\n` +
          `   This would result in a broken screenshot. Fix the page before running tests.`
        );
      }
    }
  }

  // Check that there's actual content (not just a blank page)
  const hasContent = await page.locator('h1, h2, p, main').first().isVisible().catch(() => false);
  if (!hasContent) {
    throw new Error(
      `❌ Page "${pagePath}" appears to be blank!\n` +
      `   No h1, h2, p, or main elements found.\n` +
      `   This would result in a blank screenshot. Fix the page before running tests.`
    );
  }
}

/**
 * Navigate to page, wait for it to be ready, and validate it loaded correctly.
 * Use this instead of separate goto + waitForPageReady + validatePageLoaded calls.
 *
 * @param page Playwright page object
 * @param path URL path to navigate to
 * @throws Error if page fails to load or shows error content
 */
export async function gotoAndValidate(page: Page, path: string) {
  await page.goto(path);
  await waitForPageReady(page);
  await validatePageLoaded(page, path);
}

/**
 * Log in as admin user using E2E test credentials
 * @param page Playwright page object
 */
export async function loginAsAdmin(page: Page) {
  const adminEmail = process.env.E2E_ADMIN_EMAIL;
  const adminPassword = process.env.E2E_ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    throw new Error('E2E_ADMIN_EMAIL and E2E_ADMIN_PASSWORD must be set in .env.local');
  }

  await page.goto('/login');
  await fillFormField(page, 'Email', adminEmail);
  await fillFormField(page, 'Password', adminPassword);
  await submitForm(page, 'Sign In');
  await waitForPageReady(page);
}

/**
 * Log in as regular user using E2E test credentials
 * @param page Playwright page object
 */
export async function loginAsUser(page: Page) {
  const userEmail = process.env.E2E_USER_EMAIL;
  const userPassword = process.env.E2E_USER_PASSWORD;

  if (!userEmail || !userPassword) {
    throw new Error('E2E_USER_EMAIL and E2E_USER_PASSWORD must be set in .env.local');
  }

  await page.goto('/login');
  await fillFormField(page, 'Email', userEmail);
  await fillFormField(page, 'Password', userPassword);
  await submitForm(page, 'Sign In');
  await waitForPageReady(page);
}
