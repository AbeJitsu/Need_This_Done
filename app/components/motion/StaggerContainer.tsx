'use client';

import { motion } from 'framer-motion';
import { ReactNode, useMemo, Children, cloneElement, isValidElement } from 'react';
import {
  createStaggerContainerVariants,
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

  // When using individual scroll triggers, pass stagger info to each child
  const enhancedChildren = useMemo(() => {
    if (!triggerOnScroll) return children;

    return Children.map(children, (child, index) => {
      if (isValidElement(child)) {
        return cloneElement(child, {
          staggerIndex: index,
          staggerDelay,
          triggerOnScroll: true,
          once,
        } as any);
      }
      return child;
    });
  }, [children, triggerOnScroll, staggerDelay, once]);

  const motionProps = {
    initial: 'hidden',
    variants,
    className,
  };

  // Individual scroll-triggered animation (each child animates when it enters view)
  if (triggerOnScroll) {
    return (
      <MotionComponent
        {...motionProps}
        animate="visible"
        className={className}
      >
        {enhancedChildren}
      </MotionComponent>
    );
  }

  // Immediate animation with container-controlled stagger (on mount)
  return (
    <MotionComponent {...motionProps} animate="visible">
      {children}
    </MotionComponent>
  );
}
