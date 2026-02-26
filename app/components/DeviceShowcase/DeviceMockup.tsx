// ============================================================================
// DeviceMockup — Reusable device frame + scaled iframe
// ============================================================================
// What: Renders a device mockup (phone, tablet, or desktop) with a live iframe
// Why: Single component for device rendering — used by hero, showcase, and
//      anywhere else a device preview is needed. Eliminates duplicated sizing
//      math and frame/iframe composition across the codebase.
// How: Looks up device config, picks the correct frame component, computes
//      outer width from a target screen height (V), and renders Frame > ScaledIframe.

'use client';

import { useMemo } from 'react';
import { DEVICES } from './device-config';
import ScaledIframe from './ScaledIframe';
import MonitorFrame from './MonitorFrame';
import TabletFrame from './TabletFrame';
import PhoneFrame from './PhoneFrame';

// Bezel padding (horizontal total) and frame aspect height per device.
// These come from the physical Frame components:
//   Monitor: 8px padding L+R = 16, screen aspect uses 982
//   Tablet:  5px padding all sides = 10, screen aspect uses 1180
//   Phone:   5px padding L+R = 10, frame aspect is 852 (includes Chrome chrome)
//            — differs from nativeHeight (724) because the phone frame renders
//            a simulated iOS status bar + Chrome toolbar around the content.
const FRAME_SPECS = {
  desktop: { bezelPadding: 16, frameAspectHeight: 982 },
  tablet: { bezelPadding: 10, frameAspectHeight: 1180 },
  phone: { bezelPadding: 10, frameAspectHeight: 852 },
} as const;

const FRAMES: Record<string, React.ComponentType<{ children: React.ReactNode }>> = {
  desktop: MonitorFrame,
  tablet: TabletFrame,
  phone: PhoneFrame,
};

interface DeviceMockupProps {
  device: 'phone' | 'tablet' | 'desktop';
  url: string;
  /** Target visible screen-content height in pixels (default: 350) */
  screenHeight?: number;
  className?: string;
  style?: React.CSSProperties;
  /** Called when the iframe content has loaded */
  onLoad?: () => void;
}

export default function DeviceMockup({
  device,
  url,
  screenHeight = 350,
  className,
  style,
  onLoad,
}: DeviceMockupProps) {
  const config = DEVICES.find((d) => d.id === device)!;
  const spec = FRAME_SPECS[device];
  const Frame = FRAMES[device];

  // Width formula from ShowcaseLayout:
  //   screenWidth = V × (nativeW / frameAspectH)
  //   outerWidth  = screenWidth + bezelPadding
  const width = useMemo(
    () => screenHeight * (config.nativeWidth / spec.frameAspectHeight) + spec.bezelPadding,
    [screenHeight, config.nativeWidth, spec.frameAspectHeight, spec.bezelPadding]
  );

  return (
    <div className={className} style={{ width, ...style }}>
      <Frame>
        <ScaledIframe
          url={url}
          nativeWidth={config.nativeWidth}
          nativeHeight={config.nativeHeight}
          onLoad={onLoad}
        />
      </Frame>
    </div>
  );
}
