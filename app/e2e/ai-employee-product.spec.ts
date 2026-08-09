import { expect, test } from '@playwright/test';

for (const route of ['/', '/services', '/pricing', '/contact', '/login']) {
  test(`${route} renders without browser defects`, async ({ page }) => {
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

test('login keeps the private workspace boundary visible', async ({ page }) => {
  await page.goto('/login');
  await expect(page.getByRole('heading', { name: /continue where the work is clear/i })).toBeVisible();
  await expect(page.getByText('A deliberate boundary', { exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: /welcome back/i })).toBeVisible();
  await expect(page.getByLabel('Email Address')).toBeVisible();
});

test('homepage makes the problem and the two starting points clear', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: /too many tools/i })).toBeVisible();
  await expect(page.getByText(/no shared next step/i)).toBeVisible();
  await expect(page.getByRole('link', { name: /fix one problem/i }).first()).toBeVisible();
  await expect(page.getByRole('link', { name: /set up automation/i }).first()).toBeVisible();
});

test('desktop public navigation follows the public page progression', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'public', 'Desktop navigation is intentionally collapsed on mobile.');
  await page.goto('/');
  const navigation = page.getByRole('navigation', { name: 'Main navigation' });
  for (const label of ['Services', 'How It Works', 'Pricing', 'Work', 'Insights', 'Contact']) {
    await expect(navigation.getByRole('link', { name: label, exact: true })).toBeVisible();
  }
  await expect(navigation.locator('a[href^="/dashboard"], a[href^="/employee"], a[href^="/prospecting"], a[href^="/admin"]')).toHaveCount(0);
});
