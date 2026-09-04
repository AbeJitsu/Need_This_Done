# NeedThisDone — Project Status

**Branch:** `dev`
**Last updated:** 2026-09-04

## Current facts

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
- The public Website Fix and Managed Automation paths remain in the application
  as legacy web scope. They are not the active product roadmap.
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
  final local history contains `110` and `111` only from that range. Hosted
  remains untouched and requires a fresh protected backup, exact dry run,
  named approval, one-time apply, and read-only contract check for each stage.
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

Repository changes are reversible by reviewed Git revert. Database changes stay
additive and any hosted correction must be a separately reviewed forward
migration; never reset hosted Supabase.

This vision reset can be reverted as one reviewed Git change. It does not alter
the legacy application pages, a database, a provider, or the Mac runtime.

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
