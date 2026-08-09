import { expect, test } from '@playwright/test';

for (const route of ['/', '/services', '/how-it-works', '/pricing', '/work', '/blog', '/contact', '/faq', '/login']) {
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

test('insights makes the reading path and notes easy to scan', async ({ page }) => {
  await page.goto('/blog');
  await expect(page.getByRole('heading', { name: /make the next step clearer/i })).toBeVisible();
  await expect(page.getByRole('heading', { name: /read what helps you move/i })).toBeVisible();
  await expect(page.getByText('Carry it forward', { exact: true })).toBeVisible();
  await expect(page.getByRole('link', { name: /read note/i }).first()).toBeVisible();
});

test('contact gives the targeted fix context a clear working area', async ({ page }) => {
  await page.goto('/contact?offer=website-improvement');
  await expect(page.getByText('Targeted fix context', { exact: true })).toBeVisible();
  await expect(page.getByRole('textbox', { name: /website url/i })).toBeVisible();
  await expect(page.getByRole('textbox', { name: /what needs attention/i })).toBeVisible();
  await expect(page.getByRole('textbox', { name: /what should improve/i })).toBeVisible();
  await expect(page.getByText(/keep it specific/i)).toBeVisible();
});

test('how it works makes the process and review boundary visible', async ({ page }) => {
  await page.goto('/how-it-works');
  await expect(page.getByRole('heading', { name: /work backward from the result/i })).toBeVisible();
  await expect(page.getByRole('heading', { name: /make the handoffs visible/i })).toBeVisible();
  await expect(page.getByRole('heading', { name: /review is the boundary/i })).toBeVisible();
});

test('faq answers questions without overlapping its summary and list', async ({ page }) => {
  await page.goto('/faq');
  const question = page.getByRole('button', { name: /what does the targeted fix commit to/i });
  await question.click();
  await expect(page.getByText(/a \$500 review and one agreed website fix/i)).toBeVisible();

  const overlap = await page.locator('main > section').nth(1).evaluate((section) => {
    const children = Array.from(section.children).map((child) => child.getBoundingClientRect());
    if (children.length < 2) return false;
    const [summary, questions] = children;
    return summary.right > questions.left
      && questions.right > summary.left
      && summary.bottom > questions.top
      && questions.bottom > summary.top;
  });
  expect(overlap).toBe(false);
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
