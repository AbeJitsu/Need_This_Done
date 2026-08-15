# Hosted parity endgame

This is the active execution guide for bringing the hosted Supabase project to
the same schema and migration history that the local release candidate has
actually proven. The local database is the safety net; hosted parity is the
technical launch gate.

## Current truth — 2026-08-15

| Boundary | State |
| --- | --- |
| Local Supabase | Proven through migration `092` by the fresh assembly on reviewed `dev` SHA `3b23b129e791e2678afbcfa82f0a5c0e428ed8ed` |
| Hosted Supabase `oxhjtmozsdstbokwtnwa` | `88` rows, latest `092`, no higher migration |
| Hosted schema gap | Retained schema, lint, RLS markers, and Storage metadata pass; tracked `093` repair is dry-run proven and awaiting hosted apply |
| Application state | `dev` is the only active release branch; `production` remains the old rollback reference |
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
   only the two anonymous `project-attachments` policies. Its pre-apply proof
   is recorded in [step-5-storage-policy-repair-2026-08-15.md](step-5-storage-policy-repair-2026-08-15.md).

The destructive stage reached hosted history `092`. The focused parity verifier
passed endpoint identity, exact history, hosted lint, retained objects, RLS
markers, function grants, and Storage metadata, then found anonymous listing
exposing metadata from the private `project-attachments` bucket. The tracked
`093` repair removes exactly those policies; item 6 remains blocked until the
repair is applied and the disposable fixture suite passes with cleanup.

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

## Exit criteria before production

Hosted parity is complete only when all of the following are recorded:

- hosted history exactly matches the repository migration sequence from `001`
  through `093` (including its preserved numbering gaps), with no migration
  above `093`;
- the retained schema manifest, RLS/tenant-isolation checks, function grants,
  and Storage privacy/size/MIME checks pass against the hosted project;
- hosted row counts and retained object inventory match the reviewed baseline,
  with no customer or prospect recipient used;
- the exact reviewed `dev` SHA is pushed and verified on `origin/dev`;
- no provider, deployment, secret, Calendar, publication, spend, or external
  message activity is represented as parity evidence;
- the security owner accepts the hosted parity evidence.

The pre-repair sanitized verifier result is
[hosted-parity-report-2026-08-15.json](hosted-parity-report-2026-08-15.json).
The repair-stage record is
[step-5-storage-policy-repair-2026-08-15.md](step-5-storage-policy-repair-2026-08-15.md).
The final parity report replaces the pre-repair result only after `093` and
fixture cleanup pass.

Only after those criteria are met may the release owner separately approve the
production fast-forward and deploy that exact `dev` SHA. Production promotion
does not authorize hosted migrations, and hosted migrations do not authorize
provider or live-action work.

## Failure boundary

If a hosted stage or parity check fails, retain the transcript and run only
read-only diagnosis. Do not reset hosted Supabase, delete migration history,
reverse SQL ad hoc, weaken the check, continue to production, or fast-forward
the application. Preserve the backup and use a reviewed forward repair if one
is required. The Storage policy issue is authorized only through the tracked
`093` repair stage; do not recreate anonymous policies or reverse migration
history ad hoc.
