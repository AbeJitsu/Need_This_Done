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

### Short Term

**Admin Workflows**
- [ ] Inventory management interface
- [ ] Bulk product import/export
- [ ] Order status updates & fulfillment tracking
- [ ] Analytics dashboard (orders, revenue, trends)

### Medium Term

**Performance & Caching**
- [ ] Define Redis cache invalidation strategy per feature
- [ ] Monitor cache hit rates
- [ ] Optimize product queries with pagination

### Long Term

**Advanced Ecommerce Features**
- [ ] Abandoned cart recovery emails
- [ ] Product recommendations engine
- [ ] Discount/coupon system
- [ ] Multi-currency support
- [ ] Customer reviews & ratings

---

## Recently Completed

_Keep ~5-7 recent wins here, trim periodically once documented in README.md_

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

---

## Known Issues

**Context7 MCP Authorization**
- `resolve-library-id` works but `get-library-docs` returns "Unauthorized"
- Try regenerating API key at [context7.com/dashboard](https://context7.com/dashboard)

---

*Last Updated: December 2025*
