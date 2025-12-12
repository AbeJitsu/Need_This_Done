# NeedThisDone.com

A professional services platform built with Next.js, running in Docker with nginx, Redis, Medusa (ecommerce), and Supabase (auth & database).

---

## Table of Contents

- [Quick Start (30 seconds)](#quick-start)
- [What This Project Is](#what-this-project-is)
- [Architecture Overview](#architecture-overview)
- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Shopping Cart & Ecommerce](#shopping-cart--ecommerce)
- [Caching Strategy](#caching-strategy)
- [Email Notifications](#email-notifications)
- [Testing](#testing)
- [Troubleshooting](#troubleshooting)
- [Design System](#design-system)
- [Key Files Reference](#key-files-reference)

---

## Quick Start

```bash
# Start Docker services (local development)
npm run dev:start

# Start Supabase (auth & database)
supabase start

# Once running, access:
# - App:       https://localhost
# - Storybook: http://localhost:6006
```

**If things break:**
```bash
npm run dev:stop
npm run dev:build && npm run dev:start
```

### Docker Commands

| Command | What it does |
|---------|--------------|
| `npm run dev:start` | Start all dev containers |
| `npm run dev:stop` | Stop all dev containers |
| `npm run dev:restart` | Restart dev containers |
| `npm run dev:build` | Rebuild dev images |
| `npm run dev:logs` | View container logs (live) |
| `npm run dev:status` | Show container status |
| `npm run prod:build` | Build production image (for testing locally) |
| `npm run prod:start` | Start production containers (local testing) |
| `npm run prod:stop` | Stop production containers |

---

## What This Project Is

A modern platform for professional services that combines:

- **E-commerce platform**: Browse products, add to cart, checkout, manage orders
- **User accounts**: Authentication, profiles, order history
- **Admin dashboard**: Manage products, view orders, user management
- **Visual page builder**: Non-technical users can create pages (Puck visual editor)
- **Component library**: Reusable, accessible React components (Storybook)

**Tech Stack:**
- **Frontend**: Next.js 14 (React) with TypeScript
- **Backend**: Next.js API routes + Medusa (ecommerce engine)
- **Database**: Supabase (PostgreSQL with pgvector for AI chatbot)
- **Ecommerce**: Medusa headless commerce engine
- **Payments**: Stripe (one-time & subscriptions)
- **Email**: Resend (transactional emails) - ✅ Configured, sends from hello@needthisdone.com
- **Cache**: Redis for performance
- **Infrastructure**: Docker + Nginx reverse proxy
- **Design**: Tailwind CSS with dark mode support

---

## Architecture Overview

```
┌──────────────────────────────────────────┐
│          Browser / User                  │
└───────────┬────────────────────────────┘
            │
┌───────────▼────────────────────────┐
│   Nginx (reverse proxy, SSL)       │
│   - Routes all traffic (port 443)  │
└───────────┬────────────────────────┘
            │
    ┌───────┴───────┬───────────┐
    │               │           │
┌───▼────────┐  ┌──▼──────┐  ┌─▼──────────┐
│ Next.js    │  │ Medusa  │  │ Supabase   │
│ - Pages    │  │ Backend │  │ - Auth     │
│ - API      │  │ - Cart  │  │ - Database │
│ - Auth     │  │ - Orders│  │            │
└───┬────────┘  └──┬──────┘  └─┬──────────┘
    │              │           │
    └──────────┬───┴───────────┘
               │
    ┌──────────▼──────────┐
    │ Redis Cache         │
    │ - Products          │
    │ - User dashboards   │
    │ - Cart data         │
    └─────────────────────┘
```

**Data Flow**:
1. User makes request to your domain
2. Nginx receives it (handles SSL, routes traffic)
3. Next.js serves pages or API routes
4. Next.js calls Medusa backend for ecommerce
5. Next.js calls Supabase for user/auth data
6. Redis caches frequently accessed data

**Why This Design**:
- ✅ **Separation of concerns** - Commerce, auth, and user data are separate
- ✅ **Independent scaling** - Each service scales independently
- ✅ **Fast iteration** - Change UI without touching business logic
- ✅ **Future-proof** - Can add mobile, CLI, or third-party integrations

### Medusa Backend (Current State)

> **Note**: This is a **bootstrap implementation**, not a full Medusa installation. See [TODO.md](TODO.md) for the full Medusa migration plan.

| Feature | Status | Notes |
|---------|--------|-------|
| Products | Hardcoded | 3 pricing tiers in `medusa/src/index.ts` |
| Carts | In-memory | Lost on container restart |
| Orders | Placeholder | Returns temp ID, linked in Supabase |
| Email | ✅ Ready | Infrastructure ready via `app/lib/email.ts` |

**Products** (hardcoded in `medusa/src/index.ts`):
| Product | Price | Handle |
|---------|-------|--------|
| Quick Task | $50 | `quick-task` |
| Standard Project | $150 | `standard-task` |
| Premium Solution | $500 | `premium-solution` |

---

## Development Setup

### Prerequisites

```bash
# Install Docker
# https://www.docker.com/products/docker-desktop

# Install Supabase CLI (macOS)
brew install supabase/tap/supabase

# Verify installations
docker --version
supabase --version
```

### Starting the Full Stack

**Terminal 1: Start Docker services (commerce + cache)**
```bash
npm run dev:start
```

This starts:
- Nginx (reverse proxy on https://localhost)
- Next.js app (port 3000)
- Medusa backend (port 9000)
- Medusa PostgreSQL (internal)
- Redis cache (internal)

**Terminal 2: Start Supabase (auth + database)**
```bash
supabase start
```

This starts:
- PostgreSQL (port 54322)
- Supabase API (port 54321)
- Realtime server
- Applies migrations

**Once Everything is Running**:
```bash
# App is at https://localhost
# Storybook is at http://localhost:6006
```

### Environment Configuration

**Root `.env.local`** (shared by Docker services):
```bash
# Medusa backend
MEDUSA_DB_PASSWORD=your_secure_password  # Generate: openssl rand -base64 32
MEDUSA_JWT_SECRET=your_jwt_secret  # Generate: openssl rand -base64 32
MEDUSA_ADMIN_JWT_SECRET=your_admin_secret  # Generate: openssl rand -base64 32
MEDUSA_BACKEND_URL=http://medusa:9000  # Internal Docker URL
DATABASE_URL=postgresql://medusa:password@localhost:5432/medusa  # Auto-constructed in docker-compose
COOKIE_SECRET=your_cookie_secret  # Generate: openssl rand -base64 32
ADMIN_CORS=http://localhost:7001,https://localhost  # Admin panel CORS origins

# Redis
REDIS_URL=redis://redis:6379
SKIP_CACHE=true  # Optional: bypass Redis in dev mode

# Supabase (see "Choosing Cloud vs Local Supabase" below)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-key

# Stripe (payments)
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Email (Resend) - ✅ Configured & Deployed
RESEND_API_KEY=re_...                         # Your Resend API key
RESEND_FROM_EMAIL=hello@needthisdone.com      # Verified domain (DNS: DKIM, SPF)
RESEND_ADMIN_EMAIL=abe.raise@gmail.com        # Admin notification recipient

# AI Chatbot (optional - defaults shown)
OPENAI_API_KEY=sk-...
NEXT_PUBLIC_CHATBOT_MODEL=gpt-4o-mini  # Chat model
NEXT_PUBLIC_CHATBOT_MAX_TOKENS=1000  # Max response tokens
NEXT_PUBLIC_CHATBOT_TEMPERATURE=0.7  # Chat creativity (0-1)
OPENAI_EMBEDDING_MODEL=text-embedding-3-small  # Embedding model
EMBEDDING_BATCH_SIZE=100  # Batch size for embeddings
VECTOR_SEARCH_SIMILARITY_THRESHOLD=0.7  # Min similarity score (0-1)
VECTOR_SEARCH_MAX_RESULTS=5  # Max search results

# Site Configuration
NEXT_PUBLIC_SITE_URL=https://localhost  # Used for auth redirects
NEXT_PUBLIC_URL=https://localhost  # Used for metadata/SEO
NODE_ENV=development
```

### Choosing Cloud vs Local Supabase

You can run with **Cloud Supabase** (easier, OAuth works) or **Local Supabase** (offline, free).

**Option A: Cloud Supabase (Recommended for OAuth)**
```bash
# .env.local - Point to your cloud project
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...your-cloud-anon-key
SUPABASE_SERVICE_ROLE_KEY=eyJ...your-cloud-service-key
# Don't set SUPABASE_INTERNAL_URL (not needed for cloud)
```

**Option B: Local Supabase (Offline development)**
```bash
# .env.local - Point to local Supabase + internal URL for Docker
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-local-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-local-service-key

# REQUIRED for Docker: Allows container to reach host's Supabase
SUPABASE_INTERNAL_URL=http://host.docker.internal:54321
```

**Note**: OAuth providers (Google, GitHub, etc.) only work with Cloud Supabase unless you configure them locally. For local development with OAuth, use Cloud Supabase.

### Stopping Services

```bash
# Stop Docker services
npm run dev:stop

# Stop Supabase
supabase stop

# Reset Supabase (clears all data)
supabase db reset
```

### Docker Environments (Local vs Production)

**Important**: Local development and production use completely separate Docker configurations.

| Aspect | Local Development | Production (DigitalOcean) |
|--------|-------------------|---------------------------|
| Compose file(s) | `docker-compose.yml` + `docker-compose.dev.yml` | `docker-compose.production.yml` (standalone) |
| Dockerfile | `app/Dockerfile.dev` | `app/Dockerfile` |
| Source code | Volume mounted (hot reload) | Baked into image |
| SSL | Self-signed (localhost) | Let's Encrypt (needthisdone.com) |
| Ports exposed | 3000, 6379, 6006 (debugging) | 80, 443 only (via nginx) |

**Local Development**
```bash
npm run dev:start
```

See [Docker Commands](#docker-commands) table for all available commands.

The dev overlay (`docker-compose.dev.yml`) adds:
- Volume mounts for hot reload
- `.env.local` mount for environment variables
- Exposed ports for debugging
- Storybook service

**Production Deployment**
```bash
# SSH to DigitalOcean server, then:
git pull origin main
docker-compose -f docker-compose.production.yml up --build -d
```

Production uses a completely standalone compose file - it does NOT reference the base or dev files. Changes to `docker-compose.yml` or `docker-compose.dev.yml` do not affect production.

---

## Project Structure

### Root Level

| File/Folder | Purpose |
|-------------|---------|
| `README.md` | This file - main project documentation |
| `TODO.md` | Task tracker (To Do / In Progress / Done) |
| `CLAUDE.md` | Project guidelines for Claude Code |
| `docker-compose.yml` | Docker service definitions |
| `docker-compose.dev.yml` | Development-specific overrides |
| `nginx/` | Reverse proxy configuration and SSL certs |
| `supabase/` | Database migrations and configuration |
| `medusa/` | Ecommerce backend service |

### Application (`app/`)

| Folder | Purpose |
|--------|---------|
| `app/app/` | Next.js App Router - pages and API routes |
| `├── shop/` | E-commerce shop and product catalog |
| `├── cart/` | Shopping cart page |
| `├── checkout/` | Checkout and order creation |
| `├── admin/` | Admin dashboard (products, orders, users) |
| `├── api/` | API route handlers (auth, products, carts, orders) |
| `app/components/` | Reusable React UI components |
| `app/context/` | React Context providers (CartContext, AuthContext) |
| `app/lib/` | Shared utilities (colors, auth, database, cache) |
| `app/config/` | App-wide configuration |
| `app/e2e/` | End-to-end tests (Playwright) |
| `app/__tests__/` | Unit tests and accessibility tests |

### Key Utilities

| File | What it does |
|------|--------------|
| `app/lib/colors.ts` | Single source of truth for all colors |
| `app/lib/auth.ts` | Authentication utilities |
| `app/lib/supabase.ts` | Supabase database client |
| `app/lib/redis.ts` | Redis cache client |
| `app/lib/medusa-client.ts` | Medusa API wrapper with retry logic |
| `app/lib/cache.ts` | Cache utility with pattern invalidation |
| `app/context/CartContext.tsx` | Shopping cart state management |

---

## Shopping Cart & Ecommerce

### How It Works

The cart system is a **three-tier architecture**:

1. **Medusa Backend** (port 9000) - In-memory cart storage with REST API
2. **Next.js API Routes** (`/api/cart/*`) - Bridge between frontend and Medusa
3. **React CartContext** - Frontend state management with localStorage persistence

### Cart Data Flow

```
User clicks "Add to Cart"
      ↓
CartContext.addItem(variant_id, quantity)
      ↓
POST /api/cart/{cartId}/items
      ↓
POST http://medusa:9000/store/carts/{cartId}/line-items
      ↓
Medusa returns updated cart
      ↓
CartContext updates state + localStorage
      ↓
UI updates: badge shows item count, success toast appears
```

### Medusa API Endpoints

```bash
# Create a new cart
POST /store/carts
→ Returns: {cart: {id, items: [], subtotal: 0, total: 0}}

# Get cart details
GET /store/carts/{cartId}
→ Returns: {cart: {id, items: [...], subtotal, total}}

# Add item to cart
POST /store/carts/{cartId}/line-items
Body: {variant_id: "variant_prod_1_default", quantity: 1}
→ Returns: {cart: {...updated cart with new item...}}

# Update item quantity
POST /store/carts/{cartId}/line-items/{itemId}
Body: {quantity: 2}
→ Returns: {cart: {...}}

# Remove item from cart
DELETE /store/carts/{cartId}/line-items/{itemId}
→ Returns: {cart: {...updated cart...}}
```

### Frontend Usage

```typescript
import { useCart } from '@/context/CartContext';

function ShopPage() {
  const { addItem, cart } = useCart();

  const handleAddToCart = async (variantId: string, quantity: number) => {
    try {
      await addItem(variantId, quantity);
      // Cart updated, UI refreshes automatically
    } catch (error) {
      // Show error to user
    }
  };

  return (
    <>
      <button onClick={() => handleAddToCart('variant_prod_1_default', 1)}>
        Add to Cart
      </button>
      <span>Items in cart: {cart?.items.length || 0}</span>
    </>
  );
}
```

### Testing the Cart

**Manual browser test**:
```bash
# 1. Navigate to https://localhost/shop
# 2. Click "Add Cart" on a product
# 3. Should see success toast
# 4. Cart badge should update
# 5. Click cart icon to view items
```

**API test**:
```bash
# Create cart
CART=$(curl -s -X POST http://localhost:9000/store/carts | jq -r '.cart.id')

# Add item
curl -s -X POST "http://localhost:9000/store/carts/$CART/line-items" \
  -H "Content-Type: application/json" \
  -d '{"variant_id":"variant_prod_1_default","quantity":1}' | jq '.'

# Get cart
curl -s "http://localhost:9000/store/carts/$CART" | jq '.'
```

**Automated E2E tests**:
```bash
cd app
npm run test:e2e -- e2e/shop-cart.spec.ts
```

---

## Caching Strategy

### Why Caching Matters

Without caching, every user request hits the database (slow).
With caching (Redis), most requests are answered from cache (fast).

**Impact**:
- 60-80% reduction in database queries
- 15-50x faster response times on cache hits
- Significantly lower Supabase costs

### Cache-Aside Pattern

The caching system uses a simple, effective pattern:

```
Request comes in
    ↓
Check Redis cache
    ├─ HIT: return cached data (2ms)
    └─ MISS: query database
         ↓
      Store result in Redis with TTL
         ↓
      Return data to user (200-300ms first time)
```

### Adding Caching to Routes

```typescript
import { cache, CACHE_KEYS, CACHE_TTL } from '@/lib/cache';

// In your API route
export async function GET(request: Request) {
  const result = await cache.wrap(
    CACHE_KEYS.myData('some-id'),
    async () => {
      // This function only runs on cache MISS
      const { data, error } = await supabase
        .from('my_table')
        .select('*');

      if (error) throw new Error('Failed to fetch');
      return data;
    },
    CACHE_TTL.MEDIUM  // 60 seconds
  );

  return NextResponse.json(result);
}

// When data changes (create, update, delete)
await cache.invalidate(CACHE_KEYS.myData('some-id'));
```

### Cache Configuration

**TTL Values**:
- `CACHE_TTL.SHORT` (30s) - Frequently updated data
- `CACHE_TTL.MEDIUM` (60s) - Dashboard data (default)
- `CACHE_TTL.LONG` (300s / 5m) - Admin data
- `CACHE_TTL.STATIC` (3600s / 1h) - Services, pricing

**Current Cache Keys**:
```
products:all              All products (1m)
cart:{cartId}            Cart data (30s)
order:{orderId}          Order details (5m)
user:projects:{userId}   User's projects (1m)
admin:projects:all       All projects (5m)
```

---

## Email Notifications

### How It Works

Email is handled by **Resend** with a two-layer architecture:

1. **email.ts** - Core infrastructure (client, retry logic, idempotency)
2. **email-service.ts** - Business logic (what emails to send and when)

### Current Email Capabilities

| Email Type | Status | Trigger |
|------------|--------|---------|
| Admin notifications | ✅ Ready | New project submission |
| Client confirmation | ✅ Ready | After form submission |
| Auth emails | 🔜 Planned | Account creation, login |
| Order confirmations | 🔜 Planned | After purchase (requires Medusa) |

### Email Configuration

```bash
RESEND_API_KEY=re_...                    # API key from resend.com
RESEND_FROM_EMAIL=hello@needthisdone.com # Must match verified domain
RESEND_ADMIN_EMAIL=abe.raise@gmail.com   # Where admin alerts go
```

### Sending Emails

```typescript
import { sendEmailWithRetry } from '@/lib/email';
import { sendAdminNotification, sendClientConfirmation } from '@/lib/email-service';

// Option 1: Use business logic functions (recommended)
await sendAdminNotification({ name: 'John', email: 'john@example.com', ... });
await sendClientConfirmation('john@example.com', { name: 'John' });

// Option 2: Send custom email with retry logic
await sendEmailWithRetry(
  'recipient@example.com',
  'Subject Line',
  <YourReactEmailComponent {...props} />
);
```

### Email Templates

React Email templates are in `app/emails/`:
- `AdminNotification.tsx` - New project alert for admin
- `ClientConfirmation.tsx` - Submission confirmation for clients

---

## Testing

### Test Types

| Type | Command | Purpose |
|------|---------|---------|
| Unit tests | `npm run test:run` | Test functions, utilities |
| Accessibility | `npm run test:a11y` | Test dark mode, contrast, WCAG AA |
| E2E tests | `npm run test:e2e` | Test complete user flows |

### Running Tests

```bash
cd app

# Run all tests once
npm run test:run

# Run tests in watch mode (re-run on file change)
npm test

# Run only accessibility tests
npm run test:a11y

# Run E2E tests
npm run test:e2e

# Run specific E2E test with browser visible
npx playwright test e2e/shop-cart.spec.ts --headed

# Run specific test by name
npx playwright test -k "can add to cart"
```

### E2E Test Coverage

**Shop & Cart** (`e2e/shop-cart.spec.ts`):
- Browse products
- View product details
- Add items to cart
- Update quantities
- Remove items
- Cart persists after refresh

**Auth & Checkout** (`e2e/auth.spec.ts`):
- Login/logout
- Register account
- Protected routes
- Order creation

**Admin** (`e2e/dashboard.spec.ts`):
- Admin-only access
- Product management
- Order dashboard

**Dark Mode** (`e2e/pages-dark-mode.spec.ts`):
- All pages in light mode
- All pages in dark mode
- Contrast ratios meet WCAG AA

### Dark Mode Testing

All components must pass contrast testing in both light and dark modes:

```typescript
import { testBothModes, hasContrastViolations } from '@/__tests__/setup/a11y-utils';

it('should have no contrast issues in both modes', async () => {
  const { container } = render(<MyComponent />);
  const results = await testBothModes(container, 'MyComponent');

  expect(hasContrastViolations(results.light)).toBe(false);
  expect(hasContrastViolations(results.dark)).toBe(false);
});
```

Common dark mode issues & fixes are documented in [docs/DESIGN_SYSTEM.md](docs/DESIGN_SYSTEM.md).

---

## Troubleshooting

### Issue: "Failed to add item to cart"

**Symptom**: Error when clicking "Add to Cart"

**Solutions**:
```bash
# 1. Verify Medusa is running
npm run dev:status
# Medusa should show "healthy"

# 2. Test Medusa directly
curl http://localhost:9000/health
# Should return 200

# 3. Check variant exists
curl http://localhost:3000/api/shop/products | jq '.products[0].variants'
# Should show variant array

# 4. Clear Redis cache
docker exec redis redis-cli FLUSHALL

# 5. Restart services
npm run dev:restart
```

### Issue: Pages loading slowly

**Symptom**: Product page takes 5+ seconds

**Solutions**:
```bash
# Check Redis is running
npm run dev:status

# Check cache hit rate
redis-cli INFO stats

# View cache keys
redis-cli KEYS '*'

# Clear old cache
redis-cli FLUSHALL
```

### Issue: Dark mode contrast problems

**Symptom**: Text hard to read in dark mode

**Solutions**:
```bash
# Run accessibility tests
cd app && npm run test:a11y

# Test locally in browser
# Toggle dark mode → Check all text readable
```

**Fix**: Always use centralized colors from `app/lib/colors.ts`:
```typescript
// ❌ Wrong: hardcoded Tailwind classes
<p className="text-gray-800">Text</p>

// ✅ Right: use color system
import { headingColors, formInputColors } from '@/lib/colors';

<h2 className={headingColors.primary}>Heading</h2>
<p className={formInputColors.helper}>Helper text</p>
```

Available color utilities: `headingColors`, `formInputColors`, `formValidationColors`, `titleColors`, `accentColors`, `navigationColors`, `dangerColors`, `linkColors`, and more. See [app/lib/colors.ts](app/lib/colors.ts) for the full list.

### Issue: Supabase connection errors

**Symptom**: "Failed to connect to Supabase"

**Solutions**:
```bash
# Verify Supabase is running
supabase status

# Check credentials in .env.local
cat .env.local | grep SUPABASE

# Restart Supabase
supabase stop
supabase start

# Reset if needed (WARNING: clears data)
supabase db reset
```

### Issue: Docker containers won't start

**Symptom**: `npm run dev:start` fails

**Solutions**:
```bash
# Check Docker is running
docker ps

# View detailed logs
npm run dev:logs

# Clean and rebuild
npm run dev:stop
npm run dev:build && npm run dev:start

# Check port availability
lsof -i :3000    # App
lsof -i :9000    # Medusa
lsof -i :6379    # Redis
```

---

## Design System

See [docs/DESIGN_SYSTEM.md](docs/DESIGN_SYSTEM.md) for:

- **Color System** - Centralized colors in `app/lib/colors.ts`
- **Accessibility Standards** - WCAG AA compliance, 5:1 contrast minimum
- **Dark Mode Requirements** - Every component must work in light & dark
- **Component Testing** - Automated a11y tests, testing utilities
- **Dark Mode Testing Guide** - Common issues and fixes
- **Component Patterns** - Existing components, building new components

---

## Key Files Reference

### Configuration & Setup
| File | Purpose |
|------|---------|
| `.env.local` | Environment variables (used by Next.js and all services) |
| `docker-compose.yml` | Docker service definitions |
| `app/tsconfig.json` | TypeScript configuration |

### Core Libraries
| File | Purpose |
|------|---------|
| `app/lib/colors.ts` | All color definitions |
| `app/lib/auth.ts` | Authentication logic |
| `app/lib/supabase.ts` | Supabase client setup |
| `app/lib/redis.ts` | Redis cache client |
| `app/lib/medusa-client.ts` | Medusa API wrapper |
| `app/lib/cache.ts` | Caching utility & keys |
| `app/lib/stripe.ts` | Stripe server client |
| `app/lib/email.ts` | Resend email client & helpers |
| `app/lib/email-service.ts` | Email business logic (notifications, confirmations) |

### State Management
| File | Purpose |
|------|---------|
| `app/context/CartContext.tsx` | Shopping cart state |
| `app/context/AuthContext.tsx` | User authentication state |
| `app/context/StripeContext.tsx` | Stripe Elements provider |

### Backend Services
| File | Purpose |
|------|---------|
| `medusa/src/index.ts` | Medusa Express server |
| `medusa/medusa-config.js` | Medusa configuration |
| `nginx/nginx.conf` | Nginx reverse proxy config |
| `supabase/migrations/` | Database schema |

### Testing
| File | Purpose |
|------|---------|
| `app/e2e/` | Playwright E2E tests |
| `app/__tests__/setup/a11y-utils.ts` | Accessibility test utilities |
| `app/playwright.config.ts` | Playwright configuration |

---

## Coding Standards

See [.claude/INSTRUCTIONS.md](.claude/INSTRUCTIONS.md) for:
- DRY principle (Don't Repeat Yourself)
- Code organization and structure
- Comment style and guidelines
- File naming conventions

See [.claude/DESIGN_BRIEF.md](.claude/DESIGN_BRIEF.md) for:
- Brand identity and visual style
- Color palette and typography
- Design system philosophy
- Creative direction

---

## What's Next?

See [TODO.md](TODO.md) for the current task tracker with prioritized work items.

### How to Add Features

1. **Understand the architecture** - Review relevant sections above
2. **Check existing components** - Don't reinvent the wheel (`app/components/`)
3. **Write tests first** - Add E2E test in `app/e2e/`
4. **Implement feature** - Follow coding standards
5. **Test dark mode** - Run `npm run test:a11y`
6. **Test complete flow** - Run `npm run test:e2e`
7. **Update this README** - Add to relevant section

---

## Getting Help

**Need help with...**

- **Development setup?** → See [Development Setup](#development-setup)
- **Ecommerce/cart?** → See [Shopping Cart & Ecommerce](#shopping-cart--ecommerce)
- **Testing?** → See [Testing](#testing)
- **Design standards?** → See [Design System](#design-system)
- **Troubleshooting?** → See [Troubleshooting](#troubleshooting)
- **Code quality?** → See [.claude/INSTRUCTIONS.md](.claude/INSTRUCTIONS.md)

**For Claude Code users**: See [CLAUDE.md](CLAUDE.md) for project-specific instructions.

---

**Last Updated**: December 2025
**Maintained By**: Development Team
**Status**: Active & Growing
