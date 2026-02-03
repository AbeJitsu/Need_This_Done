# Cart Page

## Unified Cart Display

The cart displays **all items from Medusa**. No separate rendering for different product types.

## Data Source

```typescript
const { cart, itemCount, updateItem, removeItem } = useCart();

// All items come from Medusa cart
cart?.items?.map(item => {
  // Item data
  const title = item.title || item.product?.title;
  const price = item.unit_price;
  const quantity = item.quantity;

  // Product metadata for display styling
  const type = item.product?.metadata?.type;
  const features = item.product?.metadata?.features;
});
```

## Product Type Styling

Use metadata for visual differentiation only:

```typescript
function getItemColor(item): AccentColor {
  const type = item.product?.metadata?.type;
  if (type === 'package') return 'green';
  if (type === 'addon') return 'purple';
  if (type === 'service') return 'blue';
  if (type === 'subscription') return 'purple';
  return 'blue';
}
```

## What NOT to Do

```typescript
// WRONG - No separate service items
const { serviceItems, serviceTotal } = useCart();
{serviceItems.map(si => <ServiceItemCard ... />)}

// RIGHT - Single item loop
{cart?.items?.map(item => <CartItem ... />)}
```

## Cart Operations

All operations go through CartContext → Medusa API:

```typescript
// Update quantity
await updateItem(lineItemId, newQuantity);

// Remove item
await removeItem(lineItemId);
```

## Key Principle

The cart page treats all items identically. Visual styling (colors, labels) comes from product metadata, but the data flow and operations are the same for all product types.
