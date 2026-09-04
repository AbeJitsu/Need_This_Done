# Emotion-First Public Journey Redesign

## Goal

Turn the public site into a calm, reassuring path for owners and founders who
have a problem that keeps getting in the way. The site should hear them out,
assure them that NeedThisDone will help resolve it, explain the two bounded
starting points in plain language, and lead them to share their vision.

The site-wide promise is: **Tell us what’s happening. We’ll listen, make sure
we understand, and help you resolve it.**

## Decisions

- Keep **Share Your Vision** as the global conversion action.
- Use a strong resolution promise, while explaining what is included before
  work starts and stating plainly when a request needs a different specialist
  or a larger engagement.
- Keep Website Fix and Managed Automation as the approved offer names. Explain
  each in everyday language when first introduced.
- Never render MATCH, CRIB, pream, echo, shared-purpose, or other internal
  framework language in customer copy, metadata, structured data, reports, or
  customer messages.
- Keep all four intake steps directly browsable without completing earlier
  fields; retain answers, optional feelings, optional service selection, and
  the existing backwards-compatible submission contract.

## Journey and page roles

Every page follows recognition → reassurance → relevant explanation → honest
limits → one action. Header progression remains Home → What We Do → How We
Work → Examples → Why Us → Share Your Vision. Repeated filled actions may only
repeat the same conversion; all exploration links remain visually secondary.

- **Home:** recognize the stuck problem and make the listening-and-resolution
  promise before introducing offers.
- **What We Do:** use visitor-recognition patterns rather than asking visitors
  to choose a service immediately; keep one closing conversion action.
- **How We Work:** replace the framework headings with: Tell us what’s going
  on; We listen to what you’ve tried; We agree on what fixed means; We show you
  the first piece we can resolve; You decide, then we do the agreed work and
  show what changed. Lead with “You don’t have to keep carrying the problem
  alone.”
- **Examples and Why Us:** use hypothetical scenarios with a clear notice,
  explain what was tried and why it mattered, and establish trust without
  invented founder biography or client-result claims.
- **Offer and pricing pages:** make Website Fix and Managed Automation
  distinct, keep $500 and proposal facts centralized, and remove equal-weight
  competing conversion buttons.
- **Contact:** use ordinary labels such as “What needs to be different?”,
  “What you can expect from us”, and “The change we agree to work toward.”
- **Snapshot, report, and accessibility pages:** use plain-language selected
  checks, remove grade/certification/AI-powered implications and unsupported
  legal-risk claims, and connect a report to one Website Fix starting point.
- **FAQ, Insights, legal pages, and error states:** order answers around fit,
  process, price, boundaries, and next steps; remove blog filters with only
  three posts; use topic-aware article handoffs; translate legal and analytics
  language without losing accuracy; give error states one recovery action.

## Implementation boundaries

- Extend the centralized public route/action configuration to every anonymous
  public route and wire existing privacy-safe aggregate event tracking to page
  views and configured actions. Do not include visitor text in metrics.
- Keep the existing `/api/projects`, `VisionIntakeV1`, engagement endpoint,
  and migration 112 compatible. Migration 112 remains staged and unapplied.
- Remove or consolidate stale page-config defaults that do not drive rendered
  pages, after confirming no active callers.
- Update metadata, social copy, structured data, and generated snapshot copy
  to use the same plain-language rules.
- Preserve the private login and authenticated assistant surfaces; they are
  outside the public customer funnel.

## Verification

- Rendered-copy tests reject internal-framework and agreed jargon terms from
  customer-facing output.
- Unit and browser tests cover route ordering, CTA hierarchy, offer facts,
  intake browsing and persistence, report/snapshot handoffs, redirects, and
  analytics failure isolation.
- Run accessibility checks and public Playwright coverage at 375, 768, and
  1280 pixels, including articles, a seeded report, legal pages, and recovery
  states; perform fresh rendered visual QA when browser control is available.
- Run lint, type-check, unit tests, accessibility tests, production build, and
  `git diff --check`, then update the factual status and release-evidence
  ledgers with exact results and remaining hosted boundaries.
