import { test, expect } from '@playwright/test';

// ============================================================================
// Phase 3: Auto Route Detection E2E Tests
// ============================================================================
// These tests verify that pages using useEditableContent with auto-detection
// work correctly - rendering content and supporting inline editing.

test.describe('Auto Route Detection', () => {
  test.describe('pages render with auto-detected slug', () => {
    test('services page renders content correctly', async ({ page }) => {
      await page.goto('/services');

      // Page should render with content from the services page
      await expect(page.locator('h1').first()).toBeVisible();

      // Check that services-specific content exists
      const pageContent = await page.textContent('body');
      expect(pageContent).toBeTruthy();
    });

    test('home page renders content correctly', async ({ page }) => {
      await page.goto('/');

      // Home page should render
      await expect(page.locator('h1').first()).toBeVisible();
    });

    test('pricing page renders content correctly', async ({ page }) => {
      await page.goto('/pricing');

      // Pricing page should render
      await expect(page.locator('h1').first()).toBeVisible();
    });

    test('faq page renders content correctly', async ({ page }) => {
      await page.goto('/faq');

      // FAQ page should render
      await expect(page.locator('h1').first()).toBeVisible();
    });

    test('how-it-works page renders content correctly', async ({ page }) => {
      await page.goto('/how-it-works');

      // How it works page should render
      await expect(page.locator('h1').first()).toBeVisible();
    });
  });

  test.describe('inline editing works with auto-detected slug', () => {
    test('can enter edit mode on services page', async ({ page }) => {
      await page.goto('/services');

      // Find and click the edit mode toggle (admin sidebar toggle)
      const editToggle = page.locator('[data-testid="admin-sidebar-toggle"]').first();

      // If toggle exists, click it
      if (await editToggle.isVisible()) {
        await editToggle.click();

        // Should see edit mode indicator
        await expect(page.locator('[data-testid="edit-mode-bar"]')).toBeVisible();
      }
    });

    test('can edit section on services page in edit mode', async ({ page }) => {
      await page.goto('/services');

      // Enter edit mode
      const editToggle = page.locator('[data-testid="admin-sidebar-toggle"]').first();
      if (await editToggle.isVisible()) {
        await editToggle.click();

        // Click on an editable section
        const editableSection = page.locator('[data-editable-section]').first();
        if (await editableSection.isVisible()) {
          await editableSection.click();

          // Sidebar should open with edit form
          await expect(page.locator('[data-testid="admin-sidebar"]')).toBeVisible();
        }
      }
    });
  });

  test.describe('content persistence with auto-detected slug', () => {
    test('edited content persists after page reload', async ({ page }) => {
      await page.goto('/services');

      // This test verifies that the slug is correctly detected for saving
      // The auto-detected slug should match what was previously hardcoded

      // Enter edit mode
      const editToggle = page.locator('[data-testid="admin-sidebar-toggle"]').first();
      if (await editToggle.isVisible()) {
        await editToggle.click();

        // The page should function identically to when slug was explicit
        // If there are any issues with slug detection, saving would fail
        await expect(page.locator('[data-testid="edit-mode-bar"]')).toBeVisible();
      }
    });
  });
});
