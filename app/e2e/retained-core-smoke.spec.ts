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

  test('contact intake keeps offer aliases while using shared vision questions', async ({ page }) => {
    const response = await page.goto('/contact?offer=website-fix');

    expect(response?.ok()).toBe(true);
    await expect(page.getByRole('heading', { name: /listen before suggesting/i })).toBeVisible();
    await page.getByRole('button', { name: /^Step 4:/ }).click();
    await expect(page.getByRole('radio', { name: 'Website Fix', exact: true })).toBeChecked();
    await page.getByRole('radio', { name: 'Managed Automation', exact: true }).check();
    await expect(page.getByRole('radio', { name: 'Managed Automation', exact: true })).toBeChecked();
    await page.getByRole('button', { name: /^Step 1:/ }).click();
    await expect(page.getByRole('textbox', { name: /idea or situation/i })).toBeVisible();
  });

  test('site analyzer page renders the audit form', async ({ page }) => {
    const response = await page.goto('/site-analyzer');

    expect(response?.ok()).toBe(true);
    await expect(page.getByRole('heading', { name: /see where your website could work better/i })).toBeVisible();
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
    await expect(page.getByRole('link', { name: /see website fix details/i })).toHaveAttribute('href', '/website-fix');
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
          await expect(legalPage.getByRole('link', { name: 'Email us', exact: true })).toHaveAttribute('href', 'mailto:hello@needthisdone.com');

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

test('report and missing-page recovery remain readable at all public widths', async ({ page }) => {
  test.setTimeout(120_000);
  for (const width of [375, 768, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    for (const [route, name] of [[`/report/${reportId}`, 'report'], ['/missing-public-review-page', 'not-found']]) {
      await page.goto(route);
      await expect(page.getByRole('main')).toHaveCount(1);
      await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
      expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1)).toBe(false);
      await page.screenshot({ path: `/tmp/public-review-${width}-${name}.png`, fullPage: true });
      if (name === 'not-found') {
        await page.getByRole('main').getByRole('link', { name: 'Return Home' }).click();
        await expect(page).toHaveURL(/\/$/);
      }
    }
  }
});

test('FAQ closing action stays readable without wrapping at public widths', async ({ page }) => {
  for (const width of [375, 768, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/faq');
    const action = page.getByRole('main').getByRole('link', { name: 'Share Your Vision', exact: true }).last();
    await action.scrollIntoViewIfNeeded();
    await expect(action).toBeVisible();
    expect(await action.evaluate(element => getComputedStyle(element).whiteSpace)).toBe('nowrap');
    await page.screenshot({ path: `/tmp/public-review-${width}-_faq.png`, fullPage: true });
  }
});
