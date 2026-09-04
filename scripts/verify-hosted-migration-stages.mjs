#!/usr/bin/env node

import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { readFileSync, readdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const manifestPath = resolve(repositoryRoot, 'scripts/hosted-migration-stages.json');
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

function versionRange(first, last, label) {
  if (!/^\d{3}$/.test(first) || !/^\d{3}$/.test(last) || Number(first) > Number(last)) {
    fail(`${label} must define a valid three-digit first/last range`);
  }
  return Array.from(
    { length: Number(last) - Number(first) + 1 },
    (_, index) => String(Number(first) + index).padStart(3, '0'),
  );
}

if (manifest.schema_version !== 2) fail(`unsupported manifest schema ${manifest.schema_version}`);
if (!/^[0-9a-f]{40}$/.test(manifest.source_commit)) fail('source_commit must be a full commit SHA');
if (manifest.source_hosted_latest !== '072') fail('historical mapping source must remain at hosted head 072');
if (manifest.expected_hosted_latest !== '095') fail('expected hosted head must be 095');

const hostedVersions = versionRange(
  manifest.historical_hosted_range?.first,
  manifest.historical_hosted_range?.last,
  'historical_hosted_range',
);
const pendingVersions = versionRange(
  manifest.pending_range?.first,
  manifest.pending_range?.last,
  'pending_range',
);
if (hostedVersions[0] !== '073' || hostedVersions.at(-1) !== manifest.expected_hosted_latest) {
  fail('historical hosted stages must cover exactly 073–095');
}
const retiredLocalOnlyVersions = manifest.retired_local_only_versions;
if (manifest.current_hosted_promotion_baseline !== '106') {
  fail('the current hosted promotion baseline must be exactly 106');
}
if (pendingVersions[0] !== '096' || pendingVersions.at(-1) !== '112') {
  fail('pending stages must span 096–112');
}
if (JSON.stringify(retiredLocalOnlyVersions) !== JSON.stringify(['107', '108', '109'])) {
  fail('only intentionally retired local-only versions 107–109 may be omitted');
}
if (Number(pendingVersions[0]) !== Number(hostedVersions.at(-1)) + 1) fail('hosted and pending migration ranges must begin contiguously');

const expectedVersions = [...hostedVersions, ...pendingVersions.filter((version) => !retiredLocalOnlyVersions.includes(version))];
const migrations = manifest.migrations;
const stages = manifest.stages;
if (!Array.isArray(migrations) || !migrations.length) fail('the manifest must define migration mappings');
if (!Array.isArray(stages) || !stages.length) fail('the manifest must define staged gates');

const seenNewVersions = new Set();
const seenOriginalVersions = new Set();
const seenNewFilenames = new Set();
const seenOriginalFilenames = new Set();
const migrationsByStage = new Map();
const stagesById = new Map();

for (const stage of stages) {
  if (!/^[a-z0-9-]+$/.test(stage.id || '') || stagesById.has(stage.id)) {
    fail(`invalid or duplicate stage id: ${stage.id}`);
  }
  if (stage.state !== 'hosted' && stage.state !== 'pending') fail(`invalid state for stage ${stage.id}`);
  if (!['separate', 'batch', 'final-separate'].includes(stage.gate)) fail(`invalid gate for stage ${stage.id}`);
  if (typeof stage.destructive !== 'boolean' || typeof stage.rationale !== 'string' || !stage.rationale.trim()) {
    fail(`stage ${stage.id} must define destructive and rationale fields`);
  }
  if (!Array.isArray(stage.migrations) || !stage.migrations.length) fail(`stage ${stage.id} is empty`);
  const allowedRange = stage.state === 'hosted' ? hostedVersions : pendingVersions;
  if (stage.migrations.some((version) => !allowedRange.includes(version))) {
    fail(`${stage.state} stage ${stage.id} crosses its manifest range`);
  }
  stagesById.set(stage.id, stage);
}

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
  const stageDefinition = stagesById.get(stage);
  if (!stageDefinition) fail(`unknown stage ${stage}`);
  if (!stageDefinition.migrations.includes(newVersion)) {
    fail(`stage ${stage} does not list mapped migration ${newVersion}`);
  }

  let current;
  try {
    current = readFileSync(resolve(migrationRoot, newFilename));
  } catch {
    fail(`new migration file is missing: ${newFilename}`);
  }
  if (sha256(current) !== newSha) fail(`new hash mismatch: ${newFilename}`);

  if (newOnly) {
    if (originalVersion !== newVersion || originalFilename !== newFilename || originalSha !== newSha) {
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

for (const [label, seen] of [['new', seenNewVersions], ['original', seenOriginalVersions]]) {
  if (seen.size !== expectedVersions.length || expectedVersions.some((version) => !seen.has(version))) {
    fail(`${label} migration versions are not an exact one-to-one map for staged versions`);
  }
}

const currentStagedFiles = readdirSync(migrationRoot)
  .filter((filename) => {
    const match = /^(\d{3})_.*\.sql$/.exec(filename);
    return match && expectedVersions.includes(match[1]);
  })
  .sort();
const mappedStagedFiles = migrations.map((migration) => migration.new_filename).sort();
if (JSON.stringify(currentStagedFiles) !== JSON.stringify(mappedStagedFiles)) {
  fail(`migration files do not match the manifest: ${currentStagedFiles.join(', ')}`);
}

const stagedVersions = [];
for (const stage of stages) {
  const mappedVersions = migrationsByStage.get(stage.id) || [];
  if (JSON.stringify(mappedVersions) !== JSON.stringify(stage.migrations)) {
    fail(`migration-to-stage mapping mismatch: ${stage.id}`);
  }
  stagedVersions.push(...stage.migrations);
}
if (stagedVersions.length !== expectedVersions.length || expectedVersions.some((version) => !stagedVersions.includes(version))) {
  fail('stage coverage is not an exact one-to-one map for staged versions');
}

const hostedStageVersions = stages.filter((stage) => stage.state === 'hosted').flatMap((stage) => stage.migrations);
const pendingStageVersions = stages.filter((stage) => stage.state === 'pending').flatMap((stage) => stage.migrations);
if (JSON.stringify(hostedStageVersions) !== JSON.stringify(hostedVersions)) fail('hosted stages are not contiguous 073–095');
if (JSON.stringify(pendingStageVersions) !== JSON.stringify(pendingVersions.filter((version) => !retiredLocalOnlyVersions.includes(version)))) fail('pending stages do not cover exactly 096–106 and 110–112');

console.log(`Hosted migration staging verified: ${migrations.length} mappings, ${stages.length} gates; historical map through ${manifest.expected_hosted_latest}; current promotion baseline ${manifest.current_hosted_promotion_baseline}; pending 096–106 and 110–112 (107–109 intentionally retired local-only). SQL hashes preserved.`);
for (const stage of stages) {
  console.log(`${stage.state}: ${stage.id}: ${stage.migrations.join(', ')}${stage.destructive ? ' [destructive, final separate gate]' : ''}`);
}
