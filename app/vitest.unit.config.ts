import { defineConfig } from 'vitest/config';
import path from 'path';
import { fileURLToPath } from 'node:url';

const dirname = typeof __dirname !== 'undefined' ? __dirname : path.dirname(fileURLToPath(import.meta.url));

// Unit testing config - runs pure unit tests without jsdom or external services
// Only includes specific test files that don't require external dependencies
export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    include: [
      // Colors validation test - catches dark mode contrast issues
      '../__tests__/lib/colors.test.ts',
    ],
  },
  resolve: {
    alias: {
      '@': path.resolve(dirname, './')
    }
  }
});
