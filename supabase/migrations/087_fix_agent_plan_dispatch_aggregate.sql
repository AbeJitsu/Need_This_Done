-- Fix the dispatch result query so the PL/pgSQL task variable cannot be
-- confused with the SQL table alias. The transaction remains all-or-nothing.

create or replace function public.dispatch_agent_plan(
  target_plan_id uuid,
  target_idempotency_key uuid
)
returns jsonb language plpgsql security definer set search_path = public
as $$
declare
  actor_id uuid := auth.uid();
  existing_event public.agent_plan_events;
  plan_row public.agent_plans;
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

  select coalesce(jsonb_agg(to_jsonb(queued_task) order by queued_task.created_at), '[]'::jsonb)
    into tasks
    from public.agent_orchestration_tasks as queued_task
    where queued_task.run_id = run_row.id;
  return jsonb_build_object('plan', to_jsonb(plan_row), 'run', to_jsonb(run_row), 'tasks', tasks, 'duplicate', false);
end;
$$;
