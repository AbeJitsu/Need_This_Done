# Step 7 — Production cutover — 2026-08-15

## Scope

This step moved the reviewed application code from `dev` to the remote
`production` branch and deployed that exact application commit to the linked
Vercel project. It did not create or change secrets, configure providers,
activate OpenClaw, send messages, take payments, call Calendar, or change
hosted Supabase.

## Preflight

- Items 1–6 were passed before this step.
- `origin/production` was an ancestor of `origin/dev`; the fast-forward dry run
  showed `8b8d429` → `3a227bc`.
- The application code was unchanged between the fresh-assembly proof commit
  `9d82a627d6d589b09f46d9cdb20d0b5dcf49a6ce` and deployment commit
  `3a227bc8ffeb3100be5454de6f3668b23d8b5dc8`; the intervening change only
  recorded launch evidence.
- The old application rollback reference remains `8b8d429`.

## Cutover and deployment

The remote `production` branch was fast-forwarded from `8b8d429` to
`3a227bc8ffeb3100be5454de6f3668b23d8b5dc8`. Direct remote verification
confirmed both `dev` and `production` at that SHA.

Vercel project: `vision2virtual/app`

- Initial manual deployment ID: `dpl_6vVRn4Jbnsx7hHneBPgqudLVQNcd`
- Final branch-triggered deployment ID: `dpl_6Jh1KMSZsqAPUB9fkkhpP8Bt3DSB`
- Final deployment URL: https://app-bvxn361zh-vision2virtual.vercel.app
- Production aliases: https://needthisdone.com and https://www.needthisdone.com
- Target: production
- Status: `READY`
- Final deployment created: `2026-08-16T02:01:29Z`
- Build: Next.js `14.2.35`, 49 static pages generated, serverless functions created successfully

The first deployment attempt stopped before deployment because the installed
Vercel CLI was below the provider's minimum version. The CLI was upgraded
locally; no project setting or secret changed. The successful deployment used
Vercel CLI `59.1.3`.

## Post-deployment checks

- `/api/health` returned `200` with `status: healthy`; application, Redis, and Supabase were all `up`.
- `/`, `/services`, and `/contact` returned `200`.
- `/dashboard` and `/login` returned `200`; the dashboard remains behind its application login boundary.
- Anonymous `POST /api/agent-plans` returned `401`.
- Anonymous `POST /api/agent-bridge/claim` returned `401`.
- No external recipient or provider action was used for verification.

The final branch-triggered deployment owns the production aliases after the
remote `production` branch was aligned with `dev`. The application tree was
unchanged between the manual and branch-triggered deployments.

Vercel's inspection command generated a temporary deployment-protection bypass
token to inspect the protected deployment. The token was not printed, saved,
or added to the repository.

## Approval and rollback

The owner explicitly directed implementation of step 7. This approval covered
only the fast-forward, exact-commit deployment, and post-deployment checks;
step 8 secret/configuration work remains separate.

If the application fails, redeploy `8b8d429` as the application rollback. Do
not roll hosted Supabase backward; preserve migration history and use a
reviewed forward database repair if needed.
