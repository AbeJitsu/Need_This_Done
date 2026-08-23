# NeedThisDone Roadmap

## Current objective

Prove the two managed offers with real paid delivery while preserving the existing design system, audit path, private operator workflow, Supabase/RLS boundary, and human approval model.

| Offer | Public promise | Paid-proof exit condition |
| --- | --- | --- |
| Website Fix | $500 audit plus one agreed contained fix; $250 manual invoice to begin and $250 on delivery. | One paid engagement is scoped, invoiced, delivered, and handed off with what changed. |
| Managed Automation | Proposal-based 30-day pilot, privately operated by Abe and Andrea, with weekly client briefs. | One paid pilot completes four weekly human-led briefs and records its outcomes. |

Neither offer is a redesign, integration, multi-page build, client dashboard, autonomous agent, or automatic recurring purchase.

## Current promotion critical path

The provider-free local gate is **GO** for tested implementation
`61eaa205058cc3ab93514a8df183b80eb3f1638b`. Local migrations reach `106`;
reviewed hosted migration evidence ends at `095`. This proves code, disposable
local database behavior, deterministic provider fakes, provider-disabled
assembly, and the offline bridge. It is not deployment or provider proof. The
next action is independent review, followed by the numbered
[production launch checklist](docs/launch/LAUNCH_CHECKLIST.md)
in order, with backup, dry run, migration application, deployment, secret
provisioning, and each live provider action as separate approvals.

Technical launch is a separate gate from business proof: checklist items 1–22 cover the hosted product, providers, Mac runtime, reliability, and rollback; item 23 requires one paid $500 Website Fix engagement; item 24 requires one paid 30-day Managed Automation pilot with four human-led weekly briefs.

## Work sequence

| Priority | Status | Work | Exit condition |
| --- | --- | --- | --- |
| 1 | Local verification passed | Public dual-offer experience | Navigation, homepage, services, pricing, intake, audit handoff, work proof, legal/support pages, redirects, metadata, sitemap, and curated Insights accurately describe the two offers. |
| 2 | Local verification passed | Route, accessibility, and browser coverage | Unit, accessibility, build, public-browser, private-access, and retained security/assembly gates pass without hiding stale routes. |
| 3 | Partial; exact activation candidate retained | Model-routing policy | Step 10A recorded six fixed sanitized-task results for the exact configured pair. DeepSeek completed its three tasks; Nemotron was rejected by the provider privacy/data-policy guardrail. Only `google/gemma-4-26b-a4b-it:free` remains an activation candidate; a repeat comparison, environment change, or model pin requires separate approval; select no live default until the policy threshold is met. |
| 4 | Pending external sale | Paid Website Fix | Confirm one contained scope, issue the two manual invoices, deliver the fix, and record the handoff/outcome. |
| 5 | Pending external sale | Paid Managed Automation pilot | Agree proposal and approval boundary, operate for 30 days, provide four weekly briefs, and record outcomes. |

## Model-routing gate

The live worker defaults to `evaluation-required`. The test set is deliberately sanitized and fixed:

1. Classify supplied public-business evidence using only supplied evidence.
2. Draft an approved-boundary outreach message.
3. Summarize sanitized activity notes into a client-ready weekly brief without inventing outcomes.

The record for every task includes quality score, tool-use score, latency, provider-reported cost, failure, and repair-needed flag. The shared threshold is quality ≥ 0.80, tool use ≥ 0.90, failure rate ≤ 0.10, and repair rate ≤ 0.20. OpenRouter account and key limits govern model spend. The exact Gemma candidate must complete the fixed set before any selection; if it does not clear the threshold, the route stays `evaluation-required`. There is no hardcoded model fallback.

Catalog availability changes, so the exact Gemma candidate must be verified from
the then-current catalog before any separately approved comparison is recorded.
The evaluation-record API and applied migrations store observations in
Supabase; the API records evidence but does not itself make provider calls.

Step 10A evidence is partial rather than a model-selection result: the hosted
profile remains `evaluation-required`, and provider-policy changes or repeat
requests require separate approval.

The private `OPENROUTER_BACKUP_MODEL` remains probe-only and must be the exact
`google/gemma-4-26b-a4b-it:free` candidate. It may be used only for an
explicitly approved two-request sanitized comparison; the profile remains
`evaluation-required`. It never authorizes a worker, sender, publication,
spend, or external-recipient action.

## Service and safety boundaries

- Supabase is durable truth; Redis is transient only. Do not add Qdrant or another database.
- Every external action remains human-approved. The public site never opens the worker boundary.
- Private workspaces are operator-only. Historical client links and memberships remain durable records but grant no access.
- Real outreach requires the scoped worker boundary, public evidence, suppression/unsubscribe handling, verified sender events, and an approved send.
- Client-facing delivery is the website handoff or weekly brief; it is not a client dashboard.
- Do not activate a provider, deploy, or apply a hosted migration as part of this roadmap without separate approval.

## Content and route decisions

| Public surface | Decision |
| --- | --- |
| `/`, `/services`, `/pricing` | Present the two offers as equal paths. |
| `/contact` | Adaptive intake for canonical `website-fix` or `managed-automation`; legacy values normalize at the boundary. |
| `/site-analyzer → /report/[id]` | Preserved as the Website Fix conversion path; CTA preselects the website offer. |
| `/how-it-works` | Shared delivery process for both offers. |
| `/work` | Compact proof including accurate founder/background material formerly split across About and Resume. |
| `/about`, `/resume` | Permanent redirect to `/work`. |
| `/guide` | Permanent redirect to `/faq`; support material remains in maintained FAQ/process pages. |
| `/build` | Redirect to `/contact?offer=website-fix`; no sitemap entry. |
| `/dashboard`, `/employee`, `/prospecting`, `/admin/*` | Admin/operator only; unauthenticated access is denied and ordinary authenticated access receives no private data. |
| `/api/projects/mine`, `/api/projects/[id]/access` | Retired compatibility boundaries; historical links and memberships remain stored. |

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
