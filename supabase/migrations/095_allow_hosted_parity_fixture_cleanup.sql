-- Allow the internal hosted parity inspector to remove only its disposable
-- fixture history after a run.
--
-- Root cause: agent run history and artifact versions are intentionally
-- immutable, so the inspector's service-role cleanup could not remove the
-- records it created. This exception is limited to the reserved
-- ntd-parity-*@fixture.invalid identity namespace and the service identity.
-- Normal customer history remains immutable; browser roles do not gain any
-- worker or deletion capability. No customer or prospect recipient is used.
-- Verification: the hosted parity verifier must report zero cleanup errors,
-- zero remaining fixture users, and all immutable-history tests must remain
-- green.
-- Rollback: preserve the forward migration history and use a later reviewed
-- repair if the reserved fixture namespace changes; never disable these
-- triggers manually in the hosted project.

create or replace function public.prevent_agent_artifact_version_mutation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if public.private_worker_access()
    and exists (
      select 1
      from auth.users
      where id = old.owner_id
        and email like 'ntd-parity-%@fixture.invalid'
    ) then
    return old;
  end if;
  raise exception 'agent_artifact_versions_are_immutable' using errcode = '55006';
end;
$$;

create or replace function public.prevent_agent_history_mutation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if public.private_worker_access()
    and exists (
      select 1
      from auth.users
      where id = old.owner_id
        and email like 'ntd-parity-%@fixture.invalid'
    ) then
    return old;
  end if;
  raise exception 'agent_history_is_immutable' using errcode = '55006';
end;
$$;
