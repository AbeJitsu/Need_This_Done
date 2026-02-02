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
