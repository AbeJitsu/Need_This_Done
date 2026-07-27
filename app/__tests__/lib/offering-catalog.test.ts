import { describe, expect, it } from 'vitest';
import { OFFERING_CATALOG, publicOfferings } from '@/lib/offering-catalog';

describe('repository-owned offering catalog', () => {
  it('preserves the canonical public package and service prices', () => {
    const prices = Object.fromEntries(OFFERING_CATALOG.map((offering) => [offering.slug, offering.priceCents]));

    expect(prices).toMatchObject({
      'starter-site': 50_000,
      'growth-site': 150_000,
      'pro-site': 500_000,
      'automation-setup': 15_000,
      'managed-ai': 50_000,
      'logo-design': 30_000,
    });
  });

  it('provides scope and a safe custom-work fallback for every public offering', () => {
    for (const offering of publicOfferings()) {
      expect(offering.included.length).toBeGreaterThan(0);
      expect(offering.customWorkFallback).toBe('/contact');
      expect(typeof offering.paymentLink === 'string' || offering.paymentLink === null).toBe(true);
    }
  });
});
