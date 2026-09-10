export type SystemProofState = 'built' | 'next-proof' | 'pending';

export type SystemProofLane = {
  number: string;
  title: string;
  state: SystemProofState;
  status: string;
  description: string;
  evidence: string;
};

/**
 * The durable, reviewer-facing proof order for the operating system.
 *
 * This is intentionally code-owned so the /system page and its tests use the
 * same current-state vocabulary. A state here describes repository evidence;
 * it never claims that a hosted service or physical worker is live.
 */
export const SYSTEM_PROOF_LANES: readonly SystemProofLane[] = [
  {
    number: '01',
    title: 'Contract',
    state: 'built',
    status: 'Built',
    description: 'Schemas, MCP transport, authentication seam, safety rules, and tests agree on the small public boundary.',
    evidence: 'Unit, contract, and route protocol tests',
  },
  {
    number: '02',
    title: 'Local control plane',
    state: 'next-proof',
    status: 'Next proof',
    description: 'Real local Supabase must pass first, then MCP must create and read an approval-gated durable workflow.',
    evidence: 'npm run test:hermes-mcp:local',
  },
  {
    number: '03',
    title: 'Hosted control plane',
    state: 'pending',
    status: 'Pending',
    description: 'Vercel, hosted Supabase, Redis, and secure remote ChatGPT access must pass a separate read-only preflight.',
    evidence: 'npm run test:hermes-mcp:hosted',
  },
  {
    number: '04',
    title: 'Worker execution',
    state: 'pending',
    status: 'Pending',
    description: 'The MacBook rehearsal must prove Hermes can claim work and OpenClaw can return a reviewable GitHub result before Mac mini activation.',
    evidence: 'Approved MacBook rehearsal with signed bridge and commit evidence',
  },
] as const;

export const SYSTEM_PROOF_STATE_ORDER: readonly SystemProofState[] = [
  'built',
  'next-proof',
  'pending',
] as const;
