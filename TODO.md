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

**Autonomous Workflow System** (Dec 2025)
- Stop hook blocks until TODO.md tasks complete
- Task markers: [→] working, [ ] ready, [x] done, [!] blocked
- Session start shows current task

**Template System Testing** (Dec 2025)
- Fixed auth.setup.ts for existing sessions
- 28 wizard E2E tests passing

**Page Audit Systemic Fixes** (Dec 2025)
- alertColors: 142 uses across 32 files
- statusBadgeColors: 36 uses across 10 files
- focusRingClasses: 30 uses across 9 files
- aria-hidden: 53 uses across 25 files

**Claude Code Autonomous Readiness** (Dec 2025)
- Swarm review of .claude configuration across 5 domains
- Fixed JSON parsing in user-prompt-submit.sh hook
- Added credential file protections (*.pem, *.key, credentials.json)

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
