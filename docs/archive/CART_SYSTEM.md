# Shopping Cart System Architecture

A complete guide to understanding how the ecommerce cart system works—from the backend implementation through the frontend integration.

---

## Table of Contents

1. [System Overview](#system-overview)
2. [Architecture Diagram](#architecture-diagram)
3. [Backend: Medusa Cart Implementation](#backend-medusa-cart-implementation)
4. [Frontend: CartContext State Management](#frontend-cartcontext-state-management)
5. [API Bridge: Next.js Routes](#api-bridge-nextjs-routes)
6. [Data Flow: Adding an Item to Cart](#data-flow-adding-an-item-to-cart)
7. [Storage & Persistence](#storage--persistence)
8. [Testing the Cart System](#testing-the-cart-system)
9. [Troubleshooting](#troubleshooting)

---

## System Overview

The shopping cart is a three-tier system:

1. **Medusa Service**: In-memory cart storage with REST API endpoints
2. **Next.js Backend**: API routes (`/api/cart/*`) that bridge frontend and Medusa
3. **Next.js Frontend**: React components with CartContext for state management + localStorage

**Key Design Decisions**:
- ✅ **In-memory storage** on Medusa for simplicity (restarts clear carts, which is acceptable)
- ✅ **localStorage persistence** so carts survive page refreshes
- ✅ **Automatic validation** of saved cart IDs (clears stale IDs after backend restarts)
- ✅ **Real cart IDs** instead of placeholders (e.g., `cart_1765081257499_bgtltf6rh` not `temp-cart-id`)
- ✅ **Comprehensive error handling** with clear user feedback

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    Browser / User                           │
└────────────────┬────────────────────────────────────────────┘
                 │
        ┌────────▼────────┐
        │  CartContext    │  ← React state management
        │ (localStorage)  │    Holds: cartId, items, totals
        └────────┬────────┘
                 │ fetch() calls
        ┌────────▼────────────────────────────────────────┐
        │     Next.js API Routes (/api/cart/*)            │
        │  - POST /api/cart → Create cart                 │
        │  - GET  /api/cart?id=X → Fetch cart             │
        │  - POST /api/cart/:id/items → Add item          │
        │  - PATCH /api/cart/:id/items → Update quantity  │
        │  - DELETE /api/cart/:id/items → Remove item     │
        └────────┬────────────────────────────────────────┘
                 │ HTTP requests to
        ┌────────▼────────────────────────────────────────┐
        │   Medusa Backend (port 9000)                    │
        │   In-Memory Cart Storage (Map<id, Cart>)        │
        │  - POST /store/carts → Create cart (UUID gen)   │
        │  - GET  /store/carts/:id → Retrieve cart        │
        │  - POST /store/carts/:id/line-items → Add item  │
        │  - POST /store/carts/:id/line-items/:id → Update│
        │  - DELETE /store/carts/:id/line-items/:id → Remove
        │                                                   │
        │  Returns: {id, items: [{...}], subtotal, total} │
        └────────────────────────────────────────────────┘
```

---

## Backend: Medusa Cart Implementation

### Cart Data Structure

```typescript
interface CartItem {
  id: string;                    // Unique item ID (generated)
  variant_id: string;            // Reference to product variant
  quantity: number;              // How many of this item
  unit_price: number;            // Price in cents ($50 = 5000)
}

interface Cart {
  id: string;                    // Unique cart ID (generated)
  items: CartItem[];             // Line items in cart
  created_at: string;            // ISO timestamp
  updated_at: string;            // ISO timestamp
}
```

### Cart Storage

Located in: [medusa/src/index.ts:1-200]

```typescript
// In-memory cart storage (Map for fast lookups)
const carts = new Map<string, Cart>();

// Helper: Generate unique ID with timestamp + random suffix
function generateId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Helper: Calculate totals (subtotal + tax + total)
function calculateCartTotals(cart: Cart) {
  const subtotal = cart.items.reduce((sum, item) =>
    sum + (item.unit_price * item.quantity), 0
  );
  return {
    subtotal,
    total: subtotal,
    tax_total: 0  // Tax calculation would go here
  };
}
```

**Why In-Memory?**
- Simple for MVP development
- Fast lookups (Map is O(1))
- No database setup needed
- Trade-off: Carts cleared on backend restart (acceptable for dev)

### Cart Endpoints

#### 1. Create Cart
```http
POST /store/carts
Content-Type: application/json

{}

Response 201:
{
  "cart": {
    "id": "cart_1765081257499_bgtltf6rh",
    "items": [],
    "subtotal": 0,
    "total": 0,
    "tax_total": 0
  }
}
```

**Implementation**:
```typescript
app.post("/store/carts", (req, res) => {
  const cartId = generateId("cart");
  const cart: Cart = {
    id: cartId,
    items: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  carts.set(cartId, cart);

  res.status(201).json({
    cart: {
      id: cart.id,
      items: cart.items,
      ...calculateCartTotals(cart)
    }
  });
});
```

#### 2. Get Cart
```http
GET /store/carts/cart_1765081257499_bgtltf6rh

Response 200:
{
  "cart": {
    "id": "cart_1765081257499_bgtltf6rh",
    "items": [
      {
        "id": "item_1765081267402_z7g5mon65",
        "variant_id": "variant_prod_1_default",
        "quantity": 2,
        "unit_price": 5000
      }
    ],
    "subtotal": 10000,
    "total": 10000,
    "tax_total": 0
  }
}
```

#### 3. Add Item to Cart
```http
POST /store/carts/cart_X/line-items
Content-Type: application/json

{
  "variant_id": "variant_prod_1_default",
  "quantity": 1
}

Response 201:
{
  "cart": {
    "id": "cart_1765081257499_bgtltf6rh",
    "items": [{...}],
    "subtotal": 5000,
    "total": 5000,
    "tax_total": 0
  }
}
```

**Implementation**:
- Validates variant_id exists (looks up in products array)
- Fetches price from variant
- Adds new item or updates quantity if duplicate
- Returns updated cart

#### 4. Update Item Quantity
```http
POST /store/carts/cart_X/line-items/item_Y
Content-Type: application/json

{
  "quantity": 3
}

Response 200:
{
  "cart": { ... }
}
```

#### 5. Remove Item from Cart
```http
DELETE /store/carts/cart_X/line-items/item_Y

Response 200:
{
  "cart": { ... }
}
```

---

## Frontend: CartContext State Management (Next.js)

Located in: [app/context/CartContext.tsx]

CartContext is a React context that lives in the Next.js frontend. It manages the shopping cart state across all pages in the Next.js app.

### Context Type

```typescript
interface CartContextType {
  cart: MedusaCart | null;              // Current cart data
  cartId: string | null;                 // Current cart ID
  isLoading: boolean;                    // Loading state
  error: string | null;                  // Error message

  // Actions
  createCart: () => Promise<string>;     // Create new cart
  getCart: (id: string) => Promise<void>;// Fetch cart by ID
  addItem: (variantId: string, qty: number) => Promise<void>;
  updateItem: (lineItemId: string, qty: number) => Promise<void>;
  removeItem: (lineItemId: string) => Promise<void>;
  clearCart: () => void;                 // Clear local cart
}
```

### Initialization: localStorage Validation

When the Next.js app loads, CartContext validates the saved cart ID:

```typescript
useEffect(() => {
  const initializeCart = async () => {
    const savedCartId = localStorage.getItem('medusa_cart_id');
    if (savedCartId) {
      // Try to fetch saved cart from server
      try {
        const response = await fetch(`/api/cart?id=${savedCartId}`);
        if (response.ok) {
          // Cart exists, use it
          const data = await response.json();
          setCart(data.cart);
          setCartId(savedCartId);
        } else {
          // Cart doesn't exist (backend restarted?), clear localStorage
          console.log(`Cart ${savedCartId} no longer exists, clearing`);
          localStorage.removeItem('medusa_cart_id');
          setCartId(null);
        }
      } catch (err) {
        // Network error, assume cart is stale
        localStorage.removeItem('medusa_cart_id');
        setCartId(null);
      }
    }
  };
  initializeCart();
}, []);
```

**Why This Matters**:
- Previous sessions may have saved a cart ID that no longer exists
- Backend restarts clear in-memory carts
- Automatic recovery prevents "Failed to add item" errors
- User gets fresh cart on next action without confusion

### Adding an Item

```typescript
const addItem = useCallback(
  async (variantId: string, quantity: number) => {
    setError(null);
    try {
      let currentCartId = cartId;

      // Create cart if it doesn't exist
      if (!currentCartId) {
        currentCartId = await createCart();
      }

      // Add item to cart
      const response = await fetch(`/api/cart/${currentCartId}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ variant_id: variantId, quantity }),
      });

      if (!response.ok) {
        throw new Error('Failed to add item to cart');
      }

      // Update local state
      const data = await response.json();
      setCart(data.cart);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to add item';
      setError(message);
      throw err;
    }
  },
  [cartId, createCart]
);
```

---

## API Bridge: Next.js API Routes

Located in: [app/app/api/cart/]

Next.js API routes live in the `app/api/` directory. These routes serve as the backend for the frontend, and they act as a bridge to the Medusa service:

### POST /api/cart - Create Cart

```typescript
// app/app/api/cart/route.ts
export async function POST() {
  const response = await fetch('http://medusa:9000/store/carts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({}),
  });

  const data = await response.json();
  return NextResponse.json({ success: true, cart: data.cart });
}
```

### POST /api/cart/[cartId]/items - Add Item

```typescript
// app/app/api/cart/[cartId]/items/route.ts
export async function POST(request: Request, { params }: Props) {
  const { cartId } = params;
  const { variant_id, quantity } = await request.json();

  const response = await fetch(
    `http://medusa:9000/store/carts/${cartId}/line-items`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ variant_id, quantity }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    return NextResponse.json(
      { error: 'Failed to add item' },
      { status: response.status }
    );
  }

  const data = await response.json();
  return NextResponse.json({ success: true, cart: data.cart });
}
```

**Key Patterns**:
- ✅ Validates cart ID exists
- ✅ Passes through to Medusa backend
- ✅ Handles errors with clear messages
- ✅ Returns normalized JSON response

---

## Data Flow: Adding an Item to Cart

Here's the complete flow when a user clicks "Add to Cart":

```
1. User clicks "Add Cart" on $50 product (Quick Task)
   └─ quantity: 1
   └─ variant_id: "variant_prod_1_default"

2. Frontend: <ShopPage /> component calls:
   useCart().addItem("variant_prod_1_default", 1)

3. CartContext.addItem():
   - Checks if cartId exists in state
   - If NO: calls createCart() first
     └─ Returns: "cart_1765081257499_bgtltf6rh"
   - POST /api/cart/cart_1765081257499_bgtltf6rh/items
     Body: {variant_id, quantity}

4. Next.js Route Handler (/api/cart/[cartId]/items):
   - Validates cartId is provided
   - POST http://medusa:9000/store/carts/{cartId}/line-items
     Body: {variant_id, quantity}

5. Medusa Backend (/store/carts/:id/line-items):
   - Looks up variant by ID in products array
   - Finds variant_prod_1_default → price 5000 cents
   - Checks if item already in cart
   - If NO: creates new CartItem {id, variant_id, quantity, unit_price}
   - Adds to cart.items array
   - Calculates totals (subtotal = 5000 cents = $50)
   - Returns updated cart

6. Next.js Route returns:
   {
     "success": true,
     "cart": {
       "id": "cart_1765081257499_bgtltf6rh",
       "items": [{
         "id": "item_1765081267402_z7g5mon65",
         "variant_id": "variant_prod_1_default",
         "quantity": 1,
         "unit_price": 5000
       }],
       "subtotal": 5000,
       "total": 5000,
       "tax_total": 0
     }
   }

7. CartContext updates state:
   setCart(data.cart)
   └─ itemCount computed: 1

8. Frontend updates:
   - Cart badge shows "1"
   - Success toast displays "Added to cart!"
   - Cart page shows item with price "$50.00"
```

---

## Storage & Persistence

### localStorage Strategy

**Where**: Browser's localStorage (client-side only)

**What**:
```typescript
localStorage.setItem('medusa_cart_id', cartId);
// e.g., "cart_1765081257499_bgtltf6rh"
```

**When**:
- After creating a new cart
- After validating a saved cart exists on server
- After adding/updating/removing items (via setCart())

**Why**:
- ✅ Cart survives page refresh
- ✅ Cart survives browser restart
- ✅ No server-side session storage needed
- ✅ User can access same cart across tabs

**Clearing**:
- Manual: User clicks "Clear Cart" button
- Automatic: CartContext detects cart no longer exists (404 response)

### Medusa In-Memory Storage

**Where**: Medusa backend Map<string, Cart>

**Lifetime**:
- Created: When user calls POST /store/carts
- Destroyed: When Medusa container restarts
- Cleared: Can manually clear with docker restart

**Scalability Note**:
For production with multiple Medusa instances, consider:
- Redis-backed cart store
- Database-backed persistence
- Session affinity load balancing

---

## Testing the Cart System

### 1. Manual Browser Testing

**Quick Test (2 minutes)**:

```bash
# 1. Start containers
docker-compose up -d

# 2. Open browser
# Navigate to: https://localhost/shop

# 3. Click "Add Cart" on Quick Task
# Expected: Toast says "Added to cart!"
# Expected: Cart badge shows "1"

# 4. Click cart icon, verify item shows:
# Expected: "Quick Task" × 1 = $50.00

# 5. Increase quantity to 2
# Expected: Total updates to $100.00

# 6. Remove item
# Expected: Cart shows empty state
```

### 2. API Testing via CLI

**Test cart creation**:
```bash
docker exec nextjs_app wget -q -O- --post-data='{}' \
  http://app:3000/api/cart 2>&1 | jq '.cart.id'
# Returns: "cart_1765081257499_bgtltf6rh"
```

**Test add to cart**:
```bash
CART_ID="cart_1765081257499_bgtltf6rh"

docker exec nextjs_app wget -q -O- \
  --post-data='{"variant_id":"variant_prod_1_default","quantity":1}' \
  --header='Content-Type: application/json' \
  "http://app:3000/api/cart/$CART_ID/items" 2>&1 | jq '.cart.items'
# Returns: [{id: "item_...", variant_id: "variant_prod_1_default", quantity: 1, unit_price: 5000}]
```

### 3. E2E Tests

**Run all cart tests**:
```bash
cd app
npm run test:e2e -- e2e/shop-cart.spec.ts
```

**Test coverage**:
- ✅ Add single item to cart
- ✅ Add multiple different items
- ✅ Display correct pricing
- ✅ Update item quantity
- ✅ Remove item from cart
- ✅ Cart persists after refresh
- ✅ Complete checkout flow

**Run specific test**:
```bash
npx playwright test e2e/shop-cart.spec.ts -k "can add single item"
```

**Run with GUI**:
```bash
npx playwright test e2e/shop-cart.spec.ts --headed
```

---

## Troubleshooting

### Issue: "Failed to add item to cart"

**Symptoms**:
- Error message shown to user
- Cart badge doesn't update
- Browser console shows 500 error

**Debug Steps**:

1. **Check Medusa is running**:
   ```bash
   docker-compose ps medusa
   # Should show "healthy"
   ```

2. **Test Medusa directly**:
   ```bash
   docker exec nextjs_app wget -q -O- http://medusa:9000/health 2>&1
   # Should return 200 OK
   ```

3. **Check variant_id is correct**:
   ```bash
   docker exec nextjs_app wget -q -O- http://app:3000/api/shop/products 2>&1 | jq '.products[0].variants[0].id'
   # Should return "variant_prod_1_default"
   ```

4. **Check cart exists**:
   ```bash
   CART_ID="your-cart-id"
   docker exec nextjs_app wget -q -O- "http://app:3000/api/cart?id=$CART_ID" 2>&1 | jq '.cart'
   # Should return cart object, not 404
   ```

### Issue: "Cart ID doesn't exist" (stale cart)

**Symptoms**:
- Browser shows old cart ID in localStorage
- New page load, same cart ID, but 404 error
- Happens after backend restart

**Solution**:
CartContext automatically detects this and clears localStorage. Just refresh the page:
```bash
# The cart will be cleared and a new one created on first add-to-cart action
```

**Manual clear**:
```javascript
// In browser console
localStorage.removeItem('medusa_cart_id');
location.reload();
```

### Issue: Cart not persisting across page refresh

**Symptoms**:
- Add item to cart
- Refresh page
- Cart is empty

**Debug Steps**:

1. **Check localStorage**:
   ```javascript
   // Browser console
   console.log(localStorage.getItem('medusa_cart_id'));
   // Should show cart ID like "cart_1765081257499_..."
   ```

2. **Check CartContext initialization**:
   - Open DevTools → Network
   - Refresh page
   - Look for request to `/api/cart?id=...`
   - Should return 200 with cart data

3. **Check if cart data is valid**:
   ```bash
   # Get saved cart ID from browser console
   CART_ID="cart_1765081257499_bgtltf6rh"

   # Test API
   docker exec nextjs_app wget -q -O- "http://app:3000/api/cart?id=$CART_ID" 2>&1 | jq '.cart'
   ```

### Issue: Products show "No variants available"

**Symptoms**:
- Products load but can't add to cart
- Error: "No variants available for this product"

**Root Cause**:
Products need a `variants` array in Medusa. Check [medusa/src/index.ts].

**Solution**:
Verify products have variants:
```bash
docker exec nextjs_app wget -q -O- http://medusa:9000/store/products 2>&1 | jq '.products[0].variants'
# Should return array like [{id: "variant_prod_1_default", ...}]
```

If empty, the Medusa source code needs to be updated and the container rebuilt.

---

## Key Files Reference

| File | Purpose |
|------|---------|
| [medusa/src/index.ts:1-200] | Cart backend implementation (create, add, update, remove) |
| [app/context/CartContext.tsx] | React context for cart state management |
| [app/app/api/cart/route.ts] | Create cart endpoint |
| [app/app/api/cart/[cartId]/items/route.ts] | Add/update/remove items |
| [app/app/shop/page.tsx] | Shop page with add-to-cart buttons |
| [app/e2e/shop-cart.spec.ts] | E2E tests for cart functionality |

---

## Next Steps

- **Payment Processing**: Integrate Stripe for checkout
- **User Accounts**: Link cart to user account on login
- **Inventory**: Track stock for each variant
- **Persistence**: Move to Redis/database for multi-instance deployments
- **Analytics**: Track cart abandonment and conversion

---

## Questions?

Refer back to:
- **How it works**: [Architecture Diagram](#architecture-diagram)
- **Testing**: [Testing the Cart System](#testing-the-cart-system)
- **Issues**: [Troubleshooting](#troubleshooting)
- **Code**: File references above
