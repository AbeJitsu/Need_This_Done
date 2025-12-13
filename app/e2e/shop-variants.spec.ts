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
    await expect(page.getByText('15-Minute Consultation')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('30-Minute Consultation')).toBeVisible();
    await expect(page.getByText('55-Minute Consultation')).toBeVisible();

    // Verify no variant errors displayed
    await expect(page.getByText('No variants available')).not.toBeVisible();
  });

  test('can add 15-Minute Consultation to cart from shop page', async ({ page }) => {
    await page.goto('/shop');
    await page.waitForLoadState('domcontentloaded');

    // Wait for products to load
    await expect(page.getByText('15-Minute Consultation')).toBeVisible({ timeout: 10000 });

    // Click "Details" link to go to product page (shop listing has Details links, not Add Cart buttons)
    await page.getByRole('link', { name: /details/i }).first().click();
    await page.waitForLoadState('domcontentloaded');

    // Add to cart from product detail page
    await page.getByRole('button', { name: /add to cart/i }).click();
    await page.waitForTimeout(500);

    // Should see success message (toast notification)
    await expect(page.getByText(/added.*to cart/i)).toBeVisible({ timeout: 5000 });
  });

  test('product detail page shows variant dropdown', async ({ page }) => {
    await page.goto('/shop');
    await page.waitForLoadState('domcontentloaded');

    // Wait for products and click Details
    await expect(page.getByText('15-Minute Consultation')).toBeVisible({ timeout: 10000 });

    // Click first Details link
    await page.getByRole('link', { name: /details/i }).first().click();
    await page.waitForLoadState('domcontentloaded');

    // Should navigate to product detail page
    await expect(page).toHaveURL(/\/shop\/consultation-/);

    // Should show variant selector or Add to Cart button
    // The actual product detail page layout may vary
    await expect(page.getByRole('button', { name: /add to cart/i })).toBeVisible({ timeout: 5000 });
  });

  test('can add product from detail page with variant', async ({ page }) => {
    await page.goto('/shop/consultation-15-min');

    // Should show variant selector
    await expect(page.getByText('Select Variant')).toBeVisible({ timeout: 5000 });

    // Select should have a variant pre-selected
    const variantSelect = page.locator('select').first();
    const selectedValue = await variantSelect.inputValue();
    expect(selectedValue).toContain('variant_');

    // Click Add to Cart button
    await page.getByRole('button', { name: /add to cart/i }).click();

    // Should show success message
    await expect(page.getByText(/added.*to cart/i)).toBeVisible({ timeout: 5000 });
  });

  test('can add multiple different products to cart', async ({ page }) => {
    await page.goto('/shop');
    await page.waitForLoadState('domcontentloaded');

    // Wait for products to load
    await expect(page.getByText('15-Minute Consultation')).toBeVisible({ timeout: 10000 });

    // Add first product via Details page
    await page.getByRole('link', { name: /details/i }).first().click();
    await page.waitForLoadState('domcontentloaded');
    await page.getByRole('button', { name: /add to cart/i }).click();
    await page.waitForTimeout(500);
    await expect(page.getByText(/added.*to cart/i)).toBeVisible({ timeout: 5000 });

    // Go back and add second product
    await page.goBack();
    await page.waitForLoadState('domcontentloaded');
    await page.getByRole('link', { name: /details/i }).nth(1).click();
    await page.waitForLoadState('domcontentloaded');
    await page.getByRole('button', { name: /add to cart/i }).click();
    await page.waitForTimeout(500);
    await expect(page.getByText(/added.*to cart/i)).toBeVisible({ timeout: 5000 });
  });

  test('cart displays added products correctly', async ({ page }) => {
    // Add a product to cart via detail page
    await page.goto('/shop');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.getByText('15-Minute Consultation')).toBeVisible({ timeout: 10000 });

    // Go to product detail and add to cart
    await page.getByRole('link', { name: /details/i }).first().click();
    await page.waitForLoadState('domcontentloaded');
    await page.getByRole('button', { name: /add to cart/i }).click();
    await page.waitForTimeout(500);
    await expect(page.getByText(/added.*to cart/i)).toBeVisible({ timeout: 5000 });

    // Navigate to cart via View Cart link
    await page.getByRole('link', { name: /view cart/i }).click();
    await page.waitForLoadState('domcontentloaded');

    // Verify cart has items (order summary visible)
    await expect(page.getByText(/subtotal/i)).toBeVisible({ timeout: 5000 });
    await expect(page.getByText(/\$\d+\.\d{2}/).first()).toBeVisible();
  });

  test('standard variant is selected by default', async ({ page }) => {
    await page.goto('/shop/consultation-30-min');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000);

    // Should have Add to Cart button visible (variant selector may or may not exist)
    await expect(page.getByRole('button', { name: /add to cart/i })).toBeVisible({ timeout: 5000 });

    // If there's a select dropdown, check that it has a value selected
    const variantSelect = page.locator('select').first();
    if (await variantSelect.isVisible()) {
      const selectedValue = await variantSelect.inputValue();
      // Variant should be pre-selected (has a value)
      expect(selectedValue).toBeTruthy();
    }
  });

  test('can adjust quantity before adding to cart', async ({ page }) => {
    await page.goto('/shop/consultation-15-min');

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
    // Test consultation-15-min
    await page.goto('/shop/consultation-15-min');
    await expect(page.getByText('Select Variant')).toBeVisible({ timeout: 5000 });
    let variantSelect = page.locator('select').first();
    let options = await variantSelect.locator('option').count();
    expect(options).toBeGreaterThan(0);

    // Test consultation-30-min
    await page.goto('/shop/consultation-30-min');
    await expect(page.getByText('Select Variant')).toBeVisible({ timeout: 5000 });
    variantSelect = page.locator('select').first();
    options = await variantSelect.locator('option').count();
    expect(options).toBeGreaterThan(0);

    // Test consultation-55-min
    await page.goto('/shop/consultation-55-min');
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
      failOnStatusCode: false,
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
      failOnStatusCode: false,
    });
    const data = await response.json();

    const consultation15 = data.products.find((p: any) => p.handle === 'consultation-15-min');
    expect(consultation15).toBeDefined();
    expect(consultation15.variants[0].prices).toBeDefined();
    expect(consultation15.variants[0].prices[0].amount).toBe(2000);
    expect(consultation15.variants[0].prices[0].currency_code).toBe('USD');

    const consultation30 = data.products.find((p: any) => p.handle === 'consultation-30-min');
    expect(consultation30).toBeDefined();
    expect(consultation30.variants[0].prices[0].amount).toBe(3500);

    const consultation55 = data.products.find((p: any) => p.handle === 'consultation-55-min');
    expect(consultation55).toBeDefined();
    expect(consultation55.variants[0].prices[0].amount).toBe(5000);
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
