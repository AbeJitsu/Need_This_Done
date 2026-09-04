import { createBridgeRuntime } from './index.js';

type RuntimeEnvironment = Record<string, string | undefined>;

function value(environment: RuntimeEnvironment, name: string) {
  const configured = environment[name]?.trim();
  if (!configured) throw new Error(`${name} is required.`);
  return configured;
}

function loopback(hostname: string) {
  return hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1';
}

/**
 * Validate an approved private-Mac rehearsal configuration without opening a socket,
 * polling the bridge API, starting a worker, or invoking OpenClaw.
 */
export function validateBridgeRehearsalConfiguration(environment: RuntimeEnvironment = process.env) {
  createBridgeRuntime(environment);
  const bridgeApi = new URL(value(environment, 'BRIDGE_API_URL'));
  if (bridgeApi.protocol !== 'https:' || loopback(bridgeApi.hostname)) {
    throw new Error('BRIDGE_API_URL must be an external HTTPS URL for an approved private-Mac rehearsal.');
  }
  if (value(environment, 'OPENCLAW_GATEWAY_TOKEN').length < 32) {
    throw new Error('OPENCLAW_GATEWAY_TOKEN must contain at least 32 characters.');
  }
  if (value(environment, 'OPENCLAW_EXECUTOR_MODEL_ID') !== 'openai/gpt-5.6-luna') {
    throw new Error('OPENCLAW_EXECUTOR_MODEL_ID must be exactly openai/gpt-5.6-luna.');
  }
  const artifactRoot = value(environment, 'BRIDGE_ARTIFACT_ROOT');
  if (!artifactRoot.startsWith('/')) {
    throw new Error('BRIDGE_ARTIFACT_ROOT must be an absolute private path.');
  }
  return {
    bridgeApiOrigin: bridgeApi.origin,
    gateway: environment.OPENCLAW_GATEWAY_URL?.trim() || 'ws://127.0.0.1:18789',
    artifactRoot,
  };
}

if (process.argv[1]?.endsWith('/validate-config.js')) {
  try {
    validateBridgeRehearsalConfiguration();
    console.log('[bridge] rehearsal configuration is valid; no worker, bridge request, or Gateway connection was started.');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Bridge rehearsal configuration is invalid.';
    console.error(`[bridge] ${message}`);
    process.exitCode = 1;
  }
}
