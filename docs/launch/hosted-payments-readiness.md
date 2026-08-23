# Stripe readiness

The Stripe canary is checklist item 20 in the [canonical launch checklist](LAUNCH_CHECKLIST.md). Cloud promotion is the active critical path, but payment credentials, payment references, signed webhooks, and the owner-controlled canary remain separately approved. The paid business gates are separate checklist items 23 and 24.

## Current truth

Stripe is a planned provider boundary, not a live payment product yet.

Hosted payment setup is not part of the provider-free local finish line and does not block manual pilot operation. It does block claiming that the hosted payment path is production-ready.

- The Stripe SDK dependency remains installed for future server-side work.
- The public catalog contains a fixed $500 Website Fix and a proposal-based
  Managed Automation offer, with no Payment Link or public payment CTA.
- The offering checkout route accepts only reviewed HTTPS Stripe links; with the current empty catalog it safely redirects to `/contact`.
- The old order-centric checkout and cart routes remain retired.
- The local pre-key candidate has an operator-only, test-mode $250 Website Fix
  start-invoice operation, durable reference, and signed transition webhook.
  Its historical route name is a non-advertised authenticated redirect.
- There is no committed `stripe:test-links` command in the current repository. Do not run the old commands that appeared in earlier documentation.

## Recommended first payment decision

For the internal pilot, choose one bounded path:

```text
Custom/proposal-based pilot -> Stripe Invoice -> human confirms payment

Fixed, repeatable pilot offer -> Stripe Test Payment Link -> test checkout

Managed recurring service -> subscriptions + Customer Portal later
```

The selected local boundary is a $250 test-mode start invoice for the fixed
Website Fix. It remains private and operator-confirmed. Do not add a public
Payment Link, subscriptions, a portal, or custom checkout in this phase.

## Test-mode work required

1. Owner reviews the fixed Website Fix start-invoice amount, tax behavior,
   refund/void policy, and test-only canary scope.
2. Obtain a real Stripe **test-mode** secret key from the Stripe Dashboard. Keep it only in an ignored local/server environment; never paste it into chat or source control.
3. Use the private operator route to create exactly one test invoice; do not
   create a public product, price, or Payment Link for this proof.
4. Verify the durable invoice operation/reference and server-issued retry ID.
5. Use the signed webhook to prove paid, declined, void, refund, duplicate,
   mismatch, and unknown-invoice behavior.
6. Void or refund the test invoice under the reviewed rule and retain the audit
   history.
7. Keep production payment links unset until the hosted release gate passes.

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

Disable the invoice provider and keep the public catalog on `/contact`. Void or
refund only the controlled test invoice. If webhook/reference code is later
deployed, disable it only through a reviewed deployment and preserve invoice,
operation, receipt, and transition history.
