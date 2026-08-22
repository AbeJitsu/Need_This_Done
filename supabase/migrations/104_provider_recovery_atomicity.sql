-- Provider recovery hardening: idempotency payloads are immutable, webhook
-- receipts remain retryable until persistence succeeds, and provider acceptance
-- plus the associated private reference is committed atomically.
--
-- Impact: additive/forward-only. Browser roles remain unable to read these
-- records or invoke the functions. Rollback: use a reviewed forward migration.

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

  select * into result from public.provider_operations
    where provider = trim(target_provider) and idempotency_key = trim(target_idempotency_key) for update;
  if found then
    if result.operation_type <> trim(target_operation_type) or result.request_metadata <> target_request_metadata then
      raise exception 'provider_operation_replay_mismatch' using errcode = '22023';
    end if;
    update public.provider_operations set
      status = target_status,
      provider_reference = coalesce(nullif(trim(target_provider_reference), ''), provider_operations.provider_reference),
      response_metadata = target_response_metadata,
      last_error = nullif(trim(target_error), ''), attempted_at = now(),
      completed_at = case when target_status in ('succeeded','failed_permanent','cancelled','reconciled') then now() else provider_operations.completed_at end,
      updated_at = now()
      where id = result.id returning * into result;
  else
    insert into public.provider_operations (provider, operation_type, idempotency_key, status, provider_reference, request_metadata, response_metadata, last_error, attempted_at, completed_at)
    values (trim(target_provider), trim(target_operation_type), trim(target_idempotency_key), target_status, nullif(trim(target_provider_reference), ''), target_request_metadata, target_response_metadata, nullif(trim(target_error), ''), now(), case when target_status in ('succeeded','failed_permanent','cancelled','reconciled') then now() else null end)
    returning * into result;
  end if;
  return to_jsonb(result);
end;
$$;

create or replace function public.record_provider_webhook_receipt(
  target_provider text, target_provider_event_id text, target_payload_sha256 text, target_signature_verified boolean
) returns jsonb language plpgsql security definer set search_path = public as $$
declare result public.provider_webhook_receipts;
begin
  if auth.role() <> 'service_role' or nullif(trim(target_provider), '') is null
    or nullif(trim(target_provider_event_id), '') is null or target_payload_sha256 !~ '^[a-f0-9]{64}$' then
    raise exception 'provider_webhook_receipt_not_authorized' using errcode = '42501';
  end if;
  select * into result from public.provider_webhook_receipts
    where provider = trim(target_provider) and provider_event_id = trim(target_provider_event_id) for update;
  if found then
    if result.payload_sha256 <> target_payload_sha256 or not result.signature_verified then
      raise exception 'provider_webhook_replay_mismatch' using errcode = '22023';
    end if;
    return jsonb_build_object('receipt', to_jsonb(result), 'duplicate', result.status in ('processed', 'failed_permanent'));
  end if;
  insert into public.provider_webhook_receipts (provider, provider_event_id, payload_sha256, signature_verified)
    values (trim(target_provider), trim(target_provider_event_id), target_payload_sha256, target_signature_verified)
    returning * into result;
  return jsonb_build_object('receipt', to_jsonb(result), 'duplicate', false);
end;
$$;

create or replace function public.complete_provider_webhook_receipt(target_receipt_id uuid)
returns jsonb language plpgsql security definer set search_path = public as $$
declare result public.provider_webhook_receipts;
begin
  if auth.role() <> 'service_role' or target_receipt_id is null then
    raise exception 'provider_webhook_receipt_not_authorized' using errcode = '42501';
  end if;
  update public.provider_webhook_receipts set status = 'processed', processed_at = now(), failure_reason = null
    where id = target_receipt_id returning * into result;
  if result.id is null then raise exception 'provider_webhook_receipt_not_found' using errcode = 'P0002'; end if;
  return to_jsonb(result);
end;
$$;

create or replace function public.accept_resend_transactional_operation(
  target_operation_id uuid, target_project_id uuid, target_recipient_hash text,
  target_subject text, target_provider_message_id text
) returns jsonb language plpgsql security definer set search_path = public as $$
declare operation_row public.provider_operations; result public.resend_transactional_messages;
begin
  if auth.role() <> 'service_role' or target_operation_id is null
    or nullif(trim(target_recipient_hash), '') is null or nullif(trim(target_subject), '') is null
    or nullif(trim(target_provider_message_id), '') is null then
    raise exception 'transactional_message_not_authorized' using errcode = '42501';
  end if;
  select * into operation_row from public.provider_operations where id = target_operation_id for update;
  if not found or operation_row.provider <> 'resend_transactional' or operation_row.operation_type <> 'send_email' then
    raise exception 'transactional_message_mismatch' using errcode = '22023';
  end if;
  update public.provider_operations set status = 'succeeded', provider_reference = trim(target_provider_message_id), attempted_at = now(), completed_at = now(), updated_at = now() where id = target_operation_id;
  insert into public.resend_transactional_messages (operation_id, project_id, recipient_hash, subject, provider_message_id, status)
    values (target_operation_id, target_project_id, trim(target_recipient_hash), trim(target_subject), trim(target_provider_message_id), 'accepted')
    on conflict (operation_id) do update set provider_message_id = excluded.provider_message_id, status = 'accepted', updated_at = now()
    returning * into result;
  return to_jsonb(result);
end;
$$;

create or replace function public.accept_calendar_operation(
  target_operation_id uuid, target_project_id uuid, target_calendar_token_id uuid,
  target_external_event_id text, target_action text
) returns jsonb language plpgsql security definer set search_path = public as $$
declare operation_row public.provider_operations; result public.calendar_operation_references;
begin
  if auth.role() <> 'service_role' or target_operation_id is null or target_project_id is null
    or target_action not in ('create','update','cancel','delete') or nullif(trim(target_external_event_id), '') is null then
    raise exception 'calendar_operation_not_authorized' using errcode = '42501';
  end if;
  select * into operation_row from public.provider_operations where id = target_operation_id for update;
  if not found or operation_row.provider <> 'google_calendar' or operation_row.operation_type <> target_action then
    raise exception 'calendar_operation_mismatch' using errcode = '22023';
  end if;
  update public.provider_operations set status = 'succeeded', provider_reference = trim(target_external_event_id), attempted_at = now(), completed_at = now(), updated_at = now() where id = target_operation_id;
  insert into public.calendar_operation_references (operation_id, project_id, calendar_token_id, external_event_id, action, status)
    values (target_operation_id, target_project_id, target_calendar_token_id, trim(target_external_event_id), target_action, 'succeeded')
    on conflict (operation_id) do update set external_event_id = excluded.external_event_id, status = 'succeeded', updated_at = now()
    returning * into result;
  return to_jsonb(result);
end;
$$;

create or replace function public.accept_website_improvement_invoice(
  target_operation_id uuid, target_project_id uuid, target_stripe_invoice_id text
) returns jsonb language plpgsql security definer set search_path = public as $$
declare operation_row public.provider_operations; result public.website_improvement_invoice_references;
begin
  if auth.role() <> 'service_role' or target_operation_id is null or target_project_id is null or nullif(trim(target_stripe_invoice_id), '') is null then
    raise exception 'invoice_reference_not_authorized' using errcode = '42501';
  end if;
  select * into operation_row from public.provider_operations where id = target_operation_id for update;
  if not found or operation_row.provider <> 'stripe' or operation_row.operation_type <> 'website_improvement_start_invoice' then
    raise exception 'invoice_reference_mismatch' using errcode = '22023';
  end if;
  update public.provider_operations set status = 'succeeded', provider_reference = trim(target_stripe_invoice_id), attempted_at = now(), completed_at = now(), updated_at = now() where id = target_operation_id;
  insert into public.website_improvement_invoice_references (operation_id, project_id, stripe_invoice_id, status)
    values (target_operation_id, target_project_id, trim(target_stripe_invoice_id), 'open')
    on conflict (operation_id) do update set stripe_invoice_id = excluded.stripe_invoice_id, status = 'open', updated_at = now()
    returning * into result;
  return to_jsonb(result);
end;
$$;

revoke all on function public.complete_provider_webhook_receipt(uuid), public.accept_resend_transactional_operation(uuid,uuid,text,text,text), public.accept_calendar_operation(uuid,uuid,uuid,text,text), public.accept_website_improvement_invoice(uuid,uuid,text) from public, anon, authenticated;
grant execute on function public.complete_provider_webhook_receipt(uuid), public.accept_resend_transactional_operation(uuid,uuid,text,text,text), public.accept_calendar_operation(uuid,uuid,uuid,text,text), public.accept_website_improvement_invoice(uuid,uuid,text) to service_role;
