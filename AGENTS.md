# NeedThisDone project instructions

## Canonical sources

`README.md` is the canonical public promise and internal operating vision—the
canonical product and system vision for NeedThisDone. It includes the
private-system boundary, architecture, and local workflow. Read it before
proposing or changing a product surface, workflow, provider, or internal tool.
`ROADMAP.md` is the current outcome sequence and proof criteria; it must follow
the README rather than redefine it.

Use the factual ledgers for changing execution state:

- `docs/PROJECT_STATUS.md` — implementation state, validation, blockers, and rollback.
- `docs/RELEASE_EVIDENCE.md` — what is verified, pending, or not claimable.
- `docs/launch/LAUNCH_CHECKLIST.md` — numbered hosted-promotion controls.

Do not duplicate changing product claims, milestones, or command inventories in
agent instructions. Work that is not necessary for the approved rehearsal,
active delivery, or removal of proven duplication does not enter active scope.

## Stable safety boundaries

- Work on `dev`; do not alter `production` without explicit approval.
- Keep hosted backup, migration dry run, migration application, deployment,
  secret provisioning, provider activation, Mac activation, and live-action
  approval as separate steps.
- Never reset hosted Supabase, force-push, hard-reset user work, rebase release
  history, or use a destructive hosted rollback. Hosted rollback is forward-only.
- A local Supabase reset is allowed only for the disposable local instance and
  only when the task explicitly calls for it.
- Never print or commit credentials, service keys, or secret environment files.
- Every external message, publication, system change, or spend needs human
  approval. The private worker stays outbound-only and may perform only a
  recorded approved frozen plan; no public route may reach that boundary.
- Supabase is durable product truth and Redis is transient only. Do not add a
  replacement database or vector store.
- Do not treat local tests or deterministic provider doubles as hosted,
  provider, paid-delivery, or customer proof.

## Change discipline

1. Inspect `git status` and preserve existing user changes.
2. Read the relevant canonical source and nested `AGENTS.md` before editing.
3. Make one coherent, tested change; avoid unrelated cleanup.
4. Update the factual ledger when implementation or release evidence changes.
5. When committing is requested, keep the implementation and ledger update in
   the same commit and record validation plus rollback notes.
6. Run the narrowest relevant checks, then the documented release gate when the
   change affects it. Record unavailable checks with an owner and removal date.

Prefer existing validation, timeout, retry, authorization, and evidence
patterns over parallel mechanisms.

## Subsystem guidance

- `app/lib/AGENTS.md` covers reusable application-library boundaries.
- `supabase/AGENTS.md` covers schema, RLS, migration, and Storage boundaries.
