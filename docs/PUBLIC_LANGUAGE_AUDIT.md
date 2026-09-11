# Public language audit

**Reviewed:** 2026-09-11
**Branch:** `feature/authenticated-results-status-2026-09-11`
**Scope:** anonymous public routes, retained articles, report and analyzer
states, recovery states, and legacy redirects.

The public promise is:

> NeedThisDone helps teams and individuals solve technology problems and simplify repeated work with clear, focused solutions.

Public prose targets 20 words or fewer per sentence. Twenty-five words is the
hard ceiling. Visitor-submitted text, quoted website text, URLs, legal
citations, and code blocks are exempt. Offer names, prices, intake behavior,
private-system boundaries, and legal meaning remain unchanged.

“Implemented” means the wording is in the working tree. Legal and generated
report copy still needs owner review before publication.

## Anonymous route audit

| Route | Current wording and issue | Proposed wording | Word count | Approval status |
| --- | --- | --- | ---: | --- |
| `/` | The audience label narrowed the doorway to a demographic category. | Remove the audience label. Use “Bring us the problem. We’ll find the real issue, agree on the work, and help fix it.” The What We Do section names technology problems, repeated work, websites, workflows, and tools. | 15 max | Implemented; owner review pending |
| `/services` | The introduction led with a one-problem frame. | “Technology problems. Repeated work. Let’s get things working better.” Websites, workflows, and tools are good places to start; the page explains how we find the issue and get it moving. | 14 max | Implemented; owner review pending |
| `/pricing` | “A clear price starts with a clear piece of work.” The next action was indirect. | “A clear price starts with a clear piece of work. We agree on the work and price before you commit.” | 10 max | Implemented; owner review pending |
| `/website-fix` | “That page should be helping, not getting in the way.” The offer boundary needed a concrete outcome. | “We review one website problem. We agree on one correction and show what changed.” | 10 max | Implemented; owner review pending |
| `/managed-automation` | “Make recurring work easier.” The proposal-based boundary needed earlier context. | “We review one task that keeps taking time. We outline a more dependable way to handle it.” | 10 max | Implemented; owner review pending |
| `/how-it-works` | The introduction named a problem but not the wider technical-help scope. | “Tell us what is not working. We’ll find the next move.” The supporting copy names websites, workflows, tools, repeated work, the agreed work, and visible change. | 14 max | Implemented; owner review pending |
| `/system` | The previous architecture copy centered a conversational client and named products that visitors did not need to understand. | Keep the public explanation on one request → approval → private execution → reviewable result path. Point the result step to the authenticated workspace, describe the request interface without naming a chatbot, and retain proof-state labels for live-connection limits. | Architecture note | Implemented; owner review pending |
| `/work` | “Illustrative before-and-after stories” was accurate but abstract. | “These examples are illustrative. They show what one focused change could look like.” | 9 max | Implemented; owner review pending |
| `/about` | The introduction did not sound like an effective technical partner. | “Clear help for problems that matter.” The supporting copy names technical know-how, focused work, and visible change. | 12 max | Implemented; owner review pending |
| `/faq` | The FAQ began with fit and scope questions without sounding like a direct source of help. | “Answers about what we can help with, how we work, pricing, and what happens next.” A new answer explains that future work can be discussed separately. | 14 max | Implemented; owner review pending |
| `/blog` | The metadata described a broad vision instead of practical help. | “Practical ideas for teams and individuals trying to get work moving.” Article cards introduce three retained articles with shorter copy. | 12 max | Implemented; owner review pending |
| `/site-analyzer` | “SEO,” “certify compliance,” and “every interaction” made a limited tool sound broader than it is. | “We check selected website signals. The findings can point to one useful correction.” | 10 max | Implemented; owner review pending |
| `/ada-compliance` | “What it cannot certify” risked a certification implication. | “Our limited website snapshot checks common barriers, search signals, and basic speed clues. It points to a problem worth reviewing. It is not legal advice.” | 13 max | Implemented; owner/legal review pending |
| `/contact` | The introduction assumed a service choice and did not name broader technical starting points. | “Tell us what is not working.” The form accepts a website, workflow, tool, or repeated task, then agrees on the work before anything starts. | 15 max | Implemented; owner review pending |
| `/privacy` | Long legal paragraphs made collection, retention, and choice boundaries hard to scan. | “NeedThisDone helps teams and individuals solve technology problems and simplify repeated work with clear, focused solutions.” Keep the rewritten legal sections and disclosures below it. | 17 | Implemented; owner/legal review pending |
| `/terms` | Long legal paragraphs mixed scope, billing, approval, and liability in dense sentences. | “NeedThisDone helps teams and individuals solve technology problems and simplify repeated work with clear, focused solutions.” Keep the rewritten scope, payment, approval, and liability terms below it. | 17 | Implemented; owner/legal review pending |

## Public journey contract

The homepage explains what NeedThisDone does, how it works in practical terms,
and why visitors should share their vision. Its primary navigation stays focused
on What We Do, How We Work, Examples, and Why Us. How We Work remains part of
the primary reassurance path, and the homepage closes with Share Your Vision.

The System is optional technical detail. The complete `/system` page remains
available from the footer Explore links and its direct URL, with its sitemap
entry, metadata, technical content, and direct contact/action links intact. It
is useful for curious or technical visitors but is not required for conversion.

## State, article, and redirect audit

| Surface | Current wording and issue | Proposed wording or invariant | Word count | Approval status |
| --- | --- | --- | ---: | --- |
| Analyzer form errors | “The snapshot limit has been reached” and “the report link was unavailable” were longer than needed. | “The snapshot limit is reached. Try again tomorrow. Your entries are still here.” Recovery keeps all entries. | 10 max | Implemented; owner review pending |
| Report hero and signals | “Score,” “grade,” lawsuit, legal-risk, and completeness language overstated selected checks. | “Website snapshot,” “Selected signals,” “Covered,” “Partial,” and “Review.” The report states that a full review may find other issues. | 10 max | Implemented; owner/legal review pending |
| Accessibility report callout | The prior callout suggested legal or compliance conclusions. | “These checks highlight barriers that may affect people using the page. They are a starting point for review.” | 12 max | Implemented; owner/legal review pending |
| Report email | The email exposed score and grade framing. | “Your Website Snapshot Is Ready,” selected signal notes, a report link, and “Share Your Vision.” The data props remain compatible. | 9 max | Implemented; owner/legal review pending |
| Generated report prose | Model output had no enforceable sentence or claim boundary. | Prompt rules require short sentences and reject unsafe or overlong output. Deterministic fallback copy is used when needed. | 12 max | Guard implemented; owner review required |
| Retained article: `ai-context-budget-tips` | The introduction and excerpt repeated setup language. | “A Smaller AI Brief Works Better.” Technical terms and the `git log` example remain, with shorter prose. | 7 max | Implemented; owner review pending |
| Retained article: `loading-tricks-feel-instant` | The article mixed long explanations with code examples. | “4 Loading Tricks That Make a Site Feel Faster.” All four code examples remain unchanged in meaning. | 10 max | Implemented; owner review pending |
| Retained article: `rewriting-copy-plain-language` | Portfolio examples were accurate but led with implementation detail. | “Plain-Language Copy Helps People Understand Technical Work.” Quoted before/after examples remain available. | 9 max | Implemented; owner review pending |
| Runtime errors | Recovery copy added multiple links and mixed fallback choices. | “We could not open this page.” Each error state offers one clear retry or home action. | 8 max | Implemented; owner review pending |
| Legacy redirects | Redirects were not part of the copy rewrite and must not drift. | `/guide` → `/faq`; `/resume` → `/work`; `/build` → `/contact?offer=website-fix`; `/build/success` → `/contact?offer=website-improvement`. Retired blog slugs still resolve to `/work`, `/services`, or `/blog` by their existing groups. | N/A | Verified; unchanged |

## Cross-surface controls

- `app/lib/public-copy.ts` is the source for the core promise, brand promise,
  site description, report fallback, sentence limits, and generated-copy guard.
- `PUBLIC_CORE_PROMISE` feeds homepage copy, metadata, social previews,
  structured data, footer copy, and both offer summaries.
- The homepage journey covers What We Do, How We Work, Examples, and Why Us;
  The System is intentionally excluded from primary navigation and homepage
  conversion while remaining a footer/direct-URL technical-details page.
- The shared audience language is “teams and individuals,” while the homepage
  uses no demographic label. Focused scope is a delivery guideline, not a
  limit on who can bring a problem or what kind of technology, workflow, tool,
  or repeated work they can discuss.
- `PUBLIC_OFFERS` remains the source for offer names, prices, contact links,
  detail links, fit text, and summaries.
- `blog-content.ts` overlays the reviewed retained article copy without changing
  the three public slugs or the article route contract.
- The public report keeps the existing score, grade, category, and API fields
  for compatibility. Public report components no longer present score or grade
  claims.
- The public intake keeps its four-step behavior, optional offer selection,
  existing `intakeContext` payload, and `/api/projects` contract.
- No public route reaches the private worker. No API, schema, billing, provider,
  hosted, publication, or external-message change is part of this audit.

## Validation record

The implementation has targeted automated coverage for sentence length, banned
report claims, the retired narrow brand promise, the broader homepage and FAQ
language, future-work reassurance, duplicate invitation copy, offer fact
consistency, system-term placement, the four-link primary navigation, the
footer `/system` link, the shortened homepage next-step sequence, the
`/how-it-works` → `/work` handoff, the unchanged `/system` route contract, and
redirect destinations. The completed checks are recorded in
`docs/PROJECT_STATUS.md` and `docs/RELEASE_EVIDENCE.md` after the final code
gate. On 2026-09-09, `npm run verify:code` passed lint,
type-check, 67 unit files/352 tests, 6 accessibility files/60 tests, and the
production build; the focused public-language checks passed 24/24 and
`git diff --check` passed. `npm run test:retained-smoke` ran 96 public desktop
and mobile checks: 81 passed and 11 were expected skips. Four report-fixture
checks remain unavailable because the default local report ID returns 404 and
the snapshot handoff does not open a report; owner: application test owner,
follow up by 2026-09-16. Legal and generated-report copy remain owner-review
items, and this copy change is not published.
