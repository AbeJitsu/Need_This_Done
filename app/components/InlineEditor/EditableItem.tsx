'use client';

import { useInlineEdit, type ItemSelection } from '@/context/InlineEditContext';

// ============================================================================
// Editable Item - Makes individual items (cards, FAQ items, etc.) clickable
// ============================================================================
// What: Wraps array items to make them selectable when edit mode is active
// Why: Allows admins to click on a specific card/item to edit just that item
// How: Stops click propagation (doesn't bubble to section), shows item editor

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
}

export default function EditableItem({
  sectionKey,
  arrayField,
  index,
  label,
  content,
  children,
  className = '',
}: EditableItemProps) {
  const { isEditMode, selectedItem, selectItem } = useInlineEdit();

  const isSelected =
    selectedItem?.sectionKey === sectionKey &&
    selectedItem?.arrayField === arrayField &&
    selectedItem?.index === index;

  const handleClick = (e: React.MouseEvent) => {
    if (!isEditMode) return;

    // Stop propagation so section doesn't get selected
    e.stopPropagation();

    const selection: ItemSelection = {
      sectionKey,
      arrayField,
      index,
      label,
      content,
    };

    selectItem(selection);
  };

  // In edit mode, wrap with interactive layer
  if (isEditMode) {
    return (
      <div
        onClick={handleClick}
        className={`
          group/item relative cursor-pointer transition-all duration-150
          ${isSelected
            ? 'ring-2 ring-purple-500 ring-offset-2 rounded-lg'
            : 'hover:ring-2 hover:ring-purple-300 hover:ring-dashed hover:ring-offset-2 hover:rounded-lg'
          }
          ${className}
        `}
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
        {children}
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
