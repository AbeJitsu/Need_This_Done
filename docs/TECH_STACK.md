# NeedThisDone Technology Stack

**This document is a collaborative design exercise. Challenge my assumptions. If a simpler, cheaper, or more maintainable approach exists, recommend it even if it differs from my initial proposal.**

This is the canonical technology-responsibility map. `ROADMAP.md` defines product sequence, and `docs/PROJECT_STATUS.md` records what is actually implemented and proven.

## Phase 0 — Architecture review gate

Do not implement a new architecture slice until this review is complete and explicitly accepted.

The review must determine:

- what already exists and what it actually does;
- what is redundant, retired, or merely historical;
- what should be kept, simplified, expanded, removed, or postponed;
- which system owns each durable record;
- which proposed service, model, agent, database, queue, or abstraction solves a named problem;
- how failure, cost, privacy, rollback, and operational ownership will be handled.

The gate fails when a component has no clear problem statement, duplicates an existing responsibility, has no owner, or is being introduced only because it is technically interesting. The gate passes when the source-of-truth map, transient-state map, candidate model evaluation plan, safety boundaries, and explicit deferrals are documented.

This gate applies before adding a database, vector store, queue, agent runtime, model default, provider adapter, or broad abstraction. It does not block the already-proven local cockpit and internal-pilot code; it governs the next architecture change.

## Existing infrastructure

Before proposing anything new, inspect the current repository and local proof. The current evidence is:

| Component | What exists now | Responsibility now | Recommendation |
| --- | --- | --- | --- |
| Supabase | Postgres, Auth, RLS, Storage, and migrations through local `083` | Durable source of truth for users, roles, projects, customer boundaries, approvals, work, outreach, cockpit state, outcomes, and idempotency records | **Keep as-is as the source of truth; expand only for a demonstrated workflow need.** Hosted migrations `073`–`083` still require separate review. |
| Redis | Node Redis client plus optional `REDIS_URL` integration | Short-lived cache, rate limiting, request deduplication, and transient counters; the provider-free proof deliberately runs with Redis disabled | **Keep as optional transient support.** Add locks or active-job state only when a measured worker need exists. Never move durable business state into Redis. |
| Qdrant | No package, configuration, deployment, client, route, or call site found | None | **Do not add now.** There is no current Qdrant integration to preserve or connect. Reconsider only if a measured retrieval scale, latency, or isolation problem cannot reasonably be handled by the existing source of truth. |
| Historical pgvector/search | Early migrations created `page_embeddings` and `match_page_embeddings`; migration `077` retired the table, function, callers, and content/search surface | Historical schema lineage only; no active application retrieval feature | **Keep the migration history for auditability; keep the runtime feature retired.** Reintroduce retrieval only through a new Phase 0 review with retention, tenant isolation, deletion, and cost evidence. |
| Codex + GitHub | Active reviewed engineering workflow | Implement, test, review, and preserve application changes | **Keep as the engineering system.** Coding changes remain in this boundary. |
| OpenClaw | Local CLI exists; no production provider, daemon, channel, or authenticated application adapter | Intended operations system for approved long-running browser, schedule, and external-tool work | **Keep as a deferred operations boundary.** Prove one narrow authenticated adapter before treating it as a product dependency. |
| Hermes | Mentioned in older planning; no current product adapter or gateway is required by the retained app | No current product responsibility | **Remove from the primary architecture and defer.** Reconsider only when a distinct orchestration problem, owner, boundary, and measured benefit are proven. |
| OpenRouter | Provider boundary and optional environment variables; no model call is part of the provider-free assembly | Candidate routing layer for evaluated non-coding work | **Keep as an evaluation boundary, not a default.** Resolve model IDs, pricing, context, capabilities, and routing metadata from the live catalog. |

The preferred separation is:

```text
Supabase
  durable source of truth: users, businesses/projects, outreach,
  approvals, work, outcomes, cockpit state, and durable analytics records

Redis
  transient support: queues when justified, locks, active jobs,
  rate limits, deduplication, and short-lived cache

Qdrant
  not installed and not integrated; no semantic-memory responsibility today

Codex + GitHub
  reviewed software engineering

OpenClaw
  approved operations execution, only through narrow authenticated adapters
```

The rule is simple: durable facts and decisions belong in Supabase; Redis may accelerate or coordinate temporary work; an agent or model never becomes the source of truth.

## Current architecture and boundaries

```text
Humans decide
     |
     v
NeedThisDone on Next.js/Vercel
     |
     +----------------------> Supabase: Auth + RLS + durable truth
     |                              users, projects, work, outreach,
     |                              approvals, outcomes, cockpit history
     |
     +----------------------> Redis: optional transient support
     |                              cache, rate limits, deduplication
     |
     +----------------------> OpenClaw: deferred operations adapter
                                    approved browsing, schedules, tools

Codex + GitHub ---------------> reviewed application changes

OpenRouter -------------------> evaluated model candidates only
Hermes -----------------------> deferred; not a product dependency
Qdrant -----------------------> no integration
```

The browser receives neither provider secrets nor agent credentials. Application routes authenticate the user, enforce Supabase RLS, and write durable decisions before any future adapter can act. External email, publishing, spending, customer-system changes, and destructive actions remain human-approved. A future adapter must carry a bounded task, authenticated actor, and idempotency key, then record a verified result in Supabase.

## Model evaluation strategy

Do not assume DeepSeek V4 Flash 0731 is automatically the best model. Do not assume explicit routing is always better than OpenRouter Auto. Evaluate candidates against fixed, sanitized tasks before selecting any production default.

The OpenRouter model catalog exposes model IDs, canonical slugs, context lengths, modalities, pricing, supported parameters, and sorting metadata. The catalog should be queried at evaluation time rather than copied into permanent configuration. The Auto Router response identifies the model selected, and its request cost is the selected model's normal cost. See the [model catalog](https://openrouter.ai/docs/api/api-reference/models/get-models) and [Auto Router documentation](https://openrouter.ai/docs/guides/routing/routers/auto-router).

### Catalog snapshot for candidate discovery

The following is a discovery snapshot observed on 2026-08-08, not a set of pinned defaults. Re-fetch the catalog immediately before a benchmark and store the returned metadata with the results.

| Candidate | Catalog ID observed | Context | Catalog capabilities or cost signal | Role in evaluation |
| --- | --- | ---: | --- | --- |
| DeepSeek V4 Flash 0731 | `deepseek/deepseek-v4-flash-0731` | 1,048,576 | Prompt `$0.09/M`, completion `$0.18/M`; tools and structured outputs listed | Required low-cost candidate for planning, workers, research, and writing comparisons |
| DeepSeek V4 Flash latest alias | `~deepseek/deepseek-v4-flash-latest` | 1,048,576 | Redirects to the latest V4 Flash family member | Compare alias stability with the dated slug; never assume the alias is identical forever |
| OpenRouter Auto | `openrouter/auto` | 2,000,000 router metadata | Catalog pricing is not a direct model price; selected model is billed normally; tools listed | Required routing candidate; current docs mark it deprecated, so test alongside `openrouter/auto-beta` |
| OpenRouter Auto Beta | `openrouter/auto-beta` | 2,000,000 router metadata | Task-aware routing; supports allowed/excluded models and cost tiers | Current routing candidate for new experiments; log the selected model on every trial |
| Qwen Qwen3.7 Flash | `qwen/qwen3.7-flash` | 1,000,000 | Multimodal text/image/video input; tools listed; low catalog prompt/completion price | Browser, research, website-audit, and cheap-worker candidate |
| Google Gemini 3.6 Flash | `google/gemini-3.6-flash` | 1,048,576 | Multimodal input; tools, structured outputs, and web-search metadata listed | Website-audit, research, browser, and long-context candidate |
| Anthropic Claude Opus 5 | `anthropic/claude-opus-5` | 1,000,000 | Multimodal input; tools and structured outputs; higher-cost quality candidate | Planner, long-context, audit, and writing comparison |

Prices, slugs, aliases, availability, and capability flags are volatile. The table is a candidate inventory, not a recommendation. OpenRouter Auto can select a model outside an assumed budget unless the experiment applies an explicit allowed-model pattern and budget guard.

### Categories and initial candidate pools

| Category | Initial pool | Decision rule |
| --- | --- | --- |
| Coordinator | Auto Beta, Auto, Claude Opus 5, DeepSeek V4 Flash | Optimize end-to-end task success and safe tool routing, not single-turn prose quality |
| Planner | Claude Opus 5, DeepSeek V4 Flash, Auto Beta | Measure decomposition quality, missed constraints, and repair burden |
| Cheap worker | DeepSeek V4 Flash, Qwen3.7 Flash, Gemini 3.5 Flash Lite or another catalog-current low-cost model | Optimize cost per accepted result while preserving schema and safety compliance |
| Research/tool use | Auto Beta, Qwen3.7 Flash, Gemini 3.6 Flash, DeepSeek V4 Flash | Measure source selection, citation fidelity, tool-call validity, and refusal behavior |
| Browser automation | OpenClaw remains the operations system; compare models only through a fixed tool adapter | Measure successful task completion, recovery from page changes, and unsafe-action prevention |
| Long-context analysis | Claude Opus 5, Qwen Qwen3.8 Max, DeepSeek V4 Flash | Measure recall, contradiction handling, latency, and cost at realistic context sizes |
| Website auditing | Gemini 3.6 Flash, Qwen3.7 Flash, Claude Opus 5, Auto Beta | Measure issue precision, severity calibration, accessibility reasoning, and evidence quality |
| Writing | Claude Opus 5, Gemini 3.6 Flash, DeepSeek V4 Flash, Auto Beta | Measure factuality, voice adherence, edit distance, and human acceptance |
| Coding | Codex remains the engineering system; OpenRouter models may be comparison baselines only | No OpenRouter model becomes the coding default without a separate decision; production code stays in reviewed Codex workflow |
| Image, video, speech, music | Deferred | Do not add media providers or evaluation cost until a product requirement exists |

For every eventual recommendation, record why the model won, why the nearest alternative lost, typical latency, tool-calling quality, context window, approximate cost, strengths, weaknesses, failure modes, and repair rate. If the evidence is incomplete, leave the category unselected.

### Fixed evaluation protocol

1. Build a sanitized task set that cannot contain customer secrets or production actions. Keep the prompts, expected outputs, tools, and scoring rubric fixed across models.
2. Run the same tasks with the same limits and adapter behavior. Use enough repeated trials to expose variance, not one impressive example.
3. Score task quality, factuality, schema compliance, tool-call validity, successful tool completion, safety-boundary adherence, latency, token cost, failure rate, retry count, and repair rate.
4. For Auto, record the router slug, selected response model, provider, cost, and latency for every request. For explicit models, record the exact catalog ID and catalog snapshot.
5. Review failures and repairs by category. A cheaper model that needs repeated repair may be more expensive and less safe than a stronger model.
6. Select a default only after the evidence is reviewed, budgets are enforced, and a rollback/fallback route is documented. Re-run the suite when a model slug, provider, prompt, tool adapter, or task distribution changes.

No model call, OpenRouter key, OpenClaw action, or hosted provider configuration is required for the current local assembly. This section defines the gate for future work.

## Delivery and safety rules

- Keep Supabase RLS and server-side authorization as the application security boundary.
- Keep durable workflow state, approvals, outcomes, idempotency keys, and audit history in Supabase.
- Treat Redis failure as a degraded transient-support condition where safe; never make it the only copy of a business decision.
- Keep OpenClaw disconnected until one narrow adapter proves authentication, callback verification, timeout behavior, emergency stop, and idempotent retry.
- Keep Codex responsible for software changes, tests, reviews, and commits.
- Do not add Hermes, Qdrant, another queue, or another vector store without a new problem statement and Phase 0 approval.
- Keep real sender, payment, calendar, model, and deployment claims behind their separate provider gates.

## Explicitly deferred

- Hosted Supabase migrations `073`–`083` and production parity review.
- A real outbound sender and signed delivery/reply webhook.
- OpenClaw authentication, operations adapter, daemon, and production access.
- Any Hermes-based orchestration layer unless a distinct need is demonstrated.
- Qdrant or any new vector database.
- Active semantic retrieval and long-term vector memory.
- Model defaults until the fixed evaluation protocol produces category-level evidence.
- Image, video, speech, and music model integrations.

The canonical owner-action checklist remains [full-stack setup outside the terminal](launch/full-stack-external-setup.md).
