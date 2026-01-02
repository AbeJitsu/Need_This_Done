// ============================================================================
// Object Utilities - Nested value access and mutation
// ============================================================================
// What: Helpers for safely getting/setting deeply nested object values
// Why: DRY - same pattern was duplicated in InlineEditContext + templates/utils
// How: Import these anywhere you need to traverse object paths

/**
 * Gets a nested value from an object using dot notation.
 *
 * @param obj - The object to traverse
 * @param path - Dot-separated path (e.g., 'sections.0.props.heading')
 * @returns The value at the path, or undefined if not found
 *
 * @example
 * getNestedValue({ a: { b: 1 } }, 'a.b')    // 1
 * getNestedValue({ items: [{ x: 5 }] }, 'items.0.x')  // 5
 * getNestedValue({}, 'missing.path')        // undefined
 */
export function getNestedValue(obj: unknown, path: string): unknown {
  return path.split('.').reduce((current: unknown, key: string) => {
    if (current === null || current === undefined) return undefined;
    if (typeof current !== 'object') return undefined;
    return (current as Record<string, unknown>)[key];
  }, obj);
}

/**
 * Sets a nested value in an object using dot notation (immutably).
 * Creates a new object - doesn't modify the original.
 *
 * @param obj - The object to modify
 * @param path - Dot-separated path (e.g., 'sections.0.props.heading')
 * @param value - The value to set
 * @returns A new object with the value set, or unchanged if path doesn't exist
 *
 * @example
 * setNestedValue({ a: { b: 1 } }, 'a.b', 2)  // { a: { b: 2 } }
 * setNestedValue({ items: [] }, 'items.0', 'new')  // { items: ['new'] }
 */
export function setNestedValue<T>(obj: T, path: string, value: unknown): T {
  const keys = path.split('.');
  const lastKey = keys.pop()!;

  // Deep clone the object
  const result = JSON.parse(JSON.stringify(obj)) as T;

  // Navigate to the parent of the target
  let current: unknown = result;
  for (const key of keys) {
    if (current === null || current === undefined || typeof current !== 'object') {
      return result; // Path doesn't exist, return unchanged
    }
    current = (current as Record<string, unknown>)[key];
  }

  // Set the value
  if (current !== null && current !== undefined && typeof current === 'object') {
    (current as Record<string, unknown>)[lastKey] = value;
  }

  return result;
}

/**
 * Deep merges two objects. Values from source override values from target.
 * Arrays are replaced entirely (not merged element-by-element).
 *
 * @param target - The base object (defaults)
 * @param source - The object to merge in (saved content)
 * @returns A new merged object
 *
 * @example
 * deepMerge({ a: 1, b: { c: 2 } }, { b: { c: 3 } })  // { a: 1, b: { c: 3 } }
 * deepMerge({ items: [1, 2] }, { items: [3] })       // { items: [3] }
 */
export function deepMerge<T extends Record<string, unknown>>(
  target: T,
  source: Partial<T> | null | undefined
): T {
  if (!source) return target;

  const result: Record<string, unknown> = { ...target };

  for (const key of Object.keys(source)) {
    const sourceValue = source[key as keyof T];
    const targetValue = target[key as keyof T];

    // If source value is null or undefined, keep target value
    if (sourceValue === null || sourceValue === undefined) {
      continue;
    }

    // If source is an array, replace entirely
    if (Array.isArray(sourceValue)) {
      // Deep merge array items if they're objects and same length
      if (
        Array.isArray(targetValue) &&
        sourceValue.length === targetValue.length &&
        sourceValue.every(item => typeof item === 'object' && item !== null) &&
        targetValue.every(item => typeof item === 'object' && item !== null)
      ) {
        result[key] = sourceValue.map((item, i) =>
          deepMerge(
            targetValue[i] as Record<string, unknown>,
            item as Record<string, unknown>
          )
        );
      } else {
        result[key] = sourceValue;
      }
    }
    // If both are objects, recursively merge
    else if (
      typeof sourceValue === 'object' &&
      typeof targetValue === 'object' &&
      targetValue !== null
    ) {
      result[key] = deepMerge(
        targetValue as Record<string, unknown>,
        sourceValue as Record<string, unknown>
      );
    }
    // Otherwise, source value replaces target value
    else {
      result[key] = sourceValue;
    }
  }

  return result as T;
}
