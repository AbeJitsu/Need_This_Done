import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { closePool, getPool } from '../../../supabase/tests/helpers';

const localDescribe = process.env.RUN_LOCAL_SUPABASE_TESTS === 'true' ? describe : describe.skip;
const operatorId = '00000000-0000-4000-0000-000000000082';
const profileId = '10000000-0000-4000-0000-000000000082';

async function asOperator<T>(query: string, values: unknown[] = []) {
  const client = await getPool().connect();
  try {
    await client.query('begin');
    await client.query('set local role authenticated');
    await client.query(`select set_config('request.jwt.claim.sub', $1, true)`, [operatorId]);
    await client.query(`select set_config('request.jwt.claim.role', 'authenticated', true)`);
    const result = await client.query(query, values);
    await client.query('commit');
    return result.rows as T[];
  } catch (error) {
    await client.query('rollback');
    throw error;
  } finally { client.release(); }
}

localDescribe.sequential('prospecting approval and suppression boundary', () => {
  beforeAll(async () => {
    const pool = getPool();
    await pool.query(`insert into auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at, confirmation_token, raw_app_meta_data, raw_user_meta_data) values ($1, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'prospecting-operator@example.test', '', now(), now(), now(), '', '{}', '{}') on conflict (id) do nothing`, [operatorId]);
    await pool.query(`insert into public.user_roles (user_id, role) values ($1, 'admin') on conflict (user_id) do update set role = 'admin'`, [operatorId]);
  });

  afterAll(async () => {
    await getPool().query(`delete from public.growth_profiles where id = $1`, [profileId]);
    await getPool().query(`delete from public.user_roles where user_id = $1`, [operatorId]);
    await getPool().query(`delete from auth.users where id = $1`, [operatorId]);
    await closePool();
  });

  it('deduplicates, requires approval, and suppresses a bounced address', async () => {
    await asOperator(`insert into public.growth_profiles (id, owner_id, target_market, geography, offer, sender_name, sender_email) values ($1, $2, 'service businesses', 'New York', 'a focused audit', 'Abe', 'abe@example.test')`, [profileId, operatorId]);
    const prospect = await asOperator<{ result: { id: string; duplicate: boolean } }>(`select public.upsert_discovered_prospect($1, 'Example Studio', 'Jordan', 'Owner', 'Jordan@Example.com', 'https://example.com', 86, 'Public evidence supports the fit.', 'https://example.com/about', '["Public about page"]'::jsonb, 'Public email', 'public', $2) as result`, [profileId, '20000000-0000-4000-0000-000000000082']);
    const duplicate = await asOperator<{ result: { id: string; duplicate: boolean } }>(`select public.upsert_discovered_prospect($1, 'Example Studio', 'Jordan', 'Owner', 'jordan@example.com', 'https://example.com', 86, 'Same public evidence.', 'https://example.com/about', '["Updated evidence"]'::jsonb, 'Public email', 'public', $2) as result`, [profileId, '30000000-0000-4000-0000-000000000082']);
    expect(prospect[0].result.duplicate).toBe(false);
    expect(duplicate[0].result).toMatchObject({ id: prospect[0].result.id, duplicate: true });

    const message = await asOperator<{ id: string }>(`insert into public.outreach_messages (prospect_id, profile_id, subject, body, sender_email, recipient_email, personalization_evidence, idempotency_key) values ($1, $2, 'Subject', 'Body', 'abe@example.test', 'jordan@example.com', '["Public about page"]'::jsonb, $3) returning id`, [prospect[0].result.id, profileId, '40000000-0000-4000-0000-000000000082']);
    const approved = await asOperator<{ result: { approval_status: string } }>(`select public.record_outreach_decision($1, 'approve', '', '', null) as result`, [message[0].id]);
    expect(approved[0].result.approval_status).toBe('approved');
    const event = await asOperator<{ result: { duplicate: boolean } }>(`select public.record_sender_event('provider-event-082', 'bounced', '', 'JORDAN@example.com', '{}'::jsonb, now()) as result`);
    const replay = await asOperator<{ result: { duplicate: boolean } }>(`select public.record_sender_event('provider-event-082', 'bounced', '', 'JORDAN@example.com', '{}'::jsonb, now()) as result`);
    expect(event[0].result.duplicate).toBe(false);
    expect(replay[0].result.duplicate).toBe(true);
    const suppression = await getPool().query(`select normalized_address, reason from public.suppression_records where normalized_address = 'jordan@example.com'`);
    expect(suppression.rows).toEqual([{ normalized_address: 'jordan@example.com', reason: 'bounce' }]);
  });
});
