-- ============================================================================
-- Site Reports Table
-- ============================================================================
-- Stores results from the public site analyzer tool.
-- Users enter a URL + email and get a scored report with AI analysis.
-- Reports are publicly readable by UUID (URL = access token, no auth needed).

create table public.site_reports (
  id                uuid primary key default gen_random_uuid(),
  url               text not null,
  email             text not null,
  score             integer not null,
  grade             text not null,
  categories        jsonb not null,
  accessibility     jsonb not null,
  metrics           jsonb not null,
  ai_analysis       text not null,
  executive_summary text not null,
  pages_crawled     integer not null,
  created_at        timestamptz default now()
);

-- Enable RLS
alter table public.site_reports enable row level security;

-- Anyone can read by ID (the UUID in the URL acts as the access token)
create policy "Public read" on public.site_reports
  for select using (true);

-- Inserts only via service role (API route uses admin client)
-- The "with check (false)" blocks anon/authenticated inserts via RLS,
-- but service role bypasses RLS entirely so it can still insert.
create policy "No direct insert" on public.site_reports
  for insert with check (false);
