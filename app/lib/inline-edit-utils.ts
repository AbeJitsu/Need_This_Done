// ============================================================================
// Inline Edit Utilities
// ============================================================================
// What: Helper functions for inline editing operations
// Why: Extracted from InlineEditContext.tsx to reduce file size
// How: Pure functions for array reordering and selection index calculations

/**
 * Reorder an array by moving an item from oldIndex to newIndex.
 * Returns a new array with the item moved.
 */
export function reorderArray<T>(array: T[], oldIndex: number, newIndex: number): T[] {
  const newArray = [...array];
  const [removed] = newArray.splice(oldIndex, 1);
  newArray.splice(newIndex, 0, removed);
  return newArray;
}

/**
 * Calculate the new index for a selected item after a reorder operation.
 * Handles three cases:
 * 1. The selected item itself was moved
 * 2. An item was moved from before to after the selected item
 * 3. An item was moved from after to before the selected item
 *
 * @param currentIndex - The current index of the selected item
 * @param oldIndex - The old index of the moved item
 * @param newIndex - The new index of the moved item
 * @returns The new index for the selected item, or null if unchanged
 */
export function calculateNewSelectedIndex(
  currentIndex: number,
  oldIndex: number,
  newIndex: number
): number | null {
  if (currentIndex === oldIndex) {
    // The selected item was moved
    return newIndex;
  }

  if (oldIndex < currentIndex && newIndex >= currentIndex) {
    // Item moved from before to after the selected item
    return currentIndex - 1;
  }

  if (oldIndex > currentIndex && newIndex <= currentIndex) {
    // Item moved from after to before the selected item
    return currentIndex + 1;
  }

  // No change needed
  return null;
}

/**
 * Parse a field path to extract item index and remaining field path.
 * Handles two formats:
 * 1. "index.field" - when sectionKey equals arrayField
 * 2. "arrayField.index.field" - when they differ
 *
 * @param fieldPath - The full field path (e.g., "0.answer" or "items.0.answer")
 * @param isSameAsSection - True if sectionKey === arrayField
 * @returns Object with itemIndex and itemFieldPath, or null if parsing fails
 */
export function parseItemFieldPath(
  fieldPath: string,
  isSameAsSection: boolean
): { itemIndex: number; itemFieldPath: string } | null {
  const pathParts = fieldPath.split('.');

  if (isSameAsSection) {
    // Path is "index.field"
    const itemIndex = parseInt(pathParts[0], 10);
    if (isNaN(itemIndex)) return null;
    return {
      itemIndex,
      itemFieldPath: pathParts.slice(1).join('.'),
    };
  } else {
    // Path is "arrayField.index.field"
    const itemIndex = parseInt(pathParts[1], 10);
    if (isNaN(itemIndex)) return null;
    return {
      itemIndex,
      itemFieldPath: pathParts.slice(2).join('.'),
    };
  }
}

/**
 * Build the array path from section key and array field.
 * If sectionKey equals arrayField, the section IS the array.
 */
export function getArrayPath(sectionKey: string, arrayField: string): string {
  return sectionKey === arrayField ? sectionKey : `${sectionKey}.${arrayField}`;
}

/**
 * Build the change tracking path for reorder operations.
 */
export function getReorderFieldPath(sectionKey: string, arrayField: string): string {
  return arrayField === sectionKey ? '_reorder' : `${arrayField}._reorder`;
}
