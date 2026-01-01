'use client';

import { ReactNode, useCallback } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useInlineEdit } from '@/context/InlineEditContext';

// ============================================================================
// Sortable Items Wrapper - Enables drag-and-drop for array items
// ============================================================================
// What: Wraps arrays of EditableItems to make them sortable
// Why: Allows admins to reorder FAQ items, pricing tiers, etc.
// How: Creates a nested DndContext for item-level sorting
//
// Usage:
// <SortableItemsWrapper sectionKey="items" items={faqItems}>
//   {faqItems.map((item, i) => <EditableItem key={i} ... />)}
// </SortableItemsWrapper>

interface SortableItemsWrapperProps {
  // The section key containing the array (e.g., "items" for FAQ)
  sectionKey: string;
  // The array field name (e.g., "items", "tiers", "cards")
  // If the section IS the array (e.g., FAQ "items"), pass the same value
  arrayField: string;
  // The items to enable sorting for - used to generate IDs
  itemIds: string[];
  // Children to render
  children: ReactNode;
  // Optional className for the wrapper
  className?: string;
}

export default function SortableItemsWrapper({
  sectionKey,
  arrayField,
  itemIds,
  children,
  className = '',
}: SortableItemsWrapperProps) {
  const { isEditMode, reorderItems } = useInlineEdit();

  // Sensors for drag detection
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Require 8px of movement before starting drag
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Handle drag end - reorder items
  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = itemIds.indexOf(active.id as string);
      const newIndex = itemIds.indexOf(over.id as string);

      if (oldIndex !== -1 && newIndex !== -1 && reorderItems) {
        reorderItems(sectionKey, arrayField, oldIndex, newIndex);
      }
    }
  }, [itemIds, sectionKey, arrayField, reorderItems]);

  // Only enable sorting in edit mode
  if (!isEditMode) {
    return <div className={className}>{children}</div>;
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
        <div className={className} data-sortable-items={`${sectionKey}.${arrayField}`}>
          {children}
        </div>
      </SortableContext>
    </DndContext>
  );
}
