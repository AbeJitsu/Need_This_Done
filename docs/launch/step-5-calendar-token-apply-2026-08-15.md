# Step 5 hosted migration evidence — calendar-token-security (`073`)

This is the dedicated evidence record for [launch checklist item 5](LAUNCH_CHECKLIST.md#5-apply-each-reviewed-migration-stage-to-hosted-supabase--passed). It records one approved hosted write only. It does not approve or apply `074` or any later migration.

## Outcome

- **Result:** `PASSED` for the approved `calendar-token-security` stage.
- **Hosted target:** Supabase project `oxhjtmozsdstbokwtnwa` at `https://oxhjtmozsdstbokwtnwa.supabase.co`.
- **Migration applied:** `073_secure_google_calendar_tokens.sql` only.
- **Hosted history:** `68/072` before the final dry run and `69/073` after the write; no `074+` version is present.
- **Release-control SHA:** `e022c013d9c98fcb08590ce762d3b7b8c8fadb9b`.
- **Separate post-write evidence commit:** this record and the ledger updates are committed separately from the release-control commit above.
- **Hosted writes:** `1`.
- **Temporary apply workdir:** cleaned by the helper after verification.

No deployment, provider activation, secret provisioning, Google Calendar API call, publication, spend, or external message occurred in this execution window.

## Stage-specific approval

The approval scope for this write was recorded before execution:

| Control | Approved value |
| --- | --- |
| Operator | Abe Reyes |
| Maintenance window | 15 minutes, America/New_York |
| Monitoring owner | Abe Reyes |
| Forward-repair owner | NeedThisDone database owner |
| Approved migration | `073_secure_google_calendar_tokens.sql` only |
| Explicit write acknowledgement | `I_UNDERSTAND_THIS_APPLIES_ONLY_073` |

This approval does not carry forward to `074`, the additive batches, the evaluation stage, the research/planner stage, or the destructive retirement stage.

## Fresh preflight

- **Backup:** `/Users/abiezerreyes/Documents/NeedThisDone Backups/2026-08-15-pre-migration-073-000202`.
- **Backup protection:** directory mode `700`; eight backup artifacts and `SHA256SUMS-FINAL.txt` mode `600`; the final checksum manifest passed.
- **Backup contents:** `schema.sql`, `data.sql`, `roles.sql`, Storage bucket metadata, both Storage object inventories, the Storage summary, and hosted migration history.
- **Hosted history at capture:** exactly 68 rows, latest `072`.
- **Storage at capture:** one private `project-attachments` bucket and 217 object metadata records. Pagination used a metadata list endpoint; no object contents were downloaded.
- **Target confirmation:** the backup and command profile both identified project `oxhjtmozsdstbokwtnwa`.

The stage-only dry run was rerun with the fresh backup and selected exactly `073_secure_google_calendar_tokens.sql`. Its read-only history checks remained at `68/072` before and after the dry run and reported `hosted_writes: 0`.

## Sanitized machine-readable apply result

```json
{
  "schema_version": 1,
  "status": "passed",
  "target": {
    "project_ref": "oxhjtmozsdstbokwtnwa",
    "endpoint": "https://oxhjtmozsdstbokwtnwa.supabase.co",
    "environment": "cloud",
    "branch": "dev",
    "release_sha": "e022c013d9c98fcb08590ce762d3b7b8c8fadb9b"
  },
  "stage": "calendar-token-security",
  "selected_migration": "073_secure_google_calendar_tokens.sql",
  "before_history": {"rows": 68, "latest": "072"},
  "after_history": {"rows": 69, "latest": "073"},
  "hosted_writes": 1,
  "write_acknowledgement_verified": true,
  "temporary_workdir_cleaned": true,
  "dry_run_selected": ["073_secure_google_calendar_tokens.sql"]
}
```

The live helper transcript showed the same single migration in the final dry run and apply sections. Credentials were not included in this record.

## Read-only post-write verification

- **History:** fresh `supabase migration list --linked` returned 69 remote rows, latest `073`, with no `074+` row.
- **Token schema:** the post-write schema dump showed `access_token_encrypted` and `refresh_token_encrypted` as `bytea`; legacy `access_token` and `refresh_token` remain nullable text columns.
- **Function grants:** all three token functions revoke `PUBLIC` and grant execution only to `service_role`; no `anon` or `authenticated` execute grant is present. The function bodies also keep the service-role check/fail-closed branch.
- **Token data:** the service-role read returned zero rows in `public.google_calendar_tokens`, unchanged from the pre-write expectation.
- **Non-service behavior:** anonymous RPC calls to `get_calendar_access_token` and `get_calendar_refresh_token` both returned `401`. The mutating store function was not invoked as a non-service role.
- **Storage:** the current bucket metadata and sorted object metadata compared equal to the fresh pre-write backup: one private bucket and 217 objects. No object bytes were requested.
- **Unavailable tool note:** `psql` is not installed in this environment. The equivalent installed Supabase CLI schema dump and PostgREST read-only checks supplied the catalog, grant, row-count, and non-service assertions; no required hosted assertion remains open.

## Boundary and rollback

`074` is neither approved nor applied. `075`–`092` are also neither approved nor applied in this execution window. Hosted rollback remains forward-only: preserve the `073` history and data, stop before any next stage, and use a separately reviewed forward repair if a defect is discovered. Do not reset hosted Supabase, delete migration history, reverse the SQL ad hoc, or continue to another stage.
