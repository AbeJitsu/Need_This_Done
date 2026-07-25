# NeedThisDone System Audit

**Date:** July 24, 2026
**Branch inspected:** `dev`
**Production commit:** `8b8d42966b430b53e991c39891525b0fee9d4c63`
**Local dev commit:** `3e3bf9d32e0b4f617b0cf6acd6c7856a8b5291f4`
**Status:** Evidence and recommendations only. No production code, remote branch, database, or deployment was changed by this audit.

## Why this document exists

NeedThisDone has accumulated several different products inside one application: an agency website, ecommerce platform, LMS, page builder, content system, workflow automation system, and owner dashboard. This audit records what exists before anything else is removed.

The intended end state is much narrower:

> Help businesses generate more customers through AI-powered automation, website improvements, and conversion optimization.

The website should be the first customer and living proof of that system, not a demonstration of every possible software feature.

## Executive conclusion

The public marketing foundation is strong. The home, services, work, about, contact, FAQ, blog, and site-analyzer experiences give us a credible base. The primary problem is architectural and strategic breadth rather than a lack of features.

The safest direction is:

1. Protect and correct the lead-generation core.
2. Remove unused LMS and page-builder code.
3. replace the Medusa-driven catalog with a simple service presentation and lead/quote flow.
4. Remove commerce pages, APIs, providers, jobs, schema, and Railway only after their callers are gone.
5. Remove dark-mode support from the smaller retained surface.
6. Simplify owner administration, documentation, tests, and global providers around the new mission.

Production should remain untouched until each removal slice passes build, tests, route checks, and visual comparison on `dev`.

## How the audit was performed

- Inspected local and remote branch identities before auditing.
- Generated a static inventory of pages, APIs, components, dependencies, migrations, environment variables, and external-service references.
- Built a static import/reachability graph to identify components that appear disconnected from runtime entry points.
- Visited production and local routes with Playwright at desktop and mobile sizes.
- Automatically followed internal links to discover dynamic blog and product routes.
- Captured full-page screenshots and accessibility results.
- Blocked browser requests using mutating HTTP methods during the audit.
- Used the development-only admin bypass locally.
- Did not submit forms, apply migrations, push commits, or change production.

The machine-readable inventory, browser results, and screenshots are under `app/test-results/system-audit/`. They are intentionally ignored by Git. They are supporting evidence; this document is the durable, reviewable record.

## Baseline and branch safety

- GitHub's default branch is `production`.
- Local and remote `production` matched at the start of the audit.
- Local `dev` is one commit ahead of remote `dev`; that commit removes the unused BullMQ workflow implementation.
- The BullMQ cleanup has not been pushed.
- Migration `066` has not been applied.
- The local `origin/HEAD` symbolic reference still points at the deleted `main` branch and should be corrected.
- Only `production` and `dev` are intended to remain as long-lived branches.

The production baseline was inspected, not modified.

## Repository inventory

| Area | Count | Interpretation |
| --- | ---: | --- |
| Next.js page files | 64 | Public, authenticated, owner-admin, and dynamic experiences |
| API route files | 119 | A very large backend surface for the current business goal |
| Component source files | 203 | 173 statically reachable; 30 appear unreachable |
| Runtime dependencies | 42 | Includes commerce, editing, auth, AI, email, and data stacks |
| Development dependencies | 31 | Testing, linting, browser automation, and build tooling |
| E2E test files | 68 | Many protect features now considered removable |
| Unit test files | 28 | Useful foundation, but scope follows the old product |
| Supabase migrations | 62 | Multiple product domains share one database history |
| Medusa files | 46 | Includes a separately deployable backend |
| Environment variables referenced | 55 | High operational surface area |

Approximate feature weight:

- Medusa backend source: 3,382 lines.
- Inline/page editing source: 6,451 lines.
- LMS core source and schema: 1,542 lines.
- Dark-mode variants: 1,447 occurrences across 99 files.
- Commerce-related APIs: about 55 routes.

These counts are directional. They show where the maintenance burden lives; they are not deletion instructions by themselves.

## Route inventory

### Core public and lead-generation routes

`/`, `/about`, `/services`, `/work`, `/contact`, `/faq`, `/blog`, `/blog/[slug]`, `/site-analyzer`, `/report/[id]`, `/privacy`, `/terms`, `/ada-compliance`, `/resume`

These are closest to the new mission. The resume page may still be strategically optional, but it is not an architectural burden comparable to commerce or the editor.

### Commerce and customer-account routes

`/pricing`, `/pricing/success`, `/shop`, `/product/[handle]`, `/cart`, `/checkout`, `/orders`, `/order/[id]`, `/wishlist`, `/recently-viewed`, `/account`, `/login`, `/dashboard`, `/quote`

Some of these routes contain useful presentation or lead-flow ideas, but together they implement an ecommerce product. The current pricing page fetches products from Medusa and uses add-to-cart behavior. That dependency must be replaced before Medusa is removed.

### Owner/admin routes

`/admin/analytics`, `/admin/appointments`, `/admin/automation`, `/admin/blog`, `/admin/blog/new`, `/admin/colors`, `/admin/communication`, `/admin/content`, `/admin/dev`, `/admin/dev/preview`, `/admin/enrollments`, `/admin/loyalty`, `/admin/orders`, `/admin/product-analytics`, `/admin/products`, `/admin/products/categories`, `/admin/products/manage`, `/admin/quotes`, `/admin/referrals`, `/admin/reviews`, `/admin/reviews/analytics`, `/admin/settings`, `/admin/shop`, `/admin/shop/inventory`, `/admin/shop/orders`, `/admin/shop/products/new`, `/admin/users`, `/admin/waitlist-analytics`, `/admin/waitlist-campaigns`, `/admin/waitlist-campaigns/new`

This admin surface clearly reflects the old “all-in-one commerce platform” strategy. A future owner dashboard should retain only functions that support leads, audits, projects, appointments, content, and measurable outcomes.

### Stale, redirected, or inconsistent routes

`/build`, `/build/success`, `/changelog`, `/get-started`, `/guide`, and `/how-it-works` have combinations of old page files, missing production pages, or current development redirects. Production also exposed two stale blog links whose slugs no longer resolve.

The sitemap includes `/shop`, `/resume`, and redirected `/build`, but omits the strategically important `/site-analyzer`. Route cleanup must include navigation, sitemap, robots, metadata, internal links, and redirects together.

## API and data inventory by domain

The 119 API routes group into these responsibilities:

- Products, categories, inventory, carts, checkout, orders, Stripe, Medusa, wishlist, comparisons, browsing history, loyalty, referrals, waitlists, reviews, and abandoned-cart recovery.
- Authentication, users, roles, account data, and admin access.
- Projects, quotes, appointments, communication, notifications, and email retries.
- Blog posts, content editing, changelog, embeddings, search, and page indexing.
- Site analysis and report retrieval.
- LMS courses, enrollments, lessons, progress, quizzes, and certificates.
- Analytics, health checks, development tools, and scheduled jobs.

Static service references in API routes:

| Service | API-route references | Current role |
| --- | ---: | --- |
| Supabase | 97 | Database, auth-adjacent data, storage, and reporting |
| Medusa | 33 | Product catalog, carts, orders, and ecommerce |
| Stripe | 12 | Checkout and payment flows |
| Google services | 10 | Calendar/auth-related integrations |
| NextAuth | 7 | Customer and admin authentication |
| Redis/Upstash | 7 | Rate limiting, caching, and deduplication |
| Resend | 4 | Transactional email |
| OpenAI | 3 | Site analysis and AI-assisted functionality |
| GraphQL | 1 | Limited use; package may be removable after verification |

Five root Vercel cron jobs currently support abandoned carts, changelog generation, appointment reminders, failed-email retries, and waitlist notifications. `app/vercel.json` defines a different two-job set, so deployment configuration has drifted.

## Deployment map

### Vercel

Hosts the Next.js application and scheduled routes. This remains appropriate for the simplified site.

### Supabase

Used by most backend domains. Keep it initially, then remove tables and policies only after their code paths are deleted and data-retention decisions are documented.

### Medusa on Railway

Implements a separately deployed ecommerce backend. It is operational but does not add enough value to the new direction to justify its deployment and maintenance cost. It is a removal target, but only after pricing and quote presentation stop depending on its product handles and catalog.

### Stripe

Globally loaded through the root provider stack, causing Stripe telemetry even on pages that do not sell anything. Keep only if a deliberately retained payment workflow needs it. Otherwise remove it after commerce callers are gone.

### Redis/Upstash

This is a managed service, not another Railway-style backend. It currently provides rate limiting and deduplication. The site analyzer uses it but fails open when unavailable. Keep temporarily while the analyzer is hardened, then evaluate whether the retained traffic and workflows justify it.

### OpenAI and Resend

Both directly support the intended audit/lead workflow. They are keep candidates, with clear failure handling, cost controls, and observability.

## Browser audit findings

### Production

- Audited 71 distinct routes at desktop and mobile sizes: 142 captures.
- 128 captures returned 200, 2 returned 307, and 12 returned 404.
- No broken images or navigation failures were observed.
- `/shop` redirected to `/pricing`; `/checkout` landed on `/cart`; `/wishlist` landed on `/login`.
- Missing routes included `/build`, `/build/success`, `/changelog`, `/get-started`, and two stale blog slugs.
- Mobile pages consistently measured two pixels wider than the viewport.
- The homepage and blog produced real React hydration errors.
- Most console noise came from the audit intentionally blocking Stripe telemetry and embedding-index writes; that noise is separate from real rendering errors.
- Accessibility scans found widespread color-contrast failures, focusability problems in scrollable regions, and smaller heading/landmark issues.

Visual review found a polished and responsive marketing site. It also showed a crowded global experience: pricing, free audit, contact, wishlist, cart, sign-in, chatbot, wizard, and editing/indexing infrastructure compete for attention.

### Local development

- Audited 83 distinct routes at desktop and mobile sizes: 166 captures.
- Core static pages and admin pages were reachable using the local bypass.
- No broken images or browser navigation failures were recorded.
- Six captures showed horizontal overflow rather than the production-wide mobile overflow.
- `/admin/automation` redirected to `/admin`, confirming the BullMQ-facing page is no longer active.
- The latter dynamic-blog portion hit a corrupted/stale Next.js development cache (`@vercel` vendor chunk missing), producing repeated 500 pages. This was a local runner/server artifact, not evidence that production blog posts are failing: the same production posts loaded successfully. A clean `.next` rebuild should be used for the next implementation baseline.

The local admin screenshots contain test/demo records, not customer information. Screenshots remain ignored and will not be committed.

## Important functional findings

### The site analyzer is real and mission-aligned

The analyzer validates input, rate-limits requests, fetches and parses a site, calls OpenAI, stores a report, and sends email through Resend. It evaluates HTTPS, metadata, social tags, heading structure, content depth, calls to action, page coverage, readability, and accessibility signals.

It does **not** perform a real performance or load-speed measurement, even though public copy promises performance analysis. Either add a real measurement later or correct the promise now.

Two security issues should be handled before expanding this feature:

1. URL validation accepts internal/private network targets, creating a server-side request forgery risk.
2. The `site_reports` row-level policy allows anonymous selection of all rows, which conflicts with the idea that an unguessable report UUID protects access.

### The contact form loses consultation details

The interface collects consultation type, preferred time, and alternate time. The projects API does not extract or store those values. The polished interface therefore promises information capture that the backend discards.

### Global providers are doing too much

The root layout mounts session, auth, cart, wishlist, comparison, browsing history, Stripe, service-modal, toast, inline-editing, wizard, chatbot, and page-indexing functionality. This increases hydration risk, network activity, debugging noise, and cognitive load on every page.

### Existing documentation describes the wrong business

The README and roadmap still present NeedThisDone as a Shopify Plus competitor with Medusa, ecommerce, loyalty, referrals, waitlists, LMS, inline editing, and a workflow builder. The roadmap's goal conflicts directly with the new mission.

### CI protects a deleted branch

The primary variant workflow runs for `main`, which no longer exists. It does not protect `dev` or `production`. This should be fixed before high-volume deletion work starts.

## Static reachability findings

Thirty component files appear unreachable from runtime entry points. The most strategically relevant group is the entire LMS interface:

- `Certificate`
- `CourseCard`
- `EnrollButton`
- `LessonPlayer`
- `ProgressBar`
- `QuizBlock`

Other unreachable files include commerce and miscellaneous UI components. Static reachability is evidence, not proof: dynamic imports, string references, tests, and framework conventions must be checked before deletion.

Three packages appeared unused in the static graph and should be verified before removal:

- `@tailwindcss/typography`
- `@tiptap/pm`
- `graphql`

## Keep, simplify, remove

| Decision | Scope | Why |
| --- | --- | --- |
| Keep and strengthen | Home, services, work, about, contact, FAQ, blog, site analyzer, reports, legal pages | Directly supports trust, leads, audits, and proof |
| Keep temporarily | Supabase, Redis, OpenAI, Resend, selected appointment/project data | Supports the retained core while simplification proceeds |
| Simplify | Pricing, quotes, appointments, owner dashboard, blog management, global navigation | Useful outcomes are buried inside oversized product systems |
| Remove after decoupling | Medusa, Railway, commerce pages/APIs/providers/jobs/schema, customer ecommerce accounts | High maintenance cost and no longer the product |
| Remove | LMS and enrollment system | Dead/unreachable interface and unrelated to the mission |
| Remove | Inline editor and visual/page-builder system | Large maintenance surface and explicitly outside the mission |
| Remove from retained UI | Dark mode and theme controls | Never worked reliably and is not worth carrying forward |
| Reassess | Stripe, NextAuth/customer accounts, Redis, rich blog CMS | Keep only if a retained workflow provides measurable value |

## Safe simplification sequence

### Phase 0: Make the workspace trustworthy

1. Update CI to run against `dev` and pull requests targeting `production`.
2. Correct stale Git references and branch documentation.
3. Establish a clean `.next` baseline and run build, unit tests, and a small critical-route Playwright suite.
4. Do not apply the BullMQ table-drop migration until its table contents and retention needs are separately verified.

### Phase 1: Protect the core

1. Block private/internal analyzer targets and harden URL fetching.
2. correct `site_reports` access policy.
3. Make analyzer claims match actual measurements.
4. Store the consultation fields already collected by the contact interface.
5. Define the core funnel: visitor → useful audit/contact → qualified lead → project.

### Phase 2: Remove clearly disconnected products

1. Remove LMS routes, APIs, components, tests, and schema in one reviewable slice.
2. Remove inline editing, content-editor/page-builder UI, development previews, and their global providers in a separate slice.
3. Preserve migrations as historical records unless a deliberate schema-cleanup migration is approved.

### Phase 3: Decouple and remove ecommerce

1. Replace Medusa-backed pricing with a small static or Supabase-backed service catalog.
2. Change purchase/cart actions into consultation, audit, or quote actions.
3. Remove customer commerce pages and navigation.
4. Remove commerce APIs, providers, admin pages, cron jobs, and tests.
5. Remove Stripe if no retained payment workflow needs it.
6. Remove Medusa/Railway last, after repository and runtime searches prove there are no callers.
7. Archive or export any data that has business value before dropping tables.

### Phase 4: Simplify the retained experience

1. Remove dark-mode controls and `dark:` styles from retained code.
2. Reduce the root provider stack and global widgets.
3. Consolidate navigation around one primary call to action.
4. Fix hydration, mobile overflow, contrast, focusability, headings, and landmarks.
5. Correct sitemap, robots, redirects, metadata, and stale links.

### Phase 5: Make future AI work cumulative

1. Replace the README and roadmap with the new mission, architecture, workflows, and branch policy.
2. Record architecture decisions in short ADRs.
3. Keep a machine-readable route/service inventory that CI can regenerate.
4. Turn the audit runner into a smaller repeatable smoke suite.
5. Require every removal slice to document what changed, why it is safe, how it was tested, and how to revert it.

## Applying the Seven Habits

1. **Be proactive:** turn the existing analyzer and outreach workflow into an opportunity-creation system.
2. **Begin with the end in mind:** measure leads and business outcomes, not feature count.
3. **Put first things first:** secure the core, then delete the largest unrelated systems.
4. **Think win-win:** preserve useful public guidance and produce genuinely valuable audits rather than generic outreach.
5. **Seek first to understand:** this inventory and visual audit become the baseline before deletion.
6. **Synergize:** keep architecture, documentation, and tests legible enough for specialized AI agents to collaborate.
7. **Sharpen the saw:** convert this audit into repeatable checks and record each future decision.

## Definition of safe removal

A feature is safe to remove only when:

- Its routes, imports, navigation links, environment variables, scheduled jobs, and external callers are identified.
- Retained workflows no longer depend on it.
- Relevant data is classified as disposable, retained, or exported.
- The change is small enough to review and revert.
- Static checks, build, tests, and critical desktop/mobile routes pass.
- Production remains unchanged until the `dev` result is reviewed and explicitly approved.

## Decisions still requiring approval

/

No answer to these questions is required to begin Phase 0 and the security/correctness portion of Phase 1.
