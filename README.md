# NeedThisDone

NeedThisDone is a private assistant and control system for turning a person's plain-language request into controlled, reviewable work.

In simple terms:

1. You explain the outcome you want.
2. The system records the request and prepares a bounded plan.
3. You review and approve what may happen.
4. A configured worker can perform only that approved work.
5. The result, evidence, cost, and any unfinished work come back for review.

The goal is not an uncontrolled autonomous agent. The goal is a durable record of what was requested, what was approved, what actually happened, and what should happen next.

## Current status

The repository contains a substantial local implementation, but the complete live workflow is still being proven. The table below is the authoritative high-level status as of September 19, 2026.

| Proof gate | Status | What that means |
|---|---|---|
| Contract | Built locally | The MCP/API shapes, owner-scoped credentials, authentication seam, safety rules, and focused tests exist. |
| Local control plane | Next proof | MCP draft persistence is implemented in code; disposable local Supabase must apply migration 117 and pass its owner-isolation/RLS proof, then the local MCP diagnostic must pass. |
| Hosted control plane | Pending | Hosted migration history is reconciled, but Vercel, hosted Redis, and secure remote LLM-client access have not been proven together. |
| Worker execution | Pending | A configured local computer, private server, or cloud machine has not yet completed a real NeedThisDone workflow end to end. |

A green-looking contract or passing local test does not mean that a hosted service, live worker, provider, or customer workflow is active.

## Naming and the value test

The internal role is the **NeedThisDone workflow planner**. The scheduler is the
**NeedThisDone workflow scheduler**. Neither one is the Hermes CLI, and neither
installs, invokes, or connects to that external product. The planner is an
injected OpenRouter client that produces a bounded, approval-required plan; the
bridge scheduler only materializes due records and never executes work.

Some deployed compatibility contracts still contain `hermes` names: frozen v2
plan snapshots use `planner: "hermes"`, the old scheduler tick route remains a
signed alias, Postgres RPC/table names retain their original names, and older
migration/test history records the same term. Those are wire/database
identifiers, not a runtime dependency. A future database rename must be a
forward migration with a compatibility window; this branch does not rewrite
hosted data.

The value proposition is operational, not “a smarter chatbot.” ChatGPT Work
already supports scheduled and long-running work. NeedThisDone earns its place
only if it measurably reduces supervision across tools by providing durable
state, deduplication and recovery, explicit approval/cost boundaries, a private
outbound worker, and evidence such as artifacts, retries, and commit SHAs.
More schedules or another chat surface are not sufficient value.

The first proof pilot is intentionally small: a weekday, read-only project
maintenance review (GitHub/CI, deployment health, migration drift, and open
blockers) that groups unchanged failures and reports only changes. After an
approval, it may prepare a bounded patch, run checks, and return a branch/commit
and evidence; it must never merge, deploy, apply migrations, or send external
messages automatically. Compare two weeks of Work-only with two weeks of
NeedThisDone using owner minutes including maintenance, useful findings,
duplicate alerts, successful runs, recovery interventions, and provider cost.
Keep the system only if the measured net time saved is meaningful; otherwise
simplify or retire it.

## What is actually built

The codebase currently includes:

- A Next.js application with authenticated account, planning, approval, status, and private-asset surfaces.
- An authenticated `/dashboard` owner workspace for request status, updates, checks, references, and results; the operator cockpit remains at `/admin/operations`.
- An authenticated `/api/mcp` endpoint using the Model Context Protocol transport.
- A deliberately small MCP contract with three tools:
  - `start_workflow`
  - `get_workflow_status`
  - `list_workflows`
- Owner-scoped `ntd_mcp_` credentials that can be created and revoked from Account Settings. Only a SHA-256 hash and redacted metadata are stored; the raw token is shown once.
- Supabase migrations, Postgres/RLS rules, and durable records for authentication, plans, approvals, tasks, costs, results, and private assets.
- A Redis client for temporary coordination such as locks, leases, heartbeats, caching, and deduplication.
- An Upstash Vector adapter for optional, provenance-bearing semantic retrieval.
- Signed worker-bridge contracts and OpenClaw safety rules for frozen plans, isolated worktrees, tests, commits, and evidence.
- Unit, contract, database/RLS, route, accessibility, and browser diagnostic tests.

## What is not yet proven

These capabilities are designed and partially implemented, but should not be described as live:

- A remote LLM client completing a secure hosted connection to NeedThisDone MCP.
- Local runtime proof of MCP draft persistence; the dispatcher and migration 117 exist in code, but local Supabase/RLS integration is still unverified.
- Durable recurring schedules, schedule-specific MCP tools, missed-run handling, or a ChatGPT Work OAuth connection to NeedThisDone MCP.
- Hosted migration 117, hosted MCP secrets, Redis, or remote MCP reachability.
- A live Upstash Vector index and memory projection.
- A NeedThisDone-controlled worker run on the MacBook Pro, Mac mini, private server, or cloud host.
- A real worker-generated GitHub change completed through the full NeedThisDone workflow.
- Automatic merging, deployment, external messaging, spending, or customer actions.

Local tests and deterministic provider doubles prove code behavior and safety boundaries. They do not prove hosted connectivity, live provider use, worker execution, or customer outcomes.

## How the intended system works

```text
You describe an outcome
        |
        v
NeedThisDone records the request and creates a bounded plan
        |
        v
You review and approve the plan
        |
        v
A configured private worker performs only the frozen approval
        |
        v
The system stores the result, cost, evidence, and next decision
        |
        v
You review everything through the authenticated browser or LLM client
```

The LLM client is the conversation and reasoning layer. It may be ChatGPT, Claude, another compatible LLM, or a custom application. The client does not become the worker, database, queue, or merge authority.

NeedThisDone owns workflow records, approvals, scheduling, and reviewable results. Its workflow planner validates and bounds requests; its workflow scheduler reconciles due records; OpenClaw is the replaceable coding worker that runs through its configured Codex runtime on a correctly configured private host. Hermes CLI is an optional external product and is not integrated by this repository.

## Stack in plain English

| Component | Purpose |
|---|---|
| Next.js and Vercel | The web application and internet-facing control-plane boundary. |
| Supabase/Postgres/Storage | Durable product truth: users, plans, approvals, tasks, results, costs, and private assets. |
| Redis | Temporary coordination only; it is not the permanent database. |
| Upstash Vector | Optional semantic retrieval of selected, provenance-bearing findings. |
| Workflow planner + scheduler | Bounded planning, approval, recurrence reconciliation, and result tracking. Durable dispatch is still pending; Hermes CLI is not a dependency. |
| OpenClaw and Codex runtime | The private coding worker on a configured local or cloud host. Live NeedThisDone execution is still pending. |
| GitHub | The source of truth for code, branches, commits, and pull requests. Merges and production promotion remain manual, reviewed decisions. |

The MacBook Pro and Mac mini are implementation examples, not architectural requirements. Any correctly configured private local, server, or cloud worker host may eventually be used.

## Public website and private assistant

NeedThisDone has two related but separate boundaries:

- The public website explains the service and lets visitors share what they want improved. A public submission starts a conversation; it does not approve work or expose the private worker.
- The private assistant is the authenticated system described above. It owns the planning, approval, execution, and evidence lifecycle.

The public [`/system` overview](app/app/system/page.tsx) explains the difference between a conversation and a controlled path from request to result. Internal proof and operational status are rendered only in the authenticated operator workspace at `/admin/operations`, using [`app/lib/system-progress.ts`](app/lib/system-progress.ts).

## Documentation and evidence

- [Roadmap](ROADMAP.md) — the required proof sequence and acceptance criteria.
- [Project status](docs/PROJECT_STATUS.md) — implementation state, validation results, blockers, and rollback notes.
- [Release evidence](docs/RELEASE_EVIDENCE.md) — what is verified, pending, or not claimable.
- [Build progress map](docs/BUILD_PROGRESS_MAP.md) — the private operator checklist for implementation proof.
- [Test strategy](docs/TEST_STRATEGY.md) — what each test layer proves and does not prove.
- [Test audit](docs/TEST_AUDIT_2026-09-12.md) — the latest verified test inventory, results, and follow-up gaps.
- [Launch checklist](docs/launch/LAUNCH_CHECKLIST.md) — separately approved hosted-promotion controls.
- [Mac mini workflow scheduler runbook](bridge/rehearsal/MAC_MINI_WORKFLOW_SCHEDULER_SETUP.txt) — activation-gated host preparation and the implementation proof sequence for scheduled work.
- [Supabase guide](supabase/README.md) — schema and durable-data boundaries.

## Local development

```bash
cd app
npm install
npm run dev
```

Useful checks include:

```bash
npm run verify:code
npm run verify:database
npm run test:workflow-mcp:local
```

The local MCP diagnostic is intentionally local-first and reports the first missing boundary. The hosted diagnostic is read-only by default. Hosted migration, deployment, secret provisioning, provider activation, worker activation, external actions, and production promotion each require separate review and approval.
