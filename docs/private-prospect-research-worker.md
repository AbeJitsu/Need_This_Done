# Legacy private prospect research worker

This document describes the rollback/comparison worker. The normal Mac-mini
path is now the approved-plan OpenClaw bridge described in
[Agent Operations](AGENT_OPERATIONS.md). Do not run this worker against the
same queue while the OpenClaw bridge is active.

The research runner is intentionally Mac-mini-only. It prepares two public-web, citation-backed dossiers per configured profile and never sends, submits a contact form, activates a sender, or calls the sender route.

## What changes and what does not

The worker can claim a signed legacy daily research task, record expected provider usage, use OpenRouter web search, and report a validated dossier. It cannot approve a draft or send it. A human must promote a dossier with a valid public recipient into the existing outreach review flow, approve it, and explicitly use the sender action.

The legacy database and routes remain additive and local until separately reviewed. No hosted migration, sender activation, benchmark, scheduler installation, or external delivery is part of normal setup.

## Private Mac-mini environment

Create an environment file outside the repository on the Mac mini and make it readable only by its owner:

```bash
umask 077
mkdir -p /Users/your-operator/.config/needthisdone
touch /Users/your-operator/.config/needthisdone/prospecting-worker.env
chmod 600 /Users/your-operator/.config/needthisdone/prospecting-worker.env
```

Its only required values are:

```dotenv
OPENROUTER_API_KEY=...
OPENROUTER_PRIMARY_MODEL=...
OPENROUTER_TEST_MODEL=...
# Only for the separately approved two-request backup probe:
OPENROUTER_BACKUP_MODEL=openrouter/free
PROSPECTING_WORKER_SECRET=...
PROSPECTING_WORKER_BASE_URL=https://private-operator-host.example
PROSPECTING_WORKER_ID=mac-mini-private-research-1
```

The primary and comparison model variables must be exact provider/model IDs.
The optional backup variable may be `openrouter/free` for the controlled probe
or an exact pinned free model such as
`google/gemma-4-26b-a4b-it:free`. The runner rejects malformed IDs and moving
aliases such as `latest`, and it never permits `openrouter/free` to be pinned
as a live worker model. Keep the same private values in the app's root
profile and this separate worker file; the worker file is not populated
automatically from the app profile.

For a measured benchmark, add a specific profile ID and the runtime approval gate only after a human has approved that measurement:

```dotenv
PROSPECTING_PROFILE_ID=...
PROSPECTING_BENCHMARK_APPROVAL=I_HAVE_EXPLICIT_APPROVAL
```

The runner rejects a file with group or world permissions. Do not put either
secret or either model variable in a browser variable, a hosted client build,
a public route, or this repository.

## Commands

From `app/`, a one-time schedule-and-run pass is:

```bash
npx tsx scripts/run-prospecting-worker.ts \
  --env-file /Users/your-operator/.config/needthisdone/prospecting-worker.env \
  --schedule --once
```

The scheduler endpoint derives every profile’s own local date and queues one idempotent `discover_prospects` task after local 09:00. A launchd job may run the command every 15 minutes; the database key prevents duplicate daily tasks.

To explicitly pin the configured primary model into the database, use the
separate approval-gated command:

```bash
npx tsx scripts/run-prospecting-worker.ts \
  --env-file /Users/your-operator/.config/needthisdone/prospecting-worker.env \
  --pin-primary
```

It requires `PROSPECTING_PROFILE_ID` and
`PROSPECTING_PRIMARY_MODEL_APPROVAL=I_HAVE_EXPLICIT_APPROVAL`. The signed
server route verifies that the requested model matches the server's private
`OPENROUTER_PRIMARY_MODEL` before setting `model_route` to `selected-primary`.

The comparison command is deliberately locked:

```bash
npx tsx scripts/run-prospecting-worker.ts \
  --env-file /Users/your-operator/.config/needthisdone/prospecting-worker.env \
  --benchmark
```

It reads both private model variables, resolves their current catalog metadata,
and runs the same sanitized fixed tasks against both models. The shared ledger
reserves each call before it happens and reconciles provider usage afterward.
Comparison results are recorded as evidence only; they never change the
database-pinned primary route.

The backup probe is also deliberately locked and makes exactly two provider
requests: one basic non-streaming text request and one structured JSON request
with a no-op tool declaration and `require_parameters=true`. It does not use
web search, retry a failed request, schedule or claim a worker task, send
email, publish, spend, or address an external recipient:

```bash
npx tsx scripts/run-prospecting-worker.ts \
  --env-file /Users/your-operator/.config/needthisdone/prospecting-worker.env \
  --probe-free-router
```

Use `--probe-backup` with the same approval gate after changing
`OPENROUTER_BACKUP_MODEL` to the pinned Gemma free variant if the dynamic
router fails or selects an unsuitable endpoint. Both probe forms keep the
profile at `evaluation-required` and persist the returned endpoint model ID
alongside the requested route and provider usage.

## Before operational rollout

1. Run the local migration and complete the local assembly checks.
2. Obtain explicit approval and a Mac-mini key before using `--pin-primary` or `--benchmark`.
3. Review the stored comparison evidence and the database-pinned model ID.
4. Obtain explicit approval before installing a launchd job.
5. Observe seven daily runs, including shortfalls and ledger entries, before calling the workflow operational.

If an emergency stop is on, a model remains `evaluation-required`, the provider rejects the request, or the response lacks valid public citations, the worker stops and records the failure or shortfall instead of creating a prospect. The worker records the provider-reported usage and cost; OpenRouter account/key limits govern spend.
