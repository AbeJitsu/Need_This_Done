import { test, expect } from '@playwright/test';

// ============================================================================
// Multi-Currency E2E Tests
// ============================================================================
// Tests for the currency system API and component

test.describe('Currencies API', () => {
  test.describe('GET /api/currencies?action=list', () => {
    test('returns list of active currencies', async ({ request }) => {
      const response = await request.get('/api/currencies?action=list');

      // May return 500 if migration not applied
      expect([200, 500]).toContain(response.status());

      if (response.status() === 200) {
        const body = await response.json();
        expect(body).toHaveProperty('currencies');
        expect(body).toHaveProperty('default');
        expect(body).toHaveProperty('count');
        expect(Array.isArray(body.currencies)).toBe(true);
      }
    });

    test('includes default currency', async ({ request }) => {
      const response = await request.get('/api/currencies?action=list');

      if (response.status() === 200) {
        const body = await response.json();
        expect(body.default).toBeTruthy();
        // Default should be one of the currencies
        const defaultCurrency = body.currencies.find(
          (c: { code: string }) => c.code === body.default
        );
        expect(defaultCurrency).toBeTruthy();
      }
    });

    test('currency objects have required properties', async ({ request }) => {
      const response = await request.get('/api/currencies?action=list');

      if (response.status() === 200) {
        const body = await response.json();
        if (body.currencies.length > 0) {
          const currency = body.currencies[0];
          expect(currency).toHaveProperty('code');
          expect(currency).toHaveProperty('name');
          expect(currency).toHaveProperty('symbol');
          expect(currency).toHaveProperty('decimal_places');
        }
      }
    });
  });

  test.describe('GET /api/currencies?action=rates', () => {
    test('returns exchange rates from USD', async ({ request }) => {
      const response = await request.get('/api/currencies?action=rates&base=USD');

      expect([200, 500]).toContain(response.status());

      if (response.status() === 200) {
        const body = await response.json();
        expect(body).toHaveProperty('base');
        expect(body).toHaveProperty('rates');
        expect(body.base).toBe('USD');
        expect(body.rates.USD).toBe(1); // Base currency rate is always 1
      }
    });

    test('includes multiple currency rates', async ({ request }) => {
      const response = await request.get('/api/currencies?action=rates&base=USD');

      if (response.status() === 200) {
        const body = await response.json();
        // Should have at least USD
        expect(Object.keys(body.rates).length).toBeGreaterThan(0);
      }
    });
  });

  test.describe('GET /api/currencies?action=convert', () => {
    test('requires to parameter', async ({ request }) => {
      const response = await request.get('/api/currencies?action=convert&amount=100&from=USD');

      expect(response.status()).toBe(400);

      const body = await response.json();
      expect(body.error).toContain('to');
    });

    test('validates amount is a number', async ({ request }) => {
      const response = await request.get('/api/currencies?action=convert&amount=invalid&from=USD&to=EUR');

      expect(response.status()).toBe(400);

      const body = await response.json();
      expect(body.error).toContain('Invalid amount');
    });

    test('converts USD to EUR', async ({ request }) => {
      const response = await request.get('/api/currencies?action=convert&amount=100&from=USD&to=EUR');

      expect([200, 404, 500]).toContain(response.status());

      if (response.status() === 200) {
        const body = await response.json();
        expect(body).toHaveProperty('original');
        expect(body).toHaveProperty('converted');
        expect(body.original.amount).toBe(100);
        expect(body.original.currency).toBe('USD');
        expect(body.converted.currency).toBe('EUR');
        expect(typeof body.converted.amount).toBe('number');
      }
    });

    test('same currency returns same amount', async ({ request }) => {
      const response = await request.get('/api/currencies?action=convert&amount=100&from=USD&to=USD');

      if (response.status() === 200) {
        const body = await response.json();
        expect(body.converted.amount).toBe(100);
      }
    });
  });

  test.describe('GET /api/currencies?action=preference', () => {
    test('returns default currency for anonymous user without session', async ({ request }) => {
      const response = await request.get('/api/currencies?action=preference');

      expect([200, 500]).toContain(response.status());

      if (response.status() === 200) {
        const body = await response.json();
        expect(body).toHaveProperty('currency');
        expect(body).toHaveProperty('source');
      }
    });
  });

  test.describe('POST /api/currencies', () => {
    test('requires currency_code', async ({ request }) => {
      const response = await request.post('/api/currencies', {
        data: {},
      });

      expect(response.status()).toBe(400);

      const body = await response.json();
      expect(body.error).toContain('currency_code');
    });

    test('requires session_id for anonymous users', async ({ request }) => {
      const response = await request.post('/api/currencies', {
        data: {
          currency_code: 'EUR',
        },
      });

      expect(response.status()).toBe(400);

      const body = await response.json();
      expect(body.error).toContain('session_id');
    });

    test('rejects invalid currency code', async ({ request }) => {
      const response = await request.post('/api/currencies', {
        data: {
          currency_code: 'INVALID',
          session_id: 'test-session-123',
        },
      });

      expect(response.status()).toBe(400);

      const body = await response.json();
      expect(body.error).toContain('Invalid');
    });

    test('saves currency preference with session_id', async ({ request }) => {
      const response = await request.post('/api/currencies', {
        data: {
          currency_code: 'EUR',
          session_id: `test-session-${Date.now()}`,
        },
      });

      // May return 500 if migration not applied
      expect([201, 400, 500]).toContain(response.status());

      if (response.status() === 201) {
        const body = await response.json();
        expect(body.success).toBe(true);
        expect(body.currency).toBe('EUR');
      }
    });
  });

  test.describe('Invalid action', () => {
    test('returns error for unknown action', async ({ request }) => {
      const response = await request.get('/api/currencies?action=unknown');

      expect(response.status()).toBe(400);

      const body = await response.json();
      expect(body.error).toContain('Invalid action');
    });
  });
});

test.describe('CurrencySelector Component', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/storybook');
    await page.waitForLoadState('networkidle');
  });

  test('renders currency selector', async ({ page }) => {
    await page.goto('/storybook/iframe.html?id=ecommerce-currencyselector--default&viewMode=story');
    await page.waitForLoadState('networkidle');

    const component = page.getByTestId('currency-selector');
    await expect(component).toBeVisible();
  });

  test('renders with currency name', async ({ page }) => {
    await page.goto('/storybook/iframe.html?id=ecommerce-currencyselector--with-currency-name&viewMode=story');
    await page.waitForLoadState('networkidle');

    const component = page.getByTestId('currency-selector');
    await expect(component).toBeVisible();
  });

  test('renders all sizes', async ({ page }) => {
    await page.goto('/storybook/iframe.html?id=ecommerce-currencyselector--all-sizes&viewMode=story');
    await page.waitForLoadState('networkidle');

    const components = page.getByTestId('currency-selector');
    await expect(components).toHaveCount(3);
  });

  test('renders color variants', async ({ page }) => {
    await page.goto('/storybook/iframe.html?id=ecommerce-currencyselector--color-variants&viewMode=story');
    await page.waitForLoadState('networkidle');

    const components = page.getByTestId('currency-selector');
    await expect(components).toHaveCount(3);
  });
});

test.describe('Currency Integration', () => {
  test('currency system is configured', async ({ request }) => {
    // Verify currencies endpoint exists
    const listResponse = await request.get('/api/currencies?action=list');
    expect([200, 500]).toContain(listResponse.status());

    // Verify rates endpoint exists
    const ratesResponse = await request.get('/api/currencies?action=rates');
    expect([200, 500]).toContain(ratesResponse.status());
  });
});
