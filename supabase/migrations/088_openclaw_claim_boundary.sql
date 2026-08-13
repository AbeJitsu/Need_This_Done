-- The bridge must claim only tasks materialized from an approved plan. The
-- older claim_agent_orchestration_task function remains for the rollback
-- worker/test contract and is not used by the OpenClaw bridge route.

create or replace function public.claim_openclaw_agent_orchestration_task(
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
  where status = 'leased' and lease_expires_at < now() and plan_id is not null;

  select task.* into selected
  from public.agent_orchestration_tasks task
  join public.agent_runs run on run.id = task.run_id
  join public.agent_plans plan on plan.id = task.plan_id
  where task.status = 'queued'
    and task.owner_id = target_owner_id
    and task.plan_id is not null
    and task.agent_provider = 'openclaw'
    and task.model_id = plan.selected_model_id
    and plan.status = 'dispatched'
    and run.plan_id = plan.id
    and run.status in ('queued', 'running')
    and task.attempt_count < task.max_attempts
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
  set status = 'leased', attempt_count = attempt_count + 1,
      leased_by = trim(target_worker),
      lease_expires_at = now() + make_interval(secs => target_lease_seconds),
      started_at = coalesce(started_at, now()), updated_at = now()
  where id = selected.id
  returning * into selected;

  update public.agent_runs set status = 'running', updated_at = now()
  where id = selected.run_id and status = 'queued';
  insert into public.agent_run_events (owner_id, run_id, task_id, event_type, payload)
  values (selected.owner_id, selected.run_id, selected.id, 'leased', jsonb_build_object('workerId', trim(target_worker), 'openclaw', true));
  return to_jsonb(selected);
end;
$$;

revoke all on function public.claim_openclaw_agent_orchestration_task(uuid,text,integer) from public, anon, authenticated;
grant execute on function public.claim_openclaw_agent_orchestration_task(uuid,text,integer) to service_role;
