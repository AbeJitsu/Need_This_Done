import { test, expect } from '@playwright/test';

// ============================================================================
// Test: Inline Text Editor - Click to Edit Text
// ============================================================================
// Verifies the new simple inline editing approach:
// 1. Enter edit mode
// 2. Click on editable text
// 3. TipTap editor appears at that position
// 4. Type to change content
// 5. Click away to save

test.describe('Inline Text Editor', () => {
  test.beforeEach(async ({ page }) => {
    // Dismiss tutorial by setting localStorage
    await page.addInitScript(() => {
      localStorage.setItem('edit-mode-tutorial-dismissed', 'true');
    });
  });

  test('Clicking editable text shows TipTap editor', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Enter edit mode
    const editButton = page.locator('button[title="Edit this page"], button[aria-label="Edit this page"]');
    await expect(editButton).toBeVisible({ timeout: 10000 });
    await editButton.click();

    // Wait for edit mode to activate
    await page.waitForTimeout(500);

    // Find an editable element (hero title has data-edit-path)
    const editableElement = page.locator('[data-edit-path="hero.title"]');
    await expect(editableElement).toBeVisible({ timeout: 5000 });

    // Click on it
    await editableElement.click();

    // Wait for the TipTap editor to appear
    await page.waitForTimeout(500);

    // Look for the TipTap editor content area (has class from editor config)
    const tiptapEditor = page.locator('.ProseMirror');
    await expect(tiptapEditor).toBeVisible({ timeout: 5000 });

    // Also verify the floating toolbar appears
    const toolbar = page.locator('button:has-text("Save")');
    await expect(toolbar).toBeVisible({ timeout: 3000 });
  });

  test('Can type in the inline editor', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Enter edit mode
    const editButton = page.locator('button[title="Edit this page"], button[aria-label="Edit this page"]');
    await editButton.click();
    await page.waitForTimeout(500);

    // Click on editable hero title
    const editableElement = page.locator('[data-edit-path="hero.title"]');
    await editableElement.click();
    await page.waitForTimeout(500);

    // Type in the editor
    const tiptapEditor = page.locator('.ProseMirror');
    await expect(tiptapEditor).toBeVisible({ timeout: 5000 });
    await tiptapEditor.fill('TEST_CONTENT');

    // Verify the content was typed
    await expect(tiptapEditor).toContainText('TEST_CONTENT');
  });

  test('Cancel button discards changes', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Enter edit mode
    const editButton = page.locator('button[title="Edit this page"], button[aria-label="Edit this page"]');
    await editButton.click();
    await page.waitForTimeout(500);

    // Click on editable hero title
    const editableElement = page.locator('[data-edit-path="hero.title"]');
    await editableElement.click();
    await page.waitForTimeout(500);

    // Click cancel
    const cancelButton = page.locator('button:has-text("Cancel")');
    await cancelButton.click();

    // Verify editor is closed
    const tiptapEditor = page.locator('.ProseMirror');
    await expect(tiptapEditor).not.toBeVisible({ timeout: 3000 });
  });

  test('ESC key cancels editing', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Enter edit mode
    const editButton = page.locator('button[title="Edit this page"], button[aria-label="Edit this page"]');
    await editButton.click();
    await page.waitForTimeout(500);

    // Click on editable hero title
    const editableElement = page.locator('[data-edit-path="hero.title"]');
    await editableElement.click();
    await page.waitForTimeout(500);

    // Verify editor is open
    const tiptapEditor = page.locator('.ProseMirror');
    await expect(tiptapEditor).toBeVisible({ timeout: 5000 });

    // Press ESC
    await page.keyboard.press('Escape');

    // Verify editor is closed
    await expect(tiptapEditor).not.toBeVisible({ timeout: 3000 });
  });
});
