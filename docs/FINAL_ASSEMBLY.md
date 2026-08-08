# Provider-free final assembly

The retained NeedThisDone internal pilot must be provable with repository code and local infrastructure only. Stripe, Google, Resend, OpenAI, OpenRouter, Hermes, and OpenClaw credentials are not prerequisites.

## One-command proof

From `app/`, with Docker and local Supabase running:

```bash
npm run verify:assembly
```

For release evidence, rebuild the disposable local database first:

```bash
npm run verify:assembly:fresh
```

The `:fresh` command erases only local Supabase development rows, rebuilds migrations `001`–`083`, and restores the sanitized seed. It never selects the cloud profile.

## What the gate proves

The command removes optional provider credentials from its process, disables provider email delivery, and then requires all of these to pass:

1. Local Supabase health and schema lint.
2. Lint, TypeScript, required unit tests, accessibility tests, and production build.
3. Exact 29-table retained manifest, database security, RLS/lifecycle, and consultation persistence checks.
4. Real Supabase sessions for anonymous, owner, manager, viewer, and cross-customer behavior.
5. Project → pilot provisioning → queue authoring → approval → manual completion evidence → outcome → historical reload.
6. Prospecting profile, public-evidence discovery, per-message approval, dashboard send through deterministic fake mode, no-pre-approval-send, and idempotent sender-event behavior.
7. Unified daily cockpit behavior: three weekly priorities, generated next actions, complete/defer state, durable reload, and an evening reflection.
8. Employee workspace UI behavior without horizontal overflow or provider delivery.

The gate deliberately retains six Playwright specs: 18 public desktop/mobile checks, 4 real-session authorization/lifecycle checks, 1 prospecting lifecycle check, 1 daily-cockpit lifecycle check, and 2 employee-workspace UI checks. Obsolete screenshot/debug/CMS/LMS/commerce tests and about 80 MB of generated image artifacts are not part of this assembly.

The authenticated lifecycle test also fails if any external provider credential reaches the proof process. Authentication is still real local Supabase authentication; the offline flag does not grant a role or bypass RLS.

## Latest recorded proof

On 2026-08-06, the fresh assembly rebuilt migrations `001`–`083` and restored the sanitized seed. It passed without unexplained warnings: 192 required unit tests with 1 isolated opt-in skip, 48 accessibility checks, the production build, 32 database/security checks, 18 public desktop/mobile browser checks, 4 real-session authorization/lifecycle checks, 1 prospecting lifecycle check, 1 daily-cockpit lifecycle check, and 2 employee-workspace checks. The cockpit check created three weekly priorities, completed and deferred generated actions, reloaded durable state, and recorded an evening reflection. The prospecting check configured a profile, discovered public evidence, rejected pre-approval send, approved the message, sent it through the deterministic fake sender, replayed the send idempotently, and replayed a bounce event while verifying suppression. The process contained no Stripe, Google, Resend, OpenAI, OpenRouter, or Calendar credential and made no Redis connection.

## Provider-free behavior

- Site analysis always produces measured scores, an executive summary, and a deterministic evidence-based priority list. A configured model may improve the prose, but its absence or failure does not fail the report.
- Project, report, and login records continue without Resend. Email delivery is an optional side effect.
- Email/password login remains available through Supabase. Google is shown only when its OAuth client is configured.
- Offer checkout remains a truthful project-request fallback until a Stripe path is configured and proven.
- Calendar actions, agent runtimes, and model routing remain optional boundaries and are not invoked by the internal-pilot lifecycle.

## Delivery boundary

A passing provider-free assembly means the repository is ready for Abe and Andrea to run the manual internal pilot. It does not prove hosted migration parity, deployment, live email, Google Calendar, Stripe payment, or autonomous agent execution. Those claims keep their own release gates in [RELEASE_EVIDENCE.md](RELEASE_EVIDENCE.md).
