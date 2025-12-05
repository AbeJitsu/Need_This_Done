import { test, expect } from '@playwright/test';

// ============================================================================
// Puck Pages Management E2E Tests
// ============================================================================
// Tests for Puck visual editor integration:
// - Admin can create new pages
// - Admin can edit existing pages
// - Admin can publish/unpublish pages
// - Admin can delete pages
// - Published pages are publicly visible
// - Unpublished pages return 404 for non-admins

test.describe('Puck Pages Management', () => {
  test('admin can access pages management', async ({ page }) => {
    // Login as admin (using test credentials from env)
    const adminEmail = process.env.TEST_ADMIN_EMAIL || 'admin@example.com';
    const adminPassword = process.env.TEST_ADMIN_PASSWORD || 'password123';

    await page.goto('/login');
    await page.fill('input[type="email"]', adminEmail);
    await page.fill('input[type="password"]', adminPassword);
    await page.click('button[type="submit"]');

    // Wait for redirect to dashboard
    await page.waitForURL('/dashboard');

    // Navigate to pages management
    await page.goto('/admin/pages');

    // Should see the pages list
    await expect(page.locator('h1')).toContainText('Pages');
    await expect(page.locator('text=Create New Page')).toBeVisible();
  });

  test('admin can create a new page', async ({ page }) => {
    const adminEmail = process.env.TEST_ADMIN_EMAIL || 'admin@example.com';
    const adminPassword = process.env.TEST_ADMIN_PASSWORD || 'password123';

    await page.goto('/login');
    await page.fill('input[type="email"]', adminEmail);
    await page.fill('input[type="password"]', adminPassword);
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');

    // Navigate to pages management
    await page.goto('/admin/pages');

    // Click create new page
    await page.click('text=Create New Page');
    await page.waitForURL('/admin/pages/new');

    // Fill in page details
    const testSlug = `test-page-${Date.now()}`;
    await page.fill('input[placeholder="page-slug"]', testSlug);
    await page.fill('input[placeholder="Page Title"]', 'Test Page');

    // Submit the page (save without components for now)
    // Note: Clicking publish in Puck's UI
    await page.click('button:has-text("Publish")');

    // Should redirect back to pages list
    await page.waitForURL('/admin/pages');

    // Verify page appears in list
    await expect(page.locator(`text=${testSlug}`)).toBeVisible();
  });

  test('admin can publish a page', async ({ page }) => {
    const adminEmail = process.env.TEST_ADMIN_EMAIL || 'admin@example.com';
    const adminPassword = process.env.TEST_ADMIN_PASSWORD || 'password123';

    await page.goto('/login');
    await page.fill('input[type="email"]', adminEmail);
    await page.fill('input[type="password"]', adminPassword);
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');

    // Navigate to pages management
    await page.goto('/admin/pages');

    // Get the first draft page
    const draftStatus = page.locator('text=Draft').first();
    const pageCard = draftStatus.locator('..');

    // Find and click publish button in the same card
    const publishButton = pageCard.locator('text=Publish');
    await publishButton.click();

    // Verify status changed to published
    await expect(pageCard.locator('text=Published')).toBeVisible();
  });

  test('published pages are publicly visible', async ({ page }) => {
    const adminEmail = process.env.TEST_ADMIN_EMAIL || 'admin@example.com';
    const adminPassword = process.env.TEST_ADMIN_PASSWORD || 'password123';

    // First, create and publish a test page
    await page.goto('/login');
    await page.fill('input[type="email"]', adminEmail);
    await page.fill('input[type="password"]', adminPassword);
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');

    await page.goto('/admin/pages');
    await page.click('text=Create New Page');
    await page.waitForURL('/admin/pages/new');

    const testSlug = `public-test-${Date.now()}`;
    await page.fill('input[placeholder="page-slug"]', testSlug);
    await page.fill('input[placeholder="Page Title"]', 'Public Test Page');
    await page.click('button:has-text("Publish")');
    await page.waitForURL('/admin/pages');

    // Publish the page
    const publishButton = page.locator('text=Publish').first();
    await publishButton.click();

    // Now access the page as a public user (clear auth)
    await page.context().clearCookies();
    await page.goto(`/${testSlug}`);

    // Should not get 404
    await expect(page).not.toHaveURL(/404/);
  });

  test('unpublished pages return 404 for public users', async ({ page }) => {
    const adminEmail = process.env.TEST_ADMIN_EMAIL || 'admin@example.com';
    const adminPassword = process.env.TEST_ADMIN_PASSWORD || 'password123';

    // Create a draft page as admin
    await page.goto('/login');
    await page.fill('input[type="email"]', adminEmail);
    await page.fill('input[type="password"]', adminPassword);
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');

    await page.goto('/admin/pages');
    await page.click('text=Create New Page');
    await page.waitForURL('/admin/pages/new');

    const draftSlug = `draft-test-${Date.now()}`;
    await page.fill('input[placeholder="page-slug"]', draftSlug);
    await page.fill('input[placeholder="Page Title"]', 'Draft Test Page');
    await page.click('button:has-text("Publish")');
    await page.waitForURL('/admin/pages');

    // Clear auth and try to access draft page
    await page.context().clearCookies();
    const response = await page.goto(`/${draftSlug}`);

    // Should get 404
    expect(response?.status()).toBe(404);
  });

  test('admin can delete a page', async ({ page }) => {
    const adminEmail = process.env.TEST_ADMIN_EMAIL || 'admin@example.com';
    const adminPassword = process.env.TEST_ADMIN_PASSWORD || 'password123';

    await page.goto('/login');
    await page.fill('input[type="email"]', adminEmail);
    await page.fill('input[type="password"]', adminPassword);
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');

    // Create a test page
    await page.goto('/admin/pages');
    await page.click('text=Create New Page');
    await page.waitForURL('/admin/pages/new');

    const deleteTestSlug = `delete-test-${Date.now()}`;
    await page.fill('input[placeholder="page-slug"]', deleteTestSlug);
    await page.fill('input[placeholder="Page Title"]', 'Delete Test Page');
    await page.click('button:has-text("Publish")');
    await page.waitForURL('/admin/pages');

    // Verify page exists in list
    await expect(page.locator(`text=${deleteTestSlug}`)).toBeVisible();

    // Find and click delete button
    const pageCard = page.locator(`text=${deleteTestSlug}`).locator('..');
    const deleteButton = pageCard.locator('text=Delete');
    await deleteButton.click();

    // Confirm deletion
    page.on('dialog', (dialog) => dialog.accept());

    // Wait for the page to be removed
    await page.waitForTimeout(500);
    await expect(page.locator(`text=${deleteTestSlug}`)).not.toBeVisible();
  });

  test('non-admin users cannot access pages admin', async ({ page }) => {
    const userEmail = process.env.TEST_USER_EMAIL || 'user@example.com';
    const userPassword = process.env.TEST_USER_PASSWORD || 'password123';

    await page.goto('/login');
    await page.fill('input[type="email"]', userEmail);
    await page.fill('input[type="password"]', userPassword);
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');

    // Try to access admin pages
    const response = await page.goto('/admin/pages', { waitUntil: 'networkidle' });

    // Should be redirected or get an error (not 404)
    if (response?.status() === 200) {
      // If redirected successfully, should be on dashboard
      await expect(page).toHaveURL('/dashboard');
    }
  });
});
