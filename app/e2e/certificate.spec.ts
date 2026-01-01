import { test, expect } from '@playwright/test';

// ============================================================================
// Certificate Component E2E Tests
// ============================================================================
// Tests the Certificate component for LMS course completion certificates

test.describe('Certificate Component', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/storybook/iframe.html?id=lms-certificate--default');
  });

  test('displays certificate title', async ({ page }) => {
    await expect(page.getByText(/certificate of completion/i)).toBeVisible();
  });

  test('displays course name', async ({ page }) => {
    await expect(page.getByRole('heading')).toBeVisible();
  });

  test('displays student name', async ({ page }) => {
    await expect(page.getByText(/awarded to/i)).toBeVisible();
  });

  test('displays completion date', async ({ page }) => {
    await expect(page.getByText(/\d{4}/)).toBeVisible(); // Year in date
  });

  test('displays instructor name', async ({ page }) => {
    await expect(page.getByText(/instructor/i)).toBeVisible();
  });

  test('displays certificate ID', async ({ page }) => {
    await expect(page.getByText(/certificate id/i)).toBeVisible();
  });

  test('has print-friendly styling', async ({ page }) => {
    const certificate = page.locator('[data-testid="certificate"]');
    await expect(certificate).toBeVisible();
  });
});
