-- Private two-business-per-day research suite.
--
-- Purpose: add durable, citation-backed prospect dossiers, an auditable shared
-- model-usage ledger, and service-role-only queue helpers for the signed
-- Mac-mini worker. This migration is additive: it does not activate a model,
-- sender, schedule, or hosted deployment.
--
-- Data handling: dossiers contain only public-business research and the
-- operator's proposed draft. Provider credentials never enter this schema.
--
-- Verification: local RLS tests exercise the private worker functions,
-- provider-usage reconciliation, duplicate handling, and sender isolation. Roll back by
-- disabling the worker and leaving the added records read-only; do not drop
-- tables until retained records have been reviewed separately.

alter table public.growth_profiles
  alter column sender_name drop not null,
  alter column sender_email drop not null,
  alter column sender_name set default '',
  alter column sender_email set default '',
  add column if not exists selected_model_id text,
  add column if not exists selected_model_rationale text not null default '',
  add column if not exists model_selected_at timestamptz;

alter table public.growth_profiles
  drop constraint if exists growth_profiles_selected_model_check;

alter table public.growth_profiles
  add constraint growth_profiles_selected_model_check
  check (
    (model_route = 'evaluation-required' and selected_model_id is null)
    or (
      model_route in ('selected-free', 'selected-deepseek-fallback')
      and nullif(trim(selected_model_id), '') is not null
      and nullif(trim(selected_model_rationale), '') is not null
    )
  );

create table public.model_benchmark_candidates (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.growth_profiles(id) on delete cascade,
  candidate_id text not null,
  provider_model_id text not null,
  candidate_kind text not null check (candidate_kind in ('free', 'deepseek-fallback')),
  catalog_metadata jsonb not null default '{}'::jsonb,
  is_active boolean not null default true,
  discovered_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (profile_id, candidate_id),
  unique (profile_id, provider_model_id)
);

create table public.model_usage_ledger (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.growth_profiles(id) on delete cascade,
  task_id uuid references public.agent_tasks(id) on delete set null,
  reservation_key uuid not null unique,
  usage_kind text not null check (usage_kind in ('benchmark', 'research')),
  model_id text not null,
  reserved_cost numeric not null check (reserved_cost >= 0),
  actual_cost numeric check (actual_cost >= 0),
  status text not null default 'reserved' check (status in ('reserved', 'reconciled', 'released')),
  local_usage_date date not null,
  provider_usage jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  reconciled_at timestamptz,
  check ((status = 'reserved' and actual_cost is null) or (status <> 'reserved' and actual_cost is not null))
);

create table public.prospect_dossiers (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.growth_profiles(id) on delete cascade,
  prospect_id uuid not null references public.prospects(id) on delete cascade,
  task_id uuid references public.agent_tasks(id) on delete set null,
  company_name text not null,
  official_website_url text not null,
  icp_reason text not null,
  observed_evidence jsonb not null default '[]'::jsonb,
  citations jsonb not null default '[]'::jsonb,
  recommended_offer_angle text not null,
  contact_path jsonb not null default '{}'::jsonb,
  suggested_subject text not null,
  suggested_body text not null,
  model_id text not null,
  review_status text not null default 'pending_review' check (review_status in ('pending_review', 'promoted', 'rejected')),
  promoted_message_id uuid references public.outreach_messages(id) on delete set null,
  reviewed_by uuid references auth.users(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (prospect_id)
);

create index model_benchmark_candidates_profile_idx on public.model_benchmark_candidates (profile_id, candidate_kind, is_active);
create index model_usage_ledger_profile_day_idx on public.model_usage_ledger (profile_id, local_usage_date, status);
create index prospect_dossiers_profile_review_idx on public.prospect_dossiers (profile_id, review_status, created_at desc);

alter table public.model_benchmark_candidates enable row level security;
alter table public.model_usage_ledger enable row level security;
alter table public.prospect_dossiers enable row level security;

create policy "admins read model benchmark candidates" on public.model_benchmark_candidates for select using (public.is_admin(auth.uid()));
create policy "admins manage model benchmark candidates" on public.model_benchmark_candidates for all using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));
create policy "admins read model usage ledger" on public.model_usage_ledger for select using (public.is_admin(auth.uid()));
create policy "admins manage model usage ledger" on public.model_usage_ledger for all using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));
create policy "admins read prospect dossiers" on public.prospect_dossiers for select using (public.is_admin(auth.uid()));
create policy "admins manage prospect dossiers" on public.prospect_dossiers for all using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

revoke all on table public.model_benchmark_candidates, public.model_usage_ledger, public.prospect_dossiers from anon;
grant select, insert, update, delete on table public.model_benchmark_candidates, public.model_usage_ledger, public.prospect_dossiers to authenticated;

-- The service-role-only functions below are called after the Next.js private
-- worker routes have validated the HMAC signature, timestamp, and nonce. The
-- check protects these functions even if an authenticated client discovers a
-- function name.
create or replace function public.private_worker_access()
returns boolean language sql stable set search_path = public
as $$
  select current_user = 'service_role'
    or coalesce(current_setting('request.jwt.claim.role', true), '') = 'service_role'
$$;

create or replace function public.claim_private_prospecting_task(
  target_worker text,
  target_lease_seconds integer default 300
)
returns jsonb language plpgsql security definer set search_path = public
as $$
declare selected public.agent_tasks;
begin
  if not public.private_worker_access()
    or nullif(trim(target_worker), '') is null
    or target_lease_seconds not between 30 and 1800 then
    raise exception 'private_worker_required' using errcode = '42501';
  end if;

  update public.agent_tasks
    set status = 'queued', leased_by = null, lease_expires_at = null, updated_at = now()
    where status = 'leased' and lease_expires_at < now();

  select task.* into selected
  from public.agent_tasks as task
  join public.growth_profiles as profile on profile.id = task.profile_id
  where task.status = 'queued'
    and task.attempt_count < task.max_attempts
    and task.task_type = 'discover_prospects'
    and not profile.emergency_stop
    and profile.model_route in ('selected-free', 'selected-deepseek-fallback')
    and nullif(trim(profile.selected_model_id), '') is not null
  order by task.created_at
  for update of task skip locked
  limit 1;

  if not found then return null; end if;

  update public.agent_tasks
    set status = 'leased', attempt_count = attempt_count + 1,
      leased_by = trim(target_worker),
      lease_expires_at = now() + make_interval(secs => target_lease_seconds),
      started_at = coalesce(started_at, now()), updated_at = now()
    where id = selected.id
    returning * into selected;

  insert into public.agent_task_events (task_id, event_type, payload)
    values (selected.id, 'leased', jsonb_build_object('worker', trim(target_worker), 'private', true));
  return to_jsonb(selected);
end;
$$;

create or replace function public.queue_due_private_prospecting_tasks()
returns setof public.agent_tasks language plpgsql security definer set search_path = public
as $$
begin
  if not public.private_worker_access() then
    raise exception 'private_worker_required' using errcode = '42501';
  end if;

  return query
  with due_profiles as (
    select
      profile.id as profile_id,
      ((now() at time zone profile.timezone)::date) as local_date,
      profile.timezone
    from public.growth_profiles as profile
    where not profile.emergency_stop
      and profile.model_route in ('selected-free', 'selected-deepseek-fallback')
      and nullif(trim(profile.selected_model_id), '') is not null
      and (now() at time zone profile.timezone)::time >= time '09:00'
  ), queued as (
    insert into public.agent_tasks (profile_id, task_type, input, idempotency_key)
    select
      due.profile_id,
      'discover_prospects',
      jsonb_build_object(
        'requestedDate', due.local_date::text,
        'timezone', due.timezone,
        'targetAcceptedDossiers', 2,
        'publicWebOnly', true
      ),
      (
        substr(md5('discover_prospects:' || due.profile_id::text || ':' || due.local_date::text), 1, 8)
        || '-' || substr(md5('discover_prospects:' || due.profile_id::text || ':' || due.local_date::text), 9, 4)
        || '-4' || substr(md5('discover_prospects:' || due.profile_id::text || ':' || due.local_date::text), 14, 3)
        || '-8' || substr(md5('discover_prospects:' || due.profile_id::text || ':' || due.local_date::text), 18, 3)
        || '-' || substr(md5('discover_prospects:' || due.profile_id::text || ':' || due.local_date::text), 21, 12)
      )::uuid
    from due_profiles as due
    on conflict (idempotency_key) do nothing
    returning *
  )
  select * from queued;
end;
$$;

create or replace function public.reserve_private_model_usage(
  target_profile_id uuid,
  target_task_id uuid,
  target_worker text,
  target_reservation_key uuid,
  target_usage_kind text,
  target_model_id text,
  target_reserved_cost numeric
)
returns jsonb language plpgsql security definer set search_path = public
as $$
declare
  profile public.growth_profiles;
  task public.agent_tasks;
  existing public.model_usage_ledger;
  usage_day date;
begin
  if not public.private_worker_access()
    or target_reservation_key is null
    or nullif(trim(target_worker), '') is null
    or target_usage_kind not in ('benchmark', 'research')
    or nullif(trim(target_model_id), '') is null
    or target_reserved_cost is null
    or target_reserved_cost < 0 then
    raise exception 'invalid_private_usage_reservation' using errcode = '22023';
  end if;

  select * into existing from public.model_usage_ledger where reservation_key = target_reservation_key;
  if found then
    if existing.profile_id <> target_profile_id
      or existing.task_id is distinct from target_task_id
      or existing.model_id <> trim(target_model_id)
      or existing.usage_kind <> target_usage_kind then
      raise exception 'reservation_key_conflict' using errcode = '22023';
    end if;
    return to_jsonb(existing);
  end if;

  select * into profile from public.growth_profiles where id = target_profile_id for update;
  if not found or profile.emergency_stop then
    raise exception 'research_not_operational' using errcode = '22023';
  end if;

  if target_usage_kind = 'research' then
    select * into task from public.agent_tasks where id = target_task_id for update;
    if not found
      or task.profile_id <> target_profile_id
      or task.status <> 'leased'
      or task.leased_by <> trim(target_worker)
      or task.lease_expires_at <= now()
      or task.task_type <> 'discover_prospects'
      or profile.model_route not in ('selected-free', 'selected-deepseek-fallback')
      or profile.selected_model_id <> trim(target_model_id) then
      raise exception 'research_model_not_authorized' using errcode = '22023';
    end if;
  elsif not exists (
    select 1 from public.model_benchmark_candidates
    where profile_id = target_profile_id
      and provider_model_id = trim(target_model_id)
      and is_active
  ) then
    raise exception 'benchmark_model_not_authorized' using errcode = '22023';
  end if;

  usage_day := (now() at time zone profile.timezone)::date;
  insert into public.model_usage_ledger (
    profile_id, task_id, reservation_key, usage_kind, model_id, reserved_cost, local_usage_date
  ) values (
    target_profile_id, target_task_id, target_reservation_key, target_usage_kind,
    trim(target_model_id), target_reserved_cost, usage_day
  ) returning * into existing;
  return to_jsonb(existing);
end;
$$;

create or replace function public.reconcile_private_model_usage(
  target_reservation_key uuid,
  target_actual_cost numeric,
  target_provider_usage jsonb default '{}'::jsonb
)
returns jsonb language plpgsql security definer set search_path = public
as $$
declare usage_row public.model_usage_ledger;
begin
  if not public.private_worker_access()
    or target_reservation_key is null
    or target_actual_cost is null
    or target_actual_cost < 0
    or jsonb_typeof(coalesce(target_provider_usage, '{}'::jsonb)) <> 'object' then
    raise exception 'invalid_private_usage_reconciliation' using errcode = '22023';
  end if;

  select * into usage_row from public.model_usage_ledger where reservation_key = target_reservation_key for update;
  if not found then raise exception 'reservation_not_found' using errcode = 'P0002'; end if;
  if usage_row.status <> 'reserved' then return to_jsonb(usage_row); end if;

  update public.model_usage_ledger
    set actual_cost = target_actual_cost,
      provider_usage = coalesce(target_provider_usage, '{}'::jsonb),
      status = 'reconciled',
      reconciled_at = now()
    where id = usage_row.id
    returning * into usage_row;
  return to_jsonb(usage_row);
end;
$$;

create or replace function public.record_private_prospect_dossier(
  target_task_id uuid,
  target_worker text,
  target_model_id text,
  target_dossier jsonb
)
returns jsonb language plpgsql security definer set search_path = public
as $$
declare
  task public.agent_tasks;
  profile public.growth_profiles;
  existing public.prospects;
  created public.prospects;
  dossier public.prospect_dossiers;
  citation jsonb;
  evidence_item jsonb;
  company text := nullif(trim(target_dossier ->> 'companyName'), '');
  website text := nullif(trim(target_dossier ->> 'officialWebsite'), '');
  reason text := nullif(trim(target_dossier ->> 'icpReason'), '');
  offer_angle text := nullif(trim(target_dossier ->> 'recommendedOfferAngle'), '');
  subject text := nullif(trim(target_dossier #>> '{suggestedOutreach,subject}'), '');
  body text := nullif(trim(target_dossier #>> '{suggestedOutreach,body}'), '');
  contact_value text := nullif(trim(target_dossier #>> '{contactPath,value}'), '');
  contact_email text := public.normalize_outreach_address(target_dossier #>> '{contactPath,email}');
  dedup_key text;
  suppression_exists boolean;
  citation_count integer;
begin
  if not public.private_worker_access()
    or target_task_id is null
    or nullif(trim(target_worker), '') is null
    or nullif(trim(target_model_id), '') is null
    or jsonb_typeof(target_dossier) <> 'object' then
    raise exception 'invalid_private_dossier' using errcode = '22023';
  end if;

  select * into task from public.agent_tasks where id = target_task_id for update;
  if not found or task.status <> 'leased' or task.leased_by <> trim(target_worker) or task.lease_expires_at <= now() then
    raise exception 'task_lease_invalid' using errcode = '22023';
  end if;
  select * into profile from public.growth_profiles where id = task.profile_id for update;
  if not found
    or profile.emergency_stop
    or profile.model_route not in ('selected-free', 'selected-deepseek-fallback')
    or profile.selected_model_id <> trim(target_model_id) then
    raise exception 'research_model_not_authorized' using errcode = '22023';
  end if;

  if company is null or website is null or reason is null or offer_angle is null or subject is null or body is null
    or website !~* '^https://'
    or website ~* '^https://(localhost|127\\.0\\.0\\.1|\\[?::1\\]?)(/|$)'
    or jsonb_typeof(target_dossier -> 'observedEvidence') <> 'array'
    or jsonb_array_length(target_dossier -> 'observedEvidence') = 0
    or jsonb_typeof(target_dossier -> 'citations') <> 'array'
    or jsonb_array_length(target_dossier -> 'citations') = 0
    or jsonb_typeof(target_dossier -> 'contactPath') <> 'object'
    or jsonb_typeof(target_dossier -> 'suggestedOutreach') <> 'object' then
    raise exception 'invalid_private_dossier' using errcode = '22023';
  end if;

  select count(*) into citation_count from jsonb_array_elements(target_dossier -> 'citations') as item;
  if citation_count <> (
    select count(distinct trim(item ->> 'url')) from jsonb_array_elements(target_dossier -> 'citations') as item
  ) then
    raise exception 'duplicate_dossier_citation' using errcode = '22023';
  end if;

  for citation in select * from jsonb_array_elements(target_dossier -> 'citations') loop
    if nullif(trim(citation ->> 'url'), '') is null
      or trim(citation ->> 'url') !~* '^https://'
      or trim(citation ->> 'url') ~* '^https://(localhost|127\\.0\\.0\\.1|\\[?::1\\]?)(/|$)'
      or nullif(trim(citation ->> 'title'), '') is null
      or nullif(trim(citation ->> 'excerpt'), '') is null then
      raise exception 'invalid_private_dossier_citation' using errcode = '22023';
    end if;
  end loop;

  for evidence_item in select * from jsonb_array_elements(target_dossier -> 'observedEvidence') loop
    if nullif(trim(evidence_item ->> 'claim'), '') is null
      or jsonb_typeof(evidence_item -> 'citationUrls') <> 'array'
      or jsonb_array_length(evidence_item -> 'citationUrls') = 0
      or exists (
        select 1
        from jsonb_array_elements_text(evidence_item -> 'citationUrls') as source_url
        where not exists (
          select 1 from jsonb_array_elements(target_dossier -> 'citations') as known
          where trim(known ->> 'url') = trim(source_url)
        )
      ) then
      raise exception 'unsupported_private_dossier_claim' using errcode = '22023';
    end if;
  end loop;

  dedup_key := lower(regexp_replace(website, '^https?://(www\\.)?', ''));
  dedup_key := regexp_replace(dedup_key, '/$', '');
  select * into existing from public.prospects
    where profile_id = profile.id and deduplication_key = dedup_key
    for update;
  if found then
    return to_jsonb(existing) || jsonb_build_object('duplicate', true);
  end if;

  select exists(
    select 1 from public.suppression_records
    where normalized_address = nullif(contact_email, '')
  ) into suppression_exists;

  insert into public.prospects (
    profile_id, company_name, email, website_url, deduplication_key,
    icp_match_score, icp_match_reason, suppression_status
  ) values (
    profile.id, company, nullif(contact_email, ''), website, dedup_key,
    80, reason, case when suppression_exists then 'suppressed' else 'clear' end
  ) returning * into created;

  for citation in select * from jsonb_array_elements(target_dossier -> 'citations') loop
    insert into public.prospect_sources (
      prospect_id, source_url, source_type, evidence, contact_path, email_status, discovered_by
    ) values (
      created.id,
      trim(citation ->> 'url'),
      'openrouter_web_search',
      jsonb_build_array(trim(citation ->> 'excerpt')),
      contact_value,
      case when nullif(contact_email, '') is null then 'unknown' else 'public' end,
      'mac-mini-openrouter'
    ) on conflict (prospect_id, source_url) do nothing;
  end loop;

  insert into public.prospect_dossiers (
    profile_id, prospect_id, task_id, company_name, official_website_url,
    icp_reason, observed_evidence, citations, recommended_offer_angle,
    contact_path, suggested_subject, suggested_body, model_id
  ) values (
    profile.id, created.id, task.id, company, website, reason,
    target_dossier -> 'observedEvidence', target_dossier -> 'citations', offer_angle,
    target_dossier -> 'contactPath', subject, body, trim(target_model_id)
  ) returning * into dossier;

  return to_jsonb(dossier) || jsonb_build_object('prospectId', created.id, 'duplicate', false);
end;
$$;

-- Approval may only happen after a real sender is configured. Research-only
-- profiles retain their dossiers but cannot enter the outreach sender flow.
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
  profile_sender_name text;
  profile_sender_email text;
  approved_today integer;
begin
  if actor_id is null or not public.is_admin(actor_id) then raise exception 'admin_required' using errcode = '42501'; end if;
  if target_decision not in ('approve','reject','defer','cancel','edit') then raise exception 'invalid_outreach_decision' using errcode = '22023'; end if;
  select * into current_message from public.outreach_messages where id = target_message_id for update;
  if not found then raise exception 'message_not_found' using errcode = 'P0002'; end if;
  if target_decision = 'approve' and (current_message.recipient_email is null or current_message.approval_status not in ('pending','deferred')) then raise exception 'message_not_reviewable' using errcode = '22023'; end if;
  if target_decision = 'approve' then
    select daily_send_cap, sender_name, sender_email
      into profile_cap, profile_sender_name, profile_sender_email
      from public.growth_profiles where id = current_message.profile_id;
    if nullif(trim(coalesce(profile_sender_name, '')), '') is null
      or nullif(trim(coalesce(profile_sender_email, '')), '') is null then
      raise exception 'sender_not_configured' using errcode = '22023';
    end if;
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

-- A human-admin route calls this function after reviewing a research dossier.
-- The private worker has no grant to it and cannot create outreach messages.
create or replace function public.promote_prospect_dossier(target_dossier_id uuid)
returns jsonb language plpgsql security definer set search_path = public
as $$
declare
  actor_id uuid := auth.uid();
  dossier public.prospect_dossiers;
  prospect public.prospects;
  profile public.growth_profiles;
  message public.outreach_messages;
begin
  if actor_id is null or not public.is_admin(actor_id) then
    raise exception 'admin_required' using errcode = '42501';
  end if;
  select * into dossier from public.prospect_dossiers where id = target_dossier_id for update;
  if not found then raise exception 'dossier_not_found' using errcode = 'P0002'; end if;
  if dossier.review_status <> 'pending_review' then raise exception 'dossier_not_promotable' using errcode = '22023'; end if;
  select * into prospect from public.prospects where id = dossier.prospect_id for update;
  select * into profile from public.growth_profiles where id = dossier.profile_id for update;
  if not found or profile.emergency_stop
    or nullif(trim(coalesce(profile.sender_name, '')), '') is null
    or nullif(trim(coalesce(profile.sender_email, '')), '') is null
    or prospect.suppression_status <> 'clear'
    or nullif(trim(coalesce(prospect.email, '')), '') is null
    or prospect.email !~* '^[^[:space:]@]+@[^[:space:]@]+\\.[^[:space:]@]+$' then
    raise exception 'dossier_promotion_not_allowed' using errcode = '22023';
  end if;

  insert into public.outreach_messages (
    prospect_id, profile_id, campaign, sequence_step, subject, body,
    personalization_evidence, sender_email, recipient_email, idempotency_key
  ) values (
    prospect.id, profile.id, 'dossier-review', 1, dossier.suggested_subject,
    dossier.suggested_body, dossier.observed_evidence, profile.sender_email,
    prospect.email, gen_random_uuid()
  ) returning * into message;

  update public.prospect_dossiers
    set review_status = 'promoted', promoted_message_id = message.id,
      reviewed_by = actor_id, reviewed_at = now(), updated_at = now()
    where id = dossier.id;
  update public.prospects set outreach_status = 'drafted', updated_at = now() where id = prospect.id;
  return to_jsonb(message);
end;
$$;

revoke all on function public.claim_private_prospecting_task(text, integer) from public, anon, authenticated;
revoke all on function public.queue_due_private_prospecting_tasks() from public, anon, authenticated;
revoke all on function public.reserve_private_model_usage(uuid, uuid, text, uuid, text, text, numeric) from public, anon, authenticated;
revoke all on function public.reconcile_private_model_usage(uuid, numeric, jsonb) from public, anon, authenticated;
revoke all on function public.record_private_prospect_dossier(uuid, text, text, jsonb) from public, anon, authenticated;
grant execute on function public.claim_private_prospecting_task(text, integer) to service_role;
grant execute on function public.queue_due_private_prospecting_tasks() to service_role;
grant execute on function public.reserve_private_model_usage(uuid, uuid, text, uuid, text, text, numeric) to service_role;
grant execute on function public.reconcile_private_model_usage(uuid, numeric, jsonb) to service_role;
grant execute on function public.record_private_prospect_dossier(uuid, text, text, jsonb) to service_role;
revoke all on function public.promote_prospect_dossier(uuid) from public, anon;
grant execute on function public.promote_prospect_dossier(uuid) to authenticated;

create trigger model_benchmark_candidates_updated_at before update on public.model_benchmark_candidates for each row execute function public.update_updated_at_column();
create trigger prospect_dossiers_updated_at before update on public.prospect_dossiers for each row execute function public.update_updated_at_column();
