# Hosted Payments Launch Readiness

## Ready now

- The repository owns the public offering names, prices, scope, and contact fallback at `/api/offerings`.
- `/api/offerings/:slug/checkout` redirects only to an HTTPS Stripe-hosted Payment Link.
- Missing or malformed link configuration safely routes to `/contact?offering=:slug`.
- Existing pricing, cart, checkout, appointment, and order behavior remains unchanged.

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
