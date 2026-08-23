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
    const response = await page.goto('/contact?offer=website-fix');

    expect(response?.ok()).toBe(true);
    await expect(page.getByText(/what are you contacting us about/i, { exact: true })).toBeVisible();
    await expect(page.getByRole('radio', { name: /website fix/i })).toBeChecked();
    await expect(page.getByRole('textbox', { name: /website url/i })).toBeVisible();
    const managedAutomation = page.getByRole('radio', { name: /managed automation/i });
    await page.locator('label').filter({ has: managedAutomation }).click();
    await expect(page.getByRole('textbox', { name: /where does work get stuck/i })).toBeVisible();
    await expect(page.getByRole('textbox', { name: /website url/i })).toHaveCount(0);
  });

  test('site analyzer page renders the audit form', async ({ page }) => {
    const response = await page.goto('/site-analyzer');

    expect(response?.ok()).toBe(true);
    await expect(page.getByRole('heading', { name: /get a limited website snapshot/i })).toBeVisible();
    await expect(page.getByRole('textbox', { name: /website url|your website/i })).toBeVisible();
  });

  test('project dashboard requires an authenticated session', async ({ page }) => {
    await page.goto('/dashboard');
    const dashboardHeading = page.getByRole('heading', { name: /agent operations/i });
    const loginBoundary = page.getByLabel('Email Address');
    await expect(dashboardHeading.or(loginBoundary)).toBeVisible();

    if (await dashboardHeading.isVisible()) {
      return;
    }

    await expect(page).toHaveURL(/\/login$/);
    await expect(loginBoundary).toBeVisible();
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
      ['/build', '/contact?offer=website-fix'],
    ]) {
      await page.goto(route);
      await expect(page).toHaveURL(new RegExp(destination.replace(/[?]/g, '\\?') + '$'));
    }
  });

  test('sanitized public report renders from the local seed', async ({ page }) => {
    const response = await page.goto(`/report/${reportId}`);

    expect(response?.ok()).toBe(true);
    await expect(page.getByRole('heading').first()).toBeVisible();
    await expect(page.getByRole('link', { name: /start a website fix/i })).toHaveAttribute('href', '/contact?offer=website-fix');
  });

  test('privacy and terms keep their legal boundaries readable at public widths', async ({ page }) => {
    const legalRoutes = [
      {
        path: '/privacy',
        heading: 'Privacy Policy',
        sectionCount: 5,
        boundary: /public request does not create a subscription/i,
      },
      {
        path: '/terms',
        heading: 'Terms of Service',
        sectionCount: 7,
        boundary: /two manual invoices/i,
      },
    ];

    for (const viewport of [
      { width: 375, height: 800 },
      { width: 768, height: 900 },
      { width: 1280, height: 900 },
    ]) {
      await page.setViewportSize(viewport);

      for (const route of legalRoutes) {
        const legalPage = await page.context().newPage();
        const errors: string[] = [];
        legalPage.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
        legalPage.on('pageerror', (error) => errors.push(error.message));
        // Legal pages are anonymous. Keep the global auth provider from turning
        // a missing local NextAuth session into an unrelated console error.
        await legalPage.route('**/api/auth/session', (request) => request.fulfill({
          status: 200,
          contentType: 'application/json',
          body: '{}',
        }));

        await legalPage.setViewportSize(viewport);

        try {
          const response = await legalPage.goto(route.path);

          expect(response?.ok()).toBe(true);
          await expect(legalPage.getByRole('heading', { level: 1, name: route.heading, exact: true })).toBeVisible();
          await expect(legalPage.getByText('At a glance', { exact: true })).toBeVisible();
          await expect(legalPage.getByText(route.boundary)).toBeVisible();
          await expect(legalPage.getByRole('link', { name: 'Contact us', exact: true })).toHaveAttribute('href', '/contact');

          const sectionLinks = legalPage.locator('nav[aria-labelledby="on-this-page-heading"] a');
          await expect(sectionLinks).toHaveCount(route.sectionCount);
          await expect(sectionLinks.first()).toHaveAttribute('href', '#legal-section-1');
          await expect(legalPage.locator('[id="legal-section-1"]')).toHaveCount(1);

          const layout = await legalPage.evaluate(() => {
            const panels = Array.from(document.querySelectorAll<HTMLElement>('[data-legal-panel]'));
            const overlap = panels.some((panel, index) => {
              const first = panel.getBoundingClientRect();
              return panels.slice(index + 1).some((other) => {
                const second = other.getBoundingClientRect();
                return first.left < second.right
                  && first.right > second.left
                  && first.top < second.bottom
                  && first.bottom > second.top;
              });
            });

            return {
              overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
              overlap,
            };
          });

          expect(layout.overflow).toBe(false);
          expect(layout.overlap).toBe(false);
          expect(errors).toEqual([]);
        } finally {
          await legalPage.close();
        }
      }
    }
  });
});
