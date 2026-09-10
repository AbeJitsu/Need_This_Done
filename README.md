# NeedThisDone

## The assistant vision — start here

This is the canonical assistant and operating vision for NeedThisDone. Read it
before proposing a page, workflow, automation, integration, or internal tool.
`ROADMAP.md` says what happens next; it does not redefine this vision.

### The outcome

NeedThisDone is a private, authenticated assistant for running the owner's
life and business more effectively. From any authenticated browser, the owner
can request work, inspect its plan and cost, approve or stop it, and review the
result and every private asset it creates.

The first proof is a small read-only workflow that makes this whole lifecycle
visible and reliable. The next proof is one separately approved coding task in
a dedicated worktree. Features, providers, and tool authority grow only after
those proofs hold.

## How the system works

```text
 LLM CLIENT (ChatGPT today; others supported)
 request | approve | ask for status / summary
             |
             v  authenticated HTTPS MCP
 NEEDTHISDONE ON VERCEL                  SUPABASE + REDIS
 three workflow tools  <------------->   durable record + short-lived signals
             |                                      |
             | Hermes claims approved work         |
             v                                      v
       CONFIGURED WORKER HOST  ----------->  RESULT + EVIDENCE
 Local computer or cloud machine            Supabase stores the result;
 Hermes coordinates; OpenClaw executes      initiating client reads it via status
             |
             v
 OpenClaw: coding worker via Codex runtime
 GitHub: branch, commit, and review source of truth
 Upstash Vector: selected searchable memory, never durable truth
```

ChatGPT is the current interface and reasoning layer, but the contract is model-agnostic: you can use ChatGPT, Claude, or any compatible LLM or custom app. Vercel is the stable,
internet-facing MCP/control-plane doorway, not a permanent worker; you do not
need to open the NeedThisDone app for the LLM client to reach it. Supabase is durable
product truth. Redis is only temporary coordination for queues, leases, locks,
heartbeats, and deduplication. A correctly configured local computer, private
server, or cloud machine can be the worker host: it polls outward, exposes no
public listener, and may act only on a recorded, frozen approval.

The MacBook Pro and Mac mini are current implementation examples: the MacBook
Pro is the first rehearsal host, and the Mac mini is the intended always-on
example. The architecture does not require either device.

- Hermes proposes a bounded plan and records the allowed model route.
- OpenClaw carries out an approved coding task through its configured Codex
  agent runtime in a designated worktree.
- OpenRouter uses an allowed free route first. A paid route is a separate
  browser approval, not an automatic fallback.

## Approval and private asset boundary

```text
[ Owner request ] -> [ Hermes plan ] -> [ browser approval ]
                                              |
                                              v
      [ authenticated review ] <- [ Supabase result, cost, private asset ]
                                              ^
                                              |
                              [ Mac claims and runs frozen work ]
```

The browser is where the owner sees the proposed action, the expected result,
the cost and route, progress, stop state, reviewable diff, and created assets.
Private assets stay in Supabase private Storage and receive a short-lived
signed view URL only after a server-side authentication and ownership check.

Every external message, publication, spend, system change, or coding handoff
requires a human approval. An expired, altered, unapproved, or stopped task
must fail closed. A completed result never grants permission for follow-on
work.

### Stack responsibilities

| Component | Responsibility | Boundary |
|---|---|---|
| LLM client | Conversational interface, reasoning, clarification, planning, status interpretation, and summaries; ChatGPT is the current client | Does not run long-lived workers, queues, or arbitrary shell commands |
| MCP facade | Stable authenticated control-plane adapter exposing `start_workflow`, `get_workflow_status`, and `list_workflows` from any approved device | Device-independent; does not become a second workflow engine or database |
| Hermes | Validates requests, creates and tracks workflows, assigns workers, handles leases/retries/events, and persists outcomes | Coordinates execution; it does not replace ChatGPT's conversation layer |
| Next.js/Vercel | Internet-facing authenticated control plane and server-side API boundary | Not the permanent worker and never exposes private credentials to the browser |
| Supabase/Postgres/Storage | Auth, RLS, durable plans, approvals, tasks, results, costs, and private assets | Canonical source for durable workflow and business truth |
| Redis/Upstash Redis | Short-lived queues, locks, leases, heartbeats, deduplication, and wake-up signals | Rebuildable coordination only; `REDIS_URL` is the current connection variable |
| Upstash Vector | Private semantic-memory projection of selected durable decisions and findings | Retrieval aid only; configured with `UPSTASH_VECTOR_REST_URL`, `UPSTASH_VECTOR_REST_TOKEN`, and optional `VECTOR_MEMORY_NAMESPACE` |
| Worker host | Correctly configured local computer, private server, or cloud machine that runs Hermes/OpenClaw | Outbound-only execution node; activation remains separately approved |
| MacBook Pro (example) | Abe's interactive coding and first controlled rehearsal machine | One possible local host; not required |
| Mac mini (example) | Intended always-on private worker example | One possible always-on host; not required |
| OpenClaw | Approved coding worker through its loopback Gateway and configured Codex agent runtime | Returns tests, changed files, commit SHA, and review evidence; no automatic merge/deploy |
| GitHub | Code, branch, commit, and pull-request source of truth | Production branches remain protected and review-gated |
| OpenRouter | Current application-side planner/model route | Free route first; paid route requires separate approval |

OpenClaw is intended to authenticate through its supported ChatGPT/Codex OAuth
path and use the Codex agent runtime for coding. That makes Codex an internal
OpenClaw runtime in this design, not a separately operated Codex CLI worker.
OpenAI API-key billing and ChatGPT/Codex subscription authentication remain
separate credential paths and must not be treated as interchangeable.

The normal request path is: an LLM client understands the request → the stable
MCP facade authenticates and validates it → Hermes creates the durable Supabase
record →
Redis carries only transient coordination → the configured worker host claims and runs the
approved job → OpenClaw's Codex runtime returns structured evidence → Hermes persists
the result → the initiating client reports the status and next decision. Upstash Vector may
receive a provenance-bearing projection after durable state exists, but it
never overrides current Supabase or GitHub facts and does not restore the
retired public chatbot or page-indexing system.

The reviewer-facing [test strategy and suite inventory](docs/TEST_STRATEGY.md)
defines the TDD gate, explains what each test layer proves and does not prove,
and records the rules for consolidating tests without losing a safety or
product invariant.

The [build progress map](docs/BUILD_PROGRESS_MAP.md) is the companion checklist
for the `/system` page. It distinguishes a tested contract from a live local,
hosted, or worker connection and records the order of proof.

The opt-in `npm run test:hermes-mcp:local` Playwright diagnostic first runs the
real local-Supabase database/RLS gate, then walks the local application
boundary through health, vector configuration, MCP authentication and
discovery, and Hermes start/list/status. After that passes,
`npm run test:hermes-mcp:hosted` repeats the safe read-only checks against an
explicit deployed `BASE_URL`, including the hosted server-side Supabase and
Redis health path. Both commands attach a stage-by-stage JSON report and fail
with the missing boundary; `test:hermes-mcp:full` is reserved for a separately
approved local worker rehearsal. Hosted workflow writes require a separate
explicit remote-write approval and are never part of the safe preflight.

## Product boundary

This is the owner's private assistant, not a public worker service or an
autonomous system. The authenticated assistant remains the canonical internal
product and the only active product roadmap.

## Public service front door

The separately approved public website presents NeedThisDone as a practical
partner for teams and individuals: “Your vision, brought to life.” The homepage
sections explain what NeedThisDone does, how it works in practical terms, and
why visitors should share their vision. Its primary path is What We Do → How We
Work → Examples → Why Us, with Share Your Vision as the dominant hero and
closing action. How We Work remains part of that primary reassurance path.
Visitors can share the better state they want without preparing a technical
brief. Website Fix ($500) and proposal-based Managed Automation remain bounded
secondary starting points; choosing either one is optional in the public intake.

This public positioning does not expand the assistant roadmap or grant action
authority. A public request starts a conversation only. It does not create an
automatic purchase, send an external message beyond the existing submission
flow, approve work, activate a provider, or expose the private Mac runtime.

The public [`/system` case study](app/app/system/page.tsx) remains a complete,
discoverable technical-details page. It begins by explaining what the page will
cover, shows one plain-English operating path, explains why each technical
layer exists, and ends with a direct comparison: ordinary chat can answer and
call tools, while NeedThisDone adds durable state, temporary coordination,
selected semantic memory, controlled workers, and reviewable evidence. The path
is compatible with any LLM client and any correctly configured local or cloud
worker host; the MacBook Pro and Mac mini are current examples only. The page
also identifies which connections are built or still pending. It is optional
detail for curious or technical visitors, available from the footer Explore
links and the direct `/system` URL; it is not required for conversion or part
of the primary homepage path. Keep its route contract, sitemap entry, metadata,
responsive presentation, and direct contact/action links aligned with [Project
status](docs/PROJECT_STATUS.md) and [Release evidence](docs/RELEASE_EVIDENCE.md)
when the page changes.

Internal public-service writing guidance lives in
[Communication frameworks](docs/COMMUNICATION_FRAMEWORKS.md).

## Current records

- [Roadmap](ROADMAP.md) — the next proof and its acceptance criteria.
- [Project status](docs/PROJECT_STATUS.md) — factual implementation state,
  validation, blockers, and rollback notes.
- [Release evidence](docs/RELEASE_EVIDENCE.md) — what is verified, pending, or
  not claimable.
- [Launch checklist](docs/launch/LAUNCH_CHECKLIST.md) — separately approved
  hosted-promotion controls.
- [Supabase](supabase/README.md) — schema and durable-data boundary.

## Local development

```bash
cd app
npm install
npm run dev
```

Run the narrowest relevant check while working. Hosted migration, deployment,
secret provisioning, provider activation, Mac activation, and external actions
always require their own approval.
