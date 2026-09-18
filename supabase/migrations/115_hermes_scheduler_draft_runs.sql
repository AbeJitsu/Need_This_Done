-- Durable Hermes schedule materialization, deliberately draft-only.
-- Purpose: preserve daily schedule intent while a Mac worker is offline and
-- materialize exactly one approval-required run when its outbound scheduler reconnects.
-- Impact: adds owner-scoped schedule/run records; does not create a worker queue,
-- call OpenClaw, dispatch an agent plan, or grant standing execution approval.
-- Data handling: templates and draft run snapshots stay behind RLS; only service-role
-- scheduler calls can materialize due runs.
-- Verification: run bridge/unit route checks and local schema/RLS tests before a
-- separately reviewed hosted migration.
-- Rollback: deploy a forward migration that pauses schedules and hides this surface;
-- do not delete durable schedule or review history.

create table public.hermes_schedules (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (char_length(trim(name)) between 1 and 160),
  request_template jsonb not null check (
    jsonb_typeof(request_template) = 'object'
    and jsonb_typeof(request_template -> 'request') = 'string'
    and char_length(trim(request_template ->> 'request')) between 1 and 12000
  ),
  timezone text not null,
  local_time time not null,
  recurrence_kind text not null default 'daily' check (recurrence_kind = 'daily'),
  status text not null default 'active' check (status in ('active', 'paused')),
  next_run_at timestamptz not null,
  last_materialized_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.hermes_schedule_runs (
  id uuid primary key default gen_random_uuid(),
  schedule_id uuid not null references public.hermes_schedules(id) on delete cascade,
  owner_id uuid not null references auth.users(id) on delete cascade,
  scheduled_for timestamptz not null,
  request_snapshot jsonb not null check (jsonb_typeof(request_snapshot) = 'object'),
  status text not null default 'awaiting_approval' check (status in ('awaiting_approval', 'cancelled')),
  materialized_at timestamptz not null default now(),
  unique (schedule_id, scheduled_for)
);

create function public.validate_hermes_schedule_timezone()
returns trigger language plpgsql set search_path = public as $$
begin
  perform now() at time zone new.timezone;
  return new;
exception when invalid_parameter_value then
  raise exception 'invalid_hermes_schedule_timezone' using errcode = '22023';
end;
$$;

create trigger validate_hermes_schedule_timezone_before_write
  before insert or update of timezone on public.hermes_schedules
  for each row execute function public.validate_hermes_schedule_timezone();

create index hermes_schedules_due_idx on public.hermes_schedules (owner_id, status, next_run_at);
create index hermes_schedule_runs_owner_review_idx on public.hermes_schedule_runs (owner_id, status, scheduled_for desc);

alter table public.hermes_schedules enable row level security;
alter table public.hermes_schedule_runs enable row level security;
create policy "authenticated owners read Hermes schedules" on public.hermes_schedules for select using (owner_id = auth.uid());
create policy "authenticated owners read Hermes schedule runs" on public.hermes_schedule_runs for select using (owner_id = auth.uid());
revoke all on table public.hermes_schedules, public.hermes_schedule_runs from anon;
grant select on table public.hermes_schedules, public.hermes_schedule_runs to authenticated;

create or replace function public.materialize_due_hermes_schedule_runs(
  target_owner_id uuid,
  target_limit integer default 20
)
returns table (schedule_run_id uuid, schedule_id uuid, scheduled_for timestamptz)
language plpgsql security definer set search_path = public as $$
declare schedule_row public.hermes_schedules;
declare due_at timestamptz;
declare next_at timestamptz;
declare local_now timestamp;
declare local_target timestamp;
declare inserted_id uuid;
begin
  if not public.private_worker_access() or target_owner_id is null or target_limit not between 1 and 50 then
    raise exception 'private_scheduler_required' using errcode = '42501';
  end if;

  for schedule_row in
    select * from public.hermes_schedules
    where owner_id = target_owner_id and status = 'active' and next_run_at <= now()
    order by next_run_at for update skip locked limit target_limit
  loop
    local_now := now() at time zone schedule_row.timezone;
    local_target := local_now::date + schedule_row.local_time;
    if local_target > local_now then
      due_at := ((local_now::date - 1) + schedule_row.local_time) at time zone schedule_row.timezone;
      next_at := local_target at time zone schedule_row.timezone;
    else
      due_at := local_target at time zone schedule_row.timezone;
      next_at := ((local_now::date + 1) + schedule_row.local_time) at time zone schedule_row.timezone;
    end if;

    insert into public.hermes_schedule_runs (schedule_id, owner_id, scheduled_for, request_snapshot)
    values (schedule_row.id, schedule_row.owner_id, due_at, schedule_row.request_template)
    on conflict (schedule_id, scheduled_for) do nothing
    returning id into inserted_id;

    update public.hermes_schedules
      set next_run_at = next_at, last_materialized_at = now(), updated_at = now()
      where id = schedule_row.id;

    if inserted_id is not null then
      schedule_run_id := inserted_id;
      schedule_id := schedule_row.id;
      scheduled_for := due_at;
      return next;
    end if;
  end loop;
end;
$$;

revoke all on function public.materialize_due_hermes_schedule_runs(uuid,integer) from public, anon, authenticated;
grant execute on function public.materialize_due_hermes_schedule_runs(uuid,integer) to service_role;
