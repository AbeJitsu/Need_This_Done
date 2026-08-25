# NeedThisDone Supabase

Supabase is the durable source of truth for owner-scoped work, approvals,
costs, artifacts, results, and private Storage. Redis is transient only.

`migrations/` is the schema history. Every migration is production-impacting:
keep it additive where possible, enable and test RLS for exposed data, and use
a separately reviewed forward migration for any hosted correction.

Use the repository's documented local validation commands for disposable local
Supabase only. Hosted backup, dry run, migration application, and verification
remain distinct owner-approved operations; see the root launch checklist.
