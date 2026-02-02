# Project Memory

Key learnings and patterns discovered during development.

## E-commerce Flow Improvements — Feb 2026

**Abandoned Cart Recovery**
- Cron job enhanced with better error handling and logging
- Sends reminder emails for carts inactive 24+ hours
- File: `app/api/cron/abandoned-carts/route.ts`

**Order History**
- New pages for viewing order list and order details
- Files: `app/orders/page.tsx`, `app/orders/[orderId]/page.tsx`
- Uses Medusa helpers for fetching order data

**Error Handling**
- Added Next.js error boundaries: `error.tsx`, `global-error.tsx`
- Provides user-friendly error messages with recovery options

## SEO & Indexing Fixes — Feb 2026

**Google Indexing Issues Resolved**
- Removed dead pages from sitemap (migrated pages from root to /about)
- Added 301 redirects in `next.config.cjs` for old URLs
- Expanded SEO keywords, removed unused SearchAction schema

**Files Changed:**
- `app/sitemap.ts` - Cleaned up URL list
- `app/next.config.cjs` - Added redirects object
- `app/lib/seo-config.ts` - Expanded keywords
- `app/components/seo/JsonLd.tsx` - Removed broken schema

## Design Patterns

**Hero Gradient Pattern**
- Use diagonal gradient overlays instead of floating orbs on pricing page
- Simpler, more performant than multiple blur effects
- File: `app/components/pricing/UnifiedPricingPage.tsx`

## Helper Library Growth

**Medusa Helpers** (`app/lib/medusa-helpers.ts`)
- Centralized functions for fetching orders, carts, products
- ~85 lines of reusable e-commerce logic
- Reduces duplication across pages and API routes
