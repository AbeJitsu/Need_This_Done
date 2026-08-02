import { defineConfig } from 'vitest/config';
import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dirname = path.dirname(fileURLToPath(import.meta.url));

// Integration tests use the active root profile through app/.env.local.
// The database suite is local-only; its caller switches to ENV_TARGET=local.
dotenv.config({ path: path.resolve(dirname, '../.env.local') });

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
