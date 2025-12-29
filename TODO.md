# TODO

Central task tracker for NeedThisDone.com. Items move through: **To Do** → **In Progress** → **Recently Completed** → documented in README.md.

---

## Production Readiness Status

**Last Verified:** December 2025

| Component | Status | Notes |
|-----------|--------|-------|
| Medusa Backend | ✅ Working | Products, carts, checkout functional |
| Stripe Payments | ✅ Working | Real payment processing (not mock) |
| E2E Tests | ✅ 100% | 177 tests passing |
| Security | ✅ Fixed | All critical issues resolved |
| Google OAuth | ✅ Working | Users see needthisdone.com during sign-in |
| Google Calendar | 🟡 90% | Backend + Admin UI + credentials complete, needs testing |
| Admin Approval | 🟡 90% | Dashboard + endpoints + credentials done, needs testing |
| Infrastructure | ✅ Migrated | Vercel hosting live, Digital Ocean shut down |
| DNS | ✅ Configured | needthisdone.com → Vercel via Namecheap |
| Email (Resend) | ✅ Working | hello@needthisdone.com verified |
| Puck Page Builder | ⛔ Disabled | Not production ready - see Disabled Features |

### Critical Security Issues ✅ RESOLVED

All security issues fixed (Dec 2025):
1. ~~Hardcoded admin password~~ → Now uses `MEDUSA_ADMIN_PASSWORD` env var
2. ~~Exposed debug endpoints~~ → Protected with admin authentication
3. ~~Weak fallback secrets~~ → `medusa-config.js` requires all env vars

---

## In Progress

<!-- Task markers: [→] working | [ ] ready | [x] done | [!] blocked -->

[ ] **Google Calendar Testing** - Complete integration testing
    Context: app/api/appointments/, .env.local credentials
    Done when: OAuth flow works, calendar events created on approval
    - [x] Google Cloud Console setup complete
    - [ ] Manual testing of appointment booking flow
    - [ ] Test Google OAuth authorization flow
    - [ ] Test calendar event creation on approval
    - [ ] Deploy to production

[x] **Template System Testing** - Verify wizard end-to-end
    Context: lib/templates/, admin/pages/new
    Done when: Page creation and storage works correctly
    - [x] Fixed auth.setup.ts for existing sessions
    - [x] 28 wizard E2E tests passing

[x] **Autonomous Workflow System** - Implement task loop
    Context: .claude/hooks/, TODO.md
    Done when: Stop hook blocks until all tasks complete

---

## Page Review Findings (Dec 2025)

**Swarm audit of all 30 pages.** Run `/page-audit` on any page for detailed checks.

### Systemic Issues ✅ FIXED

All major systemic issues have been resolved:

| Issue | Status | What Was Done |
|-------|--------|---------------|
| Alert Colors | ✅ Fixed | 15+ files updated to use `alertColors` from colors.ts |
| Status Badges | ✅ Fixed | 8+ pages updated to use `statusBadgeColors` |
| Duplicated getStatusColor | ✅ Fixed | Removed from orders/appointments, using centralized colors |
| Missing Metadata | ✅ Fixed | 12 layout.tsx files created for admin pages |
| Focus Indicators | ✅ Fixed | Added `focusRingClasses` to 10+ pages |
| aria-hidden | ✅ Fixed | Added to decorative elements in 8+ pages |
| Form Accessibility | ✅ Fixed | Added id/htmlFor/autoComplete to checkout, get-started, contact |
| ARIA Patterns | ✅ Fixed | Added aria-expanded, aria-pressed to admin pages |

### Remaining Minor Improvements (Lower Priority)

### Marketing Pages (7 pages, 70 improvements)

**Homepage (/)**
1. Accessibility: Button keys use array index instead of stable IDs
2. Accessibility: Arrow span lacks `aria-hidden="true"`
3. Accessibility: Consultation links have no focus indicators
4. SEO: Metadata hardcodes site name instead of using siteConfig
5. Responsive: Hero text jumps from 5xl to 6xl without sm intermediate
6. Performance: prefetchProducts() runs on every load but result unused
7. UX: No loading state for CTA buttons
8. Code Quality: Non-null assertion could use optional chaining
9. Dark Mode: Card uses inline border colors instead of cardBorderColors
10. Accessibility: How It Works card lacks focus indicator

**Services (/services)**
1. Color System: Hardcoded gray text colors instead of headingColors
2. Color System: Hardcoded purple/green checkmark colors
3. Accessibility: Checkmark "✓" needs aria-hidden
4. Accessibility: Links lack focus indicators
5. SEO: Static metadata instead of CMS-driven
6. UX: No skeleton loading for dynamic content
7. Code Quality: hoverColor type assertion repeated 3 times
8. Accessibility: Arrow "→" needs aria-hidden
9. Responsive: md:grid-cols-2 needs lg breakpoint
10. Dark Mode: Static content inside colored cards uses mismatched grays

**Pricing (/pricing)**
1. Color System: Hardcoded gray text colors
2. Color System: Hardcoded heading colors
3. Color System: Hardcoded checkmark colors (green/purple)
4. Color System: Bullet text uses inline grays
5. Accessibility: Checkmarks need aria-hidden
6. Accessibility: Animation classes may confuse screen readers
7. UX: Verify custom animations defined in Tailwind config
8. Code Quality: "Choose Your Path" cards duplicate structure - extract PathCard
9. SEO: Escaped quotes in description unnecessary
10. Responsive: Payment structure divider inconsistent on tablet

**How It Works (/how-it-works)**
1. Accessibility: Checkmark "✓" needs aria-hidden
2. Accessibility: Timer emoji "⏱" needs aria-hidden or icon
3. Code Quality: Array destructuring assumes steps exist - add null check
4. UX: Get Started button hardcodes text instead of content-driven
5. Responsive: md:grid-cols-3 crowds tablets - use lg breakpoint
6. Performance: Consider CSS-only hover states
7. Accessibility: Questions buttons lack focus ring styling
8. SEO: Static metadata instead of dynamic
9. Dark Mode: Emoji uses hardcoded colors
10. Code Quality: Two similar Card sections could share component

**FAQ (/faq)**
1. Accessibility: Should use details/summary elements
2. Accessibility: Multiple h2 elements at same level - use h3
3. Accessibility: JSX.Element type deprecated - use React.ReactNode
4. Performance: renderAnswer creates elements each render - memoize
5. SEO: Generic description needs more keywords
6. UX: FAQs not expandable - consider accordion
7. Code Quality: Color cycling needs explanatory comment
8. Accessibility: Cards have no focus indicator
9. Dark Mode: Hover shadow should use shadowClasses
10. Responsive: max-w-4xl narrower than other pages

**Guide (/guide)**
1. Accessibility: Emoji icons need aria-hidden
2. Accessibility: Quick links emojis need aria-hidden
3. Accessibility: CTA links lack focus ring styling
4. Dark Mode: Uses inline bg-white instead of cardBgColors
5. Dark Mode: Screenshot container uses inline colors
6. Dark Mode: QuickLinks container uses inline colors
7. Color System: CTA button styling complex - use helper
8. Performance: Images need priority prop for above-fold
9. SEO: Add structured data for step guides
10. UX: Contact section could show email directly

**Contact (/contact)**
1. Code Quality: dynamic export placement unconventional
2. Accessibility: File upload div not keyboard accessible
3. Accessibility: Paperclip emoji needs aria-hidden
4. Color System: Success message uses inline green instead of alertColors
5. Dark Mode: Error alert correctly uses alertColors - good!
6. Accessibility: Button needs type="button" to prevent form submission
7. UX: No retry mechanism or specific error messages
8. Accessibility: Remove button lacks focus indicator
9. Performance: Large file uploads need progress indicators
10. Responsive: Container width differs from homepage

### Commerce Pages (5 pages, 50 improvements)

**Shop (/shop)**
1. SEO: Missing OpenGraph and Twitter metadata
2. UX: No loading skeleton for product fetch
3. Accessibility: Empty cart SVG needs role="img" and aria-label
4. Accessibility: Link contrast - base state too gray
5. Accessibility: Buttons need focusRingClasses
6. Performance: Image marked unoptimized - remove for production
7. Code Quality: colorMap type could be inferred more safely
8. UX: Error messages have no dismiss/retry
9. Responsive: Container needs responsive padding
10. SEO: Missing JSON-LD structured data for products

**Product Detail (/shop/[productId])**
1. Code Quality: Params type needs Promise for Next.js 15
2. Accessibility: Quantity buttons need aria-labels
3. Accessibility: Missing breadcrumb navigation structure
4. Code Quality: Variant map uses any type - define interface
5. Accessibility: Quantity buttons need focus rings
6. UX: No loading spinner for add-to-cart action
7. Performance: Image marked unoptimized
8. Code Quality: Price formatting should use Intl.NumberFormat
9. SEO: Missing canonical URL
10. Responsive: Image container needs aspect-ratio

**Cart (/cart)**
1. SEO: Missing metadata export
2. Accessibility: Remove button needs product-specific aria-label
3. Accessibility: Quantity buttons need focus indicators
4. Accessibility: Empty cart SVG needs accessible labeling
5. UX: No skeleton loading state
6. Code Quality: dynamic export ineffective in client components
7. Code Quality: Price calculations duplicated - extract helper
8. Responsive: Grid creates unusual 3:2 split
9. Performance: No error boundary
10. Code Quality: Pluralization logic repeated - use helper

**Checkout (/checkout)**
1. SEO: Missing metadata export
2. Code Quality: dynamic export ineffective in client components
3. UX: Form validation only on submit - add inline/onBlur
4. Accessibility: Inputs lack id attributes for label association
5. Accessibility: Address field should be split for autocomplete
6. Code Quality: Order Summary repeated 4 times - extract component
7. UX: Shipping form shown for digital products
8. Code Quality: console.log in production - remove
9. Code Quality: Unused err variable in catch
10. Performance: Window access may cause hydration mismatch

**Get Started (/get-started)**
1. SEO: Missing metadata export
2. Color System: Error alert uses accentColors.red instead of alertColors.error
3. Code Quality: Unused err variable in catch
4. Accessibility: Inputs lack id attributes
5. Code Quality: dynamic export ineffective in client components
6. UX: Path cards have no loading indication on click
7. Accessibility: Whole card should be clickable, not just button
8. Accessibility: Cards need focus indicators
9. Color System: Hardcoded text colors instead of headingColors
10. Accessibility: Inputs need autoComplete attributes

### Content Pages (5 pages, 50 improvements)

**Blog (/blog)**
1. Color System: Category filters use hardcoded colors
2. Accessibility: Filter links need focus indicators
3. Accessibility: Category links need focus indicators
4. SEO: Missing OpenGraph metadata
5. Performance: revalidate + force-dynamic creates conflict
6. UX: Only shows 5 categories with no "more" indicator
7. Accessibility: Emoji icons need accessible text
8. UX: Empty state lacks call-to-action
9. Responsive: Grid could use gap-y for mobile
10. Accessibility: Featured section needs sr-only heading

**Blog Post (/blog/[slug])**
1. Accessibility: Back link arrow needs aria handling
2. Color System: Prose link colors hardcoded
3. Accessibility: Image alt text too generic
4. Color System: Tag links use hardcoded colors
5. Accessibility: Tag links need focus indicators
6. UX: No markdown parser for rich content
7. Color System: Template literal doesn't work with Tailwind purge
8. UX: No table of contents for long posts
9. Accessibility: External links need "opens in new tab" indication
10. Responsive: Fixed image height crops awkwardly

**Changelog (/changelog)**
1. Color System: CategoryBadge uses hardcoded colors
2. Accessibility: Time element needs datetime attribute
3. Accessibility: Decorative emojis need aria handling
4. SEO: Missing OpenGraph metadata
5. Accessibility: Screenshot gallery needs aria-describedby
6. Color System: Card uses inline colors instead of cardBgColors
7. Color System: Inner borders use inline colors
8. Accessibility: Empty state emoji needs aria handling
9. UX: No loading skeleton
10. Performance: Synchronous file operations block event loop

**Privacy (/privacy)**
1. Accessibility: Summary list uses bullet chars instead of ul/li
2. SEO: Missing OpenGraph metadata
3. Accessibility: Table needs thead, th scope, caption
4. Accessibility: External links need "opens in new tab" indication
5. Accessibility: HTML entity in heading - verify rendering
6. Color System: List items lack consistent pattern
7. Accessibility: No skip links for long document
8. UX: "Last updated" is hardcoded
9. Responsive: Table may overflow on mobile
10. Accessibility: Contact links need descriptive context

**Terms (/terms)**
1. Accessibility: Summary list uses bullet chars instead of ul/li
2. SEO: Missing OpenGraph and Twitter metadata
3. Accessibility: No internal navigation for long document
4. Accessibility: Email address should be mailto link
5. Code Quality: Section component duplicated from privacy - extract
6. Accessibility: Refund policy could use dl/dt/dd
7. UX: "Last updated" is hardcoded
8. Accessibility: Links need clearer purpose labels
9. Color System: Nested elements lack consistent styling
10. Responsive: Nested lists need responsive spacing

### Admin Core Pages (6 pages, 60 improvements)

**Admin Dev (/admin/dev)**
1. Accessibility: Toggle buttons need aria-expanded
2. Accessibility: Card links lack focus indicators
3. SEO: Missing metadata export
4. Color System: Loading state uses hardcoded colors
5. UX: Loading spinner is just text - add animation
6. Responsive: Grid jumps 2→4 without 3-column intermediate
7. Accessibility: Expandable sections need landmark roles
8. Code Quality: toggleDemo could be memoized with useCallback
9. Performance: Loading returns null - show skeleton instead
10. Accessibility: Emoji icons need aria-hidden

**Admin Users (/admin/users)**
1. Color System: Success message uses hardcoded green colors
2. Color System: Error message uses hardcoded red colors
3. Color System: Role/status badges use hardcoded colors
4. Accessibility: Table needs caption for screen readers
5. Accessibility: Action buttons need descriptive aria-labels
6. SEO: Missing metadata export
7. UX: Buttons show disabled but no spinner
8. Accessibility: No focus management after action
9. Performance: Full refetch after every action - use optimistic updates
10. Dark Mode: Stats cards use hardcoded title colors

**Admin Shop (/admin/shop)**
1. Color System: Error uses hardcoded colors instead of alertColors
2. Color System: Status badges use hardcoded colors
3. SEO: Missing metadata export
4. Accessibility: Tabs lack proper ARIA pattern
5. Code Quality: _setOrders never used - clean up
6. UX: Orders tab incomplete - show "Coming Soon"
7. Accessibility: Tab buttons need focus rings
8. Performance: Product cards not memoized
9. Accessibility: Delete button disabled but not indicated
10. Responsive: Product images may overflow

**Admin Orders (/admin/orders)**
1. Color System: Error uses hardcoded colors instead of alertColors
2. Color System: getStatusColor hardcodes badge colors
3. SEO: Missing metadata export
4. Accessibility: Expand button needs aria-expanded
5. Accessibility: Filter buttons need aria-pressed
6. Code Quality: getStatusColor duplicated - move to shared utility
7. UX: Truncated order ID needs tooltip
8. Accessibility: Status update buttons need landmark/heading
9. Performance: Filter should use useMemo
10. Dark Mode: Detail boxes use inline colors

**Admin Appointments (/admin/appointments)**
1. Color System: Error uses hardcoded colors instead of alertColors
2. Color System: getStatusColor hardcodes badge colors
3. SEO: Missing metadata export
4. Accessibility: Filter buttons need aria-pressed
5. Accessibility: Approve/Cancel need confirmation dialogs
6. Code Quality: getStatusColor duplicated from orders
7. UX: Time slot colors have no legend
8. Accessibility: Calendar indicator needs aria-label
9. Performance: Filter should use useMemo
10. Dark Mode: Time slot boxes use hardcoded colors

**Admin Products (/admin/products)**
1. Color System: Placeholder uses hardcoded colors
2. Performance: Image marked unoptimized
3. Accessibility: URL input lacks proper id/htmlFor
4. Accessibility: File input has poor styling and focus states
5. UX: No empty state when products array empty
6. Code Quality: handleUpdateImage and handleFileUpload share logic
7. Accessibility: Truncated URL needs full aria-label
8. UX: Auto-dismiss success has no progress indicator
9. Performance: Server function fails silently
10. Accessibility: No loading spinner during upload

### Admin Content Pages (7 pages, 70 improvements)

**Admin Content (/admin/content)**
1. Color System: Error uses hardcoded colors instead of alertColors
2. Color System: Status badges use hardcoded colors
3. Accessibility: Loading lacks role="status"
4. Accessibility: Status badges need role="status"
5. SEO: Missing metadata
6. UX: No empty state handling
7. Performance: No timeout for parallel API calls
8. Code Quality: Missing alertColors import
9. Responsive: flex justify-between may overflow on mobile
10. UX: No per-page loading/error indicators

**Content Editor (/admin/content/[slug]/edit)**
1. Color System: Error icon uses hardcoded colors
2. Accessibility: Loading spinner lacks accessible label
3. Accessibility: Back button needs focus ring
4. SEO: Missing dynamic metadata
5. Dark Mode: Spinner lacks dark mode variant
6. UX: No autosave or draft warning
7. Code Quality: Type assertion could fail silently
8. UX: No inline validation feedback
9. Performance: No caching strategy
10. Responsive: Side-by-side editing may not work on mobile

**Admin Pages (/admin/pages)**
1. Color System: Status badges use hardcoded colors
2. Color System: Error uses hardcoded colors
3. Accessibility: Loading lacks role="status"
4. Accessibility: SVG in button needs aria-hidden
5. Dark Mode: Feature highlight gradients could be centralized
6. SEO: Missing metadata
7. UX: No optimistic UI for toggle actions
8. Performance: State updates could use useMemo
9. Responsive: Buttons may overflow on mobile
10. Code Quality: Delete/toggle handlers similar - extract utility

**New Page (/admin/pages/new)**
1. Color System: Recommended badge uses hardcoded colors
2. Color System: Validation error uses hardcoded colors
3. Accessibility: Path buttons need accessible names
4. Accessibility: Form inputs need aria-describedby for errors
5. Dark Mode: Breadcrumb separator lacks dark variant
6. SEO: Missing metadata
7. UX: No explicit Save Draft button
8. Performance: Initial Puck data could be memoized
9. Code Quality: generateSlug duplicated - import from shared
10. Responsive: Touch devices may not translate hover effects

**Edit Page (/admin/pages/[slug]/edit)**
1. Color System: Status badge uses hardcoded colors
2. TypeScript: Page state uses any type
3. TypeScript: handleSave data uses any type
4. Accessibility: Loading lacks role="status"
5. Accessibility: Back button SVG needs aria-label
6. Dark Mode: Spinner lacks dark mode variant
7. UX: No unsaved changes warning
8. SEO: Missing dynamic metadata
9. Code Quality: Magic number 3000ms - extract constant
10. Performance: showToast in deps may cause refetches

**Admin Blog (/admin/blog)**
1. Color System: Error uses hardcoded colors instead of alertColors
2. Color System: Emojis may render inconsistently
3. Accessibility: Loading lacks role="status"
4. Accessibility: Filter tabs need aria-pressed
5. Dark Mode: Active button needs explicit dark variant
6. SEO: Missing metadata
7. Performance: Filter logic should use useMemo
8. Code Quality: Status counts duplicate filter logic
9. Responsive: Action buttons may overflow
10. Color System: Status mapping uses non-matching keys

**New Blog Post (/admin/blog/new)**
1. Color System: Quick Tip box uses hardcoded blue colors
2. Color System: Tip text uses hardcoded colors
3. Accessibility: Loading lacks role="status"
4. Accessibility: Publish checkbox needs focus ring
5. Accessibility: Auto-paste behavior needs toast notification
6. Dark Mode: Source buttons use hardcoded inactive colors
7. SEO: Missing metadata
8. UX: No character limit indicator on title
9. Code Quality: handleTitleChange has subtle bug with old state
10. Responsive: Actions row could align better on tablets

---

## To Do

### Short Term (This Week)

<!-- Move items to "In Progress" section when starting work -->

**Admin Workflows**
- [ ] Inventory management interface
- [ ] Bulk product import/export
- [ ] Order status updates & fulfillment tracking

### Medium Term (2-4 Weeks)

**Visual Builder Polish**
- [ ] Re-enable Puck page builder (currently disabled)
- [ ] Add "Edit with Puck" after wizard completion
- [ ] Create block-level editor (mid-complexity between wizard and Puck)
- [ ] Add template preview images

**Performance & Caching**
- [ ] Define Redis cache invalidation strategy per feature
- [ ] Monitor cache hit rates
- [ ] Optimize product queries with pagination

**Analytics Dashboard**
- [ ] Orders, revenue, trends visualization
- [ ] Page view analytics per Puck page

### Long Term (1-3 Months)

**LMS Components** - The big vision: "Learn + Sell + Build"
```
┌─────────────────────────────────────────────────────────────────┐
│                    THE PLATFORM VISION                          │
│                                                                 │
│   📝 CMS (edit content) + 📚 LMS (teach) + 🛒 Shop (sell)       │
│                                                                 │
│   Built with a phone-first visual builder anyone can use        │
└─────────────────────────────────────────────────────────────────┘
```

- [ ] CourseCard component (course preview/listing)
- [ ] LessonPlayer component (video + content)
- [ ] QuizBlock component (interactive quizzes)
- [ ] ProgressBar component (course progress tracking)
- [ ] Certificate component (completion certificates)
- [ ] Enrollment system (paid/free courses)
- [ ] Student dashboard (my courses, progress)

**Advanced Ecommerce Features**
- [ ] Abandoned cart recovery emails
- [ ] Product recommendations engine
- [ ] Discount/coupon system
- [ ] Multi-currency support
- [ ] Customer reviews & ratings

**Platform Simplicity Layer**
- [x] Phone-first wizard (answer 5 questions → done) ✅ BUILT
- [ ] Pre-built page sections (drag whole sections, not components)
- [ ] Template marketplace (share/sell templates)

---

## Recently Completed

_Keep ~5-7 recent wins here, trim periodically once documented in README.md_

**Claude Code Autonomous Readiness** (Dec 2025)
- Swarm review of .claude configuration across 5 domains
- Fixed JSON parsing in user-prompt-submit.sh hook
- Added credential file protections (*.pem, *.key, credentials.json)
- Blocked production branch push in settings.json

**Automated Screenshot Documentation System** (Dec 2025)
- `/document` slash command for capturing screenshots of changed pages
- Smart detection: only screenshots affected routes (not all 150+)
- Component-to-route mapping with 34 routes, 42 components

---

## Disabled Features

Features that are implemented but not production-ready:

**Puck Page Builder** (Dec 2025)
- Visual page builder using Puck.js library
- Admin UI commented out in `AdminDashboard.tsx`
- E2E tests for `/admin/pages` disabled in `screenshots.spec.ts`
- Files remain in codebase (`app/admin/pages/`, `lib/puck-config.tsx`, `app/[slug]/page.tsx`)
- Reason: Needs more testing and polish before production use
- To re-enable: uncomment the Link in AdminDashboard.tsx and re-enable tests
- **NEW:** Template system added (`lib/templates/`) as simplified entry point to Puck

---

## Known Issues

**Context7 MCP Authorization**
- `resolve-library-id` works but `get-library-docs` returns "Unauthorized"
- Try regenerating API key at [context7.com/dashboard](https://context7.com/dashboard)

---

*Last Updated: December 2025*
