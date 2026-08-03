# Pre-cutover recovery record

**Evidence date:** 2026-08-02
**Approved hosted project:** `oxhjtmozsdstbokwtnwa`
**Change authority:** read-only inspection and documentation only; no hosted migration or data mutation was performed.

## Hosted migration boundary

The approved cloud profile was validated without printing credentials. Read-only Supabase inspection reported:

- Remote migration history is applied through `072`.
- Local migrations `073` through `078` are the complete pending set.
- `supabase db push --dry-run` listed exactly these six files and finished successfully:
  `073_secure_google_calendar_tokens.sql`, `074_create_private_project_attachments_bucket.sql`,
  `075_add_financial_ai_employee_outcomes.sql`, `076_remove_local_only_legacy_schema.sql`,
  `077_remove_content_and_search_schema.sql`, and `078_remove_marketplace_and_commerce_schema.sql`.
- No hosted migration, row, secret, deployment, or application state was changed.

## Restricted recovery assets

The existing pre-`072` hosted snapshot is retained outside the repository at:

`/Users/abiezerreyes/Documents/NeedThisDone Backups/2026-07-29-pre-migration-072/`

The directory is mode `700`; its SQL files are mode `600`:

| Asset | Size | SHA-256 |
| --- | ---: | --- |
| `schema.sql` | 359,639 bytes | `95a7b2df97c6c1647d0946f2cfac92deed82bb4af89a56cc1806f58abfc3307e` |
| `data.sql` | 47,339,060 bytes | `d35203eb09ff045360303d4098149f7924e7128d5d87c416195b91e2e6f57da7` |
| `roles.sql` | 692 bytes | `3c54bf4ccf2cc71e817c9c37cd550f0ca6af656e91eb6916f8697b6b8b41ce5f` |

This snapshot is the recoverable historical baseline, not a claim that it is a current production export. A fresh restricted schema/data/roles snapshot and new hashes are required immediately before any approved hosted migration or destructive cleanup.

## Recovery ownership and rollback

- **Recovery owner:** the NeedThisDone owner/release approver authorizing the cutover.
- **Execution custodian:** the repository operator running the approved Supabase commands.
- **Application rollback:** redeploy the prior production deployment of the old product while leaving the hosted database untouched unless a separately reviewed database recovery is required.
- **Database recovery:** restore only from the restricted snapshot through the approved Supabase recovery procedure; do not reverse `073`–`078` with ad hoc SQL.
- **Required cutover record:** capture the new backup hashes, deployed `dev` commit, migration output, verification results, and fixture cleanup before declaring the window complete.

The former production application and hosted data remain outside this repository's mutation path. This record does not authorize pausing, deploying, applying migrations, deleting legacy objects, or restoring data.

## Local historical-data migration rehearsal

`npm run rehearse:local-data` performs a read-only preflight: it verifies the restricted directory/file modes and the three recorded checksums without querying, restoring, or changing a database.

The separately approved execution form is:

```bash
ALLOW_LOCAL_RESTORE_REHEARSAL=I_UNDERSTAND_THIS_RESETS_LOCAL_SUPABASE \
  npm run rehearse:local-data -- --execute
```

Execution is fail-closed. It requires the active application profile to point to local Supabase, refuses to run beside a Next.js server, resets only the disposable local database through migration `071`, restores the restricted historical data without printing rows, applies `072`–`078`, and runs the retained database gate. An exit trap then rebuilds the normal sanitized local state whether the rehearsal passes or fails.

This is a forward-data compatibility rehearsal, not a complete disaster-recovery proof: repository migrations reproduce the schema through `071`, while the restricted dump supplies historical data. A full schema/roles/data restoration into an isolated Supabase project remains a separate recovery exercise.
