-- Keep Google OAuth credentials encrypted at rest and expose them only through
-- narrowly granted server-side functions. This migration does not create events.

alter table public.google_calendar_tokens
  add column if not exists access_token_encrypted bytea,
  add column if not exists refresh_token_encrypted bytea;

alter table public.google_calendar_tokens
  alter column access_token drop not null,
  alter column refresh_token drop not null;

create or replace function public.store_google_calendar_tokens(
  p_user_id uuid,
  p_access_token text,
  p_refresh_token text,
  p_token_type text,
  p_expires_at timestamptz,
  p_google_email text,
  p_encryption_key text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.role() <> 'service_role' then
    raise exception 'permission denied';
  end if;

  insert into public.google_calendar_tokens (
    user_id,
    access_token,
    refresh_token,
    access_token_encrypted,
    refresh_token_encrypted,
    token_type,
    expires_at,
    google_email,
    updated_at
  ) values (
    p_user_id,
    null,
    null,
    extensions.pgp_sym_encrypt(p_access_token, p_encryption_key),
    extensions.pgp_sym_encrypt(p_refresh_token, p_encryption_key),
    p_token_type,
    p_expires_at,
    p_google_email,
    now()
  )
  on conflict (user_id) do update set
    access_token = null,
    refresh_token = null,
    access_token_encrypted = excluded.access_token_encrypted,
    refresh_token_encrypted = excluded.refresh_token_encrypted,
    token_type = excluded.token_type,
    expires_at = excluded.expires_at,
    google_email = excluded.google_email,
    updated_at = now();
end;
$$;

create or replace function public.get_calendar_access_token(token_id uuid, p_encryption_key text)
returns text
language sql
security definer
stable
set search_path = ''
as $$
  select case
    when auth.role() = 'service_role'
    then extensions.pgp_sym_decrypt(
      (select access_token_encrypted from public.google_calendar_tokens where id = token_id),
      p_encryption_key
    )::text
    else null
  end;
$$;

create or replace function public.get_calendar_refresh_token(token_id uuid, p_encryption_key text)
returns text
language sql
security definer
stable
set search_path = ''
as $$
  select case
    when auth.role() = 'service_role'
    then extensions.pgp_sym_decrypt(
      (select refresh_token_encrypted from public.google_calendar_tokens where id = token_id),
      p_encryption_key
    )::text
    else null
  end;
$$;

revoke all on function public.store_google_calendar_tokens(uuid, text, text, text, timestamptz, text, text) from public, anon, authenticated;
grant execute on function public.store_google_calendar_tokens(uuid, text, text, text, timestamptz, text, text) to service_role;

revoke all on function public.get_calendar_access_token(uuid, text) from public, anon, authenticated;
revoke all on function public.get_calendar_refresh_token(uuid, text) from public, anon, authenticated;
grant execute on function public.get_calendar_access_token(uuid, text) to service_role;
grant execute on function public.get_calendar_refresh_token(uuid, text) to service_role;
