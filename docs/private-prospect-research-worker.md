# Private prospect research worker

The research runner is intentionally Mac-mini-only. It prepares two public-web, citation-backed dossiers per configured profile and never sends, submits a contact form, activates a sender, or calls the sender route.

## What changes and what does not

The worker can claim a signed daily research task, reserve model budget, use OpenRouter web search, and report a validated dossier. It cannot approve a draft or send it. A human must promote a dossier with a valid public recipient into the existing outreach review flow, approve it, and explicitly use the sender action.

The database migration is additive and local until separately reviewed. No hosted migration, sender activation, benchmark, scheduler installation, or external delivery is part of normal setup.

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
PROSPECTING_WORKER_SECRET=...
PROSPECTING_WORKER_BASE_URL=https://private-operator-host.example
PROSPECTING_WORKER_ID=mac-mini-private-research-1
```

For a measured benchmark, add a specific profile ID and the runtime approval gate only after a human has approved that measurement:

```dotenv
PROSPECTING_PROFILE_ID=...
PROSPECTING_BENCHMARK_APPROVAL=I_HAVE_EXPLICIT_APPROVAL
```

The runner rejects a file with group or world permissions. Do not put either secret in `.env.local`, a browser variable, a hosted client build, a public route, or this repository.

## Commands

From `app/`, a one-time schedule-and-run pass is:

```bash
npx tsx scripts/run-prospecting-worker.ts \
  --env-file /Users/your-operator/.config/needthisdone/prospecting-worker.env \
  --schedule --once
```

The scheduler endpoint derives every profile’s own local date and queues one idempotent `discover_prospects` task after local 09:00. A launchd job may run the command every 15 minutes; the database key prevents duplicate daily tasks.

The benchmark command is deliberately locked:

```bash
npx tsx scripts/run-prospecting-worker.ts \
  --env-file /Users/your-operator/.config/needthisdone/prospecting-worker.env \
  --benchmark
```

It resolves current free catalog candidates from `GET /api/v1/models`, requires availability, tool support, structured output, and zero prompt/completion/request pricing, then persists exact IDs before testing. It benchmarks free candidates first; only when all miss the threshold can it register the pinned DeepSeek fallback. The shared ledger reserves each call before it happens and reconciles provider usage afterward.

## Before operational rollout

1. Run the local migration and complete the local assembly checks.
2. Obtain explicit approval and a Mac-mini key before using `--benchmark`.
3. Review the stored benchmark evidence and the read-only pinned model policy.
4. Obtain explicit approval before installing a launchd job.
5. Observe seven daily runs, including shortfalls and ledger entries, before calling the workflow operational.

If an emergency stop is on, a model remains `evaluation-required`, a catalog price is unknown, a reservation would exceed $0.10 per request or $0.25 per local day, or the response lacks valid public citations, the worker stops and records the failure or shortfall instead of creating a prospect.
