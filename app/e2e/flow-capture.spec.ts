import { test } from '@playwright/test';
import * as fs from 'fs';

// ============================================================================
// User Flow Capture - Screenshots + Copy for UX evaluation
// ============================================================================
// Purpose: Capture the current homepage → services journey for redesign planning
// Run: SKIP_WEBSERVER=true BASE_URL=https://localhost npx playwright test flow-capture.spec.ts
// Output: ux-screenshots/services-page-redesign/

const OUTPUT_DIR = 'ux-screenshots/services-page-redesign';

test('Capture homepage journey with copy', async ({ page }) => {
  // 1. Homepage - full view
  await page.goto('/');
  await page.waitForLoadState('load');
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${OUTPUT_DIR}/screenshots/1-homepage.png`, fullPage: true });

  // Extract homepage copy
  const homepageCopy = await page.evaluate(() => {
    const sections: Record<string, string[]> = {};

    // Hero
    const hero = document.querySelector('.text-center.mb-16');
    if (hero) {
      sections['HERO'] = [
        hero.querySelector('h1')?.textContent || '',
        hero.querySelector('p')?.textContent || '',
        ...Array.from(hero.querySelectorAll('a')).map(a => `[Button] ${a.textContent}`),
      ];
    }

    // Services section
    const servicesHeading = Array.from(document.querySelectorAll('h2')).find(h => h.textContent?.includes('What We Do'));
    if (servicesHeading) {
      sections['SERVICES_HEADING'] = [servicesHeading.textContent || ''];
    }

    // Service cards
    const serviceCards = document.querySelectorAll('[class*="grid"] button');
    sections['SERVICE_CARDS'] = Array.from(serviceCards).map(card => {
      const title = card.querySelector('h3')?.textContent || '';
      const tagline = card.querySelector('p.italic')?.textContent || '';
      const desc = card.querySelector('p:not(.italic)')?.textContent || '';
      return `${title}: ${tagline} - ${desc}`;
    });

    return sections;
  });

  fs.writeFileSync(
    `${OUTPUT_DIR}/copy/1-homepage-copy.json`,
    JSON.stringify(homepageCopy, null, 2)
  );
});

test('Capture service modals with copy', async ({ page }) => {
  // Taller viewport to fit full modal content
  await page.setViewportSize({ width: 1280, height: 1400 });

  const services = [
    { name: 'Virtual Assistant', slug: 'virtual-assistant' },
    { name: 'Data & Documents', slug: 'data-documents' },
    { name: 'Website Services', slug: 'website-services' },
  ];

  const allModalCopy: Record<string, Record<string, string | string[]>> = {};

  for (let i = 0; i < services.length; i++) {
    await page.goto('/');
    await page.waitForLoadState('load');
    await page.waitForTimeout(300);

    const card = page.getByRole('button', { name: new RegExp(services[i].name, 'i') });
    await card.click();
    await page.waitForTimeout(400);

    // Screenshot the modal dialog element directly for full content
    const modal = page.getByRole('dialog');
    await modal.screenshot({
      path: `${OUTPUT_DIR}/screenshots/2-modal-${i + 1}-${services[i].slug}.png`,
    });

    // Extract modal copy
    const modalCopy = await page.evaluate(() => {
      const dialog = document.querySelector('[role="dialog"]');
      if (!dialog) return {};

      const copy: Record<string, string | string[]> = {};

      copy['title'] = dialog.querySelector('h2')?.textContent || '';
      copy['tagline'] = dialog.querySelector('p.italic')?.textContent || '';
      copy['description'] = dialog.querySelector('p:not(.italic)')?.textContent || '';

      // Pain points section
      const painPoints = dialog.querySelectorAll('ul')[0];
      if (painPoints) {
        copy['pain_points'] = Array.from(painPoints.querySelectorAll('li')).map(li => li.textContent || '');
      }

      // Examples section
      const examples = dialog.querySelectorAll('ul')[1];
      if (examples) {
        copy['examples'] = Array.from(examples.querySelectorAll('li')).map(li => li.textContent || '');
      }

      // CTA button
      const cta = dialog.querySelector('a');
      if (cta) {
        copy['cta'] = cta.textContent || '';
        copy['cta_href'] = cta.getAttribute('href') || '';
      }

      return copy;
    });

    allModalCopy[services[i].name] = modalCopy;

    await page.keyboard.press('Escape');
    await page.waitForTimeout(200);
  }

  fs.writeFileSync(
    `${OUTPUT_DIR}/copy/2-modals-copy.json`,
    JSON.stringify(allModalCopy, null, 2)
  );
});

test('Capture services page with copy', async ({ page }) => {
  await page.goto('/services');
  await page.waitForLoadState('load');
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${OUTPUT_DIR}/screenshots/3-services-page.png`, fullPage: true });

  // Extract services page copy
  const servicesPageCopy = await page.evaluate(() => {
    const sections: Record<string, string | string[] | Record<string, string>[]> = {};

    // Header
    const header = document.querySelector('header') || document.querySelector('.text-center');
    sections['header_title'] = document.querySelector('h1')?.textContent || '';
    sections['header_description'] = document.querySelector('h1')?.nextElementSibling?.textContent || '';

    // Service cards
    const serviceCards = document.querySelectorAll('[class*="grid"] > div');
    sections['service_cards'] = Array.from(serviceCards).slice(0, 3).map(card => {
      return {
        title: card.querySelector('h3')?.textContent || '',
        tagline: card.querySelector('p.italic')?.textContent || '',
        description: card.querySelector('p:not(.italic)')?.textContent || '',
        details: Array.from(card.querySelectorAll('li')).map(li => li.textContent || '').join(', ')
      };
    });

    // What to Expect section
    const expectSection = document.querySelector('[class*="mb-10"]');
    sections['expectations_title'] = Array.from(document.querySelectorAll('h2')).find(h => h.textContent?.includes('Expect'))?.textContent || '';

    const expectItems = document.querySelectorAll('[class*="flex.gap-4"]');
    sections['expectations'] = Array.from(expectItems).map(item => {
      const title = item.querySelector('h3')?.textContent || '';
      const desc = item.querySelector('p')?.textContent || '';
      return { title, description: desc };
    });

    // CTA
    const ctaSection = document.querySelector('[class*="CTASection"]') || document.querySelector('[class*="text-center"]:last-child');
    sections['cta_title'] = Array.from(document.querySelectorAll('h2')).pop()?.textContent || '';

    return sections;
  });

  fs.writeFileSync(
    `${OUTPUT_DIR}/copy/3-services-page-copy.json`,
    JSON.stringify(servicesPageCopy, null, 2)
  );
});
