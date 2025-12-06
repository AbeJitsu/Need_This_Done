# E2E Test Report

**Last Updated:** December 5, 2025
**Environment:** Docker (ntd_app_network)
**Test Runner:** Playwright 1.57.0

---

## Summary

| Metric | Count |
|--------|-------|
| Total Tests | 138 |
| Passed | 133 |
| Skipped | 5 |
| Failed | 0 |
| Pass Rate | 100% |

All tests pass. The 5 skipped tests are desktop-only navigation tests that are appropriately skipped when running on mobile viewport (mobile has its own dedicated navigation tests).

---

## What the Tests Cover

### Authentication (14 tests)
- Login form displays correctly with all elements
- Sign in button enables/disables based on form state
- Mode switching between sign in, sign up, and forgot password
- Password validation (minimum 6 characters)
- Navigation links (back to home, login in nav)
- Protected routes redirect to login
- Mobile responsiveness

### Navigation (11 tests)
- All nav links work on desktop
- Logo links to homepage
- Active link highlighting
- Hamburger menu opens and closes on mobile
- Clicking a link closes the mobile menu
- All mobile nav links work
- Dark mode toggle switches theme
- Dark mode preference persists across pages

### Contact Form (13 tests)
- Page header and form display correctly
- All form fields are visible
- Alternative contact options shown
- Form fields can be filled
- Service dropdown shows all options (Virtual Assistant, Data & Documents, Website Services)
- Empty required fields prevent submission
- Invalid email prevents submission
- File upload area is clickable
- File size/type restrictions shown
- Successful form submission
- Can send another message after success
- Mobile form display and submission

### Public Pages (29 tests)

**Homepage:**
- Hero section with tagline
- Services preview section
- How It Works preview section
- CTA section
- How It Works preview links to full page

**Services Page:**
- Page header displays
- All service cards visible
- "What You Can Expect" section
- CTA buttons navigate correctly

**Pricing Page:**
- Page header displays
- All pricing tiers visible (Quick Task $50, Standard Task $150, Premium Service $500)
- Custom task section
- CTA buttons navigate correctly

**How It Works Page:**
- Page header displays
- All process steps visible
- Timeline note visible
- CTA buttons navigate correctly

**FAQ Page:**
- Page header displays
- FAQ questions visible
- Internal links navigate correctly
- CTA section visible

**Cross-Page Navigation:**
- Can navigate through entire site (desktop only)

### Dashboard (6 tests)
- Unauthenticated users redirected to login
- Loading state shows briefly before redirect
- Nav shows login when not authenticated
- API returns 401 for unauthenticated project requests

### Puck Visual Page Builder (12 tests)

**Page Management (admin-only):**
- Admin can access pages management at `/admin/pages`
- Admin can create new pages with slug and title
- Puck editor loads for creating/editing pages
- Admin can publish/unpublish pages
- Admin can delete pages with confirmation

**Public Page Viewing:**
- Published pages accessible at `/{slug}` with server-side rendering
- Unpublished pages return 404 for non-admin users
- Published pages display correct Puck-rendered content
- Page content caches correctly (5-minute TTL)

**Permission Enforcement:**
- Non-admin users cannot access `/admin/pages`
- API routes enforce admin-only restrictions
- Public users see only published pages

---

## How to Run Tests

```bash
# From the app directory, against Docker stack
cd app && BASE_URL=https://localhost npx playwright test

# Or start dev server and run tests
cd app && npm run test:e2e
```

---

## Test Files

| File | Purpose |
|------|---------|
| [auth.spec.ts](../app/e2e/auth.spec.ts) | Login page UI and auth flows |
| [navigation.spec.ts](../app/e2e/navigation.spec.ts) | Nav links, mobile menu, dark mode |
| [contact.spec.ts](../app/e2e/contact.spec.ts) | Contact form validation and submission |
| [pages.spec.ts](../app/e2e/pages.spec.ts) | Public page content verification |
| [dashboard.spec.ts](../app/e2e/dashboard.spec.ts) | Route protection, API auth |
| [admin-dashboard.spec.ts](../app/e2e/admin-dashboard.spec.ts) | Admin dashboard functionality |
| [submission.spec.ts](../app/e2e/submission.spec.ts) | Form submission workflows |
| [pages-dark-mode.spec.ts](../app/e2e/pages-dark-mode.spec.ts) | Dark mode across all pages |
| [pages-puck.spec.ts](../app/e2e/pages-puck.spec.ts) | Puck CMS full workflow tests (create, edit, publish, delete) |
| [pages-puck-demo.spec.ts](../app/e2e/pages-puck-demo.spec.ts) | Puck route accessibility and API endpoint verification |

---

## Infrastructure Notes

The E2E testing infrastructure includes:

- **Self-signed SSL certificates** in `nginx/ssl/` for HTTPS testing
- **Playwright** configured to accept self-signed certs
- **Mobile viewport testing** using iPhone 12 dimensions with Chromium
- **Desktop/mobile skip logic** to avoid running desktop-only tests on mobile viewport
