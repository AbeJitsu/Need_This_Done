# TODO

Central task tracker for NeedThisDone.com. Items move through: **To Do** → **In Progress** → **Recently Completed** → documented in README.md.

---

## In Progress

_Currently active work items_

- [ ] Documentation consolidation - centralizing 40 scattered docs into organized structure

---

## To Do

### Immediate

**CRITICAL - Setup Required (Code ready, accounts needed)**

**Resend Email Service** (Implementation: ✅ app/lib/email.ts)
- [ ] Create Resend account at https://resend.com
- [ ] Get API key and add RESEND_API_KEY to .env.local
- [ ] Add RESEND_FROM_EMAIL (sending address)
- [ ] Add RESEND_ADMIN_EMAIL (admin notifications)
- [ ] Test email flow in checkout
- [ ] Verify order confirmations send

**Stripe Payments** (Implementation: ✅ app/lib/stripe.ts, app/context/StripeContext.tsx)
- [ ] Create Stripe account at https://stripe.com
- [ ] Get live API keys (STRIPE_SECRET_KEY, NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
- [ ] Create webhook endpoint at /api/stripe/webhook
- [ ] Get webhook signing secret (STRIPE_WEBHOOK_SECRET)
- [ ] Add all keys to .env.local
- [ ] Test payment flow in checkout
- [ ] Verify webhook events process correctly

**Medusa Real Implementation** (Bootstrap: ❌ medusa/src/index.ts - HIGH PRIORITY)
- [ ] Plan database schema for products
- [ ] Plan database schema for carts
- [ ] Plan database schema for orders
- [ ] Replace bootstrap Express backend with real Medusa
- [ ] Implement database-persisted products (replace hardcoded)
- [ ] Implement database-persisted carts (replace in-memory)
- [ ] Implement proper order management

**Testing & Verification**
- [ ] Test Medusa backend locally: `npm run test:e2e -- e2e/shop.spec.ts`
- [ ] Verify endpoints work: `/api/shop/products`, `/api/cart`, `/api/checkout`
- [ ] Manual smoke test: browse shop → add to cart → checkout flow
- [ ] Run accessibility tests: `npm run test:a11y`

### Short Term

**DRY Violations (Color System)**
- [ ] Fix Shop page hardcoded colors (6 instances)
- [ ] Fix Services page hardcoded colors (4 instances)
- [ ] Fix Pricing page hardcoded colors (6 instances)
- [ ] Fix How It Works page hardcoded colors (2 instances)
- [ ] Fix FAQ page hardcoded colors (1 instance)
- [ ] Final verification: search for remaining hardcoded colors
- [ ] Visual verification in light and dark mode

**Email Notifications**
- [ ] Set up Resend account and verify `RESEND_API_KEY` in `.env.local`
- [ ] Test admin alert on new project submission
- [ ] Test order confirmation email template
- [ ] Verify email flow in checkout process

**Admin Workflows**
- [ ] Inventory management interface
- [ ] Bulk product import/export
- [ ] Order status updates & fulfillment tracking
- [ ] Analytics dashboard (orders, revenue, trends)

### Medium Term

**Google Calendar Integration**
- [ ] Connect Google Calendar API for appointment booking
- [ ] Allow clients to schedule consultations/project kickoff calls
- [ ] Admin calendar sync for availability management
- [ ] Automated reminders and confirmation emails
- [ ] Integration with project workflow (link appointments to projects)


**Performance & Caching**
- [ ] Define Redis cache invalidation strategy per feature
- [ ] Monitor cache hit rates
- [ ] Optimize product queries with pagination

### Long Term

**Tier 2 Puck Components**
- [ ] ServiceCard, PricingCard, StepCard components in Puck
- [ ] Gallery components
- [ ] Forms with submission handling

**Advanced Ecommerce Features**
- [ ] Abandoned cart recovery emails
- [ ] Product recommendations engine
- [ ] Discount/coupon system
- [ ] Multi-currency support
- [ ] Customer reviews & ratings

**Full Medusa Implementation**
- [ ] Migrate from bootstrap Express backend to real Medusa
- [ ] Database-persisted products (replace hardcoded)
- [ ] Database-persisted carts (replace in-memory)
- [ ] Medusa admin dashboard for product management
- [ ] Seed data system for pricing tiers

---

## Recently Completed

_Keep ~5-10 recent wins here, trim periodically once documented in README.md_

- [x] Public Chatbot with pgvector - semantic search, floating widget (Dec 2025)
- [x] Stripe Integration - payments, subscriptions, webhooks (Dec 2025)
- [x] Puck Visual Editor - 5 components, admin UI, public pages (Dec 2025)
- [x] Redis Caching - comprehensive caching system with invalidation logic (Dec 2025)
- [x] Admin Dashboard - user management, role-based routing (Dec 2025)

---

## Known Issues

**Context7 MCP Authorization**
- `resolve-library-id` works but `get-library-docs` returns "Unauthorized"
- Try regenerating API key at [context7.com/dashboard](https://context7.com/dashboard)

---

*Last Updated: December 2025*
