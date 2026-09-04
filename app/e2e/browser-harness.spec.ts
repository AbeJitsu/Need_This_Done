import { expect, test } from '@playwright/test';

test('the isolated browser harness boots and serves a browser route', async ({ page }) => {
  const response = await page.goto('/login');
  expect(response?.ok()).toBe(true);
  await expect(page.getByRole('heading', { name: /private team sign-in/i })).toBeVisible();
});
