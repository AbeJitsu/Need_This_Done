import { defineConfig } from 'vitest/config';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    include: ['__tests__/**/*.integration.test.ts'],
    fileParallelism: false,
    maxWorkers: 1,
  },
  resolve: {
    alias: { '@': path.resolve(dirname, './') },
  },
});
