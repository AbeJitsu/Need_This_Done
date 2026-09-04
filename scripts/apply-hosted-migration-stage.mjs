#!/usr/bin/env node

// Approval-gated hosted migration application. Each invocation accepts exactly
// one allowlisted stage from the repository's staged migration map. It builds a
// temporary workdir containing the hosted baseline plus that stage, proves the
// exact dry-run selection, and, only in --execute mode, applies once and verifies
// the resulting history.

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
const manifestPath = resolve(repositoryRoot, 'scripts/hosted-migration-stages.json');
const cloudProfilePath = resolve(repositoryRoot, '.env.cloud.profile');
const expectedBranch = 'dev';
const expectedProjectRef = 'oxhjtmozsdstbokwtnwa';
const expectedEndpoint = `https://${expectedProjectRef}.supabase.co`;
const expectedEnvironment = 'cloud';
const writeAcknowledgements = {
  'calendar-token-security': 'I_UNDERSTAND_THIS_APPLIES_ONLY_073',
  'storage-bucket-normalization': 'I_UNDERSTAND_THIS_APPLIES_ONLY_074',
  'additive-product-workflow': 'I_UNDERSTAND_THIS_APPLIES_ONLY_075_080',
  'growth-profile-evaluation': 'I_UNDERSTAND_THIS_APPLIES_ONLY_081',
  'research-agent-planner': 'I_UNDERSTAND_THIS_APPLIES_ONLY_082_089',
  'destructive-retirement': 'I_UNDERSTAND_THIS_APPLIES_ONLY_090_092',
  'storage-policy-repair': 'I_UNDERSTAND_THIS_APPLIES_ONLY_093_STORAGE_POLICY_REPAIR',
  'worker-claim-context-repair': 'I_UNDERSTAND_THIS_APPLIES_ONLY_094_WORKER_CLAIM_CONTEXT_REPAIR',
  'hosted-parity-fixture-cleanup': 'I_UNDERSTAND_THIS_APPLIES_ONLY_095_FIXTURE_CLEANUP_BOUNDARY',
  'hermes-frozen-plan-boundary': 'I_UNDERSTAND_THIS_APPLIES_ONLY_110_HERMES_FROZEN_PLAN_BOUNDARY',
  'hermes-planner-executor-split': 'I_UNDERSTAND_THIS_APPLIES_ONLY_111_HERMES_PLANNER_EXECUTOR_SPLIT',
};
const destructiveApproval = 'I_UNDERSTAND_THIS_DELETES_RETIRED_HOSTED_DATA_090_092';
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
const retainedPriorBackups = new Set([
  resolve('/Users/abiezerreyes/Documents/NeedThisDone Backups/2026-08-11-pre-migration-072-url-retry'),
  resolve('/Users/abiezerreyes/Documents/NeedThisDone Backups/2026-08-15-pre-migration-073-000202'),
]);

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

function readManifest() {
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
  if (!Array.isArray(manifest.stages) || !Array.isArray(manifest.migrations)) {
    fail('hosted migration manifest is malformed');
  }
  return manifest;
}

function getStage(manifest, stageId) {
  const stage = manifest.stages.find((candidate) => candidate.id === stageId);
  if (!stage || !Array.isArray(stage.migrations) || !stage.migrations.length) {
    fail(`unknown or empty hosted migration stage ${stageId}`);
  }
  if (!writeAcknowledgements[stageId]) fail(`stage ${stageId} has no write acknowledgement mapping`);

  const migrations = stage.migrations.map((version) => {
    const migration = manifest.migrations.find((candidate) => candidate.new_version === version);
    if (!migration) fail(`stage ${stageId} references unmapped migration ${version}`);
    return migration;
  });
  const numericVersions = migrations.map((migration) => Number(migration.new_version));
  if (numericVersions.some((version, index) => index > 0 && version !== numericVersions[index - 1] + 1)) {
    fail(`stage ${stageId} migration versions are not contiguous`);
  }
  if (migrations.some((migration) => migration.stage !== stageId)) {
    fail(`stage ${stageId} contains a migration mapped to another stage`);
  }
  return { ...stage, migrations, firstVersion: numericVersions[0], lastVersion: numericVersions.at(-1) };
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

function gitOutput(args) {
  const result = spawnSync('git', args, { cwd: repositoryRoot, encoding: 'utf8' });
  if (result.status !== 0) fail(`git ${args.join(' ')} failed`);
  return result.stdout.trim();
}

function parseArguments() {
  const args = process.argv.slice(2);
  let stage;
  let execute = false;
  let dryRun = false;
  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index];
    if (argument === '--stage') {
      if (stage !== undefined || !args[index + 1] || args[index + 1].startsWith('-')) {
        fail('usage requires exactly one --stage <stage-id> and --execute');
      }
      stage = args[index + 1];
      index += 1;
    } else if (argument === '--execute') {
      if (execute) fail('duplicate --execute is not permitted');
      execute = true;
    } else if (argument === '--dry-run') {
      if (dryRun) fail('duplicate --dry-run is not permitted');
      dryRun = true;
    } else {
      fail(`unsupported argument ${argument}; only --stage <stage-id> with --dry-run or --execute is permitted`);
    }
  }
  if (!stage || execute === dryRun) fail('hosted stage command requires exactly one of --dry-run or --execute');
  return { stageId: stage, execute };
}

function verifyExecutionBoundary(cloudProfile, stage) {
  const approvedReleaseSha = process.env.NEEDTHISDONE_APPROVED_RELEASE_SHA;
  if (!/^[0-9a-f]{40}$/.test(approvedReleaseSha || '')) {
    fail('NEEDTHISDONE_APPROVED_RELEASE_SHA must be an explicit full 40-character commit SHA');
  }
  if (process.env.ALLOW_HOSTED_STAGE_WRITE !== writeAcknowledgements[stage.id]) {
    fail(`missing exact ALLOW_HOSTED_STAGE_WRITE=${writeAcknowledgements[stage.id]} acknowledgement`);
  }
  if (stage.destructive && process.env.NEEDTHISDONE_DESTRUCTIVE_HOSTED_RETIREMENT_APPROVED !== destructiveApproval) {
    fail(`destructive stage requires NEEDTHISDONE_DESTRUCTIVE_HOSTED_RETIREMENT_APPROVED=${destructiveApproval}`);
  }
  if (cloudProfile.ENV_TARGET !== expectedEnvironment) fail('cloud profile marker is not ENV_TARGET=cloud');
  if (cloudProfile.NEXT_PUBLIC_SUPABASE_URL !== expectedEndpoint) fail('cloud profile endpoint is not the approved hosted project');
  if (!cloudProfile.SUPABASE_ACCESS_TOKEN) fail('cloud profile is missing SUPABASE_ACCESS_TOKEN');

  const branch = gitOutput(['branch', '--show-current']);
  if (branch !== expectedBranch) fail(`refusing hosted write outside ${expectedBranch}`);
  const head = gitOutput(['rev-parse', 'HEAD']);
  if (head !== approvedReleaseSha) {
    fail(`HEAD ${head || 'unavailable'} does not match NEEDTHISDONE_APPROVED_RELEASE_SHA; hosted write was not attempted`);
  }
  const remoteHead = gitOutput(['rev-parse', 'refs/remotes/origin/dev']);
  if (remoteHead !== approvedReleaseSha) {
    fail(`origin/dev ${remoteHead || 'unavailable'} does not match NEEDTHISDONE_APPROVED_RELEASE_SHA; hosted write was not attempted`);
  }
  if (gitOutput(['status', '--porcelain'])) fail('worktree must be clean before a hosted write');
  return approvedReleaseSha;
}

function verifyFinalPreApplyRef(approvedReleaseSha) {
  if (gitOutput(['branch', '--show-current']) !== expectedBranch) {
    fail(`final pre-apply branch is not ${expectedBranch}; hosted write was not attempted`);
  }
  const head = gitOutput(['rev-parse', 'HEAD']);
  if (head !== approvedReleaseSha) {
    fail(`final pre-apply HEAD ${head || 'unavailable'} does not match NEEDTHISDONE_APPROVED_RELEASE_SHA; hosted write was not attempted`);
  }
  if (gitOutput(['rev-parse', 'refs/remotes/origin/dev']) !== approvedReleaseSha) {
    fail('final pre-apply origin/dev does not match NEEDTHISDONE_APPROVED_RELEASE_SHA; hosted write was not attempted');
  }
  if (gitOutput(['status', '--porcelain'])) fail('worktree became dirty before hosted apply; hosted write was not attempted');
}

function repositoryVersionsThrough(version) {
  return readdirSync(resolve(repositoryRoot, 'supabase/migrations'))
    .filter((filename) => /^\d{3}_[a-z0-9_]+\.sql$/.test(filename) && Number(filename.slice(0, 3)) <= version)
    .sort()
    .map((filename) => filename.slice(0, 3));
}

function verifyBackup(backupRoot, expectedVersions) {
  if (!backupRoot) fail('NEEDTHISDONE_HOSTED_BACKUP_DIR must point to a fresh protected backup');
  const resolvedBackupRoot = resolve(backupRoot);
  if (retainedPriorBackups.has(resolvedBackupRoot)) fail('a previously used migration backup cannot be reused for this stage');
  if (!existsSync(resolvedBackupRoot) || lstatSync(resolvedBackupRoot).isSymbolicLink()) {
    fail(`fresh backup directory is missing or symlinked: ${resolvedBackupRoot}`);
  }
  const directoryStat = lstatSync(resolvedBackupRoot);
  if (!directoryStat.isDirectory() || (directoryStat.mode & 0o777) !== 0o700) {
    fail(`fresh backup directory must be a mode-700 directory: ${resolvedBackupRoot}`);
  }

  const manifestPathForBackup = join(resolvedBackupRoot, 'SHA256SUMS-FINAL.txt');
  if (!existsSync(manifestPathForBackup) || lstatSync(manifestPathForBackup).isSymbolicLink()) fail('fresh backup checksum manifest is missing or symlinked');
  const manifestStat = lstatSync(manifestPathForBackup);
  if (!manifestStat.isFile() || (manifestStat.mode & 0o777) !== 0o600) fail('fresh backup checksum manifest must be a mode-600 file');

  const lines = readFileSync(manifestPathForBackup, 'utf8').trim().split(/\r?\n/).filter(Boolean);
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
    || history.row_count !== expectedVersions.length
    || JSON.stringify(versions) !== JSON.stringify(expectedVersions)
  ) {
    fail(`fresh backup history must contain ${expectedVersions.length} rows/latest ${expectedVersions.at(-1)}`);
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
    const match = line.match(/^\s*\d{3}\s*\|\s*(\d{3})?\s*\|/);
    if (match?.[1]) versions.push(match[1]);
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

function buildTemporaryWorkdir(backupVersions, stageMigrations) {
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
    const baselineFiles = repositoryMigrations.filter((filename) => Number(filename.slice(0, 3)) <= Number(backupVersions.at(-1)));
    const baselineVersions = baselineFiles.map((filename) => filename.slice(0, 3));
    if (JSON.stringify(baselineVersions) !== JSON.stringify(backupVersions)) {
      fail('repository migrations before the selected stage do not match the fresh hosted history');
    }
    for (const filename of baselineFiles) {
      const source = resolve(repositoryRoot, 'supabase/migrations', filename);
      if (lstatSync(source).isSymbolicLink()) fail(`baseline migration is symlinked: ${filename}`);
      cpSync(source, join(tempSupabase, 'migrations', filename));
    }

    for (const migration of stageMigrations) {
      const source = resolve(repositoryRoot, 'supabase/migrations', migration.new_filename);
      if (!existsSync(source) || lstatSync(source).isSymbolicLink()) fail(`allowlisted migration is missing or symlinked: ${migration.new_filename}`);
      cpSync(source, join(tempSupabase, 'migrations', migration.new_filename));
    }

    const allowedFiles = new Set([...baselineFiles, ...stageMigrations.map((migration) => migration.new_filename)]);
    const temporaryFiles = readdirSync(join(tempSupabase, 'migrations')).sort();
    if (temporaryFiles.length !== allowedFiles.size || temporaryFiles.some((filename) => !allowedFiles.has(filename))) {
      fail('temporary workdir contains an unallowlisted migration');
    }
    return tempRoot;
  } catch (error) {
    rmSync(tempRoot, { recursive: true, force: true });
    throw error;
  }
}

function parseDryRunSelection(output, expectedFiles) {
  const selected = [...output.matchAll(/[•*-]\s+([0-9]{3}_[a-z0-9_]+\.sql)\b/g)].map((match) => match[1]);
  const expected = [...expectedFiles].sort();
  if (JSON.stringify(selected.sort()) !== JSON.stringify(expected)) {
    fail(`final dry run selected an unexpected migration set: ${selected.join(', ') || 'none'}; expected ${expected.join(', ')}`);
  }
  return selected;
}

function historySummary(versions) {
  return { rows: versions.length, latest: versions.at(-1) || null };
}

const result = {
  schema_version: 2,
  status: 'failed',
  target: {
    project_ref: expectedProjectRef,
    endpoint: expectedEndpoint,
    environment: expectedEnvironment,
    branch: expectedBranch,
    release_sha: null,
  },
  stage: null,
  selected_migrations: [],
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

try {
  const { stageId, execute } = parseArguments();
  const manifest = readManifest();
  const stage = getStage(manifest, stageId);
  const expectedBefore = repositoryVersionsThrough(stage.firstVersion - 1);
  const stageFiles = stage.migrations.map((migration) => migration.new_filename);
  result.stage = stage.id;
  result.selected_migrations = stageFiles;

  const cloudProfile = readProfile(cloudProfilePath);
  let approvedReleaseSha;
  if (execute) {
    approvedReleaseSha = verifyExecutionBoundary(cloudProfile, stage);
    result.target.release_sha = approvedReleaseSha;
    result.write_acknowledgement_verified = true;
  } else {
    if (cloudProfile.ENV_TARGET !== expectedEnvironment) fail('cloud profile marker is not ENV_TARGET=cloud');
    if (cloudProfile.NEXT_PUBLIC_SUPABASE_URL !== expectedEndpoint) fail('cloud profile endpoint is not the approved hosted project');
    if (!cloudProfile.SUPABASE_ACCESS_TOKEN) fail('cloud profile is missing SUPABASE_ACCESS_TOKEN');
  }

  const backup = verifyBackup(process.env.NEEDTHISDONE_HOSTED_BACKUP_DIR, expectedBefore);
  result.backup = {
    path: backup.path,
    checksum_manifest: backup.manifest,
    prewrite_history: historySummary(backup.versions),
  };
  environment = { ...process.env, ...cloudProfile };
  temporaryWorkdir = buildTemporaryWorkdir(backup.versions, stage.migrations);

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
  result.dry_run_selected = parseDryRunSelection(dryRun, stageFiles);

  const afterDryRun = listRemoteHistory(temporaryWorkdir, environment);
  assertVersions('remote history after final dry run', afterDryRun.versions, backup.versions);
  result.transcript.history_after_dry_run = afterDryRun.transcript;

  if (execute) {
    verifyFinalPreApplyRef(approvedReleaseSha);
    result.hosted_writes = 1;
    const applyOutput = runSupabase(
      ['db', 'push', '--linked', '--workdir', temporaryWorkdir, '--yes'],
      environment,
      'hosted migration apply',
    );
    result.transcript.apply = applyOutput;

    const after = listRemoteHistory(temporaryWorkdir, environment);
    const expectedAfter = [...backup.versions, ...stage.migrations.map((migration) => migration.new_version)];
    assertVersions('remote history after hosted apply', after.versions, expectedAfter);
    result.after_history = historySummary(after.versions);
    result.transcript.history_after_apply = after.transcript;
  } else {
    result.after_history = historySummary(afterDryRun.versions);
  }
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
