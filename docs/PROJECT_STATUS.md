# NeedThisDone — Project Status

**Branch:** `dev`
**Last updated:** 2026-08-24

## Current facts

- The public Website Fix and Managed Automation paths remain in the application.
- Vercel is the owner-gated control plane and Supabase is the durable data
  boundary; the Mac worker remains outbound-only and private.
- The prior Daily Desk implementation is being retained as an experimental
  checkpoint. It is not a current product or release claim.
- No hosted migration, deployment, secret provisioning, provider activation,
  Mac activation, publication, message, or customer action is authorized by
  this repository cleanup.

## Active validation

- Documentation and migration-stage configuration: `git diff --check` and
  `node scripts/verify-hosted-migration-stages.mjs` passed on 2026-08-24; the
  script-owned map covers staged migrations `073`–`109`.
- OpenRouter provider policy: focused `openrouter-core` tests passed on
  2026-08-24. Structured and tool-bearing requests force provider parameter
  support while server code owns the privacy/routing constraints.
- Daily Desk durable experimental checkpoint: the disposable local database
  reset through `109`; its core unit tests (4), RLS tests (5), and retained
  schema-manifest tests (9) passed on 2026-08-24. Worker and UI behavior are
  recorded separately and remain unverified here.

## Rollback

Repository changes are reversible by reviewed Git revert. Database changes stay
additive and any hosted correction must be a separately reviewed forward
migration; never reset hosted Supabase.
