import { test, expect, Page } from '@playwright/test';

// ============================================================================
// Get Started Page: Inline Editing E2E Tests
// ============================================================================
// Tests click-to-edit functionality on the Get Started page.
// The page has multiple sections that should be editable:
// - Page header (title, description)
// - Path cards (Get a Quote, Book a Consultation)
// - Already Have Quote section
// - Authorization form section

async function enableEditMode(page: Page) {
  const editToggle = page.locator('button[aria-label="Edit this page"]');
  await editToggle.waitFor({ state: 'visible', timeout: 10000 });
  await editToggle.click();
  await page.getByText('Edit Mode', { exact: true }).waitFor({ state: 'visible', timeout: 5000 });
}

test.describe('Get Started: Inline Editing', () => {

  test('clicking page title opens editor sidebar', async ({ page }) => {
    await page.goto('/get-started');
    await expect(page.locator('h1').first()).toBeVisible();
    await enableEditMode(page);

    // Click the main title
    await page.locator('h1').first().click();

    // Sidebar should open
    const sidebar = page.locator('[data-testid="admin-sidebar"]');
    await expect(sidebar).toBeVisible({ timeout: 5000 });
  });

  test('clicking Get a Quote card opens editor', async ({ page }) => {
    await page.goto('/get-started');
    await expect(page.locator('h1').first()).toBeVisible();
    await enableEditMode(page);

    // Click the "Get a Quote" heading
    const quoteHeading = page.getByText('Get a Quote', { exact: true }).first();
    await quoteHeading.click();

    const sidebar = page.locator('[data-testid="admin-sidebar"]');
    await expect(sidebar).toBeVisible({ timeout: 5000 });
  });

  test('clicking Book a Consultation card opens editor', async ({ page }) => {
    await page.goto('/get-started');
    await expect(page.locator('h1').first()).toBeVisible();
    await enableEditMode(page);

    // Click the "Book a Consultation" heading
    const consultHeading = page.getByText('Book a Consultation', { exact: true }).first();
    await consultHeading.click();

    const sidebar = page.locator('[data-testid="admin-sidebar"]');
    await expect(sidebar).toBeVisible({ timeout: 5000 });
  });

  test('edit mode shows correct page in sidebar', async ({ page }) => {
    await page.goto('/get-started');
    await expect(page.locator('h1').first()).toBeVisible();
    await enableEditMode(page);

    // Click the title
    await page.locator('h1').first().click();

    // Check sidebar shows correct page context (not a different page like how-it-works)
    const sidebar = page.locator('[data-testid="admin-sidebar"]');
    await expect(sidebar).toBeVisible();

    // Should NOT show "how it works" or other wrong page
    await expect(sidebar).not.toContainText('how it works', { ignoreCase: true });
  });

  test('can edit multiple sections sequentially', async ({ page }) => {
    await page.goto('/get-started');
    await expect(page.locator('h1').first()).toBeVisible();
    await enableEditMode(page);

    // Click title first
    await page.locator('h1').first().click();
    const sidebar = page.locator('[data-testid="admin-sidebar"]');
    await expect(sidebar).toBeVisible();

    // Click a different section
    const alreadyHaveQuote = page.getByText('Already Have a Quote?').first();
    await alreadyHaveQuote.click();

    // Sidebar should still be open
    await expect(sidebar).toBeVisible();
  });
});
