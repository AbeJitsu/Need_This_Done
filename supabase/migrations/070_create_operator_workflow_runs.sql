-- Durable, human-reviewed operating records. This is deliberately not the
-- retired workflow automation engine: it creates no external side effects.
create table public.workflow_runs (
  id uuid primary key default gen_random_uuid(),
  workflow_type text not null check (workflow_type in ('site_audit', 'lead_follow_up')),
  status text not null default 'pending_review' check (status in ('pending_review', 'approved', 'rejected', 'manual_action_required', 'completed', 'failed')),
  source_type text not null,
  source_id uuid not null,
  idempotency_key text not null unique,
  input jsonb not null default '{}'::jsonb,
  outcome jsonb,
  decided_by uuid references auth.users(id) on delete set null,
  decided_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (source_type, source_id)
);

alter table public.workflow_runs enable row level security;

create policy "Operators can read workflow runs"
  on public.workflow_runs for select
  using (public.is_admin(auth.uid()));

create policy "Operators can update workflow runs"
  on public.workflow_runs for update
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

create index workflow_runs_status_created_at_idx
  on public.workflow_runs (status, created_at desc);

create trigger update_workflow_runs_updated_at
  before update on public.workflow_runs
  for each row execute function public.update_updated_at_column();

create or replace function public.create_site_audit_workflow_run()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.workflow_runs (
    workflow_type,
    source_type,
    source_id,
    idempotency_key,
    input
  ) values (
    'site_audit',
    'site_report',
    new.id,
    'site_audit:' || new.id::text,
    jsonb_build_object('report_id', new.id, 'url', new.url, 'score', new.score)
  )
  on conflict (source_type, source_id) do nothing;

  return new;
end;
$$;

create trigger create_site_audit_workflow_run_after_insert
  after insert on public.site_reports
  for each row execute function public.create_site_audit_workflow_run();
