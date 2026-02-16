# Library Utilities

## Medusa Client (`medusa-client.ts`)

Central client for all Medusa API communication.

```typescript
import { medusaClient } from '@/lib/medusa-client';

// Products
medusaClient.products.list()
medusaClient.products.get(id)
medusaClient.products.getByHandle(handle)

// Cart
medusaClient.carts.create()
medusaClient.carts.get(cartId)
medusaClient.carts.addItem(cartId, variantId, quantity)
medusaClient.carts.updateItem(cartId, lineItemId, quantity)
medusaClient.carts.removeItem(cartId, lineItemId)

// Orders
medusaClient.orders.create(cartId)
medusaClient.orders.get(orderId)
```

## Stripe Client (`stripe.ts`)

Server-side Stripe operations. **Used by API routes and webhooks, not called directly from frontend.**

```typescript
import { getStripe, createPaymentIntent } from '@/lib/stripe';

// One-time payments (called from /api/stripe/create-payment-intent)
const intent = await createPaymentIntent(amount, currency, metadata);

// Webhook handlers use these for verification
import { constructWebhookEvent } from '@/lib/stripe';
```

**Subscription note:** The `createSubscription` helper exists but subscriptions should be created through Medusa's checkout flow, not called directly. Medusa handles subscription creation using the product's `metadata.stripe_price_id`.

## Key Principle: Source of Truth

| Data | Source |
|------|--------|
| Products | Medusa (`medusa-client.ts`) |
| Cart | Medusa via CartContext |
| Orders | Medusa + Supabase |
| Payments | Stripe via Medusa checkout |
| Subscriptions | Medusa (creates Stripe subscriptions) |
| User data | Supabase |

**Never hardcode product/pricing data in frontend components.**

**Subscriptions flow through Medusa, not direct Stripe API calls.**

## Cache TTL Standards (`cache.ts` + `redis.ts`)

| TTL | Duration | Use Case |
|-----|----------|----------|
| `CACHE_TTL.STATIC` | 1 hour | Rarely-changing content (services, pricing) |
| `CACHE_TTL.LONG` | 5 minutes | Admin lists, product data |
| `CACHE_TTL.MEDIUM` | 1 minute | Dashboard data (default) |
| `CACHE_TTL.SHORT` | 30 seconds | Frequently updated data |
| `CACHE_TTL.REALTIME` | 10 seconds | Near real-time data |

Pattern-based invalidation: `cache.invalidatePattern('admin:projects:*')`

## AI Chatbot (`chatbot/`)

- **22 pages indexed** with 842 embeddings (pgvector, `text-embedding-3-small`, 1536 dimensions)
- Chunks: ~6000 characters each
- Config: `VECTOR_SEARCH_SIMILARITY_THRESHOLD=0.5`, `VECTOR_SEARCH_MAX_RESULTS=5`
- Health check: `/api/chatbot/health`
- Reindex: `npx tsx scripts/index-all-pages.ts`
- Verify: `npx tsx scripts/verify-chatbot-db.ts`, `npx tsx scripts/test-vector-search.ts`

## Inline Editing System

- 52 E2E tests (`field-discovery.spec.ts`, `field-editability.spec.ts`)
- Core files: `context/InlineEditContext.tsx`, `hooks/useEditableContent.ts`, `lib/content-path-mapper.ts`
- Storage: `page_content` table (JSONB) in Supabase
- Version history: 20 versions per page, one-click restore

## Backend Reliability Utilities

| File | Purpose |
|------|---------|
| `supabase-retry.ts` | Auto-retry for transient DB failures (3 attempts, exponential backoff) |
| `request-dedup.ts` | SHA-256 fingerprinting to prevent duplicate form submissions (60s TTL) |
| `api-timeout.ts` | Timeout protection (8s external, 10s DB, 2s cache) |
| `api-validation.ts` | Zod schema validation middleware for API routes |
| `validation.ts` | Input sanitization (email, file paths, length limits) |
| `redis.ts` | Circuit breaker pattern with graceful degradation |
