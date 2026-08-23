# NeedThisDone

NeedThisDone has two equal, human-led service paths:

- **Website Fix** — a $500 evidence-based audit and one agreed contained fix, invoiced manually as $250 to begin and $250 on delivery.
- **Managed Automation** — a proposal-based 30-day pilot operated privately by Abe and Andrea, with four weekly client briefs.

The finish line is business proof, not a redesign: one paid, delivered engagement from each offer. The software supports the work but does not replace human scope, judgment, approval, or client communication.

## The three living documents

These are the current decision sources:

- [README](README.md): product boundary, architecture, and local workflow.
- [Roadmap](ROADMAP.md): the next work and the paid-proof finish line.
- [Release evidence](docs/RELEASE_EVIDENCE.md): what is verified, pending, or not claimable.
- [Launch checklist](docs/launch/LAUNCH_CHECKLIST.md): the canonical numbered cloud-promotion and production-release control record.

Historical audits, launch notes, `docs/TECH_STACK.md`, and `docs/PROJECT_STATUS.md` remain supporting evidence or an execution ledger. They are not competing product plans.

## Public experience

The public navigation is **Website Fix · Managed Automation · How It Works · How We Work**, followed by **Choose a starting point**. The canonical offer pages are `/website-fix` and `/managed-automation`; `/services` remains a short chooser and keeps its legacy offer anchors for inbound links.

`/site-analyzer → /report/[id] → /contact?offer=website-fix` is the Website Fix path. The analyzer is a limited website snapshot of selected signals, and the report is not a score, compliance verdict, or accessibility certification. `/contact` requires a visitor who arrives without an offer query to choose one before it stores the selected offer and tailored context through the existing project-request flow.

`/work` is the compact proof destination. `/about` and `/resume` permanently redirect there; `/guide` redirects to `/faq`; and `/build` redirects to the Website Fix intake. The sitemap contains only maintained public pages and the curated Insights posts.

## Private operator boundary

`/dashboard`, `/employee`, `/prospecting`, and `/admin/*` are private operational surfaces. Clients do not operate the dashboard. The operator may prepare research, drafts, and internal queues, but a human must approve every external message, publication, system change, or spend.

Only an authenticated admin/operator may use private workspace APIs. Historical
project links, customer memberships, files, comments, handoffs, and delivery
records remain stored for continuity and audit, but they do not grant client or
ordinary authenticated access. Unauthenticated private requests fail with
`401`; authenticated non-admin requests fail with `403` without private data.
The historical client project list and project access-management endpoints are
retired.

Production outreach additionally requires the scoped worker boundary, public-evidence sourcing, suppression/unsubscribe handling, verified sender events, and a human-approved send. The app-side planner is draft-only; the signed Mac-mini bridge can execute only an approved frozen plan through loopback OpenClaw. No public route reaches the Mac mini worker.

## Architecture

```text
Human -> Next.js planner -> approval -> Vercel task queue
                                      |
                              signed Mac-mini bridge
                                      |
                              loopback OpenClaw
                                      |
                        Supabase records + private Storage
```

Supabase is the durable source of truth for projects, reports, private work, approvals, outcomes, suppression, and model-evaluation records. Redis is transient only. Qdrant and any replacement database are not part of this product.

OpenRouter is server/host private: the planner uses the target profile's database-pinned primary, while the comparison model remains comparison-only. The only current activation candidate is the exact private `google/gemma-4-26b-a4b-it:free` value; no live worker model is selected or pinned. OpenClaw is the supervised Mac-mini execution runtime, but host credentials, launchd activation, hosted migration, real sender, publication, spend, account changes, and client portal remain separately approved gates.

## Model-evaluation boundary

No live worker model is selected by default. The evaluation protocol uses sanitized fixed tasks to record quality, tool use, latency, cost, failures, and repair rate for the two exact model IDs supplied through the private `OPENROUTER_PRIMARY_MODEL` and `OPENROUTER_TEST_MODEL` variables. Step 10A is partial because the configured free endpoint was rejected by the provider privacy/data-policy guardrail; a repeat comparison using the exact Gemma activation candidate remains approval-gated:

- the configured primary candidate; and
- the configured comparison candidate.

OpenRouter account and key limits govern model spend; the application records provider-reported usage and cost for evaluation evidence. The comparison runner never changes the primary route. A separate approval-gated worker command is required to pin the configured primary into the database, and real research uses that database-pinned ID.

Any future probe runs exactly two sanitized non-streaming requests through the
exact Gemma candidate. Structured-output and tool-bearing requests set
`provider.require_parameters=true`, and provider usage is retained as evidence.
The probe is not the worker, does not use web search, and cannot send, publish,
spend, or contact an external recipient.

## Local development and verification

```bash
cd app
npm install
npm run dev
```

Useful checks:

```bash
cd app
npm run type-check
npm run test:unit
npm run test:a11y
npm run build
npm run test:retained-smoke
npm run verify:code
npm run verify:database
npm run verify:assembly
```

From the repository root, release-control checks are:

```bash
npm run verify:pre-key-ci
npm run rehearse:hosted-like -- --preflight
```

`verify:database` is the single local database gate: it selects the local profile, runs local schema lint, and runs every retained security, RLS, planner/OpenClaw, prospecting, and consultation persistence check. Authenticated/RLS tests require a running local Supabase stack. `verify:assembly:fresh` remains the full release gate and resets only the disposable local Supabase database; neither command targets hosted Supabase.

The migration manifest records historical hosted stages `073–095` and pending
stages `096–106`. The hosted-like rehearsal is preflight-only by default;
execution requires the explicit acknowledgement printed by the command and
resets only disposable local Supabase. The protected pre-`073` historical-data
rehearsal remains a separate checksum-gated local command.

## Hosted and provider release boundary

The provider-free pre-key local gate is **GO** for implementation
`61eaa205058cc3ab93514a8df183b80eb3f1638b`. Local migrations reach `106`;
reviewed hosted migration evidence ends at `095`. The local result does not
authorize or prove a hosted migration, deployment, provider call, or customer
outcome. The old production commit `8b8d429` remains the historical application
rollback reference.

Hosted changes are separately approved work. Follow the numbered [production launch checklist](docs/launch/LAUNCH_CHECKLIST.md): backup, migration, deployment, secret provisioning, and live provider actions remain separate approvals. Before any hosted migration or deployment: rehearse the backup and pending migrations, inspect the dry run, verify parity, and record the result in [release evidence](docs/RELEASE_EVIDENCE.md). Before any provider is activated: approve the exact sender/model/payment configuration and prove its bounded behavior. Technical launch is items 1–22; the paid Website Fix and Managed Automation proof gates remain separate items 23 and 24.

The paid website engagement and paid AI-operator pilot are still operational milestones. Record their actual delivery, weekly briefs, and outcomes in release evidence only after they occur.
