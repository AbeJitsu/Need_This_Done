import { expect, test } from '@playwright/test';

for (const route of ['/', '/services', '/pricing', '/contact']) {
  test(`${route} presents the AI employee offer without browser defects`, async ({ page }) => {
    const errors: string[] = [];
    page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
    page.on('pageerror', (error) => errors.push(error.message));
    const response = await page.goto(route);
    expect(response?.ok()).toBe(true);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
    expect(overflow).toBe(false);
    expect(errors).toEqual([]);
  });
}

test('homepage explains supervision and the three-check-in day', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText(/nothing is sent, published, changed, or purchased without your approval/i)).toBeVisible();
  await expect(page.getByRole('heading', { name: /three check-ins/i })).toBeVisible();
  await expect(page.getByRole('link', { name: /design my ai employee/i }).first()).toBeVisible();
});
