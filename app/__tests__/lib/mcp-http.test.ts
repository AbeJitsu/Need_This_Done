import { describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));

import { createMcpRequestHandler, MCP_PROTOCOL_VERSION } from '@/lib/mcp-http';

const authContext = {
  ownerId: '00000000-0000-4000-8000-000000000001',
  credentialId: '00000000-0000-4000-8000-000000000002',
  authMethod: 'database' as const,
};
const auth = () => ({ ok: true as const, context: authContext });
const workflowId = '11111111-1111-4111-8111-111111111111';

function mcpRequest(message: unknown, headers: Record<string, string> = {}) {
  return new Request('https://mcp.example.test/api/mcp', {
    method: 'POST',
    headers: {
      accept: 'application/json, text/event-stream',
      'content-type': 'application/json',
      'mcp-protocol-version': MCP_PROTOCOL_VERSION,
      ...headers,
    },
    body: JSON.stringify(message),
  });
}

describe('MCP Streamable HTTP request boundary', () => {
  it('negotiates the protocol and exposes tools without a device-specific setting', async () => {
    const handle = createMcpRequestHandler(undefined, auth);
    const response = await handle(mcpRequest({
      jsonrpc: '2.0',
      id: 1,
      method: 'initialize',
      params: { protocolVersion: MCP_PROTOCOL_VERSION, capabilities: {}, clientInfo: { name: 'test', version: '1' } },
    }, { 'mcp-protocol-version': '' }));
    const body = await response.json();
    expect(response.status).toBe(200);
    expect(body.result.protocolVersion).toBe(MCP_PROTOCOL_VERSION);
    expect(body.result.capabilities.tools).toEqual({ listChanged: false });
  });

  it('returns exactly the three approved tools after protocol initialization', async () => {
    const handle = createMcpRequestHandler(undefined, auth);
    const response = await handle(mcpRequest({ jsonrpc: '2.0', id: 2, method: 'tools/list' }));
    const body = await response.json();
    expect(body.result.tools.map((tool: { name: string }) => tool.name)).toEqual([
      'start_workflow',
      'get_workflow_status',
      'list_workflows',
    ]);
  });

  it('dispatches a validated start request while preserving approval gating', async () => {
    // This proves the authenticated site owner reaches Hermes explicitly;
    // it does not prove that the durable Hermes dispatcher or worker is live.
    const startWorkflow = vi.fn(async (_input, context) => {
      expect(context).toEqual(authContext);
      return {
      workflowId,
      status: 'draft' as const,
      approvalRequired: true as const,
      nextAction: 'review' as const,
      };
    });
    const handle = createMcpRequestHandler({
      startWorkflow,
      getWorkflowStatus: vi.fn(),
      listWorkflows: vi.fn(),
    }, auth);
    const response = await handle(mcpRequest({
      jsonrpc: '2.0',
      id: 3,
      method: 'tools/call',
      params: { name: 'start_workflow', arguments: { request: 'Fix the failing check.' } },
    }));
    const body = await response.json();
    expect(startWorkflow).toHaveBeenCalledWith({ request: 'Fix the failing check.' }, authContext);
    expect(body.result.isError).toBe(false);
    expect(body.result.structuredContent).toEqual({
      workflowId,
      status: 'draft',
      approvalRequired: true,
      nextAction: 'review',
    });
  });

  it('passes the same authenticated owner context to status and list operations', async () => {
    const getWorkflowStatus = vi.fn(async (_input, context) => {
      expect(context).toEqual(authContext);
      return {
        workflowId,
        status: 'running' as const,
        updatedAt: '2026-09-10T12:00:00.000Z',
        approvalRequired: false,
        worker: null,
        summary: 'Still running.',
        resultRef: null,
      };
    });
    const listWorkflows = vi.fn(async (_input, context) => {
      expect(context).toEqual(authContext);
      return { workflows: [], nextCursor: null };
    });
    const handle = createMcpRequestHandler({
      startWorkflow: vi.fn(),
      getWorkflowStatus,
      listWorkflows,
    }, auth);

    const statusResponse = await handle(mcpRequest({
      jsonrpc: '2.0',
      id: 31,
      method: 'tools/call',
      params: { name: 'get_workflow_status', arguments: { workflowId } },
    }));
    const listResponse = await handle(mcpRequest({
      jsonrpc: '2.0',
      id: 32,
      method: 'tools/call',
      params: { name: 'list_workflows', arguments: {} },
    }));

    expect(statusResponse.status).toBe(200);
    expect(listResponse.status).toBe(200);
    expect(getWorkflowStatus).toHaveBeenCalledWith({ workflowId }, authContext);
    expect(listWorkflows).toHaveBeenCalledWith({ limit: 20, cursor: undefined }, authContext);
  });

  it('rejects unknown tools and invalid arguments as protocol errors', async () => {
    const handle = createMcpRequestHandler(undefined, auth);
    const unknown = await handle(mcpRequest({
      jsonrpc: '2.0', id: 4, method: 'tools/call', params: { name: 'run_shell', arguments: {} },
    }));
    expect(unknown.status).toBe(400);
    expect((await unknown.json()).error).toEqual({ code: -32602, message: 'Unknown MCP tool.' });

    const invalid = await handle(mcpRequest({
      jsonrpc: '2.0', id: 5, method: 'tools/call', params: { name: 'get_workflow_status', arguments: { workflowId: 'nope' } },
    }));
    expect((await invalid.json()).error).toEqual({ code: -32602, message: 'Invalid tool arguments.' });
  });

  it('requires the negotiated protocol header on operational requests', async () => {
    const handle = createMcpRequestHandler(undefined, auth);
    const response = await handle(mcpRequest({ jsonrpc: '2.0', id: 6, method: 'tools/list' }, {
      'mcp-protocol-version': '2024-11-05',
    }));
    expect(response.status).toBe(400);
    expect((await response.json()).error.message).toContain('protocol version');
  });

  it('rejects an invalid origin before protocol handling', async () => {
    const handle = createMcpRequestHandler(undefined, () => ({
      ok: false as const,
      response: Response.json({ error: 'MCP origin is not allowed.' }, { status: 403 }),
    }));
    const response = await handle(mcpRequest({ jsonrpc: '2.0', id: 7, method: 'tools/list' }, {
      origin: 'https://evil.example',
    }));
    expect(response.status).toBe(403);
    expect((await response.json()).error).toBe('MCP origin is not allowed.');
  });

  it('stops before protocol handling when authentication is unavailable', async () => {
    const handle = createMcpRequestHandler(undefined, () => ({
      ok: false as const,
      response: Response.json({ error: 'MCP authentication is unavailable.' }, { status: 503 }),
    }));
    const response = await handle(mcpRequest({ jsonrpc: '2.0', id: 8, method: 'tools/list' }));
    expect(response.status).toBe(503);
  });
});
