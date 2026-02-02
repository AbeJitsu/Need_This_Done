# Project Memory

Key learnings and patterns discovered during development.

## Backend Reliability Patterns — Feb 1, 2026

**Request Validation** (`lib/api-validation.ts`)
- Zod-based schema validation for all API routes
- Auto-normalizes inputs (trim, lowercase emails)
- Type-safe results prevent runtime errors
- Common schemas: ProjectSubmissionSchema, QuoteAuthorizationSchema

**Timeout Protection** (`lib/api-timeout.ts`)
- Configurable timeouts: 8s external APIs, 10s database, 2s cache
- `withTimeout()`, `withRetry()`, `withTimeoutAll()` wrappers
- Applied to: cart operations, quote authorization, payment intents

**Redis Hardening** (`lib/redis.ts`)
- Circuit breaker pattern with 10 max retries
- Exponential backoff with jitter (prevents thundering herd)
- 3s command timeout, graceful degradation on failure

## Helper Library Growth

**Medusa Admin Client** (`lib/medusa-client.ts`)
- Added `updateVariantInventory()` for bulk inventory updates
- Centralized admin authentication with `getMedusaAdminToken()`
- Existing helpers: `getOrder()`, `getCart()`, `listOrders()`

**Medusa Helpers** (`lib/medusa-helpers.ts`)
- ~85 lines of reusable e-commerce logic
- Reduces duplication across pages and API routes

## Admin Dashboard Features — Feb 1, 2026

**Analytics Visualizations** (`app/admin/analytics/page.tsx`)
- SVG-based charts with no external dependencies (Chart.js avoided)
- Donut chart for order status distribution (visual pie chart)
- Line chart with gradient fill for revenue trends
- Bar chart for order volume with hover tooltips
- Summary stats: daily average, peak day, total orders/revenue

**Inventory Management** (`app/api/admin/inventory/route.ts`)
- Bulk inventory updates via PATCH endpoint
- Connected to Medusa backend via `updateVariantInventory()`
- Returns detailed success/failure results per variant
- Proper error handling and validation
