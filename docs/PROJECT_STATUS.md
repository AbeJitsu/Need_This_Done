# NeedThisDone Project Status

**Owner:** NeedThisDone
**Active branch:** `dev`
**Canonical product, architecture, and milestone plan:** [ROADMAP.md](../ROADMAP.md)

This is the implementation ledger. Update it in the same commit as every completed or materially changed implementation slice. It records only current execution state, validation, commits, rollback, and blockers.

## Active execution slice

**Roadmap alignment:** Phase 2 — Core safety and workflow foundation.

**In scope:** Harden the site analyzer and contact-to-lead capture, establish safe operator-only workflow foundations, and preserve the focused client portal while those changes are made.

**Current implementation:** Analyzer SSRF and report-access hardening is complete. Requested and redirected targets are validated against public DNS results, and migration `067` removes anonymous direct reads of `site_reports`. Contact-to-lead consultation capture is complete: valid consultation type and preferred/alternate times are stored as project context, included in the owner notification, and shown in project details without creating an appointment.

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

## Latest validation record

- Targeted analyzer and consultation checks passed: 62 tests passed; 4 opt-in live-site tests skipped.
- `npm run type-check` and `npm run build` passed with no warnings after the `ScaledIframe.tsx` repair.
- The local-Supabase migration/RLS integration checks were not run because no local Supabase instance was available; migrations `067` and `068` remain separately reviewable before deployment.
