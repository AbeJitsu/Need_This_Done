# Step 5 — Hosted security repairs and parity closeout — 2026-08-15

This record closes the security repairs discovered while completing launch
checklist items 5 and 6. Every hosted write was a separate, approval-gated,
forward-only migration. No deployment, provider activation, secret
provisioning, Calendar call, payment, publication, or external message was
performed.

## Repair stages

| Stage | Reason | Protected pre-write backup | Pre → post history | Result |
| --- | --- | --- | --- | --- |
| `093` | Remove two out-of-band anonymous policies from private `project-attachments` Storage. | `/Users/abiezerreyes/Documents/NeedThisDone Backups/2026-08-15-pre-migration-092-to-093-59cd9A`; manifest SHA-256 `1e728821e8558946f9518de7503121c164608d008ec91aed85f79789cc16c4cd` | `88/092` → `89/093` | Applied only `093_revoke_anonymous_project_attachments_policies.sql`; temporary worktree cleaned. |
| `094` | Restore the service-role claim context inside protected worker functions. | `/Users/abiezerreyes/Documents/NeedThisDone Backups/2026-08-15-pre-migration-093-to-094-bkTilZ`; manifest SHA-256 `6e7fd73c7ea91defe37cbcc823c70a42374e8e49aacf6e34f3d282548f9cf1f3` | `89/093` → `90/094` | Applied only `094_restore_service_worker_claim_context.sql`; temporary worktree cleaned. |
| `095` | Permit cleanup only for service-role-created verifier identities in the reserved `.invalid` namespace while keeping normal history immutable. | `/Users/abiezerreyes/Documents/NeedThisDone Backups/2026-08-15-pre-migration-094-to-095-OvpTW2`; manifest SHA-256 `c899f2eb7c734abc6792c0670828c48846fa5a282b954d2a395046d05739dbca` | `90/094` → `91/095` | Applied only `095_allow_hosted_parity_fixture_cleanup.sql`; temporary worktree cleaned. |

The `094` and `095` dry runs selected exactly one migration each. The `095`
backup was captured before its write and included the one disposable fixture
left by the earlier failed cleanup; that fixture was removed after the repair,
with no customer or prospect records involved.

## Final hosted parity proof

Release SHA: `9d82a627d6d589b09f46d9cdb20d0b5dcf49a6ce` on `dev`, matching
`origin/dev`.

The internal hosted verifier passed on 2026-08-16 UTC and recorded the
sanitized result in [hosted-parity-report-2026-08-15.json](hosted-parity-report-2026-08-15.json):

- hosted history is exactly `91` rows with `095` latest and no higher migration;
- lint, retained/retired object inventory, 49 RLS tables, 17 required policy markers, 13 service-only functions, and 4 authenticated functions pass;
- both Storage buckets are private, the 217 project-attachment metadata records remain, no agent-media objects exist, and anonymous reads are denied;
- tenant isolation, viewer read-only behavior, planner approval-before-dispatch, service-role-only worker access, lease/idempotency, emergency stop, and provenance isolation all pass;
- four disposable `.invalid` users were created and four were removed; cleanup errors and remaining fixture users are zero;
- the post-cleanup read-only check found zero fixture users and zero agent runs, tasks, artifacts, artifact versions, or run events;
- hosted writes during verification and external provider calls are both zero.

The verifier is an internal automated safety inspector, not an independent
security review. Abe Reyes, the database/security owner, accepts this repair
scope and the final hosted parity evidence. No independent security review is
claimed.

## Rollback boundary

Hosted rollback remains forward-only. Preserve the backups, migration history,
audit records, and sanitized reports. Do not reset hosted Supabase, delete
migration history, recreate anonymous Storage policies, or reverse these
migrations ad hoc. Any future correction must be a separately reviewed
forward migration.
