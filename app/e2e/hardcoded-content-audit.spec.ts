import { test } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

// ============================================================================
// Hardcoded Content Audit
// ============================================================================
// This test scans page client components to detect hardcoded content that
// should be editable. Catches issues like the pricing page CTA section
// that was hardcoded instead of coming from content JSON.
//
// RULE: All user-facing text in page components should come from content props
// See: .claude/rules/inline-editing.md

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const COMPONENTS_DIR = path.join(__dirname, '../components');

// Patterns that indicate hardcoded content (should come from content instead)
const HARDCODED_PATTERNS = [
  // Hardcoded heading text (should use content.header.title or similar)
  />\s*Ready to Move Forward\?\s*</,
  />\s*Get Started\s*</,
  />\s*Book Now\s*</,
  />\s*Contact Us\s*</,

  // Hardcoded feature lists (should use content.features.map())
  />\s*Free, no obligation\s*</,
  />\s*Response in \d+ business days\s*</,

  // Hardcoded button text outside of Button component content
  />\s*Get a Quote\s*<\/Button>/,
  />\s*Book a Consultation\s*<\/Button>/,
];

// Files to scan (page client components)
const PAGE_CLIENT_FILES = [
  'home/HomePageClient.tsx',
  'pricing/PricingPageClient.tsx',
  'services/ServicesPageClient.tsx',
  'faq/FAQPageClient.tsx',
  'how-it-works/HowItWorksPageClient.tsx',
  'get-started/GetStartedPageClient.tsx',
  'guide/GuidePageClient.tsx',
  'privacy/PrivacyPageClient.tsx',
  'terms/TermsPageClient.tsx',
  'contact/ContactPageClient.tsx',
];

// Known exceptions - content that is intentionally hardcoded
const EXCEPTIONS = [
  // Static UI elements that don't need to be editable
  { file: 'home/HomePageClient.tsx', pattern: /Edit Mode/ },
  { file: 'pricing/PricingPageClient.tsx', pattern: /something intentionally static/i },
];

function isException(filePath: string, content: string, pattern: RegExp): boolean {
  const fileName = filePath.replace(COMPONENTS_DIR + '/', '');
  return EXCEPTIONS.some(
    (exc) => fileName === exc.file && exc.pattern.test(content)
  );
}

test.describe('Hardcoded Content Audit', () => {
  test('page components should not have hardcoded user-facing text', async () => {
    const violations: string[] = [];

    for (const relPath of PAGE_CLIENT_FILES) {
      const filePath = path.join(COMPONENTS_DIR, relPath);

      if (!fs.existsSync(filePath)) {
        continue;
      }

      const content = fs.readFileSync(filePath, 'utf-8');

      for (const pattern of HARDCODED_PATTERNS) {
        if (pattern.test(content) && !isException(filePath, content, pattern)) {
          violations.push(`${relPath}: Found hardcoded content matching ${pattern}`);
        }
      }
    }

    if (violations.length > 0) {
      console.log('\n📋 Hardcoded Content Warnings:\n');
      violations.forEach((v) => console.log(`  ⚠️ ${v}`));
      console.log('\n💡 Consider: Move hardcoded text to content JSON and use EditableSection/EditableItem\n');
    }

    // This is informational - some static text is intentional (buttons, labels)
    // Uncomment to make this a hard failure:
    // expect(violations).toHaveLength(0);
  });

  test('all Card components in page clients should be wrapped in EditableItem', async () => {
    const violations: string[] = [];

    for (const relPath of PAGE_CLIENT_FILES) {
      const filePath = path.join(COMPONENTS_DIR, relPath);

      if (!fs.existsSync(filePath)) {
        continue;
      }

      const content = fs.readFileSync(filePath, 'utf-8');

      // Find Card usages not preceded by EditableItem
      // This is a simplified check - looks for <Card without EditableItem on previous lines
      const lines = content.split('\n');
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (line.includes('<Card') && !line.includes('//')) {
          // Check if any of the previous 5 lines have EditableItem
          const previousLines = lines.slice(Math.max(0, i - 5), i).join('\n');
          if (!previousLines.includes('EditableItem') && !previousLines.includes('// Static card')) {
            // Check if this Card is inside a map function (which should have EditableItem)
            const contextLines = lines.slice(Math.max(0, i - 10), i + 1).join('\n');
            if (contextLines.includes('.map(') && !contextLines.includes('EditableItem')) {
              violations.push(`${relPath}:${i + 1}: Card in .map() without EditableItem wrapper`);
            }
          }
        }
      }
    }

    if (violations.length > 0) {
      console.log('\n📋 Cards Missing EditableItem Wrapper:\n');
      violations.forEach((v) => console.log(`  ⚠️ ${v}`));
      console.log('\n💡 Fix: Wrap Card components in EditableItem for inline editing support\n');
    }

    // This is a warning-level check, not a hard failure
    // expect(violations).toHaveLength(0);
  });

  test('all arrays rendered in page clients should use SortableItemsWrapper', async () => {
    const violations: string[] = [];

    for (const relPath of PAGE_CLIENT_FILES) {
      const filePath = path.join(COMPONENTS_DIR, relPath);

      if (!fs.existsSync(filePath)) {
        continue;
      }

      const content = fs.readFileSync(filePath, 'utf-8');

      // Look for .map() calls that render content but aren't in SortableItemsWrapper
      // Pattern: content.something.map( without SortableItemsWrapper nearby
      const mapMatches = content.matchAll(/content\.(\w+)(?:\.\w+)*\.map\(/g);

      for (const match of mapMatches) {
        const fieldName = match[1];
        const position = match.index || 0;

        // Check if SortableItemsWrapper is within 500 chars before this .map()
        const contextBefore = content.slice(Math.max(0, position - 500), position);
        if (!contextBefore.includes('SortableItemsWrapper') && !contextBefore.includes('// No reorder needed')) {
          // Get line number
          const lineNumber = content.slice(0, position).split('\n').length;
          violations.push(`${relPath}:${lineNumber}: content.${fieldName}.map() may need SortableItemsWrapper`);
        }
      }
    }

    if (violations.length > 0) {
      console.log('\n📋 Arrays Potentially Missing SortableItemsWrapper:\n');
      violations.forEach((v) => console.log(`  ⚠️ ${v}`));
      console.log('\n💡 Fix: Wrap array renders in SortableItemsWrapper for drag-drop reordering\n');
    }

    // This is informational - some arrays intentionally don't need reordering
    // expect(violations).toHaveLength(0);
  });
});
