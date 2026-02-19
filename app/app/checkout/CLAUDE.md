# Checkout Flow

See `.claude/rules/medusa-products.md` for product management rules.

## Flow

```
Cart (Medusa) → Checkout Page → Payment (Stripe) → Order (Medusa)
```

## Checkout Session API

```
POST /api/checkout/session
Body: { cart_id, email, order_notes }
Returns: { order_id, requires_appointment }
```

The API:
1. Fetches cart from Medusa
2. Creates Medusa order
3. Saves to Supabase (if authenticated)
4. Returns order details

## Subscription Checkout

```
Frontend adds subscription to cart (same as any product)
        ↓
Checkout calls /api/checkout/session (same as any checkout)
        ↓
Medusa detects subscription → creates Stripe subscription
        ↓
Webhooks sync: Stripe → Medusa → Supabase
```

The frontend doesn't need special subscription logic. Medusa handles everything.
