import { expect, test } from '@playwright/test';

for (const route of ['/', '/services', '/pricing', '/contact']) {
  test(`${route} presents both offers without browser defects`, async ({ page }) => {
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

test('homepage explains supervision and the private weekly-brief model', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText(/no external action is sent, published, changed, or purchased without human approval/i)).toBeVisible();
  await expect(page.getByRole('heading', { name: /three check-ins/i })).toBeVisible();
  await expect(page.getByRole('link', { name: /improve my website/i })).toBeVisible();
  await expect(page.getByRole('link', { name: /discuss an ai operator/i })).toBeVisible();
});

test('desktop public navigation exposes the two offers without private workspaces', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'public', 'Desktop navigation is intentionally collapsed on mobile.');
  await page.goto('/');
  const navigation = page.getByRole('navigation', { name: 'Main navigation' });
  for (const label of ['Website Improvement', 'AI Operator', 'How It Works', 'Work', 'Insights', 'Start a Project']) {
    await expect(navigation.getByRole('link', { name: label, exact: true })).toBeVisible();
  }
  await expect(navigation.locator('a[href^="/dashboard"], a[href^="/employee"], a[href^="/prospecting"], a[href^="/admin"]')).toHaveCount(0);
});
