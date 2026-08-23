import { describe, expect, it } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const APP_ROOT = resolve(__dirname, '..');

describe('retired order commerce surface', () => {
  it('keeps cart, order, quote, appointment-commerce, and embedded payment routes retired', () => {
    const retiredPaths = [
      'app/cart/page.tsx',
      'app/checkout/page.tsx',
      'app/orders/page.tsx',
      'app/quote/page.tsx',
      'app/admin/orders/page.tsx',
      'app/admin/analytics/page.tsx',
      'app/admin/appointments/page.tsx',
      'app/api/cart/route.ts',
      'app/api/checkout/session/route.ts',
      'app/api/orders/route.ts',
      'app/api/admin/analytics/route.ts',
      'app/api/stripe/webhook/route.ts',
      'context/CartContext.tsx',
      'context/StripeContext.tsx',
      'components/PaymentForm.tsx',
    ];

    for (const path of retiredPaths) {
      expect(existsSync(resolve(APP_ROOT, path)), path).toBe(false);
    }
  });

  it('keeps order analytics callers out of retained operator navigation', () => {
    for (const path of ['components/AdminSidebar.tsx', 'components/AdminDashboard.tsx']) {
      const source = readFileSync(resolve(APP_ROOT, path), 'utf8');
      expect(source).not.toContain('/admin/analytics');
      expect(source).not.toMatch(/revenue\s*&\s*trends/i);
    }

    const appSources = [
      'components/AdminSidebar.tsx',
      'components/AdminDashboard.tsx',
    ].map((path) => readFileSync(resolve(APP_ROOT, path), 'utf8'));
    expect(appSources.join('\n')).not.toMatch(/\.from\(['"]orders['"]\)/);
  });

  it('preserves the repository catalog and guarded hosted-payment handoff', () => {
    expect(existsSync(resolve(APP_ROOT, 'lib/offering-catalog.ts'))).toBe(true);
    expect(existsSync(resolve(APP_ROOT, 'app/api/offerings/[slug]/checkout/route.ts'))).toBe(true);

    const pricing = readFileSync(
      resolve(APP_ROOT, 'components/pricing/UnifiedPricingPage.tsx'),
      'utf8',
    );
    expect(pricing).toContain('priced by proposal');
    expect(pricing).not.toContain('/checkout');
    expect(pricing).not.toContain('href="/quote"');
  });
});
