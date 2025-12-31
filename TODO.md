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
- [ ] Optional: customize per page (e.g., FAQ=gold, Pricing=purple)

[!] **Google Calendar Testing** - Complete integration testing (needs manual browser testing)

---

## To Do

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

*Last Updated: December 31, 2025*
