import { test, expect } from '@playwright/test';

// ============================================================================
// Block-Level Editor E2E Tests
// ============================================================================
// What: Tests for the simplified block editor (mid-complexity between wizard and Puck)
// Why: Validates that users can add, edit, reorder, and remove page sections
// How: Creates a page, opens block editor, performs operations
//
// The block editor provides:
// - List view of all page sections
// - Add new blocks from categorized picker
// - Edit block content with simplified forms
// - Reorder blocks with up/down buttons
// - Remove blocks with confirmation

test.describe('Block Editor - Access', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin/pages');
    // Wait for page list to load
    await page.waitForSelector('h1', { timeout: 15000 });
  });

  test('shows Block Editor button for existing pages', async ({ page }) => {
    // Look for a page row with actions
    const pageRow = page.locator('tr, [data-testid="page-row"]').first();

    if (await pageRow.isVisible()) {
      // Should have "Block Editor" action alongside "Edit" (Puck)
      const blockEditorBtn = pageRow.getByRole('button', { name: /block editor|blocks/i });
      await expect(blockEditorBtn).toBeVisible();
    }
  });
});

test.describe('Block Editor - Section List', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to block editor for first available page
    await page.goto('/admin/pages');
    await page.waitForSelector('h1', { timeout: 15000 });

    // Try to open block editor for first page
    const blockEditorBtn = page.getByRole('button', { name: /block editor|blocks/i }).first();
    if (await blockEditorBtn.isVisible()) {
      await blockEditorBtn.click();
      await page.waitForURL(/\/admin\/pages\/[^/]+\/blocks/);
    } else {
      test.skip(true, 'No pages available for block editor testing');
    }
  });

  test('displays list of page sections', async ({ page }) => {
    // Should see section list
    const sectionList = page.locator('[data-testid="section-list"]');
    await expect(sectionList).toBeVisible({ timeout: 10000 });

    // Each section should show its type
    const sections = page.locator('[data-testid="section-item"]');
    const count = await sections.count();

    // Pages typically have at least 1 section
    expect(count).toBeGreaterThan(0);

    // First section should show its type (e.g., "Hero", "FeatureGrid")
    const firstSection = sections.first();
    await expect(firstSection.locator('[data-testid="section-type"]')).toBeVisible();
  });

  test('shows section preview thumbnail', async ({ page }) => {
    const firstSection = page.locator('[data-testid="section-item"]').first();

    // Should have a visual preview or icon
    const preview = firstSection.locator('[data-testid="section-preview"], img, svg');
    await expect(preview).toBeVisible();
  });
});

test.describe('Block Editor - Add Section', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin/pages');
    await page.waitForSelector('h1', { timeout: 15000 });

    const blockEditorBtn = page.getByRole('button', { name: /block editor|blocks/i }).first();
    if (await blockEditorBtn.isVisible()) {
      await blockEditorBtn.click();
      await page.waitForURL(/\/admin\/pages\/[^/]+\/blocks/);
    } else {
      test.skip(true, 'No pages available');
    }
  });

  test('shows Add Section button', async ({ page }) => {
    const addBtn = page.getByRole('button', { name: /add section|add block/i });
    await expect(addBtn).toBeVisible();
  });

  test('opens block picker when Add Section clicked', async ({ page }) => {
    const addBtn = page.getByRole('button', { name: /add section|add block/i });
    await addBtn.click();

    // Should show block picker dialog/panel
    const picker = page.locator('[data-testid="block-picker"], [role="dialog"]');
    await expect(picker).toBeVisible({ timeout: 5000 });

    // Should show categorized blocks
    await expect(picker.getByText(/layout|media|content/i)).toBeVisible();
  });

  test('can add a new Hero section', async ({ page }) => {
    const sectionsBefore = await page.locator('[data-testid="section-item"]').count();

    // Open picker
    await page.getByRole('button', { name: /add section|add block/i }).click();

    // Select Hero
    await page.getByRole('button', { name: /hero/i }).click();

    // Section count should increase
    const sectionsAfter = await page.locator('[data-testid="section-item"]').count();
    expect(sectionsAfter).toBe(sectionsBefore + 1);
  });
});

test.describe('Block Editor - Edit Section', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin/pages');
    await page.waitForSelector('h1', { timeout: 15000 });

    const blockEditorBtn = page.getByRole('button', { name: /block editor|blocks/i }).first();
    if (await blockEditorBtn.isVisible()) {
      await blockEditorBtn.click();
      await page.waitForURL(/\/admin\/pages\/[^/]+\/blocks/);
    } else {
      test.skip(true, 'No pages available');
    }
  });

  test('clicking section opens edit panel', async ({ page }) => {
    const firstSection = page.locator('[data-testid="section-item"]').first();
    await firstSection.click();

    // Should show edit panel/sidebar
    const editPanel = page.locator('[data-testid="section-editor"], [data-testid="edit-panel"]');
    await expect(editPanel).toBeVisible({ timeout: 5000 });
  });

  test('edit panel shows section-specific fields', async ({ page }) => {
    const firstSection = page.locator('[data-testid="section-item"]').first();
    await firstSection.click();

    const editPanel = page.locator('[data-testid="section-editor"]');
    await expect(editPanel).toBeVisible();

    // Should have input fields
    const inputs = editPanel.locator('input, textarea, select');
    const inputCount = await inputs.count();
    expect(inputCount).toBeGreaterThan(0);
  });
});

test.describe('Block Editor - Reorder Sections', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin/pages');
    await page.waitForSelector('h1', { timeout: 15000 });

    const blockEditorBtn = page.getByRole('button', { name: /block editor|blocks/i }).first();
    if (await blockEditorBtn.isVisible()) {
      await blockEditorBtn.click();
      await page.waitForURL(/\/admin\/pages\/[^/]+\/blocks/);
    } else {
      test.skip(true, 'No pages available');
    }
  });

  test('shows move up/down buttons for sections', async ({ page }) => {
    const sections = page.locator('[data-testid="section-item"]');
    const count = await sections.count();

    if (count >= 2) {
      // Second section should have move up button
      const secondSection = sections.nth(1);
      const moveUpBtn = secondSection.getByRole('button', { name: /move up|↑/i });
      await expect(moveUpBtn).toBeVisible();
    }
  });

  test('move up changes section order', async ({ page }) => {
    const sections = page.locator('[data-testid="section-item"]');
    const count = await sections.count();

    if (count >= 2) {
      // Get second section's type before move
      const secondSection = sections.nth(1);
      const typeBefore = await secondSection.locator('[data-testid="section-type"]').textContent();

      // Click move up
      await secondSection.getByRole('button', { name: /move up|↑/i }).click();

      // Now first section should have that type
      const firstSection = sections.first();
      const typeAfter = await firstSection.locator('[data-testid="section-type"]').textContent();

      expect(typeAfter).toBe(typeBefore);
    }
  });
});

test.describe('Block Editor - Remove Section', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin/pages');
    await page.waitForSelector('h1', { timeout: 15000 });

    const blockEditorBtn = page.getByRole('button', { name: /block editor|blocks/i }).first();
    if (await blockEditorBtn.isVisible()) {
      await blockEditorBtn.click();
      await page.waitForURL(/\/admin\/pages\/[^/]+\/blocks/);
    } else {
      test.skip(true, 'No pages available');
    }
  });

  test('shows delete button for each section', async ({ page }) => {
    const firstSection = page.locator('[data-testid="section-item"]').first();
    const deleteBtn = firstSection.getByRole('button', { name: /delete|remove|🗑/i });
    await expect(deleteBtn).toBeVisible();
  });

  test('delete shows confirmation', async ({ page }) => {
    const firstSection = page.locator('[data-testid="section-item"]').first();
    await firstSection.getByRole('button', { name: /delete|remove|🗑/i }).click();

    // Should show confirmation dialog
    const confirmDialog = page.locator('[role="alertdialog"], [role="dialog"]');
    await expect(confirmDialog).toBeVisible({ timeout: 3000 });

    // Should have confirm and cancel buttons
    await expect(confirmDialog.getByRole('button', { name: /confirm|yes|delete/i })).toBeVisible();
    await expect(confirmDialog.getByRole('button', { name: /cancel|no/i })).toBeVisible();
  });
});

test.describe('Block Editor - Save', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin/pages');
    await page.waitForSelector('h1', { timeout: 15000 });

    const blockEditorBtn = page.getByRole('button', { name: /block editor|blocks/i }).first();
    if (await blockEditorBtn.isVisible()) {
      await blockEditorBtn.click();
      await page.waitForURL(/\/admin\/pages\/[^/]+\/blocks/);
    } else {
      test.skip(true, 'No pages available');
    }
  });

  test('shows Save Changes button', async ({ page }) => {
    const saveBtn = page.getByRole('button', { name: /save|publish/i });
    await expect(saveBtn).toBeVisible();
  });

  test('shows unsaved indicator when changes made', async ({ page }) => {
    // Make a change - click first section to edit
    const firstSection = page.locator('[data-testid="section-item"]').first();
    await firstSection.click();

    const editPanel = page.locator('[data-testid="section-editor"]');
    if (await editPanel.isVisible()) {
      // Find first input and modify it
      const input = editPanel.locator('input').first();
      if (await input.isVisible()) {
        const originalValue = await input.inputValue();
        await input.fill(originalValue + ' modified');

        // Should show unsaved indicator
        const unsavedIndicator = page.locator('[data-testid="unsaved-indicator"], :text("unsaved")');
        await expect(unsavedIndicator).toBeVisible({ timeout: 3000 });
      }
    }
  });
});
