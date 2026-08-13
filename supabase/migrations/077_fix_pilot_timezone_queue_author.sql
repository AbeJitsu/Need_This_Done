-- Purpose: make queue-date validation use the employee's configured timezone
-- and retain the authenticated work-item author.
-- Impact: additive audit column plus a replacement of the 079 queue RPC.
-- External systems and existing rows are unchanged.

alter table public.ai_employee_work_items
  add column created_by uuid references auth.users(id) on delete restrict;

create or replace function public.create_ai_employee_work_item(
  target_employee_id uuid,
  target_queue text,
  target_scheduled_date date,
  target_title text,
  target_evidence jsonb,
  target_proposed_action text,
  target_expected_outcome text,
  target_risk_level text,
  target_priority integer,
  target_source_type text,
  target_source_id text,
  target_idempotency_key uuid
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor_id uuid := auth.uid();
  employee_today date;
  existing_work public.ai_employee_work_items;
  created_work public.ai_employee_work_items;
  normalized_title text := nullif(trim(target_title), '');
  normalized_action text := nullif(trim(target_proposed_action), '');
  normalized_outcome text := nullif(trim(target_expected_outcome), '');
  normalized_source_type text := nullif(trim(target_source_type), '');
  normalized_source_id text := nullif(trim(target_source_id), '');
begin
  if actor_id is null then
    raise exception 'unauthorized' using errcode = '42501';
  end if;

  select (now() at time zone coalesce(configured_schedule.timezone, 'UTC'))::date
  into employee_today
  from public.ai_employees as employee
  join public.customer_memberships as membership
    on membership.customer_id = employee.customer_id
    and membership.user_id = actor_id
  left join lateral (
    select schedule.timezone
    from public.ai_employee_check_in_schedules as schedule
    where schedule.employee_id = employee.id and schedule.enabled
    order by case schedule.check_in_type
      when 'morning' then 1 when 'midday' then 2 else 3
    end
    limit 1
  ) as configured_schedule on true
  where employee.id = target_employee_id
    and membership.role in ('owner', 'manager');

  if not found then
    raise exception 'member_manager_required' using errcode = '42501';
  end if;

  if target_queue not in ('morning', 'midday', 'evening')
    or target_scheduled_date is null
    or target_scheduled_date < employee_today
    or normalized_title is null
    or length(normalized_title) > 200
    or normalized_action is null
    or length(normalized_action) > 4000
    or length(coalesce(normalized_outcome, '')) > 2000
    or jsonb_typeof(target_evidence) <> 'array'
    or target_risk_level not in ('low', 'medium', 'high')
    or target_priority not between 1 and 5
    or length(coalesce(normalized_source_type, '')) > 80
    or length(coalesce(normalized_source_id, '')) > 200 then
    raise exception 'invalid_work_item' using errcode = '22023';
  end if;

  select * into existing_work
  from public.ai_employee_work_items
  where employee_id = target_employee_id
    and external_action_key = target_idempotency_key::text;

  if found then
    if existing_work.created_by is distinct from actor_id
      or existing_work.queue <> target_queue
      or existing_work.scheduled_date <> target_scheduled_date
      or existing_work.title <> normalized_title
      or existing_work.evidence <> target_evidence
      or existing_work.proposed_action <> normalized_action
      or existing_work.expected_outcome is distinct from normalized_outcome
      or existing_work.risk_level <> target_risk_level
      or existing_work.priority <> target_priority
      or existing_work.source_type is distinct from normalized_source_type
      or existing_work.source_id is distinct from normalized_source_id then
      raise exception 'idempotency_conflict' using errcode = '23505';
    end if;
    return to_jsonb(existing_work) || jsonb_build_object('duplicate', true);
  end if;

  insert into public.ai_employee_work_items (
    employee_id, source_type, source_id, queue, scheduled_date, title,
    evidence, proposed_action, expected_outcome, risk_level, priority,
    external_action_key, created_by
  ) values (
    target_employee_id, normalized_source_type, normalized_source_id,
    target_queue, target_scheduled_date, normalized_title, target_evidence,
    normalized_action, normalized_outcome, target_risk_level, target_priority,
    target_idempotency_key::text, actor_id
  ) returning * into created_work;

  return to_jsonb(created_work) || jsonb_build_object('duplicate', false);
end;
$$;
