'use client';

import { motion } from 'framer-motion';
import { ReactNode, useMemo } from 'react';
import {
  createStaggerContainerVariants,
  defaultViewport,
  TIMING,
} from './variants';

// ============================================================================
// StaggerContainer Component
// ============================================================================
// A container that staggers its children's animations.
// Children should use StaggerItem for the stagger effect to work.
//
// Usage:
//   <StaggerContainer>
//     <StaggerItem>First (appears first)</StaggerItem>
//     <StaggerItem>Second (appears 0.08s later)</StaggerItem>
//     <StaggerItem>Third (appears 0.16s later)</StaggerItem>
//   </StaggerContainer>

interface StaggerContainerProps {
  children: ReactNode;
  // Time between each child's animation (seconds)
  staggerDelay?: number;
  // Initial delay before first child animates (seconds)
  delayStart?: number;
  // Whether to trigger on scroll (true) or immediately on mount (false)
  triggerOnScroll?: boolean;
  // Only animate once when scrolling into view
  once?: boolean;
  // Additional CSS classes
  className?: string;
  // HTML element to render as
  as?: keyof JSX.IntrinsicElements;
}

export function StaggerContainer({
  children,
  staggerDelay = TIMING.stagger.normal,
  delayStart = 0,
  triggerOnScroll = true,
  once = true,
  className = '',
  as = 'div',
}: StaggerContainerProps) {
  const variants = useMemo(
    () => createStaggerContainerVariants(staggerDelay, delayStart),
    [staggerDelay, delayStart]
  );

  // Create the motion component dynamically based on 'as' prop
  const MotionComponent = motion[as as keyof typeof motion] as typeof motion.div;

  const motionProps = {
    initial: 'hidden',
    variants,
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
