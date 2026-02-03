import { defineConfig } from 'vitest/config';
import { loadEnv } from 'vite';
import path from 'path';
import { fileURLToPath } from 'node:url';

const dirname = typeof __dirname !== 'undefined' ? __dirname : path.dirname(fileURLToPath(import.meta.url));

// Unit testing config - runs pure unit tests without jsdom or external services
// Only includes specific test files that don't require external dependencies
export default defineConfig(({ mode }) => {
  // Load env vars from .env.local (pulled from Vercel)
  const env = loadEnv(mode, dirname, '');

  return {
    test: {
      environment: 'node',
      globals: true,
      env,
      include: [
        // Unit tests for lib functions
        '__tests__/lib/**/*.test.ts',
        // Unit tests for API routes
        '__tests__/api/**/*.test.ts',
      ],
      exclude: [
        // Integration tests run separately with vitest.integration.config.ts
        '**/*.integration.test.ts',
      ],
    },
    resolve: {
      alias: {
        '@': path.resolve(dirname, './')
      }
    }
  };
});
