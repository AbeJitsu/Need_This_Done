-- OpenRouter dynamic-route evidence boundary.
--
-- Purpose: retain the requested router ID and the actual endpoint model for a
-- controlled `openrouter/free` probe without allowing the moving router to be
-- selected or pinned as a live worker model.
--
-- Data handling: only sanitized evaluation observations and provider usage
-- metadata are stored. This migration does not add a sender, schedule,
-- publication, payment, customer-recipient, or worker activation path.
--
-- Verification: local schema/RLS tests and the signed two-request probe must
-- confirm that the profile remains evaluation-required and that the actual
-- model ID is recorded. Rollback is forward-only: disable the probe caller,
-- preserve the evidence, and use a reviewed replacement migration if needed.

alter table public.model_evaluation_records
  add column if not exists actual_model_id text;

alter table public.model_evaluation_records
  drop constraint if exists model_evaluation_records_actual_model_id_check;

alter table public.model_evaluation_records
  add constraint model_evaluation_records_actual_model_id_check
  check (
    actual_model_id is null
    or (
      trim(actual_model_id) ~ '^[A-Za-z0-9][A-Za-z0-9._-]*/[A-Za-z0-9][A-Za-z0-9._:-]*$'
      and trim(actual_model_id) !~* '(^|[/:_-])(latest|current|stable|default)($|[/:_-])'
      and trim(actual_model_id) <> 'openrouter/free'
    )
  );

alter table public.model_usage_ledger
  add column if not exists actual_model_id text;

alter table public.model_usage_ledger
  drop constraint if exists model_usage_ledger_actual_model_id_check;

alter table public.model_usage_ledger
  add constraint model_usage_ledger_actual_model_id_check
  check (
    actual_model_id is null
    or (
      trim(actual_model_id) ~ '^[A-Za-z0-9][A-Za-z0-9._-]*/[A-Za-z0-9][A-Za-z0-9._:-]*$'
      and trim(actual_model_id) !~* '(^|[/:_-])(latest|current|stable|default)($|[/:_-])'
      and trim(actual_model_id) <> 'openrouter/free'
    )
  );

alter table public.model_benchmark_candidates
  drop constraint if exists model_benchmark_candidates_candidate_kind_check;

alter table public.model_benchmark_candidates
  add constraint model_benchmark_candidates_candidate_kind_check
  check (candidate_kind in ('free', 'deepseek-fallback', 'configured-primary', 'configured-test', 'router-free'));

alter table public.growth_profiles
  drop constraint if exists growth_profiles_selected_model_check;

alter table public.growth_profiles
  add constraint growth_profiles_selected_model_check
  check (
    (model_route = 'evaluation-required' and selected_model_id is null)
    or (
      model_route in ('selected-primary', 'selected-free', 'selected-deepseek-fallback')
      and nullif(trim(selected_model_id), '') is not null
      and trim(selected_model_id) <> 'openrouter/free'
      and nullif(trim(selected_model_rationale), '') is not null
    )
  );

create or replace function public.pin_private_primary_model(
  target_profile_id uuid,
  target_worker text,
  target_model_id text,
  target_rationale text
)
returns jsonb language plpgsql security definer set search_path = public
as $$
declare
  profile public.growth_profiles;
begin
  if not public.private_worker_access()
    or nullif(trim(target_worker), '') is null
    or nullif(trim(target_model_id), '') is null
    or nullif(trim(target_rationale), '') is null
    or trim(target_model_id) = 'openrouter/free'
    or trim(target_model_id) !~ '^[A-Za-z0-9][A-Za-z0-9._-]*/[A-Za-z0-9][A-Za-z0-9._:-]*$'
    or trim(target_model_id) ~* '(^|[/:_-])(latest|current|stable|default)($|[/:_-])' then
    raise exception 'invalid_primary_model_pin' using errcode = '22023';
  end if;

  select * into profile from public.growth_profiles where id = target_profile_id for update;
  if not found or profile.emergency_stop then
    raise exception 'primary_model_pin_not_allowed' using errcode = '22023';
  end if;
  if profile.model_route not in ('evaluation-required', 'selected-primary', 'selected-free', 'selected-deepseek-fallback') then
    raise exception 'primary_model_pin_not_allowed' using errcode = '22023';
  end if;

  update public.growth_profiles
    set model_route = 'selected-primary',
      fallback_model = '',
      selected_model_id = trim(target_model_id),
      selected_model_rationale = trim(target_rationale),
      model_selected_at = now(),
      updated_at = now()
    where id = profile.id;

  return jsonb_build_object('model_route', 'selected-primary', 'selected_model_id', trim(target_model_id));
end;
$$;

create or replace function public.record_private_model_actual(
  target_reservation_key uuid,
  target_actual_model_id text
)
returns jsonb language plpgsql security definer set search_path = public
as $$
declare
  usage_row public.model_usage_ledger;
begin
  if not public.private_worker_access()
    or target_reservation_key is null
    or nullif(trim(target_actual_model_id), '') is null
    or trim(target_actual_model_id) = 'openrouter/free'
    or trim(target_actual_model_id) !~ '^[A-Za-z0-9][A-Za-z0-9._-]*/[A-Za-z0-9][A-Za-z0-9._:-]*$'
    or trim(target_actual_model_id) ~* '(^|[/:_-])(latest|current|stable|default)($|[/:_-])' then
    raise exception 'invalid_actual_model_id' using errcode = '22023';
  end if;

  select * into usage_row
  from public.model_usage_ledger
  where reservation_key = target_reservation_key
  for update;

  if not found then raise exception 'reservation_not_found' using errcode = 'P0002'; end if;
  if usage_row.status not in ('reserved', 'reconciled') then
    raise exception 'actual_model_not_recordable' using errcode = '22023';
  end if;

  update public.model_usage_ledger
    set actual_model_id = trim(target_actual_model_id)
    where id = usage_row.id
    returning * into usage_row;
  return to_jsonb(usage_row);
end;
$$;

revoke all on function public.pin_private_primary_model(uuid, text, text, text) from public, anon, authenticated;
grant execute on function public.pin_private_primary_model(uuid, text, text, text) to service_role;
revoke all on function public.record_private_model_actual(uuid, text) from public, anon, authenticated;
grant execute on function public.record_private_model_actual(uuid, text) to service_role;
