# Stripe API Routes

## Overview

These routes handle direct Stripe operations. **Most payment logic should go through Medusa, not these APIs directly.**

## When to Use These APIs

| Route | Use Case | Called By |
|-------|----------|-----------|
| `/webhook` | Receive Stripe events | Stripe (automated) |
| `/create-payment-intent` | One-time payments for Medusa orders | Checkout page (after Medusa order created) |
| `/create-subscription` | **Legacy** - Direct subscription creation | Should migrate to Medusa |
| `/create-build-checkout` | Custom build flow payments | Specific build checkout flow |

## Subscription Handling

**Subscriptions should be handled by Medusa, not called directly.**

```
WRONG (direct Stripe):
Frontend → /api/stripe/create-subscription → Stripe

RIGHT (through Medusa):
Frontend → Add to Cart → Checkout → Medusa → Stripe
```

The `/create-subscription` route exists for legacy compatibility but new subscription flows should use Medusa's checkout process with subscription products.

## Webhook Handler

The webhook route (`/webhook/route.ts`) handles:

| Event | Action |
|-------|--------|
| `payment_intent.succeeded` | Update order status, record payment |
| `payment_intent.payment_failed` | Mark order as failed |
| `customer.subscription.created` | Sync subscription to Supabase |
| `customer.subscription.updated` | Update subscription status |
| `customer.subscription.deleted` | Mark subscription as canceled |
| `invoice.paid` | Log for subscription renewals |
| `invoice.payment_failed` | Warn about failed renewal |

## Payment Intent Flow

For one-time payments (packages, add-ons, services):

```
1. Checkout page creates Medusa order via /api/checkout/session
2. Checkout page calls /api/stripe/create-payment-intent with order details
3. User completes payment via Stripe Elements
4. Webhook receives payment_intent.succeeded
5. Webhook updates order status in Supabase
```

## Key Principle

**Medusa is the source of truth for products and orders.** Stripe is the payment processor. The frontend should interact with Medusa for cart/checkout operations, and Stripe webhooks sync payment status back to our database.

## Files

| File | Purpose |
|------|---------|
| `create-payment-intent/route.ts` | Create PaymentIntent for one-time charges |
| `create-subscription/route.ts` | Legacy direct subscription creation |
| `create-build-checkout/route.ts` | Custom build flow checkout |
| `webhook/route.ts` | Handle all Stripe webhook events |
