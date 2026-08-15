# Step 5 — destructive retirement evidence (2026-08-15)

## Result

The isolated destructive stage was approved and applied to hosted Supabase
project `oxhjtmozsdstbokwtnwa` from reviewed `dev` SHA
`3b23b129e791e2678afbcfa82f0a5c0e428ed8ed`.

- Fresh protected backup: `/Users/abiezerreyes/Documents/NeedThisDone Backups/2026-08-15-pre-migration-089-to-090-fR5ohB`
- Backup directory mode: `700`
- Backup artifact mode: `600`
- `SHA256SUMS-FINAL.txt` SHA-256: `a637cac73a1cdf63562e9c938be42d6baa4f481de5ddf46f67685c9243544995`
- Pre-write history: `85/089`
- Post-write history: `88/092`
- Hosted writes: `1`
- Selected migrations: exactly `090`, `091`, and `092`
- Migrations above `092`: none
- Temporary helper worktree: cleaned

The dry run selected only:

1. `090_remove_local_only_legacy_schema.sql`
2. `091_remove_content_and_search_schema.sql`
3. `092_remove_marketplace_and_commerce_schema.sql`

The apply helper verified the destructive acknowledgement, the exact release
SHA, the protected backup, and the post-write migration history. No hosted
reset, reverse migration, deployment, secret provisioning, provider call,
Calendar API call, payment, publication, spend, or external message occurred.

## Follow-on parity boundary

The focused hosted parity verifier passed endpoint identity, hosted lint,
retained-schema inventory, RLS markers, function grants, and Storage metadata
checks. It stopped before fixture creation after finding two out-of-band
`storage.objects` policies on the private `project-attachments` bucket:

- `Allow anonymous read`
- `Allow anonymous uploads`

Anonymous listing exposed object metadata, so item 6 remains blocked. The
verifier made zero hosted writes, created zero fixture users, and contacted no
external recipient or provider. The sanitized result is
[hosted-parity-report-2026-08-15.json](hosted-parity-report-2026-08-15.json).

The owner then approved a tracked forward repair. Migration `093` removes only
the two named anonymous policies; its separate pre-apply backup and dry run are
recorded in [step-5-storage-policy-repair-2026-08-15.md](step-5-storage-policy-repair-2026-08-15.md).

## Rollback

Hosted rollback is forward-only. Preserve the backup, migration history, and
audit evidence. Do not reset Supabase, delete migration history, or reverse
`090`–`092` ad hoc. The Storage policy issue is handled only by the separately
reviewed `093` forward-repair stage before item 6 can pass.
