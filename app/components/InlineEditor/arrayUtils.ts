// ============================================================================
// Array Utilities - Helpers for array operations in inline editing
// ============================================================================
// What: Shared utility functions for array manipulation
// Why: Eliminates duplication between item editor and section array handling
// How: Pure functions for navigation, template creation, and mutations

/**
 * Navigate into nested content at a given path
 */
export function getNestedValue(content: unknown, path: string): unknown {
  if (!path) return content;

  const pathParts = path.split('.');
  let result: unknown = content;

  for (const part of pathParts) {
    if (result === null || result === undefined) break;
    if (Array.isArray(result)) {
      result = result[parseInt(part, 10)];
    } else if (typeof result === 'object') {
      result = (result as Record<string, unknown>)[part];
    }
  }

  return result;
}

/**
 * Get array at path, handling case where sectionKey equals arrayPath
 */
export function getArrayAtPath(
  sectionContent: unknown,
  sectionKey: string,
  arrayPath: string
): unknown[] | null {
  // If sectionKey equals arrayPath, sectionContent IS the array
  if (sectionKey === arrayPath) {
    return Array.isArray(sectionContent) ? sectionContent : null;
  }

  // Navigate to the array within sectionContent
  const pathParts = arrayPath.split('.');
  let arr: unknown = sectionContent;

  for (const part of pathParts) {
    if (arr === null || arr === undefined) break;
    if (Array.isArray(arr)) {
      arr = arr[parseInt(part, 10)];
    } else if (typeof arr === 'object') {
      arr = (arr as Record<string, unknown>)[part];
    }
  }

  return Array.isArray(arr) ? arr : null;
}

/**
 * Create a template for a new array item based on the first item's structure
 */
export function createItemTemplate(array: unknown[]): unknown {
  if (array.length === 0) return {};

  const first = array[0];
  if (typeof first !== 'object' || first === null) return '';

  // Create empty template with same keys
  const template: Record<string, unknown> = {};
  for (const key of Object.keys(first as Record<string, unknown>)) {
    const val = (first as Record<string, unknown>)[key];
    if (typeof val === 'string') template[key] = '';
    else if (typeof val === 'number') template[key] = 0;
    else if (typeof val === 'boolean') template[key] = false;
    else if (Array.isArray(val)) template[key] = [];
    else template[key] = null;
  }
  return template;
}

/**
 * Get a preview label for an array item
 */
export function getItemPreviewLabel(item: unknown, fallbackLabel: string): string {
  if (typeof item === 'object' && item !== null) {
    const obj = item as Record<string, unknown>;
    return String(
      obj.title || obj.name || obj.text || obj.question || fallbackLabel
    );
  }
  return String(item);
}

/**
 * Get singular form of a label (simple pluralization removal)
 */
export function getSingularLabel(label: string): string {
  return label.endsWith('s') ? label.slice(0, -1) : label;
}
