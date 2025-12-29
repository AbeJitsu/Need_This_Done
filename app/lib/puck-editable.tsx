'use client';

// ============================================================================
// Puck Editable Utilities - DEPRECATED
// ============================================================================
// This file was part of the Puck-based inline editing system.
// It has been superseded by the section-based editing system.
// Keeping this file for reference but disabling exports.

// import { EditableWrapper } from '@/components/InlineEditor';

/**
 * Creates an editable render function for a Puck component
 *
 * @deprecated Use the section-based editing system instead
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
// export function makeEditable<P extends Record<string, unknown>>(
//   componentType: string,
//   renderFn: (props: P) => React.ReactNode
// ): (props: P & { puck?: { isEditing?: boolean } }) => React.ReactNode {
//   return function EditableRender(props: P & { puck?: { isEditing?: boolean } }) {
//     const componentPath = `${componentType}-${Math.random().toString(36).slice(2, 8)}`;
//     const { puck, ...componentProps } = props;
//     return (
//       <EditableWrapper
//         componentType={componentType}
//         componentPath={componentPath}
//         componentProps={componentProps as Record<string, unknown>}
//       >
//         {renderFn(props)}
//       </EditableWrapper>
//     );
//   };
// }

// Empty export to prevent "has no exports" error
export {};
