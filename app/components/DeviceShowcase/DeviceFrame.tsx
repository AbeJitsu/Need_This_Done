// ============================================================================
// DeviceFrame — Draggable wrapper with snap-to-center
// ============================================================================
// What: Wraps a device frame component with @dnd-kit drag behavior
// Why: Tablet and phone should be repositionable with a satisfying snap
// How: useDraggable from @dnd-kit, positioned absolutely within the showcase
//      container, visual feedback during drag (scale bump, cursor, z-index)

'use client';

import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import type { DeviceConfig } from './device-config';

interface DeviceFrameProps {
  device: DeviceConfig;
  children: React.ReactNode;
  style?: React.CSSProperties;
  isDragging: boolean;
  isSomethingDragging: boolean;
}

export default function DeviceFrame({
  device,
  children,
  style,
  isDragging,
  isSomethingDragging,
}: DeviceFrameProps) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: device.id,
    disabled: !device.isDraggable,
  });

  const dragTransform = transform ? CSS.Translate.toString(transform) : undefined;

  return (
    <div
      ref={setNodeRef}
      {...(device.isDraggable ? { ...listeners, ...attributes } : {})}
      style={{
        ...style,
        // Apply drag transform on top of positioned style
        transform: [style?.transform, dragTransform].filter(Boolean).join(' ') || undefined,
        // Visual feedback while dragging
        cursor: device.isDraggable
          ? isDragging ? 'grabbing' : 'grab'
          : 'default',
        scale: isDragging ? '1.02' : '1',
        zIndex: isDragging ? 50 : (style?.zIndex ?? 'auto'),
        transition: isDragging
          ? 'scale 0.15s ease'
          : 'scale 0.15s ease, left 0.5s cubic-bezier(0.22, 1, 0.36, 1), top 0.5s cubic-bezier(0.22, 1, 0.36, 1)',
        // Block iframe pointer events during any drag so the drag doesn't get eaten
        pointerEvents: isSomethingDragging && !isDragging ? 'none' : 'auto',
      }}
    >
      {/* Disable iframe interaction during drag */}
      {isSomethingDragging && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 100,
            cursor: isDragging ? 'grabbing' : 'grab',
          }}
        />
      )}
      {children}
    </div>
  );
}

// ============================================================================
// Snap-to-center modifier for DndContext
// ============================================================================
// Intercepts the drag transform on every frame. When the dragging element's
// center is within SNAP_THRESHOLD px of the container center, it snaps to
// that axis. Horizontal and vertical snap independently.

import type { Modifier } from '@dnd-kit/core';

const SNAP_THRESHOLD = 20;

export const snapToCenterModifier: Modifier = ({
  containerNodeRect,
  draggingNodeRect,
  transform,
}) => {
  if (!containerNodeRect || !draggingNodeRect) return transform;

  const cx = containerNodeRect.width / 2;
  const cy = containerNodeRect.height / 2;

  // Where the element's center will be after this transform
  const elCenterX =
    draggingNodeRect.left -
    containerNodeRect.left +
    draggingNodeRect.width / 2 +
    transform.x;
  const elCenterY =
    draggingNodeRect.top -
    containerNodeRect.top +
    draggingNodeRect.height / 2 +
    transform.y;

  return {
    ...transform,
    x:
      Math.abs(elCenterX - cx) < SNAP_THRESHOLD
        ? transform.x + (cx - elCenterX)
        : transform.x,
    y:
      Math.abs(elCenterY - cy) < SNAP_THRESHOLD
        ? transform.y + (cy - elCenterY)
        : transform.y,
  };
};
