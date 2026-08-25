# NeedThisDone Roadmap

This is an execution list, not a second vision document. Start with the
[canonical public promise and internal operating rule](README.md#the-vision--start-here)
before adding work here. The private orchestrator remains delivery
infrastructure, not a public product.

## 30-day finish line

A real, controlled Vercel → Supabase → Mac mini rehearsal proves the private
orchestrator works end to end. Local tests alone do not meet this finish line.

```text
[ Owner approves a task ]
             |
             v
[ Vercel records a frozen plan ] ---> [ Supabase keeps durable evidence ]
             |
             v
[ Mac mini polls outward, claims, and runs only that plan ]
             |
             v
[ Result, cost, artifacts, and stop state return for owner review ]
```

It is complete only when both controlled rehearsal tasks succeed:

1. A read-only task runs in the designated approved environment and returns
   its result and evidence without changing client, production, or worktree
   state.
2. A tiny, pre-agreed coding task changes only a designated test worktree and
   returns a reviewable diff, result, cost record, and artifacts.

The rehearsal must also prove that an unapproved, altered, expired, or stopped
task fails closed. The Mac mini must initiate the signed outbound connection;
it never exposes a public listener.

## Current sequence

1. Define the smallest stable contracts for task, approval, route, cost,
   artifact, result, and stop state.
2. Connect those contracts through the real Vercel control plane, hosted
   Supabase, and outbound-only Mac mini, using separately approved hosted,
   secret, and Mac-runtime steps.
3. Rehearse the read-only task, then the tiny reversible coding task; record
   the exact evidence and failures.
4. After the loop is proven, choose a purpose or workflow profile based on the
   public offers and real operating need—not speculation.

## Explicitly not active

- Daily Desk or any replacement revenue/productivity experiment.
- A standalone assistant, orchestrator, client dashboard, or public worker
  product.
- New agent roles, providers, integrations, or operator screens without a
  need proven by the rehearsal or later delivery work.

## Later, only under a new approval

- Hosted migration, deployment, secret provisioning, provider activation, or
  Mac runtime activation. Each real-rehearsal connection needs its own scoped
  approval.
- External email, publishing, spend, or customer-facing automation.
- Any expansion of the assistant's tool authority or public surface.

The current factual state and validation record live in
[Project Status](docs/PROJECT_STATUS.md) and
[Release Evidence](docs/RELEASE_EVIDENCE.md).
