#!/usr/bin/env node

import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';

const LUNA = 'openai/gpt-5.6-luna';
const OAUTH_PROFILE = 'openai:needthisdone-oauth';
const REQUIRED_DENIES = [
  'exec',
  'process',
  'read',
  'write',
  'edit',
  'apply_patch',
  'message',
  'conversations_send',
  'conversations_turn',
  'publish',
  'cron',
  'browser',
  'computer',
  'nodes',
  'sessions_send',
  'sessions_spawn',
];

function fail(message) {
  process.stderr.write(`OpenClaw proof profile rejected: ${message}\n`);
  process.exit(1);
}

function equal(actual, expected, label) {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    fail(`${label} must be ${JSON.stringify(expected)}; received ${JSON.stringify(actual)}.`);
  }
}

function assert(value, label) {
  if (!value) fail(label);
}

function get(object, path) {
  return path.split('.').reduce((value, key) => value?.[key], object);
}

function assertExact(path, expected, config) {
  equal(get(config, path), expected, path);
}

function findSecretLikeKeys(value, path = '$', findings = []) {
  if (!value || typeof value !== 'object') return findings;
  for (const [key, child] of Object.entries(value)) {
    const childPath = `${path}.${key}`;
    if (/^(apiKey|key|password|token)$/i.test(key)) {
      const isGatewayTokenRef = childPath === '$.gateway.auth.token'
        && child?.source === 'env'
        && child?.provider === 'default'
        && child?.id === 'OPENCLAW_GATEWAY_TOKEN';
      if (!isGatewayTokenRef) findings.push(childPath);
    }
    findSecretLikeKeys(child, childPath, findings);
  }
  return findings;
}

const configPath = process.argv[2];
if (!configPath) fail('usage: verify-profile.mjs CONFIG_PATH [AUTH_LIST_JSON_PATH]');

let config;
try {
  config = JSON.parse(await readFile(configPath, 'utf8'));
} catch (error) {
  fail(`could not parse ${configPath}: ${error.message}`);
}

assertExact('gateway.mode', 'local', config);
assertExact('gateway.port', 18789, config);
assertExact('gateway.bind', 'loopback', config);
assertExact('gateway.auth.mode', 'token', config);
equal(get(config, 'gateway.auth.token'), {
  source: 'env',
  provider: 'default',
  id: 'OPENCLAW_GATEWAY_TOKEN',
}, 'gateway.auth.token');
assertExact('gateway.tailscale.mode', 'off', config);
assertExact('gateway.controlUi.enabled', false, config);
assertExact('gateway.http.endpoints.chatCompletions.enabled', false, config);
assertExact('gateway.http.endpoints.responses.enabled', false, config);
assertExact('gateway.nodes.pairing.autoApproveLocal', false, config);
assertExact('gateway.nodes.pluginTools.enabled', false, config);
assertExact('gateway.nodes.allowSkills', false, config);
assertExact('commands.restart', false, config);

assertExact('agents.defaults.model.primary', LUNA, config);
equal(get(config, 'agents.defaults.model.fallbacks'), [], 'agents.defaults.model.fallbacks');
equal(get(config, 'agents.defaults.modelPolicy.allow'), [LUNA], 'agents.defaults.modelPolicy.allow');
equal(Object.keys(config.agents?.defaults?.models ?? {}), [LUNA], 'configured model entries');
equal(config.agents?.defaults?.models?.[LUNA]?.agentRuntime?.id, 'openclaw', `agents.defaults.models[${LUNA}].agentRuntime.id`);
assertExact('agents.defaults.thinkingDefault', 'max', config);
assertExact('agents.defaults.fastModeDefault', false, config);
assertExact('agents.defaults.elevatedDefault', 'off', config);
assertExact('agents.defaults.sandbox.mode', 'all', config);
assertExact('agents.defaults.sandbox.backend', 'docker', config);
assertExact('agents.defaults.sandbox.scope', 'session', config);
assertExact('agents.defaults.sandbox.workspaceAccess', 'none', config);
assertExact('agents.defaults.sandbox.docker.image', 'openclaw-sandbox:bookworm-slim', config);
assertExact('agents.defaults.sandbox.docker.readOnlyRoot', true, config);
assertExact('agents.defaults.sandbox.docker.network', 'none', config);
equal(get(config, 'agents.defaults.sandbox.docker.capDrop'), ['ALL'], 'agents.defaults.sandbox.docker.capDrop');
equal(get(config, 'agents.defaults.sandbox.docker.tmpfs'), ['/tmp', '/var/tmp', '/run'], 'agents.defaults.sandbox.docker.tmpfs');
assertExact('agents.defaults.heartbeat.every', '0m', config);
equal(get(config, 'agents.defaults.skills'), [], 'agents.defaults.skills');

equal(get(config, 'auth.order.openai'), [OAUTH_PROFILE], 'auth.order.openai');
assertExact(`auth.profiles.${OAUTH_PROFILE}.provider`, 'openai', config);
assertExact(`auth.profiles.${OAUTH_PROFILE}.mode`, 'oauth', config);

equal(get(config, 'tools.allow'), ['web_search', 'web_fetch'], 'tools.allow');
const denies = new Set(get(config, 'tools.deny') ?? []);
for (const tool of REQUIRED_DENIES) assert(denies.has(tool), `tools.deny must include ${tool}.`);
assertExact('tools.exec.mode', 'deny', config);
assertExact('tools.exec.applyPatch.enabled', false, config);
assertExact('tools.elevated.enabled', false, config);
assertExact('tools.agentToAgent.enabled', false, config);
assertExact('tools.sessions.visibility', 'self', config);
assertExact('tools.web.search.enabled', true, config);
assertExact('tools.web.search.provider', 'duckduckgo', config);
assertExact('tools.web.fetch.enabled', true, config);
assertExact('plugins.entries.duckduckgo.enabled', true, config);
equal(get(config, 'plugins.allow'), ['openai', 'duckduckgo', 'web-readability'], 'plugins.allow');
equal(get(config, 'plugins.deny'), [], 'plugins.deny');
assertExact('discovery.mdns.mode', 'off', config);

equal(Object.keys(config.channels ?? {}), [], 'configured channels');
assertExact('cron.enabled', false, config);
assertExact('cron.triggers.enabled', false, config);
assertExact('hooks.enabled', false, config);
assertExact('hooks.internal.enabled', false, config);
assertExact('memory.search.enabled', false, config);
assertExact('browser.enabled', false, config);
assertExact('browser.allowSystemProfileImport', false, config);
assertExact('desktop.host.enabled', false, config);

const secretLikeKeys = findSecretLikeKeys(config);
equal(secretLikeKeys, [], 'literal or unexpected secret-bearing config keys');
const serialized = JSON.stringify(config).toLowerCase();
assert(!serialized.includes('openrouter'), 'config must not contain an OpenRouter route or credential.');
assert(!serialized.includes('ultra'), 'config must not contain ultra reasoning.');

const evidence = {
  profile: 'needthisdone',
  config: 'pass',
  model: LUNA,
  thinking: 'max',
  fastMode: false,
  fallbackModels: 0,
  runtime: 'openclaw',
  gateway: {
    bind: 'loopback',
    auth: 'token SecretRef',
    controlUi: false,
    publicInferenceEndpoints: false,
  },
  allowedTools: ['web_search', 'web_fetch'],
  deniedCapabilities: REQUIRED_DENIES,
  channels: 0,
  schedules: false,
  hooks: false,
};

const authListPath = process.argv[3];
if (authListPath) {
  let authList;
  try {
    authList = JSON.parse(await readFile(authListPath, 'utf8'));
  } catch (error) {
    fail(`could not parse auth-list evidence: ${error.message}`);
  }
  const profiles = Array.isArray(authList) ? authList : authList.profiles;
  assert(Array.isArray(profiles), 'auth-list JSON must contain a profiles array.');
  const selected = profiles.filter((profile) => profile.id === OAUTH_PROFILE);
  equal(selected.length, 1, 'selected OAuth profile count');
  assert(selected[0].provider === 'openai', 'selected credential provider must be openai.');
  assert((selected[0].type ?? selected[0].mode) === 'oauth', 'selected credential type must be oauth.');
  const paidFallbacks = profiles.filter((profile) =>
    (profile.provider === 'openai' || profile.provider === 'openrouter')
      && (profile.type === 'api_key' || profile.mode === 'api_key')
      && profile.id === OAUTH_PROFILE);
  equal(paidFallbacks.length, 0, 'selected API-key fallback count');
  evidence.auth = {
    provider: 'openai',
    type: 'oauth',
    profileIdSha256: createHash('sha256').update(OAUTH_PROFILE).digest('hex'),
    selectedApiKeyFallbacks: 0,
  };
}

process.stdout.write(`${JSON.stringify(evidence, null, 2)}\n`);
