# Pricing API

## Purpose

Fetch product catalog from Medusa for the pricing page. This is the **only** source of product data for frontend display.

## Endpoint

```
GET /api/pricing/products
Returns: { packages, addons, services }
```

## Data Flow

```
Medusa Backend → /api/pricing/products → Pricing Page Components
       ↑
  Source of truth
  (seed script or admin dashboard)
```

## Collections in Medusa

| Collection Handle | Product Types |
|-------------------|---------------|
| `website-packages` | Launch Site, Growth Site |
| `website-addons` | Extra Page, Blog, CMS, etc. |
| `automation-services` | Automation Setup, Managed AI |

## Adding New Products

1. Add to `scripts/seed-products.ts` with proper metadata
2. Run `npx tsx scripts/seed-products.ts`
3. Products automatically appear in API response

## Product Metadata

Products must have this metadata in Medusa:

```json
{
  "type": "package|addon|service|subscription",
  "deposit_percent": 50,
  "features": ["Feature 1", "Feature 2"],
  "billing_period": "monthly" | null,
  "popular": true | false,
  "stripe_price_id": "price_xxx" // subscriptions only
}
```

## Never Do This

- Hardcode product arrays in this API
- Return static data instead of fetching from Medusa
- Add product-specific logic that should be in metadata
