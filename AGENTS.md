# NeedThisDone project instructions

This is the canonical cross-agent instruction file. Keep stable working
agreements here; keep changing product claims, milestones, and validation
results in the living documents below.

## Read the right source

- `README.md` — current product boundary, architecture, and local workflow.
- `ROADMAP.md` — current vision, work sequence, and paid-proof finish line.
- `docs/PROJECT_STATUS.md` — execution state, validation, blockers, and rollback.
- `docs/RELEASE_EVIDENCE.md` — what is verified, pending, or not claimable.
- `docs/launch/LAUNCH_CHECKLIST.md` — numbered hosted-promotion controls.

Read the relevant source before changing a subsystem. Do not copy changing
status, command inventories, or product prose into this file.

## Product boundary

NeedThisDone has two equal, human-led paths:

- Website Improvement: a $500 evidence-based audit and one agreed contained fix.
- Managed AI Operator: a proposal-based 30-day pilot privately operated by Abe
  and Andrea, with weekly client briefs.

The finish line is one paid, delivered outcome from each offer. The software
supports human scope, judgment, approval, and communication; it does not become
a redesign, integration, multi-page build, client dashboard, autonomous agent,
or automatic recurring purchase.

Private operator surfaces remain private. The planner is draft-only, every
external message, publication, system change, or spend requires human approval,
and the signed Mac bridge may execute only an approved frozen plan. No public
route may reach the worker boundary.

Supabase is durable product truth, including project, report, approval,
outcome, prospecting, evaluation, audit, and private-storage records. Redis is
transient only. Do not add Qdrant or another replacement database.

## Safety and change control

- Work on `dev`; do not alter `production` without explicit approval.
- Keep hosted backup, migration dry run, migration application, deployment,
  secret provisioning, provider activation, and live-action approvals separate.
- Never reset hosted Supabase, force-push, hard-reset user work, rebase the
  release history, or use a destructive hosted rollback. Hosted rollback is
  forward-only.
- A local Supabase reset is acceptable only for the disposable local instance
  and only when the task explicitly calls for it.
- Never print or commit credentials, service keys, or secret environment files;
  load only the values required for an explicitly approved, scoped operation and
  do not inspect unrelated secret material.
- Do not treat local tests or deterministic provider doubles as hosted,
  provider, paid-delivery, or customer proof.

## Working method

1. Inspect `git status` and preserve existing user changes.
2. Read the relevant living document and nested `AGENTS.md` before editing.
3. Make one coherent, tested change; avoid unrelated cleanup.
4. Update the canonical ledger when implementation or release evidence changes.
5. When committing is requested, keep the implementation and its ledger update
   in the same commit and record validation plus rollback notes.
6. Run the narrowest relevant checks, then the documented release gate when
   the change affects it. Record unavailable checks with an owner and removal
   date rather than hiding them.

Prefer existing helpers, validation, timeout/retry, authorization, RLS, and
evidence patterns over new parallel mechanisms. Keep instructions and docs
pointed at their source of truth instead of repeating the same rule.

## Subsystem guidance

- `app/lib/AGENTS.md` covers reusable application-library boundaries.
- `supabase/AGENTS.md` covers schema, RLS, migration, and Storage boundaries.
