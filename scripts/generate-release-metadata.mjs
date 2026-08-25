#!/usr/bin/env node

import { execFileSync } from 'node:child_process';
import { mkdirSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

function normalizeGate(name) {
  const value = process.env[name];
  if (value === 'success' || value === 'passed') return 'passed';
  throw new Error(`${name} must report success or passed before release metadata can be emitted.`);
}

if (process.env.DEPLOYMENT_IDENTITY) {
  throw new Error('Pre-key release metadata cannot contain a deployment identity.');
}

const migrations = readdirSync(resolve(root, 'supabase/migrations'))
  .map((name) => /^(\d+)_.*\.sql$/.exec(name)?.[1])
  .filter(Boolean)
  .sort((left, right) => Number(left) - Number(right));

const metadata = {
  schemaVersion: 2,
  generatedAt: new Date().toISOString(),
  commit: execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim(),
  localMigrationHead: migrations.at(-1) || null,
  results: {
    dependencyAudit: normalizeGate('GATE_DEPENDENCY_AUDIT'),
    databaseSchemaRls: normalizeGate('GATE_DATABASE'),
    bridge: normalizeGate('GATE_BRIDGE'),
    code: normalizeGate('GATE_CODE'),
  },
  deploymentIdentity: null,
};

if (metadata.localMigrationHead !== '109') {
  throw new Error(`Pre-key release metadata requires local migration head 109; found ${metadata.localMigrationHead || 'none'}.`);
}

const output = resolve(root, process.env.RELEASE_METADATA_PATH || 'test-results/release-metadata.json');
mkdirSync(dirname(output), { recursive: true });
writeFileSync(output, `${JSON.stringify(metadata, null, 2)}\n`, { mode: 0o600 });
process.stdout.write(`${JSON.stringify(metadata)}\n`);
