'use client';

import { useCallback } from 'react';
import { motion, useAnimationControls } from 'framer-motion';
import DeviceMockup from '@/components/DeviceShowcase/DeviceMockup';

interface HeroDeviceProps {
  side: 'left' | 'right';
  /** Dev-only: override screenHeight from layout debug tool */
  screenHeightOverride?: number;
  /** Dev-only: vertical offset in px from baseline position */
  offsetY?: number;
}

/**
 * Renders a device mockup (tablet on left, phone on right) with a live
 * iframe preview of the homepage at a different keyword phase.
 *
 * Tablet = phase 0, Phone = phase 2 — the hero center is phase 1,
 * so reading left-to-right the initial keywords are:
 *   Websites -> Automations -> AI Tools
 *
 * The device stays invisible until the iframe content has loaded (or the
 * 8-second fallback fires), then fades in from the side.
 */
export function HeroDevice({ side, screenHeightOverride, offsetY }: HeroDeviceProps) {
  const isTablet = side === 'left';
  const phase = isTablet ? 0 : 2;
  const url = `/?heroPhase=${phase}&heroPreview=true`;

  const controls = useAnimationControls();

  const handleLoad = useCallback(() => {
    controls.start({
      opacity: 1,
      x: 0,
      transition: { duration: 0.8, ease: 'easeOut' },
    });
  }, [controls]);

  // Both devices: 453 + 10 (bezel) = 463px total
  const defaultHeight = 453;
  const screenHeight = screenHeightOverride ?? defaultHeight;

  return (
    <motion.div
      data-hero-device={side}
      className="hidden xl:flex xl:h-[65vh] xl:flex-col xl:justify-center xl:items-center"
      initial={{ opacity: 0, x: isTablet ? -60 : 60 }}
      animate={controls}
    >
      <div style={offsetY != null ? { transform: `translateY(${offsetY}px)` } : undefined}>
        <DeviceMockup
          device={isTablet ? 'tablet' : 'phone'}
          url={url}
          screenHeight={screenHeight}
          onLoad={handleLoad}
        />
      </div>
    </motion.div>
  );
}
