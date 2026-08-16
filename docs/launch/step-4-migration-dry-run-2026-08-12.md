# Step 4 staged hosted migration review — 2026-08-13

This is the detailed evidence record for [launch checklist item 4](LAUNCH_CHECKLIST.md#4-run-the-hosted-migration-dry-run--passed). It records read-only staged review and local rehearsal. It does not authorize a hosted write.

## Outcome

- **Preparation result:** complete for all six staged dry runs and the cumulative disposable-backup rehearsal.
- **Checklist status:** `PASSED`; the combined deterministic gate passed both required tests.
- **Hosted target:** Supabase project `oxhjtmozsdstbokwtnwa` at `https://oxhjtmozsdstbokwtnwa.supabase.co`.
- **Hosted history:** every before/after read-only check returned 68 rows with latest migration `072`.
- **Protected backup:** `/Users/abiezerreyes/Documents/NeedThisDone Backups/2026-08-11-pre-migration-072-url-retry`; its eight-artifact `SHA256SUMS-FINAL.txt` manifest passed again. The capture contains one private `project-attachments` bucket and 217 object metadata records; object contents were not downloaded.
- **Repository:** the staged worktree contains migrations `073`–`092` in the new order. The machine-readable map and hash verifier passed: 20 unique new versions, 20 unique original versions, and byte-identical SQL for every mapping.
- **Hosted change:** none. No migration, row, Storage object, provider, secret, deployment, or branch write occurred.

## Deterministic Step 4 gate

The review blocker is replaced by one rerunnable command:

```text
cd app && npm run verify:hosted-migration-step4
```

The command exited successfully on 2026-08-13 and emitted a machine-readable summary with `hosted_writes: 0`, `hosted_write_authorized: false`, and Step 5 `PENDING_APPROVAL`.

| Pass | Result | Assertions |
| --- | --- | --- |
| Technical pass | `PASSED` | Mapping verifier passed for all 20 byte-preserved migrations; all six allowlisted stages ran with `--dry-run`; every hosted check remained at 68 rows/latest `072` before and after. |
| Data-impact pass | `PASSED` | `SHA256SUMS-FINAL.txt` verified eight protected-backup artifacts; cumulative local rehearsal passed with five unchanged legacy-inventory assertions; pre-cleanup `page_views` constraint and retained objects were present; retired objects were absent and retained objects present after `092`. |

The gate refuses command-line arguments and does not expose a hosted write mode. Step 4 `PASSED` is review confirmation only. It does not authorize Step 5 or carry approval to another stage.

### Owner retention decision for `090`–`092`

The owner’s retention decision for this review is to preserve the protected backup and defer hosted deletion authorization for the explicit `090`–`092` retirement set until a separate Step 5 decision. The automated data-impact pass proves exactly what those migrations remove and what remains; it does not decide whether hosted deletion is desirable. No hosted deletion, migration, or other write is authorized by this Step 4 result.

The three first-stage attempts completed before a transient CLI login-role/IPv6 connection error appeared. Carrying the linked Supabase metadata into the temporary worktree and retrying resolved it; all six final stage runs passed. The transient connection messages are not migration findings.

## Staged dependency order

Each temporary worktree contains the complete comparison baseline `001`–`072` and only the listed pending stage. The final cleanup is never present in an additive stage.

| Stage | New migrations | Original migrations | Gate | Dependency/risk decision |
| --- | --- | --- | --- | --- |
| Calendar token security | `073` | `073` | Separate | First: encryption columns/functions and narrow server-only grants. No Google call or event. |
| Storage bucket normalization | `074` | `074` | Separate | After `073`: private `project-attachments` metadata only; no object movement/deletion. |
| Additive product/workflow | `075`–`080` | `075`, `079`–`083` | Batch | After bucket review: additive financial, pilot, queue, completion, outreach, and cockpit records. Retired data must remain unchanged. |
| Growth-profile evaluation | `081` | `084` | Separate | After the additive schema exists: evaluates existing `growth_profiles` rows and adds evaluation records. Hosted affected-row meaning requires its own review. |
| Research/agent/planner | `082`–`089` | `085`–`092` | Batch | After growth profiles/evaluation: adds private research, agent, planner, provenance, and worker-boundary records. No provider or worker activation. |
| Destructive retirement | `090`–`092` | `076`–`078` | Final separate gate | Last only: removes retired public objects, Storage buckets/objects, and the hosted Medusa schema. No retention/deletion approval is implied here. |

The first five stages preserve the retired inventory. The final three files are visibly isolated under `destructive-retirement` and require a separate retention decision.

## Immutable old-to-new mapping and hashes

The source commit for the old filenames is `468a7d78ec7229975e115f6f13a1b73dc0a39336`. The verifier reads each old file from that commit and each new file from the worktree; every old/new SHA-256 pair is equal.

| New file | Original file | Stage | Old SHA-256 | New SHA-256 |
| --- | --- | --- | --- | --- |
| `073_secure_google_calendar_tokens.sql` | `073_secure_google_calendar_tokens.sql` | Calendar | `d8871e86bec0b2808f84c0d2e2404171053f5ea22210bcb84379c6e9c4fb5ff9` | `d8871e86bec0b2808f84c0d2e2404171053f5ea22210bcb84379c6e9c4fb5ff9` |
| `074_create_private_project_attachments_bucket.sql` | `074_create_private_project_attachments_bucket.sql` | Storage | `08f40d62f535adcef3cce308cd2aaee805c183e21eb3cd051f9d60bd6ede2c35` | `08f40d62f535adcef3cce308cd2aaee805c183e21eb3cd051f9d60bd6ede2c35` |
| `075_add_financial_ai_employee_outcomes.sql` | `075_add_financial_ai_employee_outcomes.sql` | Additive | `be85004558e61648abd4cd6709fc9dfb77ba7cee0d5b19cc874a2bc268614a8d` | `be85004558e61648abd4cd6709fc9dfb77ba7cee0d5b19cc874a2bc268614a8d` |
| `076_operable_internal_pilot.sql` | `079_operable_internal_pilot.sql` | Additive | `ea5859d62da186ef46389d4cd9f2779ea3561f566476b4a201ec59409c705147` | `ea5859d62da186ef46389d4cd9f2779ea3561f566476b4a201ec59409c705147` |
| `077_fix_pilot_timezone_queue_author.sql` | `080_fix_pilot_timezone_queue_author.sql` | Additive | `eb9a3e80f3fbe90d91d31b517938078653828194fb8be2c7c1dd050853ed733a` | `eb9a3e80f3fbe90d91d31b517938078653828194fb8be2c7c1dd050853ed733a` |
| `078_require_completion_evidence.sql` | `081_require_completion_evidence.sql` | Additive | `1f482dde762cf19d2649242551f63577c735d8083cc4ab06576866889c8067ae` | `1f482dde762cf19d2649242551f63577c735d8083cc4ab06576866889c8067ae` |
| `079_prospecting_outreach.sql` | `082_prospecting_outreach.sql` | Additive | `aacf7027c00e68467b17a5b18179d689cdba2c18622cf95f1c27862f535bdba8` | `aacf7027c00e68467b17a5b18179d689cdba2c18622cf95f1c27862f535bdba8` |
| `080_daily_cockpit.sql` | `083_daily_cockpit.sql` | Additive | `b8f62ca99c1b4bf8e335eef70842e181ebec9136579bc33c36906cf8dfc34bea` | `b8f62ca99c1b4bf8e335eef70842e181ebec9136579bc33c36906cf8dfc34bea` |
| `081_bound_model_evaluation_budget.sql` | `084_bound_model_evaluation_budget.sql` | Growth evaluation | `3eddc921964b5369ded01271c80c891181b0498d96f22b0ac731b367117b2c72` | `3eddc921964b5369ded01271c80c891181b0498d96f22b0ac731b367117b2c72` |
| `082_private_prospect_research_suite.sql` | `085_private_prospect_research_suite.sql` | Research | `b0b99f1566ecf67a68d4545419934392bd96e976514424647d7ff4263633b138` | `b0b99f1566ecf67a68d4545419934392bd96e976514424647d7ff4263633b138` |
| `083_agent_operations_dashboard.sql` | `086_agent_operations_dashboard.sql` | Research | `f2de035dbb81317ecbcec3c0189a150954c8e908f6f080adc5ba45aa1b74c080` | `f2de035dbb81317ecbcec3c0189a150954c8e908f6f080adc5ba45aa1b74c080` |
| `084_configured_openrouter_models.sql` | `087_configured_openrouter_models.sql` | Research | `e900995b5414a7788e6030eb9a60608d24bffad64275bec54ac9e7ecf4d4a126` | `e900995b5414a7788e6030eb9a60608d24bffad64275bec54ac9e7ecf4d4a126` |
| `085_agent_planner_openclaw_adapter.sql` | `088_agent_planner_openclaw_adapter.sql` | Planner | `f3541c19148514f72ad65ddfc9e5a3070e1fb2b720c2fa848b94f1a80817f6da` | `f3541c19148514f72ad65ddfc9e5a3070e1fb2b720c2fa848b94f1a80817f6da` |
| `086_agent_planner_write_boundary.sql` | `089_agent_planner_write_boundary.sql` | Planner | `aa80b8113f95e75cc26ee57228cb82f710a5ed74db7aec7838648a96989f2ddd` | `aa80b8113f95e75cc26ee57228cb82f710a5ed74db7aec7838648a96989f2ddd` |
| `087_fix_agent_plan_dispatch_aggregate.sql` | `090_fix_agent_plan_dispatch_aggregate.sql` | Planner | `d61001eed927bbdd1b990d5fb5d6d27cd828bde41478c2390f5168bef6c71928` | `d61001eed927bbdd1b990d5fb5d6d27cd828bde41478c2390f5168bef6c71928` |
| `088_openclaw_claim_boundary.sql` | `091_openclaw_claim_boundary.sql` | Planner | `0e690e54d38365274c5767bc75206b559f645d5f8e7e3746a615fda7c823bbad` | `0e690e54d38365274c5767bc75206b559f645d5f8e7e3746a615fda7c823bbad` |
| `089_agent_plan_fail_closed_validation.sql` | `092_agent_plan_fail_closed_validation.sql` | Planner | `8920afeece692d56df4f28bfdfa1c7eca9e7f86d0235032dd7da46bd4253ffde` | `8920afeece692d56df4f28bfdfa1c7eca9e7f86d0235032dd7da46bd4253ffde` |
| `090_remove_local_only_legacy_schema.sql` | `076_remove_local_only_legacy_schema.sql` | Final cleanup | `5281677e52a2770ca8e000cd533b16a5ca84cbbb65c3199426557653abde880b` | `5281677e52a2770ca8e000cd533b16a5ca84cbbb65c3199426557653abde880b` |
| `091_remove_content_and_search_schema.sql` | `077_remove_content_and_search_schema.sql` | Final cleanup | `66ba4d17c6c8fef0e16400507ccb4af2568f8a833c5c5ceaa55b4c996cdb9e44` | `66ba4d17c6c8fef0e16400507ccb4af2568f8a833c5c5ceaa55b4c996cdb9e44` |
| `092_remove_marketplace_and_commerce_schema.sql` | `078_remove_marketplace_and_commerce_schema.sql` | Final cleanup | `f7eb7f7c358bfb24dd452923e4f3b978024e380db735ce2404382c1bd9b82330` | `f7eb7f7c358bfb24dd452923e4f3b978024e380db735ce2404382c1bd9b82330` |

## Read-only hosted transcripts

The command below was run once for each stage. It builds the temporary allowlisted worktree, runs `supabase db push --dry-run`, parses the selected filenames, then runs `supabase migration list` before and after the dry run.

```text
node scripts/verify-hosted-migration-stage.mjs --stage calendar-token-security --dry-run
  passed; 073_secure_google_calendar_tokens.sql; remote 68 rows/latest 072
node scripts/verify-hosted-migration-stage.mjs --stage storage-bucket-normalization --dry-run
  passed; 074_create_private_project_attachments_bucket.sql; remote 68 rows/latest 072
node scripts/verify-hosted-migration-stage.mjs --stage additive-product-workflow --dry-run
  passed; 075_add_financial_ai_employee_outcomes.sql through 080_daily_cockpit.sql; remote 68 rows/latest 072
node scripts/verify-hosted-migration-stage.mjs --stage growth-profile-evaluation --dry-run
  passed; 081_bound_model_evaluation_budget.sql; remote 68 rows/latest 072
node scripts/verify-hosted-migration-stage.mjs --stage research-agent-planner --dry-run
  passed; 082_private_prospect_research_suite.sql through 089_agent_plan_fail_closed_validation.sql; remote 68 rows/latest 072
node scripts/verify-hosted-migration-stage.mjs --stage destructive-retirement --dry-run
  passed; 090_remove_local_only_legacy_schema.sql through 092_remove_marketplace_and_commerce_schema.sql; remote 68 rows/latest 072
```

No command used `supabase db push` without `--dry-run`. The final cleanup run printed an explicit dry-run-only warning and could not be selected with an additive stage.

## Statement and data-impact classification

| Stage | Effects | Review decision |
| --- | --- | --- |
| `073` | Adds encrypted Calendar-token columns, replaces secure-definer token functions, and narrows grants. | Separate security review; no Google API call or event. |
| `074` | Upserts private project-attachment bucket metadata, including 5 MiB and MIME restrictions. | Separate Storage review; no object movement or deletion. |
| `075`–`080` | Adds financial outcome fields, pilot/work-item authorship and completion, prospecting/outreach/cockpit records, constraints, RLS, and RPCs. | Batch additive review; legacy content, embeddings, catalogs, carts, and Medusa records remain. |
| `081` | Updates existing `growth_profiles` rows to `evaluation-required`/empty fallback where needed and creates evaluation records. | Separate data-impact review; current backup has no `growth_profiles`, so the update is expected to affect zero rows, but approval must confirm that meaning. |
| `082`–`089` | Adds research, model-usage, agent-operation, planner, provenance, OpenClaw claim, and fail-closed validation boundaries. | Batch additive review; no provider activation, worker claim, message, publication, or spend. |
| `090`–`092` | Drops retired policies/functions/views/tables, explicitly deletes `media-library` and `product-images` Storage rows/objects, and removes the explicit hosted Medusa schema/table list with `RESTRICT`. | Final separate retention/deletion review remains required before any hosted write. The owner’s current decision is to preserve the backup and defer deletion authorization. |

## Proof-gap repairs and local backup rehearsal

- The retained security test no longer probes `page_views` through PostgREST after the cleanup has removed it. It now asserts the final `page_views` relation is absent. The staged historical rehearsal proves the earlier `page_views` policy exists and its `WITH CHECK` contains `page_slug IS NOT NULL` before cleanup.
- The retained schema manifest explicitly asserts all retired public tables/views, the `medusa` schema, and retired Storage buckets are absent, and explicitly asserts the retained public table list remains present. A missing `page_views` relation therefore cannot make the constraint test pass accidentally.
- `scripts/check-home-content.ts`, `scripts/reset-home-content.ts`, and `app/scripts/upload-product-images.mjs` were removed because they targeted retired `page_content` or `product-images` objects.
- `ALLOW_LOCAL_RESTORE_REHEARSAL=I_UNDERSTAND_THIS_RESETS_LOCAL_SUPABASE ALLOW_FINAL_DESTRUCTIVE_REHEARSAL=I_UNDERSTAND_THIS_RUNS_ISOLATED_FINAL_CLEANUP bash scripts/rehearse-local-data-migration.sh --execute` passed. It restored the protected backup into disposable local Supabase, applied each cumulative stage, confirmed the legacy inventory was unchanged through the first five stages, confirmed the final retired/retained object boundary, and passed the local database gate: schema manifest 9/9, security 14/14, AI-employee RLS 10/10, agent-operations RLS 3/3, planner/OpenClaw RLS 2/2, prospecting RLS 2/2, and consultation integration 1/1.
- The rehearsal applies only an explicit `072` ACL normalization for `record_ai_employee_decision` and `ai_employee_decisions` after restoring into platform-managed local roles. It does not replay `072`’s non-idempotent policy creation; the hosted backup already represents history through `072`.
- The rehearsal trap reset only the disposable local database to the current sanitized migration state after completion. The protected backup remained unchanged and checksum-valid.

## Review boundary and next decision

The requesting owner’s 2026-08-12 authorization covered read-only dry-run preparation only. The deterministic gate now records the technical and data-impact review confirmation; it does not approve any hosted write and is not reused for Step 5. The next action is a fresh read-only backup/history preflight followed by a separate hosted-write approval for stage `073` only.

## Rollback and next decision

No hosted rollback is needed because no hosted state changed. Preserve the backup and migration history. If the gate fails, Step 4 returns to pending and no hosted write occurs. After any future hosted stage is applied, rollback remains forward-only: stop on failure, preserve history/data, and use a separately reviewed forward migration. Do not reset hosted Supabase, delete migration history, or run a destructive reverse migration.
