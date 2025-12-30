import { test, expect } from '@playwright/test';

// ============================================================================
// EnrollButton E2E Tests
// ============================================================================
// Tests for the EnrollButton component via Storybook

test.describe('EnrollButton Component', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to Storybook
    await page.goto('/storybook');
    await page.waitForLoadState('networkidle');
  });

  test('renders free enrollment button', async ({ page }) => {
    // Navigate to the Free story
    await page.goto('/storybook/iframe.html?id=lms-enrollbutton--free&viewMode=story');
    await page.waitForLoadState('networkidle');

    const button = page.getByTestId('enroll-button');
    await expect(button).toBeVisible();
    await expect(button).toHaveText('Enroll Free');
    await expect(button).toBeEnabled();
  });

  test('renders paid enrollment button with price', async ({ page }) => {
    await page.goto('/storybook/iframe.html?id=lms-enrollbutton--paid&viewMode=story');
    await page.waitForLoadState('networkidle');

    const button = page.getByTestId('enroll-button');
    await expect(button).toBeVisible();
    await expect(button).toHaveText(/\$49\.99/);
    await expect(button).toBeEnabled();
  });

  test('renders enrolled state as disabled', async ({ page }) => {
    await page.goto('/storybook/iframe.html?id=lms-enrollbutton--already-enrolled&viewMode=story');
    await page.waitForLoadState('networkidle');

    const button = page.getByTestId('enroll-button');
    await expect(button).toBeVisible();
    await expect(button).toHaveText('Enrolled');
    await expect(button).toBeDisabled();
  });

  test('renders small size variant', async ({ page }) => {
    await page.goto('/storybook/iframe.html?id=lms-enrollbutton--small&viewMode=story');
    await page.waitForLoadState('networkidle');

    const button = page.getByTestId('enroll-button');
    await expect(button).toBeVisible();
    await expect(button).toHaveClass(/text-sm/);
  });

  test('renders large size variant', async ({ page }) => {
    await page.goto('/storybook/iframe.html?id=lms-enrollbutton--large&viewMode=story');
    await page.waitForLoadState('networkidle');

    const button = page.getByTestId('enroll-button');
    await expect(button).toBeVisible();
    await expect(button).toHaveClass(/text-lg/);
    await expect(button).toHaveText(/\$99\.99/);
  });

  test('renders full width variant', async ({ page }) => {
    await page.goto('/storybook/iframe.html?id=lms-enrollbutton--full-width&viewMode=story');
    await page.waitForLoadState('networkidle');

    const button = page.getByTestId('enroll-button');
    await expect(button).toBeVisible();
    await expect(button).toHaveClass(/w-full/);
  });

  test('has accessible aria-label for free course', async ({ page }) => {
    await page.goto('/storybook/iframe.html?id=lms-enrollbutton--free&viewMode=story');
    await page.waitForLoadState('networkidle');

    const button = page.getByTestId('enroll-button');
    const ariaLabel = await button.getAttribute('aria-label');
    expect(ariaLabel).toContain('Enroll');
    expect(ariaLabel).toContain('free');
  });

  test('has accessible aria-label for paid course', async ({ page }) => {
    await page.goto('/storybook/iframe.html?id=lms-enrollbutton--paid&viewMode=story');
    await page.waitForLoadState('networkidle');

    const button = page.getByTestId('enroll-button');
    const ariaLabel = await button.getAttribute('aria-label');
    expect(ariaLabel).toContain('Purchase');
    expect(ariaLabel).toContain('$49.99');
  });

  test('renders color variants correctly', async ({ page }) => {
    await page.goto('/storybook/iframe.html?id=lms-enrollbutton--color-variants&viewMode=story');
    await page.waitForLoadState('networkidle');

    const buttons = page.getByTestId('enroll-button');
    await expect(buttons).toHaveCount(3);
  });

  test('renders size variants correctly', async ({ page }) => {
    await page.goto('/storybook/iframe.html?id=lms-enrollbutton--size-variants&viewMode=story');
    await page.waitForLoadState('networkidle');

    const buttons = page.getByTestId('enroll-button');
    await expect(buttons).toHaveCount(3);
  });

  test('renders price variants correctly', async ({ page }) => {
    await page.goto('/storybook/iframe.html?id=lms-enrollbutton--price-variants&viewMode=story');
    await page.waitForLoadState('networkidle');

    const buttons = page.getByTestId('enroll-button');
    await expect(buttons).toHaveCount(3);

    // Check first button is free
    const firstButton = buttons.first();
    await expect(firstButton).toHaveText('Enroll Free');
  });
});
