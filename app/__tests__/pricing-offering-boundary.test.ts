import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const APP_ROOT = resolve(__dirname, '..');

describe('pricing offering boundary', () => {
  it('keeps the retained pricing page independent of Medusa and carts', () => {
    const sources = [
      'components/pricing/UnifiedPricingPage.tsx',
      'components/Wizard/WizardProvider.tsx',
      'components/Wizard/WizardResults.tsx',
    ].map((source) => readFileSync(resolve(APP_ROOT, source), 'utf8'));

    for (const source of sources) {
      expect(source).not.toContain('/api/pricing/products');
      expect(source).not.toContain('CartContext');
      expect(source).not.toContain('/shop/');
    }
  });

  it('routes pricing actions through the guarded offering checkout', () => {
    const actionLink = readFileSync(
      resolve(APP_ROOT, 'components/pricing/OfferingCheckoutLink.tsx'),
      'utf8',
    );

    expect(actionLink).toContain('/api/offerings/${slug}/checkout');
  });
});
