import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';
import { chmod, mkdtemp, readFile, symlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { test } from 'node:test';
import { BridgeApiClient, BridgeApiError } from '../dist/bridge-client.js';
import { OpenClawGatewayClient } from '../dist/openclaw-gateway.js';
import { AgentBridgeRunner } from '../dist/runner.js';
import { validateBridgeRehearsalConfiguration } from '../dist/validate-config.js';

const ownerId = '00000000-0000-4000-8000-000000000001';
const taskId = '00000000-0000-4000-8000-000000000002';
const runId = '00000000-0000-4000-8000-000000000003';
const execFileAsync = promisify(execFile);

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

  await client.complete({ taskId, status: 'failed', providerInvoked: false, error: 'pre-provider validation failure' });
  assert.equal(JSON.parse(request.init.body).providerInvoked, false);

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

test('rehearsal configuration validation is local-only and refuses a non-HTTPS bridge URL', () => {
  const environment = {
    BRIDGE_API_URL: 'https://control.example.test',
    OPENCLAW_BRIDGE_SECRET: 'bridge-secret',
    BRIDGE_OWNER_ID: ownerId,
    BRIDGE_WORKER_ID: 'macbook-pro-hermes-rehearsal',
    OPENCLAW_EXECUTOR_MODEL_ID: 'openai/gpt-5.6-luna',
    OPENCLAW_GATEWAY_TOKEN: 'a'.repeat(32),
    OPENCLAW_GATEWAY_URL: 'ws://127.0.0.1:18789',
    BRIDGE_ARTIFACT_ROOT: '/private/needthisdone/artifacts',
  };
  assert.deepEqual(validateBridgeRehearsalConfiguration(environment), {
    bridgeApiOrigin: 'https://control.example.test',
    gateway: 'ws://127.0.0.1:18789',
    artifactRoot: '/private/needthisdone/artifacts',
  });
  assert.throws(
    () => validateBridgeRehearsalConfiguration({ ...environment, BRIDGE_API_URL: 'http://control.example.test' }),
    /HTTPS/,
  );
});

test('approved private-Mac rehearsal runbook remains configuration-only', async () => {
  const runbook = await readFile(new URL('../rehearsal/RUNBOOK.txt', import.meta.url), 'utf8');
  assert.match(runbook, /Hermes frozen plan -> signed outbound bridge -> loopback OpenClaw Gateway/);
  assert.match(runbook, /validate-runtime-config\.sh/);
  assert.match(runbook, /Do not use\s+`npm start`/);
  assert.match(runbook, /unapproved, altered, stopped, expired, and paid-route tasks/);
});

test('launchd renderer is review-only, validates private files, and leaves no placeholders', async () => {
  const runtime = await mkdtemp(join(tmpdir(), 'needthisdone-launchd-runtime-'));
  const output = await mkdtemp(join(tmpdir(), 'needthisdone-launchd-output-'));
  await chmod(runtime, 0o700);
  await writeFile(join(runtime, 'bridge.env'), 'BRIDGE_SECRET=test\n', { mode: 0o600 });
  await writeFile(join(runtime, 'openclaw.json'), '{}\n', { mode: 0o600 });
  await chmod(join(runtime, 'bridge.env'), 0o600);
  await chmod(join(runtime, 'openclaw.json'), 0o600);

  await execFileAsync('bash', ['launchd/install-templates.sh', runtime, output], { cwd: join(process.cwd(), '..', 'bridge') });
  const gateway = await readFile(join(output, 'com.needthisdone.openclaw-gateway.plist'), 'utf8');
  assert.match(gateway, /127\.0\.0\.1/);
  assert.doesNotMatch(gateway, /__[A-Z_]+__/);
  assert.doesNotMatch(await readFile('launchd/install-templates.sh', 'utf8'), /^\s*launchctl\s/m);

  await chmod(join(runtime, 'openclaw.json'), 0o644);
  await assert.rejects(
    execFileAsync('bash', ['launchd/install-templates.sh', runtime, output], { cwd: join(process.cwd(), '..', 'bridge') }),
    (error) => /must be mode 600/.test(error.stderr),
  );
  await assert.rejects(
    execFileAsync('bash', ['launchd/install-templates.sh', `${runtime}<unsafe`, output], { cwd: join(process.cwd(), '..', 'bridge') }),
    (error) => /unsafe XML characters/.test(error.stderr),
  );
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
  const claimed = {
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
  if (!claimed.plan_id) return claimed;

  const snapshot = overrides.approved_plan_snapshot ?? {
    planId: claimed.plan_id,
    plannerModelId: 'provider/free-planner',
    executorModelId: claimed.model_id,
    modelRoute: 'selected-free',
    openclawInstruction: {
      planner: 'hermes',
      executor: 'openclaw',
      approvalRequired: true,
      delivery: {
        deliver: false,
        bestEffortDeliver: false,
        externalMessages: false,
        publishing: false,
        spending: false,
        accountChanges: false,
      },
    },
  };
  return {
    ...claimed,
    approved_plan_snapshot: snapshot,
    lease_expires_at: claimed.lease_expires_at || new Date(Date.now() + 60_000).toISOString(),
    input: { planId: claimed.plan_id, approvedPlan: snapshot, ...claimed.input },
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
      model_id: 'openai/gpt-5.6-luna',
      input: { question: 'Find bounded public evidence.', modelReservationUsd: 0.02 },
    }),
    event: async () => {},
    reserveModelUsage: async (value) => calls.reservations.push(value),
    complete: async (value) => calls.completions.push(value),
  };
  const gateway = { runTask: async () => ({ text: 'Evidence returned by the fake Gateway.', actualCost: 0.01, model: 'openai/gpt-5.6-luna', usage: { cost: 0.01 } }), close() {} };
  const runner = new AgentBridgeRunner({ api, gateway, artifactRoot: await mkdtemp(join(tmpdir(), 'needthisdone-bridge-plan-')), capabilities: ['research_public_web'] });
  const result = await runner.runOnce();
  assert.equal(result.status, 'succeeded');
  assert.equal(calls.reservations.length, 1);
  assert.equal(calls.reservations[0].reservedCost, 0.02);
  assert.equal(calls.completions[0].modelActualCost, 0.01);
  assert.equal(calls.completions[0].actualModelId, 'openai/gpt-5.6-luna');
  assert.equal(calls.completions[0].status, 'succeeded');
});

test('AgentBridgeRunner accepts only the frozen Hermes snapshot before Gateway invocation', async () => {
  const calls = { reservations: [], completions: [] };
  let gatewayCalls = 0;
  const approvedTask = task({
    plan_id: '00000000-0000-4000-8000-000000000004',
    agent_provider: 'openclaw',
    model_id: 'openai/gpt-5.6-luna',
    input: { modelReservationUsd: 0 },
  });
  const api = {
    heartbeat: async () => {}, schedule: async () => ({ tasks: [], queued: 1 }), claim: async () => approvedTask,
    event: async () => {}, reserveModelUsage: async (value) => calls.reservations.push(value), complete: async (value) => calls.completions.push(value),
  };
  const runner = new AgentBridgeRunner({
    api,
    gateway: {
      runTask: async () => {
        gatewayCalls += 1;
        return { text: 'Frozen-plan evidence.', actualCost: 0, model: 'openai/gpt-5.6-luna', usage: { cost: 0 } };
      },
      close() {},
    },
    artifactRoot: await mkdtemp(join(tmpdir(), 'needthisdone-bridge-hermes-')),
    capabilities: ['research_public_web'],
  });

  const result = await runner.runOnce();

  assert.equal(result.status, 'succeeded');
  assert.equal(gatewayCalls, 1);
  assert.equal(calls.reservations.length, 1);
  assert.equal(calls.completions[0].actualModelId, 'openai/gpt-5.6-luna');
});

test('AgentBridgeRunner blocks changed, expired, and paid Hermes tasks before Gateway invocation', async () => {
  const scenarios = [
    {
      name: 'changed snapshot',
      task: () => task({
        plan_id: '00000000-0000-4000-8000-000000000004', agent_provider: 'openclaw', model_id: 'openai/gpt-5.6-luna',
        input: { planId: '00000000-0000-4000-8000-000000000004', approvedPlan: { planId: 'changed' }, modelReservationUsd: 0 },
      }),
      error: /snapshot does not match/,
    },
    {
      name: 'expired lease',
      task: () => task({
        plan_id: '00000000-0000-4000-8000-000000000004', agent_provider: 'openclaw', model_id: 'openai/gpt-5.6-luna',
        lease_expires_at: new Date(Date.now() - 1_000).toISOString(), input: { modelReservationUsd: 0 },
      }),
      error: /lease expired/,
    },
    {
      name: 'paid route',
      task: () => task({
        plan_id: '00000000-0000-4000-8000-000000000004', agent_provider: 'openclaw', model_id: 'openai/gpt-5.6-luna',
        approved_plan_snapshot: {
          planId: '00000000-0000-4000-8000-000000000004', plannerModelId: 'provider/paid-model', executorModelId: 'openai/gpt-5.6-luna', modelRoute: 'selected-primary',
          openclawInstruction: { planner: 'hermes', executor: 'openclaw', approvalRequired: true, delivery: { deliver: false, bestEffortDeliver: false, externalMessages: false, publishing: false, spending: false, accountChanges: false } },
        },
        input: { modelReservationUsd: 0 },
      }),
      error: /Paid Hermes model routes/,
    },
  ];

  for (const scenario of scenarios) {
    const completions = [];
    let gatewayCalls = 0;
    const api = {
      heartbeat: async () => {}, schedule: async () => ({ tasks: [], queued: 1 }), claim: async () => scenario.task(),
      event: async () => {}, complete: async (value) => completions.push(value),
    };
    const runner = new AgentBridgeRunner({
      api,
      gateway: { runTask: async () => { gatewayCalls += 1; return { text: 'must not run' }; }, close() {} },
      artifactRoot: await mkdtemp(join(tmpdir(), `needthisdone-bridge-hermes-${scenario.name.replace(' ', '-')}-`)),
      capabilities: ['research_public_web'],
    });

    const result = await runner.runOnce();

    assert.equal(result.status, 'failed', scenario.name);
    assert.equal(gatewayCalls, 0, scenario.name);
    assert.equal(completions[0].providerInvoked, false, scenario.name);
    assert.match(completions[0].error, scenario.error, scenario.name);
  }
});

test('AgentBridgeRunner does not invoke Gateway when the signed bridge cannot claim unapproved or stopped work', async () => {
  for (const state of ['unapproved', 'stopped']) {
    let gatewayCalls = 0;
    const api = {
      heartbeat: async () => {}, schedule: async () => ({ tasks: [], queued: 0 }), claim: async () => null,
    };
    const runner = new AgentBridgeRunner({
      api,
      gateway: { runTask: async () => { gatewayCalls += 1; return {}; }, close() {} },
      artifactRoot: await mkdtemp(join(tmpdir(), `needthisdone-bridge-${state}-`)),
      capabilities: [],
    });
    const result = await runner.runOnce();
    assert.equal(result.status, 'idle', state);
    assert.equal(gatewayCalls, 0, state);
  }
});

test('AgentBridgeRunner fails closed when an approved task omits or changes Gateway model provenance', async () => {
  for (const gatewayResult of [
    { text: 'Missing model.', actualCost: 0.01, usage: { cost: 0.01 } },
    { text: 'Wrong model.', actualCost: 0.01, model: 'provider/other', usage: { cost: 0.01 } },
  ]) {
    const completions = [];
    const api = {
      heartbeat: async () => {}, schedule: async () => ({ tasks: [], queued: 1 }),
      claim: async () => task({ plan_id: '00000000-0000-4000-8000-000000000004', agent_provider: 'openclaw', model_id: 'openai/gpt-5.6-luna', input: { modelReservationUsd: 0.02 } }),
      event: async () => {}, reserveModelUsage: async () => {}, complete: async (value) => completions.push(value),
    };
    const runner = new AgentBridgeRunner({ api, gateway: { runTask: async () => gatewayResult, close() {} }, artifactRoot: await mkdtemp(join(tmpdir(), 'needthisdone-bridge-provenance-')), capabilities: [] });
    const result = await runner.runOnce();
    assert.equal(result.status, 'failed');
    assert.match(completions[0].error, /exact approved model ID/);
    assert.equal(completions[0].providerInvoked, true);
  }
});

test('AgentBridgeRunner declares a pre-provider planned failure without invoking the Gateway', async () => {
  const completions = [];
  let gatewayCalls = 0;
  const api = {
    heartbeat: async () => {},
    schedule: async () => ({ tasks: [], queued: 1 }),
    claim: async () => task({
      plan_id: '00000000-0000-4000-8000-000000000004',
      agent_provider: 'openclaw',
      task_type: 'send_email',
    }),
    event: async () => {},
    complete: async (value) => completions.push(value),
  };
  const runner = new AgentBridgeRunner({
    api,
    gateway: {
      runTask: async () => {
        gatewayCalls += 1;
        return { text: 'should not run' };
      },
      close() {},
    },
    artifactRoot: await mkdtemp(join(tmpdir(), 'needthisdone-bridge-pre-provider-')),
    capabilities: [],
  });

  const result = await runner.runOnce();

  assert.equal(result.status, 'failed');
  assert.equal(completions[0].providerInvoked, false);
  assert.equal(gatewayCalls, 0);
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
