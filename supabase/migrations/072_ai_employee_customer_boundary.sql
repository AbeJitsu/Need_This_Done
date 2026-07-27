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
  queue text not null check (queue in ('morning', 'midday', 'evening')),
  title text not null,
  evidence jsonb not null default '[]'::jsonb,
  proposed_action text not null,
  expected_outcome text,
  risk_level text not null default 'low' check (risk_level in ('low', 'medium', 'high')),
  priority integer not null check (priority between 1 and 5),
  status text not null default 'pending' check (status in ('pending', 'approved', 'revised', 'deferred', 'rejected', 'completed')),
  external_action_key text,
  created_at timestamptz not null default now(),
  unique (employee_id, external_action_key)
);

create table if not exists public.ai_employee_decisions (
  id uuid primary key default gen_random_uuid(),
  work_item_id uuid not null references public.ai_employee_work_items(id) on delete restrict,
  decided_by uuid not null references auth.users(id) on delete restrict,
  decision text not null check (decision in ('approve', 'revise', 'defer', 'reject')),
  instructions text,
  idempotency_key uuid not null,
  created_at timestamptz not null default now(),
  unique (work_item_id, idempotency_key)
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
create policy "members record decisions" on public.ai_employee_decisions for insert with check (
  decided_by = auth.uid() and exists (
    select 1 from public.ai_employee_work_items w join public.ai_employees e on e.id = w.employee_id
    where w.id = work_item_id and public.is_customer_member(e.customer_id)
  )
);
create policy "members read outcomes" on public.ai_employee_outcomes for select using (
  exists (select 1 from public.ai_employees e where e.id = employee_id and public.is_customer_member(e.customer_id))
);
