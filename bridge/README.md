# NeedThisDone agent bridge

This is the Mac-side worker for the private agent operations boundary. It
polls the signed NeedThisDone bridge endpoints, claims one leased task at a
time, runs that task through a loopback-only OpenClaw Gateway connection, and
returns evidence and artifacts to the authenticated dashboard.

The bridge does not contain a Supabase service-role key. It sends only signed
HTTPS requests to `BRIDGE_API_URL`; the OpenClaw Gateway URL must be loopback.
The runner sets `deliver: false` and `bestEffortDeliver: false`, and rejects
task types outside the dashboard contract. Publishing, sending, spending, and
account changes remain outside this worker's contract and require a separate
reviewed capability.

## Local setup

Use Node 22 or newer:

```sh
npm ci
npm test
npm run build
```

The runtime requires these environment variables:

```sh
BRIDGE_API_URL=https://your-app.example
OPENCLAW_BRIDGE_SECRET=the-same-secret-as-the-server
BRIDGE_OWNER_ID=00000000-0000-0000-0000-000000000000
BRIDGE_WORKER_ID=mac-mini-01
OPENCLAW_GATEWAY_TOKEN=the-loopback-gateway-token
```

Optional settings are `OPENCLAW_GATEWAY_URL` (default
`ws://127.0.0.1:18789`), `BRIDGE_ARTIFACT_ROOT` (default
`./bridge-artifacts`), `BRIDGE_POLL_INTERVAL_MS` (default `5000`),
`OPENCLAW_REQUEST_TIMEOUT_MS` (default `30000`), `BRIDGE_VERSION`, and
`BRIDGE_CAPABILITIES` as a comma-separated list.

Start the worker only after the server-side agent-operations migration and
signed endpoint checks have been rehearsed:

```sh
npm start
```

No provider key belongs in this directory. Keep the OpenClaw token and any
provider credentials on the Mac host, and keep the Gateway bound to loopback.
