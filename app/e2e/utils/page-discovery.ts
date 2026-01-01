import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

// ============================================================================
// Dynamic Page Discovery Utility
// ============================================================================
// Automatically discovers all pages in the Next.js app directory.
// Use this instead of hardcoding page lists in tests.
//
// RULE: Tests that iterate over pages MUST use this utility, not hardcoded lists.
// See: .claude/rules/testing-flexibility.md

// ES module compatibility
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface DiscoveredPage {
  path: string;
  name: string;
  isAdmin: boolean;
  isPublic: boolean;
}

/**
 * Discover all static pages in the app directory.
 * Skips dynamic routes ([slug], [id], etc.) since they need specific data.
 */
export function discoverAllPages(appDir?: string): DiscoveredPage[] {
  const baseDir = appDir || path.join(__dirname, '../../app');
  const pages: DiscoveredPage[] = [];

  function scanDirectory(dir: string, routePath: string = '') {
    if (!fs.existsSync(dir)) return;

    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        // Skip special directories
        if (entry.name.startsWith('_') || entry.name.startsWith('.')) continue;
        if (entry.name === 'api') continue; // Skip API routes

        // Skip dynamic routes with parameters
        if (entry.name.startsWith('[') && entry.name.includes(']')) continue;

        const newRoutePath = routePath + '/' + entry.name;
        scanDirectory(fullPath, newRoutePath);
      } else if (entry.name === 'page.tsx' || entry.name === 'page.ts') {
        const route = routePath || '/';
        const name = routePath
          ? routePath
              .split('/')
              .filter(Boolean)
              .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
              .join(' ')
          : 'Home';

        pages.push({
          path: route,
          name,
          isAdmin: route.startsWith('/admin'),
          isPublic: !route.startsWith('/admin') && !route.startsWith('/dashboard'),
        });
      }
    }
  }

  scanDirectory(baseDir);

  // Sort: public first, then admin
  return pages.sort((a, b) => {
    if (a.isAdmin && !b.isAdmin) return 1;
    if (!a.isAdmin && b.isAdmin) return -1;
    return a.path.localeCompare(b.path);
  });
}

/**
 * Get only public pages (marketing, shop, etc.)
 */
export function discoverPublicPages(appDir?: string): DiscoveredPage[] {
  return discoverAllPages(appDir).filter((p) => p.isPublic);
}

/**
 * Get only admin pages
 */
export function discoverAdminPages(appDir?: string): DiscoveredPage[] {
  return discoverAllPages(appDir).filter((p) => p.isAdmin);
}

/**
 * Get pages matching a pattern
 */
export function discoverPagesByPattern(
  pattern: RegExp,
  appDir?: string
): DiscoveredPage[] {
  return discoverAllPages(appDir).filter((p) => pattern.test(p.path));
}

// ============================================================================
// Screenshot Test Helpers
// ============================================================================
// Transform discovered pages into format needed for screenshot tests.
// These maintain backwards compatibility with existing screenshot folder structure.

export interface ScreenshotPage {
  path: string;
  name: string;
  folder: string;
}

/**
 * Get public pages formatted for screenshot tests.
 * Excludes dashboard (needs auth variants) and generates folder structure.
 *
 * Example: `/pricing` → { path: '/pricing', name: 'pricing', folder: 'public/pricing' }
 */
export function getPublicScreenshotPages(appDir?: string): ScreenshotPage[] {
  return discoverPublicPages(appDir)
    .filter((p) => !p.path.startsWith('/dashboard')) // Exclude dashboard (needs auth variants)
    .map((p) => {
      const slug = p.path === '/' ? 'home' : p.path.slice(1);
      return {
        path: p.path,
        name: slug.replace(/\//g, '-'),
        folder: `public/${slug}`,
      };
    });
}

/**
 * Get admin pages formatted for screenshot tests.
 *
 * Example: `/admin/products` → { path: '/admin/products', name: 'admin-products', folder: 'admin/products' }
 */
export function getAdminScreenshotPages(appDir?: string): ScreenshotPage[] {
  return discoverAdminPages(appDir).map((p) => {
    const pathWithoutAdmin = p.path.slice(7); // Remove /admin/
    return {
      path: p.path,
      name: `admin-${pathWithoutAdmin.replace(/\//g, '-')}`,
      folder: `admin/${pathWithoutAdmin}`,
    };
  });
}

// ============================================================================
// Editable Pages Discovery
// ============================================================================
// Pages with inline editing have a defined content type in page-content-types.ts.
// The source of truth is EDITABLE_PAGES constant, not filesystem content files.

export interface EditablePage extends DiscoveredPage {
  contentSlug: string;
}

// Source of truth: EDITABLE_PAGES from lib/page-content-types.ts
// We duplicate the list here to avoid complex build-time imports in test files.
// If EDITABLE_PAGES changes, update this list.
const EDITABLE_PAGE_SLUGS = [
  'home',
  'pricing',
  'services',
  'faq',
  'how-it-works',
  'contact',
  'get-started',
  'blog',
  'changelog',
  'guide',
  'privacy',
  'terms',
] as const;

// Map content slugs to routes
const slugToRoute: Record<string, string> = {
  'home': '/',
  'services': '/services',
  'pricing': '/pricing',
  'faq': '/faq',
  'how-it-works': '/how-it-works',
  'contact': '/contact',
  'get-started': '/get-started',
  'blog': '/blog',
  'changelog': '/changelog',
  'guide': '/guide',
  'privacy': '/privacy',
  'terms': '/terms',
};

/**
 * Discover pages that have inline editing enabled.
 * Source of truth: EDITABLE_PAGES from lib/page-content-types.ts
 */
export function discoverEditablePages(): EditablePage[] {
  return EDITABLE_PAGE_SLUGS
    .filter(slug => slugToRoute[slug])
    .map(slug => ({
      path: slugToRoute[slug],
      name: slug.charAt(0).toUpperCase() + slug.slice(1).replace(/-/g, ' '),
      isAdmin: false,
      isPublic: true,
      contentSlug: slug,
    }));
}

/**
 * Check if a page has inline editing enabled.
 */
export function isPageEditable(pagePath: string): boolean {
  const editablePages = discoverEditablePages();
  return editablePages.some(p => p.path === pagePath);
}
