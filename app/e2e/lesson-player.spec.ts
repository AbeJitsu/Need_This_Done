import { test, expect } from '@playwright/test';

// ============================================================================
// LessonPlayer Component E2E Tests
// ============================================================================
// Tests the LessonPlayer component for LMS video + content display

test.describe('LessonPlayer Component', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/storybook/iframe.html?id=lms-lessonplayer--default');
  });

  test('displays lesson title', async ({ page }) => {
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });

  test('displays video player area', async ({ page }) => {
    const videoArea = page.locator('[data-testid="video-player"]');
    await expect(videoArea).toBeVisible();
  });

  test('displays lesson content/description', async ({ page }) => {
    await expect(page.getByText(/lesson content/i)).toBeVisible();
  });

  test('shows lesson navigation buttons', async ({ page }) => {
    await expect(page.getByRole('button', { name: /previous/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /next/i })).toBeVisible();
  });

  test('shows mark complete button', async ({ page }) => {
    await expect(page.getByRole('button', { name: /complete/i })).toBeVisible();
  });

  test('displays lesson progress indicator', async ({ page }) => {
    await expect(page.getByText(/lesson \d+ of \d+/i)).toBeVisible();
  });

  test('previous button is disabled on first lesson', async ({ page }) => {
    await page.goto('/storybook/iframe.html?id=lms-lessonplayer--first-lesson');
    const prevButton = page.getByRole('button', { name: /previous/i });
    await expect(prevButton).toBeDisabled();
  });

  test('next button is disabled on last lesson', async ({ page }) => {
    await page.goto('/storybook/iframe.html?id=lms-lessonplayer--last-lesson');
    const nextButton = page.getByRole('button', { name: /next/i });
    await expect(nextButton).toBeDisabled();
  });
});
