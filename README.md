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

The repository contains a substantial local implementation, but the complete live workflow is still being proven. The table below is the authoritative high-level status as of September 11, 2026.

| Proof gate | Status | What that means |
|---|---|---|
| Contract | Built locally | The MCP/API shapes, owner-scoped credentials, authentication seam, safety rules, and focused tests exist. |
| Local control plane | Next proof | Disposable local Supabase must pass migration 113/RLS checks, followed by a local MCP workflow diagnostic. |
| Hosted control plane | Pending | Vercel, hosted Supabase, Redis, and secure remote LLM-client access have not been proven together. |
| Worker execution | Pending | A configured local computer, private server, or cloud machine has not yet completed a real NeedThisDone workflow end to end. |

A green-looking contract or passing local test does not mean that a hosted service, live worker, provider, or customer workflow is active.

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
- The default MCP dispatcher creating durable Hermes workflows; it currently fails closed until the durable Hermes persistence adapter is connected.
- Hosted Supabase migration 113, hosted secrets, hosted Redis, or remote MCP reachability.
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

Hermes is the planned workflow coordinator. It validates requests, tracks workflow state, assigns approved work, and returns reviewable results. OpenClaw is the replaceable coding worker that runs through its configured Codex runtime on a correctly configured private host.

## Stack in plain English

| Component | Purpose |
|---|---|
| Next.js and Vercel | The web application and internet-facing control-plane boundary. |
| Supabase/Postgres/Storage | Durable product truth: users, plans, approvals, tasks, results, costs, and private assets. |
| Redis | Temporary coordination only; it is not the permanent database. |
| Upstash Vector | Optional semantic retrieval of selected, provenance-bearing findings. |
| Hermes | Workflow planning, approval, coordination, and result tracking. Durable dispatch is still pending. |
| OpenClaw and Codex runtime | The private coding worker on a configured local or cloud host. Live NeedThisDone execution is still pending. |
| GitHub | The source of truth for code, branches, commits, and pull requests. Merges and production promotion remain manual, reviewed decisions. |

The MacBook Pro and Mac mini are implementation examples, not architectural requirements. Any correctly configured private local, server, or cloud worker host may eventually be used.

## Public website and private assistant

NeedThisDone has two related but separate boundaries:

- The public website explains the service and lets visitors share what they want improved. A public submission starts a conversation; it does not approve work or expose the private worker.
- The private assistant is the authenticated system described above. It owns the planning, approval, execution, and evidence lifecycle.

The public [`/system` case study](app/app/system/page.tsx) is a visual explanation for curious or technical readers. Its four proof lanes are code-owned in [`app/lib/system-progress.ts`](app/lib/system-progress.ts), so the page uses the same built, next-proof, and pending vocabulary as the implementation record.

## Documentation and evidence

- [Roadmap](ROADMAP.md) — the required proof sequence and acceptance criteria.
- [Project status](docs/PROJECT_STATUS.md) — implementation state, validation results, blockers, and rollback notes.
- [Release evidence](docs/RELEASE_EVIDENCE.md) — what is verified, pending, or not claimable.
- [Build progress map](docs/BUILD_PROGRESS_MAP.md) — the checklist behind the `/system` page.
- [Test strategy](docs/TEST_STRATEGY.md) — what each test layer proves and does not prove.
- [Launch checklist](docs/launch/LAUNCH_CHECKLIST.md) — separately approved hosted-promotion controls.
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
npm run test:hermes-mcp:local
```

The local MCP diagnostic is intentionally local-first and reports the first missing boundary. The hosted diagnostic is read-only by default. Hosted migration, deployment, secret provisioning, provider activation, worker activation, external actions, and production promotion each require separate review and approval.
