import { test, expect } from '@playwright/test';

// ============================================================================
// ProgressBar Component E2E Tests
// ============================================================================
// Tests the ProgressBar component for LMS course progress tracking

test.describe('ProgressBar Component', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/storybook/iframe.html?id=lms-progressbar--default');
  });

  test('displays progress bar with correct aria attributes', async ({ page }) => {
    const progressBar = page.getByRole('progressbar');
    await expect(progressBar).toBeVisible();
    await expect(progressBar).toHaveAttribute('aria-valuemin', '0');
    await expect(progressBar).toHaveAttribute('aria-valuemax', '100');
  });

  test('shows percentage text when enabled', async ({ page }) => {
    await expect(page.getByText(/%/)).toBeVisible();
  });

  test('displays label when provided', async ({ page }) => {
    await page.goto('/storybook/iframe.html?id=lms-progressbar--with-label');
    await expect(page.getByText(/progress/i)).toBeVisible();
  });

  test('renders at different sizes', async ({ page }) => {
    await page.goto('/storybook/iframe.html?id=lms-progressbar--small');
    const smallBar = page.getByRole('progressbar');
    await expect(smallBar).toBeVisible();

    await page.goto('/storybook/iframe.html?id=lms-progressbar--large');
    const largeBar = page.getByRole('progressbar');
    await expect(largeBar).toBeVisible();
  });

  test('shows completed state at 100%', async ({ page }) => {
    await page.goto('/storybook/iframe.html?id=lms-progressbar--completed');
    const progressBar = page.getByRole('progressbar');
    await expect(progressBar).toHaveAttribute('aria-valuenow', '100');
  });

  test('handles zero progress', async ({ page }) => {
    await page.goto('/storybook/iframe.html?id=lms-progressbar--empty');
    const progressBar = page.getByRole('progressbar');
    await expect(progressBar).toHaveAttribute('aria-valuenow', '0');
  });
});
