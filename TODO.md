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

[x] **Inline Page Editing System** - Click any component to edit it inline
    Context: app/components/InlineEditor/, app/context/InlineEditContext.tsx
    Plan: .claude/plans/swift-moseying-noodle.md
    **Scope:** Option A (Full) - Migrate pages to Puck + build inline editor

    Completed:
    - [x] Admin sidebar navigation (committed 68b6b75, 8dac6b8)
    - [x] Explored home page structure for Puck migration
    - [x] Home page now supports Puck rendering (app/page.tsx)
          → Create page with slug "home" in /admin/pages to use it
    - [x] InlineEditContext created (app/context/InlineEditContext.tsx)
    - [x] AdminEditBar component (app/components/InlineEditor/AdminEditBar.tsx)
    - [x] PropertySidebar component (app/components/InlineEditor/PropertySidebar.tsx)
    - [x] InlineEditProvider added to layout (app/app/layout.tsx)
    - [x] PuckPageRenderer with click detection (app/components/InlineEditor/PuckPageRenderer.tsx)
    - [x] Components clickable in edit mode with hover outlines
    - [x] Save functionality wired to PUT /api/pages/[slug]

    **Status: Complete** - Ready for testing with a Puck "home" page

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

## Known Issues

**Context7 MCP Authorization**
- `resolve-library-id` works but `get-library-docs` returns "Unauthorized"
- Try regenerating API key at [context7.com/dashboard](https://context7.com/dashboard)

---

*Last Updated: December 29, 2025*
