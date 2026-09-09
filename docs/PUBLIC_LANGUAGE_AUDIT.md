# Public language audit

**Reviewed:** 2026-09-08
**Branch:** `dev`
**Scope:** anonymous public routes, retained articles, report and analyzer
states, recovery states, and legacy redirects.

The public promise is:

> NeedThisDone helps owners and founders fix one website problem or one repeated task.

Public prose targets 20 words or fewer per sentence. Twenty-five words is the
hard ceiling. Visitor-submitted text, quoted website text, URLs, legal
citations, and code blocks are exempt. Offer names, prices, intake behavior,
private-system boundaries, and legal meaning remain unchanged.

“Implemented” means the wording is in the working tree. Legal and generated
report copy still needs owner review before publication.

## Anonymous route audit

| Route | Current wording and issue | Proposed wording | Word count | Approval status |
| --- | --- | --- | ---: | --- |
| `/` | “A clearer website. A smoother working day.” The outcome was broad and repeated the journey copy. | “NeedThisDone helps owners and founders fix one website problem or one repeated task.” | 13 | Implemented; owner review pending |
| `/services` | “A clearer website. Less busywork.” The two starting points were not immediate. | “Choose a website fix or a repeated-task improvement. Bring the situation as it is if you are unsure.” | 10 max | Implemented; owner review pending |
| `/pricing` | “A clear price starts with a clear piece of work.” The next action was indirect. | “A clear price starts with a clear piece of work. We agree on the work and price before you commit.” | 10 max | Implemented; owner review pending |
| `/website-fix` | “That page should be helping, not getting in the way.” The offer boundary needed a concrete outcome. | “We review one website problem. We agree on one correction and show what changed.” | 10 max | Implemented; owner review pending |
| `/managed-automation` | “Make recurring work easier.” The proposal-based boundary needed earlier context. | “We review one task that keeps taking time. We outline a more dependable way to handle it.” | 10 max | Implemented; owner review pending |
| `/how-it-works` | “Tell us the problem. We’ll work out the next step.” The five-step sequence carried longer explanations. | “Tell us the problem. We will work out the next step.” | 7 max | Implemented; owner review pending |
| `/system` | Internal architecture terms appeared before the reader understood the purpose. | “NeedThisDone helps owners and founders fix one website problem or one repeated task.” Plain-language system stages come before the technical section. | 13 | Implemented; owner review pending |
| `/work` | “Illustrative before-and-after stories” was accurate but abstract. | “These examples are illustrative. They show what one focused change could look like.” | 9 max | Implemented; owner review pending |
| `/about` | “A bounded partner” used internal or abstract language. | “You know your business. We bring structure without pretending to know it better. The work stays bounded and easy to review.” | 9 max | Implemented; owner review pending |
| `/faq` | The FAQ began with scope questions instead of the visitor’s problem. | “Start with what you want to change. We can clarify the next useful step together.” | 10 max | Implemented; owner review pending |
| `/blog` | The metadata described a broad vision instead of the practical public offer. | “Ideas you can put to use.” Article cards now introduce three retained articles with shorter copy. | 7 max | Implemented; owner review pending |
| `/site-analyzer` | “SEO,” “certify compliance,” and “every interaction” made a limited tool sound broader than it is. | “We check selected website signals. The findings can point to one useful correction.” | 10 max | Implemented; owner review pending |
| `/ada-compliance` | “What it cannot certify” risked a certification implication. | “Our limited website snapshot checks common barriers, search signals, and basic speed clues. It points to a problem worth reviewing. It is not legal advice.” | 13 max | Implemented; owner/legal review pending |
| `/contact` | “We’ll listen before suggesting a path” appeared twice. Labels also assumed the visitor had chosen a service. | “You do not need a technical brief or a chosen service. This form starts a conversation only.” | 11 max | Implemented; owner review pending |
| `/privacy` | Long legal paragraphs made collection, retention, and choice boundaries hard to scan. | “NeedThisDone helps owners and founders fix one website problem or one repeated task.” Keep the rewritten legal sections and disclosures below it. | 13 | Implemented; owner/legal review pending |
| `/terms` | Long legal paragraphs mixed scope, billing, approval, and liability in dense sentences. | “NeedThisDone helps owners and founders fix one website problem or one repeated task.” Keep the rewritten scope, payment, approval, and liability terms below it. | 13 | Implemented; owner/legal review pending |

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
report claims, duplicate invitation copy, offer fact consistency, system-term
placement, and redirect destinations. The completed checks are recorded in
`docs/PROJECT_STATUS.md` and `docs/RELEASE_EVIDENCE.md` after the final code
gate. Legal and generated-report copy remain owner-review items.
