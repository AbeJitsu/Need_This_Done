-- Calendar operations are operator-confirmed server actions. OAuth tokens are
-- never copied into these records or exposed to browser roles.

create table public.calendar_operation_references (
  id uuid primary key default gen_random_uuid(),
  operation_id uuid not null unique references public.provider_operations(id) on delete restrict,
  project_id uuid not null references public.projects(id) on delete restrict,
  calendar_token_id uuid references public.google_calendar_tokens(id) on delete restrict,
  external_event_id text,
  action text not null check (action in ('create','update','cancel','delete')),
  status text not null default 'pending' check (status in ('pending','accepted','succeeded','failed_retryable','failed_permanent','cancelled','reconciled')),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
alter table public.calendar_operation_references enable row level security;
revoke all on table public.calendar_operation_references from public, anon, authenticated;

create or replace function public.record_calendar_operation_reference(
  target_operation_id uuid, target_project_id uuid, target_calendar_token_id uuid,
  target_external_event_id text, target_action text, target_status text
) returns jsonb language plpgsql security definer set search_path = public as $$
declare result public.calendar_operation_references;
begin
  if auth.role() <> 'service_role' or target_operation_id is null or target_project_id is null
    or target_action not in ('create','update','cancel','delete') then
    raise exception 'calendar_operation_not_authorized' using errcode = '42501';
  end if;
  insert into public.calendar_operation_references (operation_id, project_id, calendar_token_id, external_event_id, action, status)
  values (target_operation_id, target_project_id, target_calendar_token_id, nullif(trim(target_external_event_id), ''), target_action, target_status)
  on conflict (operation_id) do update set external_event_id = coalesce(excluded.external_event_id, public.calendar_operation_references.external_event_id), status = excluded.status, updated_at = now()
  returning * into result;
  return to_jsonb(result);
end;
$$;
revoke all on function public.record_calendar_operation_reference(uuid,uuid,uuid,text,text,text) from public, anon, authenticated;
grant execute on function public.record_calendar_operation_reference(uuid,uuid,uuid,text,text,text) to service_role;
