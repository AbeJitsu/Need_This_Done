import { GET } from '../route';
import { NextRequest } from 'next/server';

/**
 * Integration tests for GET /api/shop/products endpoint
 * Validates that the API properly returns product data with variants
 */

describe('GET /api/shop/products', () => {
  test('returns products array', async () => {
    const response = await GET();
    const data = await response.json();

    expect(data).toHaveProperty('products');
    expect(Array.isArray(data.products)).toBe(true);
    expect(data.products.length).toBeGreaterThan(0);
  });

  test('each product has required fields', async () => {
    const response = await GET();
    const data = await response.json();

    data.products.forEach((product: any) => {
      expect(product).toHaveProperty('id');
      expect(product).toHaveProperty('title');
      expect(product).toHaveProperty('handle');
      expect(typeof product.id).toBe('string');
      expect(typeof product.title).toBe('string');
    });
  });

  test('each product has variants array', async () => {
    const response = await GET();
    const data = await response.json();

    data.products.forEach((product: any) => {
      expect(product).toHaveProperty('variants');
      expect(Array.isArray(product.variants)).toBe(true);
      expect(product.variants.length).toBeGreaterThan(
        0,
        `Product ${product.id} must have at least one variant`
      );
    });
  });

  test('each variant has required fields', async () => {
    const response = await GET();
    const data = await response.json();

    data.products.forEach((product: any) => {
      product.variants.forEach((variant: any, index: number) => {
        expect(variant).toHaveProperty('id');
        expect(variant).toHaveProperty('title');
        expect(variant).toHaveProperty('product_id');
        expect(variant).toHaveProperty('prices');

        expect(typeof variant.id).toBe('string');
        expect(typeof variant.title).toBe('string');
        expect(variant.product_id).toBe(product.id);
        expect(Array.isArray(variant.prices)).toBe(true);
        expect(variant.prices.length).toBeGreaterThan(
          0,
          `Variant ${index} of ${product.id} must have at least one price`
        );
      });
    });
  });

  test('variants have correct pricing structure', async () => {
    const response = await GET();
    const data = await response.json();

    data.products.forEach((product: any) => {
      product.variants.forEach((variant: any) => {
        variant.prices.forEach((price: any) => {
          expect(price).toHaveProperty('amount');
          expect(price).toHaveProperty('currency_code');
          expect(typeof price.amount).toBe('number');
          expect(price.amount).toBeGreaterThan(0);
          expect(typeof price.currency_code).toBe('string');
        });
      });
    });
  });

  test('quick task has correct price', async () => {
    const response = await GET();
    const data = await response.json();

    const quickTask = data.products.find((p: any) => p.id === 'prod_1');
    expect(quickTask).toBeDefined();
    expect(quickTask.variants).toBeDefined();
    expect(quickTask.variants[0].prices[0].amount).toBe(5000);
    expect(quickTask.variants[0].prices[0].currency_code).toBe('USD');
  });

  test('standard project has correct price', async () => {
    const response = await GET();
    const data = await response.json();

    const standardProject = data.products.find((p: any) => p.id === 'prod_2');
    expect(standardProject).toBeDefined();
    expect(standardProject.variants[0].prices[0].amount).toBe(15000);
  });

  test('premium solution has correct price', async () => {
    const response = await GET();
    const data = await response.json();

    const premiumSolution = data.products.find((p: any) => p.id === 'prod_3');
    expect(premiumSolution).toBeDefined();
    expect(premiumSolution.variants[0].prices[0].amount).toBe(50000);
  });

  test('response includes metadata', async () => {
    const response = await GET();
    const data = await response.json();

    expect(data).toHaveProperty('count');
    expect(data).toHaveProperty('cached');
    expect(data).toHaveProperty('source');
    expect(data.count).toBe(data.products.length);
    expect(typeof data.cached).toBe('boolean');
    expect(typeof data.source).toBe('string');
  });

  test('http response status is 200', async () => {
    const response = await GET();
    expect(response.status).toBe(200);
  });

  test('response content-type is application/json', async () => {
    const response = await GET();
    expect(response.headers.get('content-type')).toContain('application/json');
  });
});
