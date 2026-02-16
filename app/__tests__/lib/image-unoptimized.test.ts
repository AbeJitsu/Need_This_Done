import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

// ============================================================================
// Image Unoptimized Prop Test
// ============================================================================
// What: Ensures all next/image components have the unoptimized prop
// Why: Next.js 14.2.35's defaultLoader validates hostnames even when
//      unoptimized: true is set globally in next.config.cjs. External images
//      (Unsplash, Supabase) fail at runtime without per-component unoptimized.
// How: Scans all .tsx files for <Image usage and checks for unoptimized prop

function findTsxFiles(dir: string): string[] {
  const results: string[] = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    // Skip node_modules, .next, and test directories
    if (entry.name === 'node_modules' || entry.name === '.next' || entry.name === '__tests__' || entry.name === 'e2e') {
      continue;
    }

    if (entry.isDirectory()) {
      results.push(...findTsxFiles(fullPath));
    } else if (entry.name.endsWith('.tsx')) {
      results.push(fullPath);
    }
  }

  return results;
}

/**
 * Extract Image component usages from file content.
 * Returns array of { line, hasUnoptimized } for each <Image found.
 */
function findImageUsages(content: string): { line: number; snippet: string; hasUnoptimized: boolean }[] {
  const lines = content.split('\n');
  const usages: { line: number; snippet: string; hasUnoptimized: boolean }[] = [];

  for (let i = 0; i < lines.length; i++) {
    // Check if this line has <Image (the next/image component, not <ImageIcon or <ImageUpload etc.)
    if (/<Image\b/.test(lines[i]) && !/<Image[A-Z]/.test(lines[i])) {
      // Collect the full JSX element (may span multiple lines)
      let fullElement = '';
      let j = i;
      let depth = 0;

      // Find the closing > or /> of this JSX element
      while (j < lines.length && j < i + 15) {
        fullElement += lines[j] + '\n';
        // Check for self-closing /> or closing >
        if (lines[j].includes('/>') || (depth === 0 && j > i && lines[j].trim().startsWith('>'))) {
          break;
        }
        j++;
      }

      const hasUnoptimized = /\bunoptimized\b/.test(fullElement);
      usages.push({
        line: i + 1,
        snippet: lines[i].trim(),
        hasUnoptimized,
      });
    }
  }

  return usages;
}

describe('next/image unoptimized prop', () => {
  const appDir = path.resolve(__dirname, '../..');
  const tsxFiles = findTsxFiles(appDir);

  // Files that import next/image
  const filesWithImage = tsxFiles.filter((file) => {
    const content = fs.readFileSync(file, 'utf-8');
    return content.includes("from 'next/image'") || content.includes('from "next/image"');
  });

  it('should find files using next/image', () => {
    expect(filesWithImage.length).toBeGreaterThan(0);
  });

  it('every <Image> component must have the unoptimized prop', () => {
    const violations: string[] = [];

    for (const file of filesWithImage) {
      const content = fs.readFileSync(file, 'utf-8');
      const usages = findImageUsages(content);

      for (const usage of usages) {
        if (!usage.hasUnoptimized) {
          const relative = path.relative(appDir, file);
          violations.push(`${relative}:${usage.line} — missing unoptimized prop`);
        }
      }
    }

    if (violations.length > 0) {
      const message = [
        `Found ${violations.length} <Image> component(s) without unoptimized prop:`,
        '',
        ...violations.map((v) => `  - ${v}`),
        '',
        'Fix: Add the unoptimized prop to each <Image> component.',
        'Why: Next.js 14.2.35 defaultLoader validates hostnames even with global unoptimized:true.',
      ].join('\n');

      expect.fail(message);
    }
  });
});
