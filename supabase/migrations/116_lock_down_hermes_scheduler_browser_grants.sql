-- Restrict the Hermes scheduler tables to the intended browser read surface.
--
-- Migration 115 enabled RLS and revoked anonymous access, but the hosted
-- project retains broad authenticated table grants by default. RLS blocks
-- ordinary writes without policies, but TRUNCATE is not row-policy governed.
-- Revoke browser writes explicitly and restore only authenticated SELECT.
-- The scheduler materialization RPC remains service-role-only.
--
-- Verification: confirm authenticated SELECT is allowed while INSERT, UPDATE,
-- DELETE, and TRUNCATE are denied; confirm anonymous access remains denied.
-- Rollback: use a separately reviewed forward grant migration; do not restore
-- browser write or truncate privileges on these durable scheduler tables.
revoke all on table public.hermes_schedules, public.hermes_schedule_runs
  from public, anon, authenticated;

grant select on table public.hermes_schedules, public.hermes_schedule_runs
  to authenticated;
