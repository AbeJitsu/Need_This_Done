import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { closePool, getPool } from '../../../supabase/tests/helpers';

const localDescribe = process.env.RUN_LOCAL_SUPABASE_TESTS === 'true' ? describe : describe.skip;
const ownerA = '00000000-0000-4000-8000-0000000000a1';
const ownerB = '00000000-0000-4000-8000-0000000000b1';
const hashA = 'a'.repeat(64);
const hashB = 'b'.repeat(64);
const prefixA = 'ntd_mcp_AAAAAAAA';
const prefixB = 'ntd_mcp_BBBBBBBB';

type DatabaseRole = 'anon' | 'authenticated' | 'service_role';

async function asRole<T>(role: DatabaseRole, userId: string | null, query: string, values: unknown[] = []) {
  const client = await getPool().connect();
  try {
    await client.query('begin');
    await client.query(`set local role ${role}`);
    await client.query(`select set_config('request.jwt.claim.role', $1, true)`, [role]);
    if (userId) await client.query(`select set_config('request.jwt.claim.sub', $1, true)`, [userId]);
    const result = await client.query(query, values);
    await client.query('commit');
    return result.rows as T[];
  } catch (error) {
    await client.query('rollback');
    throw error;
  } finally {
    client.release();
  }
}

localDescribe.sequential('MCP account credential table security', () => {
  beforeAll(async () => {
    const pool = getPool();
    await pool.query('delete from public.mcp_access_tokens where owner_id = any($1::uuid[])', [[ownerA, ownerB]]);
    await pool.query('delete from auth.users where id = any($1::uuid[])', [[ownerA, ownerB]]);
    await pool.query(`
      insert into auth.users (
        id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
        created_at, updated_at, confirmation_token, raw_app_meta_data, raw_user_meta_data
      ) values
        ($1, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'mcp-owner-a@example.test', '', now(), now(), now(), '', '{}', '{}'),
        ($2, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'mcp-owner-b@example.test', '', now(), now(), now(), '', '{}', '{}')
    `, [ownerA, ownerB]);
  });

  afterAll(async () => {
    const pool = getPool();
    await pool.query('delete from public.mcp_access_tokens where owner_id = any($1::uuid[])', [[ownerA, ownerB]]);
    await pool.query('delete from auth.users where id = any($1::uuid[])', [[ownerA, ownerB]]);
    await closePool();
  });

  it('enables RLS and grants every table operation only to service_role', async () => {
    // Proves the database itself blocks browser roles, which matters because
    // API code must not be the only control protecting raw credential material.
    // It does not prove the Next.js session or account-owner checks.
    const result = await getPool().query<{
      row_security: boolean;
      anon_select: boolean;
      authenticated_select: boolean;
      service_select: boolean;
      service_insert: boolean;
      service_update: boolean;
      service_delete: boolean;
    }>(`
      select
        c.relrowsecurity as row_security,
        has_table_privilege('anon', 'public.mcp_access_tokens', 'SELECT') as anon_select,
        has_table_privilege('authenticated', 'public.mcp_access_tokens', 'SELECT') as authenticated_select,
        has_table_privilege('service_role', 'public.mcp_access_tokens', 'SELECT') as service_select,
        has_table_privilege('service_role', 'public.mcp_access_tokens', 'INSERT') as service_insert,
        has_table_privilege('service_role', 'public.mcp_access_tokens', 'UPDATE') as service_update,
        has_table_privilege('service_role', 'public.mcp_access_tokens', 'DELETE') as service_delete
      from pg_class c
      join pg_namespace n on n.oid = c.relnamespace
      where n.nspname = 'public' and c.relname = 'mcp_access_tokens'
    `);

    expect(result.rows).toEqual([{
      row_security: true,
      anon_select: false,
      authenticated_select: false,
      service_select: true,
      service_insert: true,
      service_update: true,
      service_delete: true,
    }]);
  });

  it('rejects direct anonymous and authenticated reads and writes', async () => {
    // Proves no browser JWT role can enumerate or manufacture bearer records;
    // this matters even when a caller has a valid site session. It does not
    // prove cross-owner behavior of the server-side service-role queries.
    await expect(asRole('anon', null, 'select * from public.mcp_access_tokens')).rejects.toThrow();
    await expect(asRole('authenticated', ownerA, 'select * from public.mcp_access_tokens')).rejects.toThrow();
    await expect(asRole('authenticated', ownerA, `insert into public.mcp_access_tokens (owner_id, token_hash, token_prefix, name) values ($1, $2, $3, 'browser')`, [ownerA, hashA, prefixA])).rejects.toThrow();
  });

  it('allows service_role to create and revoke records while retaining only hash and prefix', async () => {
    // Proves the intended server-side lifecycle and hash-only storage shape;
    // the token-generation unit test covers raw-token entropy and format, not
    // a live database round trip.
    const created = await asRole<{ id: string; owner_id: string; token_hash: string; token_prefix: string }>(
      'service_role',
      null,
      `insert into public.mcp_access_tokens (owner_id, token_hash, token_prefix, name, expires_at)
       values ($1, $2, $3, 'Owner A', now() + interval '1 day')
       returning id, owner_id, token_hash, token_prefix`,
      [ownerA, hashA, prefixA],
    );
    expect(created).toMatchObject([{ owner_id: ownerA, token_hash: hashA, token_prefix: prefixA }]);

    const revoked = await asRole<{ revoked_at: Date | null }>(
      'service_role',
      null,
      `update public.mcp_access_tokens set revoked_at = now() where id = $1 returning revoked_at`,
      [created[0].id],
    );
    expect(revoked[0]?.revoked_at).toBeInstanceOf(Date);
  });

  it('enforces hash, prefix, name, expiration, and uniqueness constraints', async () => {
    // Proves malformed or ambiguous credential rows cannot enter durable truth;
    // it does not prove how a particular API client presents validation errors.
    const cases = [
      [`insert into public.mcp_access_tokens (owner_id, token_hash, token_prefix, name) values ($1, 'not-a-hash', $2, 'bad')`, [ownerB, prefixB]],
      [`insert into public.mcp_access_tokens (owner_id, token_hash, token_prefix, name) values ($1, $2, 'bad-prefix', 'bad')`, [ownerB, hashB]],
      [`insert into public.mcp_access_tokens (owner_id, token_hash, token_prefix, name) values ($1, $2, $3, '   ')`, [ownerB, hashB, prefixB]],
      [`insert into public.mcp_access_tokens (owner_id, token_hash, token_prefix, name, expires_at) values ($1, $2, $3, 'expired', now())`, [ownerB, hashB, prefixB]],
    ] as const;

    for (const [query, values] of cases) {
      await expect(asRole('service_role', null, query, values)).rejects.toThrow();
    }

    await expect(asRole('service_role', null, `insert into public.mcp_access_tokens (owner_id, token_hash, token_prefix, name) values ($1, $2, $3, 'duplicate')`, [ownerB, hashA, prefixB])).rejects.toThrow();
  });
});
