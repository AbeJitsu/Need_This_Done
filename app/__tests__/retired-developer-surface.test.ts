import { describe, expect, it } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const APP_ROOT = resolve(__dirname, '..');

const retiredPaths = [
  'app/admin/dev/page.tsx',
  'app/admin/dev/layout.tsx',
  'app/admin/dev/preview/page.tsx',
  'app/admin/dev/preview/layout.tsx',
  'app/api/demo/items/route.ts',
  'app/api/demo/speed/route.ts',
  'components/AuthDemo.tsx',
  'components/DatabaseDemo.tsx',
  'components/SpeedDemo.tsx',
  'components/SystemOverview.tsx',
  'components/HowItWorks.tsx',
  'components/DeviceShowcase/DeviceShowcase.tsx',
  'components/DeviceShowcase/DeviceFrame.tsx',
  'components/DeviceShowcase/ShowcaseControls.tsx',
];

describe('retired developer-tools surface', () => {
  it('keeps developer routes, demos, and route-only components retired', () => {
    for (const retiredPath of retiredPaths) {
      expect(existsSync(resolve(APP_ROOT, retiredPath)), `${retiredPath} should remain retired`).toBe(false);
    }
  });

  it('keeps developer-tool links out of retained navigation', () => {
    const navigationSources = [
      'components/Navigation.tsx',
      'components/AdminSidebar.tsx',
      'components/AdminDashboard.tsx',
    ].map((source) => readFileSync(resolve(APP_ROOT, source), 'utf8'));

    for (const source of navigationSources) {
      expect(source).not.toContain('/admin/dev');
    }
  });
});
