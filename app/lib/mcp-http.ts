import {
  getWorkflowStatusInputSchema,
  listWorkflowsInputSchema,
  MCP_TOOL_DEFINITIONS,
  MCP_TOOL_NAMES,
  startWorkflowInputSchema,
  type HermesMcpAuthContext,
  type HermesMcpDispatcher,
} from '@/lib/hermes-mcp-contract';
import { authenticateMcpRequest, type McpAuthResult } from '@/lib/mcp-auth';

export const MCP_PROTOCOL_VERSION = '2025-06-18';
const MAX_BODY_LENGTH = 64_000;

type JsonRpcId = string | number;
type JsonRpcRequest = {
  jsonrpc: '2.0';
  id?: JsonRpcId;
  method: string;
  params?: Record<string, unknown>;
};

type JsonRpcError = { code: number; message: string };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function errorResponse(id: JsonRpcId | null, code: number, message: string) {
  return { jsonrpc: '2.0', id, error: { code, message } satisfies JsonRpcError };
}

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'content-type': 'application/json',
      'cache-control': 'no-store',
    },
  });
}

function acceptsPost(request: Request) {
  const accept = (request.headers.get('accept') || '').toLowerCase();
  return accept.includes('application/json') && accept.includes('text/event-stream');
}

function hasValidProtocolHeader(request: Request) {
  return request.headers.get('mcp-protocol-version') === MCP_PROTOCOL_VERSION;
}

function parseJsonRpc(body: string): JsonRpcRequest | null {
  let value: unknown;
  try {
    value = JSON.parse(body);
  } catch {
    return null;
  }
  if (!isRecord(value)
    || value.jsonrpc !== '2.0'
    || typeof value.method !== 'string'
    || value.method.length < 1
    || value.method.length > 128
    || ('id' in value && typeof value.id !== 'string' && typeof value.id !== 'number')
    || ('params' in value && (!isRecord(value.params) || Array.isArray(value.params)))) {
    return null;
  }
  return value as JsonRpcRequest;
}

function unavailableDispatcher(): HermesMcpDispatcher {
  const unavailable = async (_input: unknown, _context: HermesMcpAuthContext): Promise<never> => {
    throw new Error('Hermes workflow service is unavailable.');
  };
  return {
    startWorkflow: unavailable,
    getWorkflowStatus: unavailable,
    listWorkflows: unavailable,
  };
}

function toolResult(value: unknown) {
  return {
    content: [{ type: 'text', text: JSON.stringify(value) }],
    structuredContent: value,
    isError: false,
  };
}

function toolError(message: string) {
  return {
    content: [{ type: 'text', text: message }],
    isError: true,
  };
}

async function callTool(
  name: string,
  args: unknown,
  dispatcher: HermesMcpDispatcher,
  context: HermesMcpAuthContext,
) {
  if (!MCP_TOOL_NAMES.includes(name as typeof MCP_TOOL_NAMES[number])) {
    return { protocolError: errorResponse(null, -32602, 'Unknown MCP tool.') };
  }

  try {
    if (name === 'start_workflow') {
      const parsed = startWorkflowInputSchema.safeParse(args);
      if (!parsed.success) return { protocolError: errorResponse(null, -32602, 'Invalid tool arguments.') };
      return { result: toolResult(await dispatcher.startWorkflow(parsed.data, context)) };
    }
    if (name === 'get_workflow_status') {
      const parsed = getWorkflowStatusInputSchema.safeParse(args);
      if (!parsed.success) return { protocolError: errorResponse(null, -32602, 'Invalid tool arguments.') };
      return { result: toolResult(await dispatcher.getWorkflowStatus(parsed.data, context)) };
    }
    const parsed = listWorkflowsInputSchema.safeParse(args);
    if (!parsed.success) return { protocolError: errorResponse(null, -32602, 'Invalid tool arguments.') };
    const result = await dispatcher.listWorkflows(parsed.data, context);
    return { result: toolResult(result) };
  } catch {
    return { result: toolError('Hermes could not complete the workflow request.') };
  }
}

export function createMcpRequestHandler(
  dispatcher: HermesMcpDispatcher = unavailableDispatcher(),
  authenticate: (request: Request) => McpAuthResult | Promise<McpAuthResult> = authenticateMcpRequest,
) {
  return async function handleMcpRequest(request: Request): Promise<Response> {
    const auth = await authenticate(request);
    if (!auth.ok) return auth.response;

    if (request.method === 'GET') {
      return new Response(null, { status: 405, headers: { allow: 'POST' } });
    }
    if (request.method !== 'POST') {
      return new Response(null, { status: 405, headers: { allow: 'GET, POST' } });
    }
    if (!acceptsPost(request)) {
      return jsonResponse(errorResponse(null, -32600, 'MCP POST requires JSON and event-stream response types.'), 406);
    }
    if (!request.headers.get('content-type')?.toLowerCase().includes('application/json')) {
      return jsonResponse(errorResponse(null, -32600, 'MCP POST requires application/json.'), 415);
    }

    const body = await request.text();
    if (body.length > MAX_BODY_LENGTH) {
      return jsonResponse(errorResponse(null, -32600, 'MCP request is too large.'), 413);
    }
    const message = parseJsonRpc(body);
    if (!message) return jsonResponse(errorResponse(null, -32700, 'Invalid JSON-RPC request.'), 400);

    if (message.method === 'initialize') {
      return jsonResponse({
        jsonrpc: '2.0',
        id: message.id ?? null,
        result: {
          protocolVersion: MCP_PROTOCOL_VERSION,
          capabilities: { tools: { listChanged: false } },
          serverInfo: { name: 'needthisdone-hermes', version: '0.1.0' },
          instructions: 'Use only the three approval-gated workflow tools.',
        },
      });
    }
    if (message.method === 'notifications/initialized') return new Response(null, { status: 202 });

    if (message.id === undefined) {
      return new Response(null, { status: 202 });
    }
    if (!hasValidProtocolHeader(request)) {
      return jsonResponse(errorResponse(message.id, -32600, 'Missing or unsupported MCP protocol version.'), 400);
    }
    if (message.method === 'ping') return jsonResponse({ jsonrpc: '2.0', id: message.id, result: {} });
    if (message.method === 'tools/list') {
      return jsonResponse({ jsonrpc: '2.0', id: message.id, result: { tools: MCP_TOOL_DEFINITIONS } });
    }
    if (message.method === 'tools/call') {
      const params = message.params;
      if (!params || typeof params.name !== 'string') {
        return jsonResponse(errorResponse(message.id, -32602, 'Tool name is required.'), 400);
      }
      const called = await callTool(params.name, params.arguments ?? {}, dispatcher, auth.context);
      if (called.protocolError) return jsonResponse({ ...called.protocolError, id: message.id }, 400);
      return jsonResponse({ jsonrpc: '2.0', id: message.id, result: called.result });
    }
    return jsonResponse(errorResponse(message.id, -32601, 'MCP method not found.'), 404);
  };
}

export const handleMcpRequest = createMcpRequestHandler();
