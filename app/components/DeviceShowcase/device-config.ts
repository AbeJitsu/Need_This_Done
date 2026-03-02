// ============================================================================
// Device Showcase Configuration — Types, dimensions, and defaults
// ============================================================================
// What: Pure data definitions for the device showcase (no React)
// Why: Single source of truth for device specs used across all frame components
// How: Exports typed constants matching real Apple device resolutions

export interface DeviceConfig {
  id: 'desktop' | 'tablet' | 'phone';
  label: string;
  resolution: string;
  nativeWidth: number;
  nativeHeight: number;
  aspectRatio: string;
  isDraggable: boolean;
}

export interface DevicePosition {
  x: number;
  y: number;
}

export type LayoutMode = 'grouped' | 'spread' | 'showcase';

// Showcase mode phases — ordered to match visual layout (Tablet → Monitor → Phone)
// so phases are sequential left-to-right: 0, 1, 2
export const SHOWCASE_PHASES = [
  { label: 'Automations', phase: 0 },  // [0] → Tablet (left)
  { label: 'Websites', phase: 1 },     // [1] → Monitor (center)
  { label: 'AI Tools', phase: 2 },     // [2] → Phone (right)
] as const;

// Native resolutions match real Apple devices:
// Desktop: MacBook Pro 14" (1512x982 viewport at default scaling)
// Tablet: iPad 10th Gen (820x1180)
// Phone: iPhone 17 Pro Max (440x956 full screen, ~860px visible viewport with Chrome chrome)
// Chrome top: status bar (5%) + omnibox (5%) = ~96px
// Visible viewport: 956 - 96 = ~860px
export const DEVICES: DeviceConfig[] = [
  {
    id: 'desktop',
    label: 'Desktop',
    resolution: '1440 × 900',
    nativeWidth: 1512,
    nativeHeight: 982,
    aspectRatio: '1512 / 982',
    isDraggable: false,
  },
  {
    id: 'tablet',
    label: 'Tablet',
    resolution: '768 × 1024',
    nativeWidth: 820,
    nativeHeight: 1180,
    aspectRatio: '820 / 1180',
    isDraggable: true,
  },
  {
    id: 'phone',
    label: 'Phone',
    resolution: '440 × 956',
    nativeWidth: 440,
    nativeHeight: 860,
    aspectRatio: '440 / 956',
    isDraggable: true,
  },
];

// Default positions are zero offsets — grouped layout computes
// absolute positions from the monitor ref, these are drag deltas
export const DEFAULT_POSITIONS: Record<string, DevicePosition> = {
  tablet: { x: 0, y: 0 },
  phone: { x: 0, y: 0 },
};
