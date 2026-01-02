'use client';

import React, { useEffect } from 'react';
import { useInlineEdit, type SectionSelection } from '@/context/InlineEditContext';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { DraggableAttributes } from '@dnd-kit/core';
import type { SyntheticListenerMap } from '@dnd-kit/core/dist/hooks/utilities';
import ResizableWrapper from './ResizableWrapper';
import type { Enable } from 're-resizable';

// ============================================================================
// Editable Section - Makes page sections clickable and draggable in edit mode
// ============================================================================
// What: Wraps page sections to make them selectable and reorderable
// Why: Allows admins to click on any section to edit, or drag to reorder
// How: Shows hover outline, highlights selected section, enables drag handles

interface EditableSectionProps {
  sectionKey: string;
  label: string;
  children: React.ReactNode;
  className?: string;
  /** Enable resize handles for this section */
  enableResize?: boolean;
  /** Allow height resizing (default: false) */
  resizeHeight?: boolean;
  /** Initial width (default: '100%') */
  initialWidth?: string | number;
  /** Initial height (default: 'auto') */
  initialHeight?: string | number;
  /** Minimum width constraint */
  minWidth?: number;
  /** Maximum width constraint */
  maxWidth?: number;
  /** Minimum height constraint */
  minHeight?: number;
  /** Custom enabled handles */
  enabledHandles?: Enable;
}

interface DragHandleProps {
  listeners: SyntheticListenerMap | undefined;
  attributes: DraggableAttributes;
}

// Drag handle icon (grip dots) - Always visible in edit mode for discoverability
function DragHandle({ listeners, attributes }: DragHandleProps) {
  return (
    <button
      className="absolute -left-8 top-4 p-2 cursor-grab active:cursor-grabbing
                 bg-blue-500 text-white rounded-lg shadow-lg hover:bg-blue-600 hover:scale-110
                 transition-all duration-200 z-20"
      data-drag-handle
      aria-label="Drag to reorder section"
      title="Drag to reorder"
      {...attributes}
      {...listeners}
    >
      <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
        <circle cx="4" cy="4" r="1.5" />
        <circle cx="12" cy="4" r="1.5" />
        <circle cx="4" cy="8" r="1.5" />
        <circle cx="12" cy="8" r="1.5" />
        <circle cx="4" cy="12" r="1.5" />
        <circle cx="12" cy="12" r="1.5" />
      </svg>
    </button>
  );
}

export default function EditableSection({
  sectionKey,
  label,
  children,
  className = '',
  enableResize = false,
  resizeHeight = false,
  initialWidth = '100%',
  initialHeight = 'auto',
  minWidth = 200,
  maxWidth,
  minHeight = 50,
  enabledHandles,
}: EditableSectionProps) {
  const {
    isEditMode,
    selectedSection,
    selectSection,
    pageContent,
    setSidebarOpen,
    registerSection,
    unregisterSection,
  } = useInlineEdit();

  // Register this section with the context for DndContext
  useEffect(() => {
    if (!isEditMode) return;
    registerSection(sectionKey);
    return () => unregisterSection(sectionKey);
  }, [isEditMode, sectionKey, registerSection, unregisterSection]);

  // Setup sortable drag-and-drop
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: sectionKey,
    disabled: !isEditMode,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const isSelected = selectedSection?.sectionKey === sectionKey;

  const handleClick = (e: React.MouseEvent) => {
    if (!isEditMode) return;

    // Don't allow selection until content is loaded
    if (!pageContent) return;

    e.stopPropagation();

    // Get section content from page content
    const sectionContent = pageContent[sectionKey];
    const content = typeof sectionContent === 'object' && sectionContent !== null
      ? (sectionContent as Record<string, unknown>)
      : { _value: sectionContent };

    const selection: SectionSelection = {
      sectionKey,
      label,
      content,
    };

    selectSection(selection);
    // Auto-open sidebar when section is clicked (Phase 4 enhancement)
    setSidebarOpen(true);
  };

  // In edit mode, wrap with interactive layer
  if (isEditMode) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        onClick={handleClick}
        className={`
          group relative cursor-pointer transition-all duration-150
          ${isSelected
            ? 'ring-2 ring-blue-500 ring-offset-4 rounded-xl'
            : 'hover:ring-2 hover:ring-blue-300 hover:ring-offset-4 hover:rounded-xl'
          }
          ${isDragging ? 'z-50' : ''}
          ${className}
        `}
        data-editable-section
        data-section-key={sectionKey}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleClick(e as unknown as React.MouseEvent);
          }
        }}
        aria-label={`Edit ${label} section`}
      >
        {/* Drag handle - visible on hover */}
        <DragHandle listeners={listeners} attributes={attributes} />

        {/* Section label - shown when selected or hovered */}
        <div
          className={`
            absolute -top-3 left-4 px-3 py-1 text-xs font-semibold rounded-full
            bg-blue-500 text-white shadow-md
            transition-all duration-200 z-10
            ${isSelected
              ? 'opacity-100 scale-100'
              : 'opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100'
            }
          `}
        >
          {label}
        </div>
        {/* Wrap children with ResizableWrapper if resize is enabled */}
        {enableResize ? (
          <ResizableWrapper
            sectionKey={sectionKey}
            fieldPath="styles"
            initialWidth={initialWidth}
            initialHeight={initialHeight}
            minWidth={minWidth}
            maxWidth={maxWidth}
            minHeight={minHeight}
            resizeHeight={resizeHeight}
            enabledHandles={enabledHandles}
          >
            {children}
          </ResizableWrapper>
        ) : (
          children
        )}
      </div>
    );
  }

  // Not in edit mode - render children directly with optional className
  return className ? (
    <div className={className}>{children}</div>
  ) : (
    <>{children}</>
  );
}
