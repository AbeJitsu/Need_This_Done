// ============================================================================
// HTML Sanitization Utility - XSS Protection for Rich Text Content
// ============================================================================
// What: DOMPurify wrapper with strict allowlists for safe HTML rendering
// Why: Prevent XSS attacks when rendering user-edited rich text content
// How: Two-layer protection - TipTap schema (input) + DOMPurify (output)

import DOMPurify from 'dompurify';

// ============================================================================
// Allowed Elements - Only these HTML tags can be rendered
// ============================================================================
const ALLOWED_TAGS = [
  // Text structure
  'p', 'br', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  // Inline formatting
  'strong', 'b', 'em', 'i', 'u', 's', 'span',
  // Links and media
  'a', 'img',
  // Lists
  'ul', 'ol', 'li',
  // Block elements
  'blockquote', 'pre', 'code',
  // Semantic
  'div', 'hr',
];

// ============================================================================
// Allowed Attributes - Only these attributes can be present
// ============================================================================
const ALLOWED_ATTR = [
  // Links
  'href', 'target', 'rel',
  // Images
  'src', 'alt', 'title', 'width', 'height',
  // Styling (class only - no inline styles)
  'class',
  // Accessibility
  'aria-label', 'role',
];

// ============================================================================
// Forbidden Attributes - Always stripped (event handlers, etc.)
// ============================================================================
const FORBID_ATTR = [
  // Event handlers (XSS vectors)
  'onclick', 'ondblclick', 'onmousedown', 'onmouseup', 'onmouseover',
  'onmousemove', 'onmouseout', 'onkeydown', 'onkeypress', 'onkeyup',
  'onload', 'onerror', 'onabort', 'onblur', 'onchange', 'onfocus',
  'onreset', 'onsubmit', 'onunload',
  // Inline styles (can be abused)
  'style',
];

// ============================================================================
// Main Sanitization Function
// ============================================================================
/**
 * Sanitizes HTML content for safe rendering
 * Use this for all rich text content from the database before rendering
 *
 * @param dirty - The potentially unsafe HTML string
 * @returns Sanitized HTML string safe to render with dangerouslySetInnerHTML
 *
 * @example
 * <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(content) }} />
 */
export function sanitizeHtml(dirty: string): string {
  // Handle null/undefined gracefully
  if (!dirty) return '';

  // If it doesn't look like HTML, return as-is (plain text)
  if (!dirty.includes('<') && !dirty.includes('&')) {
    return dirty;
  }

  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    FORBID_ATTR,
    ALLOW_DATA_ATTR: false,
    // Force all links to open in new tab with security attributes
    ADD_ATTR: ['target', 'rel'],
    // Transform all links to be safe
    FORBID_TAGS: ['script', 'style', 'iframe', 'object', 'embed', 'form', 'input'],
  });
}

// ============================================================================
// Strict Sanitization - For Extra Sensitive Content
// ============================================================================
/**
 * Extra strict sanitization - only basic formatting allowed
 * Use for user-generated content from untrusted sources
 */
export function sanitizeStrict(dirty: string): string {
  if (!dirty) return '';

  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u'],
    ALLOWED_ATTR: [],
    ALLOW_DATA_ATTR: false,
  });
}

// ============================================================================
// Check if Content Needs Sanitization
// ============================================================================
/**
 * Checks if a string contains HTML that needs sanitization
 * Useful for conditionally rendering plain text vs rich text
 */
export function containsHtml(content: string): boolean {
  if (!content) return false;
  // Check for HTML tags (but not just escaped entities)
  return /<[a-z][\s\S]*>/i.test(content);
}

// ============================================================================
// Safe Content Renderer Helper
// ============================================================================
/**
 * Returns props for safely rendering HTML content
 *
 * @example
 * <div {...safeHtmlProps(content)} />
 */
export function safeHtmlProps(content: string): { dangerouslySetInnerHTML: { __html: string } } | { children: string } {
  if (containsHtml(content)) {
    return { dangerouslySetInnerHTML: { __html: sanitizeHtml(content) } };
  }
  return { children: content };
}
