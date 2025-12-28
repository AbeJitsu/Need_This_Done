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

**Template System - Final Testing**
- [ ] Test wizard end-to-end in dev environment
- [ ] Verify page creation and storage works correctly

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

**Automated Screenshot Documentation System** (Dec 2025)
- `/document` slash command for capturing screenshots of changed pages
- Smart detection: only screenshots affected routes (not all 150+)
- Component-to-route mapping with 34 routes, 42 components
- Auto-generates changelog entries with screenshots
- Public `/changelog` page displays all updates
- Commands: `npm run screenshot:map` and `npm run screenshot:affected`
- Flow: Make changes → run `/document` → fill in changelog → commit

**No Broken Windows - Lint & Type Cleanup** (Dec 2025)
- Migrated all 12 `<img>` tags to Next.js `<Image>` components across codebase
- Fixed React hook dependency warnings in MediaLibrary, MediaPickerField, ProductGridComponent
- Fixed TypeScript errors: removed unused variables in E2E test files
- Created `AppointmentCancellationEmail.tsx` template for customer notifications
- Added `sendAppointmentCancellation()` to email-service.ts
- Updated cancel/route.ts to notify customers when appointments are canceled
- Added Appointments and Users quick links to AdminDashboard
- Removed verbose console.logs from shop/page.tsx and CartContext.tsx
- Result: Zero ESLint warnings, zero TypeScript errors

**DRY Refactoring & Code Quality Audit** (Dec 2025)
- Fixed critical dynamic Tailwind classes in Hero/ImageText that would break in production
- Centralized Puck color utilities in `puck-utils.tsx`:
  - `getDividerColors()` - Divider border/gradient
  - `getPricingColors()` - PricingTable border/bg/button/badge
  - `getTabColors()` - TabsComponent active/border/bg
  - Updated FeatureGrid, FeaturedProduct to use `getPuckFullColors()`
- Centralized template metadata in `lib/templates/config.ts` (category + color info)
- Removed debug console.logs from supabase.ts, api-auth.ts, auth/callback
- Fixed `/api/google/connect` to use `verifyAdmin()` pattern

**Template System & Page Wizard** (Dec 2025)
- Orthogonal template architecture (`lib/templates/`) - types, utils, starter templates
- 5 starter templates: Course Landing, Business Landing, Product Launch, Portfolio, Contact
- Phone-first PageWizard component (5-step creation flow)
- TemplatePicker with category filtering and search
- "Choose Your Path" admin UI at `/admin/pages/new` (wizard OR full editor)
- Wired to existing `/api/pages` for storage

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
