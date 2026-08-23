-- Purpose: give every GitHub handoff and prospecting message exactly one
-- durable Resend operation, make provider acceptance/domain transitions atomic,
-- and add explicit unknown-acceptance and webhook-persistence recovery paths.
-- Impact: forward-only and data-preserving. Existing handoffs and outreach rows
-- are backfilled with safe identifier-only metadata; no address, body, note,
-- attachment, token, or raw webhook content is copied into provider records.
-- Verification: provider-workflow-recovery behavioral tests, retained schema
-- manifest, Supabase lint, and a disposable local reset through migration 106.
-- Rollback: disable callers first, then use a reviewed forward migration. Keep
-- the new operation links and historical records; do not delete recovery data.

alter table public.provider_operations
  drop constraint provider_operations_status_check,
  add constraint provider_operations_status_check check (
    status in (
      'pending', 'accepted', 'acceptance_unknown', 'succeeded',
      'failed_retryable', 'failed_permanent', 'cancelled', 'reconciled'
    )
  );

alter table public.resend_transactional_messages
  drop constraint resend_transactional_messages_status_check,
  add constraint resend_transactional_messages_status_check check (
    status in (
      'pending', 'accepted', 'acceptance_unknown', 'delivered', 'bounced',
      'failed_retryable', 'failed_permanent'
    )
  );

alter table public.project_github_handoffs
  drop constraint project_github_handoffs_notification_status_check,
  add constraint project_github_handoffs_notification_status_check check (
    notification_status in ('draft', 'pending', 'acceptance_unknown', 'sent', 'failed')
  ),
  add column notification_idempotency_key uuid not null default gen_random_uuid(),
  add column notification_operation_id uuid;

alter table public.outreach_messages
  drop constraint outreach_messages_approval_status_check,
  add constraint outreach_messages_approval_status_check check (
    approval_status in (
      'pending', 'approved', 'acceptance_unknown', 'rejected', 'deferred',
      'cancelled', 'sent'
    )
  ),
  add column provider_operation_id uuid;

update public.project_github_handoffs
set notification_operation_id = gen_random_uuid()
where notification_operation_id is null;

insert into public.provider_operations (
  id, provider, operation_type, idempotency_key, status, provider_reference,
  request_metadata, last_error, attempted_at, completed_at
)
select
  handoff.notification_operation_id,
  'resend_transactional',
  'github_handoff_notification',
  handoff.notification_idempotency_key::text,
  case handoff.notification_status
    when 'sent' then 'succeeded'
    when 'failed' then 'failed_retryable'
    else 'pending'
  end,
  handoff.notification_provider_id,
  jsonb_build_object('handoff_id', handoff.id, 'project_id', handoff.project_id),
  handoff.notification_error,
  case when handoff.notification_attempts > 0 then handoff.updated_at else null end,
  case when handoff.notification_status = 'sent' then handoff.notification_sent_at else null end
from public.project_github_handoffs as handoff;

update public.outreach_messages
set provider_operation_id = gen_random_uuid()
where provider_operation_id is null;

insert into public.provider_operations (
  id, provider, operation_type, idempotency_key, status, provider_reference,
  request_metadata, attempted_at, completed_at
)
select
  message.provider_operation_id,
  'resend_prospecting',
  'send_outreach_message',
  message.idempotency_key::text,
  case message.approval_status
    when 'sent' then 'succeeded'
    when 'cancelled' then 'cancelled'
    when 'rejected' then 'cancelled'
    else 'pending'
  end,
  message.provider_message_id,
  jsonb_build_object(
    'message_id', message.id,
    'profile_id', message.profile_id,
    'prospect_id', message.prospect_id
  ),
  case when message.sent_at is not null then message.sent_at else null end,
  case when message.approval_status in ('sent', 'cancelled', 'rejected')
    then coalesce(message.sent_at, message.updated_at)
    else null
  end
from public.outreach_messages as message;

alter table public.project_github_handoffs
  alter column notification_operation_id set not null,
  add constraint project_github_handoffs_notification_idempotency_key_key
    unique (notification_idempotency_key),
  add constraint project_github_handoffs_notification_operation_id_key
    unique (notification_operation_id),
  add constraint project_github_handoffs_notification_operation_id_fkey
    foreign key (notification_operation_id)
    references public.provider_operations(id) on delete restrict;

alter table public.outreach_messages
  alter column provider_operation_id set not null,
  add constraint outreach_messages_provider_operation_id_key
    unique (provider_operation_id),
  add constraint outreach_messages_provider_operation_id_fkey
    foreign key (provider_operation_id)
    references public.provider_operations(id) on delete restrict;

create or replace function public.manage_github_handoff_provider_operation()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'UPDATE' then
    if new.notification_idempotency_key is distinct from old.notification_idempotency_key
      or new.notification_operation_id is distinct from old.notification_operation_id then
      raise exception 'github_handoff_provider_link_immutable' using errcode = '22023';
    end if;
    return new;
  end if;

  if new.notification_operation_id is not null then
    raise exception 'github_handoff_provider_link_managed' using errcode = '42501';
  end if;
  if new.notification_idempotency_key is null then
    raise exception 'github_handoff_operation_key_required' using errcode = '23502';
  end if;

  new.notification_operation_id := gen_random_uuid();
  insert into public.provider_operations (
    id, provider, operation_type, idempotency_key, status, request_metadata
  ) values (
    new.notification_operation_id,
    'resend_transactional',
    'github_handoff_notification',
    new.notification_idempotency_key::text,
    'pending',
    jsonb_build_object('handoff_id', new.id, 'project_id', new.project_id)
  );
  return new;
end;
$$;

create or replace function public.manage_outreach_provider_operation()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'UPDATE' then
    if new.idempotency_key is distinct from old.idempotency_key
      or new.provider_operation_id is distinct from old.provider_operation_id then
      raise exception 'outreach_provider_link_immutable' using errcode = '22023';
    end if;
    return new;
  end if;

  if new.provider_operation_id is not null then
    raise exception 'outreach_provider_link_managed' using errcode = '42501';
  end if;
  if new.idempotency_key is null then
    raise exception 'outreach_operation_key_required' using errcode = '23502';
  end if;

  new.provider_operation_id := gen_random_uuid();
  insert into public.provider_operations (
    id, provider, operation_type, idempotency_key, status, request_metadata
  ) values (
    new.provider_operation_id,
    'resend_prospecting',
    'send_outreach_message',
    new.idempotency_key::text,
    'pending',
    jsonb_build_object(
      'message_id', new.id,
      'profile_id', new.profile_id,
      'prospect_id', new.prospect_id
    )
  );
  return new;
end;
$$;

create or replace function public.prevent_provider_operation_request_mutation()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.provider is distinct from old.provider
    or new.operation_type is distinct from old.operation_type
    or new.idempotency_key is distinct from old.idempotency_key
    or new.request_metadata is distinct from old.request_metadata then
    raise exception 'provider_operation_request_immutable' using errcode = '22023';
  end if;
  return new;
end;
$$;

create trigger github_handoff_provider_operation_link
  before insert or update on public.project_github_handoffs
  for each row execute function public.manage_github_handoff_provider_operation();

create trigger outreach_provider_operation_link
  before insert or update on public.outreach_messages
  for each row execute function public.manage_outreach_provider_operation();

create trigger provider_operations_request_immutable
  before update on public.provider_operations
  for each row execute function public.prevent_provider_operation_request_mutation();

create or replace function public.upsert_provider_operation(
  target_provider text, target_operation_type text, target_idempotency_key text,
  target_status text, target_provider_reference text default null,
  target_request_metadata jsonb default '{}'::jsonb,
  target_response_metadata jsonb default '{}'::jsonb,
  target_error text default null
) returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  result public.provider_operations;
  normalized_provider_reference text := nullif(trim(target_provider_reference), '');
begin
  if auth.role() <> 'service_role'
    or nullif(trim(target_provider), '') is null
    or nullif(trim(target_operation_type), '') is null
    or nullif(trim(target_idempotency_key), '') is null
    or target_status not in (
      'pending', 'accepted', 'acceptance_unknown', 'succeeded',
      'failed_retryable', 'failed_permanent', 'cancelled', 'reconciled'
    )
    or jsonb_typeof(target_request_metadata) <> 'object'
    or jsonb_typeof(target_response_metadata) <> 'object' then
    raise exception 'provider_operation_not_authorized' using errcode = '42501';
  end if;

  select * into result
  from public.provider_operations
  where provider = trim(target_provider)
    and idempotency_key = trim(target_idempotency_key)
  for update;

  if found then
    if result.operation_type <> trim(target_operation_type)
      or result.request_metadata <> target_request_metadata
      or (
        result.provider_reference is not null
        and normalized_provider_reference is not null
        and result.provider_reference <> normalized_provider_reference
      ) then
      raise exception 'provider_operation_replay_mismatch' using errcode = '22023';
    end if;
    if result.status in ('succeeded', 'failed_permanent', 'cancelled', 'reconciled') then
      return to_jsonb(result);
    end if;
    if result.status = 'acceptance_unknown' and target_status = 'acceptance_unknown' then
      return to_jsonb(result);
    end if;
    if result.provider in ('resend_transactional', 'resend_prospecting')
      and result.status = 'acceptance_unknown'
      and result.attempted_at <= now() - interval '24 hours'
      and target_status <> 'acceptance_unknown' then
      raise exception 'provider_acceptance_reconciliation_required' using errcode = '55000';
    end if;

    update public.provider_operations
    set status = target_status,
      provider_reference = coalesce(normalized_provider_reference, provider_operations.provider_reference),
      response_metadata = target_response_metadata,
      last_error = nullif(trim(target_error), ''),
      attempted_at = now(),
      completed_at = case
        when target_status in ('succeeded', 'failed_permanent', 'cancelled', 'reconciled') then now()
        else null
      end,
      updated_at = now()
    where id = result.id
    returning * into result;
  else
    insert into public.provider_operations (
      provider, operation_type, idempotency_key, status, provider_reference,
      request_metadata, response_metadata, last_error, attempted_at, completed_at
    ) values (
      trim(target_provider), trim(target_operation_type), trim(target_idempotency_key),
      target_status, normalized_provider_reference, target_request_metadata,
      target_response_metadata, nullif(trim(target_error), ''), now(),
      case when target_status in ('succeeded', 'failed_permanent', 'cancelled', 'reconciled')
        then now() else null end
    ) returning * into result;
  end if;

  return to_jsonb(result);
end;
$$;

create or replace function public.accept_resend_transactional_operation(
  target_operation_id uuid,
  target_project_id uuid,
  target_recipient_hash text,
  target_subject text,
  target_provider_message_id text
) returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  operation_row public.provider_operations;
  existing_message public.resend_transactional_messages;
  result public.resend_transactional_messages;
  normalized_recipient_hash text := nullif(trim(target_recipient_hash), '');
  normalized_subject text := nullif(trim(target_subject), '');
  normalized_provider_message_id text := nullif(trim(target_provider_message_id), '');
begin
  if auth.role() <> 'service_role'
    or target_operation_id is null
    or normalized_recipient_hash is null
    or normalized_subject is null
    or normalized_provider_message_id is null then
    raise exception 'transactional_message_not_authorized' using errcode = '42501';
  end if;

  select * into operation_row
  from public.provider_operations
  where id = target_operation_id
  for update;
  if not found
    or operation_row.provider <> 'resend_transactional'
    or operation_row.operation_type <> 'send_email'
    or (
      operation_row.provider_reference is not null
      and operation_row.provider_reference <> normalized_provider_message_id
    ) then
    raise exception 'transactional_message_mismatch' using errcode = '22023';
  end if;

  select * into existing_message
  from public.resend_transactional_messages
  where operation_id = target_operation_id
  for update;
  if found and (
    existing_message.project_id is distinct from target_project_id
    or existing_message.recipient_hash <> normalized_recipient_hash
    or existing_message.subject <> normalized_subject
    or (
      existing_message.provider_message_id is not null
      and existing_message.provider_message_id <> normalized_provider_message_id
    )
  ) then
    raise exception 'transactional_message_mismatch' using errcode = '22023';
  end if;

  update public.provider_operations
  set status = 'succeeded',
    provider_reference = normalized_provider_message_id,
    last_error = null,
    attempted_at = now(),
    completed_at = now(),
    updated_at = now()
  where id = target_operation_id;

  insert into public.resend_transactional_messages (
    operation_id, project_id, recipient_hash, subject, provider_message_id, status
  ) values (
    target_operation_id, target_project_id, normalized_recipient_hash,
    normalized_subject, normalized_provider_message_id, 'accepted'
  )
  on conflict (operation_id) do update
  set status = 'accepted', updated_at = now()
  returning * into result;
  return to_jsonb(result);
end;
$$;

create or replace function public.accept_github_handoff_operation(
  target_operation_id uuid,
  target_handoff_id uuid,
  target_recipient_hash text,
  target_subject text,
  target_provider_message_id text
) returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  operation_row public.provider_operations;
  handoff_row public.project_github_handoffs;
  existing_message public.resend_transactional_messages;
  result public.project_github_handoffs;
  normalized_recipient_hash text := nullif(trim(target_recipient_hash), '');
  normalized_subject text := nullif(trim(target_subject), '');
  normalized_provider_message_id text := nullif(trim(target_provider_message_id), '');
begin
  if auth.role() <> 'service_role'
    or target_operation_id is null
    or target_handoff_id is null
    or normalized_recipient_hash is null
    or normalized_subject is null
    or normalized_provider_message_id is null then
    raise exception 'github_handoff_acceptance_not_authorized' using errcode = '42501';
  end if;

  select * into operation_row
  from public.provider_operations
  where id = target_operation_id
  for update;
  select * into handoff_row
  from public.project_github_handoffs
  where id = target_handoff_id
  for update;
  if operation_row.id is null
    or handoff_row.id is null
    or handoff_row.notification_operation_id <> target_operation_id
    or operation_row.provider <> 'resend_transactional'
    or operation_row.operation_type <> 'github_handoff_notification'
    or (
      operation_row.provider_reference is not null
      and operation_row.provider_reference <> normalized_provider_message_id
    )
    or (
      handoff_row.notification_provider_id is not null
      and handoff_row.notification_provider_id <> normalized_provider_message_id
    ) then
    raise exception 'github_handoff_acceptance_mismatch' using errcode = '22023';
  end if;

  select * into existing_message
  from public.resend_transactional_messages
  where operation_id = target_operation_id
  for update;
  if found and (
    existing_message.project_id is distinct from handoff_row.project_id
    or existing_message.recipient_hash <> normalized_recipient_hash
    or existing_message.subject <> normalized_subject
    or (
      existing_message.provider_message_id is not null
      and existing_message.provider_message_id <> normalized_provider_message_id
    )
  ) then
    raise exception 'github_handoff_acceptance_mismatch' using errcode = '22023';
  end if;

  if handoff_row.notification_status = 'sent' then
    return to_jsonb(handoff_row);
  end if;

  update public.provider_operations
  set status = 'succeeded',
    provider_reference = normalized_provider_message_id,
    last_error = null,
    attempted_at = now(),
    completed_at = now(),
    updated_at = now()
  where id = target_operation_id;

  insert into public.resend_transactional_messages (
    operation_id, project_id, recipient_hash, subject, provider_message_id, status
  ) values (
    target_operation_id, handoff_row.project_id, normalized_recipient_hash,
    normalized_subject, normalized_provider_message_id, 'accepted'
  )
  on conflict (operation_id) do update
  set status = 'accepted', updated_at = now();

  update public.project_github_handoffs
  set notification_status = 'sent',
    notification_attempts = notification_attempts + 1,
    notification_sent_at = now(),
    notification_provider_id = normalized_provider_message_id,
    notification_error = null,
    updated_at = now()
  where id = target_handoff_id
  returning * into result;
  return to_jsonb(result);
end;
$$;

create or replace function public.accept_resend_prospecting_operation(
  target_operation_id uuid,
  target_message_id uuid,
  target_provider_message_id text
) returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  operation_row public.provider_operations;
  message_row public.outreach_messages;
  result public.outreach_messages;
  normalized_provider_message_id text := nullif(trim(target_provider_message_id), '');
begin
  if auth.role() <> 'service_role'
    or target_operation_id is null
    or target_message_id is null
    or normalized_provider_message_id is null then
    raise exception 'prospecting_acceptance_not_authorized' using errcode = '42501';
  end if;

  select * into operation_row
  from public.provider_operations
  where id = target_operation_id
  for update;
  select * into message_row
  from public.outreach_messages
  where id = target_message_id
  for update;
  if operation_row.id is null
    or message_row.id is null
    or message_row.provider_operation_id <> target_operation_id
    or operation_row.provider <> 'resend_prospecting'
    or operation_row.operation_type <> 'send_outreach_message'
    or (
      operation_row.provider_reference is not null
      and operation_row.provider_reference <> normalized_provider_message_id
    )
    or (
      message_row.provider_message_id is not null
      and message_row.provider_message_id <> normalized_provider_message_id
    ) then
    raise exception 'prospecting_acceptance_mismatch' using errcode = '22023';
  end if;
  if message_row.approval_status = 'sent' then
    return to_jsonb(message_row);
  end if;
  if message_row.approval_status not in ('approved', 'acceptance_unknown') then
    raise exception 'outreach_message_not_approved' using errcode = '55000';
  end if;

  update public.provider_operations
  set status = 'succeeded',
    provider_reference = normalized_provider_message_id,
    last_error = null,
    attempted_at = now(),
    completed_at = now(),
    updated_at = now()
  where id = target_operation_id;

  update public.outreach_messages
  set approval_status = 'sent',
    provider_message_id = normalized_provider_message_id,
    sent_at = coalesce(sent_at, now()),
    updated_at = now()
  where id = target_message_id
  returning * into result;
  return to_jsonb(result);
end;
$$;

create or replace function public.mark_resend_acceptance_unknown(
  target_operation_id uuid,
  target_error text
) returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  operation_row public.provider_operations;
begin
  if auth.role() <> 'service_role'
    or target_operation_id is null
    or nullif(trim(target_error), '') is null then
    raise exception 'provider_acceptance_unknown_not_authorized' using errcode = '42501';
  end if;
  select * into operation_row
  from public.provider_operations
  where id = target_operation_id
  for update;
  if not found
    or operation_row.provider not in ('resend_transactional', 'resend_prospecting')
    or operation_row.status in ('succeeded', 'failed_permanent', 'cancelled', 'reconciled') then
    raise exception 'provider_acceptance_unknown_mismatch' using errcode = '22023';
  end if;
  if operation_row.status = 'acceptance_unknown' then
    if operation_row.last_error is distinct from trim(target_error) then
      raise exception 'provider_acceptance_unknown_mismatch' using errcode = '22023';
    end if;
    return to_jsonb(operation_row);
  end if;

  update public.provider_operations
  set status = 'acceptance_unknown',
    last_error = trim(target_error),
    attempted_at = now(),
    completed_at = null,
    updated_at = now()
  where id = target_operation_id
  returning * into operation_row;
  update public.resend_transactional_messages
  set status = 'acceptance_unknown', updated_at = now()
  where operation_id = target_operation_id;
  update public.project_github_handoffs
  set notification_status = 'acceptance_unknown',
    notification_attempts = notification_attempts + 1,
    notification_error = trim(target_error),
    updated_at = now()
  where notification_operation_id = target_operation_id
    and notification_status <> 'sent';
  update public.outreach_messages
  set approval_status = 'acceptance_unknown', updated_at = now()
  where provider_operation_id = target_operation_id
    and approval_status <> 'sent';
  return to_jsonb(operation_row);
end;
$$;

create or replace function public.assert_provider_operation_retryable(
  target_operation_id uuid
) returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  operation_row public.provider_operations;
  retryable boolean;
begin
  if auth.role() <> 'service_role' or target_operation_id is null then
    raise exception 'provider_retry_not_authorized' using errcode = '42501';
  end if;
  select * into operation_row
  from public.provider_operations
  where id = target_operation_id;
  if not found then
    raise exception 'provider_operation_not_found' using errcode = 'P0002';
  end if;
  if operation_row.provider in ('resend_transactional', 'resend_prospecting')
    and operation_row.status = 'acceptance_unknown'
    and operation_row.attempted_at <= now() - interval '24 hours' then
    raise exception 'provider_acceptance_reconciliation_required' using errcode = '55000';
  end if;
  retryable := operation_row.status in ('pending', 'failed_retryable');
  return jsonb_build_object(
    'id', operation_row.id,
    'status', operation_row.status,
    'retryable', retryable
  );
end;
$$;

create or replace function public.reconcile_resend_provider_operation(
  target_operation_id uuid,
  target_resolution text,
  target_provider_message_id text default null
) returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  operation_row public.provider_operations;
  normalized_provider_message_id text := nullif(trim(target_provider_message_id), '');
begin
  if auth.role() <> 'service_role'
    or target_operation_id is null
    or target_resolution not in ('confirmed_accepted', 'confirmed_not_accepted')
    or (target_resolution = 'confirmed_accepted' and normalized_provider_message_id is null)
    or (target_resolution = 'confirmed_not_accepted' and normalized_provider_message_id is not null) then
    raise exception 'provider_reconciliation_not_authorized' using errcode = '42501';
  end if;
  select * into operation_row
  from public.provider_operations
  where id = target_operation_id
  for update;
  if found
    and operation_row.provider in ('resend_transactional', 'resend_prospecting')
    and target_resolution = 'confirmed_accepted'
    and operation_row.status = 'reconciled'
    and operation_row.response_metadata->>'reconciliation' = target_resolution
    and operation_row.provider_reference = normalized_provider_message_id then
    return to_jsonb(operation_row);
  end if;
  if found
    and operation_row.provider in ('resend_transactional', 'resend_prospecting')
    and target_resolution = 'confirmed_not_accepted'
    and operation_row.status = 'failed_retryable'
    and operation_row.response_metadata->>'reconciliation' = target_resolution
    and operation_row.provider_reference is null then
    return to_jsonb(operation_row);
  end if;
  if not found
    or operation_row.provider not in ('resend_transactional', 'resend_prospecting')
    or operation_row.status <> 'acceptance_unknown'
    or (
      operation_row.provider_reference is not null
      and normalized_provider_message_id is not null
      and operation_row.provider_reference <> normalized_provider_message_id
    ) then
    raise exception 'provider_reconciliation_mismatch' using errcode = '22023';
  end if;

  if target_resolution = 'confirmed_accepted' then
    update public.provider_operations
    set status = 'reconciled',
      provider_reference = normalized_provider_message_id,
      response_metadata = response_metadata || jsonb_build_object('reconciliation', target_resolution),
      last_error = null,
      completed_at = now(),
      updated_at = now()
    where id = target_operation_id
    returning * into operation_row;
    update public.resend_transactional_messages
    set status = 'accepted',
      provider_message_id = coalesce(provider_message_id, normalized_provider_message_id),
      updated_at = now()
    where operation_id = target_operation_id;
    update public.project_github_handoffs
    set notification_status = 'sent',
      notification_sent_at = coalesce(notification_sent_at, now()),
      notification_provider_id = coalesce(notification_provider_id, normalized_provider_message_id),
      notification_error = null,
      updated_at = now()
    where notification_operation_id = target_operation_id;
    update public.outreach_messages
    set approval_status = 'sent',
      provider_message_id = coalesce(provider_message_id, normalized_provider_message_id),
      sent_at = coalesce(sent_at, now()),
      updated_at = now()
    where provider_operation_id = target_operation_id;
  else
    update public.provider_operations
    set status = 'failed_retryable',
      response_metadata = response_metadata || jsonb_build_object('reconciliation', target_resolution),
      last_error = 'reconciled_confirmed_not_accepted',
      completed_at = null,
      updated_at = now()
    where id = target_operation_id
    returning * into operation_row;
    update public.resend_transactional_messages
    set status = 'failed_retryable', updated_at = now()
    where operation_id = target_operation_id;
    update public.project_github_handoffs
    set notification_status = 'failed',
      notification_error = 'reconciled_confirmed_not_accepted',
      updated_at = now()
    where notification_operation_id = target_operation_id;
    update public.outreach_messages
    set approval_status = 'approved', updated_at = now()
    where provider_operation_id = target_operation_id;
  end if;
  return to_jsonb(operation_row);
end;
$$;

create or replace function public.fail_provider_webhook_receipt(
  target_receipt_id uuid,
  target_failure_reason text,
  target_permanent boolean default false
) returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  result public.provider_webhook_receipts;
begin
  if auth.role() <> 'service_role'
    or target_receipt_id is null
    or nullif(trim(target_failure_reason), '') is null then
    raise exception 'provider_webhook_receipt_not_authorized' using errcode = '42501';
  end if;
  update public.provider_webhook_receipts
  set status = case when target_permanent then 'failed_permanent' else 'failed_retryable' end,
    failure_reason = trim(target_failure_reason),
    processed_at = case when target_permanent then now() else null end
  where id = target_receipt_id
  returning * into result;
  if result.id is null then
    raise exception 'provider_webhook_receipt_not_found' using errcode = 'P0002';
  end if;
  return to_jsonb(result);
end;
$$;

revoke all on function public.manage_github_handoff_provider_operation() from public, anon, authenticated, service_role;
revoke all on function public.manage_outreach_provider_operation() from public, anon, authenticated, service_role;
revoke all on function public.prevent_provider_operation_request_mutation() from public, anon, authenticated, service_role;
revoke all on function public.upsert_provider_operation(text,text,text,text,text,jsonb,jsonb,text) from public, anon, authenticated;
revoke all on function public.accept_resend_transactional_operation(uuid,uuid,text,text,text) from public, anon, authenticated;
revoke all on function public.accept_github_handoff_operation(uuid,uuid,text,text,text) from public, anon, authenticated;
revoke all on function public.accept_resend_prospecting_operation(uuid,uuid,text) from public, anon, authenticated;
revoke all on function public.mark_resend_acceptance_unknown(uuid,text) from public, anon, authenticated;
revoke all on function public.assert_provider_operation_retryable(uuid) from public, anon, authenticated;
revoke all on function public.reconcile_resend_provider_operation(uuid,text,text) from public, anon, authenticated;
revoke all on function public.fail_provider_webhook_receipt(uuid,text,boolean) from public, anon, authenticated;

grant execute on function public.upsert_provider_operation(text,text,text,text,text,jsonb,jsonb,text) to service_role;
grant execute on function public.accept_resend_transactional_operation(uuid,uuid,text,text,text) to service_role;
grant execute on function public.accept_github_handoff_operation(uuid,uuid,text,text,text) to service_role;
grant execute on function public.accept_resend_prospecting_operation(uuid,uuid,text) to service_role;
grant execute on function public.mark_resend_acceptance_unknown(uuid,text) to service_role;
grant execute on function public.assert_provider_operation_retryable(uuid) to service_role;
grant execute on function public.reconcile_resend_provider_operation(uuid,text,text) to service_role;
grant execute on function public.fail_provider_webhook_receipt(uuid,text,boolean) to service_role;

revoke all on table public.provider_operations,
  public.provider_webhook_receipts,
  public.resend_transactional_messages,
  public.resend_transactional_events
from public, anon, authenticated;

comment on column public.project_github_handoffs.notification_operation_id is
  'Managed one-to-one transactional Resend operation link; never supplied by a browser.';
comment on column public.outreach_messages.provider_operation_id is
  'Managed one-to-one prospecting Resend operation link; every retry uses the linked operation key.';
