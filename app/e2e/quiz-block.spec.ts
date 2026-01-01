import { test, expect } from '@playwright/test';

// ============================================================================
// QuizBlock Component E2E Tests
// ============================================================================
// Tests the QuizBlock component for LMS interactive quizzes

test.describe('QuizBlock Component', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/storybook/iframe.html?id=lms-quizblock--default');
  });

  test('displays quiz title', async ({ page }) => {
    await expect(page.getByRole('heading')).toBeVisible();
  });

  test('displays question text', async ({ page }) => {
    await expect(page.getByText(/question/i)).toBeVisible();
  });

  test('displays answer options', async ({ page }) => {
    const options = page.getByRole('button').filter({ hasText: /^[A-D]\./ });
    await expect(options.first()).toBeVisible();
  });

  test('allows selecting an answer', async ({ page }) => {
    const option = page.getByRole('button').filter({ hasText: /^A\./ }).first();
    await option.click();
    await expect(option).toHaveAttribute('aria-pressed', 'true');
  });

  test('shows submit button after selecting answer', async ({ page }) => {
    const option = page.getByRole('button').filter({ hasText: /^A\./ }).first();
    await option.click();
    await expect(page.getByRole('button', { name: /submit/i })).toBeVisible();
  });

  test('shows feedback after submitting', async ({ page }) => {
    const option = page.getByRole('button').filter({ hasText: /^A\./ }).first();
    await option.click();
    await page.getByRole('button', { name: /submit/i }).click();
    await expect(page.getByText(/correct|incorrect/i)).toBeVisible();
  });

  test('shows next question button after answering', async ({ page }) => {
    const option = page.getByRole('button').filter({ hasText: /^A\./ }).first();
    await option.click();
    await page.getByRole('button', { name: /submit/i }).click();
    await expect(page.getByRole('button', { name: /next/i })).toBeVisible();
  });

  test('displays question progress indicator', async ({ page }) => {
    await expect(page.getByText(/question \d+ of \d+/i)).toBeVisible();
  });
});
