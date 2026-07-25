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
| 0. Documentation and tracking | In progress | Replace stale product narrative and establish this tracker | Markdown review, `git diff --check`; revert the documentation commit |
| 1. Owner dashboard inventory | Planned | Classify existing admin screens and define retained workflow | Route/API/data inventory; no behavior change |
| 2. Core safety and portal | Planned | Harden analyzer and contact lead capture; retain focused client collaboration | Unit/API/authorization tests; revert focused commits |
| 3. Hosted Stripe payments | Planned | Replace custom commerce checkout with Stripe-hosted flows | Stripe test-mode and route tests; retain old flow until replacement passes |
| 4. Retire old systems | Planned | Remove LMS, editor, ecommerce, Medusa/Railway, and related docs | Build/tests/searches per subsystem; one reversible subsystem commit at a time |
| 5. Retained UI cleanup | Planned | Remove dark mode and reduce global UI complexity | Desktop/mobile smoke checks, accessibility checks, build |

## Current decisions

| Decision | Choice |
| --- | --- |
| Blog | Keep database-administered |
| Payments | Stripe-hosted Payment Links, invoices, subscriptions, and Customer Portal |
| Client login | Keep and reshape as a project-sharing portal |
| Ecommerce/LMS data | Disposable after code removal and separately reviewed schema cleanup |
| Retired documentation | Delete operational manuals; retain only current mission-relevant records |
| Dark mode | Remove rather than repair |

## Change log

Add an entry here when a slice is completed.

| Date | Slice | Commit | Result | Rollback |
| --- | --- | --- | --- | --- |
| 2026-07-24 | System audit | Pending commit | Captured repository, service, route, and browser baseline | Remove the documentation commit if necessary |
## Required checks before a `dev` review

- `git diff --check`
- Targeted unit/API tests
- `npm run type-check` and `npm run build` when application code changes
- Critical desktop and mobile route smoke checks
- Search for callers of a removed subsystem
- Confirm `production` has not changed
