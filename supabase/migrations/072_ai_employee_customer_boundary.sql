-- Additive customer boundary for supervised AI employees.
-- No existing tables or data are altered.

create table if not exists public.customer_accounts (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.customer_memberships (
  customer_id uuid not null references public.customer_accounts(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('owner', 'manager', 'viewer')),
  created_at timestamptz not null default now(),
  primary key (customer_id, user_id)
);

create table if not exists public.ai_employees (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customer_accounts(id) on delete cascade,
  name text not null,
  role_name text not null default 'AI Growth Employee',
  status text not null default 'pilot' check (status in ('pilot', 'managed', 'paused')),
  created_at timestamptz not null default now()
);

create table if not exists public.ai_employee_operating_briefs (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references public.ai_employees(id) on delete cascade,
  version integer not null default 1,
  responsibilities jsonb not null default '[]'::jsonb,
  prohibited_actions jsonb not null default '[]'::jsonb,
  channels jsonb not null default '[]'::jsonb,
  tone text,
  approval_rules jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  unique (employee_id, version)
);

create table if not exists public.ai_employee_check_in_schedules (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references public.ai_employees(id) on delete cascade,
  check_in_type text not null check (check_in_type in ('morning', 'midday', 'evening')),
  local_time time not null,
  timezone text not null,
  enabled boolean not null default true,
  unique (employee_id, check_in_type)
);

create table if not exists public.ai_employee_work_items (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references public.ai_employees(id) on delete cascade,
  predecessor_work_item_id uuid references public.ai_employee_work_items(id) on delete restrict,
  source_type text,
  source_id text,
  queue text not null check (queue in ('morning', 'midday', 'evening')),
  scheduled_date date not null default current_date,
  title text not null,
  evidence jsonb not null default '[]'::jsonb,
  proposed_action text not null,
  expected_outcome text,
  risk_level text not null default 'low' check (risk_level in ('low', 'medium', 'high')),
  priority integer not null check (priority between 1 and 5),
  status text not null default 'pending' check (status in ('pending', 'approved', 'revised', 'deferred', 'rejected', 'completed')),
  external_action_key text,
  created_at timestamptz not null default now(),
  unique (employee_id, external_action_key),
  unique (predecessor_work_item_id)
);

create unique index ai_employee_pending_queue_slot
  on public.ai_employee_work_items (employee_id, queue, scheduled_date, priority)
  where status = 'pending';

create table if not exists public.ai_employee_decisions (
  id uuid primary key default gen_random_uuid(),
  work_item_id uuid not null references public.ai_employee_work_items(id) on delete cascade,
  decided_by uuid not null references auth.users(id) on delete restrict,
  decision text not null check (decision in ('approve', 'revise', 'defer', 'reject')),
  instructions text,
  idempotency_key uuid not null,
  created_at timestamptz not null default now(),
  unique (work_item_id),
  unique (idempotency_key)
);

create table if not exists public.ai_employee_outcomes (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references public.ai_employees(id) on delete cascade,
  work_item_id uuid references public.ai_employee_work_items(id) on delete set null,
  kind text not null check (kind in ('lead', 'reply', 'meeting', 'project', 'time_saved')),
  value numeric not null default 1,
  notes text,
  occurred_at timestamptz not null default now()
);

alter table public.customer_accounts enable row level security;
alter table public.customer_memberships enable row level security;
alter table public.ai_employees enable row level security;
alter table public.ai_employee_operating_briefs enable row level security;
alter table public.ai_employee_check_in_schedules enable row level security;
alter table public.ai_employee_work_items enable row level security;
alter table public.ai_employee_decisions enable row level security;
alter table public.ai_employee_outcomes enable row level security;

create or replace function public.is_customer_member(target_customer_id uuid)
returns boolean language sql stable security definer set search_path = public
as $$ select exists (
  select 1 from public.customer_memberships
  where customer_id = target_customer_id and user_id = auth.uid()
) $$;

create policy "members read customer" on public.customer_accounts for select using (public.is_customer_member(id));
create policy "members read memberships" on public.customer_memberships for select using (public.is_customer_member(customer_id));
create policy "members read employees" on public.ai_employees for select using (public.is_customer_member(customer_id));
create policy "members read briefs" on public.ai_employee_operating_briefs for select using (
  exists (select 1 from public.ai_employees e where e.id = employee_id and public.is_customer_member(e.customer_id))
);
create policy "members read schedules" on public.ai_employee_check_in_schedules for select using (
  exists (select 1 from public.ai_employees e where e.id = employee_id and public.is_customer_member(e.customer_id))
);
create policy "members read work" on public.ai_employee_work_items for select using (
  exists (select 1 from public.ai_employees e where e.id = employee_id and public.is_customer_member(e.customer_id))
);
create policy "members read decisions" on public.ai_employee_decisions for select using (
  exists (
    select 1 from public.ai_employee_work_items w join public.ai_employees e on e.id = w.employee_id
    where w.id = work_item_id and public.is_customer_member(e.customer_id)
  )
);
create policy "members read outcomes" on public.ai_employee_outcomes for select using (
  exists (select 1 from public.ai_employees e where e.id = employee_id and public.is_customer_member(e.customer_id))
);

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
set search_path = public
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
  if actor_id is null then
    raise exception 'unauthorized' using errcode = '42501';
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

  select * into existing_decision
  from public.ai_employee_decisions
  where idempotency_key = target_idempotency_key;

  if found then
    if existing_decision.work_item_id <> target_work_item_id
      or existing_decision.decided_by <> actor_id
      or existing_decision.decision <> target_decision
      or existing_decision.instructions is distinct from normalized_instructions then
      raise exception 'idempotency_conflict' using errcode = '23505';
    end if;
    select * into successor_work
    from public.ai_employee_work_items
    where predecessor_work_item_id = target_work_item_id;
    if target_decision = 'defer'
      and successor_work.scheduled_date is distinct from target_defer_date then
      raise exception 'idempotency_conflict' using errcode = '23505';
    end if;
    return to_jsonb(existing_decision) || jsonb_build_object(
      'duplicate', true,
      'successor_work_item_id', successor_work.id
    );
  end if;

  select w.* into current_work
    from public.ai_employee_work_items w
    join public.ai_employees e on e.id = w.employee_id
    join public.customer_memberships m
      on m.customer_id = e.customer_id and m.user_id = actor_id
    where w.id = target_work_item_id
      and w.status = 'pending'
      and m.role in ('owner', 'manager')
    for update of w;

  if not found then
    raise exception 'not_pending_or_forbidden' using errcode = '42501';
  end if;

  insert into public.ai_employee_decisions (
    work_item_id, decided_by, decision, instructions, idempotency_key
  ) values (
    target_work_item_id,
    actor_id,
    target_decision,
    normalized_instructions,
    target_idempotency_key
  )
  returning * into created_decision;

  next_status := case target_decision
    when 'approve' then 'approved'
    when 'revise' then 'revised'
    when 'defer' then 'deferred'
    else 'rejected'
  end;

  update public.ai_employee_work_items
  set status = next_status
  where id = target_work_item_id and status = 'pending';

  if not found then
    raise exception 'decision_race' using errcode = '40001';
  end if;

  if target_decision in ('revise', 'defer') then
    insert into public.ai_employee_work_items (
      employee_id, predecessor_work_item_id, source_type, source_id, queue,
      scheduled_date, title, evidence, proposed_action, expected_outcome,
      risk_level, priority
    ) values (
      current_work.employee_id,
      current_work.id,
      current_work.source_type,
      current_work.source_id,
      current_work.queue,
      case when target_decision = 'defer' then target_defer_date else current_work.scheduled_date end,
      current_work.title,
      current_work.evidence,
      case
        when target_decision = 'revise' then current_work.proposed_action || E'\n\nRevision requested: ' || normalized_instructions
        else current_work.proposed_action
      end,
      current_work.expected_outcome,
      current_work.risk_level,
      current_work.priority
    )
    returning * into successor_work;
  end if;

  return to_jsonb(created_decision) || jsonb_build_object(
    'duplicate', false,
    'successor_work_item_id', successor_work.id
  );
end;
$$;

revoke all on function public.record_ai_employee_decision(uuid, text, text, uuid, date) from public;
revoke all on function public.record_ai_employee_decision(uuid, text, text, uuid, date) from anon;
grant execute on function public.record_ai_employee_decision(uuid, text, text, uuid, date) to authenticated;
