# NeedThisDone

NeedThisDone has two equal, human-led service paths:

- **Website Improvement** — a $500 evidence-based audit and one agreed contained fix, invoiced manually as $250 to begin and $250 on delivery.
- **Managed AI Operator** — a proposal-based 30-day pilot operated privately by Abe and Andrea, with four weekly client briefs.

The finish line is business proof, not a redesign: one paid, delivered engagement from each offer. The software supports the work but does not replace human scope, judgment, approval, or client communication.

## The three living documents

These are the current decision sources:

- [README](README.md): product boundary, architecture, and local workflow.
- [Roadmap](ROADMAP.md): the next work and the paid-proof finish line.
- [Release evidence](docs/RELEASE_EVIDENCE.md): what is verified, pending, or not claimable.

Historical audits, launch notes, `docs/TECH_STACK.md`, and `docs/PROJECT_STATUS.md` remain supporting evidence or an execution ledger. They are not competing product plans.

## Public experience

The public navigation is **Website Improvement · AI Operator · How It Works · Work · Insights**, followed by **Start a Project**.

`/site-analyzer → /report/[id] → /contact?offer=website-improvement` is the website-improvement path. The report is a free evidence-based starting point, not a promised score increase or accessibility certification. `/contact` is one adaptive intake that stores the selected offer and its tailored context through the existing project-request flow.

`/work` is the compact proof destination. `/about` and `/resume` permanently redirect there; `/guide` redirects to `/faq`; and `/build` redirects to the website-improvement intake. The sitemap contains only maintained public pages and the curated Insights posts.

## Private operator boundary

`/dashboard`, `/employee`, `/prospecting`, and `/admin/*` are private operational surfaces. Clients do not operate the dashboard. The operator may prepare research, drafts, and internal queues, but a human must approve every external message, publication, system change, or spend.

Production outreach additionally requires the scoped worker boundary, public-evidence sourcing, suppression/unsubscribe handling, verified sender events, and a human-approved send. No public route reaches the Mac mini worker.

## Architecture

```text
Public site and private operator UI
                |
             Next.js
                |
     +----------+----------+
     |                     |
Supabase              Redis (optional)
durable truth         transient cache, rate-limit,
auth, RLS, records    deduplication, coordination
```

Supabase is the durable source of truth for projects, reports, private work, approvals, outcomes, suppression, and model-evaluation records. Redis is transient only. Qdrant and any replacement database are not part of this product.

Provider boundaries are deliberately inactive unless separately approved. There is no implied deployment, hosted migration, Stripe checkout, model-provider activation, real sender, or client portal in this repository change.

## Model-evaluation boundary

No live worker model is selected by default. The pending evaluation protocol uses sanitized fixed tasks to record quality, tool use, latency, cost, failures, and repair rate for:

- Poolside Laguna S 2.1 Free;
- two current eligible free candidates, resolved and pinned from the catalog at evaluation time; and
- pinned `deepseek/deepseek-v4-flash` only as a fallback.

The code enforces a $0.25 daily evaluation ceiling and a $0.10 per-run ceiling. All three free candidates must complete the fixed task set before any default is selected. DeepSeek can be selected only if every free candidate completed the set and none cleared the shared threshold. Recording a result does not activate a provider or permit external action.

## Local development and verification

```bash
cd app
npm install
npm run dev
```

Useful checks:

```bash
cd app
npm run type-check
npm run test:unit
npm run test:a11y
npm run build
npm run test:retained-smoke
npm run verify:code
npm run verify:assembly
```

`verify:assembly:fresh` resets only the disposable local Supabase database. It is not a hosted-migration command. Keep the environment on `local` before database checks; authenticated/RLS tests require a running local Supabase stack.

## Hosted and provider release boundary

Hosted changes are separately approved work. Before any hosted migration or deployment: rehearse the backup and pending migrations, inspect the dry run, verify parity, and record the result in [release evidence](docs/RELEASE_EVIDENCE.md). Before any provider is activated: approve the exact sender/model/payment configuration and prove its bounded behavior.

The paid website engagement and paid AI-operator pilot are still operational milestones. Record their actual delivery, weekly briefs, and outcomes in release evidence only after they occur.
