import { describe, expect, it } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const APP_ROOT = resolve(__dirname, '..');

const retiredPaths = [
  'app/admin/content/page.tsx',
  'app/admin/content/[slug]/edit/page.tsx',
  'app/api/layout-content/route.ts',
  'app/api/page-content/[slug]/route.ts',
  'context/InlineEditContext.tsx',
  'components/InlineEditor',
  'components/content-editor',
  'hooks/useEditableContent.ts',
  'hooks/useUniversalClick.ts',
  'lib/fetch-page-content.ts',
];

describe('retired inline-editor surface', () => {
  it('keeps editor routes, APIs, providers, and components retired', () => {
    for (const retiredPath of retiredPaths) {
      expect(existsSync(resolve(APP_ROOT, retiredPath)), `${retiredPath} should remain retired`).toBe(false);
    }
  });

  it('keeps the retired content editor out of retained navigation and layout', () => {
    const sources = [
      'app/layout.tsx',
      'components/AdminSidebar.tsx',
      'components/AdminDashboard.tsx',
    ].map((source) => readFileSync(resolve(APP_ROOT, source), 'utf8'));

    for (const source of sources) {
      expect(source).not.toContain('/admin/content');
      expect(source).not.toContain('InlineEditProvider');
    }
  });
});
