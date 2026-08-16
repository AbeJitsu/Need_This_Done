# Environment variable inventory

Names-only checklist for comparing the variables required by the retained
application with the names currently configured in Vercel. This is a review
aid, not a deployment manifest, secret record, or approval to complete launch
checklist item 8.

> **Safety warning:** Never record values, tokens, secret fingerprints, copied
> `.env` contents, or screenshots containing them here. Compare variable names
> only. Keep all values in the approved secret manager or private host files.

The `Production` and `Preview` columns are intentionally empty. Complete them
only during an approved, names-only Vercel review. Do not mark item 8 complete
from this document; platform/security approval of the exact allowlist, value
source, and legacy-variable rotation/removal scope is still required.

## Vercel application variables — required baseline

These names form the hosted application baseline. The service-role key,
NextAuth secret, and any other non-`NEXT_PUBLIC_` value are server-only.

| Variable name | Boundary / purpose | Production | Preview |
| --- | --- | --- | --- |
| `ENV_TARGET` | Runtime target guard for the approved hosted Supabase target. |  |  |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase URL used by browser and server clients. |  |  |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase browser-safe key. |  |  |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only Supabase admin client and private routes. |  |  |
| `NEXT_PUBLIC_SITE_URL` | Canonical site URL for links, redirects, and email URLs. |  |  |
| `NEXTAUTH_SECRET` | Server-only NextAuth JWT secret and fallback OAuth-state signing secret. |  |  |

### Vercel application variables — optional runtime acceleration

`REDIS_URL` is optional in the current validation code and the application
degrades when Redis is unavailable. If hosted Redis is used, record its name
in the approved allowlist; do not rely on the code's local fallback in a
hosted deployment.

| Variable name | Boundary / purpose | Production | Preview |
| --- | --- | --- | --- |
| `REDIS_URL` | Transient cache, rate-limit, and deduplication service. |  |  |

## Vercel application variables — later-gated providers

These names may be needed by later launch items, but their presence does not
authorize provider activation, model selection, sending, payment, Calendar,
or external action.

| Variable name | Boundary / later gate | Production | Preview |
| --- | --- | --- | --- |
| `OPENAI_API_KEY` | Optional retained analyzer provider; separately approved provider use. |  |  |
| `OPENROUTER_API_KEY` | Server-only model provider; item 10. |  |  |
| `OPENROUTER_PRIMARY_MODEL` | Server-only pinned primary model ID; item 10. |  |  |
| `OPENROUTER_TEST_MODEL` | Server-only comparison model ID; item 10. |  |  |
| `OPENCLAW_BRIDGE_SECRET` | Server side of the signed Mac bridge; items 12–15. |  |  |
| `GOOGLE_CLIENT_ID` | Google sign-in and Calendar OAuth client; items 9 and 19. |  |  |
| `GOOGLE_CLIENT_SECRET` | Server-only Google OAuth client secret; items 9 and 19. |  |  |
| `GOOGLE_REDIRECT_URI` | Explicit hosted Calendar callback URI; item 19. |  |  |
| `GOOGLE_OAUTH_STATE_SECRET` | Dedicated server-only OAuth-state signer; item 19. |  |  |
| `CALENDAR_TOKEN_ENCRYPTION_KEY` | Server-only Calendar token encryption key; item 19. |  |  |
| `RESEND_API_KEY` | Transactional email provider key; item 17. |  |  |
| `RESEND_FROM_EMAIL` | Approved transactional sender identity; item 17. |  |  |
| `RESEND_ADMIN_EMAIL` | Owner-controlled transactional notification destination; item 17. |  |  |
| `RESEND_WEBHOOK_SECRET` | Server-only transactional webhook verifier; item 17. |  |  |
| `PROSPECTING_SENDER_PROVIDER` | Explicit prospecting sender mode; item 18. |  |  |
| `PROSPECTING_RESEND_API_KEY` | Separate prospecting sender key; item 18. |  |  |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Browser-side Stripe publishable key, only after payment scope approval; item 20. |  |  |
| `STRIPE_SECRET_KEY` | Server-only Stripe key; item 20. |  |  |
| `STRIPE_WEBHOOK_SECRET` | Server-only Stripe webhook verifier; item 20. |  |  |

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

## Names that must remain absent from Vercel

Remove or reject these names from the Vercel application inventory unless a
new, separately reviewed product boundary explicitly replaces this document.
This includes public secret/model aliases, retired commerce/search settings,
legacy provider credentials, and Mac-only worker settings.

| Name or family | Why it must remain absent | Production | Preview |
| --- | --- | --- | --- |
| `NEXT_PUBLIC_E2E_ADMIN_BYPASS` | No hosted authorization bypass. |  |  |
| `NEXT_PUBLIC_OPENROUTER_PRIMARY_MODEL` | Provider/model configuration must not be public. |  |  |
| `NEXT_PUBLIC_OPENROUTER_TEST_MODEL` | Comparison model must not be public. |  |  |
| `NEXT_PUBLIC_CHATBOT_MODEL` | Legacy public analyzer override; use the retained server/provider boundary. |  |  |
| `CONTEXT7_API_KEY` or `CONTEXT7_*` | Context7 is retired and its credential was revoked. |  |  |
| `MEDUSA_*` | Retired Medusa/Railway commerce runtime. |  |  |
| `NEXT_PUBLIC_MEDUSA_*` | Retired public commerce configuration. |  |  |
| `COOKIE_SECRET` | Retired commerce runtime secret. |  |  |
| `ADMIN_CORS` | Retired commerce runtime setting. |  |  |
| `VECTOR_SEARCH_SIMILARITY_THRESHOLD` | Retired vector-search setting. |  |  |
| `VECTOR_SEARCH_MAX_RESULTS` | Retired vector-search setting. |  |  |
| `STRIPE_TEST_SECRET_KEY` | Test-only secret must not enter hosted application settings. |  |  |
| `STRIPE_PAYMENT_LINK_*` | Retired catalog/payment-link variables are outside the current manual fallback. |  |  |
| `BRIDGE_*` except `OPENCLAW_BRIDGE_SECRET` | Mac bridge runtime settings do not belong in Vercel. |  |  |
| `OPENCLAW_GATEWAY_TOKEN` | Loopback Gateway credential is Mac-only. |  |  |
| `OPENCLAW_GATEWAY_URL` | Loopback Gateway endpoint is Mac-only. |  |  |
| `OPENCLAW_REQUEST_TIMEOUT_MS` | Mac bridge runtime setting. |  |  |
| `PROSPECTING_WORKER_*` | Legacy direct-worker settings are not the active Vercel bridge contract. |  |  |
| `PROSPECTING_PROFILE_ID` | Private worker approval/profile selector. |  |  |
| `PROSPECTING_*_APPROVAL` | Human approval markers belong to the private worker command, not Vercel. |  |  |

## Audit record and sources

- **Audit date:** 2026-08-16
- **Code snapshot audited:** `e363a5f74ff8ad731272089f8714bd81edb97d3d`
- **Method:** names-only scan of `process.env` references, bridge runtime
  environment keys, private-worker environment contracts, local/migration
  scripts, and Supabase test/config helpers. Environment values were not
  read, copied, or recorded.
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
  [`bridge/src/index.ts`](../../bridge/src/index.ts),
  [`bridge/README.md`](../../bridge/README.md),
  [`scripts/verify-local-assembly.sh`](../../scripts/verify-local-assembly.sh),
  [`scripts/rehearse-local-data-migration.sh`](../../scripts/rehearse-local-data-migration.sh),
  [`scripts/verify-hosted-migration-step4.mjs`](../../scripts/verify-hosted-migration-step4.mjs),
  [`scripts/apply-hosted-migration-stage.mjs`](../../scripts/apply-hosted-migration-stage.mjs),
  [`scripts/verify-hosted-parity.mjs`](../../scripts/verify-hosted-parity.mjs),
  [`supabase/tests/helpers.ts`](../../supabase/tests/helpers.ts),
  [`supabase/config.toml`](../../supabase/config.toml),
  [`docs/AGENT_OPERATIONS.md`](../AGENT_OPERATIONS.md), and
  [`docs/private-prospect-research-worker.md`](../private-prospect-research-worker.md).
