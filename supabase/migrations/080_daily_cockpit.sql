-- Daily operator cockpit.
-- Weekly priorities and reflections are operator-owned durable records. The
-- cockpit actions table stores the operator's state for suggestions derived
-- from existing employee and outreach records; it does not perform external
-- actions or replace those source-of-truth tables.

create table public.operator_weekly_priorities (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  week_start date not null,
  position smallint not null check (position between 1 and 3),
  outcome text not null check (length(trim(outcome)) between 1 and 500),
  owner_name text not null check (length(trim(owner_name)) between 1 and 120),
  due_date date not null,
  status text not null default 'active' check (status in ('active', 'completed', 'dropped')),
  next_action text not null check (length(trim(next_action)) between 1 and 500),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index operator_weekly_priorities_active_position_key
  on public.operator_weekly_priorities (owner_id, week_start, position)
  where status = 'active';

create index operator_weekly_priorities_week_idx
  on public.operator_weekly_priorities (owner_id, week_start, status, position);

create table public.operator_cockpit_actions (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  week_start date not null,
  priority_id uuid references public.operator_weekly_priorities(id) on delete cascade,
  source_type text not null check (source_type in ('priority', 'employee_work', 'outreach_message', 'prospect_outcome')),
  source_id text not null,
  action_type text not null check (action_type in ('big_rock', 'employee', 'draft', 'reply', 'follow_up', 'outcome')),
  title text not null check (length(trim(title)) between 1 and 300),
  description text not null default '' check (length(description) <= 2000),
  due_date date,
  rank smallint not null default 50 check (rank between 1 and 100),
  status text not null default 'open' check (status in ('open', 'completed', 'deferred')),
  deferred_until date,
  completed_at timestamptz,
  completion_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (owner_id, source_type, source_id)
);

create index operator_cockpit_actions_today_idx
  on public.operator_cockpit_actions (owner_id, week_start, status, due_date, rank);

create table public.operator_daily_reflections (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  reflection_date date not null,
  reflection text not null check (length(trim(reflection)) between 1 and 2000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (owner_id, reflection_date)
);

alter table public.operator_weekly_priorities enable row level security;
alter table public.operator_cockpit_actions enable row level security;
alter table public.operator_daily_reflections enable row level security;

create policy "owners read weekly priorities"
  on public.operator_weekly_priorities for select
  using (owner_id = auth.uid());

create policy "owners manage weekly priorities"
  on public.operator_weekly_priorities for all
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

create policy "owners read cockpit actions"
  on public.operator_cockpit_actions for select
  using (owner_id = auth.uid());

create policy "owners manage cockpit actions"
  on public.operator_cockpit_actions for all
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

create policy "owners read daily reflections"
  on public.operator_daily_reflections for select
  using (owner_id = auth.uid());

create policy "owners manage daily reflections"
  on public.operator_daily_reflections for all
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

revoke all on table public.operator_weekly_priorities,
  public.operator_cockpit_actions,
  public.operator_daily_reflections from anon;
grant select, insert, update on table public.operator_weekly_priorities,
  public.operator_cockpit_actions,
  public.operator_daily_reflections to authenticated;

create trigger operator_weekly_priorities_updated_at
  before update on public.operator_weekly_priorities
  for each row execute function public.update_updated_at_column();

create trigger operator_cockpit_actions_updated_at
  before update on public.operator_cockpit_actions
  for each row execute function public.update_updated_at_column();

create trigger operator_daily_reflections_updated_at
  before update on public.operator_daily_reflections
  for each row execute function public.update_updated_at_column();
