-- Durable, service-role-only provider operation and signed webhook ledger.
-- No browser/PostgREST role receives table or RPC access.

create table public.provider_operations (
  id uuid primary key default gen_random_uuid(),
  provider text not null check (provider in ('resend_transactional','resend_prospecting','google_calendar','stripe')),
  operation_type text not null,
  idempotency_key text not null,
  status text not null default 'pending' check (status in ('pending','accepted','succeeded','failed_retryable','failed_permanent','cancelled','reconciled')),
  provider_reference text,
  request_metadata jsonb not null default '{}'::jsonb check (jsonb_typeof(request_metadata) = 'object'),
  response_metadata jsonb not null default '{}'::jsonb check (jsonb_typeof(response_metadata) = 'object'),
  last_error text,
  attempted_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (provider, idempotency_key)
);

create table public.provider_webhook_receipts (
  id uuid primary key default gen_random_uuid(),
  provider text not null check (provider in ('resend_transactional','resend_prospecting','stripe')),
  provider_event_id text not null,
  payload_sha256 text not null check (payload_sha256 ~ '^[a-f0-9]{64}$'),
  signature_verified boolean not null,
  status text not null default 'received' check (status in ('received','processed','failed_retryable','failed_permanent')),
  received_at timestamptz not null default now(),
  processed_at timestamptz,
  failure_reason text,
  unique (provider, provider_event_id)
);

alter table public.provider_operations enable row level security;
alter table public.provider_webhook_receipts enable row level security;
revoke all on table public.provider_operations, public.provider_webhook_receipts from public, anon, authenticated;

create or replace function public.upsert_provider_operation(
  target_provider text, target_operation_type text, target_idempotency_key text,
  target_status text, target_provider_reference text default null,
  target_request_metadata jsonb default '{}'::jsonb, target_response_metadata jsonb default '{}'::jsonb,
  target_error text default null
) returns jsonb language plpgsql security definer set search_path = public as $$
declare result public.provider_operations;
begin
  if auth.role() <> 'service_role' or nullif(trim(target_provider), '') is null
    or nullif(trim(target_operation_type), '') is null or nullif(trim(target_idempotency_key), '') is null
    or jsonb_typeof(target_request_metadata) <> 'object' or jsonb_typeof(target_response_metadata) <> 'object' then
    raise exception 'provider_operation_not_authorized' using errcode = '42501';
  end if;
  insert into public.provider_operations (provider, operation_type, idempotency_key, status, provider_reference, request_metadata, response_metadata, last_error, attempted_at, completed_at)
  values (trim(target_provider), trim(target_operation_type), trim(target_idempotency_key), target_status, nullif(trim(target_provider_reference), ''), target_request_metadata, target_response_metadata, nullif(trim(target_error), ''), now(), case when target_status in ('succeeded','failed_permanent','cancelled','reconciled') then now() else null end)
  on conflict (provider, idempotency_key) do update set
    status = excluded.status, provider_reference = coalesce(excluded.provider_reference, public.provider_operations.provider_reference),
    response_metadata = excluded.response_metadata, last_error = excluded.last_error, attempted_at = now(),
    completed_at = case when excluded.status in ('succeeded','failed_permanent','cancelled','reconciled') then now() else public.provider_operations.completed_at end,
    updated_at = now()
  returning * into result;
  return to_jsonb(result);
end;
$$;

create or replace function public.record_provider_webhook_receipt(
  target_provider text, target_provider_event_id text, target_payload_sha256 text, target_signature_verified boolean
) returns jsonb language plpgsql security definer set search_path = public as $$
declare result public.provider_webhook_receipts;
declare was_inserted boolean := false;
begin
  if auth.role() <> 'service_role' or nullif(trim(target_provider), '') is null
    or nullif(trim(target_provider_event_id), '') is null or target_payload_sha256 !~ '^[a-f0-9]{64}$' then
    raise exception 'provider_webhook_receipt_not_authorized' using errcode = '42501';
  end if;
  insert into public.provider_webhook_receipts (provider, provider_event_id, payload_sha256, signature_verified)
  values (trim(target_provider), trim(target_provider_event_id), target_payload_sha256, target_signature_verified)
  on conflict (provider, provider_event_id) do nothing
  returning * into result;
  was_inserted := found;
  if not was_inserted then
    select * into result from public.provider_webhook_receipts
      where provider = trim(target_provider) and provider_event_id = trim(target_provider_event_id);
  end if;
  return jsonb_build_object('receipt', to_jsonb(result), 'duplicate', not was_inserted);
end;
$$;

revoke all on function public.upsert_provider_operation(text,text,text,text,text,jsonb,jsonb,text) from public, anon, authenticated;
revoke all on function public.record_provider_webhook_receipt(text,text,text,boolean) from public, anon, authenticated;
grant execute on function public.upsert_provider_operation(text,text,text,text,text,jsonb,jsonb,text) to service_role;
grant execute on function public.record_provider_webhook_receipt(text,text,text,boolean) to service_role;
