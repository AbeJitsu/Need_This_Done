# Library Utilities

## Medusa Client (`medusa-client.ts`)

Central client for all Medusa API communication.

```typescript
import { medusaClient } from '@/lib/medusa-client';

// Products
medusaClient.products.list()
medusaClient.products.get(id)
medusaClient.products.getByHandle(handle)

// Cart
medusaClient.carts.create()
medusaClient.carts.get(cartId)
medusaClient.carts.addItem(cartId, variantId, quantity)
medusaClient.carts.updateItem(cartId, lineItemId, quantity)
medusaClient.carts.removeItem(cartId, lineItemId)

// Orders
medusaClient.orders.create(cartId)
medusaClient.orders.get(orderId)
```

## Stripe Client (`stripe.ts`)

Server-side Stripe operations. **Used by API routes and webhooks, not called directly from frontend.**

```typescript
import { getStripe, createPaymentIntent } from '@/lib/stripe';

// One-time payments (called from /api/stripe/create-payment-intent)
const intent = await createPaymentIntent(amount, currency, metadata);

// Webhook handlers use these for verification
import { constructWebhookEvent } from '@/lib/stripe';
```

**Subscription note:** The `createSubscription` helper exists but subscriptions should be created through Medusa's checkout flow, not called directly. Medusa handles subscription creation using the product's `metadata.stripe_price_id`.

## Key Principle: Source of Truth

| Data | Source |
|------|--------|
| Products | Medusa (`medusa-client.ts`) |
| Cart | Medusa via CartContext |
| Orders | Medusa + Supabase |
| Payments | Stripe via Medusa checkout |
| Subscriptions | Medusa (creates Stripe subscriptions) |
| User data | Supabase |

**Never hardcode product/pricing data in frontend components.**

**Subscriptions flow through Medusa, not direct Stripe API calls.**
