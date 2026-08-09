-- A pending, additive safety change. Do not apply this migration to hosted
-- Supabase without the separate backup rehearsal and approval gate.

update public.growth_profiles
set
  model_route = 'evaluation-required',
  fallback_model = '',
  daily_model_cap = least(daily_model_cap, 0.25),
  updated_at = now()
where model_route <> 'evaluation-required'
   or fallback_model <> ''
   or daily_model_cap > 0.25;

alter table public.growth_profiles
  alter column model_route set default 'evaluation-required',
  alter column daily_model_cap set default 0.25;

alter table public.growth_profiles
  drop constraint if exists growth_profiles_daily_model_cap_check;

alter table public.growth_profiles
  add constraint growth_profiles_daily_model_cap_check
  check (daily_model_cap >= 0 and daily_model_cap <= 0.25);

-- Evaluation observations are durable operator records. They are not a model
-- gateway and do not activate a provider or choose a worker default.
create table public.model_evaluation_records (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete restrict,
  candidate_id text not null,
  provider_model_id text not null default '',
  task_id text not null check (task_id in ('classify-public-evidence', 'draft-approved-message', 'summarize-weekly-brief')),
  quality_score numeric(5,4) not null check (quality_score between 0 and 1),
  tool_use_score numeric(5,4) not null check (tool_use_score between 0 and 1),
  latency_ms integer not null check (latency_ms >= 0),
  cost_usd numeric(8,4) not null check (cost_usd between 0 and 0.10),
  failed boolean not null default false,
  repair_required boolean not null default false,
  evaluated_on date not null,
  notes text not null default '',
  created_at timestamptz not null default now(),
  unique (owner_id, candidate_id, task_id, evaluated_on)
);

alter table public.model_evaluation_records enable row level security;
create policy "admins read model evaluation records" on public.model_evaluation_records for select using (public.is_admin(auth.uid()));
create policy "admins manage model evaluation records" on public.model_evaluation_records for all using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));
revoke all on table public.model_evaluation_records from anon;
grant select, insert, update, delete on table public.model_evaluation_records to authenticated;
