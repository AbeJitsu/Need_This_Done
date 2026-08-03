# NeedThisDone Technology Stack

This is the canonical technology-responsibility map. `ROADMAP.md` defines product sequence, and `docs/PROJECT_STATUS.md` records what is actually implemented and proven.

## Simple final model

```text
Humans decide
     |
     v
NeedThisDone app ---------> Supabase remembers
     |
     v
Hermes thinks and coordinates
     |
     +----------> Codex builds reviewed software
     |
     v
OpenClaw performs approved long-running work
     |
     +----------> web / email / schedules / external tools

OpenRouter routes non-coding model calls at controlled cost.
```

The components do not compete:

- **Hermes orchestrates:** turns an approved objective into bounded work, chooses capabilities, and maintains workflow context.
- **Codex engineers:** changes and tests the application through reviewed Git commits.
- **OpenClaw executes:** runs approved, long-lived browsing, email, scheduled, and external-tool workflows.
- **OpenRouter routes models:** supplies inexpensive or specialized models for non-critical agent work.
- **Supabase remembers:** stores application data, memberships, decisions, outcomes, workflow state, idempotency keys, and later retrieval vectors.

## End-state architecture

```text
 Public visitor       Approved client        Abe / Andrea
       |                     |                     |
       +---------------------+---------------------+
                             |
                             v
                 Next.js application on Vercel
                    public site + workspaces
                             |
          +------------------+------------------+
          |                  |                  |
          v                  v                  v
   Authentication       Supabase truth      Human decisions
   Google + password    RLS + Storage       three daily queues
          |                  |                  |
          +------------------+------------------+
                             |
                             v
                 durable workflow_runs record
                             |
                             v
                    authenticated adapter
                             |
                             v
                          Hermes
                    plan + orchestration
                      /      |       \
                     v       v        v
                 OpenRouter Codex   OpenClaw
                   models   code    long-running work
                              |        |
                              v        v
                           GitHub   web/email/schedules
                              |        |
                              +---+----+
                                  v
                         verified callback/result
                                  |
                                  v
                       Supabase outcome + audit trail
                                  |
                                  v
                         Abe / Andrea review again
```

No agent is the source of truth. Agent context may be lost; the durable workflow must still be recoverable from Supabase.

## Responsibilities and status

| Layer | Technology | Responsibility | Status |
| --- | --- | --- | --- |
| Product UI/API | Next.js, React, TypeScript, Vercel | Public site, operator workspace, client collaboration, protected server routes | Implemented locally; production cutover pending |
| Authentication | Patched NextAuth Google transport plus Supabase Auth | Branded Google redirect; Google-token verification into a Supabase/RLS session; email/password and recovery | Bridge implemented and locally tested; controlled hosted Google proof pending |
| Authorization/data | Supabase Postgres, Auth, RLS, Storage | Durable users, roles, customer isolation, projects, decisions, outcomes, files, financial measurements | Core local contract proven; hosted migrations `073`-`078` pending |
| Orchestration | Hermes Agent `0.19.1` | Convert approved goals and decision cards into bounded workflows; coordinate model, coding, and execution capabilities | CLI/browser runtime installed locally; Codex app-server mode selected and skills imported; provider proof, adapter, and gateway remain unproven |
| Automation | OpenClaw `2026.7.1-2` | Approved long-running browsing, email preparation, scheduled work, file/tool operations, and callbacks | CLI installed only; no onboarding, provider, config, daemon, channel, host execution, or production access |
| Software engineering | Codex + GitHub | Implement, test, review, and preserve application changes | In active use |
| Model routing | OpenRouter | Route low-risk/non-coding work to suitable free or paid models with budgets | Selected provider boundary; account/key, hard spending limit, model allowlist, and agent connections remain external setup |
| Retrieval memory | Supabase pgvector initially | Store approved reusable knowledge and references without creating another source of truth | Later; schema and retention policy not designed |
| Browser evidence | Playwright and Lighthouse | Authenticated workflows, accessibility, layout, audit evidence | Playwright active; Lighthouse workflow planned |
| Payments | Stripe SDK + Stripe CLI `1.45.0` + hosted paths | Invoices or fixed Payment Links first; subscriptions later | CLI installed but not logged in; boundary exists; offer decision and first test-mode path remain unproven |
| Communication | Resend | Transactional application email | Retained; controlled delivery/recovery proof incomplete |
| Scheduling | Google Calendar | Human-confirmed consultation events and reminders | OAuth state hardened locally; optional live integration still blocked on hosted secret/provider proof |
| Rate limits/cache | Redis/Upstash | Rate limiting, deduplication, and short-lived cache only | Retained supporting service |

## Agent safety contract

```text
Human approval
      |
      v
workflow_runs: pending
      |
      v
signed/authenticated adapter request + idempotency key
      |
      v
Hermes plan or OpenClaw action
      |
      v
verified callback
      |
      v
workflow_runs: succeeded / failed / needs review
      |
      v
Human sees result before the next consequential action
```

Hermes and OpenClaw must not receive unrestricted production database credentials. They operate through narrow adapters. External email, publishing, spending, customer-system changes, and destructive actions remain human-approved. Retries reuse one idempotency key and cannot silently duplicate an external action.

## Delivery order

1. Promote the secure retained application and Supabase contract.
2. Run the NeedThisDone internal pilot manually through the three daily check-ins.
3. Configure OpenRouter with a hard limit and narrow model allowlist; prove one harmless Hermes/Codex prompt and one foreground OpenClaw prompt.
4. Add one authenticated Hermes adapter for planning a non-destructive workflow.
5. Add one authenticated OpenClaw adapter for an approved long-running research task.
6. Prove callbacks, retries, timeouts, audit history, and emergency disable controls.
7. Add Supabase vector retrieval only when real pilot work requires it.

This order makes Hermes and OpenClaw part of the committed architecture without making an unproven automation stack a prerequisite for the first production cutover.

## Explicitly unresolved

- Hermes' official Codex app-server mechanism is selected and locally configured, but a controlled end-to-end prompt is not yet proven.
- The OpenClaw host, authentication method, and emergency-stop owner have not been selected.
- Model allowlists, per-workflow budgets, and data-sharing rules for OpenRouter are not defined.
- Vector retention, deletion, customer isolation, and embedding-provider policy are not defined.

These are implementation decisions, not permission to add overlapping agents or expose production credentials.

The canonical owner-action checklist is [full-stack setup outside the terminal](launch/full-stack-external-setup.md).
