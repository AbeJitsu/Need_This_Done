#!/usr/bin/env node

// Deterministic, read-only Step 4 gate. This command composes the existing
// migration-map verifier, the six allowlisted hosted dry-run verifiers, and
// the disposable historical-data rehearsal. It never authorizes or invokes a
// hosted write.

import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import {
  existsSync,
  lstatSync,
  readFileSync,
} from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const manifestPath = resolve(repositoryRoot, 'docs/launch/hosted-migration-stages.json');
const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
const defaultBackupRoot = '/Users/abiezerreyes/Documents/NeedThisDone Backups/2026-08-11-pre-migration-072-url-retry';
const backupRoot = resolve(process.env.NEEDTHISDONE_STEP4_BACKUP_DIR || defaultBackupRoot);
const expectedHostedRows = 68;
const expectedHostedLatest = '072';
const expectedBackupArtifacts = [
  'schema.sql',
  'data.sql',
  'roles.sql',
  'storage-buckets.json',
  'storage-objects.jsonl',
  'storage-inventory-summary.json',
  'storage-objects-project-attachments.json',
  'hosted-migration-history.json',
];

const summary = {
  gate: 'hosted-migration-step4',
  schema_version: 1,
  status: 'failed',
  technical_pass: {
    status: 'not_run',
    mapping_verifier: 'not_run',
    hosted_dry_runs: [],
  },
  data_impact_pass: {
    status: 'not_run',
    backup_checksum_manifest: 'not_run',
    local_rehearsal: 'not_run',
  },
  hosted_history_assertion: {
    rows: expectedHostedRows,
    latest: expectedHostedLatest,
  },
  hosted_writes: 0,
  hosted_write_authorized: false,
  step5_status: 'PENDING_APPROVAL',
  review_confirmation_only: true,
};

class GateFailure extends Error {}

function fail(message) {
  throw new GateFailure(message);
}

function sha256(value) {
  return createHash('sha256').update(value).digest('hex');
}

function redact(output, environment = {}) {
  let result = output || '';
  for (const [key, value] of Object.entries(environment)) {
    if (!value || value.length < 8) continue;
    if (!/(KEY|SECRET|TOKEN|PASSWORD|PRIVATE|CREDENTIAL)/i.test(key)) continue;
    result = result.split(value).join('[redacted]');
  }
  return result
    .replace(/(supabase[_-]?access[_-]?token\s*[=:]\s*)[^\s\n]+/gi, '$1[redacted]')
    .replace(/(service[_-]?role[_-]?key\s*[=:]\s*)[^\s\n]+/gi, '$1[redacted]');
}

function run(command, args, { label, environment = process.env } = {}) {
  const result = spawnSync(command, args, {
    cwd: repositoryRoot,
    env: environment,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  const output = `${result.stdout || ''}\n${result.stderr || ''}`;
  if (result.error || result.status !== 0) {
    const detail = redact(output, environment).trim();
    fail(`${label} failed${detail ? `: ${detail}` : ''}`);
  }
  return output;
}

function runHostedDryRun(stageId, stage, environment) {
  const args = [
    'scripts/verify-hosted-migration-stage.mjs',
    '--stage',
    stageId,
    '--dry-run',
  ];

  // Keep the hosted boundary obvious and mechanically checked at the caller
  // as well as inside the existing stage verifier.
  if (args.filter((argument) => argument === '--dry-run').length !== 1) {
    fail(`hosted stage ${stageId} is missing its required --dry-run flag`);
  }
  if (args.includes('--write') || args.includes('--apply') || args.includes('reset')) {
    fail(`hosted stage ${stageId} contains a write-capable argument`);
  }

  const output = run(process.execPath, args, {
    label: `hosted dry run ${stageId}`,
    environment,
  });
  const historyAssertion = `Remote history before and after remains at ${expectedHostedLatest} (${expectedHostedRows} rows).`;
  const matches = output.match(new RegExp(historyAssertion.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || [];
  if (matches.length !== 1) {
    fail(`hosted dry run ${stageId} did not emit exactly one ${expectedHostedRows}-row/${expectedHostedLatest} history assertion`);
  }

  return {
    stage: stageId,
    migrations: stage.migrations,
    invocation: args,
    dry_run: true,
    hosted_history_before_rows: expectedHostedRows,
    hosted_history_before_latest: expectedHostedLatest,
    hosted_history_after_rows: expectedHostedRows,
    hosted_history_after_latest: expectedHostedLatest,
    status: 'passed',
  };
}

function verifyBackupManifest() {
  if (!existsSync(backupRoot) || lstatSync(backupRoot).isSymbolicLink()) {
    fail(`protected backup directory is missing or symlinked: ${backupRoot}`);
  }
  const backupManifestPath = join(backupRoot, 'SHA256SUMS-FINAL.txt');
  if (!existsSync(backupManifestPath) || lstatSync(backupManifestPath).isSymbolicLink()) {
    fail(`protected backup checksum manifest is missing or symlinked: ${backupManifestPath}`);
  }

  const lines = readFileSync(backupManifestPath, 'utf8').trim().split(/\r?\n/).filter(Boolean);
  if (lines.length !== expectedBackupArtifacts.length) {
    fail(`protected backup checksum manifest must contain exactly ${expectedBackupArtifacts.length} artifacts; found ${lines.length}`);
  }

  const expectedNames = new Set(expectedBackupArtifacts);
  const seenNames = new Set();
  const artifacts = [];
  for (const line of lines) {
    const match = line.match(/^([0-9a-f]{64})\s{2}(.+)$/);
    if (!match) fail(`invalid protected backup checksum line: ${line}`);
    const [, expectedHash, filename] = match;
    if (!expectedNames.has(filename)) fail(`unexpected protected backup artifact: ${filename}`);
    if (seenNames.has(filename)) fail(`duplicate protected backup artifact: ${filename}`);
    seenNames.add(filename);

    const artifactPath = join(backupRoot, filename);
    if (resolve(artifactPath) !== join(backupRoot, filename) || !existsSync(artifactPath)) {
      fail(`protected backup artifact is missing or escapes the backup directory: ${filename}`);
    }
    const stat = lstatSync(artifactPath);
    if (!stat.isFile() || stat.isSymbolicLink()) fail(`protected backup artifact is not a regular file: ${filename}`);
    const actualHash = sha256(readFileSync(artifactPath));
    if (actualHash !== expectedHash) fail(`protected backup checksum mismatch: ${filename}`);
    artifacts.push({ filename, sha256: actualHash });
  }
  if (seenNames.size !== expectedBackupArtifacts.length) fail('protected backup checksum manifest is missing an expected artifact');

  const history = JSON.parse(readFileSync(join(backupRoot, 'hosted-migration-history.json'), 'utf8'));
  const versions = history.migrations?.map((migration) => migration.version);
  if (!Array.isArray(versions) || versions.length !== expectedHostedRows || versions.at(-1) !== expectedHostedLatest) {
    fail(`protected backup migration history must contain ${expectedHostedRows} rows/latest ${expectedHostedLatest}`);
  }

  return {
    status: 'passed',
    manifest: 'SHA256SUMS-FINAL.txt',
    artifact_count: artifacts.length,
    artifacts,
    hosted_history_rows: versions.length,
    hosted_history_latest: versions.at(-1),
  };
}

function verifyRehearsalOutput(output) {
  const unchangedMarker = 'Legacy table, Medusa, and retired-bucket inventory unchanged.';
  const unchangedChecks = output.split(unchangedMarker).length - 1;
  if (unchangedChecks !== 5) {
    fail(`historical-data rehearsal must prove unchanged legacy inventory after five stages; found ${unchangedChecks} assertions`);
  }
  const requiredMarkers = [
    'Pre-cleanup page_views constraint and retained historical objects verified.',
    'Applying isolated final destructive stage: destructive-retirement',
    'Retired objects are absent and retained objects remain present.',
    'Historical-data staged migration rehearsal passed through 092.',
  ];
  for (const marker of requiredMarkers) {
    if (!output.includes(marker)) fail(`historical-data rehearsal did not emit required proof: ${marker}`);
  }

  return {
    status: 'passed',
    reset_acknowledged: true,
    isolated_final_cleanup_acknowledged: true,
    cumulative_stage_count: 5,
    unchanged_legacy_inventory_assertions: unchangedChecks,
    pre_cleanup_constraint_and_retention_assertion: 'passed',
    retired_objects_after_092: 'absent',
    retained_objects_after_092: 'present',
  };
}

function main() {
  if (process.argv.length !== 2) {
    fail('this gate accepts no command-line arguments; hosted execution is never in scope');
  }
  if (manifest.expected_hosted_latest !== expectedHostedLatest) {
    fail(`staged manifest expected hosted latest is not ${expectedHostedLatest}`);
  }

  const backupResult = verifyBackupManifest();
  summary.data_impact_pass.backup_checksum_manifest = backupResult;

  const mappingOutput = run(process.execPath, ['scripts/verify-hosted-migration-stages.mjs'], {
    label: 'migration mapping verifier',
  });
  if (!mappingOutput.includes('SQL hashes preserved.')) {
    fail('migration mapping verifier did not emit its hash-preservation proof');
  }
  summary.technical_pass.mapping_verifier = 'passed';

  const hostedEnvironment = {
    ...process.env,
    NEEDTHISDONE_STAGED_BACKUP_DIR: backupRoot,
  };
  for (const stage of manifest.stages) {
    summary.technical_pass.hosted_dry_runs.push(runHostedDryRun(stage.id, stage, hostedEnvironment));
  }
  summary.technical_pass.status = 'passed';

  const rehearsalEnvironment = {
    ...process.env,
    NEEDTHISDONE_REHEARSAL_BACKUP_DIR: backupRoot,
    ALLOW_LOCAL_RESTORE_REHEARSAL: 'I_UNDERSTAND_THIS_RESETS_LOCAL_SUPABASE',
    ALLOW_FINAL_DESTRUCTIVE_REHEARSAL: 'I_UNDERSTAND_THIS_RUNS_ISOLATED_FINAL_CLEANUP',
  };
  const rehearsalOutput = run('bash', ['scripts/rehearse-local-data-migration.sh', '--execute'], {
    label: 'cumulative disposable-local historical-data rehearsal',
    environment: rehearsalEnvironment,
  });
  summary.data_impact_pass.local_rehearsal = verifyRehearsalOutput(rehearsalOutput);
  summary.data_impact_pass.status = 'passed';
  summary.status = 'passed';
}

try {
  main();
} catch (error) {
  summary.error = redact(error instanceof Error ? error.message : String(error), process.env);
  console.error(`Hosted migration Step 4 gate failed: ${summary.error}`);
  console.log(JSON.stringify(summary, null, 2));
  process.exitCode = 1;
}

if (summary.status === 'passed') {
  console.log(JSON.stringify(summary, null, 2));
}
