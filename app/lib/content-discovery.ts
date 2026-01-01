import * as fs from 'fs';
import * as path from 'path';

// ============================================================================
// Content Discovery - Auto-discover editable content files
// ============================================================================
// What: Scans /content directory and generates route manifest automatically
// Why: Zero-config editing - JSON file existence = page is editable
// How: Build-time scanning + runtime route lookup

// ============================================================================
// Types
// ============================================================================

export interface ContentManifest {
  [route: string]: string; // route -> slug mapping
}

export interface ContentValidationResult {
  valid: boolean;
  error?: string;
}

// ============================================================================
// Discovery Functions
// ============================================================================

/**
 * Discover all JSON content files in a directory.
 * Returns an array of relative file paths.
 *
 * @param contentDir - Absolute path to content directory
 * @param relativePath - Current relative path (for recursion)
 * @returns Array of relative file paths (e.g., ['home.json', 'blog/post-1.json'])
 */
export function discoverContentFiles(
  contentDir: string,
  relativePath: string = ''
): string[] {
  // Check if directory exists
  if (!fs.existsSync(contentDir)) {
    return [];
  }

  const files: string[] = [];
  const entries = fs.readdirSync(contentDir);

  for (const entry of entries) {
    const fullPath = path.join(contentDir, entry);
    const relPath = relativePath ? `${relativePath}/${entry}` : entry;

    try {
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        // Recursively scan subdirectories
        const nestedFiles = discoverContentFiles(fullPath, relPath);
        files.push(...nestedFiles);
      } else if (stat.isFile() && entry.endsWith('.json')) {
        // Add JSON files
        files.push(relPath);
      }
    } catch {
      // Skip files we can't read
      continue;
    }
  }

  return files;
}

/**
 * Generate a route manifest from content files.
 * Maps routes to their corresponding slugs.
 *
 * @param contentFiles - Array of content file paths
 * @returns Route manifest object
 *
 * @example
 * generateRouteManifest(['home.json', 'services.json'])
 * // Returns: { '/': 'home', '/services': 'services' }
 */
export function generateRouteManifest(contentFiles: string[]): ContentManifest {
  const manifest: ContentManifest = {};

  for (const file of contentFiles) {
    // Remove .json extension
    const slug = file.replace(/\.json$/, '');

    // Map home to root route
    const route = slug === 'home' ? '/' : `/${slug}`;

    manifest[route] = slug;
  }

  return manifest;
}

/**
 * Validate that a content object has required fields.
 *
 * @param content - Content object to validate
 * @returns Validation result with error message if invalid
 */
export function validateContentFile(content: unknown): ContentValidationResult {
  if (!content || typeof content !== 'object') {
    return { valid: false, error: 'Content must be an object' };
  }

  const obj = content as Record<string, unknown>;

  // Most content files should have a header
  if (!obj.header || typeof obj.header !== 'object') {
    return { valid: false, error: 'Content must have a header object' };
  }

  const header = obj.header as Record<string, unknown>;
  if (!header.title || typeof header.title !== 'string') {
    return { valid: false, error: 'Header must have a title string' };
  }

  return { valid: true };
}

/**
 * Load content from a JSON file for a given route.
 *
 * @param route - The route to load content for (e.g., '/services')
 * @param contentDir - Absolute path to content directory
 * @returns Parsed content object or null if not found
 */
export function getContentForRoute(
  route: string,
  contentDir: string
): Record<string, unknown> | null {
  // Convert route to slug
  const slug = route === '/' ? 'home' : route.replace(/^\//, '');
  const filePath = path.join(contentDir, `${slug}.json`);

  if (!fs.existsSync(filePath)) {
    return null;
  }

  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(content);
  } catch {
    return null;
  }
}

/**
 * Check if a route has editable content.
 *
 * @param route - The route to check
 * @param manifest - The content manifest
 * @returns True if route is editable
 */
export function isRouteEditable(
  route: string,
  manifest: ContentManifest
): boolean {
  // Normalize route
  const normalizedRoute =
    route === '/' ? '/' : route.replace(/\/$/, '');
  return normalizedRoute in manifest;
}

// ============================================================================
// Build-time Helper
// ============================================================================

/**
 * Scan content directory and generate manifest at build time.
 * This is meant to be called during the build process.
 *
 * @param projectRoot - Project root directory
 * @returns Content manifest
 */
export function buildContentManifest(projectRoot: string): ContentManifest {
  const contentDir = path.join(projectRoot, 'content');
  const files = discoverContentFiles(contentDir);
  return generateRouteManifest(files);
}
