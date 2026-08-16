# Hosted parity endgame

This is the active execution guide for bringing the hosted Supabase project to
the same schema and migration history that the local release candidate has
actually proven. The local database is the safety net; hosted parity is the
technical launch gate.

## Current truth — 2026-08-15

| Boundary | State |
| --- | --- |
| Local Supabase | Proven through migration `095` by the fresh assembly on `dev` SHA `9d82a627d6d589b09f46d9cdb20d0b5dcf49a6ce` |
| Hosted Supabase `oxhjtmozsdstbokwtnwa` | `91` rows, latest `095`, no higher migration |
| Hosted schema gap | No item-5/6 schema or security gap remains; the anonymous Storage defect, worker claim-context defect, and fixture-cleanup boundary are repaired and parity is passed |
| Application state | `dev` and remote `production` point to the deployed application; `8b8d429` remains the application rollback reference |
| External activity | No deployment, provider activation, secret provisioning, Calendar API call, publication, spend, or external message is part of parity work |

Local proof was valuable because it tested the SQL, RLS, function boundaries,
Storage rules, application contracts, and cleanup behavior against a disposable
database. It did not change hosted state and cannot substitute for hosted
schema, grant, row-count, Storage, and tenant-isolation evidence.

## Exact hosted sequence

Apply only the allowlisted stages in `docs/launch/hosted-migration-stages.json`.
Each stage gets its own fresh protected backup, exact dry run, stage-specific
approval, write, history check, and evidence. Stop immediately on any failure;
hosted rollback is forward-only.

1. `074` — normalize the private `project-attachments` bucket. **Passed.**
2. `075`–`080` — apply additive financial, pilot, queue, completion-evidence,
   prospecting, and daily-cockpit schema.
   **Passed.**
3. `081` — add model-evaluation records and the reviewed growth-profile change.
   **Passed.**
4. `082`–`089` — add private research, agent operations, configured-model,
   planner, OpenClaw linkage, and fail-closed validation schema. **Passed.**
5. `090`–`092` — applied as the isolated, separately approved destructive
   retirement stage. The exact dry run, protected backup, post-write history,
   and forward-only rollback are recorded in
   [step-5-destructive-retirement-2026-08-15.md](step-5-destructive-retirement-2026-08-15.md).
6. `093` — apply the separate forward-only Storage policy repair that removes
   only the two anonymous `project-attachments` policies. **Passed.** Its
   evidence is recorded in [step-5-storage-policy-repair-2026-08-15.md](step-5-storage-policy-repair-2026-08-15.md).
7. `094` — restore the service-role claim context inside protected worker
   functions. **Passed.**
8. `095` — allow only the hosted verifier's reserved `.invalid` service-role
   fixtures to be cleaned up while keeping normal history immutable. **Passed.**
   The repair records, protected backups, and exact stage results are in
   [step-5-hosted-security-repairs-2026-08-15.md](step-5-hosted-security-repairs-2026-08-15.md).

The destructive stage reached hosted history `092`. The focused parity verifier
then found anonymous listing exposing metadata from the private
`project-attachments` bucket. The tracked `093` repair removed exactly those
policies. The follow-on `094` and `095` repairs closed the worker claim-context
and disposable-fixture cleanup boundaries without weakening ordinary customer
history protections. The final hosted parity verifier passed all required
checks and cleaned all four temporary fixtures.

Migration completion is not production readiness. Do not weaken the hosted
security, tenant-isolation, grant, Storage, planner, or worker-boundary checks
to bypass the current blocker.

The stage gate is used in two modes:

```bash
cd app
npm run review:hosted-migration-stage -- --stage <stage-id> --dry-run

ALLOW_HOSTED_STAGE_WRITE=<stage-ack> \
NEEDTHISDONE_APPROVED_RELEASE_SHA=<pushed-dev-sha> \
NEEDTHISDONE_HOSTED_BACKUP_DIR=<fresh-backup-dir> \
npm run apply:hosted-migration-stage -- --stage <stage-id> --execute
```

The execute mode also requires a clean `dev` worktree and matching
`origin/dev`. The destructive stage additionally requires the separate
`NEEDTHISDONE_DESTRUCTIVE_HOSTED_RETIREMENT_APPROVED` acknowledgement. The
helper creates and removes only its temporary comparison workdir; it never
resets the hosted project.

| Stage ID | Migrations | `ALLOW_HOSTED_STAGE_WRITE` value |
| --- | --- | --- |
| `storage-bucket-normalization` | `074` | `I_UNDERSTAND_THIS_APPLIES_ONLY_074` |
| `additive-product-workflow` | `075`–`080` | `I_UNDERSTAND_THIS_APPLIES_ONLY_075_080` |
| `growth-profile-evaluation` | `081` | `I_UNDERSTAND_THIS_APPLIES_ONLY_081` |
| `research-agent-planner` | `082`–`089` | `I_UNDERSTAND_THIS_APPLIES_ONLY_082_089` |
| `destructive-retirement` | `090`–`092` | `I_UNDERSTAND_THIS_APPLIES_ONLY_090_092` |
| `storage-policy-repair` | `093` | `I_UNDERSTAND_THIS_APPLIES_ONLY_093_STORAGE_POLICY_REPAIR` |
| `worker-claim-context-repair` | `094` | `I_UNDERSTAND_THIS_APPLIES_ONLY_094_WORKER_CLAIM_CONTEXT_REPAIR` |
| `hosted-parity-fixture-cleanup` | `095` | `I_UNDERSTAND_THIS_APPLIES_ONLY_095_FIXTURE_CLEANUP_BOUNDARY` |

## Exit criteria before production

Hosted parity is complete only when all of the following are recorded:

- hosted history exactly matches the repository migration sequence from `001`
  through `095` (including its preserved numbering gaps), with no migration
  above `095`;
- the retained schema manifest, RLS/tenant-isolation checks, function grants,
  and Storage privacy/size/MIME checks pass against the hosted project;
- hosted row counts and retained object inventory match the reviewed baseline,
  with no customer or prospect recipient used;
- the exact reviewed `dev` SHA is pushed and verified on `origin/dev`;
- no provider, deployment, secret, Calendar, publication, spend, or external
  message activity is represented as parity evidence;
- the database/security owner accepts the hosted parity evidence.

The final sanitized verifier result is
[hosted-parity-report-2026-08-15.json](hosted-parity-report-2026-08-15.json).
The historical blocked result is preserved as
[hosted-parity-pre-repair-report-2026-08-15.json](hosted-parity-pre-repair-report-2026-08-15.json).
The repair records are [step-5-storage-policy-repair-2026-08-15.md](step-5-storage-policy-repair-2026-08-15.md)
and [step-5-hosted-security-repairs-2026-08-15.md](step-5-hosted-security-repairs-2026-08-15.md).

Those parity criteria were met. Step 7 separately fast-forwarded remote
`production` to the verified application commit and deployed it to Vercel;
the complete evidence is in
[step-7-production-cutover-2026-08-15.md](step-7-production-cutover-2026-08-15.md).
Production promotion did not authorize hosted migrations, and it does not
authorize provider or live-action work. Step 8 remains separate.

## Failure boundary

If a hosted stage or parity check fails, retain the transcript and run only
read-only diagnosis. Do not reset hosted Supabase, delete migration history,
reverse SQL ad hoc, weaken the check, continue to production, or fast-forward
the application. Preserve the backup and use a reviewed forward repair if one
is required. The Storage, worker-claim, and fixture-cleanup repairs are
authorized only through the tracked `093`–`095` stages; do not recreate
anonymous policies or reverse migration history ad hoc.
