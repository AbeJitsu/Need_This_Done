-- App-side planner and OpenClaw execution boundary.
--
-- The planner is a draft-only application feature. An approved plan is copied
-- into the run and every task at dispatch time; later edits cannot change the
-- work already authorized. OpenClaw remains an execution host, never the
-- source of truth and never a sender or publisher.
--
-- This migration is additive. The legacy agent_tasks/prospecting worker
-- contract remains available for rollback and comparison. No provider secret,
-- hosted migration, external message, or publication is activated here.

create table public.agent_plans (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  growth_profile_id uuid not null references public.growth_profiles(id) on delete restrict,
  workflow_type text not null
    check (workflow_type in ('research_outreach', 'daily_content')),
  original_request text not null check (length(trim(original_request)) between 1 and 12000),
  rewritten_instruction text not null check (length(trim(rewritten_instruction)) between 1 and 12000),
  steps jsonb not null check (jsonb_typeof(steps) = 'array' and jsonb_array_length(steps) between 1 and 12),
  allowed_capabilities jsonb not null check (jsonb_typeof(allowed_capabilities) = 'array'),
  forbidden_actions jsonb not null check (jsonb_typeof(forbidden_actions) = 'array'),
  expected_artifacts jsonb not null check (jsonb_typeof(expected_artifacts) = 'array'),
  selected_model_id text not null check (length(trim(selected_model_id)) between 3 and 240),
  model_route text not null check (model_route in ('selected-primary', 'selected-free', 'selected-deepseek-fallback')),
  estimated_prompt_tokens integer not null check (estimated_prompt_tokens between 0 and 100000),
  estimated_completion_tokens integer not null check (estimated_completion_tokens between 0 and 100000),
  estimated_web_search_calls integer not null default 0 check (estimated_web_search_calls between 0 and 100),
  estimated_cost_usd numeric(10,6) not null check (estimated_cost_usd >= 0 and estimated_cost_usd <= 100),
  planner_usage jsonb not null default '{}'::jsonb check (jsonb_typeof(planner_usage) = 'object'),
  openclaw_instruction jsonb not null check (jsonb_typeof(openclaw_instruction) = 'object'),
  status text not null default 'draft'
    check (status in ('draft', 'approved', 'rejected', 'dispatched')),
  idempotency_key uuid not null,
  request_hash text not null,
  approved_snapshot jsonb check (approved_snapshot is null or jsonb_typeof(approved_snapshot) = 'object'),
  approved_by uuid references auth.users(id) on delete set null,
  approved_at timestamptz,
  rejected_by uuid references auth.users(id) on delete set null,
  rejected_at timestamptz,
  run_id uuid references public.agent_runs(id) on delete set null,
  dispatch_idempotency_key uuid unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (owner_id, idempotency_key),
  unique (run_id),
  check (
    openclaw_instruction -> 'delivery' ->> 'deliver' = 'false'
    and openclaw_instruction -> 'delivery' ->> 'bestEffortDeliver' = 'false'
  ),
  check ((status = 'approved' and approved_snapshot is not null and approved_by is not null and approved_at is not null)
    or status <> 'approved'),
  check ((status = 'dispatched' and run_id is not null and approved_snapshot is not null)
    or status <> 'dispatched')
);

create table public.agent_plan_events (
  id bigint generated always as identity primary key,
  owner_id uuid not null references auth.users(id) on delete cascade,
  plan_id uuid not null references public.agent_plans(id) on delete cascade,
  event_type text not null check (event_type in ('created', 'edited', 'approved', 'rejected', 'dispatched')),
  payload jsonb not null default '{}'::jsonb check (jsonb_typeof(payload) = 'object'),
  idempotency_key uuid not null unique,
  request_hash text not null,
  created_at timestamptz not null default now()
);

alter table public.agent_runs
  add column if not exists plan_id uuid references public.agent_plans(id) on delete set null,
  add column if not exists approved_plan_snapshot jsonb;

alter table public.agent_orchestration_tasks
  add column if not exists plan_id uuid references public.agent_plans(id) on delete set null,
  add column if not exists growth_profile_id uuid references public.growth_profiles(id) on delete set null,
  add column if not exists approved_plan_snapshot jsonb;

create table public.openclaw_model_usage_reservations (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  growth_profile_id uuid not null references public.growth_profiles(id) on delete cascade,
  plan_id uuid not null references public.agent_plans(id) on delete cascade,
  run_id uuid not null references public.agent_runs(id) on delete cascade,
  task_id uuid not null references public.agent_orchestration_tasks(id) on delete cascade,
  worker_id text not null check (length(trim(worker_id)) between 1 and 160),
  reservation_key uuid not null unique,
  provider text not null default 'openrouter',
  model_id text not null check (length(trim(model_id)) between 3 and 240),
  reserved_cost numeric(10,6) not null check (reserved_cost >= 0 and reserved_cost <= 100),
  actual_cost numeric(10,6) check (actual_cost is null or actual_cost >= 0),
  status text not null default 'reserved'
    check (status in ('reserved', 'reconciled', 'released', 'overage')),
  local_usage_date date not null,
  provider_usage jsonb not null default '{}'::jsonb check (jsonb_typeof(provider_usage) = 'object'),
  created_at timestamptz not null default now(),
  reconciled_at timestamptz,
  check ((status = 'reserved' and actual_cost is null) or (status <> 'reserved' and actual_cost is not null))
);

alter table public.prospect_dossiers
  add column if not exists orchestration_task_id uuid references public.agent_orchestration_tasks(id) on delete set null,
  add column if not exists agent_artifact_id uuid references public.agent_artifacts(id) on delete set null,
  add column if not exists model_usage_reservation_id uuid references public.openclaw_model_usage_reservations(id) on delete set null,
  add column if not exists worker_id text;

create table public.prospecting_artifact_provenance (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  growth_profile_id uuid not null references public.growth_profiles(id) on delete cascade,
  plan_id uuid not null references public.agent_plans(id) on delete cascade,
  run_id uuid not null references public.agent_runs(id) on delete cascade,
  orchestration_task_id uuid not null references public.agent_orchestration_tasks(id) on delete cascade,
  artifact_id uuid not null unique references public.agent_artifacts(id) on delete cascade,
  model_usage_reservation_id uuid references public.openclaw_model_usage_reservations(id) on delete set null,
  model_id text not null,
  worker_id text not null,
  prospect_ids jsonb not null default '[]'::jsonb check (jsonb_typeof(prospect_ids) = 'array'),
  validation_status text not null check (validation_status in ('validated', 'rejected')),
  validation_errors jsonb not null default '[]'::jsonb check (jsonb_typeof(validation_errors) = 'array'),
  created_at timestamptz not null default now()
);

create index agent_plans_owner_status_idx on public.agent_plans (owner_id, status, created_at desc);
create index agent_plan_events_plan_idx on public.agent_plan_events (plan_id, created_at);
create index agent_runs_plan_idx on public.agent_runs (plan_id);
create index orchestration_tasks_plan_idx on public.agent_orchestration_tasks (plan_id, created_at);
create index orchestration_tasks_growth_profile_idx on public.agent_orchestration_tasks (growth_profile_id, status, created_at);
create index openclaw_usage_owner_day_idx on public.openclaw_model_usage_reservations (owner_id, local_usage_date, status);
create index openclaw_usage_task_idx on public.openclaw_model_usage_reservations (task_id, created_at desc);
create index prospecting_provenance_profile_idx on public.prospecting_artifact_provenance (growth_profile_id, created_at desc);
create index prospect_dossiers_orchestration_task_idx on public.prospect_dossiers (orchestration_task_id, created_at desc);

alter table public.agent_plans enable row level security;
alter table public.agent_plan_events enable row level security;
alter table public.openclaw_model_usage_reservations enable row level security;
alter table public.prospecting_artifact_provenance enable row level security;

create policy "operators own agent plans" on public.agent_plans
  for all using (public.is_admin(auth.uid()) and owner_id = auth.uid())
  with check (public.is_admin(auth.uid()) and owner_id = auth.uid());

create policy "operators read agent plan events" on public.agent_plan_events
  for select using (public.is_admin(auth.uid()) and owner_id = auth.uid());

create policy "operators read OpenClaw usage" on public.openclaw_model_usage_reservations
  for select using (public.is_admin(auth.uid()) and owner_id = auth.uid());

create policy "operators read prospecting provenance" on public.prospecting_artifact_provenance
  for select using (public.is_admin(auth.uid()) and owner_id = auth.uid());

revoke all on table public.agent_plans, public.agent_plan_events,
  public.openclaw_model_usage_reservations, public.prospecting_artifact_provenance from anon;
grant select, insert, update on table public.agent_plans to authenticated;
grant select on table public.agent_plan_events,
  public.openclaw_model_usage_reservations, public.prospecting_artifact_provenance to authenticated;

create or replace function public.update_agent_plan_timestamp()
returns trigger language plpgsql set search_path = public
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger update_agent_plans_updated_at
  before update on public.agent_plans
  for each row execute function public.update_agent_plan_timestamp();

create or replace function public.agent_plan_request_hash(
  target_original_request text,
  target_rewritten_instruction text,
  target_steps jsonb,
  target_allowed_capabilities jsonb,
  target_forbidden_actions jsonb,
  target_expected_artifacts jsonb,
  target_growth_profile_id uuid,
  target_workflow_type text,
  target_model_id text,
  target_estimated_cost numeric,
  target_openclaw_instruction jsonb
)
returns text language sql immutable set search_path = public
as $$
  select md5(
    coalesce(target_original_request, '') || ':' ||
    coalesce(target_rewritten_instruction, '') || ':' ||
    coalesce(target_steps, '{}'::jsonb)::text || ':' ||
    coalesce(target_allowed_capabilities, '{}'::jsonb)::text || ':' ||
    coalesce(target_forbidden_actions, '{}'::jsonb)::text || ':' ||
    coalesce(target_expected_artifacts, '{}'::jsonb)::text || ':' ||
    coalesce(target_growth_profile_id::text, '') || ':' ||
    coalesce(target_workflow_type, '') || ':' ||
    coalesce(target_model_id, '') || ':' ||
    coalesce(target_estimated_cost::text, '') || ':' ||
    coalesce(target_openclaw_instruction, '{}'::jsonb)::text
  );
$$;

create or replace function public.validate_agent_plan_payload(
  target_steps jsonb,
  target_allowed_capabilities jsonb,
  target_forbidden_actions jsonb,
  target_expected_artifacts jsonb,
  target_openclaw_instruction jsonb
)
returns void language plpgsql immutable set search_path = public
as $$
declare
  step jsonb;
  capability text;
  step_task_type text;
  step_role text;
begin
  if jsonb_typeof(target_steps) <> 'array'
    or jsonb_array_length(target_steps) not between 1 and 12
    or jsonb_typeof(target_allowed_capabilities) <> 'array'
    or jsonb_typeof(target_forbidden_actions) <> 'array'
    or jsonb_typeof(target_expected_artifacts) <> 'array'
    or jsonb_typeof(target_openclaw_instruction) <> 'object'
    or target_openclaw_instruction -> 'delivery' ->> 'deliver' <> 'false'
    or target_openclaw_instruction -> 'delivery' ->> 'bestEffortDeliver' <> 'false' then
    raise exception 'invalid_agent_plan_payload' using errcode = '22023';
  end if;

  if not (target_forbidden_actions ? 'send_external_messages')
    or not (target_forbidden_actions ? 'publish_content')
    or not (target_forbidden_actions ? 'spend_money')
    or not (target_forbidden_actions ? 'change_connected_accounts')
    or not (target_forbidden_actions ? 'deliver_external_content') then
    raise exception 'agent_plan_forbidden_actions_incomplete' using errcode = '22023';
  end if;

  for capability in select jsonb_array_elements_text(target_allowed_capabilities) loop
    if capability not in (
      'coordinate', 'read_public_web', 'research_public_web', 'draft_outreach',
      'review_artifacts', 'create_script', 'create_thumbnail', 'create_video',
      'create_audio', 'create_subtitles', 'regenerate_artifact'
    ) then
      raise exception 'agent_plan_capability_not_allowed' using errcode = '22023';
    end if;
  end loop;

  for step in select * from jsonb_array_elements(target_steps) loop
    step_task_type := nullif(trim(step ->> 'taskType'), '');
    step_role := nullif(trim(step ->> 'agentRole'), '');
    if nullif(trim(step ->> 'key'), '') is null
      or nullif(trim(step ->> 'title'), '') is null
      or nullif(trim(step ->> 'instruction'), '') is null
      or step_task_type not in ('coordinate', 'research_public_web', 'draft_outreach', 'produce_daily_content', 'review_artifacts', 'regenerate_artifact')
      or step_role not in ('coordinator', 'public_web_researcher', 'outreach_writer', 'daily_content_producer', 'reviewer')
      or jsonb_typeof(step -> 'capabilities') <> 'array'
      or jsonb_typeof(step -> 'expectedArtifacts') <> 'array'
      or jsonb_typeof(step -> 'estimatedCostUsd') <> 'number' then
      raise exception 'invalid_agent_plan_step' using errcode = '22023';
    end if;
  end loop;
end;
$$;

create or replace function public.create_agent_plan(
  target_original_request text,
  target_rewritten_instruction text,
  target_steps jsonb,
  target_allowed_capabilities jsonb,
  target_forbidden_actions jsonb,
  target_expected_artifacts jsonb,
  target_growth_profile_id uuid,
  target_workflow_type text,
  target_model_id text,
  target_model_route text,
  target_estimated_prompt_tokens integer,
  target_estimated_completion_tokens integer,
  target_estimated_web_search_calls integer,
  target_estimated_cost numeric,
  target_planner_usage jsonb,
  target_openclaw_instruction jsonb,
  target_idempotency_key uuid
)
returns jsonb language plpgsql security definer set search_path = public
as $$
declare
  actor_id uuid := auth.uid();
  profile public.growth_profiles;
  existing public.agent_plans;
  created public.agent_plans;
  request_hash text;
begin
  if actor_id is null or not public.is_admin(actor_id) then
    raise exception 'admin_required' using errcode = '42501';
  end if;
  if target_idempotency_key is null
    or nullif(trim(target_original_request), '') is null
    or length(trim(target_original_request)) > 12000
    or nullif(trim(target_rewritten_instruction), '') is null
    or length(trim(target_rewritten_instruction)) > 12000
    or target_workflow_type not in ('research_outreach', 'daily_content')
    or target_model_route not in ('selected-primary', 'selected-free', 'selected-deepseek-fallback')
    or nullif(trim(target_model_id), '') is null
    or target_estimated_prompt_tokens not between 0 and 100000
    or target_estimated_completion_tokens not between 0 and 100000
    or target_estimated_web_search_calls not between 0 and 100
    or target_estimated_cost is null
    or target_estimated_cost < 0
    or target_estimated_cost > 100
    or jsonb_typeof(coalesce(target_planner_usage, '{}'::jsonb)) <> 'object' then
    raise exception 'invalid_agent_plan' using errcode = '22023';
  end if;

  perform public.validate_agent_plan_payload(
    target_steps, target_allowed_capabilities, target_forbidden_actions,
    target_expected_artifacts, target_openclaw_instruction
  );

  select * into profile from public.growth_profiles
  where id = target_growth_profile_id and owner_id = actor_id for update;
  if not found or profile.emergency_stop
    or profile.model_route <> target_model_route
    or profile.selected_model_id is distinct from trim(target_model_id) then
    raise exception 'growth_profile_model_not_pinned' using errcode = '22023';
  end if;

  request_hash := public.agent_plan_request_hash(
    target_original_request, target_rewritten_instruction, target_steps,
    target_allowed_capabilities, target_forbidden_actions, target_expected_artifacts,
    target_growth_profile_id, target_workflow_type, target_model_id,
    target_estimated_cost, target_openclaw_instruction
  );

  select * into existing from public.agent_plans
  where owner_id = actor_id and idempotency_key = target_idempotency_key for update;
  if found then
    if existing.request_hash <> request_hash then
      raise exception 'agent_plan_idempotency_conflict' using errcode = '23505';
    end if;
    return jsonb_build_object('plan', to_jsonb(existing), 'duplicate', true);
  end if;

  insert into public.agent_plans (
    owner_id, growth_profile_id, workflow_type, original_request,
    rewritten_instruction, steps, allowed_capabilities, forbidden_actions,
    expected_artifacts, selected_model_id, model_route,
    estimated_prompt_tokens, estimated_completion_tokens,
    estimated_web_search_calls, estimated_cost_usd, planner_usage,
    openclaw_instruction, idempotency_key, request_hash
  ) values (
    actor_id, target_growth_profile_id, target_workflow_type, trim(target_original_request),
    trim(target_rewritten_instruction), target_steps, target_allowed_capabilities,
    target_forbidden_actions, target_expected_artifacts, trim(target_model_id),
    target_model_route, target_estimated_prompt_tokens, target_estimated_completion_tokens,
    target_estimated_web_search_calls, target_estimated_cost, coalesce(target_planner_usage, '{}'::jsonb),
    target_openclaw_instruction, target_idempotency_key, request_hash
  ) returning * into created;

  insert into public.agent_plan_events (
    owner_id, plan_id, event_type, payload, idempotency_key, request_hash
  ) values (
    actor_id, created.id, 'created', jsonb_build_object('modelId', created.selected_model_id),
    target_idempotency_key, request_hash
  );

  return jsonb_build_object('plan', to_jsonb(created), 'duplicate', false);
end;
$$;

create or replace function public.update_agent_plan(
  target_plan_id uuid,
  target_rewritten_instruction text,
  target_steps jsonb,
  target_allowed_capabilities jsonb,
  target_forbidden_actions jsonb,
  target_expected_artifacts jsonb,
  target_openclaw_instruction jsonb,
  target_idempotency_key uuid
)
returns jsonb language plpgsql security definer set search_path = public
as $$
declare
  actor_id uuid := auth.uid();
  plan_row public.agent_plans;
  existing_event public.agent_plan_events;
  request_hash text;
begin
  if actor_id is null or not public.is_admin(actor_id)
    or target_plan_id is null or target_idempotency_key is null
    or nullif(trim(target_rewritten_instruction), '') is null then
    raise exception 'invalid_agent_plan_edit' using errcode = '22023';
  end if;
  perform public.validate_agent_plan_payload(
    target_steps, target_allowed_capabilities, target_forbidden_actions,
    target_expected_artifacts, target_openclaw_instruction
  );
  request_hash := md5(
    target_plan_id::text || ':' || trim(target_rewritten_instruction) || ':' ||
    target_steps::text || ':' || target_allowed_capabilities::text || ':' ||
    target_forbidden_actions::text || ':' || target_expected_artifacts::text || ':' ||
    target_openclaw_instruction::text
  );

  select * into existing_event from public.agent_plan_events
  where idempotency_key = target_idempotency_key for update;
  if found then
    if existing_event.request_hash <> request_hash or existing_event.event_type <> 'edited' then
      raise exception 'agent_plan_edit_idempotency_conflict' using errcode = '23505';
    end if;
    select * into plan_row from public.agent_plans where id = target_plan_id;
    return jsonb_build_object('plan', to_jsonb(plan_row), 'duplicate', true);
  end if;

  select * into plan_row from public.agent_plans
  where id = target_plan_id and owner_id = actor_id for update;
  if not found then raise exception 'agent_plan_not_found' using errcode = 'P0002'; end if;
  if plan_row.status not in ('draft', 'rejected') then
    raise exception 'agent_plan_not_editable' using errcode = '22023';
  end if;

  update public.agent_plans set
    rewritten_instruction = trim(target_rewritten_instruction),
    steps = target_steps,
    allowed_capabilities = target_allowed_capabilities,
    forbidden_actions = target_forbidden_actions,
    expected_artifacts = target_expected_artifacts,
    openclaw_instruction = target_openclaw_instruction,
    status = 'draft',
    approved_snapshot = null,
    approved_by = null,
    approved_at = null,
    rejected_by = null,
    rejected_at = null,
    updated_at = now()
  where id = plan_row.id
  returning * into plan_row;

  insert into public.agent_plan_events (
    owner_id, plan_id, event_type, payload, idempotency_key, request_hash
  ) values (
    actor_id, plan_row.id, 'edited', jsonb_build_object('status', plan_row.status),
    target_idempotency_key, request_hash
  );
  return jsonb_build_object('plan', to_jsonb(plan_row), 'duplicate', false);
end;
$$;

create or replace function public.reject_agent_plan(
  target_plan_id uuid,
  target_idempotency_key uuid,
  target_note text default ''
)
returns jsonb language plpgsql security definer set search_path = public
as $$
declare
  actor_id uuid := auth.uid();
  plan_row public.agent_plans;
  existing_event public.agent_plan_events;
  request_hash text := md5('reject:' || target_plan_id::text || ':' || coalesce(target_note, ''));
begin
  if actor_id is null or not public.is_admin(actor_id)
    or target_plan_id is null or target_idempotency_key is null then
    raise exception 'invalid_agent_plan_rejection' using errcode = '22023';
  end if;
  select * into existing_event from public.agent_plan_events
  where idempotency_key = target_idempotency_key for update;
  if found then
    if existing_event.request_hash <> request_hash or existing_event.event_type <> 'rejected' then
      raise exception 'agent_plan_rejection_idempotency_conflict' using errcode = '23505';
    end if;
    select * into plan_row from public.agent_plans where id = target_plan_id;
    return jsonb_build_object('plan', to_jsonb(plan_row), 'duplicate', true);
  end if;

  select * into plan_row from public.agent_plans
  where id = target_plan_id and owner_id = actor_id for update;
  if not found then raise exception 'agent_plan_not_found' using errcode = 'P0002'; end if;
  if plan_row.status not in ('draft', 'approved') then
    raise exception 'agent_plan_not_rejectable' using errcode = '22023';
  end if;

  update public.agent_plans set
    status = 'rejected', approved_snapshot = null, approved_by = null, approved_at = null,
    rejected_by = actor_id, rejected_at = now(), updated_at = now()
  where id = plan_row.id returning * into plan_row;
  insert into public.agent_plan_events (
    owner_id, plan_id, event_type, payload, idempotency_key, request_hash
  ) values (
    actor_id, plan_row.id, 'rejected', jsonb_build_object('note', left(coalesce(target_note, ''), 2000)),
    target_idempotency_key, request_hash
  );
  return jsonb_build_object('plan', to_jsonb(plan_row), 'duplicate', false);
end;
$$;

create or replace function public.approve_agent_plan(
  target_plan_id uuid,
  target_idempotency_key uuid,
  target_note text default ''
)
returns jsonb language plpgsql security definer set search_path = public
as $$
declare
  actor_id uuid := auth.uid();
  plan_row public.agent_plans;
  existing_event public.agent_plan_events;
  snapshot jsonb;
  request_hash text := md5('approve:' || target_plan_id::text || ':' || coalesce(target_note, ''));
begin
  if actor_id is null or not public.is_admin(actor_id)
    or target_plan_id is null or target_idempotency_key is null then
    raise exception 'invalid_agent_plan_approval' using errcode = '22023';
  end if;
  select * into existing_event from public.agent_plan_events
  where idempotency_key = target_idempotency_key for update;
  if found then
    if existing_event.request_hash <> request_hash or existing_event.event_type <> 'approved' then
      raise exception 'agent_plan_approval_idempotency_conflict' using errcode = '23505';
    end if;
    select * into plan_row from public.agent_plans where id = target_plan_id;
    return jsonb_build_object('plan', to_jsonb(plan_row), 'duplicate', true);
  end if;

  select * into plan_row from public.agent_plans
  where id = target_plan_id and owner_id = actor_id for update;
  if not found then raise exception 'agent_plan_not_found' using errcode = 'P0002'; end if;
  if plan_row.status <> 'draft' then
    raise exception 'agent_plan_not_approvable' using errcode = '22023';
  end if;

  snapshot := jsonb_build_object(
    'planId', plan_row.id,
    'originalRequest', plan_row.original_request,
    'rewrittenInstruction', plan_row.rewritten_instruction,
    'workflowType', plan_row.workflow_type,
    'growthProfileId', plan_row.growth_profile_id,
    'steps', plan_row.steps,
    'allowedCapabilities', plan_row.allowed_capabilities,
    'forbiddenActions', plan_row.forbidden_actions,
    'expectedArtifacts', plan_row.expected_artifacts,
    'selectedModelId', plan_row.selected_model_id,
    'modelRoute', plan_row.model_route,
    'estimatedUsage', jsonb_build_object(
      'promptTokens', plan_row.estimated_prompt_tokens,
      'completionTokens', plan_row.estimated_completion_tokens,
      'webSearchCalls', plan_row.estimated_web_search_calls,
      'estimatedCostUsd', plan_row.estimated_cost_usd
    ),
    'openclawInstruction', plan_row.openclaw_instruction,
    'approvedAt', now(),
    'approvedBy', actor_id
  );

  update public.agent_plans set
    status = 'approved', approved_snapshot = snapshot, approved_by = actor_id,
    approved_at = now(), updated_at = now()
  where id = plan_row.id returning * into plan_row;
  insert into public.agent_plan_events (
    owner_id, plan_id, event_type, payload, idempotency_key, request_hash
  ) values (
    actor_id, plan_row.id, 'approved',
    jsonb_build_object('note', left(coalesce(target_note, ''), 2000), 'snapshot', snapshot),
    target_idempotency_key, request_hash
  );
  return jsonb_build_object('plan', to_jsonb(plan_row), 'duplicate', false);
end;
$$;

create or replace function public.dispatch_agent_plan(
  target_plan_id uuid,
  target_idempotency_key uuid
)
returns jsonb language plpgsql security definer set search_path = public
as $$
declare
  actor_id uuid := auth.uid();
  plan_row public.agent_plans;
  existing_event public.agent_plan_events;
  run_row public.agent_runs;
  task_row public.agent_orchestration_tasks;
  previous_task_id uuid;
  task_id uuid;
  step jsonb;
  snapshot jsonb;
  task_key text;
  task_type text;
  agent_role text;
  step_index integer := 0;
  request_hash text := md5('dispatch:' || target_plan_id::text);
  tasks jsonb;
begin
  if actor_id is null or not public.is_admin(actor_id)
    or target_plan_id is null or target_idempotency_key is null then
    raise exception 'invalid_agent_plan_dispatch' using errcode = '22023';
  end if;

  select * into existing_event from public.agent_plan_events
  where idempotency_key = target_idempotency_key for update;
  if found then
    if existing_event.request_hash <> request_hash or existing_event.event_type <> 'dispatched' then
      raise exception 'agent_plan_dispatch_idempotency_conflict' using errcode = '23505';
    end if;
    select * into plan_row from public.agent_plans where id = target_plan_id;
    select * into run_row from public.agent_runs where id = plan_row.run_id;
    return jsonb_build_object('plan', to_jsonb(plan_row), 'run', to_jsonb(run_row), 'duplicate', true);
  end if;

  select * into plan_row from public.agent_plans
  where id = target_plan_id and owner_id = actor_id for update;
  if not found then raise exception 'agent_plan_not_found' using errcode = 'P0002'; end if;
  if plan_row.status <> 'approved' or plan_row.approved_snapshot is null then
    raise exception 'agent_plan_must_be_approved' using errcode = '22023';
  end if;
  if plan_row.run_id is not null then raise exception 'agent_plan_already_dispatched' using errcode = '23505'; end if;
  snapshot := plan_row.approved_snapshot;

  insert into public.agent_runs (
    owner_id, plan_id, workflow_type, title, input, approved_plan_snapshot,
    idempotency_key, request_hash, requested_by
  ) values (
    actor_id, plan_row.id, plan_row.workflow_type,
    left(plan_row.rewritten_instruction, 240),
    jsonb_build_object(
      'planId', plan_row.id,
      'originalRequest', plan_row.original_request,
      'approvedPlan', snapshot,
      'openclawInstruction', plan_row.openclaw_instruction,
      'humanApprovalRequired', true,
      'automaticSending', false,
      'automaticPublishing', false
    ),
    snapshot, target_idempotency_key, request_hash, actor_id
  ) returning * into run_row;

  for step in select * from jsonb_array_elements(snapshot -> 'steps') loop
    step_index := step_index + 1;
    task_key := regexp_replace(lower(coalesce(step ->> 'key', 'step-' || lpad(step_index::text, 2, '0'))), '[^a-z0-9_-]+', '-', 'g');
    if nullif(trim(task_key), '') is null then task_key := 'step-' || lpad(step_index::text, 2, '0'); end if;
    task_type := trim(step ->> 'taskType');
    agent_role := trim(step ->> 'agentRole');
    if task_type not in ('coordinate', 'research_public_web', 'draft_outreach', 'produce_daily_content', 'review_artifacts', 'regenerate_artifact')
      or agent_role not in ('coordinator', 'public_web_researcher', 'outreach_writer', 'daily_content_producer', 'reviewer') then
      raise exception 'agent_plan_step_not_dispatchable' using errcode = '22023';
    end if;

    insert into public.agent_orchestration_tasks (
      owner_id, run_id, plan_id, growth_profile_id, approved_plan_snapshot,
      task_key, agent_role, agent_provider, model_id, capabilities, task_type, input
    ) values (
      actor_id, run_row.id, plan_row.id, plan_row.growth_profile_id, snapshot,
      task_key, agent_role, 'openclaw', plan_row.selected_model_id,
      coalesce(step -> 'capabilities', snapshot -> 'allowedCapabilities'), task_type,
      jsonb_build_object(
        'planId', plan_row.id,
        'growthProfileId', plan_row.growth_profile_id,
        'approvedPlan', snapshot,
        'step', step,
        'modelReservationUsd', (step ->> 'estimatedCostUsd')::numeric
      )
    ) returning * into task_row;
    task_id := task_row.id;
    if previous_task_id is not null then
      insert into public.agent_task_dependencies (task_id, depends_on_task_id)
      values (task_id, previous_task_id);
    end if;
    previous_task_id := task_id;
  end loop;

  update public.agent_plans set
    status = 'dispatched', run_id = run_row.id,
    dispatch_idempotency_key = target_idempotency_key, updated_at = now()
  where id = plan_row.id returning * into plan_row;

  insert into public.agent_plan_events (
    owner_id, plan_id, event_type, payload, idempotency_key, request_hash
  ) values (
    actor_id, plan_row.id, 'dispatched',
    jsonb_build_object('runId', run_row.id, 'taskCount', step_index),
    target_idempotency_key, request_hash
  );

  select coalesce(jsonb_agg(to_jsonb(task_row) order by task_row.created_at), '[]'::jsonb)
    into tasks
    from public.agent_orchestration_tasks task_row where task_row.run_id = run_row.id;
  return jsonb_build_object('plan', to_jsonb(plan_row), 'run', to_jsonb(run_row), 'tasks', tasks, 'duplicate', false);
end;
$$;

create or replace function public.reserve_openclaw_model_usage(
  target_owner_id uuid,
  target_plan_id uuid,
  target_run_id uuid,
  target_task_id uuid,
  target_worker text,
  target_reservation_key uuid,
  target_reserved_cost numeric
)
returns jsonb language plpgsql security definer set search_path = public
as $$
declare
  task_row public.agent_orchestration_tasks;
  plan_row public.agent_plans;
  profile public.growth_profiles;
  existing public.openclaw_model_usage_reservations;
  usage_day date;
  booked numeric(12,6);
begin
  if not public.private_worker_access()
    or target_owner_id is null or target_plan_id is null or target_run_id is null or target_task_id is null
    or nullif(trim(target_worker), '') is null or target_reservation_key is null
    or target_reserved_cost is null or target_reserved_cost < 0 or target_reserved_cost > 100 then
    raise exception 'invalid_openclaw_usage_reservation' using errcode = '22023';
  end if;

  select * into existing from public.openclaw_model_usage_reservations
  where reservation_key = target_reservation_key;
  if found then
    if existing.owner_id <> target_owner_id or existing.plan_id <> target_plan_id
      or existing.task_id <> target_task_id or existing.reserved_cost <> target_reserved_cost then
      raise exception 'openclaw_reservation_key_conflict' using errcode = '23505';
    end if;
    return to_jsonb(existing);
  end if;

  select * into task_row from public.agent_orchestration_tasks
  where id = target_task_id and owner_id = target_owner_id for update;
  select * into plan_row from public.agent_plans where id = target_plan_id and owner_id = target_owner_id;
  select * into profile from public.growth_profiles where id = task_row.growth_profile_id and owner_id = target_owner_id for update;
  if not found or task_row.plan_id <> target_plan_id or task_row.run_id <> target_run_id
    or task_row.status not in ('leased', 'running') or task_row.leased_by <> trim(target_worker)
    or task_row.lease_expires_at is null or task_row.lease_expires_at <= now()
    or plan_row.status <> 'dispatched' or plan_row.run_id <> target_run_id
    or profile.emergency_stop then
    raise exception 'openclaw_usage_task_not_authorized' using errcode = '22023';
  end if;

  usage_day := (now() at time zone profile.timezone)::date;
  perform pg_advisory_xact_lock(hashtext(target_owner_id::text || ':openclaw:' || usage_day::text));
  select coalesce(sum(coalesce(actual_cost, reserved_cost)), 0)::numeric(12,6) into booked
  from public.openclaw_model_usage_reservations
  where owner_id = target_owner_id and local_usage_date = usage_day
    and status in ('reserved', 'reconciled', 'overage');
  if booked + target_reserved_cost > profile.daily_model_cap then
    raise exception 'daily_model_budget_exceeded' using errcode = '22023';
  end if;

  insert into public.openclaw_model_usage_reservations (
    owner_id, growth_profile_id, plan_id, run_id, task_id, worker_id,
    reservation_key, model_id, reserved_cost, local_usage_date
  ) values (
    target_owner_id, task_row.growth_profile_id, target_plan_id, target_run_id,
    target_task_id, trim(target_worker), target_reservation_key, task_row.model_id,
    target_reserved_cost, usage_day
  ) returning * into existing;
  return to_jsonb(existing);
end;
$$;

create or replace function public.reconcile_openclaw_model_usage(
  target_reservation_key uuid,
  target_actual_cost numeric,
  target_provider_usage jsonb default '{}'::jsonb
)
returns jsonb language plpgsql security definer set search_path = public
as $$
declare
  usage_row public.openclaw_model_usage_reservations;
  profile public.growth_profiles;
  other_booked numeric(12,6);
  next_status text;
begin
  if not public.private_worker_access()
    or target_reservation_key is null or target_actual_cost is null or target_actual_cost < 0
    or jsonb_typeof(coalesce(target_provider_usage, '{}'::jsonb)) <> 'object' then
    raise exception 'invalid_openclaw_usage_reconciliation' using errcode = '22023';
  end if;
  select * into usage_row from public.openclaw_model_usage_reservations
  where reservation_key = target_reservation_key for update;
  if not found then raise exception 'openclaw_reservation_not_found' using errcode = 'P0002'; end if;
  if usage_row.status <> 'reserved' then return to_jsonb(usage_row); end if;
  select * into profile from public.growth_profiles where id = usage_row.growth_profile_id;
  select coalesce(sum(coalesce(actual_cost, reserved_cost)), 0)::numeric(12,6) into other_booked
  from public.openclaw_model_usage_reservations
  where owner_id = usage_row.owner_id and local_usage_date = usage_row.local_usage_date
    and status in ('reserved', 'reconciled', 'overage') and id <> usage_row.id;
  next_status := case
    when target_actual_cost > usage_row.reserved_cost
      or other_booked + target_actual_cost > coalesce(profile.daily_model_cap, 0) then 'overage'
    else 'reconciled'
  end;
  update public.openclaw_model_usage_reservations set
    actual_cost = target_actual_cost, provider_usage = coalesce(target_provider_usage, '{}'::jsonb),
    status = next_status, reconciled_at = now()
  where id = usage_row.id returning * into usage_row;
  return to_jsonb(usage_row);
end;
$$;

create or replace function public.record_openclaw_prospecting_result(
  target_task_id uuid,
  target_worker text,
  target_model_id text,
  target_artifact_id uuid,
  target_reservation_key uuid,
  target_result jsonb
)
returns jsonb language plpgsql security definer set search_path = public
as $$
declare
  task_row public.agent_orchestration_tasks;
  plan_row public.agent_plans;
  profile public.growth_profiles;
  artifact_row public.agent_artifacts;
  usage_row public.openclaw_model_usage_reservations;
  dossier jsonb;
  citation jsonb;
  evidence_item jsonb;
  existing public.prospects;
  created public.prospects;
  prospect_ids jsonb := '[]'::jsonb;
  accepted integer := 0;
  duplicates integer := 0;
  company text;
  website text;
  reason text;
  offer_angle text;
  subject text;
  body text;
  contact_value text;
  contact_email text;
  dedup_key text;
  suppression_exists boolean;
  citation_count integer;
begin
  if not public.private_worker_access()
    or target_task_id is null or nullif(trim(target_worker), '') is null
    or nullif(trim(target_model_id), '') is null or target_artifact_id is null
    or jsonb_typeof(target_result) <> 'object'
    or jsonb_typeof(target_result -> 'dossiers') <> 'array'
    or jsonb_array_length(target_result -> 'dossiers') not between 1 and 2 then
    raise exception 'invalid_openclaw_prospecting_result' using errcode = '22023';
  end if;

  select * into task_row from public.agent_orchestration_tasks
  where id = target_task_id for update;
  select * into plan_row from public.agent_plans where id = task_row.plan_id;
  select * into profile from public.growth_profiles where id = task_row.growth_profile_id;
  select * into artifact_row from public.agent_artifacts
  where id = target_artifact_id and task_id = target_task_id;
  if not found or task_row.task_type <> 'research_public_web'
    or task_row.agent_provider <> 'openclaw' or task_row.model_id <> trim(target_model_id)
    or task_row.status <> 'succeeded' or task_row.leased_by <> trim(target_worker)
    or plan_row.status <> 'dispatched' or profile.emergency_stop then
    raise exception 'openclaw_prospecting_task_not_authorized' using errcode = '22023';
  end if;

  if target_reservation_key is not null then
    select * into usage_row from public.openclaw_model_usage_reservations
    where reservation_key = target_reservation_key and task_id = target_task_id;
    if not found then raise exception 'openclaw_prospecting_usage_not_found' using errcode = '22023'; end if;
  end if;

  for dossier in select * from jsonb_array_elements(target_result -> 'dossiers') loop
    company := nullif(trim(dossier ->> 'companyName'), '');
    website := nullif(trim(dossier ->> 'officialWebsite'), '');
    reason := nullif(trim(dossier ->> 'icpReason'), '');
    offer_angle := nullif(trim(dossier ->> 'recommendedOfferAngle'), '');
    subject := nullif(trim(dossier #>> '{suggestedOutreach,subject}'), '');
    body := nullif(trim(dossier #>> '{suggestedOutreach,body}'), '');
    contact_value := nullif(trim(dossier #>> '{contactPath,value}'), '');
    contact_email := public.normalize_outreach_address(dossier #>> '{contactPath,email}');
    if company is null or website is null or reason is null or offer_angle is null or subject is null or body is null
      or website !~* '^https://'
      or website ~* '^https://(localhost|127\\.0\\.0\\.1|\\[?::1\\]?)(/|$)'
      or jsonb_typeof(dossier -> 'observedEvidence') <> 'array'
      or jsonb_array_length(dossier -> 'observedEvidence') = 0
      or jsonb_typeof(dossier -> 'citations') <> 'array'
      or jsonb_array_length(dossier -> 'citations') = 0
      or jsonb_typeof(dossier -> 'contactPath') <> 'object'
      or jsonb_typeof(dossier -> 'suggestedOutreach') <> 'object' then
      raise exception 'invalid_openclaw_prospect_dossier' using errcode = '22023';
    end if;

    select count(*) into citation_count from jsonb_array_elements(dossier -> 'citations') as item;
    if citation_count <> (select count(distinct trim(item ->> 'url')) from jsonb_array_elements(dossier -> 'citations') as item) then
      raise exception 'duplicate_openclaw_dossier_citation' using errcode = '22023';
    end if;
    for citation in select * from jsonb_array_elements(dossier -> 'citations') loop
      if nullif(trim(citation ->> 'url'), '') is null
        or trim(citation ->> 'url') !~* '^https://'
        or trim(citation ->> 'url') ~* '^https://(localhost|127\\.0\\.0\\.1|\\[?::1\\]?)(/|$)'
        or nullif(trim(citation ->> 'title'), '') is null
        or nullif(trim(citation ->> 'excerpt'), '') is null then
        raise exception 'invalid_openclaw_dossier_citation' using errcode = '22023';
      end if;
    end loop;
    for evidence_item in select * from jsonb_array_elements(dossier -> 'observedEvidence') loop
      if nullif(trim(evidence_item ->> 'claim'), '') is null
        or jsonb_typeof(evidence_item -> 'citationUrls') <> 'array'
        or jsonb_array_length(evidence_item -> 'citationUrls') = 0
        or exists (
          select 1 from jsonb_array_elements_text(evidence_item -> 'citationUrls') source_url
          where not exists (
            select 1 from jsonb_array_elements(dossier -> 'citations') known
            where trim(known ->> 'url') = trim(source_url)
          )
        ) then
        raise exception 'unsupported_openclaw_dossier_claim' using errcode = '22023';
      end if;
    end loop;

    dedup_key := lower(regexp_replace(website, '^https?://(www\\.)?', ''));
    dedup_key := regexp_replace(dedup_key, '/$', '');
    select * into existing from public.prospects
    where profile_id = profile.id and deduplication_key = dedup_key for update;
    if found then
      prospect_ids := prospect_ids || jsonb_build_array(existing.id);
      duplicates := duplicates + 1;
      continue;
    end if;
    select exists(select 1 from public.suppression_records where normalized_address = nullif(contact_email, '')) into suppression_exists;
    insert into public.prospects (
      profile_id, company_name, email, website_url, deduplication_key,
      icp_match_score, icp_match_reason, suppression_status
    ) values (
      profile.id, company, nullif(contact_email, ''), website, dedup_key,
      80, reason, case when suppression_exists then 'suppressed' else 'clear' end
    ) returning * into created;
    prospect_ids := prospect_ids || jsonb_build_array(created.id);
    for citation in select * from jsonb_array_elements(dossier -> 'citations') loop
      insert into public.prospect_sources (
        prospect_id, source_url, source_type, evidence, contact_path, email_status, discovered_by
      ) values (
        created.id, trim(citation ->> 'url'), 'openclaw_web_search',
        jsonb_build_array(trim(citation ->> 'excerpt')), contact_value,
        case when nullif(contact_email, '') is null then 'unknown' else 'public' end,
        'mac-mini-openclaw'
      ) on conflict (prospect_id, source_url) do nothing;
    end loop;
    insert into public.prospect_dossiers (
      profile_id, prospect_id, orchestration_task_id, agent_artifact_id,
      model_usage_reservation_id, worker_id, company_name, official_website_url,
      icp_reason, observed_evidence, citations, recommended_offer_angle,
      contact_path, suggested_subject, suggested_body, model_id
    ) values (
      profile.id, created.id, task_row.id, artifact_row.id,
      usage_row.id, trim(target_worker), company, website, reason,
      dossier -> 'observedEvidence', dossier -> 'citations', offer_angle,
      dossier -> 'contactPath', subject, body, trim(target_model_id)
    );
    accepted := accepted + 1;
  end loop;

  insert into public.prospecting_artifact_provenance (
    owner_id, growth_profile_id, plan_id, run_id, orchestration_task_id,
    artifact_id, model_usage_reservation_id, model_id, worker_id,
    prospect_ids, validation_status
  ) values (
    task_row.owner_id, profile.id, plan_row.id, task_row.run_id, task_row.id,
    artifact_row.id, usage_row.id, trim(target_model_id), trim(target_worker),
    prospect_ids, 'validated'
  ) on conflict (artifact_id) do nothing;

  return jsonb_build_object(
    'acceptedDossiers', accepted,
    'duplicateDossiers', duplicates,
    'prospectIds', prospect_ids,
    'artifactId', artifact_row.id,
    'modelId', trim(target_model_id)
  );
end;
$$;

create or replace function public.complete_openclaw_orchestration_task(
  target_task_id uuid,
  target_worker text,
  target_status text,
  target_output jsonb default null,
  target_error text default null,
  target_artifacts jsonb default '[]'::jsonb,
  target_model_reservation_key uuid default null,
  target_prospecting jsonb default null
)
returns jsonb language plpgsql security definer set search_path = public
as $$
declare
  result jsonb;
  task_row public.agent_orchestration_tasks;
  artifact_row public.agent_artifacts;
  prospecting_result jsonb;
begin
  if not public.private_worker_access() then
    raise exception 'private_worker_required' using errcode = '42501';
  end if;
  result := public.complete_agent_orchestration_task(
    target_task_id, target_worker, target_status, target_output,
    target_error, target_artifacts
  );
  if target_status = 'succeeded' and target_prospecting is not null then
    select * into task_row from public.agent_orchestration_tasks where id = target_task_id;
    select * into artifact_row from public.agent_artifacts
    where task_id = target_task_id and artifact_type = 'research_dossier'
    order by created_at desc limit 1;
    if not found then raise exception 'openclaw_prospecting_artifact_required' using errcode = '22023'; end if;
    prospecting_result := public.record_openclaw_prospecting_result(
      target_task_id, target_worker, task_row.model_id, artifact_row.id,
      target_model_reservation_key, target_prospecting
    );
    result := result || jsonb_build_object('prospecting', prospecting_result);
  end if;
  return result;
end;
$$;

revoke all on function public.create_agent_plan(text,text,jsonb,jsonb,jsonb,jsonb,uuid,text,text,text,integer,integer,integer,numeric,jsonb,jsonb,uuid) from public, anon, authenticated;
revoke all on function public.update_agent_plan(uuid,text,jsonb,jsonb,jsonb,jsonb,jsonb,uuid) from public, anon, authenticated;
revoke all on function public.reject_agent_plan(uuid,uuid,text) from public, anon, authenticated;
revoke all on function public.approve_agent_plan(uuid,uuid,text) from public, anon, authenticated;
revoke all on function public.dispatch_agent_plan(uuid,uuid) from public, anon, authenticated;
revoke all on function public.reserve_openclaw_model_usage(uuid,uuid,uuid,uuid,text,uuid,numeric) from public, anon, authenticated;
revoke all on function public.reconcile_openclaw_model_usage(uuid,numeric,jsonb) from public, anon, authenticated;
revoke all on function public.record_openclaw_prospecting_result(uuid,text,text,uuid,uuid,jsonb) from public, anon, authenticated;
revoke all on function public.complete_openclaw_orchestration_task(uuid,text,text,jsonb,text,jsonb,uuid,jsonb) from public, anon, authenticated;
grant execute on function public.create_agent_plan(text,text,jsonb,jsonb,jsonb,jsonb,uuid,text,text,text,integer,integer,integer,numeric,jsonb,jsonb,uuid) to authenticated;
grant execute on function public.update_agent_plan(uuid,text,jsonb,jsonb,jsonb,jsonb,jsonb,uuid) to authenticated;
grant execute on function public.reject_agent_plan(uuid,uuid,text) to authenticated;
grant execute on function public.approve_agent_plan(uuid,uuid,text) to authenticated;
grant execute on function public.dispatch_agent_plan(uuid,uuid) to authenticated;
grant execute on function public.reserve_openclaw_model_usage(uuid,uuid,uuid,uuid,text,uuid,numeric) to service_role;
grant execute on function public.reconcile_openclaw_model_usage(uuid,numeric,jsonb) to service_role;
grant execute on function public.record_openclaw_prospecting_result(uuid,text,text,uuid,uuid,jsonb) to service_role;
grant execute on function public.complete_openclaw_orchestration_task(uuid,text,text,jsonb,text,jsonb,uuid,jsonb) to service_role;
