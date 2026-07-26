# NeedThisDone Project Status

**Owner:** NeedThisDone
**Active branch:** `dev`
**Canonical product, architecture, and milestone plan:** [ROADMAP.md](../ROADMAP.md)

This is the implementation ledger. Update it in the same commit as every completed or materially changed implementation slice. It records only current execution state, validation, commits, rollback, and blockers.

## Active execution slice

**Roadmap alignment:** Phase 2 — Core safety and workflow foundation.

**In scope:** Harden the site analyzer and contact-to-lead capture, establish safe operator-only workflow foundations, and preserve the focused client portal while those changes are made.

**Before review:** Run `git diff --check`, targeted unit/API and authorization tests, and the relevant retained-route smoke checks. Run `npm run type-check` and `npm run build` when application code changes. Record any unavailable integration checks below.

**Rollback:** Revert the focused implementation commit. Do not pair an irreversible schema change with a broad removal.

**Blockers:** None recorded.

## Change log

| Date | Slice | Commit | Result | Rollback |
| --- | --- | --- | --- | --- |
| 2026-07-24 | System audit | `9d7b658` | Captured repository, service, route, and browser baseline. | Revert `9d7b658` if necessary. |
| 2026-07-25 | CI and retained-core baseline | This commit | CI verifies `dev` pushes and `production` pull requests with type checking, unit tests, and a production build. Retained-route smoke checks are non-mutating; live analyzer and local-Supabase RLS checks are opt-in. | Revert this commit. |
| 2026-07-25 | Owner dashboard inventory | `docs: inventory retained owner dashboard` | Classified owner routes, APIs, data dependencies, and the hosted-payment boundary. | Revert `docs: inventory retained owner dashboard`. |

## Latest validation record

- `npm run type-check` passed.
- `npm run test:unit` passed: 247 tests passed; 64 opt-in integration tests skipped.
- `npm run build` passed with one existing `@next/next/no-img-element` warning in `components/DeviceShowcase/ScaledIframe.tsx`.
- `npm run test:retained-smoke` passed: six desktop/mobile route checks passed; two report checks were skipped because `E2E_REPORT_ID` was not configured.
- `npm run test:site-analyzer-live` and `npm run test:security` were not run: this environment could not resolve the public site or reach local Supabase.
