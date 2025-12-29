'use client';

import { useInlineEdit, type ComponentSelection } from '@/context/InlineEditContext';

// ============================================================================
// Editable Wrapper - Makes Puck components clickable in edit mode
// ============================================================================
// What: Wraps components to make them selectable when edit mode is active
// Why: Allows admins to click on any component to edit its properties
// How: Shows hover outline, highlights selected component, triggers selection

interface EditableWrapperProps {
  componentType: string;
  componentPath: string;
  componentProps: Record<string, unknown>;
  zone?: string;
  children: React.ReactNode;
}

export default function EditableWrapper({
  componentType,
  componentPath,
  componentProps,
  zone,
  children,
}: EditableWrapperProps) {
  const { isEditMode, selectedComponent, selectComponent } = useInlineEdit();

  const isSelected = selectedComponent?.path === componentPath;

  const handleClick = (e: React.MouseEvent) => {
    if (!isEditMode) return;

    e.stopPropagation();

    const selection: ComponentSelection = {
      path: componentPath,
      type: componentType,
      props: componentProps,
      zone,
    };

    selectComponent(selection);
  };

  // In edit mode, wrap with interactive layer
  if (isEditMode) {
    return (
      <div
        onClick={handleClick}
        className={`
          relative cursor-pointer transition-all duration-150
          ${isSelected
            ? 'ring-2 ring-blue-500 ring-offset-2 rounded-lg'
            : 'hover:ring-2 hover:ring-blue-300 hover:ring-offset-2 hover:rounded-lg'
          }
        `}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleClick(e as unknown as React.MouseEvent);
          }
        }}
        aria-label={`Edit ${componentType} component`}
      >
        {/* Component type label - shown on hover or when selected */}
        <div
          className={`
            absolute -top-6 left-0 px-2 py-0.5 text-xs font-medium rounded
            bg-blue-500 text-white
            transition-opacity duration-150
            ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}
          `}
        >
          {componentType}
        </div>
        {children}
      </div>
    );
  }

  // Not in edit mode - render children directly
  return <>{children}</>;
}
