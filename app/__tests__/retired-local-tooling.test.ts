import { existsSync } from 'node:fs';
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
];

describe('retired local tooling', () => {
  it('keeps unused configuration and manual audit artifacts retired', () => {
    for (const path of retiredPaths) {
      expect(existsSync(resolve(APP_ROOT, path)), `${path} should remain retired`).toBe(false);
    }
  });
});
