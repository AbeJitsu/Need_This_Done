-- Fail closed at the durable worker boundary.
--
-- Purpose: scheduled content must not be claimable early, and an approved
-- OpenClaw completion must retain the exact model reported by Gateway together
-- with non-empty provider usage. This is additive and compatible with hosted
-- schema 095 until separately reviewed/applied there.
-- Verification: planner RLS tests cover early scheduling and provenance.
-- Rollback: leave these audit columns and use a forward migration only.

alter table public.agent_orchestration_tasks
  add column if not exists actual_model_id text,
  add column if not exists provider_usage jsonb not null default '{}'::jsonb;

alter table public.agent_orchestration_tasks
  add constraint agent_orchestration_tasks_provider_usage_object_check
  check (jsonb_typeof(provider_usage) = 'object');

-- A dispatched plan is executable immediately unless its caller deliberately
-- chooses a later instant.  Keep that instant with the durable run instead of
-- inferring it from a browser clock or a transient worker message.
alter table public.agent_runs
  add column if not exists scheduled_for timestamptz;

update public.agent_runs set scheduled_for = coalesce(scheduled_for, created_at, now())
where scheduled_for is null;

alter table public.agent_runs
  alter column scheduled_for set default now(),
  alter column scheduled_for set not null;

create or replace function public.claim_openclaw_agent_orchestration_task(
  target_owner_id uuid,
  target_worker text,
  target_lease_seconds integer default 300
)
returns jsonb language plpgsql security definer set search_path = public as $$
declare selected public.agent_orchestration_tasks;
begin
  if not public.private_worker_access() or target_owner_id is null
    or nullif(trim(target_worker), '') is null or target_lease_seconds not between 30 and 1800 then
    raise exception 'private_worker_required' using errcode = '42501';
  end if;

  update public.agent_orchestration_tasks task set status = 'queued', leased_by = null,
    lease_expires_at = null, updated_at = now()
  where task.status = 'leased' and task.lease_expires_at < now() and task.plan_id is not null;

  select task.* into selected
  from public.agent_orchestration_tasks task
  join public.agent_runs run on run.id = task.run_id
  join public.agent_plans plan on plan.id = task.plan_id
  where task.status = 'queued' and task.owner_id = target_owner_id and task.plan_id is not null
    and task.agent_provider = 'openclaw' and task.model_id = plan.selected_model_id
    and plan.status = 'dispatched' and run.plan_id = plan.id and run.status in ('queued', 'running')
    and run.scheduled_for <= now()
    and task.attempt_count < task.max_attempts
    and not exists (
      select 1 from public.content_schedules schedule
      where schedule.run_id = run.id and schedule.status <> 'cancelled' and schedule.scheduled_for > now()
    )
    and not exists (
      select 1 from public.growth_profiles profile
      where profile.id = task.growth_profile_id and profile.emergency_stop
    )
    and not exists (
      select 1 from public.agent_task_dependencies dependency
      join public.agent_orchestration_tasks prerequisite on prerequisite.id = dependency.depends_on_task_id
      where dependency.task_id = task.id and prerequisite.status <> 'succeeded'
    )
  order by task.created_at for update of task skip locked limit 1;
  if not found then return null; end if;
  update public.agent_orchestration_tasks set status = 'leased', attempt_count = attempt_count + 1,
    leased_by = trim(target_worker), lease_expires_at = now() + make_interval(secs => target_lease_seconds),
    started_at = coalesce(started_at, now()), updated_at = now() where id = selected.id returning * into selected;
  update public.agent_runs set status = 'running', updated_at = now() where id = selected.run_id and status = 'queued';
  insert into public.agent_run_events (owner_id, run_id, task_id, event_type, payload)
  values (selected.owner_id, selected.run_id, selected.id, 'leased', jsonb_build_object('workerId', trim(target_worker), 'openclaw', true));
  return to_jsonb(selected);
end;
$$;

create or replace function public.record_openclaw_task_provenance(
  target_task_id uuid, target_worker text, target_actual_model_id text, target_provider_usage jsonb
)
returns jsonb language plpgsql security definer set search_path = public as $$
declare task_row public.agent_orchestration_tasks;
begin
  if not public.private_worker_access() or target_task_id is null or nullif(trim(target_worker), '') is null
    or nullif(trim(target_actual_model_id), '') is null or jsonb_typeof(target_provider_usage) <> 'object'
    or target_provider_usage = '{}'::jsonb then
    raise exception 'invalid_openclaw_task_provenance' using errcode = '22023';
  end if;
  select * into task_row from public.agent_orchestration_tasks where id = target_task_id for update;
  if not found or task_row.plan_id is null or task_row.agent_provider <> 'openclaw'
    or task_row.model_id <> trim(target_actual_model_id) or task_row.status not in ('leased', 'running')
    or task_row.leased_by <> trim(target_worker) or task_row.lease_expires_at is null or task_row.lease_expires_at <= now() then
    raise exception 'openclaw_task_provenance_not_authorized' using errcode = '22023';
  end if;
  update public.agent_orchestration_tasks set actual_model_id = trim(target_actual_model_id),
    provider_usage = target_provider_usage, updated_at = now() where id = task_row.id returning * into task_row;
  return to_jsonb(task_row);
end;
$$;

revoke all on function public.record_openclaw_task_provenance(uuid,text,text,jsonb) from public, anon, authenticated;
grant execute on function public.record_openclaw_task_provenance(uuid,text,text,jsonb) to service_role;

-- Reconciliation, exact-model provenance, and task completion must share one
-- transaction.  Calling the prior three RPCs from the HTTP route could leave
-- a reconciled reservation behind when provenance or completion failed.
create or replace function public.complete_openclaw_task_with_provenance(
  target_task_id uuid,
  target_worker text,
  target_status text,
  target_output jsonb,
  target_error text,
  target_artifacts jsonb,
  target_model_reservation_key uuid,
  target_model_actual_cost numeric,
  target_actual_model_id text,
  target_provider_usage jsonb,
  target_prospecting jsonb default null
)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  task_row public.agent_orchestration_tasks;
  reservation_row public.openclaw_model_usage_reservations;
  result jsonb;
begin
  if not public.private_worker_access()
    or target_task_id is null or nullif(trim(target_worker), '') is null
    or target_status not in ('succeeded', 'failed')
    or target_model_reservation_key is null or target_model_actual_cost is null or target_model_actual_cost < 0
    or nullif(trim(target_actual_model_id), '') is null
    or jsonb_typeof(target_provider_usage) is distinct from 'object'
    or target_provider_usage = '{}'::jsonb then
    raise exception 'invalid_atomic_openclaw_completion' using errcode = '22023';
  end if;

  select * into task_row from public.agent_orchestration_tasks where id = target_task_id for update;
  if not found or task_row.plan_id is null or task_row.agent_provider <> 'openclaw'
    or task_row.model_id <> trim(target_actual_model_id)
    or task_row.status not in ('leased', 'running')
    or task_row.leased_by <> trim(target_worker)
    or task_row.lease_expires_at is null or task_row.lease_expires_at <= now() then
    raise exception 'atomic_openclaw_completion_not_authorized' using errcode = '22023';
  end if;

  select * into reservation_row from public.openclaw_model_usage_reservations
  where reservation_key = target_model_reservation_key for update;
  if not found or reservation_row.owner_id <> task_row.owner_id
    or reservation_row.task_id <> task_row.id or reservation_row.plan_id <> task_row.plan_id
    or reservation_row.model_id <> task_row.model_id or reservation_row.worker_id <> trim(target_worker) then
    raise exception 'atomic_openclaw_reservation_not_authorized' using errcode = '22023';
  end if;

  if reservation_row.status = 'reserved' then
    update public.openclaw_model_usage_reservations set actual_cost = target_model_actual_cost,
      provider_usage = target_provider_usage, status = 'reconciled', reconciled_at = now()
    where id = reservation_row.id;
  elsif reservation_row.status <> 'reconciled'
    or reservation_row.actual_cost is distinct from target_model_actual_cost
    or reservation_row.provider_usage is distinct from target_provider_usage then
    raise exception 'atomic_openclaw_reservation_conflict' using errcode = '22023';
  end if;

  perform public.record_openclaw_task_provenance(
    target_task_id, target_worker, target_actual_model_id, target_provider_usage
  );
  result := public.complete_openclaw_orchestration_task(
    target_task_id, target_worker, target_status, target_output, target_error,
    target_artifacts, target_model_reservation_key, target_prospecting
  );
  return result;
end;
$$;

revoke all on function public.complete_openclaw_task_with_provenance(uuid,text,text,jsonb,text,jsonb,uuid,numeric,text,jsonb,jsonb) from public, anon, authenticated;
grant execute on function public.complete_openclaw_task_with_provenance(uuid,text,text,jsonb,text,jsonb,uuid,numeric,text,jsonb,jsonb) to service_role;
