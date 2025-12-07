# Medusa Ecommerce Integration Guide

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Phase Implementation Guide](#phase-implementation-guide)
3. [Database Strategy](#database-strategy)
4. [API Bridge Pattern](#api-bridge-pattern)
5. [Deployment & Configuration](#deployment--configuration)
6. [Troubleshooting](#troubleshooting)

---

## Architecture Overview

### System Design

The ecommerce integration uses a **headless commerce architecture** with clean separation of concerns:

```
┌─────────────────────────────────────┐
│    Next.js App (Frontend + API)     │
├─────────────────────────────────────┤
│  - /shop storefront (product list)  │
│  - /cart shopping cart UI           │
│  - /checkout payment flow           │
│  - /admin/shop product management   │
│  - API bridges to Medusa backend    │
└────────────┬────────────────────────┘
             │
┌────────────▼────────────────────────┐
│  Medusa Backend Service (Docker)    │
├─────────────────────────────────────┤
│  - Product API                      │
│  - Cart API                         │
│  - Order API                        │
│  - Admin API                        │
└────────────┬─────────┬──────────────┘
             │         │
    ┌────────▼─┐  ┌────▼──────────────┐
    │ Medusa   │  │ Supabase + Next.js│
    │ Postgres │  │ Postgres (app)    │
    │ (Docker) │  │ (separate)        │
    └──────────┘  └───────────────────┘
             │         │
             └─────┬─────┘
                   │
            ┌──────▼──────┐
            │ Redis Cache │
            └─────────────┘
```

### Key Components

| Component | Purpose | Technology | Port |
|-----------|---------|-----------|------|
| **Next.js Frontend** | Product catalog, cart, checkout, admin UI | React + TypeScript | 3000 |
| **Next.js API Routes** | Auth-protected bridges to Medusa | Node.js/TypeScript | 3000 |
| **Medusa Backend** | Ecommerce engine, product management, orders | Express.js | 9000 |
| **Medusa Database** | Product, cart, order data (separate from app) | PostgreSQL 15 | 6432 |
| **App Database** | User accounts, projects, order linking | Supabase PostgreSQL | 5432 |
| **Cache Layer** | Product list, cart, order history | Redis | 6379 |

### Why Separate Databases?

We use separate PostgreSQL instances for **Medusa** and the main **application**:

**Benefits**:
- ✅ Independent schema management - no conflicts
- ✅ Separate backups & recovery strategies
- ✅ Independent scaling - ecommerce traffic doesn't affect user accounts
- ✅ Clean API boundaries - data stays where it belongs
- ✅ Easier migrations - each system evolves independently

**Trade-off**: More containers to manage (acceptable for production resilience)

---

## Phase Implementation Guide

### Phase 1: Docker Infrastructure ✅

**Status**: Completed

Added to `docker-compose.yml`:
- `medusa_postgres` service: Alpine PostgreSQL 15, internal port 5432
- `medusa` service: Express backend on port 9000
- Environment variables via root `.env.local`

**Health Checks**:
- medusa_postgres: Checks `pg_isready`
- medusa: Checks `GET /admin` endpoint

**Key Files**:
- `docker-compose.yml` - Service definitions
- `.env.local` (root) - Shared environment variables

---

### Phase 2: Medusa Backend Bootstrap ✅

**Status**: Completed

**What**: Medusa Express server with placeholder API endpoints

**Structure**:
```
medusa/
├── src/
│   └── index.ts           # Express server, routes
├── medusa-config.js       # Configuration (reads from .env.local)
├── package.json           # Dependencies
├── Dockerfile             # Container definition
├── tsconfig.json          # TypeScript config
├── .env.example           # Environment template
└── README.md              # Documentation
```

**Key Features**:
- CORS enabled for localhost:3000
- Health endpoints: `/health` and `/admin`
- Placeholder API routes for products, carts, orders
- Error handling and 404 responses

**Environment Variables** (from root `.env.local`):
```bash
DATABASE_URL=postgresql://medusa:password@medusa_postgres:5432/medusa
REDIS_URL=redis://redis:6379
MEDUSA_JWT_SECRET=your-jwt-secret
MEDUSA_ADMIN_JWT_SECRET=your-admin-jwt-secret
```

**Key Files**:
- `medusa/medusa-config.js`
- `medusa/src/index.ts`
- `medusa/Dockerfile`

---

### Phase 3: Medusa API Bridge ✅

**Status**: Completed

**What**: Next.js wrapper around Medusa API with retry logic and type safety

**Features**:
- Retry logic with exponential backoff (3 retries, 1s delay)
- Response parsing and error handling
- TypeScript interfaces for type safety
- Handles both store (customer) and admin APIs

**Main Exports** (`app/lib/medusa-client.ts`):

```typescript
medusaClient.products.list()           // GET /store/products
medusaClient.products.get(id)          // GET /store/products/{id}

medusaClient.carts.create(items)       // POST /store/carts
medusaClient.carts.get(cartId)         // GET /store/carts/{cartId}
medusaClient.carts.addLine()           // POST /store/carts/{cartId}/line-items
medusaClient.carts.updateLine()        // PATCH /store/carts/{cartId}/line-items/{lineId}
medusaClient.carts.removeItem()        // DELETE /store/carts/{cartId}/line-items/{lineId}

medusaClient.orders.create()           // POST /store/orders
medusaClient.orders.get(id)            // GET /store/orders/{id}

medusaClient.admin.products.create()   // POST /admin/products (with auth token)
medusaClient.admin.orders.list()       // GET /admin/orders (with auth token)
```

**Cache Integration**:
```typescript
CACHE_KEYS = {
  products: () => 'medusa:products:all',              // CACHE_TTL.MEDIUM (1 min)
  cart: (id) => 'medusa:cart:${id}',                  // 30 seconds
  order: (id) => 'medusa:order:${id}',                // CACHE_TTL.LONG (5 min)
  userOrders: (userId) => 'medusa:orders:user:${userId}' // CACHE_TTL.MEDIUM (1 min)
}
```

**Key Files**:
- `app/lib/medusa-client.ts` - API wrapper
- `app/lib/cache.ts` - Cache keys (modified)

---

### Phase 4: Storefront UI ✅

**Status**: Completed

**What**: Customer-facing shop experience

**Routes**:
| Route | Component | Purpose |
|-------|-----------|---------|
| `/shop` | Shop product grid | Browse all products with pricing |
| `/shop/[productId]` | Product detail page | View full product info, select variant, quantity |
| `/cart` | Shopping cart | View items, adjust quantities, remove items |
| `/checkout` | Checkout form | Guest/auth email, shipping, payment, confirmation |

**Components**:
- `app/context/CartContext.tsx` - Global cart state with localStorage persistence
- `app/components/Navigation.tsx` - Updated with cart icon + badge

**Key Features**:
- Add to cart with quantity selection
- Cart persists across page navigation (localStorage)
- Cart badge shows item count in navigation
- Order summary with subtotal, tax, total
- Guest checkout with email
- Order confirmation screen

**Key Files**:
- `app/app/shop/page.tsx`
- `app/app/shop/[productId]/page.tsx`
- `app/app/cart/page.tsx`
- `app/app/checkout/page.tsx`
- `app/context/CartContext.tsx`

---

### Phase 5: Admin Integration ✅

**Status**: Completed

**What**: Admin dashboard for product and order management

**Routes**:
| Route | Purpose |
|-------|---------|
| `/admin/shop` | Main dashboard with Products & Orders tabs |
| `/admin/shop/products/new` | Create new product form |
| `/admin/shop/orders` | Orders list with status filtering |

**Admin Features**:
- Product listing with edit/delete/publish buttons
- Product creation with validation
- Orders dashboard with status filtering (All, Pending, Completed, Canceled)
- Color-coded status badges
- Admin-only access via `verifyAdmin()` middleware

**Key Files**:
- `app/app/admin/shop/page.tsx`
- `app/app/admin/shop/products/new/page.tsx`
- `app/app/admin/shop/orders/page.tsx`
- `app/app/api/admin/products/route.ts`
- `app/app/api/admin/orders/route.ts`

---

### Phase 6: Auth Integration ✅

**Status**: Completed

**What**: Link Medusa orders to Supabase users for order history

**Database Schema**:
```sql
CREATE TABLE orders (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  medusa_order_id TEXT NOT NULL UNIQUE,
  total INTEGER,
  status TEXT,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

**Row Level Security (RLS)**:
- Users can only view their own orders
- Admins can view all orders

**Order Linking Flow**:
1. **Authenticated Checkout**: Order automatically linked to `auth.user.id`
2. **Guest Checkout**: Email stored, optional login later links to existing account
3. **Dashboard Integration**: "My Orders" section shows user's order history

**Key Files**:
- `supabase/migrations/006_create_medusa_orders_table.sql`
- `app/app/api/user/orders/route.ts`
- `app/components/UserDashboard.tsx` - Enhanced with "My Orders" section

---

### Phase 7: Testing & Documentation ✅

**Status**: Completed

**E2E Test Coverage** (`app/e2e/shop.spec.ts`):
- ✅ Product catalog browsing and detail views
- ✅ Add to cart with quantity selection
- ✅ Cart management (update, remove items)
- ✅ Guest checkout flow with form validation
- ✅ Authenticated checkout and order history
- ✅ Admin dashboard protection
- ✅ Cache integration and efficiency
- ✅ Error handling and edge cases
- ✅ Complete user journey integration test

**Run Tests**:
```bash
# Local development
npm run test:e2e -- e2e/shop.spec.ts

# Docker environment
npm run test:e2e:docker -- e2e/shop.spec.ts

# With verbose output
npx playwright test app/e2e/shop.spec.ts --project=chromium --headed
```

**Key Files**:
- `app/e2e/shop.spec.ts` - Comprehensive test suite
- `docs/MEDUSA_INTEGRATION.md` - This documentation

---

## Database Strategy

### Medusa Database (PostgreSQL in `medusa_postgres` container)

**Purpose**: Ecommerce data (products, variants, carts, orders)

**Connection**: `postgresql://medusa:password@medusa_postgres:5432/medusa`

**Schema** (managed by Medusa):
- products table with variants, pricing
- carts table with line items
- orders table with status tracking
- Medusa-specific tables for tax, shipping, etc.

**Backup Strategy**:
```bash
# Backup Medusa database
docker exec medusa_postgres pg_dump -U medusa medusa > medusa_backup.sql

# Restore from backup
docker exec -i medusa_postgres psql -U medusa medusa < medusa_backup.sql
```

### App Database (Supabase PostgreSQL)

**Purpose**: User accounts, projects, order linking

**Connection**: Via Supabase SDK + environment variables

**Key Table**: `orders` (links Medusa orders to Supabase users)

**Relationship**:
- `orders.medusa_order_id` → Medusa's order ID
- `orders.user_id` → Supabase `auth.users.id`
- Enables user dashboard to show order history

### Data Isolation Pattern

**Each system owns its data**:

```
Medusa Database              App Database
├── products                 ├── auth.users
├── variants                 ├── projects
├── carts                    ├── submissions
├── orders                   ├── orders (linking table)
└── customers                └── [other app data]
```

**No direct queries across databases** - only via API bridges:
- Next.js → Medusa API (via medusa-client.ts)
- Next.js → Supabase API (via Supabase client)

---

## API Bridge Pattern

### Purpose

The API bridge acts as middleware between frontend and Medusa backend, providing:
- Authentication and authorization
- Error handling and retry logic
- Response normalization
- Cache management
- Type safety (TypeScript)

### Flow Diagram

```
Frontend Request
      ↓
Next.js API Route (/api/*)
      ↓
Auth Check (verifyAuth, verifyAdmin)
      ↓
medusaClient.* function
      ↓
Fetch with Retry Logic
      ↓
Response Parsing
      ↓
Cache Management (invalidation)
      ↓
JSON Response to Frontend
```

### Error Handling

**Retry Logic** (in medusa-client.ts):
- Max retries: 3
- Initial delay: 1000ms
- Backoff: Exponential (1s, 2s, 4s)
- Triggers on: 5xx errors, network failures

**Error Responses**:
```typescript
{
  error: "Failed to create product",
  details: "Invalid product data",
  statusCode: 400
}
```

### Example: Adding Item to Cart

```
User clicks "Add to Cart" ($50 product, qty 2)
      ↓
Frontend calls POST /api/cart/{cartId}/items
      ↓
API route validates auth (not needed, guest allowed)
      ↓
Calls medusaClient.carts.addLine(cartId, variant_id, qty)
      ↓
medusaClient sends POST to Medusa backend
      ↓
Medusa returns updated cart
      ↓
API route invalidates cart cache
      ↓
Returns updated cart to frontend
      ↓
CartContext updates, badge shows "2"
```

---

## Deployment & Configuration

### Local Development

**Prerequisites**:
```bash
npm install
docker install  # Docker Desktop or equivalent
```

**Start Everything**:
```bash
# Terminal 1: Start Docker containers
docker-compose up

# Terminal 2: Install Medusa dependencies (first time only)
cd medusa && npm install && cd ..

# Terminal 3: Start Next.js dev server
cd app && npm run dev
```

**Environment Setup**:
- Root `.env.local` - Docker environment variables
- `app/.env.local` - Next.js environment variables

**Access**:
- Frontend: http://localhost:3000
- Medusa Admin: http://localhost:9000/admin
- Medusa API: http://localhost:9000/store/products

### Docker Deployment

**Build Images**:
```bash
docker-compose build
```

**Run Services**:
```bash
docker-compose up -d
```

**Verify Services**:
```bash
# Check container status
docker-compose ps

# View logs
docker-compose logs -f medusa
docker-compose logs -f app

# Test Medusa health
curl http://localhost:9000/health
```

### Environment Variables

**Root `.env.local`** (for Docker Compose):
```bash
# Medusa
MEDUSA_DB_PASSWORD=secure-password-here
MEDUSA_JWT_SECRET=jwt-secret-key
MEDUSA_ADMIN_JWT_SECRET=admin-jwt-secret
MEDUSA_BACKEND_URL=http://medusa:9000

# Redis (shared)
REDIS_URL=redis://redis:6379

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-key
```

**`app/.env.local`** (for Next.js dev):
```bash
# Medusa (for client-side access)
NEXT_PUBLIC_MEDUSA_URL=http://localhost:9000

# Supabase (same as root)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-key
```

---

## Troubleshooting

### Issue: Medusa Container Won't Start

**Symptom**: `medusa` service exits immediately

**Solutions**:
1. Check logs: `docker-compose logs medusa`
2. Verify database is running: `docker-compose logs medusa_postgres`
3. Check environment variables in `.env.local`
4. Ensure port 9000 is available: `lsof -i :9000`

### Issue: Cart Operations Fail

**Symptom**: "Failed to add item to cart" error

**Solutions**:
1. Verify Medusa backend is running: `curl http://localhost:9000/health`
2. Check Redis connection: `redis-cli ping`
3. Review API response in browser dev tools
4. Check medusa-client retry logic in console

### Issue: Orders Not Appearing in Dashboard

**Symptom**: User sees empty order history

**Solutions**:
1. Verify `orders` table exists: `supabase db list`
2. Check RLS policies allow user to view own orders
3. Verify order was created in Medusa: Check `medusa` logs
4. Verify linking happened: Query `supabase` → `orders` table
5. Check cache: `redis-cli KEYS 'medusa:orders:user:*'`

### Issue: Cart Persists Across Users

**Symptom**: Different browsers show same cart

**Solutions**:
1. Cart is stored in localStorage by design
2. Each browser/device gets separate cart
3. When user logs in, link cart to their account
4. Clear localStorage: DevTools → Application → Storage → Clear All

### Issue: Slow Product Loading

**Symptom**: Product page takes 5+ seconds to load

**Solutions**:
1. Check cache hit rate: `redis-cli INFO stats`
2. Verify Medusa responding quickly: `curl -w '@curl-format.txt' http://localhost:9000/store/products`
3. Check network tab in browser dev tools
4. Reduce product query complexity in Medusa
5. Consider implementing pagination

### Issue: Admin Routes Return 401

**Symptom**: "Unauthorized" when accessing `/admin/shop`

**Solutions**:
1. Verify user is logged in
2. Check user has `is_admin = true` in Supabase
3. Review `verifyAdmin()` middleware in `lib/api-auth.ts`
4. Clear browser cookies/localStorage and login again

---

## Next Steps

### Stripe Payment Integration

Once ecommerce core is working:
1. Install `@stripe/stripe-js` and `@stripe/react-stripe-js`
2. Create `app/lib/stripe-client.ts`
3. Add Stripe checkout session endpoint: `/api/checkout/stripe`
4. Update checkout UI to integrate Stripe Payment Element
5. Implement webhook handler for payment confirmations

### Tier 2 Components in Puck

Extend visual page builder with:
- ServiceCard (for service offerings)
- PricingCard (for plan comparison)
- StepCard (for process steps)

### Medusa Admin Customization

Enhance admin experience:
- Custom order status workflow
- Bulk product import/export
- Inventory management
- Discount/coupon system

---

## Resources

- [Medusa Documentation](https://docs.medusajs.com/)
- [Medusa Store API Reference](https://docs.medusajs.com/api/store)
- [Medusa Admin API Reference](https://docs.medusajs.com/api/admin)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Supabase Documentation](https://supabase.com/docs)
- [Redis Documentation](https://redis.io/documentation)

---

## Questions?

Refer to the implementation phases above for specific file locations and code examples. Each phase is self-contained and documents its own architecture.
