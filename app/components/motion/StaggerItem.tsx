'use client';

import { motion, useReducedMotion as useFramerReducedMotion } from 'framer-motion';
import { ReactNode, useMemo } from 'react';
import { createFadeVariants, DISTANCE, TIMING, defaultViewport } from './variants';

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
  // For scroll-triggered stagger: index of this item in the sequence
  staggerIndex?: number;
  // For scroll-triggered stagger: delay between items (seconds)
  staggerDelay?: number;
  // Whether to trigger animation on scroll
  triggerOnScroll?: boolean;
  // Only animate once when scrolling into view
  once?: boolean;
}

export function StaggerItem({
  children,
  direction = 'up',
  distance,
  duration = TIMING.duration.normal,
  className = '',
  as = 'div',
  staggerIndex = 0,
  staggerDelay = TIMING.stagger.normal,
  triggerOnScroll = false,
  once = true,
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

  // Calculate delay based on stagger index
  const itemDelay = staggerIndex * staggerDelay;

  // Create the motion component dynamically based on 'as' prop
  const MotionComponent = motion[as as keyof typeof motion] as typeof motion.div;

  const transitionProps = {
    duration: effectiveDuration,
    ease: TIMING.ease.default,
    delay: triggerOnScroll ? itemDelay : 0, // Only apply delay when scroll-triggered
  };

  // Individual scroll trigger - each card animates when it comes into view
  if (triggerOnScroll) {
    return (
      <MotionComponent
        variants={variants}
        initial="hidden"
        whileInView="visible"
        viewport={{ ...defaultViewport, once }}
        transition={transitionProps}
        className={className}
      >
        {children}
      </MotionComponent>
    );
  }

  // Container-controlled animation (from parent StaggerContainer)
  return (
    <MotionComponent
      variants={variants}
      transition={transitionProps}
      className={className}
    >
      {children}
    </MotionComponent>
  );
}
