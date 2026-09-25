import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const publicRoutes = [
  '/', '/services', '/about', '/website-fix', '/managed-automation',
  '/how-it-works', '/system', '/pricing', '/work', '/blog', '/contact',
  '/faq', '/ada-compliance', '/privacy', '/terms',
  '/blog/ai-context-budget-tips', '/blog/loading-tricks-feel-instant',
  '/blog/rewriting-copy-plain-language', '/blog/finding-the-useful-shape',
  '/blog/build-the-smallest-useful-slice',
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

test('public photos and their frames fit narrow phone viewports', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'public-mobile', 'Phone image geometry belongs to the mobile project.');
  test.setTimeout(300_000);

  for (const width of [320, 390]) {
    await page.setViewportSize({ width, height: 844 });

    for (const route of publicRoutes) {
      const response = await page.goto(route);
      expect(response?.ok(), `${route} should load at ${width}px`).toBe(true);
      await expect(page.locator('main img[src*="/images/"]').first()).toBeVisible();

      const photos = await page.locator('main img[src*="/images/"]').evaluateAll(async (images) => {
        await Promise.all(images.map((image) => (image as HTMLImageElement).decode()));
        return images.map((image) => {
          const frame = image.parentElement!.getBoundingClientRect();
          const viewport = document.documentElement.clientWidth;
          const photo = image as HTMLImageElement;
          return {
            source: image.getAttribute('src'),
            left: frame.left,
            right: frame.right,
            viewport,
            aspectDifference: Math.abs(frame.width / frame.height - photo.naturalWidth / photo.naturalHeight),
          };
        });
      });

      expect(photos.length, `${route} should have a public photo`).toBeGreaterThan(0);
      expect(
        photos.filter(({ left, right, viewport, aspectDifference }) =>
          left < 15 || right > viewport - 15 || aspectDifference > 0.1
        ),
        `${route} has a clipped photo or frame at ${width}px`
      ).toEqual([]);
    }
  }
});

test('homepage text stays inside its containers at public widths', async ({ page }) => {
  for (const viewport of [
    { width: 375, height: 900 },
    { width: 1280, height: 900 },
  ]) {
    await page.setViewportSize(viewport);
    await page.goto('/');

    const overflow = await page.evaluate(() => {
      const viewportRight = document.documentElement.clientWidth;
      const textSelectors = 'h1,h2,h3,h4,h5,h6,p,li,a,button,label,dt,dd,blockquote';

      return Array.from(document.querySelectorAll<HTMLElement>(textSelectors)).flatMap((element) => {
        const style = getComputedStyle(element);
        const box = element.getBoundingClientRect();
        if (
          box.width <= 0 ||
          box.height <= 0 ||
          style.display === 'none' ||
          style.visibility === 'hidden' ||
          element.classList.contains('sr-only')
        ) return [];

        const issues: string[] = [];
        if (element.scrollWidth > element.clientWidth + 1) issues.push('scroll width exceeds client width');
        if (box.left < -1 || box.right > viewportRight + 1) issues.push('element escapes viewport');

        const range = document.createRange();
        range.selectNodeContents(element);
        const textRects = Array.from(range.getClientRects());
        if (textRects.some((rect) => rect.left < box.left - 1 || rect.right > box.right + 1)) {
          issues.push('text escapes element bounds');
        }

        return issues.length > 0
          ? [{
              element: `${element.tagName.toLowerCase()}.${String(element.className).slice(0, 80)}`,
              text: (element.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 100),
              issues,
            }]
          : [];
      });
    });

    expect(overflow, `Text overflow detected at ${viewport.width}px`).toEqual([]);
  }
});

test('homepage leads with the generalist portfolio promise', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 800 });
  await page.goto('/');
  const hero = page.locator('main > section').first();
  await expect(hero.getByRole('heading', { name: 'Practical software for messy problems.' })).toBeVisible();
  await expect(hero).toContainText('interfaces, backends, databases, APIs');
  await expect(hero.getByRole('link', { name: 'See selected work', exact: true })).toHaveAttribute('href', '/work');
  await expect(page.locator('#capabilities')).toBeVisible();
  await expect(page.locator('#featured-work')).toBeVisible();
  await expect(page.locator('main > section')).toHaveCount(4);
  await expect(hero.getByRole('link', { name: 'Start a conversation' })).toHaveAttribute('href', '/contact');
});

test('homepage previews lead to their full pages', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#capabilities').getByRole('link', { name: 'Explore capabilities' })).toHaveAttribute('href', '/services');
  await expect(page.locator('#featured-work').getByRole('link', { name: 'Explore selected work' })).toHaveAttribute('href', '/work');
});

test('capabilities and work show the technical range', async ({ page }) => {
  await page.goto('/services');
  const services = page.getByRole('main');
  await expect(services.locator('[data-public-capability-card]')).toHaveCount(6);
  await expect(services.getByRole('heading', { name: 'Interfaces people can actually use', exact: true })).toBeVisible();
  await expect(services.getByText('React and Next.js', { exact: true })).toBeVisible();

  await page.goto('/work');
  const work = page.getByRole('main');
  await expect(work.getByRole('heading', { name: 'NeedThisDone', exact: true })).toBeVisible();
  await expect(work.getByRole('heading', { name: 'Content workflow', exact: true })).toBeVisible();
  await expect(work.locator('article')).toHaveCount(3);
  await expect(work.getByRole('link', { name: 'Read the system note', exact: true })).toHaveAttribute('href', '/system');
  await expect(work.getByRole('link', { name: 'Open the code', exact: true })).toHaveAttribute('href', 'https://github.com/AbeJitsu/Need_This_Done');
});

test('contact keeps the message path concise and preserves offer aliases', async ({ page }) => {
  await page.goto('/contact?offer=website-fix');
  await expect(page.getByRole('heading', { name: 'Bring the technical problem as it is.' })).toBeVisible();
  await expect(page.getByRole('radio', { name: 'Website work', exact: true })).toBeChecked();
  await expect(page.getByRole('textbox', { name: /^Your message/ })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Start a conversation', exact: true })).toBeVisible();
});

test('desktop header and footer lead to the same full pages', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'public', 'Desktop navigation is intentionally collapsed on mobile.');
  await page.goto('/');
  const navigation = page.getByRole('navigation', { name: 'Main navigation' });
  const footer = page.getByRole('navigation', { name: 'Footer navigation' });
  for (const [label, href] of [
    ['Capabilities', '/services'],
    ['Selected Work', '/work'],
    ['About', '/about'],
    ['Notes', '/blog'],
  ]) {
    await expect(navigation.getByRole('link', { name: label, exact: true })).toHaveAttribute('href', href);
    await expect(footer.getByRole('link', { name: label, exact: true })).toHaveAttribute('href', href);
  }
  await navigation.getByRole('link', { name: 'Capabilities' }).click();
  await expect(page).toHaveURL(/\/services$/);
  await expect(page.getByRole('link', { name: 'Start a conversation', exact: true }).first()).toHaveAttribute('href', '/contact');
  await expect(footer.getByRole('link', { name: 'Capabilities', exact: true })).toHaveAttribute('aria-current', 'page');
  await expect(navigation.locator('a[href^="/dashboard"], a[href^="/employee"], a[href^="/prospecting"], a[href^="/admin"]')).toHaveCount(0);
});

test('mobile navigation opens the full page from home', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'public-mobile', 'Mobile menu behavior runs in the mobile public project.');
  await page.goto('/');
  await page.getByRole('button', { name: 'Open navigation menu' }).click();
  await page.getByRole('navigation', { name: 'Mobile navigation' }).getByRole('link', { name: 'Notes' }).click();
  await expect(page).toHaveURL(/\/blog$/);
  await expect(page.getByRole('navigation', { name: 'Mobile navigation' })).toHaveCount(0);
});

test('public pages pass an accessibility scan on the portfolio front door', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'public', 'Accessibility scan runs in the desktop public project.');
  await page.goto('/');
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});

test('public routes pass rendered color contrast checks', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'public', 'Contrast scan runs in the desktop public project.');

  for (const route of publicRoutes) {
    await page.goto(route);
    const results = await new AxeBuilder({ page }).withRules(['color-contrast']).analyze();
    expect(results.violations, `Color contrast violations on ${route}`).toEqual([]);
  }
});
