# Stripe readiness

The Stripe canary is checklist item 20 in the [canonical launch checklist](LAUNCH_CHECKLIST.md). Cloud promotion is the active critical path, but payment credentials, payment references, signed webhooks, and the owner-controlled canary remain separately approved. The paid business gates are separate checklist items 23 and 24.

## Current truth

Stripe is a planned provider boundary, not a live payment product yet.

Hosted payment setup is not part of the provider-free local finish line and does not block manual pilot operation. It does block claiming that the hosted payment path is production-ready.

- The Stripe SDK dependency remains installed for future server-side work.
- The repository-owned catalog currently contains two proposal-based offers with no fixed price and no Payment Link.
- The offering checkout route accepts only reviewed HTTPS Stripe links; with the current empty catalog it safely redirects to `/contact`.
- The old order-centric checkout, cart, and Stripe webhook routes were retired.
- The retained product has no active payment-reference or webhook reconciliation path to claim as production-ready.
- There is no committed `stripe:test-links` command in the current repository. Do not run the old commands that appeared in earlier documentation.

## Recommended first payment decision

For the internal pilot, choose one bounded path:

```text
Custom/proposal-based pilot -> Stripe Invoice -> human confirms payment

Fixed, repeatable pilot offer -> Stripe Test Payment Link -> test checkout

Managed recurring service -> subscriptions + Customer Portal later
```

Recommendation: start with an invoice if the pilot price is still being learned. Create a Payment Link only after the offer, price, currency, refund terms, and delivery scope are fixed. Do not build subscriptions, a portal, and custom checkout at the same time.

## Test-mode work required

1. Owner selects the first paid offer, amount, currency, tax behavior, refund policy, and success/cancel experience.
2. Obtain a real Stripe **test-mode** secret key from the Stripe Dashboard. Keep it only in an ignored local/server environment; never paste it into chat or source control.
3. Create or reuse the test product, price, Payment Link, or invoice configuration in Stripe test mode.
4. Implement the smallest retained application reference needed: Stripe customer/payment/invoice/subscription IDs, not an `orders` replacement.
5. Add a signed webhook endpoint and idempotent event record before relying on asynchronous payment status.
6. Run a controlled test-card checkout or invoice payment, then verify success, decline, duplicate webhook delivery, refund/cancellation, and the operator-visible reference.
7. Remove all test fixtures and keep production payment links unset until the hosted release gate passes.

## Proof required before a public payment CTA

```text
Stripe test event
        |
        v
Verify signature -> deduplicate event -> update minimal reference
        |                         |
        +-------------------------+
                      v
             Supabase project/account view
```

The proof must show that a retry cannot create a duplicate payment record or advance a project twice. It must also show that an invalid signature is rejected and that the app does not trust browser-supplied prices or customer IDs.

## Not yet in scope

- Restoring carts, orders, Medusa, custom checkout, or legacy payment tables.
- Creating Payment Links for every historical offering.
- Subscriptions or Customer Portal before the managed service has a stable recurring offer.
- Live-mode charges before a separate production approval and rollback plan.

## Rollback

Remove the reviewed Payment Link or invoice configuration and leave the catalog link unset. The public route returns to `/contact`; no database rollback is needed for the guarded handoff. If webhook/reference code has been deployed, disable the provider endpoint only through a reviewed deployment and preserve its event audit trail.
