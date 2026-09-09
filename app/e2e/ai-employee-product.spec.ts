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
  await expect(firstSection.getByRole('figure')).toHaveCount(0);
  await expect(page.locator('#how-it-works .homepage-teaser')).toBeVisible();
  await expect(page.locator('#how-it-works .homepage-teaser__stage')).toHaveCount(3);
  for (const beat of ['Tell us what’s stuck', 'Choose what to change', 'Make it real']) {
    await expect(page.locator('#how-it-works').getByRole('heading', { name: beat, exact: true })).toBeVisible();
  }
  await expect(page.locator('#how-it-works .homepage-teaser__stage--better')).toHaveCount(1);
  await expect(page.locator('.homepage-offer-card')).toHaveCount(2);
  await expect(page.locator('.homepage-offer-card .service-illustration')).toHaveCount(0);
  await expect(firstSection).not.toContainText(/Hermes|OpenClaw|Codex|approval lifecycles?|API|database|automation system|technical implementation/i);
});

test('homepage trailer preserves public routes and points to the system proof', async ({ page }) => {
  await page.goto('/');
  const main = page.getByRole('main');

  await expect(main.getByRole('link', { name: 'Inspect the system behind the work', exact: true })).toHaveAttribute('href', '/system');
  await expect(main.getByRole('link', { name: 'See how Website Fix works', exact: true })).toHaveAttribute('href', '/website-fix');
  await expect(main.getByRole('link', { name: 'See how Managed Automation works', exact: true })).toHaveAttribute('href', '/managed-automation');
  for (const [title, href] of [
    ['A page people can act on', '/work#website-fix'],
    ['A clearer path for repeated requests', '/work#managed-automation'],
    ['An idea with a useful first step', '/work#first-step'],
  ]) {
    await expect(main.getByRole('link', { name: `Explore this example: ${title}`, exact: true })).toHaveAttribute('href', href);
  }

  const primaryHrefs = await main.locator('.homepage-button').evaluateAll((links) => links.map((link) => link.getAttribute('href')));
  expect(primaryHrefs).toEqual(['/contact', '#what-we-do', '/system', '/contact']);
  expect(primaryHrefs.filter((href) => href?.startsWith('/')).every((href) => href && !href.startsWith('#'))).toBe(true);
});

test('services explain offers while examples show illustrative changes', async ({ page }) => {
  await page.goto('/services');
  const services = page.getByRole('main');
  await expect(services.locator('[data-public-offer-card]')).toHaveCount(2);
  await expect(services.getByRole('heading', { name: 'Website Fix', exact: true })).toBeVisible();
  await expect(services.getByRole('heading', { name: 'Managed Automation', exact: true })).toBeVisible();
  await expect(services.getByText('One website problem getting in the way.', { exact: true })).toBeVisible();
  await expect(services.getByText('One repeated task taking time.', { exact: true })).toBeVisible();
  await expect(services.getByText('$500 total', { exact: true })).toBeVisible();
  await expect(services.getByText('Priced by proposal', { exact: true })).toBeVisible();
  await expect(services.getByText('Before', { exact: true })).toHaveCount(0);
  await expect(services.locator('.service-illustration')).toHaveCount(0);

  await page.goto('/work');
  const work = page.getByRole('main');
  await expect(work.locator('[data-public-example-story]')).toHaveCount(3);
  await expect(work.getByText('Before', { exact: true })).toHaveCount(3);
  await expect(work.getByText('After', { exact: true })).toHaveCount(3);
  await expect(work.getByText('What changed', { exact: true })).toHaveCount(3);
  await expect(work).not.toContainText('$500');
  await expect(work).not.toContainText('Priced by proposal');
  await expect(work).not.toContainText('What is happening');
  await expect(work.locator('.service-illustration')).toHaveCount(0);

  await work.locator('#website-fix').getByRole('link', { name: 'Explore Website Fix', exact: true }).click();
  await expect(page).toHaveURL(/\/website-fix$/);
  await page.goBack();
  await work.locator('#managed-automation').getByRole('link', { name: 'Explore Managed Automation', exact: true }).click();
  await expect(page).toHaveURL(/\/managed-automation$/);
});

test('service offer cards align their internal rows on desktop', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'public', 'The desktop card-row geometry check runs in the public project.');
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('/services');

  const geometry = await page.locator('[data-public-offer-card]').evaluateAll((cards) => {
    const regions = ['fit', 'summary', 'actions'] as const;
    return {
      overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
      cards: cards.map((card) => {
        const element = card as HTMLElement;
        return {
          height: Math.round(element.getBoundingClientRect().height),
          rows: Object.fromEntries(
            regions.map((region) => {
              const target = card.querySelector<HTMLElement>(`[data-public-offer-region="${region}"]`);
              return [region, target ? Math.round(target.getBoundingClientRect().top) : null];
            }),
          ),
        };
      }),
    };
  });

  expect(geometry.overflow).toBe(false);
  expect(geometry.cards).toHaveLength(2);
  expect(Math.abs(geometry.cards[0].height - geometry.cards[1].height)).toBeLessThanOrEqual(1);
  for (const region of ['fit', 'summary', 'actions'] as const) {
    expect(Math.abs(geometry.cards[0].rows[region]! - geometry.cards[1].rows[region]!)).toBeLessThanOrEqual(1);
  }
});

test('pricing cards align their internal rows on desktop', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'public', 'The desktop pricing geometry check runs in the public project.');
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('/pricing');

  const geometry = await page.locator('[data-pricing-offer-card]').evaluateAll((cards) => {
    const regions = ['price', 'choose', 'useful', 'included', 'actions'] as const;
    return {
      overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
      cards: cards.map((card) => {
        const element = card as HTMLElement;
        return {
          height: Math.round(element.getBoundingClientRect().height),
          rows: Object.fromEntries(
            regions.map((region) => {
              const target = card.querySelector<HTMLElement>(`[data-pricing-region="${region}"]`);
              return [region, target ? Math.round(target.getBoundingClientRect().top) : null];
            }),
          ),
        };
      }),
    };
  });

  expect(geometry.overflow).toBe(false);
  expect(geometry.cards).toHaveLength(2);
  expect(Math.abs(geometry.cards[0].height - geometry.cards[1].height)).toBeLessThanOrEqual(1);
  for (const region of ['price', 'choose', 'useful', 'included', 'actions'] as const) {
    expect(Math.abs(geometry.cards[0].rows[region]! - geometry.cards[1].rows[region]!)).toBeLessThanOrEqual(1);
  }
  await page.screenshot({ path: '/tmp/pricing-aligned.png', fullPage: true });
});

test('examples use side-by-side comparisons on desktop and a visible transition on mobile', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'public', 'The explicit examples visual matrix runs in the desktop public project.');
  test.setTimeout(120_000);
  const errors: string[] = [];
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
  page.on('pageerror', (error) => errors.push(error.message));

  for (const width of [375, 768, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/work');
    await page.waitForLoadState('networkidle');

    const layout = await page.evaluate(() => {
      const comparisons = Array.from(document.querySelectorAll<HTMLElement>('.public-example-comparison'));
      const transitions = Array.from(document.querySelectorAll<HTMLElement>('.public-example-transition'));
      const gridColumnCount = (element: HTMLElement) => getComputedStyle(element).gridTemplateColumns.trim().split(/\s+/).filter(Boolean).length;
      return {
        overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
        storyCount: document.querySelectorAll('[data-public-example-story]').length,
        comparisonColumns: comparisons.map(gridColumnCount),
        mobileArrows: transitions.map((transition) => getComputedStyle(transition.querySelector('.md\\:hidden') || transition).display),
        desktopArrows: transitions.map((transition) => getComputedStyle(transition.querySelector('.hidden.md\\:block') || transition).display),
      };
    });

    expect(layout.overflow).toBe(false);
    expect(layout.storyCount).toBe(3);
    expect(layout.comparisonColumns).toEqual(layout.comparisonColumns.map(() => width < 768 ? 1 : 3));
    if (width < 768) {
      expect(layout.mobileArrows.every((display) => display !== 'none')).toBe(true);
      expect(layout.desktopArrows.every((display) => display === 'none')).toBe(true);
    } else {
      expect(layout.mobileArrows.every((display) => display === 'none')).toBe(true);
      expect(layout.desktopArrows.every((display) => display !== 'none')).toBe(true);
    }
    expect(errors).toEqual([]);
    await expect(new AxeBuilder({ page }).include('main').analyze()).resolves.toMatchObject({ violations: [] });
    await page.screenshot({ path: `/tmp/public-examples-${width}.png`, fullPage: true });
    errors.length = 0;
  }
});

test('homepage trailer keeps every card in a vertical editorial stack', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'public', 'The explicit homepage visual matrix runs in the desktop public project.');
  test.setTimeout(180_000);
  const errors: string[] = [];
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
  page.on('pageerror', (error) => errors.push(error.message));

  for (const viewport of [
    { width: 375, height: 800 },
    { width: 768, height: 900 },
    { width: 1024, height: 900 },
    { width: 1280, height: 900 },
    { width: 2048, height: 1200 },
  ]) {
    await page.setViewportSize(viewport);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const layout = await page.evaluate(() => {
      const intersects = (first: DOMRect, second: DOMRect) => first.left < second.right - 0.5
        && first.right > second.left + 0.5
        && first.top < second.bottom - 0.5
        && first.bottom > second.top + 0.5;
      const cards = Array.from(document.querySelectorAll<HTMLElement>(
        '.homepage-teaser__card, .homepage-offer-card, .homepage-principle__card, .homepage-example-card, .homepage-bridge__node',
      ));
      const connectors = Array.from(document.querySelectorAll<HTMLElement>(
        '.homepage-teaser__connector, .homepage-offer-card__connector, .homepage-principle__connector, .homepage-example-card__connector, .homepage-bridge__line',
      ));
      const connectorHitsCard = connectors.some((connector) => {
        const connectorRect = connector.getBoundingClientRect();
        return cards.some((card) => intersects(connectorRect, card.getBoundingClientRect()));
      });
      const textEscapeDetails = cards.flatMap((card) => {
        const cardRect = card.getBoundingClientRect();
        const textNodes = Array.from(card.querySelectorAll<HTMLElement>('h2, h3, p, dt, dd'));
        return [
          ...textNodes.filter((node) => {
            const textRect = node.getBoundingClientRect();
            return textRect.left < cardRect.left - 1
              || textRect.right > cardRect.right + 1
              || textRect.top < cardRect.top - 1
              || textRect.bottom > cardRect.bottom + 1;
          }).map((node) => `${card.className}:text:${node.textContent}`),
        ];
      });
      const rowsFor = (selector: string) => {
        const rows = new Map<number, number>();
        document.querySelectorAll<HTMLElement>(selector).forEach((item) => {
          const top = Math.round(item.getBoundingClientRect().top);
          rows.set(top, (rows.get(top) || 0) + 1);
        });
        return Array.from(rows.values());
      };
      const stackContract = (containerSelector: string, itemSelector: string, cardSelector: string, connectorSelector: string) => {
        const container = document.querySelector<HTMLElement>(containerSelector);
        if (!container) return { rowCounts: [], connectorCount: 0, vertical: false };
        const items = Array.from(container.querySelectorAll<HTMLElement>(`:scope > ${itemSelector}`));
        const cardRects = items.map((item) => (item.matches(cardSelector) ? item : item.querySelector<HTMLElement>(cardSelector))?.getBoundingClientRect());
        const connectorRects = items.slice(0, -1).map((item) => item.querySelector<HTMLElement>(connectorSelector)?.getBoundingClientRect());
        return {
          rowCounts: rowsFor(`${containerSelector} > ${itemSelector}`),
          connectorCount: connectorRects.filter(Boolean).length,
          vertical: connectorRects.every((connector, index) => {
            const from = cardRects[index];
            const to = cardRects[index + 1];
            if (!connector || !from || !to) return false;
            return connector.width <= 2
              && connector.height > 0
              && connector.top >= from.bottom - 0.5
              && connector.bottom <= to.top + 0.5;
          }),
        };
      };
      const bridgeNodes = Array.from(document.querySelectorAll<HTMLElement>('.homepage-bridge__node'));
      const bridgeLines = Array.from(document.querySelectorAll<HTMLElement>('.homepage-bridge__line'));
      const bridgeVertical = bridgeLines.every((line, index) => {
        const from = bridgeNodes[index]?.getBoundingClientRect();
        const to = bridgeNodes[index + 1]?.getBoundingClientRect();
        const connector = line.getBoundingClientRect();
        return Boolean(from && to)
          && connector.width <= 2
          && connector.height > 0
          && connector.top >= from!.bottom - 0.5
          && connector.bottom <= to!.top + 0.5;
      });
      const columnCount = (selector: string) => {
        const element = document.querySelector<HTMLElement>(selector);
        return element ? getComputedStyle(element).gridTemplateColumns.trim().split(/\s+/).filter(Boolean).length : 0;
      };
      const heroTitle = document.querySelector<HTMLElement>('.homepage-hero__title');
      const heroTitleLines = Array.from(document.querySelectorAll<HTMLElement>('.homepage-hero__title-line'));
      const whatWeDoIntro = document.querySelector<HTMLElement>('.homepage-section__intro--split');
      const whatWeDoRail = document.querySelector<HTMLElement>('#what-we-do .homepage-section__inner');
      const whatWeDoLead = whatWeDoIntro?.querySelector<HTMLElement>('.homepage-section__lead');
      const whatWeDoLeadColumn = whatWeDoLead?.getBoundingClientRect();
      const whatWeDoIntroStyle = whatWeDoIntro ? getComputedStyle(whatWeDoIntro) : null;
      const whatWeDoIntroRect = whatWeDoIntro?.getBoundingClientRect();
      const whatWeDoLeadRect = whatWeDoLead?.getBoundingClientRect();
      const whatWeDoHeadingRect = whatWeDoIntro?.querySelector<HTMLElement>('.homepage-heading')?.getBoundingClientRect();
      const whatWeDoOfferGridRect = document.querySelector<HTMLElement>('#what-we-do .homepage-offer-grid')?.getBoundingClientRect();
      const whatWeDoFirstColumnWidth = whatWeDoIntro
        ? whatWeDoIntro.children[0]?.getBoundingClientRect().width || 0
        : 0;
      const whatWeDoColumnWidths = whatWeDoIntroRect && whatWeDoIntroStyle
        ? [
            whatWeDoFirstColumnWidth,
            whatWeDoIntroRect.width - parseFloat(whatWeDoIntroStyle.columnGap) - whatWeDoFirstColumnWidth,
          ]
        : [];
      const homepageRails = Array.from(document.querySelectorAll<HTMLElement>(
        '.homepage-hero__inner, .homepage-section__inner, .homepage-bridge__inner, .homepage-closing__inner',
      )).map((rail) => {
        const rect = rail.getBoundingClientRect();
        return { left: rect.left, right: rect.right, width: rect.width };
      });
      return {
        viewportWidth: window.innerWidth,
        overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
        connectorHitsCard,
        textEscapesCard: textEscapeDetails.length > 0,
        hiddenConnectors: connectors.filter((connector) => getComputedStyle(connector).display === 'none').length,
        identityDetailComplete: cards.every((card) => Boolean(
          card.querySelector(':scope > .homepage-card-identity, :scope > .homepage-bridge__node-identity'),
        ) && Boolean(card.querySelector(':scope > .homepage-card-detail, :scope > .homepage-bridge__node-detail'))),
        stacks: [
          stackContract('.homepage-teaser__path', '.homepage-teaser__stage', '.homepage-teaser__card', '.homepage-teaser__connector'),
          stackContract('.homepage-offer-grid', '.homepage-offer-card', '.homepage-offer-card', '.homepage-offer-card__connector'),
          stackContract('.homepage-principles', '.homepage-principle', '.homepage-principle__card', '.homepage-principle__connector'),
          stackContract('.homepage-example-grid', '.homepage-example-card', '.homepage-example-card', '.homepage-example-card__connector'),
        ],
        bridgeRows: rowsFor('.homepage-bridge__node'),
        bridgeConnectorCount: bridgeLines.length,
        bridgeVertical,
        editorialColumns: [
          columnCount('.homepage-teaser__card'),
          columnCount('.homepage-offer-card'),
          columnCount('.homepage-principle__card'),
          columnCount('.homepage-example-card'),
          columnCount('.homepage-bridge__node'),
        ],
        heroColumns: columnCount('.homepage-hero__grid'),
        heroTitleLineCount: heroTitleLines.length,
        heroTitleRows: new Set(heroTitleLines.map((line) => Math.round(line.getBoundingClientRect().top))).size,
        heroTitleSpanDisplays: heroTitleLines.map((line) => getComputedStyle(line).display),
        heroTitleWidth: heroTitle?.getBoundingClientRect().width || 0,
        whatWeDoIntroWidth: whatWeDoIntroRect?.width || 0,
        whatWeDoRailWidth: whatWeDoRail?.getBoundingClientRect().width || 0,
        whatWeDoColumns: whatWeDoIntroStyle?.gridTemplateColumns.trim().split(/\s+/).filter(Boolean).length || 0,
        whatWeDoColumnGap: parseFloat(whatWeDoIntroStyle?.columnGap || '0'),
        whatWeDoRowGap: parseFloat(whatWeDoIntroStyle?.rowGap || '0'),
        whatWeDoLeadTop: whatWeDoLeadRect?.top || 0,
        whatWeDoLeadLeft: whatWeDoLeadRect?.left || 0,
        whatWeDoHeadingTop: whatWeDoHeadingRect?.top || 0,
        whatWeDoHeadingLeft: whatWeDoHeadingRect?.left || 0,
        whatWeDoHeadingBottom: whatWeDoHeadingRect?.bottom || 0,
        whatWeDoLeadWidth: whatWeDoLeadColumn?.width || 0,
        whatWeDoLeadMaxWidth: whatWeDoIntroStyle && whatWeDoLead ? parseFloat(getComputedStyle(whatWeDoLead).maxWidth) : 0,
        whatWeDoColumnWidths,
        whatWeDoOfferGridTop: whatWeDoOfferGridRect?.top || 0,
        whatWeDoOfferGridWidth: whatWeDoOfferGridRect?.width || 0,
        whatWeDoIntroBottom: whatWeDoIntroRect?.bottom || 0,
        homepageRails,
        heroActionVisible: Boolean(document.querySelector('.homepage-hero__actions a[href="/contact"]')),
        teaserVisible: Boolean(document.querySelector('.homepage-teaser')),
        reducedGlowMotion: getComputedStyle(document.querySelector('.homepage-hero__glow')!).animationName,
        reducedCardMotion: getComputedStyle(document.querySelector('.homepage-teaser__stage')!).animationName,
        reducedSignalMotion: getComputedStyle(document.querySelector('.homepage-teaser__connector-dot')!).animationName,
      };
    });

    expect(layout.overflow).toBe(false);
    expect(layout.connectorHitsCard).toBe(false);
    expect(layout.textEscapesCard).toBe(false);
    expect(layout.hiddenConnectors).toBe(0);
    expect(layout.identityDetailComplete).toBe(true);
    expect(layout.heroActionVisible).toBe(true);
    expect(layout.teaserVisible).toBe(true);
    expect(layout.heroTitleLineCount).toBe(3);
    expect(layout.heroTitleSpanDisplays.every((display) => display === (viewport.width >= 1200 ? 'block' : 'inline'))).toBe(true);
    if (viewport.width >= 1200) {
      expect(layout.heroTitleRows).toBe(3);
    } else {
      expect(layout.heroTitleRows).toBeGreaterThanOrEqual(1);
    }
    expect(layout.whatWeDoIntroWidth).toBeCloseTo(layout.whatWeDoRailWidth, 0);
    expect(layout.whatWeDoOfferGridWidth).toBeCloseTo(layout.whatWeDoRailWidth, 0);
    expect(layout.whatWeDoOfferGridTop).toBeGreaterThan(layout.whatWeDoIntroBottom);
    expect(layout.whatWeDoColumns).toBe(viewport.width >= 1024 ? 1 : viewport.width >= 768 ? 2 : 1);
    expect(layout.whatWeDoLeadMaxWidth).toBeGreaterThan(0);
    expect(layout.homepageRails.length).toBeGreaterThan(0);
    if (viewport.width >= 1024) {
      const minimumGutter = viewport.width * 0.095;
      expect(layout.homepageRails.every((rail) => (
        rail.left >= minimumGutter - 1
        && viewport.width - rail.right >= minimumGutter - 1
      ))).toBe(true);
    } else {
      const expectedGutter = viewport.width < 640 ? 20 : 32;
      expect(layout.homepageRails.every((rail) => (
        Math.abs(rail.left - expectedGutter) <= 1
        && Math.abs(viewport.width - rail.right - expectedGutter) <= 1
      ))).toBe(true);
    }
    if (viewport.width >= 1024) {
      expect(layout.whatWeDoLeadTop).toBeGreaterThan(layout.whatWeDoHeadingBottom);
      expect(Math.abs(layout.whatWeDoLeadLeft - layout.whatWeDoHeadingLeft)).toBeLessThanOrEqual(1);
      expect(layout.whatWeDoRowGap).toBeGreaterThanOrEqual(24);
      expect(layout.whatWeDoLeadMaxWidth).toBeLessThan(450);
      expect(layout.whatWeDoLeadWidth).toBeLessThanOrEqual(layout.whatWeDoLeadMaxWidth + 1);
    } else if (viewport.width >= 768) {
      expect(Math.abs(layout.whatWeDoLeadTop - layout.whatWeDoHeadingTop)).toBeLessThanOrEqual(1);
      expect(layout.whatWeDoColumnGap).toBeGreaterThanOrEqual(32);
      expect(layout.whatWeDoLeadMaxWidth).toBeLessThan(450);
      expect(layout.whatWeDoLeadWidth).toBeLessThanOrEqual(layout.whatWeDoLeadMaxWidth + 1);
      expect(layout.whatWeDoLeadWidth).toBeLessThan(layout.whatWeDoIntroWidth * 0.75);
      expect(layout.whatWeDoColumnWidths[0] / layout.whatWeDoColumnWidths[1]).toBeCloseTo(1.25 / 0.75, 1);
    }
    expect(layout.reducedGlowMotion).toBe('none');
    expect(layout.reducedCardMotion).toBe('none');
    expect(layout.reducedSignalMotion).toBe('none');
    expect(layout.stacks.every((stack) => stack.rowCounts.every((count) => count === 1))).toBe(true);
    expect(layout.stacks.every((stack) => stack.connectorCount === stack.rowCounts.length - 1 && stack.vertical)).toBe(true);
    expect(layout.bridgeRows).toEqual([1, 1, 1]);
    expect(layout.bridgeConnectorCount).toBe(2);
    expect(layout.bridgeVertical).toBe(true);
    expect(layout.editorialColumns.every((count) => count === (viewport.width >= 768 ? 2 : 1))).toBe(true);
    expect(layout.heroColumns).toBe(1);
    await expect(page.getByRole('main')).toHaveCount(1);
    await expect(new AxeBuilder({ page }).include('main').analyze()).resolves.toMatchObject({ violations: [] });
    await page.screenshot({ path: `/tmp/homepage-trailer-${viewport.width}.png`, fullPage: true });
    await expect(page.locator('.homepage-hero__actions a[href="/contact"]')).toBeVisible();
    await page.locator('.homepage-hero__actions a[href="/contact"]').focus();
    expect(await page.locator('.homepage-hero__actions a[href="/contact"]').evaluate((link) => getComputedStyle(link).outlineStyle)).not.toBe('none');
    expect(errors).toEqual([]);
    errors.length = 0;
  }
});

test('homepage trailer motion is active only when motion is allowed', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'public', 'The motion contract runs in the desktop public project.');
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');
  const activeMotion = await page.evaluate(() => ({
    glow: getComputedStyle(document.querySelector('.homepage-hero__glow')!).animationName,
    card: getComputedStyle(document.querySelector('.homepage-teaser__stage')!).animationName,
    signal: getComputedStyle(document.querySelector('.homepage-teaser__connector-dot')!).animationName,
  }));
  expect(activeMotion.glow).not.toBe('none');
  expect(activeMotion.card).not.toBe('none');
  expect(activeMotion.signal).not.toBe('none');

  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.reload();
  const reducedMotion = await page.evaluate(() => ({
    glow: getComputedStyle(document.querySelector('.homepage-hero__glow')!).animationName,
    card: getComputedStyle(document.querySelector('.homepage-teaser__stage')!).animationName,
    signal: getComputedStyle(document.querySelector('.homepage-teaser__connector-dot')!).animationName,
  }));
  expect(reducedMotion).toEqual({ glow: 'none', card: 'none', signal: 'none' });
});

async function fillIntake(page: import('@playwright/test').Page) {
  await page.getByRole('textbox', { name: /idea or situation/i }).fill('Requests disappear between inboxes.');
  await page.getByRole('textbox', { name: /what keeps happening/i }).fill('People follow up twice.');
  await page.getByRole('button', { name: /^Step 3:/ }).click();
  await page.getByRole('textbox', { name: /what needs to be different/i }).fill('Every request has a clear next step.');
  await page.getByRole('button', { name: /^Step 4:/ }).click();
  await page.getByRole('textbox', { name: /^your name$/i }).fill('Jordan Owner');
  await page.getByRole('textbox', { name: /^your email$/i }).fill('jordan@example.com');
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
  await expect(navigation.getByRole('link', { name: 'What We Do', exact: true })).toHaveAttribute('href', '/#what-we-do');
  await expect(navigation.getByRole('link', { name: 'How We Work', exact: true })).toHaveAttribute('href', '/#how-it-works');
  await expect(navigation.getByRole('link', { name: 'The System', exact: true })).toHaveAttribute('href', '/#the-system');
  await expect(navigation.getByRole('link', { name: 'Examples', exact: true })).toHaveAttribute('href', '/#examples');
  await expect(navigation.getByRole('link', { name: 'Why Us', exact: true })).toHaveAttribute('href', '/#why-us');
  await expect(page.getByRole('link', { name: 'Share Your Vision', exact: true }).first()).toHaveAttribute('href', '/contact');
  await expect(page.getByRole('contentinfo').getByRole('link', { name: 'Why Us', exact: true })).toHaveAttribute('href', '/about');
  await expect(navigation.getByRole('link', { name: /how it works/i })).toHaveCount(0);
  await expect(navigation.locator('a[href^="/dashboard"], a[href^="/employee"], a[href^="/prospecting"], a[href^="/admin"]')).toHaveCount(0);
});

test('homepage navigation keeps the journey in one place', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'public', 'The homepage navigation contract runs in the desktop public project.');
  await page.goto('/');

  const navigation = page.getByRole('navigation', { name: 'Main navigation' });
  await expect(page.getByRole('navigation', { name: 'Homepage progress' })).toHaveCount(0);
  for (const [label, href] of [
    ['What We Do', '/#what-we-do'],
    ['How We Work', '/#how-it-works'],
    ['The System', '/#the-system'],
    ['Examples', '/#examples'],
    ['Why Us', '/#why-us'],
  ]) {
    await expect(navigation.getByRole('link', { name: label, exact: true })).toHaveAttribute('href', href);
  }
  await expect(page.getByRole('link', { name: 'Share Your Vision', exact: true }).first()).toHaveAttribute('href', '/contact');

  await navigation.getByRole('link', { name: 'How We Work', exact: true }).click();
  await expect(page).toHaveURL(/\/#how-it-works$/);
  await expect(page.locator('#how-it-works')).toBeVisible();

  for (const [sectionId, label, href] of [
    ['what-we-do', 'Next: How We Work', '#how-it-works'],
    ['how-it-works', 'Next: The System', '#the-system'],
    ['the-system', 'Next: Examples', '#examples'],
    ['examples', 'Next: Why Us', '#why-us'],
    ['why-us', 'Next: Share Your Vision', '#share-your-vision'],
  ]) {
    await expect(page.locator(`#${sectionId}`).getByRole('link', { name: label, exact: true })).toHaveAttribute('href', href);
  }
});

test('interior public pages hand off to the next journey step', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'public', 'The interior journey handoff runs in the desktop public project.');
  for (const [route, label, href] of [
    ['/services', 'Next: How We Work', '/how-it-works'],
    ['/how-it-works', 'Next: The System', '/system'],
    ['/system', 'Next: Examples', '/work'],
    ['/work', 'Next: Why Us', '/about'],
  ]) {
    await page.goto(route);
    await expect(page.getByRole('main').getByRole('link', { name: label, exact: true })).toHaveAttribute('href', href);
  }
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

test('/system keeps every map and rail card in a vertical editorial stack', async ({ page }, testInfo) => {
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
      const allCards = Array.from(document.querySelectorAll<HTMLElement>(
        '.system-map__card, .system-rail__card, .system-difference-card, .system-beat, .system-status-card',
      ));
      const allConnectors = Array.from(document.querySelectorAll<HTMLElement>(
        '.system-map__connector, .system-rail__connector, .system-difference-card__connector, .system-beat__connector, .system-status-card__connector',
      ));
      const textEscapeDetails = allCards.flatMap((card) => {
        const cardRect = card.getBoundingClientRect();
        const textNodes = Array.from(card.querySelectorAll<HTMLElement>('h2, h3, p, li, dt, dd'));
        return [
          ...textNodes.filter((node) => {
            const textRect = node.getBoundingClientRect();
            return textRect.left < cardRect.left - 1
              || textRect.right > cardRect.right + 1
              || textRect.top < cardRect.top - 1
              || textRect.bottom > cardRect.bottom + 1;
          }).map((node) => `${card.className}:text:${node.textContent}`),
        ];
      });
      const stackContractForElement = (container: HTMLElement, itemSelector: string, cardSelector: string, connectorSelector: string) => {
        const items = Array.from(container.querySelectorAll<HTMLElement>(`:scope > ${itemSelector}`));
        const cardRects = items.map((item) => (item.matches(cardSelector) ? item : item.querySelector<HTMLElement>(cardSelector))?.getBoundingClientRect());
        const connectorRects = items.slice(0, -1).map((item) => item.querySelector<HTMLElement>(connectorSelector)?.getBoundingClientRect());
        const rows = new Map<number, number>();
        items.forEach((item) => {
          const top = Math.round(item.getBoundingClientRect().top);
          rows.set(top, (rows.get(top) || 0) + 1);
        });
        return {
          rowCounts: Array.from(rows.values()),
          connectorCount: connectorRects.filter(Boolean).length,
          vertical: connectorRects.every((connector, index) => {
            const from = cardRects[index];
            const to = cardRects[index + 1];
            if (!connector || !from || !to) return false;
            return connector.width <= 2
              && connector.height > 0
              && connector.top >= from.bottom - 0.5
              && connector.bottom <= to.top + 0.5;
          }),
        };
      };
      const stackContract = (containerSelector: string, itemSelector: string, cardSelector: string, connectorSelector: string) => {
        const container = document.querySelector<HTMLElement>(containerSelector);
        if (!container) return { rowCounts: [], connectorCount: 0, vertical: false };
        return stackContractForElement(container, itemSelector, cardSelector, connectorSelector);
      };
      const mapStack = stackContract('.system-map', '.system-map__stage', '.system-map__card', '.system-map__connector');
      const railStacks = Array.from(document.querySelectorAll<HTMLElement>('.system-rail')).map((rail) => ({
        kind: rail.classList.contains('system-rail--five') ? 'five' : 'four',
        ...stackContractForElement(rail, '.system-rail__item', '.system-rail__card', '.system-rail__connector'),
      }));
      const extraStacks = [
        stackContract('.system-difference-grid', '.system-difference-card', '.system-difference-card', '.system-difference-card__connector'),
        stackContract('.system-beats', '.system-beat', '.system-beat', '.system-beat__connector'),
        stackContract('.system-status-grid', '.system-status-card', '.system-status-card', '.system-status-card__connector'),
      ];
      const columnCount = (selector: string) => {
        const element = document.querySelector<HTMLElement>(selector);
        return element ? getComputedStyle(element).gridTemplateColumns.trim().split(/\s+/).filter(Boolean).length : 0;
      };
      return {
        overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
        connectorHitsCard: allConnectors.some((connector) => {
          const connectorRect = connector.getBoundingClientRect();
          return allCards.some((card) => intersects(connectorRect, card.getBoundingClientRect()));
        }),
        textEscapesCard: textEscapeDetails.length > 0,
        mapRows: mapStack.rowCounts,
        mapConnectorCount: mapStack.connectorCount,
        mapVertical: mapStack.vertical,
        railStacks,
        extraStacks,
        editorialColumns: [
          columnCount('.system-map__card'),
          columnCount('.system-rail__card'),
          columnCount('.system-difference-card'),
          columnCount('.system-beat'),
          columnCount('.system-status-card'),
        ],
        heroColumns: columnCount('.system-hero__grid'),
        architectureColumns: columnCount('.system-two-column--architecture'),
        codingColumns: columnCount('.system-two-column--dark'),
        identityDetailComplete: allCards.every((card) => Boolean(
          card.querySelector(':scope > .system-card-identity') && card.querySelector(':scope > .system-card-detail'),
        )),
        hiddenConnectors: allConnectors.filter((connector) => getComputedStyle(connector).display === 'none').length,
        architectureRows: new Set(
          Array.from(document.querySelectorAll<HTMLElement>('.system-rail--architecture .system-rail__item'))
            .map((item) => Math.round(item.getBoundingClientRect().top)),
        ).size,
        heroMapVisible: Boolean(document.querySelector('.system-map-shell')),
        primaryVisible: Boolean(document.querySelector('.system-hero__actions a[href="/contact"]')),
        reducedMapMotion: getComputedStyle(document.querySelector('.system-map__connector')!, '::after').animationName,
        reducedRailMotion: getComputedStyle(document.querySelector('.system-rail__connector-dot')!).animationName,
      };
    });

    expect(layout.overflow).toBe(false);
    expect(layout.connectorHitsCard).toBe(false);
    expect(layout.textEscapesCard).toBe(false);
    expect(layout.identityDetailComplete).toBe(true);
    expect(layout.mapRows).toEqual([1, 1, 1, 1]);
    expect(layout.mapConnectorCount).toBe(3);
    expect(layout.mapVertical).toBe(true);
    expect(layout.railStacks.every((rail) => rail.rowCounts.every((count) => count === 1))).toBe(true);
    expect(layout.railStacks.every((rail) => rail.connectorCount === rail.rowCounts.length - 1 && rail.vertical)).toBe(true);
    expect(layout.extraStacks.every((stack) => stack.rowCounts.every((count) => count === 1))).toBe(true);
    expect(layout.extraStacks.every((stack) => stack.connectorCount === stack.rowCounts.length - 1 && stack.vertical)).toBe(true);
    expect(layout.editorialColumns.every((count) => count === (viewport.width >= 768 ? 2 : 1))).toBe(true);
    expect(layout.heroColumns).toBe(viewport.width >= 1200 ? 2 : 1);
    expect(layout.architectureColumns).toBe(viewport.width >= 768 ? 2 : 1);
    expect(layout.codingColumns).toBe(viewport.width >= 768 ? 2 : 1);
    expect(layout.hiddenConnectors).toBe(0);
    expect(layout.architectureRows).toBe(5);
    expect(layout.heroMapVisible).toBe(true);
    expect(layout.primaryVisible).toBe(true);
    expect(layout.reducedMapMotion).toBe('none');
    expect(layout.reducedRailMotion).toBe('none');
    await expect(page.getByRole('main')).toHaveCount(1);
    await expect(new AxeBuilder({ page }).include('main').analyze()).resolves.toMatchObject({ violations: [] });
    await page.screenshot({ path: `/tmp/system-vertical-${viewport.width}.png`, fullPage: true });
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
    await page.waitForLoadState('networkidle');
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
  await page.getByRole('link', { name: 'Explore this example: A page people can act on' }).click();
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
