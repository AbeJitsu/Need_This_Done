#!/usr/bin/env npx tsx
/**
 * Build Component-to-Route Mapping
 *
 * Scans all page.tsx files to find which components they import,
 * then creates a reverse mapping: component → routes that use it.
 *
 * Usage:
 *   npm run screenshot:map
 *   npx tsx scripts/build-component-map.ts
 *
 * Output:
 *   app/component-route-map.json
 */

import * as fs from 'fs';
import * as path from 'path';
import { glob } from 'glob';

// Configuration
const OUTPUT_FILE = path.join(process.cwd(), 'component-route-map.json');

// Types
interface RouteInfo {
  path: string;
  file: string;
  imports: string[];
}

interface ComponentRouteMap {
  [componentPath: string]: string[];
}

interface FullMap {
  generatedAt: string;
  routes: RouteInfo[];
  componentToRoutes: ComponentRouteMap;
  globalFiles: string[];
}

// Files that affect ALL routes when changed
const GLOBAL_FILES = [
  'app/layout.tsx',
  'app/globals.css',
  'lib/colors.ts',
  'components/Navigation.tsx',
  'components/Footer.tsx',
];

/**
 * Convert file path to route path
 * e.g., app/pricing/page.tsx → /pricing
 */
function fileToRoute(filePath: string): string {
  // Remove app/ prefix and page.tsx suffix
  let route = filePath
    .replace(/^app\//, '')
    .replace(/\/page\.tsx$/, '')
    .replace(/page\.tsx$/, '');

  // Handle root route
  if (route === '') {
    return '/';
  }

  // Handle dynamic routes - keep [slug] format for now
  return '/' + route;
}

/**
 * Extract component imports from a file
 */
function extractImports(content: string): string[] {
  const imports: string[] = [];

  // Match imports from @/components
  const componentRegex = /from\s+['"]@\/components\/([^'"]+)['"]/g;
  let match;
  while ((match = componentRegex.exec(content)) !== null) {
    imports.push(`components/${match[1]}`);
  }

  // Match imports from @/lib
  const libRegex = /from\s+['"]@\/lib\/([^'"]+)['"]/g;
  while ((match = libRegex.exec(content)) !== null) {
    imports.push(`lib/${match[1]}`);
  }

  // Match imports from @/context
  const contextRegex = /from\s+['"]@\/context\/([^'"]+)['"]/g;
  while ((match = contextRegex.exec(content)) !== null) {
    imports.push(`context/${match[1]}`);
  }

  return imports;
}

/**
 * Normalize component path for consistent mapping
 */
function normalizeComponentPath(importPath: string): string {
  // Add .tsx extension if not present
  if (!importPath.endsWith('.tsx') && !importPath.endsWith('.ts')) {
    // Check if it's a directory import (index file)
    if (!importPath.includes('.')) {
      return importPath;
    }
  }
  return importPath;
}

async function main() {
  console.log('🔍 Scanning page files...\n');

  // Find all page.tsx files
  const pageFiles = await glob('app/**/page.tsx', {
    cwd: process.cwd(),
    ignore: ['node_modules/**', '.next/**'],
  });

  console.log(`Found ${pageFiles.length} pages\n`);

  const routes: RouteInfo[] = [];
  const componentToRoutes: ComponentRouteMap = {};

  // Process each page file
  for (const pageFile of pageFiles) {
    const fullPath = path.join(process.cwd(), pageFile);
    const content = fs.readFileSync(fullPath, 'utf-8');
    const route = fileToRoute(pageFile);
    const imports = extractImports(content);

    routes.push({
      path: route,
      file: pageFile,
      imports,
    });

    // Build reverse mapping
    for (const importPath of imports) {
      const normalized = normalizeComponentPath(importPath);
      if (!componentToRoutes[normalized]) {
        componentToRoutes[normalized] = [];
      }
      if (!componentToRoutes[normalized].includes(route)) {
        componentToRoutes[normalized].push(route);
      }
    }

    console.log(`  ${route}`);
    if (imports.length > 0) {
      console.log(`    └─ imports: ${imports.length} components`);
    }
  }

  // Create the full map
  const fullMap: FullMap = {
    generatedAt: new Date().toISOString(),
    routes,
    componentToRoutes,
    globalFiles: GLOBAL_FILES,
  };

  // Write to file
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(fullMap, null, 2));

  console.log(`\n✅ Generated ${OUTPUT_FILE}`);
  console.log(`   ${routes.length} routes mapped`);
  console.log(`   ${Object.keys(componentToRoutes).length} components tracked`);
  console.log(`   ${GLOBAL_FILES.length} global files defined`);
}

main().catch(console.error);
