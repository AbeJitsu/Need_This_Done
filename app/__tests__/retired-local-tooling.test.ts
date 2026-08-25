import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const APP_ROOT = resolve(__dirname, '..');

const retiredPaths = [
  'config/site.config.ts',
  'scripts/calculate-orange.ts',
  'scripts/capture-design-audit.ts',
  'scripts/page-char-audit.ts',
  'scripts/prototype-site-review.ts',
  'scripts/review-output.txt',
  'scripts/test-dark-mode.ts',
  'color-contrast-viewer.html',
  'component-route-map.json',
];

const retiredDependencies = [
  '@dnd-kit/core',
  '@dnd-kit/sortable',
  '@dnd-kit/utilities',
  'nanoid',
  're-resizable',
];

describe('retired local tooling', () => {
  it('keeps unused configuration and manual audit artifacts retired', () => {
    for (const path of retiredPaths) {
      expect(existsSync(resolve(APP_ROOT, path)), `${path} should remain retired`).toBe(false);
    }
  });

  it('keeps unreferenced UI dependencies out of the application manifest', () => {
    const packageJson = JSON.parse(readFileSync(resolve(APP_ROOT, 'package.json'), 'utf8')) as {
      dependencies?: Record<string, string>;
      devDependencies?: Record<string, string>;
    };
    const dependencies = {
      ...packageJson.dependencies,
      ...packageJson.devDependencies,
    };

    for (const dependency of retiredDependencies) {
      expect(dependencies, `${dependency} should remain retired`).not.toHaveProperty(dependency);
    }
  });
});
