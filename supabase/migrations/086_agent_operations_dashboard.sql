-- NeedThisDone Agent Operations Dashboard
--
-- Purpose: add durable, approval-first orchestration records for the private
-- dashboard and the outbound-only Mac-mini bridge. This migration does not
-- publish content, send outreach, or expose provider credentials.
--
-- Data handling: run inputs and artifacts are operator-owned. Generated media
-- belongs in the private agent-media bucket and is exposed only through
-- short-lived signed URLs. Artifact versions and decisions are append-only.
--
-- Verification: exercise the owner RLS policies, state transitions, artifact
-- immutability, schedule deduplication, worker leases, replay protection, and
-- the $0.99 media ceiling in local integration tests before applying remotely.
-- Rollback: disable schedules, stop/revoke the bridge, and deploy the prior
-- application version. Keep these history tables and media objects until a
-- separate retention review authorizes cleanup.

create table public.brand_profiles (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null default 'NeedThisDone brand',
  voice text not null default 'Clear, practical, warm, and specific.',
  audience text not null default '',
  timezone text not null default 'America/New_York',
  daily_media_cap numeric(8,4) not null default 0.99
    check (daily_media_cap >= 0 and daily_media_cap <= 0.99),
  default_schedule_time time not null default '09:00',
  default_duration_seconds integer not null default 10
    check (default_duration_seconds between 7 and 15),
  default_aspect_ratio text not null default '9:16'
    check (default_aspect_ratio = '9:16'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (owner_id)
);

create table public.agent_runs (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  workflow_type text not null
    check (workflow_type in ('research_outreach', 'daily_content')),
  status text not null default 'queued'
    check (status in ('queued', 'running', 'paused', 'cancelled', 'completed', 'failed', 'emergency_stopped')),
  title text not null,
  input jsonb not null default '{}'::jsonb,
  output jsonb,
  idempotency_key uuid not null,
  request_hash text not null,
  requested_by uuid not null references auth.users(id) on delete restrict,
  paused_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (owner_id, idempotency_key)
);

create table public.agent_orchestration_tasks (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  run_id uuid not null references public.agent_runs(id) on delete cascade,
  task_key text not null,
  agent_role text not null
    check (agent_role in ('coordinator', 'public_web_researcher', 'outreach_writer', 'daily_content_producer', 'reviewer')),
  agent_provider text not null default 'openclaw'
    check (agent_provider in ('openclaw', 'openrouter', 'anthropic', 'openai', 'google', 'local', 'human', 'other')),
  model_id text,
  capabilities jsonb not null default '[]'::jsonb,
  task_type text not null
    check (task_type in ('coordinate', 'research_public_web', 'draft_outreach', 'produce_daily_content', 'review_artifacts', 'regenerate_artifact')),
  status text not null default 'queued'
    check (status in ('queued', 'leased', 'running', 'succeeded', 'failed', 'blocked', 'cancelled')),
  input jsonb not null default '{}'::jsonb,
  output jsonb,
  attempt_count integer not null default 0 check (attempt_count >= 0),
  max_attempts integer not null default 3 check (max_attempts between 1 and 10),
  leased_by text,
  lease_expires_at timestamptz,
  progress integer not null default 0 check (progress between 0 and 100),
  last_error text,
  created_at timestamptz not null default now(),
  started_at timestamptz,
  completed_at timestamptz,
  updated_at timestamptz not null default now(),
  unique (run_id, task_key)
);

create table public.agent_task_dependencies (
  task_id uuid not null references public.agent_orchestration_tasks(id) on delete cascade,
  depends_on_task_id uuid not null references public.agent_orchestration_tasks(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (task_id, depends_on_task_id),
  check (task_id <> depends_on_task_id)
);

create table public.agent_artifacts (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  run_id uuid not null references public.agent_runs(id) on delete cascade,
  task_id uuid references public.agent_orchestration_tasks(id) on delete set null,
  artifact_type text not null
    check (artifact_type in ('research_dossier', 'email_draft', 'script', 'storyboard', 'thumbnail', 'video', 'audio', 'subtitles', 'content_package', 'review_report', 'other')),
  title text not null,
  status text not null default 'pending_review'
    check (status in ('pending_review', 'approved', 'rejected', 'edited', 'regeneration_requested', 'archived')),
  current_version_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  reviewed_by uuid references auth.users(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.agent_artifact_versions (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  artifact_id uuid not null references public.agent_artifacts(id) on delete cascade,
  version_number integer not null check (version_number >= 1),
  content_text text,
  storage_path text,
  mime_type text,
  byte_size bigint check (byte_size is null or byte_size >= 0),
  sha256 text,
  metadata jsonb not null default '{}'::jsonb,
  created_by text not null default 'bridge',
  created_at timestamptz not null default now(),
  unique (artifact_id, version_number),
  check (content_text is not null or storage_path is not null)
);

alter table public.agent_artifacts
  add constraint agent_artifacts_current_version_fk
  foreign key (current_version_id) references public.agent_artifact_versions(id) on delete set null;

create table public.agent_approval_decisions (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  artifact_id uuid not null references public.agent_artifacts(id) on delete cascade,
  operator_id uuid not null references auth.users(id) on delete restrict,
  decision text not null
    check (decision in ('approve', 'reject', 'edit', 'regenerate')),
  note text not null default '',
  idempotency_key uuid not null unique,
  request_hash text not null,
  created_at timestamptz not null default now()
);

create table public.agent_run_commands (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  run_id uuid not null references public.agent_runs(id) on delete cascade,
  command text not null
    check (command in ('pause', 'resume', 'cancel', 'retry', 'emergency-stop')),
  idempotency_key uuid not null unique,
  request_hash text not null,
  result jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table public.agent_run_events (
  id bigint generated always as identity primary key,
  owner_id uuid not null references auth.users(id) on delete cascade,
  run_id uuid not null references public.agent_runs(id) on delete cascade,
  task_id uuid references public.agent_orchestration_tasks(id) on delete set null,
  event_type text not null
    check (event_type in ('created', 'queued', 'leased', 'progress', 'artifact', 'succeeded', 'failed', 'paused', 'resumed', 'cancelled', 'emergency-stopped', 'approval')),
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table public.content_schedules (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  brand_profile_id uuid not null references public.brand_profiles(id) on delete cascade,
  run_id uuid references public.agent_runs(id) on delete set null,
  local_date date not null,
  timezone text not null,
  scheduled_for timestamptz not null,
  status text not null default 'queued'
    check (status in ('queued', 'generating', 'approval_ready', 'approved', 'rejected', 'cancelled', 'published')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (brand_profile_id, local_date)
);

create table public.media_usage_reservations (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  run_id uuid references public.agent_runs(id) on delete set null,
  task_id uuid references public.agent_orchestration_tasks(id) on delete set null,
  reservation_key uuid not null unique,
  media_kind text not null
    check (media_kind in ('image', 'video', 'audio', 'render', 'other')),
  reserved_cost numeric(8,4) not null
    check (reserved_cost >= 0 and reserved_cost <= 0.99),
  actual_cost numeric(8,4) check (actual_cost is null or actual_cost >= 0),
  status text not null default 'reserved'
    check (status in ('reserved', 'reconciled', 'released', 'overage')),
  local_usage_date date not null,
  provider text not null,
  provider_usage jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  reconciled_at timestamptz,
  check ((status = 'reserved' and actual_cost is null) or (status <> 'reserved' and actual_cost is not null))
);

create table public.worker_heartbeats (
  worker_id text primary key,
  owner_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'online'
    check (status in ('online', 'degraded', 'offline', 'stopped')),
  version text not null default '',
  capabilities jsonb not null default '[]'::jsonb,
  last_seen_at timestamptz not null default now(),
  last_error text,
  active_task_id uuid references public.agent_orchestration_tasks(id) on delete set null,
  updated_at timestamptz not null default now()
);

create index agent_runs_owner_created_idx on public.agent_runs (owner_id, created_at desc);
create index agent_runs_status_idx on public.agent_runs (owner_id, status, created_at desc);
create index orchestration_tasks_ready_idx on public.agent_orchestration_tasks (status, created_at);
create index orchestration_tasks_run_idx on public.agent_orchestration_tasks (run_id, status);
create index agent_artifacts_review_idx on public.agent_artifacts (owner_id, status, created_at desc);
create index agent_run_events_run_idx on public.agent_run_events (run_id, created_at);
create index content_schedules_owner_date_idx on public.content_schedules (owner_id, local_date desc);
create index media_usage_owner_day_idx on public.media_usage_reservations (owner_id, local_usage_date, status);
create index worker_heartbeats_owner_seen_idx on public.worker_heartbeats (owner_id, last_seen_at desc);

alter table public.brand_profiles enable row level security;
alter table public.agent_runs enable row level security;
alter table public.agent_orchestration_tasks enable row level security;
alter table public.agent_task_dependencies enable row level security;
alter table public.agent_artifacts enable row level security;
alter table public.agent_artifact_versions enable row level security;
alter table public.agent_approval_decisions enable row level security;
alter table public.agent_run_commands enable row level security;
alter table public.agent_run_events enable row level security;
alter table public.content_schedules enable row level security;
alter table public.media_usage_reservations enable row level security;
alter table public.worker_heartbeats enable row level security;

create policy "operators own brand profiles" on public.brand_profiles
  for all using (public.is_admin(auth.uid()) and owner_id = auth.uid())
  with check (public.is_admin(auth.uid()) and owner_id = auth.uid());

create policy "operators own agent runs" on public.agent_runs
  for all using (public.is_admin(auth.uid()) and owner_id = auth.uid())
  with check (public.is_admin(auth.uid()) and owner_id = auth.uid() and requested_by = auth.uid());

create policy "operators read own orchestration tasks" on public.agent_orchestration_tasks
  for select using (public.is_admin(auth.uid()) and owner_id = auth.uid());

create policy "operators read own task dependencies" on public.agent_task_dependencies
  for select using (
    public.is_admin(auth.uid())
    and exists (
      select 1 from public.agent_orchestration_tasks task
      where task.id = agent_task_dependencies.task_id and task.owner_id = auth.uid()
    )
  );

create policy "operators own artifacts" on public.agent_artifacts
  for select using (public.is_admin(auth.uid()) and owner_id = auth.uid());

create policy "operators read artifact versions" on public.agent_artifact_versions
  for select using (public.is_admin(auth.uid()) and owner_id = auth.uid());

create policy "operators read decisions" on public.agent_approval_decisions
  for select using (public.is_admin(auth.uid()) and owner_id = auth.uid());

create policy "operators read commands" on public.agent_run_commands
  for select using (public.is_admin(auth.uid()) and owner_id = auth.uid());

create policy "operators read run events" on public.agent_run_events
  for select using (public.is_admin(auth.uid()) and owner_id = auth.uid());

create policy "operators own content schedules" on public.content_schedules
  for all using (public.is_admin(auth.uid()) and owner_id = auth.uid())
  with check (public.is_admin(auth.uid()) and owner_id = auth.uid());

create policy "operators read media reservations" on public.media_usage_reservations
  for select using (public.is_admin(auth.uid()) and owner_id = auth.uid());

create policy "operators read worker heartbeats" on public.worker_heartbeats
  for select using (public.is_admin(auth.uid()) and owner_id = auth.uid());

revoke all on table public.brand_profiles, public.agent_runs, public.agent_orchestration_tasks,
  public.agent_task_dependencies, public.agent_artifacts, public.agent_artifact_versions,
  public.agent_approval_decisions, public.agent_run_commands, public.agent_run_events,
  public.content_schedules, public.media_usage_reservations, public.worker_heartbeats from anon;

grant select, insert, update on table public.brand_profiles, public.agent_runs, public.content_schedules to authenticated;
grant select on table public.agent_orchestration_tasks, public.agent_task_dependencies,
  public.agent_artifacts, public.agent_artifact_versions, public.agent_approval_decisions,
  public.agent_run_commands, public.agent_run_events, public.media_usage_reservations,
  public.worker_heartbeats to authenticated;

create or replace function public.prevent_agent_artifact_version_mutation()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  raise exception 'agent_artifact_versions_are_immutable' using errcode = '55006';
end;
$$;

create trigger prevent_agent_artifact_version_update
  before update or delete on public.agent_artifact_versions
  for each row execute function public.prevent_agent_artifact_version_mutation();

create or replace function public.prevent_agent_history_mutation()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  raise exception 'agent_history_is_immutable' using errcode = '55006';
end;
$$;

create trigger prevent_agent_approval_decision_mutation
  before update or delete on public.agent_approval_decisions
  for each row execute function public.prevent_agent_history_mutation();

create trigger prevent_agent_run_event_mutation
  before update or delete on public.agent_run_events
  for each row execute function public.prevent_agent_history_mutation();

create trigger prevent_agent_run_command_mutation
  before update or delete on public.agent_run_commands
  for each row execute function public.prevent_agent_history_mutation();

create trigger update_brand_profiles_updated_at
  before update on public.brand_profiles
  for each row execute function public.update_updated_at_column();

create trigger update_agent_runs_updated_at
  before update on public.agent_runs
  for each row execute function public.update_updated_at_column();

create trigger update_agent_orchestration_tasks_updated_at
  before update on public.agent_orchestration_tasks
  for each row execute function public.update_updated_at_column();

create trigger update_agent_artifacts_updated_at
  before update on public.agent_artifacts
  for each row execute function public.update_updated_at_column();

create trigger update_content_schedules_updated_at
  before update on public.content_schedules
  for each row execute function public.update_updated_at_column();

create trigger update_worker_heartbeats_updated_at
  before update on public.worker_heartbeats
  for each row execute function public.update_updated_at_column();

create or replace function public.create_agent_run(
  target_workflow_type text,
  target_title text,
  target_input jsonb,
  target_idempotency_key uuid,
  target_local_date date default null,
  target_timezone text default 'America/New_York',
  target_scheduled_for timestamptz default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  actor_id uuid := auth.uid();
  existing_run public.agent_runs;
  run_row public.agent_runs;
  coordinator_id uuid;
  second_id uuid;
  third_id uuid;
  reviewer_id uuid;
  brand_row public.brand_profiles;
  schedule_row public.content_schedules;
  request_hash text := md5(
    target_workflow_type || ':' || trim(coalesce(target_title, '')) || ':'
    || coalesce(target_input, '{}'::jsonb)::text || ':'
    || coalesce(target_local_date::text, '') || ':'
    || coalesce(target_timezone, '') || ':'
    || coalesce(target_scheduled_for::text, '')
  );
begin
  if actor_id is null or not public.is_admin(actor_id) then
    raise exception 'admin_required' using errcode = '42501';
  end if;
  if target_workflow_type not in ('research_outreach', 'daily_content')
    or nullif(trim(target_title), '') is null
    or target_idempotency_key is null
    or jsonb_typeof(coalesce(target_input, '{}'::jsonb)) <> 'object' then
    raise exception 'invalid_agent_run' using errcode = '22023';
  end if;

  select * into existing_run
  from public.agent_runs
  where owner_id = actor_id and idempotency_key = target_idempotency_key
  for update;
  if found then
    if existing_run.request_hash <> request_hash then
      raise exception 'agent_run_idempotency_conflict' using errcode = '23505';
    end if;
    return jsonb_build_object('run', to_jsonb(existing_run), 'duplicate', true);
  end if;

  if target_workflow_type = 'daily_content' then
    if target_local_date is null or nullif(trim(target_timezone), '') is null or target_scheduled_for is null then
      raise exception 'content_schedule_required' using errcode = '22023';
    end if;
    select * into brand_row from public.brand_profiles where owner_id = actor_id for update;
    if not found then
      insert into public.brand_profiles (owner_id, timezone) values (actor_id, target_timezone)
      returning * into brand_row;
    end if;
    perform pg_advisory_xact_lock(hashtext(actor_id::text || ':content:' || target_local_date::text));
    select * into schedule_row
    from public.content_schedules
    where brand_profile_id = brand_row.id and local_date = target_local_date
    for update;
    if found and schedule_row.run_id is not null then
      select * into existing_run from public.agent_runs where id = schedule_row.run_id;
      return jsonb_build_object('run', to_jsonb(existing_run), 'schedule', to_jsonb(schedule_row), 'duplicate', true);
    end if;
  end if;

  insert into public.agent_runs (owner_id, workflow_type, title, input, idempotency_key, request_hash, requested_by)
  values (actor_id, target_workflow_type, trim(target_title), coalesce(target_input, '{}'::jsonb), target_idempotency_key, request_hash, actor_id)
  returning * into run_row;

  insert into public.agent_orchestration_tasks (owner_id, run_id, task_key, agent_role, agent_provider, model_id, task_type, input)
  values (actor_id, run_row.id, 'coordinator', 'coordinator', 'openclaw', 'openclaw/coordinator', 'coordinate', jsonb_build_object('workflowType', target_workflow_type))
  returning id into coordinator_id;

  if target_workflow_type = 'research_outreach' then
    insert into public.agent_orchestration_tasks (owner_id, run_id, task_key, agent_role, agent_provider, task_type, input)
    values (actor_id, run_row.id, 'public-web-researcher', 'public_web_researcher', 'openrouter', 'research_public_web', '{}'::jsonb)
    returning id into second_id;
    insert into public.agent_task_dependencies (task_id, depends_on_task_id) values (second_id, coordinator_id);

    insert into public.agent_orchestration_tasks (owner_id, run_id, task_key, agent_role, agent_provider, task_type, input)
    values (actor_id, run_row.id, 'outreach-writer', 'outreach_writer', 'openrouter', 'draft_outreach', '{}'::jsonb)
    returning id into third_id;
    insert into public.agent_task_dependencies (task_id, depends_on_task_id) values (third_id, second_id);

    insert into public.agent_orchestration_tasks (owner_id, run_id, task_key, agent_role, agent_provider, model_id, task_type, input)
    values (actor_id, run_row.id, 'reviewer', 'reviewer', 'openclaw', 'openclaw/reviewer', 'review_artifacts', '{}'::jsonb)
    returning id into reviewer_id;
    insert into public.agent_task_dependencies (task_id, depends_on_task_id) values (reviewer_id, third_id);
  else
    insert into public.agent_orchestration_tasks (owner_id, run_id, task_key, agent_role, agent_provider, task_type, input)
    values (actor_id, run_row.id, 'daily-content-producer', 'daily_content_producer', 'openrouter', 'produce_daily_content',
      jsonb_build_object('durationSeconds', 10, 'aspectRatio', '9:16', 'dailyMediaCap', 0.99))
    returning id into second_id;
    insert into public.agent_task_dependencies (task_id, depends_on_task_id) values (second_id, coordinator_id);

    insert into public.agent_orchestration_tasks (owner_id, run_id, task_key, agent_role, agent_provider, model_id, task_type, input)
    values (actor_id, run_row.id, 'reviewer', 'reviewer', 'openclaw', 'openclaw/reviewer', 'review_artifacts', '{}'::jsonb)
    returning id into reviewer_id;
    insert into public.agent_task_dependencies (task_id, depends_on_task_id) values (reviewer_id, second_id);

    insert into public.content_schedules (
      owner_id, brand_profile_id, run_id, local_date, timezone, scheduled_for
    ) values (
      actor_id, brand_row.id, run_row.id, target_local_date, target_timezone, target_scheduled_for
    )
    returning * into schedule_row;
  end if;

  insert into public.agent_run_events (owner_id, run_id, event_type, payload)
  values (actor_id, run_row.id, 'created', jsonb_build_object('workflowType', target_workflow_type));

  return jsonb_build_object(
    'run', to_jsonb(run_row),
    'schedule', case when schedule_row.id is null then null else to_jsonb(schedule_row) end,
    'duplicate', false
  );
end;
$$;

create or replace function public.control_agent_run(
  target_run_id uuid,
  target_command text,
  target_idempotency_key uuid,
  target_note text default ''
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  actor_id uuid := auth.uid();
  run_row public.agent_runs;
  existing_command public.agent_run_commands;
  request_hash text := md5(target_command || ':' || coalesce(target_note, ''));
  next_status text;
  result jsonb;
begin
  if actor_id is null or not public.is_admin(actor_id)
    or target_run_id is null
    or target_idempotency_key is null
    or target_command not in ('pause', 'resume', 'cancel', 'retry', 'emergency-stop') then
    raise exception 'invalid_agent_control' using errcode = '22023';
  end if;

  select * into existing_command
  from public.agent_run_commands
  where idempotency_key = target_idempotency_key
  for update;
  if found then
    if existing_command.owner_id <> actor_id or existing_command.request_hash <> request_hash
      or existing_command.command <> target_command then
      raise exception 'agent_control_idempotency_conflict' using errcode = '23505';
    end if;
    return existing_command.result || jsonb_build_object('duplicate', true);
  end if;

  select * into run_row from public.agent_runs
  where id = target_run_id and owner_id = actor_id
  for update;
  if not found then raise exception 'agent_run_not_found' using errcode = 'P0002'; end if;

  next_status := run_row.status;
  if target_command = 'pause' then
    if run_row.status not in ('queued', 'running') then raise exception 'agent_run_not_pauseable' using errcode = '22023'; end if;
    next_status := 'paused';
  elsif target_command = 'resume' then
    if run_row.status <> 'paused' then raise exception 'agent_run_not_resumable' using errcode = '22023'; end if;
    next_status := 'running';
  elsif target_command = 'cancel' then
    if run_row.status in ('completed', 'cancelled', 'emergency_stopped') then raise exception 'agent_run_not_cancellable' using errcode = '22023'; end if;
    next_status := 'cancelled';
  elsif target_command = 'emergency-stop' then
    if run_row.status in ('completed', 'cancelled') then raise exception 'agent_run_not_stoppable' using errcode = '22023'; end if;
    next_status := 'emergency_stopped';
  elsif target_command = 'retry' then
    if run_row.status not in ('failed', 'cancelled', 'emergency_stopped') then raise exception 'agent_run_not_retryable' using errcode = '22023'; end if;
    next_status := 'queued';
    update public.agent_orchestration_tasks
      set status = 'queued', leased_by = null, lease_expires_at = null, last_error = null,
        progress = 0, completed_at = null, updated_at = now()
      where run_id = run_row.id and status in ('failed', 'cancelled', 'blocked')
        and attempt_count < max_attempts;
  end if;

  update public.agent_runs
  set status = next_status,
      paused_at = case when next_status = 'paused' then now() else null end,
      completed_at = case when next_status in ('cancelled', 'emergency_stopped') then now() else null end,
      updated_at = now()
  where id = run_row.id
  returning * into run_row;

  if target_command in ('cancel', 'emergency-stop') then
    update public.agent_orchestration_tasks
    set status = 'cancelled', leased_by = null, lease_expires_at = null, updated_at = now()
    where run_id = run_row.id and status in ('queued', 'leased', 'running');
  end if;

  insert into public.agent_run_events (owner_id, run_id, event_type, payload)
  values (
    actor_id,
    run_row.id,
    case target_command
      when 'pause' then 'paused'
      when 'resume' then 'resumed'
      when 'cancel' then 'cancelled'
      when 'emergency-stop' then 'emergency-stopped'
      else 'queued'
    end,
    jsonb_build_object('command', target_command, 'note', left(coalesce(target_note, ''), 1000), 'operatorId', actor_id)
  );

  result := jsonb_build_object('run', to_jsonb(run_row), 'duplicate', false);
  insert into public.agent_run_commands (owner_id, run_id, command, idempotency_key, request_hash, result)
  values (actor_id, run_row.id, target_command, target_idempotency_key, request_hash, result);
  return result;
end;
$$;

create or replace function public.record_agent_artifact_decision(
  target_artifact_id uuid,
  target_decision text,
  target_idempotency_key uuid,
  target_note text default '',
  target_content_text text default null,
  target_metadata jsonb default '{}'::jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  actor_id uuid := auth.uid();
  artifact_row public.agent_artifacts;
  previous_version public.agent_artifact_versions;
  new_version public.agent_artifact_versions;
  existing_decision public.agent_approval_decisions;
  request_hash text := md5(target_decision || ':' || coalesce(target_note, '') || ':' || coalesce(target_content_text, ''));
  next_status text;
  result jsonb;
begin
  if actor_id is null or not public.is_admin(actor_id)
    or target_artifact_id is null
    or target_idempotency_key is null
    or target_decision not in ('approve', 'reject', 'edit', 'regenerate')
    or jsonb_typeof(coalesce(target_metadata, '{}'::jsonb)) <> 'object' then
    raise exception 'invalid_artifact_decision' using errcode = '22023';
  end if;

  select * into existing_decision from public.agent_approval_decisions
  where idempotency_key = target_idempotency_key for update;
  if found then
    if existing_decision.owner_id <> actor_id or existing_decision.request_hash <> request_hash then
      raise exception 'artifact_decision_idempotency_conflict' using errcode = '23505';
    end if;
    select * into artifact_row from public.agent_artifacts where id = target_artifact_id;
    return jsonb_build_object('artifact', to_jsonb(artifact_row), 'decision', to_jsonb(existing_decision), 'duplicate', true);
  end if;

  select * into artifact_row from public.agent_artifacts
  where id = target_artifact_id and owner_id = actor_id for update;
  if not found then raise exception 'artifact_not_found' using errcode = 'P0002'; end if;
  if artifact_row.status in ('archived', 'regeneration_requested') and target_decision <> 'regenerate' then
    raise exception 'artifact_not_reviewable' using errcode = '22023';
  end if;

  next_status := case target_decision
    when 'approve' then 'approved'
    when 'reject' then 'rejected'
    when 'edit' then 'edited'
    else 'regeneration_requested'
  end;

  if target_decision = 'edit' then
    select * into previous_version from public.agent_artifact_versions
    where id = artifact_row.current_version_id and artifact_id = artifact_row.id;
    if target_content_text is null and previous_version.id is null then
      raise exception 'artifact_edit_content_required' using errcode = '22023';
    end if;
    insert into public.agent_artifact_versions (
      owner_id, artifact_id, version_number, content_text, mime_type, metadata, created_by
    ) values (
      actor_id,
      artifact_row.id,
      coalesce((select max(version_number) + 1 from public.agent_artifact_versions where artifact_id = artifact_row.id), 1),
      coalesce(target_content_text, previous_version.content_text),
      previous_version.mime_type,
      coalesce(target_metadata, '{}'::jsonb),
      'operator'
    ) returning * into new_version;
    update public.agent_artifacts
    set current_version_id = new_version.id, status = next_status, updated_at = now()
    where id = artifact_row.id
    returning * into artifact_row;
  else
    update public.agent_artifacts
    set status = next_status,
        reviewed_by = actor_id,
        reviewed_at = now(),
        updated_at = now()
    where id = artifact_row.id
    returning * into artifact_row;
  end if;

  insert into public.agent_approval_decisions (
    owner_id, artifact_id, operator_id, decision, note, idempotency_key, request_hash
  ) values (
    actor_id, artifact_row.id, actor_id, target_decision, left(coalesce(target_note, ''), 2000),
    target_idempotency_key, request_hash
  ) returning * into existing_decision;

  insert into public.agent_run_events (owner_id, run_id, task_id, event_type, payload)
  values (
    actor_id, artifact_row.run_id, artifact_row.task_id, 'approval',
    jsonb_build_object('artifactId', artifact_row.id, 'decision', target_decision, 'operatorId', actor_id)
  );

  result := jsonb_build_object('artifact', to_jsonb(artifact_row), 'decision', to_jsonb(existing_decision), 'duplicate', false);
  return result;
end;
$$;

-- The remaining functions are callable only through the service-role-backed
-- signed bridge routes. The HMAC boundary is enforced before these functions.
create or replace function public.claim_agent_orchestration_task(
  target_owner_id uuid,
  target_worker text,
  target_lease_seconds integer default 300
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  selected public.agent_orchestration_tasks;
begin
  if not public.private_worker_access()
    or target_owner_id is null
    or nullif(trim(target_worker), '') is null
    or target_lease_seconds not between 30 and 1800 then
    raise exception 'private_worker_required' using errcode = '42501';
  end if;

  update public.agent_orchestration_tasks
  set status = 'queued', leased_by = null, lease_expires_at = null, updated_at = now()
  where status = 'leased' and lease_expires_at < now();

  select task.* into selected
  from public.agent_orchestration_tasks task
  join public.agent_runs run on run.id = task.run_id
  where task.status = 'queued'
    and task.owner_id = target_owner_id
    and task.attempt_count < task.max_attempts
    and run.status in ('queued', 'running')
    and not exists (
      select 1 from public.agent_task_dependencies dependency
      join public.agent_orchestration_tasks prerequisite on prerequisite.id = dependency.depends_on_task_id
      where dependency.task_id = task.id and prerequisite.status <> 'succeeded'
    )
  order by task.created_at
  for update of task skip locked
  limit 1;

  if not found then return null; end if;

  update public.agent_orchestration_tasks
  set status = 'leased',
      attempt_count = attempt_count + 1,
      leased_by = trim(target_worker),
      lease_expires_at = now() + make_interval(secs => target_lease_seconds),
      started_at = coalesce(started_at, now()),
      updated_at = now()
  where id = selected.id
  returning * into selected;

  update public.agent_runs set status = 'running', updated_at = now()
  where id = selected.run_id and status = 'queued';

  insert into public.agent_run_events (owner_id, run_id, task_id, event_type, payload)
  values (selected.owner_id, selected.run_id, selected.id, 'leased', jsonb_build_object('workerId', trim(target_worker)));
  return to_jsonb(selected);
end;
$$;

create or replace function public.record_agent_task_event(
  target_task_id uuid,
  target_worker text,
  target_event_type text,
  target_payload jsonb default '{}'::jsonb,
  target_progress integer default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  task_row public.agent_orchestration_tasks;
  event_row public.agent_run_events;
begin
  if not public.private_worker_access()
    or target_task_id is null
    or nullif(trim(target_worker), '') is null
    or target_event_type not in ('progress', 'artifact')
    or jsonb_typeof(coalesce(target_payload, '{}'::jsonb)) <> 'object'
    or (target_progress is not null and target_progress not between 0 and 100) then
    raise exception 'invalid_agent_task_event' using errcode = '22023';
  end if;

  select * into task_row from public.agent_orchestration_tasks
  where id = target_task_id and status = 'leased' and leased_by = trim(target_worker)
    and lease_expires_at > now() for update;
  if not found then raise exception 'task_lease_invalid' using errcode = '22023'; end if;

  update public.agent_orchestration_tasks
  set status = 'running',
      progress = coalesce(target_progress, progress),
      output = case when target_event_type = 'artifact' then coalesce(target_payload, output) else output end,
      updated_at = now()
  where id = task_row.id
  returning * into task_row;

  insert into public.agent_run_events (owner_id, run_id, task_id, event_type, payload)
  values (task_row.owner_id, task_row.run_id, task_row.id, target_event_type, coalesce(target_payload, '{}'::jsonb))
  returning * into event_row;
  return to_jsonb(event_row);
end;
$$;

create or replace function public.complete_agent_orchestration_task(
  target_task_id uuid,
  target_worker text,
  target_status text,
  target_output jsonb default null,
  target_error text default null,
  target_artifacts jsonb default '[]'::jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  task_row public.agent_orchestration_tasks;
  run_row public.agent_runs;
  artifact_item jsonb;
  artifact_row public.agent_artifacts;
  version_row public.agent_artifact_versions;
  artifact_type text;
  artifact_title text;
  content_text text;
  storage_path text;
  mime_type text;
  final_status text;
begin
  if not public.private_worker_access()
    or target_task_id is null
    or nullif(trim(target_worker), '') is null
    or target_status not in ('succeeded', 'failed')
    or jsonb_typeof(coalesce(target_artifacts, '[]'::jsonb)) <> 'array' then
    raise exception 'invalid_agent_task_completion' using errcode = '22023';
  end if;

  select * into task_row from public.agent_orchestration_tasks
  where id = target_task_id and status in ('leased', 'running')
    and leased_by = trim(target_worker)
    and lease_expires_at > now()
  for update;
  if not found then raise exception 'task_lease_invalid' using errcode = '22023'; end if;

  final_status := target_status;
  if target_status = 'succeeded' then
    for artifact_item in select * from jsonb_array_elements(coalesce(target_artifacts, '[]'::jsonb)) loop
      artifact_type := nullif(trim(artifact_item ->> 'artifactType'), '');
      artifact_title := nullif(trim(artifact_item ->> 'title'), '');
      content_text := artifact_item ->> 'contentText';
      storage_path := nullif(trim(artifact_item ->> 'storagePath'), '');
      mime_type := nullif(trim(artifact_item ->> 'mimeType'), '');
      if artifact_type is null or artifact_title is null
        or (content_text is null and storage_path is null)
        or (storage_path is not null and storage_path !~ ('^agent-media/' || task_row.owner_id::text || '/' || task_row.run_id::text || '/')) then
        raise exception 'invalid_agent_artifact' using errcode = '22023';
      end if;

      insert into public.agent_artifacts (
        owner_id, run_id, task_id, artifact_type, title, metadata
      ) values (
        task_row.owner_id, task_row.run_id, task_row.id, artifact_type, artifact_title,
        coalesce(artifact_item -> 'metadata', '{}'::jsonb)
      ) returning * into artifact_row;

      insert into public.agent_artifact_versions (
        owner_id, artifact_id, version_number, content_text, storage_path, mime_type,
        byte_size, sha256, metadata, created_by
      ) values (
        task_row.owner_id, artifact_row.id, 1, content_text, storage_path, mime_type,
        nullif(artifact_item ->> 'byteSize', '')::bigint,
        nullif(trim(artifact_item ->> 'sha256'), ''),
        coalesce(artifact_item -> 'metadata', '{}'::jsonb),
        'bridge'
      ) returning * into version_row;

      update public.agent_artifacts
      set current_version_id = version_row.id, updated_at = now()
      where id = artifact_row.id;
    end loop;
  end if;

  update public.agent_orchestration_tasks
  set status = final_status,
      output = target_output,
      last_error = case when final_status = 'failed' then left(coalesce(target_error, 'Agent task failed.'), 4000) else null end,
      progress = case when final_status = 'succeeded' then 100 else progress end,
      lease_expires_at = null,
      completed_at = now(),
      updated_at = now()
  where id = task_row.id
  returning * into task_row;

  if final_status = 'succeeded'
    and not exists (select 1 from public.agent_orchestration_tasks where run_id = task_row.run_id and status <> 'succeeded') then
    update public.agent_runs
    set status = 'completed', output = coalesce(target_output, output), completed_at = now(), updated_at = now()
    where id = task_row.run_id
    returning * into run_row;
  elsif final_status = 'failed' then
    update public.agent_runs set status = 'failed', updated_at = now()
    where id = task_row.run_id
    returning * into run_row;
  else
    select * into run_row from public.agent_runs where id = task_row.run_id;
  end if;

  insert into public.agent_run_events (owner_id, run_id, task_id, event_type, payload)
  values (
    task_row.owner_id, task_row.run_id, task_row.id,
    case when final_status = 'succeeded' then 'succeeded' else 'failed' end,
    coalesce(target_output, jsonb_build_object('error', target_error))
  );

  return jsonb_build_object('task', to_jsonb(task_row), 'run', to_jsonb(run_row));
end;
$$;

create or replace function public.reserve_media_usage(
  target_owner_id uuid,
  target_run_id uuid,
  target_task_id uuid,
  target_worker text,
  target_reservation_key uuid,
  target_media_kind text,
  target_provider text,
  target_reserved_cost numeric,
  target_local_usage_date date
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  existing public.media_usage_reservations;
  profile public.brand_profiles;
  booked numeric(12,4);
  usage_day date := coalesce(target_local_usage_date, current_date);
begin
  if not public.private_worker_access()
    or target_owner_id is null
    or target_reservation_key is null
    or nullif(trim(target_worker), '') is null
    or target_media_kind not in ('image', 'video', 'audio', 'render', 'other')
    or nullif(trim(target_provider), '') is null
    or target_reserved_cost is null
    or target_reserved_cost < 0
    or target_reserved_cost > 0.99 then
    raise exception 'invalid_media_reservation' using errcode = '22023';
  end if;

  select * into existing from public.media_usage_reservations
  where reservation_key = target_reservation_key;
  if found then
    if existing.owner_id <> target_owner_id
      or existing.reserved_cost <> target_reserved_cost
      or existing.media_kind <> target_media_kind then
      raise exception 'media_reservation_key_conflict' using errcode = '23505';
    end if;
    return to_jsonb(existing);
  end if;

  select * into profile from public.brand_profiles where owner_id = target_owner_id for update;
  if not found then
    insert into public.brand_profiles (owner_id) values (target_owner_id) returning * into profile;
  end if;

  perform pg_advisory_xact_lock(hashtext(target_owner_id::text || ':media:' || usage_day::text));
  select coalesce(sum(coalesce(actual_cost, reserved_cost)), 0)::numeric(12,4)
  into booked
  from public.media_usage_reservations
  where owner_id = target_owner_id
    and local_usage_date = usage_day
    and status in ('reserved', 'reconciled', 'overage');

  if booked + target_reserved_cost > profile.daily_media_cap then
    raise exception 'daily_media_budget_exceeded' using errcode = '22023';
  end if;

  insert into public.media_usage_reservations (
    owner_id, run_id, task_id, reservation_key, media_kind, reserved_cost,
    local_usage_date, provider
  ) values (
    target_owner_id, target_run_id, target_task_id, target_reservation_key, target_media_kind,
    target_reserved_cost, usage_day, trim(target_provider)
  ) returning * into existing;
  return to_jsonb(existing);
end;
$$;

create or replace function public.reconcile_media_usage(
  target_reservation_key uuid,
  target_actual_cost numeric,
  target_provider_usage jsonb default '{}'::jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  usage_row public.media_usage_reservations;
  profile public.brand_profiles;
  other_booked numeric(12,4);
  next_status text;
begin
  if not public.private_worker_access()
    or target_reservation_key is null
    or target_actual_cost is null
    or target_actual_cost < 0
    or jsonb_typeof(coalesce(target_provider_usage, '{}'::jsonb)) <> 'object' then
    raise exception 'invalid_media_reconciliation' using errcode = '22023';
  end if;

  select * into usage_row from public.media_usage_reservations
  where reservation_key = target_reservation_key for update;
  if not found then raise exception 'media_reservation_not_found' using errcode = 'P0002'; end if;
  if usage_row.status <> 'reserved' then return to_jsonb(usage_row); end if;

  select * into profile from public.brand_profiles where owner_id = usage_row.owner_id;
  select coalesce(sum(coalesce(actual_cost, reserved_cost)), 0)::numeric(12,4)
  into other_booked
  from public.media_usage_reservations
  where owner_id = usage_row.owner_id
    and local_usage_date = usage_row.local_usage_date
    and status in ('reserved', 'reconciled', 'overage')
    and id <> usage_row.id;

  next_status := case
    when target_actual_cost > 0.99
      or other_booked + target_actual_cost > coalesce(profile.daily_media_cap, 0.99) then 'overage'
    else 'reconciled'
  end;

  update public.media_usage_reservations
  set actual_cost = target_actual_cost,
      provider_usage = coalesce(target_provider_usage, '{}'::jsonb),
      status = next_status,
      reconciled_at = now()
  where id = usage_row.id
  returning * into usage_row;
  return to_jsonb(usage_row);
end;
$$;

revoke all on function public.create_agent_run(text, text, jsonb, uuid, date, text, timestamptz) from public, anon, authenticated;
revoke all on function public.control_agent_run(uuid, text, uuid, text) from public, anon, authenticated;
revoke all on function public.record_agent_artifact_decision(uuid, text, uuid, text, text, jsonb) from public, anon, authenticated;
revoke all on function public.claim_agent_orchestration_task(uuid, text, integer) from public, anon, authenticated;
revoke all on function public.record_agent_task_event(uuid, text, text, jsonb, integer) from public, anon, authenticated;
revoke all on function public.complete_agent_orchestration_task(uuid, text, text, jsonb, text, jsonb) from public, anon, authenticated;
revoke all on function public.reserve_media_usage(uuid, uuid, uuid, text, uuid, text, text, numeric, date) from public, anon, authenticated;
revoke all on function public.reconcile_media_usage(uuid, numeric, jsonb) from public, anon, authenticated;
grant execute on function public.create_agent_run(text, text, jsonb, uuid, date, text, timestamptz) to authenticated;
grant execute on function public.control_agent_run(uuid, text, uuid, text) to authenticated;
grant execute on function public.record_agent_artifact_decision(uuid, text, uuid, text, text, jsonb) to authenticated;
grant execute on function public.claim_agent_orchestration_task(uuid, text, integer) to service_role;
grant execute on function public.record_agent_task_event(uuid, text, text, jsonb, integer) to service_role;
grant execute on function public.complete_agent_orchestration_task(uuid, text, text, jsonb, text, jsonb) to service_role;
grant execute on function public.reserve_media_usage(uuid, uuid, uuid, text, uuid, text, text, numeric, date) to service_role;
grant execute on function public.reconcile_media_usage(uuid, numeric, jsonb) to service_role;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'agent-media-private',
  'agent-media-private',
  false,
  52428800,
  array['image/png', 'image/jpeg', 'image/webp', 'video/mp4', 'audio/mpeg', 'audio/wav', 'text/vtt', 'application/x-subrip', 'text/plain']
)
on conflict (id) do update
set public = false, file_size_limit = 52428800;

drop policy if exists "operators read private agent media" on storage.objects;
create policy "operators read private agent media"
  on storage.objects for select
  using (bucket_id = 'agent-media-private' and public.is_admin(auth.uid()));
