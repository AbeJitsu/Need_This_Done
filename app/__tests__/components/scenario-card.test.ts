import { CARD_ANIMATION } from '@/components/Wizard/ScenarioCard';

// ============================================================================
// ScenarioCard Animation Config Regression Tests
// ============================================================================
// Guards against reverting to underdamped spring transitions that cause
// hover jumpiness. These run as pure unit tests (node env, no JSX needed)
// since they only validate the exported config object.

describe('ScenarioCard animation config', () => {
  describe('transition type', () => {
    it('uses tween, not spring (springs overshoot on small movements)', () => {
      expect(CARD_ANIMATION.transition.type).toBe('tween');
    });

    it('finishes within the CSS transition budget (200ms)', () => {
      expect(CARD_ANIMATION.transition.duration).toBeLessThanOrEqual(0.2);
    });

    it('uses easeOut for natural deceleration', () => {
      expect(CARD_ANIMATION.transition.ease).toBe('easeOut');
    });
  });

  describe('hover movement', () => {
    it('lifts the card upward (negative y)', () => {
      expect(CARD_ANIMATION.hover.y).toBeLessThan(0);
    });

    it('stays within py-2 padding budget (8px)', () => {
      expect(Math.abs(CARD_ANIMATION.hover.y)).toBeLessThanOrEqual(4);
    });
  });

  describe('tap movement', () => {
    it('pushes the card down (positive y)', () => {
      expect(CARD_ANIMATION.tap.y).toBeGreaterThan(0);
    });

    it('stays within py-2 padding budget (8px)', () => {
      expect(Math.abs(CARD_ANIMATION.tap.y)).toBeLessThanOrEqual(4);
    });
  });
});
