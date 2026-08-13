-- Configured OpenRouter model boundary.
--
-- The application validates OPENROUTER_PRIMARY_MODEL before calling the
-- service-role RPC below. The database still validates the shape, route, and
-- worker boundary so a signed request cannot select an arbitrary live model.
-- Comparison candidates are durable evidence only and never change the live
-- growth-profile route.

alter table public.growth_profiles
  drop constraint if exists growth_profiles_selected_model_check;

alter table public.growth_profiles
  add constraint growth_profiles_selected_model_check
  check (
    (model_route = 'evaluation-required' and selected_model_id is null)
    or (
      model_route in ('selected-primary', 'selected-free', 'selected-deepseek-fallback')
      and nullif(trim(selected_model_id), '') is not null
      and nullif(trim(selected_model_rationale), '') is not null
    )
  );

alter table public.model_benchmark_candidates
  drop constraint if exists model_benchmark_candidates_candidate_kind_check;

alter table public.model_benchmark_candidates
  add constraint model_benchmark_candidates_candidate_kind_check
  check (candidate_kind in ('free', 'deepseek-fallback', 'configured-primary', 'configured-test'));

create or replace function public.private_research_model_route_allowed(target_route text)
returns boolean language sql immutable set search_path = public
as $$
  select target_route in ('selected-primary', 'selected-free', 'selected-deepseek-fallback')
$$;

create or replace function public.pin_private_primary_model(
  target_profile_id uuid,
  target_worker text,
  target_model_id text,
  target_rationale text
)
returns jsonb language plpgsql security definer set search_path = public
as $$
declare
  profile public.growth_profiles;
begin
  if not public.private_worker_access()
    or nullif(trim(target_worker), '') is null
    or nullif(trim(target_model_id), '') is null
    or nullif(trim(target_rationale), '') is null
    or trim(target_model_id) !~ '^[A-Za-z0-9][A-Za-z0-9._-]*/[A-Za-z0-9][A-Za-z0-9._:-]*$'
    or trim(target_model_id) ~* '(^|[/:_-])(latest|current|stable|default)($|[/:_-])' then
    raise exception 'invalid_primary_model_pin' using errcode = '22023';
  end if;

  select * into profile from public.growth_profiles where id = target_profile_id for update;
  if not found or profile.emergency_stop then
    raise exception 'primary_model_pin_not_allowed' using errcode = '22023';
  end if;
  if profile.model_route not in ('evaluation-required', 'selected-primary', 'selected-free', 'selected-deepseek-fallback') then
    raise exception 'primary_model_pin_not_allowed' using errcode = '22023';
  end if;

  update public.growth_profiles
    set model_route = 'selected-primary',
      fallback_model = '',
      selected_model_id = trim(target_model_id),
      selected_model_rationale = trim(target_rationale),
      model_selected_at = now(),
      updated_at = now()
    where id = profile.id;

  return jsonb_build_object('model_route', 'selected-primary', 'selected_model_id', trim(target_model_id));
end;
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
    and public.private_research_model_route_allowed(profile.model_route)
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
      and public.private_research_model_route_allowed(profile.model_route)
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
    or trim(target_model_id) !~ '^[A-Za-z0-9][A-Za-z0-9._-]*/[A-Za-z0-9][A-Za-z0-9._:-]*$'
    or trim(target_model_id) ~* '(^|[/:_-])(latest|current|stable|default)($|[/:_-])'
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
      or not public.private_research_model_route_allowed(profile.model_route)
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
    or trim(target_model_id) !~ '^[A-Za-z0-9][A-Za-z0-9._-]*/[A-Za-z0-9][A-Za-z0-9._:-]*$'
    or trim(target_model_id) ~* '(^|[/:_-])(latest|current|stable|default)($|[/:_-])'
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
    or not public.private_research_model_route_allowed(profile.model_route)
    or profile.selected_model_id <> trim(target_model_id) then
    raise exception 'research_model_not_authorized' using errcode = '22023';
  end if;

  if company is null or website is null or reason is null or offer_angle is null or subject is null or body is null
    or website !~* '^https://'
    or website ~* '^https://(localhost|127\\.0\\.1|\\[?::1\\]?)(/|$)'
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
      or trim(citation ->> 'url') ~* '^https://(localhost|127\\.0\\.1|\\[?::1\\]?)(/|$)'
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

revoke all on function public.private_research_model_route_allowed(text) from public, anon, authenticated;
grant execute on function public.private_research_model_route_allowed(text) to service_role;
revoke all on function public.pin_private_primary_model(uuid, text, text, text) from public, anon, authenticated;
grant execute on function public.pin_private_primary_model(uuid, text, text, text) to service_role;
revoke all on function public.claim_private_prospecting_task(text, integer) from public, anon, authenticated;
revoke all on function public.queue_due_private_prospecting_tasks() from public, anon, authenticated;
revoke all on function public.reserve_private_model_usage(uuid, uuid, text, uuid, text, text, numeric) from public, anon, authenticated;
revoke all on function public.record_private_prospect_dossier(uuid, text, text, jsonb) from public, anon, authenticated;
grant execute on function public.claim_private_prospecting_task(text, integer) to service_role;
grant execute on function public.queue_due_private_prospecting_tasks() to service_role;
grant execute on function public.reserve_private_model_usage(uuid, uuid, text, uuid, text, text, numeric) to service_role;
grant execute on function public.record_private_prospect_dossier(uuid, text, text, jsonb) to service_role;
