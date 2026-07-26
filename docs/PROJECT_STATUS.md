# NeedThisDone Project Status

**Owner:** NeedThisDone
**Active branch:** `dev`
**Canonical product, architecture, and milestone plan:** [ROADMAP.md](../ROADMAP.md)

This is the implementation ledger. Update it in the same commit as every completed or materially changed implementation slice. It records only current execution state, validation, commits, rollback, and blockers.

## Active execution slice

**Roadmap alignment:** Phase 2 — Core safety and workflow foundation.

**In scope:** Harden the site analyzer and contact-to-lead capture, establish safe operator-only workflow foundations, and preserve the focused client portal while those changes are made.

**Current implementation:** Analyzer SSRF and contact-to-lead implementation are complete in `dev` and their hosted schema changes are applied. Database-backed operator authorization is implemented and exactly two hosted `user_roles` admin records exist for Abe and Andrea. The remaining Phase 2 work is the durable workflow-run foundation.

**Before review:** Run `git diff --check`, targeted unit/API and authorization tests, and the relevant retained-route smoke checks. Run `npm run type-check` and `npm run build` when application code changes. Record any unavailable integration checks below.

**Rollback:** Revert the focused implementation commit. Do not pair an irreversible schema change with a broad removal.

**Blockers:** None recorded.

**No-broken-windows policy:** Every warning, failing check, stale route or document, broken interaction, and unresolved TODO is a defect. Fix it in the current slice, or record an owner-approved exception here with scope and removal date. An open exception blocks production promotion.

## Change log

| Date | Slice | Commit | Result | Rollback |
| --- | --- | --- | --- | --- |
| 2026-07-24 | System audit | `9d7b658` | Captured repository, service, route, and browser baseline. | Revert `9d7b658` if necessary. |
| 2026-07-25 | CI and retained-core baseline | This commit | CI verifies `dev` pushes and `production` pull requests with type checking, unit tests, and a production build. Retained-route smoke checks are non-mutating; live analyzer and local-Supabase RLS checks are opt-in. | Revert this commit. |
| 2026-07-25 | Owner dashboard inventory | `docs: inventory retained owner dashboard` | Classified owner routes, APIs, data dependencies, and the hosted-payment boundary. | Revert `docs: inventory retained owner dashboard`. |
| 2026-07-25 | Analyzer SSRF and report-access hardening | This commit | Blocked private-network analyzer targets and unsafe redirects; added migration `067` to remove anonymous direct `site_reports` reads. | Revert this commit; apply the rollback migration only after review if `067` has been deployed. |
| 2026-07-25 | Contact consultation capture | This commit | Preserved validated consultation preferences on project leads, owner notification, and project detail view; added migration `068`. | Revert this commit; apply a rollback migration only after review if `068` has been deployed. |
| 2026-07-25 | No-broken-windows baseline | This commit | Replaced the remaining production-build `<img>` warning and established the policy for future slices. | Revert this commit. |
| 2026-07-25 | Database-backed operator authorization | This commit | Added fail-closed server authorization using `user_roles` and migration `069` to provision Abe and Andrea only. | Revert this commit; remove the two role rows only through a separately reviewed rollback migration after deployment. |
| 2026-07-25 | Hosted operator role provisioning | External state | Upserted and verified exactly two `user_roles` admin records for Abe and Andrea through the service API. | Remove only those two role rows through a separately reviewed rollback migration. |
| 2026-07-25 | Hosted migrations `066`–`069` | External state | Applied and verified the reviewed migration set. `066` was a no-op because its legacy workflow tables were already absent; `067` isolates reports from anonymous reads; `068` adds consultation fields; `069` records the two operator roles. | Apply a separately reviewed rollback migration for any needed schema or role reversal. |

## Latest validation record

- Targeted analyzer and consultation checks passed: 62 tests passed; 4 opt-in live-site tests skipped.
- `npm run type-check` and `npm run build` passed with no warnings after the `ScaledIframe.tsx` repair.
- Database-backed authorization checks passed: 30 focused tests passed; `npm run type-check` and `npm run build` passed with no warnings.
- Hosted Supabase migration history matches local migrations through `069`; post-migration checks confirmed a server-only report count of 1 versus anonymous count 0, the project consultation columns, and exactly two database-backed admin roles.
