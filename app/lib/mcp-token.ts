import 'server-only';

import { createHash, randomBytes } from 'node:crypto';

export const MCP_ACCESS_TOKEN_PREFIX = 'ntd_mcp_';
const MCP_ACCESS_TOKEN_RANDOM_BYTES = 32;
const MCP_ACCESS_TOKEN_RANDOM_LENGTH = 43;
const MCP_ACCESS_TOKEN_RANDOM_PATTERN = /^[A-Za-z0-9_-]{43}$/;

/**
 * MCP account credentials are opaque, high-entropy bearer values. This module
 * is server-only so browser code can receive a newly-created value once but
 * cannot import the generator or hash implementation into its bundle.
 */
export function generateMcpAccessToken(): string {
  return `${MCP_ACCESS_TOKEN_PREFIX}${randomBytes(MCP_ACCESS_TOKEN_RANDOM_BYTES).toString('base64url')}`;
}

export function isValidMcpAccessToken(value: unknown): value is string {
  return typeof value === 'string'
    && value.length === MCP_ACCESS_TOKEN_PREFIX.length + MCP_ACCESS_TOKEN_RANDOM_LENGTH
    && value.startsWith(MCP_ACCESS_TOKEN_PREFIX)
    && MCP_ACCESS_TOKEN_RANDOM_PATTERN.test(value.slice(MCP_ACCESS_TOKEN_PREFIX.length));
}

export function hashMcpAccessToken(value: string): string {
  if (!isValidMcpAccessToken(value)) {
    throw new Error('Invalid MCP access token format.');
  }
  return createHash('sha256').update(value, 'utf8').digest('hex');
}

/**
 * The stored prefix is useful for identifying a credential after creation,
 * while the omitted suffix keeps it from being a usable bearer value.
 */
export function getMcpAccessTokenPrefix(value: string): string {
  if (!isValidMcpAccessToken(value)) {
    throw new Error('Invalid MCP access token format.');
  }
  return `${MCP_ACCESS_TOKEN_PREFIX}${value.slice(MCP_ACCESS_TOKEN_PREFIX.length, MCP_ACCESS_TOKEN_PREFIX.length + 8)}`;
}

export function isValidUuid(value: unknown): value is string {
  return typeof value === 'string'
    && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}
