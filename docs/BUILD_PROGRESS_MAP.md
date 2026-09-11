# NeedThisDone build progress map

**Last updated:** 2026-09-11
**Branch:** `feature/system-page-plain-english-2026-09-11`

This is the implementation checklist behind the visual progress map on
[`/system`](../app/app/system/page.tsx). It separates a code contract from a
working connection. A green-looking contract does not mean the corresponding
Supabase, Vercel, worker-host, or LLM-client service has been proven live.

The four displayed gates are code-owned in
[`app/lib/system-progress.ts`](../app/lib/system-progress.ts). The page and
unit tests consume that source so status labels, proof order, and evidence
targets cannot drift silently.

## The four proof gates

| Gate | What must be true | Current state | Evidence required to advance |
|---|---|---|---|
| Contract | A compatible LLM client has one small, validated MCP surface; site login identifies the owner, an owner-scoped bearer credential authorizes MCP, and safety/result shapes are tested | Built locally | Token/auth/API/contract tests and route-level protocol checks; local RLS proof is next |
| Local control plane | Disposable local Supabase has migration 113/RLS proof, and MCP creates and reads an approval-gated workflow | Next proof | `npm run verify:database` plus `npm run test:hermes-mcp:local` with the real local Supabase gate passing |
| Hosted control plane | Vercel, hosted Supabase, Redis, and secure remote MCP access work together | Pending | `npm run test:hermes-mcp:hosted` against an explicit deployed `BASE_URL`; remote writes remain separately approved |
| Worker execution | Hermes claims approved work on a correctly configured local or cloud worker host, OpenClaw completes it, and evidence returns through status | Pending | Approved worker-host rehearsal with signed bridge, isolated worktree, tests, commit SHA, and durable result |

## What can be built without the Macs or live credentials

- Keep the three-tool MCP contract narrow and versioned.
- Keep site-account login, owner-scoped MCP credentials, and separate
  Hermes/OpenClaw worker authentication as distinct boundaries.
- Show raw MCP tokens once; persist only hashes and redacted metadata.
- Add deterministic tests for authorization, idempotency, status envelopes,
  redaction, and fail-closed behavior.
- Keep Supabase as durable workflow truth and Redis as temporary coordination.
- Keep vector memory as an optional, provenance-bearing projection.
- Improve the diagnostic so it reports the first missing boundary instead of
  producing a false end-to-end pass.
- Keep `/system`, README, roadmap, test strategy, and release evidence aligned.
- Prepare worker payloads, signatures, status transitions, and result schemas
  without invoking a real worker.

## What cannot be honestly completed from this environment

- Authenticate an approved LLM client to the deployed MCP endpoint with a
  hosted owner credential and verify the hosted migration separately.
- Prove Vercel environment variables and hosted Supabase parity.
- Prove live Upstash Redis or Upstash Vector connectivity.
- Run Hermes and OpenClaw on a correctly configured local or cloud worker host.
- Claim a real worker-generated GitHub commit through the NeedThisDone flow.

## Current implementation summary

The authenticated owner workspace is now the `/dashboard` destination after
sign-in. It reads a bounded, owner-scoped view of durable workflow status,
updates, checks, references, and results. The previous operator cockpit is
available at `/admin/operations`; the new workspace does not expose queues,
worker health, credentials, or control actions. Migration 114 adds the
read-only owner policies required for this browser surface. The public contact
intake is still intentionally separate from owner provisioning, so a real
customer workflow is not claimed yet.

The repository contains the MCP transport, three-tool contract, account-scoped
credential/API boundary, authentication seam, vector adapter, Redis client, Supabase lifecycle schema, signed worker
bridge contracts, OpenClaw safety constraints, and the visible system map. The
default MCP dispatcher still fails closed because the durable Hermes adapter is
not connected. That is the most important code-to-runtime gap before a real
local workflow can pass.

The required order remains:

1. Local migration 113/RLS, account API, and owner-context proof on disposable Supabase.
2. Local MCP control-plane proof.
3. Hosted read-only control-plane proof.
4. Approved worker-host rehearsal, using the MacBook Pro or Mac mini as current examples if selected.
5. Always-on activation on the selected local or cloud host.
6. Optional vector projection/retrieval proof alongside durable results.

## Test interpretation

| Test layer | Proves | Does not prove |
|---|---|---|
| Unit/contract | Deterministic rules and payload boundaries | A network service or worker is reachable |
| Database/RLS | Local schema, policies, and lifecycle behavior | Hosted Supabase parity |
| Integration/route | Next.js, auth, MCP protocol, and controlled adapters fit together | LLM-client reachability or Mac execution |
| Browser/E2E diagnostic | The selected local or hosted stages and their first failure | A passing hosted read-only check does not prove a write or worker run |
| Live rehearsal | The real LLM-client/MCP/Hermes/worker/result chain | Future hosts or providers not included in that rehearsal |
