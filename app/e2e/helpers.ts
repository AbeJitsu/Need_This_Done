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
  await page.getByRole('button', { name: buttonText }).click();
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
