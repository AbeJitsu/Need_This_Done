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
2. Treat the MacBook Pro as Abe's interactive coding machine and connect the
   signed private bridge to a real loopback OpenClaw gateway there first, while
   preserving the outbound-only boundary and frozen-plan checks. The Mac mini
   is the always-on private worker host and remains a later separately approved
   activation target.
3. Use Hermes to return the bounded plan and approved model route. Prefer an
   allowed OpenRouter free route; surface a paid route for separate browser
   approval instead of silently falling back.
4. Keep the existing `REDIS_URL` integration for transient acceleration and
   coordination only. Add no second durable queue or database.
5. Configure the private vector-memory projection with
   `UPSTASH_VECTOR_REST_URL`, `UPSTASH_VECTOR_REST_TOKEN`, and the optional
   `VECTOR_MEMORY_NAMESPACE`. The vector index must have a hosted embedding
   model; vector memory must never restore the retired chatbot or page
   indexing.
6. Rehearse and record the read-only workflow. Then separately approve and
   rehearse one tiny Codex worktree task.

## Foundation progress map — 2026-09-09

| Capability | Current state | Next proof |
| --- | --- | --- |
| Vision and operating boundaries | Canonical in `README.md` and this roadmap | Keep implementation aligned with the approval and source-of-truth rules |
| Browser approval and durable workflow lifecycle | Built and locally tested through the retained `agent_plans` / run / task records | Complete a real read-only MacBook rehearsal |
| Redis | Existing `REDIS_URL` client is active for cache, rate limits, and deduplication | Use it for transient workflow signals only after durable dispatch exists |
| Vector memory | Private Upstash Vector adapter and environment contract are implemented locally; chatbot/page indexing remains retired | Configure the index and run a namespaced upsert/query check |
| MCP facade | Device-independent schemas, a local Streamable HTTP handler, and an opt-in stage-reporting Playwright diagnostic are implemented and tested; the diagnostic now enforces real local Supabase first and a separate hosted read-only profile; production OAuth/remote access and Hermes persistence wiring remain pending | Pass the local profile, then the hosted profile, then connect the dispatcher to durable Hermes records |
| MacBook Pro | Interactive coding and first bridge-rehearsal host | Configure the private bridge environment and validate the loopback Gateway |
| Mac mini | Intended always-on worker host; not activated | Repeat the approved worker proof after the MacBook proof |
| OpenClaw/GitHub coding worker | Coding worker contract remains future; OpenClaw is the worker and its Codex agent runtime is the coding engine | Add isolated worktree, branch, checks, commit SHA, and review evidence |

## Test evidence map

Each capability must carry the narrowest useful evidence at each layer:

| Layer | Evidence we can build now | What remains later |
| --- | --- | --- |
| Unit | Pure validation, redaction, status mapping, Redis coordination helpers, and vector REST request/response tests | None for deterministic behavior |
| Contract | MCP/Hermes schemas, bridge signatures, worker payloads, Supabase lifecycle shapes, Redis signals, and vector provenance metadata | Confirm the live clients use the same contract |
| Integration | Disposable local Supabase/RLS, controlled Redis, signed bridge routes, and mocked Upstash REST; the MCP diagnostic adds a real local-Supabase-first check | Hosted Supabase, Upstash account, and Mac runtime integration |
| Browser/E2E | Existing approval/review journeys plus the opt-in MCP vertical-slice diagnostic with health, auth, discovery, and workflow-stage evidence | A real worker-backed journey, vector projection, and remote compatible-LLM connector |
| Live rehearsal | Not available in this environment | MacBook Pro/Mac mini, Vercel, Supabase, Redis/vector, provider, and durable result |

Passing local tests never changes a capability to “live” or “hosted.”

## TDD policy and test-suite audit

Test count is not the quality measure. A test is retained when it protects at
least one of these things:

- a user-visible outcome or API response;
- a security, approval, ownership, or source-of-truth boundary;
- a durable data invariant or migration/RLS rule;
- a replaceable-worker or provider contract; or
- an accessibility, responsive, or retirement requirement that would be easy
  to regress silently.

The test-first sequence for each new capability is: write the smallest failing
contract test, implement only enough behavior to pass it, run the narrow test,
then run the relevant broader gate and record the evidence here and in
`docs/RELEASE_EVIDENCE.md`.

| Current suite | Why it exists | Audit decision |
| --- | --- | --- |
| Required deterministic unit/API tests: 70 files and 370 tests in the latest code gate | Fast feedback for validation, authorization, idempotency, provider adapters, public contracts, and pure library behavior | Keep behavior coverage; consolidate shared fixtures/helpers only when failure meaning stays clear |
| Security, RLS, schema, and provider-recovery suites | Prove database permissions and durable invariants that mocked unit tests cannot prove | Keep separate from the fast unit gate and run through `verify:database` |
| Accessibility tests: 6 files and 60 tests | Protect keyboard, semantic, and axe-level regressions on retained UI primitives and flows | Keep the meaningful accessibility matrix; parameterize repeated setup rather than deleting variants |
| Browser/E2E suites | Prove route composition, authentication, approval, recovery, responsive behavior, and real browser boundaries | Keep focused journeys; do not treat every page assertion as an end-to-end workflow proof |
| Bridge and worker tests | Prove signatures, frozen-plan checks, loopback behavior, artifact safety, and no-delivery defaults | Keep worker safety tests separate because the Mac runtime has platform-specific evidence |
| Retired-surface and documentation tests | Prove that removed systems do not quietly return and that canonical docs remain aligned | Keep one focused assertion set per boundary; remove only after the boundary itself is removed |

The first audit found no safe behavior deletions yet. The apparent volume is
mostly separate boundaries and parameterized UI/accessibility cases. The
initial consolidation target is test setup and repeated fixtures, not
assertions. Any future test removal must name the invariant it duplicates,
show the surviving test that protects it, and be followed by a full relevant
gate. A passing test that only mirrors implementation details is a candidate
for replacement with a public-contract assertion.

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
technical-details page for curious or technical visitors. It starts with
plain-English cards, then shows the visual operating path: a compatible LLM client calls
the hosted MCP doorway; Supabase records durable truth; Redis carries short-lived
coordination; Hermes on the active Mac claims the approved work; OpenClaw runs
the coding task; and the result returns through Supabase to the initiating client. It then
names the technology stack, why each piece exists, and which connections are
built or still pending.

Keep `/system` available as optional detail from the footer Explore links and
its direct URL, while keeping it out of the primary homepage navigation and
conversion path. Changes to the homepage sections, CTA destinations, footer
link, card geometry, or motion must update the homepage assertions in
`app/e2e/ai-employee-product.spec.ts` and the factual ledgers. Changes to the
system stage model, metadata, direct CTAs, or responsive card geometry must
update its route assertions and the same ledgers.

## Public `/system` case study

The public [system case study](app/app/system/page.tsx) is an explanatory page
for the private-system boundary, not part of the assistant finish line. Its
plain-English flow must precede the technical stack explanation, and its
proof-state labels must match the current repository status. If its stage model,
stack descriptions, CTA destinations, or responsive card geometry changes,
update the route assertions in `app/e2e/ai-employee-product.spec.ts` and record
the new validation in [Project status](docs/PROJECT_STATUS.md) and [Release evidence](docs/RELEASE_EVIDENCE.md).

## Later, only under a new approval

- Hosted migration, deployment, secret provisioning, provider activation, or
  Mac runtime activation. Each connection needs its own scoped approval.
- External email, publishing, spend, or customer-facing automation.
- Any expansion of the assistant's authority, the private asset policy, or the
  browser-visible product surface.

The current factual state and validation record live in
[Project Status](docs/PROJECT_STATUS.md) and
[Release Evidence](docs/RELEASE_EVIDENCE.md). The four-gate implementation
checklist lives in [Build Progress Map](docs/BUILD_PROGRESS_MAP.md), and the
`/system` page presents the same gates visually.
