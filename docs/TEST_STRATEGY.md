# NeedThisDone — Test Strategy and Suite Inventory

**Status:** working test contract for the private assistant foundation  
**Last audited:** 2026-09-09  
**Progress:** [ROADMAP.md](../ROADMAP.md)  
**Evidence:** [PROJECT_STATUS.md](PROJECT_STATUS.md) and [RELEASE_EVIDENCE.md](RELEASE_EVIDENCE.md)
**Build map:** [BUILD_PROGRESS_MAP.md](BUILD_PROGRESS_MAP.md)

This is the reviewer-facing test map. For every suite it explains what is
protected, why it matters, what evidence it provides, and what it deliberately
does not prove. Test count is not the quality measure.

## TDD definition of done

Every new capability follows this sequence:

1. Write the smallest failing test for the externally meaningful contract.
2. Implement only enough code to make that test pass.
3. Add boundary cases for invalid input, authorization, replay, failure, or
   secret leakage when the capability has those risks.
4. Run the focused test and the relevant broader gate.
5. Record the command, result, limitations, and rollback in the ledgers.

Tests should assert outcomes and safety boundaries, not private function call
counts or incidental implementation structure unless the call itself is the
contract—for example, “do not touch the database before signature validation.”

## Test layers

| Layer | Command/location | Proves | Does not prove |
|---|---|---|---|
| Unit/API | `npm run test:unit:required` | Deterministic validation, authorization, idempotency, adapters, and API outcomes with controlled dependencies | Live Supabase, Redis, Upstash, OpenRouter, Mac, Vercel, or external side effects |
| Contract | Focused tests around schemas, signing, worker payloads, and adapters | Independent components agree on names, shapes, safety flags, and failure behavior | Live client or worker configuration |
| Database/RLS | `npm run verify:database` | SQL constraints, migrations, RLS, security posture, and durable lifecycle rules against disposable local Supabase | Hosted Supabase state or production data |
| Integration | `vitest.integration.config.ts` | Multiple application components working together with controlled local dependencies | Hosted providers or a real worker |
| Accessibility | `npm run test:a11y` | Semantic roles, keyboard behavior, focus, and axe-level regressions | Every browser, device, or screen reader |
| Browser/E2E | `app/e2e` Playwright suites; `npm run test:hermes-mcp:local`; `npm run test:hermes-mcp:hosted` | Route composition, browser auth, approvals, recovery, responsive behavior, visible outcomes, and the stage-by-stage device-independent MCP vertical slice against an explicitly selected environment | Real Mac execution, live provider calls, or customer outcomes unless stated |
| Bridge/worker | `bridge/test` | HMAC, frozen-plan enforcement, loopback RPC, artifact safety, and no-delivery defaults | macOS launchd behavior on Linux, live Gateway credentials, or external effects |
| Live rehearsal | MacBook Pro first, Mac mini later | Configured hardware, network, providers, durable result, and operator handoff | Lower-level regression coverage; this is expensive environment-specific evidence |

## Standard gates

| Command | Purpose | Interpretation |
|---|---|---|
| `npm run verify:code` | Fast application gate | Lint, type-check, required deterministic tests, accessibility tests, and production build |
| `npm run verify:database` | Local persistence/security gate | Disposable local Supabase lint, schema manifest, RLS, recovery, and integration checks |
| `npm run test:retained-smoke` | Public desktop/mobile smoke | Retained public routes and recovery paths; not private worker proof |
| `npm run test:browser-harness` | Browser boot contract | Separates harness startup failures from product failures |
| `npm run test:hermes-browser` | Hermes UI contract | Plan preview and approval using controlled internal endpoints; no provider or worker dispatch |
| `npm run test:hermes-mcp:local` (also `test:hermes-mcp`) | Local-first MCP control-plane diagnostic | Runs `verify:database` first against the real local Supabase instance, then calls the local `/api/mcp` route and reports health, vector configuration, authentication, discovery, Hermes start/list/status, and the exact missing boundary; dummy credentials do not count |
| `npm run test:hermes-mcp:hosted` | Hosted Supabase read-only preflight | Uses an explicit non-local `BASE_URL`, skips the local web server, and proves the deployed app's server-side Supabase/Redis health plus MCP auth/handshake/discovery and safe read-only listing; it never starts a hosted workflow |
| `npm run test:hermes-mcp:full` | Full local worker-rehearsal diagnostic | Runs the local database gate first, then adds signed worker status, terminal workflow polling, and the semantic-memory projection checkpoint; requires explicit approved-rehearsal environment values |
| `npm test` in `bridge/` | Private bridge suite | Bridge logic and worker safety; macOS-only assertions need macOS evidence |

The latest recorded application gate passed 70 deterministic unit/API files
with 370 tests and 6 accessibility files with 60 tests. The database/RLS
suites are intentionally excluded from the fast unit command and belong to
`verify:database`; they are not missing.

The Hermes vertical slice has an intentional environment order:

1. `npm run test:hermes-mcp:local` proves the real local Supabase database/RLS
   gate first, then proves the local application, Redis, vector configuration,
   MCP transport, and Hermes control-plane boundary. The command refuses a
   remote `BASE_URL` or non-local Supabase target.
2. Only after the local run passes, `npm run test:hermes-mcp:hosted` runs against
   the deployed app. Its `/api/health` response is the hosted server-side
   Supabase/Redis check; the test process's local `.env.local` is not used as a
   substitute for hosted connectivity. The hosted profile is read-only by
   default and does not call `start_workflow`.
3. A hosted workflow creation or worker execution is a separate approved
   rehearsal. It requires `HERMES_MCP_E2E_ALLOW_REMOTE_WRITE=true`, a controlled
   idempotency key or fixture, and the corresponding hosted bridge credentials
   outside Git.

## Application suite inventory

### Private boundaries and retirement guards

| File | What it protects | Why important | Not tested |
|---|---|---|---|
| `ai-employee-boundary.test.ts` | Private assistant capabilities and approval boundary | Keeps public scope away from private execution | A real worker/deployment |
| `capability-manifest.test.ts` | Route capability classification/completeness | Keeps exposed HTTP surface reviewable | Every provider authorization |
| `feature-inventory.test.ts` | Supported feature inventory and retired entries | Detects stale features returning | Browser behavior |
| `google-first-auth-boundary.test.ts` | Single approved identity boundary | Prevents stale/second auth paths | Hosted OAuth |
| `private-operator-boundary.test.ts` | Operator-only access and draft-only handoffs | Protects private data and approval-before-send | GitHub delivery |
| `route-hygiene.test.ts` | Public routes, sitemap, redirects, private indexing | Prevents accidental public exposure | Search-engine crawling |
| `transactional-email-boundary.test.ts` | Durable keys and provider boundary | Prevents duplicate/unaudited email effects | Provider delivery |
| `repository-documentation.test.ts` | Canonical docs and links | Keeps architecture/proof discoverable | Whether a human followed docs |
| `retired-content-systems.test.ts` | Legacy chatbot/page embeddings/content remain retired | Prevents vector work restoring the old product | Private vector availability |
| `retired-developer-surface.test.ts` | Retired developer routes/links | Keeps unsupported tooling absent | Coding worker behavior |
| `retired-inline-editor-surface.test.ts` | Retired editor surface | Prevents old control plane returning | External editor integrations |
| `retired-lms-surface.test.ts` | LMS routes/enrollment/navigation | Keeps current product boundary coherent | Acadio behavior |
| `retired-local-tooling.test.ts` | Unused tooling/dependencies | Reduces unsupported maintenance surface | Whether every unused package is harmful |
| `retired-order-commerce-surface.test.ts` | Storefront/cart/order/payment routes | Prevents retired commerce returning | Future billing work |
| `retired-storefront-surface.test.ts` | Retired storefront links/providers | Protects public boundary | A live storefront |

### API route suites

| File | What it protects | Why important | Not tested |
|---|---|---|---|
| `api/admin-users-role.test.ts` | Server-owned operator roles | Prevents metadata-based authorization | Hosted role data |
| `api/agent-bridge-status.test.ts` | Signed worker status and heartbeat reads | Protects worker identity/status disclosure | Live Mac worker |
| `api/calendar-operations.test.ts` | Server IDs, idempotency, delete reasons | Prevents forged/repeated calendar actions | Google Calendar |
| `api/consultation-persistence.integration.test.ts` | Consultation persistence with local database | Proves one real local integration | Hosted persistence |
| `api/employee-decisions.test.ts` | Authenticated decisions, conflicts, deferrals | Protects human approval state | Real operator session |
| `api/employee-workspace.test.ts` | Truthful empty/missing/unknown states | Prevents false success in control plane | Real customer workspace |
| `api/google-calendar-callback.test.ts` | OAuth state ownership and token storage | Prevents cross-user token attachment | Google OAuth |
| `api/offering-checkout.test.ts` | Retained offers and project fallback | Keeps commercial scope compatible | Stripe checkout |
| `api/operator-workflow-runs.test.ts` | Operator access and one-time workflow decisions | Protects durable decisions | Queue behavior |
| `api/project-access.test.ts` | Project access outcomes | Prevents unauthorized reads | Hosted RLS |
| `api/project-files-access.test.ts` | Private asset authorization | Protects project files | Storage availability |
| `api/project-github-handoffs.test.ts` | HTTPS-only drafts and explicit sending | Prevents unapproved GitHub actions | GitHub API delivery |
| `api/prospecting-resend-webhook.test.ts` | Signed receipt and retryable failures | Prevents spoofed/lost inbound events | Resend delivery |
| `api/prospecting-send.test.ts` | Approval, emergency stop, suppression | Protects no-unapproved-outreach rule | External message |
| `api/resend-reconciliation.test.ts` | Durable provider reconciliation/replay | Prevents duplicate/ambiguous delivery accounting | Resend availability |
| `api/stripe-webhook.test.ts` | Signature, mode, amount, currency, replay | Protects billing persistence | Money movement |
| `api/supabase-auth-bridge.test.ts` | Cross-origin/token verification bridge | Keeps Supabase identity authoritative | Hosted sessions |
| `api/transactional-resend-webhook.test.ts` | Raw-body signature and retry state | Protects inbound mail integrity | Real delivery |
| `api/website-fix-invoices.test.ts` | Server-owned invoice IDs/retries | Prevents forged billing operations | Stripe |

### Library suites

| File | What it protects | Why important | Not tested |
|---|---|---|---|
| `lib/api-auth.test.ts` | Shared auth responses | Keeps route boundaries consistent | Identity uptime |
| `lib/auth-options.test.ts` | Session callbacks/configuration | Prevents session-shape drift | OAuth behavior |
| `lib/auth-redirect.test.ts` | Safe redirect destinations | Prevents open redirects | Browser navigation |
| `lib/calendar-operation-service.test.ts` | Durable calendar state transitions | Makes retries deterministic | Google Calendar |
| `lib/calendar-provider.test.ts` | Provider normalization | Keeps provider details replaceable | Live API |
| `lib/consultation-request.test.ts` | Intake validation/normalization | Protects public intake contract | Persistence |
| `lib/google-oauth-state.test.ts` | Signed OAuth state/nonce | Prevents callback attacks | Google OAuth |
| `lib/hermes.test.ts` | Plan schema, roles, capabilities, forbidden actions, cost estimates | Protects planner/executor boundary | Model quality |
| `lib/image-unoptimized.test.ts` | Image configuration policy | Prevents unsupported behavior returning | CDN/browser rendering |
| `lib/inbound-email-forwarding.test.ts` | Inbound mail normalization | Keeps mail processing auditable | Provider delivery |
| `lib/model-evaluation.test.ts` | Model selection/evaluation | Prevents unsafe/unpriced choices | Model quality |
| `lib/offering-catalog.test.ts` | Offer names, prices, destinations | Prevents public offer drift | Conversion |
| `lib/openrouter-core.test.ts` | Request policy, pricing, structured output | Protects provider/cost boundary | OpenRouter request |
| `lib/openrouter-model-config.test.ts` | Allowed model catalog | Prevents model-policy drift | Current catalog |
| `lib/operator-access.test.ts` | Operator decisions | Protects private routes | Hosted roles |
| `lib/prospect-dossier.test.ts` | Prospect normalization | Makes worker inputs deterministic | Real prospect data |
| `lib/prospecting-benchmark.test.ts` | Quality benchmark calculations | Protects evaluation semantics | Business outcome |
| `lib/prospecting-delivery-service.test.ts` | Delivery operation/provider boundary | Prevents direct/unapproved sending | External delivery |
| `lib/prospecting-webhook-service.test.ts` | Webhook normalization/retry state | Makes events replay-safe | Resend network |
| `lib/prospecting.test.ts` | Prospecting validation/suppression | Protects outreach safety | Campaign execution |
| `lib/provider-adapters.test.ts` | Provider adapter contracts/disabled behavior | Keeps providers replaceable/fail-closed | Live provider |
| `lib/public-offers.test.ts` | Public offer compatibility | Prevents pricing/copy drift | Customer response |
| `lib/public-url.test.ts` | Canonical URLs | Prevents malformed links/leaks | DNS/deployment |
| `lib/rate-limit.test.ts` | Rate-limit decisions/fallback | Protects abuse controls | Distributed Redis races |
| `lib/request-fingerprint.test.ts` | Hashing/dedup identity | Prevents duplicate operations | Distributed races |
| `lib/site-analyzer.test.ts` | Analyzer/report normalization and fallback | Protects retained analyzer contract | Scan quality |
| `lib/transactional-email-service.test.ts` | Event keys/provider construction | Prevents email side effects duplicating | Provider delivery |
| `lib/vector-memory.test.ts` | Optional vector status, namespaced upsert/query, bounds, timeout, redaction | Proves semantic memory cannot leak or become durable truth | Live index/embedding quality |
| `lib/hermes-mcp-contract.test.ts` | Exact three-tool surface, bounded start requests, approval-gated results, status states, and cursor-bounded listings | Proves ChatGPT can use one stable device-independent contract without receiving internal records or bypassing approval | MCP transport, Hermes persistence, worker dispatch, or live device connectivity |
| `lib/vision-intake.test.ts` | Intake answers, limits, aliases | Protects public intake behavior | Browser rendering |
| `lib/wcag-contrast.test.ts` | Contrast calculations | Protects design-token readability | Full axe coverage |
| `lib/website-fix-invoice-service.test.ts` | Invoice creation/retry semantics | Keeps billing durable/idempotent | Stripe |

## Database/RLS and recovery inventory

These suites are intentionally excluded from the fast unit command and run via
`npm run verify:database` against disposable local Supabase.

| File | What it protects | Why important | Not tested |
|---|---|---|---|
| `lib/agent-operations-rls.test.ts` | Agent-operation RLS/lifecycle access | Protects durable worker state | Hosted RLS |
| `lib/ai-employee-rls.test.ts` | Private assistant table policies | Prevents cross-owner access | Production data |
| `lib/hermes-lifecycle-rls.test.ts` | Hermes plan/run/task RLS/transitions | Protects durable orchestration | Standalone Hermes |
| `lib/prospecting-rls.test.ts` | Prospecting policies | Protects private prospects | Hosted RLS |
| `lib/provider-workflow-recovery.test.ts` | Provider failure/recovery state | Makes retries truthful | Live provider recovery |
| `lib/retained-schema-manifest.test.ts` | Retained schema/migration manifest | Detects stale/missing objects | Hosted parity |
| `lib/security-hardening.test.ts` | Local schema security checks | Blocks RLS/exposure regressions | Hosted security |

## Accessibility/component inventory

| File | What it protects | Why important | Not tested |
|---|---|---|---|
| `components/AnalyzerForm.a11y.test.tsx` | Form labels, announcements, pending/error recovery, axe | Protects public analyzer | Every screen reader |
| `components/Button.a11y.test.tsx` | Button/link semantics, loading/disabled/focus, axe | Protects shared primitive | Full page flows |
| `components/ContactIntake.a11y.test.tsx` | Intake labels, validation, pending/report handoff | Protects primary intake | Backend persistence |
| `components/PublicHeader.a11y.test.tsx` | Header navigation semantics | Protects route discovery | Responsive layout |
| `components/StarRating.a11y.test.tsx` | Readonly/interactive radio semantics/focus | Protects shared control | Persistence |
| `components/StatusBadge.a11y.test.tsx` | Status semantics/labels/sizes | Protects truthful state display | Live workflow state |
| `components/consultation-calendar.test.ts` | Time-slot and weekday calculations | Protects booking choices | Provider availability |
| `components/stagger-container.test.ts` | Animation props do not reach native DOM | Prevents runtime warnings | Visual quality |

## Public language and browser inventory

| File | What it protects | Why important | Not tested |
|---|---|---|---|
| `public-language.test.ts` | Promise, copy limits, legal/offer wording, report claims | Prevents unsupported public claims | Conversion |
| `public-journey-simplification.test.ts` | Homepage navigation, `/system` boundary, offer separation, metadata | Keeps public journey intentional | Visitor behavior |
| `e2e/ai-employee-product.spec.ts` | Retained public pages/presentation | Protects route composition | Live worker/provider |
| `e2e/ai-employee-workspace.spec.ts` | Private workspace routes | Protects control plane | Hosted auth/data |
| `e2e/authenticated-employee-workspace.spec.ts` | Controlled browser auth/workspace | Proves browser contract | Real user/worker |
| `e2e/browser-harness.spec.ts` | Browser startup/route load | Isolates harness failures | Full workflow |
| `e2e/daily-cockpit.spec.ts` | Daily operator cockpit | Protects review flow | Worker completion |
| `e2e/hermes-plan-preview.spec.ts` | Draft preview/approval UI | Protects review before dispatch | Provider/Redis/Mac |
| `e2e/hermes-mcp-vertical-slice.spec.ts` | Real application diagnostic for health, MCP auth/handshake/discovery, Hermes start/list/status, and optional signed-worker/full-execution checkpoints; attaches a redacted stage report | Shows the first missing connected boundary when the operating-system path is run | Production OAuth, remote ChatGPT reachability, workflow persistence until the dispatcher is wired, live vector projection, or external effects |
| `e2e/prospecting-workspace.spec.ts` | Prospect review/suppression UI | Protects operator controls | Outreach |
| `e2e/retained-core-smoke.spec.ts` | Public/mobile smoke matrix | Catches route/overflow/recovery regressions | Hosted/customer results |

## Bridge/worker inventory

| File | What it protects | Why important | Not tested |
|---|---|---|---|
| `bridge/test/bridge.test.mjs` | Signed requests, URL safety, rehearsal config, launchd rendering | Protects private outbound boundary | macOS launchd on Linux |
| `bridge/test/mac-worker.test.mjs` | Env parsing, activation confirmation, local/HTTPS modes | Prevents accidental activation/shell evaluation | Running Mac mini |
| `bridge/test/openclaw-proof.test.mjs` | Gateway handshake, task evidence, model usage, frozen-plan/no-delivery behavior | Proves replaceable non-sender worker | Live credentials/external effects |

## Consolidation rules

The 2026-09-09 audit removed no behavior assertions. The apparent volume is
mostly separate security boundaries, retirement guards, and parameterized UI
coverage. The first consolidation target is shared setup and fixtures, not
coverage deletion.

Before removing or merging a test, record the duplicated invariant, the
surviving test, why its failure remains actionable, and the focused/broader
gates rerun afterward. Keep tests separate when they protect different owners,
authorization decisions, failure states, or user-visible routes. Replace tests
that only mirror private implementation details with public-contract tests.

## Explicit gaps

The diagnostic suite now gives one command a stage-by-stage report, but the
target operating-system path still does not pass end to end:

- the three-tool MCP schemas, local authenticated Streamable HTTP handler, and
  opt-in diagnostic exist, but production OAuth/connector setup, remote
  reachability, and Hermes persistence wiring are not verified;
- Hermes remains an application planning role, not yet the standalone workflow
  service in the architecture;
- Redis is not yet the workflow queue/lease/heartbeat layer;
- the full diagnostic cannot safely claim worker execution until an explicitly
  approved workflow fixture and live signed worker are supplied;
- semantic-memory configuration is observable through health, but no workflow
  currently exposes a safe end-to-end vector projection probe;
- no coding worker has completed an isolated task and returned a GitHub commit;
- MacBook Pro rehearsal and Mac mini activation have not occurred;
- no live Upstash Vector index or Vercel environment configuration is verified;
- no hosted, provider, paid-action, external-message, or customer-result proof
  is implied by local tests.

Run `npm run test:hermes-mcp` after copying and filling the private local
environment. Use `npm run test:hermes-mcp:full` only for a separately approved
worker rehearsal, with `MCP_E2E_WORKFLOW_ID`, `MCP_E2E_OWNER_ID`,
`MCP_E2E_WORKER_ID`, and the server-side bridge secret supplied outside Git.
The next TDD increment should replace the unavailable default MCP dispatcher
with a durable Hermes adapter and then make the diagnostic's next stage pass.
