import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const publicRoutes = ['/', '/services', '/about', '/website-fix', '/managed-automation', '/how-it-works', '/pricing', '/work', '/blog', '/contact', '/faq', '/site-analyzer', '/ada-compliance', '/privacy', '/terms', '/blog/ai-context-budget-tips', '/blog/loading-tricks-feel-instant', '/blog/rewriting-copy-plain-language'];

for (const route of publicRoutes) {
  test(`${route} renders with a heading and no overflow`, async ({ page }) => {
    const errors: string[] = [];
    page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
    page.on('pageerror', (error) => errors.push(error.message));
    const response = await page.goto(route);
    expect(response?.ok()).toBe(true);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.getByRole('main')).toHaveCount(1);
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

async function fillIntake(page: import('@playwright/test').Page) {
  await page.getByRole('textbox', { name: /idea or situation/i }).fill('Requests disappear between inboxes.');
  await page.getByRole('textbox', { name: /what keeps happening/i }).fill('People follow up twice.');
  await page.getByRole('button', { name: /^Step 3:/ }).click();
  await page.getByRole('textbox', { name: /what needs to be different/i }).fill('Every request has a clear next step.');
  await page.getByRole('button', { name: /^Step 4:/ }).click();
  await page.getByRole('textbox', { name: /^name$/i }).fill('Jordan Owner');
  await page.getByRole('textbox', { name: /^email$/i }).fill('jordan@example.com');
}

test('general intake preserves answers through failure and retry', async ({ page }) => {
  let calls = 0;
  let submitted = '';
  await page.route('**/api/projects', async route => {
    submitted = route.request().postData() || '';
    await route.fulfill({ status: ++calls === 1 ? 500 : 200, contentType: 'application/json', body: '{}' });
  });
  await page.goto('/contact');
  await fillIntake(page);
  await expect(page.getByRole('radio', { name: 'No service selected' })).toBeChecked();
  await page.getByRole('button', { name: /share your vision/i }).click();
  await expect(page.getByRole('main').getByRole('alert')).toContainText('Your answers are still here');
  await page.getByRole('button', { name: /share your vision/i }).click();
  await expect(page.getByRole('heading', { name: /thank you for sharing it/i })).toBeVisible();
  expect(submitted).toContain('Requests disappear between inboxes.');
  expect(submitted).toContain('"offer":null');
});

test('offer aliases remain optional and previewable', async ({ page }) => {
  for (const [offer, label] of [['website-fix', 'Website Fix'], ['website-improvement', 'Website Fix'], ['managed-automation', 'Managed Automation'], ['ai-operator', 'Managed Automation']]) {
    await page.goto(`/contact?offer=${offer}`);
    await page.waitForLoadState("networkidle");
    await page.getByRole('button', { name: /^Step 4:/ }).click();
    await expect(page.getByRole('radio', { name: label, exact: true })).toBeChecked();
    await page.getByRole('radio', { name: 'No service selected' }).check();
    await page.getByRole('button', { name: /^Step 1:/ }).click();
    await expect(page.getByRole('textbox', { name: /idea or situation/i })).toBeVisible();
  }
});

test('faq answers the retained offer boundary', async ({ page }) => {
  await page.goto('/faq');
  await page.waitForLoadState('networkidle');
  const question = page.getByRole('button', { name: /what does website fix include/i });
  await question.click();
  await expect(page.getByText(/\$500 total/i)).toBeVisible();
});

test('desktop public navigation follows the approved public journey', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'public', 'Desktop navigation is intentionally collapsed on mobile.');
  await page.goto('/');
  const navigation = page.getByRole('navigation', { name: 'Main navigation' });
  for (const label of ['What We Do', 'How We Work', 'Examples', 'Why Us']) {
    await expect(navigation.getByRole('link', { name: label, exact: true })).toBeVisible();
  }
  await expect(navigation.getByRole('link', { name: 'Why Us', exact: true })).toHaveAttribute('href', '/about');
  await expect(page.getByRole('link', { name: 'Share Your Vision', exact: true }).first()).toHaveAttribute('href', '/contact');
  await expect(page.getByRole('contentinfo').getByRole('link', { name: 'Why Us', exact: true })).toHaveAttribute('href', '/about');
  await expect(navigation.getByRole('link', { name: /how it works/i })).toHaveCount(0);
  await expect(navigation.locator('a[href^="/dashboard"], a[href^="/employee"], a[href^="/prospecting"], a[href^="/admin"]')).toHaveCount(0);
});

test('public journey supports keyboard, reduced motion, and three target widths', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'public', 'One browser covers the explicit responsive-width matrix.');
  test.setTimeout(300_000);
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
    await expect(page.getByRole('main')).toHaveCount(1);
      expect(await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1)).toBe(false);
      expect((await new AxeBuilder({ page }).include('main').analyze()).violations).toEqual([]);
      await page.screenshot({ path: `/tmp/public-review-${viewport.width}-${route.replace(/[^a-z0-9]/gi, '_') || 'home'}.png`, fullPage: true });
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

test('examples, offer details, pricing, articles, and intake stay connected', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'Explore this example: A website that earns the next click' }).click();
  await expect(page).toHaveURL(/\/work#website-fix$/);
  await page.locator('#website-fix').getByRole('link', { name: 'Explore Website Fix' }).click();
  await expect(page).toHaveURL(/\/website-fix$/);
  await page.getByRole('main').getByRole('link', { name: 'Share Your Vision', exact: true }).last().click();
  await page.getByRole('button', { name: /^Step 4:/ }).click();
  await expect(page.getByRole('radio', { name: 'Website Fix', exact: true })).toBeChecked();
  await page.goBack();
  await expect(page).toHaveURL(/\/website-fix$/);
  await page.goto('/pricing');
  await page.getByRole('main').getByRole('link', { name: 'See Managed Automation details' }).click();
  await expect(page).toHaveURL(/\/managed-automation$/);
  await page.goto('/blog?category=retired&tag=old');
  await expect(page.getByRole('link', { name: /^Read note:/ })).toHaveCount(3);
  await expect(page.getByRole('navigation', { name: 'Insight categories' })).toHaveCount(0);
  for (const [slug, destination] of [['ai-context-budget-tips', '/managed-automation'], ['loading-tricks-feel-instant', '/website-fix'], ['rewriting-copy-plain-language', '/website-fix']]) {
    await page.goto(`/blog/${slug}`);
    await expect(page.getByRole('main')).toHaveCount(1);
    await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
    await expect(page.locator('a[href*="?tag="]')).toHaveCount(0);
    await expect(page.getByRole('main').getByRole('link', { name: /^Explore (Website Fix|Managed Automation)$/ })).toHaveAttribute('href', destination);
  }
});

test('snapshot validates, waits truthfully, recovers, and opens an isolated report response', async ({ page }) => {
  let calls = 0;
  await page.route('**/api/site-analyzer', async route => {
    calls++;
    await route.fulfill({ status: calls === 1 ? 429 : calls === 2 ? 500 : 200, contentType: 'application/json', body: calls < 3 ? '{}' : JSON.stringify({ redirectUrl: '/report/40000000-0000-4000-8000-000000000001' }) });
  });
  await page.goto('/site-analyzer');
  await page.getByRole('button', { name: 'Create my website snapshot' }).click();
  await expect(page.getByRole('main').getByRole('alert')).toContainText('Enter a website address');
  await page.getByRole('textbox', { name: 'Website URL' }).fill('example.com');
  await page.getByRole('textbox', { name: 'Email address' }).fill('owner@example.com');
  await page.getByRole('button', { name: /try creating/i }).click();
  await expect(page.getByRole('main').getByRole('alert')).toContainText('tomorrow');
  await page.getByRole('button', { name: /try creating/i }).click();
  await expect(page.getByRole('main').getByRole('alert')).toContainText('could not create');
  await expect(page.getByRole('textbox', { name: 'Website URL' })).toHaveValue('example.com');
  await page.getByRole('button', { name: /try creating/i }).click();
  await expect(page).toHaveURL(/\/report\//);
});
