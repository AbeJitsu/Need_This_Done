import { test, expect, Page } from '@playwright/test';

// ============================================================================
// Test: Item Editing - Typing in Fields Actually Updates Content
// ============================================================================
// PROOF: When editing array items (FAQ questions, pricing tiers, etc.),
// typing in the sidebar fields actually updates the content.
//
// This catches the bug where:
// - User clicks on FAQ item, sidebar opens with question/answer fields
// - User types in the answer textarea
// - The typed text doesn't appear (controlled input bug)
// - Shows "1 unsaved change" but the change isn't visible

// ============================================================================
// Helper Functions
// ============================================================================

async function enableEditMode(page: Page): Promise<void> {
  const editToggle = page.locator('button[aria-label="Edit this page"]');
  await editToggle.waitFor({ state: 'visible', timeout: 10000 });
  await editToggle.click();
  await page.getByText('Edit Mode', { exact: true }).waitFor({ state: 'visible', timeout: 5000 });

  // Wait for content to be loaded
  const sidebar = page.locator('[data-testid="admin-sidebar"]');
  await sidebar.waitFor({ state: 'visible', timeout: 5000 });
  await page.waitForFunction(
    () => document.querySelector('[data-content-loaded="true"]') !== null,
    { timeout: 5000 }
  );
}

// ============================================================================
// Tests
// ============================================================================

test.describe('Item Editing - Typing Updates Content', () => {
  test('FAQ: typing in answer textarea updates the field value', async ({ page }) => {
    // Navigate to FAQ page
    await page.goto('/faq');
    await expect(page.locator('h1').first()).toBeVisible({ timeout: 10000 });

    // Enable edit mode
    await enableEditMode(page);

    // Click on first FAQ item
    const faqItem = page.getByText('What types of tasks do you handle', { exact: false }).first();
    await expect(faqItem).toBeVisible({ timeout: 5000 });
    await faqItem.click();

    // Wait for sidebar to show item editing view
    const sidebar = page.locator('[data-testid="admin-sidebar"]');
    await expect(sidebar.getByText('answer', { exact: false })).toBeVisible({ timeout: 3000 });

    // Find the answer textarea
    const answerTextarea = sidebar.locator('textarea').first();
    await expect(answerTextarea).toBeVisible({ timeout: 3000 });

    // Get the original value
    const originalValue = await answerTextarea.inputValue();

    // Type additional text
    const testText = ' TEST_EDIT_WORKS';
    await answerTextarea.focus();
    await answerTextarea.press('End'); // Move to end of text
    await answerTextarea.type(testText, { delay: 50 });

    // Wait for the change to be processed
    await page.waitForTimeout(300);

    // Verify the textarea now contains the new text
    const newValue = await answerTextarea.inputValue();
    expect(
      newValue,
      `Textarea should contain the typed text. Original: "${originalValue.substring(0, 50)}...", New: "${newValue.substring(0, 50)}..."`
    ).toContain(testText);

    // Also verify the "unsaved changes" indicator shows the change
    await expect(sidebar.getByText('unsaved change', { exact: false })).toBeVisible({ timeout: 2000 });
  });

  test('FAQ: typing in question input updates the field value', async ({ page }) => {
    await page.goto('/faq');
    await expect(page.locator('h1').first()).toBeVisible({ timeout: 10000 });
    await enableEditMode(page);

    // Click on first FAQ item
    const faqItem = page.getByText('What types of tasks do you handle', { exact: false }).first();
    await faqItem.click();

    // Wait for sidebar to show item editing view
    const sidebar = page.locator('[data-testid="admin-sidebar"]');
    await expect(sidebar.getByText('question', { exact: false })).toBeVisible({ timeout: 3000 });

    // Find the question input (text input, not textarea)
    const questionInput = sidebar.locator('input[type="text"]').first();
    await expect(questionInput).toBeVisible({ timeout: 3000 });

    // Get the original value
    const originalValue = await questionInput.inputValue();

    // Clear and type new text
    const testText = 'EDITED_QUESTION';
    await questionInput.fill(testText);

    // Wait for the change to be processed
    await page.waitForTimeout(300);

    // Verify the input now contains the new text
    const newValue = await questionInput.inputValue();
    expect(newValue).toBe(testText);
  });

  test('Pricing: typing in tier name updates the field value', async ({ page }) => {
    await page.goto('/pricing');
    await expect(page.locator('h1').first()).toBeVisible({ timeout: 10000 });
    await enableEditMode(page);

    // Click on a pricing tier
    const tier = page.getByText('Standard Task', { exact: false }).first();
    await tier.click();

    // Wait for sidebar to show item editing view
    const sidebar = page.locator('[data-testid="admin-sidebar"]');
    await expect(sidebar.locator('input[type="text"], textarea').first()).toBeVisible({ timeout: 3000 });

    // Find an input field
    const nameInput = sidebar.locator('input[type="text"]').first();
    await expect(nameInput).toBeVisible({ timeout: 3000 });

    // Type new text
    const testText = 'EDITED_TIER_NAME';
    await nameInput.fill(testText);

    // Wait for the change to be processed
    await page.waitForTimeout(300);

    // Verify the input now contains the new text
    const newValue = await nameInput.inputValue();
    expect(newValue).toBe(testText);
  });

  test('Privacy: typing in section title updates the field value', async ({ page }) => {
    await page.goto('/privacy');
    await expect(page.locator('h1').first()).toBeVisible({ timeout: 10000 });
    await enableEditMode(page);

    // Click on first section
    const section = page.getByText('1. Information We Collect', { exact: false }).first();
    await section.click();

    // Wait for sidebar to show item editing view
    const sidebar = page.locator('[data-testid="admin-sidebar"]');
    await expect(sidebar.locator('input[type="text"], textarea').first()).toBeVisible({ timeout: 3000 });

    // Find the title input
    const titleInput = sidebar.locator('input[type="text"]').first();
    await expect(titleInput).toBeVisible({ timeout: 3000 });

    // Type new text
    const testText = 'EDITED_SECTION_TITLE';
    await titleInput.fill(testText);

    // Wait for the change to be processed
    await page.waitForTimeout(300);

    // Verify the input now contains the new text
    const newValue = await titleInput.inputValue();
    expect(newValue).toBe(testText);
  });
});
