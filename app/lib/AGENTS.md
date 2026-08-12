# Application-library guidance

Read the root `AGENTS.md` first. This file contains only boundaries specific to
reusable code under `app/lib`; current product claims and release status live in
`README.md`, `ROADMAP.md`, and `docs/`.

## Boundaries

- Supabase is durable truth for projects, reports, private work, approvals,
  outcomes, prospecting, evaluation, audit, and private-storage records.
- Redis is transient for cache, rate limits, and deduplication; do not add a
  replacement database or vector store.
- Use the existing authenticated session and server-side authorization boundary;
  do not add a second auth system or a client-side authorization shortcut.
- Keep the planner draft-only and preserve human approval before any external
  message, publication, system change, or spend. Never expose provider secrets
  or worker credentials to browser code.
- The site analyzer and all other external fetches must be SSRF-safe, bounded,
  timeout-protected, and explicit about failures.
- Website Improvement payments remain a manual, separately approved boundary;
  do not restore carts, catalogs, Medusa/Railway, custom checkout, or automatic
  recurring purchase behavior.

## Implementation habits

- Reuse shared validation, timeout, retry, authorization, and API-error helpers.
- Preserve project ownership and tenant boundaries in every route and query.
- Keep external adapters provider-neutral where the current roadmap requires it.
- Add focused tests for changed behavior and update the relevant evidence ledger.
