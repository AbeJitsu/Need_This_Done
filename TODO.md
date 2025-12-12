# TODO

Central task tracker for NeedThisDone.com. Items move through: **To Do** → **In Progress** → **Recently Completed** → documented in README.md.

---

## Production Readiness Status

**Last Verified:** December 2025

| Component | Status | Notes |
|-----------|--------|-------|
| Medusa Backend | ✅ Working | Products, carts, checkout functional |
| Stripe Payments | ✅ Working | Real payment processing (not mock) |
| E2E Tests | ⚠️ 91% | 62/68 passing, 6 need updates |
| Security | ❌ Critical | Hardcoded secrets must be fixed |
| Google Calendar | ❌ 0% | Not started |
| Admin Approval | ❌ 0% | Not started |

### Critical Security Issues (MUST FIX BEFORE PRODUCTION)

1. **Hardcoded admin password** in `medusa/seed-products.js` (line 11: `admin123`)
2. **Default secrets** in `docker-compose.yml` (JWT, cookie secrets with weak fallbacks)
3. **Exposed debug endpoints** (`/api/embeddings/debug`, `/api/demo/*`) - no authentication
4. **Weak fallback secrets** in `medusa/medusa-config.js`

---

## In Progress

_Currently active work items_

**Medusa Real Implementation + Google Calendar Bookings** ← CURRENT PRIORITY

**Phase 0: Bug Fix** ✅ COMPLETE
- [x] Fix email links using `NEXT_PUBLIC_SITE_URL` env var (localhost → needthisdone.com)
- [x] Test email links in production

**Phase 1: Medusa Backend** ✅ COMPLETE
- [x] Initialize real Medusa (replace bootstrap Express in `/medusa/src/index.ts`)
- [x] Create consultation products seed (15-min/$20, 30-min/$35, 55-min/$50)
- [x] Update checkout to mark consultation products with `metadata.requires_appointment`
- [x] Add Supabase migration for `requires_appointment` column in orders table
- [x] Fix TypeORM 0.3.23+ compatibility issue (patch-typeorm.js)
- [x] Fix shop page price display (variants[0].prices[0].amount)
- [x] Update E2E tests for consultation products
- [x] Verify products API, cart persistence, checkout flow locally

**Phase 2: Google Calendar Integration (4-5 hrs)**
- [ ] Complete Google Cloud Console setup (see instructions below)
- [ ] Create Supabase migration: google_calendar_tokens table
- [ ] Create `/app/lib/google-calendar.ts` with OAuth flow
- [ ] Create appointment_requests Supabase table (with business hour validation)
- [ ] Build appointment request form component (post-checkout)
- [ ] Wire appointment request email notifications

**Phase 3: Admin Approval Workflow (3-4 hrs)**
- [ ] Build admin appointments dashboard (`/admin/appointments`)
- [ ] Implement approve/modify/cancel endpoints
- [ ] Create calendar event on approval (Google Calendar API)
- [ ] Send confirmation emails with .ics attachments

**Phase 4: Testing & Deploy (1-2 hrs)**
- [x] E2E tests for Medusa backend (shop.spec.ts - 32/32 passing)
- [ ] Fix shop-variants.spec.ts (6 tests using old product IDs)
- [ ] E2E tests for appointment booking flow
- [ ] Manual testing in dev environment
- [ ] Fix security issues before production deploy
- [ ] Deploy to production

---

## To Do

### Security Pre-Production (BLOCKING)

**These MUST be fixed before deploying to production:**

- [ ] Remove hardcoded admin password from `medusa/seed-products.js` - use env vars
- [ ] Remove default secret fallbacks from `docker-compose.yml` - require explicit env vars
- [ ] Remove weak secret fallbacks from `medusa/medusa-config.js`
- [ ] Protect or remove `/api/embeddings/debug` endpoint
- [ ] Protect or remove `/api/demo/speed` and `/api/demo/items` endpoints
- [ ] Add missing nginx security headers (HSTS, CSP, Permissions-Policy)
- [ ] Verify CORS settings for production domain

### Immediate

**Google Cloud Console Setup** ← DO THIS IN PARALLEL WHILE CODING
**DO NOT WAIT** - Complete these steps while Claude codes Phase 1
- [ ] Step 1: Create Google Cloud project at https://console.cloud.google.com/ (project name: "NeedThisDone Appointments")
- [ ] Step 2: Enable Google Calendar API
- [ ] Step 3: Configure OAuth consent screen (External, with scopes: calendar.events, calendar.readonly)
- [ ] Step 4: Create OAuth 2.0 credentials (Web application)
  - Authorized origins: `https://needthisdone.com`, `http://localhost:3000`
  - Redirect URIs: `https://needthisdone.com/api/google/callback`, `http://localhost:3000/api/google/callback`
- [ ] Step 5: Copy credentials and provide to Claude:
  - GOOGLE_CLIENT_ID
  - GOOGLE_CLIENT_SECRET
- [ ] Step 6: Verify setup (check Credentials, Enabled APIs, OAuth consent)

**Full detailed instructions** are in the implementation plan file at: `.claude/plans/modular-meandering-hinton.md` (section: "Google Cloud Console Setup Guide")

**Stripe Payments** (blocked until Medusa done)
- [ ] Create Stripe account at https://stripe.com
- [ ] Get live API keys (STRIPE_SECRET_KEY, NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
- [ ] Create webhook endpoint at /api/stripe/webhook
- [ ] Get webhook signing secret (STRIPE_WEBHOOK_SECRET)
- [ ] Add all keys to .env.local
- [ ] Test payment flow in checkout
- [ ] Verify webhook events process correctly

**Email Notifications - E-commerce** (blocked until Medusa + Stripe)
- [ ] Add order confirmation emails
- [ ] Add purchase receipt emails

**Testing & Verification**
- [ ] Test Medusa backend locally: `npm run test:e2e -- e2e/shop.spec.ts`
- [ ] Verify endpoints work: `/api/shop/products`, `/api/cart`, `/api/checkout`
- [ ] Manual smoke test: browse shop → add to cart → checkout flow
- [ ] Run accessibility tests: `npm run test:a11y`

### Short Term

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

---

## Recently Completed

_Keep ~5-10 recent wins here, trim periodically once documented in README.md_

- [x] Real Medusa Backend - Full implementation with TypeORM patch for 0.3.23+ compatibility. Products seeded via Admin API (seed-products.js). Cart and checkout fully functional. 32/32 shop E2E tests passing. (Dec 2025)
- [x] Consultation Products - 3 products created: 15-min ($20), 30-min ($35), 55-min ($50) with `requires_appointment` metadata. Shop page displays correct prices via `variants[0].prices[0].amount`. (Dec 2025)
- [x] Production Readiness Audit - Comprehensive security audit completed. Identified 4 critical issues (hardcoded secrets), verified checkout is real (not mock), documented all findings. (Dec 2025)
- [x] Auth Email Templates & Admin Alerts - Created WelcomeEmail.tsx and LoginNotificationEmail.tsx templates. Added sendWelcomeEmail() and sendLoginNotification() to email-service.ts. Wired to auth routes (signup sends welcome, login sends notification). Created test-emails.ts script for manual verification. All 4 email types tested successfully. (Dec 2025)
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
