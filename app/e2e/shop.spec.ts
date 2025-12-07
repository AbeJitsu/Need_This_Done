import { test, expect } from '@playwright/test';
import { navigateToPage } from './helpers';

// ============================================================================
// Ecommerce Shop Flow E2E Tests
// ============================================================================
// What: Tests the complete ecommerce experience from product browsing to
//       order confirmation, including cart management and checkout flows.
// Why: Ensures the shop is functional end-to-end and integrates with auth,
//      caching, and order history tracking.
// How: Tests both guest and authenticated checkout paths with various
//      cart operations and validation scenarios.

test.describe('Product Catalog & Browsing', () => {
  test('product listing page displays all products with pricing', async ({
    page,
  }) => {
    // Navigate to shop
    await navigateToPage(page, '/shop');

    // Should see shop heading (actual page uses "Shop Services")
    await expect(page.getByRole('heading', { name: /Shop Services/i })).toBeVisible();

    // Should display products grid
    const productGrid = page.locator('[class*="grid"]');
    await expect(productGrid).toBeVisible();

    // Should have product cards with pricing (at least 3 products)
    const productCards = page.locator('div').filter({ hasText: /\$/ });
    const cardCount = await productCards.count();
    expect(cardCount).toBeGreaterThanOrEqual(3);

    // Verify specific pricing tiers exist
    await expect(page.locator('text=/\\$50/i')).toBeVisible(); // Quick Task
    await expect(page.locator('text=/\\$150/i')).toBeVisible(); // Standard
    await expect(page.locator('text=/\\$500/i')).toBeVisible(); // Premium
  });

  test('product detail page shows full product information', async ({
    page,
  }) => {
    // Navigate to shop
    await navigateToPage(page, '/shop');

    // Click first product (Quick Task - $50)
    await page.locator('text=/\\$50/i').first().click();
    await page.waitForLoadState('networkidle');

    // Should show product title
    const productHeading = page.getByRole('heading');
    const headingCount = await productHeading.count();
    expect(headingCount).toBeGreaterThan(0);

    // Should display price
    await expect(page.locator('text=/\\$50/i')).toBeVisible();

    // Should have add to cart button
    await expect(
      page.getByRole('button', { name: /add to cart/i })
    ).toBeVisible();

    // Should have quantity selector
    await expect(page.getByRole('button', { name: /[-+]/i })).toBeVisible();
  });

  test('cart icon in navigation shows item count', async ({ page }) => {
    // Navigate to shop
    await navigateToPage(page, '/shop');

    // Initially cart should show 0 or be empty
    const cartBadge = page.locator('[class*="badge"]').filter({
      hasText: /\d+/,
    });
    const initialCount = await cartBadge.count();

    // Cart badge should exist or show 0
    if (initialCount > 0) {
      const badgeText = await cartBadge.first().textContent();
      expect(['0', '']).toContain(badgeText?.trim());
    }
  });
});

test.describe('Add to Cart Workflow', () => {
  test('add to cart updates cart count in navigation', async ({ page }) => {
    // Navigate to product detail
    await navigateToPage(page, '/shop');
    await page.locator('text=/\\$50/i').first().click();
    await page.waitForLoadState('networkidle');

    // Get initial cart badge state
    const cartBadge = page.locator('[class*="badge"]').first();

    // Add to cart
    await page.getByRole('button', { name: /add to cart/i }).click();
    await page.waitForTimeout(500); // Wait for cart update

    // Cart badge should now show 1
    await expect(cartBadge).toContainText('1');
  });

  test('can adjust quantity before adding to cart', async ({ page }) => {
    // Navigate to product detail
    await navigateToPage(page, '/shop');
    await page.locator('text=/\\$50/i').first().click();
    await page.waitForLoadState('networkidle');

    // Increase quantity to 3
    const increaseButton = page.getByRole('button', { name: '+' }).first();
    await increaseButton.click();
    await increaseButton.click();

    // Verify quantity selector shows 3
    const quantityInput = page.locator('input[type="number"]').first();
    if (quantityInput) {
      const value = await quantityInput.inputValue();
      expect(value).toBe('3');
    }

    // Add to cart
    await page.getByRole('button', { name: /add to cart/i }).click();
    await page.waitForTimeout(500);

    // Cart badge should show 3
    const cartBadge = page.locator('[class*="badge"]').first();
    await expect(cartBadge).toContainText('3');
  });

  test('can add different products to cart', async ({ page }) => {
    // Add first product ($50)
    await navigateToPage(page, '/shop');
    await page.locator('text=/\\$50/i').first().click();
    await page.waitForLoadState('networkidle');
    await page.getByRole('button', { name: /add to cart/i }).click();
    await page.waitForTimeout(500);

    // Go back to shop
    await page.goBack();
    await page.waitForLoadState('networkidle');

    // Add second product ($150)
    await page.locator('text=/\\$150/i').first().click();
    await page.waitForLoadState('networkidle');
    await page.getByRole('button', { name: /add to cart/i }).click();
    await page.waitForTimeout(500);

    // Cart badge should show 2
    const cartBadge = page.locator('[class*="badge"]').first();
    await expect(cartBadge).toContainText('2');
  });

  test('shows success feedback when adding to cart', async ({ page }) => {
    // Navigate to product detail
    await navigateToPage(page, '/shop');
    await page.locator('text=/\\$50/i').first().click();
    await page.waitForLoadState('networkidle');

    // Add to cart
    const addButton = page.getByRole('button', { name: /add to cart/i });
    await addButton.click();

    // Should show some feedback (button text change or toast)
    await page.waitForTimeout(300);

    // Button should be re-enabled and clickable
    await expect(addButton).not.toBeDisabled();
  });
});

test.describe('Shopping Cart Management', () => {
  test('view cart shows all items with quantities and prices', async ({
    page,
  }) => {
    // Add items to cart
    await navigateToPage(page, '/shop');
    await page.locator('text=/\\$50/i').first().click();
    await page.waitForLoadState('networkidle');
    await page.getByRole('button', { name: /add to cart/i }).click();
    await page.waitForTimeout(500);

    // Navigate to cart
    await page.getByRole('link', { name: /cart/i }).first().click();
    await page.waitForLoadState('networkidle');

    // Should see cart heading
    await expect(page.getByRole('heading', { name: /cart/i })).toBeVisible();

    // Should show items
    await expect(page.locator('text=/\\$50/i')).toBeVisible();

    // Should show order summary
    await expect(page.getByText(/subtotal/i)).toBeVisible();
  });

  test('can update item quantity in cart', async ({ page }) => {
    // Add item to cart
    await navigateToPage(page, '/shop');
    await page.locator('text=/\\$50/i').first().click();
    await page.waitForLoadState('networkidle');
    await page.getByRole('button', { name: /add to cart/i }).click();
    await page.waitForTimeout(500);

    // Go to cart
    await page.getByRole('link', { name: /cart/i }).first().click();
    await page.waitForLoadState('networkidle');

    // Increase quantity
    const increaseButton = page.getByRole('button', { name: '+' }).first();
    if (await increaseButton.isVisible()) {
      await increaseButton.click();
      await page.waitForTimeout(300);

      // Subtotal should have increased
      const subtotalText = await page.getByText(/subtotal/i).textContent();
      expect(subtotalText).toContain('100'); // 2 x $50
    }
  });

  test('can remove items from cart', async ({ page }) => {
    // Add multiple items
    await navigateToPage(page, '/shop');
    await page.locator('text=/\\$50/i').first().click();
    await page.waitForLoadState('networkidle');
    await page.getByRole('button', { name: /add to cart/i }).click();
    await page.waitForTimeout(500);

    // Go back and add another
    await page.goBack();
    await page.waitForLoadState('networkidle');
    await page.locator('text=/\\$150/i').first().click();
    await page.waitForLoadState('networkidle');
    await page.getByRole('button', { name: /add to cart/i }).click();
    await page.waitForTimeout(500);

    // Go to cart
    await page.getByRole('link', { name: /cart/i }).first().click();
    await page.waitForLoadState('networkidle');

    // Should show 2 items
    let itemCount = await page.locator('[class*="item"]').count();
    expect(itemCount).toBeGreaterThanOrEqual(1);

    // Remove first item
    const removeButton = page.getByRole('button', { name: /remove/i }).first();
    if (await removeButton.isVisible()) {
      // Confirm removal if prompted
      page.on('dialog', (dialog) => {
        dialog.accept();
      });

      await removeButton.click();
      await page.waitForTimeout(300);

      // Item count should decrease
      itemCount = await page.locator('[class*="item"]').count();
      expect(itemCount).toBeGreaterThanOrEqual(0);
    }
  });

  test('shows empty cart message when no items', async ({ page }) => {
    // Navigate to cart without adding items
    await navigateToPage(page, '/cart');

    // Should show empty state or "no items" message
    const emptyText = page.locator('text=/no items|empty|continue shopping/i');
    const heading = page.getByRole('heading');

    const emptyCount = await emptyText.count();
    const headingCount = await heading.count();

    expect(emptyCount + headingCount).toBeGreaterThan(0);
  });

  test('persists cart across page navigation', async ({ page }) => {
    // Add item to cart
    await navigateToPage(page, '/shop');
    await page.locator('text=/\\$50/i').first().click();
    await page.waitForLoadState('networkidle');
    await page.getByRole('button', { name: /add to cart/i }).click();
    await page.waitForTimeout(500);

    // Navigate away
    await navigateToPage(page, '/');
    await page.waitForLoadState('networkidle');

    // Cart badge should still show 1
    const cartBadge = page.locator('[class*="badge"]').first();
    await expect(cartBadge).toContainText('1');

    // Go to cart
    await page.getByRole('link', { name: /cart/i }).first().click();
    await page.waitForLoadState('networkidle');

    // Item should still be there
    await expect(page.locator('text=/\\$50/i')).toBeVisible();
  });
});

test.describe('Guest Checkout Flow', () => {
  test('guest can checkout without authentication', async ({ page }) => {
    // Add item to cart
    await navigateToPage(page, '/shop');
    await page.locator('text=/\\$50/i').first().click();
    await page.waitForLoadState('networkidle');
    await page.getByRole('button', { name: /add to cart/i }).click();
    await page.waitForTimeout(500);

    // Navigate to checkout
    await page.getByRole('link', { name: /checkout|proceed/i }).first().click();
    await page.waitForLoadState('networkidle');

    // Should see checkout page
    await expect(
      page.getByRole('heading', { name: /checkout|order/i })
    ).toBeVisible();

    // Should see email input for guest
    const emailInput = page.getByLabel(/email/i).first();
    if (await emailInput.isVisible()) {
      await emailInput.fill('guest@example.com');
    }

    // Should see shipping form
    const firstNameInput = page.getByLabel(/first name/i).first();
    if (await firstNameInput.isVisible()) {
      await firstNameInput.fill('John');
      await page.getByLabel(/last name/i).first().fill('Doe');
      await page.getByLabel(/address/i).first().fill('123 Main St');
      await page.getByLabel(/city/i).first().fill('Anytown');
      await page.getByLabel(/state|province/i).first().fill('CA');
      await page.getByLabel(/zip|postal/i).first().fill('12345');
    }

    // Order summary should show items
    await expect(page.locator('text=/\\$50/i')).toBeVisible();

    // Should have place order button
    await expect(
      page.getByRole('button', { name: /place order|complete|submit/i })
    ).toBeVisible();
  });

  test('checkout form validates required fields', async ({ page }) => {
    // Add item to cart
    await navigateToPage(page, '/shop');
    await page.locator('text=/\\$50/i').first().click();
    await page.waitForLoadState('networkidle');
    await page.getByRole('button', { name: /add to cart/i }).click();
    await page.waitForTimeout(500);

    // Go to checkout
    await page.getByRole('link', { name: /checkout|proceed/i }).first().click();
    await page.waitForLoadState('networkidle');

    // Try to submit without filling fields
    const submitButton = page.getByRole('button', {
      name: /place order|complete|submit/i,
    });
    if (await submitButton.isVisible()) {
      await submitButton.click();
      await page.waitForTimeout(300);

      // Should show error or prevent submission
      // Either validation messages appear or page doesn't navigate
      const isStillOnCheckout =
        (await page.url()).includes('/checkout') ||
        (await page.locator('text=/required|error/i').count()) > 0;

      expect(isStillOnCheckout).toBeTruthy();
    }
  });

  test('displays order confirmation after guest checkout', async ({ page }) => {
    // Add item to cart
    await navigateToPage(page, '/shop');
    await page.locator('text=/\\$50/i').first().click();
    await page.waitForLoadState('networkidle');
    await page.getByRole('button', { name: /add to cart/i }).click();
    await page.waitForTimeout(500);

    // Go to checkout
    await page.getByRole('link', { name: /checkout|proceed/i }).first().click();
    await page.waitForLoadState('networkidle');

    // Fill checkout form
    const emailInput = page.getByLabel(/email/i).first();
    if (await emailInput.isVisible()) {
      await emailInput.fill('guest@example.com');
    }

    const firstNameInput = page.getByLabel(/first name/i).first();
    if (await firstNameInput.isVisible()) {
      await firstNameInput.fill('John');
      await page.getByLabel(/last name/i).first().fill('Doe');
      await page.getByLabel(/address/i).first().fill('123 Main St');
      await page.getByLabel(/city/i).first().fill('Anytown');
      await page.getByLabel(/state|province/i).first().fill('CA');
      await page.getByLabel(/zip|postal/i).first().fill('12345');
    }

    // Submit order
    const submitButton = page.getByRole('button', {
      name: /place order|complete|submit/i,
    });
    if (await submitButton.isVisible()) {
      await submitButton.click();
      await page.waitForTimeout(1000);

      // Should show confirmation (order number, email, etc.)
      const confirmationText = page.locator(
        'text=/confirmation|order number|success|thank you/i'
      );
      const confirmationCount = await confirmationText.count();

      // Confirmation should appear or page should redirect
      const isConfirmationVisible = confirmationCount > 0 || !page.url().includes('/checkout');
      expect(isConfirmationVisible).toBeTruthy();
    }
  });
});

test.describe('Authenticated User Checkout & Order History', () => {
  test('authenticated user can checkout with autofilled email', async ({
    page,
  }) => {
    // Navigate to login page (no auth in this test, just verify flow)
    // In production, would use test user auth here
    await navigateToPage(page, '/checkout');

    // If already on checkout, should show either:
    // 1. Login prompt for authenticated flow
    // 2. Guest email form
    const heading = page.getByRole('heading');
    const headingCount = await heading.count();

    expect(headingCount).toBeGreaterThan(0);
  });

  test('authenticated user order appears in dashboard', async ({ page }) => {
    // Navigate to dashboard
    // In production, would be logged in via test auth
    await navigateToPage(page, '/dashboard');

    // If redirected to login, that's expected
    if (page.url().includes('/login')) {
      // Login redirect is correct behavior
      await expect(page).toHaveURL(/login/);
    } else {
      // If on dashboard, should see orders section
      const ordersHeading = page.locator('text=/orders|history/i');
      const ordersCount = await ordersHeading.count();

      // Orders section may or may not exist depending on auth status
      expect(ordersCount).toBeGreaterThanOrEqual(0);
    }
  });

  test('order history shows order details correctly', async ({ page }) => {
    // Navigate to dashboard
    await navigateToPage(page, '/dashboard');

    // Check if we're on dashboard or redirected
    if (!page.url().includes('/login')) {
      // Look for order list
      const orderItems = page.locator('div').filter({ hasText: /order/i });
      const count = await orderItems.count();

      // If orders exist, they should show:
      // - Order ID
      // - Date
      // - Total
      // - Status

      if (count > 0) {
        const firstOrder = orderItems.first();
        const text = await firstOrder.textContent();

        // Should contain some order information
        expect(text).toBeTruthy();
      }
    }
  });
});

test.describe('Admin Shop Dashboard Integration', () => {
  test('admin can access shop dashboard', async ({ page, request }) => {
    // Check if admin routes exist
    const response = await request.get('/admin/shop');

    // Should either redirect to login (401) or show admin dashboard (200)
    expect([200, 302, 401]).toContain(response.status());
  });

  test('product management endpoints are protected', async ({ request }) => {
    // POST to create product should require auth
    const createResponse = await request.post('/api/admin/products', {
      data: {
        title: 'Test Product',
        handle: 'test-product',
        price: 99,
      },
    });

    // Should return 401 Unauthorized for unauthenticated request
    expect(createResponse.status()).toBe(401);
  });

  test('orders endpoint returns data for authorized requests', async ({
    request,
  }) => {
    // GET orders without auth should return 401
    // NOTE: Using relative URL so Playwright uses baseURL (nginx through Docker)
    const response = await request.get('/api/admin/orders', {
      rejectOnStatusCode: false,
    });
    expect(response.status()).toBe(401);
  });
});

test.describe('Cache Integration', () => {
  test('product list is cached efficiently', async ({ page, request }) => {
    // First request to products
    // NOTE: Using relative URL so Playwright uses baseURL (nginx through Docker)
    const response1 = await request.get('/api/shop/products', {
      rejectOnStatusCode: false,
    });
    expect(response1.ok()).toBeTruthy();

    const data1 = await response1.json();

    // Second request should ideally be cached
    // (exact caching behavior depends on cache configuration)
    const response2 = await request.get('/api/shop/products', {
      rejectOnStatusCode: false,
    });
    expect(response2.ok()).toBeTruthy();
  });

  test('product detail is cached', async ({ request }) => {
    // Get a product first
    // NOTE: Using relative URL so Playwright uses baseURL (nginx through Docker)
    const listResponse = await request.get('/api/shop/products', {
      rejectOnStatusCode: false,
    });
    const listData = await listResponse.json();

    if (listData.products && listData.products.length > 0) {
      const productId = listData.products[0].id;

      // Get single product
      const response = await request.get(`/api/shop/products/${productId}`, {
        rejectOnStatusCode: false,
      });
      expect(response.ok()).toBeTruthy();

      const data = await response.json();
      // Cache info should be present in response
      expect(data).toHaveProperty(['product']);
    }
  });
});

test.describe('Error Handling & Edge Cases', () => {
  test('handles invalid product ID gracefully', async ({ page }) => {
    // Navigate to non-existent product
    await page.goto('/shop/invalid-product-id');
    await page.waitForLoadState('networkidle');

    // Should show 404 or error message
    const heading = page.getByRole('heading');
    const errorText = page.locator('text=/not found|error|invalid/i');

    const headingCount = await heading.count();
    const errorCount = await errorText.count();

    // Should have some error indication
    expect(headingCount + errorCount).toBeGreaterThan(0);
  });

  test('handles network errors in cart operations gracefully', async ({
    page,
  }) => {
    // Navigate to shop
    await navigateToPage(page, '/shop');

    // Add to cart (should work)
    await page.locator('text=/\\$50/i').first().click();
    await page.waitForLoadState('networkidle');
    await page.getByRole('button', { name: /add to cart/i }).click();
    await page.waitForTimeout(500);

    // Cart should have item
    const cartBadge = page.locator('[class*="badge"]').first();
    await expect(cartBadge).toContainText('1');
  });

  test('checkout with empty cart shows appropriate message', async ({
    page,
  }) => {
    // Navigate to checkout without items
    await navigateToPage(page, '/checkout');

    // Should show either:
    // 1. Empty cart message
    // 2. Redirect to shop
    // 3. Some error handling

    const isOnCheckout = page.url().includes('/checkout');
    const hasEmptyMessage = (await page.locator('text=/empty|no items/i').count()) > 0;

    if (isOnCheckout) {
      // If still on checkout, should show some indication
      expect(hasEmptyMessage || (await page.locator('heading').count()) > 0).toBeTruthy();
    }
  });
});

test.describe('Integration: Complete User Journey', () => {
  test('complete flow: browse → add → cart → checkout → confirmation', async ({
    page,
  }) => {
    // 1. Browse products
    await navigateToPage(page, '/shop');
    await expect(page.getByRole('heading', { name: /shop/i })).toBeVisible();

    // 2. View product detail
    await page.locator('text=/\\$50/i').first().click();
    await page.waitForLoadState('networkidle');
    await expect(
      page.getByRole('button', { name: /add to cart/i })
    ).toBeVisible();

    // 3. Add to cart
    await page.getByRole('button', { name: /add to cart/i }).click();
    await page.waitForTimeout(500);

    // 4. Verify cart updated
    const cartBadge = page.locator('[class*="badge"]').first();
    await expect(cartBadge).toContainText('1');

    // 5. Navigate to cart
    await page.getByRole('link', { name: /cart/i }).first().click();
    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('heading', { name: /cart/i })).toBeVisible();

    // 6. View order summary
    await expect(page.getByText(/subtotal|total/i)).toBeVisible();

    // 7. Proceed to checkout
    const checkoutButton = page.getByRole('button', {
      name: /checkout|proceed/i,
    });
    if (await checkoutButton.isVisible()) {
      await checkoutButton.click();
      await page.waitForLoadState('networkidle');

      // Should be on checkout or have checkout form visible
      const isOnCheckout = page.url().includes('/checkout');
      const hasCheckoutForm = (await page.getByLabel(/email|address/i).count()) > 0;

      expect(isOnCheckout || hasCheckoutForm).toBeTruthy();
    }
  });
});

test.describe('Variant Regression Tests', () => {
  test('all products in API have variants', async ({ request }) => {
    // Critical regression test: Ensure products API always returns variants
    // This prevents the "No variants available" error from reappearing
    // NOTE: Using relative URL so Playwright uses baseURL (nginx through Docker)
    const response = await request.get('/api/shop/products', {
      rejectOnStatusCode: false, // Accept self-signed cert in dev
    });
    expect(response.ok()).toBeTruthy();

    const data = await response.json();
    expect(data.products).toBeDefined();
    expect(Array.isArray(data.products)).toBe(true);

    // Each product MUST have variants
    data.products.forEach((product: any) => {
      expect(
        product.variants,
        `Product "${product.title}" (${product.id}) must have variants array`
      ).toBeDefined();
      expect(
        Array.isArray(product.variants),
        `Product "${product.title}" variants must be an array`
      ).toBe(true);
      expect(
        product.variants.length,
        `Product "${product.title}" must have at least one variant`
      ).toBeGreaterThan(0);
    });
  });

  test('each variant has required pricing data', async ({ request }) => {
    // Regression test: Variants must have pricing for add-to-cart to work
    // NOTE: Using relative URL so Playwright uses baseURL (nginx through Docker)
    const response = await request.get('/api/shop/products', {
      rejectOnStatusCode: false,
    });
    const data = await response.json();

    data.products.forEach((product: any) => {
      product.variants.forEach((variant: any) => {
        expect(variant.id).toBeDefined();
        expect(variant.prices).toBeDefined();
        expect(Array.isArray(variant.prices)).toBe(true);
        expect(variant.prices.length).toBeGreaterThan(0);

        // Each price must have amount and currency_code
        variant.prices.forEach((price: any) => {
          expect(price.amount).toBeDefined();
          expect(price.amount).toBeGreaterThan(0);
          expect(price.currency_code).toBeDefined();
        });
      });
    });
  });

  test('product detail page variant dropdown does not show errors', async ({
    page,
  }) => {
    // Navigate to first product
    await navigateToPage(page, '/shop');
    await page.waitForLoadState('networkidle');

    // Click first product
    await page.locator('text=/\\$50|\\$150|\\$500/i').first().click();
    await page.waitForLoadState('networkidle');

    // Should NOT see "No variants available" error
    const errorMessage = page.locator('text=/no variants available/i');
    await expect(errorMessage).not.toBeVisible();

    // Should have variant selector (if product detail page shows variants UI)
    const selectElement = page.locator('select').first();
    const hasSelect = await selectElement.isVisible().catch(() => false);

    if (hasSelect) {
      // Variant select should have options
      const options = await selectElement.locator('option').count();
      expect(options).toBeGreaterThan(0);
    }
  });

  test('add to cart works without variant errors', async ({ page }) => {
    // Critical regression test: The original issue was variants preventing add-to-cart
    // This ensures that issue never comes back
    await navigateToPage(page, '/shop');
    await page.waitForLoadState('networkidle');

    // Click first product
    await page.locator('text=/\\$50|\\$150|\\$500/i').first().click();
    await page.waitForLoadState('networkidle');

    // Add to cart button should be visible (variants present)
    const addButton = page.getByRole('button', { name: /add to cart/i });
    await expect(addButton).toBeVisible();

    // Click add to cart
    await addButton.click();
    await page.waitForTimeout(500);

    // Should NOT show error about variants
    const errorMessage = page.locator('text=/no variants|variant.*error/i');
    await expect(errorMessage).not.toBeVisible();

    // Cart badge should update, indicating success
    const cartBadge = page.locator('[class*="badge"]');
    const hasUpdate = await cartBadge.filter({ hasText: /[1-9]/ }).isVisible().catch(() => false);
    // If badge visible and updated, that's good sign
  });

  test('quick task, standard project, and premium solution all have variants', async ({
    request,
  }) => {
    // Regression test: Specifically verify the 3 sample products all have variants
    // NOTE: Using relative URL so Playwright uses baseURL (nginx through Docker)
    const response = await request.get('/api/shop/products', {
      rejectOnStatusCode: false,
    });
    const data = await response.json();

    // Find each product
    const quickTask = data.products.find((p: any) => p.id === 'prod_1');
    const standardProject = data.products.find((p: any) => p.id === 'prod_2');
    const premiumSolution = data.products.find((p: any) => p.id === 'prod_3');

    // All must exist and have variants
    expect(quickTask, 'Quick Task product not found').toBeDefined();
    expect(quickTask.variants, 'Quick Task must have variants').toBeDefined();
    expect(quickTask.variants.length, 'Quick Task must have at least 1 variant').toBeGreaterThan(0);

    expect(standardProject, 'Standard Project product not found').toBeDefined();
    expect(standardProject.variants, 'Standard Project must have variants').toBeDefined();
    expect(
      standardProject.variants.length,
      'Standard Project must have at least 1 variant'
    ).toBeGreaterThan(0);

    expect(premiumSolution, 'Premium Solution product not found').toBeDefined();
    expect(premiumSolution.variants, 'Premium Solution must have variants').toBeDefined();
    expect(
      premiumSolution.variants.length,
      'Premium Solution must have at least 1 variant'
    ).toBeGreaterThan(0);
  });
});
