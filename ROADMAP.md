# NeedThisDone Roadmap

## Current objective

Prove the two managed offers with real paid delivery while preserving the existing design system, audit path, private operator workflow, Supabase/RLS boundary, and human approval model.

| Offer | Public promise | Paid-proof exit condition |
| --- | --- | --- |
| Website Improvement | $500 audit plus one agreed contained fix; $250 manual invoice to begin and $250 on delivery. | One paid engagement is scoped, invoiced, delivered, and handed off with what changed. |
| Managed AI Operator | Proposal-based 30-day pilot, privately operated by Abe and Andrea, with weekly client briefs. | One paid pilot completes four weekly human-led briefs and records its outcomes. |

Neither offer is a redesign, integration, multi-page build, client dashboard, autonomous agent, or automatic recurring purchase.

## Active cloud launch critical path

Cloud promotion is the active critical path after the local release candidate. The reviewed `dev` branch is the replacement for the old production application. Hosted Supabase must receive and pass migrations `073`–`092` before the new application is live; old production commit `8b8d429` is the application rollback reference only. Execute the numbered [production launch checklist](docs/launch/LAUNCH_CHECKLIST.md) in order, with backup, migration, deployment, secret provisioning, and live provider actions as separate approvals.

Technical launch is a separate gate from business proof: checklist items 1–22 cover the hosted product, providers, Mac runtime, reliability, and rollback; item 23 requires one paid $500 Website Improvement engagement; item 24 requires one paid 30-day Managed AI Operator pilot with four human-led weekly briefs.

## Work sequence

| Priority | Status | Work | Exit condition |
| --- | --- | --- | --- |
| 1 | Local verification passed | Public dual-offer experience | Navigation, homepage, services, pricing, intake, audit handoff, work proof, legal/support pages, redirects, metadata, sitemap, and curated Insights accurately describe the two offers. |
| 2 | Local verification passed | Route, accessibility, and browser coverage | Unit, accessibility, build, public-browser, private-access, and retained security/assembly gates pass without hiding stale routes. |
| 3 | Partial; replacement candidate identified | Model-routing policy | Step 10A recorded six fixed sanitized-task results for the exact configured pair. DeepSeek completed its three tasks; Nemotron was rejected by the provider privacy/data-policy guardrail. The 2026-08-18 account-filtered catalog check identified `google/gemma-4-31b-it:free` for the next comparison, but a repeat comparison, environment change, or model pin requires separate approval; select no live default until the policy threshold is met. |
| 4 | Pending external sale | Paid Website Improvement | Confirm one contained scope, issue the two manual invoices, deliver the fix, and record the handoff/outcome. |
| 5 | Pending external sale | Paid Managed AI Operator pilot | Agree proposal and approval boundary, operate for 30 days, provide four weekly briefs, and record outcomes. |

## Model-routing gate

The live worker defaults to `evaluation-required`. The test set is deliberately sanitized and fixed:

1. Classify supplied public-business evidence using only supplied evidence.
2. Draft an approved-boundary outreach message.
3. Summarize sanitized activity notes into a client-ready weekly brief without inventing outcomes.

The record for every task includes quality score, tool-use score, latency, provider-reported cost, failure, and repair-needed flag. The shared threshold is quality ≥ 0.80, tool use ≥ 0.90, failure rate ≤ 0.10, and repair rate ≤ 0.20. OpenRouter account and key limits govern model spend. All three catalog-resolved free candidates must complete the set before selection; if none clears the threshold, the route stays `evaluation-required`. There is no hardcoded model fallback.

Catalog availability changes, so the two non-Poolside free candidates must be resolved and pinned from the then-current catalog before results are recorded. The evaluation-record API and applied migrations store observations in Supabase; the API records evidence but does not itself make provider calls.

Step 10A evidence is partial rather than a model-selection result: the hosted
profile remains `evaluation-required`, and provider-policy changes or repeat
requests require separate approval.

The new `OPENROUTER_BACKUP_MODEL` remains private and probe-only. The moving
`openrouter/free` route is allowed only for exactly two sanitized requests;
the response's actual endpoint model is persisted, and the profile remains
`evaluation-required`. A pinned `google/gemma-4-26b-a4b-it:free` value is the
manual backup if the dynamic route is unsuitable. Neither path authorizes a
worker, sender, publication, spend, or external-recipient action.

On 2026-08-18, the account-filtered OpenRouter catalog exposed
`google/gemma-4-31b-it:free` as a current free text candidate with
`response_format` and tool support, 262,144-token context, and zero prompt /
completion pricing. It is the recommended next comparison candidate; the
catalog check made no completion request, environment change, hosted write, or
model-selection decision. `google/gemma-4-26b-a4b-it:free` is the secondary
candidate because it currently lists two free endpoints.

## Service and safety boundaries

- Supabase is durable truth; Redis is transient only. Do not add Qdrant or another database.
- Every external action remains human-approved. The public site never opens the worker boundary.
- Real outreach requires the scoped worker boundary, public evidence, suppression/unsubscribe handling, verified sender events, and an approved send.
- Client-facing delivery is the website handoff or weekly brief; it is not a client dashboard.
- Do not activate a provider, deploy, or apply a hosted migration as part of this roadmap without separate approval.

## Content and route decisions

| Public surface | Decision |
| --- | --- |
| `/`, `/services`, `/pricing` | Present the two offers as equal paths. |
| `/contact` | Adaptive intake for `website-improvement` or `ai-operator`, persisted through the existing project request. |
| `/site-analyzer → /report/[id]` | Preserved as the Website Improvement conversion path; CTA preselects the website offer. |
| `/how-it-works` | Shared delivery process for both offers. |
| `/work` | Compact proof including accurate founder/background material formerly split across About and Resume. |
| `/about`, `/resume` | Permanent redirect to `/work`. |
| `/guide` | Permanent redirect to `/faq`; support material remains in maintained FAQ/process pages. |
| `/build` | Redirect to `/contact?offer=website-improvement`; no sitemap entry. |
| `/dashboard`, `/employee`, `/prospecting`, `/admin/*` | Private only; no client-facing operator access. |

## Insights audit — 2026-08-08

| Post | Decision | Public destination |
| --- | --- | --- |
| `ai-context-budget-tips` | Retain: directly useful to safely managed AI work. | `/blog/ai-context-budget-tips` |
| `loading-tricks-feel-instant` | Retain: useful website-performance guidance. | `/blog/loading-tricks-feel-instant` |
| `rewriting-copy-plain-language` | Retain: useful conversion/copy guidance. | `/blog/rewriting-copy-plain-language` |
| `polish-day` | Consolidate: dated internal process material. | `/blog` |
| `auto-cycling-showcases-phase-rotation-react` | Consolidate: implementation detail outside the offers. | `/blog` |
| `building-device-mockup-preview-tool` | Consolidate: retired tool detail. | `/blog` |
| `easter-egg-nobody-will-find` | Consolidate: no current service value. | `/blog` |
| `glassmorphism-that-actually-works` | Consolidate: design trend, not current proof. | `/blog` |
| `why-polish-days-are-productive` | Consolidate: duplicate/dated process material. | `/blog` |

Historical architecture reviews and delivery notes remain as evidence under `docs/`; this roadmap, the README, and release evidence are the living operational documents.
