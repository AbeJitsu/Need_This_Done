// ============================================================================
// Content Extractor
// ============================================================================
// What: Extracts meaningful text content from the DOM for indexing
// Why: Need clean text that captures all visible content on the page
// How: Walks the DOM tree, extracts visible text, preserves structure

/**
 * Extracted page content with metadata.
 */
export interface ExtractedContent {
  text: string;                    // The extracted text content
  title: string;                   // Page title
  metadata: Record<string, string>; // Additional metadata (description, etc.)
}

/**
 * Selectors for elements that should be completely skipped.
 * These contain non-content or UI elements that shouldn't be indexed.
 */
const ELEMENTS_TO_SKIP = [
  'script',
  'style',
  'noscript',
  'iframe',
  'template',
  '.chatbot-widget',        // Don't index the chatbot itself
  '.chatbot-button',
  '[data-noindex]',         // Explicitly marked as no-index
];

/**
 * Selectors for navigation/UI elements.
 * We still want their text content for context.
 */
const NAV_ELEMENTS = [
  'nav',
  '[role="navigation"]',
];

/**
 * Checks if an element is visible (not hidden via CSS).
 */
function isVisible(element: HTMLElement): boolean {
  const style = window.getComputedStyle(element);
  return (
    style.display !== 'none' &&
    style.visibility !== 'hidden' &&
    style.opacity !== '0' &&
    !element.hidden
  );
}

/**
 * Extracts text from an element, preserving some structure.
 * Adds appropriate spacing between different content blocks.
 */
function extractTextWithStructure(element: HTMLElement): string {
  const parts: string[] = [];

  // Walk through child nodes
  for (const node of element.childNodes) {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent?.trim();
      if (text) {
        parts.push(text);
      }
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const el = node as HTMLElement;

      // Skip hidden elements and elements to skip
      if (!isVisible(el)) continue;

      const tagName = el.tagName.toLowerCase();

      // Skip elements that shouldn't be indexed
      if (ELEMENTS_TO_SKIP.some(sel => el.matches(sel))) continue;

      // Skip SVG elements entirely
      if (tagName === 'svg') continue;

      // Skip screen-reader-only content
      if (el.classList.contains('sr-only')) continue;

      // Recursively extract text
      const childText = extractTextWithStructure(el);
      if (!childText) continue;

      // Add appropriate spacing based on element type
      if (['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(tagName)) {
        // Headings get their own line with emphasis
        parts.push(`\n\n${childText}\n`);
      } else if (['p', 'div', 'section', 'article', 'main', 'li'].includes(tagName)) {
        // Block elements get line breaks
        parts.push(`\n${childText}`);
      } else if (['br'].includes(tagName)) {
        parts.push('\n');
      } else {
        // Inline elements just add text with space
        parts.push(` ${childText}`);
      }
    }
  }

  return parts.join('').trim();
}

/**
 * Extracts text content from the current page DOM.
 *
 * Improved extraction that:
 * - Gets all visible text content, not just <main>
 * - Preserves document structure for better context
 * - Includes pricing, features, and other important content
 *
 * @returns Extracted content with text, title, and metadata
 */
export function extractPageContent(): ExtractedContent {
  // Get page title
  const title = document.title || 'Untitled Page';

  // Start with body if no main element
  const mainElement =
    document.querySelector('main') ||
    document.querySelector('[role="main"]') ||
    document.body;

  if (!mainElement) {
    return { text: '', title, metadata: {} };
  }

  // Clone to avoid modifying the DOM
  const clone = mainElement.cloneNode(true) as HTMLElement;

  // Remove elements that should never be indexed
  ELEMENTS_TO_SKIP.forEach(selector => {
    clone.querySelectorAll(selector).forEach(el => el.remove());
  });

  // Extract text with structure preserved
  let text = extractTextWithStructure(clone);

  // Also capture important navigation text for context
  const navParts: string[] = [];
  NAV_ELEMENTS.forEach(selector => {
    document.querySelectorAll(selector).forEach(nav => {
      const navClone = nav.cloneNode(true) as HTMLElement;
      // Remove scripts/styles from nav
      navClone.querySelectorAll('script, style, svg').forEach(el => el.remove());
      const navText = navClone.textContent?.trim();
      if (navText) {
        navParts.push(navText);
      }
    });
  });

  // Prepend navigation context if we have it
  if (navParts.length > 0) {
    text = `Navigation: ${navParts.join(' | ')}\n\n${text}`;
  }

  // Clean up excessive whitespace while preserving structure
  text = text
    .replace(/[ \t]+/g, ' ')           // Multiple spaces → single space
    .replace(/\n{3,}/g, '\n\n')        // 3+ newlines → 2 newlines
    .replace(/^\s+|\s+$/gm, '')        // Trim each line
    .trim();

  // Extract metadata
  const metadata: Record<string, string> = {};

  // Meta description
  const metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc) {
    metadata.description = metaDesc.getAttribute('content') || '';
  }

  // Open Graph title
  const ogTitle = document.querySelector('meta[property="og:title"]');
  if (ogTitle) {
    metadata.og_title = ogTitle.getAttribute('content') || '';
  }

  // Open Graph description
  const ogDesc = document.querySelector('meta[property="og:description"]');
  if (ogDesc) {
    metadata.og_description = ogDesc.getAttribute('content') || '';
  }

  // Add page URL for reference
  metadata.url = window.location.pathname;

  return { text, title, metadata };
}

/**
 * Extracts content from structured product data.
 *
 * Used for product pages where we have the product object
 * instead of just DOM content.
 *
 * @param product - Product data object (e.g., from Medusa)
 * @returns Extracted content optimized for product search
 */
export function extractProductContent(product: {
  title?: string;
  description?: string;
  handle?: string;
  variants?: Array<{
    prices?: Array<{ amount?: number }>;
  }>;
  metadata?: Record<string, unknown>;
}): ExtractedContent {
  const title = product.title || 'Product';

  // Build comprehensive product text
  let text = `${title}\n\n`;

  if (product.description) {
    text += `${product.description}\n\n`;
  }

  // Add pricing info if available
  if (product.variants && product.variants.length > 0) {
    const prices = product.variants
      .map(v => v.prices?.[0]?.amount)
      .filter((p): p is number => p !== undefined);

    if (prices.length > 0) {
      const minPrice = Math.min(...prices) / 100;
      const maxPrice = Math.max(...prices) / 100;
      text += `Price: $${minPrice}${minPrice !== maxPrice ? ` - $${maxPrice}` : ''}\n\n`;
    }
  }

  // Add any custom metadata
  if (product.metadata) {
    Object.entries(product.metadata).forEach(([key, value]) => {
      if (value && typeof value === 'string') {
        text += `${key}: ${value}\n`;
      }
    });
  }

  const metadata: Record<string, string> = {
    type: 'product',
  };

  if (product.handle) {
    metadata.handle = product.handle;
  }

  return { text, title, metadata };
}

/**
 * Checks if the current page should be indexed.
 *
 * Excludes admin pages, auth pages, and other non-public routes.
 *
 * @param pathname - The current URL pathname
 * @returns True if the page should be indexed
 */
export function shouldIndexPage(pathname: string): boolean {
  // Pages that should NOT be indexed
  const excludedPaths = [
    '/admin',         // Admin dashboard
    '/dashboard',     // User dashboard
    '/login',         // Auth pages
    '/cart',          // Shopping cart
    '/checkout',      // Checkout flow
    '/api',           // API routes
  ];

  // Check if pathname starts with any excluded path
  return !excludedPaths.some(excluded => pathname.startsWith(excluded));
}

/**
 * Determines the page type based on the URL pathname.
 *
 * @param pathname - The current URL pathname
 * @returns Page type: "static", "cms", or "product"
 */
export function getPageType(pathname: string): 'static' | 'cms' | 'product' {
  if (pathname.startsWith('/shop/')) {
    return 'product';
  }

  // Static pages have known paths
  const staticPaths = ['/', '/services', '/pricing', '/faq', '/how-it-works', '/contact'];
  if (staticPaths.includes(pathname)) {
    return 'static';
  }

  // Everything else is CMS
  return 'cms';
}
