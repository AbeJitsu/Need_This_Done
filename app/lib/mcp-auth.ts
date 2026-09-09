import 'server-only';

import { timingSafeEqual } from 'node:crypto';

export type McpAuthResult = { ok: true } | { ok: false; response: Response };

function constantTimeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  if (leftBuffer.length !== rightBuffer.length) return false;
  return timingSafeEqual(leftBuffer, rightBuffer);
}

function allowedOrigins() {
  return new Set(
    (process.env.MCP_ALLOWED_ORIGINS || '')
      .split(',')
      .map((origin) => origin.trim())
      .filter(Boolean),
  );
}

export function authenticateMcpRequest(request: Request): McpAuthResult {
  const configuredToken = process.env.MCP_BEARER_TOKEN?.trim();
  if (!configuredToken) {
    return {
      ok: false,
      response: Response.json({ error: 'MCP is not configured.' }, { status: 503 }),
    };
  }

  const origin = request.headers.get('origin');
  const origins = allowedOrigins();
  if (origin && origins.size > 0 && !origins.has(origin)) {
    return {
      ok: false,
      response: Response.json({ error: 'MCP origin is not allowed.' }, { status: 403 }),
    };
  }

  const authorization = request.headers.get('authorization') || '';
  const match = /^Bearer\s+(.+)$/i.exec(authorization);
  if (!match || !constantTimeEqual(match[1].trim(), configuredToken)) {
    return {
      ok: false,
      response: new Response(JSON.stringify({ error: 'Unauthorized MCP request.' }), {
        status: 401,
        headers: {
          'content-type': 'application/json',
          'www-authenticate': 'Bearer',
          'cache-control': 'no-store',
        },
      }),
    };
  }

  return { ok: true };
}
