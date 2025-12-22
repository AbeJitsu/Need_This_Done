# TODO

Central task tracker for NeedThisDone.com. Items move through: **To Do** → **In Progress** → **Recently Completed** → documented in README.md.

---

## Production Readiness Status

**Last Verified:** December 2025

| Component | Status | Notes |
|-----------|--------|-------|
| Medusa Backend | ✅ Working | Products, carts, checkout functional |
| Stripe Payments | ✅ Working | Real payment processing (not mock) |
| E2E Tests | ✅ 100% | 126/126 passing |
| Security | ✅ Fixed | All critical issues resolved |
| Google Calendar | 🟡 90% | Backend + Admin UI + credentials complete, needs testing |
| Admin Approval | 🟡 90% | Dashboard + endpoints + credentials done, needs testing |
| Infrastructure | ✅ Migrated | Vercel hosting live, Digital Ocean shut down |
| DNS | ✅ Configured | needthisdone.com → Vercel via Namecheap |
| Email (Resend) | ✅ Working | hello@needthisdone.com verified |

### Critical Security Issues ✅ RESOLVED

All security issues fixed (Dec 2025):
1. ~~Hardcoded admin password~~ → Now uses `MEDUSA_ADMIN_PASSWORD` env var
2. ~~Exposed debug endpoints~~ → Protected with admin authentication
3. ~~Weak fallback secrets~~ → `medusa-config.js` requires all env vars

---

## In Progress

_Currently active work items_

**Google Calendar Integration - Final Testing & Deployment**

- [x] Google Cloud Console setup complete (credentials in .env.local)
- [ ] Manual testing of appointment booking flow in dev environment
- [ ] Test Google OAuth authorization flow
- [ ] Test calendar event creation on appointment approval
- [ ] Deploy to production

---

## To Do

### Immediate

**Google OAuth Display URL** 🟡 PENDING
- [ ] Google Sign-In currently shows `oxhjtmozsdstbokwtnwa.supabase.co` instead of `needthisdone.com`
- **Option A:** Supabase Custom Domain ($35/month Pro plan required)
- **Option B:** Implement direct Google Sign-In (bypass Supabase Auth for OAuth)
- Decision needed on preferred approach

**Google Cloud Console Setup** ✅ COMPLETE
- [x] Google Cloud project created
- [x] Google Calendar API enabled
- [x] OAuth consent screen configured
- [x] OAuth 2.0 credentials created and stored in .env.local

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

### December 2025 - Latest Completions

**Claude Hooks Cleanup for Autonomous Work** ✅ COMPLETE
- [x] Evaluated all 4 hooks against autonomous workflow goals
- [x] Deleted `pre-commit-check.sh` (blocked commits, conflicted with `/dac` approval)
- [x] Rewrote `stop-check.sh` to check TODO.md/README.md instead of non-existent checklist
- [x] Simplified `user-prompt-submit.sh` (60 lines → 15 lines, just a brief reminder)
- [x] Kept `post-tool-use.sh` (auto-lint, non-blocking, supports No Broken Windows)
- [x] Documented all 3 hooks in CLAUDE.md

**Infrastructure Migration to Vercel** ✅ COMPLETE
- [x] Added needthisdone.com and www.needthisdone.com to Vercel
- [x] Updated DNS in Namecheap (A record → 216.150.1.1, www CNAME → cname.vercel-dns.com)
- [x] Resend email domain already verified (SPF, DKIM configured)
- [x] Shut down Digital Ocean droplet
- [x] Merged railway-migration branch to main
- [x] SSL auto-provisioned by Vercel
- [x] Site live at https://needthisdone.com

**Dark Mode Accent Button Contrast Fix** ✅ COMPLETE
- [x] Updated `accentColors.orange` in `app/lib/colors.ts` (dark mode: bg-orange-700, text-white, border-white)
- [x] Updated `accentColors.teal` with same contrast pattern (5:1+ ratio)
- [x] Light mode: text-*-900 for better contrast on light backgrounds
- [x] Hover states updated for smooth transitions
- [x] WCAG AA compliant: white text on dark colored backgrounds achieves 5:1+ contrast

**Visual Regression Testing for Checkout Flow** ✅ COMPLETE
- [x] Created comprehensive checkout screenshot test suite (`checkout-screenshots.spec.ts`)
- [x] Captured 14 visual regression screenshots documenting full checkout journey
- [x] Added screenshot baseline update workflow
- [x] Tests catch unintended UI changes before they ship

**Checkout Experience Improvements** ✅ COMPLETE
- [x] Made order summary sticky during checkout (customers can always see their total)
- [x] Enhanced order summary styling with icon and better spacing
- [x] Clarified chatbot labels ("AI Assistant" for transparency)
- [x] Streamlined button text ("Continue" instead of "Continue to Payment")
- [x] Fixed Medusa checkout requirements (cart email initialization, payment sessions)

**Enhanced Appointment Booking System** ✅ COMPLETE
- [x] Added 24-hour advance booking requirement with validation
- [x] Limited bookings to 5 per day for quality control
- [x] Added 30-minute buffer between appointments
- [x] Created appointment availability check API endpoint (`/api/appointments/availability`)
- [x] Updated cart messaging about appointment scheduling
- [x] Removed confusing "Learn more" links from How It Works steps 2-4

**How It Works Page Redesign** ✅ COMPLETE
- [x] Transformed from functional to warm/confidence-building UX
- [x] Changed headline from "How It Works" to "We Make It Easy"
- [x] Added trust badges (personal attention, clear updates, transparent pricing)
- [x] Made Step 1 a hero card with prominent CTA
- [x] Condensed Steps 2-4 into horizontal flow
- [x] Added "Questions about the process?" section

**DevOps & Testing Improvements** ✅ COMPLETE
- [x] Improved Medusa API response handling (expanding product metadata)
- [x] Fixed checkout tests to handle Stripe live mode gracefully

**Google Calendar Integration Backend** ✅ COMPLETE
- [x] Created Supabase migration: google_calendar_tokens table
- [x] Created `/app/lib/google-calendar.ts` with OAuth flow
- [x] Created appointment_requests Supabase table (with business hour validation)
- [x] Built appointment request form component (post-checkout)
- [x] Created order confirmation & appointment confirmation email templates
- [x] Wired appointment request email notifications (AppointmentRequestNotificationEmail.tsx)
- [x] Built admin appointments dashboard (`/admin/appointments`)
- [x] Implemented approve/modify/cancel endpoints
- [x] Created calendar event on approval (Google Calendar API)
- [x] Sent confirmation emails with .ics attachments
- [x] E2E tests for appointment booking flow (23 tests in appointments.spec.ts)

### Earlier Completions (Earlier in December)

- [x] **Appointment E2E Tests** - Created comprehensive test suite (`appointments.spec.ts`) with 23 tests covering form validation, API endpoint security, admin dashboard, and checkout flow integration. Fixed playwright.config.ts for ESM compatibility. (Dec 2025)
- [x] **Abandoned Cart Email** - Created `AbandonedCartEmail.tsx` template with cart items display, optional discount code, and recovery CTA. Added `sendAbandonedCartEmail()` to email service. (Dec 2025)
- [x] **Order Status UI** - Built admin order status management UI at `/admin/shop/orders` with status filtering, update actions, and expandable details. Added PATCH `/api/admin/orders/[id]/status` endpoint. (Dec 2025)
- [x] **Admin Appointments Dashboard** - Built `/admin/appointments` page with status filtering, approve/cancel actions, and auth protection. Created API endpoints for listing appointments and managing their status. Google Calendar integration creates events on approval. (Dec 2025)
- [x] **Appointment Email Notifications** - Added AppointmentRequestNotificationEmail for admin alerts when customers request appointments. Wired into the appointment request API route. (Dec 2025)
- [x] **Purchase Receipt Email** - Created PurchaseReceiptEmail template with itemized order details, payment info, and totals. Added sendPurchaseReceipt to email service. (Dec 2025)
- [x] **E-commerce Email Templates** - Created OrderConfirmationEmail and AppointmentConfirmationEmail React templates. Added sendOrderConfirmation and sendAppointmentConfirmation to email service. (Dec 2025)
- [x] **Product URL Handles & Test Reliability** - Added `getByHandle` to medusa-client so product URLs like `/shop/consultation-15-min` work (not just IDs). Fixed Playwright config to load env vars from root `.env.local`. Updated all shop tests with proper timeouts for client-side rendering. (Dec 2025)
- [x] **Security Hardening** - Fixed critical security issues: removed hardcoded admin password (now env var), protected debug endpoints with admin auth, medusa-config.js now requires all secrets. (Dec 2025)
- [x] **Real Medusa Backend** - Full implementation with TypeORM patch for 0.3.23+ compatibility. Products seeded via Admin API. Cart and checkout fully functional. (Dec 2025)
- [x] **Consultation Products** - Created 3 products: 15-min ($20), 30-min ($35), 55-min ($50) with `requires_appointment` metadata. (Dec 2025)
- [x] **Auth Email Templates** - Created WelcomeEmail and LoginNotificationEmail templates. Wired to auth routes. All 4 email types working. (Dec 2025)
- [x] **Accessibility Compliance** - Fixed dark mode testing, heading order (h3→h2), centralized colors. WCAG AA compliant. (Dec 2025)
- [x] **Launch-a-Swarm Skill** - Created 5-domain agent architecture (Structure, Protection, Correctness, Evolution, Value). Integrated documentation workflow. Fixed DRY violations. Validated on real features. Documented in README.md (Developer Tools section).

---

## Known Issues

**Context7 MCP Authorization**
- `resolve-library-id` works but `get-library-docs` returns "Unauthorized"
- Try regenerating API key at [context7.com/dashboard](https://context7.com/dashboard)

---

*Last Updated: December 2025*
