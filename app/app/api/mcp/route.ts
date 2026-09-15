import { createMcpRequestHandler } from '@/lib/mcp-http';
import { createMcpWorkflowDispatcher } from '@/lib/mcp-workflow-dispatcher';

export const dynamic = 'force-dynamic';

const handleMcpRequest = createMcpRequestHandler(createMcpWorkflowDispatcher());

export async function GET(request: Request) {
  return handleMcpRequest(request);
}

export async function POST(request: Request) {
  return handleMcpRequest(request);
}
