# NeedThisDone build progress map

**Last updated:** 2026-09-10  
**Branch:** `codex/ai-operating-system-foundation`

This is the implementation checklist behind the visual progress map on
[`/system`](../app/app/system/page.tsx). It separates a code contract from a
working connection. A green-looking contract does not mean the corresponding
 Supabase, Vercel, Mac, or LLM-client service has been proven live.

The four displayed gates are code-owned in
[`app/lib/system-progress.ts`](../app/lib/system-progress.ts). The page and
unit tests consume that source so status labels, proof order, and evidence
targets cannot drift silently.

## The four proof gates

| Gate | What must be true | Current state | Evidence required to advance |
|---|---|---|---|
| Contract | A compatible LLM client has one small, validated MCP surface; safety and result shapes are tested | Built | Unit/contract tests and route-level protocol checks |
| Local control plane | Local Supabase is real and reachable; MCP creates and reads an approval-gated workflow | Next proof | `npm run test:hermes-mcp:local` with the real local Supabase gate passing |
| Hosted control plane | Vercel, hosted Supabase, Redis, and secure remote MCP access work together | Pending | `npm run test:hermes-mcp:hosted` against an explicit deployed `BASE_URL`; remote writes remain separately approved |
| Worker execution | Hermes claims approved work on the MacBook, OpenClaw completes it, and evidence returns through status | Pending | Approved MacBook rehearsal with signed bridge, isolated worktree, tests, commit SHA, and durable result |

## What can be built without the Macs or live credentials

- Keep the three-tool MCP contract narrow and versioned.
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

- Authenticate an approved LLM client to the deployed MCP endpoint.
- Prove Vercel environment variables and hosted Supabase parity.
- Prove live Upstash Redis or Upstash Vector connectivity.
- Run Hermes and OpenClaw on the MacBook or Mac mini.
- Claim a real worker-generated GitHub commit through the NeedThisDone flow.

## Current implementation summary

The repository contains the MCP transport, three-tool contract, authentication
seam, vector adapter, Redis client, Supabase lifecycle schema, signed worker
bridge contracts, OpenClaw safety constraints, and the visible system map. The
default MCP dispatcher still fails closed because the durable Hermes adapter is
not connected. That is the most important code-to-runtime gap before a real
local workflow can pass.

The required order remains:

1. Local Supabase and local MCP control-plane proof.
2. Hosted read-only control-plane proof.
3. Approved MacBook worker rehearsal.
4. Mac mini activation and always-on rehearsal.
5. Optional vector projection/retrieval proof alongside durable results.

## Test interpretation

| Test layer | Proves | Does not prove |
|---|---|---|
| Unit/contract | Deterministic rules and payload boundaries | A network service or worker is reachable |
| Database/RLS | Local schema, policies, and lifecycle behavior | Hosted Supabase parity |
| Integration/route | Next.js, auth, MCP protocol, and controlled adapters fit together | LLM-client reachability or Mac execution |
| Browser/E2E diagnostic | The selected local or hosted stages and their first failure | A passing hosted read-only check does not prove a write or worker run |
| Live rehearsal | The real LLM-client/MCP/Hermes/worker/result chain | Future hosts or providers not included in that rehearsal |
