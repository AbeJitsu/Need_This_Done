# NeedThisDone — Project Status

**Branch:** `dev`
**Last updated:** 2026-08-24

## Current facts

- The public Website Fix and Managed Automation paths remain in the application.
- Vercel is the owner-gated control plane and Supabase is the durable data
  boundary; the Mac worker remains outbound-only and private.
- Daily Desk code, routes, and pending migration entries were retired from the
  active branch on 2026-08-24. Its prior checkpoints remain recoverable in
  Git history; the existing generic bridge and planner remain active.
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

## Rollback

Repository changes are reversible by reviewed Git revert. Database changes stay
additive and any hosted correction must be a separately reviewed forward
migration; never reset hosted Supabase.
