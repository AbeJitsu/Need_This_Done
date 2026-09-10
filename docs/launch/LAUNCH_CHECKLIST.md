# NeedThisDone hosted-promotion checklist

Use this only after a separate owner approval for the specific promotion. No
item authorizes a later item.

1. Freeze and review the exact `dev` commit and local evidence.
2. Create and verify a recoverable hosted backup.
3. Review the intended forward migrations and run a dry run using
   `scripts/hosted-migration-stages.json`.
4. Obtain separate approval, then apply the reviewed migrations; rollback is
   forward-only.
5. Deploy the reviewed application commit.
6. Provision or rotate only the secrets needed for the approved scope.
7. Run the explicitly approved bounded provider or worker canary.
8. Record result, monitoring, rollback owner, and a go/no-go decision before
   any broader activation.

Never reset hosted Supabase, expose the Mac mini publicly, or treat local tests
as hosted, provider, or customer proof.

Current promotion record (2026-09-04): the disposable-local `106 → 110 → 111`
rehearsal and database gate passed, with `107`–`109` absent. Hosted has not
changed. For each of `110_harden_hermes_frozen_plan_claims.sql` and
`111_split_hermes_planner_and_openclaw_executor_models.sql`, record a distinct
fresh protected backup, exact reviewed-commit dry run, named hosted-write
approval, one-time application, migration-history and narrow contract check,
and forward-only rollback owner before proceeding to the next migration.

Current account-authentication record (2026-09-10): migration
`113_mcp_access_tokens.sql` and the site-account MCP boundary are implemented
on `codex/mcp-account-auth-rebuild`, but hosted migration 113, hosted secrets,
deployment, and remote MCP reachability remain pending. The owner signs in to
NeedThisDone, creates an owner-scoped credential in Account Settings, and uses
its bearer value for `/api/mcp`; Hermes/OpenClaw credentials remain separate on
the worker host. Raw values are shown once and only hashes are stored. Before
any hosted action, run the disposable local Supabase/RLS proof, review a
recoverable backup and dry run, obtain separate approval for migration 113 and
secrets/deployment, and record a reviewed forward-revert owner. Do not mark
hosted migration 113, deployment, worker activation, vector runtime, durable
Hermes dispatch, or any hosted checklist control complete from local tests.
