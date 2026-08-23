# Provider-free final assembly

NeedThisDone’s two human-led offers are provable with repository code and
disposable local infrastructure before any credential or hosted action.
Stripe, Google, Resend, OpenAI, OpenRouter, and OpenClaw credentials are not
prerequisites for this gate.

The tested pre-key implementation is
`29c87a5850bffe51e6f90b4dff04e40d3c6fdb84`. Local migrations reach `106`;
reviewed hosted evidence ends at `095`. Track later backup, migration,
deployment, secret, canary, and paid-proof work in the
[canonical launch checklist](launch/LAUNCH_CHECKLIST.md).

## One-command proof

From `app/`, with Docker and local Supabase running:

```bash
npm run verify:assembly
```

For release evidence, rebuild the disposable local database and exercise the
built application:

```bash
ASSEMBLY_PRODUCTION_SERVER=true NEXT_PUBLIC_DASHBOARD_PREVIEW=false npm run verify:assembly:fresh
```

The `:fresh` command erases only local Supabase development rows, rebuilds
migrations `001–106`, restores the sanitized seed, and never selects the cloud
profile. It explicitly forces these adapters to `disabled`:

- `TRANSACTIONAL_RESEND_PROVIDER`
- `PROSPECTING_RESEND_PROVIDER`
- `CALENDAR_PROVIDER`
- `STRIPE_INVOICE_PROVIDER`

It also clears provider credentials and webhook secrets from the proof
process. Credentials alone never activate an adapter.

## What the gate proves

1. Local Supabase health, migrations through `106`, and schema lint.
2. Lint, TypeScript, required unit tests, accessibility tests, and production
   build.
3. The complete local schema, RLS, grant, lifecycle, provider-recovery, and
   consultation database gate.
4. Anonymous and ordinary-authenticated denial plus operator access through
   real local Supabase sessions.
5. Operator-only project, pilot, queue, decision, completion, outcome,
   prospecting, daily-cockpit, and employee-workspace behavior.
6. Provider-disabled outreach fails closed after recording a retryable durable
   operation under the original key. Deterministic fake-mode success and
   failure paths remain covered by the required unit suite.
7. The browser cannot inject provider delivery events, and no external action
   occurs.

## Latest recorded proof

On 2026-08-23, exact implementation
`29c87a5850bffe51e6f90b4dff04e40d3c6fdb84` passed the fresh assembly in
production-server mode:

- migrations `001–106`, sanitized seed restore, and schema lint;
- 318/318 unit tests and 50/50 accessibility checks;
- lint, TypeScript, and the 85-route production build;
- all 48 database checks;
- 48 public browser checks with 2 intentional report-fixture skips;
- 4 real-session authorization checks, 1 provider-disabled prospecting check,
  1 daily-cockpit check, and 2 operator employee-workspace checks.

The separate production dependency audit found 0 vulnerabilities, the bridge
passed 8/8 offline tests, and the migration/environment contract verified 34
mappings and 18 gates. Release metadata records the exact implementation SHA,
local head `106`, all four CI categories `passed`, and
`deploymentIdentity: null`.

The only warning is the Supabase CLI update notice. Proven version `2.65.5`
reports `2.115.0` available. Scope: local/CI tooling. Owner: local tooling
owner. Reason: upgrade only through an isolated migration rehearsal.
Review/removal date: 2026-09-15. Chromium required an approved run outside the
macOS filesystem sandbox to register its Mach port; every browser check passed
there.

## Decision boundary

**PRE-KEY LOCAL GATE: GO.**

**TECHNICAL LAUNCH: NOT GO.** The local result does not prove hosted migration,
deployment, live Resend, Calendar, Stripe, worker activation, customer
delivery, or paid outcomes. Independent review comes next. Hosted backup and
dry run, forward-only migrations `096–106`, deployment, secrets, each provider
canary, and paid delivery remain separate approvals. Mac worker installation
and launchd activation remain deferred with no scheduled date.

Rollback is an application/tooling revert plus a disposable local reset.
Preserve hosted history and protected backups; repair any hosted issue only
with a separately reviewed forward migration.
