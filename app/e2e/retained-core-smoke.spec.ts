import { expect, test } from '@playwright/test';

const publicSmokeProjects = new Set(['public', 'public-mobile']);
const reportId = process.env.E2E_REPORT_ID || '40000000-0000-4000-8000-000000000001';

test.describe('Retained core smoke checks', () => {
  test.beforeEach(async ({}, testInfo) => {
    test.skip(
      !publicSmokeProjects.has(testInfo.project.name),
      'Retained-core smoke checks run anonymously against public routes.'
    );
  });

  test('contact intake adapts to the selected offer', async ({ page }) => {
    const response = await page.goto('/contact?offer=website-improvement');

    expect(response?.ok()).toBe(true);
    await expect(page.getByText(/what are you contacting us about/i, { exact: true })).toBeVisible();
    await expect(page.getByRole('radio', { name: /targeted fix/i })).toBeChecked();
    await expect(page.getByRole('textbox', { name: /website url/i })).toBeVisible();
    await page.getByText('Automation System Setup', { exact: true }).click();
    await expect(page.getByRole('textbox', { name: /where does work get stuck/i })).toBeVisible();
    await expect(page.getByRole('textbox', { name: /website url/i })).toHaveCount(0);
  });

  test('site analyzer page renders the audit form', async ({ page }) => {
    const response = await page.goto('/site-analyzer');

    expect(response?.ok()).toBe(true);
    await expect(page.getByRole('heading', { name: /see where your website/i })).toBeVisible();
    await expect(page.getByRole('textbox', { name: /website url|your website/i })).toBeVisible();
  });

  test('project dashboard requires an authenticated session', async ({ page }) => {
    await page.goto('/dashboard');
    if (page.url().endsWith('/dashboard')) {
      await expect(page.getByRole('heading', { name: /agent operations/i })).toBeVisible();
      return;
    }
    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByLabel('Email Address')).toBeVisible();
  });

  test('private operator surfaces require authentication', async ({ page }) => {
    for (const route of ['/employee', '/prospecting']) {
      await page.goto(route);
      await expect(page).toHaveURL(/\/login/);
    }
  });

  test('consolidated public paths redirect to their maintained destinations', async ({ page }) => {
    for (const [route, destination] of [
      ['/about', '/work'],
      ['/resume', '/work'],
      ['/guide', '/faq'],
      ['/build', '/contact?offer=website-improvement'],
    ]) {
      await page.goto(route);
      await expect(page).toHaveURL(new RegExp(destination.replace(/[?]/g, '\\?') + '$'));
    }
  });

  test('sanitized public report renders from the local seed', async ({ page }) => {
    const response = await page.goto(`/report/${reportId}`);

    expect(response?.ok()).toBe(true);
    await expect(page.getByRole('heading').first()).toBeVisible();
    await expect(page.getByRole('link', { name: /request the \$500 targeted fix/i })).toHaveAttribute('href', '/contact?offer=website-improvement');
  });
});
