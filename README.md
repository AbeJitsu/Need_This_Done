# NeedThisDone

NeedThisDone is a human-led personal-and-business assistant. It keeps durable
work, decisions, costs, and results in one owner-controlled system while the
owner retains judgment over every consequential action.

## System map

```text
                       +----------------------------------+
                       |            YOU / OWNER           |
                       | choose work | approve | stop it   |
                       +----------------+-----------------+
                                        |
                                        | 1. use a private dashboard
                                        v
       +----------------------------------------------------------------+
       |                    VERCEL CONTROL PLANE                       |
       | checks policy | records approval | releases only approved work |
       +----------------------------+---------------------+-------------+
                                    |                     ^
               2. save the record  |                     | 3. signed HTTPS only
                  of work, choices, v                     |    (the Mac starts it)
                  costs, and result +----------------+    |
                                    |    SUPABASE    |    |
                                    | durable truth  |    |
                                    +----------------+    |
                                                        polls outward
                                                             |
       +-----------------------------------------------------+----------+
       |                 MAC MINI / ORCHESTRATOR                       |
       | private worker: no public port, no public listener            |
       |                                                               |
       | [Hermes]   ---> selects an approved model ---> OpenRouter     |
       | [OpenClaw] ---> uses only approved local tools                |
       | [Codex]    ---> changes only an approved coding worktree      |
       +----------------------------------------------------------------+
```

Vercel is the internet-facing, owner-gated control plane. Supabase is durable
truth. The Mac mini has no public listener: it polls outward over signed HTTPS
and can perform only the task, route, tool, and spend authority Vercel has
recorded as approved.

- Hermes selects and records an approved OpenRouter model route.
- OpenClaw runs an approved bounded tool task.
- Codex works only in an owner-approved coding worktree.

Every external message, publication, system change, spend, or coding handoff
requires human approval. A task may be stopped at any time; a completed result
is evidence, not permission for another action.

### One task, at a glance

```text
[ You approve a specific task ]
              |
              v
[ Vercel freezes the allowed plan ] ---> [ Supabase keeps the decision ]
              |
              v
[ Mac mini polls for that plan ] ---> [ does only the approved work ]
              |
              v
[ Vercel records the result ] -------> [ Supabase keeps the evidence ]

If the task would send, publish, spend, or change a system:

[ STOP ] ---> [ ask you again ] ---> [ continue only after a new approval ]
```

## Product boundary

The public site continues to offer a contained Website Fix and a human-led
Managed Automation pilot. The assistant supports the owner behind those
offers; it does not create a client dashboard, autonomous agent, public Mac
backend, automatic purchase, or unapproved external action.

## Current records

- [Roadmap](ROADMAP.md) — the next few outcomes and paid-proof finish line.
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

Run the narrowest relevant check while working. Local assembly and database
gates use disposable local infrastructure only. Hosted migration, deployment,
secret provisioning, provider activation, Mac activation, and external actions
always require their own approval.
