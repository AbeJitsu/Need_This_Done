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
| Security | ✅ Fixed | All critical issues resolved |
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
- [ ] Inventory management interface
- [ ] Bulk product import/export
- [ ] Order status updates & fulfillment tracking

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
│  Phase 5: Zero-Config Pages                                             │
│  ──────────────────────────                                             │
│  content/about.json exists? Page is editable.                           │
│  No hooks. No wrappers. Just JSON + components.                         │
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
- [ ] Auto-discover content JSON files at build time
- [ ] Generate route manifest from /content/*.json
- [ ] Remove all EditableSection/EditableItem wrappers
- [ ] Document "add JSON file = page is editable" pattern

**Visual Builder Polish**
- [x] Re-enable Puck page builder ✅ DONE
- [x] Add TipTap WYSIWYG editor ✅ DONE
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
│   CMS (edit content) + LMS (teach) + Shop (sell)                │
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

*Last Updated: December 30, 2025 - Auto-Loop System: 10 unit tests, enhanced hooks, context persistence*
