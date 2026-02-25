'use client';

import { motion } from 'framer-motion';
import DeviceMockup from '@/components/DeviceShowcase/DeviceMockup';

interface HeroDeviceProps {
  side: 'left' | 'right';
}

/**
 * Renders a device mockup (tablet on left, phone on right) with a live
 * iframe preview of the homepage at a different keyword phase.
 *
 * Tablet = phase 0, Phone = phase 2 — the hero center is phase 1,
 * so reading left-to-right the initial keywords are:
 *   Websites -> Automations -> AI Tools
 */
export function HeroDevice({ side }: HeroDeviceProps) {
  const isTablet = side === 'left';
  const phase = isTablet ? 0 : 2;
  const url = `/?heroPhase=${phase}&heroPreview=true`;

  return (
    <motion.div
      className={`hidden xl:flex items-center ${isTablet ? 'justify-end' : 'justify-start'} mt-[calc(32.5vh-8.5rem)]`}
      initial={{ opacity: 0, x: isTablet ? -60 : 60 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{
        duration: 0.8,
        delay: isTablet ? 0.8 : 1.0,
        ease: 'easeOut',
      }}
    >
      <DeviceMockup
        device={isTablet ? 'tablet' : 'phone'}
        url={url}
        screenHeight={350}
      />
    </motion.div>
  );
}
