-- Purpose: retire client access without deleting identities, links, memberships,
-- comments, files, handoffs, or delivery history.
-- Impact: browser roles may reach retained private records and employee RPCs
-- only with a database-backed admin role. New pilot provisioning creates only
-- operator memberships. GitHub notifications become draft-only in the app.
-- Verification: capability manifest, route denial tests, AI employee RLS tests,
-- retained schema manifest, and disposable local reset through this migration.
-- Rollback: revert callers first and use a reviewed forward migration. Do not
-- reactivate historical client access or delete retained records.

alter table public.customer_memberships
  add column access_retired_at timestamptz not null default now();

create or replace function public.is_customer_member(target_customer_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select target_customer_id is not null and public.is_admin(auth.uid());
$$;

drop policy if exists "members read customer" on public.customer_accounts;
drop policy if exists "members read memberships" on public.customer_memberships;
drop policy if exists "members read employees" on public.ai_employees;
drop policy if exists "members read briefs" on public.ai_employee_operating_briefs;
drop policy if exists "members read schedules" on public.ai_employee_check_in_schedules;
drop policy if exists "members read work" on public.ai_employee_work_items;
drop policy if exists "members read decisions" on public.ai_employee_decisions;
drop policy if exists "members read outcomes" on public.ai_employee_outcomes;

create policy "operators read customer accounts" on public.customer_accounts
  for select using (public.is_admin(auth.uid()));
create policy "operators read retired memberships" on public.customer_memberships
  for select using (public.is_admin(auth.uid()));
create policy "operators read employees" on public.ai_employees
  for select using (public.is_admin(auth.uid()));
create policy "operators read employee briefs" on public.ai_employee_operating_briefs
  for select using (public.is_admin(auth.uid()));
create policy "operators read employee schedules" on public.ai_employee_check_in_schedules
  for select using (public.is_admin(auth.uid()));
create policy "operators read employee work" on public.ai_employee_work_items
  for select using (public.is_admin(auth.uid()));
create policy "operators read employee decisions" on public.ai_employee_decisions
  for select using (public.is_admin(auth.uid()));
create policy "operators read employee outcomes" on public.ai_employee_outcomes
  for select using (public.is_admin(auth.uid()));

drop policy if exists "Authenticated users can create projects" on public.projects;
drop policy if exists "Users can read own projects" on public.projects;
drop policy if exists "Users can read own projects, admins read all" on public.projects;
drop policy if exists "Users can update own projects, admins update all" on public.projects;
drop policy if exists "Only admins can delete" on public.projects;
create policy "operators read projects" on public.projects
  for select using (public.is_admin(auth.uid()));
create policy "operators update projects" on public.projects
  for update using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));
create policy "operators delete projects" on public.projects
  for delete using (public.is_admin(auth.uid()));
revoke insert, update, delete on table public.projects from anon, authenticated;

drop policy if exists "Users can read own project comments" on public.project_comments;
drop policy if exists "Authenticated users can comment" on public.project_comments;
create policy "operators read project comments" on public.project_comments
  for select using (public.is_admin(auth.uid()));
create policy "operators create project comments" on public.project_comments
  for insert with check (public.is_admin(auth.uid()) and user_id = auth.uid());
revoke insert, update, delete on table public.project_comments from anon;

alter table public.project_github_handoffs
  drop constraint project_github_handoffs_notification_status_check,
  add constraint project_github_handoffs_notification_status_check
    check (notification_status in ('draft', 'pending', 'sent', 'failed'));

create or replace function public.provision_ai_employee_pilot(
  target_project_id uuid,
  target_employee_name text,
  target_role_name text,
  target_timezone text,
  target_morning_time time,
  target_midday_time time,
  target_evening_time time,
  target_responsibilities jsonb,
  target_prohibited_actions jsonb,
  target_channels jsonb,
  target_tone text,
  target_approval_rules jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor_id uuid := auth.uid();
  source_project public.projects;
  created_customer public.customer_accounts;
  created_employee public.ai_employees;
begin
  if actor_id is null or not public.is_admin(actor_id) then
    raise exception 'admin_required' using errcode = '42501';
  end if;

  if nullif(trim(target_employee_name), '') is null
    or length(trim(target_employee_name)) > 120
    or nullif(trim(target_role_name), '') is null
    or length(trim(target_role_name)) > 120
    or nullif(trim(target_timezone), '') is null
    or length(trim(target_timezone)) > 120
    or target_morning_time is null
    or target_midday_time is null
    or target_evening_time is null
    or jsonb_typeof(target_responsibilities) <> 'array'
    or jsonb_typeof(target_prohibited_actions) <> 'array'
    or jsonb_typeof(target_channels) <> 'array'
    or jsonb_typeof(target_approval_rules) <> 'array'
    or length(coalesce(target_tone, '')) > 2000 then
    raise exception 'invalid_pilot_details' using errcode = '22023';
  end if;

  select * into source_project from public.projects
  where id = target_project_id for update;
  if not found then raise exception 'project_not_found' using errcode = 'P0002'; end if;

  if source_project.customer_id is not null then
    select * into created_employee from public.ai_employees
    where customer_id = source_project.customer_id order by created_at asc limit 1;
    return jsonb_build_object(
      'project_id', source_project.id,
      'customer_id', source_project.customer_id,
      'employee_id', created_employee.id,
      'duplicate', true
    );
  end if;

  insert into public.customer_accounts (name)
  values (coalesce(nullif(trim(source_project.company), ''), trim(source_project.name)))
  returning * into created_customer;

  insert into public.customer_memberships (customer_id, user_id, role)
  select created_customer.id, operator_role.user_id,
    case when operator_role.user_id = actor_id then 'owner' else 'manager' end
  from public.user_roles as operator_role
  join auth.users as operator_user on operator_user.id = operator_role.user_id
  where operator_role.role = 'admin'
  on conflict (customer_id, user_id) do update
    set role = excluded.role, access_retired_at = now();

  insert into public.ai_employees (customer_id, name, role_name)
  values (created_customer.id, trim(target_employee_name), trim(target_role_name))
  returning * into created_employee;

  insert into public.ai_employee_operating_briefs (
    employee_id, responsibilities, prohibited_actions, channels, tone, approval_rules
  ) values (
    created_employee.id, target_responsibilities, target_prohibited_actions,
    target_channels, nullif(trim(target_tone), ''), target_approval_rules
  );

  insert into public.ai_employee_check_in_schedules (
    employee_id, check_in_type, local_time, timezone
  ) values
    (created_employee.id, 'morning', target_morning_time, trim(target_timezone)),
    (created_employee.id, 'midday', target_midday_time, trim(target_timezone)),
    (created_employee.id, 'evening', target_evening_time, trim(target_timezone));

  update public.projects set customer_id = created_customer.id
  where id = source_project.id;

  return jsonb_build_object(
    'project_id', source_project.id,
    'customer_id', created_customer.id,
    'employee_id', created_employee.id,
    'duplicate', false
  );
end;
$$;

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
  if actor_id is null or not public.is_admin(actor_id) then
    raise exception 'admin_required' using errcode = '42501';
  end if;

  select (now() at time zone coalesce(configured_schedule.timezone, 'UTC'))::date
  into employee_today
  from public.ai_employees as employee
  left join lateral (
    select schedule.timezone from public.ai_employee_check_in_schedules as schedule
    where schedule.employee_id = employee.id and schedule.enabled
    order by case schedule.check_in_type when 'morning' then 1 when 'midday' then 2 else 3 end
    limit 1
  ) as configured_schedule on true
  where employee.id = target_employee_id;

  if not found then raise exception 'employee_not_found' using errcode = 'P0002'; end if;

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

  select * into existing_work from public.ai_employee_work_items
  where employee_id = target_employee_id and external_action_key = target_idempotency_key::text;
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

create or replace function public.record_ai_employee_decision(
  target_work_item_id uuid,
  target_decision text,
  target_instructions text,
  target_idempotency_key uuid,
  target_defer_date date default null
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor_id uuid := auth.uid();
  existing_decision public.ai_employee_decisions;
  created_decision public.ai_employee_decisions;
  current_work public.ai_employee_work_items;
  successor_work public.ai_employee_work_items;
  normalized_instructions text := nullif(trim(target_instructions), '');
  next_status text;
begin
  if actor_id is null or not public.is_admin(actor_id) then
    raise exception 'admin_required' using errcode = '42501';
  end if;
  if target_decision not in ('approve', 'revise', 'defer', 'reject') then
    raise exception 'invalid_decision' using errcode = '22023';
  end if;
  if target_decision = 'defer' and (target_defer_date is null or target_defer_date <= current_date) then
    raise exception 'future_defer_date_required' using errcode = '22023';
  elsif target_decision = 'revise' and normalized_instructions is null then
    raise exception 'revision_instructions_required' using errcode = '22023';
  elsif target_decision <> 'defer' and target_defer_date is not null then
    raise exception 'unexpected_defer_date' using errcode = '22023';
  end if;

  select * into existing_decision from public.ai_employee_decisions
  where idempotency_key = target_idempotency_key;
  if found then
    if existing_decision.work_item_id <> target_work_item_id
      or existing_decision.decided_by <> actor_id
      or existing_decision.decision <> target_decision
      or existing_decision.instructions is distinct from normalized_instructions then
      raise exception 'idempotency_conflict' using errcode = '23505';
    end if;
    select * into successor_work from public.ai_employee_work_items
    where predecessor_work_item_id = target_work_item_id;
    if target_decision = 'defer' and successor_work.scheduled_date is distinct from target_defer_date then
      raise exception 'idempotency_conflict' using errcode = '23505';
    end if;
    return to_jsonb(existing_decision) || jsonb_build_object(
      'duplicate', true, 'successor_work_item_id', successor_work.id
    );
  end if;

  select w.* into current_work from public.ai_employee_work_items w
  where w.id = target_work_item_id and w.status = 'pending' for update of w;
  if not found then raise exception 'not_pending_or_forbidden' using errcode = '42501'; end if;

  insert into public.ai_employee_decisions (
    work_item_id, decided_by, decision, instructions, idempotency_key
  ) values (
    target_work_item_id, actor_id, target_decision, normalized_instructions, target_idempotency_key
  ) returning * into created_decision;

  next_status := case target_decision
    when 'approve' then 'approved' when 'revise' then 'revised'
    when 'defer' then 'deferred' else 'rejected' end;
  update public.ai_employee_work_items set status = next_status
  where id = target_work_item_id and status = 'pending';
  if not found then raise exception 'decision_race' using errcode = '40001'; end if;

  if target_decision in ('revise', 'defer') then
    insert into public.ai_employee_work_items (
      employee_id, predecessor_work_item_id, source_type, source_id, queue,
      scheduled_date, title, evidence, proposed_action, expected_outcome,
      risk_level, priority, created_by
    ) values (
      current_work.employee_id, current_work.id, current_work.source_type,
      current_work.source_id, current_work.queue,
      case when target_decision = 'defer' then target_defer_date else current_work.scheduled_date end,
      current_work.title, current_work.evidence,
      case when target_decision = 'revise'
        then current_work.proposed_action || E'\n\nRevision requested: ' || normalized_instructions
        else current_work.proposed_action end,
      current_work.expected_outcome, current_work.risk_level,
      current_work.priority, actor_id
    ) returning * into successor_work;
  end if;
  return to_jsonb(created_decision) || jsonb_build_object(
    'duplicate', false, 'successor_work_item_id', successor_work.id
  );
end;
$$;

create or replace function public.complete_ai_employee_work_item(
  target_work_item_id uuid,
  target_completion_notes text,
  target_idempotency_key uuid
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor_id uuid := auth.uid();
  current_work public.ai_employee_work_items;
  normalized_notes text := nullif(trim(target_completion_notes), '');
begin
  if actor_id is null or not public.is_admin(actor_id) then
    raise exception 'admin_required' using errcode = '42501';
  end if;
  if normalized_notes is null or length(normalized_notes) > 4000 then
    raise exception 'invalid_completion' using errcode = '22023';
  end if;

  select * into current_work from public.ai_employee_work_items
  where completion_idempotency_key = target_idempotency_key;
  if found then
    if current_work.id <> target_work_item_id
      or current_work.completed_by <> actor_id
      or current_work.completion_notes is distinct from normalized_notes then
      raise exception 'idempotency_conflict' using errcode = '23505';
    end if;
    return to_jsonb(current_work) || jsonb_build_object('duplicate', true);
  end if;

  select work.* into current_work from public.ai_employee_work_items as work
  where work.id = target_work_item_id and work.status = 'approved' for update of work;
  if not found then raise exception 'not_approved_or_forbidden' using errcode = '42501'; end if;

  update public.ai_employee_work_items
  set status = 'completed', completed_by = actor_id, completed_at = now(),
      completion_notes = normalized_notes, completion_idempotency_key = target_idempotency_key
  where id = target_work_item_id returning * into current_work;
  return to_jsonb(current_work) || jsonb_build_object('duplicate', false);
end;
$$;

create or replace function public.record_ai_employee_outcome(
  target_employee_id uuid,
  target_work_item_id uuid,
  target_kind text,
  target_value numeric,
  target_amount_cents bigint,
  target_currency text,
  target_cost_category text,
  target_notes text,
  target_occurred_at timestamptz,
  target_idempotency_key uuid
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor_id uuid := auth.uid();
  existing_outcome public.ai_employee_outcomes;
  created_outcome public.ai_employee_outcomes;
  normalized_currency text := nullif(upper(trim(target_currency)), '');
  normalized_cost_category text := nullif(trim(target_cost_category), '');
  normalized_notes text := nullif(trim(target_notes), '');
begin
  if actor_id is null or not public.is_admin(actor_id) then
    raise exception 'admin_required' using errcode = '42501';
  end if;
  if target_kind not in ('lead', 'reply', 'meeting', 'project', 'time_saved', 'revenue', 'cost')
    or target_value is null or target_value <= 0
    or length(coalesce(normalized_notes, '')) > 4000 then
    raise exception 'invalid_outcome' using errcode = '22023';
  end if;

  select * into existing_outcome from public.ai_employee_outcomes
  where idempotency_key = target_idempotency_key;
  if found then
    if existing_outcome.employee_id <> target_employee_id
      or existing_outcome.work_item_id is distinct from target_work_item_id
      or existing_outcome.recorded_by <> actor_id
      or existing_outcome.kind <> target_kind
      or existing_outcome.value <> target_value
      or existing_outcome.amount_cents is distinct from target_amount_cents
      or existing_outcome.currency is distinct from normalized_currency
      or existing_outcome.cost_category is distinct from normalized_cost_category
      or existing_outcome.notes is distinct from normalized_notes
      or (target_occurred_at is not null and existing_outcome.occurred_at <> target_occurred_at) then
      raise exception 'idempotency_conflict' using errcode = '23505';
    end if;
    return to_jsonb(existing_outcome) || jsonb_build_object('duplicate', true);
  end if;

  if not exists (select 1 from public.ai_employees where id = target_employee_id) then
    raise exception 'employee_not_found' using errcode = 'P0002';
  end if;
  if target_work_item_id is not null and not exists (
    select 1 from public.ai_employee_work_items
    where id = target_work_item_id and employee_id = target_employee_id
  ) then
    raise exception 'invalid_work_item' using errcode = '22023';
  end if;

  insert into public.ai_employee_outcomes (
    employee_id, work_item_id, kind, value, amount_cents, currency,
    cost_category, notes, occurred_at, recorded_by, idempotency_key
  ) values (
    target_employee_id, target_work_item_id, target_kind, target_value,
    target_amount_cents, normalized_currency, normalized_cost_category,
    normalized_notes, coalesce(target_occurred_at, now()), actor_id,
    target_idempotency_key
  ) returning * into created_outcome;
  return to_jsonb(created_outcome) || jsonb_build_object('duplicate', false);
end;
$$;

revoke all on function public.is_customer_member(uuid) from public, anon;
grant execute on function public.is_customer_member(uuid) to authenticated;
