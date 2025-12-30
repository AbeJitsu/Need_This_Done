// ============================================================================
// Content Path Mapper - Universal Click-to-Edit Support
// ============================================================================
// What: Finds the JSON path for any clicked text content
// Why: Enables true universal editing - click any text, edit it
// How: Recursive JSON search + DOM text matching

export interface ContentMatch {
  path: string;        // Full path like "hero.buttons.0.text"
  sectionKey: string;  // Top-level section like "hero"
  fieldPath: string;   // Path within section like "buttons.0.text"
  value: unknown;      // The matched value
  isArrayItem: boolean;
  arrayField?: string; // e.g., "buttons" if this is in an array
  arrayIndex?: number; // e.g., 0 if this is buttons[0]
}

/**
 * Find all paths in a JSON object that contain the given text.
 * Returns paths sorted by specificity (deeper paths first).
 */
export function findTextInContent(
  content: Record<string, unknown>,
  searchText: string,
  options: { exactMatch?: boolean; caseSensitive?: boolean } = {}
): ContentMatch[] {
  const { exactMatch = false, caseSensitive = false } = options;
  const matches: ContentMatch[] = [];

  if (!searchText || searchText.trim() === '') return matches;

  const normalizedSearch = caseSensitive ? searchText.trim() : searchText.trim().toLowerCase();

  function traverse(
    obj: unknown,
    currentPath: string,
    sectionKey: string,
    arrayContext?: { field: string; index: number }
  ) {
    if (obj === null || obj === undefined) return;

    // String value - check for match
    if (typeof obj === 'string') {
      const normalizedValue = caseSensitive ? obj : obj.toLowerCase();
      const isMatch = exactMatch
        ? normalizedValue === normalizedSearch
        : normalizedValue.includes(normalizedSearch);

      if (isMatch) {
        const fieldPath = currentPath.startsWith(`${sectionKey}.`)
          ? currentPath.slice(sectionKey.length + 1)
          : currentPath;

        matches.push({
          path: currentPath,
          sectionKey,
          fieldPath,
          value: obj,
          isArrayItem: !!arrayContext,
          arrayField: arrayContext?.field,
          arrayIndex: arrayContext?.index,
        });
      }
      return;
    }

    // Array - traverse each item
    if (Array.isArray(obj)) {
      const fieldName = currentPath.split('.').pop() || '';
      obj.forEach((item, index) => {
        traverse(
          item,
          `${currentPath}.${index}`,
          sectionKey,
          { field: fieldName, index }
        );
      });
      return;
    }

    // Object - traverse each property
    if (typeof obj === 'object') {
      const entries = Object.entries(obj as Record<string, unknown>);
      for (const [key, value] of entries) {
        const newPath = currentPath ? `${currentPath}.${key}` : key;
        // Update section key only for top-level properties
        const newSectionKey = currentPath === '' ? key : sectionKey;
        traverse(value, newPath, newSectionKey, arrayContext);
      }
    }
  }

  traverse(content, '', '');

  // Sort by path depth (deeper = more specific)
  matches.sort((a, b) => {
    const depthA = a.path.split('.').length;
    const depthB = b.path.split('.').length;
    return depthB - depthA;
  });

  return matches;
}

/**
 * Find the best match for clicked text content.
 * Prefers exact matches over partial matches.
 * Prefers deeper paths (more specific) over shallower paths.
 */
export function findBestMatch(
  content: Record<string, unknown>,
  searchText: string
): ContentMatch | null {
  // First try exact match
  const exactMatches = findTextInContent(content, searchText, { exactMatch: true });
  if (exactMatches.length > 0) {
    return exactMatches[0];
  }

  // Fall back to partial match
  const partialMatches = findTextInContent(content, searchText, { exactMatch: false });
  return partialMatches[0] || null;
}

/**
 * Get the text content from a clicked element, walking up the DOM if needed.
 * Handles scenarios where user clicks on a child element (span, strong, etc.)
 */
export function getClickedTextContent(element: HTMLElement): string {
  // Try the element's own text first (without child elements)
  const directText = getDirectTextContent(element);
  if (directText) return directText;

  // Check innerText for simple elements
  if (element.innerText && element.innerText.trim()) {
    return element.innerText.trim();
  }

  // Walk up the DOM to find meaningful text
  let current: HTMLElement | null = element;
  while (current && current.tagName !== 'BODY') {
    const text = current.innerText?.trim();
    if (text && text.length > 0 && text.length < 500) {
      return text;
    }
    current = current.parentElement;
  }

  return '';
}

/**
 * Get only direct text content (not from child elements)
 */
function getDirectTextContent(element: HTMLElement): string {
  const clone = element.cloneNode(true) as HTMLElement;
  // Remove all child elements to get only direct text
  Array.from(clone.children).forEach(child => child.remove());
  return clone.textContent?.trim() || '';
}

/**
 * Check if an element is likely editable content (not navigation, footer, etc.)
 */
export function isEditableElement(element: HTMLElement): boolean {
  // Skip common non-content areas
  const tagName = element.tagName.toLowerCase();
  if (['nav', 'header', 'footer', 'script', 'style', 'meta', 'link'].includes(tagName)) {
    return false;
  }

  // Skip elements with specific roles
  const role = element.getAttribute('role');
  if (role && ['navigation', 'banner', 'contentinfo', 'menubar'].includes(role)) {
    return false;
  }

  // Skip elements that are part of the admin UI
  if (element.closest('[data-testid="admin-sidebar"]')) return false;
  if (element.closest('[data-testid="edit-mode-bar"]')) return false;

  // Skip buttons and links in navigation
  if (element.closest('nav')) return false;

  // Content elements are likely editable
  const contentTags = ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'span', 'div', 'li', 'a'];
  if (contentTags.includes(tagName)) return true;

  // Check if inside main content area
  if (element.closest('main')) return true;

  return false;
}

/**
 * Build selection data from a content match for the InlineEdit context.
 * This creates the selection object expected by the sidebar.
 */
export function buildSelectionFromMatch(
  match: ContentMatch,
  pageContent: Record<string, unknown>
): { type: 'section' | 'item'; selection: Record<string, unknown> } {
  const sectionContent = pageContent[match.sectionKey];

  // If it's an array item, create an item selection
  if (match.isArrayItem && match.arrayField !== undefined && match.arrayIndex !== undefined) {
    // Get the array and the specific item
    // If sectionKey equals arrayField (e.g., both are "sections"), sectionContent IS the array
    // Otherwise, navigate to the array within sectionContent
    const arrayValue = match.sectionKey === match.arrayField
      ? sectionContent
      : getValueAtPath(sectionContent, match.arrayField);
    const itemContent = Array.isArray(arrayValue) ? arrayValue[match.arrayIndex] : null;

    return {
      type: 'item',
      selection: {
        sectionKey: match.sectionKey,
        arrayField: match.arrayField,
        index: match.arrayIndex,
        label: getItemLabel(itemContent, match.arrayIndex),
        content: itemContent,
      },
    };
  }

  // Otherwise create a section selection
  return {
    type: 'section',
    selection: {
      sectionKey: match.sectionKey,
      label: formatLabel(match.sectionKey),
      content: typeof sectionContent === 'object' && sectionContent !== null
        ? sectionContent
        : { _value: sectionContent },
    },
  };
}

/**
 * Get a value at a dot-separated path in an object
 */
function getValueAtPath(obj: unknown, path: string): unknown {
  if (!path) return obj;

  const parts = path.split('.');
  let current = obj;

  for (const part of parts) {
    if (current === null || current === undefined) return undefined;

    if (Array.isArray(current)) {
      const index = parseInt(part, 10);
      if (isNaN(index)) return undefined;
      current = current[index];
    } else if (typeof current === 'object') {
      current = (current as Record<string, unknown>)[part];
    } else {
      return undefined;
    }
  }

  return current;
}

/**
 * Get a human-readable label for an array item
 */
function getItemLabel(item: unknown, index: number): string {
  if (typeof item === 'object' && item !== null) {
    const obj = item as Record<string, unknown>;
    return String(obj.title || obj.name || obj.text || obj.question || `Item ${index + 1}`);
  }
  return `Item ${index + 1}`;
}

/**
 * Format a camelCase or snake_case key into a readable label
 */
function formatLabel(key: string): string {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/_/g, ' ')
    .replace(/^\s+/, '')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
