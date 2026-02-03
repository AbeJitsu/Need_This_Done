# Checkout Flow

## Unified Checkout

**One checkout flow for all product types.** No special handling based on product type.

```
Cart (Medusa) → Checkout Page → Payment (Stripe) → Order (Medusa)
```

## Cart Contents

All items come from the Medusa cart:

```typescript
const { cart, cartId, total, isCartReady } = useCart();

// All items are Medusa line items
cart.items.map(item => ({
  title: item.title,
  price: item.unit_price,
  quantity: item.quantity,
  type: item.product?.metadata?.type, // package/addon/service/subscription
}));
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

## What NOT to Do

```typescript
// WRONG - No separate service item handling
const serviceItems = JSON.parse(localStorage.getItem('service_items'));
const serviceTotal = serviceItems.reduce(...);
const combinedTotal = medusaTotal + serviceTotal;

// RIGHT - Single total from Medusa
const { cart } = useCart();
const total = cart?.total || 0;
```

## Product Type Display

Use metadata for UI differentiation only:

```typescript
const getTypeLabel = (item) => {
  const type = item.product?.metadata?.type;
  if (type === 'package') return 'Website Package';
  if (type === 'subscription') return 'Monthly Subscription';
  return 'Product';
};
```

## Subscription Handling

**Subscriptions are handled by Medusa, not the frontend.**

Subscription products have:
- `metadata.type === 'subscription'`
- `metadata.billing_period === 'monthly'`
- `metadata.stripe_price_id` for Stripe integration

```
┌─────────────────────────────────────────────────────────────────────────┐
│  SUBSCRIPTION CHECKOUT FLOW                                             │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  Frontend adds subscription to cart (same as any product)               │
│                 ↓                                                       │
│  Checkout calls /api/checkout/session (same as any checkout)            │
│                 ↓                                                       │
│  Medusa detects subscription item and:                                  │
│    - Uses Stripe payment provider to create subscription                │
│    - Manages recurring billing through Medusa                           │
│                 ↓                                                       │
│  Webhooks sync subscription status: Stripe → Medusa → Supabase          │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

**What NOT to do:**
```typescript
// WRONG - Don't call Stripe subscription API from checkout page
if (hasSubscriptionItems) {
  await fetch('/api/stripe/create-subscription', { ... });
}

// RIGHT - Let Medusa handle it through normal checkout
await fetch('/api/checkout/session', { cart_id, email });
```

The frontend doesn't need special subscription logic. Medusa handles everything.

## Key Principle

The checkout page should never need to know product details beyond what Medusa provides. All business logic (pricing, deposits, subscriptions, features) is in Medusa metadata and handled by the Medusa backend.
