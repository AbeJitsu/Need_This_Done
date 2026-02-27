'use client';

import { motion } from 'framer-motion';
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
 * The device frame renders immediately with a static snapshot placeholder.
 * The live iframe loads in the background and silently replaces the image
 * via a crossfade once ready — the user never notices the swap.
 */
export function HeroDevice({ side, screenHeightOverride, offsetY }: HeroDeviceProps) {
  const isTablet = side === 'left';
  const phase = isTablet ? 0 : 2;
  const url = `/?heroPhase=${phase}&heroPreview=true`;

  // Both devices: 453 + 10 (bezel) = 463px total
  const defaultHeight = 453;
  const screenHeight = screenHeightOverride ?? defaultHeight;

  // BJJ belt color glow: emerald for tablet (left), purple for phone (right)
  const hoverGlow = isTablet
    ? '0 0 20px rgba(52,211,153,0.15)'
    : '0 0 20px rgba(147,51,234,0.15)';

  return (
    <motion.div
      data-hero-device={side}
      className="hidden xl:flex xl:h-[65vh] xl:flex-col xl:justify-center xl:items-center"
      initial={{ opacity: 0, x: isTablet ? -60 : 60 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
    >
      <motion.div
        whileHover={{ scale: 1.015, boxShadow: hoverGlow }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        style={{
          borderRadius: 20,
          ...(offsetY != null ? { transform: `translateY(${offsetY}px)` } : undefined),
        }}
      >
        <DeviceMockup
          device={isTablet ? 'tablet' : 'phone'}
          url={url}
          screenHeight={screenHeight}
          placeholderSrc={isTablet
            ? '/device-previews/hero-tablet.png'
            : '/device-previews/hero-phone.png'
          }
        />
      </motion.div>
    </motion.div>
  );
}
