import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { getPool, closePool } from '../../../supabase/tests/helpers';

const localDescribe = process.env.RUN_LOCAL_SUPABASE_TESTS === 'true' ? describe : describe.skip;

const ownerA = '00000000-0000-4000-8000-0000000000a1';
const managerA = '00000000-0000-4000-8000-0000000000a2';
const viewerA = '00000000-0000-4000-8000-0000000000a3';
const ownerB = '00000000-0000-4000-8000-0000000000b1';
const customerA = '10000000-0000-4000-8000-0000000000a1';
const customerB = '10000000-0000-4000-8000-0000000000b1';
const employeeA = '20000000-0000-4000-8000-0000000000a1';
const employeeB = '20000000-0000-4000-8000-0000000000b1';
const work = (suffix: string) => `30000000-0000-4000-8000-0000000000${suffix}`;

async function asUser<T>(userId: string, query: string, values: unknown[] = []) {
  const client = await getPool().connect();
  try {
    await client.query('begin');
    await client.query('set local role authenticated');
    await client.query(`select set_config('request.jwt.claim.sub', $1, true)`, [userId]);
    await client.query(`select set_config('request.jwt.claim.role', 'authenticated', true)`);
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

localDescribe.sequential('AI employee customer isolation and decision behavior', () => {
  beforeAll(async () => {
    const pool = getPool();
    await pool.query(`
      insert into auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at, confirmation_token, raw_app_meta_data, raw_user_meta_data)
      values
        ($1, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'owner-a@example.test', '', now(), now(), now(), '', '{}', '{}'),
        ($2, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'manager-a@example.test', '', now(), now(), now(), '', '{}', '{}'),
        ($3, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'viewer-a@example.test', '', now(), now(), now(), '', '{}', '{}'),
        ($4, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'owner-b@example.test', '', now(), now(), now(), '', '{}', '{}')
      on conflict (id) do nothing
    `, [ownerA, managerA, viewerA, ownerB]);
    await pool.query(`insert into public.customer_accounts (id, name) values ($1, 'Customer A'), ($2, 'Customer B')`, [customerA, customerB]);
    await pool.query(`
      insert into public.customer_memberships (customer_id, user_id, role)
      values ($1, $2, 'owner'), ($1, $3, 'manager'), ($1, $4, 'viewer'), ($5, $6, 'owner')
    `, [customerA, ownerA, managerA, viewerA, customerB, ownerB]);
    await pool.query(`insert into public.ai_employees (id, customer_id, name) values ($1, $2, 'Employee A'), ($3, $4, 'Employee B')`, [employeeA, customerA, employeeB, customerB]);
    await pool.query(`
      insert into public.ai_employee_work_items (id, employee_id, queue, scheduled_date, title, proposed_action, priority)
      values
        ($1, $2, 'morning', current_date, 'Owner decision', 'Review owner work', 1),
        ($3, $2, 'midday', current_date, 'Manager decision', 'Review manager work', 1),
        ($4, $2, 'evening', current_date, 'Viewer cannot decide', 'Review viewer work', 1),
        ($5, $2, 'morning', current_date + 1, 'Concurrent decision', 'Review concurrent work', 1)
    `, [work('a1'), employeeA, work('a2'), work('a3'), work('a4')]);
  });

  afterAll(async () => {
    const pool = getPool();
    await pool.query(`delete from public.customer_accounts where id in ($1, $2)`, [customerA, customerB]);
    await pool.query(`delete from auth.users where id in ($1, $2, $3, $4)`, [ownerA, managerA, viewerA, ownerB]);
    await closePool();
  });

  it('allows members to read only their own customer employee and work', async () => {
    const own = await asUser<{ id: string }>(viewerA, `select id from public.ai_employees`);
    const foreign = await asUser<{ id: string }>(ownerB, `select id from public.ai_employee_work_items where employee_id = $1`, [employeeA]);
    expect(own.map((row) => row.id)).toEqual([employeeA]);
    expect(foreign).toEqual([]);
  });

  it('allows owners and managers to decide while viewers and other customers are denied', async () => {
    await expect(asUser(ownerA, `select public.record_ai_employee_decision($1, 'approve', '', $2, null)`, [work('a1'), '40000000-0000-4000-8000-0000000000a1'])).resolves.toHaveLength(1);
    await expect(asUser(managerA, `select public.record_ai_employee_decision($1, 'reject', '', $2, null)`, [work('a2'), '40000000-0000-4000-8000-0000000000a2'])).resolves.toHaveLength(1);
    await expect(asUser(viewerA, `select public.record_ai_employee_decision($1, 'reject', '', $2, null)`, [work('a3'), '40000000-0000-4000-8000-0000000000a3'])).rejects.toThrow();
    await expect(asUser(ownerB, `select public.record_ai_employee_decision($1, 'reject', '', $2, null)`, [work('a3'), '40000000-0000-4000-8000-0000000000b1'])).rejects.toThrow();
  });

  it('returns exact retries and rejects changed replay details', async () => {
    const first = await asUser<{ result: { id: string; duplicate: boolean } }>(
      ownerA, `select public.record_ai_employee_decision($1, 'defer', 'Wait for Tuesday', $2, current_date + 2) as result`,
      [work('a3'), '40000000-0000-4000-8000-0000000000a4'],
    );
    const replay = await asUser<{ result: { id: string; duplicate: boolean } }>(
      ownerA, `select public.record_ai_employee_decision($1, 'defer', 'Wait for Tuesday', $2, current_date + 2) as result`,
      [work('a3'), '40000000-0000-4000-8000-0000000000a4'],
    );
    expect(replay[0].result).toMatchObject({ id: first[0].result.id, duplicate: true });
    await expect(asUser(
      ownerA, `select public.record_ai_employee_decision($1, 'defer', 'Changed instruction', $2, current_date + 2)`,
      [work('a3'), '40000000-0000-4000-8000-0000000000a4'],
    )).rejects.toThrow();
  });

  it('allows only one concurrent decision for a work-item version', async () => {
    const attempts = await Promise.allSettled([
      asUser(ownerA, `select public.record_ai_employee_decision($1, 'approve', '', $2, null)`, [work('a4'), '40000000-0000-4000-8000-0000000000c1']),
      asUser(managerA, `select public.record_ai_employee_decision($1, 'reject', '', $2, null)`, [work('a4'), '40000000-0000-4000-8000-0000000000c2']),
    ]);
    expect(attempts.filter((attempt) => attempt.status === 'fulfilled')).toHaveLength(1);
    expect(attempts.filter((attempt) => attempt.status === 'rejected')).toHaveLength(1);
  });

  it('enforces five unique priority slots per employee queue and date', async () => {
    const values = [1, 2, 3, 4, 5].map((priority) =>
      `('${crypto.randomUUID()}', '${employeeA}', 'evening', current_date + 5, 'Slot ${priority}', 'Review', ${priority})`,
    ).join(',');
    await getPool().query(`insert into public.ai_employee_work_items (id, employee_id, queue, scheduled_date, title, proposed_action, priority) values ${values}`);
    await expect(getPool().query(`
      insert into public.ai_employee_work_items (employee_id, queue, scheduled_date, title, proposed_action, priority)
      values ($1, 'evening', current_date + 5, 'Sixth item', 'Review', 5)
    `, [employeeA])).rejects.toThrow();
  });

  it('keeps history immutable to authenticated users and permits privileged customer cleanup', async () => {
    await expect(asUser(ownerA, `delete from public.ai_employee_decisions`)).rejects.toThrow();
    const cleanupCustomer = '10000000-0000-4000-8000-0000000000c1';
    const cleanupEmployee = '20000000-0000-4000-8000-0000000000c1';
    const cleanupWork = '30000000-0000-4000-8000-0000000000c1';
    await getPool().query(`insert into public.customer_accounts (id, name) values ($1, 'Cleanup')`, [cleanupCustomer]);
    await getPool().query(`insert into public.customer_memberships (customer_id, user_id, role) values ($1, $2, 'owner')`, [cleanupCustomer, ownerA]);
    await getPool().query(`insert into public.ai_employees (id, customer_id, name) values ($1, $2, 'Cleanup Employee')`, [cleanupEmployee, cleanupCustomer]);
    await getPool().query(`insert into public.ai_employee_work_items (id, employee_id, queue, title, proposed_action, priority) values ($1, $2, 'morning', 'Cleanup work', 'Review', 1)`, [cleanupWork, cleanupEmployee]);
    await asUser(ownerA, `select public.record_ai_employee_decision($1, 'approve', '', $2, null)`, [cleanupWork, '40000000-0000-4000-8000-0000000000d1']);
    await expect(getPool().query(`delete from public.customer_accounts where id = $1`, [cleanupCustomer])).resolves.toBeDefined();
  });
});
