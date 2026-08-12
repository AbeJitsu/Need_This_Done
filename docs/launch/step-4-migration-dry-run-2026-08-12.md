# Step 4 hosted migration dry-run evidence — 2026-08-12

This is the detailed evidence record for [launch checklist item 4](LAUNCH_CHECKLIST.md#4-run-the-hosted-migration-dry-run). It records the read-only review without duplicating the full migration contents in the checklist or status ledger.

## Outcome

- **Read-only procedure:** complete; supabase db push --dry-run exited successfully.
- **Checklist status:** PENDING_APPROVAL; the migration reviewer and database owner have not approved the exact change set.
- **Target:** hosted Supabase project oxhjtmozsdstbokwtnwa at https://oxhjtmozsdstbokwtnwa.supabase.co.
- **Repository:** local dev, origin/dev, and the remote dev ref resolve to 4745e34be2fe602531929b35f15c3040fb50663e; runtime candidate 2cbcb38 remains an ancestor, and production remains 8b8d42966b430b53e991c39891525b0fee9d4c63.
- **Hosted history verification:** a read-only supabase migration list after the dry run still shows remote migrations through 072 and local-only migrations 073–092.
- **Backup reference:** /Users/abiezerreyes/Documents/NeedThisDone Backups/2026-08-11-pre-migration-072-url-retry; its eight-artifact SHA-256 manifest passed again, with one private project-attachments bucket and 217 object metadata records. Object contents were not downloaded.
- **Hosted change:** none. The dry run only inspected the linked project and listed migrations; no migration, row, bucket, provider, secret, or deployment write was attempted.

The first sandboxed invocation could not resolve the Supabase API hostname. The same read-only command was rerun with approved network access and succeeded. No hosted state changed during either invocation.

## Dry-run transcript

Credentials were loaded from .env.cloud.profile without printing their values. Supabase CLI version was 2.65.5.

~~~text
DRY RUN: migrations will *not* be pushed to the database.
Connecting to remote database...
Would push these migrations:
 • 073_secure_google_calendar_tokens.sql
 • 074_create_private_project_attachments_bucket.sql
 • 075_add_financial_ai_employee_outcomes.sql
 • 076_remove_local_only_legacy_schema.sql
 • 077_remove_content_and_search_schema.sql
 • 078_remove_marketplace_and_commerce_schema.sql
 • 079_operable_internal_pilot.sql
 • 080_fix_pilot_timezone_queue_author.sql
 • 081_require_completion_evidence.sql
 • 082_prospecting_outreach.sql
 • 083_daily_cockpit.sql
 • 084_bound_model_evaluation_budget.sql
 • 085_private_prospect_research_suite.sql
 • 086_agent_operations_dashboard.sql
 • 087_configured_openrouter_models.sql
 • 088_agent_planner_openclaw_adapter.sql
 • 089_agent_planner_write_boundary.sql
 • 090_fix_agent_plan_dispatch_aggregate.sql
 • 091_openclaw_claim_boundary.sql
 • 092_agent_plan_fail_closed_validation.sql
Finished supabase db push.
~~~

## Statement classification

| Migration | Database effects | Risk and external-effect review |
| --- | --- | --- |
| 073 | Alters Calendar-token columns; replaces secure-definer encryption/decryption functions; revokes broad function access and grants service_role. | Sensitive credential-boundary change. It does not call Google or create Calendar events. |
| 074 | Upserts private project-attachments bucket metadata, including 5 MiB limit and MIME allowlist. | No object movement or deletion. Hosted metadata currently has the bucket private and 5 MiB but allowed_mime_types is null; this is known normalization drift. |
| 075 | Adds financial outcome columns, replaces validation, and adds an index. | Additive; no row rewrite or external effect. |
| 076 | Dynamically drops legacy policies/triggers, then drops listed functions, view, tables, and type with RESTRICT. | Destructive retirement. Unexpected dependencies fail closed; reviewer must accept the exact legacy-object list. |
| 077 | Drops retired content/search/media policies, routines, views, and tables; explicitly deletes media-library and product-images Storage rows and objects. | Destructive Storage/schema cleanup. The protected inventory contains neither named bucket, but approval is still required. |
| 078 | Drops retired commerce views, functions, tables, constraints, and the explicit hosted Medusa table list/schema with RESTRICT. | Highest-risk cleanup. The protected schema includes the medusa schema and legacy public commerce/content objects; reviewer must accept dependency and retained-data findings before apply. |
| 079 | Alters project/work-item/outcome constraints and indexes; adds secure pilot RPCs; narrows table and function grants. | Additive workflow/security boundary; no external action. |
| 080 | Adds work-item author data and replaces timezone-aware queue RPC. | Additive audit behavior; no external effect. |
| 081 | Tightens completion-evidence validation and replaces the completion RPC. | Validation/security tightening; no external effect. |
| 082 | Creates prospecting, outreach, suppression, task, event, nonce, sender, and outcome tables with indexes, RLS, policies, grants, and routines. | Additive approval-gated data boundary; provider side effects remain outside SQL. |
| 083 | Creates weekly-priority, cockpit-action, and reflection tables with indexes, RLS, policies, grants, and update triggers. | Additive operator records; no external action. |
| 084 | Updates existing growth_profiles to evaluation-required, clears fallback, caps daily model spend at $0.25, changes defaults/constraint, and creates evaluation records with RLS/grants. | Internal data mutation plus fail-closed model boundary. It does not call a model or provider; affected hosted-row count still needs owner review. |
| 085 | Alters growth-profile model fields/constraints; creates benchmark candidates, usage ledger, and prospect dossiers with RLS/grants and service-role routines. | Additive research boundary; no provider activation or outbound message. |
| 086 | Creates agent-operation tables, indexes, RLS/policies, triggers, routines, and grants; upserts private agent-media-private bucket and read policy. | Additive operational boundary. Current Storage inventory does not contain this bucket, so creation is expected; no media is sent or published. |
| 087 | Tightens model-route/candidate constraints and replaces route, pin, claim, queue, usage, and dossier routines/grants. | Fail-closed model selection; no provider call or model pin occurs in SQL. |
| 088 | Creates planner, plan-event, usage-reservation, and provenance tables; alters run/task/dossier tables; adds indexes, RLS, routines, and grants. | Draft-only planner and approval/freeze boundary; no OpenClaw execution or external action. |
| 089 | Replaces the plan read policy and removes direct authenticated plan writes, leaving authenticated select access. | Direct-write hardening; no data deletion or external effect. |
| 090 | Replaces the dispatch RPC to correct its aggregate/result query. | Narrow function repair; transaction remains all-or-nothing. |
| 091 | Replaces the OpenClaw claim RPC and restricts it to the private worker/service-role boundary. | Claim-boundary hardening; no worker is activated. |
| 092 | Adds fail-closed planner safety checks and replaces payload/result validation with restricted grants. | Safety validation tightening; no external effect. |

## Drift decision

The dry-run list exactly matches the repository migrations 073–092 and the retained local contract. The review found known, explainable hosted differences rather than an unexplained generated diff:

1. 074 normalizes the existing private project-attachment bucket's missing MIME allowlist.
2. 076–078 intentionally retire legacy objects. The hosted schema snapshot shows the medusa schema and retired public objects, so this is a deliberate cleanup decision—not permission to delete without review.
3. 084 changes existing growth-profile rows; the dry run proves the SQL is selected, not the number or business meaning of affected hosted rows.
4. 086 creates the expected private agent-media bucket, which is absent from the current Storage inventory.

**Decision:** no unexplained migration omission or provider-side action was found, but Step 4 cannot pass yet. The migration reviewer and database owner must explicitly approve the destructive 076–078 cleanup, the 074 bucket normalization, and the 084 data mutation before any hosted write. Step 5 remains a separate approval for applying the reviewed set.

## Review fingerprint

These SHA-256 values identify the exact migration files reviewed:

~~~text
d8871e86bec0b2808f84c0d2e2404171053f5ea22210bcb84379c6e9c4fb5ff9  073_secure_google_calendar_tokens.sql
08f40d62f535adcef3cce308cd2aaee805c183e21eb3cd051f9d60bd6ede2c35  074_create_private_project_attachments_bucket.sql
be85004558e61648abd4cd6709fc9dfb77ba7cee0d5b19cc874a2bc268614a8d  075_add_financial_ai_employee_outcomes.sql
5281677e52a2770ca8e000cd533b16a5ca84cbbb65c3199426557653abde880b  076_remove_local_only_legacy_schema.sql
66ba4d17c6c8fef0e16400507ccb4af2568f8a833c5c5ceaa55b4c996cdb9e44  077_remove_content_and_search_schema.sql
f7eb7f7c358bfb24dd452923e4f3b978024e380db735ce2404382c1bd9b82330  078_remove_marketplace_and_commerce_schema.sql
ea5859d62da186ef46389d4cd9f2779ea3561f566476b4a201ec59409c705147  079_operable_internal_pilot.sql
eb9a3e80f3fbe90d91d31b517938078653828194fb8be2c7c1dd050853ed733a  080_fix_pilot_timezone_queue_author.sql
1f482dde762cf19d2649242551f63577c735d8083cc4ab06576866889c8067ae  081_require_completion_evidence.sql
27ed3d1c2198d7ffbf3fa84ba5f8fe0dacbf50887bab937cd806123829de2c6b  082_prospecting_outreach.sql
b8f62ca99c1b4bf8e335eef70842e181ebec9136579bc33c36906cf8dfc34bea  083_daily_cockpit.sql
78b1093ad68347b01258384b5183f09b5a757727756dee6378f15c8c1c455aa6  084_bound_model_evaluation_budget.sql
c26bcd23b6326bde5ffad2c116a822672ba7b342e74b75cb25dddba21181e389  085_private_prospect_research_suite.sql
f2de035dbb81317ecbcec3c0189a150954c8e908f6f080adc5ba45aa1b74c080  086_agent_operations_dashboard.sql
b5d5d8b8875b0ae2c50418aa0697c2429953390a2df431abed95a8bab60582f9  087_configured_openrouter_models.sql
c9fc68358673d1d9daf32503addd135cc16d6c80e3b5ac0811d4d2ba0aabf26a  088_agent_planner_openclaw_adapter.sql
aa80b8113f95e75cc26ee57228cb82f710a5ed74db7aec7838648a96989f2ddd  089_agent_planner_write_boundary.sql
d61001eed927bbdd1b990d5fb5d6d27cd828bde41478c2390f5168bef6c71928  090_fix_agent_plan_dispatch_aggregate.sql
0e690e54d38365274c5767bc75206b559f645d5f8e7e3746a615fda7c823bbad  091_openclaw_claim_boundary.sql
8920afeece692d56df4f28bfdfa1c7eca9e7f86d0235032dd7da46bd4253ffde  092_agent_plan_fail_closed_validation.sql
~~~

## Approval and rollback

The requesting owner authorized this read-only dry run on 2026-08-12. That authorization does not approve a hosted write. Required migration-reviewer and database-owner approval is still outstanding.

No hosted rollback is needed because no hosted state changed. Preserve the backup, repair or replace any disputed migration, and rerun this dry run. Never reset hosted Supabase or reverse a hosted migration destructively.
