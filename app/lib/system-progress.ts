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
    description: 'The request boundary, authentication seam, safety rules, and tests agree on the small public contract.',
    evidence: 'Token, auth, API, contract, and route protocol tests',
  },
  {
    number: '02',
    title: 'Local control plane',
    state: 'next-proof',
    status: 'Next proof',
    description: 'Next, prove an approval-gated workflow against real local Supabase.',
    evidence: 'npm run verify:database; npm run test:hermes-mcp:local',
  },
  {
    number: '03',
    title: 'Hosted control plane',
    state: 'pending',
    status: 'Pending',
    description: 'Then prove Vercel, Supabase, Redis, and remote access together.',
    evidence: 'npm run test:hermes-mcp:hosted',
  },
  {
    number: '04',
    title: 'Worker execution',
    state: 'pending',
    status: 'Pending',
    description: 'Finally, prove a private worker can complete approved work and return evidence.',
    evidence: 'Approved worker-host rehearsal with signed bridge and commit evidence',
  },
] as const;

export const SYSTEM_PROOF_STATE_ORDER: readonly SystemProofState[] = [
  'built',
  'next-proof',
  'pending',
] as const;
