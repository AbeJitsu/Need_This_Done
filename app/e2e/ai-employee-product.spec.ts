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
  await expect(page.getByRole('heading', { name: /private team sign-in/i })).toBeVisible();
  await expect(page.getByText('Private team access', { exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: /welcome back/i })).toBeVisible();
  await expect(page.getByLabel('Email Address')).toBeVisible();
});

test('insights makes the reading path and notes easy to scan', async ({ page }) => {
  await page.goto('/blog');
  await expect(page.getByRole('heading', { name: /make the next step clearer/i })).toBeVisible();
  await expect(page.getByRole('heading', { name: /read what helps you move/i })).toBeVisible();
  await expect(page.getByText('Carry it forward', { exact: true }).first()).toBeVisible();
  await expect(page.getByRole('link', { name: /read note/i }).first()).toBeVisible();
});

test('contact gives Website Fix a clear working area', async ({ page }) => {
  await page.goto('/contact?offer=website-fix');
  await expect(page.getByText('Website Fix context', { exact: true })).toBeVisible();
  await expect(page.getByRole('textbox', { name: /website url/i })).toBeVisible();
  await expect(page.getByRole('textbox', { name: /what needs attention/i })).toBeVisible();
  await expect(page.getByRole('textbox', { name: /what should improve/i })).toBeVisible();
  await expect(page.getByText(/keep it specific/i)).toBeVisible();
});

test('contact keeps both context headings inside their fieldset panels', async ({ page }) => {
  for (const context of [
    { offer: 'website-fix', heading: 'Website Fix context', field: /website url/i },
    { offer: 'managed-automation', heading: 'Managed Automation context', field: /where does work get stuck/i },
  ]) {
    await page.goto(`/contact?offer=${context.offer}`);

    const panel = page.locator('fieldset').filter({ has: page.locator('legend', { hasText: context.heading }) });
    const legend = panel.locator('legend');
    await expect(legend).toHaveText(context.heading);
    await expect(panel.getByRole('textbox', { name: context.field })).toBeVisible();

    const panelBox = await panel.boundingBox();
    const legendBox = await legend.boundingBox();
    expect(panelBox).not.toBeNull();
    expect(legendBox).not.toBeNull();

    const panelRight = panelBox!.x + panelBox!.width;
    const panelBottom = panelBox!.y + panelBox!.height;
    const legendRight = legendBox!.x + legendBox!.width;
    const legendBottom = legendBox!.y + legendBox!.height;
    const firstContent = panel.locator(':scope > p, :scope > label').first();
    const firstContentBox = await firstContent.boundingBox();
    expect(firstContentBox).not.toBeNull();
    expect(legendBox!.y - panelBox!.y).toBeGreaterThan(8);
    expect(firstContentBox!.y - legendBottom).toBeGreaterThan(12);
    expect(panelBottom - legendBottom).toBeGreaterThan(4);
    expect(legendBox!.x).toBeGreaterThanOrEqual(panelBox!.x + 4);
    expect(legendRight).toBeLessThanOrEqual(panelRight - 4);
  }
});

test('how it works keeps the process and better result visible', async ({ page }) => {
  await page.goto('/how-it-works');
  await expect(page.getByRole('heading', { name: /start with what should be different/i })).toBeVisible();
  await expect(page.getByRole('heading', { name: /a short path from stuck to done/i })).toBeVisible();
  await expect(page.getByRole('heading', { name: /keep the better state in view/i })).toBeVisible();
});

test('faq answers questions without overlapping its summary and list', async ({ page }) => {
  await page.goto('/faq');
  const question = page.getByRole('button', { name: /what does website fix include/i });
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
  await expect(page.getByRole('heading', { name: /fix the work that’s slowing you down/i })).toBeVisible();
  await expect(page.getByText(/one problem\. one agreed outcome/i)).toBeVisible();
  await expect(page.getByRole('link', { name: /start a website fix/i }).first()).toBeVisible();
  await expect(page.getByRole('link', { name: /discuss managed automation/i }).first()).toBeVisible();
});

test('desktop public navigation follows the public page progression', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'public', 'Desktop navigation is intentionally collapsed on mobile.');
  await page.goto('/');
  const navigation = page.getByRole('navigation', { name: 'Main navigation' });
  for (const label of ['Website Fix', 'Managed Automation', 'How It Works', 'How We Work']) {
    await expect(navigation.getByRole('link', { name: label, exact: true })).toBeVisible();
  }
  const cta = page.getByRole('link', { name: 'Choose a starting point', exact: true });
  await expect(cta).toBeVisible();
  await expect(cta).toHaveAttribute('href', '/contact');
  const headerBox = await page.locator('header').first().boundingBox();
  const ctaBox = await cta.boundingBox();
  expect(headerBox).not.toBeNull();
  expect(ctaBox).not.toBeNull();
  expect(ctaBox!.y - headerBox!.y).toBeGreaterThan(16);
  expect((headerBox!.y + headerBox!.height) - (ctaBox!.y + ctaBox!.height)).toBeGreaterThan(16);
  await expect(navigation.locator('a[href^="/dashboard"], a[href^="/employee"], a[href^="/prospecting"], a[href^="/admin"]')).toHaveCount(0);
});

test('the simplified journey works by keyboard at phone, tablet, and desktop widths', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'public', 'One browser covers the explicit responsive-width matrix.');
  await page.emulateMedia({ reducedMotion: 'reduce' });

  for (const viewport of [
    { width: 375, height: 800 },
    { width: 768, height: 900 },
    { width: 1280, height: 900 },
  ]) {
    await page.setViewportSize(viewport);
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Fix the work that’s slowing you down.');
    await expect(page.locator('main dl')).toHaveCount(2);
    await expect(page.locator('main ol')).toHaveCount(2);
    await expect(page.locator('img[alt=""]')).toHaveCount(0);
    await expect(page.locator('a[href="/login"]')).toHaveCount(0);
    expect(await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1)).toBe(false);

    if (viewport.width < 1024) {
      const menuButton = page.getByRole('button', { name: 'Open navigation menu' });
      await menuButton.focus();
      await page.keyboard.press('Enter');
      await expect(page.getByRole('navigation', { name: 'Mobile navigation' })).toBeVisible();
      await page.keyboard.press('Escape');
      await expect(page.getByRole('navigation', { name: 'Mobile navigation' })).toHaveCount(0);
    } else {
      await page.keyboard.press('Tab');
      const focused = page.locator(':focus');
      await expect(focused).toBeVisible();
      expect(await focused.evaluate((element) => ['A', 'BUTTON'].includes(element.tagName))).toBe(true);
    }
  }
});
