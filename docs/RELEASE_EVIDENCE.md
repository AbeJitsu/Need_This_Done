# Release Evidence

This matrix defines what NeedThisDone may claim and the proof required before production promotion. A passing mock proves application branching, not database security or a third-party service.

| Product claim | Required proof | Current evidence | Release status |
| --- | --- | --- | --- |
| Customers cannot read or change another customer's AI employee data. | Fresh local Supabase reset plus authenticated owner, manager, viewer, anonymous, and cross-customer database/browser tests. | Local reset through `078`, database isolation suite passed, and the production-mode browser contract proved anonymous `401`, authenticated owner/manager access, viewer denial, and cross-customer denial with the bypass explicitly false. | Proven locally; hosted denial verification still required. |
| Decisions are capped, immutable, idempotent, and safe under concurrency. | Real database tests for five queue slots, exact/conflicting retries, concurrent decisions, history, successors, and cleanup. | Focused local suite passed after a fresh reset. | Proven locally. |
| Only owners and managers decide; viewers are read-only. | Real role-based database tests and authenticated browser/API tests without the development bypass. | Local role tests passed; production-mode browser contract passed 3/3 with real Supabase sessions: owner/manager decision `201`, viewer decision `403`, and cross-customer decision `403`. A unit boundary test also proves the production server ignores `NEXT_PUBLIC_E2E_ADMIN_BYPASS`. | Proven locally; hosted denial verification still required. |
| A consultation request is stored and visible to an operator. | Request parsing plus real database/API integration and browser workflow from contact form to project detail. | Parser, calendar-slot, and real local API/database/operator-route tests pass. | Proven through the local API/database boundary; browser proof remains. |
| Confirmed consultations create one calendar invite and use Google for reminders. | Deterministic adapter contract tests, idempotent retry test, and one controlled pre-release Google Calendar check. | OAuth tokens now have a locally proven encrypted storage path, but confirmation and event idempotency are not implemented. The UI explicitly says event creation is disabled. | Not yet claimable. |
| Clients see only explicitly linked projects, files, comments, reports, and handoffs. | Real Supabase isolation tests plus authenticated client/operator browser workflows. | Route behavior is mainly mock-tested. | Database/browser proof missing. |
| Hosted payment handoff works. | Test-mode Stripe contract and checkout smoke test for every enabled offering. | Fallback path is tested; hosted test links are owner-deferred. | Claim only the project-request fallback. |
| Transactional email succeeds or exposes a retryable failure. | Provider contract tests, durable failure records/replay tests, and one controlled pre-release delivery check. | Immediate provider retry exists, but durable failure replay was removed because its table and faithful message replay did not exist. | Live delivery and durable recovery are not yet claimable. |
| Retained public and workspace routes work on desktop and mobile. | Playwright smoke tests with no console errors, overflow, accessibility violations, or unexplained skips. | Sanitized report fixture enabled all 8 core smoke checks; the separate production-mode authenticated contract passed 3/3 role/isolation checks without bypass. | Proven locally; hosted behavior remains separate. |
| Public blog content does not depend on hosted content tables or APIs. | Versioned content count/checksum, route retirement guard, metadata/rendering tests, redirects, and sitemap verification. | All 27 published hosted rows were exported before removal; nine versioned posts and three redirect classes are guarded locally. | Focused local guard passed; full code/build and browser gates pending. |
| The code is safe to promote. | Lint, TypeScript, unit tests, accessibility tests, production build, retirement guards, database gate when applicable, and `git diff --check`. | The deterministic code gate passes with zero skips: 162 required unit tests and 48 accessibility tests, plus lint, TypeScript, build, and diff checks. After a fresh reset through `078`, the database gate passes 30/30 checks including the exact retained-schema manifest and financial isolation. | Local gates proven; hosted behavior and deployment approval remain separate. |

## Release gates

1. `npm run verify:code` is the deterministic required code gate for every change. It excludes suites that require live Supabase, Redis, or the public internet; those have explicit commands and cannot count as passing unless actually run.
2. Database changes additionally require `supabase db reset --local`, `supabase db lint --local`, and `npm run verify:database`.
3. Security claims require authenticated tests against Supabase. Development bypasses may test layout, but never prove authorization.
4. External services require deterministic contract tests and a controlled pre-release check. Tests must not print production credentials or create unapproved customer data.
5. A warning or skipped required check is a failed release unless its owner, reason, scope, and removal date are recorded in `docs/PROJECT_STATUS.md`.
6. No generated local/hosted schema diff may be applied without classifying every statement against the retained product boundary.

The retained-schema manifest is mandatory within `npm run verify:database`. It asserts 16 retained
RLS tables, critical columns, isolation policies, decision and cascade constraints, exact RPC grants,
and the private project-attachment bucket against a real local PostgreSQL catalog. `health_check`
replaces the retired `blog_posts` table in that final manifest.
