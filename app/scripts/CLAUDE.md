# Scripts

## seed-products.ts - Product Catalog

**This is where products are defined.** Run this script to populate Medusa with the product catalog.

```bash
npx tsx scripts/seed-products.ts
```

## Adding New Products

1. Add to the `PRODUCTS` array in `seed-products.ts`:

```typescript
{
  title: 'New Product',
  description: 'Product description',
  handle: 'new-product',           // URL-friendly slug
  price: 50000,                    // cents ($500)
  type: 'addon',                   // package|addon|service|subscription
  collection: 'website-addons',    // must match a COLLECTIONS entry
  metadata: {
    type: 'addon',
    deposit_percent: 50,
    features: ['Feature 1', 'Feature 2'],
    billing_period: null,          // 'monthly' for subscriptions
    popular: false,
    stripe_price_id: '',           // only for subscriptions
  },
}
```

2. Run the seed script
3. Product appears in `/api/pricing/products` and Medusa Admin

## Collections

Products are organized into collections:

| Handle | Purpose |
|--------|---------|
| `website-packages` | Main service tiers (Launch, Growth) |
| `website-addons` | Add-on services (Blog, CMS, etc.) |
| `automation-services` | Automation & subscriptions |

## Environment Variables Required

```
MEDUSA_BACKEND_URL=https://your-medusa.railway.app
MEDUSA_ADMIN_EMAIL=admin@example.com
MEDUSA_ADMIN_PASSWORD=your-password
STRIPE_MANAGED_AI_PRICE_ID=price_xxx  # For subscription products
```

## Subscription Products

Subscription products are special - they require additional metadata for Medusa to handle recurring billing:

```typescript
{
  title: 'Managed AI',
  handle: 'managed-ai',
  price: 50000,                    // Monthly price in cents ($500/mo)
  type: 'subscription',
  collection: 'automation-services',
  metadata: {
    type: 'subscription',
    billing_period: 'monthly',     // REQUIRED for subscriptions
    stripe_price_id: 'price_xxx',  // REQUIRED - Stripe price ID for recurring
    features: ['24/7 AI Support', 'Unlimited Workflows'],
    popular: false,
  },
}
```

**Key subscription fields:**
- `metadata.type: 'subscription'` - Identifies as subscription product
- `metadata.billing_period: 'monthly'` - Billing frequency
- `metadata.stripe_price_id` - Links to Stripe recurring price (create in Stripe Dashboard first)

**Medusa handles subscriptions:** The frontend doesn't need special logic. When a subscription product is in the cart, Medusa's checkout process uses the `stripe_price_id` to create a Stripe subscription automatically.

## Key Points

- **Prices are in cents** (50000 = $500)
- **Handle must be unique** (used as product slug)
- **Collection must exist** (defined in COLLECTIONS array)
- **Metadata.type must match product type**
- **Subscription products need stripe_price_id** (create price in Stripe first)
- Script is idempotent (skips existing products)

## Never Do This

- Hardcode products in React components
- Create products via frontend code
- Store product definitions in multiple places
- Create subscriptions directly via Stripe API from frontend
