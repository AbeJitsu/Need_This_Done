-- Durable, project-scoped GitHub handoffs. Repository membership is managed
-- in GitHub; this application stores only the link and notification outcome.
create table public.project_github_handoffs (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  github_url text not null,
  note text,
  created_by uuid references auth.users(id) on delete set null,
  notification_status text not null default 'pending'
    check (notification_status in ('pending', 'sent', 'failed')),
  notification_attempts integer not null default 0
    check (notification_attempts >= 0),
  notification_sent_at timestamptz,
  notification_provider_id text,
  notification_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.project_github_handoffs enable row level security;

-- Application routes use the service role only after explicit project access
-- checks. No browser-direct table policy is needed.
create index project_github_handoffs_project_created_at_idx
  on public.project_github_handoffs (project_id, created_at desc);

create trigger update_project_github_handoffs_updated_at
  before update on public.project_github_handoffs
  for each row execute function public.update_updated_at_column();
