-- Close nullable JSON checks in the additive planner boundary.
-- Missing safety fields must reject a plan rather than make a SQL CHECK or
-- PL/pgSQL IF evaluate to NULL and pass through.

alter table public.agent_plans
  add constraint agent_plans_openclaw_safety_flags_present_check
  check (
    (openclaw_instruction ->> 'executor') = 'openclaw'
    and (openclaw_instruction ->> 'approvalRequired') = 'true'
    and ((openclaw_instruction -> 'delivery' ->> 'deliver') = 'false') is true
    and ((openclaw_instruction -> 'delivery' ->> 'bestEffortDeliver') = 'false') is true
    and ((openclaw_instruction -> 'delivery' ->> 'externalMessages') = 'false') is true
    and ((openclaw_instruction -> 'delivery' ->> 'publishing') = 'false') is true
    and ((openclaw_instruction -> 'delivery' ->> 'spending') = 'false') is true
    and ((openclaw_instruction -> 'delivery' ->> 'accountChanges') = 'false') is true
  );

create or replace function public.validate_agent_plan_payload(
  target_steps jsonb,
  target_allowed_capabilities jsonb,
  target_forbidden_actions jsonb,
  target_expected_artifacts jsonb,
  target_openclaw_instruction jsonb
)
returns void language plpgsql immutable set search_path = public
as $$
declare
  step jsonb;
  capability text;
  step_task_type text;
  step_role text;
begin
  if jsonb_typeof(target_steps) is distinct from 'array'
    or coalesce(jsonb_array_length(case when jsonb_typeof(target_steps) = 'array' then target_steps else '[]'::jsonb end), 0) not between 1 and 12
    or jsonb_typeof(target_allowed_capabilities) is distinct from 'array'
    or coalesce(jsonb_array_length(case when jsonb_typeof(target_allowed_capabilities) = 'array' then target_allowed_capabilities else '[]'::jsonb end), 0) not between 1 and 12
    or jsonb_typeof(target_forbidden_actions) is distinct from 'array'
    or coalesce(jsonb_array_length(case when jsonb_typeof(target_forbidden_actions) = 'array' then target_forbidden_actions else '[]'::jsonb end), 0) not between 5 and 24
    or jsonb_typeof(target_expected_artifacts) is distinct from 'array'
    or coalesce(jsonb_array_length(case when jsonb_typeof(target_expected_artifacts) = 'array' then target_expected_artifacts else '[]'::jsonb end), 0) not between 1 and 24
    or jsonb_typeof(target_openclaw_instruction) is distinct from 'object'
    or target_openclaw_instruction ->> 'executor' is distinct from 'openclaw'
    or target_openclaw_instruction ->> 'approvalRequired' is distinct from 'true'
    or target_openclaw_instruction -> 'delivery' ->> 'deliver' is distinct from 'false'
    or target_openclaw_instruction -> 'delivery' ->> 'bestEffortDeliver' is distinct from 'false'
    or target_openclaw_instruction -> 'delivery' ->> 'externalMessages' is distinct from 'false'
    or target_openclaw_instruction -> 'delivery' ->> 'publishing' is distinct from 'false'
    or target_openclaw_instruction -> 'delivery' ->> 'spending' is distinct from 'false'
    or target_openclaw_instruction -> 'delivery' ->> 'accountChanges' is distinct from 'false' then
    raise exception 'invalid_agent_plan_payload' using errcode = '22023';
  end if;

  if not (target_forbidden_actions ? 'send_external_messages')
    or not (target_forbidden_actions ? 'publish_content')
    or not (target_forbidden_actions ? 'spend_money')
    or not (target_forbidden_actions ? 'change_connected_accounts')
    or not (target_forbidden_actions ? 'deliver_external_content') then
    raise exception 'agent_plan_forbidden_actions_incomplete' using errcode = '22023';
  end if;

  for capability in select jsonb_array_elements_text(target_allowed_capabilities) loop
    if capability not in (
      'coordinate', 'read_public_web', 'research_public_web', 'draft_outreach',
      'review_artifacts', 'create_script', 'create_thumbnail', 'create_video',
      'create_audio', 'create_subtitles', 'regenerate_artifact'
    ) then
      raise exception 'agent_plan_capability_not_allowed' using errcode = '22023';
    end if;
  end loop;

  for step in select * from jsonb_array_elements(target_steps) loop
    step_task_type := nullif(trim(step ->> 'taskType'), '');
    step_role := nullif(trim(step ->> 'agentRole'), '');
    if nullif(trim(step ->> 'key'), '') is null
      or nullif(trim(step ->> 'title'), '') is null
      or nullif(trim(step ->> 'instruction'), '') is null
      or step_task_type is null
      or step_task_type not in ('coordinate', 'research_public_web', 'draft_outreach', 'produce_daily_content', 'review_artifacts', 'regenerate_artifact')
      or step_role is null
      or step_role not in ('coordinator', 'public_web_researcher', 'outreach_writer', 'daily_content_producer', 'reviewer')
      or jsonb_typeof(step -> 'capabilities') is distinct from 'array'
      or jsonb_typeof(step -> 'expectedArtifacts') is distinct from 'array'
      or jsonb_typeof(step -> 'estimatedCostUsd') is distinct from 'number'
      or (step_task_type = 'coordinate' and step_role <> 'coordinator')
      or (step_task_type = 'research_public_web' and step_role <> 'public_web_researcher')
      or (step_task_type = 'draft_outreach' and step_role <> 'outreach_writer')
      or (step_task_type = 'produce_daily_content' and step_role <> 'daily_content_producer')
      or (step_task_type in ('review_artifacts', 'regenerate_artifact') and step_role <> 'reviewer') then
      raise exception 'invalid_agent_plan_step' using errcode = '22023';
    end if;

    for capability in select jsonb_array_elements_text(step -> 'capabilities') loop
      if capability not in (
        'coordinate', 'read_public_web', 'research_public_web', 'draft_outreach',
        'review_artifacts', 'create_script', 'create_thumbnail', 'create_video',
        'create_audio', 'create_subtitles', 'regenerate_artifact'
      ) then
        raise exception 'agent_plan_capability_not_allowed' using errcode = '22023';
      end if;
    end loop;
  end loop;
end;
$$;

-- Make the service-role adapter reject a legacy task or a missing parent
-- explicitly before it can fall through to nullable composite fields.
create or replace function public.record_openclaw_prospecting_result(
  target_task_id uuid,
  target_worker text,
  target_model_id text,
  target_artifact_id uuid,
  target_reservation_key uuid,
  target_result jsonb
)
returns jsonb language plpgsql security definer set search_path = public
as $$
declare
  task_row public.agent_orchestration_tasks;
  plan_row public.agent_plans;
  profile public.growth_profiles;
  artifact_row public.agent_artifacts;
  usage_row public.openclaw_model_usage_reservations;
  dossier jsonb;
  citation jsonb;
  evidence_item jsonb;
  existing public.prospects;
  created public.prospects;
  prospect_ids jsonb := '[]'::jsonb;
  accepted integer := 0;
  duplicates integer := 0;
  company text;
  website text;
  reason text;
  offer_angle text;
  subject text;
  body text;
  contact_value text;
  contact_email text;
  dedup_key text;
  suppression_exists boolean;
  citation_count integer;
begin
  if not public.private_worker_access()
    or target_task_id is null or nullif(trim(target_worker), '') is null
    or nullif(trim(target_model_id), '') is null or target_artifact_id is null
    or jsonb_typeof(target_result) is distinct from 'object'
    or jsonb_typeof(target_result -> 'dossiers') is distinct from 'array'
    or coalesce(jsonb_array_length(case when jsonb_typeof(target_result -> 'dossiers') = 'array' then target_result -> 'dossiers' else '[]'::jsonb end), 0) not between 1 and 2 then
    raise exception 'invalid_openclaw_prospecting_result' using errcode = '22023';
  end if;

  select * into task_row from public.agent_orchestration_tasks where id = target_task_id for update;
  if task_row.id is null then
    raise exception 'openclaw_prospecting_task_not_authorized' using errcode = '22023';
  end if;
  select * into plan_row from public.agent_plans where id = task_row.plan_id;
  select * into profile from public.growth_profiles where id = task_row.growth_profile_id;
  select * into artifact_row from public.agent_artifacts where id = target_artifact_id and task_id = target_task_id;
  if plan_row.id is null or profile.id is null or artifact_row.id is null
    or task_row.task_type <> 'research_public_web'
    or task_row.agent_provider <> 'openclaw' or task_row.model_id <> trim(target_model_id)
    or task_row.status <> 'succeeded' or task_row.leased_by <> trim(target_worker)
    or plan_row.status <> 'dispatched' or task_row.plan_id <> plan_row.id
    or task_row.run_id <> plan_row.run_id or task_row.growth_profile_id <> profile.id
    or profile.emergency_stop then
    raise exception 'openclaw_prospecting_task_not_authorized' using errcode = '22023';
  end if;

  if target_reservation_key is not null then
    select * into usage_row from public.openclaw_model_usage_reservations
    where reservation_key = target_reservation_key and task_id = target_task_id;
    if not found then raise exception 'openclaw_prospecting_usage_not_found' using errcode = '22023'; end if;
  end if;

  for dossier in select * from jsonb_array_elements(target_result -> 'dossiers') loop
    company := nullif(trim(dossier ->> 'companyName'), '');
    website := nullif(trim(dossier ->> 'officialWebsite'), '');
    reason := nullif(trim(dossier ->> 'icpReason'), '');
    offer_angle := nullif(trim(dossier ->> 'recommendedOfferAngle'), '');
    subject := nullif(trim(dossier #>> '{suggestedOutreach,subject}'), '');
    body := nullif(trim(dossier #>> '{suggestedOutreach,body}'), '');
    contact_value := nullif(trim(dossier #>> '{contactPath,value}'), '');
    contact_email := public.normalize_outreach_address(dossier #>> '{contactPath,email}');
    if company is null or website is null or reason is null or offer_angle is null or subject is null or body is null
      or website !~* '^https://[^/[:space:]]+(/|$)'
      or website ~* '^https://(localhost|127\\.0\\.0\\.1|\\[?::1\\]?)(/|$)'
      or jsonb_typeof(dossier -> 'observedEvidence') is distinct from 'array'
      or coalesce(jsonb_array_length(case when jsonb_typeof(dossier -> 'observedEvidence') = 'array' then dossier -> 'observedEvidence' else '[]'::jsonb end), 0) = 0
      or jsonb_typeof(dossier -> 'citations') is distinct from 'array'
      or coalesce(jsonb_array_length(case when jsonb_typeof(dossier -> 'citations') = 'array' then dossier -> 'citations' else '[]'::jsonb end), 0) = 0
      or jsonb_typeof(dossier -> 'contactPath') is distinct from 'object'
      or jsonb_typeof(dossier -> 'suggestedOutreach') is distinct from 'object' then
      raise exception 'invalid_openclaw_prospect_dossier' using errcode = '22023';
    end if;

    select count(*) into citation_count from jsonb_array_elements(dossier -> 'citations') as item;
    if citation_count <> (select count(distinct trim(item ->> 'url')) from jsonb_array_elements(dossier -> 'citations') as item) then
      raise exception 'duplicate_openclaw_dossier_citation' using errcode = '22023';
    end if;
    for citation in select * from jsonb_array_elements(dossier -> 'citations') loop
      if nullif(trim(citation ->> 'url'), '') is null
        or trim(citation ->> 'url') !~* '^https://[^/[:space:]]+(/|$)'
        or trim(citation ->> 'url') ~* '^https://(localhost|127\\.0\\.0\\.1|\\[?::1\\]?)(/|$)'
        or nullif(trim(citation ->> 'title'), '') is null
        or nullif(trim(citation ->> 'excerpt'), '') is null then
        raise exception 'invalid_openclaw_dossier_citation' using errcode = '22023';
      end if;
    end loop;
    for evidence_item in select * from jsonb_array_elements(dossier -> 'observedEvidence') loop
      if nullif(trim(evidence_item ->> 'claim'), '') is null
        or jsonb_typeof(evidence_item -> 'citationUrls') is distinct from 'array'
        or coalesce(jsonb_array_length(case when jsonb_typeof(evidence_item -> 'citationUrls') = 'array' then evidence_item -> 'citationUrls' else '[]'::jsonb end), 0) = 0
        or exists (
          select 1 from jsonb_array_elements_text(evidence_item -> 'citationUrls') source_url
          where not exists (
            select 1 from jsonb_array_elements(dossier -> 'citations') known
            where trim(known ->> 'url') = trim(source_url)
          )
        ) then
        raise exception 'unsupported_openclaw_dossier_claim' using errcode = '22023';
      end if;
    end loop;

    dedup_key := lower(regexp_replace(website, '^https?://(www\\.)?', ''));
    dedup_key := regexp_replace(dedup_key, '/$', '');
    select * into existing from public.prospects where profile_id = profile.id and deduplication_key = dedup_key for update;
    if found then
      prospect_ids := prospect_ids || jsonb_build_array(existing.id);
      duplicates := duplicates + 1;
      continue;
    end if;
    select exists(select 1 from public.suppression_records where normalized_address = nullif(contact_email, '')) into suppression_exists;
    insert into public.prospects (
      profile_id, company_name, email, website_url, deduplication_key,
      icp_match_score, icp_match_reason, suppression_status
    ) values (
      profile.id, company, nullif(contact_email, ''), website, dedup_key,
      80, reason, case when suppression_exists then 'suppressed' else 'clear' end
    ) returning * into created;
    prospect_ids := prospect_ids || jsonb_build_array(created.id);
    for citation in select * from jsonb_array_elements(dossier -> 'citations') loop
      insert into public.prospect_sources (
        prospect_id, source_url, source_type, evidence, contact_path, email_status, discovered_by
      ) values (
        created.id, trim(citation ->> 'url'), 'openclaw_web_search',
        jsonb_build_array(trim(citation ->> 'excerpt')), contact_value,
        case when nullif(contact_email, '') is null then 'unknown' else 'public' end,
        'mac-mini-openclaw'
      ) on conflict (prospect_id, source_url) do nothing;
    end loop;
    insert into public.prospect_dossiers (
      profile_id, prospect_id, orchestration_task_id, agent_artifact_id,
      model_usage_reservation_id, worker_id, company_name, official_website_url,
      icp_reason, observed_evidence, citations, recommended_offer_angle,
      contact_path, suggested_subject, suggested_body, model_id
    ) values (
      profile.id, created.id, task_row.id, artifact_row.id,
      usage_row.id, trim(target_worker), company, website, reason,
      dossier -> 'observedEvidence', dossier -> 'citations', offer_angle,
      dossier -> 'contactPath', subject, body, trim(target_model_id)
    );
    accepted := accepted + 1;
  end loop;

  insert into public.prospecting_artifact_provenance (
    owner_id, growth_profile_id, plan_id, run_id, orchestration_task_id,
    artifact_id, model_usage_reservation_id, model_id, worker_id,
    prospect_ids, validation_status
  ) values (
    task_row.owner_id, profile.id, plan_row.id, task_row.run_id, task_row.id,
    artifact_row.id, usage_row.id, trim(target_model_id), trim(target_worker),
    prospect_ids, 'validated'
  ) on conflict (artifact_id) do nothing;

  return jsonb_build_object(
    'acceptedDossiers', accepted,
    'duplicateDossiers', duplicates,
    'prospectIds', prospect_ids,
    'artifactId', artifact_row.id,
    'modelId', trim(target_model_id)
  );
end;
$$;

revoke all on function public.record_openclaw_prospecting_result(uuid,text,text,uuid,uuid,jsonb) from public, anon, authenticated;
grant execute on function public.record_openclaw_prospecting_result(uuid,text,text,uuid,uuid,jsonb) to service_role;
