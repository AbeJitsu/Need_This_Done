# Context Providers

## CartContext API

See `.claude/rules/medusa-products.md` for product management rules.

```typescript
const {
  cart,           // Medusa cart object
  cartId,         // Cart ID (stored in localStorage)
  itemCount,      // Total item count
  isCartReady,    // Safe for checkout
  addItem,        // addItem(variantId, quantity, { title, unit_price })
  updateItem,     // Update quantity
  removeItem,     // Remove from cart
  clearCart,      // Clear everything
} = useCart();
```

### Product Types in Cart

The cart doesn't distinguish types at runtime. Product metadata comes from Medusa:

```typescript
cart.items.map(item => {
  const type = item.product?.metadata?.type;
  // 'package' | 'addon' | 'service' | 'subscription'
});
```

Subscription products are added to cart like any other. Medusa handles subscription creation at checkout using `metadata.stripe_price_id`.
