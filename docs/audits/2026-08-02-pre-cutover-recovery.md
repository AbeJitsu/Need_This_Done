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

A fresh current snapshot was exported after the repaired hosted dry run and is retained outside the repository at:

`/Users/abiezerreyes/Documents/NeedThisDone Backups/2026-08-02-pre-cutover-current-072/`

The directory is mode `700`; its SQL files are mode `600`:

| Asset | Size | SHA-256 |
| --- | ---: | --- |
| `schema.sql` | 379,484 bytes | `b4c3bc0d7ad4c66fab7981a72078197957dcb4ea9578ce2e9e13ddaf329e81f9` |
| `data.sql` | 47,341,533 bytes | `c40f93962acdbe4988baeb27a629b48d883f1ea820eb07e1975b70bc0471a59e` |
| `roles.sql` | 692 bytes | `30860dc01d9e2a7f836f187c92aef9b8027784ffb38780d0182175e16983aa7b` |

All three files are non-empty. The data dump reported circular-foreign-key restore warnings for historical commerce and retained work-item tables; the already completed full-schema local rehearsal is therefore the applicable restoration evidence. The export was read-only: hosted migration history remains through `072`, and no row, schema, secret, provider, or deployment was changed.

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

Execution is fail-closed. It requires the active application profile to point to local Supabase, refuses to run beside a Next.js server, creates an empty-migration temporary workdir with only the four local service-version pins (never the linked cloud project reference or pooler URL), and resets only the disposable local database to the Supabase platform baseline. It restores the restricted hosted schema/data without printing their contents, applies `072`–`078`, and runs the retained database gate. The role backup is checksum-verified but is not replayed locally: Supabase owns the platform roles, the two hosted-only roles are not referenced by the schema dump, and replaying the hosted grant chain under local `postgres` is correctly denied. An exit trap then removes the temporary workdir and rebuilds the normal sanitized local state whether the rehearsal passes or fails.

This is a local full-dump forward-migration rehearsal, not a hosted disaster-recovery proof. A separate isolated hosted-project recovery exercise remains required to prove provider-level restoration.

### Rehearsal result

The approved local execution completed on 2026-08-02. Earlier fail-closed attempts exposed three material assumptions: data could not be restored before the hosted schema, hosted platform grants could not be replayed under local `postgres`, and the hosted snapshot lacked the Calendar encryption columns assumed by migration `073`. After repairing the tool and adding the missing nullable columns with `IF NOT EXISTS`, the full schema/data restore reached the retained manifest and exposed approximately 130 hosted-only Medusa-v2 tables omitted from migration `078`.

Migration `078` now contains an explicit inventory of those retired tables. It removes only foreign keys owned by that inventory and drops every table with `RESTRICT`; it does not use `CASCADE` or a dynamic “all non-retained tables” rule. The final rehearsal restored the restricted hosted schema/data, applied `072`–`078`, and passed the exact 16-table manifest plus all 30 required database checks. The exit trap then rebuilt the normal sanitized local state. The restricted backup remained unchanged and no hosted system was contacted or mutated.
