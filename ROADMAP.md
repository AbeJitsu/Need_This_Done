# NeedThisDone Growth Roadmap

## Mission and product definition

NeedThisDone helps businesses get more customers through useful website audits, conversion improvements, and carefully operated follow-up. The internal target is a reliable **$500 per day** business, earned through valuable client outcomes rather than unchecked volume.

The operating model is deliberately human-led: agents prepare research, audits, drafts, and next actions; Supabase holds the durable record; the dashboard presents decisions; and Abe and Andrea approve what happens next. The first version is for Abe and Andrea only. It is not an autonomous sales machine or a general-purpose CRM.

## Daily operating loop

```text
Discover -> Audit -> Draft -> Approve -> Manually send -> Track -> Follow up -> Learn
    ^                                                                          |
    +--------------------------------------------------------------------------+
```

Three short decision check-ins keep the loop moving without making outreach automatic:

- **Morning (15–20 minutes):** review new prospects, audits, and priorities.
- **Midday (15–20 minutes):** approve, revise, defer, or reject prepared drafts.
- **End of day (15–20 minutes):** record replies and outcomes, choose follow-ups, and capture what should improve tomorrow.

## Technology architecture

| Status | Systems | Role and boundary |
| --- | --- | --- |
| Retained | Next.js on Vercel; Supabase Database, Auth, and RLS; Stripe; transactional email | The public site and dashboard run on Next.js/Vercel. Supabase is the durable source of truth and controls operator access. Stripe hosts payments; email delivers approved communication. |
| Planned | Operator dashboard; durable `workflow_runs`; OpenClaw and Hermes adapters; OpenRouter; Playwright/Lighthouse; Codex and GitHub | The dashboard turns work into decisions. Agents use OpenRouter and audit tools to prepare work. OpenClaw and Hermes are optional execution capabilities behind authenticated adapters. Codex/GitHub provide reviewed delivery and history. |
| Retired runtime | Medusa/Railway commerce deployment; product reviews; LMS; inline editor/page builder; old commerce, growth-tool, and developer-tool surfaces | Runtime callers and deployable services are removed. Historical migrations remain untouched pending any separately reviewed cleanup. |

```text
                         Codex <----> GitHub
                           |              |
                           +------ reviewed delivery

Prospects / public site --> Next.js on Vercel <--> Operator dashboard
                                |                        |
                                v                        v
                      Supabase: Auth + RLS + durable truth
                                |                        |
              +-----------------+------------------------+----------------+
              |                 |                        |                |
            Stripe       Transactional email       workflow_runs     Decision cards
                                                        |
        +---------------------------+-------------------+-------------------------+
        |                           |                                             |
  Playwright/Lighthouse          OpenRouter                         authenticated adapters
        |                           |                                  |          |
      audits                     agents                            OpenClaw    Hermes
```

Each workflow crosses a controlled boundary:

```text
Dashboard decision card
        |
        v
Supabase workflow_runs (state, owner, audit trail, idempotency key)
        |
        v
Authenticated adapter call ----> OpenClaw / Hermes / approved service
        |                                      |
        +<--------- signed or verified callback+
        |
        v
Idempotent state update -> refreshed decision card -> human decision
```

Adapters authenticate every call and verify callbacks. A retry reuses the idempotency key, so it cannot silently create a duplicate external action. No adapter is a prerequisite for the dashboard or daily loop.

## Phased delivery

| Phase | Status | Objective | Prerequisite | Exit condition |
| --- | --- | --- | --- | --- |
| 0. Documentation and tracking | Complete | Establish a canonical roadmap, execution ledger, and `dev` CI baseline. | None. | Roadmap and status responsibilities are clear; `dev` validation is documented. |
| 1. Inventory and retained-product boundary | Complete | Audit the existing system and classify the owner-dashboard, payment, and data surfaces. | Phase 0. | Evidence identifies retained, transitional, and retirement-targeted work. |
| 2. Core safety and workflow foundation | Complete | Fix analyzer and lead-capture risks; define durable, authenticated workflow records and operator-only access. | Phases 0–1. | Security and data-flow tests pass; workflows can be reviewed safely without external automation. |
| 3. Focused operator and client workspace | Complete | Deliver the Supabase-Auth dashboard for Abe and Andrea, project collaboration, report queue, appointments, decision cards, existing-account client access, and GitHub handoffs. | Phase 2. | Operators can run the daily loop from one authenticated workspace; a client can access only projects explicitly linked to their existing exact-email account and can receive project-scoped GitHub handoffs. GitHub repository membership remains managed in GitHub. |
| 4. Hosted payments and service boundary | Deferred external validation | Replace custom commerce checkout with repository-owned offerings and Stripe Payment Links, invoices, subscriptions, and Customer Portal. | Phase 3. | Hosted payment paths reconcile reliably and no retained workflow depends on order-centric checkout. |
| 5. Retire legacy systems | **Local contract complete; hosted cleanup approval pending** | Remove Medusa/Railway, product reviews, LMS, editor, old commerce, chatbot/embeddings, changelog, database-blog/media administration, design tools, and obsolete APIs, jobs, tests, providers, docs, tables, views, functions, triggers, policies, and buckets. | Phase 3 plus caller-removal evidence; hosted destructive cleanup remains separately reviewed. | Runtime callers and deployment files are absent; repository-owned blog content and redirects are verified; migrations `076`–`078` remove classified local residue with `RESTRICT`; the complete code/database/browser gate passes. Hosted backups, dependency inspection, dry runs, and approvals remain. |
| 6. AI employee customer boundary and measurement | **Local retained contract complete; hosted behavior verification pending** | Deliver durable customer membership, employee roles, day-specific capped queues, immutable versioned decisions, operational outcomes, financial revenue/cost outcomes, daily net scorecards, schedules, and RLS isolation. | Phase 5 and additive migration review. | The workspace reads durable records, owner/manager decisions update atomically, viewers are denied, exact retries are idempotent, financial amounts are positive integer cents with ISO currencies and cost categories, and authenticated cross-customer tests pass before hosted migration deployment. |
| 7. NeedThisDone internal pilot | Planned — production promotion paused | Provision NeedThisDone as the first customer and operate the three daily check-ins against real audit and follow-up work. | Phase 6 deployed and verified. | Each queue is routinely cleared in 15–20 minutes and decisions, manual sends, replies, outcomes, and next actions are recorded. |
| 8. Prospect and audit intelligence | Planned | Turn approved discovery and Playwright/Lighthouse audits into prioritized, evidence-backed opportunities. | Phase 7. | New opportunities and audit findings are durable, reviewable, and attributable to a workflow run. |
| 9. Approval-based outreach operations | Planned | Prepare follow-up drafts and tracking through adapters while keeping Abe and Andrea in the approval and sending loop. | Phase 8 and a ready adapter. | Every outreach action has an approver, a durable history, and an idempotent outcome; sending remains manual unless explicitly changed. |
| 10. Learning and measured scale | Planned | Improve conversion, follow-up quality, and offer mix toward the $500/day target. | Phase 9. | Outcome data informs weekly decisions without expanding the system beyond verified, human-controlled workflows. |

Phase 1 evidence: [system audit](docs/audits/2026-07-24-system-audit.md) and [owner-dashboard inventory](docs/audits/2026-07-25-owner-dashboard-inventory.md). Those documents preserve the detailed baseline; this roadmap is the decision and sequencing record.

### Current finish line and next gate

The current finish line is a reproducible local retained database and human-led workspace that measures progress toward net $500/day without autonomous outreach. Local migrations `001`–`078` now rebuild exactly the 16 retained public tables, including the private project-attachment bucket and encrypted Calendar token contract. The sanitized reset fixture proves intake → audit → approved work item → outcome → daily scorecard; the workspace reports gross revenue, categorized costs, net revenue, funnel movement, operator minutes, and per-currency progress toward the goal.

The next gate is hosted retained-contract parity, not production replacement. It requires restricted schema/data backups with checksums, Calendar secret provisioning, an approved maintenance window, hosted verification of `073` and `074`, separate dry runs and approvals for destructive `076`–`078`, authenticated anonymous/role/cross-customer checks, removal of temporary fixtures, and a final local/hosted parity review. Only then may the `dev` → `production` review and merge proceed.

Phase 4's repository catalog, guarded hosted-link handoff, and test-link tooling remain in place, but Stripe test creation and end-to-end validation are unfinished and owner-deferred. A read-only hosted check on 2026-07-26 confirmed zero `orders` and `payments` rows; `appointment_requests`, `appointment_reminders`, and `payment_attempts` are absent. Phase 5 commerce application-code retirement may therefore proceed without a historical-data migration or Stripe validation, provided retained pricing and consultation callers are converted first. Destructive schema cleanup remains a separate reviewed step after all callers are gone.

Phase 6 passed its disposable local-database gate on 2026-08-01 using Docker Desktop
and the Supabase CLI. Fresh migration reset through `078`, database lint, exact 16-table
manifest, customer isolation, role denial, idempotency, concurrency, queue uniqueness,
immutable history, successor creation, financial validation, per-currency daily net,
and privileged cleanup checks passed. The sanitized seed restores the retained workflow
without production identities or customer content. Migration `072` was previously
dry-run, separately approved, and applied to hosted Supabase. Migrations `073`–`078`
remain pending hosted review; the generated destructive diff must never be applied blindly.

The classified [Supabase drift register](docs/audits/2026-08-01-supabase-drift-register.md)
is the authority for local-replacement confidence and database retirement sequencing. Local
and hosted Supabase must match the retained schema and behavior contract; retired historical
objects are classified and removed through separately reviewed migrations rather than copied
between environments merely to force a zero-line whole-schema diff.

Production application promotion remains paused while hosted parity and release evidence
are completed. The required proof for each retained claim is tracked in [the release
evidence matrix](docs/RELEASE_EVIDENCE.md). Phase 7 starts with a controlled internal
pilot only after the code gate, real local-RLS gate, retained browser workflows, hosted
`072`–`078` behavior/parity checks, and the production PR review all pass without
unexplained warnings or skips.

The final retained hosted contract contains the 16 RLS tables `projects`,
`project_comments`, `project_github_handoffs`, `site_reports`, `user_roles`,
`workflow_runs`, `customer_accounts`, `customer_memberships`, `ai_employees`, the five
`ai_employee_*` tables, `google_calendar_tokens`, and `health_check`; its narrow retained
RPCs and the private `project-attachments` bucket are part of the same contract. Blog,
chat, embeddings, changelog, media, marketplace, and commerce schema are not retained.

Consultations remain intentionally small: intake records a requested type and preferred
times on the project; Abe or Andrea confirms the appointment; Google Calendar owns the
invite and reminders. The product will not restore the retired order-linked appointment
tables, custom reminder engine, or separate appointment administration system.

## Operating rules

- Work on `dev`; merge to `production` only after review, validation, and explicit approval.
- Keep one focused, reversible change per commit; record its validation and rollback in [the implementation ledger](docs/PROJECT_STATUS.md).
- Do not apply destructive schema work until application callers are removed and the migration has separate review.
- Keep human approval for outreach. Initial outreach is manually sent by Abe or Andrea.
- Never place browser-accessible secrets in the application. Keep credentials server-side and minimize each integration's authority.
- Treat Supabase as durable memory: workflow state, decisions, outcomes, and idempotency records belong there rather than in agent context or external-tool history.
- Do not depend on OpenClaw, Hermes, or another external automation system until its authenticated, callback-verified adapter is ready.
- Apply a no-broken-windows policy: do not introduce, ignore, or normalize failing checks, warnings, dead routes, stale documentation, broken UI, or unresolved TODOs. Fix the defect in the current slice or record a narrow, owner-approved exception with a removal date in the implementation ledger; production cannot advance with an open exception.
