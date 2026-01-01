import { test, expect } from '@playwright/test';

// ============================================================================
// CourseCard Component E2E Tests
// ============================================================================
// Tests the CourseCard component for LMS course preview/listing

test.describe('CourseCard Component', () => {
  // Use Storybook to test the component in isolation
  test.beforeEach(async ({ page }) => {
    // Navigate to the CourseCard story in Storybook
    await page.goto('/storybook/iframe.html?id=lms-coursecard--default');
  });

  test('displays course title', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /introduction to/i })).toBeVisible();
  });

  test('displays instructor name', async ({ page }) => {
    await expect(page.getByText(/instructor/i)).toBeVisible();
  });

  test('displays course duration', async ({ page }) => {
    await expect(page.getByText(/hours?/i)).toBeVisible();
  });

  test('displays lesson count', async ({ page }) => {
    await expect(page.getByText(/lessons?/i)).toBeVisible();
  });

  test('displays course thumbnail', async ({ page }) => {
    const thumbnail = page.locator('img[alt*="course"]');
    await expect(thumbnail).toBeVisible();
  });

  test('displays price when provided', async ({ page }) => {
    // Navigate to priced course variant
    await page.goto('/storybook/iframe.html?id=lms-coursecard--with-price');
    await expect(page.getByText(/\$\d+/)).toBeVisible();
  });

  test('displays progress bar when enrolled', async ({ page }) => {
    // Navigate to enrolled variant
    await page.goto('/storybook/iframe.html?id=lms-coursecard--enrolled');
    await expect(page.getByRole('progressbar')).toBeVisible();
  });

  test('is keyboard accessible', async ({ page }) => {
    const card = page.getByRole('link');
    await card.focus();
    await expect(card).toBeFocused();
  });
});
