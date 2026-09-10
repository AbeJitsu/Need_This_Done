import 'server-only';

export const MCP_TOKEN_RESPONSE_HEADERS = {
  'Cache-Control': 'no-store, private',
  Pragma: 'no-cache',
} as const;

export const MCP_TOKEN_VIEW_COLUMNS = 'id, name, token_prefix, created_at, last_used_at, revoked_at, expires_at';

export function withMcpTokenHeaders<T extends Response>(response: T): T {
  for (const [name, value] of Object.entries(MCP_TOKEN_RESPONSE_HEADERS)) {
    response.headers.set(name, value);
  }
  return response;
}

export type McpTokenRow = {
  id: string;
  name: string;
  token_prefix: string;
  created_at: string;
  last_used_at: string | null;
  revoked_at: string | null;
  expires_at: string | null;
};

export type McpTokenView = {
  id: string;
  name: string;
  tokenPrefix: string;
  createdAt: string;
  lastUsedAt: string | null;
  revokedAt: string | null;
  expiresAt: string | null;
};

export function toMcpTokenView(row: McpTokenRow): McpTokenView {
  return {
    id: row.id,
    name: row.name,
    tokenPrefix: `${row.token_prefix}…`,
    createdAt: row.created_at,
    lastUsedAt: row.last_used_at,
    revokedAt: row.revoked_at,
    expiresAt: row.expires_at,
  };
}

/**
 * Account mutations are cookie-authenticated. Origin and Referer checks keep
 * browser cross-site requests from using that session to create or revoke a
 * credential. Requests without either header remain compatible with trusted
 * non-browser clients; the route still requires the authenticated session.
 */
export function isSameOriginRequest(request: Request): boolean {
  const requestOrigin = new URL(request.url).origin;
  for (const header of ['origin', 'referer']) {
    const value = request.headers.get(header);
    if (!value) continue;
    try {
      if (new URL(value).origin !== requestOrigin) return false;
    } catch {
      return false;
    }
  }
  return true;
}

export function isMissingMcpTokenTable(error: { code?: string } | null | undefined): boolean {
  return error?.code === '42P01' || error?.code === '42883';
}
