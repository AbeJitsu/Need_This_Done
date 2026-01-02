import { test, expect } from '@playwright/test';
import { waitForPageReady } from './helpers';
import * as path from 'path';
import * as fs from 'fs';
import { fileURLToPath } from 'url';

// ============================================================================
// Visual Editor Proof Screenshots
// ============================================================================
// Captures screenshots demonstrating the visual page editor features:
// 1. InlineTextEditor - Click any text to edit with TipTap + floating toolbar
// 2. Edit mode sidebar - Section navigation and field editing
// Light mode only for initial verification

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SCREENSHOT_DIR = path.join(__dirname, 'screenshots/visual-editor-proof');

test.beforeAll(() => {
  if (!fs.existsSync(SCREENSHOT_DIR)) {
    fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
  }
});

// Helper to enable edit mode
async function enterEditMode(page: import('@playwright/test').Page) {
  // Pre-dismiss tutorial modal
  await page.evaluate(() => {
    localStorage.setItem('edit-mode-tutorial-dismissed', 'true');
  });

  const editButton = page.locator('button[title="Edit this page"]');
  await editButton.waitFor({ state: 'visible', timeout: 10000 });
  await editButton.click();
  await page.waitForTimeout(300);
}

test.describe('Visual Editor Features', () => {

  test('1. Inline TipTap Editor with Floating Toolbar', async ({ page }) => {
    await page.goto('/services');
    await waitForPageReady(page);

    // Enter edit mode
    await enterEditMode(page);

    // Click on the main heading to trigger inline editor
    const heading = page.locator('h1').first();
    const box = await heading.boundingBox();
    if (box) {
      await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
      await page.waitForTimeout(400);
    }

    // Capture the inline editor with floating toolbar
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, '01-inline-tiptap-editor.png'),
      fullPage: false,
    });

    // Verify the formatting toolbar is visible (has Bold button)
    const toolbar = page.locator('.fixed.z-\\[60\\]').filter({ hasText: 'Aa' });
    expect(await toolbar.isVisible()).toBe(true);
  });

  test('2. Section Sidebar Navigation', async ({ page }) => {
    await page.goto('/');
    await waitForPageReady(page);

    // Enter edit mode - this opens the sidebar
    await enterEditMode(page);

    // Wait for sidebar to be visible
    await page.waitForTimeout(200);

    // Capture edit mode with sidebar showing sections
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, '02-section-sidebar.png'),
      fullPage: false,
    });
  });

  test('3. Edit Different Text Types', async ({ page }) => {
    await page.goto('/');
    await waitForPageReady(page);
    await enterEditMode(page);

    // Click on a description paragraph
    const description = page.locator('main p').first();
    const box = await description.boundingBox();
    if (box) {
      await page.mouse.click(box.x + 50, box.y + box.height / 2);
      await page.waitForTimeout(400);
    }

    // Capture multi-line editor
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, '03-multiline-editor.png'),
      fullPage: false,
    });
  });

  test('4. Full Workflow Demo', async ({ page }) => {
    await page.goto('/pricing');
    await waitForPageReady(page);

    // Screenshot before editing
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, '04a-before-edit.png'),
      fullPage: false,
    });

    // Enter edit mode
    await enterEditMode(page);

    // Screenshot with sidebar
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, '04b-edit-mode.png'),
      fullPage: false,
    });

    // Click on main heading
    const heading = page.locator('h1').first();
    const box = await heading.boundingBox();
    if (box) {
      await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
      await page.waitForTimeout(400);
    }

    // Screenshot with inline editor
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, '04c-inline-editing.png'),
      fullPage: false,
    });
  });
});
