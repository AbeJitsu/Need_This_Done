import { OFFERING_CATALOG, type Offering } from './offering-catalog';

export const STRIPE_TEST_LINK_MARKER = 'need_this_done_test_payment_links';
export const STRIPE_TEST_LINK_MARKER_VALUE = 'v1';
export const STRIPE_TEST_LINK_MANIFEST_VERSION = 1;

const TEST_OFFER_SLUGS = [
  'starter-site',
  'growth-site',
  'pro-site',
  'automation-setup',
  'managed-ai',
] as const;

export type TestPaymentLinkType = 'deposit' | 'full_payment' | 'subscription';

export interface TestPaymentLinkOffer {
  offering: Offering;
  chargeAmountCents: number;
  depositPercent: number | null;
  paymentType: TestPaymentLinkType;
}

export interface StripeTestPaymentLinkManifestEntry {
  slug: string;
  productId: string;
  priceId: string;
  paymentLinkId: string;
  url: string;
  currency: 'usd';
  amountCents: number;
  billingPeriod: 'monthly' | null;
  catalogPriceCents: number;
  depositPercent: number | null;
}

export interface StripeTestPaymentLinkManifest {
  version: typeof STRIPE_TEST_LINK_MANIFEST_VERSION;
  mode: 'test';
  generatedAt: string;
  offers: StripeTestPaymentLinkManifestEntry[];
}

function findCatalogOffering(slug: string): Offering {
  const offering = OFFERING_CATALOG.find((candidate) => candidate.slug === slug);
  if (!offering) throw new Error(`Test Payment Link offer ${slug} is missing from the catalog.`);
  return offering;
}

export function testPaymentLinkOffers(): readonly TestPaymentLinkOffer[] {
  return TEST_OFFER_SLUGS.map((slug) => {
    const offering = findCatalogOffering(slug);

    if (offering.kind === 'package') {
      return {
        offering,
        chargeAmountCents: Math.round(offering.priceCents / 2),
        depositPercent: 50,
        paymentType: 'deposit',
      };
    }

    if (offering.billingPeriod === 'monthly') {
      return {
        offering,
        chargeAmountCents: offering.priceCents,
        depositPercent: null,
        paymentType: 'subscription',
      };
    }

    return {
      offering,
      chargeAmountCents: offering.priceCents,
      depositPercent: null,
      paymentType: 'full_payment',
    };
  });
}

export function requireStripeTestSecretKey(value: string | undefined): string {
  const key = value?.trim();
  if (!key || !/^sk_test_[A-Za-z0-9_]+$/.test(key)) {
    throw new Error(
      'STRIPE_TEST_SECRET_KEY must be a Stripe test secret key beginning with sk_test_. Refusing to continue.',
    );
  }
  return key;
}

export function isStripeTestPaymentLinkUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' &&
      url.hostname === 'buy.stripe.com' &&
      url.pathname.startsWith('/test_');
  } catch {
    return false;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isNullableNumber(value: unknown): value is number | null {
  return value === null || (typeof value === 'number' && Number.isSafeInteger(value));
}

function expectedEntry(offer: TestPaymentLinkOffer): Pick<
  StripeTestPaymentLinkManifestEntry,
  'amountCents' | 'billingPeriod' | 'catalogPriceCents' | 'depositPercent'
> {
  return {
    amountCents: offer.chargeAmountCents,
    billingPeriod: offer.offering.billingPeriod,
    catalogPriceCents: offer.offering.priceCents,
    depositPercent: offer.depositPercent,
  };
}

export function validateStripeTestPaymentLinkManifest(input: unknown): StripeTestPaymentLinkManifest {
  if (!isRecord(input) ||
    input.version !== STRIPE_TEST_LINK_MANIFEST_VERSION ||
    input.mode !== 'test' ||
    typeof input.generatedAt !== 'string' ||
    !Array.isArray(input.offers)) {
    throw new Error('The Stripe test Payment Link manifest has an invalid shape.');
  }

  const expectedOffers = testPaymentLinkOffers();
  if (input.offers.length !== expectedOffers.length) {
    throw new Error('The Stripe test Payment Link manifest must contain exactly the five supported offers.');
  }

  const entries = input.offers.map((value): StripeTestPaymentLinkManifestEntry => {
    if (!isRecord(value) ||
      typeof value.slug !== 'string' ||
      typeof value.productId !== 'string' ||
      typeof value.priceId !== 'string' ||
      typeof value.paymentLinkId !== 'string' ||
      typeof value.url !== 'string' ||
      value.currency !== 'usd' ||
      typeof value.amountCents !== 'number' ||
      !Number.isSafeInteger(value.amountCents) ||
      (value.billingPeriod !== null && value.billingPeriod !== 'monthly') ||
      typeof value.catalogPriceCents !== 'number' ||
      !Number.isSafeInteger(value.catalogPriceCents) ||
      !isNullableNumber(value.depositPercent)) {
      throw new Error('The Stripe test Payment Link manifest contains an invalid offer entry.');
    }

    if (!isStripeTestPaymentLinkUrl(value.url)) {
      throw new Error(`The manifest URL for ${value.slug} is not a Stripe test Payment Link.`);
    }

    return value as unknown as StripeTestPaymentLinkManifestEntry;
  });

  const entriesBySlug = new Map(entries.map((entry) => [entry.slug, entry]));
  if (entriesBySlug.size !== expectedOffers.length) {
    throw new Error('The Stripe test Payment Link manifest contains duplicate offer entries.');
  }

  for (const offer of expectedOffers) {
    const entry = entriesBySlug.get(offer.offering.slug);
    const expected = expectedEntry(offer);
    if (!entry ||
      entry.amountCents !== expected.amountCents ||
      entry.billingPeriod !== expected.billingPeriod ||
      entry.catalogPriceCents !== expected.catalogPriceCents ||
      entry.depositPercent !== expected.depositPercent) {
      throw new Error(`The manifest entry for ${offer.offering.slug} does not match the repository catalog.`);
    }
  }

  return {
    version: STRIPE_TEST_LINK_MANIFEST_VERSION,
    mode: 'test',
    generatedAt: input.generatedAt,
    offers: entries,
  };
}
