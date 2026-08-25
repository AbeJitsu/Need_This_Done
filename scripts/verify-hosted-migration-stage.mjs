#!/usr/bin/env node

// Read-only hosted migration review. This command refuses to run without the
// explicit --dry-run flag and copies only one allowlisted stage into a
// temporary Supabase project directory. It never calls db push without
// --dry-run and never changes the repository environment links.

import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import {
  cpSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
} from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const manifest = JSON.parse(readFileSync(resolve(repositoryRoot, 'scripts/hosted-migration-stages.json'), 'utf8'));
const backupRoot = process.env.NEEDTHISDONE_STAGED_BACKUP_DIR || '/Users/abiezerreyes/Documents/NeedThisDone Backups/2026-08-11-pre-migration-072-url-retry';
const cloudProfilePath = resolve(repositoryRoot, '.env.cloud.profile');

function fail(message) {
  console.error(`Hosted migration stage review failed: ${message}`);
  process.exit(1);
}

function sha256(value) {
  return createHash('sha256').update(value).digest('hex');
}

function readProfile(path) {
  const values = {};
  for (const line of readFileSync(path, 'utf8').split(/\r?\n/)) {
    if (!line || line.startsWith('#')) continue;
    const separator = line.indexOf('=');
    if (separator < 1) continue;
    const key = line.slice(0, separator);
    let value = line.slice(separator + 1);
    if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
    if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
    values[key] = value;
  }
  return values;
}

function verifyBackup() {
  const manifestPath = join(backupRoot, 'SHA256SUMS-FINAL.txt');
  if (!existsSync(manifestPath)) fail(`protected backup manifest is missing: ${manifestPath}`);
  const lines = readFileSync(manifestPath, 'utf8').trim().split(/\r?\n/).filter(Boolean);
  if (lines.length !== 8) fail(`protected backup manifest should contain eight artifacts, found ${lines.length}`);
  for (const line of lines) {
    const match = line.match(/^([0-9a-f]{64})\s{2}(.+)$/);
    if (!match) fail(`invalid protected backup manifest line: ${line}`);
    const [, expectedHash, filename] = match;
    const path = join(backupRoot, filename);
    if (!existsSync(path)) fail(`protected backup artifact is missing: ${filename}`);
    const actualHash = sha256(readFileSync(path));
    if (actualHash !== expectedHash) fail(`protected backup checksum mismatch: ${filename}`);
  }
  const history = JSON.parse(readFileSync(join(backupRoot, 'hosted-migration-history.json'), 'utf8'));
  if (history.latest?.version !== manifest.source_hosted_latest) fail(`protected backup latest migration is not ${manifest.source_hosted_latest}`);
  return history.migrations.map((migration) => migration.version);
}

function listRemoteVersions(workdir, env) {
  const output = runSupabase(['migration', 'list', '--linked', '--workdir', workdir], env);
  const versions = [];
  for (const line of output.split(/\r?\n/)) {
    const match = line.match(/^\s*(\d{3})?\s*\|\s*(\d{3})?\s*\|/);
    if (match?.[2]) versions.push(match[2]);
  }
  if (!versions.length) fail('could not parse the remote migration history from supabase migration list');
  return { versions, output };
}

function runSupabase(args, env) {
  const result = spawnSync('supabase', args, {
    cwd: repositoryRoot,
    env,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  const output = `${result.stdout || ''}\n${result.stderr || ''}`;
  if (result.error || result.status !== 0) {
    fail(`supabase ${args.join(' ')} failed\n${sanitize(output, env)}`);
  }
  return output;
}

function sanitize(output, env) {
  let sanitized = output;
  for (const [key, value] of Object.entries(env || {})) {
    if ((key.includes('KEY') || key.includes('SECRET') || key.includes('TOKEN') || key.includes('PASSWORD')) && value && value.length > 8) {
      sanitized = sanitized.split(value).join('[redacted]');
    }
  }
  return sanitized;
}

function assertSameVersions(label, actual, expected) {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    fail(`${label} differs from the protected ${manifest.source_hosted_latest} history\nexpected: ${expected.join(', ')}\nactual:   ${actual.join(', ')}`);
  }
}

const args = process.argv.slice(2);
if (!args.includes('--dry-run')) fail('refusing to run without --dry-run; hosted migration application is out of scope');
const stageIndex = args.indexOf('--stage');
if (stageIndex === -1 || !args[stageIndex + 1]) fail('usage: node scripts/verify-hosted-migration-stage.mjs --stage <stage-id> --dry-run');
if (args.some((arg, index) => arg === '--stage' && index !== stageIndex)) fail('only one --stage is permitted');
const stageId = args[stageIndex + 1];
const stage = manifest.stages.find((candidate) => candidate.id === stageId);
if (!stage) fail(`unknown stage ${stageId}`);
if (stage.state !== 'hosted') fail(`stage ${stageId} is not part of the historical 073–095 review`);
if (stage.destructive) {
  console.error(`Reviewing final destructive stage ${stageId} in dry-run mode only; no hosted write is permitted.`);
}

const cloudProfile = readProfile(cloudProfilePath);
if (cloudProfile.ENV_TARGET !== 'cloud') fail('cloud profile marker is not ENV_TARGET=cloud');
if (cloudProfile.NEXT_PUBLIC_SUPABASE_URL !== 'https://oxhjtmozsdstbokwtnwa.supabase.co') fail('cloud profile endpoint is not the approved hosted project');
if (!cloudProfile.SUPABASE_ACCESS_TOKEN) fail('cloud profile is missing SUPABASE_ACCESS_TOKEN');
const backupVersions = verifyBackup();
const env = { ...process.env, ...cloudProfile };
const tempRoot = mkdtempSync(join(tmpdir(), 'needthisdone-hosted-stage-'));

try {
  const tempSupabase = join(tempRoot, 'supabase');
  mkdirSync(join(tempSupabase, 'migrations'), { recursive: true });
  mkdirSync(join(tempSupabase, '.temp'), { recursive: true });
  cpSync(resolve(repositoryRoot, 'supabase/config.toml'), join(tempSupabase, 'config.toml'));
  const linkedMetadataRoot = resolve(repositoryRoot, 'supabase/.temp');
  for (const filename of readdirSync(linkedMetadataRoot)) {
    cpSync(resolve(linkedMetadataRoot, filename), join(tempSupabase, '.temp', filename));
  }

  // The CLI needs the complete local history through the hosted baseline to
  // compare a selected pending stage. Only the requested stage is copied
  // after the original 072 review baseline; later stages are deliberately absent.
  for (const filename of readdirSync(resolve(repositoryRoot, 'supabase/migrations'))) {
    if (Number(filename.slice(0, 3)) <= 72) {
      cpSync(resolve(repositoryRoot, 'supabase/migrations', filename), join(tempSupabase, 'migrations', filename));
    }
  }

  const stageFiles = stage.migrations.map((version) => {
    const migration = manifest.migrations.find((candidate) => candidate.new_version === version);
    if (!migration) fail(`stage ${stageId} references unmapped migration ${version}`);
    const source = resolve(repositoryRoot, 'supabase/migrations', migration.new_filename);
    if (!existsSync(source)) fail(`stage file is missing: ${migration.new_filename}`);
    cpSync(source, join(tempSupabase, 'migrations', migration.new_filename));
    return migration.new_filename;
  });

  const before = listRemoteVersions(tempRoot, env);
  assertSameVersions('remote history before dry run', before.versions, backupVersions);

  const dryRunOutput = runSupabase(['db', 'push', '--dry-run', '--linked', '--workdir', tempRoot], env);
  const pushedFiles = [...dryRunOutput.matchAll(/[•*-]\s*([0-9]{3}_[a-z0-9_]+\.sql)/g)].map((match) => match[1]);
  if (JSON.stringify(pushedFiles.sort()) !== JSON.stringify([...stageFiles].sort())) {
    fail(`dry run selected an unexpected file set\nexpected: ${stageFiles.join(', ')}\nactual:   ${pushedFiles.join(', ')}`);
  }

  const after = listRemoteVersions(tempRoot, env);
  assertSameVersions('remote history after dry run', after.versions, backupVersions);
  console.log(`Read-only hosted stage dry run passed: ${stageId}`);
  console.log(`Allowlisted migrations: ${stageFiles.join(', ')}`);
  console.log(`Remote history before and after remains at ${manifest.source_hosted_latest} (${after.versions.length} rows).`);
  console.log('Dry-run transcript:');
  console.log(sanitize(dryRunOutput, env).trim());
} finally {
  rmSync(tempRoot, { recursive: true, force: true });
}
