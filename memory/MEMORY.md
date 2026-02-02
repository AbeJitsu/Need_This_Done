# Project Memory

Key learnings and patterns discovered during development.

## Documentation Note

**Evaluation Reports** (Feb 2, 2026): Root directory contains auto-evaluation summaries (BACKEND_EVAL_SUMMARY.md, FRONTEND_EVAL_SUMMARY.md, etc.). These capture work completed and are archived. **Primary source of truth**: This MEMORY.md file.

---

## Project Status — Feb 2, 2026

**Current State:** Mature, production-ready with comprehensive reliability hardening and complete feature set
- **Product comparison tool**: Side-by-side comparison modal for up to 4 products (new Feb 2)
- **Order notes/special requests**: Customers can add custom notes at checkout (new Feb 2)
- Product category filtering: Browse products by category with auto-populated dropdown from metadata
- Product waitlist system: Sign up for out-of-stock items, email capture for future notifications
- Product availability display: Shows stock status (in stock, low stock, out of stock) with waitlist UI
- Product reviews system: Full lifecycle with admin moderation dashboard, analytics, and user tracking
- Account settings page: Customer profile management + My Reviews section showing submission status
- Product discovery: Full-text search and advanced filtering across catalog
- User wishlist feature: Save/manage favorite products with persistence
- Order history: Quick reorder, CSV export, invoice downloads, timeline tracking
- Critical appointment flow fixes: 3 silent failures resolved with explicit error handling
- Backend reliability: Comprehensive error classification, circuit breaker, retry logic, deduplication, rate limiting
- Admin dashboard: Review moderation, analytics, appointment management, Google Calendar, product analytics, enrollments
- Customer dashboard: Active appointments section + statistics overview
- Test suite: 69 E2E tests + accessibility tests

**Completed Recent Work (Feb 2):**
- ✅ Product comparison tool - Side-by-side product comparison modal with max 4 items (commit bf2382b)
- ✅ Order notes system - Customers add special requests/instructions at checkout (commit bf2382b)
- ✅ Saved addresses system - CRUD management in account settings with default address support (commit 7384dbd)
- ✅ Spending analytics - Customer spending visualization and metrics (commit 7384dbd)
- ✅ Waitlist notifications - Automated emails when products return to stock (commit 19dbc93)
- ✅ Backend reliability audit - 8 critical issues identified and fixed (commit e724d3b)
- ✅ Product category filtering - browse products by category with auto-populated dropdown (commit 56f7502)
- ✅ Product waitlist system - sign up for out-of-stock items with email capture (commit 908f2c7)
- ✅ Product availability display - shows stock status and waitlist form (ProductAvailability component)
- ✅ Quick reorder button on order history - one-click reordering of completed orders (commit 88ac8f2)
- ✅ CSV export of order history - download orders with ID, date, status, total, email
- ✅ Invoice downloads (OrderInvoice component) - customers can download PDFs from order page
- ✅ Notification preferences UI - email opt-in/opt-out controls in account settings
- ✅ Order tracking timeline - visual progression of order status
- ✅ Customer dashboard: Active appointments section with status/details (commit b6bbb73)
- ✅ Dashboard stats overview: Key account metrics visualization (commit 64362f4)

**Next Priority Areas:**
1. Waitlist analytics - Track demand patterns for out-of-stock products
2. Category management UI - Admin dashboard to configure/customize categories
3. Performance optimization for search/filtering (if needed based on usage metrics)
4. Load testing for Redis circuit breaker under high concurrency
5. Email segmentation - Send targeted offers to waitlist members

## Customer-Facing Features — Feb 2, 2026

**Product Reviews System** (complete as of Feb 2, 2026)
- Submission: ReviewForm component with 5-star ratings, title, content, anonymous/authenticated support
- Display: ReviewSection with rating statistics, distribution breakdown, customer voting
- Moderation: Admin dashboard at `/admin/reviews` - approve/reject pending reviews with optional reason
- Analytics: `/admin/reviews/analytics` - product-level metrics, rating distribution, moderation status
- User tracking: `/account` "My Reviews" section shows customers their review status (pending/published/rejected)
- Database: Uses `reviews`, `review_votes`, `review_reports` tables from migration 028
- Full lifecycle: submission → pending → admin review → published/rejected → customer visibility

**Account Settings Page** (commit 1592bfd)
- Profile management at `/account` for logged-in customers
- View and edit personal information (name, email, phone, etc.)
- AccountSettingsClient component handles form state and validation
- `/api/account/profile` endpoint persists profile updates to database
- Integrated with checkout for pre-filling customer details

**Product Discovery: Search & Filtering** (commit 60ed4bc)
- Full-text search at `/api/products/search` for fast product lookup
- ProductListingPage: Advanced filtering by category, price range, availability
- ProductCard component: Consistent display across shop and wishlist pages
- Real-time search results with improved UX and performance
- Supports dynamic category and tag-based filtering

**Product Category Filtering** (commit 56f7502)
- CategoryFilter component: Dropdown selector for browsing by product category
- API: `/api/products/categories` extracts unique categories from product metadata
- Auto-populated categories (no manual configuration needed)
- Shows product counts per category
- Integrates with search bar and price filters
- "Clear all filters" button to reset criteria

**Product Waitlist & Availability System** (commit 908f2c7)
- ProductAvailability component: Displays stock status (in stock, low stock, out of stock)
- Waitlist signup form for out-of-stock products with email validation
- Database: `product_waitlist` table (migration 045) tracks customer interest
- API endpoints:
  - `POST /api/products/waitlist` - Sign up for waitlist with duplicate detection
  - `GET /api/products/waitlist?email=X` - Retrieve user's waitlist entries
- Unique constraint on email+product_id prevents duplicate signups
- Foundation for automated back-in-stock notifications

**Waitlist Notifications System** (commit 19dbc93 — Feb 2)
- Automated emails when waitlisted products return to stock
- Cron job: `/api/cron/waitlist-notifications` runs hourly
  - Scans products with waitlist entries
  - Checks current inventory status vs. last notification state
  - Sends WaitlistNotificationEmail only on status transition (out → in stock)
- Database: `waitlist_notification_sent` tracking table prevents duplicate sends
- Email template includes:
  - Product name, image, and current price
  - "Shop now" button with direct product link
  - Reduces manual customer research, drives conversions
- Graceful degradation: Logs failures, retries on next cron execution

**User Wishlist System** (commit 69b8121)
- Wishlist page at `/wishlist` displays saved products with add-to-cart buttons
- WishlistContext: Manages wishlist state with localStorage persistence (survives page refreshes)
- Add/remove buttons: Quick actions in shop listings and product detail pages
- API integration: `/api/wishlist` (list items), `/api/wishlist/[productId]` (add/remove)
- UI feedback: Wishlist icon shows saved status in product cards
- Zero authentication required: Built with context-based state management

**Order Confirmation Email** (`api/stripe/webhook/route.ts`)
- Triggered on `checkout.session.completed` webhook event
- Sends confirmation via Resend to customer email

**Quote Authorization & Deposit** (`app/quotes/[ref]/page.tsx`)
- Customer-facing page for reviewing and authorizing quotes
- Stripe-powered deposit collection integrated into the flow
- Uses quote reference token for secure access (no auth required)

**Auth Hardening** (commit ca89e05)
- Added `requireAdmin()` checks to: media upload/delete, file access, embeddings index, product image upload
- Added Zod validation to routes that previously accepted raw input

## Backend Reliability Patterns — Feb 1, 2026

**Request Validation** (`lib/api-validation.ts`, `lib/validation.ts`)
- Zod-based schema validation for all API routes
- Auto-normalizes inputs (trim, lowercase emails)
- Type-safe results prevent runtime errors
- Input sanitization: blocks directory traversal, email injection
- Length validation: prevents database overflow attacks

**Timeout Protection** (`lib/api-timeout.ts`)
- Configurable timeouts: 8s external APIs, 10s database, 2s cache
- `withTimeout()`, `withRetry()`, `withTimeoutAll()` wrappers
- Applied to: cart operations, quote authorization, payment intents

**Redis Hardening** (`lib/redis.ts`)
- Circuit breaker pattern with 10 max retries
- Exponential backoff with jitter (prevents thundering herd)
- 3s command timeout, graceful degradation on failure

**Webhook Idempotency** (`api/stripe/webhook/route.ts`)
- Stores Stripe event IDs in `webhook_events` table
- Prevents duplicate processing when webhooks are retried
- Critical for payment operations

**Database Transactions** (migrations 041)
- Quote creation + project updates atomic via `create_quote_transaction()`
- Prevents orphaned records on partial failures
- Ensures data consistency

**Race Condition Prevention** (`api/appointments/request/route.ts`)
- Atomic time slot validation: fetch all appointments before checking availability
- Prevents TOCTOU bugs in concurrent booking requests
- Single query approach eliminates race window

**Transient Failure Recovery** (`lib/supabase-retry.ts`)
- Auto-retry wrapper for database operations (3 attempts max)
- Smart error classification: retry connection issues, fail fast on constraints
- Exponential backoff with jitter prevents thundering herd
- Applied to: projects, enrollments, quote auth

**Request Deduplication** (`lib/request-dedup.ts`)
- SHA-256 fingerprinting prevents duplicate submissions
- Redis-backed with 60s TTL window
- Graceful degradation if Redis unavailable
- Returns 429 for duplicates within window
- Applied to: project submissions

## Helper Library Growth

**Medusa Admin Client** (`lib/medusa-client.ts`)
- Added `updateVariantInventory()` for bulk inventory updates
- Centralized admin authentication with `getMedusaAdminToken()`
- Existing helpers: `getOrder()`, `getCart()`, `listOrders()`

**Medusa Helpers** (`lib/medusa-helpers.ts`)
- ~85 lines of reusable e-commerce logic
- Reduces duplication across pages and API routes

## Critical Fixes — Feb 2, 2026

**Appointment Flow Silent Failures** (commit 12a9226)
- Silent failure after payment: Users saw success but appointment wasn't created. Fixed: Show error alert with admin email link
- Missing null check: Appointment IDs undefined in logging. Fixed: Validate ID exists before logging
- Cart fetch silent fallback: Medusa API down = user bypasses appointment step. Fixed: Return explicit 503 error for retries

## Admin Dashboard Features — Feb 2, 2026

**Google Calendar Integration** (`/admin/settings`)
- OAuth connection UI: Connect/disconnect buttons with status display
- Shows connected Google email and available features
- Token management: Expiration errors surface to admin
- Auto-refresh implemented in `lib/google-calendar.ts`
- API: `/api/google/status`, `/api/google/disconnect`

**Appointment Management** (`/admin/appointments`)
- Email delivery tracking: Shows success/failure status on approval
- Calendar event creation status visible to admin
- Graceful degradation: Appointments approve even if email/calendar fails
- Admin receives actionable warnings for failures
- **Automatic Reminder Emails** (Feb 2): Sends 24h and 1h pre-appointment reminders
  - Cron job: `/api/cron/appointment-reminders` (runs hourly)
  - Tracking table prevents duplicate emails
  - Beautiful template with appointment details and meeting links
  - Reduces no-shows through proactive customer communication

**Product Analytics** (`/admin/product-analytics`)
- Product engagement: views, cart adds, purchases, conversion funnel
- Time range filters: 7/14/30/90 days
- Popular products list + trending products (24h growth)
- API: `/api/admin/product-analytics`

**Enrollments Management** (`/admin/enrollments`)
- Course enrollment oversight with CRUD operations
- Summary: total/free/paid enrollments, completion rate, revenue
- Filterable table with user details, progress tracking
- API: `/api/admin/enrollments`

**Order Features** (commits 6c5bd3f, 3e43138 — Feb 2)
- **Invoice downloads**: OrderInvoice component generates downloadable PDFs with order details, line items, totals
- **Order tracking timeline**: Visual timeline showing order progression through states (pending → processing → shipped → delivered)
- **Integrated in** `/app/orders/[orderId]/page.tsx` for customer transparency

**Notification Preferences** (commit 1b1129e — Feb 2)
- Email opt-in/opt-out controls at `/account`
- NotificationPreferencesSection component manages user communication preferences
- API: `/api/account/notification-preferences` persists preferences
- Supports controlling: order updates, promotional emails, review notifications, etc.

**Saved Addresses System** (commit 7384dbd — Feb 2)
- SavedAddressesSection component in account settings for address CRUD
- Store multiple delivery addresses with default address support
- Database: `saved_addresses` table (migration 046) tracks customer addresses
- API: `POST /api/account/saved-addresses` - Add new address
- API: `DELETE /api/account/saved-addresses/:id` - Remove address
- API: `PATCH /api/account/saved-addresses/:id/default` - Set default address
- Improves checkout friction: Pre-filled addresses for repeat customers
- Enables multi-location delivery for business customers

**Spending Analytics** (commit 7384dbd — Feb 2)
- SpendingAnalyticsSection visualizes customer spending patterns
- Time-based aggregation: Daily/weekly/monthly spend tracking
- Key metrics: Total spend, average order, purchase frequency
- API: `GET /api/user/spending-analytics` calculates aggregated order data
- Uses order history from Medusa with date filtering
- Displayed in customer account dashboard (`/account` page)

**Review Notification Emails** (commit 38818c0 — Feb 2)
- ReviewApprovedEmail: Sent when admin approves a review in moderation dashboard
  - Celebrates published review with product details, rating displayed
  - Includes link to view product and browse other reviews
- ReviewRejectedEmail: Sent when admin rejects a review with reason
  - Explains rejection reason, invites resubmission
  - Provides link to community guidelines
  - Supportive tone maintains user relationship despite rejection
- Integration: Automatic email trigger in `/api/admin/reviews` route during moderation
- Closes communication loop and sets clear expectations for review community standards

**Order History Features** (commit 88ac8f2 — Feb 2)
- **Quick Reorder:** One-click button adds all items from completed order to cart automatically
  - Reduces friction for repeat purchases
  - Shows success/error messages with feedback
  - Handles out-of-stock items gracefully (partial fulfillment)
  - Location: `/orders` page on completed orders
- **CSV Export:** Download entire order history as spreadsheet file
  - Format: Order ID, Date, Status, Total, Email
  - Filename: `order-history-YYYY-MM-DD.csv`
  - Client-side generation (no server overhead)
  - Supports accounting/business record-keeping
  - Location: Header button on `/orders` page
- **Enhanced API:** `/api/user/orders` now fetches order items from Medusa for complete data

**Customer Dashboard** (commits b6bbb73, 64362f4 — Feb 2)
- **Active Appointments Section** (`ActiveAppointmentsSection.tsx`)
  - Displays upcoming appointments with status, date/time, and details
  - Shows appointment confirmation status and meeting links
  - Empty state with CTA when no appointments scheduled
  - API: `/api/user/appointments` fetches customer's appointments
  - Location: `/dashboard` customer-facing page
- **Dashboard Stats Overview** (`DashboardStatsOverview.tsx`)
  - Key metrics at a glance: total orders, reviews submitted, appointments booked
  - Quick visual indicators of customer engagement and account activity
  - Compact card layout with icon + stat display
  - Location: Top of `/dashboard` customer page

**Product Comparison Tool** (commit bf2382b — Feb 2)
- Side-by-side comparison modal for up to 4 products
- ComparisonContext manages comparison state across app
- CompareButton on ProductCard adds/removes products from comparison
- ProductComparisonModal displays interactive comparison table with:
  - Product images, names, prices
  - Ratings and availability status
  - Full descriptions for each product
  - Add-to-cart buttons for comparison items
- Max 4 products limit prevents overwhelming UI
- Context persists comparison across page navigation
- Location: Compare button visible on ProductCard everywhere products are displayed

**Order Notes / Special Requests** (commit bf2382b — Feb 2)
- Optional textarea field on checkout form for customer notes
- 500-character limit with live character counter
- Supports delivery instructions (e.g., "leave at front door")
- Supports special handling (e.g., "fragile items")
- Supports customization requests (e.g., "color preference")
- Notes saved with order for team reference during fulfillment
- Field submission integrated into checkout form validation
- Location: `/checkout` page in order summary section
