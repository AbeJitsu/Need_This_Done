#!/usr/bin/env node

import { createHmac, randomUUID } from 'node:crypto';
import { execFile, spawn } from 'node:child_process';
import { access, chmod, lstat, mkdir, mkdtemp, readFile, realpath, rm, stat, writeFile } from 'node:fs/promises';
import { constants as fsConstants } from 'node:fs';
import { homedir, tmpdir } from 'node:os';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

export const MAC_WORKER_MODEL = 'openai/gpt-5.6-luna';
export const MAC_WORKER_PROFILE = 'needthisdone';
export const MAC_WORKER_BUILDER_PROFILE = 'needthisdone-codex-builder';
export const MAC_WORKER_OPENCLAW_VERSION = '2026.8.1';
export const MAC_WORKER_CONFIRMATION = 'START_NEEDTHISDONE_WORKER';
export const MAC_WORKER_LABELS = {
  bridge: 'com.needthisdone.bridge',
  gateway: 'com.needthisdone.openclaw-gateway',
};

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const BRIDGE_ROOT = join(REPO_ROOT, 'bridge');
const BRIDGE_DIST_ENTRYPOINT = join(BRIDGE_ROOT, 'dist', 'index.js');
const LAUNCHD_RENDERER = join(BRIDGE_ROOT, 'launchd', 'install-templates.sh');
const OPENCLAW_PROFILE_VERIFIER = join(BRIDGE_ROOT, 'openclaw-proof', 'verify-profile.mjs');
const DEFAULT_GATEWAY_URL = 'ws://127.0.0.1:18789';
const DEFAULT_RUNTIME_DIR = join(homedir(), '.needthisdone', 'mac-worker');
const DEFAULT_LOCAL_WORKER_ID = 'macbook-pro-hermes-rehearsal';
const DEFAULT_TIMEOUT_MS = 30_000;
const DEFAULT_HEARTBEAT_TIMEOUT_MS = 30_000;
const DEFAULT_LOCAL_DURATION_SECONDS = 0;
const MAX_COMMAND_OUTPUT = 64 * 1024;
const DOCKER_APP_BINARY = '/Applications/Docker.app/Contents/Resources/bin/docker';

class MacWorkerError extends Error {
  constructor(message, code = 1) {
    super(message);
    this.name = 'MacWorkerError';
    this.code = code;
  }
}

function asString(value) {
  return typeof value === 'string' ? value : '';
}

function redact(value) {
  return asString(value)
    .replace(/\b(?:sk|rk|pk)-[A-Za-z0-9_-]+\b/g, '[redacted-key]')
    .replace(/(token|secret|password|api[_-]?key|authorization)(\s*[:=]\s*)([^\s,;]+)/gi, '$1$2[redacted]')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 500);
}

function safeError(error) {
  if (error instanceof MacWorkerError) return redact(error.message);
  if (error instanceof Error) return redact(error.message);
  return 'The Mac worker command failed.';
}

function isLoopbackHostname(hostname) {
  const normalized = hostname.toLowerCase().replace(/^\[|\]$/g, '');
  const ipv4 = normalized.split('.');
  const isIpv4Loopback = ipv4.length === 4
    && ipv4.every((part) => /^\d+$/.test(part) && Number(part) <= 255)
    && Number(ipv4[0]) === 127;
  return normalized === 'localhost'
    || normalized === '::1'
    || normalized === '0:0:0:0:0:0:0:1'
    || isIpv4Loopback
    || /^::ffff:7f[0-9a-f]{2}:/.test(normalized);
}

function isUnspecifiedHostname(hostname) {
  const normalized = hostname.toLowerCase().replace(/^\[|\]$/g, '');
  return normalized === '0.0.0.0' || normalized === '::' || normalized === '0:0:0:0:0:0:0:0';
}

function expandPath(value) {
  const trimmed = asString(value).trim();
  if (!trimmed) return '';
  if (trimmed === '~') return homedir();
  if (trimmed.startsWith('~/')) return join(homedir(), trimmed.slice(2));
  return resolve(trimmed);
}

function parsePositiveInteger(value, name, minimum, maximum) {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < minimum || parsed > maximum) {
    throw new MacWorkerError(`${name} must be an integer between ${minimum} and ${maximum}.`, 64);
  }
  return parsed;
}

function shellUnquote(value) {
  if (value.length >= 2 && value.startsWith("'") && value.endsWith("'")) return value.slice(1, -1);
  if (value.length >= 2 && value.startsWith('"') && value.endsWith('"')) {
    return value.slice(1, -1).replace(/\\([\\"$`])/g, '$1').replace(/\\n/g, '\n');
  }
  return value;
}

export function parseEnvironmentText(text) {
  const environment = {};
  for (const line of String(text).split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const assignment = trimmed.startsWith('export ') ? trimmed.slice(7).trim() : trimmed;
    const match = assignment.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
    if (!match) continue;
    environment[match[1]] = shellUnquote(match[2].trim());
  }
  return environment;
}

async function readPrivateEnvironment(path) {
  try {
    return parseEnvironmentText(await readFile(path, 'utf8'));
  } catch (error) {
    throw new MacWorkerError(`Private bridge environment could not be read at ${path}.`);
  }
}

async function fileExists(path) {
  try {
    await access(path, fsConstants.F_OK);
    return true;
  } catch {
    return false;
  }
}

async function executableFile(path) {
  try {
    await access(path, fsConstants.X_OK);
    const info = await stat(path);
    return info.isFile();
  } catch {
    return false;
  }
}

async function runCommand(file, args = [], options = {}) {
  try {
    const result = await execFileAsync(file, args, {
      cwd: options.cwd,
      env: options.env,
      timeout: options.timeout ?? DEFAULT_TIMEOUT_MS,
      maxBuffer: options.maxBuffer ?? MAX_COMMAND_OUTPUT,
      windowsHide: true,
    });
    return {
      ok: true,
      code: 0,
      stdout: asString(result.stdout),
      stderr: asString(result.stderr),
    };
  } catch (error) {
    return {
      ok: false,
      code: typeof error?.code === 'number' ? error.code : null,
      stdout: asString(error?.stdout),
      stderr: asString(error?.stderr),
      signal: asString(error?.signal),
    };
  }
}

async function discoverCommand(name, { fallback = '' } = {}) {
  const result = await runCommand('/bin/sh', ['-lc', 'command -v "$1"', 'needthisdone-mac-worker', name]);
  const candidate = result.ok
    ? result.stdout.split(/\r?\n/).map((line) => line.trim()).filter(Boolean).at(-1) || ''
    : '';
  if (candidate && candidate.startsWith('/') && await executableFile(candidate)) {
    try {
      return await realpath(candidate);
    } catch {
      return candidate;
    }
  }
  if (fallback && await executableFile(fallback)) {
    try {
      return await realpath(fallback);
    } catch {
      return fallback;
    }
  }
  return null;
}

function bridgeMode(environment) {
  const runtimeMode = asString(environment.BRIDGE_RUNTIME_MODE).trim();
  const mode = runtimeMode || asString(environment.BRIDGE_MODE).trim() || 'approved';
  if (mode !== 'approved' && mode !== 'disposable-local') {
    throw new MacWorkerError('BRIDGE_MODE must be approved or disposable-local.', 64);
  }
  if (runtimeMode && environment.BRIDGE_MODE && environment.BRIDGE_MODE.trim() !== runtimeMode) {
    throw new MacWorkerError('BRIDGE_MODE and BRIDGE_RUNTIME_MODE must agree.', 64);
  }
  return mode;
}

function validUuid(value) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function validProfileName(value) {
  return /^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$/.test(value);
}

function gatewaySettings(environment) {
  const gatewayUrl = environment.OPENCLAW_GATEWAY_URL?.trim() || DEFAULT_GATEWAY_URL;
  const parsedGateway = new URL(gatewayUrl);
  if (!['ws:', 'wss:'].includes(parsedGateway.protocol) || !isLoopbackHostname(parsedGateway.hostname)
    || isUnspecifiedHostname(parsedGateway.hostname)
    || parsedGateway.username || parsedGateway.password || parsedGateway.search || parsedGateway.hash) {
    throw new MacWorkerError('OPENCLAW_GATEWAY_URL must remain a loopback ws:// or wss:// URL.', 64);
  }
  const gatewayPort = parsedGateway.port ? Number(parsedGateway.port) : 18789;
  if (!Number.isInteger(gatewayPort) || gatewayPort < 1 || gatewayPort > 65535) {
    throw new MacWorkerError('OPENCLAW_GATEWAY_URL must contain a valid port.', 64);
  }
  const token = asString(environment.OPENCLAW_GATEWAY_TOKEN).trim();
  if (token.length < 32) throw new MacWorkerError('OPENCLAW_GATEWAY_TOKEN must contain at least 32 characters.', 64);
  return { gatewayUrl, gatewayPort, token };
}

export function validateBridgeEnvironment(environment) {
  const required = [
    'BRIDGE_API_URL',
    'OPENCLAW_BRIDGE_SECRET',
    'BRIDGE_OWNER_ID',
    'BRIDGE_WORKER_ID',
    'OPENCLAW_GATEWAY_TOKEN',
    'BRIDGE_ARTIFACT_ROOT',
    'OPENCLAW_EXECUTOR_MODEL_ID',
  ];
  for (const name of required) {
    if (!asString(environment[name]).trim()) throw new MacWorkerError(`${name} is required.`, 64);
  }

  const mode = bridgeMode(environment);
  const bridgeUrl = new URL(environment.BRIDGE_API_URL.trim());
  const bridgeLoopback = isLoopbackHostname(bridgeUrl.hostname);
  if (isUnspecifiedHostname(bridgeUrl.hostname) || bridgeUrl.username || bridgeUrl.password) {
    throw new MacWorkerError('BRIDGE_API_URL must not use an unspecified host or URL credentials; disposable-local mode requires loopback.', 64);
  }
  if (mode === 'approved' && (bridgeUrl.protocol !== 'https:' || bridgeLoopback)) {
    throw new MacWorkerError('Approved/live mode requires an external HTTPS BRIDGE_API_URL.', 64);
  }
  if (mode === 'disposable-local' && (!['http:', 'https:'].includes(bridgeUrl.protocol) || !bridgeLoopback)) {
    throw new MacWorkerError('Disposable-local mode requires a loopback HTTP or HTTPS BRIDGE_API_URL.', 64);
  }
  if (!validUuid(environment.BRIDGE_OWNER_ID.trim())) {
    throw new MacWorkerError('BRIDGE_OWNER_ID must be a UUID.', 64);
  }
  if (environment.OPENCLAW_GATEWAY_TOKEN.trim().length < 32) {
    throw new MacWorkerError('OPENCLAW_GATEWAY_TOKEN must contain at least 32 characters.', 64);
  }
  if (environment.OPENCLAW_EXECUTOR_MODEL_ID.trim() !== MAC_WORKER_MODEL) {
    throw new MacWorkerError(`OPENCLAW_EXECUTOR_MODEL_ID must be exactly ${MAC_WORKER_MODEL}.`, 64);
  }
  if (!environment.BRIDGE_ARTIFACT_ROOT.trim().startsWith('/')) {
    throw new MacWorkerError('BRIDGE_ARTIFACT_ROOT must be an absolute private path.', 64);
  }

  const { gatewayUrl, gatewayPort } = gatewaySettings(environment);
  const readOnlyProfile = environment.OPENCLAW_READ_ONLY_PROFILE?.trim() || MAC_WORKER_PROFILE;
  const builderProfile = environment.OPENCLAW_BUILDER_PROFILE?.trim() || MAC_WORKER_BUILDER_PROFILE;
  if (!validProfileName(readOnlyProfile) || !validProfileName(builderProfile)
    || readOnlyProfile === builderProfile || readOnlyProfile === MAC_WORKER_BUILDER_PROFILE) {
    throw new MacWorkerError('The read-only OpenClaw profile must remain separate from the builder profile.', 64);
  }

  return {
    mode,
    bridgeApiOrigin: bridgeUrl.origin,
    bridgeApiUrl: bridgeUrl.toString(),
    gatewayUrl,
    gatewayPort,
    ownerId: environment.BRIDGE_OWNER_ID.trim(),
    workerId: environment.BRIDGE_WORKER_ID.trim(),
    artifactRoot: resolve(environment.BRIDGE_ARTIFACT_ROOT.trim()),
    readOnlyProfile,
    builderProfile,
  };
}

async function privatePathCheck(path, kind, { optional = false } = {}) {
  try {
    const info = await lstat(path);
    if (info.isSymbolicLink()) return { status: 'blocked', detail: `${kind} must not be a symbolic link.` };
    if (kind.endsWith('directory')) {
      if (!info.isDirectory()) return { status: 'blocked', detail: `${kind} is not a directory.` };
      if ((info.mode & 0o777) !== 0o700) return { status: 'blocked', detail: `${kind} must be mode 700.` };
      return { status: 'pass', detail: `${kind} has mode 700.` };
    }
    if (!info.isFile()) return { status: 'blocked', detail: `${kind} is not a regular file.` };
    if ((info.mode & 0o777) !== 0o600) return { status: 'blocked', detail: `${kind} must be mode 600.` };
    return { status: 'pass', detail: `${kind} has mode 600.` };
  } catch {
    return optional
      ? { status: 'warn', detail: `${kind} is not present yet.` }
      : { status: 'blocked', detail: `${kind} is missing.` };
  }
}

async function parentPrivateCheck(path, kind) {
  const parent = dirname(path);
  try {
    const info = await lstat(parent);
    if (!info.isDirectory() || (info.mode & 0o077) !== 0) {
      return { status: 'blocked', detail: `${kind} parent directory is not private.` };
    }
    return { status: 'pass', detail: `${kind} parent directory is private.` };
  } catch {
    return { status: 'blocked', detail: `${kind} parent directory is missing.` };
  }
}

async function runtimeContext({ requireEnvironment = false } = {}) {
  const explicitEnvironmentFile = asString(process.env.BRIDGE_ENV_FILE).trim();
  const explicitRuntime = asString(process.env.NEEDTHISDONE_RUNTIME_DIR || process.env.BRIDGE_RUNTIME_DIR).trim();
  const runtimeDir = expandPath(explicitRuntime)
    || (explicitEnvironmentFile ? dirname(expandPath(explicitEnvironmentFile)) : DEFAULT_RUNTIME_DIR);
  const environmentFile = expandPath(explicitEnvironmentFile) || join(runtimeDir, 'bridge.env');
  const environmentFilePresent = await fileExists(environmentFile);
  let fileEnvironment = {};
  let environmentReadError = null;
  if (environmentFilePresent) {
    try {
      fileEnvironment = await readPrivateEnvironment(environmentFile);
    } catch (error) {
      if (requireEnvironment) throw error;
      environmentReadError = safeError(error);
    }
  } else if (requireEnvironment) {
    throw new MacWorkerError(`Private bridge environment is missing at ${environmentFile}.`, 64);
  }

  const environment = {
    ...process.env,
    ...fileEnvironment,
    BRIDGE_ENV_FILE: environmentFile,
  };
  if (explicitRuntime) environment.NEEDTHISDONE_RUNTIME_DIR = runtimeDir;
  const configPath = expandPath(environment.OPENCLAW_CONFIG_PATH || environment.OPENCLAW_CONFIG || '');
  return {
    environment,
    runtimeDir,
    environmentFile,
    environmentFilePresent,
    configPath,
    environmentReadError,
  };
}

function check(name, status, detail) {
  return { name, status, detail };
}

function versionMajor(output) {
  const match = String(output).match(/v?(\d+)(?:\.\d+){0,2}/);
  return match ? Number(match[1]) : null;
}

function outputHasExpectedVersion(output, expected) {
  return String(output).includes(expected);
}

function safeChildEnvironment(environment, extra = {}) {
  const childEnvironment = { ...environment, ...extra };
  for (const name of [
    'OPENAI_API_KEY',
    'OPENROUTER_API_KEY',
    'CODEX_API_KEY',
    'ANTHROPIC_API_KEY',
    'GOOGLE_API_KEY',
    'GEMINI_API_KEY',
    'XAI_API_KEY',
    'GROQ_API_KEY',
    'MISTRAL_API_KEY',
    'TOGETHER_API_KEY',
    'PERPLEXITY_API_KEY',
    'DEEPSEEK_API_KEY',
    'COHERE_API_KEY',
    'REPLICATE_API_TOKEN',
  ]) {
    delete childEnvironment[name];
  }
  return childEnvironment;
}

function safeProviderEnvironment(environment, extra = {}) {
  return safeChildEnvironment(environment, extra);
}

function commandFailureDetail(label, result, fallback) {
  const combined = `${result.stdout}\n${result.stderr}`.toLowerCase();
  if (combined.includes('cache') || combined.includes('eperm') || combined.includes('eacces') || combined.includes('skipped permission hardening') || combined.includes('enoent') || combined.includes('no such file')) {
    return `${label} could not use its profile cache; inspect the private cache directory and permissions.`;
  }
  if (combined.includes('docker')) return `${label} reported a Docker problem.`;
  if (combined.includes('permission') || combined.includes('eacces')) return `${label} reported a permissions problem.`;
  return fallback;
}

async function resolveProfileConfig({ openclaw, profile, environment, explicitPath = '' }) {
  if (explicitPath) {
    if (!explicitPath.startsWith('/')) throw new MacWorkerError('OPENCLAW_CONFIG_PATH must be an absolute path.', 64);
    return explicitPath;
  }
  const result = await runCommand(openclaw, ['--profile', profile, 'config', 'file'], {
    env: safeChildEnvironment(environment),
  });
  if (!result.ok) {
    throw new MacWorkerError(commandFailureDetail('OpenClaw profile resolution', result, 'OpenClaw profile config path could not be resolved.'), 1);
  }
  const candidate = result.stdout
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.startsWith('/'))
    .at(-1);
  if (!candidate) throw new MacWorkerError('OpenClaw did not return an absolute profile config path.', 1);
  return resolve(candidate);
}

async function inspectProfile({ node, openclaw, profile, builderProfile, environment, explicitPath = '' }) {
  if (profile === builderProfile || profile === MAC_WORKER_BUILDER_PROFILE) {
    throw new MacWorkerError('The Mac worker refuses to use the future Codex builder profile for read-only work.', 64);
  }
  const configPath = await resolveProfileConfig({ openclaw, profile, environment, explicitPath });
  const configPermissions = await privatePathCheck(configPath, 'OpenClaw read-only profile file');
  if (configPermissions.status === 'blocked') throw new MacWorkerError(configPermissions.detail, 1);
  const parentPermissions = await parentPrivateCheck(configPath, 'OpenClaw read-only profile');
  if (parentPermissions.status === 'blocked') throw new MacWorkerError(parentPermissions.detail, 1);

  let config;
  try {
    config = JSON.parse(await readFile(configPath, 'utf8'));
  } catch {
    throw new MacWorkerError('OpenClaw read-only profile config is not valid JSON.', 1);
  }
  const verifier = await runCommand(node, [OPENCLAW_PROFILE_VERIFIER, configPath], {
    env: safeChildEnvironment(environment),
  });
  if (!verifier.ok) {
    throw new MacWorkerError('The isolated OpenClaw read-only proof profile did not pass verification.', 1);
  }
  const validation = await runCommand(openclaw, ['--profile', profile, 'config', 'validate'], {
    env: safeChildEnvironment({ ...environment, OPENCLAW_CONFIG: configPath }),
  });
  if (!validation.ok) {
    throw new MacWorkerError(commandFailureDetail('OpenClaw config validation', validation, 'OpenClaw read-only profile config validation failed.'), 1);
  }
  return {
    configPath,
    config,
    permissions: configPermissions,
    parentPermissions,
    model: config?.agents?.defaults?.model?.primary || null,
    thinking: config?.agents?.defaults?.thinkingDefault || null,
  };
}

async function discoverHostTools() {
  const [node, openclaw, docker, launchctl, plutil, npm, bash] = await Promise.all([
    discoverCommand('node'),
    discoverCommand('openclaw'),
    discoverCommand('docker', { fallback: DOCKER_APP_BINARY }),
    discoverCommand('launchctl'),
    discoverCommand('plutil'),
    discoverCommand('npm'),
    discoverCommand('bash'),
  ]);
  return { node, openclaw, docker, launchctl, plutil, npm, bash };
}

async function dockerChecks({ docker }) {
  if (!docker) {
    return [
      check('docker', 'blocked', 'Docker CLI was not found; Docker Desktop must be installed and on PATH.'),
      check('openclaw-sandbox-image', 'blocked', 'Skipped because Docker is unavailable.'),
    ];
  }
  const daemon = await runCommand(docker, ['version', '--format', '{{.Server.Version}}']);
  if (!daemon.ok) {
    return [
      check('docker', 'blocked', 'Docker CLI is present but the Docker Desktop daemon is unavailable.'),
      check('openclaw-sandbox-image', 'blocked', 'Skipped because the Docker daemon is unavailable.'),
    ];
  }
  const image = await runCommand(docker, ['image', 'inspect', 'openclaw-sandbox:bookworm-slim'], { timeout: 15_000 });
  return [
    check('docker', 'pass', 'Docker Desktop daemon is available.'),
    check('openclaw-sandbox-image', image.ok ? 'pass' : 'blocked', image.ok
      ? 'The isolated OpenClaw sandbox image is available.'
      : 'The isolated OpenClaw sandbox image is missing.'),
  ];
}

export async function collectPreflight({ environmentOverride = null, full = true } = {}) {
  let context;
  if (environmentOverride) {
    const runtimeDir = expandPath(environmentOverride.NEEDTHISDONE_RUNTIME_DIR || environmentOverride.BRIDGE_RUNTIME_DIR)
      || (environmentOverride.BRIDGE_ENV_FILE ? dirname(expandPath(environmentOverride.BRIDGE_ENV_FILE)) : DEFAULT_RUNTIME_DIR);
    const environmentFile = expandPath(environmentOverride.BRIDGE_ENV_FILE || '') || join(runtimeDir, 'bridge.env');
    context = {
      environment: environmentOverride,
      runtimeDir,
      environmentFile,
      environmentFilePresent: await fileExists(environmentFile),
      configPath: expandPath(environmentOverride.OPENCLAW_CONFIG_PATH || environmentOverride.OPENCLAW_CONFIG || ''),
    };
  } else {
    context = await runtimeContext();
  }
  const environment = context.environment;
  const tools = await discoverHostTools();
  const checks = [];
  const paths = { ...tools };
  const readOnlyProfile = asString(environment.OPENCLAW_READ_ONLY_PROFILE).trim() || MAC_WORKER_PROFILE;
  const builderProfile = asString(environment.OPENCLAW_BUILDER_PROFILE).trim() || MAC_WORKER_BUILDER_PROFILE;
  const readOnlyProfileCandidate = validProfileName(readOnlyProfile)
    && validProfileName(builderProfile)
    && readOnlyProfile !== builderProfile
    && readOnlyProfile !== MAC_WORKER_BUILDER_PROFILE;

  checks.push(check('platform', process.platform === 'darwin' ? 'pass' : 'blocked', process.platform === 'darwin'
    ? 'macOS is the supported activation host.'
    : 'The Mac worker CLI can only activate on macOS.'));

  if (tools.node) {
    const result = await runCommand(tools.node, ['--version']);
    const major = versionMajor(result.stdout || result.stderr);
    checks.push(check('node-version', result.ok && major !== null && major >= 22 ? 'pass' : 'blocked', result.ok && major !== null && major >= 22
      ? `Node ${String(result.stdout).trim()} is supported.`
      : 'Node 22 or newer is required.'));
  } else {
    checks.push(check('node-version', 'blocked', 'Node was not found with command -v.'));
  }

  if (tools.openclaw) {
    const result = await runCommand(tools.openclaw, ['--version']);
    checks.push(check('openclaw-version', result.ok && outputHasExpectedVersion(result.stdout || result.stderr, MAC_WORKER_OPENCLAW_VERSION) ? 'pass' : 'blocked', result.ok && outputHasExpectedVersion(result.stdout || result.stderr, MAC_WORKER_OPENCLAW_VERSION)
      ? `OpenClaw ${MAC_WORKER_OPENCLAW_VERSION} is installed.`
      : `OpenClaw ${MAC_WORKER_OPENCLAW_VERSION} is required for the isolated proof profile.`));
  } else {
    checks.push(check('openclaw-version', 'blocked', 'OpenClaw was not found with command -v.'));
  }

  checks.push(check('launchctl', tools.launchctl ? 'pass' : 'blocked', tools.launchctl
    ? 'launchctl is available for separately approved activation.'
    : 'launchctl was not found on this Mac.'));
  checks.push(check('plutil', tools.plutil ? 'pass' : 'blocked', tools.plutil
    ? 'plutil is available for plist validation.'
    : 'plutil was not found on this Mac.'));
  checks.push(check('bridge-environment-file', context.environmentFilePresent ? 'pass' : 'blocked', context.environmentFilePresent
    ? 'The private bridge environment file is present.'
    : `The private bridge environment file is missing at ${context.environmentFile}.`));
  checks.push(await privatePathCheck(context.runtimeDir, 'Private runtime directory'));
  checks[checks.length - 1].name = 'private-runtime-directory';
  checks.push(await parentPrivateCheck(context.runtimeDir, 'Private runtime'));
  checks[checks.length - 1].name = 'private-runtime-parent';
  if (context.environmentFilePresent) {
    checks.push(await privatePathCheck(context.environmentFile, 'Private bridge environment file'));
    checks.push(await parentPrivateCheck(context.environmentFile, 'Private bridge environment'));
    checks[checks.length - 1].name = 'private-bridge-environment-parent';
    if (context.environmentReadError) {
      checks.push(check('private-bridge-environment-read', 'blocked', context.environmentReadError));
    }
  } else {
    checks.push(check('private-bridge-environment-permissions', 'blocked', 'Skipped because the private environment file is missing.'));
  }

  let bridgeConfiguration = null;
  try {
    bridgeConfiguration = validateBridgeEnvironment(environment);
    checks.push(check('bridge-configuration', 'pass', bridgeConfiguration.mode === 'disposable-local'
      ? 'Disposable-local mode is explicit and the bridge URL is loopback.'
      : 'Approved/live mode uses an external HTTPS bridge URL.'));
  } catch (error) {
    checks.push(check('bridge-configuration', 'blocked', safeError(error)));
  }

  let profile = null;
  if (tools.node && tools.openclaw && readOnlyProfileCandidate) {
    try {
      profile = await inspectProfile({
        node: tools.node,
        openclaw: tools.openclaw,
        profile: readOnlyProfile,
        builderProfile,
        environment,
        explicitPath: context.configPath,
      });
      checks.push(check('openclaw-read-only-profile', 'pass', `Profile ${readOnlyProfile} passed the isolated read-only proof verifier.`));
      checks.push(profile.parentPermissions);
      checks[checks.length - 1].name = 'openclaw-profile-permissions';
    } catch (error) {
      checks.push(check('openclaw-read-only-profile', 'blocked', safeError(error)));
    }
  } else {
    checks.push(check('openclaw-read-only-profile', 'blocked', readOnlyProfileCandidate
      ? 'Skipped because the Node or OpenClaw executable is unavailable.'
      : 'Skipped because the configured read-only profile is not separate from the builder profile.'));
  }

  if (full && tools.openclaw && readOnlyProfileCandidate) {
    const accountStatus = await runCommand(tools.openclaw, ['--profile', readOnlyProfile, 'models', 'status', '--check'], {
      env: safeChildEnvironment(environment),
      timeout: 45_000,
    });
    const accountOutput = `${accountStatus.stdout}\n${accountStatus.stderr}`;
    const cacheProblem = /EPERM|EACCES|skipped permission hardening|permission denied|operation not permitted|(?:cache|state).*permission|cache (?:directory|store).*?(?:fail|unable|error)/i.test(accountOutput);
    checks.push(check('openclaw-account-and-cache', accountStatus.ok && !cacheProblem ? 'pass' : 'blocked', accountStatus.ok && !cacheProblem
      ? 'OpenClaw account status and profile cache check passed.'
      : commandFailureDetail('OpenClaw account status', accountStatus, 'OpenClaw account status or profile cache check failed.')));
  } else {
    checks.push(check('openclaw-account-and-cache', 'blocked', readOnlyProfileCandidate
      ? 'Skipped because OpenClaw is unavailable.'
      : 'Skipped because the configured read-only profile is not separate from the builder profile.'));
  }

  if (full) checks.push(...await dockerChecks({ docker: tools.docker }));
  else checks.push(check('docker', 'warn', 'Docker/provider checks were not required for prepare.'));

  return {
    command: 'preflight',
    ok: checks.every((item) => item.status === 'pass' || item.status === 'warn'),
    checkedAt: new Date().toISOString(),
    paths,
    runtime: {
      directory: context.runtimeDir,
      environmentFile: context.environmentFile,
      environmentFilePresent: context.environmentFilePresent,
    },
    profile: profile ? {
      name: bridgeConfiguration?.readOnlyProfile || readOnlyProfile,
      builderProfile: bridgeConfiguration?.builderProfile || builderProfile,
      configPath: profile.configPath,
      model: profile.model,
      thinking: profile.thinking,
    } : {
      name: bridgeConfiguration?.readOnlyProfile || readOnlyProfile,
      builderProfile: bridgeConfiguration?.builderProfile || builderProfile,
      configPath: context.configPath || null,
      model: null,
      thinking: null,
    },
    checks,
  };
}

async function ensurePrepareContext() {
  if (process.platform !== 'darwin') throw new MacWorkerError('prepare is only supported on macOS.', 64);
  const context = await runtimeContext({ requireEnvironment: true });
  const tools = await discoverHostTools();
  if (!tools.node || !tools.openclaw || !tools.npm || !tools.bash || !tools.plutil) {
    throw new MacWorkerError('prepare requires Node, OpenClaw, npm, bash, and plutil to be discoverable with command -v.', 1);
  }
  const configuration = validateBridgeEnvironment(context.environment);
  if (configuration.mode === 'disposable-local') {
    // Rendering is safe in local mode, but start remains explicitly live-only.
  }
  const profile = await inspectProfile({
    node: tools.node,
    openclaw: tools.openclaw,
    profile: configuration.readOnlyProfile,
    builderProfile: configuration.builderProfile,
    environment: context.environment,
    explicitPath: context.configPath,
  });
  const runtimePermissions = await privatePathCheck(context.runtimeDir, 'Private runtime directory');
  if (runtimePermissions.status === 'blocked') throw new MacWorkerError(runtimePermissions.detail, 1);
  const runtimeParentPermissions = await parentPrivateCheck(context.runtimeDir, 'Private runtime');
  if (runtimeParentPermissions.status === 'blocked') throw new MacWorkerError(runtimeParentPermissions.detail, 1);
  const environmentPermissions = await privatePathCheck(context.environmentFile, 'Private bridge environment file');
  if (environmentPermissions.status === 'blocked') throw new MacWorkerError(environmentPermissions.detail, 1);
  const environmentParentPermissions = await parentPrivateCheck(context.environmentFile, 'Private bridge environment');
  if (environmentParentPermissions.status === 'blocked') throw new MacWorkerError(environmentParentPermissions.detail, 1);
  return { context, tools, configuration, profile };
}

async function buildBridge({ npm, environment }) {
  const build = await runCommand(npm, ['run', 'build'], {
    cwd: BRIDGE_ROOT,
    env: safeChildEnvironment({ ...process.env, ...environment }),
    timeout: 120_000,
    maxBuffer: 128_000,
  });
  if (!build.ok || !(await fileExists(BRIDGE_DIST_ENTRYPOINT))) {
    throw new MacWorkerError('The bridge TypeScript build failed; launchd files were not rendered.', 1);
  }
}

async function ensurePrivateDirectory(path) {
  await mkdir(path, { recursive: true, mode: 0o700 });
  await chmod(path, 0o700);
}

async function prepareWorker() {
  const { context, tools, configuration, profile } = await ensurePrepareContext();
  await buildBridge({ npm: tools.npm, environment: context.environment });
  const launchdDirectory = expandPath(process.env.NEEDTHISDONE_LAUNCHD_DIR)
    || join(context.runtimeDir, 'launchd');
  await ensurePrivateDirectory(launchdDirectory);
  await ensurePrivateDirectory(join(context.runtimeDir, 'logs'));
  const render = await runCommand(tools.bash, [
    LAUNCHD_RENDERER,
    context.runtimeDir,
    launchdDirectory,
    profile.configPath,
  ], {
    env: safeChildEnvironment({
      ...process.env,
      ...context.environment,
      NODE_BINARY: tools.node,
      OPENCLAW_BINARY: tools.openclaw,
      PLUTIL_BINARY: tools.plutil,
      OPENCLAW_GATEWAY_PORT: String(configuration.gatewayPort),
      OPENCLAW_PROFILE: configuration.readOnlyProfile,
    }),
    timeout: 30_000,
  });
  if (!render.ok) {
    throw new MacWorkerError('launchd template rendering failed; no job was loaded.', 1);
  }
  const gatewayPlist = join(launchdDirectory, `${MAC_WORKER_LABELS.gateway}.plist`);
  const bridgePlist = join(launchdDirectory, `${MAC_WORKER_LABELS.bridge}.plist`);
  if (!(await fileExists(gatewayPlist)) || !(await fileExists(bridgePlist))) {
    throw new MacWorkerError('launchd template rendering did not produce both reviewed plist files.', 1);
  }
  const manifestPath = join(context.runtimeDir, 'mac-worker.json');
  await writeFile(manifestPath, `${JSON.stringify({
    schema: 1,
    preparedAt: new Date().toISOString(),
    runtimeDirectory: context.runtimeDir,
    environmentFile: context.environmentFile,
    launchdDirectory,
    gatewayPlist,
    bridgePlist,
    nodeBinary: tools.node,
    openclawBinary: tools.openclaw,
    bridgeEntrypoint: BRIDGE_DIST_ENTRYPOINT,
    openclawProfile: configuration.readOnlyProfile,
    openclawConfig: profile.configPath,
    mode: configuration.mode,
    gatewayUrl: configuration.gatewayUrl,
    gatewayPort: configuration.gatewayPort,
    executorModel: MAC_WORKER_MODEL,
  }, null, 2)}\n`, { mode: 0o600 });
  await chmod(manifestPath, 0o600);
  return {
    command: 'prepare',
    ok: true,
    preparedAt: new Date().toISOString(),
    runtimeDirectory: context.runtimeDir,
    launchdDirectory,
    files: { bridge: bridgePlist, gateway: gatewayPlist },
    paths: { node: tools.node, openclaw: tools.openclaw, bridge: BRIDGE_DIST_ENTRYPOINT },
    profile: { name: configuration.readOnlyProfile, configPath: profile.configPath, model: profile.model, thinking: profile.thinking },
    mode: configuration.mode,
    gateway: { url: configuration.gatewayUrl, bind: '127.0.0.1', port: configuration.gatewayPort },
    activation: 'not_loaded',
  };
}

async function readManifest(runtimeDirectory) {
  const path = join(runtimeDirectory, 'mac-worker.json');
  try {
    const manifest = JSON.parse(await readFile(path, 'utf8'));
    if (manifest.schema !== 1 || manifest.runtimeDirectory !== runtimeDirectory || manifest.executorModel !== MAC_WORKER_MODEL) {
      throw new Error('manifest mismatch');
    }
    return manifest;
  } catch {
    return null;
  }
}

function assertPreparedManifest(manifest, context, configuration, preflight) {
  const matches = manifest
    && manifest.environmentFile === context.environmentFile
    && manifest.openclawProfile === configuration.readOnlyProfile
    && manifest.openclawConfig === preflight.profile.configPath
    && manifest.mode === configuration.mode
    && manifest.gatewayUrl === configuration.gatewayUrl
    && Number(manifest.gatewayPort) === configuration.gatewayPort
    && manifest.nodeBinary === preflight.paths.node
    && manifest.openclawBinary === preflight.paths.openclaw;
  if (!matches) {
    throw new MacWorkerError('Prepared launchd files do not match the current private runtime configuration. Run prepare again.', 1);
  }
}

function launchdDomain() {
  const uid = typeof process.getuid === 'function' ? process.getuid() : null;
  if (!Number.isInteger(uid)) throw new MacWorkerError('The Mac worker needs a user launchd session.', 1);
  return `gui/${uid}`;
}

async function launchdLoaded(launchctl, domain, label) {
  const result = await runCommand(launchctl, ['print', `${domain}/${label}`]);
  return {
    loaded: result.ok,
    detail: result.ok ? 'loaded' : 'not loaded',
    pid: result.ok ? Number(result.stdout.match(/\bpid\s*=\s*(\d+)/)?.[1] || 0) || null : null,
  };
}

async function bootstrapJob(launchctl, domain, plist, label) {
  const loaded = await launchdLoaded(launchctl, domain, label);
  if (loaded.loaded) return { ...loaded, startedByUs: false };
  const result = await runCommand(launchctl, ['bootstrap', domain, plist], { timeout: 30_000 });
  if (!result.ok) throw new MacWorkerError(`launchd could not load ${label}.`, 1);
  return { loaded: true, detail: 'loaded', pid: null, startedByUs: true };
}

async function bootoutJob(launchctl, domain, label) {
  const loaded = await launchdLoaded(launchctl, domain, label);
  if (!loaded.loaded) return { status: 'already_stopped' };
  const result = await runCommand(launchctl, ['bootout', `${domain}/${label}`], { timeout: 30_000 });
  if (!result.ok) {
    const output = `${result.stdout}\n${result.stderr}`.toLowerCase();
    if (output.includes('could not find') || output.includes('no such process') || output.includes('not found')) {
      return { status: 'already_stopped' };
    }
    return { status: 'failed' };
  }
  return { status: 'stopped' };
}

async function loadGatewayClient() {
  if (!(await fileExists(join(BRIDGE_ROOT, 'dist', 'openclaw-gateway.js')))) {
    throw new MacWorkerError('Build the bridge before probing the OpenClaw Gateway.', 1);
  }
  return import('../bridge/dist/openclaw-gateway.js');
}

async function raceWithAbort(promise, signal) {
  if (!signal) return promise;
  if (signal.aborted) {
    Promise.resolve(promise).catch(() => {});
    throw new MacWorkerError('The Mac worker rehearsal was interrupted; child cleanup is running.', 130);
  }
  let onAbort;
  const aborted = new Promise((_, reject) => {
    onAbort = () => reject(new MacWorkerError('The Mac worker rehearsal was interrupted; child cleanup is running.', 130));
    signal.addEventListener('abort', onAbort, { once: true });
  });
  try {
    return await Promise.race([promise, aborted]);
  } finally {
    signal.removeEventListener('abort', onAbort);
  }
}

async function waitForGatewayReady(url, token, timeoutMs = DEFAULT_HEARTBEAT_TIMEOUT_MS, signal) {
  const { OpenClawGatewayClient } = await loadGatewayClient();
  const deadline = Date.now() + timeoutMs;
  let lastError = null;
  while (Date.now() < deadline) {
    if (signal?.aborted) throw new MacWorkerError('The Mac worker rehearsal was interrupted; child cleanup is running.', 130);
    const client = new OpenClawGatewayClient({
      url,
      token,
      clientVersion: 'mac-worker-cli',
      requestTimeoutMs: 5_000,
    });
    try {
      await raceWithAbort(client.connect(), signal);
      client.close();
      return { ready: true, endpoint: url };
    } catch (error) {
      lastError = error;
      client.close();
      if (signal?.aborted) throw error;
      await raceWithAbort(new Promise((done) => setTimeout(done, 500)), signal);
    }
  }
  throw new MacWorkerError(lastError ? 'Loopback OpenClaw Gateway did not become ready before the timeout.' : 'Loopback OpenClaw Gateway was not ready.', 1);
}

async function signedPost(baseUrl, secret, path, payload) {
  const body = JSON.stringify(payload);
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const nonce = randomUUID();
  const signature = createHmac('sha256', secret)
    .update(`${path}.${timestamp}.${nonce}.${body}`)
    .digest('hex');
  let response;
  try {
    response = await fetch(new URL(path, baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`), {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-bridge-timestamp': timestamp,
        'x-bridge-nonce': nonce,
        'x-bridge-signature': signature,
        'user-agent': 'needthisdone-mac-worker-cli/0.1.0',
      },
      body,
    });
  } catch {
    throw new MacWorkerError('The signed bridge status request could not reach its API.', 1);
  }
  const text = await response.text();
  let payloadValue = {};
  try {
    payloadValue = text ? JSON.parse(text) : {};
  } catch {
    payloadValue = {};
  }
  if (!response.ok) {
    throw new MacWorkerError(`The signed bridge request was rejected with HTTP ${response.status}.`, 1);
  }
  return payloadValue;
}

function heartbeatPayload(configuration, status) {
  return {
    ownerId: configuration.ownerId,
    workerId: configuration.workerId,
    version: 'mac-worker-cli/0.1.0',
    status,
    capabilities: [],
    activeTaskId: null,
    error: null,
  };
}

async function readWorkerStatus(configuration, environment) {
  return signedPost(configuration.bridgeApiUrl, environment.OPENCLAW_BRIDGE_SECRET, '/api/agent-bridge/status', {
    ownerId: configuration.ownerId,
    workerId: configuration.workerId,
  });
}

async function waitForWorkerHeartbeat(configuration, environment, timeoutMs = DEFAULT_HEARTBEAT_TIMEOUT_MS, signal) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const result = await raceWithAbort(readWorkerStatus(configuration, environment), signal);
      const heartbeat = result?.heartbeat;
      if (heartbeat?.status === 'online' && heartbeat.worker_id === configuration.workerId) return result;
    } catch (error) {
      if (signal?.aborted) throw error;
    }
    await raceWithAbort(new Promise((done) => setTimeout(done, 500)), signal);
  }
  throw new MacWorkerError('The bridge worker did not publish an online heartbeat before the timeout.', 1);
}

async function startWorker(options) {
  if (options.confirmation !== MAC_WORKER_CONFIRMATION) {
    throw new MacWorkerError(`start loads launchd jobs. Re-run with --confirm ${MAC_WORKER_CONFIRMATION}.`, 64);
  }
  const preflight = await collectPreflight();
  if (!preflight.ok) {
    const blocked = preflight.checks.filter((item) => item.status === 'blocked').map((item) => item.name).join(', ');
    throw new MacWorkerError(`start refused because preflight is not ready (${blocked || 'see preflight'}).`, 1);
  }
  const context = await runtimeContext({ requireEnvironment: true });
  const configuration = validateBridgeEnvironment(context.environment);
  if (configuration.mode !== 'approved') {
    throw new MacWorkerError('start is reserved for approved/live mode; use test --local for disposable-local mode.', 64);
  }
  const manifest = await readManifest(context.runtimeDir);
  if (!manifest || !(await fileExists(manifest.bridgePlist)) || !(await fileExists(manifest.gatewayPlist))) {
    throw new MacWorkerError('Reviewed launchd files are missing. Run prepare before start.', 1);
  }
  assertPreparedManifest(manifest, context, configuration, preflight);
  for (const plist of [manifest.gatewayPlist, manifest.bridgePlist]) {
    const lint = await runCommand(preflight.paths.plutil, ['-lint', plist]);
    if (!lint.ok) throw new MacWorkerError('A prepared launchd plist no longer passes validation. Run prepare again.', 1);
  }
  const launchctl = preflight.paths.launchctl;
  if (!launchctl) throw new MacWorkerError('launchctl is unavailable.', 1);
  const domain = launchdDomain();
  let gatewayJob = null;
  let bridgeJob = null;
  const abortController = new AbortController();
  const onSignal = () => abortController.abort();
  process.once('SIGINT', onSignal);
  process.once('SIGTERM', onSignal);
  try {
    gatewayJob = await bootstrapJob(launchctl, domain, manifest.gatewayPlist, MAC_WORKER_LABELS.gateway);
    await waitForGatewayReady(configuration.gatewayUrl, context.environment.OPENCLAW_GATEWAY_TOKEN, DEFAULT_HEARTBEAT_TIMEOUT_MS, abortController.signal);
    bridgeJob = await bootstrapJob(launchctl, domain, manifest.bridgePlist, MAC_WORKER_LABELS.bridge);
    await waitForWorkerHeartbeat(configuration, context.environment, DEFAULT_HEARTBEAT_TIMEOUT_MS, abortController.signal);
    return {
      command: 'start',
      ok: true,
      gateway: { ...gatewayJob, ready: true, endpoint: configuration.gatewayUrl },
      bridge: { ...bridgeJob, heartbeat: 'online' },
      workerId: configuration.workerId,
      model: MAC_WORKER_MODEL,
      activation: 'loaded',
    };
  } catch (error) {
    if (bridgeJob?.startedByUs) await bootoutJob(launchctl, domain, MAC_WORKER_LABELS.bridge);
    if (gatewayJob?.startedByUs) await bootoutJob(launchctl, domain, MAC_WORKER_LABELS.gateway);
    throw error;
  } finally {
    process.removeListener('SIGINT', onSignal);
    process.removeListener('SIGTERM', onSignal);
  }
}

async function stopWorker() {
  const context = await runtimeContext();
  const tools = await discoverHostTools();
  const results = { bridge: 'not_attempted', gateway: 'not_attempted' };
  let heartbeat = 'not_attempted';
  let error = null;
  let configuration = null;

  if (tools.launchctl) {
    try {
      const domain = launchdDomain();
      results.bridge = (await bootoutJob(tools.launchctl, domain, MAC_WORKER_LABELS.bridge)).status;
      results.gateway = (await bootoutJob(tools.launchctl, domain, MAC_WORKER_LABELS.gateway)).status;
    } catch (failure) {
      results.bridge = 'unavailable';
      results.gateway = 'unavailable';
      error = safeError(failure);
    }
  } else {
    results.bridge = 'unavailable';
    results.gateway = 'unavailable';
    error = error || 'launchctl is unavailable.';
  }
  try {
    configuration = validateBridgeEnvironment(context.environment);
    await signedPost(configuration.bridgeApiUrl, context.environment.OPENCLAW_BRIDGE_SECRET, '/api/agent-bridge/heartbeat', heartbeatPayload(configuration, 'stopped'));
    heartbeat = 'recorded';
  } catch (failure) {
    heartbeat = 'unavailable';
    error = error || safeError(failure);
  }
  const ok = heartbeat === 'recorded' && !Object.values(results).some((value) => value === 'failed' || value === 'unavailable');
  return {
    command: 'stop',
    ok,
    workerId: configuration?.workerId || context.environment.BRIDGE_WORKER_ID || null,
    heartbeat,
    jobs: results,
    runtimeData: 'retained',
    ...(error ? { error } : {}),
  };
}

function parseLaunchdStatus(status) {
  return {
    loaded: status.loaded,
    pid: status.pid,
    state: status.loaded ? 'loaded' : 'not_loaded',
  };
}

function safeGatewayEndpoint(value) {
  try {
    const parsed = new URL(value || DEFAULT_GATEWAY_URL);
    if (['ws:', 'wss:'].includes(parsed.protocol)
      && isLoopbackHostname(parsed.hostname)
      && !parsed.username && !parsed.password && !parsed.search && !parsed.hash) {
      return parsed.toString();
    }
  } catch {}
  return DEFAULT_GATEWAY_URL;
}

async function statusWorker() {
  const context = await runtimeContext();
  const tools = await discoverHostTools();
  const configuredReadOnlyProfile = context.environment.OPENCLAW_READ_ONLY_PROFILE?.trim() || MAC_WORKER_PROFILE;
  const configuredBuilderProfile = context.environment.OPENCLAW_BUILDER_PROFILE?.trim() || MAC_WORKER_BUILDER_PROFILE;
  const status = {
    command: 'status',
    checkedAt: new Date().toISOString(),
    profile: {
      name: validProfileName(configuredReadOnlyProfile) ? configuredReadOnlyProfile : MAC_WORKER_PROFILE,
      builderProfile: validProfileName(configuredBuilderProfile) ? configuredBuilderProfile : MAC_WORKER_BUILDER_PROFILE,
      model: MAC_WORKER_MODEL,
      thinking: 'max',
    },
    launchd: {},
    gateway: { state: 'unavailable', endpoint: safeGatewayEndpoint(context.environment.OPENCLAW_GATEWAY_URL?.trim()) },
    worker: {
      id: redact(context.environment.BRIDGE_WORKER_ID) || null,
      state: 'unavailable',
      heartbeat: null,
      currentTask: null,
      model: MAC_WORKER_MODEL,
      recentError: null,
    },
  };
  if (tools.launchctl) {
    try {
      const domain = launchdDomain();
      status.launchd.gateway = parseLaunchdStatus(await launchdLoaded(tools.launchctl, domain, MAC_WORKER_LABELS.gateway));
      status.launchd.bridge = parseLaunchdStatus(await launchdLoaded(tools.launchctl, domain, MAC_WORKER_LABELS.bridge));
    } catch (error) {
      status.launchd.error = safeError(error);
    }
  } else {
    status.launchd.error = 'launchctl is unavailable.';
  }

  let configuration = null;
  try {
    const gatewayConfiguration = gatewaySettings(context.environment);
    const gateway = await waitForGatewayReady(gatewayConfiguration.gatewayUrl, gatewayConfiguration.token, 3_000);
    status.gateway = { state: gateway.ready ? 'ready' : 'unavailable', endpoint: gatewayConfiguration.gatewayUrl, bind: '127.0.0.1' };
  } catch (error) {
    status.gateway = { ...status.gateway, state: 'unavailable', error: safeError(error) };
  }
  try {
    if (!configuration) configuration = validateBridgeEnvironment(context.environment);
    status.worker.id = redact(configuration.workerId) || null;
    const bridgeStatus = await readWorkerStatus(configuration, context.environment);
    const heartbeat = bridgeStatus?.heartbeat || null;
    const currentTask = bridgeStatus?.currentTask || null;
    status.worker.state = heartbeat?.status || 'not_seen';
    status.worker.heartbeat = heartbeat ? {
      status: heartbeat.status,
      version: heartbeat.version,
      lastSeenAt: heartbeat.last_seen_at,
      activeTaskId: heartbeat.active_task_id,
    } : null;
    status.worker.currentTask = currentTask ? {
      id: currentTask.id,
      taskKey: currentTask.task_key,
      role: currentTask.agent_role,
      provider: currentTask.agent_provider,
      model: currentTask.model_id,
      type: currentTask.task_type,
      status: currentTask.status,
      progress: currentTask.progress,
      updatedAt: currentTask.updated_at,
      error: currentTask.last_error ? redact(currentTask.last_error) : null,
    } : null;
    status.worker.model = currentTask?.model_id || MAC_WORKER_MODEL;
    const recentError = heartbeat?.last_error || currentTask?.last_error;
    status.worker.recentError = recentError
      ? redact(recentError)
      : null;
  } catch (error) {
    status.worker.recentError = status.worker.recentError || safeError(error);
  }
  return status;
}

function childExitPromise(child) {
  return new Promise((resolveExit) => {
    let settled = false;
    const finish = (result) => {
      if (settled) return;
      settled = true;
      resolveExit(result);
    };
    if (child.exitCode !== null) {
      finish({ code: child.exitCode, signal: child.signalCode });
      return;
    }
    child.once('error', (error) => finish({ code: null, signal: null, error }));
    child.once('close', (code, signal) => finish({ code, signal }));
  });
}

function captureChildOutput(child) {
  const output = { stdout: '', stderr: '', error: null };
  const append = (key, chunk) => {
    output[key] = `${output[key]}${String(chunk)}`.slice(-MAX_COMMAND_OUTPUT);
  };
  child.stdout?.on('data', (chunk) => append('stdout', chunk));
  child.stderr?.on('data', (chunk) => append('stderr', chunk));
  child.on('error', (error) => { output.error = safeError(error); });
  return output;
}

async function terminateChild(child) {
  if (!child || child.exitCode !== null) return;
  child.kill('SIGTERM');
  const exited = await Promise.race([
    childExitPromise(child),
    new Promise((resolveExit) => setTimeout(() => resolveExit(null), 8_000)),
  ]);
  if (!exited && child.exitCode === null) child.kill('SIGKILL');
}

async function waitForForegroundExitOrSignal(children, durationSeconds) {
  return new Promise((resolveResult) => {
    let settled = false;
    let timer = null;
    const cleanup = () => {
      process.removeListener('SIGINT', onSigint);
      process.removeListener('SIGTERM', onSigterm);
      if (timer) clearTimeout(timer);
    };
    const finish = (result) => {
      if (settled) return;
      settled = true;
      cleanup();
      resolveResult(result);
    };
    const onSigint = () => finish({ kind: 'signal', name: 'SIGINT' });
    const onSigterm = () => finish({ kind: 'signal', name: 'SIGTERM' });
    process.once('SIGINT', onSigint);
    process.once('SIGTERM', onSigterm);
    if (durationSeconds > 0) timer = setTimeout(() => finish({ kind: 'duration' }), durationSeconds * 1000);
    for (const { child, label, output } of children) {
      childExitPromise(child).then((result) => finish({ kind: 'child', label, output, result }));
    }
  });
}

async function runLocalRehearsal(options) {
  const context = await runtimeContext({ requireEnvironment: true });
  const configuration = validateBridgeEnvironment(context.environment);
  if (configuration.mode !== 'disposable-local') {
    throw new MacWorkerError('test --local requires BRIDGE_MODE=disposable-local and a loopback BRIDGE_API_URL.', 64);
  }
  if (configuration.workerId !== DEFAULT_LOCAL_WORKER_ID) {
    throw new MacWorkerError(`test --local requires BRIDGE_WORKER_ID=${DEFAULT_LOCAL_WORKER_ID}.`, 64);
  }
  const preflight = await collectPreflight({ environmentOverride: context.environment, full: true });
  if (!preflight.ok) {
    const blocked = preflight.checks.filter((item) => item.status === 'blocked').map((item) => item.name).join(', ');
    throw new MacWorkerError(`local rehearsal refused because preflight is not ready (${blocked || 'see preflight'}).`, 1);
  }
  const tools = preflight.paths;
  if (!tools.node || !tools.openclaw || !tools.npm) throw new MacWorkerError('local rehearsal requires Node, OpenClaw, and npm.', 1);
  const profile = await inspectProfile({
    node: tools.node,
    openclaw: tools.openclaw,
    profile: configuration.readOnlyProfile,
    builderProfile: configuration.builderProfile,
    environment: context.environment,
    explicitPath: context.configPath,
  });
  await buildBridge({ npm: tools.npm, environment: context.environment });

  const temporaryRoot = await mkdtemp(join(tmpdir(), 'needthisdone-local-'));
  let gateway = null;
  let bridge = null;
  const abortController = new AbortController();
  const onSignal = () => abortController.abort();
  process.once('SIGINT', onSignal);
  process.once('SIGTERM', onSignal);
  try {
    await chmod(temporaryRoot, 0o700);
    const temporaryArtifacts = join(temporaryRoot, 'artifacts');
    await ensurePrivateDirectory(temporaryArtifacts);
    const localEnvironment = {
      ...context.environment,
      BRIDGE_MODE: 'disposable-local',
      BRIDGE_RUNTIME_MODE: 'disposable-local',
      BRIDGE_ARTIFACT_ROOT: temporaryArtifacts,
      OPENCLAW_CONFIG: profile.configPath,
      OPENCLAW_GATEWAY_URL: configuration.gatewayUrl,
      OPENCLAW_GATEWAY_PORT: String(configuration.gatewayPort),
      OPENCLAW_PROFILE: configuration.readOnlyProfile,
    };
    const childEnvironment = safeProviderEnvironment(localEnvironment);
    gateway = spawn(tools.openclaw, [
      '--profile', configuration.readOnlyProfile,
      'gateway', 'run', '--bind', 'loopback', '--auth', 'token', '--port', String(configuration.gatewayPort),
    ], {
      cwd: REPO_ROOT,
      env: childEnvironment,
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    const gatewayOutput = captureChildOutput(gateway);
    await waitForGatewayReady(configuration.gatewayUrl, localEnvironment.OPENCLAW_GATEWAY_TOKEN, DEFAULT_HEARTBEAT_TIMEOUT_MS, abortController.signal);
    bridge = spawn(tools.node, [BRIDGE_DIST_ENTRYPOINT], {
      cwd: BRIDGE_ROOT,
      env: childEnvironment,
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    const bridgeOutput = captureChildOutput(bridge);
    await waitForWorkerHeartbeat(configuration, localEnvironment, DEFAULT_HEARTBEAT_TIMEOUT_MS, abortController.signal);
    process.stderr.write('[mac-worker] disposable-local foreground rehearsal is running; press Ctrl-C to stop.\n');
    const foreground = await waitForForegroundExitOrSignal([
      { child: gateway, label: 'gateway', output: gatewayOutput },
      { child: bridge, label: 'bridge', output: bridgeOutput },
    ], options.durationSeconds);
    if (foreground.kind === 'child') {
      throw new MacWorkerError(`${foreground.label} exited during the local rehearsal.`, 1);
    }
    return {
      command: 'test',
      mode: 'disposable-local',
      ok: true,
      workerId: configuration.workerId,
      profile: { name: configuration.readOnlyProfile, configPath: profile.configPath, model: profile.model, thinking: profile.thinking },
      gateway: { endpoint: configuration.gatewayUrl, bind: '127.0.0.1', foreground: true },
      bridge: { foreground: true, heartbeat: 'online' },
      durationSeconds: options.durationSeconds,
      cleanup: 'completed in finally; temporary artifacts removed',
    };
  } finally {
    process.removeListener('SIGINT', onSignal);
    process.removeListener('SIGTERM', onSignal);
    await terminateChild(bridge);
    await terminateChild(gateway);
    const temporaryRootParent = dirname(temporaryRoot);
    const temporaryName = relative(tmpdir(), temporaryRoot);
    if (temporaryRootParent === tmpdir() && /^needthisdone-local-[^/]+$/.test(temporaryName)) {
      await rm(temporaryRoot, { recursive: true, force: true });
    }
  }
}

function usage() {
  return [
    'Usage:',
    '  npm run mac:worker -- preflight [--json]',
    '  npm run mac:worker -- prepare [--json]',
    `  npm run mac:worker -- start --confirm ${MAC_WORKER_CONFIRMATION} [--json]`,
    '  npm run mac:worker -- status [--json]',
    '  npm run mac:worker -- stop [--json]',
    '  npm run mac:worker -- test --local [--duration SECONDS] [--json]',
  ].join('\n');
}

export function parseArguments(argv) {
  const [requestedCommand = 'help', ...rest] = argv;
  const command = requestedCommand === '--help' || requestedCommand === '-h' ? 'help' : requestedCommand;
  const options = {
    command,
    json: false,
    local: false,
    confirmation: '',
    durationSeconds: DEFAULT_LOCAL_DURATION_SECONDS,
  };
  for (let index = 0; index < rest.length; index += 1) {
    const value = rest[index];
    if (value === '--json') options.json = true;
    else if (value === '--local') options.local = true;
    else if (value === '--confirm') {
      options.confirmation = rest[index + 1] || '';
      index += 1;
    } else if (value === '--duration') {
      options.durationSeconds = parsePositiveInteger(rest[index + 1], '--duration', 1, 3_600);
      index += 1;
    } else if (value === '--help' || value === '-h') {
      options.command = 'help';
    } else {
      throw new MacWorkerError(`Unknown option: ${value}.\n${usage()}`, 64);
    }
  }
  return options;
}

function humanOutput(result) {
  if (result.command === 'preflight') {
    return [
      `Mac worker preflight: ${result.ok ? 'ready' : 'blocked'}`,
      `Runtime: ${result.runtime.directory}`,
      `Read-only profile: ${result.profile.name} (${result.profile.model || 'unresolved'})`,
      ...result.checks.map((item) => `- ${item.status.toUpperCase()} ${item.name}: ${item.detail}`),
    ].join('\n');
  }
  if (result.command === 'prepare') {
    return [
      'Mac worker prepare: rendered review-only launchd files.',
      `Bridge: ${result.files.bridge}`,
      `Gateway: ${result.files.gateway} (bind ${result.gateway.bind})`,
      `Node: ${result.paths.node}`,
      `OpenClaw: ${result.paths.openclaw}`,
      'Activation: not loaded; no launchctl call was made.',
    ].join('\n');
  }
  if (result.command === 'start') {
    return `Mac worker started after explicit confirmation. Gateway is ready on ${result.gateway.endpoint}; worker heartbeat is ${result.bridge.heartbeat}.`;
  }
  if (result.command === 'stop') {
    return `Mac worker stop: heartbeat ${result.heartbeat}; bridge ${result.jobs.bridge}; gateway ${result.jobs.gateway}. Runtime data retained.`;
  }
  if (result.command === 'status') {
    const task = result.worker.currentTask;
    return [
      'NeedThisDone Mac worker status',
      `Profile: ${result.profile.name} (builder kept separate: ${result.profile.builderProfile})`,
      `Model: ${result.worker.model} / thinking ${result.profile.thinking}`,
      `launchd gateway: ${result.launchd.gateway?.state || 'unavailable'}; bridge: ${result.launchd.bridge?.state || 'unavailable'}`,
      `Gateway: ${result.gateway.state} at ${result.gateway.endpoint}`,
      `Worker: ${result.worker.id || 'unknown'} (${result.worker.state})`,
      `Task: ${task ? `${task.id} ${task.status} ${task.progress}%` : 'none reported'}`,
      `Recent error: ${result.worker.recentError || 'none reported'}`,
    ].join('\n');
  }
  return usage();
}

export async function runCommandLine(argv) {
  const options = parseArguments(argv);
  if (options.command === 'help') {
    process.stdout.write(`${usage()}\n`);
    return { command: 'help', ok: true };
  }
  let result;
  if (options.command === 'preflight') result = await collectPreflight();
  else if (options.command === 'prepare') result = await prepareWorker();
  else if (options.command === 'start') result = await startWorker(options);
  else if (options.command === 'status') result = await statusWorker();
  else if (options.command === 'stop') result = await stopWorker();
  else if (options.command === 'test') {
    if (!options.local) throw new MacWorkerError('test requires the explicit --local flag.', 64);
    result = await runLocalRehearsal(options);
  } else {
    throw new MacWorkerError(`Unknown command: ${options.command}.\n${usage()}`, 64);
  }
  process.stdout.write(`${options.json ? JSON.stringify(result, null, 2) : humanOutput(result)}\n`);
  if (result.ok === false) process.exitCode = 1;
  return result;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  runCommandLine(process.argv.slice(2)).catch((error) => {
    process.stderr.write(`[mac-worker] ${safeError(error)}\n`);
    process.exitCode = error instanceof MacWorkerError ? error.code : 1;
  });
}
