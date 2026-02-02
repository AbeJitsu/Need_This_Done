# Project Memory

Key learnings and patterns discovered during development.

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

## Admin Dashboard Features — Feb 1, 2026

**Product Analytics** (`/admin/product-analytics`)
- Shows product engagement: views, cart adds, purchases, conversion funnel
- Time range filters: 7/14/30/90 days
- Popular products list + trending products (24h growth)
- Uses existing `product_interactions` table and DB views
- API: `/api/admin/product-analytics`

**Enrollments Management** (`/admin/enrollments`)
- Course enrollment oversight with CRUD operations
- Summary: total/free/paid enrollments, completion rate, revenue
- Filterable table with user details, progress tracking
- Completes EnrollButton component integration
- API: `/api/admin/enrollments`

**Order Analytics** (`/admin/analytics`)
- SVG-based charts (no external dependencies)
- Donut chart for order status, line chart for revenue trends
- Summary stats: daily average, peak day, totals
