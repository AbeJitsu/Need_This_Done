# TODO

Central task tracker for NeedThisDone.com. Items move through: **To Do** → **In Progress** → **Recently Completed** → documented in README.md.

---

## Production Readiness Status

**Last Verified:** December 2025

| Component | Status | Notes |
|-----------|--------|-------|
| Medusa Backend | ✅ Working | Products, carts, checkout functional |
| Stripe Payments | ✅ Working | Real payment processing (not mock) |
| E2E Tests | ✅ 100% | 229 tests passing (inline edit + field validation) |
| Security | ✅ Fixed | RLS, function search_paths, extensions fixed |
| Google OAuth | ✅ Working | Users see needthisdone.com during sign-in |
| Google Calendar | 🟡 90% | Backend + Admin UI + credentials complete, needs testing |
| Admin Approval | 🟡 90% | Dashboard + endpoints + credentials done, needs testing |
| Infrastructure | ✅ Migrated | Vercel hosting live, Digital Ocean shut down |
| DNS | ✅ Configured | needthisdone.com → Vercel via Namecheap |
| Email (Resend) | ✅ Working | hello@needthisdone.com verified |
| Puck Page Builder | ✅ Active | Visual page builder with TipTap WYSIWYG editor |
| **Inline Editing** | ✅ **VALIDATED** | 12 pages, 52 field tests, click-to-edit working |
| **Auto-Loop System** | ✅ **TESTED** | E2E verified: elapsed time, session-start, stop-check all working |

---

## In Progress

<!-- Task markers: [→] working | [ ] ready | [x] done | [!] blocked -->

**Dark Mode System Redesign** (Dec 30, 2025)
```
┌─────────────────────────────────────────────────────────────────────────┐
│                    DARK MODE SYSTEM                                      │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  Problem: Too many color systems, inconsistent patterns, opacity bugs   │
│                                                                         │
│  Solution: Three principles                                             │
│  1. ALL colors from colors.ts (no hardcoded dark: classes)              │
│  2. NO opacity in dark mode (/20, /30, /50 = invisible)                 │
│  3. TWO patterns only: INVERSION (buttons) or NEUTRAL (sections)        │
│                                                                         │
│  See: .claude/rules/dark-mode-system.md                                 │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```
- [x] Fix setDarkMode helper (wrong localStorage key 'theme' → 'darkMode')
- [x] Fix accentColors.orange to use #ad5700 (true orange at 5.07:1 contrast)
- [x] Fix Button.tsx to use accentColors (inversion pattern)
- [x] Fix "Ready to Get Started" section (removed /20 opacity → solid gray-800)
- [x] Override Tailwind color scales in tailwind.config.cjs (500 = 4.5:1 with white for all colors)
- [x] Update colors.ts to use orange-500 instead of custom hex [#ad5700]
- [x] Update .claude/rules/colors.md with anchor system documentation
- [x] Test buttons in light and dark mode
- [x] Lighten text colors to WCAG AA minimum (-600 base, -700 hover)
- [x] Consolidate colors.ts: remove duplicate systems (removed primaryButtonColors, documented accentColors vs solidButtonColors)
- [x] Add sectionColors for page backgrounds (already exists: layoutBgColors, containerBg)

**Eliminate Hardcoded Colors** ✅ DONE (Dec 30, 2025)
```
┌─────────────────────────────────────────────────────────────────────────┐
│                    HARDCODED COLOR DEBT - RESOLVED                       │
├─────────────────────────────────────────────────────────────────────────┤
│  colors.ts cleaned: ✅ No -50 shades, no opacity in dark mode           │
│  Scanner: python3 scripts/find-hardcoded-colors.py → 0 violations       │
│  All 36+ files migrated to colors.ts imports                            │
│  Rule enforced: -100 minimum for light mode, solid colors in dark mode  │
└─────────────────────────────────────────────────────────────────────────┘
```
All 75 occurrences in 36 files fixed:
- [x] Admin Pages (15 files) - bg-gray-50 → containerBg, tableHeaderBg
- [x] Marketing Components (12 files) - neutralAccentBg for colored backgrounds
- [x] Editor/Puck Components (9 files) - hover states, upload zones
- [x] Shop Pages (2 files) - cart/checkout opacity patterns removed

**Post-Migration**
- [x] Re-run scanner: verified 0 violations
- [x] Add ESLint rule to prevent new hardcoded dark: classes (666 warnings for existing code)

**Dashboard Layout Issues** ✅ FIXED
- [x] Fix dashboard grid layout - changed from 6-col to 4-col grid, added Analytics link for 8 items (2x4)
- [x] Consider 3x3 grid, 4x2 grid - went with 4x2 for clean 2 rows at desktop
- [x] Ensure cards are evenly distributed - 8 items in 4 columns = balanced grid

**Replace Orange with Gold** ✅ DONE (Dec 31, 2025)
```
┌─────────────────────────────────────────────────────────────────────────┐
│                    ORANGE → GOLD COLOR RENAME - COMPLETE                 │
├─────────────────────────────────────────────────────────────────────────┤
│  Gold = #a36b00 at 500 (4.51:1 with white - WCAG AA)                    │
│  53 files updated, all orange references renamed to gold                │
│  CSS vars, Tailwind config, colors.ts, and all components migrated      │
└─────────────────────────────────────────────────────────────────────────┘
```
- [x] Rename --orange-* → --gold-* CSS variables in globals.css
- [x] Update tailwind.config.cjs: gold scale uses --gold-* vars
- [x] Update tailwind.config.cjs safelist: orange → gold
- [x] Update colors.ts: AccentVariant type and all exports
- [x] Update 49+ component files: variant values and class names
- [x] Update Storybook stories: options and examples
- [x] Verify no orange references remain (build passes)

**WCAG Color Calculator Admin Page** ✅ DONE (Dec 31, 2025)
```
┌─────────────────────────────────────────────────────────────────────────┐
│                    WCAG COLOR CALCULATOR                                 │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  Vision: Admin GUI to find WCAG AA compliant color combos               │
│                                                                         │
│  Features:                                                              │
│  - Input any base color, calculate 500/600 anchors automatically        │
│  - Show contrast ratios live as you adjust                              │
│  - Preview light/dark mode with the selected palette                    │
│  - Export to CSS variables or colors.ts format                          │
│                                                                         │
│  Libraries: chroma-js, colorjs.io, or polished for calculations         │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```
- [x] Create /admin/colors page with color picker UI
- [x] Implement WCAG contrast ratio calculation (lib/wcag-contrast.ts, 18 tests)
- [x] Auto-calculate 500 shade (4.5:1 with white) and 600 shade (4.5:1 with -100)
- [x] Live preview of color combos in light and dark mode
- [x] Export functionality for CSS variables (CSS and Tailwind formats)

**Automation & Developer Experience**
- [x] Auto-update changelog on every commit/deploy (Claude hook in post-tool-use.sh)
- [x] Process: Claude hook updates content/changelog/auto-log.json after git commits
- [x] Add changelog link to footer/navigation - added to Footer.tsx bottom row with Privacy/Terms
- [x] Design a changelog page for tech users (/changelog/technical - commit history, filters, stats)

---

**DRY Violations - Library** (Audit: Dec 30, 2025)
```
┌─────────────────────────────────────────────────────────────────────────┐
│  Problem: Same patterns repeated across lib/ files                      │
│  Impact: Bug fix = edit N files, easy to miss one                       │
│  Goal: 1 change = 1 file edit                                           │
└─────────────────────────────────────────────────────────────────────────┘
```
- [!] Extract `lib/lazy-client.ts` - deferred: only 2 occurrences (email/stripe), each with unique constructor options
- [!] Extract `lib/retry.ts` - deferred: patterns differ significantly (SDK errors vs HTTP codes, exponential vs linear backoff)
- [x] Extract `lib/auth-utils.ts` - verified: isUserAdmin already exists in api-auth.ts (line 141), auth-options line 189 uses same pattern but is inline assignment
- [x] Extract `lib/e2e-utils.ts` - verified: E2E bypass only exists in api-auth.ts, not duplicated in auth-options.ts
- [!] Consolidate error response builders - deferred: api-errors.ts already well-organized (5 functions, each 2 lines)
- [!] Consolidate Supabase client setup - deferred: supabase.ts and supabase-server.ts serve different purposes (client vs server with cookies)

**DRY Violations - Components** (Audit: Dec 30, 2025)
```
┌─────────────────────────────────────────────────────────────────────────┐
│  Problem: Same UI patterns copy-pasted across components                │
│  Impact: Style change = hunt through 8+ files                           │
│  Goal: Extract reusable components                                      │
└─────────────────────────────────────────────────────────────────────────┘
```
- [x] Extract `CheckmarkCircle` component - duplicated in ServiceCard, PricingCard, ServiceDetailModal, HowItWorksPageClient, ServicesPageClient (5 files)
- [x] Use `shadowClasses.cardHover` from colors.ts - migrated ServiceCard, StepCard, CourseCard, PricingCard, FAQPageClient, FAQPreview, LoginClient (7 files)
- [x] Use existing `CloseIcon` component - migrated ServiceDetailModal, ChatbotModal to use CloseIcon (ConfirmDialog already uses it)
- [!] Consolidate form field components - TextField.tsx + TextAreaField.tsx (deferred: low-impact, 2 small stable files)
- [x] Extract `formatPrice()` to lib/format.ts - created lib/format.ts, migrated CourseCard + EnrollButton
- [x] Centralize `serviceColors` - created lib/service-colors.ts, migrated ServiceDetailModal + ServiceDeepDive
- [x] Extract feature list parsing - not needed: PricingCard/ServiceDetailModal already use arrays, only ServiceCard has parsing

**DRY Violations - Context** (Audit: Dec 30, 2025)
```
┌─────────────────────────────────────────────────────────────────────────┐
│  Problem: State patterns repeated across context providers              │
│  Impact: Pattern change = edit multiple contexts                        │
│  Goal: Extract reusable hooks                                           │
└─────────────────────────────────────────────────────────────────────────┘
```
- [x] Extract `getNestedValue`/`setNestedValue` to lib/object-utils.ts - created lib/object-utils.ts, migrated InlineEditContext + templates/utils.ts
- [!] Extract `useAsyncOperation()` hook - deferred: state declarations are only 2-3 lines, CartContext has complex optimistic updates that make abstraction risky
- [!] Extract `useOptimisticUpdate()` hook - deferred: 3 occurrences in 1 file, each with unique update logic; abstraction would add complexity without simplification
- [!] Refactor InlineEditContext (388 lines) - DEFERRED: 26 files + 52 tests depend on it, concerns are intentionally coupled for editing UX
- [x] Fix StripeContext hardcoded colors - added stripeAppearance to colors.ts, migrated StripeContext to use it

**ETC Violations** (Audit: Dec 30, 2025)
```
┌─────────────────────────────────────────────────────────────────────────┐
│  Problem: Adding new pages requires editing multiple files              │
│  Impact: New page = edit tests + routes + discovery (3+ places)         │
│  Goal: Add page → tests auto-discover it                                │
└─────────────────────────────────────────────────────────────────────────┘
```
- [x] Migrate screenshots.spec.ts to use page discovery - added getPublicScreenshotPages() and getAdminScreenshotPages() helpers
- [x] Migrate page-render-stability.spec.ts to use discoverPublicPages() - replaced EDITABLE_PAGES array
- [x] Migrate dark-mode-visual.spec.ts - no change needed: has targeted 3-page list for specific color tests, not comprehensive scan
- [x] Delete duplicate route definitions - migrated compare-pages.spec.ts to use discoverPublicPages()

**Documentation Gaps** (Audit: Dec 30, 2025)
```
┌─────────────────────────────────────────────────────────────────────────┐
│  Problem: 50% of utilities invisible to developers                      │
│  README: 87 components | Actual: 150+                                   │
│  README: 1 hook documented | Actual: 9 hooks                            │
│  README: 10 lib files | Actual: 28 files                                │
└─────────────────────────────────────────────────────────────────────────┘
```
- [x] Update README component count (says 87, actually 150+)
- [x] Document all 8 custom hooks in README (useEditableContent, useUniversalClick, usePageViewTracking, useProductTracking, useComments, useProjectStatus, useBackdropClose, useCurrency)
- [x] Document all 44 lib utilities in README (expanded from 25 to 44 files documented)
- [x] Consolidate /docs/*.md content INTO README.md (added deep-dive references, README already has essential docs)
- [x] Add "How to Add a Custom Hook" contributor guide
- [x] Add "How to Add a New Context" contributor guide
- [x] Add "How to Add an Inline Editable Page" contributor guide
- [x] Document InlineEditContext API (methods, state shape, sync rules)
- [!] Update guide page (/guide) with architecture diagrams (blocked: needs design for which diagrams would be most useful - consider data flow, request lifecycle, edit mode flow)

**Building Blocks Vision** 🧱
```
┌─────────────────────────────────────────────────────────────────────────┐
│                    THE BUILDING BLOCKS VISION                           │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  Just like AI made stunning images accessible to everyone               │
│  (DALL-E vs decades of Photoshop/After Effects expertise)               │
│                                                                         │
│  We make page building feel like playing with blocks:                   │
│  - Drag sections anywhere                                               │
│  - Stack, swap, duplicate                                               │
│  - No code, no config, just create                                      │
│                                                                         │
│  The technology has existed (Photoshop, CMS builders).                  │
│  We're making it EASY - that's the innovation.                          │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```
- [x] Free-form component movement in edit mode (using @dnd-kit, integrated with inline editing)
- [x] Visual drag handles on every section/component
- [→] Snap-to-grid system for alignment
- [ ] Real-time preview while dragging

[x] **Fix Auto-Loop System** - TESTED: E2E verified Dec 30, 2025
- [x] Fix CLAUDE_PROJECT_DIR fallback in loop-helper.sh (DRY - single _get_project_dir)
- [x] Fix CLAUDE_PROJECT_DIR fallback in common.sh
- [x] Fix CLAUDE_PROJECT_DIR fallback in stop-check.sh
- [x] End-to-end test: stop-check.sh exits code 2 (verified)
- [x] End-to-end test: session-start.sh shows "0h 43m" (verified)

[!] **Google Calendar Testing** - Complete integration testing (needs manual browser testing)

**Auto-Loop System (Core)**
[x] Fix task parsing regex to match TODO.md format
[x] Verify stop hook blocks exit correctly (exit code 2)
[x] Test end-to-end: invoke skill → work → block → continue
[x] Ensure time limit and iteration safety work

**Auto-Loop System Improvements**
[x] Create unit tests for loop-state.json management
[x] Add post-Stop hook that shows next task when loop active
[x] Update session-start hook to reinject auto-loop instructions
[x] Document auto-loop testing results

---

## To Do

### Short Term (This Week)

<!-- Move items to "In Progress" section when starting work -->

**Admin Workflows**
- [x] Inventory management interface (11 E2E tests passing)
- [x] Bulk product import/export (10 E2E tests passing)
- [x] Order status updates & fulfillment tracking (13 E2E tests passing)

### Medium Term (2-4 Weeks)

**Universal Inline Editing** - Click anything, edit anything, configure nothing
**Design Principle:** [.claude/rules/etc-easy-to-change.md](.claude/rules/etc-easy-to-change.md)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    UNIVERSAL EDITABILITY ROADMAP                         │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  Phase 1: Section Editing ✅ DONE                                       │
│  ─────────────────────────                                              │
│  Click section → Edit all fields in sidebar                             │
│  Pattern: EditableSection wrapper                                       │
│                                                                         │
│  Phase 2: Item-Level Editing ✅ DONE                                    │
│  ────────────────────────────                                           │
│  Click card/item → Edit just that item                                  │
│  Pattern: EditableItem wrapper for arrays                               │
│                                                                         │
│  Phase 2.5: DRY Consolidation ✅ DONE                                   │
│  ────────────────────────────────                                       │
│  useEditableContent<T>() hook replaces 20+ lines of boilerplate         │
│  All 5 marketing pages migrated to 1-line hook                          │
│  lib/editable-routes.ts maps routes to slugs                            │
│                                                                         │
│  Phase 3: Auto Route Detection ✅ DONE                                  │
│  ────────────────────────────────                                       │
│  useEditableContent() auto-detects slug from URL                        │
│  All 5 pages migrated to simpler API (no explicit slug)                 │
│                                                                         │
│  Phase 4: Universal Click-to-Edit ✅ DONE                               │
│  ─────────────────────────────────                                      │
│  content-path-mapper.ts + useUniversalClick hook                        │
│  Click ANY text → system finds content path → edit                      │
│  27 E2E tests, all property types, array operations                     │
│                                                                         │
│  Phase 5: Zero-Config Pages ✅ DONE                                     │
│  ──────────────────────────────────                                     │
│  Auto-discovery at build time, manifest generation                      │
│  Wrappers kept for UX/a11y (universal click is fallback)                │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

Phase 3 Sub-tasks (Auto Route Detection): ✅ DONE
- [x] Add `usePathname()` to useEditableContent for auto-detection
- [x] Remove slug parameter requirement (infer from route)
- [x] Test with new page that doesn't pass slug (8 E2E tests passing)

Phase 4 Sub-tasks (Universal Click-to-Edit): ✅ DONE

**4A. Content Path Discovery** ✅
- [x] Create lib/content-path-mapper.ts (recursive JSON search)
- [x] Add global click handler for edit mode (useUniversalClick hook)
- [x] Walk up DOM tree to find editable boundary
- [x] Match clicked element to content schema path
- [x] 16 unit tests for content-path-mapper

**4B. Property Editor (All Field Types)** ✅
- [x] Text fields (title, description, tagline)
- [x] Color pickers (color: 'blue' → dropdown)
- [x] Size/variant selectors (select dropdowns)
- [x] Link editors (href, button targets)
- [x] Boolean toggles (popular: true/false, enabled: true)

**4C. Array Operations (Add/Remove/Reorder)** ✅
- [x] [+ Add Item] button for arrays (cards, steps, FAQs)
- [x] [🗑 Delete] button on each array item
- [x] [↑↓ Reorder] up/down arrow buttons
- [x] Empty state with "Add first item" prompt

**4D. Integration** ✅
- [x] 27 E2E tests for all 5 editable pages (100% passing)
- [x] Graceful handling of non-content clicks
- [x] Keyboard navigation support

Phase 5 Sub-tasks (Zero-Config):
- [x] Auto-discover content JSON files at build time (18 unit tests passing)
- [x] Generate route manifest from /content/*.json (prebuild hook)
- [!] Remove EditableSection/EditableItem wrappers (BLOCKED: see analysis below)
- [x] Document "add JSON file = page is editable" pattern (see docs/INLINE_EDITING.md)

**Wrapper Removal Analysis** (Dec 30, 2025):
Wrappers provide UX/a11y that useUniversalClick doesn't:
- Visual feedback: ring outlines, hover states, selection highlighting
- Accessibility: tabIndex, Enter/Space, role="button", aria-label
- Labels: floating section/item names on hover
- Accuracy: explicit paths vs. text matching (could fail)
Universal click is a FALLBACK, not a replacement. Keep wrappers.

**Visual Builder Polish**
- [x] Re-enable Puck page builder ✅ DONE
- [x] Add TipTap WYSIWYG editor ✅ DONE
- [x] Add "Edit with Puck" after wizard completion (completion modal + 2 E2E tests)
- [x] Create block-level editor (mid-complexity between wizard and Puck)
- [x] Add template preview images (gradient + section icons)

**Performance & Caching**
- [x] Define Redis cache invalidation strategy per feature (docs/CACHE_STRATEGY.md)
- [x] Monitor cache hit rates
- [x] Optimize product queries with pagination

**Analytics Dashboard**
- [x] Orders, revenue, trends visualization
- [x] Page view analytics per Puck page

### Long Term (1-3 Months)

**LMS Components** - The big vision: "Learn + Sell + Build"
```
┌─────────────────────────────────────────────────────────────────┐
│                    THE PLATFORM VISION                          │
│                                                                 │
│   CMS (edit content) + LMS (teach) + Shop (sell)                │
│                                                                 │
│   Built with a phone-first visual builder anyone can use        │
└─────────────────────────────────────────────────────────────────┘
```

- [x] CourseCard component (course preview/listing)
- [x] LessonPlayer component (video + content)
- [x] QuizBlock component (interactive quizzes)
- [x] ProgressBar component (course progress tracking)
- [x] Certificate component (completion certificates)
- [x] Enrollment system (paid/free courses)
- [x] Student dashboard (my courses, progress)

**Advanced Ecommerce Features**
- [x] Abandoned cart recovery emails
- [x] Product recommendations engine
- [x] Discount/coupon system
- [x] Multi-currency support
- [x] Customer reviews & ratings

**Platform Simplicity Layer**
- [x] Phone-first wizard (answer 5 questions → done) - 14 E2E tests passing
- [x] Pre-built page sections (drag whole sections, not components)
- [x] Template marketplace (share/sell templates)

---

## Recently Completed

_Keep ~5-7 recent wins here, trim periodically once documented in README.md_

**Supabase Security Hardening** (Dec 30, 2025)
- Fixed 25 functions with mutable search_path (security vulnerability)
- Moved pg_trgm extension from public to extensions schema
- Note: vector extension stays in public (heavy dependencies, acceptable per Supabase)
- Note: Leaked password protection requires Pro plan (acceptable for now)
- Context: migrations/032-034

**Phone-First Wizard Testing** (Dec 30, 2025)
- Fixed Back button selector to avoid matching "Back to Site" link
- Added viewport tolerance for sticky footer positioning
- Increased scroll test viewport to avoid sidebar overlay
- Added 5 new validation tests: disabled states, input persistence, preview verification
- 14 E2E tests passing (layout, flow, validation, mode selection)
- Context: e2e/page-wizard.spec.ts

**Template Marketplace** (Dec 30, 2025)
- Supabase migration with marketplace_templates, template_purchases, template_reviews
- PostgreSQL functions: download_template, update_template_rating triggers
- API: GET (list, featured, categories, my-templates, my-purchases), POST (create, download, review)
- Filtering by category, price, search; sorting by popular, recent, rating
- Author dashboard for template management
- Review system tied to downloads, moderation workflow
- 22 E2E tests covering CRUD and authentication
- Context: migrations/029, app/api/marketplace/route.ts

**Pre-built Page Sections** (Dec 30, 2025)
- Section library with 15+ ready-to-use sections organized by category
- Categories: Hero, Features, Testimonials, Pricing, CTA, Content, FAQ, Stats, Team, Contact
- Each section is a complete Puck-compatible component with sensible defaults
- SectionPicker component with search, category tabs, and preview cards
- Helper functions: getAllSections, getSectionsByCategory, searchSections
- 14 E2E tests + 5 Storybook stories
- Context: lib/sections/index.ts, components/SectionPicker.tsx

**Customer Reviews & Ratings** (Dec 30, 2025)
- Supabase migration with reviews, review_votes, review_reports tables
- PostgreSQL functions: get_product_rating, vote_on_review
- API: GET (list, rating), POST (create, vote, report), PATCH, DELETE
- StarRating component (display/input, sizes, colors, interactive)
- ReviewCard component (content, voting, reporting, verified badge)
- Moderation support: pending → approved/rejected workflow
- 25 E2E tests + 16 Storybook stories
- Context: migrations/028, app/api/reviews/route.ts, components/StarRating.tsx

**Multi-Currency Support** (Dec 30, 2025)
- Supabase migration with currencies, exchange_rates, user_currency_preferences tables
- PostgreSQL functions: convert_currency, format_price for server-side conversion
- API: GET (list, rates, convert, preference), POST (set preference)
- Seed data: USD, EUR, GBP, CAD, AUD, JPY, CNY, INR, MXN, BRL
- useCurrency hook with convert, format, formatConverted, setCurrency
- CurrencySelector component with dropdown, flags, size/color variants
- 20 E2E tests + 9 Storybook stories
- Context: migrations/027, app/api/currencies/route.ts, hooks/useCurrency.ts

**Discount/Coupon System** (Dec 30, 2025)
- Created Supabase migration with coupons, coupon_usage tables, RLS policies
- PostgreSQL functions: validate_coupon (checks constraints), apply_coupon (records usage)
- API: GET /api/coupons (validate), POST /api/coupons (apply)
- Discount types: percentage, fixed amount, free shipping
- Constraints: min cart, expiry, max uses, first order only
- CouponInput component with loading states, success/error UI, color variants
- 15 E2E tests + 7 Storybook stories
- Context: migrations/026, app/api/coupons/route.ts, components/CouponInput.tsx

**Product Recommendations Engine** (Dec 30, 2025)
- Created Supabase migrations for product_interactions and product_similarities tables
- API endpoints: GET (popular/trending/personalized/related), POST (track interactions)
- useProductTracking hook for auto-tracking views, cart adds, purchases
- ProductRecommendations component with grid/row layouts, color variants
- Views for popular_products and trending_products with analytics
- 22 E2E tests + 8 Storybook stories
- Context: migrations/025, app/api/recommendations/route.ts, hooks/useProductTracking.ts

**Abandoned Cart Recovery Emails** (Dec 30, 2025)
- Created Supabase migration for cart_reminders table with RLS and analytics view
- Cron job endpoint at /api/cron/abandoned-carts (hourly schedule)
- Uses existing AbandonedCartEmail template with items, discount support
- Tracks reminder counts, recovery rates, and cart values
- Vercel cron configuration in vercel.json
- 10 E2E tests for API endpoints and recovery flow
- Context: supabase/migrations/024_create_cart_reminders_table.sql, app/api/cron/abandoned-carts/route.ts

**Student Dashboard - My Learning** (Dec 30, 2025)
- Added "My Learning" section to UserDashboard component
- Displays enrolled courses with progress bars and status badges
- Shows enrollment date, progress percentage, and completion status
- Empty state with CTA to browse courses
- Links to continue learning or review completed courses
- 9 E2E tests for dashboard and enrollment flow
- Context: components/UserDashboard.tsx, e2e/student-dashboard.spec.ts

**Enrollment System** (Dec 30, 2025)
- Created Supabase migration for enrollments table with RLS policies
- API endpoints: GET /api/enrollments (list/check), POST /api/enrollments (enroll)
- EnrollButton component for free/paid course enrollment with loading states
- Free enrollment creates record directly, paid redirects to checkout
- Color variants (blue/green/purple), size variants (sm/md/lg), full-width option
- 8 E2E tests + Storybook stories (9 variants)
- Context: supabase/migrations/023_create_enrollments_table.sql, app/api/enrollments/route.ts, components/EnrollButton.tsx

**Page View Analytics** (Dec 30, 2025)
- Created Supabase migration for page_views table with RLS policies
- API endpoints: POST /api/page-views (track), GET /api/page-views (stats), GET /api/page-views/all (admin)
- usePageViewTracking hook for client-side tracking with session ID
- PuckPageClient wrapper integrates tracking into dynamic Puck pages
- Aggregation view (page_view_stats) for quick statistics
- 7 unit tests + 6 E2E tests (3 pass, 3 skip awaiting migration)
- Context: supabase/migrations/022_create_page_views_table.sql, app/api/page-views/route.ts, hooks/usePageViewTracking.ts

**Analytics Dashboard** (Dec 30, 2025)
- Created /admin/analytics page with revenue, orders, and trends visualization
- API endpoint /api/admin/analytics with date range filtering and trends data
- Summary metrics: Total Revenue, Total Orders, Average Order Value, Delivered count
- Orders by status bar chart (pending, processing, shipped, delivered, canceled)
- Revenue trend chart showing last 14 days with hover tooltips
- Date range picker for filtering analytics period
- 5 E2E tests all passing
- Context: app/admin/analytics/page.tsx, app/api/admin/analytics/route.ts

**Product Query Pagination** (Dec 30, 2025)
- Added optional pagination support to medusa-client products.list()
- API route /api/shop/products accepts ?limit=N&offset=M query params
- Backwards compatible: no params returns all products (array)
- With params returns { products, count, pagination: { limit, offset, hasMore } }
- Paginated responses use cache keys that include limit/offset
- 5 unit tests for pagination behavior
- Context: lib/medusa-client.ts, app/api/shop/products/route.ts

**Cache Hit Rate Monitoring** (Dec 30, 2025)
- Created lib/cache-stats.ts for tracking hits/misses per cache key pattern
- Integrated stats recording into cache.wrap() function
- Added cache.getStats() for retrieving statistics (hit rate, uptime, requests/sec)
- Admin API endpoint at /api/admin/cache-stats (GET stats, POST reset)
- 9 unit tests + 2 E2E tests all passing
- Context: lib/cache-stats.ts, lib/cache.ts, app/api/admin/cache-stats/route.ts

**Redis Cache Invalidation Strategy** (Dec 30, 2025)
- Documented cache strategy for all 8 features (Pages, Projects, Cart, Orders, Blog, etc.)
- TTL reference table (STATIC 1hr → REALTIME 10sec)
- Invalidation patterns per operation (GET/POST/PUT/DELETE)
- Best practices: over-invalidate, pattern invalidation, monitoring checklist
- Context: docs/CACHE_STRATEGY.md

**Template Preview Images** (Dec 30, 2025)
- Added visual preview thumbnails to template picker cards
- Gradient background using template's default color
- Section icons show what's in the template (Hero, Features, Testimonials, etc.)
- Shows section count and category icon
- Featured badge repositioned to preview area
- 5 E2E tests in e2e/template-previews.spec.ts
- Context: components/templates/TemplatePicker.tsx

**Block-Level Editor** (Dec 30, 2025)
- Created simplified block editor at `/admin/pages/[slug]/blocks`
- Mid-complexity between wizard (5 steps) and Puck (full drag-drop)
- Section list view with add, edit, reorder, delete operations
- Block picker organized by category (Layout, Content, Media, etc.)
- Property editor sidebar for common fields (title, color, URLs)
- 14 E2E tests in e2e/block-editor.spec.ts
- Context: app/admin/pages/[slug]/blocks/page.tsx

**Auto-Loop System Improvements** (Dec 30, 2025)
- Created `app/lib/loop-state.ts` - TypeScript API for loop state management
- 10 unit tests for loop state functions (read, write, start, pause, etc.)
- Stop hook now shows specific next task when loop is active
- Session-start hook now reinjects auto-loop context on resume/compact
- Clear autonomous work instructions: TDD workflow, don't stop between tasks
- Context: lib/loop-state.ts, .claude/hooks/stop-check.sh, .claude/hooks/session-start.sh

**Universal Content Loading + Page Simplification** (Dec 29, 2025)
- InlineEditProvider now auto-loads content by route (no per-page hooks needed)
- Migrated all 11 page clients to `useInlineEdit()` pattern
- Removed `useEditableContent` hook from all marketing pages
- Pattern: context auto-loads → pages read from `pageContent`
- All 28 inline editing tests passing
- Context: context/InlineEditContext.tsx, all page client components

**Inline Editing Vision VALIDATED** (Dec 29, 2025)
- All 12 pages now support inline editing with full test coverage
- Created 2 independent test suites (52 tests total):
  - field-discovery.spec.ts: Verifies ALL fields are discoverable
  - field-editability.spec.ts: Verifies ALL fields can be modified
- Documentation: docs/INLINE_EDITING.md (architecture, how-to, troubleshooting)
- Pages validated: /, /services, /pricing, /faq, /how-it-works, /contact, /get-started, /blog, /changelog, /guide, /privacy, /terms

**Phase 4: Universal Click-to-Edit** (Dec 30, 2025)
- Created lib/content-path-mapper.ts for recursive JSON path discovery
- Added useUniversalClick hook for global click handling in edit mode
- Property editors: text, color dropdowns, variant selects, href, booleans
- Array operations: Add, Delete, Move up/down buttons
- 27 E2E tests + 16 unit tests all passing
- Context: lib/content-path-mapper.ts, hooks/useUniversalClick.ts, AdminSidebar.tsx

**DRY Consolidation: useEditableContent Hook** (Dec 29, 2025)
- Created `useEditableContent<T>()` hook replacing 20+ lines of boilerplate per page
- Migrated all 5 marketing page clients (Services, Home, FAQ, Pricing, HowItWorks)
- Created `lib/editable-routes.ts` with 10 unit tests for route→slug mapping
- Added ETC (Easy To Change) design principle rule
- Context: hooks/useEditableContent.ts, lib/editable-routes.ts, .claude/rules/etc-easy-to-change.md

**Inline Editing Phase 2: Item-Level + Bug Fixes** (Dec 29, 2025)
- Click individual cards/items to edit just that item
- Fixed z-index layering (z-[60] for bar/toggle, z-50 for sidebar)
- Fixed infinite re-render with useMemo
- Added 5 E2E tests for edit mode exit
- Created TDD rule (`.claude/rules/tdd.md`)
- Context: EditableItem component, EditModeBar.tsx, AdminSidebar.tsx

**Fully Automated Changelog System** (Dec 29, 2025)
- Stop hook prompts Claude to complete changelog entries automatically
- `screenshot-affected.ts` embeds git context (`_gitContext`, `_affectedRoutes`, `_needsCompletion`)
- E2E test suite validates changelog page, template generation, dynamic loading
- Added Content and Design categories for route classification
- Context: `.claude/hooks/stop-check.sh`, `app/scripts/screenshot-affected.ts`

**Puck Page Builder + TipTap Editor** (Dec 2025)
- Re-enabled Puck visual page builder
- Added TipTap WYSIWYG editor for rich text editing
- Template system (`lib/templates/`) as simplified entry point

**Autonomous Workflow System** (Dec 2025)
- Stop hook blocks until TODO.md tasks complete
- Task markers: [→] working, [ ] ready, [x] done, [!] blocked
- Session start shows current task
- Auto-documents frontend changes with screenshots

**Template System Testing** (Dec 2025)
- Fixed auth.setup.ts for existing sessions
- 28 wizard E2E tests passing

**Page Audit Systemic Fixes** (Dec 2025)
- alertColors: 142 uses across 32 files
- statusBadgeColors: 36 uses across 10 files
- focusRingClasses: 30 uses across 9 files
- aria-hidden: 53 uses across 25 files

---

## Disabled Features

_No features currently disabled._

---



---

*Last Updated: December 30, 2025 - DRY/ETC/Orthogonality audit: 32 new tasks added*
