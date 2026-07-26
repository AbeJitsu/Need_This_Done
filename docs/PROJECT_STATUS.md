# NeedThisDone Project Status

**Owner:** NeedThisDone
**Active branch:** `dev`
**Canonical product, architecture, and milestone plan:** [ROADMAP.md](../ROADMAP.md)

This is the implementation ledger. Update it in the same commit as every completed or materially changed implementation slice. It records only current execution state, validation, commits, rollback, and blockers.

## Active execution slice

**Roadmap alignment:** Phase 2 — Core safety and workflow foundation.

**In scope:** Harden the site analyzer and contact-to-lead capture, establish safe operator-only workflow foundations, and preserve the focused client portal while those changes are made.

**Current implementation:** Analyzer SSRF and report-access hardening is complete. Requested and redirected targets are validated against public DNS results, and migration `067` removes anonymous direct reads of `site_reports`.

**Before review:** Run `git diff --check`, targeted unit/API and authorization tests, and the relevant retained-route smoke checks. Run `npm run type-check` and `npm run build` when application code changes. Record any unavailable integration checks below.

**Rollback:** Revert the focused implementation commit. Do not pair an irreversible schema change with a broad removal.

**Blockers:** None recorded.

## Change log

| Date | Slice | Commit | Result | Rollback |
| --- | --- | --- | --- | --- |
| 2026-07-24 | System audit | `9d7b658` | Captured repository, service, route, and browser baseline. | Revert `9d7b658` if necessary. |
| 2026-07-25 | CI and retained-core baseline | This commit | CI verifies `dev` pushes and `production` pull requests with type checking, unit tests, and a production build. Retained-route smoke checks are non-mutating; live analyzer and local-Supabase RLS checks are opt-in. | Revert this commit. |
| 2026-07-25 | Owner dashboard inventory | `docs: inventory retained owner dashboard` | Classified owner routes, APIs, data dependencies, and the hosted-payment boundary. | Revert `docs: inventory retained owner dashboard`. |
| 2026-07-25 | Analyzer SSRF and report-access hardening | This commit | Blocked private-network analyzer targets and unsafe redirects; added migration `067` to remove anonymous direct `site_reports` reads. | Revert this commit; apply the rollback migration only after review if `067` has been deployed. |

## Latest validation record

- Targeted analyzer checks passed: 56 tests passed; 4 opt-in live-site tests skipped.
- `npm run type-check` passed.
- `npm run build` passed with the existing `@next/next/no-img-element` warning in `components/DeviceShowcase/ScaledIframe.tsx`.
- The local-Supabase RLS integration check was not run because no local Supabase instance was available; migration `067` remains separately reviewable before deployment.
