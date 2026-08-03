# Full-stack setup outside the terminal

This checklist separates software installed on the Mac from accounts, billing, OAuth consent, secrets, production permissions, and business choices that require Abe in a browser or provider dashboard.

## Current local foundation

| Component | Installed state | Not yet authorized |
| --- | --- | --- |
| Node.js | Homebrew Node `24.18.1` is the active runtime. | Nothing. Node 25 remains installed but unlinked. |
| Codex | `codex-cli 0.145.0`; existing ChatGPT OAuth file is present. | Direct Codex CLI remains available; Hermes has separately authenticated and passed a read-only runtime proof. |
| Hermes | Hermes Agent `0.19.1`; config schema 33; Chromium/browser tools; 71 bundled skills; two NeedThisDone/Codex workflow skills imported; `model.openai_runtime=codex_app_server`; separate ChatGPT/Codex OAuth session. | Read-only Hermes-to-Codex execution passed. No coding-edit proof, gateway, messaging platform, or scheduled job is running. |
| OpenClaw | OpenClaw `2026.7.1-2` CLI. | No onboarding, provider, workspace, channel, gateway daemon, host execution, or production access. |
| Stripe | Stripe CLI `1.45.0`; application SDK and guarded `/contact` fallback already exist. | No CLI account login, selected offer, sandbox checkout, Payment Link/invoice, webhook, or production key. |
| OpenRouter | No key or OAuth profile. | Account, billing choice, limits, model allowlist, and both agent connections remain unconfigured. |

Installed does not mean trusted, connected, running, or production-ready.

## Abe's browser/dashboard actions

### 1. Retire the unused Context7 credential — complete

- Owner attestation on 2026-08-02 confirms the Context7 API keys were revoked.
- The plaintext export has already been removed from `~/.zshrc` without retaining a backup.
- Do not create a replacement because Context7 is not part of the retained stack.

### 2. Set up OpenRouter with a hard cost boundary

Use [OpenRouter settings](https://openrouter.ai/settings/keys) to:

1. Sign in to the owner account and enable MFA if offered.
2. Decide whether to start with free models only or add a small prepaid balance. Do not enable open-ended automatic spending for the pilot.
3. Create one NeedThisDone-specific API key or OAuth profile—not a shared personal key.
4. Set the smallest available credit/spend limit and alerts.
5. Record an initial model allowlist. Start with one inexpensive general model and one fallback; do not enable every model.
6. Confirm the provider's data-retention/training controls before sending client content.

Then complete two separate local connections:

- Hermes: add the OpenRouter credential through `hermes model` or `hermes setup`; never paste it into the repository.
- OpenClaw: use its documented OpenRouter PKCE flow during `openclaw onboard`, which stores an OpenRouter auth profile.

Exit proof: each agent completes one harmless prompt, reports the intended model, stays within the limit, and receives no customer data or production credentials.

### 3. Finish Hermes and Codex deliberately

1. Keep Hermes' separate OpenAI Codex provider authentication scoped to local testing; do not import or share credential files with Codex CLI.
2. Follow the read-only proof with one explicitly approved, reversible workspace edit and test run before treating Hermes as a coding operator.
3. Keep command approvals enabled; never use `--yolo` for NeedThisDone work.
4. Do not install the Hermes gateway service until an allowed user/channel and emergency-stop owner are documented.

Official references: [Hermes Codex runtime](https://hermes-agent.nousresearch.com/docs/user-guide/features/codex-app-server-runtime) and [Hermes documentation](https://hermes-agent.nousresearch.com/docs/).

### 4. Onboard OpenClaw in cautious mode

1. Choose the Mac mini as the initial local host; bind the gateway to loopback only.
2. Select OpenRouter as the model provider after its limits are configured.
3. Begin with no email, messaging, browser profile, or production application credentials.
4. Set execution to a cautious/approval-required policy with deny as the fallback. Never select YOLO/full unattended host execution.
5. Do not install/start the background daemon until the policy is reviewed.
6. Add one non-destructive research workflow only after a local foreground test.

Exit proof: `openclaw doctor`, loopback binding, approval denial, emergency stop, and one harmless research task all pass before daemon installation.

Official references: [OpenClaw installation](https://docs.openclaw.ai/install/), [OpenRouter integration](https://docs.openclaw.ai/openrouter), and [execution approvals](https://docs.openclaw.ai/tools/exec-approvals).

### 5. Choose and test the first Stripe path

In the Stripe Dashboard:

1. Decide the first pilot offer and price. Choose either one fixed-price test Payment Link or a test invoice for custom work.
2. Keep the account in test/sandbox mode. Do not create subscriptions, Customer Portal, or a broad catalog yet.
3. Authenticate the Stripe CLI to the intended test account.
4. Create only the selected test resource and store its public identifier/URL in the approved server-side deployment configuration.
5. Complete success, cancellation/failure, duplicate callback, refund, and cleanup checks.
6. Store only minimal Stripe customer/payment references in Supabase after a reviewed schema change; never store card data.

Exit proof: one controlled test payment path works idempotently and the public application still falls back to `/contact` when configuration is absent.

Official reference: [Stripe CLI installation and login](https://docs.stripe.com/stripe-cli/install).

## Secrets and access rules

```text
Browser/provider dashboard
        |
        v
provider-specific restricted credential
        |
        +--> local user auth store or deployment secret manager
        |
        X--> never Git, docs, screenshots, logs, chat, or client JavaScript
```

- Do not give Hermes or OpenClaw a Supabase service-role key, Stripe secret key, unrestricted email account, or production shell.
- NeedThisDone must call agents through narrow authenticated adapters with idempotency keys and verified callbacks.
- OpenRouter keys route models only; they do not authorize Supabase, Stripe, email, or deployment access.
- Stripe live mode, hosted Supabase writes, Vercel deployment, messaging channels, and background daemons each remain separate approvals.

## Recommended activation order

```text
Context7 key revoked
        |
        v
OpenRouter account + hard limit
        |
        v
Hermes -> Codex harmless proof
        |
        v
OpenClaw foreground + deny/approval proof
        |
        v
Stripe test offer and checkout proof
        |
        v
NeedThisDone authenticated adapters
        |
        v
Only then: reviewed daemons and production permissions
```

This provider setup runs alongside—but does not replace—the Supabase migration and production-cutover gate.
