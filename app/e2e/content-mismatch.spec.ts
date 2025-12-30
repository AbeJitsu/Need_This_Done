import { test, expect } from '@playwright/test';

// ============================================================================
// Content Mismatch Detection Tests
// ============================================================================
// Tests that each page shows its OWN content in edit mode, not stale content
// from a previously visited page.
//
// THE BUG: InlineEditContext holds pageSlug globally. If a page doesn't call
// useEditableContent(), the sidebar shows content from the last page visited.
//
// EXPECTED BEHAVIOR:
// - Every page that shows edit toggle must have useEditableContent() configured
// - Sidebar "Editing:" label must match the current page URL
// - Navigating to unconfigured pages should clear or hide the sidebar

// Helper to enable edit mode
async function enableEditMode(page: import('@playwright/test').Page) {
  const editToggle = page.locator('button[aria-label="Edit this page"]');
  await editToggle.waitFor({ state: 'visible', timeout: 10000 });
  await editToggle.click();
  await page.getByText('Edit Mode', { exact: true }).waitFor({ state: 'visible', timeout: 5000 });
}

test.describe('Content Mismatch Detection', () => {

  test('contact page must have editable content configured', async ({ page }) => {
    // Navigate directly to contact page
    await page.goto('/contact');
    await expect(page.locator('h1').first()).toBeVisible();

    // Enable edit mode (uses the floating pencil button)
    await enableEditMode(page);

    // Sidebar should now be visible (edit mode auto-opens it or we click content)
    // Click the h1 to open sidebar if not already open
    await page.locator('h1').first().click();

    const sidebar = page.locator('[data-testid="admin-sidebar"]');
    await expect(sidebar).toBeVisible();

    // THE TEST: Sidebar should show "Editing: contact" or similar
    // NOT "Editing: how it works" or any other page's content
    const editingLabel = sidebar.locator('p:has-text("Editing:")').first();
    await expect(editingLabel).toBeVisible();

    // Should contain "contact" (case insensitive)
    // This FAILS because contact page has no useEditableContent() configured
    await expect(editingLabel).toContainText(/contact/i);
  });

  test('all editable pages show correct slug', async ({ page }) => {
    // Pages that SHOULD have editable content
    const editablePages = [
      { path: '/', expectedSlug: /home/i },
      { path: '/services', expectedSlug: /services/i },
      { path: '/pricing', expectedSlug: /pricing/i },
      { path: '/faq', expectedSlug: /faq/i },
      { path: '/how-it-works', expectedSlug: /how.?it.?works/i },
    ];

    for (const { path, expectedSlug } of editablePages) {
      await page.goto(path);
      await expect(page.locator('h1').first()).toBeVisible();

      await enableEditMode(page);

      // Click h1 to open sidebar
      await page.locator('h1').first().click();

      const sidebar = page.locator('[data-testid="admin-sidebar"]');
      await expect(sidebar).toBeVisible();

      // Verify correct page slug in sidebar
      const editingLabel = sidebar.locator('p:has-text("Editing:")').first();
      await expect(editingLabel).toBeVisible();
      await expect(editingLabel).toContainText(expectedSlug);

      // Exit edit mode for next iteration
      await page.keyboard.press('Escape');
      await page.waitForTimeout(100);
    }
  });

});
