import { expect, test } from '@playwright/test';

const publicRoutes = ['/', '/services', '/website-fix', '/managed-automation', '/how-it-works', '/pricing', '/work', '/blog', '/contact', '/faq'];

for (const route of publicRoutes) {
  test(`${route} renders with a heading and no overflow`, async ({ page }) => {
    const errors: string[] = [];
    page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
    page.on('pageerror', (error) => errors.push(error.message));
    const response = await page.goto(route);
    expect(response?.ok()).toBe(true);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1)).toBe(false);
    expect(errors).toEqual([]);
  });
}

test('homepage first viewport identifies audience, promise, and action without mechanics', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 800 });
  await page.goto('/');
  const firstSection = page.locator('main > section').first();
  await expect(firstSection.getByText('For owners and founders', { exact: true })).toBeVisible();
  await expect(firstSection.getByRole('heading', { name: 'Your vision, brought to life.' })).toBeVisible();
  await expect(firstSection.getByRole('link', { name: /share your vision/i })).toBeVisible();
  await expect(firstSection).not.toContainText(/API|database|automation system|technical implementation/i);
});

test('representative examples never imply client proof', async ({ page }) => {
  await page.goto('/work');
  await expect(page.getByText(/hypothetical, representative before-and-after scenarios/i)).toBeVisible();
  await expect(page.getByText(/not client work, paid outcomes, or delivery proof/i)).toBeVisible();
  await expect(page.getByText(/no time saving, delivery result, or live automation is claimed/i)).toBeVisible();
});

test('general contact submission keeps service optional and reports success', async ({ page }) => {
  let submitted: Record<string, string> = {};
  await page.route('**/api/projects', async (route) => {
    const request = route.request();
    const form = await request.postDataBuffer();
    const contentType = request.headers()['content-type'];
    expect(contentType).toContain('multipart/form-data');
    submitted = { raw: form?.toString('utf8') || '' };
    await route.fulfill({ status: 200, contentType: 'application/json', body: '{"success":true}' });
  });
  await page.goto('/contact');
  await page.waitForLoadState('networkidle');
  await expect(page.getByRole('radio', { name: /website fix/i })).not.toBeChecked();
  await expect(page.getByRole('radio', { name: /managed automation/i })).not.toBeChecked();
  await page.getByRole('textbox', { name: /^name$/i }).fill('Jordan Owner');
  await page.getByRole('textbox', { name: /^email$/i }).fill('jordan@example.com');
  await page.getByRole('textbox', { name: /your vision/i }).fill('A clearer way to welcome customers.');
  await page.getByRole('textbox', { name: /desired outcome/i }).fill('Customers understand the next step.');
  await page.getByRole('button', { name: /share your vision/i }).click();
  await expect(page.getByRole('heading', { name: /thank you for sharing it/i })).toBeVisible();
  expect(submitted.raw).toContain('A clearer way to welcome customers.');
  expect(submitted.raw).toContain('Not selected');
});

test('offer aliases preselect their matching optional service', async ({ page }) => {
  for (const [offer, label] of [['website-fix', 'Website Fix'], ['managed-automation', 'Managed Automation']] as const) {
    await page.goto(`/contact?offer=${offer}`);
    await expect(page.getByRole('radio', { name: new RegExp(label, 'i') })).toBeChecked();
    await expect(page.getByRole('textbox', { name: /your vision/i })).toBeVisible();
    await expect(page.getByRole('textbox', { name: /desired outcome/i })).toBeVisible();
  }
});

test('contact reports a submission error and remains usable', async ({ page }) => {
  await page.route('**/api/projects', (route) => route.fulfill({ status: 500, contentType: 'application/json', body: '{}' }));
  await page.goto('/contact?offer=website-fix');
  await page.waitForLoadState('networkidle');
  await page.getByRole('textbox', { name: /^name$/i }).fill('Jordan Owner');
  await page.getByRole('textbox', { name: /^email$/i }).fill('jordan@example.com');
  await page.getByRole('textbox', { name: /your vision/i }).fill('A better website page.');
  await page.getByRole('textbox', { name: /desired outcome/i }).fill('A clear next action.');
  await page.getByRole('button', { name: /share your vision/i }).click();
  await expect(page.locator('p[role="alert"]')).toContainText(/could not send your vision/i);
  await expect(page.getByRole('button', { name: /share your vision/i })).toBeEnabled();
});

test('faq answers the retained offer boundary', async ({ page }) => {
  await page.goto('/faq');
  const question = page.getByRole('button', { name: /what does website fix include/i });
  await question.click();
  await expect(page.getByText(/a \$500 review and one agreed website fix/i)).toBeVisible();
});

test('desktop public navigation follows the approved public journey', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'public', 'Desktop navigation is intentionally collapsed on mobile.');
  await page.goto('/');
  const navigation = page.getByRole('navigation', { name: 'Main navigation' });
  for (const label of ['What We Do', 'Why Us', 'Examples', 'Insights']) {
    await expect(navigation.getByRole('link', { name: label, exact: true })).toBeVisible();
  }
  await expect(page.getByRole('link', { name: 'Share Your Vision', exact: true }).first()).toHaveAttribute('href', '/contact');
  await expect(navigation.getByRole('link', { name: /how it works/i })).toHaveCount(0);
  await expect(navigation.locator('a[href^="/dashboard"], a[href^="/employee"], a[href^="/prospecting"], a[href^="/admin"]')).toHaveCount(0);
});

test('public journey supports keyboard, reduced motion, and three target widths', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'public', 'One browser covers the explicit responsive-width matrix.');
  await page.emulateMedia({ reducedMotion: 'reduce' });

  for (const viewport of [
    { width: 375, height: 800 },
    { width: 768, height: 900 },
    { width: 1280, height: 900 },
  ]) {
    await page.setViewportSize(viewport);
    for (const route of publicRoutes) {
      await page.goto(route);
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1)).toBe(false);
    }

    await page.goto('/');
    if (viewport.width < 1024) {
      const menuButton = page.getByRole('button', { name: 'Open navigation menu' });
      await menuButton.focus();
      await page.keyboard.press('Enter');
      await expect(page.getByRole('navigation', { name: 'Mobile navigation' })).toBeVisible();
      await page.keyboard.press('Escape');
      await expect(page.getByRole('navigation', { name: 'Mobile navigation' })).toHaveCount(0);
      await expect(menuButton).toBeFocused();
    } else {
      await page.keyboard.press('Tab');
      await expect(page.locator(':focus')).toBeVisible();
    }
  }
});
