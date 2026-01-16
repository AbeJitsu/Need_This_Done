'use client';

import { motion, useReducedMotion as useFramerReducedMotion } from 'framer-motion';
import { ReactNode, useMemo } from 'react';
import { createFadeVariants, DISTANCE, TIMING } from './variants';

// ============================================================================
// StaggerItem Component
// ============================================================================
// A child component designed to be used within StaggerContainer.
// Each StaggerItem will animate in sequence based on the parent's stagger timing.
//
// Usage:
//   <StaggerContainer>
//     <StaggerItem>First item</StaggerItem>
//     <StaggerItem direction="left">Slides from left</StaggerItem>
//     <StaggerItem>Third item</StaggerItem>
//   </StaggerContainer>

type Direction = 'up' | 'down' | 'left' | 'right' | 'none';

interface StaggerItemProps {
  children: ReactNode;
  // Animation direction - which way element travels FROM
  direction?: Direction;
  // Distance to travel (pixels)
  distance?: number;
  // Animation duration (seconds)
  duration?: number;
  // Additional CSS classes
  className?: string;
  // HTML element to render as
  as?: keyof JSX.IntrinsicElements;
}

export function StaggerItem({
  children,
  direction = 'up',
  distance,
  duration = TIMING.duration.normal,
  className = '',
  as = 'div',
}: StaggerItemProps) {
  const prefersReducedMotion = useFramerReducedMotion();

  // Determine distance based on device
  const effectiveDistance = useMemo(() => {
    if (distance !== undefined) return distance;

    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      return DISTANCE.mobile.normal;
    }
    return DISTANCE.desktop.normal;
  }, [distance]);

  const variants = useMemo(
    () => createFadeVariants(direction, effectiveDistance, prefersReducedMotion ?? false),
    [direction, effectiveDistance, prefersReducedMotion]
  );

  const effectiveDuration = prefersReducedMotion
    ? TIMING.duration.fast
    : duration;

  // Create the motion component dynamically based on 'as' prop
  const MotionComponent = motion[as as keyof typeof motion] as typeof motion.div;

  return (
    <MotionComponent
      variants={variants}
      transition={{
        duration: effectiveDuration,
        ease: TIMING.ease.default,
      }}
      className={className}
    >
      {children}
    </MotionComponent>
  );
}
