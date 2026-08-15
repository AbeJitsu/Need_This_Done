# Hosted parity endgame

This is the active execution guide for bringing the hosted Supabase project to
the same schema and migration history that the local release candidate has
actually proven. The local database is the safety net; hosted parity is the
technical launch gate.

## Current truth — 2026-08-15

| Boundary | State |
| --- | --- |
| Local Supabase | Proven through migration `092` by the last full assembly on `74d3257` |
| Hosted Supabase `oxhjtmozsdstbokwtnwa` | `69` rows, latest `073` |
| Hosted schema gap | `074`–`092` are not applied; the tables introduced by `079`–`089` are absent |
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

1. `074` — normalize the private `project-attachments` bucket.
2. `075`–`080` — apply additive financial, pilot, queue, completion-evidence,
   prospecting, and daily-cockpit schema.
3. `081` — add model-evaluation records and the reviewed growth-profile change.
4. `082`–`089` — add private research, agent operations, configured-model,
   planner, OpenClaw linkage, and fail-closed validation schema.
5. `090`–`092` — only after a separate retention/destructive approval; these
   remove retired legacy, content/search/media, marketplace, commerce, and
   hosted Medusa objects. They are not required to prove that the additive
   application surface exists.

The target after the first four stages is hosted history `089` and an additive
schema match. The target after the separately approved retirement stage is
hosted history `092` and exact local retained-schema parity.

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

## Exit criteria before production

Hosted parity is complete only when all of the following are recorded:

- hosted history exactly matches the repository migration sequence from `001`
  through `092` (including its preserved numbering gaps), with no migration
  above `092`;
- the retained schema manifest, RLS/tenant-isolation checks, function grants,
  and Storage privacy/size/MIME checks pass against the hosted project;
- hosted row counts and retained object inventory match the reviewed baseline,
  with no customer or prospect recipient used;
- the exact reviewed `dev` SHA is pushed and verified on `origin/dev`;
- no provider, deployment, secret, Calendar, publication, spend, or external
  message activity is represented as parity evidence;
- the security owner accepts the hosted parity evidence.

Only after those criteria are met may the release owner separately approve the
production fast-forward and deploy that exact `dev` SHA. Production promotion
does not authorize hosted migrations, and hosted migrations do not authorize
provider or live-action work.

## Failure boundary

If a hosted stage fails, retain the transcript and run only read-only history
diagnosis. Do not retry, reset hosted Supabase, delete migration history,
reverse SQL ad hoc, continue to another stage, or fast-forward production.
Preserve the backup and use a reviewed forward repair if one is required.
