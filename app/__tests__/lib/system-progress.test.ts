import { describe, expect, it } from 'vitest';
import { SYSTEM_PROOF_LANES, SYSTEM_PROOF_STATE_ORDER } from '@/lib/system-progress';

describe('system proof progress map', () => {
  it('keeps the proof gates ordered from contract to worker execution', () => {
    expect(SYSTEM_PROOF_LANES.map((lane) => lane.title)).toEqual([
      'Contract',
      'Local control plane',
      'Hosted control plane',
      'Worker execution',
    ]);
    expect(SYSTEM_PROOF_LANES.map((lane) => lane.state)).toEqual([
      'built',
      'next-proof',
      'pending',
      'pending',
    ]);
  });

  it('gives every gate a concrete evidence target', () => {
    expect(SYSTEM_PROOF_LANES).toHaveLength(4);
    expect(SYSTEM_PROOF_LANES.every((lane) => lane.evidence.length > 0)).toBe(true);
    expect(SYSTEM_PROOF_STATE_ORDER).toEqual(['built', 'next-proof', 'pending']);
  });
});
