#!/usr/bin/env node

import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { readFileSync, readdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const manifestPath = resolve(repositoryRoot, 'docs/launch/hosted-migration-stages.json');
const migrationRoot = resolve(repositoryRoot, 'supabase/migrations');
const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));

function fail(message) {
  console.error(`Hosted migration staging verification failed: ${message}`);
  process.exit(1);
}

function sha256(value) {
  return createHash('sha256').update(value).digest('hex');
}

function gitShow(commit, path) {
  try {
    return execFileSync('git', ['show', `${commit}:${path}`], {
      cwd: repositoryRoot,
      encoding: 'buffer',
      stdio: ['ignore', 'pipe', 'pipe'],
    });
  } catch {
    fail(`cannot read ${path} from source commit ${commit}`);
  }
}

if (manifest.schema_version !== 1) fail(`unsupported manifest schema ${manifest.schema_version}`);
if (!/^[0-9a-f]{40}$/.test(manifest.source_commit)) fail('source_commit must be a full commit SHA');
if (manifest.expected_hosted_latest !== '072') fail('expected hosted history must remain at 072');

const expectedVersions = Array.from({ length: 22 }, (_, index) => String(index + 73).padStart(3, '0'));
const migrations = manifest.migrations;
const stages = manifest.stages;
if (!Array.isArray(migrations) || migrations.length !== expectedVersions.length) {
  fail('the manifest must map exactly the 21 pending migration versions');
}
if (!Array.isArray(stages) || stages.length !== 8) fail('the manifest must define exactly eight staged gates');

const seenNewVersions = new Set();
const seenOriginalVersions = new Set();
const seenNewFilenames = new Set();
const seenOriginalFilenames = new Set();
const migrationsByStage = new Map();

for (const migration of migrations) {
  const {
    new_version: newVersion,
    new_filename: newFilename,
    original_version: originalVersion,
    original_filename: originalFilename,
    original_sha256: originalSha,
    new_sha256: newSha,
    stage,
    new_only: newOnly = false,
  } = migration;

  if (!expectedVersions.includes(newVersion)) fail(`unexpected new version ${newVersion}`);
  if (!/^\d{3}_[a-z0-9_]+\.sql$/.test(newFilename) || !newFilename.startsWith(`${newVersion}_`)) {
    fail(`new filename does not match ${newVersion}: ${newFilename}`);
  }
  if (!/^\d{3}_[a-z0-9_]+\.sql$/.test(originalFilename) || !originalFilename.startsWith(`${originalVersion}_`)) {
    fail(`original filename does not match ${originalVersion}: ${originalFilename}`);
  }
  for (const [label, value, seen] of [
    ['new version', newVersion, seenNewVersions],
    ['original version', originalVersion, seenOriginalVersions],
    ['new filename', newFilename, seenNewFilenames],
    ['original filename', originalFilename, seenOriginalFilenames],
  ]) {
    if (seen.has(value)) fail(`duplicate ${label}: ${value}`);
    seen.add(value);
  }
  if (!/^[0-9a-f]{64}$/.test(originalSha) || !/^[0-9a-f]{64}$/.test(newSha)) {
    fail(`invalid SHA-256 mapping for ${newFilename}`);
  }
  if (!stages.some((candidate) => candidate.id === stage)) fail(`unknown stage ${stage}`);

  const currentPath = resolve(migrationRoot, newFilename);
  let current;
  try {
    current = readFileSync(currentPath);
  } catch {
    fail(`new migration file is missing: ${newFilename}`);
  }
  if (sha256(current) !== newSha) fail(`new hash mismatch: ${newFilename}`);

  if (newOnly) {
    if (!['093', '094'].includes(newVersion) || originalVersion !== newVersion || originalFilename !== newFilename || originalSha !== newSha) {
      fail(`new-only migration metadata is invalid: ${newFilename}`);
    }
  } else {
    const originalPath = `supabase/migrations/${originalFilename}`;
    if (sha256(gitShow(manifest.source_commit, originalPath)) !== originalSha) {
      fail(`original hash mismatch: ${originalFilename}`);
    }
    if (originalSha !== newSha) fail(`SQL behavior changed during rename: ${originalFilename} -> ${newFilename}`);
  }

  if (!migrationsByStage.has(stage)) migrationsByStage.set(stage, []);
  migrationsByStage.get(stage).push(newVersion);
}

if (new Set(expectedVersions).size !== seenNewVersions.size || expectedVersions.some((version) => !seenNewVersions.has(version))) {
  fail('new migration versions are not an exact one-to-one map for 073–094');
}
if (seenOriginalVersions.size !== expectedVersions.length || expectedVersions.some((version) => !seenOriginalVersions.has(version))) {
  fail('original migration versions are not an exact one-to-one map for 073–094');
}

const currentPendingFiles = readdirSync(migrationRoot)
  .filter((filename) => /^(07[3-9]|08[0-9]|09[0-4])_.*\.sql$/.test(filename))
  .sort();
const mappedPendingFiles = migrations.map((migration) => migration.new_filename).sort();
if (JSON.stringify(currentPendingFiles) !== JSON.stringify(mappedPendingFiles)) {
  fail(`pending migration files do not match the manifest: ${currentPendingFiles.join(', ')}`);
}

const expectedStages = [
  ['calendar-token-security', ['073'], 'separate', false],
  ['storage-bucket-normalization', ['074'], 'separate', false],
  ['additive-product-workflow', ['075', '076', '077', '078', '079', '080'], 'batch', false],
  ['growth-profile-evaluation', ['081'], 'separate', false],
  ['research-agent-planner', ['082', '083', '084', '085', '086', '087', '088', '089'], 'batch', false],
  ['destructive-retirement', ['090', '091', '092'], 'final-separate', true],
  ['storage-policy-repair', ['093'], 'separate', false],
  ['worker-claim-context-repair', ['094'], 'separate', false],
];
for (const [id, expectedStageVersions, gate, destructive] of expectedStages) {
  const stage = stages.find((candidate) => candidate.id === id);
  if (!stage) fail(`missing stage ${id}`);
  const actualVersions = stage.migrations || [];
  if (stage.gate !== gate || stage.destructive !== destructive || JSON.stringify(actualVersions) !== JSON.stringify(expectedStageVersions)) {
    fail(`stage definition mismatch: ${id}`);
  }
  const mappedVersions = [...(migrationsByStage.get(id) || [])].sort();
  if (JSON.stringify(mappedVersions) !== JSON.stringify([...expectedStageVersions].sort())) {
    fail(`migration-to-stage mapping mismatch: ${id}`);
  }
}

console.log(`Hosted migration staging verified: ${migrations.length} mappings, ${stages.length} gates, SQL hashes preserved and the new security repair is tracked.`);
for (const stage of stages) {
  console.log(`${stage.id}: ${stage.migrations.join(', ')}${stage.destructive ? ' [destructive, final separate gate]' : ''}`);
}
