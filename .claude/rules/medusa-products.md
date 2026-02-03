# Medusa Product Management Rule

All products, pricing, and catalog data MUST be managed through Medusa. Never hardcode product information in frontend code.

## The Rule

**NO hardcoded products, prices, or catalog data in React components or pages.**

```
WRONG: const PACKAGES = [{ title: 'Launch Site', price: 500 }, ...]
RIGHT: Fetch from /api/pricing/products or Medusa API
```

## Product Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│  SOURCE OF TRUTH: Medusa Backend                                        │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  Products are created via:                                              │
│    - Medusa Admin Dashboard (UI)                                        │
│    - Seed script: npx tsx scripts/seed-products.ts                      │
│                                                                         │
│  Products are consumed via:                                             │
│    - /api/pricing/products → Pricing page                               │
│    - Medusa Store API → Shop pages                                      │
│    - CartContext → Uses Medusa cart for ALL products                    │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

## Product Types & Collections

| Type | Collection Handle | Examples |
|------|-------------------|----------|
| `package` | `website-packages` | Launch Site, Growth Site |
| `addon` | `website-addons` | Extra Page, Blog, CMS |
| `service` | `automation-services` | Automation Setup |
| `subscription` | `automation-services` | Managed AI |

## Product Metadata Schema

All products in Medusa use this metadata structure:

```typescript
metadata: {
  type: 'package' | 'addon' | 'service' | 'subscription',
  deposit_percent: number,      // e.g., 50 for 50%
  features: string[],           // Feature bullet points
  billing_period: 'monthly' | null,
  popular: boolean,             // Highlight in UI
  stripe_price_id?: string,     // For subscriptions
}
```

## Key Files

| File | Purpose |
|------|---------|
| `scripts/seed-products.ts` | Creates products in Medusa |
| `app/api/pricing/products/route.ts` | Fetches products for pricing page |
| `lib/medusa-client.ts` | Medusa API wrapper |
| `context/CartContext.tsx` | Unified cart (all products via Medusa) |

## Adding New Products

1. **Add to seed script** (`scripts/seed-products.ts`)
2. **Run seed**: `npx tsx scripts/seed-products.ts`
3. **OR** Add via Medusa Admin Dashboard

Never add products by:
- Hardcoding arrays in components
- Creating separate localStorage systems
- Building product-specific checkout flows

## Cart Flow

ALL products use the same cart flow:

```
User adds item → CartContext.addItem(variantId) → Medusa Cart API
                                                       ↓
Checkout → /api/checkout/session → Medusa Order → Stripe Payment
```

## Subscription Handling

**Subscriptions are managed through Medusa, not directly through Stripe.**

```
┌─────────────────────────────────────────────────────────────────────────┐
│  SUBSCRIPTION FLOW                                                      │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  1. Product defined in Medusa with metadata.type = 'subscription'       │
│  2. Product added to cart like any other product                        │
│  3. At checkout, Medusa detects subscription and:                       │
│     - Creates Stripe subscription via Medusa's payment provider         │
│     - Stores subscription data in Medusa                                │
│  4. Webhook updates sync Medusa ↔ Stripe ↔ Supabase                     │
│                                                                         │
│  WRONG: Call /api/stripe/create-subscription directly from frontend     │
│  RIGHT: Let Medusa handle subscription creation during checkout         │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

**Subscription product metadata:**
```typescript
metadata: {
  type: 'subscription',
  billing_period: 'monthly',
  stripe_price_id: 'price_xxx',  // Medusa uses this for Stripe integration
}
```

**Key principle:** The frontend doesn't know or care if a product is a subscription. It just adds items to cart and checks out. Medusa handles the complexity.

## Why This Matters

- **Single source of truth**: Prices/products managed in one place
- **Admin can edit**: No code changes needed to update prices
- **Consistency**: Same checkout flow for all product types
- **Analytics**: All orders tracked in Medusa
- **Inventory**: Stock management through Medusa

## Red Flags

If you see any of these patterns, refactor to use Medusa:

| Anti-Pattern | Problem |
|--------------|---------|
| `const PRODUCTS = [...]` in components | Hardcoded data |
| `localStorage.setItem('service_items', ...)` | Separate cart system |
| Price calculations in frontend | Should come from Medusa |
| Product-specific checkout routes | Use unified checkout |
| `if (type === 'service') { /* special handling */ }` | All types use same flow |
