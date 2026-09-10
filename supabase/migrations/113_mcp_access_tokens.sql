-- NeedThisDone owner-scoped MCP access credentials.
--
-- Purpose: let an authenticated operator create a credential for an LLM client
-- without reusing a browser session or a worker-host credential. The MCP route
-- resolves the owner from a SHA-256 token hash and never needs the raw token.
-- Data handling: only the hash and a short display prefix are durable. Raw
-- values are returned once by the account route and must not be logged.
-- Verification: run the focused MCP token unit/API tests and the local
-- `mcp-access-tokens-rls` proof after rebuilding disposable Supabase. Verify
-- owner scoping, revocation, expiration, last-use updates, constraints, and
-- service-role-only table privileges before any hosted promotion.
-- Rollback: disable the account/MCP routes and revoke affected credentials;
-- any hosted correction is a separately reviewed forward migration. Do not
-- reset hosted Supabase or delete credential history as a rollback shortcut.

create table public.mcp_access_tokens (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  token_hash text not null,
  token_prefix text not null,
  name text not null,
  created_at timestamptz not null default now(),
  last_used_at timestamptz,
  revoked_at timestamptz,
  expires_at timestamptz,
  constraint mcp_access_tokens_token_hash_check
    check (token_hash ~ '^[0-9a-f]{64}$'),
  constraint mcp_access_tokens_token_prefix_check
    check (token_prefix ~ '^ntd_mcp_[A-Za-z0-9_-]{8}$'),
  constraint mcp_access_tokens_name_check
    check (length(btrim(name)) between 1 and 120),
  constraint mcp_access_tokens_expiration_check
    check (expires_at is null or expires_at > created_at)
);

create unique index mcp_access_tokens_token_hash_key
  on public.mcp_access_tokens (token_hash);

create index mcp_access_tokens_owner_created_idx
  on public.mcp_access_tokens (owner_id, created_at desc);

create index mcp_access_tokens_owner_active_idx
  on public.mcp_access_tokens (owner_id, created_at desc)
  where revoked_at is null;

alter table public.mcp_access_tokens enable row level security;

-- Browser roles must not be able to enumerate, create, or revoke credentials.
-- The server-side service identity is the only role used by the account and
-- MCP route implementations.
revoke all on table public.mcp_access_tokens from public, anon, authenticated;
grant select, insert, update, delete on table public.mcp_access_tokens to service_role;
