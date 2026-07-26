import { config } from 'dotenv';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import Stripe from 'stripe';
import {
  STRIPE_TEST_LINK_MARKER,
  STRIPE_TEST_LINK_MARKER_VALUE,
  STRIPE_TEST_LINK_MANIFEST_VERSION,
  type StripeTestPaymentLinkManifest,
  type StripeTestPaymentLinkManifestEntry,
  type TestPaymentLinkOffer,
  requireStripeTestSecretKey,
  testPaymentLinkOffers,
} from '../lib/stripe-test-payment-links';

// This tooling intentionally takes its key only from the local file, never an
// inherited shell value that could point at a different Stripe account.
config({ path: path.resolve(process.cwd(), '.env.local'), override: true });

const MANIFEST_PATH = path.resolve(process.cwd(), '.stripe-test-payment-links.json');
const APPLY = process.argv.slice(2).includes('--apply');
const unexpectedArguments = process.argv.slice(2).filter((argument) => argument !== '--apply');

interface ResolvedOffer {
  testOffer: TestPaymentLinkOffer;
  product: Stripe.Product | null;
  price: Stripe.Price | null;
  paymentLink: Stripe.PaymentLink | null;
}

function metadataFor(offer: TestPaymentLinkOffer): Record<string, string> {
  return {
    [STRIPE_TEST_LINK_MARKER]: STRIPE_TEST_LINK_MARKER_VALUE,
    offering_slug: offer.offering.slug,
    payment_type: offer.paymentType,
    catalog_price_cents: String(offer.offering.priceCents),
    charge_amount_cents: String(offer.chargeAmountCents),
    billing_period: offer.offering.billingPeriod ?? 'one_time',
  };
}

function hasMetadata(resource: { metadata: Stripe.Metadata }, offer: TestPaymentLinkOffer): boolean {
  return resource.metadata[STRIPE_TEST_LINK_MARKER] === STRIPE_TEST_LINK_MARKER_VALUE &&
    resource.metadata.offering_slug === offer.offering.slug;
}

async function findProduct(stripe: Stripe, offer: TestPaymentLinkOffer): Promise<Stripe.Product | null> {
  for await (const product of stripe.products.list({ limit: 100 })) {
    if (hasMetadata(product, offer)) return product;
  }
  return null;
}

async function findPrice(
  stripe: Stripe,
  product: Stripe.Product,
  offer: TestPaymentLinkOffer,
): Promise<Stripe.Price | null> {
  for await (const price of stripe.prices.list({ product: product.id, active: true, limit: 100 })) {
    if (hasMetadata(price, offer) &&
      price.currency === 'usd' &&
      price.unit_amount === offer.chargeAmountCents &&
      (offer.offering.billingPeriod === 'monthly'
        ? price.recurring?.interval === 'month'
        : price.type === 'one_time')) {
      return price;
    }
  }
  return null;
}

async function linkUsesPrice(stripe: Stripe, link: Stripe.PaymentLink, priceId: string): Promise<boolean> {
  const lineItems = await stripe.paymentLinks.listLineItems(link.id, { limit: 10 });
  return lineItems.data.length === 1 && lineItems.data[0]?.price?.id === priceId;
}

async function findPaymentLink(
  stripe: Stripe,
  offer: TestPaymentLinkOffer,
  price: Stripe.Price,
): Promise<Stripe.PaymentLink | null> {
  for await (const link of stripe.paymentLinks.list({ limit: 100 })) {
    if (link.active && hasMetadata(link, offer) && await linkUsesPrice(stripe, link, price.id)) {
      return link;
    }
  }
  return null;
}

async function inspectOffer(stripe: Stripe, testOffer: TestPaymentLinkOffer): Promise<ResolvedOffer> {
  const product = await findProduct(stripe, testOffer);
  const price = product ? await findPrice(stripe, product, testOffer) : null;
  const paymentLink = price ? await findPaymentLink(stripe, testOffer, price) : null;
  return { testOffer, product, price, paymentLink };
}

async function ensureOffer(stripe: Stripe, testOffer: TestPaymentLinkOffer): Promise<ResolvedOffer> {
  let resolved = await inspectOffer(stripe, testOffer);
  const metadata = metadataFor(testOffer);

  if (!resolved.product) {
    resolved.product = await stripe.products.create({
      name: `${testOffer.offering.name} (test)`,
      description: testOffer.offering.description,
      metadata,
    });
  }

  if (!resolved.price) {
    resolved.price = await stripe.prices.create({
      product: resolved.product.id,
      currency: 'usd',
      unit_amount: testOffer.chargeAmountCents,
      recurring: testOffer.offering.billingPeriod === 'monthly' ? { interval: 'month' } : undefined,
      metadata,
    });
  }

  if (!resolved.paymentLink) {
    resolved.paymentLink = await stripe.paymentLinks.create({
      line_items: [{ price: resolved.price.id, quantity: 1 }],
      metadata,
    });
  }

  return resolved;
}

function action(value: Stripe.Product | Stripe.Price | Stripe.PaymentLink | null): 'create' | 'reuse' {
  return value ? 'reuse' : 'create';
}

function formatUsd(cents: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100);
}

function printSummary(resolvedOffers: ResolvedOffer[], dryRun = false): void {
  for (const resolved of resolvedOffers) {
    const { testOffer } = resolved;
    const period = testOffer.offering.billingPeriod === 'monthly' ? '/month' : ' one-time';
    const label = testOffer.paymentType === 'deposit' ? '50% deposit' : testOffer.paymentType.replace('_', ' ');
    if (dryRun) {
      console.log(
        `${testOffer.offering.name}: ${formatUsd(testOffer.chargeAmountCents)}${period} (${label}) — ` +
        `product ${action(resolved.product)}, price ${action(resolved.price)}, link ${action(resolved.paymentLink)}`,
      );
    } else {
      console.log(`${testOffer.offering.name}: ${formatUsd(testOffer.chargeAmountCents)}${period} (${label}) — ${resolved.paymentLink?.url}`);
    }
  }
}

function toManifestEntry(resolved: ResolvedOffer): StripeTestPaymentLinkManifestEntry {
  if (!resolved.product || !resolved.price || !resolved.paymentLink) {
    throw new Error(`Cannot write a manifest for ${resolved.testOffer.offering.slug} before all Stripe assets exist.`);
  }

  return {
    slug: resolved.testOffer.offering.slug,
    productId: resolved.product.id,
    priceId: resolved.price.id,
    paymentLinkId: resolved.paymentLink.id,
    url: resolved.paymentLink.url,
    currency: 'usd',
    amountCents: resolved.testOffer.chargeAmountCents,
    billingPeriod: resolved.testOffer.offering.billingPeriod,
    catalogPriceCents: resolved.testOffer.offering.priceCents,
    depositPercent: resolved.testOffer.depositPercent,
  };
}

async function writeManifest(resolvedOffers: ResolvedOffer[]): Promise<void> {
  const manifest: StripeTestPaymentLinkManifest = {
    version: STRIPE_TEST_LINK_MANIFEST_VERSION,
    mode: 'test',
    generatedAt: new Date().toISOString(),
    offers: resolvedOffers.map(toManifestEntry),
  };
  await mkdir(path.dirname(MANIFEST_PATH), { recursive: true });
  await writeFile(MANIFEST_PATH, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
}

async function main(): Promise<void> {
  if (unexpectedArguments.length > 0) {
    throw new Error(`Unknown argument(s): ${unexpectedArguments.join(', ')}. Use --apply or no arguments.`);
  }

  const key = requireStripeTestSecretKey(process.env.STRIPE_TEST_SECRET_KEY);
  const stripe = new Stripe(key);

  if (!APPLY) {
    console.log('Dry run: reading Stripe test mode only; no products, prices, links, or manifest will be created.');
    printSummary(await Promise.all(testPaymentLinkOffers().map((offer) => inspectOffer(stripe, offer))), true);
    return;
  }

  const resolvedOffers: ResolvedOffer[] = [];
  for (const offer of testPaymentLinkOffers()) {
    resolvedOffers.push(await ensureOffer(stripe, offer));
  }

  await writeManifest(resolvedOffers);
  console.log(`Wrote local Stripe test manifest: ${MANIFEST_PATH}`);
  printSummary(resolvedOffers);
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
