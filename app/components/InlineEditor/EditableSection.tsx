'use client';

import { useInlineEdit, type SectionSelection } from '@/context/InlineEditContext';

// ============================================================================
// Editable Section - Makes page sections clickable in edit mode
// ============================================================================
// What: Wraps page sections to make them selectable when edit mode is active
// Why: Allows admins to click on any section to edit its content
// How: Shows hover outline, highlights selected section, triggers selection

interface EditableSectionProps {
  sectionKey: string;
  label: string;
  children: React.ReactNode;
  className?: string;
}

export default function EditableSection({
  sectionKey,
  label,
  children,
  className = '',
}: EditableSectionProps) {
  const { isEditMode, selectedSection, selectSection, pageContent } = useInlineEdit();

  const isSelected = selectedSection?.sectionKey === sectionKey;

  const handleClick = (e: React.MouseEvent) => {
    if (!isEditMode) return;

    e.stopPropagation();

    // Get section content from page content
    const sectionContent = pageContent?.[sectionKey];
    const content = typeof sectionContent === 'object' && sectionContent !== null
      ? (sectionContent as Record<string, unknown>)
      : { _value: sectionContent };

    const selection: SectionSelection = {
      sectionKey,
      label,
      content,
    };

    selectSection(selection);
  };

  // In edit mode, wrap with interactive layer
  if (isEditMode) {
    return (
      <div
        onClick={handleClick}
        className={`
          group relative cursor-pointer transition-all duration-150
          ${isSelected
            ? 'ring-2 ring-blue-500 ring-offset-4 rounded-xl'
            : 'hover:ring-2 hover:ring-blue-300 hover:ring-offset-4 hover:rounded-xl'
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
        aria-label={`Edit ${label} section`}
      >
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
        {children}
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
