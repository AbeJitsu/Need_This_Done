# Shop Pages

## Product Data Source

Shop products come from **Medusa Store API** via `lib/medusa-client.ts`.

```typescript
import { medusaClient } from '@/lib/medusa-client';

// List products
const products = await medusaClient.products.list();

// Get single product
const product = await medusaClient.products.get(productId);
```

## Adding to Cart

Use the Medusa variant ID:

```typescript
const { addItem } = useCart();

// Get variant from product
const variantId = product.variants[0].id;

await addItem(variantId, quantity, {
  title: product.title,
  unit_price: variant.calculated_price?.calculated_amount,
});
```

## Shop vs Pricing Page Products

Both use Medusa, but different collections:

| Page | Collections | API |
|------|-------------|-----|
| Shop | All products | `medusaClient.products.list()` |
| Pricing | `website-packages`, `website-addons`, `automation-services` | `/api/pricing/products` |

## Product Metadata

Products may have metadata for special handling:

```typescript
product.metadata?.requires_appointment  // Needs scheduling
product.metadata?.type                  // package, addon, service, subscription
```

## Key Principle

Never create product data in frontend code. All products come from Medusa, whether via direct API or the pricing endpoint.
