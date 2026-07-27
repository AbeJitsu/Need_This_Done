import { expect, test } from '@playwright/test';

const bypassProjects = new Set(['e2e-bypass', 'e2e-bypass-mobile']);
const reportId = process.env.E2E_REPORT_ID;

test.describe('Retained core smoke checks', () => {
  test.beforeEach(async ({}, testInfo) => {
    test.skip(
      !bypassProjects.has(testInfo.project.name),
      'Retained-core smoke checks use the local development bypass projects only.'
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

  test('project dashboard renders in development preview mode', async ({ page }) => {
    const response = await page.goto('/dashboard?preview=admin');

    expect(response?.ok()).toBe(true);
    await expect(page.getByRole('heading', { name: 'Project Dashboard' })).toBeVisible();
  });

  test('public report renders when a report UUID is configured', async ({ page }) => {
    test.skip(!reportId, 'Set E2E_REPORT_ID to a non-production report UUID to enable this check.');

    const response = await page.goto(`/report/${reportId}`);

    expect(response?.ok()).toBe(true);
    await expect(page.getByRole('heading').first()).toBeVisible();
  });
});
