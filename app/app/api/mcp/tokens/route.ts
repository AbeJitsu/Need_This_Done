import { NextResponse } from 'next/server';
import { z } from 'zod';
import { verifyAdmin } from '@/lib/api-auth';
import {
  isMissingMcpTokenTable,
  isSameOriginRequest,
  MCP_TOKEN_RESPONSE_HEADERS,
  MCP_TOKEN_VIEW_COLUMNS,
  toMcpTokenView,
  type McpTokenRow,
  withMcpTokenHeaders,
} from '@/lib/mcp-token-api';
import {
  generateMcpAccessToken,
  getMcpAccessTokenPrefix,
  hashMcpAccessToken,
} from '@/lib/mcp-token';
import { getSupabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

const createTokenSchema = z.object({
  name: z.string().trim().min(1).max(120),
  expiresAt: z.string().datetime({ offset: true }).nullable().optional(),
}).strict();

function response(body: unknown, status = 200) {
  return NextResponse.json(body, { status, headers: MCP_TOKEN_RESPONSE_HEADERS });
}

function storageError(error: { code?: string } | null | undefined, fallback: string) {
  return response({ error: isMissingMcpTokenTable(error) ? 'MCP credentials are not configured yet.' : fallback }, 503);
}

export async function GET() {
  const auth = await verifyAdmin();
  if (auth.error) return withMcpTokenHeaders(auth.error);

  try {
    const { data, error } = await getSupabaseAdmin()
      .from('mcp_access_tokens')
      .select(MCP_TOKEN_VIEW_COLUMNS)
      .eq('owner_id', auth.user.id)
      .order('created_at', { ascending: false })
      .limit(100);
    if (error) return storageError(error, 'MCP credentials could not be loaded.');
    return response({ tokens: (data || []).map((row) => toMcpTokenView(row as McpTokenRow)) });
  } catch (error) {
    console.error('[MCP token list] Storage unavailable:', error instanceof Error ? error.message : 'unknown error');
    return response({ error: 'MCP credentials are unavailable.' }, 503);
  }
}

export async function POST(request: Request) {
  if (!isSameOriginRequest(request)) {
    return response({ error: 'Invalid request origin.' }, 403);
  }

  const auth = await verifyAdmin();
  if (auth.error) return withMcpTokenHeaders(auth.error);

  const parsed = createTokenSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return response({ error: parsed.error.issues[0]?.message || 'Invalid MCP credential request.' }, 400);
  }

  let expiresAt: string | null = null;
  if (parsed.data.expiresAt) {
    const expires = new Date(parsed.data.expiresAt);
    if (!Number.isFinite(expires.getTime()) || expires.getTime() <= Date.now()) {
      return response({ error: 'Expiration must be in the future.' }, 400);
    }
    expiresAt = expires.toISOString();
  }

  const token = generateMcpAccessToken();
  try {
    const { data, error } = await getSupabaseAdmin()
      .from('mcp_access_tokens')
      .insert({
        owner_id: auth.user.id,
        token_hash: hashMcpAccessToken(token),
        token_prefix: getMcpAccessTokenPrefix(token),
        name: parsed.data.name,
        expires_at: expiresAt,
      })
      .select(MCP_TOKEN_VIEW_COLUMNS)
      .single();

    if (error) {
      if (error.code === '23505') return response({ error: 'The MCP credential could not be created. Please try again.' }, 409);
      return storageError(error, 'MCP credential could not be created.');
    }

    // The raw token is deliberately returned in this response only. It is not
    // included in the row view, persisted by the server, or logged.
    return response({ token, credential: toMcpTokenView(data as McpTokenRow) }, 201);
  } catch (error) {
    console.error('[MCP token create] Storage unavailable:', error instanceof Error ? error.message : 'unknown error');
    return response({ error: 'MCP credentials are unavailable.' }, 503);
  }
}
