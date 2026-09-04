-- Freeze separate planner and executor identities for approved Hermes work.
--
-- The browser-selected free OpenRouter model remains the Hermes planner.
-- OpenClaw is never allowed to inherit that identity: it receives only the
-- server-configured, exact Gateway model below. This is additive and
-- forward-only; it neither starts a worker nor activates a provider.

alter table public.agent_plans
  add column if not exists executor_model_id text;

update public.agent_plans
set executor_model_id = 'openai/gpt-5.6-luna'
where executor_model_id is null;

alter table public.agent_plans
  alter column executor_model_id set default 'openai/gpt-5.6-luna',
  alter column executor_model_id set not null,
  add constraint agent_plans_executor_model_id_check
    check (executor_model_id = 'openai/gpt-5.6-luna');

-- The retained create_agent_plan function owns the validated insert. Its
-- wrapper below cannot update a row that failed this non-null constraint, so
-- the database—not a caller—supplies the sole allowlisted executor identity.

create or replace function public.create_agent_plan_with_executor(
  target_original_request text, target_rewritten_instruction text,
  target_steps jsonb, target_allowed_capabilities jsonb,
  target_forbidden_actions jsonb, target_expected_artifacts jsonb,
  target_growth_profile_id uuid, target_workflow_type text,
  target_model_id text, target_executor_model_id text, target_model_route text,
  target_estimated_prompt_tokens integer, target_estimated_completion_tokens integer,
  target_estimated_web_search_calls integer, target_estimated_cost numeric,
  target_planner_usage jsonb, target_openclaw_instruction jsonb,
  target_idempotency_key uuid
) returns jsonb language plpgsql security definer set search_path = public as $$
declare result jsonb; plan_id uuid;
begin
  if target_executor_model_id <> 'openai/gpt-5.6-luna' then
    raise exception 'executor_model_not_allowlisted' using errcode = '22023';
  end if;
  result := public.create_agent_plan(
    target_original_request, target_rewritten_instruction, target_steps,
    target_allowed_capabilities, target_forbidden_actions, target_expected_artifacts,
    target_growth_profile_id, target_workflow_type, target_model_id, target_model_route,
    target_estimated_prompt_tokens, target_estimated_completion_tokens,
    target_estimated_web_search_calls, target_estimated_cost, target_planner_usage,
    target_openclaw_instruction, target_idempotency_key
  );
  plan_id := (result -> 'plan' ->> 'id')::uuid;
  update public.agent_plans set executor_model_id = target_executor_model_id
  where id = plan_id and status = 'draft';
  select jsonb_build_object('plan', to_jsonb(plan), 'duplicate', coalesce((result ->> 'duplicate')::boolean, false))
    into result from public.agent_plans plan where plan.id = plan_id;
  return result;
end;
$$;

create or replace function public.approve_agent_plan(
  target_plan_id uuid, target_idempotency_key uuid, target_note text default ''
) returns jsonb language plpgsql security definer set search_path = public as $$
declare actor_id uuid := auth.uid(); plan_row public.agent_plans;
  existing_event public.agent_plan_events; snapshot jsonb;
  request_hash text := md5('approve:' || target_plan_id::text || ':' || coalesce(target_note, ''));
begin
  if actor_id is null or not public.is_admin(actor_id) or target_plan_id is null or target_idempotency_key is null then
    raise exception 'invalid_agent_plan_approval' using errcode = '22023';
  end if;
  select * into existing_event from public.agent_plan_events where idempotency_key = target_idempotency_key for update;
  if found then
    if existing_event.request_hash <> request_hash or existing_event.event_type <> 'approved' then
      raise exception 'agent_plan_approval_idempotency_conflict' using errcode = '23505';
    end if;
    select * into plan_row from public.agent_plans where id = target_plan_id;
    return jsonb_build_object('plan', to_jsonb(plan_row), 'duplicate', true);
  end if;
  select * into plan_row from public.agent_plans where id = target_plan_id and owner_id = actor_id for update;
  if not found then raise exception 'agent_plan_not_found' using errcode = 'P0002'; end if;
  if plan_row.status <> 'draft' or plan_row.executor_model_id <> 'openai/gpt-5.6-luna' then
    raise exception 'agent_plan_not_approvable' using errcode = '22023';
  end if;
  snapshot := jsonb_build_object(
    'planId', plan_row.id, 'originalRequest', plan_row.original_request,
    'rewrittenInstruction', plan_row.rewritten_instruction, 'workflowType', plan_row.workflow_type,
    'growthProfileId', plan_row.growth_profile_id, 'steps', plan_row.steps,
    'allowedCapabilities', plan_row.allowed_capabilities, 'forbiddenActions', plan_row.forbidden_actions,
    'expectedArtifacts', plan_row.expected_artifacts, 'plannerModelId', plan_row.selected_model_id,
    'executorModelId', plan_row.executor_model_id, 'modelRoute', plan_row.model_route,
    'estimatedUsage', jsonb_build_object('promptTokens', plan_row.estimated_prompt_tokens,
      'completionTokens', plan_row.estimated_completion_tokens, 'webSearchCalls', plan_row.estimated_web_search_calls,
      'estimatedCostUsd', plan_row.estimated_cost_usd), 'openclawInstruction', plan_row.openclaw_instruction,
    'approvedAt', now(), 'approvedBy', actor_id
  );
  update public.agent_plans set status = 'approved', approved_snapshot = snapshot,
    approved_by = actor_id, approved_at = now(), updated_at = now()
    where id = plan_row.id returning * into plan_row;
  insert into public.agent_plan_events (owner_id, plan_id, event_type, payload, idempotency_key, request_hash)
  values (actor_id, plan_row.id, 'approved', jsonb_build_object('note', left(coalesce(target_note, ''), 2000), 'snapshot', snapshot), target_idempotency_key, request_hash);
  return jsonb_build_object('plan', to_jsonb(plan_row), 'duplicate', false);
end;
$$;

create or replace function public.dispatch_agent_plan(
  target_plan_id uuid, target_idempotency_key uuid
) returns jsonb language plpgsql security definer set search_path = public as $$
declare actor_id uuid := auth.uid(); plan_row public.agent_plans; result jsonb;
begin
  if actor_id is null or not public.is_admin(actor_id) then raise exception 'invalid_agent_plan_dispatch' using errcode = '22023'; end if;
  select * into plan_row from public.agent_plans where id = target_plan_id and owner_id = actor_id for update;
  if not found or plan_row.executor_model_id <> 'openai/gpt-5.6-luna'
    or plan_row.approved_snapshot ->> 'plannerModelId' <> plan_row.selected_model_id
    or plan_row.approved_snapshot ->> 'executorModelId' <> plan_row.executor_model_id then
    raise exception 'agent_plan_executor_snapshot_invalid' using errcode = '22023';
  end if;
  -- The prior dispatcher owns all existing lifecycle and dependency mechanics.
  -- This replacement is intentionally equivalent except for the frozen executor.
  result := public.dispatch_agent_plan_legacy(target_plan_id, target_idempotency_key);
  update public.agent_orchestration_tasks set model_id = plan_row.executor_model_id
    where plan_id = plan_row.id;
  select jsonb_build_object('plan', to_jsonb(plan), 'run', to_jsonb(run),
    'tasks', coalesce((select jsonb_agg(to_jsonb(task) order by task.created_at)
      from public.agent_orchestration_tasks task where task.run_id = plan.run_id), '[]'::jsonb),
    'duplicate', coalesce((result ->> 'duplicate')::boolean, false))
  into result from public.agent_plans plan
  join public.agent_runs run on run.id = plan.run_id where plan.id = plan_row.id;
  return result;
end;
$$;

create or replace function public.claim_openclaw_agent_orchestration_task(
  target_owner_id uuid, target_worker text, target_lease_seconds integer default 300
) returns jsonb language plpgsql security definer set search_path = public as $$
declare selected public.agent_orchestration_tasks;
begin
  if not public.private_worker_access() or target_owner_id is null or nullif(trim(target_worker), '') is null or target_lease_seconds not between 30 and 1800 then
    raise exception 'private_worker_required' using errcode = '42501';
  end if;
  select task.* into selected from public.agent_orchestration_tasks task
    join public.agent_runs run on run.id = task.run_id
    join public.agent_plans plan on plan.id = task.plan_id
    join public.growth_profiles profile on profile.id = task.growth_profile_id
    where task.status = 'queued' and task.owner_id = target_owner_id and task.agent_provider = 'openclaw'
      and task.model_id = plan.executor_model_id and plan.executor_model_id = 'openai/gpt-5.6-luna'
      and plan.status = 'dispatched' and run.status in ('queued', 'running') and run.scheduled_for <= now()
      and task.attempt_count < task.max_attempts and plan.model_route = 'selected-free'
      and profile.model_route = plan.model_route and profile.selected_model_id is not distinct from plan.selected_model_id
      and not profile.emergency_stop and task.approved_plan_snapshot = plan.approved_snapshot
      and run.approved_plan_snapshot = plan.approved_snapshot and task.input -> 'approvedPlan' = plan.approved_snapshot
      and plan.approved_snapshot ->> 'planId' = plan.id::text
      and plan.approved_snapshot ->> 'plannerModelId' = plan.selected_model_id
      and plan.approved_snapshot ->> 'executorModelId' = plan.executor_model_id
      and plan.approved_snapshot -> 'openclawInstruction' ->> 'planner' = 'hermes'
      and plan.approved_snapshot -> 'openclawInstruction' ->> 'executor' = 'openclaw'
      and plan.approved_snapshot -> 'openclawInstruction' ->> 'approvalRequired' = 'true'
      and plan.approved_snapshot -> 'openclawInstruction' -> 'delivery' ->> 'deliver' = 'false'
      and plan.approved_snapshot -> 'openclawInstruction' -> 'delivery' ->> 'bestEffortDeliver' = 'false'
      and plan.approved_snapshot -> 'openclawInstruction' -> 'delivery' ->> 'externalMessages' = 'false'
      and plan.approved_snapshot -> 'openclawInstruction' -> 'delivery' ->> 'publishing' = 'false'
      and plan.approved_snapshot -> 'openclawInstruction' -> 'delivery' ->> 'spending' = 'false'
      and plan.approved_snapshot -> 'openclawInstruction' -> 'delivery' ->> 'accountChanges' = 'false'
      and not exists (select 1 from public.agent_task_dependencies d join public.agent_orchestration_tasks p on p.id = d.depends_on_task_id where d.task_id = task.id and p.status <> 'succeeded')
    order by task.created_at for update of task skip locked limit 1;
  if not found then return null; end if;
  update public.agent_orchestration_tasks set status = 'leased', attempt_count = attempt_count + 1,
    leased_by = trim(target_worker), lease_expires_at = now() + make_interval(secs => target_lease_seconds),
    started_at = coalesce(started_at, now()), updated_at = now() where id = selected.id returning * into selected;
  update public.agent_runs set status = 'running', updated_at = now() where id = selected.run_id and status = 'queued';
  return to_jsonb(selected);
end;
$$;

create or replace function public.reserve_openclaw_model_usage(
  target_owner_id uuid, target_plan_id uuid, target_run_id uuid, target_task_id uuid,
  target_worker text, target_reservation_key uuid, target_reserved_cost numeric
) returns jsonb language plpgsql security definer set search_path = public as $$
declare task_row public.agent_orchestration_tasks; plan_row public.agent_plans;
  run_row public.agent_runs; profile public.growth_profiles; existing public.openclaw_model_usage_reservations; usage_day date;
begin
  if not public.private_worker_access() or target_owner_id is null or target_plan_id is null or target_run_id is null or target_task_id is null or nullif(trim(target_worker), '') is null or target_reservation_key is null or target_reserved_cost is null or target_reserved_cost < 0 then
    raise exception 'invalid_openclaw_usage_reservation' using errcode = '22023'; end if;
  select * into existing from public.openclaw_model_usage_reservations where reservation_key = target_reservation_key;
  if found then return to_jsonb(existing); end if;
  select * into task_row from public.agent_orchestration_tasks where id = target_task_id and owner_id = target_owner_id for update;
  select * into plan_row from public.agent_plans where id = target_plan_id and owner_id = target_owner_id for update;
  select * into run_row from public.agent_runs where id = target_run_id and owner_id = target_owner_id for update;
  select * into profile from public.growth_profiles where id = task_row.growth_profile_id and owner_id = target_owner_id for update;
  if task_row.id is null or plan_row.id is null or run_row.id is null or profile.id is null
    or task_row.plan_id <> target_plan_id or task_row.run_id <> target_run_id
    or task_row.status not in ('leased', 'running') or task_row.leased_by <> trim(target_worker)
    or task_row.lease_expires_at is null or task_row.lease_expires_at <= now()
    or plan_row.status <> 'dispatched' or run_row.status not in ('queued', 'running')
    or plan_row.model_route <> 'selected-free' or profile.emergency_stop
    or profile.selected_model_id is distinct from plan_row.selected_model_id
    or plan_row.executor_model_id <> 'openai/gpt-5.6-luna' or task_row.model_id <> plan_row.executor_model_id
    or task_row.approved_plan_snapshot is distinct from plan_row.approved_snapshot
    or run_row.approved_plan_snapshot is distinct from plan_row.approved_snapshot
    or task_row.input -> 'approvedPlan' is distinct from plan_row.approved_snapshot
    or plan_row.approved_snapshot ->> 'plannerModelId' is distinct from plan_row.selected_model_id
    or plan_row.approved_snapshot ->> 'executorModelId' is distinct from plan_row.executor_model_id then
    raise exception 'openclaw_usage_task_not_authorized' using errcode = '22023'; end if;
  usage_day := (now() at time zone profile.timezone)::date;
  insert into public.openclaw_model_usage_reservations (owner_id, growth_profile_id, plan_id, run_id, task_id, worker_id, reservation_key, model_id, reserved_cost, local_usage_date)
  values (target_owner_id, task_row.growth_profile_id, target_plan_id, target_run_id, target_task_id, trim(target_worker), target_reservation_key, task_row.model_id, target_reserved_cost, usage_day) returning * into existing;
  return to_jsonb(existing);
end;
$$;

-- Replacing a function is not an authorization grant. Reassert the retained
-- browser and private-worker execution boundary explicitly for every wrapper
-- added or replaced above.
revoke all on function public.create_agent_plan_with_executor(text,text,jsonb,jsonb,jsonb,jsonb,uuid,text,text,text,text,integer,integer,integer,numeric,jsonb,jsonb,uuid) from public, anon;
grant execute on function public.create_agent_plan_with_executor(text,text,jsonb,jsonb,jsonb,jsonb,uuid,text,text,text,text,integer,integer,integer,numeric,jsonb,jsonb,uuid) to authenticated;

revoke all on function public.approve_agent_plan(uuid,uuid,text) from public, anon, authenticated;
revoke all on function public.dispatch_agent_plan(uuid,uuid) from public, anon, authenticated;
grant execute on function public.approve_agent_plan(uuid,uuid,text) to authenticated;
grant execute on function public.dispatch_agent_plan(uuid,uuid) to authenticated;

revoke all on function public.claim_openclaw_agent_orchestration_task(uuid,text,integer) from public, anon, authenticated;
revoke all on function public.reserve_openclaw_model_usage(uuid,uuid,uuid,uuid,text,uuid,numeric) from public, anon, authenticated;
grant execute on function public.claim_openclaw_agent_orchestration_task(uuid,text,integer) to service_role;
grant execute on function public.reserve_openclaw_model_usage(uuid,uuid,uuid,uuid,text,uuid,numeric) to service_role;

revoke all on function public.dispatch_agent_plan_legacy(uuid, uuid) from public, anon, authenticated;
