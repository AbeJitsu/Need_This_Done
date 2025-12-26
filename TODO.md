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

_Currently active work items_

**Google Calendar Integration - Final Testing & Deployment**

- [x] Google Cloud Console setup complete (credentials in .env.local)
- [ ] Manual testing of appointment booking flow in dev environment
- [ ] Test Google OAuth authorization flow
- [ ] Test calendar event creation on appointment approval
- [ ] Deploy to production

---

## To Do

### Short Term (This Week)

**Template System Foundation** ✅ COMPLETE
- [x] Create template type definitions (`lib/templates/types.ts`)
- [x] Build template utilities (`lib/templates/utils.ts`)
- [x] Create 5 starter templates (course, business, product, portfolio, contact)
- [x] Build TemplatePicker component (phone-friendly)
- [x] Build PageWizard component (5-step flow)
- [x] Create admin page with "Choose Your Path" (wizard OR full editor)
- [x] Wire wizard output to Puck page storage via `/api/pages`
- [ ] Test wizard end-to-end in dev environment

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
- [ ] Phone-first wizard (answer 5 questions → done)
- [ ] Pre-built page sections (drag whole sections, not components)
- [ ] Template marketplace (share/sell templates)

---

## Recently Completed

_Keep ~5-7 recent wins here, trim periodically once documented in README.md_

**Template System & Page Wizard** (Dec 2025)
- Created orthogonal template architecture (`lib/templates/`)
- 5 starter templates: Course Landing, Business Landing, Product Launch, Portfolio, Contact
- Phone-first PageWizard component (5-step flow)
- TemplatePicker with category filtering and search
- DRY utilities for template → Puck JSON conversion

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
