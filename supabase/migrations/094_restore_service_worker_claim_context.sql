-- Restore the private worker boundary inside SECURITY DEFINER functions.
--
-- Root cause: SECURITY DEFINER changes current_user to the function owner
-- (postgres), and the previous guard only checked that value plus a JWT
-- setting that is empty in this hosted execution path. The trusted Supabase
-- auth.role() claim remains available and distinguishes service_role from
-- anonymous/authenticated callers without weakening RLS or function grants.
-- Verification: service-role worker calls must proceed to task selection;
-- anonymous and authenticated callers must still fail closed.
-- Rollback: keep the previous function body only as a forward migration if a
-- later reviewed repair replaces this one; never grant worker functions to a
-- browser role.

create or replace function public.private_worker_access()
returns boolean
language sql
stable
set search_path = public
as $$
  select current_user = 'service_role'
    or coalesce(current_setting('request.jwt.claim.role', true), '') = 'service_role'
    or auth.role() = 'service_role'
$$;
