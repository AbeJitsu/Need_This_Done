import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';
import { mkdtemp, symlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import { BridgeApiClient, BridgeApiError } from '../dist/bridge-client.js';
import { OpenClawGatewayClient } from '../dist/openclaw-gateway.js';
import { AgentBridgeRunner } from '../dist/runner.js';

const ownerId = '00000000-0000-4000-8000-000000000001';
const taskId = '00000000-0000-4000-8000-000000000002';
const runId = '00000000-0000-4000-8000-000000000003';

function response(payload, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

test('BridgeApiClient signs the exact server purpose and rejects unsafe API URLs', async () => {
  let request;
  const client = new BridgeApiClient({
    baseUrl: 'http://127.0.0.1:3000',
    secret: 'bridge-secret',
    ownerId,
    workerId: 'test-worker',
    version: 'test',
    now: () => 1_700_000_000_000,
    nonceFactory: () => 'nonce-with-at-least-16-bytes',
    fetchImpl: async (url, init) => {
      request = { url: String(url), init };
      return response({ heartbeat: { status: 'online' } });
    },
  });

  await client.heartbeat({ status: 'online', capabilities: ['research_public_web'] });
  const body = request.init.body;
  const expected = createHmac('sha256', 'bridge-secret')
    .update(`/api/agent-bridge/heartbeat.1700000000.nonce-with-at-least-16-bytes.${body}`)
    .digest('hex');
  assert.equal(request.url, 'http://127.0.0.1:3000/api/agent-bridge/heartbeat');
  assert.equal(request.init.headers['x-bridge-signature'], expected);

  assert.throws(() => new BridgeApiClient({
    baseUrl: 'http://example.com',
    secret: 'secret',
    ownerId,
    workerId: 'test-worker',
    version: 'test',
  }), /HTTPS/);

  const failureClient = new BridgeApiClient({
    baseUrl: 'http://127.0.0.1:3000',
    secret: 'secret',
    ownerId,
    workerId: 'test-worker',
    version: 'test',
    fetchImpl: async () => response({ error: 'nope' }, 409),
  });
  await assert.rejects(() => failureClient.schedule(), (error) => {
    assert.ok(error instanceof BridgeApiError);
    assert.equal(error.status, 409);
    return true;
  });
});

class FakeSocket {
  sent = [];
  listeners = new Map();
  closed = false;

  addEventListener(type, listener) {
    this.listeners.set(type, listener);
  }

  emit(type, event = {}) {
    this.listeners.get(type)?.(event);
  }

  send(data) {
    this.sent.push(JSON.parse(data));
  }

  close() {
    this.closed = true;
  }
}

function emitHandshake(socket) {
  socket.emit('open');
  socket.emit('message', { data: JSON.stringify({
    type: 'event',
    event: 'connect.challenge',
    payload: { nonce: 'challenge', ts: 1_700_000_000_000 },
  }) });
  const connectFrame = socket.sent[0];
  socket.emit('message', { data: JSON.stringify({
    type: 'res',
    id: connectFrame.id,
    ok: true,
    payload: { type: 'hello-ok' },
  }) });
  return connectFrame;
}

test('OpenClawGatewayClient completes the v4 handshake and keeps RPCs request-scoped', async () => {
  const socket = new FakeSocket();
  const client = new OpenClawGatewayClient({
    url: 'ws://127.0.0.1:18789',
    token: 'gateway-token',
    clientVersion: 'test',
    websocketFactory: () => socket,
  });
  const connected = client.connect();
  const connectFrame = emitHandshake(socket);
  await connected;
  assert.equal(connectFrame.method, 'connect');
  assert.equal(connectFrame.params.minProtocol, 4);
  assert.equal(connectFrame.params.client.id, 'gateway-client');
  assert.equal(connectFrame.params.auth.token, 'gateway-token');

  const health = client.call('health', { probe: true });
  await Promise.resolve();
  const requestFrame = socket.sent[1];
  assert.equal(requestFrame.method, 'health');
  socket.emit('message', { data: JSON.stringify({ type: 'res', id: requestFrame.id, ok: true, payload: { ok: true } }) });
  assert.deepEqual(await health, { ok: true });

  client.close();
  assert.equal(socket.closed, true);
});

test('OpenClawGatewayClient runs tasks without delivery enabled', async () => {
  const socket = new FakeSocket();
  const client = new OpenClawGatewayClient({
    url: 'ws://localhost:18789',
    token: 'gateway-token',
    clientVersion: 'test',
    websocketFactory: () => socket,
  });
  const task = {
    id: taskId,
    owner_id: ownerId,
    run_id: runId,
    task_key: 'researcher',
    agent_role: 'public_web_researcher',
    agent_provider: 'openrouter',
    model_id: 'openrouter/test',
    capabilities: [],
    task_type: 'research_public_web',
    status: 'leased',
    input: { question: 'Find public evidence.' },
    attempt_count: 1,
    max_attempts: 3,
    leased_by: 'test-worker',
    lease_expires_at: null,
    progress: 0,
  };
  const result = client.runTask(task);
  const connectFrame = emitHandshake(socket);
  await Promise.resolve();
  await Promise.resolve();
  const taskFrame = socket.sent[1];
  assert.equal(connectFrame.method, 'connect');
  assert.equal(taskFrame.method, 'agent');
  assert.equal(taskFrame.params.deliver, false);
  assert.equal(taskFrame.params.bestEffortDeliver, false);
  assert.match(taskFrame.params.message, /Do not send email/);
  socket.emit('message', { data: JSON.stringify({ type: 'res', id: taskFrame.id, ok: true, payload: { text: 'evidence' } }) });
  assert.deepEqual(await result, { text: 'evidence' });
  client.close();
});

function task(overrides = {}) {
  return {
    id: taskId,
    owner_id: ownerId,
    run_id: runId,
    task_key: 'researcher',
    agent_role: 'public_web_researcher',
    agent_provider: 'openrouter',
    model_id: 'openrouter/test',
    capabilities: [],
    task_type: 'research_public_web',
    status: 'leased',
    input: { question: 'Find public evidence.' },
    attempt_count: 1,
    max_attempts: 3,
    leased_by: 'test-worker',
    lease_expires_at: null,
    progress: 0,
    ...overrides,
  };
}

test('AgentBridgeRunner reports progress, persists text evidence, and rejects unsupported task types', async () => {
  const calls = { heartbeat: [], events: [], completions: [] };
  const api = {
    heartbeat: async (value) => calls.heartbeat.push(value),
    schedule: async () => ({ tasks: [], queued: 1 }),
    claim: async () => task(),
    event: async (...value) => calls.events.push(value),
    complete: async (value) => calls.completions.push(value),
  };
  const gateway = { runTask: async () => ({ text: 'Public evidence with a source.' }), close() {} };
  const runner = new AgentBridgeRunner({ api, gateway, artifactRoot: await mkdtemp(join(tmpdir(), 'needthisdone-bridge-')), capabilities: ['research_public_web'] });
  const result = await runner.runOnce();
  assert.equal(result.status, 'succeeded');
  assert.equal(calls.completions[0].status, 'succeeded');
  assert.equal(calls.completions[0].artifacts[0].artifactType, 'research_dossier');
  assert.match(calls.completions[0].artifacts[0].contentText, /Public evidence/);
  assert.equal(calls.events.length, 2);

  const unsupportedApi = { ...api, claim: async () => task({ task_type: 'send_email' }) };
  const unsupportedRunner = new AgentBridgeRunner({ api: unsupportedApi, gateway, artifactRoot: await mkdtemp(join(tmpdir(), 'needthisdone-bridge-')), capabilities: [] });
  const unsupportedResult = await unsupportedRunner.runOnce();
  assert.equal(unsupportedResult.status, 'failed');
  assert.match(calls.completions.at(-1).error, /not allowed/);
});

test('AgentBridgeRunner reserves and reconciles model usage for an approved OpenClaw task', async () => {
  const calls = { reservations: [], completions: [] };
  const api = {
    heartbeat: async () => {},
    schedule: async () => ({ tasks: [], queued: 1 }),
    claim: async () => task({
      plan_id: '00000000-0000-4000-8000-000000000004',
      growth_profile_id: '00000000-0000-4000-8000-000000000005',
      agent_provider: 'openclaw',
      model_id: 'provider/pinned-model',
      input: { question: 'Find bounded public evidence.', modelReservationUsd: 0.02 },
    }),
    event: async () => {},
    reserveModelUsage: async (value) => calls.reservations.push(value),
    complete: async (value) => calls.completions.push(value),
  };
  const gateway = { runTask: async () => ({ text: 'Evidence returned by the fake Gateway.', actualCost: 0.01, usage: { cost: 0.01 } }), close() {} };
  const runner = new AgentBridgeRunner({ api, gateway, artifactRoot: await mkdtemp(join(tmpdir(), 'needthisdone-bridge-plan-')), capabilities: ['research_public_web'] });
  const result = await runner.runOnce();
  assert.equal(result.status, 'succeeded');
  assert.equal(calls.reservations.length, 1);
  assert.equal(calls.reservations[0].reservedCost, 0.02);
  assert.equal(calls.completions[0].modelActualCost, 0.01);
  assert.equal(calls.completions[0].status, 'succeeded');
});

test('AgentBridgeRunner refuses symlinked artifact files outside its root', async () => {
  const root = await mkdtemp(join(tmpdir(), 'needthisdone-bridge-root-'));
  const outside = await mkdtemp(join(tmpdir(), 'needthisdone-bridge-outside-'));
  await writeFile(join(outside, 'secret.txt'), 'private');
  await symlink(join(outside, 'secret.txt'), join(root, 'artifact.txt'));
  const calls = { completions: [] };
  const api = {
    heartbeat: async () => {},
    schedule: async () => ({ tasks: [], queued: 1 }),
    claim: async () => task({ input: {}, task_type: 'research_public_web' }),
    event: async () => {},
    complete: async (value) => calls.completions.push(value),
    uploadUrl: async () => { throw new Error('not expected'); },
  };
  const gateway = { runTask: async () => ({ artifacts: [{ artifactType: 'other', title: 'secret', localPath: join(root, 'artifact.txt'), mimeType: 'text/plain' }] }), close() {} };
  const runner = new AgentBridgeRunner({ api, gateway, artifactRoot: root, capabilities: [] });
  const result = await runner.runOnce();
  assert.equal(result.status, 'failed');
  assert.match(calls.completions[0].error, /inside BRIDGE_ARTIFACT_ROOT/);
});
