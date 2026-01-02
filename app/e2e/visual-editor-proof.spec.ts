import { test, expect } from '@playwright/test';
import { waitForPageReady } from './helpers';
import * as path from 'path';
import * as fs from 'fs';
import { fileURLToPath } from 'url';

// ============================================================================
// Visual Editor Proof - Inline TipTap Editor
// ============================================================================
// Demonstrates the NEW inline editing feature:
// Click any text → TipTap editor appears inline with floating toolbar
// No sidebar needed for quick text edits

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SCREENSHOT_DIR = path.join(__dirname, 'screenshots/visual-editor-proof');

test.beforeAll(() => {
  if (!fs.existsSync(SCREENSHOT_DIR)) {
    fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
  }
});

// Simple: click pencil → edit mode active → click any text to edit
async function enterEditMode(page: import('@playwright/test').Page) {
  await page.evaluate(() => {
    localStorage.setItem('edit-mode-tutorial-dismissed', 'true');
  });

  const editButton = page.locator('button[title="Edit this page"]');
  await editButton.waitFor({ state: 'visible', timeout: 10000 });
  await editButton.click();
  await page.waitForTimeout(300);
  // Sidebar no longer auto-opens - just click any text to edit
}

test.describe('Inline TipTap Editor', () => {

  test('Click text to edit inline with floating toolbar', async ({ page }) => {
    await page.goto('/services');
    await waitForPageReady(page);
    await enterEditMode(page);

    // Click on the main heading
    const heading = page.locator('h1').first();
    const box = await heading.boundingBox();
    if (box) {
      await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
      await page.waitForTimeout(400);
    }

    // Screenshot: Inline editor with floating toolbar
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, '01-inline-editor-services.png'),
      fullPage: false,
    });

    // Verify toolbar is visible
    const toolbar = page.locator('.fixed.z-\\[60\\]').filter({ hasText: 'Aa' });
    expect(await toolbar.isVisible()).toBe(true);
  });

  test('Works on different pages - Homepage', async ({ page }) => {
    await page.goto('/');
    await waitForPageReady(page);
    await enterEditMode(page);

    // Click on hero heading
    const heading = page.locator('main h1').first();
    const box = await heading.boundingBox();
    if (box) {
      await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
      await page.waitForTimeout(400);
    }

    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, '02-inline-editor-homepage.png'),
      fullPage: false,
    });
  });

  test('Works on different pages - Pricing', async ({ page }) => {
    await page.goto('/pricing');
    await waitForPageReady(page);
    await enterEditMode(page);

    // Click on pricing heading
    const heading = page.locator('h1').first();
    const box = await heading.boundingBox();
    if (box) {
      await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
      await page.waitForTimeout(400);
    }

    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, '03-inline-editor-pricing.png'),
      fullPage: false,
    });
  });
});
