import { createHmac, randomUUID } from 'node:crypto';
import { writeFile } from 'node:fs/promises';
import { expect, test, type APIRequestContext, type APIResponse } from '@playwright/test';

// Keep the external client independent from server-only application modules.
const MCP_PROTOCOL_VERSION = '2025-06-18';

const expectedTools = ['start_workflow', 'get_workflow_status', 'list_workflows'];
const accountTokenPattern = /^ntd_mcp_[A-Za-z0-9_-]{43}$/;
const localOnlyHosts = new Set(['127.0.0.1', 'localhost']);
const controlPlaneRequiredStages = new Set([
  'environment.target',
  'application.health',
  'vector-memory.configuration',
  'mcp.authentication',
  'mcp.credentials',
  'mcp.initialize',
  'mcp.tool-discovery',
  'hermes.start-workflow',
  'hermes.list-workflows',
  'hermes.workflow-status',
]);

type StageState = 'passed' | 'failed' | 'blocked';
type StageRecord = {
  name: string;
  state: StageState;
  detail: string;
  status?: number;
  evidence?: Record<string, unknown>;
};

type ProbeResult<T> = {
  state: StageState;
  detail: string;
  value?: T;
  status?: number;
  evidence?: Record<string, unknown>;
};

function asRecord(value: unknown): Record<string, unknown> | null {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
    ? value as Record<string, unknown>
    : null;
}

function isUuid(value: unknown): value is string {
  return typeof value === 'string'
    && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

async function readBody(response: APIResponse): Promise<unknown> {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return { raw: text.slice(0, 400) };
  }
}

function responseError(body: unknown) {
  const record = asRecord(body);
  const error = asRecord(record?.error);
  if (typeof error?.message === 'string') return error.message;
  if (typeof record?.error === 'string') return record.error;
  const result = asRecord(record?.result);
  if (result?.isError === true) {
    const content = Array.isArray(result.content) ? result.content : [];
    const text = content
      .map((item) => asRecord(item)?.text)
      .find((item): item is string => typeof item === 'string');
    if (text) return text;
    return 'The MCP tool returned isError=true.';
  }
  return 'The response did not contain a usable error message.';
}

function headers(token?: string, includeProtocol = true) {
  const result: Record<string, string> = {
    accept: 'application/json, text/event-stream',
    'content-type': 'application/json',
  };
  if (token) result.authorization = `Bearer ${token}`;
  if (includeProtocol) result['mcp-protocol-version'] = MCP_PROTOCOL_VERSION;
  return result;
}

async function mcpPost(
  request: APIRequestContext,
  token: string | undefined,
  id: number,
  method: string,
  params?: Record<string, unknown>,
  includeProtocol = true,
) {
  const response = await request.post('/api/mcp', {
    headers: headers(token, includeProtocol),
    data: { jsonrpc: '2.0', id, method, ...(params ? { params } : {}) },
  });
  return { response, body: await readBody(response) };
}

function bridgeHeaders(body: string, secret: string, purpose: string) {
  const timestamp = Math.floor(Date.now() / 1_000).toString();
  const nonce = randomUUID();
  const signature = createHmac('sha256', secret)
    .update(`${purpose}.${timestamp}.${nonce}.${body}`)
    .digest('hex');
  return {
    'content-type': 'application/json',
    'x-bridge-timestamp': timestamp,
    'x-bridge-nonce': nonce,
    'x-bridge-signature': signature,
  };
}

async function runStage<T>(
  stages: StageRecord[],
  name: string,
  probe: () => Promise<ProbeResult<T>>,
): Promise<T | undefined> {
  return test.step(name, async () => {
    let result: ProbeResult<T>;
    try {
      result = await probe();
    } catch (error) {
      result = {
        state: 'failed',
        detail: error instanceof Error ? error.message : 'The stage threw an unknown error.',
      };
    }
    stages.push({ name, ...result });
    return result.value;
  });
}

test.beforeEach(() => {
  test.skip(
    process.env.HERMES_MCP_E2E !== 'true',
    'Run with HERMES_MCP_E2E=true; this diagnostic is intentionally separate from the retained public browser gate.',
  );
});

test('diagnoses the ChatGPT → MCP → Hermes → worker vertical slice', async ({ request }, testInfo) => {
  test.setTimeout(Number(process.env.HERMES_MCP_E2E_TIMEOUT_MS || 180_000));

  const stages: StageRecord[] = [];
  // The raw account token may be supplied to a disposable local diagnostic
  // outside Git. MCP_BEARER_TOKEN remains the temporary static bootstrap and
  // must be paired with MCP_BEARER_TOKEN_OWNER_ID.
  const token = process.env.MCP_E2E_MCP_TOKEN?.trim() || process.env.MCP_BEARER_TOKEN?.trim();
  const bootstrapOwnerId = process.env.MCP_BEARER_TOKEN_OWNER_ID?.trim();
  const requireExecution = process.env.HERMES_MCP_E2E_REQUIRE_EXECUTION === 'true';
  const allowDraft = process.env.HERMES_MCP_E2E_ALLOW_DRAFT === 'true';
  const target = process.env.HERMES_MCP_E2E_TARGET?.trim() || 'local';
  const explicitBaseUrl = process.env.BASE_URL?.trim();
  const baseUrl = process.env.BASE_URL || `http://127.0.0.1:${process.env.PLAYWRIGHT_PORT || '3100'}`;
  const baseHost = new URL(baseUrl).hostname;
  const allowRemoteWrite = process.env.HERMES_MCP_E2E_ALLOW_REMOTE_WRITE === 'true';
  const hostedReadOnly = target === 'hosted' && !allowRemoteWrite && process.env.HERMES_MCP_E2E_HOSTED_READONLY !== 'false';
  const workflowFixture = process.env.MCP_E2E_WORKFLOW_ID?.trim();
  let workflowId = isUuid(workflowFixture) ? workflowFixture : undefined;
  let nextRequestId = 1;
  let healthServices: Record<string, unknown> = {};
  const requiredStages = new Set(controlPlaneRequiredStages);
  if (hostedReadOnly) {
    requiredStages.delete('hermes.start-workflow');
    if (!workflowId) requiredStages.delete('hermes.workflow-status');
  }

  await runStage(stages, 'environment.target', async () => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
    let parsedSupabaseUrl: URL | undefined;
    try {
      if (supabaseUrl) parsedSupabaseUrl = new URL(supabaseUrl);
    } catch {
      parsedSupabaseUrl = undefined;
    }

    if (target === 'local') {
      const localSupabase = Boolean(
        parsedSupabaseUrl
        && localOnlyHosts.has(parsedSupabaseUrl.hostname)
        && parsedSupabaseUrl.port === '54321'
        && process.env.ENV_TARGET === 'local',
      );
      const valid = localOnlyHosts.has(baseHost) && localSupabase;
      return {
        state: valid ? 'passed' : 'failed',
        detail: valid
          ? 'Local profile selected: the app and Supabase target are local; the next stage will prove the live local services.'
          : 'Local profile requires a localhost BASE_URL, ENV_TARGET=local, and NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321. Run the real local Supabase gate before this diagnostic; dummy credentials are not a pass.',
        evidence: {
          target,
          baseHost,
          envTarget: process.env.ENV_TARGET || null,
          supabaseHost: parsedSupabaseUrl?.hostname || null,
          supabasePort: parsedSupabaseUrl?.port || null,
          baseUrlExplicit: Boolean(explicitBaseUrl),
        },
      };
    }

    if (target === 'hosted') {
      const valid = Boolean(explicitBaseUrl)
        && !localOnlyHosts.has(baseHost)
        && (hostedReadOnly || allowRemoteWrite);
      return {
        state: valid ? 'passed' : 'failed',
        detail: valid
          ? hostedReadOnly
            ? 'Hosted profile selected in read-only mode; health will prove the deployed app can reach its server-side Supabase and Redis.'
            : 'Hosted profile selected with explicit remote-write permission.'
          : 'Hosted profile requires an explicit non-local BASE_URL. Keep HERMES_MCP_E2E_HOSTED_READONLY=true for the safe preflight; remote workflow writes additionally require HERMES_MCP_E2E_ALLOW_REMOTE_WRITE=true.',
        evidence: {
          target,
          baseHost,
          hostedReadOnly,
          remoteWriteAllowed: allowRemoteWrite,
          baseUrlExplicit: Boolean(explicitBaseUrl),
        },
      };
    }

    return {
      state: 'failed',
      detail: `Unknown HERMES_MCP_E2E_TARGET=${target}; use local or hosted.`,
      evidence: { target },
    };
  });

  await runStage(stages, 'application.health', async () => {
    const response = await request.get('/api/health');
    const body = await readBody(response);
    const record = asRecord(body);
    const services = asRecord(record?.services) || {};
    healthServices = services;
    const required = ['app', 'supabase', 'redis'];
    const unavailable = required.filter((name) => services[name] !== 'up');
    const healthy = response.status() === 200 && record?.status === 'healthy' && unavailable.length === 0;
    return {
      state: healthy ? 'passed' : 'failed',
      detail: healthy
        ? 'The application, Supabase, and Redis health checks are up.'
        : `Health returned HTTP ${response.status()} with ${unavailable.length ? `unavailable services: ${unavailable.join(', ')}` : 'an unhealthy status'}.`,
      status: response.status(),
      evidence: { status: record?.status || null, services },
    };
  });

  await runStage(stages, 'vector-memory.configuration', async () => {
    const state = healthServices.vectorMemory;
    const configured = state === 'configured';
    return {
      state: configured ? 'passed' : 'failed',
      detail: configured
        ? 'The private vector-memory adapter reports configured server-side credentials.'
        : `Vector memory reports ${typeof state === 'string' ? state : 'an unknown state'}; configure both Upstash Vector values before the live semantic-memory proof.`,
      status: stages.find((stage) => stage.name === 'application.health')?.status,
      evidence: { vectorMemory: state || null },
    };
  });

  await runStage(stages, 'mcp.authentication', async () => {
    const { response, body } = await mcpPost(request, undefined, nextRequestId++, 'ping', undefined, false);
    const valid = response.status() === 401;
    return {
      state: valid ? 'passed' : 'failed',
      detail: valid
        ? 'Unauthenticated MCP requests are rejected with HTTP 401.'
        : `Unauthenticated MCP request returned HTTP ${response.status()} (${responseError(body)}); the endpoint must be configured and fail closed.`,
      status: response.status(),
    };
  });

  await runStage(stages, 'mcp.credentials', async () => {
    const accountCredential = Boolean(token && accountTokenPattern.test(token));
    const bootstrapCredential = Boolean(token && token.length >= 32 && isUuid(bootstrapOwnerId));
    const configured = accountCredential || bootstrapCredential;
    return {
      state: configured ? 'passed' : 'failed',
      detail: configured
        ? accountCredential
          ? 'The test process has an account-scoped MCP credential without recording its value.'
          : 'The test process has an owner-bound bootstrap credential without recording its value.'
        : 'An account-scoped MCP credential or owner-bound MCP_BEARER_TOKEN is missing; no credential was printed.',
    };
  });

  let initialized = false;
  if (token && token.length >= 32) {
    await runStage(stages, 'mcp.initialize', async () => {
      const { response, body } = await mcpPost(request, token, nextRequestId++, 'initialize', {
        protocolVersion: MCP_PROTOCOL_VERSION,
        capabilities: {},
        clientInfo: { name: 'needthisdone-e2e', version: '1' },
      }, false);
      const result = asRecord(asRecord(body)?.result);
      initialized = response.status() === 200 && result?.protocolVersion === MCP_PROTOCOL_VERSION;
      return {
        state: initialized ? 'passed' : 'failed',
        detail: initialized
          ? `MCP negotiated protocol ${MCP_PROTOCOL_VERSION}.`
          : `Initialization returned HTTP ${response.status()} (${responseError(body)}).`,
        status: response.status(),
        evidence: { protocolVersion: result?.protocolVersion || null },
      };
    });
  } else {
    stages.push({ name: 'mcp.initialize', state: 'blocked', detail: 'Blocked because MCP credentials are not configured.' });
  }

  let toolsDiscovered = false;
  if (initialized) {
    await runStage(stages, 'mcp.tool-discovery', async () => {
      const { response, body } = await mcpPost(request, token, nextRequestId++, 'tools/list');
      const result = asRecord(asRecord(body)?.result);
      const tools = Array.isArray(result?.tools) ? result.tools : [];
      const names = tools.map((tool) => asRecord(tool)?.name).filter((name): name is string => typeof name === 'string');
      toolsDiscovered = response.status() === 200 && names.length === expectedTools.length && names.every((name, index) => name === expectedTools[index]);
      return {
        state: toolsDiscovered ? 'passed' : 'failed',
        detail: toolsDiscovered
          ? `The MCP server exposes exactly ${expectedTools.join(', ')}.`
          : `Tool discovery returned HTTP ${response.status()} with [${names.join(', ')}], expected [${expectedTools.join(', ')}].`,
        status: response.status(),
        evidence: { names },
      };
    });
  } else {
    stages.push({ name: 'mcp.tool-discovery', state: 'blocked', detail: 'Blocked because MCP initialization did not succeed.' });
  }

  const canStart = allowDraft && ((target === 'local' && localOnlyHosts.has(baseHost)) || allowRemoteWrite);
  if (hostedReadOnly) {
    stages.push({
      name: 'hermes.start-workflow',
      state: 'blocked',
      detail: 'Hosted read-only mode intentionally skips start_workflow so the preflight cannot create or mutate a hosted workflow. Use a separately approved remote-write rehearsal for this stage.',
    });
  } else if (workflowId && !canStart) {
    stages.push({ name: 'hermes.start-workflow', state: 'passed', detail: 'Using the supplied MCP_E2E_WORKFLOW_ID fixture; no new workflow was created.' });
  } else if (!toolsDiscovered) {
    stages.push({ name: 'hermes.start-workflow', state: 'blocked', detail: 'Blocked because MCP tool discovery did not succeed.' });
  } else if (!canStart) {
    stages.push({
      name: 'hermes.start-workflow',
      state: 'blocked',
      detail: 'Set HERMES_MCP_E2E_ALLOW_DRAFT=true on the local target to create the approval-gated draft; hosted writes require HERMES_MCP_E2E_ALLOW_REMOTE_WRITE=true and a separately approved rehearsal.',
    });
  } else {
    await runStage(stages, 'hermes.start-workflow', async () => {
      const idempotencyKey = process.env.MCP_E2E_IDEMPOTENCY_KEY?.trim() || randomUUID();
      if (!isUuid(idempotencyKey)) {
        return { state: 'failed', detail: 'MCP_E2E_IDEMPOTENCY_KEY must be a UUID.' };
      }
      const { response, body } = await mcpPost(request, token, nextRequestId++, 'tools/call', {
        name: 'start_workflow',
        arguments: {
          request: 'E2E diagnostic: prepare a private read-only workflow proof; do not send, publish, spend, or change connected accounts.',
          idempotencyKey,
        },
      });
      const result = asRecord(asRecord(body)?.result);
      const structured = asRecord(result?.structuredContent);
      const returnedWorkflowId = structured?.workflowId;
      const valid = response.status() === 200
        && result?.isError === false
        && isUuid(returnedWorkflowId)
        && structured?.status === 'draft'
        && structured?.approvalRequired === true
        && structured?.nextAction === 'review';
      if (valid) workflowId = returnedWorkflowId;
      return {
        state: valid ? 'passed' : 'failed',
        detail: valid
          ? `Hermes created approval-gated workflow ${returnedWorkflowId}.`
          : `start_workflow returned HTTP ${response.status()} (${responseError(body)}); the MCP dispatcher or Hermes persistence path is not complete.`,
        status: response.status(),
        evidence: {
          isError: result?.isError ?? null,
          workflowId: isUuid(returnedWorkflowId) ? returnedWorkflowId : null,
          status: structured?.status || null,
        },
      };
    });
  }

  if (token && initialized && toolsDiscovered) {
    await runStage(stages, 'hermes.list-workflows', async () => {
      const { response, body } = await mcpPost(request, token, nextRequestId++, 'tools/call', {
        name: 'list_workflows',
        arguments: { limit: 10 },
      });
      const result = asRecord(asRecord(body)?.result);
      const structured = asRecord(result?.structuredContent);
      const workflows = Array.isArray(structured?.workflows) ? structured.workflows : null;
      const containsWorkflow = workflowId
        ? workflows?.some((workflow) => asRecord(workflow)?.workflowId === workflowId)
        : true;
      const valid = response.status() === 200 && result?.isError === false && Boolean(workflows) && containsWorkflow;
      return {
        state: valid ? 'passed' : 'failed',
        detail: valid
          ? `Hermes listed ${workflows?.length || 0} reviewable workflow(s).`
          : `list_workflows returned HTTP ${response.status()} (${responseError(body)}); durable workflow listing is not complete.`,
        status: response.status(),
        evidence: { count: workflows?.length || 0, containsWorkflow: Boolean(containsWorkflow) },
      };
    });
  } else {
    stages.push({ name: 'hermes.list-workflows', state: 'blocked', detail: 'Blocked because MCP initialization or tool discovery did not succeed.' });
  }

  if (token && initialized && toolsDiscovered && workflowId) {
    await runStage(stages, 'hermes.workflow-status', async () => {
      const { response, body } = await mcpPost(request, token, nextRequestId++, 'tools/call', {
        name: 'get_workflow_status',
        arguments: { workflowId },
      });
      const result = asRecord(asRecord(body)?.result);
      const structured = asRecord(result?.structuredContent);
      const valid = response.status() === 200
        && result?.isError === false
        && structured?.workflowId === workflowId
        && typeof structured?.status === 'string'
        && typeof structured?.approvalRequired === 'boolean';
      return {
        state: valid ? 'passed' : 'failed',
        detail: valid
          ? `Hermes returned workflow ${workflowId} in status ${structured?.status}.`
          : `get_workflow_status returned HTTP ${response.status()} (${responseError(body)}); durable status is not readable through MCP.`,
        status: response.status(),
        evidence: {
          workflowId: structured?.workflowId || null,
          status: structured?.status || null,
          approvalRequired: structured?.approvalRequired ?? null,
        },
      };
    });
  } else {
    stages.push({ name: 'hermes.workflow-status', state: 'blocked', detail: 'Blocked because no workflow ID was created or supplied.' });
  }

  if (requireExecution) {
    const workerSecret = process.env.OPENCLAW_BRIDGE_SECRET;
    const ownerId = process.env.MCP_E2E_OWNER_ID?.trim();
    const workerId = process.env.MCP_E2E_WORKER_ID?.trim();
    const workerReady = Boolean(workerSecret && ownerId && isUuid(ownerId) && workerId);
    if (!workerReady) {
      stages.push({
        name: 'worker.status',
        state: 'failed',
        detail: 'Full execution mode requires OPENCLAW_BRIDGE_SECRET, MCP_E2E_OWNER_ID (UUID), and MCP_E2E_WORKER_ID; secret values are never printed.',
      });
    } else {
      await runStage(stages, 'worker.status', async () => {
        const payload = { ownerId, workerId };
        const body = JSON.stringify(payload);
        const response = await request.post('/api/agent-bridge/status', {
          headers: bridgeHeaders(body, workerSecret, '/api/agent-bridge/status'),
          data: body,
        });
        const result = await readBody(response);
        const record = asRecord(result);
        const heartbeat = asRecord(record?.heartbeat);
        const valid = response.status() === 200
          && record?.workerId === workerId
          && Boolean(heartbeat)
          && !['offline', 'stopped'].includes(String(heartbeat?.status));
        return {
          state: valid ? 'passed' : 'failed',
          detail: valid
            ? `Signed bridge status confirms worker ${workerId} is available.`
            : `Signed bridge status returned HTTP ${response.status()} with ${heartbeat ? `worker status ${String(heartbeat.status)}` : 'no registered heartbeat'}.`,
          status: response.status(),
          evidence: { workerId: record?.workerId || null, heartbeatStatus: heartbeat?.status || null, hasCurrentTask: Boolean(record?.currentTask) },
        };
      });
    }

    if (!workflowId) {
      stages.push({ name: 'workflow.execution', state: 'blocked', detail: 'Full execution requires MCP_E2E_WORKFLOW_ID or a newly created workflow.' });
    } else {
      await runStage(stages, 'workflow.execution', async () => {
        const deadline = Date.now() + Number(process.env.HERMES_MCP_E2E_POLL_MS || 120_000);
        let lastStatus = 'unknown';
        while (Date.now() < deadline) {
          const { response, body } = await mcpPost(request, token, nextRequestId++, 'tools/call', {
            name: 'get_workflow_status',
            arguments: { workflowId },
          });
          const result = asRecord(asRecord(body)?.result);
          const structured = asRecord(result?.structuredContent);
          lastStatus = typeof structured?.status === 'string' ? structured.status : lastStatus;
          if (response.status() !== 200 || result?.isError === true) {
            return { state: 'failed', detail: `Workflow polling returned HTTP ${response.status()} (${responseError(body)}).`, status: response.status() };
          }
          if (lastStatus === 'completed') {
            return {
              state: structured?.resultRef ? 'passed' : 'failed',
              detail: structured?.resultRef
                ? 'The approved workflow reached completed with a reviewable result reference.'
                : 'The workflow reached completed without a reviewable result reference.',
              status: response.status(),
              evidence: { status: lastStatus, hasResultRef: Boolean(structured?.resultRef) },
            };
          }
          if (['failed', 'stopped'].includes(lastStatus)) {
            return { state: 'failed', detail: `The workflow reached terminal status ${lastStatus}.`, status: response.status(), evidence: { status: lastStatus } };
          }
          if (['draft', 'awaiting_approval'].includes(lastStatus)) {
            return { state: 'failed', detail: `The workflow is still ${lastStatus}; explicit owner approval and dispatch are required before worker execution.`, status: response.status(), evidence: { status: lastStatus } };
          }
          await new Promise((resolve) => setTimeout(resolve, 2_000));
        }
        return { state: 'failed', detail: `The workflow did not reach a terminal state within the polling window; last status was ${lastStatus}.` };
      });
    }

    await runStage(stages, 'vector-memory.runtime', async () => ({
      state: 'blocked',
      detail: 'No workflow currently exposes a safe semantic-memory write/read probe; the adapter is configured and unit-tested, but durable workflow projection is not connected.',
    }));
  } else {
    stages.push({
      name: 'workflow.execution',
      state: 'blocked',
      detail: 'Control-plane mode stops at the approval boundary. Set HERMES_MCP_E2E_REQUIRE_EXECUTION=true only for an explicitly approved worker rehearsal.',
    });
  }

  const report = {
    generatedAt: new Date().toISOString(),
    baseUrl,
    executionRequired: requireExecution,
    target,
    hostedReadOnly,
    stages,
    failures: stages.filter((stage) => stage.state === 'failed').map(({ name, detail, status }) => ({ name, detail, status })),
    blocked: stages.filter((stage) => stage.state === 'blocked').map(({ name, detail }) => ({ name, detail })),
  };
  await testInfo.attach('hermes-mcp-vertical-slice.json', {
    body: JSON.stringify(report, null, 2),
    contentType: 'application/json',
  });
  // Keep a filesystem copy beside the Playwright report as well as the
  // attachment so a blocked diagnostic remains reviewable after the run.
  await writeFile(testInfo.outputPath('hermes-mcp-vertical-slice.json'), JSON.stringify(report, null, 2), 'utf8');
  console.info(`[hermes-mcp-e2e] ${stages.map((stage) => `${stage.name}=${stage.state}`).join(' | ')}`);

  const actionable = stages.filter((stage) => stage.state === 'failed' || (stage.state === 'blocked' && (requireExecution || requiredStages.has(stage.name))));
  expect(actionable, `Hermes MCP vertical-slice diagnostics:\n${actionable.map((stage) => `- ${stage.name}: ${stage.detail}`).join('\n')}`).toEqual([]);
});
