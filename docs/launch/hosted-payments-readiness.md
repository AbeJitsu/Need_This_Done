# Hosted Payments Launch Readiness

## Ready now

- The repository owns the public offering names, prices, scope, and contact fallback at `/api/offerings`.
- `/api/offerings/:slug/checkout` redirects only to an HTTPS Stripe-hosted Payment Link.
- Missing or malformed link configuration safely routes to `/contact?offering=:slug`.
- Existing pricing, cart, checkout, appointment, and order behavior remains unchanged.

## Local Stripe test Payment Link batch

The local scripts create and verify a test-only batch for the three website-package deposits, Automation Setup paid in full, and the Managed AI monthly subscription. Add a real `STRIPE_TEST_SECRET_KEY=sk_test_...` only to `app/.env.local`; it is separate from the app's `STRIPE_SECRET_KEY` and is never committed.

### Status — deferred and unfinished

The owner has deferred all work that requires obtaining a new API key. No Stripe test assets or local manifest have been created. When the owner explicitly resumes this work, first open the Stripe Dashboard in **Test mode**, go to **Developers → API keys**, and copy the Stripe-issued **Secret key** into `app/.env.local` as `STRIPE_TEST_SECRET_KEY`. A made-up key that merely starts with `sk_test_` will be rejected. Do not paste the key into chat, source control, or any public environment. Then run the three commands below in order.

```bash
cd app
npm run stripe:test-links
npm run stripe:test-links -- --apply
npm run stripe:test-links:verify
```

The default command is read-only. `--apply` creates or reuses only Stripe assets marked as repository-managed test assets, then writes `app/.stripe-test-payment-links.json`, which is ignored by Git. The verifier checks the manifest, Stripe test mode, hosted test URL, amount, and recurring interval against the repository catalog.

Use Stripe test cards only for checkout testing. Do not copy these test URLs into `STRIPE_PAYMENT_LINK_*`, change a public CTA, create standalone links for add-ons/custom work, or make a live payment until the live-launch checklist below is explicitly complete.

## Required before enabling a direct-payment CTA

For each offering to sell directly:

1. Create the Stripe product and confirm its displayed name, currency, price, tax settings, and one-time or recurring billing.
2. Create its Payment Link and test it in Stripe test mode.
3. Set the matching `STRIPE_PAYMENT_LINK_*` variable in the production server environment—not browser code.
4. Confirm the success and cancel destinations, receipt email, and webhook event handling.
5. Make one controlled end-to-end purchase and verify the Stripe event, local payment reference, client visibility, and refund/cancellation process.

## Do not launch yet

- Do not point the public pricing buttons to the new checkout handoff until each selected offer has passed the checklist above.
- Do not remove Medusa/cart or order-dependent appointment/payment paths until their hosted replacements are validated.
- Do not use a Payment Link for custom work; keep custom scope on the project-request and invoice path.

## Rollback

Remove the relevant `STRIPE_PAYMENT_LINK_*` value. The checkout handoff immediately returns to the project-request fallback without a code or database rollback.
