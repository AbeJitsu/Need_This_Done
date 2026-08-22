#!/usr/bin/env node

import { execFileSync } from 'node:child_process';
import { mkdirSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const migrations = readdirSync(resolve(root, 'supabase/migrations'))
  .map((name) => /^(\d+)_.*\.sql$/.exec(name)?.[1])
  .filter(Boolean)
  .sort((left, right) => Number(left) - Number(right));
const metadata = {
  generated_at: new Date().toISOString(),
  commit: execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim(),
  local_migration_head: migrations.at(-1) || null,
  gates: {
    migration_stage: process.env.GATE_MIGRATION_STAGE || 'not_run',
    database: process.env.GATE_DATABASE || 'not_run',
    bridge: process.env.GATE_BRIDGE || 'not_run',
    code: process.env.GATE_CODE || 'not_run',
    provider_free_assembly: process.env.GATE_PROVIDER_FREE_ASSEMBLY || 'not_run',
  },
  // Deployment is intentionally unset in local/CI proof. A later separately
  // approved promotion must set this identity rather than infer one.
  deployment_identity: process.env.DEPLOYMENT_IDENTITY || null,
};
const output = resolve(root, process.env.RELEASE_METADATA_PATH || 'test-results/release-metadata.json');
mkdirSync(dirname(output), { recursive: true });
writeFileSync(output, `${JSON.stringify(metadata, null, 2)}\n`, { mode: 0o600 });
process.stdout.write(`${JSON.stringify(metadata)}\n`);
