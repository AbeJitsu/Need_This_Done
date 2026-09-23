import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { closePool, getPool } from '../../../supabase/tests/helpers';

const localDescribe = process.env.RUN_LOCAL_SUPABASE_TESTS === 'true' ? describe : describe.skip;
const ownerA = '00000000-0000-4000-8000-0000000000c1';
const ownerB = '00000000-0000-4000-8000-0000000000c2';
const keyA = '40000000-0000-4000-8000-0000000000c1';
const keyB = '40000000-0000-4000-8000-0000000000c2';
const hashA = 'c'.repeat(64);
const hashB = 'd'.repeat(64);

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

localDescribe.sequential('MCP workflow draft ownership boundary', () => {
  beforeAll(async () => {
    const pool = getPool();
    await pool.query('delete from public.mcp_workflows where owner_id = any($1::uuid[])', [[ownerA, ownerB]]);
    await pool.query('delete from auth.users where id = any($1::uuid[])', [[ownerA, ownerB]]);
    await pool.query(`
      insert into auth.users (
        id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
        created_at, updated_at, confirmation_token, raw_app_meta_data, raw_user_meta_data
      ) values
        ($1, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'mcp-workflow-a@example.test', '', now(), now(), now(), '', '{}', '{}'),
        ($2, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'mcp-workflow-b@example.test', '', now(), now(), now(), '', '{}', '{}')
    `, [ownerA, ownerB]);
  });

  afterAll(async () => {
    const pool = getPool();
    await pool.query('delete from public.mcp_workflows where owner_id = any($1::uuid[])', [[ownerA, ownerB]]);
    await pool.query('delete from auth.users where id = any($1::uuid[])', [[ownerA, ownerB]]);
    await closePool();
  });

  it('allows authenticated owners to read only their own drafts and denies browser writes', async () => {
    await asRole('service_role', null, `
      insert into public.mcp_workflows (owner_id, request, request_hash, idempotency_key)
      values ($1, 'Owner A request', $2, $3), ($4, 'Owner B request', $5, $6)
    `, [ownerA, hashA, keyA, ownerB, hashB, keyB]);

    const own = await asRole<{ owner_id: string; status: string; approval_required: boolean }>(
      'authenticated',
      ownerA,
      'select owner_id, status, approval_required from public.mcp_workflows order by owner_id',
    );
    expect(own).toEqual([{ owner_id: ownerA, status: 'draft', approval_required: true }]);

    await expect(asRole('anon', null, 'select * from public.mcp_workflows')).rejects.toThrow();
    await expect(asRole('authenticated', ownerA, `
      insert into public.mcp_workflows (owner_id, request, request_hash, idempotency_key)
      values ($1, 'browser write', $2, $3)
    `, [ownerA, 'e'.repeat(64), '40000000-0000-4000-8000-0000000000c3'])).rejects.toThrow();
  });

  it('requires a valid approval state, request hash, and owner-scoped idempotency key', async () => {
    await expect(asRole('service_role', null, `
      insert into public.mcp_workflows (owner_id, request, request_hash, idempotency_key, status, approval_required)
      values ($1, 'invalid approval state', $2, $3, 'queued', true)
    `, [ownerA, 'e'.repeat(64), '40000000-0000-4000-8000-0000000000c4'])).rejects.toThrow();

    await expect(asRole('service_role', null, `
      insert into public.mcp_workflows (owner_id, request, request_hash, idempotency_key)
      values ($1, 'invalid hash', 'not-a-hash', $2)
    `, [ownerA, '40000000-0000-4000-8000-0000000000c5'])).rejects.toThrow();

    await expect(asRole('service_role', null, `
      insert into public.mcp_workflows (owner_id, request, request_hash, idempotency_key)
      values ($1, 'duplicate key', $2, $3)
    `, [ownerA, 'e'.repeat(64), keyA])).rejects.toThrow();
  });
});
