# TODO

Central task tracker for NeedThisDone.com. Items move through: **To Do** → **In Progress** → **Recently Completed** → documented in README.md.

---

## Production Readiness Status

**Last Verified:** December 2025

| Component | Status | Notes |
|-----------|--------|-------|
| Medusa Backend | ✅ Working | Products, carts, checkout functional |
| Stripe Payments | ✅ Working | Real payment processing (not mock) |
| E2E Tests | ✅ 100% | 110/110 passing |
| Security | ✅ Fixed | All critical issues resolved |
| Google Calendar | 🟡 80% | Backend + Admin UI complete, needs Google Cloud setup |
| Admin Approval | 🟡 80% | Dashboard + endpoints done, needs Google credentials |

### Critical Security Issues ✅ RESOLVED

All security issues fixed (Dec 2025):
1. ~~Hardcoded admin password~~ → Now uses `MEDUSA_ADMIN_PASSWORD` env var
2. ~~Default secrets in docker-compose.yml~~ → All secrets required, no fallbacks
3. ~~Exposed debug endpoints~~ → Protected with admin authentication
4. ~~Weak fallback secrets~~ → `medusa-config.js` requires all env vars

---

## In Progress

_Currently active work items_

**Google Calendar Appointment Booking** ← CURRENT PRIORITY

**Phase 2: Google Calendar Integration** ✅ COMPLETE
- [ ] Complete Google Cloud Console setup (see instructions in To Do section) ← BLOCKED: Needs user action
- [x] Create Supabase migration: google_calendar_tokens table
- [x] Create `/app/lib/google-calendar.ts` with OAuth flow
- [x] Create appointment_requests Supabase table (with business hour validation)
- [x] Build appointment request form component (post-checkout)
- [x] Create order confirmation & appointment confirmation email templates
- [x] Wire appointment request email notifications (AppointmentRequestNotificationEmail.tsx)

**Phase 3: Admin Approval Workflow** ✅ COMPLETE
- [x] Build admin appointments dashboard (`/admin/appointments`)
- [x] Implement approve/modify/cancel endpoints
- [x] Create calendar event on approval (Google Calendar API)
- [x] Send confirmation emails with .ics attachments

**Phase 4: Testing & Deploy (1-2 hrs)**
- [x] E2E tests for appointment booking flow (19 tests in appointments.spec.ts)
- [ ] Manual testing in dev environment
- [ ] Deploy to production

---

## To Do

### Immediate

**Google Cloud Console Setup** ← DO THIS IN PARALLEL WHILE CODING
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

**Production Security Hardening** ✅ COMPLETE
- [x] Add missing nginx security headers (HSTS, CSP, Permissions-Policy) - Added to both nginx.conf and nginx.prod.conf
- [x] Verify CORS settings for production domain - Fixed medusa-config.js (removed insecure fallback, added store_cors)

**Email Notifications - E-commerce** ✅ COMPLETE
- [x] Add order confirmation emails (OrderConfirmationEmail.tsx created)
- [x] Add appointment confirmation emails (AppointmentConfirmationEmail.tsx created)
- [x] Add purchase receipt emails (PurchaseReceiptEmail.tsx created)

### Short Term

**Admin Workflows**
- [ ] Inventory management interface
- [ ] Bulk product import/export
- [ ] Order status updates & fulfillment tracking
- [ ] Analytics dashboard (orders, revenue, trends)

### Medium Term

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

_Keep ~5-7 recent wins here, trim periodically once documented in README.md_

- [x] **Appointment E2E Tests** - Created comprehensive test suite (`appointments.spec.ts`) with 19 tests covering form validation, API endpoint security, admin dashboard, and checkout flow integration. Fixed playwright.config.ts for ESM compatibility. (Dec 2025)
- [x] **Abandoned Cart Email** - Created `AbandonedCartEmail.tsx` template with cart items display, optional discount code, and recovery CTA. Added `sendAbandonedCartEmail()` to email service. (Dec 2025)
- [x] **Order Status UI** - Built admin order status management UI at `/admin/shop/orders` with status filtering, update actions, and expandable details. Added PATCH `/api/admin/orders/[id]/status` endpoint. (Dec 2025)
- [x] **Admin Appointments Dashboard** - Built `/admin/appointments` page with status filtering, approve/cancel actions, and auth protection. Created API endpoints for listing appointments and managing their status. Google Calendar integration creates events on approval. (Dec 2025)
- [x] **Appointment Email Notifications** - Added AppointmentRequestNotificationEmail for admin alerts when customers request appointments. Wired into the appointment request API route. (Dec 2025)
- [x] **Purchase Receipt Email** - Created PurchaseReceiptEmail template with itemized order details, payment info, and totals. Added sendPurchaseReceipt to email service. (Dec 2025)
- [x] **Google Calendar Integration Backend** - Created google-calendar.ts OAuth client, Supabase migrations for tokens & appointments, appointment request form component, API routes for /api/appointments/request and /api/google/connect|callback. Checkout page now shows appointment scheduling form for consultation products. (Dec 2025)
- [x] **E-commerce Email Templates** - Created OrderConfirmationEmail and AppointmentConfirmationEmail React templates. Added sendOrderConfirmation and sendAppointmentConfirmation to email service. (Dec 2025)
- [x] **Product URL Handles & Test Reliability** - Added `getByHandle` to medusa-client so product URLs like `/shop/consultation-15-min` work (not just IDs). Fixed Playwright config to load env vars from root `.env.local`. Updated all shop tests with proper timeouts for client-side rendering. (Dec 2025)
- [x] **Security Hardening** - Fixed all 4 critical security issues: removed hardcoded admin password (now env var), removed default secrets from docker-compose.yml, protected debug endpoints with admin auth, medusa-config.js now requires all secrets. (Dec 2025)
- [x] **Real Medusa Backend** - Full implementation with TypeORM patch for 0.3.23+ compatibility. Products seeded via Admin API. Cart and checkout fully functional. (Dec 2025)
- [x] **Consultation Products** - Created 3 products: 15-min ($20), 30-min ($35), 55-min ($50) with `requires_appointment` metadata. (Dec 2025)
- [x] **Auth Email Templates** - Created WelcomeEmail and LoginNotificationEmail templates. Wired to auth routes. All 4 email types working. (Dec 2025)
- [x] **Accessibility Compliance** - Fixed dark mode testing, heading order (h3→h2), centralized colors. WCAG AA compliant. (Dec 2025)

---

## Known Issues

**Context7 MCP Authorization**
- `resolve-library-id` works but `get-library-docs` returns "Unauthorized"
- Try regenerating API key at [context7.com/dashboard](https://context7.com/dashboard)

---

*Last Updated: December 2025*
