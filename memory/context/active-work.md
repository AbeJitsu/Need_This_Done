# Active Work

What's currently being built or fixed.

## Current Focus — Feb 1, 2026

**Status:** Production-ready platform - all core systems operational

Major systems complete:
- Admin dashboard with Google Calendar integration
- Backend reliability hardening (race conditions, retries, validation, rate limiting)
- Accessibility compliance (WCAG AA across navigation and interactive elements)
- E-commerce, quotes, appointments, blog, and project submission workflows

Platform is stable and ready for production use.

## Recently Completed — Feb 1, 2026

**Order Confirmation Email** (commit a962914)
- Sends confirmation email to customer on successful Stripe payment
- Triggered from Stripe webhook handler

**Link & URL Fixes** (commit d5c7871)
- Fixed broken `/get-started` links across Footer, Homepage CTAs
- Fixed quote email URL to use correct path

**Auth & Validation Hardening** (commit ca89e05)
- Added missing auth checks on admin API routes (media, files, embeddings, product upload)
- Added input validation on routes that lacked it

**Customer Quote Authorization Page** (commit 7adb87d)
- Full quote review and deposit payment page at `/quotes/[ref]`
- Stripe-powered deposit collection

**Google Calendar Integration** (commit b8d376a)
- Admin settings page: OAuth connection UI with status display
- Token management: Proper error surfacing for token expiration
- Email delivery tracking: Appointment approval shows email success/failure status
- Graceful degradation: Appointments approve even if calendar/email fails

**Chat API Hardening** (commit a62f5f9)
- Rate limiting: 20 requests/minute per IP (Redis-backed)
- DoS protection: Max 50 messages, 50KB total conversation size
- Redis atomic operations: SET NX prevents duplicate submissions
- Graceful shutdown: Proper connection cleanup on SIGTERM/SIGINT

**Checkout Flow Timeout Protection** (commit a62f5f9)
- All Medusa API calls wrapped with 8s timeout (15s for order creation)
- Prevents hanging requests from blocking checkout
- Applied to: cart fetch/update, payment session init, order creation

**Accessibility Improvements** (commit 9aeee89)
- Navigation borders: gray-600 → gray-400 for 3.1:1 contrast (meets WCAG AA)
- Keyboard interactions: Service cards respond to Enter/Space keys
- Motion preferences: All scale animations respect prefers-reduced-motion
- Footer touch targets: 44x44px minimum with proper padding
