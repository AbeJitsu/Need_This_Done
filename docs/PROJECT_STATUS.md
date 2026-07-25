# NeedThisDone Project Status

**Owner:** NeedThisDone
**Active branch:** `dev`
**Production rule:** Production changes require explicit approval after `dev` validation.

This is the source of truth for active simplification work. Update it in the same commit as every completed or materially changed slice.

## Working agreement

Each slice records its scope, validation, commit SHA, rollback method, and follow-up work. Do not combine unrelated removals in one commit.

```text
Documentation
   -> Dashboard inventory
   -> Core safety + portal
   -> Stripe-hosted payments
   -> Retire old systems
   -> Retained UI cleanup
```

| Phase | Status | Objective | Validation and rollback |
| --- | --- | --- | --- |
| 0. Documentation and tracking | Complete | Establish the retained-product narrative, tracker, and `dev` CI gate | Revert the documentation or CI-baseline commit |
| 1. Owner dashboard inventory | Complete | Classify existing admin screens and define the retained owner workflow and pricing boundary | Static route/API/data/navigation inventory; documentation-only diff checks; revert the inventory commit |
| 2. Core safety and portal | Planned | Harden analyzer and contact lead capture; retain focused client collaboration | Unit/API/authorization tests; revert focused commits |
| 3. Hosted Stripe payments | Planned | Replace custom commerce checkout with Stripe-hosted flows | Stripe test-mode and route tests; retain old flow until replacement passes |
| 4. Retire old systems | Planned | Remove LMS, editor, ecommerce, Medusa/Railway, and related docs | Build/tests/searches per subsystem; one reversible subsystem commit at a time |
| 5. Retained UI cleanup | Planned | Remove dark mode and reduce global UI complexity | Desktop/mobile smoke checks, accessibility checks, build |

## Current decisions

| Decision | Choice |
| --- | --- |
| Blog | Keep database-administered |
| Payments | Stripe-hosted Payment Links, invoices, subscriptions, and Customer Portal |
| Pricing model | Public, clearly scoped services use repository-owned catalog entries and Stripe-hosted standard checkout; custom work starts as a project request and is paid by Stripe invoice |
| Client login | Keep and reshape as a project-sharing portal |
| Ecommerce/LMS data | Disposable after code removal and separately reviewed schema cleanup |
| Retired documentation | Delete operational manuals; retain only current mission-relevant records |
| Dark mode | Remove rather than repair |

## Change log

Add an entry here when a slice is completed.

| Date | Slice | Commit | Result | Rollback |
| --- | --- | --- | --- | --- |
| 2026-07-24 | System audit | `9d7b658` | Captured repository, service, route, and browser baseline | Revert `9d7b658` if necessary |
| 2026-07-25 | CI and retained-core baseline | This commit | CI now verifies `dev` pushes and `production` pull requests with type checking, self-contained unit tests, and a production build. The retained-route desktop/mobile smoke suite is non-mutating; the live-site analyzer and local-Supabase RLS suites are explicit opt-in integration checks. | Revert this commit |
| 2026-07-25 | Owner dashboard inventory | `docs: inventory retained owner dashboard` | Classified 33 admin routes, 37 admin APIs, retained/transitional data surfaces, and visible owner navigation. Recorded the repository-owned catalog and Stripe-hosted payment boundary without changing behavior. | Revert `docs: inventory retained owner dashboard` |

### CI and retained-core baseline results (2026-07-25)

- `npm run type-check` passed.
- `npm run test:unit` passed: 247 tests passed and 64 opt-in integration tests skipped.
- `npm run build` passed with one existing `@next/next/no-img-element` warning in `components/DeviceShowcase/ScaledIframe.tsx`.
- `npm run test:retained-smoke` passed: six desktop/mobile route checks passed; two report checks skipped because `E2E_REPORT_ID` was not configured.
- `npm run test:site-analyzer-live` and `npm run test:security` remain on-demand checks. They were not run because this environment cannot resolve the public site or reach a local Supabase instance.

## Required checks before a `dev` review

- `git diff --check`
- Targeted unit/API tests
- `npm run type-check` and `npm run build` when application code changes
- `npm run test:retained-smoke` for retained-route desktop/mobile coverage
- Critical desktop and mobile route smoke checks
- Search for callers of a removed subsystem
- Confirm `production` has not changed
