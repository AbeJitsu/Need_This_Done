'use client';

import { useInlineEdit } from '@/context/InlineEditContext';
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

// ============================================================================
// Sortable Sections - Enables drag-and-drop reordering of page sections
// ============================================================================
// What: Wraps page content with @dnd-kit context for drag-and-drop
// Why: Allows admins to reorder sections by dragging in edit mode
// How: Provides DndContext and SortableContext with reorder handling

interface SortableSectionsProps {
  sectionKeys: string[];
  children: React.ReactNode;
  onReorder?: (oldIndex: number, newIndex: number) => void;
}

export default function SortableSections({
  sectionKeys,
  children,
  onReorder,
}: SortableSectionsProps) {
  const { isEditMode, reorderSections } = useInlineEdit();

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

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = sectionKeys.indexOf(active.id as string);
      const newIndex = sectionKeys.indexOf(over.id as string);

      if (oldIndex !== -1 && newIndex !== -1) {
        // Call external handler if provided
        if (onReorder) {
          onReorder(oldIndex, newIndex);
        }
        // Also update via context
        reorderSections?.(oldIndex, newIndex);
      }
    }
  };

  // Only wrap with DndContext when in edit mode
  if (!isEditMode) {
    return <>{children}</>;
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={sectionKeys} strategy={verticalListSortingStrategy}>
        {children}
      </SortableContext>
    </DndContext>
  );
}
