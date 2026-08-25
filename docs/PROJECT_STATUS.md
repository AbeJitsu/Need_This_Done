# NeedThisDone — Project Status

**Branch:** `dev`
**Last updated:** 2026-08-25

## Current facts

- The public Website Fix and Managed Automation paths remain in the application.
- Vercel is the owner-gated control plane and Supabase is the durable data
  boundary; the Mac worker remains outbound-only and private.
- Daily Desk code, routes, and pending migration entries were retired from the
  active branch on 2026-08-24. Its prior checkpoints remain recoverable in
  Git history; the existing generic bridge and planner remain active.
- Claude-specific project instructions, hooks, automation workflows,
  compatibility files, and the unused loop-state helper were retired on
  2026-08-25. The neutral lifecycle hooks now live under `.codex/hooks/`;
  pre-existing local Claude runtime state and settings were not removed.
- The current operating record was consolidated on 2026-08-25. README remains
  the single product and system vision; ROADMAP remains the execution sequence;
  11 tracked Markdown files now hold the current instructions, status, evidence,
  launch controls, and package boundaries.
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
- No hosted migration, deployment, secret provisioning, provider activation,
  Mac activation, publication, message, or customer action is authorized by
  this repository cleanup.

## Active validation

- Repository vision, documentation, and migration-stage configuration:
  `git diff --check`, `node scripts/verify-hosted-migration-stages.mjs`,
  type-check, lint, and the focused public-journey, private-boundary, and
  capability-manifest tests passed on 2026-08-24. The script-owned pending map
  ends at `106`.
- OpenRouter provider policy: focused `openrouter-core` tests passed on
  2026-08-24. Structured and tool-bearing requests force provider parameter
  support while server code owns the privacy/routing constraints.
- The retained bridge/planner behavior was not revalidated by this retirement
  change; no claim beyond the focused removal checks is made here.
- Codex-integration retirement checks passed on 2026-08-25: shell syntax,
  hook JSON/path validation, tracked-source scans, `git diff --check`, and
  type-check. `codex doctor` loaded the project configuration but reported a
  pre-existing local runtime-state database and legacy-rollout scan issue.
  Owner: the local Codex runtime owner; scope: user-machine state outside this
  repository; follow up by 2026-09-01.
- Documentation hygiene passed on 2026-08-25: the focused repository test
  verifies the exact current Markdown record, README's canonical role, and the
  ROADMAP link back to it. Historical documentation remains recoverable in Git.
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

The removed color-contrast viewer and component route map can be restored only
by a reviewed Git revert of this local-cleanup commit; no hosted rollback is
involved.

The removed résumé source files can also be restored from the protected
2026-08-25 pre-doc-cleanup backup after verifying its `SHA256SUMS.txt` manifest.
