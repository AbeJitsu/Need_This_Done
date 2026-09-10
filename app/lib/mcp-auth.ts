import 'server-only';

import { timingSafeEqual } from 'node:crypto';
import { getSupabaseAdmin } from '@/lib/supabase';
import { hashMcpAccessToken, isValidMcpAccessToken, isValidUuid } from '@/lib/mcp-token';
import type { HermesMcpAuthContext } from '@/lib/hermes-mcp-contract';

export type McpAuthContext = HermesMcpAuthContext;
export type McpAuthResult = { ok: true; context: McpAuthContext } | { ok: false; response: Response };

function constantTimeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  if (leftBuffer.length !== rightBuffer.length) return false;
  return timingSafeEqual(leftBuffer, rightBuffer);
}

type OriginPolicy = { origins: Set<string>; valid: boolean };

function originPolicy(): OriginPolicy {
  const values = (process.env.MCP_ALLOWED_ORIGINS || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
  const origins = new Set<string>();
  let valid = true;
  for (const value of values) {
    try {
      const parsed = new URL(value);
      if (parsed.protocol !== 'https:' || parsed.pathname !== '/' || parsed.search || parsed.hash) {
        valid = false;
      }
      origins.add(parsed.origin);
    } catch {
      valid = false;
    }
  }
  return { origins, valid };
}

function errorResponse(message: string, status: number, headers: Record<string, string> = {}) {
  return Response.json({ error: message }, {
    status,
    headers: {
      'cache-control': 'no-store',
      ...headers,
    },
  });
}

function unauthorizedResponse() {
  return errorResponse('Unauthorized MCP request.', 401, { 'www-authenticate': 'Bearer' });
}

function unavailableResponse() {
  return errorResponse('MCP authentication is unavailable.', 503);
}

function parseBearerCredential(request: Request): string | null {
  const authorization = request.headers.get('authorization') || '';
  const match = /^Bearer[ \t]+([^\s]+)$/i.exec(authorization);
  return match?.[1] || null;
}

function bootstrapContext(credential: string): McpAuthContext | null {
  const configuredToken = process.env.MCP_BEARER_TOKEN?.trim();
  const ownerId = process.env.MCP_BEARER_TOKEN_OWNER_ID?.trim();
  if (!configuredToken || !ownerId || !isValidUuid(ownerId)) return null;
  if (!constantTimeEqual(credential, configuredToken)) return null;
  return { ownerId, credentialId: null, authMethod: 'bootstrap' };
}

function bootstrapConfigurationIsInvalid() {
  const configuredToken = Boolean(process.env.MCP_BEARER_TOKEN?.trim());
  const configuredOwner = Boolean(process.env.MCP_BEARER_TOKEN_OWNER_ID?.trim());
  if (!configuredToken && !configuredOwner) return false;
  return configuredToken !== configuredOwner
    || !isValidUuid(process.env.MCP_BEARER_TOKEN_OWNER_ID?.trim() || '');
}

/**
 * Authenticate an MCP request with either the temporary owner-bound bootstrap
 * value or a database-backed owner credential. Raw bearer values are never
 * sent to Supabase, logged, or placed in the Hermes context.
 */
export async function authenticateMcpRequest(request: Request): Promise<McpAuthResult> {
  const policy = originPolicy();
  if (!policy.valid) return { ok: false, response: unavailableResponse() };

  const origin = request.headers.get('origin');
  if (origin) {
    if (policy.origins.size === 0) return { ok: false, response: unavailableResponse() };
    if (!policy.origins.has(origin)) {
      return { ok: false, response: errorResponse('MCP origin is not allowed.', 403) };
    }
  }

  if (bootstrapConfigurationIsInvalid()) {
    return { ok: false, response: unavailableResponse() };
  }

  const credential = parseBearerCredential(request);
  if (!credential) return { ok: false, response: unauthorizedResponse() };

  const bootstrap = bootstrapContext(credential);
  if (bootstrap) return { ok: true, context: bootstrap };

  if (!isValidMcpAccessToken(credential)) {
    return { ok: false, response: unauthorizedResponse() };
  }

  let admin;
  try {
    admin = getSupabaseAdmin();
  } catch {
    return { ok: false, response: unavailableResponse() };
  }

  let credentialRow: {
    id: string;
    owner_id: string;
    token_hash: string;
    revoked_at: string | null;
    expires_at: string | null;
  } | null = null;
  try {
    const result = await admin
      .from('mcp_access_tokens')
      .select('id, owner_id, token_hash, revoked_at, expires_at')
      .eq('token_hash', hashMcpAccessToken(credential))
      .maybeSingle();
    if (result.error) {
      console.error('[MCP auth] Credential lookup failed:', result.error.message);
      return { ok: false, response: unavailableResponse() };
    }
    credentialRow = result.data;
  } catch (error) {
    console.error('[MCP auth] Credential storage unavailable:', error instanceof Error ? error.message : 'unknown error');
    return { ok: false, response: unavailableResponse() };
  }

  if (!credentialRow || credentialRow.revoked_at || !isValidUuid(credentialRow.owner_id)) {
    return { ok: false, response: unauthorizedResponse() };
  }
  if (credentialRow.expires_at) {
    const expiresAt = Date.parse(credentialRow.expires_at);
    if (!Number.isFinite(expiresAt)) return { ok: false, response: unavailableResponse() };
    if (expiresAt <= Date.now()) return { ok: false, response: unauthorizedResponse() };
  }

  try {
    const touched = await admin
      .from('mcp_access_tokens')
      .update({ last_used_at: new Date().toISOString() })
      .eq('id', credentialRow.id)
      .eq('owner_id', credentialRow.owner_id)
      .is('revoked_at', null)
      .select('id')
      .maybeSingle();
    if (touched.error) {
      console.error('[MCP auth] Credential last-use update failed:', touched.error.message);
      return { ok: false, response: unavailableResponse() };
    }
    if (!touched.data) return { ok: false, response: unauthorizedResponse() };
  } catch (error) {
    console.error('[MCP auth] Credential last-use storage unavailable:', error instanceof Error ? error.message : 'unknown error');
    return { ok: false, response: unavailableResponse() };
  }

  return {
    ok: true,
    context: {
      ownerId: credentialRow.owner_id,
      credentialId: credentialRow.id,
      authMethod: 'database',
    },
  };
}
