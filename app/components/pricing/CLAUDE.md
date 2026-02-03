# Pricing Components

## Critical Rule: No Hardcoded Products

**All product data MUST come from Medusa via `/api/pricing/products`.**

```typescript
// WRONG - Never do this
const PACKAGES = [
  { title: 'Launch Site', price: 500, features: [...] },
  { title: 'Growth Site', price: 1200, features: [...] },
];

// RIGHT - Fetch from API
const [products, setProducts] = useState({ packages: [], addons: [], services: [] });
useEffect(() => {
  fetch('/api/pricing/products')
    .then(res => res.json())
    .then(data => setProducts(data));
}, []);
```

## Product Data Structure

Products from the API include:

```typescript
interface PricingProduct {
  id: string;
  title: string;
  description: string;
  handle: string;
  price: number;          // in cents
  variantId: string;      // Use this for cart
  type: 'package' | 'addon' | 'service' | 'subscription';
  depositPercent: number;
  features: string[];
  billingPeriod: 'monthly' | null;
  popular: boolean;
  stripePriceId?: string;
}
```

## Adding to Cart

Use `variantId` from the product, not a custom ID:

```typescript
const { addItem } = useCart();

// Add product to Medusa cart
await addItem(product.variantId, 1, {
  title: product.title,
  unit_price: product.price,
});
```

## To Add/Edit Products

1. Edit `scripts/seed-products.ts`
2. Run `npx tsx scripts/seed-products.ts`
3. Or use Medusa Admin Dashboard

Never modify this component to add new products.
