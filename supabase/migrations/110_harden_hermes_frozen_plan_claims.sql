-- Harden the Hermes frozen-plan claim and pre-provider reservation boundary.
--
-- Purpose: the signed bridge must receive only the exact immutable snapshot
-- approved by the browser, on the reviewed free route. A profile/model change,
-- altered snapshot, stopped run, expired lease, or paid route must stop before
-- any Gateway invocation.
--
-- Impact: forward-only hardening of existing agent_plans, agent_runs, and
-- agent_orchestration_tasks. No table, queue, provider, or worker is added.
-- This migration has not been applied to hosted Supabase.
--
-- Verification: Hermes lifecycle and bridge tests cover the frozen snapshot,
-- exact model, free-route, stop, and expiry conditions. Rollback is a reviewed
-- forward migration; never reset hosted Supabase.

-- Migration 111 wraps this retained dispatcher to freeze a separate executor
-- model identity without duplicating its established lifecycle mechanics.
alter function public.dispatch_agent_plan(uuid, uuid) rename to dispatch_agent_plan_legacy;

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
    lease_expires_at = null, updated_at = now(),
    last_error = coalesce(task.last_error, 'Worker lease expired before completion.')
  from public.agent_runs run
  where task.run_id = run.id and task.plan_id is not null
    and task.status in ('leased', 'running') and task.lease_expires_at < now()
    and task.attempt_count < task.max_attempts
    and run.status not in ('cancelled', 'emergency_stopped', 'failed', 'succeeded');

  select task.* into selected
  from public.agent_orchestration_tasks task
  join public.agent_runs run on run.id = task.run_id
  join public.agent_plans plan on plan.id = task.plan_id
  join public.growth_profiles profile on profile.id = task.growth_profile_id
  where task.status = 'queued' and task.owner_id = target_owner_id and task.plan_id is not null
    and task.agent_provider = 'openclaw' and task.model_id = plan.selected_model_id
    and plan.status = 'dispatched' and run.plan_id = plan.id and run.status in ('queued', 'running')
    and run.scheduled_for <= now() and task.attempt_count < task.max_attempts
    and plan.model_route = 'selected-free'
    and profile.model_route = plan.model_route and profile.selected_model_id is not distinct from plan.selected_model_id
    and not profile.emergency_stop
    and task.approved_plan_snapshot = plan.approved_snapshot
    and run.approved_plan_snapshot = plan.approved_snapshot
    and task.input -> 'approvedPlan' = plan.approved_snapshot
    and task.input ->> 'planId' = plan.id::text
    and plan.approved_snapshot ->> 'planId' = plan.id::text
    and plan.approved_snapshot ->> 'selectedModelId' = plan.selected_model_id
    and plan.approved_snapshot ->> 'modelRoute' = 'selected-free'
    and plan.approved_snapshot -> 'openclawInstruction' ->> 'version' = '2'
    and plan.approved_snapshot -> 'openclawInstruction' ->> 'planner' = 'hermes'
    and plan.approved_snapshot -> 'openclawInstruction' ->> 'executor' = 'openclaw'
    and (plan.approved_snapshot -> 'openclawInstruction' ->> 'approvalRequired') = 'true'
    and (plan.approved_snapshot -> 'openclawInstruction' -> 'delivery' ->> 'deliver') = 'false'
    and (plan.approved_snapshot -> 'openclawInstruction' -> 'delivery' ->> 'bestEffortDeliver') = 'false'
    and (plan.approved_snapshot -> 'openclawInstruction' -> 'delivery' ->> 'externalMessages') = 'false'
    and (plan.approved_snapshot -> 'openclawInstruction' -> 'delivery' ->> 'publishing') = 'false'
    and (plan.approved_snapshot -> 'openclawInstruction' -> 'delivery' ->> 'spending') = 'false'
    and (plan.approved_snapshot -> 'openclawInstruction' -> 'delivery' ->> 'accountChanges') = 'false'
    and not exists (
      select 1 from public.content_schedules schedule
      where schedule.run_id = run.id and schedule.status <> 'cancelled' and schedule.scheduled_for > now()
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
    started_at = coalesce(started_at, now()), updated_at = now()
  where id = selected.id returning * into selected;
  update public.agent_runs set status = 'running', updated_at = now() where id = selected.run_id and status = 'queued';
  insert into public.agent_run_events (owner_id, run_id, task_id, event_type, payload)
  values (selected.owner_id, selected.run_id, selected.id, 'leased', jsonb_build_object('workerId', trim(target_worker), 'openclaw', true, 'hermes', true));
  return to_jsonb(selected);
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
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  task_row public.agent_orchestration_tasks;
  plan_row public.agent_plans;
  run_row public.agent_runs;
  profile public.growth_profiles;
  existing public.openclaw_model_usage_reservations;
  usage_day date;
begin
  if not public.private_worker_access()
    or target_owner_id is null or target_plan_id is null or target_run_id is null or target_task_id is null
    or nullif(trim(target_worker), '') is null or target_reservation_key is null
    or target_reserved_cost is null or target_reserved_cost < 0 then
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
  select * into plan_row from public.agent_plans
  where id = target_plan_id and owner_id = target_owner_id for update;
  select * into run_row from public.agent_runs
  where id = target_run_id and owner_id = target_owner_id for update;
  select * into profile from public.growth_profiles
  where id = task_row.growth_profile_id and owner_id = target_owner_id for update;
  if task_row.id is null or plan_row.id is null or run_row.id is null or profile.id is null
    or task_row.plan_id <> target_plan_id or task_row.run_id <> target_run_id
    or task_row.status not in ('leased', 'running') or task_row.leased_by <> trim(target_worker)
    or task_row.lease_expires_at is null or task_row.lease_expires_at <= now()
    or plan_row.status <> 'dispatched' or plan_row.run_id <> target_run_id
    or run_row.status not in ('queued', 'running')
    or plan_row.model_route <> 'selected-free'
    or profile.emergency_stop or profile.model_route <> plan_row.model_route
    or profile.selected_model_id is distinct from plan_row.selected_model_id
    or task_row.model_id <> plan_row.selected_model_id
    or task_row.approved_plan_snapshot is distinct from plan_row.approved_snapshot
    or run_row.approved_plan_snapshot is distinct from plan_row.approved_snapshot
    or task_row.input -> 'approvedPlan' is distinct from plan_row.approved_snapshot
    or task_row.input ->> 'planId' is distinct from plan_row.id::text
    or plan_row.approved_snapshot ->> 'planId' is distinct from plan_row.id::text
    or plan_row.approved_snapshot ->> 'selectedModelId' is distinct from plan_row.selected_model_id
    or plan_row.approved_snapshot ->> 'modelRoute' is distinct from 'selected-free'
    or plan_row.approved_snapshot -> 'openclawInstruction' ->> 'version' is distinct from '2'
    or plan_row.approved_snapshot -> 'openclawInstruction' ->> 'planner' is distinct from 'hermes'
    or plan_row.approved_snapshot -> 'openclawInstruction' ->> 'executor' is distinct from 'openclaw'
    or plan_row.approved_snapshot -> 'openclawInstruction' ->> 'approvalRequired' is distinct from 'true'
    or plan_row.approved_snapshot -> 'openclawInstruction' -> 'delivery' ->> 'deliver' is distinct from 'false'
    or plan_row.approved_snapshot -> 'openclawInstruction' -> 'delivery' ->> 'bestEffortDeliver' is distinct from 'false'
    or plan_row.approved_snapshot -> 'openclawInstruction' -> 'delivery' ->> 'externalMessages' is distinct from 'false'
    or plan_row.approved_snapshot -> 'openclawInstruction' -> 'delivery' ->> 'publishing' is distinct from 'false'
    or plan_row.approved_snapshot -> 'openclawInstruction' -> 'delivery' ->> 'spending' is distinct from 'false'
    or plan_row.approved_snapshot -> 'openclawInstruction' -> 'delivery' ->> 'accountChanges' is distinct from 'false' then
    raise exception 'openclaw_usage_task_not_authorized' using errcode = '22023';
  end if;

  usage_day := (now() at time zone profile.timezone)::date;
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
