# TODO

Central task tracker for NeedThisDone.com. Items move through: **To Do** → **In Progress** → **Recently Completed** → documented in README.md.

---

## In Progress

_Currently active work items_

_(No active tasks)_

---

## To Do

### Immediate

**CRITICAL - Setup Required (Code ready, accounts needed)**

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

**Email Notifications** (Infrastructure: ✅ Ready)
- [x] Set up Resend account and verify `RESEND_API_KEY` in `.env.local`
- [x] Configure DNS (DKIM, SPF) with Namecheap
- [x] Deploy email config to production (DigitalOcean)
- [ ] Add auth emails (account creation, login notifications)
- [ ] Test admin alert on new project submission
- [ ] Add order confirmation emails (requires Medusa implementation)
- [ ] Add purchase receipt emails (requires Medusa implementation)

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

- [x] Accessibility Test Fixes - Fixed dark mode testing (emulateMedia before navigation), heading order compliance (h3→h2 in ServiceCard), centralized colors in components. All 10 a11y tests pass. (Dec 2025)
- [x] Self-Documenting npm Scripts - Renamed cryptic scripts (dcup, dcdown, dcps) to clear names (dev:start, dev:stop, dev:status). Added Docker Commands table to README as single source of truth. (Dec 2025)
- [x] Docker Dev Environment Fix - Root cause: npm scripts were missing `-f docker-compose.dev.yml` overlay which provides the `.env.local` mount. Fix: Updated all dev scripts to use both compose files. Also restored missing `resend` and `@react-email/components` dependencies. (Dec 2025)
- [x] DRY Color System Cleanup - Fixed hardcoded colors across Shop, Services, Pricing, How It Works, FAQ pages; added alertColors, dividerColors, placeholderColors, checkmarkBgColors, cardBgColors, cardBorderColors, groupHoverColors to lib/colors.ts (Dec 2025)
- [x] Resend Email Setup - Full email infrastructure with DNS verification, production deployment, sends from hello@needthisdone.com (Dec 2025)
- [x] Environment Variable Documentation - Updated README.md with all 31 variables, generation commands, and clear sections (Dec 2025)

---

## Known Issues

**Context7 MCP Authorization**
- `resolve-library-id` works but `get-library-docs` returns "Unauthorized"
- Try regenerating API key at [context7.com/dashboard](https://context7.com/dashboard)

---

*Last Updated: December 2025*
