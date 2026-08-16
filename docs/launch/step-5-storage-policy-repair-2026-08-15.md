# Step 5 — Storage policy repair (`093`) — 2026-08-15

## Scope and approval

The hosted parity verifier found that the private `project-attachments` bucket
had two out-of-band anonymous policies. The owner directed that this security
defect be fixed and that the launch plan be revised accordingly.

Migration `093_revoke_anonymous_project_attachments_policies.sql` removes only:

- `Allow anonymous read`
- `Allow anonymous uploads`

It does not move or delete object bytes, change bucket limits or MIME rules,
alter application routes, activate providers, deploy code, or contact an
external recipient.

## Pre-apply evidence

- Reviewed repair: `093_revoke_anonymous_project_attachments_policies.sql`
- Local migration map: `21` mappings, `7` staged gates
- Local schema manifest: `9/9` passed
- Local security suite: `14/14` passed
- Local schema lint: no errors
- Fresh backup: `/Users/abiezerreyes/Documents/NeedThisDone Backups/2026-08-15-pre-migration-092-to-093-59cd9A`
- Backup protection: directory `700`; artifacts and checksum manifest `600`
- Backup checksum-manifest SHA-256: `1e728821e8558946f9518de7503121c164608d008ec91aed85f79789cc16c4cd`
- Backup history: `88/092`
- Storage inventory: `217` project-attachment metadata records; `0` agent-media objects; no object contents downloaded

The exact approval-gated dry run selected only
`093_revoke_anonymous_project_attachments_policies.sql`, reported
`hosted_writes: 0`, preserved hosted history at `88/092`, and cleaned its
temporary worktree.

## Apply and verification

The hosted write was applied as its own stage from release SHA
`87a218e308064ad99d9ecb0bdf97520a9392cd3b` using the protected backup above.
The helper selected only
`093_revoke_anonymous_project_attachments_policies.sql`, reported
`hosted_writes: 1`, moved hosted history from `88/092` to `89/093`, and cleaned
its temporary worktree. The post-write check confirmed the two anonymous
policies were absent without changing the bucket, object metadata, limits, or
MIME rules.

Two additional forward-only security repairs were then required by the hosted
parity proof: migration `094` restored the service-role claim context inside
protected worker functions, and migration `095` allowed cleanup only for the
verifier's reserved `.invalid` fixture identities. Their backups, dry runs,
and apply results are recorded in
[the hosted security repair evidence](step-5-hosted-security-repairs-2026-08-15.md).
The final hosted parity report is
[hosted-parity-report-2026-08-15.json](hosted-parity-report-2026-08-15.json).

## Rollback

Hosted rollback is forward-only. Preserve the `092` backup and audit evidence.
Do not recreate anonymous Storage policies or reverse migration history. Any
future access change requires a separately reviewed authenticated or
server-issued, path-scoped forward policy.
