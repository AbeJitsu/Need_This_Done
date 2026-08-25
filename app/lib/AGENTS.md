# Application-library guidance

Read the root `AGENTS.md` and `README.md` first. The README defines product
scope and operating boundaries; this file keeps only reusable-library rules.

## Stable boundaries

- Supabase is durable truth and Redis is transient only. Do not add a
  replacement database or vector store.
- Use the existing authenticated session and server-side authorization boundary;
  do not add a second auth system or a client-side authorization shortcut.
- Never expose provider secrets or worker credentials to browser code. Preserve
  human approval before an external message, publication, system change, or spend.
- Keep external fetches SSRF-safe, bounded, timeout-protected, and explicit
  about failures.
- Preserve project ownership and tenant boundaries in every route and query.

## Change discipline

- Reuse shared validation, timeout, retry, authorization, and API-error helpers.
- Keep external adapters provider-neutral where the roadmap requires it.
- Add focused tests for changed behavior and update the relevant evidence ledger.
