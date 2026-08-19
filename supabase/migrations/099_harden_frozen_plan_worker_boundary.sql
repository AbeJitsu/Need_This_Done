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

revoke all on function public.complete_agent_orchestration_task(uuid,text,text,jsonb,text,jsonb) from public, anon, authenticated;
revoke all on function public.complete_openclaw_orchestration_task(uuid,text,text,jsonb,text,jsonb,uuid,jsonb) from public, anon, authenticated;
revoke all on function public.record_openclaw_task_provenance(uuid,text,text,jsonb) from public, anon, authenticated;
