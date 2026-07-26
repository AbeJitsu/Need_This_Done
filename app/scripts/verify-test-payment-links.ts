import { config } from 'dotenv';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import Stripe from 'stripe';
import {
  STRIPE_TEST_LINK_MARKER,
  STRIPE_TEST_LINK_MARKER_VALUE,
  isStripeTestPaymentLinkUrl,
  requireStripeTestSecretKey,
  validateStripeTestPaymentLinkManifest,
} from '../lib/stripe-test-payment-links';

// This tooling intentionally takes its key only from the local file, never an
// inherited shell value that could point at a different Stripe account.
config({ path: path.resolve(process.cwd(), '.env.local'), override: true });

const MANIFEST_PATH = path.resolve(process.cwd(), '.stripe-test-payment-links.json');

async function main(): Promise<void> {
  const key = requireStripeTestSecretKey(process.env.STRIPE_TEST_SECRET_KEY);
  const manifest = validateStripeTestPaymentLinkManifest(
    JSON.parse(await readFile(MANIFEST_PATH, 'utf8')) as unknown,
  );
  const stripe = new Stripe(key);

  for (const entry of manifest.offers) {
    const [product, price, link] = await Promise.all([
      stripe.products.retrieve(entry.productId),
      stripe.prices.retrieve(entry.priceId),
      stripe.paymentLinks.retrieve(entry.paymentLinkId),
    ]);

    if (product.deleted || product.livemode ||
      product.metadata[STRIPE_TEST_LINK_MARKER] !== STRIPE_TEST_LINK_MARKER_VALUE ||
      product.metadata.offering_slug !== entry.slug) {
      throw new Error(`${entry.slug}: product is not the expected Stripe test asset.`);
    }

    if (price.livemode || price.product !== entry.productId || price.currency !== entry.currency ||
      price.unit_amount !== entry.amountCents ||
      (entry.billingPeriod === 'monthly'
        ? price.recurring?.interval !== 'month'
        : price.type !== 'one_time')) {
      throw new Error(`${entry.slug}: price amount or billing interval does not match the catalog.`);
    }

    if (link.livemode || link.url !== entry.url || !isStripeTestPaymentLinkUrl(link.url) ||
      link.metadata[STRIPE_TEST_LINK_MARKER] !== STRIPE_TEST_LINK_MARKER_VALUE ||
      link.metadata.offering_slug !== entry.slug) {
      throw new Error(`${entry.slug}: Payment Link is not the expected Stripe test link.`);
    }

    const lineItems = await stripe.paymentLinks.listLineItems(link.id, { limit: 10 });
    if (lineItems.data.length !== 1 || lineItems.data[0]?.price?.id !== price.id) {
      throw new Error(`${entry.slug}: Payment Link does not use its recorded Stripe Price.`);
    }

    console.log(`${entry.slug}: verified ${entry.url}`);
  }

  console.log(`Verified ${manifest.offers.length} Stripe test Payment Links against the repository catalog.`);
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
