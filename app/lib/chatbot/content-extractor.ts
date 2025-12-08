// ============================================================================
// Content Extractor
// ============================================================================
// What: Extracts meaningful text content from the DOM for indexing
// Why: Need clean text without navigation, footers, scripts, etc.
// How: Selects main content areas, removes noise, extracts text

/**
 * Extracted page content with metadata.
 */
export interface ExtractedContent {
  text: string;                    // The extracted text content
  title: string;                   // Page title
  metadata: Record<string, string>; // Additional metadata (description, etc.)
}

/**
 * Elements to remove before extracting text.
 * These contain non-content elements that shouldn't be indexed.
 */
const ELEMENTS_TO_REMOVE = [
  'nav',
  'header',
  'footer',
  'script',
  'style',
  'noscript',
  'iframe',
  'svg',
  '.chatbot-widget',        // Don't index the chatbot itself
  '.chatbot-button',
  '[aria-hidden="true"]',
  '.sr-only',               // Screen reader only content
  '[data-noindex]',         // Explicitly marked as no-index
];

/**
 * Extracts text content from the current page DOM.
 *
 * Targets the main content area and removes navigation, scripts,
 * and other non-content elements to get clean, indexable text.
 *
 * @returns Extracted content with text, title, and metadata
 */
export function extractPageContent(): ExtractedContent {
  // Get page title
  const title = document.title || 'Untitled Page';

  // Find the main content container
  // Priority: <main>, then <article>, then [role="main"], then <body>
  const mainElement =
    document.querySelector('main') ||
    document.querySelector('article') ||
    document.querySelector('[role="main"]') ||
    document.body;

  if (!mainElement) {
    return { text: '', title, metadata: {} };
  }

  // Clone the element so we don't modify the actual DOM
  const clone = mainElement.cloneNode(true) as HTMLElement;

  // Remove unwanted elements from the clone
  ELEMENTS_TO_REMOVE.forEach(selector => {
    clone.querySelectorAll(selector).forEach(el => el.remove());
  });

  // Extract and clean text
  let text = clone.textContent || '';

  // Clean up whitespace
  text = text
    .replace(/\s+/g, ' ')      // Multiple spaces/newlines → single space
    .replace(/\n+/g, '\n')     // Multiple newlines → single newline
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
  const staticPaths = ['/', '/services', '/pricing', '/faq', '/how-it-works', '/contact', '/get-started'];
  if (staticPaths.includes(pathname)) {
    return 'static';
  }

  // Everything else is CMS
  return 'cms';
}
