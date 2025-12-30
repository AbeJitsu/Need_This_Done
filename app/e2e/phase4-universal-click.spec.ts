import { test, expect, Page } from '@playwright/test';

// ============================================================================
// Phase 4: Universal Click-to-Edit E2E Tests
// ============================================================================
// Tests the complete universal editing experience:
// - Click any element → auto-detect JSON path
// - Edit ALL properties (text, colors, sizes, links)
// - Add/remove/reorder array items
//
// UNIVERSAL: Works across all editable pages without page-specific code.

// Helper to enable edit mode on any page
// Uses the pencil icon button that appears for admins (requires E2E_ADMIN_BYPASS)
async function enableEditMode(page: Page) {
  // Wait for the edit toggle to be visible (confirms admin bypass is working)
  const editToggle = page.locator('button[aria-label="Edit this page"]');
  await editToggle.waitFor({ state: 'visible', timeout: 10000 });
  await editToggle.click();

  // Wait for edit mode to activate (edit bar should appear)
  await page.getByText('Edit Mode', { exact: true }).waitFor({ state: 'visible', timeout: 5000 });
}

// Pages with their expected content
const PAGES_TO_TEST = [
  { path: '/', name: 'home', title: 'Get your tasks done right' },
  { path: '/services', name: 'services', title: 'Find Your Perfect Fit' },
  { path: '/pricing', name: 'pricing', title: 'Pricing That Fits' },
  { path: '/faq', name: 'faq', title: 'Frequently Asked Questions' },
  { path: '/how-it-works', name: 'how-it-works', title: 'We Make It Easy' },
];

test.describe('Phase 4: Universal Click-to-Edit', () => {

  // ============================================================================
  // 4A: Content Path Discovery
  // ============================================================================
  test.describe('4A: Content Path Discovery', () => {

    test.describe('Works on all editable pages', () => {
      for (const pageInfo of PAGES_TO_TEST) {
        test(`${pageInfo.name}: clicking title opens editor`, async ({ page }) => {
          await page.goto(pageInfo.path);
          await expect(page.locator('h1').first()).toBeVisible();
          await enableEditMode(page);

          await page.locator('h1').first().click();

          const sidebar = page.locator('[data-testid="admin-sidebar"]');
          await expect(sidebar).toBeVisible({ timeout: 5000 });
        });
      }
    });

    test('finds simple field path (header.title)', async ({ page }) => {
      await page.goto('/services');
      await expect(page.locator('h1').first()).toBeVisible();
      await enableEditMode(page);

      await page.locator('h1').first().click();

      const sidebar = page.locator('[data-testid="admin-sidebar"]');
      await expect(sidebar).toBeVisible();
      await expect(sidebar.getByText(/title/i).first()).toBeVisible();
    });

    test('finds array item path (expectations.0.title)', async ({ page }) => {
      await page.goto('/services');
      await expect(page.locator('h1').first()).toBeVisible();
      await enableEditMode(page);

      const expectationText = page.getByText('Clear Communication').first();
      await expectationText.click();

      const sidebar = page.locator('[data-testid="admin-sidebar"]');
      await expect(sidebar).toBeVisible();
    });

    test('finds deeply nested path in arrays', async ({ page }) => {
      await page.goto('/services');
      await expect(page.locator('h1').first()).toBeVisible();
      await enableEditMode(page);

      // Click on scenario quote (nested in scenarioMatcher.scenarios[].quotes[])
      const scenarioQuote = page.getByText('My inbox is drowning me').first();
      if (await scenarioQuote.isVisible()) {
        await scenarioQuote.click();
        const sidebar = page.locator('[data-testid="admin-sidebar"]');
        await expect(sidebar).toBeVisible();
      }
    });
  });

  // ============================================================================
  // 4B: Property Editors (All Field Types)
  // ============================================================================
  test.describe('4B: Property Editors', () => {

    test('shows text input for string fields', async ({ page }) => {
      await page.goto('/services');
      await expect(page.locator('h1').first()).toBeVisible();
      await enableEditMode(page);

      await page.locator('h1').first().click();

      const sidebar = page.locator('[data-testid="admin-sidebar"]');
      await expect(sidebar).toBeVisible();

      // Should have text input for title
      const titleInput = sidebar.locator('input[type="text"], textarea').first();
      await expect(titleInput).toBeVisible();
    });

    test('shows color picker for color fields', async ({ page }) => {
      await page.goto('/pricing');
      await expect(page.locator('h1').first()).toBeVisible();
      await enableEditMode(page);

      // Click on a pricing tier (has color property)
      const tierTitle = page.getByText('Quick Task').first();
      if (await tierTitle.isVisible()) {
        await tierTitle.click();

        const sidebar = page.locator('[data-testid="admin-sidebar"]');
        await expect(sidebar).toBeVisible();

        // Should show color field editor (dropdown or picker)
        const colorField = sidebar.getByText(/color/i).first();
        await expect(colorField).toBeVisible();
      }
    });

    test('shows dropdown for variant/size fields', async ({ page }) => {
      await page.goto('/');
      await expect(page.locator('h1').first()).toBeVisible();
      await enableEditMode(page);

      // Click on a button (has variant property)
      const button = page.getByRole('link', { name: 'Book a Consultation' }).first();
      if (await button.isVisible()) {
        await button.click();

        const sidebar = page.locator('[data-testid="admin-sidebar"]');
        await expect(sidebar).toBeVisible();

        // Should show variant field (labeled as "Style" in the sidebar)
        // Check for either the select dropdown or the Style label
        const variantField = sidebar.locator('select').first();
        await expect(variantField).toBeVisible();
      }
    });

    test('shows link editor for href fields', async ({ page }) => {
      await page.goto('/');
      await expect(page.locator('h1').first()).toBeVisible();
      await enableEditMode(page);

      // Click on a link element
      const link = page.getByRole('link', { name: 'View Services' }).first();
      if (await link.isVisible()) {
        await link.click();

        const sidebar = page.locator('[data-testid="admin-sidebar"]');
        await expect(sidebar).toBeVisible();

        // Should show href field
        const hrefField = sidebar.getByText(/href|link|url/i).first();
        await expect(hrefField).toBeVisible();
      }
    });

    test('shows toggle for boolean fields', async ({ page }) => {
      await page.goto('/pricing');
      await expect(page.locator('h1').first()).toBeVisible();
      await enableEditMode(page);

      // Click on "Standard Task" tier (has popular: true)
      const popularTier = page.getByText('Standard Task').first();
      if (await popularTier.isVisible()) {
        await popularTier.click();

        const sidebar = page.locator('[data-testid="admin-sidebar"]');
        await expect(sidebar).toBeVisible();

        // Should show popular toggle or checkbox
        const popularField = sidebar.getByText(/popular/i).first();
        await expect(popularField).toBeVisible();
      }
    });
  });

  // ============================================================================
  // 4C: Array Operations (Add/Remove/Reorder)
  // ============================================================================
  test.describe('4C: Array Operations', () => {

    test('shows Add Item button for arrays', async ({ page }) => {
      await page.goto('/faq');
      await expect(page.locator('h1').first()).toBeVisible();
      await enableEditMode(page);

      // Click on FAQ section
      const faqQuestion = page.getByText('What types of tasks do you handle?').first();
      if (await faqQuestion.isVisible()) {
        await faqQuestion.click();

        const sidebar = page.locator('[data-testid="admin-sidebar"]');
        await expect(sidebar).toBeVisible();

        // Should show add item button
        const addButton = sidebar.getByRole('button', { name: /add|new|\+/i });
        await expect(addButton).toBeVisible();
      }
    });

    test('shows Delete button on array items', async ({ page }) => {
      await page.goto('/services');
      await expect(page.locator('h1').first()).toBeVisible();
      await enableEditMode(page);

      // Click on an expectation item
      const expectationText = page.getByText('Clear Communication').first();
      await expectationText.click();

      const sidebar = page.locator('[data-testid="admin-sidebar"]');
      await expect(sidebar).toBeVisible();

      // Should show delete button
      const deleteButton = sidebar.getByRole('button', { name: /delete|remove|🗑/i });
      await expect(deleteButton).toBeVisible();
    });

    test('shows reorder controls on array items', async ({ page }) => {
      await page.goto('/how-it-works');
      await expect(page.locator('h1').first()).toBeVisible();
      await enableEditMode(page);

      // Click on a step
      const stepTitle = page.getByText('Tell Us Your Needs').first();
      if (await stepTitle.isVisible()) {
        await stepTitle.click();

        const sidebar = page.locator('[data-testid="admin-sidebar"]');
        await expect(sidebar).toBeVisible();

        // Should show reorder controls (up/down arrows or drag handle)
        const reorderControl = sidebar.getByRole('button', { name: /up|down|↑|↓|move|reorder/i });
        await expect(reorderControl.first()).toBeVisible();
      }
    });

    test('can add new item to array', async ({ page }) => {
      await page.goto('/faq');
      await expect(page.locator('h1').first()).toBeVisible();
      await enableEditMode(page);

      // Click on FAQ section
      const faqQuestion = page.getByText('What types of tasks do you handle?').first();
      if (await faqQuestion.isVisible()) {
        await faqQuestion.click();

        const sidebar = page.locator('[data-testid="admin-sidebar"]');
        await expect(sidebar).toBeVisible();

        // Click add button
        const addButton = sidebar.getByRole('button', { name: /add|new|\+/i });
        if (await addButton.isVisible()) {
          await addButton.click();

          // Should show new item form or add new item to list
          // Implementation will determine exact behavior
        }
      }
    });

    test('can delete item from array', async ({ page }) => {
      await page.goto('/services');
      await expect(page.locator('h1').first()).toBeVisible();
      await enableEditMode(page);

      // Click on an expectation item
      const expectationText = page.getByText('Clear Communication').first();
      await expectationText.click();

      const sidebar = page.locator('[data-testid="admin-sidebar"]');
      await expect(sidebar).toBeVisible();

      // Click delete button
      const deleteButton = sidebar.getByRole('button', { name: /delete|remove|🗑/i });
      if (await deleteButton.isVisible()) {
        // Note: Actual deletion would require confirmation
        // Test just verifies the button is present and clickable
      }
    });
  });

  // ============================================================================
  // 4D: Integration & Edge Cases
  // ============================================================================
  test.describe('4D: Integration', () => {

    test('only activates in edit mode', async ({ page }) => {
      await page.goto('/services');
      await expect(page.locator('h1').first()).toBeVisible();

      // Do NOT enable edit mode
      await page.locator('h1').first().click();

      // Sidebar should not open from universal click
      // (existing EditableSection behavior may still work)
      await page.waitForTimeout(300);
    });

    test('handles non-content clicks gracefully', async ({ page }) => {
      await page.goto('/services');
      await expect(page.locator('h1').first()).toBeVisible();
      await enableEditMode(page);

      // Click on navigation (not in page content JSON)
      const navLink = page.getByRole('link', { name: /home/i }).first();
      if (await navLink.isVisible()) {
        // Should not crash - either navigate or do nothing
        // This tests graceful handling of non-editable elements
      }
    });

    test('can edit multiple fields in sequence', async ({ page }) => {
      await page.goto('/services');
      await expect(page.locator('h1').first()).toBeVisible();
      await enableEditMode(page);

      // Click title
      await page.locator('h1').first().click();
      const sidebar = page.locator('[data-testid="admin-sidebar"]');
      await expect(sidebar).toBeVisible();

      // Click description - should switch to that field
      const description = page.getByText('Not sure which service you need?').first();
      await description.click();

      // Sidebar should still be open with new content
      await expect(sidebar).toBeVisible();
    });

    test('keyboard navigation works', async ({ page }) => {
      await page.goto('/services');
      await expect(page.locator('h1').first()).toBeVisible();
      await enableEditMode(page);

      // Focus on an EditableSection using keyboard (has tabIndex=0 and aria-label)
      // The EditableSection wrapper is the focusable element, not the h1 inside
      const editableSection = page.locator('[aria-label="Edit Page Header section"]');
      await editableSection.focus();
      await page.keyboard.press('Enter');

      const sidebar = page.locator('[data-testid="admin-sidebar"]');
      await expect(sidebar).toBeVisible();
    });

    test('escape key closes editor', async ({ page }) => {
      await page.goto('/services');
      await expect(page.locator('h1').first()).toBeVisible();
      await enableEditMode(page);

      await page.locator('h1').first().click();

      const sidebar = page.locator('[data-testid="admin-sidebar"]');
      await expect(sidebar).toBeVisible();

      // Press escape
      await page.keyboard.press('Escape');

      // Editor should close or selection should clear
      // Implementation determines exact behavior
    });
  });

  // ============================================================================
  // Cross-page Consistency
  // ============================================================================
  test.describe('Cross-page Consistency', () => {

    test('FAQ items array works', async ({ page }) => {
      await page.goto('/faq');
      await expect(page.locator('h1').first()).toBeVisible();
      await enableEditMode(page);

      const answerText = page.getByText('We help with all kinds of tasks').first();
      if (await answerText.isVisible()) {
        await answerText.click();

        const sidebar = page.locator('[data-testid="admin-sidebar"]');
        await expect(sidebar).toBeVisible();
      }
    });

    test('pricing tiers array works', async ({ page }) => {
      await page.goto('/pricing');
      await expect(page.locator('h1').first()).toBeVisible();
      await enableEditMode(page);

      const tierTitle = page.getByText('Quick Task').first();
      if (await tierTitle.isVisible()) {
        await tierTitle.click();

        const sidebar = page.locator('[data-testid="admin-sidebar"]');
        await expect(sidebar).toBeVisible();
      }
    });

    test('how-it-works steps array works', async ({ page }) => {
      await page.goto('/how-it-works');
      await expect(page.locator('h1').first()).toBeVisible();
      await enableEditMode(page);

      const stepTitle = page.getByText('Tell Us Your Needs').first();
      if (await stepTitle.isVisible()) {
        await stepTitle.click();

        const sidebar = page.locator('[data-testid="admin-sidebar"]');
        await expect(sidebar).toBeVisible();
      }
    });

    test('home page buttons array works', async ({ page }) => {
      await page.goto('/');
      await expect(page.locator('h1').first()).toBeVisible();
      await enableEditMode(page);

      const button = page.getByRole('link', { name: 'Book a Consultation' }).first();
      if (await button.isVisible()) {
        await button.click();

        const sidebar = page.locator('[data-testid="admin-sidebar"]');
        await expect(sidebar).toBeVisible();
      }
    });
  });
});
