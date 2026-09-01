# NeedThisDone Roadmap

This is an execution list, not a second vision document. Start with the
[canonical assistant and operating vision](README.md#the-assistant-vision--start-here)
before adding work here.

## Assistant-first finish line

The first release-worthy proof is one real, controlled browser → Supabase → Mac
mini assistant workflow. Local tests alone do not meet this finish line.

```text
[ Owner requests work in the browser ]
                 |
                 v
[ Hermes returns a bounded plan and allowed model route ]
                 |
                 v
[ Owner approves the frozen plan in the browser ]
                 |
                 v
[ Private Mac claims it outward and returns result, cost, and private assets ]
                 |
                 v
[ Owner reviews the evidence in the authenticated browser ]
```

It is complete only when all of these are true:

1. The browser shows the requested work, plan, tool authority, expected asset,
   model route, and any cost before execution.
2. A designated read-only task is claimed by the outbound-only Mac and returns
   its result, cost record, and reviewable private asset without changing
   client, production, or worktree state.
3. An unapproved, altered, expired, stopped, or paid-route task fails closed.
4. A later, separately approved coding rehearsal changes only its designated
   worktree and returns a reviewable diff and evidence. It does not begin until
   the read-only proof is accepted.

## Current sequence

1. Keep one durable browser approval and private-asset lifecycle in Next.js and
   Supabase; remove or avoid duplicate queues, dashboards, memory stores, and
   control planes.
2. Connect the signed private bridge to a real loopback OpenClaw gateway on the
   Mac mini, while preserving the outbound-only boundary and frozen-plan checks.
3. Use Hermes to return the bounded plan and approved model route. Prefer an
   allowed OpenRouter free route; surface a paid route for separate browser
   approval instead of silently falling back.
4. Rehearse and record the read-only workflow. Then separately approve and
   rehearse one tiny Codex worktree task.

## Explicitly not active

- Expanding the legacy Website Fix or Managed Automation pages into the product
  direction.
- A public worker endpoint, public Mac backend, autonomous agent, or a second
  owner-control surface.
- Automatic external messages, publication, spend, or system changes.
- New providers, integrations, agent roles, or tools without a need proven by
  the assistant workflow.

## Later, only under a new approval

- Hosted migration, deployment, secret provisioning, provider activation, or
  Mac runtime activation. Each connection needs its own scoped approval.
- External email, publishing, spend, or customer-facing automation.
- Any expansion of the assistant's authority, the private asset policy, or the
  browser-visible product surface.

The current factual state and validation record live in
[Project Status](docs/PROJECT_STATUS.md) and
[Release Evidence](docs/RELEASE_EVIDENCE.md).
