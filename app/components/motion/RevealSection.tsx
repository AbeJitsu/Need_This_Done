'use client';

import { motion, useReducedMotion as useFramerReducedMotion } from 'framer-motion';
import { ReactNode, useMemo } from 'react';
import { fadeVariants, defaultViewport, TIMING } from './variants';

// ============================================================================
// RevealSection Component
// ============================================================================
// A simple wrapper that fades in a section when it scrolls into view.
// Best for wrapping entire sections or content blocks.
// Uses fade-only animation (no directional movement) for a clean reveal.
//
// Usage:
//   <RevealSection>
//     <section className="py-16">
//       <h2>Section Title</h2>
//       <p>Content here...</p>
//     </section>
//   </RevealSection>

interface RevealSectionProps {
  children: ReactNode;
  // How much of the element should be visible before triggering (0-1)
  threshold?: number;
  // Margin around viewport for triggering
  margin?: string;
  // Only animate once
  once?: boolean;
  // Delay before animation starts (seconds)
  delay?: number;
  // Additional CSS classes
  className?: string;
  // HTML element to render as
  as?: keyof JSX.IntrinsicElements;
}

export function RevealSection({
  children,
  threshold = 0.2,
  margin = '-50px',
  once = true,
  delay = 0,
  className = '',
  as = 'div',
}: RevealSectionProps) {
  const prefersReducedMotion = useFramerReducedMotion();

  const effectiveDuration = prefersReducedMotion
    ? TIMING.duration.fast
    : TIMING.duration.normal;

  // Create the motion component dynamically based on 'as' prop
  const MotionComponent = motion[as as keyof typeof motion] as typeof motion.div;

  // Use the same viewport config but allow overrides
  const viewport = useMemo(
    () => ({
      ...defaultViewport,
      once,
      margin,
      amount: threshold,
    }),
    [once, margin, threshold]
  );

  return (
    <MotionComponent
      initial="hidden"
      whileInView="visible"
      viewport={viewport}
      variants={fadeVariants}
      transition={{
        duration: effectiveDuration,
        ease: TIMING.ease.default,
        delay,
      }}
      className={className}
    >
      {children}
    </MotionComponent>
  );
}
