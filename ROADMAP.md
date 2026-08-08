# NeedThisDone Growth Roadmap

## Mission and product definition

NeedThisDone helps businesses get more customers through useful website audits, conversion improvements, and carefully operated follow-up. The internal target is a reliable **$500 per day** business, earned through valuable client outcomes rather than unchecked volume.

The operating model is deliberately human-led: agents prepare research, audits, drafts, and next actions; Supabase holds the durable record; the dashboard presents decisions; and Abe and Andrea approve what happens next. The first version is for Abe and Andrea only. It is not an autonomous sales machine or a general-purpose CRM.

## Final vision in plain English

NeedThisDone is a human-operated AI Growth Employee service. A configured growth profile turns public market evidence into a prospecting queue, while customer projects still create durable operating briefs and decision queues. Abe or Andrea makes the decision before anything external is sent or scheduled.

```text
Configured ICP / customer request
      |
      v
Public discovery -> Evidence-backed prospect/message queues
       |                              |
       +--> Project + AI employee brief -> Daily decision queues
                                      |
                                      v
                         Abe / Andrea approve or edit
                                      |
                                      v
             Manual follow-up -> Outcomes -> Financial scorecard
                                      ^                 |
                                      +---- Learn ------+
```

The two provider boundaries support that loop; they do not become the product's source of truth:

```text
Confirmed consultation -> Google Calendar event + reminders

Chosen paid offer ------> Stripe payment / invoice / subscription
                                  |
                                  v
                    Supabase stores only needed references
```

The rule is simple: agents prepare, humans approve, Supabase records, and provider actions are idempotent and reversible.

## Current state: production, dev, and cloud

These are three different states today. The new product is proven locally on `dev`, but it has not replaced the old production deployment or hosted database.

```text
                         TODAY

 Git production                         Git dev
 origin/production                      local dev / origin/dev
 8b8d429                                caceac5 + docs / eae47ce
 old production product                 new AI Growth Employee product
 rollback/reference only                proven local release candidate
        |                                      |
        | old hosted relationship              | local proof only
        v                                      v
 Approved cloud Supabase project       Local Supabase
 oxhjtmozsdstbokwtnwa                   migrations 001-083
 remote history through 072             fresh reset + RLS/security proof
 old hosted state retained              dev schema/workflows proven
 pending repository migrations: 073-083

                 NO DEV -> CLOUD CUTOVER YET
```

The approved cloud project has not received migrations `073`–`083`, the new application has not been deployed there, and no old hosted data has been deleted. The restricted backup and rollback path remain available.

The intended future state is:

```text
Backup old hosted state
          |
          v
Review/apply 073-083 -> Verify hosted parity -> Deploy proven dev commit
          |                                      |
          v                                      v
 Keep old app rollback path                    New production app
                                               AI Growth Employee loop
```

After cutover, `production` should point to the reviewed `dev` product, while the old deployment and backup exist only for recovery. This is a future state, not the current state.

## Daily operating loop: prospecting first

```text
Configured ICP -> Public discovery -> Evidence -> Draft -> Batch approve -> Approved sender -> Reply/bounce -> Follow up -> Learn
    ^                                                                          |
    +--------------------------------------------------------------------------+
```

The first live channel is email. Contact-form, social, payment, private-system access, and autonomous sending remain outside the first sellable campaign. Three short decision check-ins keep the loop moving:

- **Morning:** configure capacity, review public prospects, and approve research work.
- **Midday:** preview, edit, approve, reject, or defer each personalized message.
- **Evening:** review delivery, replies, bounces, unsubscribes, follow-ups, and outcomes.

Hermes plans tasks, OpenClaw performs public-web research, OpenRouter supplies the configured model route, and Supabase stores the durable record. Codex builds and reviews the software; it is not the unattended business executor.

## Technology architecture

The canonical component responsibility map is [docs/TECH_STACK.md](docs/TECH_STACK.md). The short rule is: **Hermes orchestrates, Codex engineers, OpenClaw executes, OpenRouter routes models, and Supabase remembers.**

| Status | Systems | Role and boundary |
| --- | --- | --- |
| Retained | Next.js on Vercel; Supabase Database, Auth, and RLS; Stripe boundary; Google Calendar boundary; transactional email | The public site and dashboard run on Next.js/Vercel. Supabase is the durable source of truth and controls operator access. Stripe handles approved payment collection; Google Calendar handles confirmed consultation invites and reminders. Both provider boundaries require controlled validation before public claims. |
| Installed agent foundation | Hermes; OpenClaw; Codex; OpenRouter boundary; Supabase pgvector later | Hermes and OpenClaw CLIs are installed locally. Hermes has a separate ChatGPT/Codex OAuth session and passed a harmless read-only Codex-runtime proof. OpenRouter has $10 in purchased credits and a `needthisdone-local` key capped at $1 total, but the key has no usage and is not yet connected to an agent. No agent gateway, daemon, or production adapter is authorized. Supabase remains durable workflow state. |
| Delivery tooling | Codex and GitHub; Playwright and Lighthouse | Codex/GitHub provide reviewed engineering and history. Playwright/Lighthouse provide browser and audit evidence. They do not own production workflow state. |
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
                                                        | agent_tasks / outreach_messages
        +---------------------------+-------------------+-------------------------+
        |                           |                                             |
  Playwright/Lighthouse          OpenRouter                         authenticated adapters
        |                           |                                  |          |
      audits                routed models                         Hermes ---> OpenClaw
                                                                       plan      execute
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

Adapters authenticate every call and verify callbacks. A retry reuses the idempotency key, so it cannot silently create a duplicate external action. Hermes and OpenClaw are part of the intended operating stack, but their unproven adapters are not prerequisites for the first dashboard cutover or manual internal pilot.

## Phased delivery

| Phase | Status | Objective | Prerequisite | Exit condition |
| --- | --- | --- | --- | --- |
| 0. Documentation and tracking | Complete | Establish a canonical roadmap, execution ledger, and `dev` CI baseline. | None. | Roadmap and status responsibilities are clear; `dev` validation is documented. |
| 1. Inventory and retained-product boundary | Complete | Audit the existing system and classify the owner-dashboard, payment, and data surfaces. | Phase 0. | Evidence identifies retained, transitional, and retirement-targeted work. |
| 2. Core safety and workflow foundation | Complete | Fix analyzer and lead-capture risks; define durable, authenticated workflow records and operator-only access. | Phases 0–1. | Security and data-flow tests pass; workflows can be reviewed safely without external automation. |
| 3. Focused operator and client workspace | Complete | Deliver the Supabase-Auth dashboard for Abe and Andrea, project collaboration, report queue, appointments, decision cards, existing-account client access, and GitHub handoffs. | Phase 2. | Operators can run the daily loop from one authenticated workspace; a client can access only projects explicitly linked to their existing exact-email account and can receive project-scoped GitHub handoffs. GitHub repository membership remains managed in GitHub. |
| 4. Hosted payments and service boundary | Deferred behind the first outreach campaign | Decide the first paid pilot offer, then prove one Stripe test-mode path without restoring order commerce. Use a Payment Link for a fixed offer or an invoice for custom work; add subscriptions and Customer Portal only when the managed service has a defined recurring price. | Phase 3 plus owner-approved offer/pricing and a Stripe test key. | One selected payment path redirects or invoices correctly, handles success/failure/refund signals idempotently, stores only minimal Stripe references, and passes a controlled test checkout. |
| 5. Retire legacy systems | **Local contract complete; hosted cleanup approval pending** | Remove Medusa/Railway, product reviews, LMS, editor, old commerce, chatbot/embeddings, changelog, database-blog/media administration, design tools, and obsolete APIs, jobs, tests, providers, docs, tables, views, functions, triggers, policies, and buckets. | Phase 3 plus caller-removal evidence; hosted destructive cleanup remains separately reviewed. | Runtime callers and deployment files are absent; repository-owned blog content and redirects are verified; obsolete screenshot/debug/CMS/LMS/commerce tests and about 80 MB of generated image artifacts are removed; migrations `076`–`078` remove classified local residue with `RESTRICT`; the complete code/database/browser gate passes. Hosted backups, dependency inspection, dry runs, and approvals remain. |
| 6. Operable AI employee boundary and measurement | **Code complete for the manual internal pilot** | Deliver project-to-customer provisioning, operator memberships, employee briefs, timezone-aware capped queues, immutable versioned decisions, auditable completion, operational/financial outcomes, scorecards, and RLS isolation. | Phase 5 and additive migration review. | A real authenticated local browser session provisions a project, authors work, approves it, records manual completion evidence and an outcome, and reloads durable history; owner/manager/viewer/cross-customer rules pass at the database and API boundaries. |
| 7. Prospecting and outreach foundation | **Local code, database, and authenticated browser proof complete** | Configure one growth profile, discover public prospects, retain evidence and suppression, prepare personalized drafts, batch-review messages, lease worker tasks, and record provider events/costs. | Phase 6 local code/database/browser gates. | The three check-ins work from `/prospecting`; no unapproved message can be sent; deterministic discovery and sender boundaries are covered by tests. |
| 8. Real sender and first controlled campaign | **Local send path complete; provider campaign remains** | Select one provider-neutral-compatible sender, prove delivery/bounce/reply/unsubscribe correlation, and run a small approved batch. | Phase 7 plus owner-approved sender configuration. | Real matching prospects receive only Abe/Andrea-approved messages; delivery, replies, suppressions, follow-ups, and spend are durable. |
| 9. Follow-up and outcome learning | Planned | Generate eligible follow-up work from replies and next-action dates, then measure qualification, meetings, customers, and offer fit. | Phase 8. | Operators clear follow-up work without developer intervention and weekly decisions use recorded outcomes. |
| 10. Contact-form fallback and measured scale | Planned | Add contact-form automation only after email safety and performance are proven; expand channels only with separate approval paths. | Phase 9 and explicit channel approval. | Additional channels remain bounded, attributable, and reversible while conversion improves toward the $500/day target. |

Phase 1 evidence: [system audit](docs/audits/2026-07-24-system-audit.md) and [owner-dashboard inventory](docs/audits/2026-07-25-owner-dashboard-inventory.md). Those documents preserve the detailed baseline; this roadmap is the decision and sequencing record.

### Provider readiness: what exists and what is missing

**Stripe exists as a boundary, not as a working payment product yet.** The Stripe SDK is installed and the offering checkout route safely falls back to `/contact`. The current catalog has proposal-based prices and no Payment Links. The old order-centric Stripe routes were retired. The next bounded task is one test-mode payment path, not a full commerce rebuild.

**The local agent CLIs now exist, but automation remains off.** Hermes Agent `0.19.1`, OpenClaw `2026.7.1-2`, Stripe CLI `1.45.0`, Codex CLI `0.145.0`, and supported Node `24.18.1` are installed. Hermes has Chromium, imported NeedThisDone skills, `codex_app_server` selected, a separate ChatGPT/Codex OAuth session, and a passed harmless read-only repository proof. OpenClaw has no onboarding/config/daemon. Stripe has no account login. OpenRouter has $10 in purchased credits and a `needthisdone-local` key capped at $1 total, but no usage or agent connection yet. The local prospecting sender path now has an explicit fake mode and separately keyed Resend adapter; neither activates from the transactional Resend key. The exact owner actions are tracked in [full-stack setup outside the terminal](docs/launch/full-stack-external-setup.md).

**Google APIs exist in two separate forms.** Application sign-in preserves production's branded NextAuth Google redirect, then exchanges Google's signed ID token only after Supabase verifies it and issues the real application/RLS session. `app/lib/google-calendar.ts` remains an optional, separate Calendar OAuth/token adapter with low-level free/busy, create, update, and delete calls. Local encrypted-token and signed/session-bound OAuth-state tests pass, but no live Calendar event has been created or cleaned up by the retained consultation workflow.

The login boundary is intentionally simple:

```text
Google -> branded NextAuth callback -> Supabase ID-token verification -> Supabase RLS session

Password ------------------------------> Supabase password verification -> Supabase RLS session

Calendar OAuth -> optional future calendar connection
```

Google and email/password are both normal, visible sign-in methods. Both finish with a Supabase session before the protected app trusts the user; the email address is the password account's username. Public password self-signup is retired, while password reset remains available for existing accounts. No client-side preview, fake admin, or environment-variable bypass authorizes access; browser proofs use real local Supabase users.

The detailed checklists are [Stripe readiness](docs/launch/hosted-payments-readiness.md) and [Google Calendar readiness](docs/launch/google-calendar-readiness.md).

### Current finish line and next gate

The **code-only internal-pilot finish line is complete** when this repository can prove the following without hosted or provider configuration:

1. An admin opens a submitted project and atomically provisions one customer, operator memberships, one supervised employee, an operating brief, a timezone, and three check-ins.
2. An owner or manager authors an evidence-backed item in a five-slot daily queue; a viewer cannot author or decide.
3. An owner or manager approves, revises, defers, or rejects the item. An approved item can be marked complete only with an authenticated actor, timestamp, idempotency key, and required manual-action evidence.
4. An owner or manager records an idempotent funnel, time, revenue, or cost outcome linked to the employee and optionally to the work item.
5. Activity survives day boundaries, scorecards use the employee timezone, operators can select among multiple customer workspaces, and navigation exposes the workspace.
6. A fresh local schema plus real-session browser proof covers provision → author → approve → complete → measure → reload history.

Migrations `079`–`081` and the authenticated lifecycle gate implement that finish line. Migration `081` requires manual completion evidence at the database boundary. Migration `082` adds the additive prospecting/outreach contract and the authenticated `/prospecting` browser gate. Migration `083` adds the owner-scoped weekly-priority, daily-action, and reflection contract behind the unified `/dashboard` cockpit; its authenticated browser gate proves create → execute/defer → reload → reflect. The local send path now executes only approved records through an explicit fake or separately keyed Resend adapter; local proof does not configure or claim real sender delivery, webhook registration, Stripe checkout, Google Calendar event creation, hosted Supabase parity, deployment, or autonomous agent execution. Those are separate release/provider gates and must not be allowed to expand the internal-pilot code scope.

The reproducible delivery command is `npm run verify:assembly` from `app/`; `npm run verify:assembly:fresh` adds a destructive reset of only the disposable local database. The current local assembly includes migrations `001`–`083`, deterministic prospecting/cockpit unit-RLS checks, and authenticated prospecting, cockpit, and workspace browser proofs. The retained Playwright suite now contains six intentional specs. The exact contract and recorded result are [provider-free final assembly](docs/FINAL_ASSEMBLY.md).

The next product step is to add the deterministic local worker so discovery, drafting, retries, and follow-ups populate the cockpit automatically. After that, select and configure one approved outbound sender, register its signed delivery/reply webhook, and run a small campaign whose messages are approved and sent from the dashboard. The next production-release step is separately governed: review hosted migrations `073`–`083`, prove hosted authentication/RLS behavior, resolve or explicitly accept dependency advisories, then promote the exact reviewed `dev` commit. Stripe and Calendar remain deferred prerequisites only for claims that explicitly depend on them.

Phase 4's repository catalog and guarded hosted-link handoff remain in place, but the catalog is still proposal-based and direct Stripe payment is not claimable. The former documentation referenced Stripe test-link commands that are not present in the current repository; the readiness document now treats test setup as a future, explicitly bounded task. A read-only hosted check on 2026-07-26 confirmed zero `orders` and `payments` rows; `appointment_requests`, `appointment_reminders`, and `payment_attempts` are absent. Phase 5 commerce application-code retirement may therefore proceed without a historical-data migration, provided retained pricing and consultation callers are converted first. Destructive schema cleanup remains a separate reviewed step after all callers are gone.

Phase 6 passed its retained local-database and authenticated lifecycle gates through
migrations `079`–`081` on 2026-08-05 using Docker Desktop and the Supabase CLI. Migration `082`
then added the prospecting/outreach contract, and migration `083` added the daily cockpit contract.
The exact 29-table manifest, customer isolation,
role denial, idempotency, concurrency, queue uniqueness, immutable history, successor creation,
provisioning, completion, outcome recording, financial validation, per-currency daily net,
prospecting suppression, and privileged cleanup checks passed. The authenticated browser gates prove
the complete manual lifecycle and the profile → discovery → draft → approval → sender-event path.
The sanitized seed restores the retained workflow without production identities or customer content.
Migration `072` was previously dry-run, separately approved, and applied to hosted Supabase.
Migrations `073`–`083` remain pending hosted review; the generated destructive diff must never be
applied blindly.

The classified [Supabase drift register](docs/audits/2026-08-01-supabase-drift-register.md)
is the authority for local-replacement confidence and database retirement sequencing. Local
and hosted Supabase must match the retained schema and behavior contract; retired historical
objects are classified and removed through separately reviewed migrations rather than copied
between environments merely to force a zero-line whole-schema diff.

Production application promotion remains paused while hosted parity and release evidence
are completed. The required proof for each retained claim is tracked in [the release
evidence matrix](docs/RELEASE_EVIDENCE.md). Phase 7 and the daily cockpit slice are locally
proven. The next product slice is the deterministic local worker; sender selection and review
of its sending, bounce, reply, unsubscribe, idempotency, and suppression behavior follow that
slice. Hosted promotion still requires the code gate, real
local-RLS gate, retained browser workflows, hosted `072`–`083` behavior/parity checks, and the
production PR review without unexplained warnings or skips.

The final retained hosted contract contains the 29 RLS tables `projects`,
`project_comments`, `project_github_handoffs`, `site_reports`, `user_roles`,
`workflow_runs`, `customer_accounts`, `customer_memberships`, `ai_employees`, the five
`ai_employee_*` tables, `google_calendar_tokens`, `health_check`, `growth_profiles`,
`prospects`, `prospect_sources`, `outreach_messages`, `suppression_records`, `agent_tasks`,
`agent_task_events`, `worker_callback_nonces`, `sender_events`, and `prospect_outcomes`; its
narrow retained RPCs and the private `project-attachments` bucket are part of the same contract. Blog,
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
