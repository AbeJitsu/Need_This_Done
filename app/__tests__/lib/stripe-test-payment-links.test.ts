import { describe, expect, it } from 'vitest';
import {
  STRIPE_TEST_LINK_MANIFEST_VERSION,
  isStripeTestPaymentLinkUrl,
  requireStripeTestSecretKey,
  testPaymentLinkOffers,
  validateStripeTestPaymentLinkManifest,
} from '@/lib/stripe-test-payment-links';

function validManifest() {
  return {
    version: STRIPE_TEST_LINK_MANIFEST_VERSION,
    mode: 'test',
    generatedAt: '2026-07-26T00:00:00.000Z',
    offers: testPaymentLinkOffers().map((offer, index) => ({
      slug: offer.offering.slug,
      productId: `prod_test_${index}`,
      priceId: `price_test_${index}`,
      paymentLinkId: `plink_test_${index}`,
      url: `https://buy.stripe.com/test_${index}`,
      currency: 'usd',
      amountCents: offer.chargeAmountCents,
      billingPeriod: offer.offering.billingPeriod,
      catalogPriceCents: offer.offering.priceCents,
      depositPercent: offer.depositPercent,
    })),
  };
}

describe('Stripe test Payment Link catalog selection', () => {
  it('selects only the five direct-sale offers and calculates deposits from the catalog', () => {
    expect(testPaymentLinkOffers()).toMatchObject([
      { offering: { slug: 'starter-site' }, chargeAmountCents: 25_000, depositPercent: 50 },
      { offering: { slug: 'growth-site' }, chargeAmountCents: 75_000, depositPercent: 50 },
      { offering: { slug: 'pro-site' }, chargeAmountCents: 250_000, depositPercent: 50 },
      { offering: { slug: 'automation-setup' }, chargeAmountCents: 15_000, paymentType: 'full_payment' },
      { offering: { slug: 'managed-ai' }, chargeAmountCents: 50_000, paymentType: 'subscription' },
    ]);
  });
});

describe('Stripe test key guard', () => {
  it.each([undefined, '', 'sk_live_123', 'pk_test_123', 'not-a-key'])('rejects %s', (key) => {
    expect(() => requireStripeTestSecretKey(key)).toThrow('STRIPE_TEST_SECRET_KEY');
  });

  it('accepts a test secret key', () => {
    expect(requireStripeTestSecretKey('sk_test_123_abc')).toBe('sk_test_123_abc');
  });
});

describe('Stripe test manifest validation', () => {
  it('accepts the expected five test-mode links', () => {
    expect(validateStripeTestPaymentLinkManifest(validManifest()).offers).toHaveLength(5);
  });

  it('rejects a live URL or catalog mismatch', () => {
    const liveUrl = validManifest();
    liveUrl.offers[0]!.url = 'https://buy.stripe.com/live_123';
    expect(() => validateStripeTestPaymentLinkManifest(liveUrl)).toThrow('not a Stripe test Payment Link');

    const wrongAmount = validManifest();
    wrongAmount.offers[0]!.amountCents = 50_000;
    expect(() => validateStripeTestPaymentLinkManifest(wrongAmount)).toThrow('does not match the repository catalog');
  });

  it('recognizes only Stripe-hosted test Payment Link URLs', () => {
    expect(isStripeTestPaymentLinkUrl('https://buy.stripe.com/test_123')).toBe(true);
    expect(isStripeTestPaymentLinkUrl('https://buy.stripe.com/abc123')).toBe(false);
    expect(isStripeTestPaymentLinkUrl('https://example.com/test_123')).toBe(false);
  });
});
