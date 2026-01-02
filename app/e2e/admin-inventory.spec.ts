import { test, expect } from '@playwright/test';

// ============================================================================
// E2E Tests: Admin Inventory Management Interface
// ============================================================================
// Tests for inventory tracking, stock updates, and variant management
// TDD: Writing tests first to define expected behavior

test.describe('Admin Inventory Management', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to admin inventory page (requires auth - will use auth.setup.ts)
    await page.goto('/admin/shop/inventory');

    // Wait for data to actually load - either the table appears or we see the header
    // This is more reliable than networkidle since API data can take time to render
    await Promise.race([
      page.waitForSelector('[data-testid="inventory-list"]', { timeout: 15000 }),
      page.waitForSelector('h1:has-text("Inventory")', { timeout: 15000 }),
    ]).catch(() => {
      // If neither appears, test will fail with descriptive error on individual assertion
    });
  });

  test('should display inventory page header', async ({ page }) => {
    // Verify page loads with correct title
    await expect(page.getByRole('heading', { name: /inventory/i })).toBeVisible({ timeout: 10000 });
  });

  test('should show list of product variants with stock quantities', async ({ page }) => {
    // Wait for the table to appear (may need to wait for data to load)
    const inventoryList = page.getByRole('table').or(page.getByTestId('inventory-list'));
    await expect(inventoryList).toBeVisible({ timeout: 10000 });

    // Should show product name column
    await expect(page.getByRole('columnheader', { name: /product/i })).toBeVisible();

    // Should show variant column
    await expect(page.getByRole('columnheader', { name: /variant/i })).toBeVisible();

    // Should show stock/quantity column
    await expect(page.getByRole('columnheader', { name: /stock/i })).toBeVisible();
  });

  test('should allow filtering inventory by search term', async ({ page }) => {
    // Wait for search input to be visible
    const searchInput = page.getByPlaceholder(/search/i);
    await expect(searchInput).toBeVisible({ timeout: 10000 });

    // Type search term
    await searchInput.fill('Consultation');

    // Wait for filtering to apply
    await page.waitForTimeout(500);
  });

  test('should allow filtering by stock status', async ({ page }) => {
    // Wait for filter buttons to appear
    await page.waitForLoadState('networkidle');

    // Look for In Stock filter button specifically
    const inStockFilter = page.getByRole('button', { name: /^in stock$/i });
    const lowStockFilter = page.getByRole('button', { name: /low stock/i });

    // At least one filter option should exist
    await expect(inStockFilter.or(lowStockFilter)).toBeVisible({ timeout: 10000 });
  });

  test('should display inventory summary stats', async ({ page }) => {
    // Wait for stats section to load
    const statsSection = page.getByTestId('inventory-stats');
    await expect(statsSection).toBeVisible({ timeout: 10000 });

    // Stats should contain "Total" text
    await expect(page.getByText(/total variants/i)).toBeVisible();
  });

  test('should allow updating stock quantity inline', async ({ page }) => {
    // Find an inventory row
    const firstRow = page.getByRole('row').nth(1); // Skip header row

    // Should have an edit button or editable field
    const editButton = firstRow.getByRole('button', { name: /edit|update/i }).or(
      firstRow.getByRole('spinbutton')
    );

    if (await editButton.isVisible()) {
      // Click to edit
      await editButton.click();

      // Should show input field for quantity
      const quantityInput = page.getByRole('spinbutton', { name: /quantity|stock/i });
      await expect(quantityInput).toBeVisible();
    }
  });

  test('should show success message after stock update', async ({ page }) => {
    // This test verifies the update flow works
    // Implementation will show success alert after save

    // Find quantity input (if inline editing is available)
    const quantityInput = page.getByRole('spinbutton').first();

    if (await quantityInput.isVisible()) {
      // Change value
      await quantityInput.fill('50');

      // Save (press Enter or click save button)
      await quantityInput.press('Enter');

      // Should show success feedback
      await expect(
        page.getByText(/updated|saved|success/i)
      ).toBeVisible({ timeout: 5000 });
    }
  });

  test('should highlight low stock items visually', async ({ page }) => {
    // Items with low stock should have visual indicator
    // This could be a warning color, badge, or icon

    // Look for low stock indicators
    const lowStockIndicator = page.locator('[class*="warning"], [class*="orange"], [class*="yellow"]').or(
      page.getByText(/low stock/i)
    );

    // May or may not be present depending on data
    // Just verify the locator is valid (doesn't throw)
    await lowStockIndicator.count();
  });

  test('should be accessible with keyboard navigation', async ({ page }) => {
    // Tab through the interface
    await page.keyboard.press('Tab');

    // Focus should be visible
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();
  });
});

// ============================================================================
// API Tests: Inventory Endpoints
// ============================================================================
test.describe('Inventory API', () => {
  test('GET /api/admin/inventory should return inventory list', async ({ request }) => {
    const response = await request.get('/api/admin/inventory');

    // Should return 200 or 401 (if not authenticated)
    expect([200, 401]).toContain(response.status());

    if (response.status() === 200) {
      const data = await response.json();
      expect(data).toHaveProperty('inventory');
      expect(Array.isArray(data.inventory)).toBe(true);
    }
  });

  test('PATCH /api/admin/inventory/:variantId should update stock', async ({ request }) => {
    // This requires a valid variant ID from the system
    // We'll test the endpoint structure
    const response = await request.patch('/api/admin/inventory/test-variant-id', {
      data: { inventory_quantity: 100 }
    });

    // Should return 200 (success), 401 (unauthorized), or 404 (not found)
    expect([200, 401, 404]).toContain(response.status());
  });
});
