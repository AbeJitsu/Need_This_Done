import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const publicRoutes = [
  '/', '/services', '/about', '/website-fix', '/managed-automation',
  '/how-it-works', '/system', '/pricing', '/work', '/blog', '/contact',
  '/faq', '/site-analyzer', '/ada-compliance', '/privacy', '/terms',
  '/blog/ai-context-budget-tips', '/blog/loading-tricks-feel-instant',
  '/blog/rewriting-copy-plain-language',
];

for (const route of publicRoutes) {
  test(`${route} renders with a heading and no overflow`, async ({ page }) => {
    const errors: string[] = [];
    page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
    page.on('pageerror', (error) => errors.push(error.message));
    const response = await page.goto(route);
    expect(response?.ok()).toBe(true);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.getByRole('main')).toHaveCount(1);
    expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1)).toBe(false);
    expect(errors).toEqual([]);
  });
}

test('homepage leads with the generalist portfolio promise', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 800 });
  await page.goto('/');
  const hero = page.locator('main > section').first();
  await expect(hero.getByRole('heading', { name: 'I build across the stack.' })).toBeVisible();
  await expect(hero).toContainText('browser, a backend, a database, an API');
  await expect(hero.getByRole('link', { name: 'See selected work', exact: true })).toHaveAttribute('href', '/work#case-studies');
  await expect(page.locator('#capabilities')).toBeVisible();
  await expect(page.locator('#featured-work')).toBeVisible();
  await expect(page.locator('#approach')).toBeVisible();
  await expect(page.locator('#notes')).toBeVisible();
  await expect(page.locator('main > section')).toHaveCount(5);
});

test('homepage next steps move through the portfolio story', async ({ page }) => {
  await page.goto('/');
  for (const [section, label, href] of [
    ['capabilities', 'Next: Selected Work', '#featured-work'],
    ['featured-work', 'Next: About', '#approach'],
    ['approach', 'Next: Notes', '#notes'],
    ['notes', 'Next: Start a conversation', '/contact'],
  ]) {
    await expect(page.locator(`#${section}`).getByRole('link', { name: label, exact: true })).toHaveAttribute('href', href);
  }
});

test('capabilities and work show the technical range', async ({ page }) => {
  await page.goto('/services');
  const services = page.getByRole('main');
  await expect(services.locator('[data-public-capability-card]')).toHaveCount(6);
  await expect(services.getByRole('heading', { name: 'Interfaces people can actually use', exact: true })).toBeVisible();
  await expect(services.getByText('React and Next.js', { exact: true })).toBeVisible();

  await page.goto('/work');
  const work = page.getByRole('main');
  await expect(work.getByRole('heading', { name: 'NeedThisDone.com', exact: true })).toBeVisible();
  await expect(work.getByRole('heading', { name: 'Acadio', exact: true })).toBeVisible();
  await expect(work.locator('[data-public-capability-card]')).toHaveCount(6);
  await expect(work.locator('[data-public-proof-card]')).toHaveCount(4);
  await expect(work.getByRole('link', { name: 'Read the NeedThisDone system note', exact: true })).toHaveAttribute('href', '/system');
  await expect(work.getByRole('link', { name: 'Open the GitHub repository', exact: true })).toHaveAttribute('href', 'https://github.com/AbeJitsu/Need_This_Done');
});

test('contact keeps the message path concise and preserves offer aliases', async ({ page }) => {
  await page.goto('/contact?offer=website-fix');
  await expect(page.getByRole('heading', { name: 'Bring the technical problem as it is.' })).toBeVisible();
  await expect(page.getByRole('radio', { name: 'Website work', exact: true })).toBeChecked();
  await expect(page.getByRole('textbox', { name: /^Your message/ })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Start a conversation', exact: true })).toBeVisible();
});

test('desktop public navigation names the portfolio sections', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'public', 'Desktop navigation is intentionally collapsed on mobile.');
  await page.goto('/');
  const navigation = page.getByRole('navigation', { name: 'Main navigation' });
  for (const [label, href] of [
    ['Selected Work', '/#featured-work'],
    ['Capabilities', '/#capabilities'],
    ['About', '/#approach'],
    ['Notes', '/#notes'],
  ]) {
    await expect(navigation.getByRole('link', { name: label, exact: true })).toHaveAttribute('href', href);
  }
  await expect(page.getByRole('link', { name: 'Start a conversation', exact: true }).first()).toHaveAttribute('href', '/contact');
  await expect(page.getByRole('contentinfo').getByRole('link', { name: 'NeedThisDone system', exact: true })).toHaveAttribute('href', '/system');
  await expect(navigation.locator('a[href^="/dashboard"], a[href^="/employee"], a[href^="/prospecting"], a[href^="/admin"]')).toHaveCount(0);
});

test('public pages pass an accessibility scan on the portfolio front door', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'public', 'Accessibility scan runs in the desktop public project.');
  await page.goto('/');
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});
