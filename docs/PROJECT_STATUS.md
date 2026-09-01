# NeedThisDone — Project Status

**Branch:** `dev`
**Last updated:** 2026-08-31

## Current facts

- NeedThisDone's canonical direction is now a private authenticated assistant:
  the browser is the control plane, Supabase is durable truth, and the Mac mini
  is an outbound-only private runtime. The canonical source is `README.md`.
- Hermes plans bounded work and proposes an approved model route; OpenClaw is
  the approved local non-code executor; Codex is the approved worktree coding
  executor. An allowed OpenRouter free route is preferred; paid routing needs a
  separate browser approval. This is the target operating contract, not proof
  that a live provider or Mac runtime has been activated.
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
- This documentation reset authorizes no hosted migration, deployment, secret
  provisioning, provider activation, Mac activation, publication, message, or
  customer action.

## Active validation

- Repository vision, documentation, and migration-stage configuration:
  `git diff --check`, `node scripts/verify-hosted-migration-stages.mjs`,
  type-check, lint, and the focused public-journey, private-boundary, and
  capability-manifest tests passed on 2026-08-24. The script-owned pending map
  ends at `106`.
- OpenRouter provider policy: focused `openrouter-core` tests passed on
  2026-08-24. Structured and tool-bearing requests force provider parameter
  support while server code owns the privacy/routing constraints.
- The 2026-08-30 readiness audit found and repaired a local bridge/control-plane
  contract gap: planned-task failure callbacks now propagate `providerInvoked`,
  which the completion route requires to distinguish pre-provider aborts from
  provider-invoked reconciliation. The focused RED/GREEN bridge regression and
  the complete bridge suite passed: `bridge` `npm test` reported 9 tests passed;
  application unit tests reported 62 files and 325 tests passed; type-check,
  lint, production build, `git diff --check`, pre-key CI verification, and
  hosted-stage verification passed on 2026-08-30. This is deterministic local
  evidence only; no hosted, provider, or Mac rehearsal is claimed.
- The root `npm run test` Playwright gate remains blocked in this worktree. The
  canonical command's fresh `next dev` server fails to parse `app/globals.css`
  at the Tailwind directive (`Unexpected character '@'` at line 14) and times
  out waiting for port 3000. A retry with `env NODE_ENV=development` reached
  all 58 scheduled tests: 46 passed, 7 failed, 2 skipped, and 3 did not run;
  the failures were local Supabase fixture `fetch failed` errors and a seeded
  report response failure. No local Supabase start or reset was performed. The
  production build passes, and these failures are outside the bridge diff.
  Owner: NeedThisDone application test owner; follow up by 2026-09-06.
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

The removed color-contrast viewer and component route map can be restored only
by a reviewed Git revert of this local-cleanup commit; no hosted rollback is
involved.

The removed résumé source files can also be restored from the protected
2026-08-25 pre-doc-cleanup backup after verifying its `SHA256SUMS.txt` manifest.
