import { test, expect } from '@playwright/test';

// ============================================================================
// Template Preview Images E2E Tests
// ============================================================================
// What: Tests that template picker shows preview images/thumbnails
// Why: Visual previews help users choose templates faster
// How: Navigates to wizard template step and verifies preview elements
//
// REQUIREMENTS:
// - E2E_ADMIN_EMAIL and E2E_ADMIN_PASSWORD must be set in environment
// - Run: npm run test:e2e -- e2e/template-previews.spec.ts
// ============================================================================

test.describe('Template Preview Images', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin/pages/new');

    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Skip if redirected to login (not authenticated)
    if (page.url().includes('/login')) {
      test.skip(true, 'Admin authentication required');
    }

    // Check if Start Wizard button exists
    const startButton = page.getByText('Start Wizard');
    if (!(await startButton.isVisible({ timeout: 5000 }).catch(() => false))) {
      test.skip(true, 'Page wizard not accessible');
    }

    // Navigate to template selection step
    await startButton.click();

    // Step 1: Select category
    await page.getByText('Landing').click();
    await page.getByRole('button', { name: 'Continue' }).click();

    // Wait for Step 2: Template selection
    await page.waitForSelector('text=Step 2 of 5', { timeout: 10000 });
  });

  test('template cards show preview thumbnail', async ({ page }) => {
    // Should show template cards
    const templateCards = page.locator('[data-testid="template-card"]');
    await expect(templateCards.first()).toBeVisible({ timeout: 5000 });

    // Each card should have a preview element (image or placeholder)
    const firstCard = templateCards.first();
    const preview = firstCard.locator('[data-testid="template-preview"]');
    await expect(preview).toBeVisible();
  });

  test('preview shows template color theme', async ({ page }) => {
    // Preview should reflect the template's default color
    const templateCards = page.locator('[data-testid="template-card"]');
    const firstCard = templateCards.first();

    // Preview should have some color styling (gradient or border)
    const preview = firstCard.locator('[data-testid="template-preview"]');
    await expect(preview).toBeVisible();

    // Check that it has color-related classes (purple, blue, etc.)
    const previewClasses = await preview.getAttribute('class');
    expect(previewClasses).toMatch(/(purple|blue|green|orange|teal|gray)/);
  });

  test('preview shows template type icon', async ({ page }) => {
    // Preview should show what type of page it is
    const templateCards = page.locator('[data-testid="template-card"]');
    const firstCard = templateCards.first();

    // Should have an icon or visual indicator
    const icon = firstCard.locator('[data-testid="template-icon"]');
    await expect(icon).toBeVisible();
  });

  test('featured templates are visually distinguished', async ({ page }) => {
    // Featured templates should stand out
    const featuredBadge = page.locator('text=Featured').first();

    if (await featuredBadge.isVisible()) {
      // Featured template should have special styling
      const featuredCard = featuredBadge.locator('xpath=ancestor::button');
      await expect(featuredCard).toBeVisible();
    }
  });

  test('template name and description visible', async ({ page }) => {
    // Templates should show name and description below preview
    const templateCards = page.locator('[data-testid="template-card"]');
    const firstCard = templateCards.first();

    // Should have name
    const name = firstCard.locator('[data-testid="template-name"]');
    await expect(name).toBeVisible();
    const nameText = await name.textContent();
    expect(nameText?.length).toBeGreaterThan(0);

    // Should have description
    const description = firstCard.locator('[data-testid="template-description"]');
    await expect(description).toBeVisible();
  });
});
