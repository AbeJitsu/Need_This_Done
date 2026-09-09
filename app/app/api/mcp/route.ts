import { handleMcpRequest } from '@/lib/mcp-http';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  return handleMcpRequest(request);
}

export async function POST(request: Request) {
  return handleMcpRequest(request);
}
