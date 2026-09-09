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
2. A designated read-only task is claimed by the outbound-only rehearsal Mac
   and returns its result, cost record, and reviewable private asset without
   changing client, production, or worktree state.
3. An unapproved, altered, expired, stopped, or paid-route task fails closed.
4. A later, separately approved coding rehearsal changes only its designated
   worktree and returns a reviewable diff and evidence. It does not begin until
   the read-only proof is accepted.

## Current sequence

1. Keep one durable browser approval and private-asset lifecycle in Next.js and
   Supabase; remove or avoid duplicate queues, dashboards, memory stores, and
   control planes.
2. Connect the signed private bridge to a real loopback OpenClaw gateway on the
   MacBook first, while preserving the outbound-only boundary and frozen-plan
   checks. The Mac mini remains a later separately approved always-on target.
3. Use Hermes to return the bounded plan and approved model route. Prefer an
   allowed OpenRouter free route; surface a paid route for separate browser
   approval instead of silently falling back.
4. Rehearse and record the read-only workflow. Then separately approve and
   rehearse one tiny Codex worktree task.

## Explicitly not active

- Treating the separately approved public outcome-partner front door, Website
  Fix, or Managed Automation as a change to the assistant product direction.
- A public worker endpoint, public Mac backend, autonomous agent, or a second
  owner-control surface.
- Automatic external messages, publication, spend, or system changes.
- New providers, integrations, agent roles, or tools without a need proven by
  the assistant workflow.

## Public homepage and optional `/system` proof

The public homepage explains what NeedThisDone does, how it works in practical
terms, and why visitors should share their vision. Its primary navigation is
What We Do → How We Work → Examples → Why Us, and the page ends with Share Your
Vision. How We Work remains part of the primary reassurance path. The page
keeps the work understandable without requiring technical detail.
The public [system case study](app/app/system/page.tsx) remains the complete
technical-details page for curious or technical visitors.

Keep `/system` available as optional detail from the footer Explore links and
its direct URL, while keeping it out of the primary homepage navigation and
conversion path. Changes to the homepage sections, CTA destinations, footer
link, card geometry, or motion must update the homepage assertions in
`app/e2e/ai-employee-product.spec.ts` and the factual ledgers. Changes to the
system stage model, metadata, direct CTAs, or responsive card geometry must
update its route assertions and the same ledgers.

## Public `/system` case study

The public [system case study](app/app/system/page.tsx) is an explanatory page
for the private-system boundary, not part of the assistant finish line. If its
stage model, CTA destinations, or responsive card geometry changes, update the
route assertions in `app/e2e/ai-employee-product.spec.ts` and record the new
validation in [Project status](docs/PROJECT_STATUS.md) and [Release evidence](docs/RELEASE_EVIDENCE.md).

## Later, only under a new approval

- Hosted migration, deployment, secret provisioning, provider activation, or
  Mac runtime activation. Each connection needs its own scoped approval.
- External email, publishing, spend, or customer-facing automation.
- Any expansion of the assistant's authority, the private asset policy, or the
  browser-visible product surface.

The current factual state and validation record live in
[Project Status](docs/PROJECT_STATUS.md) and
[Release Evidence](docs/RELEASE_EVIDENCE.md).
