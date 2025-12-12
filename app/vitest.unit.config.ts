import { defineConfig } from 'vitest/config'
import path from 'path'

// ============================================================================
// Unit Test Configuration
// ============================================================================
// For testing isolated modules with mocked dependencies.
// These tests do NOT require Docker or external services.
//
// Run with: npm run test:unit

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    include: ['**/__tests__/**/*.unit.test.ts'],
    testTimeout: 10000,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
})
