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
| **Color System** | ✅ **WCAG AA** | Gold-500 = #a36b00 (4.51:1 with white) |

---

## In Progress

<!-- Task markers: [→] working | [ ] ready | [x] done | [!] blocked -->

[x] **Daily Changelog Auto-Update** - Move changelog to Supabase for automatic daily updates
- [x] Create `changelog_entries` table migration (036)
- [x] Migrate existing JSON entries to database
- [x] Create `/api/changelog` endpoints (GET list, GET single)
- [x] Update `/changelog` page to fetch from database
- [x] Create `/api/cron/changelog` for daily processing
- [x] Add cron to vercel.json (runs at midnight)
- [x] Test end-to-end flow

[x] **Version History for Client Editing** - Google Docs-like revision history
- [x] Create `page_content_history` database migration (035)
- [x] Modify PUT handler to save history before update
- [x] Create GET endpoint for version history list
- [x] Create POST endpoint for version restore
- [x] Build VersionHistoryPanel UI component
- [x] Add History button to AdminSidebar footer

[x] **Auto-Complete Public Changelog** - Make /changelog automatic like /changelog/technical
- [x] Create utility `complete-changelog.ts` for template completion
- [x] Find entries with `_needsCompletion: true`
- [x] Auto-generate description, benefit, howToUse from `_gitContext`
- [x] Remove `_` prefixed fields when complete
- [x] Create `/document` skill with **visual screenshot review**
- Note: Script generates drafts, but `/document` skill does visual verification

[x] **Blue Page Headers** - Add color personality to page titles
- [x] Update PageHeader.tsx to accept optional `color` prop (default: 'blue')
- [x] Use titleColors[color] instead of headingColors.primary
- [x] All pages using PageHeader will get blue titles like homepage

[x] **Customize Page Header Colors** - Set unique colors per page (FAQ=gold, Pricing=purple)

[!] **Google Calendar Testing** - Complete integration testing (needs manual browser testing)

---

## To Do

### DRY/ETC Audit (Dec 31, 2025)

**Hardcoded Card Patterns** - 47+ files use inline card styles instead of Card component or colors.ts
```
┌─────────────────────────────────────────────────────────────────────────┐
│  Pattern: bg-white dark:bg-gray-800 rounded-xl border ...               │
│  Found in: 47 files with bg-white dark:bg-gray-800                      │
│           50 files with border-gray-200 dark:border-gray-700            │
│           44 files with text-gray-600 dark:text-gray-*                  │
│                                                                         │
│  Impact: Changing card style = editing 50 files                         │
│  Fix: Use Card component or cardBgColors/cardBorderColors from colors.ts│
└─────────────────────────────────────────────────────────────────────────┘
```
- [x] Audit components not using Card.tsx or colors.ts (30+ instances found, fixes in separate tasks)
- [x] Migrate ServiceCard to use cardBgColors.base (line 88)
- [→] Add inputBaseClasses to colors.ts for form fields
- [ ] Update FAQ.tsx, HowItWorks.tsx, and other marketing components

**Form Field DRY Violations** - Identical input styles repeated across 3+ field components
```
┌─────────────────────────────────────────────────────────────────────────┐
│  Files: TextField.tsx, TextAreaField.tsx, SelectField.tsx              │
│  Duplicated:                                                            │
│    - Input base classes (bg-white, borders, focus states)              │
│    - Error state styling                                                │
│    - Label/hint/error wrapper pattern                                   │
│                                                                         │
│  Fix: Extract to formInputClasses in colors.ts + FieldWrapper component│
└─────────────────────────────────────────────────────────────────────────┘
```
- [ ] Create formInputClasses in colors.ts with base, error, focus states
- [ ] Create FieldWrapper component for label/hint/error structure
- [ ] Refactor TextField, TextAreaField, SelectField to use shared code

**AdminSidebar God Object** - 1121 lines, too many responsibilities
```
┌─────────────────────────────────────────────────────────────────────────┐
│  File: components/InlineEditor/AdminSidebar.tsx (1121 lines)           │
│  Issues:                                                                │
│    - Hard to test individual parts                                      │
│    - Changes risk breaking unrelated functionality                      │
│    - Difficult to understand at a glance                                │
│                                                                         │
│  Fix: Split into focused sub-components                                 │
└─────────────────────────────────────────────────────────────────────────┘
```
- [ ] Extract field editors into separate components
- [ ] Extract section header/navigation into own component
- [ ] Extract save/cancel actions into own component
- [ ] Reduce AdminSidebar to <300 lines coordinator

**FeatureCard Hardcoded Colors** - Uses inline dark mode classes
```
┌─────────────────────────────────────────────────────────────────────────┐
│  File: components/FeatureCard.tsx (lines 34-35)                        │
│  Pattern: 'text-gray-900 dark:text-gray-100' inline                    │
│                                                                         │
│  Fix: Import from colors.ts like other card components                  │
└─────────────────────────────────────────────────────────────────────────┘
```
- [ ] Add titleColor and descriptionColor to featureCardColors in colors.ts
- [ ] Update FeatureCard to use centralized colors

### Pragmatic Programmer Audit (Dec 31, 2025)

**HARDCODED VALUES** - Magic numbers that should be constants
```
┌─────────────────────────────────────────────────────────────────────────┐
│  Pattern: setTimeout with hardcoded milliseconds                        │
│  Found in: 9 occurrences across 6 files                                 │
│  Impact: Inconsistent timing behavior, hard to tune                     │
│  Fix: Create TIMING_CONSTANTS in a config file                          │
└─────────────────────────────────────────────────────────────────────────┘
```
- [ ] Create timing constants file (TOAST_DURATION, COPY_FEEDBACK_DELAY, etc.)
- [ ] Update checkout/page.tsx:332 - setCopied setTimeout 2000
- [ ] Update admin pages to use shared timeout constants

**BROKEN WINDOWS** - TODO comments that need resolution
```
┌─────────────────────────────────────────────────────────────────────────┐
│  Pattern: TODO/FIXME comments left in production code                   │
│  Found in: 5 files                                                      │
│  Fix: Resolve or convert to tracked issues                              │
└─────────────────────────────────────────────────────────────────────────┘
```
- [ ] Resolve TODO in get-started/GetStartedPageClient.tsx:66 (payment integration)
- [ ] Implement ICS attachment in lib/email-service.ts:351
- [ ] Complete Medusa cart integration in api/cron/abandoned-carts/route.ts:203
- [ ] Add Medusa admin API in api/admin/inventory/route.ts:128

**LARGE FILES** - Components over 500 lines need refactoring
```
┌─────────────────────────────────────────────────────────────────────────┐
│  Files: RichTextEditor (580), PageWizard (569), InlineEditContext (555) │
│  Note: AdminSidebar (1121) already tracked in DRY/ETC section           │
│  Impact: Hard to test, understand, and maintain                         │
│  Fix: Extract focused sub-components                                    │
└─────────────────────────────────────────────────────────────────────────┘
```
- [ ] Refactor RichTextEditor.tsx (580 lines) - extract toolbar, helpers
- [ ] Refactor PageWizard.tsx (569 lines) - extract step components
- [ ] Refactor InlineEditContext.tsx (555 lines) - extract helpers to utils

**EMPTY CATCH BLOCK** - Swallowed exceptions hide errors
- [ ] Add proper error handling in app/layout.tsx:111 (empty catch block)

**RESOURCE LEAK RISK** - setInterval may not be cleaned up
- [ ] Verify TestimonialsComponent.tsx:157 setInterval has cleanup on unmount

### Short Term

**Consider Medusa v2 Upgrade**
```
┌─────────────────────────────────────────────────────────────────────────┐
│  Current: v1.20.11 (stable, working)                                    │
│  Latest: v2.0 (major rewrite, new architecture)                         │
│  Risk: Major migration, not a simple npm update                         │
│  Decision: Evaluate if new features justify migration effort            │
└─────────────────────────────────────────────────────────────────────────┘
```
- [ ] Research Medusa v2 migration guide
- [ ] Evaluate if v2 features are needed for our use case
- [ ] Document breaking changes that would affect our code

### Blocked Items

**Architecture Diagrams for Guide Page**
- [!] Update guide page (/guide) with architecture diagrams
- Blocked: needs design for which diagrams would be most useful
- Consider: data flow, request lifecycle, edit mode flow

---

## Recently Completed

_Keep ~5-7 recent wins here, trim periodically once documented in README.md_

**Daily Changelog Auto-Update** ✅ (Dec 31, 2025)
- Moved changelog from JSON files to Supabase database
- Created `/api/cron/changelog` for daily processing at midnight
- Entries with `needs_completion=true` auto-processed via Vercel cron

**Version History for Client Editing** ✅ (Dec 31, 2025)
- `page_content_history` table stores 20 versions per page
- History button in admin sidebar with restore functionality
- Auto-cleanup trigger removes old versions

**Card Alignment Fix** ✅ (Dec 31, 2025)
- Fixed pricing CTA cards not aligning buttons consistently
- Added items-stretch to grids + h-full through EditableItem wrappers
- Ensures buttons align regardless of content length

**Guide Page Cleanup** ✅ (Dec 31, 2025)
- Redesign with visual hierarchy, icons, grouped sections
- Cycling accent colors (green, blue, purple, gold)
- Hero section with CTA

**Gold Color Rename** ✅ (Dec 31, 2025)
- Renamed orange → gold across 53 files
- Gold-500 = #a36b00 (4.51:1 with white - WCAG AA)

**WCAG Color Calculator** ✅ (Dec 31, 2025)
- Admin page at /admin/colors for finding WCAG AA compliant color combos
- Auto-calculates 500/600 anchors, live preview, CSS export

**Dark Mode System** ✅ (Dec 30, 2025)
- Three principles: colors.ts only, no opacity in dark mode, inversion/neutral patterns
- ESLint rule prevents new hardcoded dark: classes
- All color scales now have 500 = 4.5:1 with white

**Building Blocks Vision** ✅ (Dec 30, 2025)
- Drag-and-drop sections with @dnd-kit
- Visual drag handles, real-time preview while dragging
- Integrated with inline editing system

**Universal Inline Editing** ✅ (Dec 30, 2025)
- 5 phases complete: section editing → item-level → DRY consolidation → auto-route → zero-config
- 12 pages, 52 field tests, click-to-edit working
- Documentation: docs/INLINE_EDITING.md

---

## Archived Milestones

_Major features fully documented in README.md_

- **LMS Components**: CourseCard, LessonPlayer, QuizBlock, ProgressBar, Certificate, Enrollment
- **Advanced Ecommerce**: Abandoned cart emails, recommendations, coupons, multi-currency, reviews
- **Platform Simplicity**: Phone-first wizard, pre-built sections, template marketplace
- **DRY/ETC Audit**: 32 tasks completed, page discovery for tests
- **Supabase Security**: 25 functions fixed, extensions moved

---

*Last Updated: December 31, 2025 (DRY/ETC audit added)*
