# PRD: Merge Pricing & Shop Pages

**Date:** 2026-02-16
**Status:** Approved
**Goal:** Eliminate the confusing fork between /pricing (read-only menu) and /shop (browse & buy) by merging them into a single page that educates AND converts.

## Problem

The current funnel has two pages showing the same products in different layouts:

- `/pricing` — curated menu board with trust content, links to /shop for purchasing
- `/shop` — product listing with search/filter, links to /shop/{handle} for details

Visitors don't know whether to go Services → Pricing → Shop, or Services → Shop, or straight to Contact. The pages compete instead of complementing each other.

## Solution

Merge into a single `/pricing` page that combines the curated presentation of pricing with cart functionality from shop. Product detail pages (`/shop/{handle}`) remain unchanged.

### Simplified Funnel

```
BEFORE: Home → Services → Pricing (read-only) → Shop (buy) → Cart → Checkout
AFTER:  Home → Services → Pricing (browse + buy) → Cart → Checkout
```

## What the Merged Page Looks Like

```
┌──────────────────────────────────────────────────────────┐
│  HERO (from pricing)                                     │
│  "Invest in what moves you forward."                     │
│  Quick-nav pills: Websites | Automation | AI             │
├──────────────────────────────────────────────────────────┤
│  TRUST STRIP (from pricing)                              │
│  50% deposit · Refund guarantee                          │
├──────────────────────────────────────────────────────────┤
│  HOW IT WORKS (from pricing)                             │
│  1. Pick  2. Pay 50%  3. Review & launch                 │
├──────────────────────────────────────────────────────────┤
│  WEBSITE PACKAGES section                                │
│  3 cards with "Add to Cart" + "View Details" buttons     │
├──────────────────────────────────────────────────────────┤
│  AUTOMATION & AI section                                 │
│  2 cards with "Add to Cart" + "View Details" buttons     │
├──────────────────────────────────────────────────────────┤
│  ADD-ONS section (all add-ons, not just first 6)         │
│  Tiles with "Add to Cart" on each                        │
├──────────────────────────────────────────────────────────┤
│  CONSULTATION CTA                                        │
│  "Not sure? Book a free call"                            │
├──────────────────────────────────────────────────────────┤
│  QUOTE BANNER                                            │
│  "Already have a quote? Authorize it here"               │
├──────────────────────────────────────────────────────────┤
│  PRICING FAQ                                             │
└──────────────────────────────────────────────────────────┘
```

## What Does NOT Change

- `/services` page (already strong, CTAs point to /pricing — still works)
- Homepage (single CTA "See What We Build" → /services)
- `/shop/{handle}` product detail pages (kept as deep-dive before checkout)
- `/contact`, `/faq`, `/how-it-works`, `/about`, `/work`
- Cart/checkout flow (Medusa CartContext)
- Product data source (Medusa API via `/api/pricing/products`)
- Nav links (Services | Pricing | Blog + Contact button)

---

## Phases

### Phase 1: Add Cart to Pricing Page

**Goal:** Make the pricing page shoppable without changing its layout or removing /shop.

#### Tasks

- [ ] **1.1** Import `useCart` into `UnifiedPricingPage.tsx`
- [ ] **1.2** Add "Add to Cart" button to each website package card (alongside existing "View Details")
- [ ] **1.3** Add "Add to Cart" button to automation & AI service cards
- [ ] **1.4** Add "Add to Cart" button to each add-on tile
- [ ] **1.5** Handle loading/success states on cart buttons (spinner → checkmark → reset)
- [ ] **1.6** Show cart item count indicator or toast on successful add
- [ ] **1.7** Test: verify cart works from pricing page (add item, go to /cart, see item)

**Cart button pattern** (from `ProductDetailClient.tsx`):
```typescript
const { addItem } = useCart();
await addItem(product.variantId, quantity, {
  title: product.title,
  unit_price: product.price,
  thumbnail: product.images?.[0]?.url,
});
```

**Acceptance criteria:**
- Every product on /pricing has an "Add to Cart" button
- Clicking "Add to Cart" adds the item to the Medusa cart
- Button shows loading state during add, success briefly, then resets
- "View Details" links to /shop/{handle} still work
- No regressions on mobile layout

---

### Phase 2: Show All Add-ons

**Goal:** Remove the "first 6" limit on add-on tiles so /pricing is the complete catalog.

#### Tasks

- [ ] **2.1** Change `addons.slice(0, 6)` to show all add-ons
- [ ] **2.2** Remove "Browse All Add-ons → /shop" link (no longer needed)
- [ ] **2.3** If add-on count exceeds ~9, add a simple search/filter (optional — defer if <9 exist)
- [ ] **2.4** Test: verify all add-ons display with correct prices and cart buttons

**Acceptance criteria:**
- All add-ons from Medusa appear on /pricing
- No "Browse All" link pointing to /shop
- Layout handles 6-12 add-ons gracefully (3-column grid already works)

---

### Phase 3: Redirect /shop and Clean Up

**Goal:** Eliminate /shop as a standalone page. Redirect to /pricing.

#### Tasks

- [ ] **3.1** Add redirect in `app/app/shop/page.tsx` — redirect /shop → /pricing
- [ ] **3.2** Keep `app/app/shop/[productId]/page.tsx` intact (product detail pages stay)
- [ ] **3.3** Update all internal links that point to `/shop` (change to `/pricing`)
  - Search codebase for `href="/shop"` or `href='/shop'` (excluding /shop/)
- [ ] **3.4** Update nav config if Shop appears anywhere in nav/footer links
- [ ] **3.5** Remove `ProductListingPage.tsx` component (dead code after redirect)
- [ ] **3.6** Remove shop-specific imports/components that are no longer used:
  - `CategoryFilter` (if only used by ProductListingPage)
  - `RecentlyViewedWidget` (if only used by ProductListingPage — check first)
  - `EmptyState` (check if used elsewhere)
  - Sort dropdown logic
- [ ] **3.7** Update any E2E tests that reference /shop listing page
- [ ] **3.8** Test: /shop redirects to /pricing, /shop/{handle} still works, no broken links

**Acceptance criteria:**
- `/shop` → 301 redirect to `/pricing`
- `/shop/starter-site` (etc.) still renders product detail
- No internal links point to `/shop` (only `/shop/{handle}`)
- No dead code from old shop listing page
- E2E tests pass or are updated

---

### Phase 4: Verify Full Funnel

**Goal:** End-to-end verification that the simplified funnel works.

#### Tasks

- [ ] **4.1** Walk the full funnel manually: Home → Services → Pricing → Add to Cart → Cart → Checkout
- [ ] **4.2** Verify services page CTAs land correctly on /pricing sections (anchor links)
- [ ] **4.3** Verify /pricing anchor scrolling works (#websites, #automation)
- [ ] **4.4** Run `npm run test:e2e` — fix any failures
- [ ] **4.5** Run `npm run test:unit` — fix any failures (feature-inventory may need updating)
- [ ] **4.6** Mobile testing: verify cart buttons don't break card layouts on small screens
- [ ] **4.7** Update feature-inventory test if it references /shop listing page

**Acceptance criteria:**
- Full funnel works end-to-end on desktop and mobile
- All existing tests pass (updated as needed)
- No console errors on any page in the funnel

---

## Files Expected to Change

| File | Change |
|------|--------|
| `components/pricing/UnifiedPricingPage.tsx` | Add cart imports, cart buttons, show all add-ons |
| `app/shop/page.tsx` | Replace with redirect to /pricing |
| `components/shop/ProductListingPage.tsx` | Delete (dead code) |
| `components/shop/CategoryFilter.tsx` | Delete if only used by ProductListingPage |
| Internal links referencing `/shop` | Update to `/pricing` |
| E2E tests referencing /shop | Update or remove |
| `__tests__/feature-inventory.test.ts` | Update if /shop listing is referenced |

## Files That Stay Unchanged

| File | Why |
|------|-----|
| `app/shop/[productId]/page.tsx` | Product detail pages still serve /shop/{handle} |
| `components/shop/ProductDetailClient.tsx` | Detail page rendering unchanged |
| `context/CartContext.tsx` | Cart logic unchanged |
| `app/services/page.tsx` | CTAs already point to /pricing |
| `components/home/` | Homepage unchanged |

## Risk Assessment

| Risk | Mitigation |
|------|------------|
| /shop bookmarks break | 301 redirect preserves access |
| SEO impact from removing /shop | Low — /pricing is the stronger page. Redirect passes link equity. |
| Cart button UX on small cards | Test on mobile. May need icon-only button on add-on tiles. |
| E2E test failures | Phase 4 explicitly addresses this |

## Success Metrics

- Visitor can go from homepage to checkout in **3 clicks** (Services → Pricing → Add to Cart)
- Zero pages showing the same products in different layouts
- All internal links resolve without dead ends
