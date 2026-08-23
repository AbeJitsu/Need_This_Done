#!/usr/bin/env node

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');

function read(path) {
  return readFileSync(resolve(root, path), 'utf8');
}

function fail(message) {
  console.error(`Pre-key CI contract verification failed: ${message}`);
  process.exitCode = 1;
}

const providerModes = [
  'TRANSACTIONAL_RESEND_PROVIDER',
  'PROSPECTING_RESEND_PROVIDER',
  'CALENDAR_PROVIDER',
  'STRIPE_INVOICE_PROVIDER',
];
const webhookSecrets = [
  'TRANSACTIONAL_RESEND_WEBHOOK_SECRET',
  'PROSPECTING_RESEND_WEBHOOK_SECRET',
  'STRIPE_WEBHOOK_SECRET',
];
for (const examplePath of ['.env.example', 'app/.env.example']) {
  const example = read(examplePath);
  for (const name of [...providerModes, ...webhookSecrets]) {
    if (!new RegExp(`^${name}=$`, 'm').test(example)) {
      fail(`${examplePath} must contain a blank ${name} entry`);
    }
  }
}

const assembly = read('scripts/verify-local-assembly.sh');
for (const name of providerModes) {
  if (!assembly.includes(`export ${name}=disabled`)) {
    fail(`provider-free assembly does not force ${name}=disabled`);
  }
}
for (const name of webhookSecrets) {
  if (!assembly.includes(`export ${name}=`)) {
    fail(`provider-free assembly does not clear ${name}`);
  }
}
const workflow = read('.github/workflows/test-variants.yml');
for (const job of ['audit', 'database', 'bridge', 'code', 'release-metadata']) {
  if (!new RegExp(`^  ${job}:`, 'm').test(workflow)) fail(`workflow is missing the ${job} job`);
}
if (!workflow.includes('needs: [audit, database, bridge, code]')) {
  fail('release metadata must depend on all four independent gates');
}

if (!process.exitCode) {
  console.log('Pre-key CI contract verified: provider controls are explicit and blank in examples; four independent gates precede release metadata.');
}
