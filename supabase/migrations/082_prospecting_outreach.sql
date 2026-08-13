-- Prospecting and approval-based outreach foundation.
-- All rows are operator-owned and all provider side effects remain outside the
-- database. Messages must be approved before a sender may act on them.

create table public.growth_profiles (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete restrict,
  name text not null default 'Growth profile',
  target_market text not null,
  geography text not null,
  business_size text not null default '',
  pain_signals jsonb not null default '[]'::jsonb,
  exclusion_rules jsonb not null default '[]'::jsonb,
  offer text not null,
  sender_name text not null,
  sender_email text not null,
  daily_prospect_cap integer not null default 10 check (daily_prospect_cap between 1 and 100),
  daily_send_cap integer not null default 10 check (daily_send_cap between 1 and 100),
  working_hours_start time not null default '09:00',
  working_hours_end time not null default '17:00',
  timezone text not null default 'America/New_York',
  follow_up_days integer[] not null default '{3,7}' check (array_length(follow_up_days, 1) is null or array_length(follow_up_days, 1) <= 6),
  model_route text not null default 'openrouter/free',
  fallback_model text not null default '',
  emergency_stop boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (owner_id)
);

create table public.prospects (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.growth_profiles(id) on delete cascade,
  company_name text not null,
  contact_name text,
  contact_title text,
  email text,
  website_url text not null,
  deduplication_key text not null,
  icp_match_score integer not null default 0 check (icp_match_score between 0 and 100),
  icp_match_reason text not null default '',
  outreach_status text not null default 'new' check (outreach_status in ('new','researching','drafted','approved','contacted','replied','bounced','unsubscribed','not_a_fit','closed')),
  suppression_status text not null default 'clear' check (suppression_status in ('clear','suppressed')),
  discovered_at timestamptz not null default now(),
  last_contacted_at timestamptz,
  last_replied_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (profile_id, deduplication_key)
);

create table public.prospect_sources (
  id uuid primary key default gen_random_uuid(),
  prospect_id uuid not null references public.prospects(id) on delete cascade,
  source_url text not null,
  source_type text not null default 'public_web',
  evidence jsonb not null default '[]'::jsonb,
  contact_path text,
  email_status text not null default 'unknown' check (email_status in ('unknown','public','verified','invalid')),
  discovered_by text not null default 'openclaw',
  created_at timestamptz not null default now(),
  unique (prospect_id, source_url)
);

create table public.outreach_messages (
  id uuid primary key default gen_random_uuid(),
  prospect_id uuid not null references public.prospects(id) on delete cascade,
  profile_id uuid not null references public.growth_profiles(id) on delete cascade,
  campaign text not null default 'default',
  sequence_step integer not null default 1 check (sequence_step between 1 and 20),
  subject text not null,
  body text not null,
  personalization_evidence jsonb not null default '[]'::jsonb,
  approval_status text not null default 'pending' check (approval_status in ('pending','approved','rejected','deferred','cancelled','sent')),
  sender_email text not null,
  recipient_email text not null,
  provider_message_id text,
  idempotency_key uuid not null unique,
  approved_by uuid references auth.users(id) on delete set null,
  approved_at timestamptz,
  sent_at timestamptz,
  replied_at timestamptz,
  bounced_at timestamptz,
  unsubscribed_at timestamptz,
  follow_up_eligible boolean not null default false,
  next_action_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.suppression_records (
  id uuid primary key default gen_random_uuid(),
  normalized_address text not null unique,
  reason text not null check (reason in ('unsubscribe','bounce','do_not_contact','manual')),
  source_message_id uuid references public.outreach_messages(id) on delete set null,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table public.agent_tasks (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.growth_profiles(id) on delete cascade,
  task_type text not null check (task_type in ('discover_prospects','research_prospect','draft_message','send_approved_message','sync_sender_events')),
  status text not null default 'queued' check (status in ('queued','leased','succeeded','failed','cancelled')),
  input jsonb not null default '{}'::jsonb,
  output jsonb,
  attempt_count integer not null default 0 check (attempt_count >= 0),
  max_attempts integer not null default 3 check (max_attempts between 1 and 10),
  idempotency_key uuid not null unique,
  leased_by text,
  lease_expires_at timestamptz,
  last_error text,
  model_name text,
  prompt_tokens integer,
  completion_tokens integer,
  cost numeric(8,4) not null default 0 check (cost >= 0),
  created_at timestamptz not null default now(),
  started_at timestamptz,
  completed_at timestamptz,
  updated_at timestamptz not null default now()
);

create table public.agent_task_events (
  id bigint generated always as identity primary key,
  task_id uuid not null references public.agent_tasks(id) on delete cascade,
  event_type text not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table public.worker_callback_nonces (
  nonce text primary key,
  created_at timestamptz not null default now()
);

create table public.sender_events (
  id uuid primary key default gen_random_uuid(),
  message_id uuid references public.outreach_messages(id) on delete set null,
  event_type text not null check (event_type in ('delivered','bounced','replied','unsubscribed')),
  provider_event_id text not null unique,
  provider_message_id text,
  address text,
  payload jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table public.prospect_outcomes (
  id uuid primary key default gen_random_uuid(),
  prospect_id uuid not null references public.prospects(id) on delete cascade,
  message_id uuid references public.outreach_messages(id) on delete set null,
  outcome_type text not null check (outcome_type in ('reply','meeting','qualified','not_a_fit','customer','note')),
  notes text not null default '',
  occurred_at timestamptz not null default now(),
  recorded_by uuid references auth.users(id) on delete set null,
  idempotency_key uuid not null unique
);

create index prospects_profile_status_idx on public.prospects (profile_id, outreach_status, created_at desc);
create index outreach_messages_review_idx on public.outreach_messages (profile_id, approval_status, created_at desc);
create index agent_tasks_queue_idx on public.agent_tasks (status, created_at);
create index sender_events_message_idx on public.sender_events (message_id, occurred_at desc);

alter table public.growth_profiles enable row level security;
alter table public.prospects enable row level security;
alter table public.prospect_sources enable row level security;
alter table public.outreach_messages enable row level security;
alter table public.suppression_records enable row level security;
alter table public.agent_tasks enable row level security;
alter table public.agent_task_events enable row level security;
alter table public.worker_callback_nonces enable row level security;
alter table public.sender_events enable row level security;
alter table public.prospect_outcomes enable row level security;

create policy "admins read growth profiles" on public.growth_profiles for select using (public.is_admin(auth.uid()));
create policy "admins manage growth profiles" on public.growth_profiles for all using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));
create policy "admins read prospects" on public.prospects for select using (public.is_admin(auth.uid()));
create policy "admins manage prospects" on public.prospects for all using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));
create policy "admins read prospect sources" on public.prospect_sources for select using (public.is_admin(auth.uid()));
create policy "admins manage prospect sources" on public.prospect_sources for all using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));
create policy "admins read outreach" on public.outreach_messages for select using (public.is_admin(auth.uid()));
create policy "admins manage outreach" on public.outreach_messages for all using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));
create policy "admins read suppression" on public.suppression_records for select using (public.is_admin(auth.uid()));
create policy "admins manage suppression" on public.suppression_records for all using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));
create policy "admins read agent tasks" on public.agent_tasks for select using (public.is_admin(auth.uid()));
create policy "admins manage agent tasks" on public.agent_tasks for all using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));
create policy "admins read task events" on public.agent_task_events for select using (public.is_admin(auth.uid()));
create policy "admins insert task events" on public.agent_task_events for insert with check (public.is_admin(auth.uid()));
-- Callback nonces are intentionally service-role-only. The signed worker route
-- consumes them before applying a callback, preventing replay of a valid body.
create policy "admins read sender events" on public.sender_events for select using (public.is_admin(auth.uid()));
create policy "admins manage sender events" on public.sender_events for all using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));
create policy "admins read outcomes" on public.prospect_outcomes for select using (public.is_admin(auth.uid()));
create policy "admins manage outcomes" on public.prospect_outcomes for all using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

revoke all on table public.growth_profiles, public.prospects, public.prospect_sources,
  public.outreach_messages, public.suppression_records, public.agent_tasks,
  public.agent_task_events, public.sender_events, public.prospect_outcomes from anon;
grant select, insert, update, delete on table public.growth_profiles, public.prospects,
  public.prospect_sources, public.outreach_messages, public.suppression_records,
  public.agent_tasks, public.agent_task_events, public.worker_callback_nonces, public.sender_events,
  public.prospect_outcomes to authenticated;
revoke all on table public.worker_callback_nonces from anon, authenticated;
revoke delete, update on table public.agent_task_events, public.sender_events from authenticated;

create or replace function public.normalize_outreach_address(value text)
returns text language sql immutable set search_path = public
as $$ select lower(trim(value)) $$;

create or replace function public.upsert_discovered_prospect(
  target_profile_id uuid,
  target_company_name text,
  target_contact_name text,
  target_contact_title text,
  target_email text,
  target_website_url text,
  target_icp_match_score integer,
  target_icp_match_reason text,
  target_source_url text,
  target_evidence jsonb,
  target_contact_path text,
  target_email_status text,
  target_idempotency_key uuid
)
returns jsonb language plpgsql security definer set search_path = public
as $$
declare
  actor_id uuid := auth.uid();
  normalized_email text := public.normalize_outreach_address(target_email);
  normalized_website text := lower(regexp_replace(trim(target_website_url), '^https?://(www\\.)?', ''));
  dedup_key text := coalesce(nullif(normalized_email, ''), normalized_website);
  existing public.prospects;
  created public.prospects;
  suppression_exists boolean;
begin
  if actor_id is null or not public.is_admin(actor_id) then raise exception 'admin_required' using errcode = '42501'; end if;
  if target_idempotency_key is null or nullif(trim(target_company_name), '') is null or nullif(trim(target_website_url), '') is null
    or target_icp_match_score not between 0 and 100 or jsonb_typeof(target_evidence) <> 'array'
    or target_email_status not in ('unknown','public','verified','invalid') then
    raise exception 'invalid_prospect' using errcode = '22023';
  end if;
  select exists(select 1 from public.suppression_records where normalized_address = normalized_email) into suppression_exists;
  select * into existing from public.prospects where profile_id = target_profile_id and deduplication_key = dedup_key for update;
  if found then
    insert into public.prospect_sources (prospect_id, source_url, evidence, contact_path, email_status)
    values (existing.id, trim(target_source_url), target_evidence, nullif(trim(target_contact_path), ''), target_email_status)
    on conflict (prospect_id, source_url) do update set evidence = excluded.evidence, contact_path = excluded.contact_path, email_status = excluded.email_status;
    return to_jsonb(existing) || jsonb_build_object('duplicate', true, 'suppressed', existing.suppression_status = 'suppressed');
  end if;
  insert into public.prospects (profile_id, company_name, contact_name, contact_title, email, website_url, deduplication_key, icp_match_score, icp_match_reason, suppression_status)
  values (target_profile_id, trim(target_company_name), nullif(trim(target_contact_name), ''), nullif(trim(target_contact_title), ''), nullif(normalized_email, ''), trim(target_website_url), dedup_key, target_icp_match_score, trim(target_icp_match_reason), case when suppression_exists then 'suppressed' else 'clear' end)
  returning * into created;
  insert into public.prospect_sources (prospect_id, source_url, evidence, contact_path, email_status)
  values (created.id, trim(target_source_url), target_evidence, nullif(trim(target_contact_path), ''), target_email_status);
  return to_jsonb(created) || jsonb_build_object('duplicate', false, 'suppressed', suppression_exists);
end;
$$;

create or replace function public.record_outreach_decision(
  target_message_id uuid,
  target_decision text,
  target_subject text,
  target_body text,
  target_next_action_at timestamptz
)
returns jsonb language plpgsql security definer set search_path = public
as $$
declare
  actor_id uuid := auth.uid();
  current_message public.outreach_messages;
  profile_cap integer;
  approved_today integer;
begin
  if actor_id is null or not public.is_admin(actor_id) then raise exception 'admin_required' using errcode = '42501'; end if;
  if target_decision not in ('approve','reject','defer','cancel','edit') then raise exception 'invalid_outreach_decision' using errcode = '22023'; end if;
  select * into current_message from public.outreach_messages where id = target_message_id for update;
  if not found then raise exception 'message_not_found' using errcode = 'P0002'; end if;
  if target_decision = 'approve' and (current_message.recipient_email is null or current_message.approval_status not in ('pending','deferred')) then raise exception 'message_not_reviewable' using errcode = '22023'; end if;
  if target_decision = 'approve' then
    select daily_send_cap into profile_cap from public.growth_profiles where id = current_message.profile_id;
    select count(*)::integer into approved_today from public.outreach_messages where profile_id = current_message.profile_id and approved_at >= date_trunc('day', now());
    if approved_today >= coalesce(profile_cap, 10) then raise exception 'daily_send_cap_reached' using errcode = '22023'; end if;
  end if;
  update public.outreach_messages set
    subject = coalesce(nullif(trim(target_subject), ''), subject),
    body = coalesce(nullif(trim(target_body), ''), body),
    approval_status = case target_decision when 'approve' then 'approved' when 'reject' then 'rejected' when 'defer' then 'deferred' when 'cancel' then 'cancelled' else approval_status end,
    approved_by = case when target_decision = 'approve' then actor_id else approved_by end,
    approved_at = case when target_decision = 'approve' then now() else approved_at end,
    next_action_at = case when target_decision = 'defer' then target_next_action_at else next_action_at end,
    updated_at = now()
  where id = target_message_id
  returning * into current_message;
  update public.prospects set outreach_status = case when target_decision = 'approve' then 'approved' else outreach_status end, updated_at = now() where id = current_message.prospect_id;
  return to_jsonb(current_message);
end;
$$;

create or replace function public.claim_prospecting_task(target_worker text, target_lease_seconds integer default 300)
returns jsonb language plpgsql security definer set search_path = public
as $$
declare selected public.agent_tasks;
begin
  if auth.uid() is null or not public.is_admin(auth.uid()) or nullif(trim(target_worker), '') is null or target_lease_seconds not between 30 and 1800 then raise exception 'invalid_worker_claim' using errcode = '42501'; end if;
  update public.agent_tasks set status = 'queued', leased_by = null, lease_expires_at = null
    where status = 'leased' and lease_expires_at < now();
  select task.* into selected from public.agent_tasks as task join public.growth_profiles as profile on profile.id = task.profile_id where task.status = 'queued' and task.attempt_count < task.max_attempts and not profile.emergency_stop order by task.created_at for update of task skip locked limit 1;
  if not found then return null; end if;
  update public.agent_tasks set status = 'leased', attempt_count = attempt_count + 1, leased_by = target_worker, lease_expires_at = now() + make_interval(secs => target_lease_seconds), started_at = coalesce(started_at, now()), updated_at = now() where id = selected.id returning * into selected;
  insert into public.agent_task_events (task_id, event_type, payload) values (selected.id, 'leased', jsonb_build_object('worker', target_worker));
  return to_jsonb(selected);
end;
$$;

create or replace function public.record_sender_event(
  target_provider_event_id text,
  target_event_type text,
  target_provider_message_id text,
  target_address text,
  target_payload jsonb,
  target_occurred_at timestamptz
)
returns jsonb language plpgsql security definer set search_path = public
as $$
declare actor_id uuid := auth.uid(); event_row public.sender_events; message_row public.outreach_messages; normalized text := public.normalize_outreach_address(target_address);
begin
  if actor_id is null or not public.is_admin(actor_id) then raise exception 'admin_required' using errcode = '42501'; end if;
  if target_event_type not in ('delivered','bounced','replied','unsubscribed') or nullif(trim(target_provider_event_id), '') is null then raise exception 'invalid_sender_event' using errcode = '22023'; end if;
  select * into event_row from public.sender_events where provider_event_id = target_provider_event_id;
  if found then return to_jsonb(event_row) || jsonb_build_object('duplicate', true); end if;
  insert into public.sender_events (event_type, provider_event_id, provider_message_id, address, payload, occurred_at)
  values (target_event_type, trim(target_provider_event_id), nullif(trim(target_provider_message_id), ''), nullif(normalized, ''), coalesce(target_payload, '{}'::jsonb), coalesce(target_occurred_at, now())) returning * into event_row;
  select * into message_row from public.outreach_messages where provider_message_id = target_provider_message_id or recipient_email = normalized order by sent_at desc nulls last limit 1 for update;
  if found then
    update public.sender_events set message_id = message_row.id where id = event_row.id;
    update public.outreach_messages set approval_status = case when target_event_type = 'bounced' then 'sent' else approval_status end,
      sent_at = coalesce(sent_at, case when target_event_type = 'delivered' then now() else sent_at end),
      replied_at = case when target_event_type = 'replied' then now() else replied_at end,
      bounced_at = case when target_event_type = 'bounced' then now() else bounced_at end,
      unsubscribed_at = case when target_event_type = 'unsubscribed' then now() else unsubscribed_at end,
      follow_up_eligible = target_event_type = 'replied', updated_at = now() where id = message_row.id;
    update public.prospects set outreach_status = case when target_event_type = 'replied' then 'replied' when target_event_type = 'bounced' then 'bounced' when target_event_type = 'unsubscribed' then 'unsubscribed' else 'contacted' end, last_replied_at = case when target_event_type = 'replied' then now() else last_replied_at end, updated_at = now() where id = message_row.prospect_id;
  end if;
  if target_event_type in ('bounced','unsubscribed') and nullif(normalized, '') is not null then
    insert into public.suppression_records (normalized_address, reason, source_message_id, created_by) values (normalized, case when target_event_type = 'bounced' then 'bounce' else 'unsubscribe' end, message_row.id, actor_id) on conflict (normalized_address) do nothing;
  end if;
  return to_jsonb(event_row) || jsonb_build_object('duplicate', false);
end;
$$;

revoke all on function public.upsert_discovered_prospect(uuid,text,text,text,text,text,integer,text,text,jsonb,text,text,uuid) from public, anon;
revoke all on function public.record_outreach_decision(uuid,text,text,text,timestamptz) from public, anon;
revoke all on function public.claim_prospecting_task(text,integer) from public, anon;
revoke all on function public.record_sender_event(text,text,text,text,jsonb,timestamptz) from public, anon;
grant execute on function public.upsert_discovered_prospect(uuid,text,text,text,text,text,integer,text,text,jsonb,text,text,uuid) to authenticated;
grant execute on function public.record_outreach_decision(uuid,text,text,text,timestamptz) to authenticated;
grant execute on function public.claim_prospecting_task(text,integer) to authenticated;
grant execute on function public.record_sender_event(text,text,text,text,jsonb,timestamptz) to authenticated;

create trigger growth_profiles_updated_at before update on public.growth_profiles for each row execute function public.update_updated_at_column();
create trigger prospects_updated_at before update on public.prospects for each row execute function public.update_updated_at_column();
create trigger outreach_messages_updated_at before update on public.outreach_messages for each row execute function public.update_updated_at_column();
create trigger agent_tasks_updated_at before update on public.agent_tasks for each row execute function public.update_updated_at_column();
