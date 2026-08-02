-- Purpose: measure the supervised AI employee against daily net revenue without
-- introducing a second financial source of truth.
-- Impact: additive columns and stricter outcome validation only. Existing
-- operational outcomes remain valid and unchanged.
-- Data handling: money is stored as positive integer minor units (cents).
-- Verification: retained manifest and AI employee RLS/financial tests.
-- Rollback: a reviewed forward migration may remove the columns after callers
-- are reverted; do not discard recorded financial history implicitly.

alter table public.ai_employee_outcomes
  add column amount_cents bigint,
  add column currency text,
  add column cost_category text;

alter table public.ai_employee_outcomes
  drop constraint ai_employee_outcomes_kind_check,
  add constraint ai_employee_outcomes_kind_check
    check (kind in ('lead', 'reply', 'meeting', 'project', 'time_saved', 'revenue', 'cost')),
  add constraint ai_employee_outcomes_financial_fields_check check (
    (
      kind = 'revenue'
      and amount_cents is not null
      and amount_cents > 0
      and currency is not null
      and currency ~ '^[A-Z]{3}$'
      and cost_category is null
    )
    or (
      kind = 'cost'
      and amount_cents is not null
      and amount_cents > 0
      and currency is not null
      and currency ~ '^[A-Z]{3}$'
      and cost_category is not null
      and cost_category in ('model', 'tooling', 'payment', 'advertising', 'contractor', 'delivery')
    )
    or (
      kind not in ('revenue', 'cost')
      and amount_cents is null
      and currency is null
      and cost_category is null
    )
  );

create index ai_employee_outcomes_daily_scorecard_idx
  on public.ai_employee_outcomes (employee_id, occurred_at desc, currency)
  where kind in ('revenue', 'cost');
