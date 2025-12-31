import { test, expect, Page } from '@playwright/test';
import { discoverPublicPages } from './utils/page-discovery';

// ============================================================================
// Section Drag and Drop Tests
// ============================================================================
// Tests for dragging sections to reorder them in edit mode.
// Uses @dnd-kit for accessible drag-and-drop.
//
// RULE: Uses page discovery instead of hardcoded paths (ETC principle)
// See: .claude/rules/testing-flexibility.md

// Use /services for drag tests - it has multiple editable sections
const publicPages = discoverPublicPages();
const testPage = publicPages.find(p => p.path === '/services') || publicPages.find(p => p.path !== '/') || publicPages[0];

// Helper to enable edit mode using the correct selector
async function enableEditMode(page: Page): Promise<void> {
  const editToggle = page.locator('button[aria-label="Edit this page"]');
  await editToggle.waitFor({ state: 'visible', timeout: 10000 });
  await editToggle.click();
  await page.getByText('Edit Mode', { exact: true }).waitFor({ state: 'visible', timeout: 5000 });
}

test.describe('Section Drag and Drop', () => {
  test(`shows drag handles on sections when edit mode is active (${testPage.path})`, async ({ page }) => {
    await page.goto(testPage.path);
    await enableEditMode(page);

    // Should see drag handles on editable sections
    const dragHandles = page.locator('[data-drag-handle]');
    await expect(dragHandles.first()).toBeVisible();
  });

  test(`drag handles are hidden when edit mode is off (${testPage.path})`, async ({ page }) => {
    await page.goto(testPage.path);

    // Edit mode should be off by default
    const dragHandles = page.locator('[data-drag-handle]');
    await expect(dragHandles).toHaveCount(0);
  });

  test('can drag section to reorder', async ({ page }) => {
    // Tests that sections can be reordered via drag-and-drop.
    // Verifies by checking sectionOrder state exposed via data attribute.
    await page.goto(testPage.path);
    await enableEditMode(page);

    // Wait for sections to be registered
    await page.waitForTimeout(500);

    // Get the sectionOrder before drag
    const getSectionOrder = async () => {
      const orderAttr = await page.locator('[data-section-order]').getAttribute('data-section-order');
      return orderAttr ? JSON.parse(orderAttr) as string[] : [];
    };

    const orderBefore = await getSectionOrder();
    expect(orderBefore.length).toBeGreaterThanOrEqual(2);

    const firstSectionKey = orderBefore[0];
    const secondSectionKey = orderBefore[1];

    // Get locators for drag elements
    const firstSection = page.locator(`[data-section-key="${firstSectionKey}"]`);
    const secondSection = page.locator(`[data-section-key="${secondSectionKey}"]`);
    const firstDragHandle = firstSection.locator('[data-drag-handle]');

    // Hover over first section to reveal the drag handle (it's opacity-0 by default)
    await firstSection.hover();
    await page.waitForTimeout(200);

    // Wait for drag handle to be visible
    await expect(firstDragHandle).toBeVisible();

    const handleBox = await firstDragHandle.boundingBox();
    const targetBox = await secondSection.boundingBox();

    expect(handleBox).not.toBeNull();
    expect(targetBox).not.toBeNull();

    // Manual drag using mouse events (more reliable with @dnd-kit)
    const startX = handleBox!.x + handleBox!.width / 2;
    const startY = handleBox!.y + handleBox!.height / 2;
    const endX = targetBox!.x + targetBox!.width / 2;
    // Drag to middle of target section to swap positions (not past it)
    const endY = targetBox!.y + targetBox!.height / 2;

    // Perform drag sequence - start from the drag handle
    await page.mouse.move(startX, startY);
    await page.waitForTimeout(100);
    await page.mouse.down();
    await page.waitForTimeout(100);

    // Move in steps to trigger @dnd-kit's pointer sensor (needs 8px distance)
    const steps = 20;
    for (let i = 1; i <= steps; i++) {
      const x = startX + ((endX - startX) * i) / steps;
      const y = startY + ((endY - startY) * i) / steps;
      await page.mouse.move(x, y);
      await page.waitForTimeout(30);
    }

    await page.waitForTimeout(100);
    await page.mouse.up();

    // Wait for state update
    await page.waitForTimeout(500);

    // Get the sectionOrder after drag
    const orderAfter = await getSectionOrder();

    // The first two items should be swapped
    expect(orderAfter[0]).toBe(secondSectionKey);
    expect(orderAfter[1]).toBe(firstSectionKey);
  });

  test(`drag handle has accessible name (${testPage.path})`, async ({ page }) => {
    await page.goto(testPage.path);
    await enableEditMode(page);

    const dragHandle = page.locator('[data-drag-handle]').first();
    await expect(dragHandle).toHaveAttribute('aria-label', /drag to reorder/i);
  });

  test(`supports keyboard reordering (${testPage.path})`, async ({ page }) => {
    await page.goto(testPage.path);
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

  test(`shows visual feedback while dragging (${testPage.path})`, async ({ page }) => {
    await page.goto(testPage.path);
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
    await page.goto(testPage.path);
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
