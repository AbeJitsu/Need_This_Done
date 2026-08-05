-- Require evidence for every newly audited manual completion while preserving
-- untouched legacy completed rows that predate completion audit columns.

alter table public.ai_employee_work_items
  drop constraint ai_employee_work_items_completion_state_check;

alter table public.ai_employee_work_items
  add constraint ai_employee_work_items_completion_state_check check (
    (status = 'completed' and (
      (
        completed_by is not null
        and completed_at is not null
        and completion_idempotency_key is not null
        and length(trim(completion_notes)) > 0
      )
      or
      (completed_by is null and completed_at is null and completion_notes is null and completion_idempotency_key is null)
    ))
    or
    (status <> 'completed' and completed_by is null and completed_at is null and completion_notes is null and completion_idempotency_key is null)
  );

create or replace function public.complete_ai_employee_work_item(
  target_work_item_id uuid,
  target_completion_notes text,
  target_idempotency_key uuid
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor_id uuid := auth.uid();
  current_work public.ai_employee_work_items;
  normalized_notes text := nullif(trim(target_completion_notes), '');
begin
  if actor_id is null
    or normalized_notes is null
    or length(normalized_notes) > 4000 then
    raise exception 'invalid_completion' using errcode = '22023';
  end if;

  select * into current_work
  from public.ai_employee_work_items
  where completion_idempotency_key = target_idempotency_key;

  if found then
    if current_work.id <> target_work_item_id
      or current_work.completed_by <> actor_id
      or current_work.completion_notes is distinct from normalized_notes then
      raise exception 'idempotency_conflict' using errcode = '23505';
    end if;
    return to_jsonb(current_work) || jsonb_build_object('duplicate', true);
  end if;

  select work.* into current_work
  from public.ai_employee_work_items as work
  join public.ai_employees as employee on employee.id = work.employee_id
  join public.customer_memberships as membership
    on membership.customer_id = employee.customer_id
    and membership.user_id = actor_id
  where work.id = target_work_item_id
    and work.status = 'approved'
    and membership.role in ('owner', 'manager')
  for update of work;

  if not found then
    raise exception 'not_approved_or_forbidden' using errcode = '42501';
  end if;

  update public.ai_employee_work_items
  set status = 'completed',
      completed_by = actor_id,
      completed_at = now(),
      completion_notes = normalized_notes,
      completion_idempotency_key = target_idempotency_key
  where id = target_work_item_id
  returning * into current_work;

  return to_jsonb(current_work) || jsonb_build_object('duplicate', false);
end;
$$;
