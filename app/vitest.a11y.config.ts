import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'node:url';

const dirname = typeof __dirname !== 'undefined' ? __dirname : path.dirname(fileURLToPath(import.meta.url));

// Accessibility testing config - runs dark mode contrast tests
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    include: [
      '../__tests__/components/**/*.a11y.test.ts?(x)',
      '../__tests__/lib/**/*.test.ts',
      // Hook tests disabled due to jsdom/webidl-conversions compatibility issue
      // '../__tests__/hooks/**/*.test.ts?(x)',
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(dirname, './')
    }
  }
});
