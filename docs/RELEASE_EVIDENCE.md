# Release Evidence

This matrix defines what NeedThisDone may claim and the proof required before production promotion. A passing mock proves application branching, not database security or a third-party service. The canonical numbered control record is the [production launch checklist](launch/LAUNCH_CHECKLIST.md); this file is its evidence ledger.

## Current release-control and hosted-stage ledger — 2026-08-23

> Tested pre-key implementation: `29c87a5850bffe51e6f90b4dff04e40d3c6fdb84`.
> **PRE-KEY LOCAL GATE: GO.** Local migration head is `106`; reviewed hosted
> migration evidence ends at `095`. The production dependency audit is clean.
> **TECHNICAL LAUNCH: NOT GO.** No hosted migration,
> deployment, credential change, provider request, Mac activation, or external
> action occurred. Technical launch is **NOT GO**.

The current provider-free release boundary has no selected OpenRouter worker
model. `google/gemma-4-26b-a4b-it:free` is the only future activation
candidate. Earlier model and catalog records below are historical evidence,
not active configuration or release claims.

The **pre-key local gate** covers checked-out code, a disposable local database,
deterministic provider fakes, and the offline bridge. **Hosted promotion** is a
separately approved backup, dry run, forward-only migration, deployment, and
hosted verification sequence. **Technical launch** additionally requires
credentials, bounded live provider canaries, reliability and rollback proof,
and an explicit go/no-go decision. Passing the local gate cannot be represented
as either hosted promotion or technical launch.

### Final pre-key local gate — GO — 2026-08-23

Exact implementation `29c87a5850bffe51e6f90b4dff04e40d3c6fdb84`
passed the complete provider-free gate. The fresh production-server assembly
reset only disposable local Supabase, applied migrations `001–106`, restored
the sanitized seed, forced transactional Resend, prospecting Resend, Calendar,
and Stripe invoice adapters to `disabled`, and passed:

- schema lint and all 48 database/schema/RLS/provider-workflow checks;
- lint, TypeScript, 318/318 unit tests, 50/50 accessibility checks, and the
  85-route production build;
- 48 public browser checks with 2 intentional report-fixture skips, 4
  real-session authorization checks, 1 provider-disabled prospecting check, 1
  daily-cockpit check, and 2 operator employee-workspace checks;
- the 0-vulnerability production dependency audit, 8/8 offline bridge tests,
  and the 34-mapping/18-gate migration and environment contract.

The candidate includes one test-only retained-browser contract correction:
the analyzer smoke test now asserts the intentionally current “Get a limited
website snapshot” heading rather than the retired “See where your website”
copy. The focused public matrix and the full fresh assembly both passed after
that correction. No runtime behavior, database, hosted state, credential,
provider, deployment, payment, external message, or Mac worker state changed.

The earlier checksum-gated pre-`073` historical-data rehearsal and the
hosted-like `095 → 106` rehearsal both passed all 48 database checks and
automatically restored sanitized local state. Release metadata for the exact
implementation SHA records local head `106`, each of the four CI results as
`passed`, and exact `deploymentIdentity: null`. The worktree was clean before
this evidence-only documentation update.

The only warning is the Supabase CLI update notice. Scope: local/CI tooling.
Owner: local tooling owner. Reason: proven version `2.65.5` reports `2.115.0`
available, and the upgrade needs its own isolated migration rehearsal.
Review/removal date: 2026-09-15. Chromium needed an approved run outside the
macOS filesystem sandbox to register its Mach port; all browser suites passed
there, so no required check remains warning-only or unavailable.

The pre-key result is not hosted or customer proof. The remaining sequence is:

1. Independent review of the capability matrix and release evidence.
2. Hosted backup and migration dry run.
3. Forward-only hosted migration application for `096–106`.
4. Deployment.
5. Secret and API-key configuration.
6. Individually approved provider canaries and evidence updates.
7. Paid-delivery proof for Website Fix and Managed Automation.

Mac worker installation and launchd activation remain deferred with no
scheduled date. Technical launch remains **NOT GO** until the applicable
hosted, credential, canary, reliability, and rollback controls pass.

**Rollback:** Revert the local application/tooling commits as a reviewed unit
and reset only disposable local Supabase. Preserve hosted history, provider
operation evidence, and protected backups. Any hosted database correction must
be a separately reviewed forward migration.

### Complete local-candidate CI and rehearsal proof — 2026-08-23

The environment contract now exposes only four provider activation controls:
`TRANSACTIONAL_RESEND_PROVIDER`, `PROSPECTING_RESEND_PROVIDER`,
`CALENDAR_PROVIDER`, and `STRIPE_INVOICE_PROVIDER`, each accepting
`disabled | fake | live`. Example values are blank. Credentials alone do not
activate adapters, local fakes additionally require
`OFFLINE_ASSEMBLY_PROOF=true`, and the Website Fix invoice adapter rejects a
live-mode Stripe key. Transactional and prospecting Resend webhook secrets are
separate. The provider-free assembly explicitly disables all four adapters and
clears provider credentials and webhook secrets.

The manifest-driven stage gate verified 34 byte-tracked mappings and 18 gates,
classifying `073–095` as historical hosted stages and `096–106` as one
contiguous pending range against expected hosted head `095`. The protected,
checksum-verified pre-`073` snapshot was restored only into disposable local
Supabase and migrated through `106`; historical inventory stayed unchanged
through all five additive stages, retired objects disappeared only at the
isolated `090–092` gate, and retained objects remained through `106`. A second
disposable database rebuilt to `095`, applied exactly 11 migrations through
`106`, and proved the hosted-like path. Each rehearsal passed schema lint and
all 48 database checks, then restored sanitized local state.

The CI workflow now has four independent jobs: production dependency audit,
local database/schema/RLS, offline bridge, and code. The final metadata job can
run only after all four succeed; its schema requires the checked-out commit,
local migration head `106`, individual passed results, and exact
`deploymentIdentity: null`. It rejects an incomplete gate or any deployment
identity. Local validation passed the clean production audit, 8/8 bridge tests,
316/316 unit tests, 50/50 accessibility checks, lint, TypeScript, the 46-page
production build, environment/CI contract, both rehearsals, workflow YAML
parsing, and whitespace checks.

The only warning is the local Supabase CLI update notice: proven version
`2.65.5` reports `2.115.0` available. Scope: local/CI tooling only. Owner:
local tooling owner. Reason: upgrade only in an isolated migration rehearsal.
Review/removal date: 2026-09-15. This is not a hosted, provider, deployment, or
customer proof. Technical launch remains **NOT GO**.

**Rollback:** Revert the CI/environment/rehearsal tooling slice and reset only
disposable local Supabase. Preserve hosted migration history and protected
backups; any hosted database correction remains a reviewed forward migration.

### Simplified public-journey proof — 2026-08-23

The public route contract now presents only **Website Fix** and **Managed
Automation**, with the agreed plain descriptions and canonical calls to action.
Canonical links use `website-fix` and `managed-automation`; the old offer query
values and section anchors remain accepted without being displayed. Public
navigation and the footer do not advertise a customer account or portal.
`/login` remains available as a no-index, private team sign-in. The Work page
explicitly identifies its material as process examples and not paid client
outcomes.

The homepage, Services, Pricing, How It Works, and Work pages reuse semantic
offer-comparison, three-step, and Prepared/Reviewed/Approved flows instead of
repeating card-wall diagrams. The current public homepage is intentionally
text-led: it does not render the legacy WebP or generic hero PNG. Canonical
offer pages are `/website-fix` and `/managed-automation`; `/services` is a
brief chooser retaining old anchors only for inbound compatibility. The public
shell is separate from private workspace chrome, and generic contact requires
an explicit offer choice. The snapshot/report presentation describes selected
signals rather than a grade, compliance verdict, or certification.

Validation passed on the public-layer change: 316/316 unit tests, 50/50
accessibility checks, lint with zero warnings, TypeScript, and the production
build. The prior local production-server browser matrix passed 48 checks with 2
intentional project skips across desktop and mobile projects; its explicit
responsive contract additionally exercises 375, 768, and 1280 pixel widths,
keyboard-opened mobile navigation, headings, overflow, decorative image
semantics, absence of public sign-in links, and reduced-motion preference.
New palette assertions require at least 4.5:1 contrast for normal-text color
pairs. No hosted write, database migration, secret, provider request,
deployment, payment, external message, or Mac worker action occurred.

**Rollback:** Revert only the public-journey application/assets/documentation
commit. Do not roll back migrations `105`–`106`, delete historical
relationships, or change hosted state.

### Managed Automation outcome-first public copy — 2026-08-23

Public Managed Automation content now describes one repeated problem at work,
a shared picture of the better result, and focused work to move it forward.
The canonical offer page, homepage, services, pricing, work examples, contact
intake, reusable offer and modal configuration, metadata, and JSON-LD no
longer use operator names, private-operation language, approval mechanics,
30-day duration, or weekly briefs as the marketing promise. Legal and private
operator materials retain their necessary delivery and approval terms.

The desktop header CTA has explicit `px-7 py-3` pill spacing. Its target,
colors, hover state, placement, and mobile-menu CTA remain unchanged; the
mobile menu also closes with Escape. Validation passed: 318 unit tests, 50
accessibility tests, lint, TypeScript, production build, and 34 focused public
browser checks across desktop and mobile (2 desktop-only project skips),
including no horizontal overflow at 375, 768, and 1280 pixels. No database,
hosted state, credential, provider, deployment, payment, external message, or
Mac worker changed.

**Rollback:** Revert this application and documentation slice only. Preserve
all migrations, hosted history, and protected backups.

### Local migration-104 proof — 2026-08-22

The reviewed baseline is `b00fcaade7df55c08c0e9b067e526065b99de082`.
Disposable local Supabase reset cleanly
through migration `104`; schema lint and the complete `verify:database` gate
passed. The generalized staged verifier passed 32 mappings and 16 gates.
`verify:code` passed with 222 unit tests, 50 accessibility tests, lint,
TypeScript, and the production build; bridge build plus all 8 offline tests
passed. No credential, provider, hosted, deployment, or external action was
used.

The provider-free fresh assembly reset did reach migration `104` and the code
gate, but its Playwright browser phase is **not claimable** in this sandbox:
Chromium was denied the macOS Mach-port registration (`Permission denied`).
Owner: frontend QA / local-environment owner. Remove by rerunning the exact
assembly on an approved interactive Mac environment before promotion. This is
not evidence of a product-browser regression and it does not change **NOT GO**.

### Local migration-105 operator-only proof — 2026-08-23

Forward migration `105_operator_only_private_surfaces.sql` preserves existing
users, project links, customer memberships, files, comments, handoffs, and
delivery history while making those historical relationships incapable of
granting non-admin access. Private APIs and the dashboard/employee pages are
admin/operator-only; anonymous requests receive `401`, ordinary authenticated
requests receive `403` without private data, and the historical client project
list and access-management routes are retired. Public project intake no longer
creates a user link. GitHub handoffs are operator-only drafts and cannot notify
until the explicit transactional action is implemented.

The machine-readable capability manifest covers all 83 route files, exact
methods, exposure classes, capabilities, and evidence references. Its scanner
fails on missing/stale routes, method drift, missing evidence, invalid signed or
retired boundaries, or operator routes that use ordinary authentication.
Disposable local Supabase reset cleanly through `105`; the complete database
gate passed (9 schema, 14 security, 10 AI-employee RLS, 3 agent-operations, 2
planner, 2 prospecting, and 1 consultation checks). The staged verifier passed
33 mappings/17 gates, 240/240 unit tests passed, lint and TypeScript passed, and
the real-session browser contract passed 4/4. No credential, provider, hosted
write, deployment, payment, external action, or worker activation occurred.
Technical launch remains **NOT GO**.

### Local migration-106 provider-recovery proof — 2026-08-23

Forward migration `106_provider_workflow_recovery_links.sql` preserves and
backfills all handoffs and outreach messages while giving each row exactly one
durable provider operation. The backfill and insert triggers store only the
handoff/project or message/profile/prospect identifiers in request metadata;
recipient addresses, subjects, bodies, notes, attachments, tokens, and raw
webhook content are excluded. Operation links, idempotency keys, operation
types, provider identities, and request metadata are immutable.

Provider acceptance and the relevant handoff or outreach transition now commit
in one service-role transaction. Exact replays are safe, mismatched replays are
rejected, a failed webhook persistence step remains retryable, and browser
roles have neither table access nor function execution. The explicit
`acceptance_unknown` state prevents an unresolved Resend operation older than
24 hours from returning to the automatic retry path. Service-only
reconciliation records confirmed acceptance or confirmed non-acceptance
without contacting the provider; the operator-facing endpoint is claimed
separately by the transactional-email proof below.

A disposable local reset replayed migrations `001`–`106` successfully. An
isolated `105`→`106` rehearsal preserved representative historical sent
handoff and outreach rows and linked each to one safe succeeded operation.
Local schema lint reported no errors; `verify:database` passed 48 checks (9 schema,
14 security, 10 AI-employee RLS, 3 agent-operations, 2 planner, 2 prospecting,
7 provider recovery, and 1 consultation). The migration-stage verifier passed
34 mappings and 18 gates. `verify:code` passed 249 unit tests, 50 accessibility
tests, lint with zero warnings, TypeScript, and the 46-page production build.
No credential, provider request, hosted write, deployment, payment, external
message, or worker activation occurred. Technical launch remains **NOT GO**.

**Rollback:** Stop the affected callers and use a separately reviewed forward
migration. Preserve provider operations, receipt history, domain links,
handoffs, outreach messages, and migration history.

### Transactional email and approved-handoff proof — 2026-08-23

All transactional email workflows now require a caller-owned operation key at
the logical event boundary. Project confirmations and operator notices, site
reports, sign-in notices, explicitly confirmed GitHub handoffs, and verified
inbound forwarding use the same transactional operation service. The prior
direct Resend construction and helper-generated email retry keys were removed.
Operation persistence is restricted to a domain reference, recipient hash,
subject, provider message ID, and status; it excludes addresses, bodies,
attachments, credentials, tokens, and raw inbound content.

The handoff route remains operator-only and requires `confirm: true` for both
the first notification and a retry. It reuses the operation ID and exact key
created with the draft. Provider acceptance and the handoff transition commit
atomically; an acceptance/database disagreement is durable
`acceptance_unknown`. The operator reconciliation route records only confirmed
acceptance or confirmed non-acceptance and has no provider adapter. The 84-route
capability manifest classifies and tests this new route.

The transactional webhook reads the raw request body once and verifies native
Svix signatures with `TRANSACTIONAL_RESEND_WEBHOOK_SECRET`. Inbound forwarding
is a compatibility alias to that same handler. Duplicate completed receipts do
not repeat work, and forwarding or event-persistence failure marks the receipt
retryable. Even when a credential exists, inbound body retrieval cannot contact
Resend unless the transactional lane is explicitly in `live` mode.

Focused service, handoff, reconciliation, webhook, signature, forwarding, and
manifest contracts passed 29/29. `verify:code` passed lint with zero warnings,
TypeScript, 269 unit tests, 50 accessibility tests, and the 84-route production
build. `verify:database` passed schema lint and all 48 behavioral checks through
migration `106`. This is deterministic local proof only: providers were
disabled and no hosted state, credential, provider call, deployment, payment,
external message, or Mac worker changed. Technical launch remains **NOT GO**.

**Rollback:** Revert the transactional application and manifest changes as one
slice. Keep migration `106`, provider operations, webhook receipts, handoffs,
and audit records intact; hosted rollback remains forward-only.

### Isolated prospecting Resend proof — 2026-08-23

The prospecting sender has one explicit `disabled | fake | live` adapter
boundary under `PROSPECTING_RESEND_PROVIDER`. Fake mode requires the offline
assembly flag, live mode requires the separately scoped prospecting Resend key,
and a credential by itself cannot activate delivery. The transactional Resend
key and webhook secret are not used by this lane.

An outreach draft receives its durable provider operation and idempotency key
before approval. The explicitly approved send action reuses that exact key,
prepares the linked operation, and commits provider acceptance with the
outreach transition through the service-only migration-106 function. Provider
failure remains retryable; an acceptance/database disagreement becomes
`acceptance_unknown` rather than an automatic resend. The route retains
operator authorization, human approval, current sender validation, emergency
stop, current suppression, and the database-enforced daily approval cap.

Only the raw-body route verified by `PROSPECTING_RESEND_WEBHOOK_SECRET` accepts
provider events. Completed receipt replays do not repeat work; partial event or
receipt failures remain retryable. Correlated bounce and unsubscribe events
maintain the durable suppression record. The event ledger retains the payload
hash, not the raw webhook body.

Focused sender, route, webhook, signature, suppression, and capability tests
passed 20/20. `verify:code` passed lint, TypeScript, 281 unit tests, 50
accessibility tests, and the 84-route production build. `verify:database`
passed schema lint and all 48 behavioral checks through migration `106`.
Providers remained disabled; no hosted write, credential, provider call,
deployment, external message, payment, or worker activation occurred.
Technical launch remains **NOT GO**.

**Rollback:** Disable the prospecting provider mode and revert this application
slice if needed. Preserve outreach messages, operation links, webhook receipts,
sender events, suppression records, and audit history.

### Durable Calendar operation proof — 2026-08-23

The operator Calendar boundary now creates idempotency keys server-side and
returns a durable operation ID. Retry input contains only that operation ID;
the server reloads the immutable operation key and request metadata. Strict
route validation rejects browser idempotency keys and provider event IDs.
Encrypted OAuth tokens remain behind the server token service and neither the
operation response nor the provider input contains a decrypted token.

Create addresses one deterministic Google event ID: `ntd` followed by a
32-character lower-case base32hex SHA-256 prefix derived from the durable key.
Update, cancel, and delete use only the latest stored project reference. Cancel
uses a status update with attendee notifications; delete is notification-free
and requires the exact cleanup reason `test_or_accidental`. Deterministic fake
mode uses the same identity and validation semantics without network access.

Disabled mode and provider failures persist a retryable operation and return
its ID. A provider-returned ID mismatch or provider acceptance/database
disagreement records `acceptance_unknown`, including the returned reference,
and cannot be automatically retried. Successful acceptance commits the
provider operation and Calendar reference through the service-only database
function.

Focused provider, service, route, replay, cleanup, and capability contracts
passed 21/21. `verify:code` passed lint, TypeScript, 297 unit tests, 50
accessibility tests, and the 84-route production build. `verify:database`
passed schema lint and all 48 behavioral checks through migration `106`.
Calendar stayed disabled; no OAuth, credential, provider call, hosted state,
deployment, external action, payment, or Mac worker changed. Technical launch
remains **NOT GO**.

**Rollback:** Disable the Calendar provider and revert this application slice.
Preserve durable provider operations, Calendar references, encrypted token
records, and audit history.

### Test-only Website Fix invoice proof — 2026-08-23

The canonical operator-only boundary is
`/api/admin/website-fix/invoices`. The historical Website Improvement URL is an
authenticated, non-advertised `307` compatibility redirect. A new request
contains a project ID and explicit confirmation; retry contains only the
server-issued operation ID. Strict validation rejects browser idempotency keys,
Stripe invoice IDs, amounts, and currencies.

The adapter is fixed to one `25000`-cent USD Website Fix start invoice under
test-mode credentials. A live-mode Stripe secret is rejected even when the
adapter is explicitly enabled. There is no cart, checkout session,
subscription, recurring charge, Customer Portal, payment-method creation, or
card-storage behavior. Provider failure is retryable with the stored exact key;
provider acceptance/database disagreement records `acceptance_unknown` with
the returned reference and blocks automatic retry.

The raw-body Stripe webhook requires `STRIPE_WEBHOOK_SECRET`, rejects
live-mode events, and accepts only signed paid, declined, void, and refunded
transitions for a known invoice matching 25000 cents USD. Bad signatures,
unknown invoices, wrong amount/currency, and changed receipt replays fail
closed. Failed transition persistence marks the receipt retryable; completed
duplicates do not repeat work.

Focused invoice service, adapter, webhook, route, compatibility, fallback, and
capability contracts passed 26/26. `verify:code` passed lint, TypeScript, 315
unit tests, 50 accessibility tests, and the 85-route production build.
`verify:database` passed schema lint and all 48 behavioral checks through
migration `106`. Stripe stayed disabled; no credential, provider call, hosted
state, deployment, external action, payment, or worker activation occurred.
Technical launch remains **NOT GO**.

**Rollback:** Disable the Stripe invoice provider and revert this application
slice. Preserve invoice references, operation keys, webhook receipts,
transitions, and audit history.

### Historical local migration-103 proof — 2026-08-19

Committed candidate `5c2b9f9` plus the pending local verification repair was
reset against disposable local Supabase through migration `103`. Schema lint,
the retained manifest (9/9), security (14/14), AI employee RLS (10/10), agent
operations RLS (3/3), planner RLS (2/2), prospecting RLS (2/2), consultation
integration (1/1), bridge tests (8/8), code gate (221 unit tests, 50 a11y
tests, and the 49-page build), and the 31-mapping/15-gate staged-manifest
verifier passed. The production audit is now clean after compatible AI SDK,
React Email, PostCSS, and NanoID upgrades. A fresh provider-free assembly
passed through `103`, including the local production server, 47 retained smoke
passes with one intentional skip, auth 4/4, prospecting 1/1, cockpit 1/1, and
employee workspace 2/2. No hosted or provider action occurred.

**Decision:** **Corrected candidate `e363a5f74ff8ad731272089f8714bd81edb97d3d` passed items 1–7, 7.1, and 9; item 8 remains an owner-approved, time-boxed retention `EXCEPTION`, not a clean six-variable allowlist pass.** Item 9 passed only after the item-8 retention scope was expressly renewed for this check on 2026-08-17. This evidence does not authorize provider activation, payment, Calendar, publication, or live external action. `8b8d429` remains the documented application rollback reference.

The reviewed `dev` SHA `9d82a627d6d589b09f46d9cdb20d0b5dcf49a6ce` passed `NEXT_PUBLIC_DASHBOARD_PREVIEW=false npm run verify:assembly:fresh`, bridge build/tests 6/6, the 23-mapping/9-gate migration-stage verifier, and whitespace validation on 2026-08-15. The fresh assembly reset only disposable local Supabase, replayed migrations `001`–`095`, restored the sanitized seed, and passed the documented code, database, browser, and workspace checks. The documented exceptions remain dependency advisories, the installed Supabase CLI version notice, and the Playwright startup-path exclusion. No provider credential or hosted state was used by that local assembly.

The corrected candidate `e363a5f74ff8ad731272089f8714bd81edb97d3d`, including
the boundary commit `f567844` and contact refinement `e363a5f`, passed
`ASSEMBLY_PRODUCTION_SERVER=true NEXT_PUBLIC_DASHBOARD_PREVIEW=false npm run
verify:assembly:fresh` on 2026-08-16: local migrations `001`–`095`, schema lint,
213 required unit tests, 50 accessibility checks, the 49-page production
build, retained public browser checks (47 passed and one intentional mobile
navigation skip), authenticated auth 4/4, prospecting 1/1, cockpit 1/1,
workspace 2/2, and bridge tests 6/6. `git ls-remote origin refs/heads/dev`
verified the published tip exactly.

The planner/OpenClaw proof is included in the canonical `npm run verify:database` gate. It proves draft-only planning, approval-before-dispatch, frozen snapshots, OpenClaw-only claiming, model reservations, strict HTTPS citation validation, provenance linkage, private artifact boundaries, and authenticated direct-write denial.

### Local worker fail-closed hardening — 2026-08-19

Migration `098_fail_closed_openclaw_schedule_and_provenance.sql` is applied
only to disposable local Supabase. It prevents the private worker from
claiming a future scheduled run or one whose growth profile has emergency stop
active, and requires an approved OpenClaw completion to persist a non-empty
provider-usage object and the Gateway-reported exact model ID. Reconciliation,
provenance, and task completion share one service-role transaction, so a
completion failure rolls back the usage reservation update. A missing or
mismatched model fails before completion. The bridge has tracked, review-only
launchd templates for the loopback Gateway and signed bridge; its tested
renderer rejects insecure private files, unsafe XML paths, unresolved
placeholders, and malformed XML and never loads a job or creates/reads a
secret. Local schema manifest (9/9), planner RLS tests (2/2), app TypeScript,
and bridge offline tests (8/8) passed. Hosted
history remains `91/095`; no provider, Mac, hosted, sender, Calendar, or
payment action occurred. This does not advance items 10–22.

**Provider and secret boundary:** An OpenRouter API key and exact model IDs remain private environment variables. Step 10A used the existing provider key for exactly six sanitized comparison requests and retained provider-reported usage/cost in hosted Supabase; it did not activate a worker, pin a model, change Vercel variables, or run an external action. The active local environment is one profile, with root `.env.local` linked to `.env.local.profile` and `app/.env.local` linked to the root active profile. The server validates pinned primary/comparison IDs, permits `OPENROUTER_BACKUP_MODEL` only in the private probe boundary, and persists the actual endpoint model returned for a probe request. A future Mac worker must use the same private values in its own chmod-600 `--env-file` outside the repository. The assembly remains provider-free and uses no payment, sender, calendar, deployment, publish, spend, account, or external-message action. The backup probe is implementation-only until its separately approved two-request provider check is recorded. See [Step 10A evidence](launch/step-10a-model-comparison-2026-08-17.md).

**Release blockers and exceptions:** Hosted history is `91/095`, and the final parity report plus the Step 9 authorization verifier pass with four temporary users cleaned and zero cleanup errors. The historical blocked result is [hosted-parity-pre-repair-report-2026-08-15.json](launch/hosted-parity-pre-repair-report-2026-08-15.json); the final result is [hosted-parity-report-2026-08-15.json](launch/hosted-parity-report-2026-08-15.json); the repair records are [step-5-storage-policy-repair-2026-08-15.md](launch/step-5-storage-policy-repair-2026-08-15.md) and [step-5-hosted-security-repairs-2026-08-15.md](launch/step-5-hosted-security-repairs-2026-08-15.md); the Step 9 record is [step-9-hosted-authorization-2026-08-17.md](launch/step-9-hosted-authorization-2026-08-17.md). Item 8 is an approved retention exception: the names-only Vercel audit found 55 names in each scope before the change, `ENV_TARGET` was added only to Production and Preview, those scopes now have all six baseline names plus the retained existing names, and Development is unchanged. Supabase, Google, `NEXTAUTH_SECRET`, cookie/session, Redis, provider/email/payment, and legacy/test entries were not revoked or rotated. Abe Reyes / `abejitsu` owns the exception; it was renewed for Step 9 on 2026-08-17 and review/removal is due 2026-09-15. The exception is not provider activation approval; item 9 passed under this one-check renewal, and items 10–22 remain blocked until later approvals are complete. On 2026-08-22, `npm audit --omit=dev --audit-level=high` found **0 vulnerabilities**, removing the prior dependency-audit blocker. The installed Supabase CLI is `2.65.5` versus `2.114.0` available (same owner and date). The Playwright development-server path has a local Tailwind parsing issue, so the final gate uses its reproducible production-server mode (frontend QA; review/removal date 2026-08-16). Legal copy still needs human/legal review before publication (human/legal reviewer; review by 2026-08-16 or before publication).

**Rollback:** Hosted `090`–`095` completed successfully; no rollback was needed. Preserve the history, backups, and evidence and use only reviewed forward migrations for any database correction. Redeploy `8b8d429` for an application rollback if needed.

## Hosted Step 10A — model comparison — 2026-08-17

The exact DeepSeek V4 Flash 0731 and Nemotron 3 Ultra IDs were both present
and available in the live OpenRouter catalog. The approved run made exactly
six completion requests with three fixed sanitized tasks per model. DeepSeek
returned valid structured JSON for all three tasks at a provider-reported
cost of `$0.000122624`; Nemotron’s three requests were rejected before
generation by the account’s OpenRouter privacy/data-policy guardrail, and
those failures were durably recorded with zero cost and repair-required
flags. All six usage reservations reconciled.

The hosted comparison profile remains `evaluation-required`, with no selected
model, schedule, task, prospect, outreach message, or external recipient.
This is partial evaluation evidence, not provider activation or a primary
model decision. A privacy-policy change, repeat comparison, and model pin are
separate approvals. The complete sanitized record is [Step 10A model comparison](launch/step-10a-model-comparison-2026-08-17.md).

### Free replacement discovery — 2026-08-18

A read-only account-filtered catalog check using the [OpenRouter free text
model view](https://openrouter.ai/models?order=da-elo-high-to-low&max_output_price=0.5&output_modalities=text&variant=free)
identified `google/gemma-4-31b-it:free` as the recommended next comparison
candidate. Its current metadata reports text output, zero prompt/completion
pricing, 262,144-token context, `response_format` and tool support, and an
Artificial Analysis intelligence index of 29.7. No Design Arena ELO is
currently attached to this model. The current endpoint list contains Google AI
Studio's exact free variant `google/gemma-4-31b-it-20260402:free`.

`google/gemma-4-26b-a4b-it:free` is retained as the backup candidate because
the account-filtered endpoint list currently contains two free providers and
both advertise `response_format` and tools. The moving `openrouter/free`
router was not recommended because the worker requires an exact pinned model
ID. This discovery made no completion request, hosted write, Vercel variable
change, or model-selection decision; a repeat comparison remains separately
approval-gated.

### Free backup route implementation — 2026-08-18

Migration `096_openrouter_dynamic_route_evidence.sql` adds the private
`OPENROUTER_BACKUP_MODEL` boundary, actual endpoint IDs on evaluation and usage
records, and a service-role-only recording function. The signed probe accepts
`openrouter/free` only as a dynamic evidence route (or an exact `:free` model
as the manual replacement), makes exactly two sanitized non-streaming
requests, requires provider parameters for structured/tool requests, stores
the returned endpoint model, and leaves the profile `evaluation-required`.
It has no web-search, sender, publication, spend, or external-recipient path.

The migration was applied only to disposable local Supabase. TypeScript,
21 targeted tests, `git diff --check`, schema manifest 9/9, prospecting RLS
2/2, and local schema lint passed. Hosted history remains `91/095`; no hosted
migration or live provider request occurred. The separate provider check is
pending because this workspace had no signed private-worker environment or
explicit benchmark approval marker. Owner: Abe Reyes / private-operator
owner. Review/removal date: 2026-09-15 or before any backup activation.

### Hardcoded fallback retirement and environment provisioning — 2026-08-18

The current public OpenRouter catalog contains paid DeepSeek IDs but no
`deepseek/deepseek-v4-flash:free`; it lists
`google/gemma-4-26b-a4b-it:free` with zero prompt and completion prices. The
nonexistent hardcoded fallback was removed from active selection, worker, and
planner paths. Migration `097_retire_hardcoded_deepseek_fallback.sql`
deactivates historical fallback candidates and returns a retained historical
route to `evaluation-required` while preserving evidence.

The exact Gemma ID is now stored as private `OPENROUTER_BACKUP_MODEL` in the
chmod-600 local profile and as an encrypted server-only variable in Vercel
Production and Preview. A names-only check confirmed the variable in both
scopes; Development remains unchanged. The configuration action itself made
no deployment or provider request. A later explicit owner directive separately
deployed the reviewed working slice to Vercel Production as
`dpl_7kr6p3LBfph9VjLMBnYgV627BE2M`, which reached `READY` and was aliased to
`https://needthisdone.com`. Production health reported Redis, Supabase, and the
app up; `/` and `/services` returned `200`; the unsigned protected benchmark
POST returned `401`; and 15 public scripts contained neither the private
variable name nor configured model ID. The hosted queue read was kept
compatible with hosted schema `095`; migrations `096`–`097` remain local-only.
No provider request, model pin, hosted database write, publication, spend, or
external-recipient action occurred. The immediate application rollback is
prior Production deployment `dpl_4XP38V8P6G8NGBb517aMa658m5Qm`.

Lint passed with zero warnings, TypeScript passed, 219/219 required unit tests
passed, the 49-page production build passed, `git diff --check` passed, and the
complete local database gate passed all 41 schema, security, RLS, and
integration checks through migration `097`.

## Hosted parity endgame — 2026-08-15

Local migration `095` is now the security-repaired target and hosted is at
`91/095`. The isolated destructive stage and the `093`–`095` repair stages
passed their fresh-backup, exact-dry-run, apply, history, and forward-only
checks. Hosted tenant, planner, worker, provenance, emergency-stop,
lease/idempotency, Storage privacy, and cleanup evidence all pass. See
[HOSTED_PARITY_ENDGAME.md](launch/HOSTED_PARITY_ENDGAME.md), the
[destructive-retirement evidence](launch/step-5-destructive-retirement-2026-08-15.md),
the [Storage-policy repair evidence](launch/step-5-storage-policy-repair-2026-08-15.md),
the [hosted security repair evidence](launch/step-5-hosted-security-repairs-2026-08-15.md),
and the [final parity report](launch/hosted-parity-report-2026-08-15.json).

## Production cutover — 2026-08-15

Step 7 fast-forwarded remote `production` from `8b8d429` to the
branch-alignment commit `0aac9c144da4ea9144050003aea37d3c4cdcd3f3` and
deployed that application tree to the linked Vercel project. Final branch-triggered deployment
`dpl_6Jh1KMSZsqAPUB9fkkhpP8Bt3DSB` reached `READY` and was aliased to
`https://needthisdone.com`. The health endpoint reported the app, Redis, and
Supabase up; public routes returned `200`; anonymous planner and worker POSTs
returned `401`. The full record is in
[step-7-production-cutover-2026-08-15.md](launch/step-7-production-cutover-2026-08-15.md).

No Vercel environment variable or provider setting was changed. Step 8 has not
started.

## Corrected production cutover — 2026-08-16

The corrected candidate `e363a5f74ff8ad731272089f8714bd81edb97d3d` was
fast-forwarded to `origin/production` and deployed as
`dpl_GVMHoCVSKiMgy2nse84zKs1cXafc`. The deployment reached `READY` at
`https://app-m3bsrt3t0-vision2virtual.vercel.app` and was aliased to
`https://needthisdone.com`.

The health endpoint reported Redis, Supabase, and app `up`; `/`, `/contact`,
and `/services` returned `200`; anonymous planner and bridge requests returned
`401`; the contact desktop/mobile contract passed 6/6; and retained offer
switching passed 2/2. A read-only production bundle scan fetched 15 contact
scripts and found no server-only environment identifiers, provider-key shapes,
model-ID patterns, or source-map URLs. During this pre-item-8 cutover, no
Vercel environment value, provider setting, hosted database state, payment
state, or customer data changed.

The detailed record is [corrected Step 7 deployment](launch/step-7-corrected-contact-deployment-2026-08-16.md).

## Vercel retained-variable exception — 2026-08-16

The names-only preflight found 55 existing names in Development, Preview, and
Production. Only the non-secret `ENV_TARGET=cloud` marker was added, and only
to Preview and Production. Those scopes now have 56 names and all six baseline
names; Development remains at 55 names with no `ENV_TARGET`. No existing
Supabase, Google, cookie/session, Redis, email/payment/provider, legacy, or
test variable was overwritten, revoked, rotated, or read.

The owner-approved exception is Abe Reyes / `abejitsu`, approved 2026-08-16,
with review/removal due 2026-09-15. It preserves the current Vercel inventory
for compatibility and is not a clean six-variable pass. Presence does not
activate a provider, enable a model, authorize a sender, or permit a customer
workflow. Abe expressly renewed the same retention scope for item 9 on
2026-08-17; item 9 is therefore recorded separately as passed, while items
10–22 remain independently blocked. The exception still requires review or
removal by 2026-09-15.

The reviewed application was redeployed successfully: Production
`dpl_4XP38V8P6G8NGBb517aMa658m5Qm` reached `READY` and is aliased to
`https://needthisdone.com`; Preview
`dpl_6NMvvVgVv2aqGtgxFFvqtwWr7Exh` reached `READY` at
`https://app-2mcan7im8-vision2virtual.vercel.app`. Production health and all
tested public routes returned `200`; anonymous planner and bridge POSTs
returned `401`. Preview returned the same public-route and authorization
results, and its health endpoint returned `200` with healthy JSON through
Vercel's automatic protection bypass (direct unauthenticated Preview health requests
return the platform SSO redirect).

The Production and Preview browser bundles discovered from `/` and `/contact`
contained zero server-only environment names, key-pattern matches,
model/provider matches, and source-map references. No provider activation,
hosted database write, payment, Calendar, publication, spend, account change,
or external message occurred. If the deployment fails, preserve the existing
variables, remove only the new `ENV_TARGET` entries if necessary, and redeploy
the prior reviewed application `8b8d429`.

## Hosted authorization verification — 2026-08-17

The item-8 retention exception was expressly renewed by Abe Reyes / `abejitsu`
for this authorization check only. Its review/removal date remains
2026-09-15. The reviewed Production and Preview deployment identities were
reconfirmed as `Ready` before the verifier ran; no deployment or Vercel
environment value changed.

The existing `verify:hosted-parity` command passed against the approved cloud
Supabase project. The sanitized record is [Step 9 hosted authorization
evidence](launch/step-9-hosted-authorization-2026-08-17.md). It proves the
hosted endpoint identity, exact history through `095`, schema/RLS/grant
boundaries, anonymous/private Storage denial, owner/manager access, viewer
read-only behavior, tenant isolation, planner approval-before-dispatch,
service-role worker access, Storage privacy/limits, emergency stop,
lease/idempotency, provenance isolation, and disposable fixture cleanup.

Four `.invalid` fixture users were created and four were cleaned with zero
cleanup errors. The verifier reported zero external provider calls, zero real
recipients, and no object-byte downloads. It did not run the local-only browser
spec against cloud. Item 9 is `PASSED`; this result does not activate any
provider or authorize a customer workflow, and items 10–22 remain separate
gates.

## Contact-page repair — 2026-08-16

Corrected candidate `e363a5f74ff8ad731272089f8714bd81edb97d3d` moves both
context legends into consistent responsive fieldset panels with clear spacing
and no border overlap. The native `legend`/`fieldset` relationship remains
intact, and the change does not alter form fields, the submission API, pricing,
wording, or customer-data handling.

The focused ContactIntake accessibility suite passed 2/2. Lint, TypeScript,
the production build (49 pages), and `git diff --check` passed. The contact
browser contract passed 6/6 across the configured public desktop and
iPhone-sized mobile projects, including the geometry assertion and both offer
selections. The retained contact-intake contract passed 2/2 across desktop and
mobile, including switching from Website Improvement to Automation System
Setup. No hosted, Vercel, provider, payment, or customer-data state changed.

The corrected deployment passed its live checks. Item 8 environment
configuration is now recorded separately as the time-boxed retained-variable
exception above; it is not a clean six-variable allowlist pass.

## Browser/server release boundary — 2026-08-16

The browser Supabase client is now isolated from the server-admin client, and
display-only preview data no longer embeds provider/model IDs. The local
production bundle and corrected deployed bundle contain no server-only
environment identifiers, provider-key shapes, model-ID patterns, or source
maps. Auth behavior and server APIs remain unchanged.

## Hosted backup gate — 2026-08-12

**Decision:** Launch checklist item 3 passed. This evidence authorizes only the protected backup capture and verification; it does not authorize a hosted migration, deployment, provider activation, secret change, or other hosted write.

The backup for hosted project `oxhjtmozsdstbokwtnwa` is retained outside the repository at `/Users/abiezerreyes/Documents/NeedThisDone Backups/2026-08-11-pre-migration-072-url-retry`. The SQL snapshot was preserved without overwrite. The mode-`700` directory contains mode-`600` artifacts, and `SHA256SUMS-FINAL.txt` verifies all eight final artifacts. Storage metadata records one private `project-attachments` bucket and 217 object metadata records; pagination completed and object contents were not downloaded. The read-only hosted migration-history query returned 68 rows with latest version `072`.

Independent readability, permissions, symlink, checksum, JSON/JSONL, duplicate-name, and no-object-content checks passed. The established read-only local recovery preflight also passed without resetting, restoring, querying, or migrating any database. The read-only hosted migration dry run for `073`–`092` is now recorded in the [Step 4 evidence record](launch/step-4-migration-dry-run-2026-08-12.md). The next gate is the deterministic Step 4 review command; no hosted write has been authorized.

## Hosted migration dry-run gate — 2026-08-13

The original blanket `073`–`092` review has been replaced with six staged, batch-specific reviews. The exact old-to-new mapping and byte-preserved SHA-256 pairs are in [Step 4 evidence](launch/step-4-migration-dry-run-2026-08-12.md) and `docs/launch/hosted-migration-stages.json`:

| Stage | New migrations | Original migrations | Gate |
| --- | --- | --- | --- |
| Calendar token security | `073` | `073` | Separate |
| Storage bucket normalization | `074` | `074` | Separate |
| Additive product/workflow | `075`–`080` | `075`, `079`–`083` | Batch |
| Growth-profile evaluation | `081` | `084` | Separate |
| Research/agent/planner | `082`–`089` | `085`–`092` | Batch |
| Destructive retirement | `090`–`092` | `076`–`078` | Final separate gate |

The first five stages do not delete retired data. The final stage is isolated and retains the original destructive SQL only. On 2026-08-13, `cd app && npm run verify:hosted-migration-step4` passed both deterministic Step 4 tests: technical mapping plus six `--dry-run` hosted checks, and data impact through the protected eight-artifact backup checksum plus cumulative disposable-local rehearsal. Every hosted check remained at 68 rows/latest `072`; legacy inventory was unchanged through the first five stages; and retired objects were absent while retained objects remained after `092`. The command reports `hosted_writes: 0`. Step 4 is `PASSED` as review confirmation only. The owner’s retention decision is to preserve the protected backup and defer any hosted deletion authorization for the explicit `090`–`092` retirement set until its separate Step 5 decision. Step 5 remains a new, separate hosted-write approval for each stage; Step 4 cannot authorize a hosted write. No hosted migration, data, Storage object, provider, secret, or deployment state changed during preparation.

## Hosted Step 5 — calendar-token-security (`073`) — 2026-08-15

The dedicated [Step 5 evidence record](launch/step-5-calendar-token-apply-2026-08-15.md) records the one approved hosted write. The fresh protected backup at `/Users/abiezerreyes/Documents/NeedThisDone Backups/2026-08-15-pre-migration-073-000202` passed its mode/checksum/history/Storage preflight: project `oxhjtmozsdstbokwtnwa`, eight artifacts, one private `project-attachments` bucket, 217 object metadata records, no object contents downloaded, and `68/072` history.

The stage-only dry run selected exactly `073_secure_google_calendar_tokens.sql`. With operator Abe Reyes, a 15-minute America/New_York maintenance window, Abe Reyes monitoring, NeedThisDone database-owner forward repair, explicit `073` acknowledgement, and release-control SHA `e022c013d9c98fcb08590ce762d3b7b8c8fadb9b`, the helper applied exactly one linked hosted migration. Its sanitized result reports `hosted_writes: 1`, temporary workdir cleanup, and `69/073` history. Read-only verification confirmed encrypted `bytea` columns, nullable legacy token columns, service-role-only execution for all three token functions, anonymous RPC denial (`401` for both read functions), zero Calendar-token rows, no `074+`, and unchanged Storage inventory. `074`–`092` remain neither approved nor applied. No provider, deployment, secret, Calendar API, publication, spend, or external-message action occurred.

## Paid-proof gate history — 2026-08-08

This historical section records the paid-proof position at that point. The current local backend gate above supersedes its older validation counts. The code change remains preserve-first: it does not activate a model, sender, payment provider, hosted migration, or deployment.

| Product claim | Required proof | Current evidence | Release status |
| --- | --- | --- | --- |
| The public site offers a contained Website Improvement and a Managed AI Operator as equal paths. | Code, route/sitemap/redirect checks, accessibility checks, public desktop/mobile browser checks, and production build. | The 2026-08-08 provider-free assembly passed lint, TypeScript, 199 required unit tests, 50 accessibility tests, the production build, and 23 public browser checks; the only public skip is the intentional mobile exclusion for a desktop-only nav assertion. | Proven locally; hosted deployment remains separate. |
| A Website Improvement is a $500 audit plus one contained fix, paid by manual $250/$250 invoices. | The request records the offer and scope; one real engagement is agreed, invoiced, delivered, and handed off. | The public promise and existing project-request path are implemented and locally verified. No invoice was issued and no client work is represented as delivered. | Local code boundary proven; paid proof not claimable. |
| The Managed AI Operator is privately run for a proposal-based 30-day pilot with weekly client briefs. | Proposal, explicit approval boundary, four human-led weekly briefs, recorded outcomes, and a completed paid pilot. | The public site says clients do not operate the private dashboard; private routes remain protected and locally verified. No pilot proposal, client, or weekly brief is represented as complete. | Local code boundary proven; paid proof not claimable. |
| Audit reports hand off to the Website Improvement intake. | Browser proof from a seeded report confirms the CTA has `offer=website-improvement`. | The 2026-08-08 public browser gate asserts the seeded report CTA and the adaptive offer handoff. | Proven locally. |
| A model routing default is measured and safe. | Sanitized fixed-task records for the private primary and comparison model IDs; quality, tool use, latency, provider-reported cost, failures, and repair rate recorded in Supabase. | The worker is fail-closed at `evaluation-required` until the explicit primary pin command runs. Local migrations `081` and `084` plus their unit/RLS gates pass; comparison evidence is durable and cannot change the primary route. No provider has been called and no candidate has been selected. | Local implementation proven; routing selection not claimable. |
| The model-evaluation migration is safe for hosted use. | Backup rehearsal, local reset/lint/RLS gate, hosted dry run, and separate explicit approval. | `081_bound_model_evaluation_budget.sql` records evaluation observations without a local model-spend ceiling and passed the local lint/RLS/assembly gate. | Hosted review, dry run, and approval required. |

The current paid-proof finish line remains two real outcomes: one paid,
delivered Website Fix and one paid Managed Automation pilot with four weekly
human-led briefs. Do not mark either complete from code or local test evidence.

Latest current-slice verification (2026-08-08): `npm run verify:assembly` passed with local Supabase after applying migration `084`. It ran lint, TypeScript, 199 required unit tests with one existing isolated skip, 50 accessibility checks, a production build, 7 schema-manifest checks, 14 security checks, 10 AI-employee RLS checks, 1 consultation integration check, 23 public browser checks with one intentional desktop-nav/mobile skip, 4 authenticated lifecycle checks, 1 prospecting approval/suppression check, 1 daily-cockpit check, and 2 employee-workspace checks. Optional external-provider credentials were absent; no hosted state, provider, deployment, payment, or client data changed.

| Product claim | Required proof | Current evidence | Release status |
| --- | --- | --- | --- |
| Private AI employee data is operator-only. | Fresh local Supabase reset plus anonymous, historical-member, ordinary-authenticated, and operator database/browser tests. | Migration `105` preserves historical membership rows but makes them non-authorizing. Local RLS and real-session browser proof passes anonymous denial, non-admin `403` with no private payload, and operator access. Historical hosted owner/manager/viewer parity evidence predates `105` and is not evidence that the new boundary is deployed. | Proven locally; hosted promotion remains separate. |
| An operator can turn a project into a supervised pilot without duplicate customer or employee records. | Real admin session, atomic database function, exact retry, project/customer linkage, operator membership, brief, and three schedules. | Database lifecycle test passes, and the authenticated browser contract provisions the pilot through the application API before any employee records are inserted by the test. | Proven locally. |
| Decisions are capped, immutable, idempotent, and safe under concurrency. | Real database tests for five queue slots, exact/conflicting retries, concurrent decisions, history, successors, and cleanup. | Focused local suite passed after a fresh reset. | Proven locally. |
| Only an admin/operator may decide private work. | Real database tests and authenticated browser/API tests using historical owner/manager/viewer memberships plus an explicit admin role. | Historical membership rows remain present, but every non-admin session receives `403`; the operator can decide only through the protected route/RPC path. | Proven locally; hosted promotion remains separate. |
| Approved manual work can be completed and measured exactly once. | Real operator session, idempotent completion and outcome RPCs, immutable direct-write denial, actor/timestamp evidence, historical reload, and timezone-bound daily calculation. | Database tests prove exact retries and write denial. The operator browser lifecycle authors, approves, completes, records an outcome, reloads Activity/Outcomes, and renders the completion evidence. | Proven locally. |
| A consultation request is stored and visible to an operator. | Request parsing plus real database/API integration and browser workflow from contact form to project detail. | Parser, calendar-slot, and real local API/database/operator-route tests pass. | Proven through the local API/database boundary; browser proof remains. |
| Confirmed consultations create one calendar invite and use Google for reminders. | Deterministic adapter contract tests, idempotent retry test, and one controlled pre-release Google Calendar check. | Google sign-in and Calendar OAuth/REST adapter code exist; local encrypted-token storage passes. Signed, expiring, session-bound OAuth state now rejects forged, missing-cookie, and cross-user callbacks before token exchange. Hosted secret provisioning, a consultation caller, event idempotency, live API behavior, reminders, and cleanup are not yet proven. | Not yet claimable. |
| Historical client-linked records remain durable but grant no private access. | Forward migration, schema/RLS tests, route authorization tests, and real authenticated browser denial. | Migration `105` keeps the rows, retires client list/access management, and proves non-admin denial with no private payload. | Proven locally; hosted promotion remains separate. |
| Hosted payment handoff works. | Test-mode Stripe contract and checkout smoke test for every enabled offering. | Stripe is installed as a future boundary, but the catalog has proposal-based prices, no Payment Links, no active payment-reference/webhook path, and the guarded route falls back to `/contact`. | Claim only the project-request fallback. |
| Transactional email succeeds or exposes a retryable failure. | Provider contract tests, durable failure records/replay tests, and one controlled pre-release delivery check. | Immediate provider retry exists, but durable failure replay was removed because its table and faithful message replay did not exist. | Live delivery and durable recovery are not yet claimable. |
| Retained public, workspace, and prospecting routes work on desktop and mobile. | Playwright smoke tests with no console errors, overflow, accessibility violations, or unexplained skips. | Five intentional Playwright specs are retained: 18 public desktop/mobile checks, 4 real-session authorization/lifecycle checks, 1 real prospecting lifecycle check, and 2 employee-workspace UI checks. The lifecycle runs without an authorization bypass. | Prospecting proof passed locally; full assembly and hosted behavior remain separate. |
| Prospecting never sends an unapproved message and suppresses bounced addresses. | Real local Supabase session configures a profile, stores public evidence, creates a draft, blocks pre-approval send, approves one record, sends through the deterministic fake, retries the same send, replays a bounce, and verifies durable suppression. | `npm run test:prospecting-workspace` passed on 2026-08-06: 1/1 authenticated browser check. The provider-neutral sender remains a test boundary; no real sender is configured. | Proven locally with a deterministic sender double; real sender campaign not yet claimable. |
| An approved message can execute through an explicitly selected sender mode. | Dashboard approval must precede the send action; offline assembly uses only the deterministic fake sender, while real Resend delivery requires a separate provider mode and key. | The authenticated browser proof sends from the dashboard after approval, verifies a provider ID, and retries the same message idempotently. The transactional Resend key cannot activate this path. | Proven locally with fake mode; real provider delivery and webhook correlation not yet claimable. |
| Public Insights content does not depend on hosted content tables or APIs. | Versioned content guard, route retirement checks, metadata/rendering tests, redirects, and sitemap verification. | All 27 published hosted rows were exported before removal. The 2026-08-08 content audit retains three relevant repository-owned posts and consolidates the other six current posts to `/blog`. | Verification pending for this slice. |
| The code-only internal pilot is ready without external providers. | Run `npm run verify:assembly:fresh` with local Supabase; the proof process must contain no Stripe, Google, Resend, OpenAI, OpenRouter, or Calendar credential. Require code/build, exact schema, database security/lifecycle, and real-session browser gates. | On 2026-08-06 the fresh gate rebuilt migrations `001`–`082` and restored the sanitized seed. It passed 192 required unit tests with 1 isolated opt-in skip, 48 accessibility checks, the production build, 32 database/security checks, 18 public desktop/mobile checks, 4 authorization/lifecycle browser checks, 1 prospecting lifecycle check, and 2 workspace checks. | Proven locally without external providers. Hosted parity, provider claims, dependency advisories, and deployment approval remain separate. |

## Release gates

1. `npm run verify:code` is the deterministic required code gate for every change. It excludes suites that require live Supabase, Redis, or the public internet; those have explicit commands and cannot count as passing unless actually run.
2. Database changes additionally require `supabase db reset --local` when a fresh rebuild is needed, followed by the single-command `npm run verify:database` local gate.
3. Security claims require authenticated tests against Supabase. Layout tests run anonymously or with real saved auth state; no development bypass may authorize an application request.
4. External services require deterministic contract tests and a controlled pre-release check. Tests must not print production credentials or create unapproved customer data.
5. A warning or skipped required check is a failed release unless its owner, reason, scope, and removal date are recorded in `docs/PROJECT_STATUS.md`.
6. No generated local/hosted schema diff may be applied without classifying every statement against the retained product boundary.
7. `npm run verify:assembly:fresh` is the final local delivery gate. It may reset only the local Supabase database and must run with optional external-provider credentials absent.

The local gate is checklist item 1 evidence, not technical production launch. Items 4–22 remain to be completed in the [canonical launch checklist](launch/LAUNCH_CHECKLIST.md) before the hosted application is called live. Items 23 and 24 are separate paid-business proof gates.

The retained-schema manifest is mandatory within `npm run verify:database`. After local migration `092`, it asserts the current retained
RLS tables, including the growth profile, prospect, outreach, suppression, worker-task, sender-event,
outcome, model-evaluation, agent-run, approval, artifact, schedule, reservation, and heartbeat tables, plus critical pilot/audit columns, isolation policies, lifecycle and cascade constraints, exact RPC grants,
and the private project-attachment and agent-media buckets against a real local PostgreSQL catalog. `health_check`
replaces the retired `blog_posts` table in that final manifest.
