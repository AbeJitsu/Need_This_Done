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

  test('contact page renders its AI employee role-design path', async ({ page }) => {
    const response = await page.goto('/contact');

    expect(response?.ok()).toBe(true);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.getByRole('button', { name: /design my ai employee/i })).toBeVisible();
  });

  test('site analyzer page renders the audit form', async ({ page }) => {
    const response = await page.goto('/site-analyzer');

    expect(response?.ok()).toBe(true);
    await expect(page.getByRole('heading', { name: /how does your website stack up/i })).toBeVisible();
    await expect(page.getByRole('textbox', { name: /website url|your website/i })).toBeVisible();
  });

  test('project dashboard requires an authenticated session', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByLabel('Email Address')).toBeVisible();
  });

  test('sanitized public report renders from the local seed', async ({ page }) => {
    const response = await page.goto(`/report/${reportId}`);

    expect(response?.ok()).toBe(true);
    await expect(page.getByRole('heading').first()).toBeVisible();
  });
});
