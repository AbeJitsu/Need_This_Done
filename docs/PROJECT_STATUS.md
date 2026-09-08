# NeedThisDone — Project Status

**Branch:** `dev`
**Last updated:** 2026-09-07

## Current facts

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
  `/system` proof. The static server-rendered page keeps the owners-and-founders
  audience, “Your vision, brought to life.” promise, `/contact` primary action,
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
  the browser is the control plane, Supabase is durable truth, and the Mac mini
  is an outbound-only private runtime. The canonical source is `README.md`.
- Hermes plans bounded work and proposes an approved model route; OpenClaw is
  the approved local non-code executor; Codex is the approved worktree coding
  executor. An allowed OpenRouter free route is preferred; paid routing needs a
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
  for owners and founders: “Your vision, brought to life.” Website Fix remains
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
