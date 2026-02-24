// ============================================================================
// DeviceShowcase — Main orchestrator
// ============================================================================
// What: Composes all device frames into a responsive, draggable showcase
// Why: Central controller for layout modes, drag state, URL management,
//      and the pixel-accurate "half in, half out" overlap positioning
// How: DndContext wraps everything. Monitor ref is measured via ResizeObserver
//      to compute absolute positions for tablet/phone overlap. Drag deltas
//      accumulate on top of those base positions.

'use client';

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { DndContext, useSensor, useSensors, PointerSensor } from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import { motion } from 'framer-motion';

import {
  DEVICES,
  DEFAULT_POSITIONS,
  SHOWCASE_PHASES,
  type LayoutMode,
  type DevicePosition,
} from './device-config';
import ScaledIframe from './ScaledIframe';
import MonitorFrame from './MonitorFrame';
import TabletFrame from './TabletFrame';
import PhoneFrame from './PhoneFrame';
import DeviceFrame, { snapToCenterModifier } from './DeviceFrame';
import ShowcaseControls from './ShowcaseControls';

const desktop = DEVICES[0];
const tablet = DEVICES[1];
const phone = DEVICES[2];

// Entrance animation variants (staggered per device)
const deviceVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0 },
};

export default function DeviceShowcase() {
  // ── URL state ──
  const [url, setUrl] = useState('http://localhost:3000');
  const [loadedUrl, setLoadedUrl] = useState('http://localhost:3000');

  // ── Layout mode ──
  const [layoutMode, setLayoutMode] = useState<LayoutMode>('grouped');

  // ── Drag positions (deltas from base) ──
  const [positions, setPositions] = useState<Record<string, DevicePosition>>(
    () => structuredClone(DEFAULT_POSITIONS)
  );

  // ── Active drag ──
  const [activeId, setActiveId] = useState<string | null>(null);

  // ── Monitor measurements ──
  const monitorRef = useRef<HTMLDivElement>(null);
  const showcaseRef = useRef<HTMLDivElement>(null);
  const [monitorRect, setMonitorRect] = useState<{
    offsetLeft: number;
    offsetTop: number;
    width: number;
    height: number;
  } | null>(null);

  // Measure monitor position relative to showcase container
  const measureMonitor = useCallback(() => {
    if (!monitorRef.current || !showcaseRef.current) return;
    const monitor = monitorRef.current;
    const showcase = showcaseRef.current;

    // offsetLeft/offsetTop are relative to offsetParent, which should be
    // the showcase container (position: relative)
    const monitorBounds = monitor.getBoundingClientRect();
    const showcaseBounds = showcase.getBoundingClientRect();

    setMonitorRect({
      offsetLeft: monitorBounds.left - showcaseBounds.left,
      offsetTop: monitorBounds.top - showcaseBounds.top,
      width: monitorBounds.width,
      height: monitorBounds.height,
    });
  }, []);

  useEffect(() => {
    measureMonitor();
    const observer = new ResizeObserver(() => measureMonitor());
    if (showcaseRef.current) observer.observe(showcaseRef.current);
    if (monitorRef.current) observer.observe(monitorRef.current);
    return () => observer.disconnect();
  }, [measureMonitor, layoutMode]);

  // ── DnD sensors ──
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  // ── Handlers ──
  const handleLoad = useCallback(() => {
    setLoadedUrl(url);
  }, [url]);

  const handleReset = useCallback(() => {
    setPositions(structuredClone(DEFAULT_POSITIONS));
  }, []);

  const handleDragStart = useCallback((event: { active: { id: string | number } }) => {
    setActiveId(String(event.active.id));
  }, []);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    setActiveId(null);
    const { active, delta } = event;
    const id = String(active.id);
    setPositions((prev) => ({
      ...prev,
      [id]: {
        x: (prev[id]?.x ?? 0) + delta.x,
        y: (prev[id]?.y ?? 0) + delta.y,
      },
    }));
  }, []);

  const handleDragCancel = useCallback(() => {
    setActiveId(null);
  }, []);

  // ── Computed positions for grouped layout ──
  // Aligns devices by their CONTENT centers (not frame centers) so the actual
  // webpage viewports line up across monitor, tablet, and phone.
  const computedPositions = useMemo(() => {
    if (!monitorRect || layoutMode !== 'grouped') return null;

    const monitorDisplayWidth = monitorRect.width;
    const tabletDisplayWidth = monitorDisplayWidth * 0.32;
    const tabletDisplayHeight = tabletDisplayWidth * (1180 / 820);
    const phoneDisplayWidth = monitorDisplayWidth * 0.19;
    const phoneDisplayHeight = phoneDisplayWidth * (852 / 393);

    // Monitor content center: 8px top bezel + half of screen area
    // Screen area = monitorRect.height - 30 (8px top + 22px chin)
    const monitorContentCenterY =
      monitorRect.offsetTop + 8 + (monitorRect.height - 30) / 2;

    // Tablet is symmetric (7px bezel each side) → content center = height / 2
    const tabletBaseTop = monitorContentCenterY - tabletDisplayHeight / 2;

    // Phone: 5px bezel + screen. Screen = phoneDisplayHeight - 10.
    // Content center within screen is at 50.5% (8% top chrome > 7% bottom)
    const phoneBaseTop =
      monitorContentCenterY - (5 + (phoneDisplayHeight - 10) * 0.505);

    return {
      tablet: {
        baseLeft: monitorRect.offsetLeft - tabletDisplayWidth / 2,
        baseTop: tabletBaseTop,
        width: tabletDisplayWidth,
        height: tabletDisplayHeight,
      },
      phone: {
        baseLeft: monitorRect.offsetLeft + monitorRect.width - phoneDisplayWidth / 2,
        baseTop: phoneBaseTop,
        width: phoneDisplayWidth,
        height: phoneDisplayHeight,
      },
    };
  }, [monitorRect, layoutMode]);

  const isSomethingDragging = activeId !== null;

  return (
    <div>
      <ShowcaseControls
        url={url}
        onUrlChange={setUrl}
        onLoad={handleLoad}
        layoutMode={layoutMode}
        onLayoutChange={setLayoutMode}
        positions={positions}
        onReset={handleReset}
      />

      <DndContext
        sensors={sensors}
        modifiers={[snapToCenterModifier]}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        {layoutMode === 'grouped' ? (
          <GroupedLayout
            ref={showcaseRef}
            monitorRef={monitorRef}
            loadedUrl={loadedUrl}
            positions={positions}
            computedPositions={computedPositions}
            activeId={activeId}
            isSomethingDragging={isSomethingDragging}
          />
        ) : layoutMode === 'showcase' ? (
          <ShowcaseLayout loadedUrl={loadedUrl} />
        ) : (
          <SpreadLayout loadedUrl={loadedUrl} />
        )}
      </DndContext>
    </div>
  );
}

// ============================================================================
// Grouped Layout — overlapping composition
// ============================================================================

import { forwardRef } from 'react';

interface GroupedLayoutProps {
  monitorRef: React.RefObject<HTMLDivElement | null>;
  loadedUrl: string;
  positions: Record<string, DevicePosition>;
  computedPositions: {
    tablet: { baseLeft: number; baseTop: number; width: number; height: number };
    phone: { baseLeft: number; baseTop: number; width: number; height: number };
  } | null;
  activeId: string | null;
  isSomethingDragging: boolean;
}

const GroupedLayout = forwardRef<HTMLDivElement, GroupedLayoutProps>(
  function GroupedLayout(
    { monitorRef, loadedUrl, positions, computedPositions, activeId, isSomethingDragging },
    ref
  ) {
    return (
      <div
        ref={ref}
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: 1100,
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'center',
          paddingBottom: 20,
          minHeight: 500,
        }}
      >
        {/* Monitor — center, not draggable */}
        <motion.div
          variants={deviceVariants}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          style={{
            position: 'relative',
            zIndex: 1,
            width: 'min(680px, 55vw)',
            flexShrink: 0,
          }}
        >
          <MonitorFrame ref={monitorRef as React.RefObject<HTMLDivElement>}>
            <ScaledIframe
              url={loadedUrl}
              nativeWidth={desktop.nativeWidth}
              nativeHeight={desktop.nativeHeight}
            />
          </MonitorFrame>
        </motion.div>

        {/* Tablet — absolute, positioned at monitor's left bezel */}
        {computedPositions && (
          <motion.div
            variants={deviceVariants}
            initial="hidden"
            animate="visible"
            transition={{ duration: 0.7, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
          >
            <DeviceFrame
              device={tablet}
              isDragging={activeId === 'tablet'}
              isSomethingDragging={isSomethingDragging}
              style={{
                position: 'absolute',
                zIndex: 2,
                width: computedPositions.tablet.width,
                left: computedPositions.tablet.baseLeft + (positions.tablet?.x ?? 0),
                top: computedPositions.tablet.baseTop + (positions.tablet?.y ?? 0),
                pointerEvents: 'auto',
              }}
            >
              <TabletFrame>
                <ScaledIframe
                  url={loadedUrl}
                  nativeWidth={tablet.nativeWidth}
                  nativeHeight={tablet.nativeHeight}
                />
              </TabletFrame>
            </DeviceFrame>
          </motion.div>
        )}

        {/* Phone — absolute, positioned at monitor's right bezel */}
        {computedPositions && (
          <motion.div
            variants={deviceVariants}
            initial="hidden"
            animate="visible"
            transition={{ duration: 0.7, delay: 0.55, ease: [0.22, 1, 0.36, 1] }}
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
          >
            <DeviceFrame
              device={phone}
              isDragging={activeId === 'phone'}
              isSomethingDragging={isSomethingDragging}
              style={{
                position: 'absolute',
                zIndex: 3,
                width: computedPositions.phone.width,
                left: computedPositions.phone.baseLeft + (positions.phone?.x ?? 0),
                top: computedPositions.phone.baseTop + (positions.phone?.y ?? 0),
                pointerEvents: 'auto',
              }}
            >
              <PhoneFrame>
                <ScaledIframe
                  url={loadedUrl}
                  nativeWidth={phone.nativeWidth}
                  nativeHeight={phone.nativeHeight}
                />
              </PhoneFrame>
            </DeviceFrame>
          </motion.div>
        )}

      </div>
    );
  }
);

// ============================================================================
// Spread Layout — side by side, no overlap
// ============================================================================

function SpreadLayout({ loadedUrl }: { loadedUrl: string }) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-end',
        gap: 40,
        paddingBottom: 20,
        maxWidth: 1100,
        margin: '0 auto',
      }}
    >
      {/* Desktop */}
      <motion.div
        variants={deviceVariants}
        initial="hidden"
        animate="visible"
        transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        style={{ width: 'min(650px, 52vw)', flexShrink: 0 }}
      >
        <DeviceLabel label="Desktop" resolution={desktop.resolution} />
        <MonitorFrame>
          <ScaledIframe
            url={loadedUrl}
            nativeWidth={desktop.nativeWidth}
            nativeHeight={desktop.nativeHeight}
          />
        </MonitorFrame>
      </motion.div>

      {/* Tablet */}
      <motion.div
        variants={deviceVariants}
        initial="hidden"
        animate="visible"
        transition={{ duration: 0.7, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
        style={{ width: 'min(240px, 20vw)', flexShrink: 0 }}
      >
        <DeviceLabel label="Tablet" resolution={tablet.resolution} />
        <TabletFrame>
          <ScaledIframe
            url={loadedUrl}
            nativeWidth={tablet.nativeWidth}
            nativeHeight={tablet.nativeHeight}
          />
        </TabletFrame>
      </motion.div>

      {/* Phone */}
      <motion.div
        variants={deviceVariants}
        initial="hidden"
        animate="visible"
        transition={{ duration: 0.7, delay: 0.55, ease: [0.22, 1, 0.36, 1] }}
        style={{ width: 'min(140px, 12vw)', flexShrink: 0 }}
      >
        <DeviceLabel label="Phone" resolution={phone.resolution} />
        <PhoneFrame>
          <ScaledIframe
            url={loadedUrl}
            nativeWidth={phone.nativeWidth}
            nativeHeight={phone.nativeHeight}
          />
        </PhoneFrame>
      </motion.div>
    </div>
  );
}

// ============================================================================
// Showcase Layout — equal-screen height, each device at different hero phase
// ============================================================================
// All three iframe screen areas are the same height (V=350px). Frame heights
// differ because each device has different bezel amounts (monitor=380, tablet=364,
// phone=360). Visual order: Tablet → Monitor → Phone (left to right).
//
// Given target screen height V:
//   Monitor: width = V × (1512/982) + 16, frame height = V + 30
//   Tablet:  width = V × (820/1180) + 14, frame height = V + 14
//   Phone:   width = V × (393/852) + 10, frame height = V + 10

function ShowcaseLayout({ loadedUrl }: { loadedUrl: string }) {
  const dimensions = useMemo(() => {
    // Target: all three devices show V pixels of screen content inside their bezels.
    // Frame heights will differ slightly (thicker bezel = taller frame), which is fine.
    const V = 350; // screen height in pixels

    // Each formula: screenWidth = V × (nativeW / nativeH), outerWidth = screenWidth + bezel
    const monitorWidth = V * (1512 / 982) + 16;  // +16 for 8px padding L+R
    const tabletWidth = V * (820 / 1180) + 14;   // +14 for 7px padding L+R
    const phoneWidth = V * (393 / 852) + 10;     // +10 for 5px padding L+R

    return {
      monitor: { width: monitorWidth },
      tablet: { width: tabletWidth },
      phone: { width: phoneWidth },
    };
  }, []);

  // Build per-device URLs with heroPhase query param
  const deviceUrls = useMemo(() => {
    const base = loadedUrl.replace(/[?#].*$/, ''); // strip existing params
    const separator = '?';
    return SHOWCASE_PHASES.map((p) => `${base}${separator}heroPhase=${p.phase}`);
  }, [loadedUrl]);

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
        gap: 32,
        paddingBottom: 20,
        maxWidth: 1100,
        margin: '0 auto',
      }}
    >
      {/* Tablet — phase 0 (left) */}
      <motion.div
        variants={deviceVariants}
        initial="hidden"
        animate="visible"
        transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        style={{ width: dimensions.tablet.width, flexShrink: 0 }}
      >
        <DeviceLabel label={SHOWCASE_PHASES[0].label} resolution={tablet.resolution} />
        <TabletFrame>
          <ScaledIframe
            url={deviceUrls[0]}
            nativeWidth={tablet.nativeWidth}
            nativeHeight={tablet.nativeHeight}
          />
        </TabletFrame>
      </motion.div>

      {/* Desktop — phase 1 (center) */}
      <motion.div
        variants={deviceVariants}
        initial="hidden"
        animate="visible"
        transition={{ duration: 0.7, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
        style={{ width: dimensions.monitor.width, flexShrink: 0 }}
      >
        <DeviceLabel label={SHOWCASE_PHASES[1].label} resolution={desktop.resolution} />
        <MonitorFrame>
          <ScaledIframe
            url={deviceUrls[1]}
            nativeWidth={desktop.nativeWidth}
            nativeHeight={desktop.nativeHeight}
          />
        </MonitorFrame>
      </motion.div>

      {/* Phone — phase 2 (right) */}
      <motion.div
        variants={deviceVariants}
        initial="hidden"
        animate="visible"
        transition={{ duration: 0.7, delay: 0.55, ease: [0.22, 1, 0.36, 1] }}
        style={{ width: dimensions.phone.width, flexShrink: 0 }}
      >
        <DeviceLabel label={SHOWCASE_PHASES[2].label} resolution={phone.resolution} />
        <PhoneFrame>
          <ScaledIframe
            url={deviceUrls[2]}
            nativeWidth={phone.nativeWidth}
            nativeHeight={phone.nativeHeight}
          />
        </PhoneFrame>
      </motion.div>
    </div>
  );
}

function DeviceLabel({ label, resolution }: { label: string; resolution: string }) {
  return (
    <div
      style={{
        textAlign: 'center',
        marginBottom: 12,
        fontSize: '0.7rem',
        fontWeight: 500,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        color: '#565a6e',
      }}
    >
      {label}{' '}
      <span
        style={{
          color: '#8b8fa3',
          fontWeight: 300,
          letterSpacing: 'normal',
          textTransform: 'none',
          marginLeft: 4,
          fontSize: '0.65rem',
        }}
      >
        {resolution}
      </span>
    </div>
  );
}
