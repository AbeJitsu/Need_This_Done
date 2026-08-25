# NeedThisDone

## The vision — start here

This is the canonical vision for NeedThisDone. Read it before proposing a new
page, workflow, automation, integration, or internal tool. `ROADMAP.md` says
what happens next; it does not redefine the vision.

### Public promise

NeedThisDone helps busy owners and managers get one important work problem
unstuck. They bring us one website problem or one repeated problem at work. We
agree on a clear outcome, do a contained piece of work, and hand back a useful
record of what changed.

```text
                  YOU HAVE ONE IMPORTANT PROBLEM
                                  |
              +-------------------+-------------------+
              |                                       |
              v                                       v
 +--------------------------+          +-----------------------------+
 |      WEBSITE FIX         |          |     MANAGED AUTOMATION      |
 | one website problem      |          | one repeated work problem   |
 | $500                     |          | proposal-based              |
 +------------+-------------+          +-------------+---------------+
              |                                      |
              +------------------+-------------------+
                                 v
             +------------------------------------------+
             | ONE AGREED OUTCOME + A CLEAR HANDOFF     |
             | direct human accountability throughout   |
             +------------------------------------------+
```

| Offer | What the client can expect |
| --- | --- |
| Website Fix | A $500 evidence-based review and one mutually agreed contained website fix. |
| Managed Automation | A proposal-based effort to improve one repeated problem at work, with the scope, outcome, price, and decisions agreed first. |

NeedThisDone is a human service with focused deliverables—not a self-serve
software platform. Clients receive direct communication and agreed handoffs;
they do not need to operate our private tools.

### Internal operating vision

The orchestrator is private delivery infrastructure, not a product for clients
to buy or operate. Its job is to turn an owner-approved piece of work into a
safe, traceable result. First prove that plumbing end to end; then adapt the
kind of approved work it supports without weakening the controls.

```text
        APPROVED PURPOSE / KIND OF WORK
                (may change later)
                         |
                         v
 +-------------------------------------------------+
 | PRIVATE ORCHESTRATOR CORE                       |
 | task | approval | route | cost | result | stop  |
 +-------------------------+-----------------------+
                           |
                           v
          VERCEL + SUPABASE + OUTBOUND MAC MINI
                (the stable safety plumbing)
```

For the current 30-day effort, active work must do at least one of the
following:

- Connect or test the real, end-to-end private delivery loop.
- Make that loop safer, clearer, or more reliable.
- Support Website Fix or Managed Automation without creating another product
  surface.

Do not make active work out of a new client dashboard, autonomous agent,
public worker endpoint, recurring-purchase flow, provider integration, or
internal dashboard merely because it seems useful. A later purpose may use the
same plumbing only after a separate owner-approved decision defines its task,
authority, and evidence requirements.

## How the private system supports that work

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

The public site offers only Website Fix and Managed Automation. The private
system supports the operators behind those offers; it does not create a client
dashboard, autonomous agent, public Mac backend, automatic purchase, or
unapproved external action.

## Current records

- [Roadmap](ROADMAP.md) — the current 30-day outcome and its proof criteria.
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
