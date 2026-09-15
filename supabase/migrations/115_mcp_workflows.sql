-- Durable, approval-gated workflow drafts submitted through the MCP control plane.
--
-- Purpose: persist a compatible LLM client's request before a plan, worker, or
-- provider is selected. This is the single request record for the MCP path; it
-- is not a task queue and creates no worker command.
-- Impact: adds an owner-scoped request and review boundary. It does not enable
-- Hermes, OpenClaw, a Mac worker, hosted MCP access, or an external action.
-- Data handling: stores the bounded request, its SHA-256 idempotency
-- fingerprint, status, and reviewable summary. It stores no bearer token,
-- provider secret, worker credential, or raw private asset.
-- Verification: run focused dispatcher tests plus the disposable local
-- mcp-workflows RLS test before separately reviewing any hosted migration.
-- Rollback: deploy the prior application version. Any hosted correction must
-- be a reviewed forward migration; do not reset or delete workflow history.

create table public.mcp_workflows (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  request text not null,
  request_hash text not null,
  idempotency_key uuid not null,
  status text not null default 'draft'
    check (status in ('draft', 'awaiting_approval', 'queued', 'running', 'completed', 'failed', 'stopped')),
  approval_required boolean not null default true,
  worker text,
  summary text not null default 'Awaiting review. No worker has been assigned.',
  result_ref text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint mcp_workflows_request_check
    check (length(btrim(request)) between 1 and 12000),
  constraint mcp_workflows_request_hash_check
    check (request_hash ~ '^[0-9a-f]{64}$'),
  constraint mcp_workflows_worker_check
    check (worker is null or length(btrim(worker)) between 1 and 160),
  constraint mcp_workflows_summary_check
    check (length(btrim(summary)) between 1 and 2000),
  constraint mcp_workflows_result_ref_check
    check (result_ref is null or length(btrim(result_ref)) between 1 and 512),
  constraint mcp_workflows_approval_state_check
    check ((status in ('draft', 'awaiting_approval')) = approval_required),
  unique (owner_id, idempotency_key)
);

create index mcp_workflows_owner_updated_idx
  on public.mcp_workflows (owner_id, updated_at desc, id desc);

alter table public.mcp_workflows enable row level security;

-- An authenticated owner may review their own workflow history. The MCP route
-- uses the service role after it resolves the owner from a bearer credential.
create policy "authenticated owners read MCP workflows" on public.mcp_workflows
  for select using (owner_id = auth.uid());

revoke all on table public.mcp_workflows from public, anon, authenticated;
grant select on table public.mcp_workflows to authenticated;
grant select, insert, update, delete on table public.mcp_workflows to service_role;

create trigger update_mcp_workflows_updated_at
  before update on public.mcp_workflows
  for each row execute function public.update_updated_at_column();
