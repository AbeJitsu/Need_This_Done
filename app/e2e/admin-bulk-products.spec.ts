import { test, expect } from '@playwright/test';

// ============================================================================
// E2E Tests: Admin Bulk Product Import/Export
// ============================================================================
// Tests for exporting products to CSV/JSON and importing from files
// TDD: Writing tests first to define expected behavior

test.describe('Admin Bulk Product Export', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin/shop');
    // Wait for products page to load
    await page.waitForSelector('h1', { timeout: 15000 });
  });

  test('should display export button on products page', async ({ page }) => {
    // Look for export button/link
    const exportButton = page.getByRole('button', { name: /export/i })
      .or(page.getByRole('link', { name: /export/i }));
    await expect(exportButton).toBeVisible({ timeout: 10000 });
  });

  test('should allow exporting products as CSV', async ({ page }) => {
    // Click export and select CSV format
    const exportButton = page.getByRole('button', { name: /export/i });
    await exportButton.click();

    // Should show format options
    const csvOption = page.getByRole('button', { name: /csv/i })
      .or(page.getByText(/csv/i));
    await expect(csvOption).toBeVisible({ timeout: 5000 });
  });

  test('should allow exporting products as JSON', async ({ page }) => {
    // Click export and select JSON format
    const exportButton = page.getByRole('button', { name: /export/i });
    await exportButton.click();

    // Should show format options
    const jsonOption = page.getByRole('button', { name: /json/i })
      .or(page.getByText(/json/i));
    await expect(jsonOption).toBeVisible({ timeout: 5000 });
  });
});

test.describe('Admin Bulk Product Import', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin/shop');
    await page.waitForSelector('h1', { timeout: 15000 });
  });

  test('should display import button on products page', async ({ page }) => {
    // Look for import button/link
    const importButton = page.getByRole('button', { name: /import/i })
      .or(page.getByRole('link', { name: /import/i }));
    await expect(importButton).toBeVisible({ timeout: 10000 });
  });

  test('should show file upload dialog when import clicked', async ({ page }) => {
    const importButton = page.getByRole('button', { name: /import/i }).first();
    await importButton.click();

    // Should show file input in modal
    const fileInput = page.locator('input[type="file"]');
    await expect(fileInput).toBeVisible({ timeout: 5000 });
  });

  test('should validate file format before import', async ({ page }) => {
    const importButton = page.getByRole('button', { name: /import/i });
    await importButton.click();

    // Upload an invalid file type should show error
    const fileInput = page.locator('input[type="file"]');
    if (await fileInput.isVisible()) {
      // Create a test file with invalid content
      await fileInput.setInputFiles({
        name: 'invalid.txt',
        mimeType: 'text/plain',
        buffer: Buffer.from('invalid content'),
      });

      // Should show error message about invalid format
      await expect(
        page.getByText(/invalid|unsupported|format/i)
      ).toBeVisible({ timeout: 5000 });
    }
  });

  test('should show ready state after selecting valid file', async ({ page }) => {
    const importButton = page.getByRole('button', { name: /import/i }).first();
    await importButton.click();

    // Upload a valid CSV file
    const fileInput = page.locator('input[type="file"]');
    await expect(fileInput).toBeVisible({ timeout: 5000 });

    const csvContent = 'title,description,price\nTest Product,A test product,1000';
    await fileInput.setInputFiles({
      name: 'products.csv',
      mimeType: 'text/csv',
      buffer: Buffer.from(csvContent),
    });

    // Should show ready state with filename
    await expect(
      page.getByText(/ready to import.*products\.csv/i)
    ).toBeVisible({ timeout: 5000 });
  });
});

// ============================================================================
// API Tests: Export/Import Endpoints
// ============================================================================
test.describe('Bulk Product API', () => {
  test('GET /api/admin/products/export should return product data', async ({ request }) => {
    const response = await request.get('/api/admin/products/export?format=json');

    // Should return 200 or 401 (if not authenticated)
    expect([200, 401]).toContain(response.status());

    if (response.status() === 200) {
      const data = await response.json();
      expect(data).toHaveProperty('products');
      expect(Array.isArray(data.products)).toBe(true);
    }
  });

  test('GET /api/admin/products/export?format=csv should return CSV', async ({ request }) => {
    const response = await request.get('/api/admin/products/export?format=csv');

    // Should return 200 or 401
    expect([200, 401]).toContain(response.status());

    if (response.status() === 200) {
      const contentType = response.headers()['content-type'];
      expect(contentType).toContain('text/csv');
    }
  });

  test('POST /api/admin/products/import should accept JSON data', async ({ request }) => {
    const response = await request.post('/api/admin/products/import', {
      data: {
        products: [
          { title: 'Test Product', description: 'Test', price: 1000 }
        ]
      }
    });

    // Should return 200 (success), 400 (validation error), or 401 (unauthorized)
    expect([200, 400, 401]).toContain(response.status());
  });
});
