import { describe, expect, it } from 'vitest';
import { OFFERING_CATALOG, publicOfferings } from '@/lib/offering-catalog';

describe('repository-owned offering catalog', () => {
  it('publishes the two proposal-based employee stages', () => {
    const prices = Object.fromEntries(OFFERING_CATALOG.map((offering) => [offering.slug, offering.priceCents]));

    expect(prices).toEqual({
      'ai-growth-employee-pilot': null,
      'managed-ai-growth-employee': null,
    });
  });

  it('provides scope and a safe custom-work fallback for every public offering', () => {
    for (const offering of publicOfferings()) {
      expect(offering.included.length).toBeGreaterThan(0);
      expect(offering.customWorkFallback).toBe('/contact');
      expect(offering.paymentLink).toBeNull();
    }
  });
});
