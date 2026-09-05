import { describe, expect, it } from 'vitest';
import { parseVisionIntake, visionIntakeMessage } from '@/lib/vision-intake';

const valid = { version: 1, situation: 'The same request keeps getting lost.', repeatedPattern: 'People follow up twice.', desiredOutcome: 'Every request has a clear next step.', sharedPurpose: 'Create a clear path for every incoming request.', offer: null };

describe('VisionIntakeV1', () => {
  it('accepts a bounded intake with optional feelings and service', () => {
    const parsed = parseVisionIntake(JSON.stringify({ ...valid, currentFeeling: 'stuck', desiredFeeling: 'in-control', offer: 'website-fix' }));
    expect(parsed.offer).toBe('website-fix');
    expect(visionIntakeMessage(parsed)).toContain('Visitor-confirmed desired change');
  });
  it('retains optional pet peeves and mixed possibilities without interpreting them', () => {
    const parsed = parseVisionIntake(JSON.stringify({ ...valid, petPeeves: 'No more alerts.', possibility: 'We might grow, or the change might confuse people.' }));
    expect(visionIntakeMessage(parsed)).toContain('Pet peeves:\nNo more alerts.');
    expect(visionIntakeMessage(parsed)).toContain('Possibilities, hopes, and worries:\n' + parsed.possibility);
    expect(parseVisionIntake(JSON.stringify(valid)).petPeeves).toBe('');
    expect(() => parseVisionIntake(JSON.stringify({ ...valid, petPeeves: 'x'.repeat(801) }))).toThrow();
  });
  it('rejects unknown fields, invalid feelings, and oversized text', () => {
    expect(() => parseVisionIntake(JSON.stringify({ ...valid, secret: true }))).toThrow();
    expect(() => parseVisionIntake(JSON.stringify({ ...valid, currentFeeling: 'angry' }))).toThrow();
    expect(() => parseVisionIntake(JSON.stringify({ ...valid, situation: 'x'.repeat(1201) }))).toThrow();
  });
  it('does not infer content when generating the legacy message', () => {
    const message = visionIntakeMessage(parseVisionIntake(JSON.stringify(valid)));
    expect(message).toContain(valid.situation);
    expect(message).toContain(valid.desiredOutcome);
    expect(message).not.toContain('sentiment');
  });
});
