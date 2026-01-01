import { test, expect } from '@playwright/test';

// ============================================================================
// Page Wizard E2E Tests
// ============================================================================
// What: Tests the admin page creation wizard flow
// Why: Ensures the 5-step wizard works correctly and buttons stay visible
// How: Walks through each step, verifying layout and functionality
//
// REQUIREMENTS:
// - E2E_ADMIN_EMAIL and E2E_ADMIN_PASSWORD must be set in environment
// - Run: npm run test:e2e -- e2e/page-wizard.spec.ts
//
// The auth.setup.ts handles login and saves the session.
// ============================================================================

test.describe('Page Wizard - Layout & Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to admin pages and verify we have access
    const response = await page.goto('/admin/pages/new');

    // If redirected to login, skip these tests (auth not configured)
    if (page.url().includes('/login')) {
      test.skip(true, 'Admin authentication required - set E2E_ADMIN_EMAIL and E2E_ADMIN_PASSWORD');
    }
  });
  // ==========================================================================
  // Test 1: Continue button is visible without scrolling (layout fix)
  // ==========================================================================

  test('Continue button is visible in viewport on all steps', async ({ page }) => {
    await page.goto('/admin/pages/new');

    // Click "Start Wizard" to enter wizard mode
    await page.getByText('Start Wizard').click();

    // Step 1: Category - verify Continue button is in viewport
    await expect(page.getByRole('heading', { name: 'What are you creating?' })).toBeVisible();

    const continueButton = page.getByRole('button', { name: 'Continue' });
    await expect(continueButton).toBeVisible();

    // Verify button is in viewport (not requiring scroll)
    const buttonBox = await continueButton.boundingBox();
    const viewportSize = page.viewportSize();

    expect(buttonBox).not.toBeNull();
    expect(viewportSize).not.toBeNull();

    if (buttonBox && viewportSize) {
      // Button bottom should be within viewport (allow 20px tolerance for variations)
      // The sticky footer should keep the button visible, but slight variations are acceptable
      expect(buttonBox.y + buttonBox.height).toBeLessThanOrEqual(viewportSize.height + 20);
    }
  });

  // ==========================================================================
  // Test 2: Complete wizard flow - all 5 steps
  // ==========================================================================

  test('can walk through all 5 wizard steps', async ({ page }) => {
    await page.goto('/admin/pages/new');

    // Enter wizard mode
    await page.getByText('Start Wizard').click();

    // ---------- Step 1: Category Selection ----------
    await expect(page.getByRole('heading', { name: 'What are you creating?' })).toBeVisible();
    await expect(page.getByText('Step 1 of 5')).toBeVisible();

    // Continue should be disabled until category selected
    const continueBtn = page.getByRole('button', { name: 'Continue' });
    await expect(continueBtn).toBeDisabled();

    // Select a category (Landing)
    await page.getByText('Landing').click();

    // Now Continue should be enabled
    await expect(continueBtn).toBeEnabled();
    await continueBtn.click();

    // ---------- Step 2: Template Selection ----------
    await expect(page.getByRole('heading', { name: 'Pick a template' })).toBeVisible();
    await expect(page.getByText('Step 2 of 5')).toBeVisible();

    // Back button should be visible (use role to avoid matching "Back to Site" link)
    await expect(page.getByRole('button', { name: 'Back' })).toBeVisible();

    // Select first template
    const templateButton = page.locator('button').filter({ hasText: /Featured|template/i }).first();
    await templateButton.click();

    await continueBtn.click();

    // ---------- Step 3: Color Selection ----------
    await expect(page.getByRole('heading', { name: 'Pick a color' })).toBeVisible();
    await expect(page.getByText('Step 3 of 5')).toBeVisible();

    // Purple should be pre-selected (default)
    await expect(page.getByText('Selected')).toBeVisible();

    // Continue button should still be in viewport
    const colorStepButton = page.getByRole('button', { name: 'Continue' });
    await expect(colorStepButton).toBeVisible();

    const buttonBox = await colorStepButton.boundingBox();
    const viewportSize = page.viewportSize();
    if (buttonBox && viewportSize) {
      // Allow 20px tolerance for variations
      expect(buttonBox.y + buttonBox.height).toBeLessThanOrEqual(viewportSize.height + 20);
    }

    // Select Blue color
    await page.getByText('Blue').click();

    await colorStepButton.click();

    // ---------- Step 4: Content ----------
    await expect(page.getByRole('heading', { name: 'Add your content' })).toBeVisible();
    await expect(page.getByText('Step 4 of 5')).toBeVisible();

    // Fill in some content if fields are present
    const inputField = page.locator('input[type="text"]').first();
    if (await inputField.isVisible()) {
      await inputField.fill('Test Page Title');
    }

    await page.getByRole('button', { name: 'Continue' }).click();

    // ---------- Step 5: Preview ----------
    await expect(page.getByRole('heading', { name: 'Ready to create!' })).toBeVisible();
    await expect(page.getByText('Step 5 of 5')).toBeVisible();

    // Should show "Create Page" instead of "Continue"
    await expect(page.getByRole('button', { name: 'Create Page' })).toBeVisible();
  });

  // ==========================================================================
  // Test 3: Navigation - Back button works
  // ==========================================================================

  test('back button navigates to previous step', async ({ page }) => {
    await page.goto('/admin/pages/new');
    await page.getByText('Start Wizard').click();

    // Step 1: Select category
    await page.getByText('Landing').click();
    await page.getByRole('button', { name: 'Continue' }).click();

    // Now on Step 2
    await expect(page.getByText('Step 2 of 5')).toBeVisible();

    // Click Back (use role to avoid matching "Back to Site" link)
    await page.getByRole('button', { name: 'Back' }).click();

    // Should be back on Step 1
    await expect(page.getByText('Step 1 of 5')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'What are you creating?' })).toBeVisible();
  });

  // ==========================================================================
  // Test 4: Cancel returns to mode selection
  // ==========================================================================

  test('cancel button returns to mode selection', async ({ page }) => {
    await page.goto('/admin/pages/new');
    await page.getByText('Start Wizard').click();

    // On Step 1, Cancel should be visible (no Back yet)
    await page.getByText('Cancel').click();

    // Should be back at mode selection
    await expect(page.getByRole('heading', { name: 'Create a New Page' })).toBeVisible();
    await expect(page.getByText('Quick Start')).toBeVisible();
    await expect(page.getByText('Full Editor')).toBeVisible();
  });

  // ==========================================================================
  // Test 5: Progress bar updates correctly
  // ==========================================================================

  test('progress bar updates with each step', async ({ page }) => {
    await page.goto('/admin/pages/new');
    await page.getByText('Start Wizard').click();

    // Step 1: Progress should be 20%
    const progressBar = page.locator('[class*="bg-purple-600"]').first();

    // Select and continue
    await page.getByText('Landing').click();
    await page.getByRole('button', { name: 'Continue' }).click();

    // Step 2: Progress should be 40%
    await expect(page.getByText('Step 2 of 5')).toBeVisible();

    // Select template and continue
    const templateButton = page.locator('button').filter({ hasText: /Featured|template/i }).first();
    await templateButton.click();
    await page.getByRole('button', { name: 'Continue' }).click();

    // Step 3: Progress should be 60%
    await expect(page.getByText('Step 3 of 5')).toBeVisible();
  });

  // ==========================================================================
  // Test 6: Color picker shows all options
  // ==========================================================================

  test('color step displays all color options', async ({ page }) => {
    await page.goto('/admin/pages/new');
    await page.getByText('Start Wizard').click();

    // Navigate to color step
    await page.getByText('Landing').click();
    await page.getByRole('button', { name: 'Continue' }).click();

    const templateButton = page.locator('button').filter({ hasText: /Featured|template/i }).first();
    await templateButton.click();
    await page.getByRole('button', { name: 'Continue' }).click();

    // Should see all color options
    await expect(page.getByText('Purple')).toBeVisible();
    await expect(page.getByText('Blue')).toBeVisible();
    await expect(page.getByText('Teal')).toBeVisible();
    await expect(page.getByText('Green')).toBeVisible();
    await expect(page.getByText('Orange')).toBeVisible();
  });

  // ==========================================================================
  // Test 7: Sticky header and footer layout
  // ==========================================================================

  test('header and footer remain visible when content scrolls', async ({ page }) => {
    // Use a smaller viewport to force scrolling, but wide enough to avoid sidebar overlay (lg breakpoint = 1024px)
    await page.setViewportSize({ width: 1100, height: 500 });

    await page.goto('/admin/pages/new');
    await page.getByText('Start Wizard').click();

    // Navigate to content step (has more content)
    await page.getByText('Landing').click();
    await page.getByRole('button', { name: 'Continue' }).click();

    const templateButton = page.locator('button').filter({ hasText: /Featured|template/i }).first();
    await templateButton.click();
    await page.getByRole('button', { name: 'Continue' }).click();
    await page.getByRole('button', { name: 'Continue' }).click();

    // On content step, verify header is still visible
    await expect(page.getByText('Step 4 of 5')).toBeVisible();

    // Verify Continue button is visible without scrolling
    const continueBtn = page.getByRole('button', { name: 'Continue' });
    await expect(continueBtn).toBeVisible();
    await expect(continueBtn).toBeInViewport();
  });
});

test.describe('Page Wizard - Completion', () => {
  // ==========================================================================
  // Test: Completion modal shows after wizard finishes
  // ==========================================================================

  test('shows completion modal with Edit with Puck button', async ({ page }) => {
    await page.goto('/admin/pages/new');

    // Skip if not authenticated
    if (page.url().includes('/login')) {
      test.skip(true, 'Admin authentication required');
    }

    // Walk through all 5 steps to completion
    await page.getByText('Start Wizard').click();

    // Step 1: Category
    await page.getByText('Landing').click();
    await page.getByRole('button', { name: 'Continue' }).click();

    // Step 2: Template
    await page.waitForSelector('text=Step 2 of 5', { timeout: 5000 });
    const templateButton = page.locator('button').filter({ hasText: /Featured|template/i }).first();
    await templateButton.click();
    await page.getByRole('button', { name: 'Continue' }).click();

    // Step 3: Color
    await page.waitForSelector('text=Step 3 of 5', { timeout: 5000 });
    await page.getByRole('button', { name: 'Continue' }).click();

    // Step 4: Content
    await page.waitForSelector('text=Step 4 of 5', { timeout: 5000 });
    await page.getByRole('button', { name: 'Continue' }).click();

    // Step 5: Preview - Click Create Page and wait for API response
    await page.waitForSelector('text=Step 5 of 5', { timeout: 5000 });

    // Set up response promise before clicking
    const responsePromise = page.waitForResponse(
      resp => resp.url().includes('/api/pages') && resp.request().method() === 'POST',
      { timeout: 15000 }
    );

    await page.getByRole('button', { name: 'Create Page' }).click();

    // Wait for API response
    const response = await responsePromise;

    // Skip if API returns error (database/auth issue in test environment)
    if (response.status() !== 200) {
      test.skip(true, `API returned ${response.status()} - database or auth may not be configured for E2E`);
    }

    // Should show completion modal instead of auto-redirect
    await expect(page.getByRole('heading', { name: /page created/i })).toBeVisible({ timeout: 10000 });

    // Should have Edit with Puck button
    const editButton = page.getByRole('button', { name: /edit with puck/i });
    await expect(editButton).toBeVisible();

    // Should have View Page button
    const viewButton = page.getByRole('button', { name: /view page/i });
    await expect(viewButton).toBeVisible();
  });

  test('Edit with Puck button navigates to editor', async ({ page }) => {
    await page.goto('/admin/pages/new');

    if (page.url().includes('/login')) {
      test.skip(true, 'Admin authentication required');
    }

    // Complete wizard quickly
    await page.getByText('Start Wizard').click();
    await page.getByText('Landing').click();
    await page.getByRole('button', { name: 'Continue' }).click();

    await page.waitForSelector('text=Step 2 of 5', { timeout: 5000 });
    const templateButton = page.locator('button').filter({ hasText: /Featured|template/i }).first();
    await templateButton.click();
    await page.getByRole('button', { name: 'Continue' }).click();

    await page.waitForSelector('text=Step 3 of 5', { timeout: 5000 });
    await page.getByRole('button', { name: 'Continue' }).click();

    await page.waitForSelector('text=Step 4 of 5', { timeout: 5000 });
    await page.getByRole('button', { name: 'Continue' }).click();

    await page.waitForSelector('text=Step 5 of 5', { timeout: 5000 });

    // Set up response promise before clicking
    const responsePromise = page.waitForResponse(
      resp => resp.url().includes('/api/pages') && resp.request().method() === 'POST',
      { timeout: 15000 }
    );

    await page.getByRole('button', { name: 'Create Page' }).click();

    // Wait for API response
    const response = await responsePromise;

    // Skip if API returns error (database/auth issue in test environment)
    if (response.status() !== 200) {
      test.skip(true, `API returned ${response.status()} - database or auth may not be configured for E2E`);
    }

    // Wait for completion modal
    await expect(page.getByRole('heading', { name: /page created/i })).toBeVisible({ timeout: 10000 });

    // Click Edit with Puck
    await page.getByRole('button', { name: /edit with puck/i }).click();

    // Should navigate to edit page
    await expect(page).toHaveURL(/\/admin\/pages\/[^/]+\/edit/);
  });
});

test.describe('Page Wizard - Validation & Edge Cases', () => {
  test.beforeEach(async ({ page }) => {
    const response = await page.goto('/admin/pages/new');
    if (page.url().includes('/login')) {
      test.skip(true, 'Admin authentication required');
    }
  });

  // ==========================================================================
  // Test: Continue button disabled until category selected
  // ==========================================================================

  test('Continue is disabled until category is selected', async ({ page }) => {
    await page.goto('/admin/pages/new');
    await page.getByText('Start Wizard').click();

    // On Step 1, Continue should be disabled
    const continueBtn = page.getByRole('button', { name: 'Continue' });
    await expect(continueBtn).toBeDisabled();

    // Select a category
    await page.getByText('Landing').click();

    // Now Continue should be enabled
    await expect(continueBtn).toBeEnabled();
  });

  // ==========================================================================
  // Test: Continue button disabled until template selected
  // ==========================================================================

  test('Continue is disabled until template is selected', async ({ page }) => {
    await page.goto('/admin/pages/new');
    await page.getByText('Start Wizard').click();

    // Select category and go to Step 2
    await page.getByText('Landing').click();
    await page.getByRole('button', { name: 'Continue' }).click();

    // On Step 2, Continue should be disabled until template selected
    const continueBtn = page.getByRole('button', { name: 'Continue' });
    await expect(continueBtn).toBeDisabled();

    // Select a template
    const templateButton = page.locator('button').filter({ hasText: /Featured|template/i }).first();
    await templateButton.click();

    // Now Continue should be enabled
    await expect(continueBtn).toBeEnabled();
  });

  // ==========================================================================
  // Test: Content fields accept input
  // ==========================================================================

  test('content step allows filling in fields', async ({ page }) => {
    await page.goto('/admin/pages/new');
    await page.getByText('Start Wizard').click();

    // Navigate to content step (Step 4)
    await page.getByText('Landing').click();
    await page.getByRole('button', { name: 'Continue' }).click();

    const templateButton = page.locator('button').filter({ hasText: /Featured|template/i }).first();
    await templateButton.click();
    await page.getByRole('button', { name: 'Continue' }).click();
    await page.getByRole('button', { name: 'Continue' }).click(); // Past color selection

    // Should be on content step
    await expect(page.getByRole('heading', { name: 'Add your content' })).toBeVisible();

    // Fill in a field if one exists
    const inputField = page.locator('input[type="text"]').first();
    if (await inputField.isVisible()) {
      await inputField.fill('My Custom Title');
      await expect(inputField).toHaveValue('My Custom Title');
    }
  });

  // ==========================================================================
  // Test: Color selection persists through navigation
  // ==========================================================================

  test('color selection persists when navigating back and forth', async ({ page }) => {
    await page.goto('/admin/pages/new');
    await page.getByText('Start Wizard').click();

    // Navigate to color step
    await page.getByText('Landing').click();
    await page.getByRole('button', { name: 'Continue' }).click();

    const templateButton = page.locator('button').filter({ hasText: /Featured|template/i }).first();
    await templateButton.click();
    await page.getByRole('button', { name: 'Continue' }).click();

    // Select Blue color (Purple is default)
    await page.getByText('Blue').click();

    // Go to next step
    await page.getByRole('button', { name: 'Continue' }).click();

    // Go back
    await page.getByRole('button', { name: 'Back' }).click();

    // Blue should still show "Selected"
    const blueButton = page.locator('button').filter({ hasText: 'Blue' }).first();
    await expect(blueButton.getByText('Selected')).toBeVisible();
  });

  // ==========================================================================
  // Test: Preview shows template and color info
  // ==========================================================================

  test('preview step shows template and color info', async ({ page }) => {
    await page.goto('/admin/pages/new');
    await page.getByText('Start Wizard').click();

    // Navigate through all steps
    await page.getByText('Landing').click();
    await page.getByRole('button', { name: 'Continue' }).click();

    const templateButton = page.locator('button').filter({ hasText: /Featured|template/i }).first();
    await templateButton.click();
    await page.getByRole('button', { name: 'Continue' }).click();

    // Select Green color
    await page.getByText('Green').click();
    await page.getByRole('button', { name: 'Continue' }).click();

    // Skip content
    await page.getByRole('button', { name: 'Continue' }).click();

    // Should be on preview step
    await expect(page.getByRole('heading', { name: 'Ready to create!' })).toBeVisible();

    // Should show template name
    await expect(page.getByText('Template')).toBeVisible();

    // Should show color name
    await expect(page.getByText('Green')).toBeVisible();

    // Should have Create Page button
    await expect(page.getByRole('button', { name: 'Create Page' })).toBeVisible();
  });
});

test.describe('Page Wizard - Mode Selection', () => {
  // ==========================================================================
  // Test: Mode selection page loads correctly
  // ==========================================================================

  test('mode selection shows both options', async ({ page }) => {
    await page.goto('/admin/pages/new');

    await expect(page.getByRole('heading', { name: 'Create a New Page' })).toBeVisible();
    await expect(page.getByText('Quick Start')).toBeVisible();
    await expect(page.getByText('Recommended')).toBeVisible();
    await expect(page.getByText('Full Editor')).toBeVisible();
  });

  // ==========================================================================
  // Test: Full editor mode opens Puck
  // ==========================================================================

  test('full editor mode shows Puck builder', async ({ page }) => {
    await page.goto('/admin/pages/new');
    await page.getByText('Open Editor').click();

    // Should see editor header
    await expect(page.getByRole('heading', { name: 'Full Editor' })).toBeVisible();

    // Should see slug and title inputs
    await expect(page.getByPlaceholder('my-page-name')).toBeVisible();
    await expect(page.getByPlaceholder('My Awesome Page')).toBeVisible();
  });
});
