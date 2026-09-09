import { describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));

import { createMcpRequestHandler, MCP_PROTOCOL_VERSION } from '@/lib/mcp-http';

const auth = () => ({ ok: true as const });
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
    const startWorkflow = vi.fn(async () => ({
      workflowId,
      status: 'draft' as const,
      approvalRequired: true as const,
      nextAction: 'review' as const,
    }));
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
    expect(startWorkflow).toHaveBeenCalledWith({ request: 'Fix the failing check.' });
    expect(body.result.isError).toBe(false);
    expect(body.result.structuredContent).toEqual({
      workflowId,
      status: 'draft',
      approvalRequired: true,
      nextAction: 'review',
    });
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
    const previousToken = process.env.MCP_BEARER_TOKEN;
    const previousOrigins = process.env.MCP_ALLOWED_ORIGINS;
    process.env.MCP_BEARER_TOKEN = 'x'.repeat(32);
    process.env.MCP_ALLOWED_ORIGINS = 'https://chatgpt.com';
    try {
      const handle = createMcpRequestHandler();
      const response = await handle(mcpRequest({ jsonrpc: '2.0', id: 7, method: 'tools/list' }, {
        authorization: `Bearer ${'y'.repeat(32)}`,
        origin: 'https://evil.example',
      }));
      expect(response.status).toBe(403);
      expect((await response.json()).error).toBe('MCP origin is not allowed.');
    } finally {
      if (previousToken === undefined) delete process.env.MCP_BEARER_TOKEN;
      else process.env.MCP_BEARER_TOKEN = previousToken;
      if (previousOrigins === undefined) delete process.env.MCP_ALLOWED_ORIGINS;
      else process.env.MCP_ALLOWED_ORIGINS = previousOrigins;
    }
  });

  it('rejects an unconfigured transport and accepts the configured bearer seam', async () => {
    const previousToken = process.env.MCP_BEARER_TOKEN;
    const previousOrigins = process.env.MCP_ALLOWED_ORIGINS;
    delete process.env.MCP_BEARER_TOKEN;
    delete process.env.MCP_ALLOWED_ORIGINS;
    try {
      const unconfigured = await createMcpRequestHandler()(mcpRequest({ jsonrpc: '2.0', id: 8, method: 'tools/list' }));
      expect(unconfigured.status).toBe(503);

      process.env.MCP_BEARER_TOKEN = 'x'.repeat(32);
      const configured = await createMcpRequestHandler()(mcpRequest({ jsonrpc: '2.0', id: 9, method: 'tools/list' }, {
        authorization: `Bearer ${'x'.repeat(32)}`,
      }));
      expect(configured.status).toBe(200);
    } finally {
      if (previousToken === undefined) delete process.env.MCP_BEARER_TOKEN;
      else process.env.MCP_BEARER_TOKEN = previousToken;
      if (previousOrigins === undefined) delete process.env.MCP_ALLOWED_ORIGINS;
      else process.env.MCP_ALLOWED_ORIGINS = previousOrigins;
    }
  });
});
