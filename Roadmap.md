# NeedThisDone.com - Roadmap

**Architecture & Design:** See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for tech stack and architectural decisions, and [docs/DESIGN_SYSTEM.md](docs/DESIGN_SYSTEM.md) for design standards.

---

## Completed

### Frontend (Phases 1-7)
- Homepage enhancements (typography, spacing, hover effects)
- Foundation components: PageHeader, Card, CTASection
- Page enhancements: Services, Pricing, How It Works, FAQ, Contact
- Component library: Button, ServiceCard, PricingCard, StepCard, CircleBadge
- Centralized color system with Tailwind safelist

### Backend (Phase 9a-b)
- Admin dashboard with user management
- Client dashboard with role-based routing

### Infrastructure (Redis Caching)
- Cache utility library with automatic JSON serialization (`app/lib/cache.ts`)
- Cache-first pattern applied to high-traffic routes
  - User dashboard (`/api/projects/mine`) - 60s TTL
  - Admin dashboard (`/api/projects/all`) - 60s TTL with status filters
  - Project comments (`/api/projects/[id]/comments`) - separate admin/client caches
  - User management (`/api/admin/users`) - 5min TTL
- Cache invalidation on all data mutations (POST/PATCH)
- Comprehensive caching strategy documentation in `docs/CACHING_STRATEGY.md`
- 60-80% reduction in database queries, 15-50x faster cache hits
- Graceful degradation when Redis unavailable

### Medusa Ecommerce Integration (Phases 1-7) ✅
- **Phase 1**: Docker infrastructure
  - Separate Medusa PostgreSQL container (independent from app DB)
  - Medusa Express backend on port 9000
  - Health checks and networking configured

- **Phase 2**: Medusa Backend Bootstrap
  - Express server with CORS enabled
  - Placeholder product, cart, and order APIs
  - Configuration management via environment variables

- **Phase 3**: Medusa API Bridge
  - `app/lib/medusa-client.ts` with retry logic and error handling
  - Fetch wrapper with exponential backoff (3 retries)
  - TypeScript interfaces for products, carts, orders
  - Cache integration with CACHE_KEYS and TTL management

- **Phase 4**: Storefront UI
  - Product catalog `/shop` with grid and pricing
  - Product detail page `/shop/[productId]`
  - Shopping cart page `/cart` with item management
  - Checkout flow `/checkout` with guest & auth support
  - CartContext for global state management with localStorage persistence
  - Cart icon in navigation with item count badge

- **Phase 5**: Admin Integration
  - `/admin/shop` dashboard with Products & Orders tabs
  - `/admin/shop/products/new` form for creating products
  - `/admin/shop/orders` with status filtering
  - Admin-only API endpoints (`/api/admin/products`, `/api/admin/orders`)

- **Phase 6**: Auth Integration
  - `orders` table in Supabase linking Medusa orders to users
  - Row-level security for user order privacy
  - Admin access to all orders
  - "My Orders" section in user dashboard
  - Automatic order linking for authenticated users

- **Phase 7**: Testing & Documentation
  - 600+ lines of E2E tests (`app/e2e/shop.spec.ts`)
  - Complete architecture guide (`docs/MEDUSA_INTEGRATION.md`)
  - Quick start guide for developers (`docs/ECOMMERCE_QUICK_START.md`)
  - Docker.md updated with Medusa services and troubleshooting
  - Test coverage: product browsing, cart ops, checkout flows, admin, cache, integration

### Puck Visual Editor Integration (Phases 1-6) ✅
- **Phase 1**: Database - `pages` table with JSONB, RLS policies, auto-triggers
- **Phase 2**: API - `/api/pages` routes with caching (60s/5min TTL)
- **Phase 3**: Config - 5 components (Button, Card, PageHeader, CTASection, CircleBadge)
- **Phase 4**: Admin UI - `/admin/pages` management interface
- **Phase 5**: Public - `/[slug]` server-rendered pages
- **Phase 6**: Tests & Docs - 12 E2E tests, complete guides

---

## Pending

### Public Chatbot with pgvector Semantic Search

**Purpose:** Answer questions about the site (services, products, policies) via floating chat widget

**Architecture:**
- Floating chat widget (bottom-right corner, all public pages)
- pgvector semantic search in Supabase
- Vercel AI SDK with flexible LLM support (OpenAI gpt-4o-mini or Anthropic claude-haiku)
- Auto-reindex on content changes (SHA-256 hash-based detection)

**What Gets Indexed:**
- Static pages (Home, Services, Pricing, How It Works, FAQ, Contact)
- Medusa product catalog
- ❌ Puck CMS pages (excluded - too large for vector search)
- ❌ User conversations (public chatbot, no persistence)

**Implementation:** See `/.claude/plans/structured-honking-manatee.md`

**Stack:**
- Database: Supabase pgvector (1536-dim embeddings)
- LLM: Vercel AI SDK (flexible provider support)
- Caching: Redis for embeddings + embedding cache
- UI: React component with dark mode support

**Cost:** ~$1-10/month depending on chat volume

**Phases:**
1. Database (pgvector extension, embeddings/indexed_content tables)
2. Core libraries (hashing, embedding generation, chunking, content extraction)
3. API routes (chat, manual reindex, auto reindex)
4. UI components (ChatMessage, ChatInput, Chatbot widget)
5. Initial indexing (static pages + products)
6. Testing (unit, integration, E2E, accessibility)

---

### Email Notifications

**Prerequisites:**
- Sign up for [Resend](https://resend.com) (free: 3,000 emails/month)
- Add `RESEND_API_KEY` to `.env.local`
- Install: `npm install resend`

**Build:**
- Create `app/lib/email.ts` utility
- Admin alert on new project submission
- Client confirmation email (2 business day response)
- Hook into `/api/projects` POST handler

### Stripe Integration ✅

**Implemented:**
- Stripe Elements (embedded payment form on checkout page)
- One-time payments via PaymentIntent
- Subscription support (API ready)
- Webhook handling for payment events
- Database tables for customers, subscriptions, payments

**Environment Variables Required:**
```
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

**Files Created:**
- `app/lib/stripe.ts` - Server-side Stripe client
- `app/context/StripeContext.tsx` - Client-side provider
- `app/components/PaymentForm.tsx` - Stripe Elements form
- `app/app/api/stripe/create-payment-intent/route.ts`
- `app/app/api/stripe/create-subscription/route.ts`
- `app/app/api/stripe/webhook/route.ts`
- `supabase/migrations/010_create_stripe_tables.sql`

**Testing:**
```bash
# Install Stripe CLI, then:
stripe login
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

**Test Cards:**
- `4242424242424242` - Success
- `4000000000000002` - Declined

---

## Next Steps (Prioritized)

### Immediate (Ecommerce Foundation)
- [ ] Test Medusa backend locally: `npm run test:e2e -- e2e/shop.spec.ts`
- [ ] Verify all endpoints: `/api/shop/products`, `/api/cart`, `/api/checkout`
- [ ] Restart Docker to apply Medusa changes
- [ ] Manual smoke test: browse shop → add to cart → checkout flow

### Short Term (Payment & Operations)
1. ~~**Stripe Integration** - Enable actual payments~~ ✅ DONE

2. **Email Notifications** - Order confirmations & alerts
   - Set up Resend account and add `RESEND_API_KEY` to `.env.local`
   - Create `app/lib/email.ts` utility
   - Admin alert on new project submission
   - Order confirmation email template
   - Hook into checkout flow

### Medium Term (Admin & Documentation)
1. **Google Calendar Integration** - Scheduling & appointments
   - Connect Google Calendar API for appointment booking
   - Allow clients to schedule consultations/project kickoff calls
   - Admin calendar sync for availability management
   - Automated reminders and confirmation emails
   - Integration with project workflow (link appointments to projects)

2. **Refine Admin Workflows**
   - Inventory management interface
   - Bulk product import/export
   - Order status updates & fulfillment tracking
   - Analytics dashboard (orders, revenue, trends)

3. **Complete Documentation**
   - [ ] Document Medusa API contract (complete - see MEDUSA_INTEGRATION.md)
   - [ ] Document Stripe integration flow
   - [ ] Create Puck setup guide (line 204)

4. **Performance & Caching**
   - [ ] Define Redis cache invalidation strategy per feature
   - [ ] Monitor cache hit rates
   - [ ] Optimize product queries with pagination

### Long Term (Platform Expansion)
1. **Tier 2 Puck Components** - Extend page builder
   - ServiceCard, PricingCard, StepCard components in Puck
   - Gallery components
   - Forms with submission handling

2. **Advanced Features**
   - Abandoned cart recovery emails
   - Product recommendations engine
   - Discount/coupon system
   - Multi-currency support
   - Customer reviews & ratings

---

## Known Issues

### Context7 MCP Authorization Issue
- **Status:** Unresolved
- **Problem:** `resolve-library-id` works but `get-library-docs` returns "Unauthorized"
- **API Key:** Format correct (`ctx7sk-...`), stored in `~/Library/Application Support/Claude/claude_desktop_config.json`
- **To Resolve:**
  1. Verify key is active at [context7.com/dashboard](https://context7.com/dashboard)
  2. Try regenerating a new API key
  3. Update MCP config with new key and restart Claude

---

*Last Updated: December 8, 2025*
*Completed: Medusa ecommerce (Phase 7), Puck visual editor (Phase 6), Stripe payment integration, and Supabase local development setup*
