-- Site reports are rendered through the server-side report route, which
-- fetches an exact UUID with the service role. Anonymous table reads would
-- otherwise expose every report through the public Supabase API.
drop policy if exists "Public read" on public.site_reports;
