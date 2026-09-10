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
import { getSupabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

const idSchema = z.string().uuid();

function response(body: unknown, status = 200) {
  return NextResponse.json(body, { status, headers: MCP_TOKEN_RESPONSE_HEADERS });
}

function storageError(error: { code?: string } | null | undefined, fallback: string) {
  return response({ error: isMissingMcpTokenTable(error) ? 'MCP credentials are not configured yet.' : fallback }, 503);
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!isSameOriginRequest(request)) {
    return response({ error: 'Invalid request origin.' }, 403);
  }

  const auth = await verifyAdmin();
  if (auth.error) return withMcpTokenHeaders(auth.error);

  const id = (await params).id;
  if (!idSchema.safeParse(id).success) return response({ error: 'Invalid MCP credential.' }, 400);

  try {
    const admin = getSupabaseAdmin();
    const existing = await admin
      .from('mcp_access_tokens')
      .select(MCP_TOKEN_VIEW_COLUMNS)
      .eq('id', id)
      .eq('owner_id', auth.user.id)
      .maybeSingle();
    if (existing.error) return storageError(existing.error, 'MCP credential could not be loaded.');
    if (!existing.data) return response({ error: 'MCP credential not found.' }, 404);

    if (!existing.data.revoked_at) {
      const revoked = await admin
        .from('mcp_access_tokens')
        .update({ revoked_at: new Date().toISOString() })
        .eq('id', id)
        .eq('owner_id', auth.user.id)
        .is('revoked_at', null)
        .select(MCP_TOKEN_VIEW_COLUMNS)
        .maybeSingle();
      if (revoked.error) return storageError(revoked.error, 'MCP credential could not be revoked.');
      if (!revoked.data) return response({ error: 'MCP credential could not be revoked.' }, 409);
      return response({ credential: toMcpTokenView(revoked.data as McpTokenRow), revoked: true });
    }

    return response({ credential: toMcpTokenView(existing.data as McpTokenRow), revoked: true });
  } catch (error) {
    console.error('[MCP token revoke] Storage unavailable:', error instanceof Error ? error.message : 'unknown error');
    return response({ error: 'MCP credentials are unavailable.' }, 503);
  }
}
