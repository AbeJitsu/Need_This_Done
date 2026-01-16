import { Variants, Transition } from 'framer-motion';

// ============================================================================
// Animation Variants & Configuration
// ============================================================================
// Centralized animation configurations for consistent motion across the site.
// All animations follow the "subtle, professional, premium" principle.

// ============================================================================
// Timing Constants
// ============================================================================

export const TIMING = {
  // Duration in seconds
  duration: {
    fast: 0.3,
    normal: 0.5,
    slow: 0.6,
  },
  // Stagger delay between children
  stagger: {
    fast: 0.06,
    normal: 0.08,
    slow: 0.1,
  },
  // Easing curves
  ease: {
    default: 'easeOut' as const,
    smooth: [0.25, 0.1, 0.25, 1] as const, // Custom bezier for smooth feel
  },
} as const;

// ============================================================================
// Distance Constants (pixels)
// ============================================================================

export const DISTANCE = {
  desktop: {
    small: 15,
    normal: 20,
    large: 30,
  },
  mobile: {
    small: 10,
    normal: 15,
    large: 20,
  },
} as const;

// ============================================================================
// Standard Transitions
// ============================================================================

export const defaultTransition: Transition = {
  duration: TIMING.duration.normal,
  ease: TIMING.ease.default,
};

export const reducedMotionTransition: Transition = {
  duration: TIMING.duration.fast,
  ease: TIMING.ease.default,
};

// ============================================================================
// Fade Variants
// ============================================================================

// Basic fade (no movement) - used for reduced motion
export const fadeVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: defaultTransition,
  },
};

// ============================================================================
// Directional Fade Variants
// ============================================================================

// Helper to create directional variants
type Direction = 'up' | 'down' | 'left' | 'right' | 'none';

export function createFadeVariants(
  direction: Direction,
  distance: number,
  reducedMotion: boolean = false
): Variants {
  // If reduced motion, only use opacity
  if (reducedMotion) {
    return {
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: reducedMotionTransition,
      },
    };
  }

  // Calculate offset based on direction
  const offset = {
    x: direction === 'left' ? -distance : direction === 'right' ? distance : 0,
    y: direction === 'up' ? distance : direction === 'down' ? -distance : 0,
  };

  return {
    hidden: {
      opacity: 0,
      x: offset.x,
      y: offset.y,
    },
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
      transition: defaultTransition,
    },
  };
}

// ============================================================================
// Stagger Container Variants
// ============================================================================

export function createStaggerContainerVariants(
  staggerDelay: number = TIMING.stagger.normal,
  delayStart: number = 0
): Variants {
  return {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: staggerDelay,
        delayChildren: delayStart,
      },
    },
  };
}

// ============================================================================
// Pre-built Common Variants
// ============================================================================

// Fade up (most common) - desktop
export const fadeUpVariants: Variants = createFadeVariants('up', DISTANCE.desktop.normal);

// Fade up - mobile (toned down)
export const fadeUpMobileVariants: Variants = createFadeVariants('up', DISTANCE.mobile.normal);

// Fade only (for reduced motion)
export const fadeOnlyVariants: Variants = createFadeVariants('none', 0, true);

// Standard stagger container
export const staggerContainerVariants: Variants = createStaggerContainerVariants();

// ============================================================================
// Viewport Settings
// ============================================================================

export const defaultViewport = {
  once: true, // Only animate the first time element enters viewport
  margin: '-50px', // Start animation slightly before element is fully visible
  amount: 0.2, // Trigger when 20% of element is visible
};
