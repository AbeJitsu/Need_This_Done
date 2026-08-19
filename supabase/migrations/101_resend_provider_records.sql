-- Resend-specific durable records. Transactional and prospecting credentials
-- stay isolated; these tables retain only provider references and metadata.

create table public.resend_transactional_messages (
  id uuid primary key default gen_random_uuid(),
  operation_id uuid not null unique references public.provider_operations(id) on delete restrict,
  project_id uuid references public.projects(id) on delete set null,
  recipient_hash text not null,
  subject text not null,
  provider_message_id text unique,
  status text not null default 'pending' check (status in ('pending','accepted','delivered','bounced','failed_retryable','failed_permanent')),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.resend_transactional_events (
  id uuid primary key default gen_random_uuid(),
  message_id uuid references public.resend_transactional_messages(id) on delete set null,
  receipt_id uuid not null unique references public.provider_webhook_receipts(id) on delete restrict,
  event_type text not null, occurred_at timestamptz not null default now(), metadata jsonb not null default '{}'::jsonb
);
alter table public.resend_transactional_messages enable row level security;
alter table public.resend_transactional_events enable row level security;
revoke all on table public.resend_transactional_messages, public.resend_transactional_events from public, anon, authenticated;

create or replace function public.record_resend_transactional_message(
  target_operation_id uuid, target_project_id uuid, target_recipient_hash text,
  target_subject text, target_provider_message_id text, target_status text
) returns jsonb language plpgsql security definer set search_path = public as $$
declare result public.resend_transactional_messages;
begin
  if auth.role() <> 'service_role' or target_operation_id is null or nullif(trim(target_recipient_hash), '') is null
    or nullif(trim(target_subject), '') is null or target_status not in ('pending','accepted','delivered','bounced','failed_retryable','failed_permanent') then
    raise exception 'transactional_message_not_authorized' using errcode = '42501';
  end if;
  insert into public.resend_transactional_messages (operation_id, project_id, recipient_hash, subject, provider_message_id, status)
  values (target_operation_id, target_project_id, trim(target_recipient_hash), trim(target_subject), nullif(trim(target_provider_message_id), ''), target_status)
  on conflict (operation_id) do update set provider_message_id = coalesce(excluded.provider_message_id, public.resend_transactional_messages.provider_message_id), status = excluded.status, updated_at = now()
  returning * into result;
  return to_jsonb(result);
end;
$$;
revoke all on function public.record_resend_transactional_message(uuid,uuid,text,text,text,text) from public, anon, authenticated;
grant execute on function public.record_resend_transactional_message(uuid,uuid,text,text,text,text) to service_role;

create or replace function public.record_resend_transactional_event(
  target_receipt_id uuid, target_provider_message_id text, target_event_type text, target_occurred_at timestamptz default now()
) returns jsonb language plpgsql security definer set search_path = public as $$
declare message_row public.resend_transactional_messages; result public.resend_transactional_events;
begin
  if auth.role() <> 'service_role' or target_receipt_id is null or nullif(trim(target_event_type), '') is null then
    raise exception 'transactional_event_not_authorized' using errcode = '42501';
  end if;
  select * into message_row from public.resend_transactional_messages where provider_message_id = nullif(trim(target_provider_message_id), '') limit 1;
  insert into public.resend_transactional_events (message_id, receipt_id, event_type, occurred_at)
  values (message_row.id, target_receipt_id, trim(target_event_type), coalesce(target_occurred_at, now())) returning * into result;
  if result.message_id is not null then
    update public.resend_transactional_messages set status = case when target_event_type = 'email.delivered' then 'delivered' when target_event_type like '%bounced%' then 'bounced' else status end, updated_at = now() where id = result.message_id;
  end if;
  update public.provider_webhook_receipts set status = 'processed', processed_at = now() where id = target_receipt_id;
  return to_jsonb(result);
end;
$$;
revoke all on function public.record_resend_transactional_event(uuid,text,text,timestamptz) from public, anon, authenticated;
grant execute on function public.record_resend_transactional_event(uuid,text,text,timestamptz) to service_role;
