# NeedThisDone Project Status

**Owner:** NeedThisDone
**Active branch:** `dev`
**Canonical product, architecture, and milestone plan:** [ROADMAP.md](../ROADMAP.md)

This is the implementation ledger. Update it in the same commit as every completed or materially changed implementation slice. It records only current execution state, validation, commits, rollback, and blockers.

## Active execution slice

**Roadmap alignment:** Phase 3 — Focused operator and client workspace.

**In scope:** Deliver the Supabase-Auth operator workspace for Abe and Andrea, including project-focused client access and GitHub handoffs. Preserve the focused client portal while this workspace is introduced.

**Current implementation:** Phase 3 is complete pending the final full validation and hosted migration `071`: operators use a database-backed Supabase workspace for reports and projects; a guest project can be explicitly linked only to an existing exact-email account; and a linked client can receive project-scoped GitHub handoffs. Publishing a handoff sends a client email, records any failure visibly, and permits an explicit retry. GitHub repository membership remains in GitHub. No outreach automation is introduced.

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
| 2026-07-25 | Operator workflow-run foundation | This commit | Added and applied migration `070`; every new site report now creates an idempotent, operator-only review record with no external automation. | Apply a separately reviewed rollback migration to remove the trigger and table if needed. |
| 2026-07-25 | Browser operator authorization | This commit | Replaced metadata-derived admin UI state with a server-backed database-role check. | Revert this commit. |
| 2026-07-25 | Operator report queue | `ed2b15e` | Added the protected `/admin/reports` queue and decision API over existing `workflow_runs`; a human can approve, reject, or flag manual action, with no automated outreach. | Revert `ed2b15e`. |
| 2026-07-25 | Operator report queue API coverage | `aa6a5ea` | Added focused tests for authorization, report enrichment, operator attribution, and one-time decisions. | Revert `aa6a5ea`. |
| 2026-07-25 | Report-decision rationale | `a56af04` | Added an optional decision note to the operator queue and display of the saved rationale; corrected stale queue commit references in this ledger. | Revert `a56af04`. |
| 2026-07-25 | Report queue dashboard link | This commit | Added a direct operator-dashboard link to the report queue so the daily decision work is reachable from the retained project workspace. | Revert this commit. |
| 2026-07-25 | Report queue access transition | This commit | Prevented the queue shell from rendering while a non-operator is redirected; protected data was already server-gated. | Revert this commit. |
| 2026-07-25 | Report queue decision focus | This commit | Made undecided reports the default view, with a deliberate all-report history view for prior decisions. | Revert this commit. |
| 2026-07-25 | Report queue manual-action wording | This commit | Clarified queue labels so approval means manual follow-up only; no decision label implies automatic outreach. | Revert this commit. |
| 2026-07-25 | Owner inventory alignment | This commit | Marked the post-snapshot report queue as implemented in the evidence inventory and linked that note to this execution ledger. | Revert this documentation-only commit. |
| 2026-07-25 | Truthful operator-role administration | `0ae7d57` | Made the transitional Users view read `user_roles` live and removed its misleading metadata-based operator-role controls. | Revert `0ae7d57`. |
| 2026-07-25 | Explicit iframe placeholder image handling | This commit | Marked the scaled iframe placeholder as explicitly unoptimized, matching the Next.js external-image safety requirement and the image validation test. | Revert this focused application-and-ledger commit. |
| 2026-07-26 | Safe existing-account client access | This commit | Added operator-confirmed project link/unlink actions that require an already-existing exact-email account, invalidate client/project-comment caches, and extended attachment downloads to enforce project-level authorization. No account creation, invitation, reassignment, or role change occurs. | Revert this focused application-and-ledger commit. |
| 2026-07-26 | Project GitHub handoffs | This commit | Added project-scoped GitHub handoff records and operator publishing/retry controls. A linked client sees only their project handoffs; automatic notification failures remain visible and retryable. Migration `071` is additive and pending hosted validation. | Revert this focused application-and-ledger commit; apply a separately reviewed rollback migration only after `071` is deployed. |

## Latest validation record

- Targeted analyzer and consultation checks passed: 62 tests passed; 4 opt-in live-site tests skipped.
- `npm run type-check` and `npm run build` passed with no warnings after the `ScaledIframe.tsx` repair.
- Database-backed authorization checks passed: 30 focused tests passed; `npm run type-check` and `npm run build` passed with no warnings.
- Hosted Supabase migration history matches local migrations through `069`; post-migration checks confirmed a server-only report count of 1 versus anonymous count 0, the project consultation columns, and exactly two database-backed admin roles.
- Hosted Supabase migration history matches local migrations through `070`; `workflow_runs` schema check returned HTTP 200. No synthetic production report was created solely to test the trigger.
- Operator report queue: the focused database-role tests passed (3 tests); `npm run type-check`, `npm run build`, and `git diff --check` passed. The expected simulated role-database failure was logged by the fail-closed test.
- Operator report queue API coverage: 4 focused route tests and `npm run type-check` passed; `git diff --check` passed.
- Report-decision rationale: 4 focused route tests, `npm run type-check`, `npm run build`, and `git diff --check` passed.
- Report queue dashboard link: `npm run type-check`, `npm run build`, and `git diff --check` passed.
- Report queue access transition: `npm run type-check`, `npm run build`, and `git diff --check` passed.
- Report queue decision focus: `npm run type-check`, `npm run build`, and `git diff --check` passed.
- Report queue manual-action wording: 4 focused route tests, `npm run type-check`, `npm run build`, and `git diff --check` passed.
- Truthful operator-role administration: 2 focused API tests, `npm run type-check`, `npm run build`, and `git diff --check` passed.
- Full local gate after image handling repair: 23 test files passed (283 tests); 64 opt-in security/live tests skipped. Type checking, production build, and `git diff --check` passed. Redis-dependent test assertions self-skip when the local sandbox cannot reach Upstash; no external state was changed.
- Safe existing-account client access: 8 focused API tests and `npm run type-check` passed. Full suite, production build, and retained-route smoke checks remain required before the Phase 3 slice is promoted.
- Project GitHub handoffs: 7 focused API tests and `npm run type-check` passed. Full suite, production build, retained-route smoke checks, `git diff --check`, and hosted migration `071` verification remain required before Phase 3 is marked complete.
