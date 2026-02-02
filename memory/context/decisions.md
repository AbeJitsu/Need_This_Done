# Architecture Decisions

Key decisions made and why.

## Helper Libraries Over Inline Code — Feb 2026

**Decision:** Consolidate Medusa API calls into `lib/medusa-helpers.ts`

**Why:**
- Same fetch logic was duplicated across pages and API routes
- DRY principle - write once, use everywhere
- Easier to update if Medusa API changes

**How:**
- Created helper functions: `getOrder()`, `getCart()`, `listOrders()`
- Import from `@/lib/medusa-helpers` in pages/routes

## Error Boundaries for User Experience — Feb 2026

**Decision:** Add Next.js error boundaries (`error.tsx`, `global-error.tsx`)

**Why:**
- Unhandled errors showed raw error pages to users
- Need graceful degradation with recovery options
- Better UX during API failures or unexpected bugs

**How:**
- `error.tsx` - Catches errors in route segments, offers "Try Again" button
- `global-error.tsx` - Root-level fallback for critical failures

## SEO Cleanup: Redirects Over Dead Links — Feb 2026

**Decision:** Use 301 redirects for migrated pages instead of leaving broken URLs

**Why:**
- Google Search Console showed 404s for old URLs
- Preserves SEO value from existing links/bookmarks
- Better user experience than "Page Not Found"

**How:**
- Added `redirects` array in `next.config.cjs`
- Maps old paths to new locations (e.g., `/about-us` → `/about`)

## Centralized Validation Over Inline Checks — Feb 1, 2026

**Decision:** Use Zod schemas in dedicated validation middleware

**Why:**
- Inline validation was scattered across 15+ API routes
- Type mismatches caused runtime errors (emails, UUIDs, phone numbers)
- DRY principle - validate once, use everywhere

**How:**
- Created `lib/api-validation.ts` with reusable validators
- Common schemas: ProjectSubmissionSchema, QuoteAuthorizationSchema
- Type-safe discriminated unions (`success` or `error`)

## Timeout Protection for External APIs — Feb 1, 2026

**Decision:** Wrap all external API calls (Medusa, Stripe) with timeout protection

**Why:**
- External services can hang indefinitely on network issues
- Users experienced infinite spinners waiting for responses
- No visibility into which external call was slow

**How:**
- Created `lib/api-timeout.ts` with configurable wrappers
- Default timeouts: 8s external, 10s database, 2s cache
- Applied to: cart operations, quote auth, payment intents

## Redis Circuit Breaker Over Infinite Retries — Feb 1, 2026

**Decision:** Implement circuit breaker pattern in Redis client

**Why:**
- Infinite reconnection loops froze the app when Redis was down
- Connection failures cascaded to all cache-dependent routes
- No graceful degradation strategy

**How:**
- Max 10 reconnection attempts with exponential backoff + jitter
- Circuit breaker: fail fast after 3 failures in 60s window
- 3s command timeout per operation
- Graceful fallback on all cache operations

## Webhook Idempotency Over Duplicate Processing — Feb 1, 2026

**Decision:** Track Stripe event IDs in database before processing

**Why:**
- Stripe retries failed webhooks automatically
- Without tracking, same payment could be processed multiple times
- Could lead to duplicate orders, charges, or inventory changes

**How:**
- Created `webhook_events` table (migration 040)
- Check event ID exists before processing
- Insert event ID first, then process (prevents race conditions)
- Applied to: payment success, refunds, disputes

## Database Transactions for Multi-Step Operations — Feb 1, 2026

**Decision:** Use Postgres transactions for quote creation + project updates

**Why:**
- Quote creation involved 2 steps: insert quote, update project
- If step 2 failed, orphaned quote record remained
- Data inconsistency broke admin views and user flows

**How:**
- Created `create_quote_transaction()` function (migration 041)
- Single atomic operation: both succeed or both rollback
- Applied to: quote authorization flow
- Pattern can extend to other multi-step operations

## Input Sanitization at System Boundaries — Feb 1, 2026

**Decision:** Sanitize all user input at API entry points

**Why:**
- File upload paths used simple string replace (vulnerable)
- Email fields not validated for injection attacks
- No length limits allowed database overflow attempts

**How:**
- Created `lib/validation.ts` with sanitization functions
- `sanitizeEmail()` - strips dangerous characters
- `sanitizeFilePath()` - prevents directory traversal
- `validateLength()` - enforces max string lengths
- Applied to: project submissions, file uploads, quote requests

## Race Condition Prevention via Atomic Validation — Feb 1, 2026

**Decision:** Fetch all relevant data before validation in concurrent scenarios

**Why:**
- Appointment booking had TOCTOU race: check time → book → conflict possible
- Multiple users could book same time slot simultaneously
- Time range calculation between fetch and validate created race window

**How:**
- Move all calculations before database query
- Single query fetches all existing appointments
- Validate against complete dataset atomically
- No time window between check and insert
- Applied to: appointment request flow

## Retry Logic for Transient Database Failures — Feb 1, 2026

**Decision:** Automatically retry database operations that fail due to network/connection issues

**Why:**
- Users saw 500 errors for temporary network hiccups
- Database connection timeouts treated same as constraint violations
- No distinction between retryable and permanent failures

**How:**
- Created `lib/supabase-retry.ts` with smart retry wrapper
- Classifies errors: retry connection issues, fail fast on constraints
- 3 retry attempts with exponential backoff + jitter
- Applied to: project submissions, enrollments, quote auth

## Request Deduplication for User Actions — Feb 1, 2026

**Decision:** Prevent duplicate form submissions within short time window

**Why:**
- Double-clicks on submit buttons created duplicate records
- Browser retry logic could resubmit POST requests
- No server-side protection against duplicate submissions

**How:**
- Created `lib/request-dedup.ts` with SHA-256 fingerprinting
- Redis-backed with 60-second TTL per request signature
- Returns 429 status for duplicates within window
- Graceful degradation if Redis unavailable
- Uses atomic SET NX to prevent race conditions
- Applied to: project submission endpoint

## Rate Limiting for API Protection — Feb 1, 2026

**Decision:** Add Redis-backed rate limiting to Chat API and other high-risk endpoints

**Why:**
- Chat API integrates with OpenAI (cost per request)
- No protection against API abuse or DoS attacks
- Could lead to bill shock from malicious/excessive usage
- Large message arrays could cause memory exhaustion

**How:**
- Redis-backed rate limiting: 20 requests/minute per IP
- Request validation: Max 50 messages, 50KB total size
- Message format validation prevents malformed data
- Applied to: `/api/chat` endpoint
- Pattern can extend to other cost-sensitive APIs

## Timeout Protection for External Dependencies — Feb 1, 2026

**Decision:** Wrap all external API calls with configurable timeouts

**Why:**
- External services (Medusa, Stripe) can hang indefinitely
- Users experienced infinite spinners waiting for responses
- Network issues should fail fast, not freeze the app
- Critical for checkout flow where multiple APIs are called sequentially

**How:**
- Created `lib/api-timeout.ts` with timeout wrappers
- Checkout flow timeouts: 8s cart operations, 15s order creation
- Applied to: cart fetch/update, payment session init/select, order creation
- Follows existing pattern from `lib/api-timeout.ts`

## Graceful Shutdown for Long-Running Processes — Feb 1, 2026

**Decision:** Implement proper cleanup handlers on process termination

**Why:**
- Redis connections leaked in Docker/Kubernetes environments
- No cleanup on SIGTERM/SIGINT left zombie connections
- Critical for containerized deployments

**How:**
- Added global shutdown handlers in `lib/redis.ts`
- Listens for: SIGTERM, SIGINT, beforeExit, uncaughtException, unhandledRejection
- Ensures Redis connections close properly on shutdown
- Prevents connection leaks and resource exhaustion

## Fail-Safe Appointment Approval — Feb 1, 2026

**Decision:** Approve appointments even if email or calendar fails

**Why:**
- Previously, appointment approval would fail completely if email/calendar errored
- Admin had no visibility into why approval failed
- Business logic shouldn't depend on notification delivery

**How:**
- Appointments approve to database first (critical path)
- Email and calendar operations attempt after approval
- Admin receives detailed status: success, warning, or partial failure
- Actionable error messages guide admin to fix configuration
- Applied to: `/api/admin/appointments/[id]/approve`
