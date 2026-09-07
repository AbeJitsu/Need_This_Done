import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';
import {
  MAC_WORKER_BUILDER_PROFILE,
  MAC_WORKER_CONFIRMATION,
  MAC_WORKER_MODEL,
  MAC_WORKER_PROFILE,
  parseArguments,
  parseEnvironmentText,
  validateBridgeEnvironment,
} from '../../scripts/mac-worker.mjs';

const ownerId = '00000000-0000-4000-8000-000000000001';

function environment(overrides = {}) {
  return {
    BRIDGE_API_URL: 'https://control.example.test/api',
    OPENCLAW_BRIDGE_SECRET: 'bridge-secret',
    BRIDGE_OWNER_ID: ownerId,
    BRIDGE_WORKER_ID: 'macbook-pro-hermes-rehearsal',
    OPENCLAW_GATEWAY_TOKEN: 'a'.repeat(32),
    BRIDGE_ARTIFACT_ROOT: '/private/needthisdone/artifacts',
    OPENCLAW_EXECUTOR_MODEL_ID: MAC_WORKER_MODEL,
    OPENCLAW_GATEWAY_URL: 'ws://127.0.0.1:18789',
    ...overrides,
  };
}

test('Mac worker environment parsing does not evaluate shell expressions', () => {
  const parsed = parseEnvironmentText([
    'BRIDGE_MODE=disposable-local',
    "BRIDGE_API_URL='http://127.0.0.1:3100'",
    'IGNORED=$(touch /tmp/should-not-run)',
    '# comment',
  ].join('\n'));
  assert.equal(parsed.BRIDGE_MODE, 'disposable-local');
  assert.equal(parsed.BRIDGE_API_URL, 'http://127.0.0.1:3100');
  assert.equal(parsed.IGNORED, '$(touch /tmp/should-not-run)');
});

test('Mac worker keeps approved HTTPS and disposable-local loopback modes distinct', () => {
  assert.equal(validateBridgeEnvironment(environment()).mode, 'approved');
  assert.equal(validateBridgeEnvironment(environment({
    BRIDGE_MODE: 'disposable-local',
    BRIDGE_API_URL: 'http://127.0.0.1:3100',
  })).mode, 'disposable-local');
  assert.throws(() => validateBridgeEnvironment(environment({ BRIDGE_API_URL: 'http://127.0.0.1:3100' })), /approved.*external HTTPS/i);
  assert.throws(() => validateBridgeEnvironment(environment({ BRIDGE_API_URL: 'https://127.0.0.2' })), /approved.*external HTTPS/i);
  assert.throws(() => validateBridgeEnvironment(environment({
    BRIDGE_MODE: 'disposable-local',
    BRIDGE_API_URL: 'http://control.example.test',
  })), /loopback/i);
  assert.throws(() => validateBridgeEnvironment(environment({
    BRIDGE_MODE: 'disposable-local',
    BRIDGE_API_URL: 'http://0.0.0.0:3100',
  })), /loopback/i);
  assert.throws(() => validateBridgeEnvironment(environment({
    OPENCLAW_READ_ONLY_PROFILE: MAC_WORKER_BUILDER_PROFILE,
  })), /separate from the builder/i);
});

test('Mac worker CLI requires explicit activation confirmation and explicit local mode', () => {
  assert.deepEqual(parseArguments(['start', '--confirm', MAC_WORKER_CONFIRMATION]), {
    command: 'start', json: false, local: false, confirmation: MAC_WORKER_CONFIRMATION, durationSeconds: 0,
  });
  assert.deepEqual(parseArguments(['test', '--local', '--duration', '12', '--json']), {
    command: 'test', json: true, local: true, confirmation: '', durationSeconds: 12,
  });
  assert.equal(parseArguments(['test', '--duration', '12']).local, false); // dispatch enforces --local
  assert.equal(parseArguments(['--help']).command, 'help');
});

test('Mac worker launchd templates contain no legacy hard-coded runtime binaries', async () => {
  const installer = await readFile(new URL('../launchd/install-templates.sh', import.meta.url), 'utf8');
  const bridgeRunner = await readFile(new URL('../launchd/run-bridge.sh', import.meta.url), 'utf8');
  const gatewayRunner = await readFile(new URL('../launchd/run-gateway.sh', import.meta.url), 'utf8');
  const configValidator = await readFile(new URL('../launchd/validate-runtime-config.sh', import.meta.url), 'utf8');
  const gatewayTemplate = await readFile(new URL('../launchd/com.needthisdone.openclaw-gateway.plist.template', import.meta.url), 'utf8');
  assert.doesNotMatch(installer, /\/usr\/local\/bin\/(?:node|openclaw)/);
  assert.doesNotMatch(bridgeRunner, /\/usr\/local\/bin\/node/);
  assert.doesNotMatch(gatewayRunner, /\/usr\/local\/bin\/openclaw/);
  assert.doesNotMatch(configValidator, /\/usr\/local\/bin\/node/);
  assert.match(installer, /command -v node/);
  assert.match(installer, /command -v openclaw/);
  assert.match(installer, /command -v plutil/);
  assert.match(configValidator, /command -v node/);
  assert.match(gatewayTemplate, /127\.0\.0\.1/);
  assert.match(gatewayRunner, /gateway run --bind loopback/);
});
