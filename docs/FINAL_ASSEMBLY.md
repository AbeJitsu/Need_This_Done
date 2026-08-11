# Provider-free final assembly

The retained NeedThisDone internal pilot must be provable with repository code and local infrastructure only. Stripe, Google, Resend, OpenAI, OpenRouter, Hermes, and OpenClaw credentials are not prerequisites.

Cloud promotion is now the active critical path after this provider-free local gate. The reviewed `dev` branch is the replacement for old production, hosted migrations `073`–`092` are required before the new application is live, and `8b8d429` remains the application rollback reference. Track the hosted cutover and provider canaries in the [canonical launch checklist](launch/LAUNCH_CHECKLIST.md), not in a separate activation order.

## One-command proof

From `app/`, with Docker and local Supabase running:

```bash
npm run verify:assembly
```

For release evidence, rebuild the disposable local database first:

```bash
npm run verify:assembly:fresh
```

The `:fresh` command erases only local Supabase development rows, rebuilds migrations `001`–`092`, and restores the sanitized seed. It never selects the cloud profile.

## What the gate proves

The command removes optional provider credentials from its process, disables provider email delivery, and then requires all of these to pass:

1. Local Supabase health and schema lint.
2. Lint, TypeScript, required unit tests, accessibility tests, and production build.
3. The one-command `verify:database` gate: local schema lint, exact retained manifest, database security, RLS/lifecycle, planner/OpenClaw approval/provenance, and consultation persistence checks.
4. Real Supabase sessions for anonymous, owner, manager, viewer, and cross-customer behavior.
5. Project → pilot provisioning → queue authoring → approval → manual completion evidence → outcome → historical reload.
6. Prospecting profile, public-evidence discovery, per-message approval, dashboard send through deterministic fake mode, no-pre-approval-send, and idempotent sender-event behavior.
7. Unified daily cockpit behavior: three weekly priorities, generated next actions, complete/defer state, durable reload, and an evening reflection.
8. Employee workspace UI behavior without horizontal overflow or provider delivery.

The gate deliberately retains six Playwright specs: 18 public desktop/mobile checks, 4 real-session authorization/lifecycle checks, 1 prospecting lifecycle check, 1 daily-cockpit lifecycle check, and 2 employee-workspace UI checks. Obsolete screenshot/debug/CMS/LMS/commerce tests and about 80 MB of generated image artifacts are not part of this assembly.

The authenticated lifecycle test also fails if any external provider credential reaches the proof process. Authentication is still real local Supabase authentication; the offline flag does not grant a role or bypass RLS.

## Latest recorded proof

On 2026-08-10, the fresh assembly rebuilt migrations `001`–`092` and restored the sanitized seed. It passed without unexplained warnings: 214/214 required unit tests, 50 accessibility checks, the production build, the one-command local database gate (schema lint, 7 schema-manifest checks, 14 security checks, 10 AI-employee RLS checks, 3 agent-operations RLS checks, 2 planner/OpenClaw RLS checks, 2 prospecting RLS checks, and 1 consultation integration check), 45 retained browser checks with one intentional mobile exclusion, 4 real-session authorization/lifecycle checks, 1 prospecting lifecycle check, 1 daily-cockpit lifecycle check, and 2 employee-workspace checks. The bridge separately passed its build and 6/6 offline tests. The process contained no Stripe, Google, Resend, OpenAI, OpenRouter, or Calendar credential and made no Redis connection.

## Provider-free behavior

- Site analysis always produces measured scores, an executive summary, and a deterministic evidence-based priority list. A configured model may improve the prose, but its absence or failure does not fail the report.
- Project, report, and login records continue without Resend. Email delivery is an optional side effect.
- Email/password login remains available through Supabase. Google is shown only when its OAuth client is configured.
- Offer checkout remains a truthful project-request fallback until a Stripe path is configured and proven.
- Calendar actions, agent runtimes, and model routing remain optional boundaries and are not invoked by the internal-pilot lifecycle.

## Delivery boundary

A passing provider-free assembly is checklist item 1 evidence and means the repository is ready for Abe and Andrea to run the manual internal pilot. It does not prove hosted migration parity, deployment, live email, Google Calendar, Stripe payment, or autonomous agent execution. Those claims keep their own release gates in [RELEASE_EVIDENCE.md](RELEASE_EVIDENCE.md) and items 2–22 of the [launch checklist](launch/LAUNCH_CHECKLIST.md). Technical launch is separate from paid business proof in items 23 and 24.
