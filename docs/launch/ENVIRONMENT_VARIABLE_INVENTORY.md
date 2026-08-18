# Environment variable inventory

Names-only checklist for comparing the variables required by the retained
application with the names currently configured in Vercel. This is a review
aid, not a deployment manifest, secret record, or approval to complete launch
checklist item 8.

> **Safety warning:** Never record values, tokens, secret fingerprints, copied
> `.env` contents, or screenshots containing them here. Compare variable names
> only. Keep all values in the approved secret manager or private host files.

The baseline and observed optional rows below were completed during the
approved names-only Vercel review on 2026-08-16. The full scope comparison and
the retained-variable exception are recorded at the end of this document. Do
not treat the presence of a name as provider activation or customer-workflow
approval.

## Vercel application variables — required baseline

These names form the hosted application baseline. The service-role key,
NextAuth secret, and any other non-`NEXT_PUBLIC_` value are server-only.

| Variable name | Boundary / purpose | Production | Preview |
| --- | --- | --- | --- |
| `ENV_TARGET` | Runtime target guard for the approved hosted Supabase target. | present | present |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase URL used by browser and server clients. | present | present |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase browser-safe key. | present | present |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only Supabase admin client and private routes. | present | present |
| `NEXT_PUBLIC_SITE_URL` | Canonical site URL for links, redirects, and email URLs. | present | present |
| `NEXTAUTH_SECRET` | Server-only NextAuth JWT secret and fallback OAuth-state signing secret. | present | present |

### Vercel application variables — optional runtime acceleration

`REDIS_URL` is optional in the current validation code and the application
degrades when Redis is unavailable. If hosted Redis is used, record its name
in the approved allowlist; do not rely on the code's local fallback in a
hosted deployment.

| Variable name | Boundary / purpose | Production | Preview |
| --- | --- | --- | --- |
| `REDIS_URL` | Transient cache, rate-limit, and deduplication service. | present | present |

## Vercel application variables — later-gated providers

These names may be needed by later launch items, but their presence does not
authorize provider activation, model selection, sending, payment, Calendar,
or external action.

| Variable name | Boundary / later gate | Production | Preview |
| --- | --- | --- | --- |
| `OPENAI_API_KEY` | Optional retained analyzer provider; separately approved provider use. | present | present |
| `OPENROUTER_API_KEY` | Server-only model provider; item 10. | present | present |
| `OPENROUTER_PRIMARY_MODEL` | Server-only pinned primary model ID; item 10. | present | present |
| `OPENROUTER_TEST_MODEL` | Server-only comparison model ID; item 10. | present | present |
| `OPENROUTER_BACKUP_MODEL` | Server-only controlled free-backup probe model; item 10. | present | present |
| `OPENCLAW_BRIDGE_SECRET` | Server side of the signed Mac bridge; items 12–15. | absent | absent |
| `GOOGLE_CLIENT_ID` | Google sign-in and Calendar OAuth client; items 9 and 19. | present | present |
| `GOOGLE_CLIENT_SECRET` | Server-only Google OAuth client secret; items 9 and 19. | present | present |
| `GOOGLE_REDIRECT_URI` | Explicit hosted Calendar callback URI; item 19. |  |  |
| `GOOGLE_OAUTH_STATE_SECRET` | Dedicated server-only OAuth-state signer; item 19. |  |  |
| `CALENDAR_TOKEN_ENCRYPTION_KEY` | Server-only Calendar token encryption key; item 19. |  |  |
| `RESEND_API_KEY` | Transactional email provider key; item 17. | present | present |
| `RESEND_FROM_EMAIL` | Approved transactional sender identity; item 17. | present | present |
| `RESEND_ADMIN_EMAIL` | Owner-controlled transactional notification destination; item 17. | present | present |
| `RESEND_WEBHOOK_SECRET` | Server-only transactional webhook verifier; item 17. | present | present |
| `PROSPECTING_SENDER_PROVIDER` | Explicit prospecting sender mode; item 18. |  |  |
| `PROSPECTING_RESEND_API_KEY` | Separate prospecting sender key; item 18. |  |  |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Browser-side Stripe publishable key, only after payment scope approval; item 20. | present | present |
| `STRIPE_SECRET_KEY` | Server-only Stripe key; item 20. | present | present |
| `STRIPE_WEBHOOK_SECRET` | Server-only Stripe webhook verifier; item 20. | present | present |

## Mac bridge variables

These names belong in the bridge's private Mac environment file, not in the
Vercel application configuration, except for the server-side
`OPENCLAW_BRIDGE_SECRET` row above. The OpenClaw Gateway provider profile is a
separate private file and is not read by the bridge.

| Variable name | Boundary / use | Production | Preview |
| --- | --- | --- | --- |
| `BRIDGE_API_URL` | Required Mac bridge endpoint base URL. |  |  |
| `OPENCLAW_BRIDGE_SECRET` | Required bridge signing secret; separately stored on Mac and server. |  |  |
| `BRIDGE_OWNER_ID` | Required operator UUID bound to bridge requests. |  |  |
| `BRIDGE_WORKER_ID` | Required Mac worker identity. |  |  |
| `OPENCLAW_GATEWAY_TOKEN` | Required loopback Gateway token; Mac-only. |  |  |
| `OPENCLAW_GATEWAY_URL` | Optional loopback-only Gateway URL. |  |  |
| `BRIDGE_ARTIFACT_ROOT` | Optional private local artifact staging directory. |  |  |
| `BRIDGE_POLL_INTERVAL_MS` | Optional bounded bridge polling interval. |  |  |
| `OPENCLAW_REQUEST_TIMEOUT_MS` | Optional bounded Gateway request timeout. |  |  |
| `BRIDGE_VERSION` | Optional bridge version reported in callbacks. |  |  |
| `BRIDGE_CAPABILITIES` | Optional comma-separated bridge capability allowlist. |  |  |

## Private worker variables

These names describe the legacy direct prospecting worker and its comparison /
rollback path. Store them only in a separate owner-readable private worker
file outside the repository. Do not run that worker against the same queue as
the active OpenClaw bridge.

| Variable name | Boundary / use | Production | Preview |
| --- | --- | --- | --- |
| `OPENROUTER_API_KEY` | Private worker provider credential. |  |  |
| `OPENROUTER_PRIMARY_MODEL` | Private worker primary model ID. |  |  |
| `OPENROUTER_TEST_MODEL` | Private worker comparison model ID. |  |  |
| `OPENROUTER_BACKUP_MODEL` | Private worker free-router or pinned-free probe model; never a live pin. |  |  |
| `PROSPECTING_WORKER_SECRET` | Legacy worker request-signing secret. |  |  |
| `PROSPECTING_WORKER_BASE_URL` | Legacy worker's private server endpoint. |  |  |
| `PROSPECTING_WORKER_ID` | Legacy worker identity. |  |  |
| `PROSPECTING_PROFILE_ID` | Approval-gated profile selector for pinning or comparison. |  |  |
| `PROSPECTING_BENCHMARK_APPROVAL` | Explicit approval marker for model comparison. |  |  |
| `PROSPECTING_PRIMARY_MODEL_APPROVAL` | Explicit approval marker for primary-model pinning. |  |  |

## Local, test, migration, and Supabase-only names

The following names support local proof, tests, migration rehearsal, or
Supabase CLI configuration. They do not belong in Vercel application settings.
The `SUPABASE_SERVICE_ROLE_KEY` name is intentionally listed in the hosted
baseline above because the application server needs it; the bare Supabase test
aliases below are a separate local contract.

### Local and test controls

| Variable name | Local/test purpose | Production | Preview |
| --- | --- | --- | --- |
| `BASE_URL` | Local Playwright or assembly server URL. |  |  |
| `SKIP_WEBSERVER` | Local Playwright startup control. |  |  |
| `SKIP_CACHE` | Local cache bypass and in-process rate-limit proof. |  |  |
| `SKIP_EMAILS` | Local email suppression. |  |  |
| `OFFLINE_ASSEMBLY_PROOF` | Provider-free local assembly mode. |  |  |
| `RUN_LOCAL_SUPABASE_TESTS` | Opt-in local RLS/database test gate. |  |  |
| `E2E_REPORT_ID` | Retained browser fixture selector. |  |  |
| `NEXT_PUBLIC_DASHBOARD_PREVIEW` | Development-only read-only dashboard preview. |  |  |
| `NEXT_PUBLIC_E2E_ADMIN_BYPASS` | Test-only bypass name; must never be enabled in a hosted app. |  |  |
| `NEXT_PUBLIC_OPENROUTER_PRIMARY_MODEL` | Forbidden public model configuration name. |  |  |
| `NEXT_PUBLIC_OPENROUTER_TEST_MODEL` | Forbidden public comparison-model configuration name. |  |  |
| `NEXT_PUBLIC_OPENROUTER_BACKUP_MODEL` | Forbidden public free-backup configuration name. |  |  |
| `NEXT_PUBLIC_APP_URL` | Template-only URL alias retained for local examples; the current release uses `NEXT_PUBLIC_SITE_URL`. |  |  |
| `NEXT_PUBLIC_BASE_URL` | Template-only URL alias retained for local examples; the current release uses `NEXT_PUBLIC_SITE_URL`. |  |  |
| `NEXTAUTH_URL` | Template-only/legacy NextAuth URL alias; it is not part of the first hosted baseline. |  |  |
| `NEXTAUTH_DEBUG` | Non-production authentication debugging. |  |  |
| `STRIPE_TEST_SECRET_KEY` | Local/test-only Stripe credential name. |  |  |
| `ASSEMBLY_PRODUCTION_SERVER` | Local assembly mode selector. |  |  |
| `ASSEMBLY_SERVER_PORT` | Local assembly server port. |  |  |
| `NODE_ENV` | Runtime-managed Node environment marker. |  |  |
| `CI` | CI/runtime-managed test marker. |  |  |
| `NEXT_PHASE` | Next.js build/runtime-managed marker. |  |  |

### Migration and hosted-control process variables

These are shell controls for reviewed backup, rehearsal, dry-run, and hosted
migration commands. They are not Vercel application settings.

| Variable name | Process purpose | Production | Preview |
| --- | --- | --- | --- |
| `NEEDTHISDONE_HOSTED_FIXTURE_ACK` | Disposable hosted-parity fixture acknowledgement. |  |  |
| `NEEDTHISDONE_HOSTED_BACKUP_DIR` | Protected hosted-backup location. |  |  |
| `NEEDTHISDONE_STAGED_BACKUP_DIR` | Staged migration verification backup location. |  |  |
| `NEEDTHISDONE_STEP4_BACKUP_DIR` | Step 4 verification backup location. |  |  |
| `NEEDTHISDONE_REHEARSAL_BACKUP_DIR` | Local data-migration rehearsal backup location. |  |  |
| `NEEDTHISDONE_APPROVED_RELEASE_SHA` | Exact release SHA gate for hosted migration. |  |  |
| `ALLOW_HOSTED_STAGE_WRITE` | Stage-specific hosted-write acknowledgement. |  |  |
| `NEEDTHISDONE_DESTRUCTIVE_HOSTED_RETIREMENT_APPROVED` | Separate destructive-retirement acknowledgement. |  |  |
| `ALLOW_LOCAL_RESTORE_REHEARSAL` | Disposable local restore acknowledgement. |  |  |
| `ALLOW_FINAL_DESTRUCTIVE_REHEARSAL` | Isolated local cleanup acknowledgement. |  |  |

### Supabase CLI and local database names

| Variable name | Supabase-only / local purpose | Production | Preview |
| --- | --- | --- | --- |
| `SUPABASE_URL` | Bare URL alias used by local database test helpers. |  |  |
| `SUPABASE_ANON_KEY` | Bare anonymous-key alias used by local database test helpers. |  |  |
| `DATABASE_URL` | Local direct PostgreSQL test connection. |  |  |
| `SUPABASE_ACCESS_TOKEN` | Supabase CLI management authentication. |  |  |
| `API_URL` | Local `supabase status` output alias consumed by test helpers. |  |  |
| `ANON_KEY` | Local `supabase status` output alias consumed by test helpers. |  |  |
| `SERVICE_ROLE_KEY` | Local `supabase status` output alias consumed by test helpers. |  |  |
| `SUPABASE_AUTH_SMS_TWILIO_AUTH_TOKEN` | Supabase local Auth/Twilio configuration secret. |  |  |
| `SUPABASE_AUTH_EXTERNAL_APPLE_SECRET` | Supabase local Auth/Apple configuration secret. |  |  |

## Names outside the current hosted contract — retained by exception

These names are outside the six-name hosted baseline or belong to a retired,
local, test, Mac-only, or later-gated boundary. Existing names remain in place
under the approved item-8 retention exception; they are not activated by their
presence. Review or removal is due 2026-09-15. Do not remove or rotate them as
part of this change.

| Name or family | Boundary reason | Production | Preview |
| --- | --- | --- | --- |
| `NEXT_PUBLIC_E2E_ADMIN_BYPASS` | No hosted authorization bypass. | absent | absent |
| `NEXT_PUBLIC_OPENROUTER_PRIMARY_MODEL` | Provider/model configuration must not be public. | absent | absent |
| `NEXT_PUBLIC_OPENROUTER_TEST_MODEL` | Comparison model must not be public. | absent | absent |
| `NEXT_PUBLIC_OPENROUTER_BACKUP_MODEL` | Free-backup model must not be public. | absent | absent |
| `NEXT_PUBLIC_CHATBOT_MODEL` | Legacy public analyzer override; use the retained server/provider boundary. | present | present |
| `NEXT_PUBLIC_CHATBOT_MAX_TOKENS` | Retired public analyzer tuning setting. | present | present |
| `NEXT_PUBLIC_CHATBOT_TEMPERATURE` | Retired public analyzer tuning setting. | present | present |
| `NEXT_PUBLIC_URL` | Retired generic URL alias; use the canonical `NEXT_PUBLIC_SITE_URL`. | present | present |
| `NEXT_PUBLIC_USE_MOCK_DATA` | Retired mock-data switch; hosted behavior must use the reviewed application path. | present | present |
| `CONTEXT7_API_KEY` or `CONTEXT7_*` | Context7 is retired and its credential was revoked. | present | present |
| `MEDUSA_*` | Retired Medusa/Railway commerce runtime. | present | present |
| `NEXT_PUBLIC_MEDUSA_*` | Retired public commerce configuration. | present | present |
| `COOKIE_SECRET` | Retired commerce runtime secret. | present | present |
| `ADMIN_CORS` | Retired commerce runtime setting. | present | present |
| `SESSION_SECRET` or `SESSION_MAX_AGE` | Retired session-runtime settings; the retained auth boundary uses `NEXTAUTH_SECRET`. | present | present |
| `TEST_*` or `E2E_*` | Test identities and credentials must never enter hosted application settings. | present | present |
| `UPSTASH_*` | Retired direct Upstash REST settings; the retained app contract is optional `REDIS_URL`. | present | present |
| `OPENAI_EMBEDDING_MODEL` or `EMBEDDING_BATCH_SIZE` | Retired embedding-pipeline settings; embeddings are not part of the retained application boundary. | present | present |
| `VECTOR_SEARCH_SIMILARITY_THRESHOLD` | Retired vector-search setting. | present | present |
| `VECTOR_SEARCH_MAX_RESULTS` | Retired vector-search setting. | present | present |
| `STRIPE_TEST_SECRET_KEY` | Test-only secret must not enter hosted application settings. | absent | absent |
| `STRIPE_PAYMENT_LINK_*` | Retired catalog/payment-link variables are outside the current manual fallback. | absent | absent |
| `BRIDGE_*` except `OPENCLAW_BRIDGE_SECRET` | Mac bridge runtime settings do not belong in Vercel. | absent | absent |
| `OPENCLAW_GATEWAY_TOKEN` | Loopback Gateway credential is Mac-only. | absent | absent |
| `OPENCLAW_GATEWAY_URL` | Loopback Gateway endpoint is Mac-only. | absent | absent |
| `OPENCLAW_REQUEST_TIMEOUT_MS` | Mac bridge runtime setting. | absent | absent |
| `PROSPECTING_WORKER_*` | Legacy direct-worker settings are not the active Vercel bridge contract. | absent | absent |
| `PROSPECTING_PROFILE_ID` | Private worker approval/profile selector. | absent | absent |
| `PROSPECTING_*_APPROVAL` | Human approval markers belong to the private worker command, not Vercel. | absent | absent |

## Names-only Vercel audit and approved item-8 retention exception

On 2026-08-16, a names-only preflight of `vercel env ls` was run against the
linked Vercel project `app` for all three scopes. Environment values were not
pulled, copied, fingerprinted, or used. Before the change, every scope had the
same 55 names. Only `ENV_TARGET` was added, with the non-secret value `cloud`,
to Production and Preview.

| Scope | Names before | Names after | Names-only result |
| --- | ---: | ---: | --- |
| Development | 55 | 55 | unchanged; `ENV_TARGET` absent |
| Preview | 55 | 56 | only `ENV_TARGET` added |
| Production | 55 | 56 | only `ENV_TARGET` added |

On 2026-08-18, a follow-up names-only check found 64 names in Production,
64 in Preview, and 55 in Development. The owner-directed change in this slice
added only `OPENROUTER_BACKUP_MODEL` to Production and Preview, matching the
existing server-only OpenRouter key, primary, and comparison variables in
those scopes. Development remains unchanged. No environment value was read or
recorded, and no deployment or provider request occurred.

A later, separately approved Production deployment promoted the reviewed
working slice as `dpl_7kr6p3LBfph9VjLMBnYgV627BE2M`. It reached `READY` and
was aliased to `https://needthisdone.com`. The deployment made no environment
value inspection, provider request, or hosted database change.

The six hosted baseline names are now present in both Production and Preview:
`ENV_TARGET`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
`SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_SITE_URL`, and `NEXTAUTH_SECRET`.
Presence is not provider activation or approval for a customer workflow.

Optional/later-gated names currently present in all three scopes are
`REDIS_URL`, `OPENAI_API_KEY`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`,
`RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `RESEND_ADMIN_EMAIL`,
`RESEND_WEBHOOK_SECRET`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`,
`STRIPE_SECRET_KEY`, and `STRIPE_WEBHOOK_SECRET`. OpenRouter, Calendar,
OpenClaw bridge, and private-worker names were not added by this change.

Current names outside the retained application contract remain present by
exception: `MEDUSA_ADMIN_EMAIL`, `MEDUSA_ADMIN_PASSWORD`,
`NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY`, `TEST_ADMIN_EMAIL`,
`TEST_ADMIN_PASSWORD`, `TEST_USER_EMAIL`, `TEST_USER_PASSWORD`,
`NEXT_PUBLIC_USE_MOCK_DATA`, `NEXTAUTH_URL`, `SESSION_SECRET`,
`SESSION_MAX_AGE`, `MEDUSA_DB_PASSWORD`, `MEDUSA_JWT_SECRET`,
`MEDUSA_ADMIN_JWT_SECRET`, `COOKIE_SECRET`, `ADMIN_CORS`,
`SUPABASE_ACCESS_TOKEN`, `SKIP_CACHE`, `NEXT_PUBLIC_URL`,
`E2E_ADMIN_PASSWORD`, `E2E_USER_EMAIL`, `E2E_USER_PASSWORD`,
`UPSTASH_REDIS_API_KEY`, `UPSTASH_EMAIL`, `UPSTASH_REDIS_REST_URL`,
`UPSTASH_REDIS_REST_TOKEN`, `MEDUSA_DATABASE_URL`, `MEDUSA_BACKEND_URL`,
`NEXT_PUBLIC_MEDUSA_URL`, `NEXT_PUBLIC_CHATBOT_MODEL`,
`NEXT_PUBLIC_CHATBOT_MAX_TOKENS`, `NEXT_PUBLIC_CHATBOT_TEMPERATURE`,
`OPENAI_EMBEDDING_MODEL`, `EMBEDDING_BATCH_SIZE`,
`VECTOR_SEARCH_SIMILARITY_THRESHOLD`, `VECTOR_SEARCH_MAX_RESULTS`,
`CONTEXT7_API_KEY`, `E2E_ADMIN_EMAIL`, and the manually configured `NODE_ENV`.
They are not part of the six-name baseline, but they were not revoked or
rotated.

### Approved retention exception

- **Owner:** Abe Reyes / `abejitsu`
- **Approved:** 2026-08-16
- **Review/removal date:** 2026-09-15
- **Scope:** Preserve all existing Vercel variables in Production, Preview, and
  Development. The 2026-08-16 action added only `ENV_TARGET`; the separate
  2026-08-18 owner directive added only `OPENROUTER_BACKUP_MODEL` to Production
  and Preview. Development remains unchanged.
- **Protected values:** Supabase URL, anon key, and service-role key; Google
  client ID and secret; existing `NEXTAUTH_SECRET`; `COOKIE_SECRET`,
  `SESSION_SECRET`, and `SESSION_MAX_AGE`; `REDIS_URL`; email/payment/provider
  names; and legacy/test names remain in place.
- **Boundary:** The exception is a retention decision, not a clean six-variable
  allowlist pass. It does not activate Google, email, payment, Redis,
  OpenRouter, Calendar, OpenClaw, sending, publication, spend, or customer
  workflows.
- **Renewal for item 9:** Abe Reyes / `abejitsu` expressly renewed the same
  retention scope on 2026-08-17 for the hosted authorization check only. Item 9
  passed under that one-check renewal; no provider or customer workflow was
  authorized.
- **Next decision:** By the review date, platform/security must either resolve
  the retained names through a documented removal/rotation decision or renew
  this exception before item 10 or any later hosted authorization/provider
  gate. The exception remains due for review/removal on 2026-09-15.

The browser/server decision remains that only intended `NEXT_PUBLIC_*` values
may be browser-visible. `ENV_TARGET`, `SUPABASE_SERVICE_ROLE_KEY`,
`NEXTAUTH_SECRET`, and all provider, bridge, worker, Redis, cookie, and session
values remain server-only. Production and Preview scans after the write found
zero server-only environment names, key patterns, model/provider patterns, or
source-map references.

## Audit record and sources

- **Audit date:** 2026-08-18 (follow-up to the 2026-08-16 baseline)
- **Code snapshot audited:** Current `dev` working slice; the historical baseline was `e363a5f74ff8ad731272089f8714bd81edb97d3d`.
- **Method:** names-only scan of `process.env` references, bridge runtime
  environment keys, private-worker environment contracts, dynamic test
  allowlists, local/migration scripts, template-only aliases, Supabase
  test/config helpers, and the read-only `vercel env ls` listing. Environment
  values were not read, copied, or recorded. Every code-referenced name is
  classified above; no Mac-only, local/test/process-only, or forbidden name is
  included in the six-name hosted baseline, while existing out-of-contract
  names remain covered by the approved retention exception.
- **Hosted verification:** Current Production deployment
  `dpl_7kr6p3LBfph9VjLMBnYgV627BE2M` reached `READY` and was aliased to
  `https://needthisdone.com`. Production health reported Redis, Supabase, and
  the app up; `/` and `/services` returned `200`; the unsigned protected
  benchmark POST returned `401`; and 15 public scripts contained neither the
  private backup-variable name nor configured model ID. Preview deployment
  `dpl_6NMvvVgVv2aqGtgxFFvqtwWr7Exh` remains unchanged and `READY` from the
  earlier verification.
- **Primary sources:** [`app/lib/env-validation.ts`](../../app/lib/env-validation.ts),
  [`app/lib/supabase.ts`](../../app/lib/supabase.ts),
  [`app/lib/supabase-server.ts`](../../app/lib/supabase-server.ts),
  [`app/lib/supabase-browser.ts`](../../app/lib/supabase-browser.ts),
  [`app/lib/auth-options.ts`](../../app/lib/auth-options.ts),
  [`app/app/api/auth/supabase-bridge/route.ts`](../../app/app/api/auth/supabase-bridge/route.ts),
  [`app/lib/google-oauth-state.ts`](../../app/lib/google-oauth-state.ts),
  [`app/lib/google-calendar.ts`](../../app/lib/google-calendar.ts),
  [`app/lib/openrouter.ts`](../../app/lib/openrouter.ts),
  [`app/lib/openrouter-config.ts`](../../app/lib/openrouter-config.ts),
  [`app/lib/openrouter-model-config.ts`](../../app/lib/openrouter-model-config.ts),
  [`app/lib/redis.ts`](../../app/lib/redis.ts),
  [`app/lib/agent-bridge-auth.ts`](../../app/lib/agent-bridge-auth.ts),
  [`app/lib/private-worker-auth.ts`](../../app/lib/private-worker-auth.ts),
  [`app/lib/email.ts`](../../app/lib/email.ts),
  [`app/app/api/email-forward/route.ts`](../../app/app/api/email-forward/route.ts),
  [`app/lib/prospecting-sender.ts`](../../app/lib/prospecting-sender.ts),
  [`app/lib/prospecting-worker.ts`](../../app/lib/prospecting-worker.ts),
  [`app/scripts/run-prospecting-worker.ts`](../../app/scripts/run-prospecting-worker.ts),
  [`app/e2e/authenticated-employee-workspace.spec.ts`](../../app/e2e/authenticated-employee-workspace.spec.ts),
  [`app/playwright.config.ts`](../../app/playwright.config.ts),
  [`bridge/src/index.ts`](../../bridge/src/index.ts),
  [`bridge/README.md`](../../bridge/README.md),
  [`.env.example`](../../.env.example),
  [`app/.env.example`](../../app/.env.example),
  [`scripts/verify-local-assembly.sh`](../../scripts/verify-local-assembly.sh),
  [`scripts/rehearse-local-data-migration.sh`](../../scripts/rehearse-local-data-migration.sh),
  [`scripts/verify-hosted-migration-step4.mjs`](../../scripts/verify-hosted-migration-step4.mjs),
  [`scripts/apply-hosted-migration-stage.mjs`](../../scripts/apply-hosted-migration-stage.mjs),
  [`scripts/verify-hosted-parity.mjs`](../../scripts/verify-hosted-parity.mjs),
  [`supabase/tests/helpers.ts`](../../supabase/tests/helpers.ts),
  [`supabase/config.toml`](../../supabase/config.toml),
  [`docs/AGENT_OPERATIONS.md`](../AGENT_OPERATIONS.md), and
  [`docs/private-prospect-research-worker.md`](../private-prospect-research-worker.md).
