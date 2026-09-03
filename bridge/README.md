# NeedThisDone bridge

`bridge/` is the private Mac-side signed worker for NeedThisDone. It turns a
server-recorded, owner-approved frozen plan into an evidence-bearing result.
It is delivery infrastructure, not a public service; start with the
[repository README](../README.md) for the system boundary.

## Boundary

- The worker initiates signed HTTPS requests to `BRIDGE_API_URL`; it has no
  public listener or inbound port.
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

Start the worker only after the server-side contract and the Mac runtime have
each received their own approval:

```sh
npm start
```

`launchd/` contains review templates only. `install-templates.sh` renders
private review copies; it does not create secrets, call `launchctl`, or activate
a worker.

## Independent OpenClaw proof

[`openclaw-proof/RUNBOOK.txt`](openclaw-proof/RUNBOOK.txt) defines the isolated,
OAuth-only Luna/max host proof. Passing it does not connect OpenClaw to this
bridge or activate the worker; both hosts must pass independently before the
proof's two-host acceptance criterion is met.
