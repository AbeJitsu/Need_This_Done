// ============================================================================
// Medusa Client Type Tests
// ============================================================================
// Tests to ensure Product and ProductVariant types are correct

import { describe, test, expect } from '@jest/globals';
import type { Product, ProductVariant } from '../medusa-client';

describe('Product Variants - Type Safety', () => {
  test('Product type includes variants field', () => {
    const product: Product = {
      id: 'test_prod',
      title: 'Test Product',
      handle: 'test-product',
      variants: [{
        id: 'var_1',
        title: 'Default',
        product_id: 'test_prod',
        prices: [{ amount: 1000, currency_code: 'USD' }]
      }]
    };

    expect(product.variants).toBeDefined();
    expect(product.variants).toBeInstanceOf(Array);
    expect(product.variants?.length).toBe(1);
    expect(product.variants?.[0].id).toBe('var_1');
  });

  test('ProductVariant has correct required fields', () => {
    const variant: ProductVariant = {
      id: 'var_1',
      title: 'Standard',
      product_id: 'prod_1',
      prices: [{ amount: 5000, currency_code: 'USD' }],
    };

    expect(variant.id).toBeDefined();
    expect(variant.title).toBeDefined();
    expect(variant.product_id).toBeDefined();
    expect(variant.prices).toBeDefined();
    expect(variant.prices).toHaveLength(1);
  });

  test('ProductVariant has correct optional fields', () => {
    const variant: ProductVariant = {
      id: 'var_1',
      title: 'Standard',
      product_id: 'prod_1',
      prices: [{ amount: 5000, currency_code: 'USD' }],
      inventory_quantity: 999,
      manage_inventory: false,
      allow_backorder: true,
      options: [],
    };

    expect(variant.inventory_quantity).toBe(999);
    expect(variant.manage_inventory).toBe(false);
    expect(variant.allow_backorder).toBe(true);
    expect(variant.options).toEqual([]);
  });

  test('Product with multiple variants', () => {
    const product: Product = {
      id: 'prod_multi',
      title: 'Multi-Variant Product',
      handle: 'multi-variant',
      variants: [
        {
          id: 'var_1_s',
          title: 'Small',
          product_id: 'prod_multi',
          prices: [{ amount: 1000, currency_code: 'USD' }],
        },
        {
          id: 'var_1_m',
          title: 'Medium',
          product_id: 'prod_multi',
          prices: [{ amount: 1500, currency_code: 'USD' }],
        },
        {
          id: 'var_1_l',
          title: 'Large',
          product_id: 'prod_multi',
          prices: [{ amount: 2000, currency_code: 'USD' }],
        },
      ],
    };

    expect(product.variants).toHaveLength(3);
    expect(product.variants?.[0].title).toBe('Small');
    expect(product.variants?.[1].title).toBe('Medium');
    expect(product.variants?.[2].title).toBe('Large');
  });

  test('Product variants are optional', () => {
    const product: Product = {
      id: 'prod_no_variants',
      title: 'Product Without Variants',
      handle: 'no-variants',
    };

    expect(product.variants).toBeUndefined();
  });

  test('Variant pricing structure is correct', () => {
    const variant: ProductVariant = {
      id: 'var_priced',
      title: 'Priced Variant',
      product_id: 'prod_1',
      prices: [
        { amount: 5000, currency_code: 'USD' },
        { amount: 4500, currency_code: 'EUR' },
      ],
    };

    expect(variant.prices).toHaveLength(2);
    expect(variant.prices[0].amount).toBe(5000);
    expect(variant.prices[0].currency_code).toBe('USD');
    expect(variant.prices[1].amount).toBe(4500);
    expect(variant.prices[1].currency_code).toBe('EUR');
  });
});
