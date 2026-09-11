# NeedThisDone — Project Status

**Branch:** `feature/system-page-plain-english-2026-09-11` (branched from `dev` at `c0d4cdedbe2162bb2c8e965ecda009d31eaf6394`)
**Last updated:** 2026-09-11

## Latest change

- On 2026-09-11, the public `/system` page was reorganized so its workflow
  and technical-layer cards lead with a short plain-English explanation and
  place the technical detail directly beneath it in the same card. The
  operating path keeps its existing six steps, the architecture rail keeps
  its 11 named layers, and the proof-state language, route boundaries, and
  system-map controls are unchanged. This is a presentation and public-copy
  change only; it adds no workflow, API, database, authentication, worker, or
  deployment behavior. `npm run test:unit` passed 75 files / 400 tests, with
  one skipped file and four expected skips; lint, type-check, production build,
  and `git diff --check` passed. Browser rendering remains pending because
  Chromium is unavailable here.

- On 2026-09-11, the authenticated owner-results slice was added on the
  feature branch. `/dashboard` now requires a Supabase session and presents a
  simple request/status/results workspace with a chat-style update thread;
  the former operator cockpit is preserved at `/admin/operations` behind the
  existing database-backed operator guard. `GET /api/workspace` reads only the
  current owner's durable `agent_plans`, runs, events, artifacts, and immutable
  artifact versions. Migration `114_authenticated_workspace_read_surface.sql`
  adds read-only `auth.uid() = owner_id` policies for those records; it grants
  no create, approval, dispatch, worker-control, credential, or merge authority.
  Focused route, manifest, auth-boundary, public-language, lint, type-check,
  required unit suite (75 files / 400 tests passed; 1 skipped file and 4
  expected skips), and production build checks pass. Local Supabase/RLS
  application and browser recheck remain pending in this environment; no hosted
  migration, deployment, customer workflow, worker activation, external message,
  publication, or spend occurred. The existing unauthenticated contact intake
  is not yet linked to an owner record; accepted-work provisioning remains a
  separate next slice.

- On 2026-09-10, the MCP account-authentication boundary was rebuilt directly
  from clean `origin/dev`: migration `113_mcp_access_tokens.sql` stores only a
  SHA-256 token hash and short prefix with service-role-only table access and
  RLS; server-only utilities generate and validate `ntd_mcp_` credentials; and
  `/api/mcp` now requires a bearer credential, rejects malformed/revoked/
  expired/origin/storage failures, records `last_used_at`, and passes the
  resolved owner and credential context into the Hermes contract. The existing
  static bearer is retained only as a temporary owner-bound bootstrap when both
  `MCP_BEARER_TOKEN` and `MCP_BEARER_TOKEN_OWNER_ID` are configured.
  Authenticated admin/operator routes list redacted credentials, create a raw
  token only in the one-time creation response, and revoke only within the
  current owner; Account Settings exposes the same lifecycle. Focused tests
  cover token utilities, authentication, API redaction/scoping, MCP context
  propagation, and local RLS constraints. Local validation results are being
  recorded below as they run; no hosted migration, deployment, secret
  provisioning, provider activation, worker activation, external message,
  publication, or spend occurred.

- On 2026-09-10, the local validation boundary completed on the disposable
  Supabase instance. `npm run verify:code` passed lint, type-check, 74 required
  unit files / 395 tests, 6 accessibility files / 60 tests, and the production
  build. `npm run verify:database` passed local schema lint, the retained schema
  manifest (9 tests), security (14), assistant RLS (10), agent-operations RLS
  (3), Hermes lifecycle (2), MCP credential RLS (4), prospecting RLS (2),
  provider recovery (7), and consultation integration (1); migration 113 was
  applied by the disposable local reset. `npm run test:hermes-mcp:local` reran
  that database gate and attached the redacted report at
  `app/test-results/hermes-mcp-vertical-slice--5ee1b-mes-→-worker-vertical-slice-mcp-control-plane/hermes-mcp-vertical-slice.json`.
  The diagnostic passed local target/application health and unauthenticated
  MCP rejection, but intentionally failed at `vector-memory.configuration`
  (`not_configured`) and `mcp.credentials` (no disposable account credential
  or owner-bound bootstrap value), leaving MCP initialization, tool discovery,
  and Hermes workflow stages blocked. Vector-memory runtime and durable
  MCP-to-Hermes dispatch remain pending. `git diff --check` passed at the
  validation boundary. This is local-only evidence; no hosted migration,
  deployment, secret provisioning, provider activation, worker activation,
  external message, publication, or spend occurred.

- On 2026-09-10, `/system` was simplified to one canonical six-step operating
  path. The page now explains, in plain English, how any compatible LLM client
  calls the authenticated MCP/API contract, how NeedThisDone coordinates the
  approved work, and how the result returns to that initiating client. ChatGPT
  is identified as the current client rather than a platform dependency.
  Repeated comparison, execution-loop, coding-lane, and daily-loop sections
  were removed; the technical architecture rail and four proof lanes remain.
  Route assertions and documentation were updated together. Browser recheck is
  pending because Playwright Chromium is not installed in this environment.

- On 2026-09-10, the architecture language was broadened from named machines
  to a platform-neutral worker-host contract. ChatGPT, Claude, another LLM, or
  a custom client may use the same MCP/API surface, and Hermes/OpenClaw may run
  on any correctly configured local computer, private server, or cloud machine.
  The MacBook Pro and Mac mini remain documented as current examples only.

- On 2026-09-10, `/system` gained a short closing comparison so the page ends
  with the benefit in plain English: an LLM can answer and call tools, while
  NeedThisDone adds durable Supabase state, Redis coordination, selected vector
  retrieval, Hermes/workers, and reviewable evidence around that conversation.
  This comparison is intentionally a summary, not a second operating path.

## Current facts

- The reviewer-facing [test strategy and suite inventory](TEST_STRATEGY.md)
  now records the purpose, value, limitations, commands, and file-level scope
  of the unit, contract, database/RLS, integration, accessibility, browser,
  bridge, and live-rehearsal layers. It also defines the TDD definition of done
  and requires evidence before any test is consolidated or removed.

- On 2026-09-09, the first MCP TDD increment defined and tested the exact
  device-independent tool surface: `start_workflow`, `get_workflow_status`,
  and `list_workflows`. The schemas bound request sizes, reject server-owned
  fields, require approval-gated start results, validate reviewable status
  envelopes, and bound list cursors. This remains the transport-neutral
  contract underneath the endpoint; Hermes persistence, worker dispatch, and
  Mac connectivity are still separate proof items.

- On 2026-09-09, the MCP transport increment added a single Next.js
  `/api/mcp` Streamable HTTP boundary with JSON-RPC initialization, tool
  discovery, tool calls, protocol validation, body bounds, origin checks, and
  a constant-time bearer-token seam. The route is classified in the capability
  manifest and the opt-in `npm run test:hermes-mcp` Playwright diagnostic now
  exercises the real route from health through MCP discovery and workflow
  calls. Seven focused transport tests pass. The handler currently uses an
  unavailable Hermes adapter by default, so no workflow is persisted or
  dispatched yet. Production OAuth/connector setup, secure remote reachability,
  and live Hermes wiring remain separate proof items.

- On 2026-09-09, the MCP vertical-slice diagnostic was run against a disposable
  local test environment with dummy, non-secret values. It reported the exact
  current gaps: Supabase and Redis were unavailable, vector memory was
  `not_configured`, and the default MCP dispatcher returned the deliberate
  `Hermes workflow service is unavailable` tool error; the test attached a
  redacted stage report and failed rather than treating those gaps as a pass.
  A run without even the private local environment failed earlier at the
  Playwright web-server boot because required Supabase variables were absent.
  The normal diagnostic remains draft/control-plane scoped; the `:full` mode
  additionally requires an explicitly approved workflow fixture and signed
  worker. No hosted writes, worker claims, external actions, or credentials
  were made.

- On 2026-09-09, the MCP diagnostic was split into explicit environment
  profiles so the evidence cannot mix local and hosted state. The default
  `test:hermes-mcp:local` (also `test:hermes-mcp`) runs `verify:database` first
  against the real local Supabase instance, then requires a localhost app and
  `NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321` before running the live
  application health/MCP stages. `test:hermes-mcp:hosted` requires an explicit
  non-local `BASE_URL`, checks the deployed app's server-side Supabase and
  Redis health, and remains read-only: it does not call `start_workflow`.
  Hosted workflow creation and worker execution remain separately approved
  and require explicit remote-write credentials outside Git. The previously
  recorded dummy-value run is diagnostic evidence only, not local-Supabase
  proof.

- On 2026-09-09, the assistant infrastructure audit confirmed the current
  rehearsal examples: the MacBook Pro is Abe's interactive development and
  coding machine, and the Mac mini is the intended always-on private worker.
  The architecture remains host-neutral: a correctly configured local computer,
  private server, or cloud machine can fill the worker-host role. Existing Redis is
  wired through `REDIS_URL` and the Node Redis client for cache, rate limiting,
  request deduplication, and health checks; it is not currently the agent task
  queue. No live Upstash Vector or Qdrant connection is verified, and the
  legacy chatbot/page-embedding system was retired in `c5989bd8`. The build now
  includes a private, optional Upstash Vector adapter using
  `UPSTASH_VECTOR_REST_URL`, `UPSTASH_VECTOR_REST_TOKEN`, and optional
  `VECTOR_MEMORY_NAMESPACE`; it uses derived semantic memory only and does not
  restore public chat or page indexing. The values must be configured only in
  the selected worker-host and intended Vercel server-side environments, never
  in browser variables, Git, prompts, logs, Redis, or
  durable business rows. The adapter request/response contract has six passing
  unit tests, and the application code gate passed lint, type-check, 70 unit
  files/370 tests, 6 accessibility files/60 tests, and production build. Live
  vector connectivity, Vercel configuration, and Mac-mini activation remain
  unverified and separately approved.

- On 2026-09-09, the public homepage journey was simplified so the primary
  navigation and homepage sections stay focused on What We Do, How We Work,
  Examples, and Why Us. The homepage The System bridge and its CTA were
  removed; the hero and closing section keep Share Your Vision as the dominant
  action. `PUBLIC_HOME_JOURNEY` now drives the four-section anchor sequence,
  and How We Work remains part of the primary reassurance path before Examples.
  `/system` remains a complete, discoverable technical-details page with its
  direct contact and implementation links, canonical metadata, sitemap entry,
  and direct route contract; it is now available from the explicit footer
  Explore link rather than required for conversion. The `/how-it-works` closing
  handoff now goes to `/work`. `npm run verify:code` passed lint, type-check,
  67 unit files/352 tests, 6 accessibility files/60 tests, and production
  build. `npm run test:retained-smoke` ran 96 public desktop/mobile checks:
  81 passed and 11 expected skips; four existing report-fixture checks remain
  unavailable because the default local report ID returns 404 and the snapshot
  handoff stays on `/site-analyzer`; owner: application test owner, follow up
  by 2026-09-16. `git diff --check` passed. Owner review is pending before
  publication. No API, schema, billing, deployment, hosted write, provider
  activation, Mac activation, external message, customer result, or spend
  occurred. Rollback is a reviewed Git revert on `dev`.

- On 2026-09-09, the public `/system` page was aligned with the current
  assistant architecture. It now opens with a plain-English five-card flow
  explaining the difference between prompting ChatGPT alone and using
  NeedThisDone as the durable coordination layer. Its technical section names
  ChatGPT, MCP, Next.js/Vercel, Hermes, Supabase, Redis, Upstash Vector, the
  local/cloud worker-host model (with MacBook Pro/Mac mini examples), OpenClaw with its Codex runtime, GitHub, and
  OpenRouter, and each
  card explains its job and current proof state. The page explicitly marks
  hosted reachability, Hermes persistence, live vector projection, and worker
  activation as pending rather than implying they are live. The existing
  `/system` responsive/accessibility contract was expanded to cover the new
  flow and the architecture rail now has 11 named layers; browser execution
  is pending in this environment because the Playwright Chromium executable is
  not installed. Lint and type-check passed. No deployment or hosted action
  occurred.

- On 2026-09-10, the `/system` progress section became code-owned through
  `app/lib/system-progress.ts`. It now presents four proof gates—Contract,
  Local control plane, Hosted control plane, and Worker execution—with the
  evidence target for each gate. A focused unit test protects the order and
  requires every gate to name evidence. This gives the visual page a durable,
  test-backed progress source without claiming that hosted services or either
  Mac is live.

- On 2026-09-09, the `/system` page gained a dedicated six-card visual operating
  path: a compatible LLM client → hosted NeedThisDone MCP → Supabase and Redis
  → Hermes on the configured worker host → OpenClaw with its Codex runtime →
  the durable result returned to the initiating client. Each card explains the component in plain English, including why
  Redis is temporary coordination and why Upstash Vector is selected searchable
  memory rather than business truth. The page also states that the hosted MCP
  connection does not require opening the dashboard; `/system` is an optional
  visual explanation and evidence view. The route contract now asserts the new
  six-card lane and result-back labels.

- On 2026-09-09, the public promise was broadened to “NeedThisDone helps
  teams and individuals solve technology problems and simplify repeated work
  with clear, focused solutions.” The homepage no longer uses a demographic
  audience label. Its hero, What We Do section, `/services`, `/how-it-works`,
  `/about`, `/contact`, and `/faq` now use direct issue-resolution language:
  find the issue, agree on the work, help fix it, and show what changed.
  Websites, workflows, tools, and repeated work remain valid starting points;
  focused scope remains a delivery guideline, not a limit on what someone can
  bring. The FAQ now explains that another piece of work can be discussed
  separately, and the shared offer presentation keeps the same reassurance
  without changing Website Fix at $500 or proposal-based Managed Automation.
  The central promise still feeds metadata, social previews, JSON-LD, footer,
  report email, and offer summaries. `npm run verify:code` passed lint,
  type-check, 67 unit files/352 tests, 6 accessibility files/60 tests, and
  production build; the focused public-language checks passed 24/24 and
  `git diff --check` passed. `npm run test:retained-smoke` ran 96 public
  desktop/mobile checks with 81 passed and 11 expected skips. Four report
  fixture checks remain unavailable: the default local report ID returns 404,
  and the snapshot handoff stays on `/site-analyzer`; owner: application test
  owner, follow up by 2026-09-16. Owner review is pending before publication.
  No API, schema, billing, deployment, hosted write, provider activation, Mac
  activation, external message, customer result, or spend occurred. Rollback
  is a reviewed Git revert on `dev`.

- On 2026-09-08, the anonymous public language audit and rewrite covered all
  16 sitemap pages, the three retained articles, analyzer and report states,
  runtime recovery states, and legacy redirects. `PUBLIC_CORE_PROMISE` now
  supplies the shared promise for homepage copy, metadata, social previews,
  JSON-LD, footer copy, and offer summaries. Public report output no longer
  presents score, grade, lawsuit, legal-risk, certification, or AI-powered
  claims; the existing score/grade data fields remain for compatibility.
  Generated report prose now has short-sentence and claim guards with a
  deterministic fallback. The four-step intake, offer names/prices, intake
  payload, route destinations, API/schema, billing behavior, private-system
  boundary, and legal disclosures remain unchanged in meaning. The audit is
  recorded in `docs/PUBLIC_LANGUAGE_AUDIT.md`. `npm run verify:code` passed
  lint, type-check, 67 unit files/350 tests, 6 accessibility files/60 tests,
  and production build. The retained anonymous Chromium suite passed 83 tests
  with 11 expected project skips across desktop and mobile projects, including
  the 375/768/1280 route, report, redirect, intake, accessibility, overflow,
  and console-error checks. `git diff --check` passed. The development server
  still emits existing listener-count and reduced-motion informational
  warnings during browser compilation. Legal and generated-report copy need
  owner review before publication. No deployment, publication, hosted write,
  provider activation, Mac activation, external message, customer result, or
  spend occurred. Rollback is a reviewed Git revert on `dev`.

- On 2026-09-08, the public homepage became a guided, single-page version of
  the public navigation. `PUBLIC_HOME_JOURNEY` is the shared source for the
  five homepage section IDs and route destinations; on `/`, the header links
  to `/#what-we-do`, `/#how-it-works`, `/#the-system`, `/#examples`, and
  `/#why-us`, while the same header keeps full route links everywhere else.
  The homepage now follows that order and ends in the Share Your Vision CTA.
  The hero is intentionally lighter; the three-beat visual appears once in
  the How We Work section instead of competing with the first screen. The
  existing sticky React header is the single journey map; there is no second
  progress bar. Each homepage section ends with a data-driven next-step link,
  and the `/services`, `/how-it-works`, `/system`, and `/work` closing actions
  hand visitors to the same next route before the final Share Your Vision
  action. The full `/services`, `/how-it-works`, `/system`, `/work`, and
  `/about` routes remain available for deeper reading.
  `/about` now answers Why Us with bounded-work, context, owner-decision, and
  proof standards, while `/how-it-works` remains the concrete five-step
  process; source coverage verifies that their central explanations do not
  repeat each other. `/pricing` now gives each offer a shared price band,
  fixed desktop detail-row bands, flex-pushed details, and a shared action
  baseline, so `$500 total` and `Priced by proposal` no longer cause intrinsic
  sizing drift between cards. The full public/mobile browser run passed 65
  tests with 11 expected skips, including no-overflow checks for the homepage,
  pricing, and both differentiated pages, the pricing row geometry assertion,
  the homepage anchor and next-step contract, reduced motion, and main-content axe
  checks. The exact `npm run verify:code` gate passed lint, type-check, 66 unit
  files/339 tests, 6 accessibility files/60 tests, and production build.
  `git diff --check` passed. Reviewed local screenshots include
  `/tmp/homepage-trailer-375.png`, `/tmp/homepage-trailer-1280.png`, and
  `/tmp/pricing-aligned.png`.
  Rollback: revert this presentation, test, and ledger diff on `dev`; no data
  or external state needs rollback. No API/schema, deployment, hosted write,
  provider activation, Mac activation, publication, external message,
  customer result, or spend occurred.

  This five-section arrangement was superseded on 2026-09-09 by the
  optional-system homepage path recorded above.

- On 2026-09-08, the public journey was split so `/services` answers what help
  is available and `/work` answers what a useful change could look like.
  `PUBLIC_OFFERS` now owns the two concise fit descriptions, and the typed
  `PUBLIC_EXAMPLES` collection owns exactly three illustrative before/after
  stories with optional related offer IDs. `/services` renders exactly two
  data-driven offer cards with each name, fit, existing summary, existing
  price, distinct accent/icon, and detail link; its repeated process and
  service illustrations are gone. Each offer card now groups its header, fit,
  summary, and action into shared desktop grid rows, so wrapped copy does not
  move the divider, price, or detail link; mobile cards remain naturally
  stacked. `/work` renders three full-width stories
  with Before, After, and What changed panels, uses side-by-side comparisons
  from 768 pixels upward, and shows a visible transition between stacked
  panels on mobile. The first two related links derive their names and
  destinations from `PUBLIC_OFFERS`; the third remains Share Your Vision.
  Homepage offer previews now use centralized fit copy, and homepage example
  cards contain only a title and one short teaser linked to `/work`.
  Focused public services Chromium checks passed 2/2, including the desktop
  card-row geometry assertion; the matching public-mobile services check passed
  1/1. The retained public/mobile smoke suite passed 80 tests with 8 expected
  skips. Screenshots reviewed are `/tmp/services-aligned.png` and
  `/tmp/services-aligned-mobile.png`. The new `/work` responsive matrix
  checked 375, 768, and 1280 pixels for layout, overflow, console/page
  errors, and main-content axe violations; screenshots are
  `/tmp/public-examples-375.png`, `/tmp/public-examples-768.png`, and
  `/tmp/public-examples-1280.png`. The code gate passed lint, type-check,
  66 unit files/338 tests, 6 accessibility files/60 tests, and production
  build; `git diff --check` passed. Rollback: revert this presentation, test,
  and ledger diff on `dev`; no data or external state needs rollback.
  No deployment, hosted change, provider activation, Mac activation,
  publication, external message, customer result, or spend occurred.

- On 2026-09-08, the public presentation refresh simplified homepage, services,
  process, about, examples, contact labels, and system-introduction copy.
  Homepage teaser beats now read “Tell us what’s stuck”, “Choose what to
  change”, and “Make it real”. Static website/request illustrations add concrete
  examples to the homepage, service list, both offer pages, and examples page.
  Offer heroes split copy and illustration on desktop and stack on mobile;
  pricing emphasizes the existing $500 total/proposal terms, the process uses
  an open timeline, about uses numbered principles, and articles feature the
  first entry. Existing destinations, approval boundaries, and four system
  stages remain intact. Illustrations are examples, not customer results.
  Validation: lint, type-check, 65 unit files/335 tests, 6 accessibility
  files/60 tests, and production build passed. The retained desktop/mobile
  browser suite passed 76 tests with 6 expected skips, including the public
  375/768/1280 accessibility matrix and homepage 375–2048 layout matrix.
  `git diff --check` passed; local preview on port 3000 returned HTTP 200. Desktop/mobile
  screenshots are `/tmp/public-refresh-<route>-<width>.png` at 375 and 1280.
  Rollback: revert this presentation, test, and ledger diff on `dev`.
  No deployment, hosted change, provider activation, or external message occurred.

- On 2026-09-07, the public `/system` route was refreshed as a static editorial
  case study. Its four-stage map names Goal, Owner approval, Private execution,
  and Reviewable proof; both primary CTAs go to `/contact`, and the technical
  proof link goes to the reviewed GitHub tree. Every repeated map, difference,
  execution, architecture, coding, daily-beat, and status group now keeps one
  full-width card per row at 375, 768, 1024, and 1280 pixels. Card internals
  use an approximately `0.65fr / 1.35fr` identity/detail split from 768 pixels
  upward and a readable single column below it; the hero remains copy beside the
  map at wide desktop widths, and architecture/coding sections retain
  intro-plus-visual splits. Vertical connectors appear between every adjacent
  card with no hidden desktop routing or centered odd rows. Focused `/system`
  Chromium checks passed all four target widths with no overflow, connector
  intersections, text escape, hidden connectors, or console/page errors; they
  also verified visible actions, reduced motion, wrapper completeness,
  main-content axe, and `/tmp/system-vertical-375.png`,
  `/tmp/system-vertical-768.png`, `/tmp/system-vertical-1024.png`, and
  `/tmp/system-vertical-1280.png`. The retained public/mobile smoke suite
  passed 76 tests with 6 expected skips. The code gate passed lint, type-check,
  65 unit files/335 tests, 6 accessibility files/60 tests, and production
  build. No schema, API, hosted write, deployment, secret, provider or Mac
  activation, publication, message, or spend occurred.
- Rollback: revert this focused `/system` presentation, test, and
  documentation change on `dev`; no data or external state needs rollback.
- On 2026-09-07, the homepage became the public trailer for the detailed
  `/system` proof. The static server-rendered page keeps the “Your vision,
  brought to life.” promise, `/contact` primary action,
  `/services` secondary action, two offer destinations, and two example
  destinations. Its three-beat teaser names See the friction, Define better,
  and Make it real; the highlighted better-state card, connected signal, offer
  previews, numbered resolution principles, framed examples, and explicit
  `/system` bridge all stay under the dedicated `.homepage-trailer` scope.
  CSS-only glow, entrance, connector, hover, and focus treatments stop their
  active animation or transform under reduced motion. Every teaser, offer,
  principle, example, and bridge-node group now keeps one full-width card per
  row at 375, 768, 1024, and 1280 pixels, with a vertical connector between
  each adjacent card. Card internals use an approximately `0.65fr / 1.35fr`
  identity/detail split from 768 pixels upward and a readable single column
  below it; the hero remains copy beside the teaser at wide desktop widths.
  Focused public Chromium checks passed 7/7, including all four target widths
  with no overflow, connector intersections, text escape, hidden connectors,
  or console/page errors; they also verified visible actions, reduced motion,
  wrapper completeness, main-content axe, keyboard focus, and
  `/tmp/homepage-trailer-375.png`, `/tmp/homepage-trailer-768.png`,
  `/tmp/homepage-trailer-1024.png`, and `/tmp/homepage-trailer-1280.png`.
  The configured mobile project passed 3 applicable checks with 4 expected
  skips. No API, schema, hosted, deployment, publication, provider, Mac,
  customer, message, or spend action occurred.
- Rollback: revert this focused homepage trailer presentation, test, and
  documentation change on `dev`; no data or external state needs rollback.
- On 2026-09-08, the homepage trailer gained a centered desktop content rail
  from 1024 pixels upward: hero, section, and bridge containers use
  `min(80%, 88rem)`, while the closing CTA keeps its narrower
  `min(80%, 57rem)` readability cap. The 375/768 responsive rails remain on
  their existing mobile/tablet widths. At 1024 pixels and above, the What We
  Do intro now stacks its eyebrow, headline, and supporting sentence in one
  left-aligned column while the offer cards remain on the full section rail
  beneath it. The 768–1023 tablet range retains the `1.25fr / 0.75fr` split,
  heading-aligned lead, and `34ch` supporting-copy cap; mobile remains
  unchanged. Wide hero title spans render as three rows. Focused homepage
  Chromium checks passed 3/3 tests across 375, 768, 1024, 1280, and 2048
  pixels, including rail gutters, stacked intro geometry, overflow,
  connectors, text, motion, focus, console/page-error, and main-content axe
  checks. The refreshed screenshots are `/tmp/homepage-trailer-375.png`,
  `/tmp/homepage-trailer-768.png`, `/tmp/homepage-trailer-1024.png`,
  `/tmp/homepage-trailer-1280.png`, and `/tmp/homepage-trailer-2048.png`.
  The retained public/mobile smoke suite passed 76 tests with 6 expected
  skips; the code gate passed lint, type-check, 65 unit files/335 tests, 6
  accessibility files/60 tests, and production build. `git diff --check`
  passed. The restarted local development server on port 3000 returned
  `200 OK`. No API, schema, hosted, deployment, publication, provider, Mac,
  customer, message, or spend action occurred.
- Rollback: revert this focused homepage desktop-rail presentation, test,
  and documentation change on `dev`; no data or external state needs rollback.
- On 2026-09-07, the repository gained a subscription-first Mac worker CLI with
  explicit `preflight`, `prepare`, `test --local`, `start`, `status`, and
  `stop` commands. It discovers absolute Node/OpenClaw paths, keeps the
  `needthisdone` read-only profile separate from the future
  `needthisdone-codex-builder` profile, requires exact confirmation before
  launchd activation, starts the loopback Gateway before the bridge, and
  retains runtime data on stop. The signed bridge now has a read-only worker
  status endpoint for heartbeat, current-task, model, and recent-error
  evidence. No launchd job, provider, bridge, hosted service, secret, or
  external action was activated by this repository change.
- The current Mac host preflight passed Node 22, OpenClaw `2026.8.1`, the
  isolated `needthisdone` read-only proof profile at
  `openai/gpt-5.6-luna` / `max`, Docker Desktop, and the sandbox image. It is
  blocked because the private bridge runtime/environment has not been
  configured and OpenClaw `models status --check` still reports profile-cache
  permission hardening failures (`EPERM`). The local-only `prepare` path and
  review-only launchd renderer are covered by deterministic tests; no real
  bridge or provider execution is claimed.
- On 2026-09-06, `/dashboard`, `/employee`, and `/prospecting` were moved
  behind one server-rendered `requireOperator` boundary. It reads the existing
  Supabase cookie session and the durable `user_roles` admin record, then
  redirects anonymous and non-operator requests to `/login` before any
  workspace component renders. The interactive workspace components remain
  client-side. Direct local HTTP checks returned `307` with `Location: /login`
  for all three routes without a session; focused guard and boundary tests
  passed (24 tests).
- Rollback: revert this focused route-guard change on `dev`; no migration,
  hosted write, deployment, secret change, provider or Mac activation,
  publication, message, or spend occurred.
- Playwright now uses one worker by default while retaining the isolated
  `.next-playwright` output. On 2026-09-06, the provider-free local
  `npm run verify:assembly` gate passed: schema lint, `verify:code` (lint,
  type-check, 64 unit files / 330 tests, 6 accessibility files / 60 tests,
  production build), the serialized 70-test retained public/mobile smoke
  suite, and the authenticated employee, prospecting, daily-cockpit, and
  employee-workspace contracts. `git diff --check` passed. This is local
  Supabase and deterministic browser evidence only; it is not hosted,
  provider, customer, or Mac-runtime proof.
- Remaining limitation: the local retained dev server still emits
  `MaxListenersExceededWarning` messages while compiling many routes. The
  serialized gate passes despite the warnings. Owner: repository maintainer;
  investigate and either remove or document the harness cause by 2026-09-13.
  Rollback: revert the Playwright configuration change on `dev`; no migration,
  hosted write, deployment, secret change, provider or Mac activation,
  publication, message, or spend occurred.

- On 2026-09-05, the approved welcoming public-site review centralized rendered
  header/footer navigation, current-route treatment, offer destinations and
  displayed facts, and reusable closing-section styles. Mobile Escape restores
  trigger focus and route changes close the menu. Pages now connect examples,
  offers, pricing, articles, FAQ, and the optional four-step intake.
- Snapshot feedback now reflects one pending request rather than timed claims.
  Visible labels, announced validation and failure messages, preserved inputs,
  duplicate-submit protection, retry, and report navigation have isolated tests.
  Report actions use public styles and the Website Fix details destination;
  generated-report instructions no longer ask for legal-risk prioritization.
- Legal terms and billing were preserved. Direct email links and sticky-header
  offsets were added. Retained articles have one H1/main, noninteractive tags,
  relevant offer links, keyboard-scrollable code, and immediately visible closing
  actions. The three-post listing has no category controls. Existing aliases,
  redirects, VisionIntakeV1, legacy submissions, and analytics boundaries remain.
- The README and journey plan link the internal communication reference. The
  original framework definitions/examples were missing from the handoff and
  remain explicitly pending from the project owner by 2026-09-06. Only unused
  named default-content exports were removed after caller inspection; maintained
  content structures and private layout defaults remain.
- Final validation: `npm run verify:code` passed lint, type-check, 326 unit
  tests, 60 accessibility tests, and production build; `git diff --check` passed.
  Validation and the route-by-route 375/768/1280 review are recorded in
  RELEASE_EVIDENCE. Initial browser failures exposed duplicate article H1s,
  nested legal landmarks, and unfocusable code regions; those were fixed and
  the responsive main-content axe matrix passed. Stale navigation assertions
  and hydration-sensitive browser selectors were corrected.
- Rollback: use Git revert on the public-site review commit on dev. No schema,
  API contract, hosted rollback, deployment, or external-action change is needed.
  Remaining root-error rendered proof and local dev-server warnings have the
  repository maintainer as owner and a 2026-09-06 follow-up date.

- On 2026-09-05, services and pricing were refined around problem, useful
  change, included work, then price. Both use the existing public palette and
  numbered reassurance strip. PUBLIC_OFFERS owns price-free summaries and
  displayed prices. Website Fix and FAQ payment copy and SEO were aligned;
  billing arrangements and contractual terms were not changed.
- On 2026-09-05, the extra disclaimer above the public Examples scenarios was
  removed to keep the page focused. The operating and release ledgers retain
  the factual boundary that examples do not establish customer or hosted
  proof.
- The four browsable intake steps now distinguish preferences from optional
  800-character pet peeves. The review displays every populated discovery
  answer with an edit link. The desired-change confirmation follows the
  visitor's desired outcome until explicitly edited. Client and server retain
  the same 5,000-character generated-message limit; validation and submission
  errors preserve answers. Version 1, legacy messages, and offer aliases remain
  supported through the existing projects endpoint and JSON context. No
  migration is needed.
- Validation on 2026-09-05: the full `npm run verify:code` gate passed
  (63 unit files / 326 tests; 4 accessibility files / 54 tests; lint,
  type-check, production build). Focused journey and intake checks passed.
  Local Chromium checked services, pricing, and contact at 375, 768, and 1280
  pixels: no horizontal overflow or axe violations in main content; screenshots
  reviewed, including the populated mobile review. Additional browser checks
  passed direct step navigation, optional offer selection, reduced motion,
  keyboard focus, and mocked submission failure with answer recovery.
  `git diff --check` passed. Temporary screenshots and logs are in
  `/tmp/warm-*`. These are local presentation and simulated delivery checks,
  not hosted persistence or customer proof.
- The code gate initially found a stale pricing-copy assertion and an existing
  documentation inventory mismatch for the already-tracked approved plan.
  Both test expectations were corrected without removing the plan.
  The pre-existing `app/next-env.d.ts` change is preserved.
- Rollback: revert this presentation and intake UI change on dev if needed.
  Keep optional petPeeves parsing and generated-message support when reverting
  the UI so any new version-1 contexts remain readable. No database rollback,
  billing change, deployment, publication, or provider activation occurred.

- On 2026-09-04, the MATCH/CRIB-informed public-journey redesign was implemented
  without exposing framework jargon in customer copy. The header follows What
  We Do → How We Work → Examples → Why Us; the grouped footer carries Insights
  and supporting routes. Every named vision-intake step is directly previewable
  without completing earlier fields. The four-step form retains answers in
  memory, uses an editable visitor-confirmed purpose, and keeps feelings and
  service optional. `VisionIntakeV1` is validated server-side while legacy
  `message` submissions remain valid.
- Additive migration `112_match_crib_public_journey.sql` is applied to the
  disposable local database and has passed the local schema/RLS/database gate.
  It adds nullable `projects.intake_context` and an RLS-protected daily
  aggregate counter with a service-role-only increment. Hosted remains at 106;
  110, 111, and now 112 are separately mapped, approval-gated hosted stages.
  Hosted migration, analytics activation, deployment, and publication remain
  separate approvals.

- NeedThisDone's canonical direction is now a private authenticated assistant:
  the browser is the control plane, Supabase is durable truth, and a correctly
  configured local or cloud worker host is an outbound-only private runtime.
  The Mac mini is the intended always-on example, not a requirement. The
  canonical source is `README.md`.
- Hermes plans bounded work and proposes an approved model route; OpenClaw is
  the approved coding worker and uses its Codex agent runtime in the worktree.
  Standalone Codex CLI operation is not part of the target model. An allowed
  OpenRouter free route is preferred; paid routing needs a
  separate browser approval. This is the target operating contract, not proof
  that a live provider or Mac runtime has been activated.
- Hermes is now the code-facing application role layered on the retained
  `agent_plans` lifecycle; it does not add a service, API, queue, or table. It
  creates a server-authored Hermes/OpenClaw instruction only for the reviewed
  `selected-free` route. Existing durable approval, dispatch, task, and bridge
  contract surfaces remain the source of truth.
- The browser harness uses an isolated `.next-playwright` output and its own
  TypeScript entry point, so browser checks do not delete or type-contaminate a
  developer's `.next` build. Its Watchpack polling configuration is local test
  infrastructure only; it does not start a provider, a bridge worker, or an
  OpenClaw Gateway.
- Migrations `110_harden_hermes_frozen_plan_claims.sql` and
  `111_split_hermes_planner_and_openclaw_executor_models.sql` are staged for a
  separately approved hosted promotion and applied to the disposable local
  instance only.
  Hermes keeps the reviewed OpenRouter planner identity in `selected_model_id`;
  the frozen approval snapshot separately records `plannerModelId` and the
  exact allowlisted OpenClaw executor `openai/gpt-5.6-luna`. No hosted
  migration, provider activation, or bridge activation was run.
- The public website now has a separately approved outcome-partner front door
  for teams and individuals: “Your vision, brought to life.” Website Fix remains
  $500 and Managed Automation remains proposal-based. The vision-first intake
  keeps service selection optional and uses the unchanged projects API/schema.
  Public navigation now gives “Why Us” its own `/about` page, links each
  offering to its dedicated page, and keeps page-boundary links out of the
  shared public and authenticated navigation/footer configuration. This public
  positioning does not expand the private-assistant roadmap or its authority,
  and it has not been deployed or published by this repository work.
- Earlier documentation said Daily Desk code, routes, and pending migration
  entries had been retired. That claim is not reliable: the active branch still
  contains Daily Cockpit and employee-workspace sources and tests. No removal
  is claimed by this documentation reset.
- Claude-specific project instructions, hooks, automation workflows,
  compatibility files, and the unused loop-state helper were retired on
  2026-08-25. The neutral lifecycle hooks now live under `.codex/hooks/`;
  pre-existing local Claude runtime state and settings were not removed.
- The current operating record was consolidated on 2026-08-25 and reset on
  2026-08-31. README is the single assistant and operating vision; ROADMAP is
  the execution sequence; 11 tracked Markdown files hold current instructions,
  status, evidence, launch controls, and package boundaries.
- Unreferenced repository artifacts were retired on 2026-08-25, including old
  logo archives, unused work images, root content and prompt data, job-search
  material, and the stale Supabase error export. The three résumé source files
  were copied to the protected external backup and checksum-verified before
  removal.
- The unused site configuration and local design/review tooling were retired
  on 2026-08-25. Active application routes, package scripts, favicon generation,
  and private-worker tooling remain unchanged.
- The unreferenced local color-contrast viewer and component route map were
  retired on 2026-08-25. The existing route-map ignore remains intentional;
  active routes and private-worker tooling remain unchanged.
- The 2026-08-31 documentation reset itself authorized no hosted migration, deployment, secret
  provisioning, provider activation, Mac activation, publication, message, or
  customer action.
- An independent OpenClaw proof profile was activated on the MacBook on
  2026-09-01. OpenClaw `2026.8.1` used account-scoped ChatGPT/Codex OAuth with
  exact model `openai/gpt-5.6-luna`, thinking `max`, no model or API-key
  fallback, and a token-authenticated loopback Gateway. This profile is not
  connected to the NeedThisDone bridge. The Mac mini has not been configured
  or proved, so the two-host acceptance criterion is not met.

## Active validation

- On 2026-09-07, `bridge/npm test` passed all 20 tests, including the signed
  status client, explicit disposable-local URL mode, path-discovered launchd
  rendering, and Mac worker CLI safety checks. The focused signed status route
  test passed 3 tests. Node and shell syntax checks, `git diff --check`, app
  lint, app type-check, and the production build also passed. The root CLI
  smoke checks showed that
  `preflight --json` reports the real profile-cache blocker without secrets,
  `status --json` reports unloaded jobs without secrets, and `start`/`test`
  refuse missing activation confirmation or missing `--local`. These are
  local implementation checks only; the account-backed bridge rehearsal,
  lead→builder→reviewer proof, and hosted/customer proof remain pending.
- The next host step is owner-controlled: repair the private OpenClaw cache
  permissions and configure the private bridge environment on the MacBook,
  then rerun the isolated proof and the foreground disposable-local rehearsal.
  Owner: private Mac runtime owner; target follow-up 2026-09-14. Do not treat
  the current profile proof or local CLI checks as evidence that the bridge has
  consumed a ChatGPT subscription.
- On 2026-09-04, the public-journey redesign passed lint, type-check, the full
  unit suite (63 files, 325 tests), the accessibility suite (4 files, 51
  tests), the production build, and `git diff --check`. The disposable local
  Supabase instance was rebuilt through migration 112; `npm run
  verify:database` then passed schema lint plus schema-manifest, security, RLS,
  provider-workflow, and consultation checks. Fresh rendered browser visual QA
  is still pending because no browser session was available; no hosted claim is
  made.

- On 2026-09-04, the public outcome-partner refresh passed `npm run
  verify:code`: lint, type-check, 62 unit-test files (322 tests), four
  accessibility-test files (52 tests), and the production build. The dedicated
  public browser acceptance file passed 36 desktop/mobile checks, including the
  375/768/1280 width matrix, headings and overflow, first-viewport copy,
  hypothetical-example boundaries, optional and preselected service intake,
  success/error states, keyboard menu behavior, focus, and reduced motion. Four
  focused retained checks for contact aliases and legacy redirects also passed.
  `git diff --check` passed.
- The full `npm run test:retained-smoke` was run on 2026-09-04 and reached two
  unrelated retained-environment failures: the seeded report ID returned 404,
  and the unauthenticated dashboard remained in its loading state. The public
  refresh checks in that run passed, and both affected areas are outside this
  change. Owner: NeedThisDone application test owner; restore the retained
  local seed/auth fixture and rerun by 2026-09-06.
- On 2026-09-04, the navigation/page-boundary follow-up passed lint,
  type-check, the focused route-hygiene and public-journey tests (2 files, 12
  tests), the production build, and `git diff --check`. The public “Why Us”
  link now resolves to the standalone `/about` page, the page is in the
  sitemap, and Website Fix plus Managed Automation links resolve directly to
  their own pages. No browser acceptance suite, hosted deployment, or
  publication was run for this follow-up.
- On 2026-09-03, the Hermes plan/approval/bridge slice passed application
  `npm run test:unit` (62 files, 325 tests), lint, type-check, and production
  build; focused Hermes and capability checks (2 files, 6 tests); and
  `npm run test:hermes-lifecycle-rls` (2 local-Supabase tests). The latter ran
  against the current local schema, not migration 107.
- On 2026-09-04, the migration manifest/checksum gate passed with 36 mappings
  and 20 gates. Its current hosted-promotion baseline is explicitly `106`;
  versions `107`–`109` are the only retired local-only gaps, and `110` then
  `111` are separate staged promotions. The disposable local database was
  reset from the working migration files (not repaired or pulled), and the
  `106 → 110 → 111` rehearsal passed: it rejected any other head, proved
  `107`–`109` absent, and passed the full local schema/RLS/database gate. The
  final local history contains `110` and `111` only from that range. The final
  local rebuild is fixture-free. Hosted remains untouched and requires a fresh
  protected backup, exact dry run, named approval, one-time apply, and
  read-only contract check for each stage.
- OpenRouter provider policy: focused `openrouter-core` tests passed on
  2026-08-24. Structured and tool-bearing requests force provider parameter
  support while server code owns the privacy/routing constraints.
- The 2026-08-30 readiness audit found and repaired a local bridge/control-plane
  contract gap: planned-task failure callbacks now propagate `providerInvoked`,
  which the completion route requires to distinguish pre-provider aborts from
  provider-invoked reconciliation. On 2026-09-03, the complete `bridge` `npm
  test` suite passed 16 tests, including the exact Hermes frozen snapshot and
  model acceptance path plus changed, expired, paid, unapproved, and stopped
  cases that never invoke Gateway. This is deterministic local evidence only;
  no hosted, provider, or Mac rehearsal is claimed.
- The browser prerequisite is repaired for focused contracts. On 2026-09-03,
  `npm run test:browser-harness` passed one public route-boot test and
  `npm run test:hermes-browser` passed one authenticated local-Supabase UI
  contract: route and cost are visible, browser approval freezes the plan, and
  approval does not dispatch work. Internal application endpoints were mocked
  for the UI assertion; no provider, bridge, or Mac worker ran. The broad root
  `npm run test` suite was not rerun in this slice. Its earlier local fixture
  failures need a separate, scoped assessment. Owner: NeedThisDone application
  test owner; follow up by 2026-09-06.
- Codex-integration retirement checks passed on 2026-08-25: shell syntax,
  hook JSON/path validation, tracked-source scans, `git diff --check`, and
  type-check. `codex doctor` loaded the project configuration but reported a
  pre-existing local runtime-state database and legacy-rollout scan issue.
  Owner: the local Codex runtime owner; scope: user-machine state outside this
  repository; follow up by 2026-09-01.
- Documentation hygiene was reset on 2026-08-31 to replace the obsolete public
  service vision with the assistant-first browser, Supabase, and private-Mac
  operating model. `repository-documentation.test.ts` passed (3 tests) after
  the reset; historical documentation remains recoverable in Git.
- The MacBook's independent OpenClaw proof passed on 2026-09-02. The redacted
  bundle at `/Users/abiezerreyes/Documents/NeedThisDone Backups/2026-09-01-openclaw-luna-max/macbook-8/summary.json`
  records the exact resolved model, OAuth-vs-key profile counts, redacted quota
  windows, account-scoped catalog, exact direct and loopback Gateway Luna/max
  responses, bounded public-web research with HTTPS citations, the effective
  Docker/session policy, zero critical security-audit findings, and explicit
  denials for shell, filesystem, messaging, publication, scheduling, browser,
  node, and account-changing capabilities. Search is pinned to the official
  key-free DuckDuckGo `2026.8.1` plugin; mDNS is off. The Mac mini proof and
  bridge integration remain pending. The deep audit also reported one
  non-critical `gateway.probe_failed` warning (`missing scope: operator.read`)
  from its separate audit probe; the authenticated Gateway status check and all
  11 live forbidden-tool probes passed. Owner: private Mac runtime owner; run
  the same isolated proof on the Mac mini. The prepared bridge runbook is now
  host-neutral and permits only the foreground `macbook-pro-hermes-rehearsal`
  worker for a separately approved MacBook rehearsal; it does not authorize
  launchd, persistence, a Gateway start, or any live bridge action.
- Artifact retirement checks passed on 2026-08-25: the external resume manifest
  at `/Users/abiezerreyes/Documents/NeedThisDone Backups/2026-08-25-pre-doc-cleanup/`
  verifies all three copied files; type-check, lint, five focused public/content
  tests, production build, `git diff --check`, and final reference scans passed.
- Retired-local-tooling checks passed on 2026-08-25: type-check, the focused
  absence test, tracked-source scan, and `git diff --check` passed. This is a
  local repository cleanup only.
- Retired-dependency checks passed on 2026-08-25: the unused DnD, resizable,
  and ID-generation packages were removed after a tracked-source, test,
  configuration, and package-script scan found no callers. Type-check, lint,
  the focused retirement test, production build, and `git diff --check` passed.
  Active routes and private-worker tooling were not changed.
- Local artifact retirement checks passed on 2026-08-25: the focused absence
  test now guards the removed color-contrast viewer and component route map.
  The tracked-source scan preserves only the deliberate route-map ignore;
  type-check, lint, production build, and `git diff --check` passed. This is a
  local repository cleanup only; active routes and private-worker tooling were
  not changed.

## Rollback

The public-journey redesign is reversible by reviewed Git revert. Migration 112
is applied only to the disposable local database; if it is later hosted,
rollback must be a reviewed forward migration after callers are disabled and
retained aggregates are reviewed.

Repository changes are reversible by reviewed Git revert. Database changes stay
additive and any hosted correction must be a separately reviewed forward
migration; never reset hosted Supabase.

This vision reset can be reverted as one reviewed Git change. It does not alter
the legacy application pages, a database, a provider, or the Mac runtime.

The public outcome-partner refresh can be reverted as one reviewed Git change.
It changes public copy, layout, navigation, intake composition, tests, and
metadata only; the projects API and database schema were not changed. No hosted
rollback is involved because deployment and publication were not performed.

The 2026-09-08 public language clarity audit can be reverted as one reviewed
Git change on `dev`. It changes anonymous copy, report presentation, generated
copy guards, retained article output, tests, and audit evidence only; no API,
schema, billing, hosted, provider, Mac, or publication state changed.

The navigation/page-boundary follow-up can be reverted as one reviewed Git
change. It changes the public Why Us route, shared navigation destinations,
sitemap, and focused route tests only; no API, database, provider, hosted, or
publication state changed.

The subscription-first Mac worker change can be reverted by a reviewed Git
revert on `dev`. It adds the repository CLI, signed read-only status route,
launchd templates/wrappers, local-mode validation, tests, and documentation;
it adds no migration. This work created no private runtime files, loaded no
launchd job, started no Gateway or bridge, and made no hosted or external
change. Any future Mac activation remains a separate owner-approved action.

The 2026-09-08 homepage desktop-rail and What We Do intro composition changes
are presentation-only and reversible by a reviewed Git revert on `dev`; they
add no database migration, hosted state, or external action.

The 2026-09-08 What We Do / Examples separation is presentation-only and
reversible by a reviewed Git revert on `dev`; it adds no database migration,
hosted state, or external action.

The independent OpenClaw profile can be stopped without touching the default
profile. Revoke its OpenAI OAuth grant if required, archive only
`~/.openclaw-needthisdone`, and reinstall the recorded prior OpenClaw version
`2026.7.1-2` only if a CLI rollback is approved. The repository proof files are
reversible by reviewed Git revert; no hosted rollback is involved.

The removed color-contrast viewer and component route map can be restored only
by a reviewed Git revert of this local-cleanup commit; no hosted rollback is
involved.

The removed résumé source files can also be restored from the protected
2026-08-25 pre-doc-cleanup backup after verifying its `SHA256SUMS.txt` manifest.
