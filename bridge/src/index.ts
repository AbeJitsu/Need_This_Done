import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { BridgeApiClient } from './bridge-client.js';
import { OpenClawGatewayClient } from './openclaw-gateway.js';
import { AgentBridgeRunner } from './runner.js';

const DEFAULT_VERSION = '0.1.0';
const DEFAULT_GATEWAY_URL = 'ws://127.0.0.1:18789';
const DEFAULT_ARTIFACT_ROOT = 'bridge-artifacts';
const DEFAULT_POLL_INTERVAL_MS = 5_000;
const DEFAULT_REQUEST_TIMEOUT_MS = 30_000;
const DEFAULT_CAPABILITIES = [
  'coordinate',
  'research_public_web',
  'draft_outreach',
  'produce_daily_content',
  'review_artifacts',
  'regenerate_artifact',
];

type RuntimeEnvironment = Record<string, string | undefined>;

export type BridgeRuntime = {
  runner: AgentBridgeRunner;
  pollIntervalMs: number;
};

function required(environment: RuntimeEnvironment, name: string) {
  const value = environment[name]?.trim();
  if (!value) throw new Error(`${name} is required.`);
  return value;
}

function parseBoundedNumber(environment: RuntimeEnvironment, name: string, fallback: number, minimum: number, maximum: number) {
  const raw = environment[name]?.trim();
  if (!raw) return fallback;
  const value = Number(raw);
  if (!Number.isInteger(value) || value < minimum || value > maximum) {
    throw new Error(`${name} must be an integer between ${minimum} and ${maximum}.`);
  }
  return value;
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function capabilitiesFrom(environment: RuntimeEnvironment) {
  const raw = environment.BRIDGE_CAPABILITIES?.trim();
  const capabilities = (raw ? raw.split(',') : DEFAULT_CAPABILITIES)
    .map((value) => value.trim())
    .filter(Boolean);
  return [...new Set(capabilities)];
}

export function createBridgeRuntime(environment: RuntimeEnvironment = process.env): BridgeRuntime {
  const ownerId = required(environment, 'BRIDGE_OWNER_ID');
  if (!isUuid(ownerId)) throw new Error('BRIDGE_OWNER_ID must be a UUID.');
  const version = environment.BRIDGE_VERSION?.trim() || DEFAULT_VERSION;
  const workerId = required(environment, 'BRIDGE_WORKER_ID');
  if (required(environment, 'OPENCLAW_EXECUTOR_MODEL_ID') !== 'openai/gpt-5.6-luna') {
    throw new Error('OPENCLAW_EXECUTOR_MODEL_ID must be exactly openai/gpt-5.6-luna.');
  }
  const api = new BridgeApiClient({
    baseUrl: required(environment, 'BRIDGE_API_URL'),
    secret: required(environment, 'OPENCLAW_BRIDGE_SECRET'),
    ownerId,
    workerId,
    version,
  });
  const gateway = new OpenClawGatewayClient({
    url: environment.OPENCLAW_GATEWAY_URL?.trim() || DEFAULT_GATEWAY_URL,
    token: required(environment, 'OPENCLAW_GATEWAY_TOKEN'),
    clientVersion: version,
    requestTimeoutMs: parseBoundedNumber(environment, 'OPENCLAW_REQUEST_TIMEOUT_MS', DEFAULT_REQUEST_TIMEOUT_MS, 1_000, 300_000),
  });
  const artifactRoot = resolve(environment.BRIDGE_ARTIFACT_ROOT?.trim() || DEFAULT_ARTIFACT_ROOT);
  const runner = new AgentBridgeRunner({
    api,
    gateway,
    artifactRoot,
    capabilities: capabilitiesFrom(environment),
  });
  return {
    runner,
    pollIntervalMs: parseBoundedNumber(environment, 'BRIDGE_POLL_INTERVAL_MS', DEFAULT_POLL_INTERVAL_MS, 1_000, 300_000),
  };
}

export async function runBridge(environment: RuntimeEnvironment = process.env) {
  const runtime = createBridgeRuntime(environment);
  let stopping = false;
  let stopPromise: Promise<void> | null = null;
  const stop = () => {
    if (!stopPromise) {
      stopping = true;
      stopPromise = runtime.runner.stop();
    }
    return stopPromise;
  };

  const signals = ['SIGINT', 'SIGTERM'] as const;
  for (const signal of signals) process.once(signal, stop);
  console.log(`[bridge] worker ${environment.BRIDGE_WORKER_ID} is running; polling every ${runtime.pollIntervalMs}ms.`);

  try {
    while (!stopping) {
      try {
        const result = await runtime.runner.runOnce();
        if (result.status !== 'idle') console.log(`[bridge] ${result.status}${'taskId' in result ? ` task=${result.taskId}` : ''}.`);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown bridge error.';
        console.error(`[bridge] ${message}`);
      }
      if (stopping) break;
      await new Promise<void>((resolveDelay) => setTimeout(resolveDelay, runtime.pollIntervalMs));
    }
  } finally {
    await stop();
    for (const signal of signals) process.removeListener(signal, stop);
    console.log('[bridge] stopped.');
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  runBridge().catch((error: unknown) => {
    const message = error instanceof Error ? error.message : 'Bridge startup failed.';
    console.error(`[bridge] ${message}`);
    process.exitCode = 1;
  });
}
