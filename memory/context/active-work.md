# Active Work

What's currently being built or fixed.

## Current Focus — Feb 2, 2026

**Status:** Production-ready platform - all core systems operational

Major systems complete:
- User account settings page with profile management
- Product discovery with search and filtering capabilities
- User wishlist system for saving favorite products
- Admin dashboard with Google Calendar integration
- Backend reliability hardening (race conditions, retries, validation, rate limiting)
- Accessibility compliance (WCAG AA across navigation and interactive elements)
- E-commerce, quotes, appointments, blog, and project submission workflows

Platform is stable and ready for production use.

## Recently Completed — Feb 2, 2026

**Customer Account Settings Page** (commit 1592bfd)
- New page at `/account` for customer profile management
- Account settings client component with form for editing profile info
- API endpoint `/api/account/profile/route.ts` for profile updates
- Integrated with checkout flow for pre-filling customer details

**Product Discovery: Search & Filtering** (commit 60ed4bc)
- New `/api/products/search` endpoint for full-text product search
- ProductListingPage component with search bar and filtering UI
- ProductCard component for displaying product information
- Advanced filtering by category, price range, and availability
- Real-time search results with improved UX

**Quote Authorization Improvements** (commit 7ca7b64)
- Customers can now view paid quotes for confirmation
- Enhanced quote detail view with payment status
- Better visual feedback on quote authorization flow

**Appointment Checkout Validation** (commit f710cc8)
- Added response validation for appointment checks during checkout
- Prevents invalid appointment states from proceeding to payment

**Wishlist Error Handling** (commit a770bd4)
- Fixed error handling on wishlist page remove action
- Better user feedback when removing items fails

**User Wishlist System** (commit 69b8121)
- Wishlist page at `/wishlist` showing saved products
- Add/remove from wishlist buttons in shop pages and product detail
- WishlistContext manages state with localStorage persistence
- API routes: `/api/wishlist` (list), `/api/wishlist/[productId]` (add/remove)
- Product detail client displays wishlist status and action buttons
- Navigation updated with wishlist link

## Previously Completed — Feb 1, 2026

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
