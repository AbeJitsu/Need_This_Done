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
