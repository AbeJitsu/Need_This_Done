'use client';

// ============================================================================
// ResizableWrapper - Drag handles for resizing elements
// ============================================================================
// What: Wrapper that adds Figma-style drag handles to any element
// Why: Allow admins to resize sections, cards, and text blocks visually
// How: Uses re-resizable library with custom handle styling

import { useState, useCallback, ReactNode } from 'react';
import { Resizable, Enable } from 're-resizable';
import { useInlineEdit } from '@/context/InlineEditContext';

// ============================================================================
// Types
// ============================================================================

interface ResizableWrapperProps {
  /** Content to wrap */
  children: ReactNode;
  /** Section key for storing dimensions */
  sectionKey: string;
  /** Field path for the dimensions (e.g., "styles.width") */
  fieldPath?: string;
  /** Initial width (percentage or pixels) */
  initialWidth?: string | number;
  /** Initial height (auto or pixels) */
  initialHeight?: string | number;
  /** Minimum width */
  minWidth?: number;
  /** Maximum width */
  maxWidth?: number;
  /** Minimum height */
  minHeight?: number;
  /** Which handles to show */
  enabledHandles?: Enable;
  /** Additional class name */
  className?: string;
  /** Whether to allow height resizing */
  resizeHeight?: boolean;
}

// ============================================================================
// Handle Styles
// ============================================================================

// Custom handle component that shows blue dots
const HandleComponent = ({ position }: { position: string }) => (
  <div
    className={`
      absolute w-3 h-3 bg-blue-500 rounded-full border-2 border-white shadow-md
      opacity-0 group-hover:opacity-100 transition-opacity cursor-${getCursor(position)}
      z-10
    `}
    style={getHandlePosition(position)}
  />
);

// Get cursor based on handle position
function getCursor(position: string): string {
  const cursors: Record<string, string> = {
    topLeft: 'nwse-resize',
    top: 'ns-resize',
    topRight: 'nesw-resize',
    right: 'ew-resize',
    bottomRight: 'nwse-resize',
    bottom: 'ns-resize',
    bottomLeft: 'nesw-resize',
    left: 'ew-resize',
  };
  return cursors[position] || 'pointer';
}

// Get position styles for handle
function getHandlePosition(position: string): React.CSSProperties {
  const positions: Record<string, React.CSSProperties> = {
    topLeft: { top: -6, left: -6 },
    top: { top: -6, left: '50%', transform: 'translateX(-50%)' },
    topRight: { top: -6, right: -6 },
    right: { top: '50%', right: -6, transform: 'translateY(-50%)' },
    bottomRight: { bottom: -6, right: -6 },
    bottom: { bottom: -6, left: '50%', transform: 'translateX(-50%)' },
    bottomLeft: { bottom: -6, left: -6 },
    left: { top: '50%', left: -6, transform: 'translateY(-50%)' },
  };
  return positions[position] || {};
}

// ============================================================================
// Main Component
// ============================================================================

export default function ResizableWrapper({
  children,
  sectionKey,
  fieldPath = 'styles',
  initialWidth = '100%',
  initialHeight = 'auto',
  minWidth = 200,
  maxWidth,
  minHeight = 50,
  enabledHandles,
  className = '',
  resizeHeight = false,
}: ResizableWrapperProps) {
  const { isEditMode, updateField } = useInlineEdit();

  // Track current size
  const [size, setSize] = useState({
    width: initialWidth,
    height: initialHeight,
  });

  // Default enabled handles - all edges and corners for full control
  const defaultHandles: Enable = {
    top: false,
    right: true,
    bottom: resizeHeight,
    left: true,
    topRight: false,
    bottomRight: resizeHeight,
    bottomLeft: resizeHeight,
    topLeft: false,
  };

  const handles = enabledHandles || defaultHandles;

  // Handle resize stop - save dimensions
  const handleResizeStop = useCallback(
    (
      _e: MouseEvent | TouchEvent,
      _direction: string,
      ref: HTMLElement,
      delta: { width: number; height: number }
    ) => {
      const newWidth = ref.style.width;
      const newHeight = ref.style.height;

      setSize({
        width: newWidth,
        height: newHeight,
      });

      // Save to content (only if dimensions actually changed)
      if (delta.width !== 0 || delta.height !== 0) {
        updateField(sectionKey, `${fieldPath}.width`, newWidth);
        if (resizeHeight) {
          updateField(sectionKey, `${fieldPath}.height`, newHeight);
        }
      }
    },
    [sectionKey, fieldPath, updateField, resizeHeight]
  );

  // If not in edit mode, just render children with current size
  if (!isEditMode) {
    return (
      <div
        style={{
          width: size.width,
          height: size.height === 'auto' ? undefined : size.height,
        }}
        className={className}
      >
        {children}
      </div>
    );
  }

  // In edit mode, render with resizable wrapper
  return (
    <Resizable
      size={{
        width: size.width,
        height: size.height === 'auto' ? undefined : size.height,
      }}
      minWidth={minWidth}
      maxWidth={maxWidth}
      minHeight={minHeight}
      enable={handles}
      onResizeStop={handleResizeStop}
      className={`group relative ${className}`}
      handleStyles={{
        top: { cursor: 'ns-resize' },
        right: { cursor: 'ew-resize' },
        bottom: { cursor: 'ns-resize' },
        left: { cursor: 'ew-resize' },
        topRight: { cursor: 'nesw-resize' },
        bottomRight: { cursor: 'nwse-resize' },
        bottomLeft: { cursor: 'nesw-resize' },
        topLeft: { cursor: 'nwse-resize' },
      }}
      handleComponent={{
        right: <HandleComponent position="right" />,
        left: <HandleComponent position="left" />,
        bottom: resizeHeight ? <HandleComponent position="bottom" /> : undefined,
        bottomRight: resizeHeight ? <HandleComponent position="bottomRight" /> : undefined,
        bottomLeft: resizeHeight ? <HandleComponent position="bottomLeft" /> : undefined,
      }}
    >
      {/* Resize indicator border */}
      <div className="absolute inset-0 border-2 border-transparent group-hover:border-blue-400 group-hover:border-dashed rounded-lg pointer-events-none transition-colors" />

      {children}
    </Resizable>
  );
}

// ============================================================================
// Width Presets Helper
// ============================================================================
// Common width presets that snap during resize

export const WIDTH_PRESETS = {
  narrow: '512px',    // max-w-lg
  medium: '672px',    // max-w-2xl
  wide: '896px',      // max-w-4xl
  full: '100%',       // full width
} as const;

export type WidthPreset = keyof typeof WIDTH_PRESETS;

/**
 * Convert a width preset name to actual value
 */
export function getPresetWidth(preset: WidthPreset | string): string {
  return WIDTH_PRESETS[preset as WidthPreset] || preset;
}
