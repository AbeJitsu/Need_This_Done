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
| Puck Page Builder | ✅ Active | Visual page builder with TipTap WYSIWYG editor |

---

## In Progress

<!-- Task markers: [→] working | [ ] ready | [x] done | [!] blocked -->

[!] **Google Calendar Testing** - Complete integration testing (needs manual browser testing)
    Context: app/api/appointments/, .env.local credentials
    Done when: OAuth flow works, calendar events created on approval

---

## To Do

### Short Term (This Week)

<!-- Move items to "In Progress" section when starting work -->

**Admin Workflows**
- [ ] Inventory management interface
- [ ] Bulk product import/export
- [ ] Order status updates & fulfillment tracking

### Medium Term (2-4 Weeks)

**Inline Editing System** - Click any component to edit it
**Plan:** [.claude/plans/inline-editing-phase2.md](.claude/plans/inline-editing-phase2.md)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    INLINE EDITING SYSTEM ROADMAP                        │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  Phase 1: Section Editing ✅ DONE                                       │
│  ─────────────────────────                                              │
│  Click section → Edit all fields in sidebar                             │
│  Pattern: EditableSection wrapper on all marketing pages                │
│                                                                         │
│  Phase 2: Item-Level Editing ✅ DONE                                    │
│  ────────────────────────────                                           │
│  Click card/item → Edit just that item                                  │
│  Pattern: EditableItem wrapper for array items                          │
│  Breadcrumb: Section → Item navigation                                  │
│                                                                         │
│  Phase 2.5: Edit Mode UX ← NEXT                                         │
│  ────────────────────────                                               │
│  Block link clicks in edit mode                                         │
│  Show helpful hints and guidance                                        │
│  Visual feedback on all interactions                                    │
│                                                                         │
│  Phase 3: Component Creation                                            │
│  ──────────────────────────                                             │
│  [+ Add] buttons to create new items                                    │
│  Delete/reorder existing items                                          │
│  Component picker modal                                                 │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

Phase 2 Sub-tasks:
- [x] Create EditableItem component for clicking individual cards/items
- [x] Update sidebar for item editing with breadcrumb navigation
- [x] Wrap array items in all 5 marketing pages
      - [x] Services: scenarios, comparison columns, paths, expectations
      - [x] Home: buttons, cards, options, steps (5 arrays)
      - [x] Pricing: tier cards
      - [x] FAQ: FAQ items
      - [x] How It Works: trust badges, process steps

Phase 2.5 Sub-tasks:
- [x] Edit mode indicator bar (top of viewport) ✅ Done
- [x] Z-index layering for edit controls ✅ Done
- [x] E2E tests for edit mode exit (5 tests) ✅ Done
- [ ] Click interception for links/buttons in edit areas
- [ ] Toast feedback for blocked actions
- [ ] Hover states and tooltips

**Code Quality: Sustainable Page Content Architecture**
**Plan:** [.claude/plans/sustainable-page-content.md](.claude/plans/sustainable-page-content.md)

```
┌─────────────────────────────────────────────────────────────────────────┐
│  PROBLEM: 36+ pages, each repeating 15+ lines of identical boilerplate  │
│  SOLUTION: Route-aware provider + 1-line registration hook              │
│  RESULT: New editable page = add slug to config, that's it              │
└─────────────────────────────────────────────────────────────────────────┘
```

Phase 1: Create Infrastructure
- [ ] Create `lib/editable-routes.ts` (route → slug mapping)
- [ ] Create `hooks/useEditableContent.ts` (1-line registration)
- [ ] Update `InlineEditContext` (route-aware, generic merge)

Phase 2: Migrate Pages (remove boilerplate)
- [ ] ServicesPageClient.tsx
- [ ] HomePageClient.tsx
- [ ] FAQPageClient.tsx
- [ ] PricingPageClient.tsx
- [ ] HowItWorksPageClient.tsx

Phase 3: Testing & Prevention
- [ ] Create test for duplicate boilerplate detection
- [ ] Create test for infinite re-render patterns
- [ ] Document pattern for new pages

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

**Inline Editing Bug Fixes** (Dec 29, 2025)
- Fixed z-index layering so edit controls stay clickable (z-[60] for bar/toggle, z-50 for sidebar)
- Fixed infinite re-render in all 5 page clients (useMemo for merged content)
- Added 5 E2E tests for edit mode exit scenarios
- Created TDD rule (`.claude/rules/tdd.md`)
- Context: EditModeBar.tsx, AdminSidebarToggle.tsx, AdminSidebar.tsx, e2e/edit-mode-exit.spec.ts

**Inline Editing Phase 1: Section Editing** (Dec 29, 2025)
- Click any section on marketing pages to edit it in sidebar
- All 5 marketing pages use consistent EditableSection pattern
- mergeWithDefaults() handles old/partial content gracefully
- Context: app/components/InlineEditor/, app/context/InlineEditContext.tsx

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

*Last Updated: December 29, 2025*
