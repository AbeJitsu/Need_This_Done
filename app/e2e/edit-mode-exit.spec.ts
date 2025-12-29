import { test, expect } from '@playwright/test';

// ============================================================================
// Edit Mode Exit Tests
// ============================================================================
// What: Tests that links work correctly after exiting edit mode
// Why: Users reported links not working after closing the edit sidebar
// How: Enter edit mode, exit, then verify links navigate correctly
// Note: These tests use the "chromium" project which has admin auth pre-saved

test.describe('Edit Mode Exit', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to home page
    // With NEXT_PUBLIC_E2E_ADMIN_BYPASS=true, no login needed
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    // Wait for edit toggle to be visible (confirms page is ready)
    await page.locator('button[aria-label="Edit this page"]').waitFor({ state: 'visible', timeout: 10000 });
  });

  test('links should work after exiting edit mode via sidebar close button', async ({
    page,
  }) => {
    // Step 1: Enter edit mode by clicking the toggle button
    const editToggle = page.locator('button[aria-label="Edit this page"]');
    await editToggle.click();

    // Verify we're in edit mode (edit bar should be visible)
    // Use exact text match to avoid matching "Exit Edit Mode" button
    const editModeBar = page.getByText('Edit Mode', { exact: true });
    await expect(editModeBar).toBeVisible();

    // Step 2: Close edit mode via the sidebar's X button (in the header area)
    // The sidebar has a header with "Page Editor" text and a close button
    const sidebarCloseButton = page.locator('.fixed.right-0.w-96 button[aria-label="Close editor"]');
    await sidebarCloseButton.click();

    // Verify edit mode bar is gone
    await expect(editModeBar).not.toBeVisible();

    // Step 3: Click a navigation link - it should work
    // Find the Services link in the navigation
    const servicesLink = page.locator('nav a[href="/services"]').first();
    await servicesLink.click();

    // Should navigate to services page
    await expect(page).toHaveURL('/services');
  });

  test('links should work after exiting edit mode via Exit Edit Mode button', async ({
    page,
  }) => {
    // Step 1: Enter edit mode
    const editToggle = page.locator('button[aria-label="Edit this page"]');
    await editToggle.click();

    // Verify we're in edit mode
    const editModeBar = page.getByText('Edit Mode', { exact: true });
    await expect(editModeBar).toBeVisible();

    // Step 2: Exit via the "Exit Edit Mode" button in the bar
    const exitButton = page.getByRole('button', { name: 'Exit Edit Mode' });
    await exitButton.click();

    // Verify edit mode bar is gone
    await expect(editModeBar).not.toBeVisible();

    // Step 3: Click a navigation link
    const servicesLink = page.locator('nav a[href="/services"]').first();
    await servicesLink.click();

    // Should navigate to services page
    await expect(page).toHaveURL('/services');
  });

  test('links should work after exiting edit mode via Escape key', async ({
    page,
  }) => {
    // Step 1: Enter edit mode
    const editToggle = page.locator('button[aria-label="Edit this page"]');
    await editToggle.click();

    // Verify we're in edit mode
    const editModeBar = page.getByText('Edit Mode', { exact: true });
    await expect(editModeBar).toBeVisible();

    // Step 2: Press Escape to exit edit mode
    await page.keyboard.press('Escape');

    // Verify edit mode bar is gone
    await expect(editModeBar).not.toBeVisible();

    // Step 3: Click a navigation link
    const servicesLink = page.locator('nav a[href="/services"]').first();
    await servicesLink.click();

    // Should navigate to services page
    await expect(page).toHaveURL('/services');
  });

  test('links inside editable items should work after exiting edit mode', async ({
    page,
  }) => {
    // Step 1: Enter edit mode
    const editToggle = page.locator('button[aria-label="Edit this page"]');
    await editToggle.click();

    // Verify we're in edit mode
    const editModeBar = page.getByText('Edit Mode', { exact: true });
    await expect(editModeBar).toBeVisible();

    // Step 2: Exit edit mode via Escape (most reliable)
    await page.keyboard.press('Escape');

    // Verify we're out of edit mode
    await expect(editModeBar).not.toBeVisible();

    // Step 3: Click a link that was previously wrapped by EditableItem
    // The service cards on the homepage have links
    const serviceCard = page.locator('[href="/services"]').first();
    await serviceCard.click();

    // Should navigate to services page
    await expect(page).toHaveURL('/services');
  });

  test('toggle button should close edit mode and restore link functionality', async ({
    page,
  }) => {
    // Step 1: Enter edit mode by clicking toggle
    const editToggle = page.locator('button[aria-label="Edit this page"]');
    await editToggle.click();

    // Verify we're in edit mode
    const editModeBar = page.getByText('Edit Mode', { exact: true });
    await expect(editModeBar).toBeVisible();

    // Step 2: Click toggle again to close (it's the floating button at bottom-right)
    // Use the floating button class to distinguish from sidebar close button
    const closeToggle = page.locator('button.fixed.bottom-24.right-6[aria-label="Close editor"]');
    await closeToggle.click();

    // Verify edit mode is off
    await expect(editModeBar).not.toBeVisible();

    // Step 3: Click a link
    const servicesLink = page.locator('nav a[href="/services"]').first();
    await servicesLink.click();

    // Should navigate
    await expect(page).toHaveURL('/services');
  });
});
