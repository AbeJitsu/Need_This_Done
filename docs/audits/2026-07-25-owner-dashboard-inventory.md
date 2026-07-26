# Retained Owner Dashboard and Pricing Boundary

**Date:** July 25, 2026
**Branch:** `dev`
**Status:** Decision and inventory only. This document changes no route, API, schema, price, navigation item, or payment behavior.

## Decision

NeedThisDone will sell in two deliberately different ways:

1. Common, clearly scoped services will have public prices.
2. A standard purchase will open a Stripe-hosted Payment Link or subscription checkout.
3. Custom work will begin with a project request and be paid by a Stripe invoice.

The repository will own the future public service catalog. Stripe is the payment host, not the catalog or CMS. The catalog will be version controlled and, for each offering, carry the display price, included scope, hosted Stripe link, and custom-work fallback. Existing package and service prices are source material only; this decision does not re-price them.

The existing quote/deposit flow remains available only until its hosted-payment replacement has been validated. It receives no new feature work.

## Classification language

- **Retain** — supports the focused owner workflow: projects and client collaboration, appointments and calendar connection, site reports, blog management, or necessary notification/retry support.
- **Transitional** — remains temporarily but must be reshaped around the retained client portal and hosted Stripe payments.
- **Retirement-targeted** — belongs to the old commerce, LMS, editor, growth-tool, or developer-tool product; do not add capability to it.

The inventory is a static snapshot of filesystem routes and handlers on this branch. A route is listed once in its inventory table even when multiple visible links lead to it.

## Owner workflow to retain

```text
Project request -> owner project dashboard -> project comments/files -> client portal
                                      \
                                       -> appointment request -> calendar connection -> reminders/retry

Site analyzer -> site report -> future owner report queue
Blog draft -> owner blog management -> published post

Public catalog -> Stripe-hosted payment or subscription
Custom work -> project request -> Stripe invoice
```

## `/admin/*` route inventory (33 page handlers)

| Classification | Routes | Current purpose and boundary |
| --- | --- | --- |
| Retain | `/admin/appointments` | Appointment review and approve/cancel actions. |
| Retain | `/admin/blog`, `/admin/blog/new`, `/admin/blog/[slug]/edit` | Database-administered blog list, create, and edit flow. |
| Retain | `/admin/settings` | Retain only the Google Calendar connection controls; other settings must be re-evaluated when this page is narrowed. |
| Transitional | `/admin/users` | General account administration must become a project-focused client-access view. |
| Retirement-targeted | `/admin/analytics` | Order/revenue analytics. |
| Retirement-targeted | `/admin/automation/[[...path]]` | Retired automation bookmark redirect. |
| Retirement-targeted | `/admin/colors` | Theme/color controls. |
| Retirement-targeted | `/admin/communication` | Campaign and template administration. |
| Retirement-targeted | `/admin/content`, `/admin/content/[slug]/edit` | Inline editor and page-content controls. |
| Retirement-targeted | `/admin/dev`, `/admin/dev/preview` | Developer tools and preview surface. |
| Retirement-targeted | `/admin/enrollments` | LMS administration. |
| Retirement-targeted | `/admin/loyalty` | Loyalty program administration. |
| Retirement-targeted | `/admin/orders` | Medusa/order fulfillment administration. |
| Retirement-targeted | `/admin/product-analytics` | Product behavior analytics. |
| Retirement-targeted | `/admin/products`, `/admin/products/categories`, `/admin/products/manage` | Catalog and category management. |
| Retirement-targeted | `/admin/quotes` | Custom quote and deposit checkout administration; retain data only long enough to replace the payment flow safely. |
| Retirement-targeted | `/admin/referrals` | Referral program analytics. |
| Retirement-targeted | `/admin/reviews`, `/admin/reviews/analytics` | Review moderation and analytics. |
| Retirement-targeted | `/admin/shop`, `/admin/shop/inventory`, `/admin/shop/orders`, `/admin/shop/products/new` | Shop, inventory, orders, and product creation. |
| Retirement-targeted | `/admin/waitlist-analytics` | Product waitlist analytics. |
| Retirement-targeted | `/admin/waitlist-campaigns`, `/admin/waitlist-campaigns/new`, `/admin/waitlist-campaigns/[id]` | Waitlist campaign management. |

`/dashboard` is the retained project dashboard even though it is outside `/admin/*`; its admin mode is implemented by `AdminDashboard` and its client mode by `UserDashboard`.

## Admin API inventory (37 handlers)

| Classification | Handlers | Current dependency / migration note |
| --- | --- | --- |
| Retain | `/api/admin/appointments`, `/api/admin/appointments/[id]/approve`, `/api/admin/appointments/[id]/cancel`, `/api/admin/appointments/failed-notifications` | Admin appointment operations and notification recovery. Preserve while appointment creation is coupled to orders; see data constraints below. |
| Transitional | `/api/admin/users` | Uses Supabase Auth admin operations rather than a dedicated application table. Narrow its authorization and data exposure to client access for active projects and hosted-payment references. |
| Retirement-targeted | `/api/admin/analytics` | Reads `orders` for commerce revenue reporting. |
| Retirement-targeted | `/api/admin/cache-stats` | Developer/cache diagnostics. |
| Retirement-targeted | `/api/admin/email-campaigns`, `/api/admin/email-campaigns/send`, `/api/admin/email-templates` | Marketing campaign and template system. |
| Retirement-targeted | `/api/admin/enrollments` | LMS enrollment system. |
| Retirement-targeted | `/api/admin/inventory` | Medusa inventory proxy. |
| Retirement-targeted | `/api/admin/loyalty-analytics` | Loyalty data and configuration. |
| Retirement-targeted | `/api/admin/orders`, `/api/admin/orders/[id]/cancel`, `/api/admin/orders/[id]/details`, `/api/admin/orders/[id]/ready-for-delivery`, `/api/admin/orders/[id]/status` | Medusa-backed order lifecycle. Do not remove until appointment and payment links no longer require `orders`. |
| Retirement-targeted | `/api/admin/product-analytics` | Product interaction, popular-product, and trending-product data. |
| Retirement-targeted | `/api/admin/product-categories`, `/api/admin/product-categories/[id]` | Product category CRUD. |
| Retirement-targeted | `/api/admin/products`, `/api/admin/products/[id]`, `/api/admin/products/export`, `/api/admin/products/import`, `/api/admin/products/notify-waitlist`, `/api/admin/products/update-image`, `/api/admin/products/upload-image` | Medusa catalog administration, product assets, and product waitlist notifications. |
| Retirement-targeted | `/api/admin/quotes`, `/api/admin/quotes/[id]`, `/api/admin/quotes/[id]/send` | Quote/deposit workflow awaiting hosted-payment replacement. |
| Retirement-targeted | `/api/admin/referral-analytics` | Referral program analytics. |
| Retirement-targeted | `/api/admin/reviews` | Product review moderation. |
| Retirement-targeted | `/api/admin/waitlist-analytics` | Product waitlist metrics. |
| Retirement-targeted | `/api/admin/waitlist-campaigns`, `/api/admin/waitlist-campaigns/[id]`, `/api/admin/waitlist-campaigns/[id]/send` | Waitlist campaign CRUD and delivery. |

## Owner-facing non-admin API boundary

These handlers are outside the `/api/admin/*` namespace but are part of the retained owner workflow or its transition. Public-only marketing endpoints and retirement-targeted commerce endpoints are intentionally not treated as owner-dashboard APIs here.

| Classification | Handlers | Current callers / role |
| --- | --- | --- |
| Retain | `/api/projects`, `/api/projects/all`, `/api/projects/mine`, `/api/projects/[id]/status`, `/api/projects/[id]/comments`, `/api/projects/[id]/access`, `/api/projects/[id]/deliveries`, `/api/files/[...path]` | `contact/page.tsx` creates projects; `AdminDashboard`, `UserDashboard`, `ProjectDetailModal`, `useDashboard`, `useComments`, and `useProjectStatus` supply the owner/client project portal. Operators can link/unlink an existing exact-email account without creating an account or invitation, then publish project-scoped GitHub handoffs. Files are project attachments viewed through the detail modal and require project-level authorization. |
| Retain | `/api/appointments/request`, `/api/user/appointments` | `AppointmentRequestForm`, checkout's existing appointment step, `ActiveAppointmentsSection`, and `DashboardStatsOverview` create/show appointments. |
| Retain | `/api/google/connect`, `/api/google/callback`, `/api/google/disconnect`, `/api/google/status` | `/admin/settings` connects the owner's calendar; approval creates the calendar-side outcome. |
| Retain | `/api/blog`, `/api/blog/[slug]` | Owner blog pages create, update, and delete posts; public home, blog list, post, and sitemap readers consume published posts. |
| Retain | `/api/site-analyzer` | `AnalyzerForm` creates a report; `/report/[id]` reads the report directly from Supabase. |
| Retain | `/api/cron/appointment-reminders`, `/api/cron/retry-failed-emails` | Scheduled recovery/delivery support for approved appointments and failed transactional email. |
| Transitional | `/api/account/profile`, `/api/account/notification-preferences` | Existing account settings should be narrowed to the project-sharing portal. |
| Transitional | `/api/subscriptions`, `/api/stripe/customer-portal`, `/api/stripe/webhook` | Existing customer billing view, Stripe-hosted Customer Portal handoff, and webhook reconciliation. Replace the order-centric representation with a slim hosted-payment reference view; keep webhook reliability during the migration. |
| Retirement-targeted | `/api/quotes/authorize`, `/api/quotes/deposit-confirmed`, `/api/stripe/create-build-checkout`, `/api/stripe/create-payment-intent`, `/api/stripe/create-subscription` | Existing custom intent/deposit and product checkout creation. Keep operationally stable only until the Payment Link, subscription checkout, and invoice paths have passed validation. |

## Dependent data surfaces and constraints

Only data that backs a retained or transitional workflow is included below. Historic migrations remain historical records; this document does not authorize schema cleanup.

| Classification | Data surface | Current callers | Migration constraint |
| --- | --- | --- | --- |
| Retain | `projects` | Project APIs; `AdminDashboard`, `UserDashboard`, `ProjectDetailModal`; contact submission; project tests. | The client portal keys access and workflow to this table. Preserve its project status/history behavior while the portal is narrowed. |
| Retain | `project_comments` | Project comments/status APIs; `useComments`; `ProjectDetailModal`; the status-change trigger. | Comments include internal notes and client-visible conversation. Retain authorization distinction and audit history. |
| Retain | Project attachment storage (served by `/api/files/[...path]`) | Project submission upload and `ProjectDetailModal` downloads. | Storage references are held in `projects.attachments`; any file migration must preserve existing attachment access. |
| Retain | `appointment_requests` | Appointment request and user appointment APIs; admin appointment APIs; reminder cron; appointment notification helper. | **Current schema requires `order_id` referencing `orders(id)`.** Do not retire orders or alter appointment creation in this slice; first decouple scheduling from commerce and validate the replacement. |
| Retain | `appointment_reminders` | Appointment reminder cron. | Contains appointment and order foreign-key context used to prevent duplicate/repeated reminders; migration follows the appointment/order decoupling. |
| Retain | `appointment_notification_log` | Appointment notification helper used by request/approval flow. | Preserve enough delivery history to diagnose notification failures while appointment support remains. |
| Retain | `email_failures` | Failed-email retry cron; appointment cancellation; existing Stripe webhook and auth flows. | Retain retry semantics and reassess old commerce/auth producers only after their callers are removed. |
| Retain | `google_calendar_tokens` | Google connect, callback, disconnect, status handlers and calendar helper. | Tokens are encrypted and tied to the owner identity. Retain secure revocation and avoid moving secrets into application code. |
| Retain | `blog_posts` | Blog APIs; owner blog pages; public blog, home, and sitemap readers. | Keep database-administered publishing and its public-published/admin-draft authorization split. |
| Retain | `site_reports` | Site analyzer writes; `/report/[id]` reads. | Reports are not currently represented in the owner dashboard. Preserve the analyzer/report path while report-queue access and RLS are addressed separately. |
| Transitional | Supabase Auth users and `profiles` | `/api/admin/users`; account/profile handlers; existing campaign, referral, review, and waitlist systems. | The future client-access view should expose only the identity/access needed for projects and hosted-payment references, not preserve a general CRM. |
| Transitional | `stripe_customers` | Stripe helper, customer-portal endpoint, webhook. | Mapping from app user to Stripe customer remains useful for hosted payment support; only a minimal owner reference is needed. |
| Transitional | `subscriptions` | Subscriptions endpoint, account `SubscriptionSection`, Stripe webhook. | Current rows use Stripe price IDs and product naming. Rework against the repository-owned catalog and hosted subscription checkout. |
| Transitional | `payments` and `payment_attempts` | Stripe webhook, payment helper, and legacy payment recovery. | **Current payment records are order-linked** (`payments.order_id` is an FK and `payment_attempts.order_id` is required). Do not change this relationship in this documentation slice; define a new payment-reference model before removing orders. |
| Transitional | `webhook_events` | Stripe webhook reliability/idempotency support. | Retain event audit/retry behavior until hosted flows use and validate their replacement reconciliation path. |

## Visible navigation inventory

This table covers the 12 destinations rendered by `AdminSidebar`; `Quick link` marks the seven destinations also rendered by `AdminDashboard`. It records each destination once.

| Destination | Sidebar label | Quick link | Classification |
| --- | --- | --- | --- |
| `/dashboard` | Dashboard | — | Retain — project dashboard |
| `/admin/blog` | Blog | Blog | Retain |
| `/admin/content` | Content | Edit Content | Retirement-targeted |
| `/admin/shop` | Shop | Shop | Retirement-targeted |
| `/admin/products/manage` | Products | — | Retirement-targeted |
| `/admin/appointments` | Appointments | Appointments | Retain |
| `/admin/users` | Users | Users | Transitional |
| `/admin/analytics` | Analytics | Analytics | Retirement-targeted |
| `/admin/product-analytics` | Product Analytics | — | Retirement-targeted |
| `/admin/enrollments` | Enrollments | — | Retirement-targeted |
| `/admin/waitlist-campaigns` | Campaigns | — | Retirement-targeted |
| `/admin/dev` | Dev Tools | Dev Tools | Retirement-targeted |

## Retained capabilities at the inventory snapshot

The items below describe the state of the July 25 inventory snapshot. Subsequent delivery is recorded in the [implementation ledger](../PROJECT_STATUS.md), rather than rewriting this evidence document.

1. **Owner report queue — implemented after this snapshot:** `/admin/reports` and `/api/admin/workflow-runs` now provide an authenticated queue over durable `workflow_runs`, with human decisions and no automated outreach. The retained `AdminSidebar` and Project Dashboard link to it.
2. **Slim Stripe-payment reference view:** an owner/client view limited to hosted payment, invoice, subscription, and reconciliation references—not a replacement order-management UI.
3. **Project-focused client-access administration — implemented after this snapshot:** the project detail modal can link a guest project only to an existing same-email account or remove that link. It neither creates accounts nor exposes the user directory; portal, comment, and attachment access remain project-scoped.
4. **GitHub project handoffs — implemented after this snapshot:** the project detail modal records project-scoped GitHub links, emails the linked client, and visibly supports a deliberate retry after notification failure. GitHub repository membership remains outside the application.

## Sequencing and non-goals

1. Build the repository-owned public catalog and hosted Stripe handoffs without changing existing displayed prices in this slice.
2. Validate hosted standard purchases, subscriptions, and custom invoices.
3. Decouple appointment and payment records from `orders` with an explicitly reviewed migration and replacement tests.
4. Narrow account and owner views around projects and hosted-payment references.
5. Remove retirement-targeted route/API/data domains in reversible, separately validated commits.

This inventory does **not** remove or redirect navigation, change route authorization, edit schemas, modify price copy, migrate Stripe records, or disable current payment behavior.

## Validation record

- Enumerated all 33 filesystem `/admin/*` page handlers and classified each once.
- Enumerated all 37 filesystem `/api/admin/*` handlers and classified each once.
- Cross-checked the 12 `AdminSidebar` destinations and seven `AdminDashboard` quick links against the route classifications.
- Cross-checked retained/transitional tables and callers against the current project, appointment, calendar, blog, analyzer, and Stripe source paths.
- Confirmed from migrations that `appointment_requests.order_id` requires an `orders` row and that existing Stripe payment records are order-linked.
- Markdown-reviewed this document; run `git diff --check` before committing.

## Rollback

Revert the documentation-only commit `docs: inventory retained owner dashboard`. No runtime state or external system changes are introduced by this inventory.
