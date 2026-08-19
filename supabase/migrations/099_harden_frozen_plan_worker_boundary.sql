-- Finish the frozen-plan worker boundary.
-- Purpose: retire legacy planned-task mutation paths, make dispatch timing
-- durable, and safely return expired leased/running planned tasks to the queue.
-- This is additive/forward-only and has not been applied to hosted Supabase.

alter table public.agent_runs
  add column if not exists scheduled_for timestamptz;

update public.agent_runs
  set scheduled_for = coalesce(scheduled_for, created_at, now())
  where scheduled_for is null;

alter table public.agent_runs
  alter column scheduled_for set default now(),
  alter column scheduled_for set not null;

-- Planned tasks are never completed through the older multi-RPC path. Their
-- service-role grants are removed; the atomic provenance completion function
-- from 098 is now the only callable boundary for a frozen plan. Historical
-- reads remain unchanged and the older implementations remain available only
-- to the atomic security-definer function that calls them internally.

-- Reclaim both abandoned leases and abandoned running tasks. Never reclaim a
-- completed/cancelled row and preserve the attempt budget as the hard stop.
update public.agent_orchestration_tasks task
  set status = 'queued', leased_by = null, lease_expires_at = null,
      updated_at = now(), last_error = coalesce(task.last_error, 'Worker lease expired before completion.')
  from public.agent_runs run
  where task.run_id = run.id and task.plan_id is not null
    and task.status in ('leased', 'running')
    and task.lease_expires_at < now()
    and task.attempt_count < task.max_attempts
    and run.status not in ('cancelled', 'failed', 'succeeded');

-- Keep the historical implementations private to this migration's atomic
-- functions.  A service role may still complete a genuinely historical task,
-- but cannot bypass the frozen-plan provenance/reconciliation transaction.
alter function public.complete_agent_orchestration_task(uuid,text,text,jsonb,text,jsonb)
  rename to complete_agent_orchestration_task_internal;
alter function public.complete_openclaw_orchestration_task(uuid,text,text,jsonb,text,jsonb,uuid,jsonb)
  rename to complete_openclaw_orchestration_task_internal;
alter function public.record_openclaw_task_provenance(uuid,text,text,jsonb)
  rename to record_openclaw_task_provenance_internal;
alter function public.reconcile_openclaw_model_usage(uuid,numeric,jsonb)
  rename to reconcile_openclaw_model_usage_internal;

revoke all on function public.complete_agent_orchestration_task_internal(uuid,text,text,jsonb,text,jsonb) from public, anon, authenticated, service_role;
revoke all on function public.complete_openclaw_orchestration_task_internal(uuid,text,text,jsonb,text,jsonb,uuid,jsonb) from public, anon, authenticated, service_role;
revoke all on function public.record_openclaw_task_provenance_internal(uuid,text,text,jsonb) from public, anon, authenticated, service_role;
revoke all on function public.reconcile_openclaw_model_usage_internal(uuid,numeric,jsonb) from public, anon, authenticated, service_role;

create function public.complete_agent_orchestration_task(
  target_task_id uuid, target_worker text, target_status text, target_output jsonb default null,
  target_error text default null, target_artifacts jsonb default '[]'::jsonb
)
returns jsonb language plpgsql security definer set search_path = public as $$
declare task_plan_id uuid;
begin
  select plan_id into task_plan_id from public.agent_orchestration_tasks where id = target_task_id;
  if task_plan_id is not null then
    raise exception 'planned_task_requires_atomic_completion' using errcode = '22023';
  end if;
  return public.complete_agent_orchestration_task_internal(
    target_task_id, target_worker, target_status, target_output, target_error, target_artifacts
  );
end;
$$;

create function public.complete_openclaw_orchestration_task(
  target_task_id uuid, target_worker text, target_status text, target_output jsonb default null,
  target_error text default null, target_artifacts jsonb default '[]'::jsonb,
  target_model_reservation_key uuid default null, target_prospecting jsonb default null
)
returns jsonb language plpgsql security definer set search_path = public as $$
declare task_plan_id uuid;
begin
  select plan_id into task_plan_id from public.agent_orchestration_tasks where id = target_task_id;
  if task_plan_id is not null then
    raise exception 'planned_task_requires_atomic_completion' using errcode = '22023';
  end if;
  return public.complete_openclaw_orchestration_task_internal(
    target_task_id, target_worker, target_status, target_output, target_error,
    target_artifacts, target_model_reservation_key, target_prospecting
  );
end;
$$;

create function public.record_openclaw_task_provenance(
  target_task_id uuid, target_worker text, target_actual_model_id text, target_provider_usage jsonb
)
returns jsonb language plpgsql security definer set search_path = public as $$
begin
  if target_task_id is null or nullif(trim(target_worker), '') is null
    or nullif(trim(target_actual_model_id), '') is null
    or jsonb_typeof(target_provider_usage) is distinct from 'object'
    or target_provider_usage = '{}'::jsonb then
    raise exception 'invalid_openclaw_task_provenance' using errcode = '22023';
  end if;
  raise exception 'planned_task_requires_atomic_completion' using errcode = '22023';
end;
$$;

create function public.reconcile_openclaw_model_usage(
  target_reservation_key uuid, target_actual_cost numeric, target_provider_usage jsonb default '{}'::jsonb
)
returns jsonb language plpgsql security definer set search_path = public as $$
declare task_plan_id uuid;
begin
  select task.plan_id into task_plan_id
  from public.openclaw_model_usage_reservations reservation
  join public.agent_orchestration_tasks task on task.id = reservation.task_id
  where reservation.reservation_key = target_reservation_key;
  if task_plan_id is not null then
    raise exception 'planned_task_requires_atomic_completion' using errcode = '22023';
  end if;
  return public.reconcile_openclaw_model_usage_internal(
    target_reservation_key, target_actual_cost, target_provider_usage
  );
end;
$$;

-- Recreate the internal OpenClaw completion after the legacy agent function
-- was renamed. It remains callable only by this migration's security-definer
-- operations, never through PostgREST.
create or replace function public.complete_openclaw_orchestration_task_internal(
  target_task_id uuid, target_worker text, target_status text, target_output jsonb default null,
  target_error text default null, target_artifacts jsonb default '[]'::jsonb,
  target_model_reservation_key uuid default null, target_prospecting jsonb default null
)
returns jsonb language plpgsql security definer set search_path = public as $$
declare result jsonb; task_row public.agent_orchestration_tasks; artifact_row public.agent_artifacts; prospecting_result jsonb;
begin
  if not public.private_worker_access() then
    raise exception 'private_worker_required' using errcode = '42501';
  end if;
  result := public.complete_agent_orchestration_task_internal(
    target_task_id, target_worker, target_status, target_output, target_error, target_artifacts
  );
  if target_status = 'succeeded' and target_prospecting is not null then
    select * into task_row from public.agent_orchestration_tasks where id = target_task_id;
    select * into artifact_row from public.agent_artifacts where task_id = target_task_id and artifact_type = 'research_dossier'
    order by created_at desc limit 1;
    if not found then raise exception 'openclaw_prospecting_artifact_required' using errcode = '22023'; end if;
    prospecting_result := public.record_openclaw_prospecting_result(
      target_task_id, target_worker, task_row.model_id, artifact_row.id, target_model_reservation_key, target_prospecting
    );
    result := result || jsonb_build_object('prospecting', prospecting_result);
  end if;
  return result;
end;
$$;

-- Rebind the atomic path to the private implementations above. This remains
-- idempotent for an already-reconciled reservation only when all recorded
-- values agree, so a mismatched callback fails without partial mutation.
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

  perform public.record_openclaw_task_provenance_internal(
    target_task_id, target_worker, target_actual_model_id, target_provider_usage
  );
  result := public.complete_openclaw_orchestration_task_internal(
    target_task_id, target_worker, target_status, target_output, target_error,
    target_artifacts, target_model_reservation_key, target_prospecting
  );
  return result;
end;
$$;

-- A signed bridge failure before the Gateway call has no model usage to
-- reconcile.  It is nevertheless one locked transaction, distinct from a
-- provider-invoked completion, and cannot be reached through a legacy RPC.
create function public.abort_openclaw_task_before_provider(
  target_task_id uuid, target_worker text, target_error text default null
)
returns jsonb language plpgsql security definer set search_path = public as $$
declare task_row public.agent_orchestration_tasks;
begin
  if not public.private_worker_access() or target_task_id is null or nullif(trim(target_worker), '') is null then
    raise exception 'invalid_openclaw_pre_provider_abort' using errcode = '22023';
  end if;
  select * into task_row from public.agent_orchestration_tasks where id = target_task_id for update;
  if not found or task_row.plan_id is null or task_row.agent_provider <> 'openclaw'
    or task_row.status not in ('leased', 'running') or task_row.leased_by <> trim(target_worker)
    or task_row.lease_expires_at is null or task_row.lease_expires_at <= now() then
    raise exception 'openclaw_pre_provider_abort_not_authorized' using errcode = '22023';
  end if;
  return public.complete_agent_orchestration_task_internal(
    target_task_id, target_worker, 'failed', null,
    coalesce(nullif(trim(target_error), ''), 'Gateway was not invoked; task aborted before provider execution.'), '[]'::jsonb
  );
end;
$$;

revoke all on function public.complete_agent_orchestration_task(uuid,text,text,jsonb,text,jsonb) from public, anon, authenticated;
revoke all on function public.complete_openclaw_orchestration_task(uuid,text,text,jsonb,text,jsonb,uuid,jsonb) from public, anon, authenticated;
revoke all on function public.record_openclaw_task_provenance(uuid,text,text,jsonb) from public, anon, authenticated;
revoke all on function public.reconcile_openclaw_model_usage(uuid,numeric,jsonb) from public, anon, authenticated;
revoke all on function public.abort_openclaw_task_before_provider(uuid,text,text) from public, anon, authenticated;
grant execute on function public.complete_agent_orchestration_task(uuid,text,text,jsonb,text,jsonb) to service_role;
grant execute on function public.complete_openclaw_orchestration_task(uuid,text,text,jsonb,text,jsonb,uuid,jsonb) to service_role;
grant execute on function public.reconcile_openclaw_model_usage(uuid,numeric,jsonb) to service_role;
grant execute on function public.abort_openclaw_task_before_provider(uuid,text,text) to service_role;
