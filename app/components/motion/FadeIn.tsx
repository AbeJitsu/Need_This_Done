'use client';

import { motion, useReducedMotion as useFramerReducedMotion } from 'framer-motion';
import { ReactNode, useMemo } from 'react';
import {
  createFadeVariants,
  defaultViewport,
  DISTANCE,
  TIMING,
} from './variants';

// ============================================================================
// FadeIn Component
// ============================================================================
// A versatile fade-in animation component that supports:
// - Multiple directions (up, down, left, right, none)
// - Scroll-triggered or immediate animations
// - Reduced motion support (accessibility)
// - Mobile-optimized distances
//
// Usage:
//   <FadeIn>Content fades up on scroll</FadeIn>
//   <FadeIn direction="left" delay={0.2}>Slides from left with delay</FadeIn>
//   <FadeIn triggerOnScroll={false}>Animates immediately on mount</FadeIn>

type Direction = 'up' | 'down' | 'left' | 'right' | 'none';

interface FadeInProps {
  children: ReactNode;
  // Animation direction - which way element travels FROM
  // 'up' means element starts below and moves up into place
  direction?: Direction;
  // Delay before animation starts (seconds)
  delay?: number;
  // Animation duration (seconds)
  duration?: number;
  // Distance to travel (pixels) - auto-adjusted for mobile
  distance?: number;
  // Whether to trigger on scroll (true) or immediately on mount (false)
  triggerOnScroll?: boolean;
  // Only animate once when scrolling into view
  once?: boolean;
  // Additional CSS classes
  className?: string;
  // HTML element to render as
  as?: keyof JSX.IntrinsicElements;
}

export function FadeIn({
  children,
  direction = 'up',
  delay = 0,
  duration = TIMING.duration.normal,
  distance,
  triggerOnScroll = true,
  once = true,
  className = '',
  as = 'div',
}: FadeInProps) {
  // Use Framer Motion's built-in reduced motion detection
  const prefersReducedMotion = useFramerReducedMotion();

  // Determine distance based on device (mobile gets shorter distances)
  const effectiveDistance = useMemo(() => {
    if (distance !== undefined) return distance;

    // Check if we're on mobile (rough check, works for SSR)
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      return DISTANCE.mobile.normal;
    }
    return DISTANCE.desktop.normal;
  }, [distance]);

  // Create variants based on settings
  const variants = useMemo(
    () => createFadeVariants(direction, effectiveDistance, prefersReducedMotion),
    [direction, effectiveDistance, prefersReducedMotion]
  );

  // Adjust duration for reduced motion
  const effectiveDuration = prefersReducedMotion
    ? TIMING.duration.fast
    : duration;

  // Create the motion component dynamically based on 'as' prop
  const MotionComponent = motion[as as keyof typeof motion] as typeof motion.div;

  // Common props for both scroll and non-scroll modes
  const motionProps = {
    initial: 'hidden',
    variants,
    transition: {
      duration: effectiveDuration,
      ease: TIMING.ease.default,
      delay,
    },
    className,
  };

  // Scroll-triggered animation
  if (triggerOnScroll) {
    return (
      <MotionComponent
        {...motionProps}
        whileInView="visible"
        viewport={{ ...defaultViewport, once }}
      >
        {children}
      </MotionComponent>
    );
  }

  // Immediate animation (on mount)
  return (
    <MotionComponent {...motionProps} animate="visible">
      {children}
    </MotionComponent>
  );
}
