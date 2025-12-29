'use client';

import { EditableWrapper } from '@/components/InlineEditor';

// ============================================================================
// Puck Editable Utilities - Make Puck components editable inline
// ============================================================================
// What: Helper function to wrap Puck component renders with EditableWrapper
// Why: Enables click-to-edit functionality for Puck components
// How: Wraps render output with EditableWrapper, passing component metadata

/**
 * Creates an editable render function for a Puck component
 *
 * Usage in puck-config.tsx:
 * ```
 * Hero: {
 *   render: makeEditable('Hero', ({ title, subtitle }) => (
 *     <div>...</div>
 *   )),
 * }
 * ```
 */
export function makeEditable<P extends Record<string, unknown>>(
  componentType: string,
  renderFn: (props: P) => React.ReactNode
): (props: P & { puck?: { isEditing?: boolean } }) => React.ReactNode {
  return function EditableRender(props: P & { puck?: { isEditing?: boolean } }) {
    // Generate a simple path based on the component type
    // In a full implementation, this would come from Puck's internal state
    const componentPath = `${componentType}-${Math.random().toString(36).slice(2, 8)}`;

    // Extract props excluding puck-specific ones
    const { puck, ...componentProps } = props;

    return (
      <EditableWrapper
        componentType={componentType}
        componentPath={componentPath}
        componentProps={componentProps as Record<string, unknown>}
      >
        {renderFn(props)}
      </EditableWrapper>
    );
  };
}

// Re-export EditableWrapper for direct use
export { EditableWrapper };
