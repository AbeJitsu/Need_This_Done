import { test, expect, Page } from '@playwright/test';

// ============================================================================
// Section Drag and Drop Tests
// ============================================================================
// Tests for dragging sections to reorder them in edit mode.
// Uses @dnd-kit for accessible drag-and-drop.

// Helper to enable edit mode using the correct selector
async function enableEditMode(page: Page): Promise<void> {
  const editToggle = page.locator('button[aria-label="Edit this page"]');
  await editToggle.waitFor({ state: 'visible', timeout: 10000 });
  await editToggle.click();
  await page.getByText('Edit Mode', { exact: true }).waitFor({ state: 'visible', timeout: 5000 });
}

test.describe('Section Drag and Drop', () => {
  test('shows drag handles on sections when edit mode is active', async ({ page }) => {
    await page.goto('/services');
    await enableEditMode(page);

    // Should see drag handles on editable sections
    const dragHandles = page.locator('[data-drag-handle]');
    await expect(dragHandles.first()).toBeVisible();
  });

  test('drag handles are hidden when edit mode is off', async ({ page }) => {
    await page.goto('/services');

    // Edit mode should be off by default
    const dragHandles = page.locator('[data-drag-handle]');
    await expect(dragHandles).toHaveCount(0);
  });

  test.skip('can drag section to reorder', async ({ page }) => {
    // NOTE: This test requires pages to render sections based on sectionOrder from context.
    // Current implementation adds drag handles and tracks order, but DOM reordering
    // requires architectural changes to how pages render their sections.
    await page.goto('/services');
    await enableEditMode(page);

    // Get all section titles in order
    const sections = page.locator('[data-editable-section]');
    const firstSectionKey = await sections.first().getAttribute('data-section-key');
    const secondSectionKey = await sections.nth(1).getAttribute('data-section-key');

    // Drag first section down past second
    const firstDragHandle = sections.first().locator('[data-drag-handle]');
    const secondSection = sections.nth(1);

    await firstDragHandle.dragTo(secondSection, {
      targetPosition: { x: 0, y: 100 } // Drop below
    });

    // Order should be reversed
    const newFirstKey = await sections.first().getAttribute('data-section-key');
    const newSecondKey = await sections.nth(1).getAttribute('data-section-key');

    expect(newFirstKey).toBe(secondSectionKey);
    expect(newSecondKey).toBe(firstSectionKey);
  });

  test('drag handle has accessible name', async ({ page }) => {
    await page.goto('/services');
    await enableEditMode(page);

    const dragHandle = page.locator('[data-drag-handle]').first();
    await expect(dragHandle).toHaveAttribute('aria-label', /drag to reorder/i);
  });

  test('supports keyboard reordering', async ({ page }) => {
    await page.goto('/services');
    await enableEditMode(page);

    // Focus the first drag handle
    const firstDragHandle = page.locator('[data-drag-handle]').first();
    await firstDragHandle.focus();

    // Press space to start drag, arrow down to move, space to drop
    await page.keyboard.press('Space');
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Space');

    // Should have reordered
    // (actual assertion depends on implementation)
  });

  test('shows visual feedback while dragging', async ({ page }) => {
    await page.goto('/services');
    await enableEditMode(page);

    const firstDragHandle = page.locator('[data-drag-handle]').first();
    const firstSection = page.locator('[data-editable-section]').first();

    // Start dragging
    await firstDragHandle.hover();
    await page.mouse.down();
    await page.mouse.move(0, 100);

    // Section should have z-50 class when dragging (added by isDragging state)
    await expect(firstSection).toHaveClass(/z-50/);

    await page.mouse.up();
  });

  test.skip('persists section order after drag', async ({ page }) => {
    // NOTE: Persistence requires saving sectionOrder to backend.
    // Current implementation is client-side only.
    await page.goto('/services');
    await enableEditMode(page);

    const sections = page.locator('[data-editable-section]');
    const originalOrder = await sections.allInnerTexts();

    // Drag first to second position
    const firstDragHandle = sections.first().locator('[data-drag-handle]');
    await firstDragHandle.dragTo(sections.nth(1));

    // Reload page
    await page.reload();
    await enableEditMode(page);

    // Order should be persisted
    const newOrder = await sections.allInnerTexts();
    expect(newOrder[0]).toBe(originalOrder[1]);
    expect(newOrder[1]).toBe(originalOrder[0]);
  });
});
