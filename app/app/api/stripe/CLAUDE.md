# Stripe API Routes

See `.claude/rules/medusa-products.md` for product management rules.

## Routes

| Route | Use Case | Called By |
|-------|----------|-----------|
| `/webhook` | Receive Stripe events | Stripe (automated) |
| `/create-payment-intent` | One-time payments for Medusa orders | Checkout page |
| `/create-subscription` | **Legacy** — migrate to Medusa checkout | — |
| `/create-build-checkout` | Custom build flow payments | Build checkout flow |

## Webhook Events

| Event | Action |
|-------|--------|
| `payment_intent.succeeded` | Update order status, record payment |
| `payment_intent.payment_failed` | Mark order as failed |
| `customer.subscription.created` | Sync subscription to Supabase |
| `customer.subscription.updated` | Update subscription status |
| `customer.subscription.deleted` | Mark subscription as canceled |
| `invoice.paid` | Log subscription renewal |
| `invoice.payment_failed` | Warn about failed renewal |

## Payment Intent Flow

```
1. Checkout creates Medusa order via /api/checkout/session
2. Checkout calls /api/stripe/create-payment-intent
3. User completes payment via Stripe Elements
4. Webhook receives payment_intent.succeeded
5. Webhook updates order status in Supabase
```

## Files

| File | Purpose |
|------|---------|
| `create-payment-intent/route.ts` | PaymentIntent for one-time charges |
| `create-subscription/route.ts` | Legacy direct subscription creation |
| `create-build-checkout/route.ts` | Custom build flow checkout |
| `webhook/route.ts` | Handle all Stripe webhook events |
