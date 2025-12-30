// ============================================================================
// Editable Routes - Route to Page Slug Mapping
// ============================================================================
// What: Maps URL pathnames to editable page slugs
// Why: Enables automatic page detection for inline editing system
// How: Simple lookup table + helper function for URL normalization
//
// To make a new page editable:
// 1. Add route → slug mapping here
// 2. Add content type to page-content-types.ts
// 3. Add defaults to default-page-content.ts
// 4. Use useEditableContent() in your page client

import type { EditablePageSlug } from './page-content-types';

// ============================================================================
// Route → Slug Mapping
// ============================================================================

/**
 * Maps URL pathnames to their corresponding editable page slugs.
 * Add new routes here to make them editable via the inline editing system.
 */
export const editableRoutes: Record<string, EditablePageSlug> = {
  '/': 'home',
  '/services': 'services',
  '/pricing': 'pricing',
  '/faq': 'faq',
  '/how-it-works': 'how-it-works',
  '/contact': 'contact',
  '/get-started': 'get-started',
};

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get the page slug for a given pathname.
 * Handles trailing slashes and query strings.
 *
 * @param pathname - The URL pathname (e.g., '/services', '/pricing/')
 * @returns The page slug or null if the route is not editable
 *
 * @example
 * getPageSlugFromPath('/services') // 'services'
 * getPageSlugFromPath('/services/') // 'services'
 * getPageSlugFromPath('/services?tab=1') // 'services'
 * getPageSlugFromPath('/unknown') // null
 */
export function getPageSlugFromPath(pathname: string): EditablePageSlug | null {
  // Remove query string if present
  const pathWithoutQuery = pathname.split('?')[0];

  // Remove trailing slash (but keep root '/')
  const normalizedPath = pathWithoutQuery === '/'
    ? '/'
    : pathWithoutQuery.replace(/\/$/, '');

  return editableRoutes[normalizedPath] ?? null;
}

/**
 * Check if a route is editable
 */
export function isEditableRoute(pathname: string): boolean {
  return getPageSlugFromPath(pathname) !== null;
}
