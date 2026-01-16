// ============================================================================
// Motion Components - Barrel Export
// ============================================================================
// Import animation components from this file:
//   import { FadeIn, StaggerContainer, StaggerItem, RevealSection } from '@/components/motion';

// Components
export { FadeIn } from './FadeIn';
export { StaggerContainer } from './StaggerContainer';
export { StaggerItem } from './StaggerItem';
export { RevealSection } from './RevealSection';

// Hook
export { useReducedMotion } from './useReducedMotion';

// Variants & config (for advanced usage)
export {
  TIMING,
  DISTANCE,
  defaultTransition,
  reducedMotionTransition,
  fadeVariants,
  createFadeVariants,
  createStaggerContainerVariants,
  fadeUpVariants,
  fadeUpMobileVariants,
  fadeOnlyVariants,
  staggerContainerVariants,
  defaultViewport,
} from './variants';
