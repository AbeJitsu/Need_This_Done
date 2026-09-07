# NeedThisDone bridge

`bridge/` is the private Mac-side signed worker for NeedThisDone. It turns a
server-recorded, owner-approved frozen plan into an evidence-bearing result.
It is delivery infrastructure, not a public service; start with the
[repository README](../README.md) for the system boundary.

## Boundary

- In approved mode the worker initiates signed HTTPS requests to
  `BRIDGE_API_URL`; disposable-local rehearsal may use signed loopback HTTP or
  HTTPS. It has no public listener or inbound port.
- It may claim and execute only work released by the server-side approval
  boundary, then return status, usage, and artifacts through that same signed
  connection.
- Its OpenClaw Gateway connection must remain loopback-only.
- It holds no Supabase service-role key and never receives provider credentials.
- It must not send messages, publish, spend, modify connected accounts, or
  perform another external action without a separately recorded human approval.

## Local package

Use Node 22 or newer:

```sh
npm ci
npm test
npm run build
```

The runtime requires private host configuration for `BRIDGE_API_URL`,
`OPENCLAW_BRIDGE_SECRET`, `BRIDGE_OWNER_ID`, `BRIDGE_WORKER_ID`, and
`OPENCLAW_GATEWAY_TOKEN`. Optional settings are documented in `src/index.ts`.
Keep all values outside this repository and keep the Gateway bound to loopback.

The repository-level Mac worker command owns host discovery and the launchd
lifecycle:

```sh
npm run mac:worker -- preflight
npm run mac:worker -- prepare
npm run mac:worker -- status
npm run mac:worker -- start --confirm START_NEEDTHISDONE_WORKER
npm run mac:worker -- stop
```

`preflight` never starts anything. It checks the actual `node`, `openclaw`,
Docker, launchd, cache, profile, and private-file state. `prepare` builds the
bridge and renders review-only plists with the paths found by `command -v`; it
does not call `launchctl`, create credentials, or start a provider. `start` is
the only activating command and requires the exact confirmation token shown
above. It starts the loopback Gateway, waits for its handshake, then starts the
bridge and waits for its durable heartbeat. `status` never prints secrets.
`stop` keeps runtime data and records the worker as stopped.

The existing `needthisdone` OpenClaw profile is the read-only profile. The
future `needthisdone-codex-builder` profile is deliberately not used by this
command. A disposable local rehearsal must opt in explicitly:

```sh
BRIDGE_ENV_FILE=/ABSOLUTE/PRIVATE/PATH/bridge.env \
  npm run mac:worker -- test --local --duration 60
```

That private file must contain `BRIDGE_MODE=disposable-local` and a loopback
`BRIDGE_API_URL`; approved/live mode requires external HTTPS. The rehearsal
uses foreground processes and removes only its exact temporary artifacts on
exit. It does not load launchd jobs.

Before any later approved private-Mac rehearsal, run the configuration-only validator. It
does not start the worker, call the bridge API, or connect to OpenClaw:

```sh
BRIDGE_ENV_FILE=/ABSOLUTE/PRIVATE/PATH/bridge.env \
  bridge/launchd/validate-runtime-config.sh
```

[`rehearsal/RUNBOOK.txt`](rehearsal/RUNBOOK.txt) records the exact preparation
and the separate approval boundary for the future read-only rehearsal.

The package's direct `npm start` entrypoint is not the host lifecycle command.
Start the worker only after the server-side contract and the Mac runtime have
each received their own approval, using the repository-level command above.

`launchd/` contains review templates and private wrappers only.
`install-templates.sh` renders private review copies; it does not create
secrets, call `launchctl`, or activate a worker. The Gateway wrapper sources
the private environment file so its token is never placed in a plist or command
line.

## Independent OpenClaw proof

[`openclaw-proof/RUNBOOK.txt`](openclaw-proof/RUNBOOK.txt) defines the isolated,
OAuth-only Luna/max host proof. Passing it does not connect OpenClaw to this
bridge or activate the worker; both hosts must pass independently before the
proof's two-host acceptance criterion is met.
