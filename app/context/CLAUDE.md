# Context Providers

## CartContext - Unified Cart

**All products use the Medusa cart.** There is no separate cart system.

### Critical Rule

```typescript
// WRONG - No separate cart systems
const [serviceItems, setServiceItems] = useState([]);
localStorage.setItem('service_items', JSON.stringify(items));

// RIGHT - Everything goes through Medusa cart
const { addItem } = useCart();
await addItem(variantId, quantity);
```

### Cart API

```typescript
const {
  cart,           // Medusa cart object
  cartId,         // Cart ID (stored in localStorage)
  itemCount,      // Total item count
  isCartReady,    // Safe for checkout
  addItem,        // Add product by variantId
  updateItem,     // Update quantity
  removeItem,     // Remove from cart
  clearCart,      // Clear everything
} = useCart();
```

### Adding Items

```typescript
// All product types use the same method
await addItem(
  variantId,        // From Medusa product
  quantity,
  {
    title: 'Product Name',
    unit_price: 50000,  // cents
  }
);
```

### Product Types in Cart

The cart doesn't distinguish between product types at runtime. Product metadata (type, features, billing_period) comes from Medusa when the cart is fetched:

```typescript
cart.items.map(item => {
  const type = item.product?.metadata?.type;
  // 'package' | 'addon' | 'service' | 'subscription'
});
```

### Subscription Products

Subscription products (e.g., Managed AI) are added to cart exactly like any other product:

```typescript
// Same as any product - no special handling
await addItem(subscriptionVariantId, 1, {
  title: 'Managed AI',
  unit_price: 50000,
});
```

**Medusa handles subscription creation at checkout.** The frontend doesn't need to know if a product is a subscription. When the cart contains a subscription product, Medusa's checkout process automatically creates a Stripe subscription using the product's `metadata.stripe_price_id`.

## What NOT to Do

- Create parallel cart/item storage systems
- Store pricing page items in localStorage
- Have different checkout flows for different product types
- Bypass Medusa cart for any product type
- Call Stripe subscription APIs directly from frontend
- Add special frontend logic for subscription products
