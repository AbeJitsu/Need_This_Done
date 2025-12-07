import { test, expect } from '@playwright/test';

// ============================================================================
// Shop Variants E2E Tests
// ============================================================================
// Tests to ensure product variants work correctly in the shop
// Validates the complete add-to-cart flow with variant selection

test.describe('Product Variants - Add to Cart Workflow', () => {
  test('products display on shop page without variant errors', async ({ page }) => {
    await page.goto('/shop');

    // Wait for products to load
    await expect(page.getByText('Quick Task')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('Standard Project')).toBeVisible();
    await expect(page.getByText('Premium Solution')).toBeVisible();

    // Verify no variant errors displayed
    await expect(page.getByText('No variants available')).not.toBeVisible();
  });

  test('can add Quick Task to cart from shop page', async ({ page }) => {
    await page.goto('/shop');

    // Wait for products to load
    await expect(page.getByText('Quick Task')).toBeVisible({ timeout: 10000 });

    // Find Quick Task card and click Add Cart button
    const quickTaskSection = page.locator('text=Quick Task').first();
    const addButton = quickTaskSection.locator('..').locator('button', { hasText: /add cart/i });

    await addButton.click();

    // Should see success message (toast notification)
    await expect(page.getByText(/added.*to cart/i)).toBeVisible({ timeout: 5000 });
  });

  test('product detail page shows variant dropdown', async ({ page }) => {
    await page.goto('/shop');

    // Wait for products and click Details on Quick Task
    await expect(page.getByText('Quick Task')).toBeVisible({ timeout: 10000 });

    const quickTaskSection = page.locator('text=Quick Task').first();
    const detailsLink = quickTaskSection.locator('..').locator('a, button', { hasText: /details/i });

    await detailsLink.click();

    // Should navigate to product detail page
    await expect(page).toHaveURL(/\/shop\/prod_1/);

    // Should show variant selector
    await expect(page.getByText('Select Variant')).toBeVisible({ timeout: 5000 });

    // Dropdown should have Standard variant
    const variantSelect = page.locator('select').first();
    await expect(variantSelect).toBeVisible();
    await expect(variantSelect).toContainText('Standard');
  });

  test('can add product from detail page with variant', async ({ page }) => {
    await page.goto('/shop/prod_1');

    // Should show variant selector
    await expect(page.getByText('Select Variant')).toBeVisible({ timeout: 5000 });

    // Select should have variant_prod_1_default pre-selected
    const variantSelect = page.locator('select').first();
    const selectedValue = await variantSelect.inputValue();
    expect(selectedValue).toContain('variant_prod_1_default');

    // Click Add to Cart button
    await page.getByRole('button', { name: /add to cart/i }).click();

    // Should show success message
    await expect(page.getByText(/added.*to cart/i)).toBeVisible({ timeout: 5000 });
  });

  test('can add multiple different products to cart', async ({ page }) => {
    await page.goto('/shop');

    // Wait for products to load
    await expect(page.getByText('Quick Task')).toBeVisible({ timeout: 10000 });

    // Add Quick Task
    let section = page.locator('text=Quick Task').first();
    let addBtn = section.locator('..').locator('button', { hasText: /add cart/i });
    await addBtn.click();
    await expect(page.getByText(/added.*to cart/i)).toBeVisible({ timeout: 5000 });

    // Add Standard Project
    section = page.locator('text=Standard Project').first();
    addBtn = section.locator('..').locator('button', { hasText: /add cart/i });
    await addBtn.click();
    await expect(page.getByText(/added.*to cart/i)).toBeVisible({ timeout: 5000 });

    // Add Premium Solution
    section = page.locator('text=Premium Solution').first();
    addBtn = section.locator('..').locator('button', { hasText: /add cart/i });
    await addBtn.click();
    await expect(page.getByText(/added.*to cart/i)).toBeVisible({ timeout: 5000 });
  });

  test('cart displays added products correctly', async ({ page }) => {
    // Add a product to cart
    await page.goto('/shop');
    await expect(page.getByText('Quick Task')).toBeVisible({ timeout: 10000 });

    const section = page.locator('text=Quick Task').first();
    const addBtn = section.locator('..').locator('button', { hasText: /add cart/i });
    await addBtn.click();
    await expect(page.getByText(/added.*to cart/i)).toBeVisible({ timeout: 5000 });

    // Navigate to cart
    await page.goto('/cart');

    // Verify item appears in cart
    await expect(page.getByText('Quick Task')).toBeVisible({ timeout: 5000 });
    await expect(page.getByText('$50')).toBeVisible();
  });

  test('standard variant is selected by default', async ({ page }) => {
    await page.goto('/shop/prod_2');

    // Standard variant should be pre-selected
    const variantSelect = page.locator('select').first();
    const selectedText = await variantSelect.locator('option[selected]').textContent();

    expect(selectedText).toContain('Standard');
  });

  test('can adjust quantity before adding to cart', async ({ page }) => {
    await page.goto('/shop/prod_1');

    // Should show quantity selector
    await expect(page.getByText('Quantity')).toBeVisible({ timeout: 5000 });

    // Increase quantity
    const increaseBtn = page.getByRole('button', { name: /\+/i }).first();
    await increaseBtn.click();
    await increaseBtn.click();

    // Quantity should show 3
    const quantityInput = page.locator('input[type="number"]').first();
    const qty = await quantityInput.inputValue();
    expect(parseInt(qty)).toBeGreaterThanOrEqual(3);

    // Add to cart with quantity
    await page.getByRole('button', { name: /add to cart/i }).click();

    // Should succeed
    await expect(page.getByText(/added.*to cart/i)).toBeVisible({ timeout: 5000 });
  });

  test('all three products have variants available', async ({ page }) => {
    // Test prod_1
    await page.goto('/shop/prod_1');
    await expect(page.getByText('Select Variant')).toBeVisible({ timeout: 5000 });
    let variantSelect = page.locator('select').first();
    let options = await variantSelect.locator('option').count();
    expect(options).toBeGreaterThan(0);

    // Test prod_2
    await page.goto('/shop/prod_2');
    await expect(page.getByText('Select Variant')).toBeVisible({ timeout: 5000 });
    variantSelect = page.locator('select').first();
    options = await variantSelect.locator('option').count();
    expect(options).toBeGreaterThan(0);

    // Test prod_3
    await page.goto('/shop/prod_3');
    await expect(page.getByText('Select Variant')).toBeVisible({ timeout: 5000 });
    variantSelect = page.locator('select').first();
    options = await variantSelect.locator('option').count();
    expect(options).toBeGreaterThan(0);
  });
});

test.describe('Product Variants - Variant Data Integrity', () => {
  test('product API returns variants for all products', async ({ page }) => {
    // NOTE: Using relative URL so Playwright uses baseURL (nginx through Docker)
    const response = await page.request.get('/api/shop/products', {
      rejectOnStatusCode: false,
    });
    const data = await response.json();

    expect(data.products).toBeDefined();
    expect(data.products.length).toBeGreaterThan(0);

    // Each product should have variants
    for (const product of data.products) {
      expect(product.variants, `Product ${product.id} missing variants`).toBeDefined();
      expect(product.variants.length, `Product ${product.id} has no variants`).toBeGreaterThan(0);
    }
  });

  test('variants have correct pricing', async ({ page }) => {
    // NOTE: Using relative URL so Playwright uses baseURL (nginx through Docker)
    const response = await page.request.get('/api/shop/products', {
      rejectOnStatusCode: false,
    });
    const data = await response.json();

    const quickTask = data.products.find((p: any) => p.id === 'prod_1');
    expect(quickTask).toBeDefined();
    expect(quickTask.variants[0].prices).toBeDefined();
    expect(quickTask.variants[0].prices[0].amount).toBe(5000);
    expect(quickTask.variants[0].prices[0].currency_code).toBe('USD');

    const standardProject = data.products.find((p: any) => p.id === 'prod_2');
    expect(standardProject).toBeDefined();
    expect(standardProject.variants[0].prices[0].amount).toBe(15000);

    const premiumSolution = data.products.find((p: any) => p.id === 'prod_3');
    expect(premiumSolution).toBeDefined();
    expect(premiumSolution.variants[0].prices[0].amount).toBe(50000);
  });

  test('variants have required fields', async ({ page }) => {
    const response = await page.request.get('/api/shop/products');
    const data = await response.json();

    for (const product of data.products) {
      for (const variant of product.variants) {
        expect(variant.id).toBeDefined();
        expect(variant.id).toBeTruthy();
        expect(variant.title).toBeDefined();
        expect(variant.prices).toBeDefined();
        expect(Array.isArray(variant.prices)).toBe(true);
        expect(variant.prices.length).toBeGreaterThan(0);
      }
    }
  });
});
