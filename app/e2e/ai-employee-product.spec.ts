import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const publicRoutes = ['/', '/services', '/about', '/website-fix', '/managed-automation', '/how-it-works', '/system', '/pricing', '/work', '/blog', '/contact', '/faq', '/site-analyzer', '/ada-compliance', '/privacy', '/terms', '/blog/ai-context-budget-tips', '/blog/loading-tricks-feel-instant', '/blog/rewriting-copy-plain-language'];

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
  for (const label of ['What We Do', 'How We Work', 'The System', 'Examples', 'Why Us']) {
    await expect(navigation.getByRole('link', { name: label, exact: true })).toBeVisible();
  }
  await expect(navigation.getByRole('link', { name: 'Why Us', exact: true })).toHaveAttribute('href', '/about');
  await expect(page.getByRole('link', { name: 'Share Your Vision', exact: true }).first()).toHaveAttribute('href', '/contact');
  await expect(page.getByRole('contentinfo').getByRole('link', { name: 'Why Us', exact: true })).toHaveAttribute('href', '/about');
  await expect(navigation.getByRole('link', { name: /how it works/i })).toHaveCount(0);
  await expect(navigation.locator('a[href^="/dashboard"], a[href^="/employee"], a[href^="/prospecting"], a[href^="/admin"]')).toHaveCount(0);
});

test('/system keeps its actions purposeful and its four stages connected', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'public', 'The dedicated system-page contract runs in the desktop public project.');
  const errors: string[] = [];
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
  page.on('pageerror', (error) => errors.push(error.message));

  await page.setViewportSize({ width: 375, height: 800 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const response = await page.goto('/system');

  expect(response?.ok()).toBe(true);
  const main = page.getByRole('main');
  await expect(main.getByRole('heading', { level: 1, name: 'Important work, kept moving.' })).toBeVisible();
  await expect(main.getByRole('link', { name: 'Share Your Vision', exact: true }).first()).toHaveAttribute('href', '/contact');
  await expect(main.getByRole('link', { name: 'Inspect the implementation', exact: true })).toHaveAttribute('href', 'https://github.com/AbeJitsu/Need_This_Done/tree/dev');
  await expect(main.locator('.system-map__stage')).toHaveCount(4);
  for (const title of ['Goal', 'Owner approval', 'Private execution', 'Reviewable proof']) {
    await expect(main.getByRole('heading', { name: title, exact: true })).toBeVisible();
  }

  const primaryHrefs = await main.getByRole('link', { name: 'Share Your Vision', exact: true }).evaluateAll((links) => links.map((link) => link.getAttribute('href')));
  expect(primaryHrefs).toEqual(['/contact', '/contact']);
  expect(primaryHrefs.every((href) => href && !href.startsWith('#'))).toBe(true);
  expect(await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1)).toBe(false);
  expect(await page.evaluate(() => getComputedStyle(document.querySelector('.system-map__connector')!, '::after').animationName)).toBe('none');
  expect(errors).toEqual([]);
});

test('/system keeps nodes and connectors separated at target widths', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'public', 'The explicit visual matrix runs in the desktop public project.');
  test.setTimeout(120_000);

  for (const viewport of [
    { width: 375, height: 800 },
    { width: 768, height: 900 },
    { width: 1024, height: 900 },
    { width: 1280, height: 900 },
  ]) {
    await page.setViewportSize(viewport);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/system');

    const layout = await page.evaluate(() => {
      const intersects = (first: DOMRect, second: DOMRect) => first.left < second.right - 0.5
        && first.right > second.left + 0.5
        && first.top < second.bottom - 0.5
        && first.bottom > second.top + 0.5;
      const cards = Array.from(document.querySelectorAll<HTMLElement>('.system-map__card, .system-rail__card'));
      const connectors = Array.from(document.querySelectorAll<HTMLElement>('.system-map__connector, .system-rail__connector'));
      const connectorHitsCard = connectors.some((connector) => {
        const connectorRect = connector.getBoundingClientRect();
        return cards.some((card) => intersects(connectorRect, card.getBoundingClientRect()));
      });
      const textEscapesCard = cards.some((card) => {
        const cardRect = card.getBoundingClientRect();
        const textNodes = Array.from(card.querySelectorAll<HTMLElement>('.system-map__title, .system-map__description, .system-rail__title, .system-rail__description'));
        return card.scrollWidth > card.clientWidth + 1
          || card.scrollHeight > card.clientHeight + 1
          || textNodes.some((node) => {
            const textRect = node.getBoundingClientRect();
            return textRect.left < cardRect.left - 1
              || textRect.right > cardRect.right + 1
              || textRect.top < cardRect.top - 1
              || textRect.bottom > cardRect.bottom + 1;
          });
      });
      const titleWraps = Array.from(document.querySelectorAll<HTMLElement>('.system-map__title, .system-rail__title')).some((title) => {
        const lineHeight = parseFloat(getComputedStyle(title).lineHeight);
        return title.getBoundingClientRect().height > lineHeight * 1.25;
      });
      const architectureRows = new Set(
        Array.from(document.querySelectorAll<HTMLElement>('.system-rail--architecture .system-rail__item'))
          .map((item) => Math.round(item.getBoundingClientRect().top)),
      ).size;
      const mapRows = new Map<number, number>();
      Array.from(document.querySelectorAll<HTMLElement>('.system-map__stage')).forEach((stage) => {
        const top = Math.round(stage.getBoundingClientRect().top);
        mapRows.set(top, (mapRows.get(top) || 0) + 1);
      });
      const railLayouts = Array.from(document.querySelectorAll<HTMLElement>('.system-rail--five, .system-rail--four')).map((rail) => {
        const railRect = rail.getBoundingClientRect();
        const rows = new Map<number, DOMRect[]>();
        Array.from(rail.querySelectorAll<HTMLElement>(':scope > .system-rail__item')).forEach((item) => {
          const itemRect = item.getBoundingClientRect();
          const row = rows.get(Math.round(itemRect.top)) || [];
          row.push(itemRect);
          rows.set(Math.round(itemRect.top), row);
        });
        return {
          kind: rail.classList.contains('system-rail--five') ? 'five' : 'four',
          rowCounts: Array.from(rows.values()).map((row) => row.length),
          centeredShortRows: Array.from(rows.values()).filter((row) => row.length < 3).every((row) => {
            const left = Math.min(...row.map((rect) => rect.left));
            const right = Math.max(...row.map((rect) => rect.right));
            return Math.abs((left + right) / 2 - (railRect.left + railRect.right) / 2) < 2;
          }),
        };
      });
      return {
        overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
        connectorHitsCard,
        textEscapesCard,
        titleWraps,
        architectureRows,
        mapRowCounts: Array.from(mapRows.values()),
        railLayouts,
        heroMapVisible: Boolean(document.querySelector('.system-map-shell')),
        primaryVisible: Boolean(document.querySelector('.system-hero__actions a[href="/contact"]')),
        reducedMapMotion: getComputedStyle(document.querySelector('.system-map__connector')!, '::after').animationName,
        reducedRailMotion: getComputedStyle(document.querySelector('.system-rail__connector-dot')!).animationName,
      };
    });

    expect(layout.overflow).toBe(false);
    expect(layout.connectorHitsCard).toBe(false);
    expect(layout.textEscapesCard).toBe(false);
    expect(layout.titleWraps).toBe(false);
    expect(layout.mapRowCounts).toEqual(viewport.width >= 1200 ? [2, 2] : [1, 1, 1, 1]);
    expect(layout.railLayouts.every((rail) => rail.rowCounts.every((count) => count <= 3))).toBe(true);
    if (viewport.width >= 1024) {
      expect(layout.railLayouts.filter((rail) => rail.kind === 'five').every((rail) => rail.rowCounts.join(',') === '2,2,1')).toBe(true);
      expect(layout.railLayouts.filter((rail) => rail.kind === 'four').every((rail) => rail.rowCounts.join(',') === '2,2')).toBe(true);
      expect(layout.railLayouts.every((rail) => rail.centeredShortRows)).toBe(true);
    }
    expect(layout.architectureRows).toBe(viewport.width >= 1024 ? 3 : 5);
    expect(layout.heroMapVisible).toBe(true);
    expect(layout.primaryVisible).toBe(true);
    expect(layout.reducedMapMotion).toBe('none');
    expect(layout.reducedRailMotion).toBe('none');
    await expect(page.getByRole('main')).toHaveCount(1);
    await expect(new AxeBuilder({ page }).include('main').analyze()).resolves.toMatchObject({ violations: [] });
  }
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
