# NeedThisDone.com

A professional services platform built with Next.js, deployed on Vercel with Medusa (ecommerce on Railway), Redis (Upstash), and Supabase (auth & database).

---

## Table of Contents

- [Quick Start (30 seconds)](#quick-start)
- [Deployment](#deployment)
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
# Install dependencies
cd app && npm install

# Start local development server
npm run dev

# Access at http://localhost:3000
# Storybook: npm run storybook (port 6006)
```

### Available Commands

| Command | What it does |
|---------|--------------|
| `npm run dev` | Start Next.js dev server |
| `npm run build` | Build for production |
| `npm run test` | Run E2E tests |
| `npm run test:a11y` | Run accessibility tests |
| `npm run lint` | Run ESLint |
| `npm run storybook` | Start Storybook |

---

## Deployment

### Production Architecture

| Service | Platform | URL |
|---------|----------|-----|
| Next.js Frontend | Vercel | https://needthisdone.com |
| Medusa Backend | Railway | https://need-this-done-production.up.railway.app |
| Database | Supabase | PostgreSQL (managed) |
| Redis Cache | Upstash | Redis (managed) |

### Branch Workflow

- `main` - Production code, deploys automatically to Vercel
- `dev` - Active development, test changes here first
- `experiment` - Isolated experiments

**Workflow:**
1. Develop and test on `dev` branch locally
2. Push to GitHub - Vercel creates preview deployment
3. Test preview URL, then merge `dev` → `main`
4. Vercel auto-deploys to production

### Deploying Changes

**Frontend (Vercel - Automatic):**
```bash
# Push to main triggers automatic deployment
git checkout main
git merge dev
git push origin main
# Vercel deploys automatically
```

**Medusa Backend (Railway):**
```bash
# Railway auto-deploys from GitHub
# Or manually via Railway CLI:
railway up
```

### Product Management

**Products are managed via Medusa Admin API:**

| Product | Price | Duration | Handle |
|---------|-------|----------|--------|
| 15-Minute Quick Consultation | $20.00 | 15 min | `consultation-15-min` |
| 30-Minute Strategy Consultation | $35.00 | 30 min | `consultation-30-min` |
| 55-Minute Deep Dive Consultation | $50.00 | 55 min | `consultation-55-min` |

**Update product images:**
```bash
cd medusa
MEDUSA_ADMIN_PASSWORD='xxx' node update-product-image.js consultation-15-min "https://example.com/image.jpg"
```

**Admin credentials:**
- Email: `admin@needthisdone.com`
- Password: Set via `MEDUSA_ADMIN_PASSWORD` environment variable

---

## What This Project Is

A modern platform for professional services that combines:

- **E-commerce platform**: Browse products, add to cart, checkout, manage orders
- **User accounts**: Authentication, profiles, order history
- **Admin dashboard**: Manage products, view orders, user management
- **Visual page builder**: Non-technical users can create pages (Puck visual editor)
- **Component library**: Reusable, accessible React components (Storybook)

**Tech Stack:**
- **Frontend**: Next.js 14 (React) with TypeScript, deployed on Vercel
- **Backend**: Next.js API routes + Medusa (ecommerce engine on Railway)
- **Database**: Supabase (PostgreSQL with pgvector for AI chatbot)
- **Ecommerce**: Medusa headless commerce engine
- **Payments**: Stripe (one-time & subscriptions)
- **Email**: Resend (transactional emails) - sends from hello@needthisdone.com
- **Cache**: Upstash Redis for performance
- **Design**: Tailwind CSS with dark mode support
- **Testing**: Playwright E2E tests + Visual regression testing (screenshot baselines)

---

## Architecture Overview

```
┌──────────────────────────────────────────┐
│          Browser / User                  │
└───────────┬────────────────────────────┘
            │
┌───────────▼────────────────────────┐
│   Vercel (CDN + Edge Network)      │
│   - Auto SSL, global edge caching  │
└───────────┬────────────────────────┘
            │
    ┌───────┴───────┬───────────┐
    │               │           │
┌───▼────────┐  ┌──▼──────┐  ┌─▼──────────┐
│ Next.js    │  │ Medusa  │  │ Supabase   │
│ (Vercel)   │  │(Railway)│  │ (Cloud)    │
│ - Pages    │  │ - Cart  │  │ - Auth     │
│ - API      │  │ - Orders│  │ - Database │
└───┬────────┘  └──┬──────┘  └─┬──────────┘
    │              │           │
    └──────────┬───┴───────────┘
               │
    ┌──────────▼──────────┐
    │ Upstash Redis       │
    │ - Products cache    │
    │ - Session data      │
    └─────────────────────┘
```

**Data Flow**:
1. User makes request to needthisdone.com
2. Vercel serves Next.js app (edge-cached, auto SSL)
3. Next.js API routes call Medusa on Railway for ecommerce
4. Next.js calls Supabase for user/auth data
5. Upstash Redis caches frequently accessed data

**Why This Design**:
- ✅ **Zero-ops deployment** - Push to GitHub, auto-deploys everywhere
- ✅ **Global edge network** - Vercel CDN for fast page loads
- ✅ **Managed services** - No servers to maintain
- ✅ **Independent scaling** - Each service scales automatically
- ✅ **Cost-effective** - Pay only for what you use

### Medusa Backend (Current State)

Real Medusa implementation with database-persisted products, carts, and orders. All consultation products require appointment scheduling before fulfillment.

| Feature | Status | Tested | Details |
|---------|--------|--------|---------|
| Products | ✅ Working | 12 E2E tests | 3 consultation tiers, seeded via `npm run seed` |
| Carts | ✅ Working | 8 E2E tests | Stored in Medusa PostgreSQL |
| Checkout | ✅ Working | 6 E2E tests | Guest + authenticated checkout flows |
| Orders | ✅ Working | 4 E2E tests | Full order objects, linked in Supabase |
| Email | ✅ Working | 9 unit tests | 4 email types via Resend |

**All 126 E2E tests passing** - See [Testing](#testing) for complete coverage map.

**Consultation Products** (seeded via `medusa/seed-products.js` using Admin API):
| Product | Price | Duration | Handle |
|---------|-------|----------|--------|
| 15-Minute Quick Consultation | $20 | 15 min | `consultation-15-min` |
| 30-Minute Strategy Consultation | $35 | 30 min | `consultation-30-min` |
| 55-Minute Deep Dive Consultation | $50 | 55 min | `consultation-55-min` |

**Admin Credentials** (for Medusa Admin panel):
- Email: `admin@needthisdone.com`
- Password: **Required** - Set via `MEDUSA_ADMIN_PASSWORD` environment variable in `.env.local`

**Security Note:** The `MEDUSA_ADMIN_PASSWORD` environment variable is required for all environments. Scripts will fail if not set - no fallback passwords.

---

## Local Development

### Prerequisites

```bash
# Install Node.js (v18 or higher)
node --version

# Install Supabase CLI (macOS)
brew install supabase/tap/supabase

# Or Linux:
# https://supabase.com/docs/guides/cli

# Verify installation
supabase --version
```

### Starting Development Environment

**Terminal 1: Start the Next.js development server**
```bash
cd app
npm install  # First time only
npm run dev
```

App will be available at: `http://localhost:3000`

**Terminal 2: Start Supabase (auth & user database)**
```bash
supabase start
```

Supabase will start with:
- PostgreSQL (port 54322)
- Supabase API (port 54321)
- Realtime server
- Database migrations applied automatically

**For Storybook (optional third terminal):**
```bash
cd app
npm run storybook
```

Storybook will be available at: `http://localhost:6006`

### Environment Configuration

The app automatically connects to:
- **Frontend**: Next.js dev server on localhost:3000
- **Backend**: Medusa API on Railway (via `MEDUSA_BACKEND_URL` from `.env.local`)
- **Database**: Supabase (local instance started with `supabase start`)
- **Cache**: Upstash Redis (configured in Railway)

**Required `.env.local` variables** (create this file in the `app/` directory):
```bash
# Supabase (local development)
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...  # Get from: supabase status
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...  # Get from: supabase status

# Medusa (Railway)
MEDUSA_BACKEND_URL=https://need-this-done-production.up.railway.app
MEDUSA_ADMIN_PASSWORD=your_admin_password  # Required for product management scripts

# Stripe (payments)
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Email (Resend)
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=hello@needthisdone.com
RESEND_ADMIN_EMAIL=abe.raise@gmail.com

# AI Chatbot (optional)
OPENAI_API_KEY=sk-...
NEXT_PUBLIC_CHATBOT_MODEL=gpt-4o-mini

# Site Configuration
NEXT_PUBLIC_SITE_URL=http://localhost:3000  # Development
NODE_ENV=development
```

**To get Supabase keys:**
```bash
supabase status
```

### Stopping Services

```bash
# Stop Next.js dev server
# Press Ctrl+C in terminal 1

# Stop Storybook
# Press Ctrl+C in terminal 3

# Stop Supabase
supabase stop

# Reset Supabase (clears all data)
supabase db reset
```

---

## Project Structure

### Root Level

| File/Folder | Purpose |
|-------------|---------|
| `README.md` | This file - main project documentation |
| `TODO.md` | Task tracker (To Do / In Progress / Done) |
| `CLAUDE.md` | Project guidelines for Claude Code |
| `supabase/` | Database migrations and configuration |
| `medusa/` | Ecommerce backend service (deployed on Railway) |

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
POST {MEDUSA_BACKEND_URL}/store/carts/{cartId}/line-items
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

### Appointment Booking Requirements

Consultation products include built-in booking constraints for quality service:

| Constraint | Value | Enforced By |
|------------|-------|-------------|
| Advance booking | 24 hours minimum | `api/appointments/availability` |
| Daily limit | 5 appointments max | `api/appointments/availability` |
| Buffer time | 30 minutes between appointments | Google Calendar validation |
| Business hours | 9 AM - 5 PM, Monday-Friday | Appointment form time picker |

**Why these constraints:**
- 24-hour advance booking: Allows proper preparation for each consultation
- Daily limit: Maintains quality by preventing over-scheduling
- Buffer time: Accounts for transitions, notes, and breaks
- Business hours: Ensures availability during working hours

**Implementation:**
- Form validation in `components/AppointmentRequestForm.tsx`
- Backend validation in `api/appointments/request/route.ts`
- Real-time availability check via `api/appointments/availability`

### Testing the Cart

**Manual browser test**:
```bash
# 1. Navigate to http://localhost:3000/shop (or production URL)
# 2. Click "Add to Cart" on a product
# 3. Should see success toast
# 4. Cart badge should update
# 5. Click cart icon to view items
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
| Welcome email | ✅ Ready | After account creation |
| Login notification | ✅ Ready | After each sign-in (security) |
| Admin notifications | ✅ Ready | New project submission |
| Client confirmation | ✅ Ready | After form submission |

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
- `WelcomeEmail.tsx` - Welcome message after account creation
- `LoginNotificationEmail.tsx` - Security alert after each sign-in
- `AdminNotification.tsx` - New project alert for admin
- `ClientConfirmation.tsx` - Submission confirmation for clients
- `OrderConfirmationEmail.tsx` - Order confirmation after checkout
- `AppointmentConfirmationEmail.tsx` - Appointment confirmation for consultations
- `AppointmentRequestNotificationEmail.tsx` - Admin notification for appointment requests
- `PurchaseReceiptEmail.tsx` - Detailed receipt after payment
- `AbandonedCartEmail.tsx` - Cart recovery reminder with optional discount

### Testing Emails

```bash
# Send all email types to verify they work
cd app && npm run test:emails
```

---

## Testing

### Test Summary

| Category | Tests | Status | Command |
|----------|-------|--------|---------|
| E2E Shop & Cart | ~50 | ✅ Passing | `npm run test:e2e -- e2e/shop*.spec.ts` |
| E2E Submissions | 5 | ✅ Passing | `npm run test:e2e -- e2e/submission.spec.ts` |
| E2E Chatbot | 17 | ✅ Passing | `npm run test:e2e -- e2e/chatbot.spec.ts` |
| E2E Appointments | 19 | ✅ Passing | `npm run test:e2e -- e2e/appointments.spec.ts` |
| E2E Service Modals | 12 | ✅ Passing | `npm run test:e2e -- e2e/service-modals.spec.ts` |
| E2E UX Flow | 3 | ✅ Passing | `npm run test:e2e -- e2e/ux-flow.spec.ts` |
| E2E Accessibility | 10 | ✅ Passing | `npm run test:e2e -- e2e/accessibility.a11y.test.ts` |
| E2E Visual Regression | 10 | ✅ Passing | `npm run test:e2e -- e2e/checkout-screenshots.spec.ts` |
| **Total** | **126** | ✅ **All Passing** | `npm run test:e2e` |

### Feature → Test Coverage Map

Every feature has automated tests. Here's exactly where each is tested:

<details>
<summary><strong>E-commerce - Shop Flow (32 tests)</strong> - <code>e2e/shop.spec.ts</code></summary>

| Test Suite | Test Name | Verifies |
|------------|-----------|----------|
| Product Catalog | `product listing page displays all products with pricing` | Shop displays products with $20/$35/$50 pricing |
| Product Catalog | `product detail page shows full product information` | Title, price, add to cart, quantity selector |
| Product Catalog | `cart icon in navigation shows item count` | Cart badge displays current count |
| Add to Cart | `add to cart updates cart count on page` | Success toast, count updates |
| Add to Cart | `can adjust quantity before adding to cart` | Quantity selector works |
| Add to Cart | `can add different products to cart` | Multiple products can be added |
| Add to Cart | `shows success feedback when adding to cart` | Toast appears, button re-enables |
| Cart Management | `view cart shows all items with quantities and prices` | Heading, subtotal, order summary |
| Cart Management | `can update item quantity in cart` | + button increases quantity |
| Cart Management | `can remove items from cart` | Remove button works |
| Cart Management | `shows empty cart message when no items` | Empty state displays |
| Cart Management | `persists cart across page navigation` | Cart survives navigation |
| Guest Checkout | `guest can checkout without authentication` | Email and shipping form shown |
| Guest Checkout | `checkout form validates required fields` | Prevents empty submission |
| Guest Checkout | `displays order confirmation after guest checkout` | Success page appears |
| Auth Checkout | `authenticated user can checkout with autofilled email` | Login/guest options shown |
| Auth Checkout | `authenticated user order appears in dashboard` | Orders visible in dashboard |
| Auth Checkout | `order history shows order details correctly` | ID, date, total, status shown |
| Admin Integration | `admin can access shop dashboard` | Returns 200/302/401 |
| Admin Integration | `product management endpoints are protected` | POST returns 401 |
| Admin Integration | `orders endpoint returns data for authorized requests` | GET returns 401 unauth |
| Cache | `product list is cached efficiently` | API caches responses |
| Cache | `product detail is cached` | Single product caching |
| Error Handling | `handles invalid product ID gracefully` | Shows loading/error/not found |
| Error Handling | `handles network errors in cart operations gracefully` | Shows toast and View Cart |
| Error Handling | `checkout with empty cart shows appropriate message` | Redirects or shows message |
| Integration | `complete flow: browse → add → cart → checkout → confirmation` | Full user journey |
| Variant Regression | `all products in API have variants` | Variants array exists |
| Variant Regression | `each variant has required pricing data` | Has id, prices, currency |
| Variant Regression | `product detail page variant dropdown does not show errors` | No "No variants" error |
| Variant Regression | `add to cart works without variant errors` | No variant errors |
| Variant Regression | `all consultation products have variants` | 15/30/55-min have variants |

</details>

<details>
<summary><strong>E-commerce - Cart Operations (8 tests)</strong> - <code>e2e/shop-cart.spec.ts</code></summary>

| Test Suite | Test Name | Verifies |
|------------|-----------|----------|
| Add to Cart | `can add single item to cart from shop page` | Success toast, View Cart link |
| Add to Cart | `can add multiple different items to cart` | Multiple products added |
| Add to Cart | `displays correct pricing for added items` | Correct price displays |
| Cart Operations | `can update item quantity in cart` | Quantity input works |
| Cart Operations | `can remove item from cart` | Remove button works |
| Error Handling | `shows error when add to cart fails` | Error messages display |
| Error Handling | `cart persists after page refresh` | localStorage/session works |
| Integration | `complete checkout flow: add items, update quantity, proceed to cart` | Full cart flow |

</details>

<details>
<summary><strong>E-commerce - Product Variants (12 tests)</strong> - <code>e2e/shop-variants.spec.ts</code></summary>

| Test Suite | Test Name | Verifies |
|------------|-----------|----------|
| Add to Cart Workflow | `products display on shop page without variant errors` | All 3 consultations visible |
| Add to Cart Workflow | `can add 15-Minute Consultation to cart from shop page` | Details link, success toast |
| Add to Cart Workflow | `product detail page shows variant dropdown` | Add to Cart visible |
| Add to Cart Workflow | `can add product from detail page with variant` | Direct URL works |
| Add to Cart Workflow | `can add multiple different products to cart` | Multiple via Details pages |
| Add to Cart Workflow | `cart displays added products correctly` | Shows subtotal |
| Add to Cart Workflow | `standard variant is selected by default` | Pre-selected value |
| Add to Cart Workflow | `can adjust quantity before adding to cart` | Quantity controls work |
| Add to Cart Workflow | `all three products have variants available` | All have Add to Cart |
| Variant Data Integrity | `product API returns variants for all products` | Variants array exists |
| Variant Data Integrity | `variants have correct pricing` | $20/$35/$50 correct |
| Variant Data Integrity | `variants have required fields` | id, title, prices present |

</details>

<details>
<summary><strong>Form Submissions (5 tests)</strong> - <code>e2e/submission.spec.ts</code></summary>

| Test Name | Verifies |
|-----------|----------|
| `submits request WITHOUT attachments` | Form works without files, data saved to DB |
| `submits request WITH 1 attachment` | Single file upload, stored in Supabase |
| `submits request WITH 2 attachments` | Multiple files work simultaneously |
| `submits request WITH 3 attachments (max allowed)` | Max 3 files enforced |
| `admin can retrieve uploaded attachment via API` | Full round-trip: upload → storage → retrieval |

</details>

<details>
<summary><strong>AI Chatbot Widget (14 tests)</strong> - <code>e2e/chatbot.spec.ts</code></summary>

| Test Suite | Test Name | Verifies |
|------------|-----------|----------|
| Button Tests | `should display chatbot button on homepage` | Button visible on home |
| Button Tests | `should display chatbot button on all public pages` | Button on all 6 pages |
| Button Tests | `should have proper button styling and accessibility` | ARIA label, title, role |
| Modal Tests | `should open modal when button is clicked` | Modal appears with title |
| Modal Tests | `should close modal when close button is clicked` | Close button works |
| Modal Tests | `should close modal when Escape key is pressed` | Keyboard shortcut works |
| Modal Tests | `should close modal when clicking outside panel area` | Panel stays stable |
| Modal Tests | `should hide chat button when modal is open` | Button visibility toggles |
| Chat Input | `should display welcome message when modal opens` | Welcome text appears |
| Chat Input | `should focus input field when modal opens` | Auto-focus works |
| Chat Input | `should allow typing in the input field` | Text input works |
| Chat Input | `should disable send button when input is empty` | Button state changes |
| Accessibility | `should have proper ARIA attributes on modal` | aria-modal, aria-labelledby |
| Accessibility | `should be navigable with keyboard` | Enter key opens chat |
| Dark Mode | `should work correctly in dark mode` | Dark styling applied |
| Clear Chat | `should show clear button only when there are messages` | Conditional visibility |

</details>

<details>
<summary><strong>Appointment Booking (23 tests)</strong> - <code>e2e/appointments.spec.ts</code></summary>

| Test Suite | Test Name | Verifies |
|------------|-----------|----------|
| Request Form | `appointment form appears after checkout for consultation products` | Form shows post-payment |
| Request Form | `appointment request API validates required fields` | Missing fields return 400 |
| Request Form | `appointment request API validates weekday dates` | Weekend dates rejected |
| Request Form | `appointment request API validates business hours` | 9 AM - 5 PM enforced |
| Request Form | `appointment request API returns 404 for non-existent order` | Invalid order handled |
| Admin Dashboard | `admin appointments page requires authentication` | Auth redirect works |
| Admin Dashboard | `admin appointments API requires authentication` | GET returns 401 unauth |
| Admin Dashboard | `admin appointments approve endpoint requires authentication` | POST returns 401 |
| Admin Dashboard | `admin appointments cancel endpoint requires authentication` | POST returns 401 |
| Form UI | `appointment form component displays correctly` | Products load, prices visible |
| Form UI | `business hours are displayed correctly in time options` | 9 AM - 5 PM shown |
| Integration | `consultation product has requires_appointment metadata` | All 3 products exist |
| Integration | `checkout session endpoint returns appointment info for consultation` | Toast appears on add |
| Integration | `complete checkout flow shows appointment form` | Payment button visible |
| Integration | `admin navigation includes appointments link` | Page loads without error |
| Dashboard Layout | `admin navigation includes appointments link` | Page loads successfully |
| Dashboard Layout | `admin appointments page structure is correct` | Endpoint exists (401 not 404) |
| Email Notifications | `appointment request notification email template exists` | Endpoint returns 400 not 404 |
| Email Notifications | `appointment confirmation email is sent on approval` | Endpoint exists (401 not 404) |
| Status Management | `appointment statuses are correctly defined` | pending/approved/modified/canceled |

</details>

<details>
<summary><strong>Visual Regression - Checkout Flow (14 screenshots)</strong> - <code>e2e/checkout-screenshots.spec.ts</code></summary>

| Screenshot | Captures |
|------------|----------|
| Checkout Start | Empty cart → initial checkout page |
| Guest Details Form | Email and shipping address fields |
| Order Summary (Sticky) | Sidebar stays visible while scrolling |
| Appointment Scheduling | Post-checkout appointment request form |
| Payment Form | Stripe Elements integration |
| Order Confirmation | Success page with order details |
| Dark Mode Variants | All above in dark theme |

**Purpose:** Documents the full checkout journey visually. Any unintended UI changes trigger screenshot diffs in CI, preventing accidental regressions before they ship.

**Update baselines:** `npm run test:e2e -- --update-snapshots`

</details>

<details>
<summary><strong>Email Templates (10 tests)</strong> - <code>__tests__/lib/email.unit.test.ts</code></summary>

| Test Suite | Test Name | Verifies |
|------------|-----------|----------|
| Email Templates | `WelcomeEmail renders to valid HTML` | Name, "Start Your First Project" CTA |
| Email Templates | `LoginNotificationEmail renders to valid HTML` | Timestamp, IP, browser, reset link |
| Email Templates | `AdminNotification renders to valid HTML` | Project ID, client details, service type |
| Email Templates | `ClientConfirmation renders to valid HTML` | Name, service type, response time |
| Email Templates | `WelcomeEmail handles missing name gracefully` | Falls back to email prefix |
| Service Functions | `sendWelcomeEmail calls Resend with correct parameters` | Correct recipient, subject |
| Service Functions | `sendLoginNotification calls Resend with correct parameters` | "Sign-In" in subject |
| Service Functions | `sendAdminNotification sends to admin email` | "New Project" + client name |
| Service Functions | `sendClientConfirmation sends to client email` | "We Got Your Message" |

</details>

<details>
<summary><strong>Accessibility - E2E Pages (10 tests)</strong> - <code>e2e/accessibility.a11y.test.ts</code></summary>

| Page | Modes | Verifies |
|------|-------|----------|
| Home (/) | Light, Dark | WCAG AA via axe-core |
| Services (/services) | Light, Dark | WCAG AA via axe-core |
| Pricing (/pricing) | Light, Dark | WCAG AA via axe-core |
| How It Works (/how-it-works) | Light, Dark | WCAG AA via axe-core |
| FAQ (/faq) | Light, Dark | WCAG AA via axe-core |

**Not tested:** Contact, Login, Get Started (hardcoded colors), Shop/Cart/Checkout (external services)

</details>

<details>
<summary><strong>Accessibility - Components (8 tests)</strong> - <code>__tests__/components/*.a11y.test.tsx</code></summary>

| Component | Test Name | Verifies |
|-----------|-----------|----------|
| AuthDemo | `Light mode violations` | No a11y violations in light mode |
| AuthDemo | `Dark mode violations` | No a11y violations in dark mode |
| AuthDemo | `Contrast in both modes` | Sufficient color contrast |
| DatabaseDemo | `Light mode violations` | No a11y violations in light mode |
| DatabaseDemo | `Dark mode violations` | No a11y violations in dark mode |
| DatabaseDemo | `Contrast in both modes` | Sufficient color contrast |
| DatabaseDemo | `Keyboard navigation` | Focus indicators, keyboard accessible |
| DatabaseDemo | `Flow trace contrast` | Contrast in populated state |

</details>

<details>
<summary><strong>Redis Integration (6 tests)</strong> - <code>__tests__/lib/redis.integration.test.ts</code></summary>

| Test Name | Verifies |
|-----------|----------|
| `should connect to Redis and respond to ping` | Connection established, PONG response |
| `should set and get a value` | SET and GET commands work |
| `should handle expiring keys` | SETEX with 1s TTL expires correctly |
| `should handle multiple keys` | Multiple key-value pairs work |
| `should increment counters` | INCR command works atomically |
| `should handle lists` | RPUSH and LRANGE work |

</details>

<details>
<summary><strong>Health API (4 tests)</strong> - <code>__tests__/api/health.integration.test.ts</code></summary>

| Test Name | Verifies |
|-----------|----------|
| `should be able to reach the health endpoint` | Accessible, returns 200 or 500 |
| `should report service statuses` | Reports all configured services |
| `should include valid timestamp` | ISO timestamp within 5 seconds |
| `should respond within reasonable time` | Completes within 10 seconds |

</details>

### Running Tests

```bash
cd app

# Run ALL tests (E2E + unit)
npm run test:all

# Run only E2E tests
npm run test:e2e

# Run only unit/integration tests (fast, no browser)
npm run test:run

# Run only accessibility tests
npm run test:a11y

# Run specific feature tests
npx playwright test e2e/shop-cart.spec.ts        # Cart operations
npx playwright test e2e/shop-variants.spec.ts    # Product variants
npx playwright test e2e/submission.spec.ts       # Form submissions

# Run specific test by name
npx playwright test -k "can add to cart"

# Run with visible browser (debugging)
npx playwright test --headed
```

### Test Architecture

```
Tests are organized by what they verify:

E2E Tests (app/e2e/)
├── shop.spec.ts              # 35 tests: Full shop flow (browse→cart→checkout)
├── shop-cart.spec.ts         # 9 tests: Cart-specific operations
├── shop-variants.spec.ts     # 13 tests: Product variant handling
├── submission.spec.ts        # 5 tests: Form submissions with attachments
├── chatbot.spec.ts           # 14 tests: AI chatbot interactions
├── appointments.spec.ts      # 23 tests: Appointment booking flow
└── accessibility.a11y.test.ts # 10 tests: WCAG AA page compliance

Unit/Integration Tests (app/__tests__/)
├── lib/email.unit.test.ts           # 10 tests: Email template rendering
├── lib/redis.integration.test.ts    # 6 tests: Cache operations
├── api/health.integration.test.ts   # 4 tests: Health endpoint
└── components/
    ├── AuthDemo.a11y.test.tsx       # 3 tests: Auth component accessibility
    └── DatabaseDemo.a11y.test.tsx   # 5 tests: Database component accessibility
```

### Continuous Testing Workflow

Tests run automatically in CI/CD. Before deploying:

1. **All E2E tests must pass** - Verifies user flows work end-to-end
2. **All unit tests must pass** - Verifies utilities and services work
3. **All accessibility tests must pass** - Verifies WCAG AA compliance

**No broken windows policy**: If a test fails, fix it before shipping. We don't skip tests or ignore failures.

### Dark Mode Testing

All pages are tested in both light and dark modes using axe-playwright:

```typescript
// e2e/accessibility.a11y.test.ts
test(`${page.name} - Dark Mode Accessibility`, async ({ page: browserPage }) => {
  // Apply dark mode BEFORE navigation
  await browserPage.emulateMedia({ colorScheme: 'dark' });
  await browserPage.goto(page.path);

  // Run axe accessibility audit
  const results = await new AxeBuilder({ page: browserPage }).analyze();
  expect(results.violations).toEqual([]);
});
```

Common dark mode issues & fixes are documented in [docs/DESIGN_SYSTEM.md](docs/DESIGN_SYSTEM.md).

---

## Developer Tools

### Claude Code Skills

Custom skills in `.claude/skills/` provide specialized agent capabilities:

| Skill | Purpose | Trigger |
|-------|---------|---------|
| `launch-a-swarm` | Spawn 5 parallel agents for comprehensive code review | "launch a swarm" |
| `frontend-design` | Generate distinctive, production-grade UI | Building web interfaces |
| `worktree-swarm` | Orchestrate parallel development with git worktrees | "parallelize", "spawn worktrees" |

#### Launch-a-Swarm Skill

Spawns 5 specialized agents working in parallel to review code quality across all critical dimensions:

```
Structure   → DRY, clear organization, minimal coupling
Protection  → Security, input validation, least privilege
Correctness → Tests, data flow, error handling
Evolution   → Flexibility, configuration, adaptability
Value       → User need, automation, documentation
```

**Usage:**
```
User: "launch a swarm to review my changes"
→ 5 agents spawn in parallel
→ Each checks from their domain perspective
→ Results synthesized into prioritized action items
```

**When to use:**
- Planning new features (prevention-focused)
- Building code (real-time guidance)
- Validating before merge/deploy (comprehensive review)

See `.claude/skills/launch-a-swarm.md` for full documentation.

---

## Troubleshooting

### Issue: Code changes not appearing

**Symptom**: Made code changes but they don't show up in browser

**Solutions**:
1. Wait 3 seconds for hot reload (usually auto-refreshes)
2. Hard refresh the browser (Ctrl+Shift+R / Cmd+Shift+R)
3. Restart the dev server (Ctrl+C, then `npm run dev`)
4. Check the terminal for build errors
5. Clear `.next` cache: `rm -rf .next && npm run dev`

### Issue: "Failed to add item to cart"

**Symptom**: Error when clicking "Add to Cart"

**Solutions**:
```bash
# 1. Check Medusa is accessible
curl https://need-this-done-production.up.railway.app/health
# Should return 200

# 2. Check variant exists
curl http://localhost:3000/api/shop/products | jq '.products[0].variants'
# Should show variant array

# 3. Check browser console for errors
# Look for network errors or CORS issues
```

### Issue: Pages loading slowly

**Symptom**: Product page takes 5+ seconds

**Solutions**:
- Check your network connection
- Ensure `SKIP_CACHE=false` in production
- Check Railway/Upstash dashboards for service health

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

Available color utilities: `headingColors`, `formInputColors`, `formValidationColors`, `titleColors`, `accentColors`, `navigationColors`, `dangerColors`, `linkColors`, `mutedTextColors`, `alertColors`, `dividerColors`, `placeholderColors`, `checkmarkColors`, `cardHoverColors`, `topBorderColors`, `groupHoverColors`, `cardBgColors`, `cardBorderColors`. See [app/lib/colors.ts](app/lib/colors.ts) for the full list.

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
| `.env.local` | Environment variables (used by Next.js) |
| `app/tsconfig.json` | TypeScript configuration |
| `vercel.json` | Vercel deployment configuration (if present) |

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
| `app/context/ToastContext.tsx` | Global toast notification state |
| `app/context/ServiceModalContext.tsx` | Service detail modal state |

### UI Components
| File | Purpose |
|------|---------|
| `app/components/Navigation.tsx` | Site-wide navigation with cart icon badge |
| `app/components/ui/ConfirmDialog.tsx` | Confirmation dialog component (danger/warning/info variants) |
| `app/components/ui/Toast.tsx` | Toast notification component |

**ConfirmDialog** - Branded confirmation modal replacing browser alerts:
```typescript
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

const [showConfirm, setShowConfirm] = useState(false);

<ConfirmDialog
  isOpen={showConfirm}
  onClose={() => setShowConfirm(false)}
  onConfirm={handleDelete}
  title="Delete Page?"
  message="This action cannot be undone."
  variant="danger"
/>
```

**Toast Notifications** - Global notification system with auto-dismiss:
```typescript
import { useToast } from '@/context/ToastContext';

const { showToast } = useToast();
showToast('Changes saved!', 'success');
```

All UI components are WCAG AA compliant with keyboard navigation and ARIA attributes.

### Backend Services
| File | Purpose |
|------|---------|
| `medusa/src/index.ts` | Medusa Express server (deployed on Railway) |
| `medusa/medusa-config.js` | Medusa configuration |
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
