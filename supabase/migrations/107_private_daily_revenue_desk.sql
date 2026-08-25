-- Private Daily Revenue Desk.
--
-- Purpose: add the owner-only, twice-daily operating records for the Daily
-- Desk: revisioned briefs, idempotent local-day research, citation-backed
-- prospect cards, manual-only follow-ups, social draft versions, decisions,
-- qualified-conversation outcomes, and one cost-reservation ledger.
--
-- Impact: additive and private. No sender, Meta connection, publication,
-- browser/desktop authority, provider credential, or public route is added.
-- The signed worker can only lease Daily Desk research and report bounded
-- public-web results. The database keeps all browser roles read-only.
--
-- Data handling: social previews point to the existing private
-- agent-media-private bucket. Cost rows retain their accounting history for
-- at least 90 days. Decisions and social versions are immutable to browser
-- roles.
--
-- Verification: Daily Desk unit/API/RLS/browser tests, schema lint, and the
-- retained-schema manifest exercise ownership, idempotency, no-provider
-- follow-ups, private preview records, citation validation, and budget
-- concurrency. Rollback: disable the new routes/worker and preserve records;
-- use a reviewed forward migration for any future schema correction.

create table public.daily_desk_operating_briefs (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  revision integer not null check (revision > 0),
  region text not null check (length(trim(region)) between 2 and 240),
  offer text not null check (length(trim(offer)) between 2 and 500),
  target_segment text not null check (length(trim(target_segment)) between 2 and 500),
  pain_focus text not null check (length(trim(pain_focus)) between 2 and 1_000),
  timezone text not null check (length(trim(timezone)) between 2 and 100),
  created_at timestamptz not null default now(),
  unique (owner_id, revision)
);

create table public.daily_desk_runs (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  brief_id uuid not null references public.daily_desk_operating_briefs(id) on delete restrict,
  local_date date not null,
  run_key text not null unique check (length(trim(run_key)) between 16 and 300),
  status text not null default 'queued' check (status in ('queued', 'leased', 'succeeded', 'shortfall', 'failed')),
  target_prospect_count integer not null default 2 check (target_prospect_count = 2),
  produced_prospect_count integer not null default 0 check (produced_prospect_count between 0 and 2),
  shortfall_reason text,
  leased_by text,
  lease_expires_at timestamptz,
  selected_model_id text,
  route_estimated_cost numeric check (route_estimated_cost is null or route_estimated_cost >= 0),
  route_rationale text,
  provider_policy jsonb not null default '{}'::jsonb check (jsonb_typeof(provider_policy) = 'object'),
  provider_usage jsonb not null default '{}'::jsonb check (jsonb_typeof(provider_usage) = 'object'),
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (owner_id, local_date),
  check ((status = 'leased') = (leased_by is not null and lease_expires_at is not null)),
  check ((status in ('succeeded', 'shortfall', 'failed')) = (completed_at is not null)),
  check ((status = 'shortfall') = (shortfall_reason is not null))
);

create table public.daily_desk_prospect_cards (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  run_id uuid not null references public.daily_desk_runs(id) on delete cascade,
  company_name text not null check (length(trim(company_name)) between 1 and 240),
  official_website_url text not null check (official_website_url ~* '^https://'),
  deduplication_key text not null check (length(trim(deduplication_key)) between 1 and 2_000),
  consultant_role text not null check (length(trim(consultant_role)) between 1 and 240),
  contact_path text not null check (contact_path ~* '^https://'),
  observed_evidence jsonb not null check (jsonb_typeof(observed_evidence) = 'array'),
  citations jsonb not null check (jsonb_typeof(citations) = 'array'),
  created_at timestamptz not null default now(),
  unique (run_id, deduplication_key)
);

create table public.daily_desk_follow_ups (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  run_id uuid not null references public.daily_desk_runs(id) on delete cascade,
  prospect_card_id uuid not null unique references public.daily_desk_prospect_cards(id) on delete cascade,
  subject text not null check (length(trim(subject)) between 1 and 300),
  body text not null check (length(trim(body)) between 1 and 10_000),
  state text not null default 'draft' check (state in ('draft', 'ready', 'deferred', 'completed', 'rejected')),
  deferred_until date,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check ((state = 'deferred') = (deferred_until is not null)),
  check ((state = 'completed') = (completed_at is not null))
);

create table public.daily_desk_social_assets (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  run_id uuid not null unique references public.daily_desk_runs(id) on delete cascade,
  status text not null default 'draft' check (status in ('draft', 'ready_for_manual_posting', 'rejected')),
  current_version_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.daily_desk_social_asset_versions (
  id uuid primary key,
  owner_id uuid not null references auth.users(id) on delete cascade,
  asset_id uuid not null references public.daily_desk_social_assets(id) on delete cascade,
  version_number integer not null check (version_number > 0),
  storage_path text not null unique check (storage_path ~ '^daily-desk/[0-9a-f-]+/[0-9a-f-]+/[0-9a-f-]+[.]svg$'),
  caption text not null check (length(trim(caption)) between 1 and 5_000),
  alt_text text not null check (length(trim(alt_text)) between 1 and 2_000),
  graphic_sha256 text not null check (graphic_sha256 ~ '^[a-f0-9]{64}$'),
  graphic_tokens jsonb not null default '{}'::jsonb check (jsonb_typeof(graphic_tokens) = 'object'),
  created_at timestamptz not null default now(),
  unique (asset_id, version_number)
);

alter table public.daily_desk_social_assets
  add constraint daily_desk_social_assets_current_version_id_fkey
  foreign key (current_version_id)
  references public.daily_desk_social_asset_versions(id)
  on delete set null;

create table public.daily_desk_decisions (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  resource_type text not null check (resource_type in ('follow_up', 'social_asset')),
  resource_id uuid not null,
  decision text not null check (decision in ('edit', 'ready', 'defer', 'complete', 'reopen', 'reject', 'approve', 'revise')),
  before_state text not null,
  after_state text not null,
  note text not null default '' check (length(note) <= 2_000),
  details jsonb not null default '{}'::jsonb check (jsonb_typeof(details) = 'object'),
  idempotency_key uuid not null unique,
  created_at timestamptz not null default now()
);

create table public.daily_desk_outcomes (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  prospect_card_id uuid not null references public.daily_desk_prospect_cards(id) on delete cascade,
  follow_up_id uuid references public.daily_desk_follow_ups(id) on delete set null,
  outcome_type text not null check (outcome_type in ('qualified_sales_conversation', 'reply', 'meeting', 'not_a_fit', 'customer', 'note')),
  notes text not null check (length(trim(notes)) between 1 and 4_000),
  occurred_at timestamptz not null default now(),
  recorded_by uuid not null references auth.users(id) on delete restrict,
  idempotency_key uuid not null unique,
  created_at timestamptz not null default now()
);

create table public.daily_desk_cost_reservations (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  run_id uuid not null references public.daily_desk_runs(id) on delete cascade,
  reservation_key uuid not null unique,
  provider text not null default 'openrouter' check (provider = 'openrouter'),
  model_id text not null check (length(trim(model_id)) between 3 and 240),
  estimated_cost numeric not null check (estimated_cost >= 0),
  reserved_cost numeric not null check (reserved_cost >= 0 and reserved_cost <= estimated_cost),
  actual_cost numeric check (actual_cost >= 0),
  status text not null default 'reserved' check (status in ('reserved', 'reconciled', 'actual_cost_missing', 'released', 'blocked', 'overage')),
  local_date date not null,
  provider_policy jsonb not null check (jsonb_typeof(provider_policy) = 'object'),
  route_rationale text not null check (length(trim(route_rationale)) between 1 and 2_000),
  provider_usage jsonb not null default '{}'::jsonb check (jsonb_typeof(provider_usage) = 'object'),
  retain_until timestamptz not null default (now() + interval '90 days'),
  reconciled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check ((status = 'reconciled') = (actual_cost is not null and reconciled_at is not null)),
  check (retain_until >= created_at + interval '90 days')
);

create index daily_desk_briefs_owner_revision_idx on public.daily_desk_operating_briefs (owner_id, revision desc);
create index daily_desk_runs_owner_date_idx on public.daily_desk_runs (owner_id, local_date desc);
create index daily_desk_cards_owner_created_idx on public.daily_desk_prospect_cards (owner_id, created_at desc);
create index daily_desk_follow_ups_owner_state_idx on public.daily_desk_follow_ups (owner_id, state, deferred_until, created_at);
create index daily_desk_social_versions_owner_asset_idx on public.daily_desk_social_asset_versions (owner_id, asset_id, version_number desc);
create index daily_desk_decisions_owner_created_idx on public.daily_desk_decisions (owner_id, created_at desc);
create index daily_desk_outcomes_owner_type_idx on public.daily_desk_outcomes (owner_id, outcome_type, occurred_at desc);
create index daily_desk_cost_owner_date_idx on public.daily_desk_cost_reservations (owner_id, local_date, status);

alter table public.daily_desk_operating_briefs enable row level security;
alter table public.daily_desk_runs enable row level security;
alter table public.daily_desk_prospect_cards enable row level security;
alter table public.daily_desk_follow_ups enable row level security;
alter table public.daily_desk_social_assets enable row level security;
alter table public.daily_desk_social_asset_versions enable row level security;
alter table public.daily_desk_decisions enable row level security;
alter table public.daily_desk_outcomes enable row level security;
alter table public.daily_desk_cost_reservations enable row level security;

create or replace function public.daily_desk_owner_access(target_owner_id uuid)
returns boolean
language sql
stable
set search_path = public
as $$
  select auth.uid() = target_owner_id and public.is_admin(auth.uid());
$$;

create policy "owners read daily desk briefs" on public.daily_desk_operating_briefs for select using (public.daily_desk_owner_access(owner_id));
create policy "owners read daily desk runs" on public.daily_desk_runs for select using (public.daily_desk_owner_access(owner_id));
create policy "owners read daily desk prospect cards" on public.daily_desk_prospect_cards for select using (public.daily_desk_owner_access(owner_id));
create policy "owners read daily desk follow ups" on public.daily_desk_follow_ups for select using (public.daily_desk_owner_access(owner_id));
create policy "owners read daily desk social assets" on public.daily_desk_social_assets for select using (public.daily_desk_owner_access(owner_id));
create policy "owners read daily desk social versions" on public.daily_desk_social_asset_versions for select using (public.daily_desk_owner_access(owner_id));
create policy "owners read daily desk decisions" on public.daily_desk_decisions for select using (public.daily_desk_owner_access(owner_id));
create policy "owners read daily desk outcomes" on public.daily_desk_outcomes for select using (public.daily_desk_owner_access(owner_id));
create policy "owners read daily desk cost reservations" on public.daily_desk_cost_reservations for select using (public.daily_desk_owner_access(owner_id));

revoke all on table public.daily_desk_operating_briefs,
  public.daily_desk_runs,
  public.daily_desk_prospect_cards,
  public.daily_desk_follow_ups,
  public.daily_desk_social_assets,
  public.daily_desk_social_asset_versions,
  public.daily_desk_decisions,
  public.daily_desk_outcomes,
  public.daily_desk_cost_reservations from anon, authenticated;
grant select on table public.daily_desk_operating_briefs,
  public.daily_desk_runs,
  public.daily_desk_prospect_cards,
  public.daily_desk_follow_ups,
  public.daily_desk_social_assets,
  public.daily_desk_social_asset_versions,
  public.daily_desk_decisions,
  public.daily_desk_outcomes,
  public.daily_desk_cost_reservations to authenticated;

create or replace function public.prepare_daily_desk_run(
  target_owner_id uuid,
  target_local_date date default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  actor_id uuid := auth.uid();
  brief_row public.daily_desk_operating_briefs;
  run_row public.daily_desk_runs;
  expected_local_date date;
  selected_local_date date;
begin
  if target_owner_id is null or not (
    public.private_worker_access()
    or (actor_id = target_owner_id and public.is_admin(actor_id))
  ) then
    raise exception 'daily_desk_owner_required' using errcode = '42501';
  end if;

  select * into brief_row
  from public.daily_desk_operating_briefs
  where owner_id = target_owner_id
  order by revision desc
  limit 1
  for update;
  if not found then
    raise exception 'daily_desk_brief_required' using errcode = 'P0002';
  end if;

  expected_local_date := (now() at time zone brief_row.timezone)::date;
  selected_local_date := coalesce(target_local_date, expected_local_date);
  if selected_local_date <> expected_local_date then
    raise exception 'daily_desk_local_date_required' using errcode = '22023';
  end if;

  select * into run_row
  from public.daily_desk_runs
  where owner_id = target_owner_id and local_date = selected_local_date
  for update;
  if found then
    return to_jsonb(run_row) || jsonb_build_object('duplicate', true);
  end if;

  insert into public.daily_desk_runs (
    owner_id, brief_id, local_date, run_key
  ) values (
    target_owner_id,
    brief_row.id,
    selected_local_date,
    'daily-desk:' || target_owner_id::text || ':' || selected_local_date::text
  ) returning * into run_row;

  insert into public.daily_desk_social_assets (owner_id, run_id)
  values (target_owner_id, run_row.id)
  on conflict (run_id) do nothing;

  return to_jsonb(run_row) || jsonb_build_object('duplicate', false);
end;
$$;

create or replace function public.create_daily_desk_operating_brief(
  target_region text,
  target_offer text,
  target_segment text,
  target_pain_focus text,
  target_timezone text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  actor_id uuid := auth.uid();
  brief_row public.daily_desk_operating_briefs;
  next_revision integer;
begin
  if actor_id is null or not public.is_admin(actor_id) then
    raise exception 'daily_desk_owner_required' using errcode = '42501';
  end if;
  if nullif(trim(target_region), '') is null
    or nullif(trim(target_offer), '') is null
    or nullif(trim(target_segment), '') is null
    or nullif(trim(target_pain_focus), '') is null
    or nullif(trim(target_timezone), '') is null
    or length(trim(target_region)) > 240
    or length(trim(target_offer)) > 500
    or length(trim(target_segment)) > 500
    or length(trim(target_pain_focus)) > 1000
    or length(trim(target_timezone)) > 100 then
    raise exception 'invalid_daily_desk_brief' using errcode = '22023';
  end if;
  begin
    perform now() at time zone trim(target_timezone);
  exception when invalid_parameter_value then
    raise exception 'invalid_daily_desk_timezone' using errcode = '22023';
  end;

  perform pg_advisory_xact_lock(hashtext(actor_id::text));
  select coalesce(max(revision), 0) + 1 into next_revision
  from public.daily_desk_operating_briefs
  where owner_id = actor_id;

  insert into public.daily_desk_operating_briefs (
    owner_id, revision, region, offer, target_segment, pain_focus, timezone
  ) values (
    actor_id, next_revision, trim(target_region), trim(target_offer),
    trim(target_segment), trim(target_pain_focus), trim(target_timezone)
  ) returning * into brief_row;
  return to_jsonb(brief_row);
end;
$$;

create or replace function public.claim_daily_desk_run(
  target_owner_id uuid,
  target_worker text,
  target_lease_seconds integer default 300
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  run_row public.daily_desk_runs;
begin
  if not public.private_worker_access()
    or target_owner_id is null
    or nullif(trim(target_worker), '') is null
    or target_lease_seconds not between 30 and 1800 then
    raise exception 'daily_desk_worker_required' using errcode = '42501';
  end if;

  select * into run_row
  from public.daily_desk_runs
  where owner_id = target_owner_id
    and (
      status = 'queued'
      or (status = 'leased' and lease_expires_at < now())
    )
  order by local_date, created_at
  for update skip locked
  limit 1;
  if not found then return null; end if;

  update public.daily_desk_runs
  set status = 'leased', leased_by = trim(target_worker),
      lease_expires_at = now() + make_interval(secs => target_lease_seconds),
      updated_at = now()
  where id = run_row.id
  returning * into run_row;
  return to_jsonb(run_row);
end;
$$;

-- Global claim is intentionally service-role-only. It is the only worker
-- queue scan, so the Mac mini never receives an owner list it did not claim.
create or replace function public.claim_next_daily_desk_run(
  target_worker text,
  target_lease_seconds integer default 300
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  run_row public.daily_desk_runs;
begin
  if not public.private_worker_access()
    or nullif(trim(target_worker), '') is null
    or target_lease_seconds not between 30 and 1800 then
    raise exception 'daily_desk_worker_required' using errcode = '42501';
  end if;

  select * into run_row
  from public.daily_desk_runs
  where status = 'queued'
    or (status = 'leased' and lease_expires_at < now())
  order by local_date, created_at
  for update skip locked
  limit 1;
  if not found then return null; end if;

  update public.daily_desk_runs
  set status = 'leased', leased_by = trim(target_worker),
      lease_expires_at = now() + make_interval(secs => target_lease_seconds),
      updated_at = now()
  where id = run_row.id
  returning * into run_row;
  return to_jsonb(run_row);
end;
$$;

create or replace function public.reserve_daily_desk_cost(
  target_owner_id uuid,
  target_run_id uuid,
  target_worker text,
  target_reservation_key uuid,
  target_model_id text,
  target_estimated_cost numeric,
  target_reserved_cost numeric,
  target_provider_policy jsonb,
  target_route_rationale text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  run_row public.daily_desk_runs;
  existing public.daily_desk_cost_reservations;
  daily_total numeric;
  monthly_total numeric;
  required_policy jsonb := '{"require_parameters":true,"data_collection":"deny","zdr":true,"allow_fallbacks":false}'::jsonb;
begin
  if not public.private_worker_access()
    or target_owner_id is null
    or target_run_id is null
    or target_reservation_key is null
    or nullif(trim(target_worker), '') is null
    or nullif(trim(target_model_id), '') is null
    or target_estimated_cost is null
    or target_reserved_cost is null
    or target_estimated_cost < 0
    or target_reserved_cost < 0
    or target_reserved_cost <> target_estimated_cost
    or jsonb_typeof(target_provider_policy) <> 'object'
    or not (target_provider_policy @> required_policy)
    or nullif(trim(target_route_rationale), '') is null
    or length(trim(target_route_rationale)) > 2000 then
    raise exception 'invalid_daily_desk_cost_reservation' using errcode = '22023';
  end if;

  select * into existing
  from public.daily_desk_cost_reservations
  where reservation_key = target_reservation_key
  for update;
  if found then
    if existing.owner_id <> target_owner_id
      or existing.run_id <> target_run_id
      or existing.model_id <> trim(target_model_id)
      or existing.estimated_cost <> target_estimated_cost
      or existing.reserved_cost <> target_reserved_cost
      or existing.provider_policy <> target_provider_policy
      or existing.route_rationale <> trim(target_route_rationale) then
      raise exception 'daily_desk_reservation_conflict' using errcode = '23505';
    end if;
    return to_jsonb(existing);
  end if;

  select * into run_row
  from public.daily_desk_runs
  where id = target_run_id and owner_id = target_owner_id
  for update;
  if not found
    or run_row.status <> 'leased'
    or run_row.leased_by <> trim(target_worker)
    or run_row.lease_expires_at <= now() then
    raise exception 'daily_desk_run_lease_invalid' using errcode = '22023';
  end if;
  if run_row.selected_model_id is distinct from trim(target_model_id)
    or run_row.route_estimated_cost is distinct from target_estimated_cost
    or run_row.provider_policy is distinct from target_provider_policy
    or run_row.route_rationale is distinct from trim(target_route_rationale) then
    raise exception 'daily_desk_model_route_unverified' using errcode = '22023';
  end if;

  perform pg_advisory_xact_lock(hashtext(target_owner_id::text));
  select coalesce(sum(coalesce(actual_cost, reserved_cost)), 0) into daily_total
  from public.daily_desk_cost_reservations
  where owner_id = target_owner_id
    and local_date = run_row.local_date
    and status in ('reserved', 'reconciled', 'actual_cost_missing', 'overage');
  select coalesce(sum(coalesce(actual_cost, reserved_cost)), 0) into monthly_total
  from public.daily_desk_cost_reservations
  where owner_id = target_owner_id
    and date_trunc('month', local_date)::date = date_trunc('month', run_row.local_date)::date
    and status in ('reserved', 'reconciled', 'actual_cost_missing', 'overage');
  if target_reserved_cost > 0.75
    or daily_total + target_reserved_cost > 0.75
    or monthly_total + target_reserved_cost > 25 then
    raise exception 'daily_desk_budget_exceeded' using errcode = '22023';
  end if;

  insert into public.daily_desk_cost_reservations (
    owner_id, run_id, reservation_key, model_id, estimated_cost, reserved_cost,
    local_date, provider_policy, route_rationale
  ) values (
    target_owner_id, target_run_id, target_reservation_key, trim(target_model_id),
    target_estimated_cost, target_reserved_cost, run_row.local_date,
    target_provider_policy, trim(target_route_rationale)
  ) returning * into existing;

  return to_jsonb(existing);
end;
$$;

-- The server records the dynamic route before the Mac-mini may reserve any
-- money. A signed worker can carry this result but cannot substitute a model,
-- price, privacy policy, or rationale at the reservation boundary.
create or replace function public.record_daily_desk_model_route(
  target_owner_id uuid,
  target_run_id uuid,
  target_worker text,
  target_model_id text,
  target_estimated_cost numeric,
  target_provider_policy jsonb,
  target_route_rationale text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  run_row public.daily_desk_runs;
  required_policy jsonb := '{"require_parameters":true,"data_collection":"deny","zdr":true,"allow_fallbacks":false}'::jsonb;
begin
  if not public.private_worker_access()
    or target_owner_id is null
    or target_run_id is null
    or nullif(trim(target_worker), '') is null
    or nullif(trim(target_model_id), '') is null
    or trim(target_model_id) ~* '(^|[/:_-])(latest|current|stable|default)($|[/:_-])'
    or target_estimated_cost is null
    or target_estimated_cost < 0
    or jsonb_typeof(target_provider_policy) <> 'object'
    or not (target_provider_policy @> required_policy)
    or nullif(trim(target_route_rationale), '') is null
    or length(trim(target_route_rationale)) > 2000 then
    raise exception 'invalid_daily_desk_model_route' using errcode = '22023';
  end if;

  select * into run_row
  from public.daily_desk_runs
  where id = target_run_id and owner_id = target_owner_id
  for update;
  if not found
    or run_row.status <> 'leased'
    or run_row.leased_by <> trim(target_worker)
    or run_row.lease_expires_at <= now() then
    raise exception 'daily_desk_run_lease_invalid' using errcode = '22023';
  end if;
  if run_row.selected_model_id is not null then
    if run_row.selected_model_id = trim(target_model_id)
      and run_row.route_estimated_cost = target_estimated_cost
      and run_row.provider_policy = target_provider_policy
      and run_row.route_rationale = trim(target_route_rationale) then
      return to_jsonb(run_row) || jsonb_build_object('duplicate', true);
    end if;
    raise exception 'daily_desk_model_route_conflict' using errcode = '23505';
  end if;

  update public.daily_desk_runs
  set selected_model_id = trim(target_model_id),
      route_estimated_cost = target_estimated_cost,
      route_rationale = trim(target_route_rationale),
      provider_policy = target_provider_policy,
      updated_at = now()
  where id = run_row.id
  returning * into run_row;
  return to_jsonb(run_row) || jsonb_build_object('duplicate', false);
end;
$$;

create or replace function public.reconcile_daily_desk_cost(
  target_reservation_key uuid,
  target_actual_cost numeric,
  target_provider_usage jsonb default '{}'::jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  reservation public.daily_desk_cost_reservations;
  next_status text;
begin
  if not public.private_worker_access()
    or target_reservation_key is null
    or (target_actual_cost is not null and target_actual_cost < 0)
    or jsonb_typeof(coalesce(target_provider_usage, '{}'::jsonb)) <> 'object' then
    raise exception 'invalid_daily_desk_cost_reconciliation' using errcode = '22023';
  end if;
  select * into reservation
  from public.daily_desk_cost_reservations
  where reservation_key = target_reservation_key
  for update;
  if not found then raise exception 'daily_desk_reservation_not_found' using errcode = 'P0002'; end if;
  if reservation.status <> 'reserved' then return to_jsonb(reservation); end if;

  next_status := case
    when target_actual_cost is null then 'actual_cost_missing'
    when target_actual_cost > reservation.reserved_cost then 'overage'
    else 'reconciled'
  end;
  update public.daily_desk_cost_reservations
  set actual_cost = target_actual_cost,
      status = next_status,
      provider_usage = coalesce(target_provider_usage, '{}'::jsonb),
      reconciled_at = now(),
      updated_at = now()
  where id = reservation.id
  returning * into reservation;
  return to_jsonb(reservation);
end;
$$;

create or replace function public.complete_daily_desk_run(
  target_run_id uuid,
  target_worker text,
  target_status text,
  target_prospects jsonb,
  target_shortfall_reason text,
  target_reservation_key uuid default null,
  target_actual_model_id text default null,
  target_provider_usage jsonb default '{}'::jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  run_row public.daily_desk_runs;
  reservation public.daily_desk_cost_reservations;
  candidate jsonb;
  citation jsonb;
  evidence jsonb;
  card_row public.daily_desk_prospect_cards;
  company text;
  website text;
  role_name text;
  contact text;
  subject text;
  body text;
  dedup_key text;
  count_prospects integer;
  known_citations text[];
  duplicate_sites integer;
begin
  if not public.private_worker_access()
    or target_run_id is null
    or nullif(trim(target_worker), '') is null
    or target_status not in ('succeeded', 'shortfall', 'failed')
    or jsonb_typeof(coalesce(target_prospects, '[]'::jsonb)) <> 'array'
    or jsonb_typeof(coalesce(target_provider_usage, '{}'::jsonb)) <> 'object' then
    raise exception 'invalid_daily_desk_run_completion' using errcode = '22023';
  end if;
  select * into run_row from public.daily_desk_runs where id = target_run_id for update;
  if not found then raise exception 'daily_desk_run_not_found' using errcode = 'P0002'; end if;
  if run_row.status in ('succeeded', 'shortfall', 'failed') then
    return to_jsonb(run_row) || jsonb_build_object('duplicate', true);
  end if;
  if run_row.status <> 'leased'
    or run_row.leased_by <> trim(target_worker)
    or run_row.lease_expires_at <= now() then
    raise exception 'daily_desk_run_lease_invalid' using errcode = '22023';
  end if;

  select jsonb_array_length(target_prospects) into count_prospects;
  if (target_status = 'succeeded' and (count_prospects <> 2 or nullif(trim(target_shortfall_reason), '') is not null))
    or (target_status = 'shortfall' and (count_prospects > 1 or nullif(trim(target_shortfall_reason), '') is null))
    or (target_status = 'failed' and count_prospects <> 0) then
    raise exception 'invalid_daily_desk_result_shape' using errcode = '22023';
  end if;

  if target_status = 'succeeded' and (target_reservation_key is null or nullif(trim(target_actual_model_id), '') is null) then
    raise exception 'daily_desk_model_cost_required' using errcode = '22023';
  end if;
  if target_status = 'shortfall' and target_reservation_key is null and count_prospects <> 0 then
    raise exception 'daily_desk_model_cost_required' using errcode = '22023';
  end if;
  if target_status = 'shortfall' and target_reservation_key is null and nullif(trim(target_actual_model_id), '') is not null then
    raise exception 'daily_desk_model_cost_required' using errcode = '22023';
  end if;
  if target_reservation_key is not null and target_status <> 'failed' then
    if nullif(trim(target_actual_model_id), '') is null then
      raise exception 'daily_desk_model_cost_required' using errcode = '22023';
    end if;
    select * into reservation
    from public.daily_desk_cost_reservations
    where reservation_key = target_reservation_key and run_id = run_row.id
    for update;
    if not found
      or reservation.status <> 'reconciled'
      or reservation.model_id <> trim(target_actual_model_id) then
      raise exception 'daily_desk_model_cost_unresolved' using errcode = '22023';
    end if;
  end if;

  select count(*) - count(distinct lower(regexp_replace(regexp_replace(value ->> 'officialWebsite', '^https://(www\\.)?', ''), '/$', '')))
  into duplicate_sites
  from jsonb_array_elements(target_prospects);
  if duplicate_sites > 0 then raise exception 'duplicate_daily_desk_prospect' using errcode = '22023'; end if;

  for candidate in select * from jsonb_array_elements(target_prospects) loop
    company := nullif(trim(candidate ->> 'companyName'), '');
    website := nullif(trim(candidate ->> 'officialWebsite'), '');
    role_name := nullif(trim(candidate ->> 'role'), '');
    contact := nullif(trim(candidate ->> 'contactPath'), '');
    subject := nullif(trim(candidate ->> 'draftSubject'), '');
    body := nullif(trim(candidate ->> 'draftBody'), '');
    if company is null or website is null or role_name is null or contact is null or subject is null or body is null
      or website !~* '^https://'
      or contact !~* '^https://'
      or website ~* '^https://(localhost|127\\.0\\.0\\.1|\\[?::1\\]?)(/|$)'
      or contact ~* '^https://(localhost|127\\.0\\.0\\.1|\\[?::1\\]?)(/|$)'
      or jsonb_typeof(candidate -> 'citations') <> 'array'
      or jsonb_array_length(candidate -> 'citations') < 1
      or jsonb_typeof(candidate -> 'observedEvidence') <> 'array'
      or jsonb_array_length(candidate -> 'observedEvidence') < 1 then
      raise exception 'invalid_daily_desk_prospect' using errcode = '22023';
    end if;

    known_citations := array[]::text[];
    for citation in select * from jsonb_array_elements(candidate -> 'citations') loop
      if nullif(trim(citation ->> 'url'), '') is null
        or trim(citation ->> 'url') !~* '^https://'
        or trim(citation ->> 'url') ~* '^https://(localhost|127\\.0\\.0\\.1|\\[?::1\\]?)(/|$)'
        or nullif(trim(citation ->> 'title'), '') is null
        or nullif(trim(citation ->> 'excerpt'), '') is null
        or trim(citation ->> 'url') = any(known_citations) then
        raise exception 'invalid_daily_desk_citation' using errcode = '22023';
      end if;
      known_citations := array_append(known_citations, trim(citation ->> 'url'));
    end loop;
    for evidence in select * from jsonb_array_elements(candidate -> 'observedEvidence') loop
      if nullif(trim(evidence ->> 'claim'), '') is null
        or jsonb_typeof(evidence -> 'citationUrls') <> 'array'
        or jsonb_array_length(evidence -> 'citationUrls') < 1
        or exists (
          select 1 from jsonb_array_elements_text(evidence -> 'citationUrls') as source_url
          where source_url <> all(known_citations)
        ) then
        raise exception 'unsupported_daily_desk_claim' using errcode = '22023';
      end if;
    end loop;

    dedup_key := lower(regexp_replace(regexp_replace(website, '^https://(www\\.)?', ''), '/$', ''));
    insert into public.daily_desk_prospect_cards (
      owner_id, run_id, company_name, official_website_url, deduplication_key,
      consultant_role, contact_path, observed_evidence, citations
    ) values (
      run_row.owner_id, run_row.id, company, website, dedup_key, role_name,
      contact, candidate -> 'observedEvidence', candidate -> 'citations'
    ) returning * into card_row;
    insert into public.daily_desk_follow_ups (
      owner_id, run_id, prospect_card_id, subject, body
    ) values (
      run_row.owner_id, run_row.id, card_row.id, subject, body
    ) on conflict (prospect_card_id) do nothing;
  end loop;

  update public.daily_desk_runs
  set status = target_status,
      produced_prospect_count = count_prospects,
      shortfall_reason = case when target_status = 'shortfall' then trim(target_shortfall_reason) else null end,
      lease_expires_at = null,
      provider_usage = coalesce(target_provider_usage, '{}'::jsonb),
      completed_at = now(),
      updated_at = now()
  where id = run_row.id
  returning * into run_row;
  return to_jsonb(run_row) || jsonb_build_object('duplicate', false);
end;
$$;

create or replace function public.record_daily_desk_follow_up_decision(
  target_follow_up_id uuid,
  target_decision text,
  target_subject text,
  target_body text,
  target_deferred_until date,
  target_note text,
  target_idempotency_key uuid
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  actor_id uuid := auth.uid();
  follow_up public.daily_desk_follow_ups;
  existing public.daily_desk_decisions;
  next_state text;
  normalized_subject text := nullif(trim(target_subject), '');
  normalized_body text := nullif(trim(target_body), '');
  normalized_note text := coalesce(trim(target_note), '');
  details jsonb;
begin
  if actor_id is null or not public.is_admin(actor_id) or target_follow_up_id is null
    or target_idempotency_key is null
    or target_decision not in ('edit', 'ready', 'defer', 'complete', 'reopen', 'reject')
    or length(normalized_note) > 2000 then
    raise exception 'invalid_daily_desk_follow_up_decision' using errcode = '22023';
  end if;
  details := jsonb_build_object(
    'subject', normalized_subject,
    'body', normalized_body,
    'deferredUntil', target_deferred_until
  );
  select * into existing from public.daily_desk_decisions where idempotency_key = target_idempotency_key;
  if found then
    if existing.owner_id <> actor_id
      or existing.resource_type <> 'follow_up'
      or existing.resource_id <> target_follow_up_id
      or existing.decision <> target_decision
      or existing.note <> normalized_note
      or existing.details <> details then
      raise exception 'daily_desk_decision_conflict' using errcode = '23505';
    end if;
    select * into follow_up from public.daily_desk_follow_ups where id = target_follow_up_id;
    return to_jsonb(follow_up) || jsonb_build_object('duplicate', true);
  end if;

  select * into follow_up
  from public.daily_desk_follow_ups
  where id = target_follow_up_id and owner_id = actor_id
  for update;
  if not found then raise exception 'daily_desk_follow_up_not_found' using errcode = 'P0002'; end if;

  next_state := case target_decision
    when 'edit' then 'draft'
    when 'ready' then 'ready'
    when 'defer' then 'deferred'
    when 'complete' then 'completed'
    when 'reopen' then 'draft'
    when 'reject' then 'rejected'
  end;
  if (follow_up.state = 'completed' and target_decision not in ('reopen'))
    or (follow_up.state = 'rejected' and target_decision not in ('reopen')) then
    raise exception 'daily_desk_follow_up_not_actionable' using errcode = '22023';
  end if;
  if target_decision = 'edit' and (normalized_subject is null or normalized_body is null) then
    raise exception 'daily_desk_follow_up_edit_required' using errcode = '22023';
  end if;
  if target_decision = 'defer' and (target_deferred_until is null or target_deferred_until <= current_date) then
    raise exception 'daily_desk_follow_up_defer_date_required' using errcode = '22023';
  end if;

  insert into public.daily_desk_decisions (
    owner_id, resource_type, resource_id, decision, before_state, after_state,
    note, details, idempotency_key
  ) values (
    actor_id, 'follow_up', follow_up.id, target_decision, follow_up.state,
    next_state, normalized_note, details, target_idempotency_key
  );
  update public.daily_desk_follow_ups
  set state = next_state,
      subject = case when target_decision = 'edit' then normalized_subject else subject end,
      body = case when target_decision = 'edit' then normalized_body else body end,
      deferred_until = case when target_decision = 'defer' then target_deferred_until else null end,
      completed_at = case when target_decision = 'complete' then now() else null end,
      updated_at = now()
  where id = follow_up.id
  returning * into follow_up;
  return to_jsonb(follow_up) || jsonb_build_object('duplicate', false);
end;
$$;

create or replace function public.ensure_daily_desk_social_asset(target_run_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  actor_id uuid := auth.uid();
  asset_row public.daily_desk_social_assets;
begin
  if actor_id is null or not public.is_admin(actor_id) or target_run_id is null then
    raise exception 'daily_desk_owner_required' using errcode = '42501';
  end if;
  perform 1 from public.daily_desk_runs where id = target_run_id and owner_id = actor_id;
  if not found then raise exception 'daily_desk_run_not_found' using errcode = 'P0002'; end if;
  insert into public.daily_desk_social_assets (owner_id, run_id)
  values (actor_id, target_run_id)
  on conflict (run_id) do nothing;
  select * into asset_row from public.daily_desk_social_assets where run_id = target_run_id for update;
  return to_jsonb(asset_row);
end;
$$;

create or replace function public.record_daily_desk_social_version(
  target_asset_id uuid,
  target_version_id uuid,
  target_storage_path text,
  target_caption text,
  target_alt_text text,
  target_graphic_sha256 text,
  target_graphic_tokens jsonb default '{}'::jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  actor_id uuid := auth.uid();
  asset_row public.daily_desk_social_assets;
  version_row public.daily_desk_social_asset_versions;
  expected_path text;
  next_version integer;
begin
  if actor_id is null or not public.is_admin(actor_id)
    or target_asset_id is null
    or target_version_id is null
    or nullif(trim(target_caption), '') is null
    or nullif(trim(target_alt_text), '') is null
    or trim(target_graphic_sha256) !~ '^[a-f0-9]{64}$'
    or jsonb_typeof(coalesce(target_graphic_tokens, '{}'::jsonb)) <> 'object' then
    raise exception 'invalid_daily_desk_social_version' using errcode = '22023';
  end if;
  select * into asset_row
  from public.daily_desk_social_assets
  where id = target_asset_id and owner_id = actor_id
  for update;
  if not found then raise exception 'daily_desk_social_asset_not_found' using errcode = 'P0002'; end if;
  expected_path := 'daily-desk/' || actor_id::text || '/' || asset_row.id::text || '/' || target_version_id::text || '.svg';
  if trim(target_storage_path) <> expected_path then
    raise exception 'daily_desk_social_storage_path_invalid' using errcode = '22023';
  end if;
  select * into version_row from public.daily_desk_social_asset_versions where id = target_version_id;
  if found then
    if version_row.owner_id <> actor_id
      or version_row.asset_id <> asset_row.id
      or version_row.storage_path <> expected_path
      or version_row.caption <> trim(target_caption)
      or version_row.alt_text <> trim(target_alt_text)
      or version_row.graphic_sha256 <> trim(target_graphic_sha256)
      or version_row.graphic_tokens <> target_graphic_tokens then
      raise exception 'daily_desk_social_version_conflict' using errcode = '23505';
    end if;
    return to_jsonb(version_row) || jsonb_build_object('duplicate', true);
  end if;
  select coalesce(max(version_number), 0) + 1 into next_version
  from public.daily_desk_social_asset_versions where asset_id = asset_row.id;
  insert into public.daily_desk_social_asset_versions (
    id, owner_id, asset_id, version_number, storage_path, caption, alt_text,
    graphic_sha256, graphic_tokens
  ) values (
    target_version_id, actor_id, asset_row.id, next_version, expected_path,
    trim(target_caption), trim(target_alt_text), trim(target_graphic_sha256), target_graphic_tokens
  ) returning * into version_row;
  update public.daily_desk_social_assets
  set current_version_id = version_row.id, status = 'draft', updated_at = now()
  where id = asset_row.id;
  return to_jsonb(version_row) || jsonb_build_object('duplicate', false);
end;
$$;

create or replace function public.record_daily_desk_social_decision(
  target_asset_id uuid,
  target_decision text,
  target_note text,
  target_idempotency_key uuid
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  actor_id uuid := auth.uid();
  asset_row public.daily_desk_social_assets;
  existing public.daily_desk_decisions;
  next_state text;
  normalized_note text := coalesce(trim(target_note), '');
begin
  if actor_id is null or not public.is_admin(actor_id)
    or target_asset_id is null
    or target_idempotency_key is null
    or target_decision not in ('approve', 'revise', 'reject')
    or length(normalized_note) > 2000 then
    raise exception 'invalid_daily_desk_social_decision' using errcode = '22023';
  end if;
  select * into existing from public.daily_desk_decisions where idempotency_key = target_idempotency_key;
  if found then
    if existing.owner_id <> actor_id
      or existing.resource_type <> 'social_asset'
      or existing.resource_id <> target_asset_id
      or existing.decision <> target_decision
      or existing.note <> normalized_note then
      raise exception 'daily_desk_decision_conflict' using errcode = '23505';
    end if;
    select * into asset_row from public.daily_desk_social_assets where id = target_asset_id;
    return to_jsonb(asset_row) || jsonb_build_object('duplicate', true);
  end if;
  select * into asset_row
  from public.daily_desk_social_assets
  where id = target_asset_id and owner_id = actor_id
  for update;
  if not found or asset_row.current_version_id is null then
    raise exception 'daily_desk_social_asset_not_ready' using errcode = 'P0002';
  end if;
  if asset_row.status = 'rejected' and target_decision <> 'revise' then
    raise exception 'daily_desk_social_asset_not_actionable' using errcode = '22023';
  end if;
  next_state := case target_decision
    when 'approve' then 'ready_for_manual_posting'
    when 'revise' then 'draft'
    when 'reject' then 'rejected'
  end;
  insert into public.daily_desk_decisions (
    owner_id, resource_type, resource_id, decision, before_state, after_state,
    note, idempotency_key
  ) values (
    actor_id, 'social_asset', asset_row.id, target_decision, asset_row.status,
    next_state, normalized_note, target_idempotency_key
  );
  update public.daily_desk_social_assets
  set status = next_state, updated_at = now()
  where id = asset_row.id
  returning * into asset_row;
  return to_jsonb(asset_row) || jsonb_build_object('duplicate', false);
end;
$$;

create or replace function public.record_daily_desk_outcome(
  target_prospect_card_id uuid,
  target_follow_up_id uuid,
  target_outcome_type text,
  target_notes text,
  target_occurred_at timestamptz,
  target_idempotency_key uuid
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  actor_id uuid := auth.uid();
  card_row public.daily_desk_prospect_cards;
  follow_up_row public.daily_desk_follow_ups;
  outcome_row public.daily_desk_outcomes;
begin
  if actor_id is null or not public.is_admin(actor_id)
    or target_prospect_card_id is null
    or target_idempotency_key is null
    or target_outcome_type not in ('qualified_sales_conversation', 'reply', 'meeting', 'not_a_fit', 'customer', 'note')
    or nullif(trim(target_notes), '') is null
    or length(trim(target_notes)) > 4000 then
    raise exception 'invalid_daily_desk_outcome' using errcode = '22023';
  end if;
  select * into outcome_row from public.daily_desk_outcomes where idempotency_key = target_idempotency_key;
  if found then
    if outcome_row.owner_id <> actor_id
      or outcome_row.prospect_card_id <> target_prospect_card_id
      or outcome_row.follow_up_id is distinct from target_follow_up_id
      or outcome_row.outcome_type <> target_outcome_type
      or outcome_row.notes <> trim(target_notes) then
      raise exception 'daily_desk_outcome_conflict' using errcode = '23505';
    end if;
    return to_jsonb(outcome_row) || jsonb_build_object('duplicate', true);
  end if;
  select * into card_row from public.daily_desk_prospect_cards where id = target_prospect_card_id and owner_id = actor_id;
  if not found then raise exception 'daily_desk_prospect_not_found' using errcode = 'P0002'; end if;
  if target_follow_up_id is not null then
    select * into follow_up_row from public.daily_desk_follow_ups where id = target_follow_up_id and owner_id = actor_id;
    if not found or follow_up_row.prospect_card_id <> card_row.id then
      raise exception 'daily_desk_follow_up_not_found' using errcode = 'P0002';
    end if;
  end if;
  insert into public.daily_desk_outcomes (
    owner_id, prospect_card_id, follow_up_id, outcome_type, notes, occurred_at,
    recorded_by, idempotency_key
  ) values (
    actor_id, card_row.id, target_follow_up_id, target_outcome_type,
    trim(target_notes), coalesce(target_occurred_at, now()), actor_id, target_idempotency_key
  ) returning * into outcome_row;
  return to_jsonb(outcome_row) || jsonb_build_object('duplicate', false);
end;
$$;

create or replace function public.prevent_daily_desk_decision_mutation()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if public.private_worker_access() then
    return case when tg_op = 'DELETE' then old else new end;
  end if;
  raise exception 'daily_desk_decisions_are_immutable' using errcode = '55006';
end;
$$;

create or replace function public.prevent_daily_desk_social_version_mutation()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if public.private_worker_access() then
    return case when tg_op = 'DELETE' then old else new end;
  end if;
  raise exception 'daily_desk_social_versions_are_immutable' using errcode = '55006';
end;
$$;

create trigger daily_desk_runs_updated_at
  before update on public.daily_desk_runs
  for each row execute function public.update_updated_at_column();
create trigger daily_desk_follow_ups_updated_at
  before update on public.daily_desk_follow_ups
  for each row execute function public.update_updated_at_column();
create trigger daily_desk_social_assets_updated_at
  before update on public.daily_desk_social_assets
  for each row execute function public.update_updated_at_column();
create trigger daily_desk_cost_reservations_updated_at
  before update on public.daily_desk_cost_reservations
  for each row execute function public.update_updated_at_column();
create trigger prevent_daily_desk_decision_mutation
  before update or delete on public.daily_desk_decisions
  for each row execute function public.prevent_daily_desk_decision_mutation();
create trigger prevent_daily_desk_social_version_mutation
  before update or delete on public.daily_desk_social_asset_versions
  for each row execute function public.prevent_daily_desk_social_version_mutation();

revoke all on function public.create_daily_desk_operating_brief(text, text, text, text, text) from public, anon;
revoke all on function public.prepare_daily_desk_run(uuid, date) from public, anon;
revoke all on function public.claim_daily_desk_run(uuid, text, integer) from public, anon, authenticated;
revoke all on function public.claim_next_daily_desk_run(text, integer) from public, anon, authenticated;
revoke all on function public.reserve_daily_desk_cost(uuid, uuid, text, uuid, text, numeric, numeric, jsonb, text) from public, anon, authenticated;
revoke all on function public.record_daily_desk_model_route(uuid, uuid, text, text, numeric, jsonb, text) from public, anon, authenticated;
revoke all on function public.reconcile_daily_desk_cost(uuid, numeric, jsonb) from public, anon, authenticated;
revoke all on function public.complete_daily_desk_run(uuid, text, text, jsonb, text, uuid, text, jsonb) from public, anon, authenticated;
revoke all on function public.record_daily_desk_follow_up_decision(uuid, text, text, text, date, text, uuid) from public, anon;
revoke all on function public.ensure_daily_desk_social_asset(uuid) from public, anon;
revoke all on function public.record_daily_desk_social_version(uuid, uuid, text, text, text, text, jsonb) from public, anon;
revoke all on function public.record_daily_desk_social_decision(uuid, text, text, uuid) from public, anon;
revoke all on function public.record_daily_desk_outcome(uuid, uuid, text, text, timestamptz, uuid) from public, anon;

grant execute on function public.create_daily_desk_operating_brief(text, text, text, text, text) to authenticated;
grant execute on function public.prepare_daily_desk_run(uuid, date) to authenticated, service_role;
grant execute on function public.claim_daily_desk_run(uuid, text, integer) to service_role;
grant execute on function public.claim_next_daily_desk_run(text, integer) to service_role;
grant execute on function public.reserve_daily_desk_cost(uuid, uuid, text, uuid, text, numeric, numeric, jsonb, text) to service_role;
grant execute on function public.record_daily_desk_model_route(uuid, uuid, text, text, numeric, jsonb, text) to service_role;
grant execute on function public.reconcile_daily_desk_cost(uuid, numeric, jsonb) to service_role;
grant execute on function public.complete_daily_desk_run(uuid, text, text, jsonb, text, uuid, text, jsonb) to service_role;
grant execute on function public.record_daily_desk_follow_up_decision(uuid, text, text, text, date, text, uuid) to authenticated;
grant execute on function public.ensure_daily_desk_social_asset(uuid) to authenticated;
grant execute on function public.record_daily_desk_social_version(uuid, uuid, text, text, text, text, jsonb) to authenticated;
grant execute on function public.record_daily_desk_social_decision(uuid, text, text, uuid) to authenticated;
grant execute on function public.record_daily_desk_outcome(uuid, uuid, text, text, timestamptz, uuid) to authenticated;
