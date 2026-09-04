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
 AUTHENTICATED BROWSER
 request | plan preview | approve / stop | review results and assets
             |
             v
 NEXT.JS ON VERCEL                         SUPABASE
 browser control plane  <-------------->   durable plans | approvals
 auth and policy checks                     costs | results | private assets
             ^                                        |
             | signed HTTPS, Mac starts the connection |
             |                                        v
             +-----------------------  ALWAYS-ON MAC MINI  -----------+
                                      private outbound worker           |
                            Hermes: plans and chooses approved route    |
                            OpenClaw: runs approved non-code tools      |
                            Codex: makes approved worktree code changes |
                            OpenRouter: free route first; paid needs    |
                                        browser approval                 |
```

Vercel is the internet-facing browser control plane, not a permanent worker.
Supabase is durable product truth. The Mac mini is the always-on private
runtime: it polls outward, exposes no public listener, and may act only on a
recorded, frozen approval.

- Hermes proposes a bounded plan and records the allowed model route.
- OpenClaw carries out an approved local, non-code tool task.
- Codex handles an approved coding task only in its designated worktree.
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

## Product boundary

This is the owner's private assistant, not a public worker service or an
autonomous system. The authenticated assistant remains the canonical internal
product and the only active product roadmap.

## Public service front door

The separately approved public website presents NeedThisDone as an outcome
partner for owners and founders: “Your vision, brought to life.” Visitors can
share the better state they want without preparing a technical brief. Website
Fix ($500) and proposal-based Managed Automation remain bounded secondary
starting points; choosing either one is optional in the public intake.

This public positioning does not expand the assistant roadmap or grant action
authority. A public request starts a conversation only. It does not create an
automatic purchase, send an external message beyond the existing submission
flow, approve work, activate a provider, or expose the private Mac runtime.

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
