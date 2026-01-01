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
      // Unit tests for lib functions
      '__tests__/lib/**/*.test.ts',
      // Unit tests for API routes
      '__tests__/api/**/*.test.ts',
    ],
  },
  resolve: {
    alias: {
      '@': path.resolve(dirname, './')
    }
  }
});
