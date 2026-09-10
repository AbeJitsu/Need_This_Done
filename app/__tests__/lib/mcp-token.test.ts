import { describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));

import {
  generateMcpAccessToken,
  getMcpAccessTokenPrefix,
  hashMcpAccessToken,
  isValidMcpAccessToken,
} from '@/lib/mcp-token';

const fixedToken = `ntd_mcp_${'A'.repeat(43)}`;

// These tests prove the deterministic credential format and hash boundary,
// which matters because a bearer value is the only secret accepted by MCP.
// They do not prove storage, RLS, account authorization, or hosted entropy.
describe('MCP account token utilities', () => {
  it('generates a recognizable high-entropy token format', () => {
    const token = generateMcpAccessToken();

    expect(isValidMcpAccessToken(token)).toBe(true);
    expect(token).toMatch(/^ntd_mcp_[A-Za-z0-9_-]{43}$/);
    expect(generateMcpAccessToken()).not.toBe(token);
  });

  it('rejects malformed credentials before hashing them', () => {
    for (const value of ['', 'ntd_mcp_short', 'ntd_mcp_'.padEnd(51, '!'), `ntd_mcp_${'A'.repeat(42)} `]) {
      expect(isValidMcpAccessToken(value)).toBe(false);
      expect(() => hashMcpAccessToken(value)).toThrow('Invalid MCP access token format.');
    }
  });

  it('stores a SHA-256 digest and only a non-usable display prefix', () => {
    expect(hashMcpAccessToken(fixedToken)).toBe('959febd0610fb6b536f7c2131541b533bd333d191ea97471e23b47f848eed317');
    expect(getMcpAccessTokenPrefix(fixedToken)).toBe('ntd_mcp_AAAAAAAA');
    expect(getMcpAccessTokenPrefix(fixedToken)).not.toBe(fixedToken);
  });
});
