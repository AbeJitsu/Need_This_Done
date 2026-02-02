'use client';

// ============================================================================
// AlignmentToolbar - Quick alignment controls for selected elements
// ============================================================================
// What: Floating toolbar with left/center/right alignment buttons
// Why: Allow admins to quickly align content within containers
// How: Positioned near selected element, updates alignment in content

import { useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useInlineEdit } from '@/context/InlineEditContext';
import { uiChromeBg, toggleButtonColors } from '@/lib/colors';
import {
  AlignLeftIcon,
  AlignCenterIcon,
  AlignRightIcon,
} from '@/components/editor/EditorIcons';

// ============================================================================
// Types
// ============================================================================

export type Alignment = 'left' | 'center' | 'right';

interface AlignmentToolbarProps {
  /** Current alignment value */
  alignment: Alignment;
  /** Called when alignment changes */
  onChange: (alignment: Alignment) => void;
  /** Position on screen */
  position: { x: number; y: number };
  /** Whether to show the toolbar */
  visible: boolean;
}

// ============================================================================
// Main Component
// ============================================================================

export default function AlignmentToolbar({
  alignment,
  onChange,
  position,
  visible,
}: AlignmentToolbarProps) {
  if (!visible || typeof window === 'undefined') {
    return null;
  }

  return createPortal(
    <div
      className={`
        fixed z-[55] flex items-center gap-1 p-1.5 rounded-lg shadow-lg
        border border-gray-400 dark:border-gray-700
        ${uiChromeBg.toolbar}
        motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2 motion-safe:duration-150
      `}
      style={{
        top: position.y,
        left: position.x,
      }}
      data-admin-ui="true"
    >
      <AlignmentButton
        alignment="left"
        currentAlignment={alignment}
        onClick={() => onChange('left')}
        icon={<AlignLeftIcon />}
        title="Align left"
      />
      <AlignmentButton
        alignment="center"
        currentAlignment={alignment}
        onClick={() => onChange('center')}
        icon={<AlignCenterIcon />}
        title="Align center"
      />
      <AlignmentButton
        alignment="right"
        currentAlignment={alignment}
        onClick={() => onChange('right')}
        icon={<AlignRightIcon />}
        title="Align right"
      />
    </div>,
    document.body
  );
}

// ============================================================================
// Alignment Button
// ============================================================================

interface AlignmentButtonProps {
  alignment: Alignment;
  currentAlignment: Alignment;
  onClick: () => void;
  icon: React.ReactNode;
  title: string;
}

function AlignmentButton({
  alignment,
  currentAlignment,
  onClick,
  icon,
  title,
}: AlignmentButtonProps) {
  const isActive = alignment === currentAlignment;

  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`
        p-1.5 rounded text-sm font-medium transition-colors
        ${isActive
          ? toggleButtonColors.blue.inactive
          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
        }
      `}
    >
      {icon}
    </button>
  );
}

// ============================================================================
// Hook for Alignment State
// ============================================================================

interface UseAlignmentOptions {
  sectionKey: string;
  fieldPath?: string;
  initialAlignment?: Alignment;
}

export function useAlignment({
  sectionKey,
  fieldPath = 'styles.alignment',
  initialAlignment = 'left',
}: UseAlignmentOptions) {
  const { updateField, getFieldValue } = useInlineEdit();

  // Get current alignment from content
  const currentAlignment = (getFieldValue(sectionKey, fieldPath) as Alignment) || initialAlignment;

  // Update alignment
  const setAlignment = useCallback(
    (alignment: Alignment) => {
      updateField(sectionKey, fieldPath, alignment);
    },
    [sectionKey, fieldPath, updateField]
  );

  return {
    alignment: currentAlignment,
    setAlignment,
  };
}

// ============================================================================
// CSS Classes for Alignment
// ============================================================================

/**
 * Get Tailwind classes for text alignment
 */
export function getTextAlignClass(alignment: Alignment): string {
  const classes: Record<Alignment, string> = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  };
  return classes[alignment];
}

/**
 * Get Tailwind classes for flex alignment (for containers)
 */
export function getFlexAlignClass(alignment: Alignment): string {
  const classes: Record<Alignment, string> = {
    left: 'justify-start',
    center: 'justify-center',
    right: 'justify-end',
  };
  return classes[alignment];
}

/**
 * Get margin classes for block alignment
 */
export function getBlockAlignClass(alignment: Alignment): string {
  const classes: Record<Alignment, string> = {
    left: 'mr-auto',
    center: 'mx-auto',
    right: 'ml-auto',
  };
  return classes[alignment];
}
