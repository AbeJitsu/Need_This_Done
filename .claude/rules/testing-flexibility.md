# Testing — Single Source of Truth

Everything about what's tested, why, and how to run it.

## Quick Reference

```bash
cd app

npm run test:unit        # Unit tests (vitest) — fast, no browser
npm run test:a11y        # Accessibility tests (vitest) — component contrast/ARIA
npm run test:e2e         # End-to-end tests (playwright) — full browser flows
npm run test:quick       # Unit + a11y together
npm run test:all         # Everything
```

## What We Test and Why

### 1. Feature Inventory (`__tests__/feature-inventory.test.ts`) — 68 tests

**Why this exists:** Our business model is clone-and-strip. We build one full site with every feature, then clone it for each customer and remove what they didn't pay for. These tests are the **feature manifest** — they verify every feature in every pricing tier actually exists in the codebase.

**How it works:** Checks that files exist (pages, APIs, components, lib utilities) for every feature listed in Starter, Growth, and Pro tiers.

**When it's useful:**
- After stripping features for a lower-tier customer, failing tests = your removal checklist
- After refactoring, confirms nothing was accidentally deleted
- Acts as living documentation of what each tier includes

**Structure:**
```
Starter Site ($500)
├── Custom pages (marketing pages exist)
├── Contact form (form + API + email utility)
├── Basic SEO (config + JSON-LD)
└── Design system (colors + components)

Growth Site ($1,500) — includes Starter
├── Database (Supabase clients + migrations)
└── Appointment booking (API + calendar + email)

Pro Site ($5,000) — includes Growth
├── Customer accounts (auth pages + APIs + context)
├── Payments (checkout + Stripe + deposits)
├── Blog (pages + admin + API + editor)
├── Visual editor (inline edit context + components + API + version history)
├── Reviews (API + admin pages + notification emails)
├── Loyalty (points APIs + referral APIs + admin pages)
├── Email campaigns (templates + campaigns + send API)
├── Product analytics (API + admin page)
├── AI chatbot (widget + chat API + embeddings + content processing)
├── Automated emails (4 cron jobs + email service)
├── Google Calendar sync (OAuth + calendar lib + reminder cron)
└── Admin dashboard (6+ admin pages + APIs + sidebar)

Add-ons
└── Online Store (shop + cart + waitlist + comparison + wishlist + browse history)

Backend Reliability (all tiers)
├── Supabase connection pooling
├── Email retry/failure tracking
├── Rate limiting
├── Request deduplication
├── API timeout protection
├── Input validation
└── Redis circuit breaker
```

### 2. Pricing Restructure (`__tests__/pricing-restructure.test.ts`) — 9 tests

**Why:** The seed script (`scripts/seed-products.ts`) is the source of truth for all products in Medusa. These tests validate it matches the PRD — correct tier names, prices, add-ons, and plain-English descriptions (zero jargon).

**What it catches:**
- Wrong prices (e.g., Growth still at $1,200 instead of $1,500)
- Missing products (new add-ons not added)
- Tech jargon leaking into customer-facing descriptions
- "Most Popular" badge on wrong tier

### 3. Consultation Calendar (`__tests__/components/consultation-calendar.test.ts`) — 12 tests

**Why:** The time slot generation has business rules that are easy to get wrong — duration filtering (45-min call can't start at 4:30 PM), past-slot removal, weekend skipping. Pure logic, no UI needed.

**What it catches:**
- Slots that overflow business hours
- Past time slots showing up for today
- Weekend slots appearing
- Wrong AM/PM formatting

### 4. Deposit & Payment Logic (`__tests__/lib/deposit-*.test.ts`, `__tests__/api/deposit-*.test.ts`) — 28 tests

**Why:** Money math must be exact. Rounding errors, edge cases (odd amounts, zero, negative), and webhook handling all need coverage.

**Files:**
- `deposit-calculations.test.ts` — 50% deposit math, rounding
- `deposit-validation.test.ts` — Input validation for payment amounts
- `deposit-payment-intent.test.ts` — Stripe PaymentIntent creation
- `deposit-webhook.test.ts` — Stripe webhook event handling

### 5. API Route Tests (`__tests__/api/`) — 24 tests

**Why:** API routes handle real money, real orders, real customer data. Edge cases matter.

**Files:**
- `order-cancellation.test.ts` — Cancel flow, refund logic
- `ready-for-delivery-api.test.ts` — Delivery status transitions

### 6. Infrastructure Tests (`__tests__/lib/`) — 30 tests

**Why:** Reliability features protect against production failures.

**Files:**
- `request-dedup-atomicity.test.ts` — SHA-256 fingerprinting, concurrency, TTL expiry
- `content-path-mapper.test.ts` — Inline edit path construction (prevents the "editing doesn't work" bug)
- `wcag-contrast.test.ts` — Color contrast ratio calculations
- `payment-history.test.ts` — Payment record tracking

### 7. Accessibility Tests (`__tests__/components/*.a11y.test.tsx`) — 5 test files

**Why:** Interactive components must meet WCAG AA. These test ARIA attributes, keyboard navigation, and color contrast.

**Files:** Button, EnrollButton, CompareButton, CouponInput, ProgressBar, StarRating, StatusBadge

**Config:** `vitest.a11y.config.ts` (uses jsdom environment for DOM testing)

### 8. End-to-End Tests (`e2e/`) — 65+ spec files

**Why:** Real browser tests catch what unit tests can't — routing, hydration, visual regressions, full user flows.

**Key suites:**
| Test | What It Covers |
|------|----------------|
| `shop.spec.ts`, `shop-cart.spec.ts` | Product browsing, cart flow |
| `appointments.spec.ts` | Booking flow |
| `chatbot.spec.ts` | AI chat interaction |
| `reviews.spec.ts` | Review submission/display |
| `blog.spec.ts` | Blog listing/reading |
| `item-editing.spec.ts` | Inline editor (typing updates content) |
| `screenshots.spec.ts` | Full-page visual snapshots |
| `contrast-audit.spec.ts` | Page-level WCAG contrast |
| `page-render-stability.spec.ts` | All pages render without errors |

## Test Architecture

```
app/
├── __tests__/                    ← Unit tests (vitest, node environment)
│   ├── feature-inventory.test.ts ← Feature manifest (clone-and-strip)
│   ├── pricing-restructure.test.ts ← Seed script validation
│   ├── components/               ← Component logic + a11y tests
│   ├── lib/                      ← Pure function tests
│   └── api/                      ← API route tests
├── e2e/                          ← End-to-end (playwright, real browser)
├── vitest.unit.config.ts         ← Unit test config (node env, @/ alias)
└── vitest.a11y.config.ts         ← A11y test config (jsdom env)
```

## Config Details

**Unit tests** (`vitest.unit.config.ts`):
- Environment: `node` (fast, no DOM)
- Includes: `__tests__/lib/**`, `__tests__/api/**`, `__tests__/components/**/*.test.ts`, `__tests__/*.test.ts`
- Excludes: `*.integration.test.ts`
- Path alias: `@/` → app root

**A11y tests** (`vitest.a11y.config.ts`):
- Environment: `jsdom` (needs DOM for component rendering)
- Includes: `__tests__/components/*.a11y.test.tsx`

**E2E tests** (playwright):
- Config: `playwright.config.ts`
- Requires dev server running on port 3000
- Bypass mode: `SKIP_WEBSERVER=true npx playwright test --project=e2e-bypass`

## Rules

1. **New feature = new test.** If it's in a pricing tier, it goes in `feature-inventory.test.ts`
2. **New business logic = unit test.** Pure functions in `lib/` get tested in `__tests__/lib/`
3. **New interactive component = a11y test.** Buttons, inputs, modals get `.a11y.test.tsx`
4. **New user flow = e2e test.** Full journeys (checkout, booking, editing) get `.spec.ts`
5. **No jargon in tests.** Test descriptions should read like feature descriptions, not implementation details
6. **Dynamic page discovery.** Use `page-discovery` utility for tests that scan all pages — don't hardcode page lists

```typescript
// For tests that scan all pages, auto-discover instead of hardcoding
import { discoverAllPages, discoverPublicPages } from './utils/page-discovery';
const pages = discoverPublicPages(); // Never goes stale
```

## When to Run What

| Situation | Command |
|-----------|---------|
| Changed a lib function | `npm run test:unit` |
| Changed a component | `npm run test:a11y` |
| Changed a page or API route | `npm run test:e2e` |
| Before committing | `npm run test:quick` |
| Before merging to main | `npm run test:all` |
| After stripping features for a customer | `npm run test:unit` (expect failures = removal checklist) |
| After seeding products | `npm run test:unit` (pricing-restructure tests validate) |
