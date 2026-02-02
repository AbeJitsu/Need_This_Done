# Project Memory

Key learnings and patterns discovered during development.

## Project Status — Feb 2, 2026

**Current State:** Mature, production-ready with comprehensive reliability hardening
- Backend reliability audit completed (9 of 10 critical issues resolved)
- Customer-facing features: Order confirmation emails, quote authorization, appointment reminders
- Admin dashboard: Full appointment management with Google Calendar, product analytics, enrollments
- Test suite: 69 E2E tests + accessibility tests, cleaned up non-enforcing artifacts

**Next Priority Areas:**
1. Cache invalidation race condition handling (low priority, no blocking issues)
2. Load testing for Redis circuit breaker
3. Expansion of rate limiting to other cost-sensitive endpoints

## Customer-Facing Features — Feb 1, 2026

**Order Confirmation Email** (`api/stripe/webhook/route.ts`)
- Triggered on `checkout.session.completed` webhook event
- Sends confirmation via Resend to customer email

**Quote Authorization & Deposit** (`app/quotes/[ref]/page.tsx`)
- Customer-facing page for reviewing and authorizing quotes
- Stripe-powered deposit collection integrated into the flow
- Uses quote reference token for secure access (no auth required)

**Auth Hardening** (commit ca89e05)
- Added `requireAdmin()` checks to: media upload/delete, file access, embeddings index, product image upload
- Added Zod validation to routes that previously accepted raw input

## Backend Reliability Patterns — Feb 1, 2026

**Request Validation** (`lib/api-validation.ts`, `lib/validation.ts`)
- Zod-based schema validation for all API routes
- Auto-normalizes inputs (trim, lowercase emails)
- Type-safe results prevent runtime errors
- Input sanitization: blocks directory traversal, email injection
- Length validation: prevents database overflow attacks

**Timeout Protection** (`lib/api-timeout.ts`)
- Configurable timeouts: 8s external APIs, 10s database, 2s cache
- `withTimeout()`, `withRetry()`, `withTimeoutAll()` wrappers
- Applied to: cart operations, quote authorization, payment intents

**Redis Hardening** (`lib/redis.ts`)
- Circuit breaker pattern with 10 max retries
- Exponential backoff with jitter (prevents thundering herd)
- 3s command timeout, graceful degradation on failure

**Webhook Idempotency** (`api/stripe/webhook/route.ts`)
- Stores Stripe event IDs in `webhook_events` table
- Prevents duplicate processing when webhooks are retried
- Critical for payment operations

**Database Transactions** (migrations 041)
- Quote creation + project updates atomic via `create_quote_transaction()`
- Prevents orphaned records on partial failures
- Ensures data consistency

**Race Condition Prevention** (`api/appointments/request/route.ts`)
- Atomic time slot validation: fetch all appointments before checking availability
- Prevents TOCTOU bugs in concurrent booking requests
- Single query approach eliminates race window

**Transient Failure Recovery** (`lib/supabase-retry.ts`)
- Auto-retry wrapper for database operations (3 attempts max)
- Smart error classification: retry connection issues, fail fast on constraints
- Exponential backoff with jitter prevents thundering herd
- Applied to: projects, enrollments, quote auth

**Request Deduplication** (`lib/request-dedup.ts`)
- SHA-256 fingerprinting prevents duplicate submissions
- Redis-backed with 60s TTL window
- Graceful degradation if Redis unavailable
- Returns 429 for duplicates within window
- Applied to: project submissions

## Helper Library Growth

**Medusa Admin Client** (`lib/medusa-client.ts`)
- Added `updateVariantInventory()` for bulk inventory updates
- Centralized admin authentication with `getMedusaAdminToken()`
- Existing helpers: `getOrder()`, `getCart()`, `listOrders()`

**Medusa Helpers** (`lib/medusa-helpers.ts`)
- ~85 lines of reusable e-commerce logic
- Reduces duplication across pages and API routes

## Admin Dashboard Features — Feb 2, 2026

**Google Calendar Integration** (`/admin/settings`)
- OAuth connection UI: Connect/disconnect buttons with status display
- Shows connected Google email and available features
- Token management: Expiration errors surface to admin
- Auto-refresh implemented in `lib/google-calendar.ts`
- API: `/api/google/status`, `/api/google/disconnect`

**Appointment Management** (`/admin/appointments`)
- Email delivery tracking: Shows success/failure status on approval
- Calendar event creation status visible to admin
- Graceful degradation: Appointments approve even if email/calendar fails
- Admin receives actionable warnings for failures
- **Automatic Reminder Emails** (Feb 2): Sends 24h and 1h pre-appointment reminders
  - Cron job: `/api/cron/appointment-reminders` (runs hourly)
  - Tracking table prevents duplicate emails
  - Beautiful template with appointment details and meeting links
  - Reduces no-shows through proactive customer communication

**Product Analytics** (`/admin/product-analytics`)
- Product engagement: views, cart adds, purchases, conversion funnel
- Time range filters: 7/14/30/90 days
- Popular products list + trending products (24h growth)
- API: `/api/admin/product-analytics`

**Enrollments Management** (`/admin/enrollments`)
- Course enrollment oversight with CRUD operations
- Summary: total/free/paid enrollments, completion rate, revenue
- Filterable table with user details, progress tracking
- API: `/api/admin/enrollments`
