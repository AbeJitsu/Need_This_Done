# Supabase guidance

Read the root `AGENTS.md` and `README.md` first. The README defines the
product and private-system boundary; this file contains only database, RLS,
migration, and Storage rules.

## Stable safety rules

1. Treat every migration as production-impacting, even when testing locally.
2. Never reset or destructively reverse hosted Supabase. Hosted rollback is a
   separately reviewed forward migration.
3. Prefer additive migrations. Remove tables, buckets, policies, or columns
   only after callers are gone and the cleanup migration is separately reviewed.
4. Enable RLS on every PostgREST-exposed table and enforce authenticated
   ownership and tenant boundaries with database-authoritative checks.
5. Keep service-role operations server-side. Never use user-editable JWT
   metadata as the authorization source.
6. Keep private Storage private; use scoped, expiring access and bounded upload
   metadata rather than broad anonymous reads.
7. Do not print or commit credentials, and do not use a hosted write while its
   backup, dry run, or separate approval is missing.

## Migration discipline

- Use the next zero-padded migration number and a descriptive snake-case name.
- Explain purpose, impact, data handling, verification, and rollback in
  migration comments.
- Test schema and RLS changes against disposable local Supabase, then record
  the result in the factual evidence ledger.
