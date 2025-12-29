// ============================================================================
// Color System Tests
// ============================================================================
// Validates that color definitions maintain proper dark mode contrast
// Catches issues like low-opacity backgrounds that cause invisible text
//
// This test reads the colors.ts file directly to avoid jsdom dependencies

import { describe, it, expect, beforeAll } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('statusBadgeColors', () => {
  let colorsFileContent: string;

  beforeAll(() => {
    const colorsPath = path.join(__dirname, '../../app/lib/colors.ts');
    colorsFileContent = fs.readFileSync(colorsPath, 'utf-8');
  });

  // ============================================================================
  // Dark Mode Contrast Tests
  // ============================================================================
  // These tests ensure badge backgrounds are solid in dark mode
  // Low opacity backgrounds (e.g., dark:bg-*-900/20) cause text to be invisible

  it('should not use low-opacity backgrounds in dark mode for status badges', () => {
    // Extract the statusBadgeColors section
    const statusBadgeStart = colorsFileContent.indexOf('export const statusBadgeColors');
    const statusBadgeEnd = colorsFileContent.indexOf('};', statusBadgeStart) + 2;
    const statusBadgeSection = colorsFileContent.slice(statusBadgeStart, statusBadgeEnd);

    // Find all dark:bg-*-*/NUMBER patterns (opacity values)
    const lowOpacityPattern = /dark:bg-[a-z]+-\d+\/\d+/g;
    const matches = statusBadgeSection.match(lowOpacityPattern);

    if (matches && matches.length > 0) {
      throw new Error(
        `Found ${matches.length} low-opacity dark mode backgrounds that cause contrast issues:\n` +
          `${matches.map((m) => `  - ${m}`).join('\n')}\n\n` +
          `Fix: Use solid backgrounds like dark:bg-*-800 instead of dark:bg-*-900/20`
      );
    }
  });

  it('should have dark mode variants for all status badge backgrounds', () => {
    const statusBadgeStart = colorsFileContent.indexOf('export const statusBadgeColors');
    const statusBadgeEnd = colorsFileContent.indexOf('};', statusBadgeStart) + 2;
    const statusBadgeSection = colorsFileContent.slice(statusBadgeStart, statusBadgeEnd);

    // Check that all bg: lines have dark: variants
    const bgLines = statusBadgeSection.match(/bg:\s*'[^']+'/g) || [];

    bgLines.forEach((line) => {
      expect(line).toContain('dark:');
    });
  });

  it('should have dark mode variants for all status badge text colors', () => {
    const statusBadgeStart = colorsFileContent.indexOf('export const statusBadgeColors');
    const statusBadgeEnd = colorsFileContent.indexOf('};', statusBadgeStart) + 2;
    const statusBadgeSection = colorsFileContent.slice(statusBadgeStart, statusBadgeEnd);

    // Check that all text: lines have dark: variants
    const textLines = statusBadgeSection.match(/text:\s*'[^']+'/g) || [];

    textLines.forEach((line) => {
      expect(line).toContain('dark:');
    });
  });
});
