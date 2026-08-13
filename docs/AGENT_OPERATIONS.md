# NeedThisDone Agent Operations

The cloud cutover and production activation order is controlled by the [canonical launch checklist](launch/LAUNCH_CHECKLIST.md). This document supplies the agent boundary and local proof for checklist items 10–16 and 21; it does not authorize hosted migration, deployment, provider activation, daemon installation, or external delivery.

## System boundary

The private `/dashboard` is the operator command center. The application LLM
plans and edits; OpenClaw executes an already approved plan on the Mac mini.
Neither AI layer is the source of truth.

```text
Human request
  -> authenticated NeedThisDone planner
  -> rewritten instruction, ordered steps, constraints, cost estimate
  -> human review and approval
  -> Vercel dispatch RPC
  -> frozen agent_run and agent_orchestration_tasks rows
  -> signed Mac-mini bridge
  -> loopback-only OpenClaw Gateway
  -> signed progress, usage, artifacts, and completion callbacks
  -> Supabase records and private Storage
  -> authenticated dashboard and prospecting review queue
```

Supabase owns plans, approval events, frozen snapshots, runs, tasks, leases,
model usage, artifacts, provenance, prospects, dossiers, outreach status, and
suppression records. OpenClaw owns only transient execution context on the Mac
mini. The browser never connects to OpenClaw or the Mac mini.

## Planner lifecycle

`POST /api/agent-plans` accepts a plain-language operator request and a target
growth profile. The server reads the profile's database-pinned model, calls
OpenRouter with the private server credential, validates the structured result,
adds the mandatory forbidden actions, and stores a `draft`. It does not create
a run or dispatch work.

The authenticated dashboard can edit or reject a draft with
`PATCH /api/agent-plans/:id`, approve it with
`POST /api/agent-plans/:id/approve`, and dispatch it with
`POST /api/agent-plans/:id/dispatch`. Dispatch fails closed unless the plan is
approved. Approval stores an immutable snapshot. Dispatch copies that snapshot
to the run and every task, links the task to the growth profile, and sets every
task's provider to `openclaw` with the pinned model ID.

The planner allowlist covers public research, drafting, review, and media
preparation. Every persisted plan explicitly forbids external messages,
publishing, spending, connected-account changes, and external delivery. The
OpenClaw instruction and Gateway request both set `deliver: false` and
`bestEffortDeliver: false`.

The comparison model is evidence-only. It is not selected by the browser, is
not used for dispatch, and is not copied into a client bundle. Provider keys
and environment model configuration remain server/host private.

## OpenClaw Mac-mini runtime

The Mac mini runs two separately supervised launchd processes:

```text
launchd
  |- OpenClaw Gateway: loopback-only ws://127.0.0.1:18789
  `- NeedThisDone bridge: signed HTTPS polling to Vercel
```

The Gateway process owns the private OpenRouter provider profile and approved
runtime model configuration. The bridge process owns only the Vercel transport,
worker identity, loopback Gateway token, and a private artifact staging folder.
The bridge never receives a Supabase service-role key.

Active bridge environment:

```text
BRIDGE_API_URL=https://<vercel-app>
OPENCLAW_BRIDGE_SECRET=<same value as Vercel>
BRIDGE_OWNER_ID=<operator UUID>
BRIDGE_WORKER_ID=mac-mini-01
OPENCLAW_GATEWAY_TOKEN=<loopback Gateway token>
OPENCLAW_GATEWAY_URL=ws://127.0.0.1:18789       # optional, loopback only
BRIDGE_ARTIFACT_ROOT=<private local folder>     # optional
BRIDGE_POLL_INTERVAL_MS=5000                    # optional
OPENCLAW_REQUEST_TIMEOUT_MS=30000               # optional
BRIDGE_VERSION=<bridge version>                 # optional
BRIDGE_CAPABILITIES=<comma-separated allowlist> # optional
```

Keep these files separate and chmod 600:

- bridge env file: the variables above;
- OpenClaw provider profile: private OpenRouter credential and approved model
  configuration, read only by the Gateway process;
- Vercel env: `OPENROUTER_API_KEY`, approved server model configuration, and
  `OPENCLAW_BRIDGE_SECRET`.

`PROSPECTING_WORKER_SECRET`, `PROSPECTING_WORKER_BASE_URL`, and
`PROSPECTING_WORKER_ID` are legacy direct-worker variables. The direct worker
and its routes remain available for rollback and comparison, but they must not
run against the same queue as the OpenClaw bridge. They are not part of the
active Mac-mini setup contract.

## Bridge safety contract

The bridge polls only the approved-plan claim function. It cannot claim an
unplanned or unapproved orchestration task. Every request has a timestamp,
nonce, path-bound HMAC signature, worker identity, and lease check.

Before an approved-plan task calls the Gateway, the bridge records the plan's
expected model usage. Completion must report provider usage and actual cost.
Expired leases, reservation mismatches, provider failures, or callback failures
fail closed. OpenRouter account/key limits govern model spend; Supabase retains
the expected and actual values for reconciliation. Repeated completion callbacks
return the already recorded terminal task rather than creating another artifact.

The initial OpenClaw capabilities are research, drafting, review, coordination,
and media preparation. The bridge rejects task types for sending, publishing,
spending, account changes, or arbitrary delivery. The Gateway is loopback-only
and receives the frozen plan, task model, `deliver: false`, and
`bestEffortDeliver: false` on every task request.

Files are staged locally, uploaded only through a server-issued private Storage
upload URL, and exposed to the authenticated frontend only through short-lived
signed preview URLs. Videos, thumbnails, audio, and subtitles remain private
Storage objects; dossiers, citations, drafts, usage, and status remain
structured Supabase records.

## Prospecting adapter

An OpenClaw research artifact is not automatically a prospect or an outreach
message. Only an explicit `prospecting` result on an approved, linked
`research_public_web` task enters the adapter. The server and database require
public HTTPS citations, evidence claims linked to those citations, an exact
pinned model ID, worker/task/run linkage, and usage provenance.

Validated results enter `prospect_dossiers` with `pending_review` status and
remain subject to duplicate and suppression checks. Suggested outreach remains
a draft. A human must use the existing dossier promotion and outreach approval
functions before any sender path can act. A task that attempts to send or
publish directly is rejected.

## Operating controls

- Use the browser dashboard as the canonical approval and dispatch surface.
- Pause, cancel, retry, or emergency-stop a run from the dashboard; the bridge
  observes the durable state and lease boundary.
- Stop both launchd jobs before changing the Gateway profile, bridge binary, or
  worker identity.
- Disable the bridge secret and mark the worker stopped for an emergency stop.
- Reconcile abandoned leases after a Mac or network outage before retrying.
- Do not run the legacy prospecting worker while the OpenClaw bridge is active
  for the same operator/profile.

## Verification gates

Before real activation, prove locally and record evidence for:

1. fake-model planner output, malformed output, pinned-model selection, and
   no-dispatch draft behavior;
2. edit, rejection, approval, dispatch enforcement, snapshot immutability, and
   idempotent retries;
3. approved-plan-only bridge claims, signed callbacks, expired leases,
   duplicate callbacks, emergency stop, provider failure, and offline recovery;
4. model reservation/reconciliation and provider-usage recording;
5. a fake local Gateway run with a harmless public research task;
6. strict citation validation and a result in the prospecting review queue;
7. private Storage upload and signed frontend preview;
8. a negative test proving an unapproved message cannot be sent.

Only after those local gates pass should the owner separately approve launch
checklist items 3–5 (hosted backup and migrations), 7–10 (deployment, secrets,
authorization, and model activation), 12–15 (Mac onboarding, launchd, safety
negatives, and one harmless task), 16–18 (provenance and sender canaries), and
21 (reliability and rollback). No autonomous outreach, production publish,
spend, account change, hosted migration, or external message is part of this
local proof.
