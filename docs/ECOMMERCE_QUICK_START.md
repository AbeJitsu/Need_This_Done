# Ecommerce Quick Start Guide

Get the shop running in under 10 minutes. This guide walks through the essential setup and verifies everything works.

---

## 5-Minute Setup

### 1. Start Docker Services (2 min)

```bash
# From project root
docker-compose up -d

# Verify all services are running
docker-compose ps

# You should see:
# ✓ nginx           (port 80)
# ✓ postgres        (Supabase DB)
# ✓ redis           (cache)
# ✓ app             (Next.js)
# ✓ medusa_postgres (Medusa DB)
# ✓ medusa          (Medusa backend)
```

**Wait for health checks** (30-60 seconds):
```bash
# Monitor startup
docker-compose logs -f medusa

# When you see "Server running on..." it's ready
```

### 2. Install Dependencies (2 min)

```bash
# Medusa dependencies (first time only)
cd medusa && npm install && cd ..

# App dependencies (should already be installed)
cd app && npm install && cd ..
```

### 3. Run Dev Server (1 min)

```bash
# From app/ directory
cd app
npm run dev

# Wait for "ready - started server on 0.0.0.0:3000"
```

### 4. Access the Shop

Open in browser:
- **Shop**: http://localhost:3000/shop
- **Cart**: http://localhost:3000/cart
- **Admin**: http://localhost:3000/admin/shop
- **Medusa API**: http://localhost:9000/store/products

---

## Verification Checklist

### Frontend Working? ✓

```bash
# From app/ in another terminal
curl http://localhost:3000/shop
# Should return HTML page
```

### Medusa Working? ✓

```bash
# Check health
curl http://localhost:9000/health
# Should return 200 OK

# Get products
curl http://localhost:9000/store/products
# Should return JSON with products array
```

### Databases Connected? ✓

```bash
# Check Medusa DB
docker exec medusa_postgres psql -U medusa -d medusa -c "SELECT COUNT(*) FROM information_schema.tables;"
# Should return table count

# Check App DB via Supabase
# Open Supabase dashboard → check orders table exists
```

### Cache Working? ✓

```bash
# Test Redis
redis-cli ping
# Should return PONG

# Check cache keys
redis-cli KEYS "medusa:*"
# Should show cache entries after using shop
```

---

## Common Tasks

### Add Product to Cart (Test Manually)

1. Navigate to http://localhost:3000/shop
2. Click "$50 Quick Task" product
3. Click "Add to Cart"
4. Should see cart badge change from "0" to "1"
5. Click cart icon → should show item

### View Admin Dashboard

1. Navigate to http://localhost:3000/admin/shop
2. Should see "Products" tab
3. Click "Create New Product"
4. Fill form and submit
5. Product appears in list

### Run E2E Tests

```bash
# From app/ directory
npm run test:e2e -- e2e/shop.spec.ts

# Or with specific browser
npx playwright test e2e/shop.spec.ts --project=chromium --headed
```

---

## Troubleshooting Quick Reference

| Problem | Fix |
|---------|-----|
| "Cannot connect to Medusa" | Check `docker-compose ps` - is medusa running? |
| "Cart not updating" | Check browser console for errors. Verify Redis running: `redis-cli ping` |
| "Products not showing" | Check `/api/shop/products` response in Network tab |
| "Tests failing" | Run `npm run typecheck && npm run lint` first |
| "Port already in use" | `lsof -i :3000` and kill the process, or use different port |
| "Database connection failed" | Check .env.local variables match docker-compose config |

---

## Project Structure Overview

```
project-root/
├── docker-compose.yml      # All services defined here
├── .env.local              # Shared environment (root level)
│
├── medusa/                 # Ecommerce backend
│   ├── src/index.ts        # Express server
│   ├── medusa-config.js    # Config file
│   └── Dockerfile          # Container definition
│
└── app/                    # Next.js application
    ├── .env.local          # Next.js environment
    ├── app/
    │   ├── shop/           # Shop pages
    │   ├── cart/           # Cart page
    │   ├── checkout/       # Checkout page
    │   ├── admin/shop/     # Admin dashboard
    │   └── api/            # API routes
    ├── context/
    │   └── CartContext.tsx # Cart state management
    ├── lib/
    │   ├── medusa-client.ts # API wrapper
    │   └── cache.ts        # Cache keys
    └── e2e/
        ├── shop.spec.ts    # Shop tests
        └── helpers.ts      # Test utilities
```

---

## Development Workflow

### Making Changes

**Frontend Changes**:
```bash
cd app
npm run dev
# Hot reload on save
```

**Backend Changes** (Medusa):
```bash
# Edit medusa/src/index.ts
# Changes auto-reload via nodemon
```

**Database Changes**:
```bash
# Add migration
supabase migration new my_migration

# Run migrations
supabase db reset
```

### Before Committing

```bash
cd app

# Type check
npm run typecheck

# Lint
npm run lint

# Run tests
npm run test:e2e -- e2e/shop.spec.ts

# Run full test suite
npm run test:e2e
```

---

## Key Files You'll Edit

### Add New Product Type
**File**: `medusa/src/index.ts`
- Update products array with your new product

### Modify Cart Behavior
**File**: `app/context/CartContext.tsx`
- Adjust addItem, removeItem, updateItem logic

### Change Checkout Flow
**File**: `app/app/checkout/page.tsx`
- Modify form fields, validation, order submission

### Add Admin Feature
**File**: `app/app/admin/shop/page.tsx`
- Add new tab, button, or management feature

### Update Product Display
**File**: `app/app/shop/page.tsx`
- Change product grid layout, filtering, sorting

---

## Testing Your Changes

### Quick Test (2 min)

```bash
# Just product browsing
npm run test:e2e -- e2e/shop.spec.ts --grep "Product Catalog"

# Just add to cart
npm run test:e2e -- e2e/shop.spec.ts --grep "Add to Cart"

# Just checkout
npm run test:e2e -- e2e/shop.spec.ts --grep "Guest Checkout"
```

### Full Test (5 min)

```bash
# All shop tests
npm run test:e2e -- e2e/shop.spec.ts

# All tests (shop + pages + auth + etc)
npm run test:e2e
```

### Watch Mode

```bash
# Continuously run tests on file changes
npx playwright test --watch
```

---

## Environment Variables Explained

### Root `.env.local` (Docker Compose)

```bash
# Medusa Backend
MEDUSA_BACKEND_URL=http://medusa:9000          # Internal Docker URL
MEDUSA_DB_PASSWORD=your-medusa-db-password     # Medusa PostgreSQL password
MEDUSA_JWT_SECRET=your-jwt-secret              # Authentication token secret
MEDUSA_ADMIN_JWT_SECRET=your-admin-jwt-secret  # Admin token secret

# Redis
REDIS_URL=redis://redis:6379                   # Shared cache

# Supabase (for Docker containers)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-key          # Admin key for migrations
```

### App `.env.local` (Next.js)

```bash
# Medusa (for Next.js client-side)
NEXT_PUBLIC_MEDUSA_URL=http://localhost:9000   # Local development

# Supabase (same as root)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-key          # For API routes
```

---

## Common First Changes

### 1. Change Product Pricing

**File**: `medusa/src/index.ts`

Find the products array:
```javascript
// BEFORE
{ id: 'prod_1', name: 'Quick Task', price: 5000 }  // $50

// AFTER
{ id: 'prod_1', name: 'Quick Task', price: 7500 }  // $75
```

### 2. Add New Product

**File**: `medusa/src/index.ts`

```javascript
{
  id: 'prod_4',
  name: 'Custom Solution',
  description: 'Tailored to your needs',
  price: 10000, // in cents = $100
  image_url: 'https://...'
}
```

### 3. Customize Checkout Form

**File**: `app/app/checkout/page.tsx`

Add new field:
```tsx
<input
  type="text"
  placeholder="Company"
  value={company}
  onChange={(e) => setCompany(e.target.value)}
/>
```

### 4. Change Cart Design

**File**: `app/app/cart/page.tsx`

Modify the grid:
```tsx
// BEFORE
<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

// AFTER
<div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
```

---

## Performance Tips

### Cache Management

```bash
# View all cache keys
redis-cli KEYS "*"

# Clear specific cache
redis-cli DEL "medusa:products:all"

# Clear all cache
redis-cli FLUSHALL
```

### Check Load Time

```bash
# Time a request
time curl http://localhost:9000/store/products

# Should be < 100ms for cached requests
# ~500ms for first request (no cache)
```

### Monitor Services

```bash
# Watch container stats
docker stats

# Watch logs
docker-compose logs -f medusa app
```

---

## Next: What's Next?

After getting shop working:

1. **Stripe Integration** - Add real payments
   - See `docs/MEDUSA_INTEGRATION.md` → "Stripe Payment Integration"

2. **Advanced Admin** - Add inventory management
   - Modify `/admin/shop/products/` pages

3. **Custom Styling** - Match your brand
   - Update `app/app/shop/page.tsx` styles

4. **User Accounts** - Show order history
   - Already implemented! Check `/dashboard`

5. **Email Notifications** - Order confirmations
   - Add Sendgrid integration to Medusa

---

## Getting Help

### Check Logs

```bash
# Next.js errors
docker-compose logs app

# Medusa errors
docker-compose logs medusa

# Database errors
docker-compose logs medusa_postgres
```

### Run Tests

```bash
# Test specific flow
npm run test:e2e -- e2e/shop.spec.ts --grep "Guest Checkout"

# See what's happening
npm run test:e2e -- e2e/shop.spec.ts --headed
```

### Read Documentation

- [docs/MEDUSA_INTEGRATION.md](./MEDUSA_INTEGRATION.md) - Full architecture
- [app/e2e/shop.spec.ts](../app/e2e/shop.spec.ts) - Test examples
- [app/README.md](../app/README.md) - Project structure

---

## Quick Reference: Common Commands

```bash
# Start everything
docker-compose up -d

# Stop everything
docker-compose down

# View logs
docker-compose logs -f medusa

# Run Next.js dev
cd app && npm run dev

# Run tests
cd app && npm run test:e2e

# Type check
cd app && npm run typecheck

# Lint code
cd app && npm run lint

# Reset database
cd app && supabase db reset

# Access Supabase dashboard
# https://app.supabase.com/

# SSH into Medusa container
docker exec -it medusa sh

# Restart a service
docker-compose restart medusa
```

---

## You're Ready! 🚀

The shop is now live at **http://localhost:3000/shop**.

Try:
- ✅ Browse products
- ✅ Add to cart
- ✅ Check out
- ✅ View admin dashboard
- ✅ Run tests

Then refer to [docs/MEDUSA_INTEGRATION.md](./MEDUSA_INTEGRATION.md) for deeper understanding of how everything works together.
