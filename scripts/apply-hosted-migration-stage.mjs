#!/usr/bin/env node

// Approval-gated hosted migration application. The first implementation is
// deliberately allowlisted to calendar-token-security/073 only. It builds a
// temporary comparison workdir, proves the exact dry-run selection, applies
// one migration, and immediately performs read-only history verification.

import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import {
  chmodSync,
  cpSync,
  existsSync,
  lstatSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const expectedBranch = 'dev';
const expectedStage = 'calendar-token-security';
const expectedMigration = '073_secure_google_calendar_tokens.sql';
const expectedVersion = '073';
const expectedProjectRef = 'oxhjtmozsdstbokwtnwa';
const expectedEndpoint = `https://${expectedProjectRef}.supabase.co`;
const expectedEnvironment = 'cloud';
const writeAcknowledgement = 'I_UNDERSTAND_THIS_APPLIES_ONLY_073';
const expectedHostedRowsBefore = 68;
const expectedHostedLatestBefore = '072';
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
const retainedPriorBackup = resolve(
  '/Users/abiezerreyes/Documents/NeedThisDone Backups/2026-08-11-pre-migration-072-url-retry',
);
const cloudProfilePath = resolve(repositoryRoot, '.env.cloud.profile');

class ApplyFailure extends Error {}

function fail(message) {
  throw new ApplyFailure(message);
}

function sha256(value) {
  return createHash('sha256').update(value).digest('hex');
}

function readProfile(profilePath) {
  const values = {};
  for (const line of readFileSync(profilePath, 'utf8').split(/\r?\n/)) {
    if (!line || line.startsWith('#')) continue;
    const separator = line.indexOf('=');
    if (separator < 1) continue;
    let value = line.slice(separator + 1);
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    values[line.slice(0, separator)] = value;
  }
  return values;
}

function redact(value, environment = {}) {
  let result = value || '';
  for (const [key, secret] of Object.entries(environment)) {
    if (!secret || secret.length < 6 || !/(KEY|SECRET|TOKEN|PASSWORD|PRIVATE|CREDENTIAL)/i.test(key)) continue;
    result = result.split(secret).join('[redacted]');
  }
  return result
    .replace(/(supabase[_-]?access[_-]?token\s*[=:]\s*)[^\s\n]+/gi, '$1[redacted]')
    .replace(/(service[_-]?role[_-]?key\s*[=:]\s*)[^\s\n]+/gi, '$1[redacted]')
    .replace(/(postgres(?:ql)?):\/\/[^\s\n]+/gi, '$1://[redacted]');
}

function parseArguments() {
  const args = process.argv.slice(2);
  let stage;
  let execute = false;

  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index];
    if (argument === '--stage') {
      if (stage !== undefined || !args[index + 1] || args[index + 1].startsWith('-')) {
        fail('usage requires exactly one --stage calendar-token-security and --execute');
      }
      stage = args[index + 1];
      index += 1;
    } else if (argument === '--execute') {
      if (execute) fail('duplicate --execute is not permitted');
      execute = true;
    } else {
      fail(`unsupported argument ${argument}; --include-all, --local, reset, rollback, and multi-stage arguments are refused`);
    }
  }

  if (stage !== expectedStage || !execute) {
    fail('hosted application requires exactly --stage calendar-token-security --execute');
  }
  return { stage, execute };
}

function verifyExecutionBoundary(cloudProfile) {
  const approvedReleaseSha = process.env.NEEDTHISDONE_APPROVED_RELEASE_SHA;
  if (!/^[0-9a-f]{40}$/.test(approvedReleaseSha || '')) {
    fail('NEEDTHISDONE_APPROVED_RELEASE_SHA must be an explicit full 40-character commit SHA');
  }
  if (process.env.ALLOW_HOSTED_STAGE_WRITE !== writeAcknowledgement) {
    fail(`missing exact ALLOW_HOSTED_STAGE_WRITE=${writeAcknowledgement} acknowledgement`);
  }
  if (cloudProfile.ENV_TARGET !== expectedEnvironment) fail('cloud profile marker is not ENV_TARGET=cloud');
  if (cloudProfile.NEXT_PUBLIC_SUPABASE_URL !== expectedEndpoint) fail('cloud profile endpoint is not the approved hosted project');
  if (!cloudProfile.SUPABASE_ACCESS_TOKEN) fail('cloud profile is missing SUPABASE_ACCESS_TOKEN');

  const branch = spawnSync('git', ['branch', '--show-current'], { cwd: repositoryRoot, encoding: 'utf8' });
  if (branch.status !== 0 || branch.stdout.trim() !== expectedBranch) fail(`refusing hosted write outside ${expectedBranch}`);
  const head = spawnSync('git', ['rev-parse', 'HEAD'], { cwd: repositoryRoot, encoding: 'utf8' });
  if (head.status !== 0 || head.stdout.trim() !== approvedReleaseSha) {
    fail(`HEAD ${head.stdout.trim() || 'unavailable'} does not match NEEDTHISDONE_APPROVED_RELEASE_SHA; hosted write was not attempted`);
  }
  return approvedReleaseSha;
}

function verifyFinalPreApplyRef(approvedReleaseSha) {
  const branch = spawnSync('git', ['branch', '--show-current'], { cwd: repositoryRoot, encoding: 'utf8' });
  if (branch.status !== 0 || branch.stdout.trim() !== expectedBranch) {
    fail(`final pre-apply branch is not ${expectedBranch}; hosted write was not attempted`);
  }
  const head = spawnSync('git', ['rev-parse', 'HEAD'], { cwd: repositoryRoot, encoding: 'utf8' });
  if (head.status !== 0 || head.stdout.trim() !== approvedReleaseSha) {
    fail(`final pre-apply HEAD ${head.stdout.trim() || 'unavailable'} does not match NEEDTHISDONE_APPROVED_RELEASE_SHA; hosted write was not attempted`);
  }
}

function verifyBackup(backupRoot) {
  if (!backupRoot) fail('NEEDTHISDONE_HOSTED_BACKUP_DIR must point to a fresh protected backup');
  const resolvedBackupRoot = resolve(backupRoot);
  if (resolvedBackupRoot === retainedPriorBackup) fail('the retained pre-migration-072 backup cannot be reused for this stage');
  if (!existsSync(resolvedBackupRoot) || lstatSync(resolvedBackupRoot).isSymbolicLink()) {
    fail(`fresh backup directory is missing or symlinked: ${resolvedBackupRoot}`);
  }
  const directoryStat = lstatSync(resolvedBackupRoot);
  if (!directoryStat.isDirectory() || (directoryStat.mode & 0o777) !== 0o700) {
    fail(`fresh backup directory must be a mode-700 directory: ${resolvedBackupRoot}`);
  }

  const manifestPath = join(resolvedBackupRoot, 'SHA256SUMS-FINAL.txt');
  if (!existsSync(manifestPath) || lstatSync(manifestPath).isSymbolicLink()) fail('fresh backup checksum manifest is missing or symlinked');
  const manifestStat = lstatSync(manifestPath);
  if (!manifestStat.isFile() || (manifestStat.mode & 0o777) !== 0o600) fail('fresh backup checksum manifest must be a mode-600 file');

  const lines = readFileSync(manifestPath, 'utf8').trim().split(/\r?\n/).filter(Boolean);
  if (lines.length !== expectedBackupArtifacts.length) fail(`fresh backup checksum manifest must contain exactly ${expectedBackupArtifacts.length} artifacts`);
  const seen = new Set();
  for (const line of lines) {
    const match = line.match(/^([0-9a-f]{64})\s{2}(.+)$/);
    if (!match || !expectedBackupArtifacts.includes(match[2]) || seen.has(match[2])) fail('fresh backup checksum manifest has an invalid or duplicate artifact');
    seen.add(match[2]);
    const artifactPath = join(resolvedBackupRoot, match[2]);
    const artifactStat = lstatSync(artifactPath);
    if (!artifactStat.isFile() || artifactStat.isSymbolicLink() || (artifactStat.mode & 0o777) !== 0o600) {
      fail(`fresh backup artifact must be a mode-600 regular file: ${match[2]}`);
    }
    if (sha256(readFileSync(artifactPath)) !== match[1]) fail(`fresh backup checksum mismatch: ${match[2]}`);
  }
  if (seen.size !== expectedBackupArtifacts.length) fail('fresh backup checksum manifest is incomplete');

  const history = JSON.parse(readFileSync(join(resolvedBackupRoot, 'hosted-migration-history.json'), 'utf8'));
  const versions = history.migrations?.map((migration) => migration.version);
  if (
    history.project_ref !== expectedProjectRef
    || history.row_count !== expectedHostedRowsBefore
    || history.latest?.version !== expectedHostedLatestBefore
    || !Array.isArray(versions)
    || versions.length !== expectedHostedRowsBefore
    || versions.at(-1) !== expectedHostedLatestBefore
  ) {
    fail(`fresh backup history must contain ${expectedHostedRowsBefore} rows/latest ${expectedHostedLatestBefore}`);
  }

  return { path: resolvedBackupRoot, manifest: 'SHA256SUMS-FINAL.txt', versions };
}

function runSupabase(args, environment, label) {
  const result = spawnSync('supabase', args, {
    cwd: repositoryRoot,
    env: environment,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  const output = `${result.stdout || ''}\n${result.stderr || ''}`;
  if (result.error || result.status !== 0) {
    fail(`${label} failed${output.trim() ? `: ${redact(output, environment).trim()}` : ''}`);
  }
  return redact(output, environment).trim();
}

function parseRemoteHistory(output) {
  const versions = [];
  for (const line of output.split(/\r?\n/)) {
    const match = line.match(/^\s*(\d{3})\s*\|\s*(\d{3})?\s*\|/);
    if (match?.[2]) versions.push(match[2]);
  }
  if (!versions.length) fail('could not parse hosted migration history from supabase migration list');
  return versions;
}

function listRemoteHistory(workdir, environment) {
  const output = runSupabase(['migration', 'list', '--linked', '--workdir', workdir], environment, 'hosted migration history read');
  return { versions: parseRemoteHistory(output), transcript: output };
}

function assertVersions(label, actual, expected) {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    fail(`${label} differs from the protected pre-write history; expected ${expected.length} rows/latest ${expected.at(-1)}, got ${actual.length} rows/latest ${actual.at(-1) || 'none'}`);
  }
}

function buildTemporaryWorkdir(backupVersions) {
  const tempRoot = mkdtempSync(join(tmpdir(), 'needthisdone-hosted-apply-'));
  chmodSync(tempRoot, 0o700);
  try {
    const tempSupabase = join(tempRoot, 'supabase');
    mkdirSync(join(tempSupabase, 'migrations'), { recursive: true, mode: 0o700 });
    mkdirSync(join(tempSupabase, '.temp'), { recursive: true, mode: 0o700 });
    cpSync(resolve(repositoryRoot, 'supabase/config.toml'), join(tempSupabase, 'config.toml'));

    const linkedMetadataRoot = resolve(repositoryRoot, 'supabase/.temp');
    for (const filename of readdirSync(linkedMetadataRoot)) {
      const source = resolve(linkedMetadataRoot, filename);
      if (lstatSync(source).isSymbolicLink()) fail(`linked Supabase metadata is symlinked: ${filename}`);
      cpSync(source, join(tempSupabase, '.temp', filename));
    }

    const repositoryMigrations = readdirSync(resolve(repositoryRoot, 'supabase/migrations'))
      .filter((filename) => /^\d{3}_[a-z0-9_]+\.sql$/.test(filename))
      .sort();
    const baselineFiles = repositoryMigrations.filter((filename) => Number(filename.slice(0, 3)) <= 72);
    const baselineVersions = baselineFiles.map((filename) => filename.slice(0, 3));
    if (JSON.stringify(baselineVersions) !== JSON.stringify(backupVersions)) {
      fail('repository migrations 001–072 do not match the fresh hosted history');
    }
    for (const filename of baselineFiles) {
      const source = resolve(repositoryRoot, 'supabase/migrations', filename);
      if (lstatSync(source).isSymbolicLink()) fail(`baseline migration is symlinked: ${filename}`);
      cpSync(source, join(tempSupabase, 'migrations', filename));
    }

    const migrationSource = resolve(repositoryRoot, 'supabase/migrations', expectedMigration);
    if (!existsSync(migrationSource) || lstatSync(migrationSource).isSymbolicLink()) fail(`allowlisted migration is missing or symlinked: ${expectedMigration}`);
    cpSync(migrationSource, join(tempSupabase, 'migrations', expectedMigration));

    const temporaryFiles = readdirSync(join(tempSupabase, 'migrations')).sort();
    if (!temporaryFiles.includes(expectedMigration) || temporaryFiles.some((filename) => Number(filename.slice(0, 3)) > 73 && filename !== expectedMigration)) {
      fail('temporary workdir contains an unallowlisted migration');
    }
    return tempRoot;
  } catch (error) {
    rmSync(tempRoot, { recursive: true, force: true });
    throw error;
  }
}

function parseDryRunSelection(output) {
  const selected = [...output.matchAll(/[•*-]\s+([0-9]{3}_[a-z0-9_]+\.sql)\b/g)].map((match) => match[1]);
  if (JSON.stringify(selected) !== JSON.stringify([expectedMigration])) {
    fail(`final dry run selected an unexpected migration set: ${selected.join(', ') || 'none'}`);
  }
  return selected;
}

function historySummary(versions) {
  return { rows: versions.length, latest: versions.at(-1) || null };
}

const result = {
  schema_version: 1,
  status: 'failed',
  target: {
    project_ref: expectedProjectRef,
    endpoint: expectedEndpoint,
    environment: expectedEnvironment,
    branch: expectedBranch,
    release_sha: null,
  },
  stage: expectedStage,
  selected_migration: expectedMigration,
  timestamp_utc: new Date().toISOString(),
  before_history: null,
  after_history: null,
  hosted_writes: 0,
  write_acknowledgement_verified: false,
  owner_approval_not_inferred: true,
  temporary_workdir_cleaned: false,
  transcript: {},
};

let temporaryWorkdir;
let environment;
let backup;

try {
  parseArguments();
  const cloudProfile = readProfile(cloudProfilePath);
  const approvedReleaseSha = verifyExecutionBoundary(cloudProfile);
  result.target.release_sha = approvedReleaseSha;
  result.write_acknowledgement_verified = true;
  backup = verifyBackup(process.env.NEEDTHISDONE_HOSTED_BACKUP_DIR);
  result.backup = {
    path: backup.path,
    checksum_manifest: backup.manifest,
    prewrite_history: historySummary(backup.versions),
  };
  environment = { ...process.env, ...cloudProfile };
  temporaryWorkdir = buildTemporaryWorkdir(backup.versions);

  const before = listRemoteHistory(temporaryWorkdir, environment);
  assertVersions('remote history before final dry run', before.versions, backup.versions);
  result.before_history = historySummary(before.versions);
  result.transcript.history_before_dry_run = before.transcript;

  const dryRun = runSupabase(
    ['db', 'push', '--dry-run', '--linked', '--workdir', temporaryWorkdir],
    environment,
    'final hosted migration dry run',
  );
  result.transcript.final_dry_run = dryRun;
  result.dry_run_selected = parseDryRunSelection(dryRun);

  const afterDryRun = listRemoteHistory(temporaryWorkdir, environment);
  assertVersions('remote history after final dry run', afterDryRun.versions, backup.versions);
  result.transcript.history_after_dry_run = afterDryRun.transcript;

  verifyFinalPreApplyRef(approvedReleaseSha);
  result.hosted_writes = 1;
  const applyOutput = runSupabase(
    ['db', 'push', '--linked', '--workdir', temporaryWorkdir, '--yes'],
    environment,
    'hosted migration apply',
  );
  result.transcript.apply = applyOutput;

  const after = listRemoteHistory(temporaryWorkdir, environment);
  const expectedAfter = [...backup.versions, expectedVersion];
  assertVersions('remote history after hosted apply', after.versions, expectedAfter);
  if (after.versions.includes('074') || after.versions.some((version) => Number(version) > Number(expectedVersion))) {
    fail('hosted history contains migration 074 or a later migration after the allowlisted apply');
  }
  result.after_history = historySummary(after.versions);
  result.transcript.history_after_apply = after.transcript;
  result.status = 'passed';
} catch (error) {
  result.error = redact(error instanceof Error ? error.message : String(error), environment || process.env);
  if (result.hosted_writes === 1 && temporaryWorkdir) {
    try {
      const diagnosis = listRemoteHistory(temporaryWorkdir, environment);
      result.after_history = historySummary(diagnosis.versions);
      result.transcript.failure_diagnosis_history = diagnosis.transcript;
      result.failure_diagnosis = 'read-only migration history only; no retry attempted';
    } catch (diagnosisError) {
      result.failure_diagnosis = `read-only migration history unavailable: ${redact(diagnosisError instanceof Error ? diagnosisError.message : String(diagnosisError), environment || process.env)}`;
    }
  }
  process.exitCode = 1;
} finally {
  if (temporaryWorkdir) {
    rmSync(temporaryWorkdir, { recursive: true, force: true });
    result.temporary_workdir_cleaned = true;
  }
}

console.log(JSON.stringify(result, null, 2));
