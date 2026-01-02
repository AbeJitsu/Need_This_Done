'use client';

import { useInlineEdit, type ItemSelection } from '@/context/InlineEditContext';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { DraggableAttributes } from '@dnd-kit/core';
import type { SyntheticListenerMap } from '@dnd-kit/core/dist/hooks/utilities';
import ResizableWrapper from './ResizableWrapper';
import type { Enable } from 're-resizable';

// ============================================================================
// Editable Item - Makes individual items (cards, FAQ items, etc.) clickable
// ============================================================================
// What: Wraps array items to make them selectable and draggable when edit mode is active
// Why: Allows admins to click on a specific card/item to edit just that item, or drag to reorder
// How: Stops click propagation (doesn't bubble to section), shows item editor, supports @dnd-kit sorting

interface EditableItemProps {
  // The section containing this item (e.g., "services")
  sectionKey: string;
  // The array field within the section (e.g., "cards")
  arrayField: string;
  // Index in the array
  index: number;
  // Human-readable label (e.g., "Data & Documents")
  label: string;
  // The item's content
  content: Record<string, unknown>;
  // Children to render
  children: React.ReactNode;
  // Optional className
  className?: string;
  // Unique ID for sorting (required when sortable=true)
  sortId?: string;
  // Enable drag-and-drop sorting
  sortable?: boolean;
  /** Enable resize handles for this item */
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

// Item Drag Handle - small grip icon for reordering
interface ItemDragHandleProps {
  listeners: SyntheticListenerMap | undefined;
  attributes: DraggableAttributes;
}

function ItemDragHandle({ listeners, attributes }: ItemDragHandleProps) {
  return (
    <button
      className="absolute -left-6 top-1/2 -translate-y-1/2 p-1.5 cursor-grab active:cursor-grabbing
                 bg-purple-500 text-white rounded shadow-sm hover:bg-purple-600 hover:scale-110
                 transition-all duration-200 z-20"
      data-item-drag-handle
      aria-label="Drag to reorder item"
      title="Drag to reorder"
      {...attributes}
      {...listeners}
    >
      <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
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

export default function EditableItem({
  sectionKey,
  arrayField,
  index,
  label,
  content,
  children,
  className = '',
  sortId,
  sortable = false,
  enableResize = false,
  resizeHeight = false,
  initialWidth = '100%',
  initialHeight = 'auto',
  minWidth = 150,
  maxWidth,
  minHeight = 50,
  enabledHandles,
}: EditableItemProps) {
  const { isEditMode, selectedItem, selectItem, setSidebarOpen } = useInlineEdit();

  // Setup sortable drag-and-drop (only when sortable=true)
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: sortId || `${sectionKey}-${arrayField}-${index}`,
    disabled: !isEditMode || !sortable,
  });

  const style = sortable ? {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  } : undefined;

  const isSelected =
    selectedItem?.sectionKey === sectionKey &&
    selectedItem?.arrayField === arrayField &&
    selectedItem?.index === index;

  const handleClick = (e: React.MouseEvent) => {
    if (!isEditMode) return;

    // Stop propagation so section doesn't get selected
    e.stopPropagation();
    // Prevent default to block Link navigation, form submissions, etc.
    e.preventDefault();

    const selection: ItemSelection = {
      sectionKey,
      arrayField,
      index,
      label,
      content,
    };

    selectItem(selection);
    // Auto-open sidebar when item is clicked (Phase 4 enhancement)
    setSidebarOpen(true);
  };

  // In edit mode, wrap with interactive layer
  if (isEditMode) {
    return (
      <div
        ref={sortable ? setNodeRef : undefined}
        style={style}
        onClickCapture={handleClick}
        className={`
          group/item relative cursor-pointer transition-all duration-150
          ${isSelected
            ? 'ring-2 ring-purple-500 ring-offset-2 rounded-lg'
            : 'hover:ring-2 hover:ring-purple-300 hover:ring-dashed hover:ring-offset-2 hover:rounded-lg'
          }
          ${isDragging ? 'z-50' : ''}
          ${className}
        `}
        data-sortable-item={sortable ? sortId : undefined}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleClick(e as unknown as React.MouseEvent);
          }
        }}
        aria-label={`Edit ${label}`}
      >
        {/* Item drag handle - only shown when sortable */}
        {sortable && <ItemDragHandle listeners={listeners} attributes={attributes} />}

        {/* Item label - shown when selected or hovered */}
        <div
          className={`
            absolute -top-2 left-2 px-2 py-0.5 text-xs font-medium rounded-full
            bg-purple-500 text-white shadow-sm
            transition-all duration-200 z-20
            ${isSelected
              ? 'opacity-100 scale-100'
              : 'opacity-0 scale-95 group-hover/item:opacity-100 group-hover/item:scale-100'
            }
          `}
        >
          {label}
        </div>
        {/* Wrap children with ResizableWrapper if resize is enabled */}
        {enableResize ? (
          <ResizableWrapper
            sectionKey={sectionKey}
            fieldPath={`${arrayField}.${index}.styles`}
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

  // Not in edit mode - render children directly
  return className ? (
    <div className={className}>{children}</div>
  ) : (
    <>{children}</>
  );
}
