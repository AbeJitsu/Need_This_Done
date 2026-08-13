import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { closePool, getPool } from '../../../supabase/tests/helpers';

const localDescribe = process.env.RUN_LOCAL_SUPABASE_TESTS === 'true' ? describe : describe.skip;
const operatorId = '00000000-0000-4000-0000-000000000082';
const profileId = '10000000-0000-4000-0000-000000000082';
const researchProfileId = '10000000-0000-4000-0000-000000000085';
const researchTaskId = '50000000-0000-4000-0000-000000000085';
const researchOwnerId = '00000000-0000-4000-0000-000000000085';

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

async function asPrivateWorker<T>(query: string, values: unknown[] = []) {
  const client = await getPool().connect();
  try {
    await client.query('begin');
    await client.query('set local role service_role');
    await client.query(`select set_config('request.jwt.claim.role', 'service_role', true)`);
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
    await pool.query(`delete from public.sender_events where provider_event_id = 'provider-event-082'`);
    await pool.query(`delete from public.suppression_records where normalized_address = 'jordan@example.com'`);
    await pool.query(`delete from public.worker_callback_nonces where nonce = 'private-worker-replay-085'`);
    await pool.query(`insert into auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at, confirmation_token, raw_app_meta_data, raw_user_meta_data) values ($1, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'prospecting-operator@example.test', '', now(), now(), now(), '', '{}', '{}') on conflict (id) do nothing`, [operatorId]);
    await pool.query(`insert into public.user_roles (user_id, role) values ($1, 'admin') on conflict (user_id) do update set role = 'admin'`, [operatorId]);
    await pool.query(`insert into auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at, confirmation_token, raw_app_meta_data, raw_user_meta_data) values ($1, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'prospecting-research-operator@example.test', '', now(), now(), now(), '', '{}', '{}') on conflict (id) do nothing`, [researchOwnerId]);
    await pool.query(`insert into public.user_roles (user_id, role) values ($1, 'admin') on conflict (user_id) do update set role = 'admin'`, [researchOwnerId]);
  });

  afterAll(async () => {
    await getPool().query(`delete from public.growth_profiles where id = $1`, [profileId]);
    await getPool().query(`delete from public.growth_profiles where id = $1`, [researchProfileId]);
    await getPool().query(`delete from public.user_roles where user_id = $1`, [researchOwnerId]);
    await getPool().query(`delete from auth.users where id = $1`, [researchOwnerId]);
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

  it('keeps dossier storage, provider usage records, replay nonces, and sender promotion on separate boundaries', async () => {
    await asOperator(`insert into public.growth_profiles (id, owner_id, target_market, geography, offer, sender_name, sender_email) values ($1, $2, 'service businesses', 'New York', 'a focused audit', null, null)`, [researchProfileId, researchOwnerId]);
    await expect(asOperator(`select public.pin_private_primary_model($1, 'browser-worker', 'provider/primary-2026', 'browser must not pin')`, [researchProfileId])).rejects.toThrow();
    const pinned = await asPrivateWorker<{ result: { model_route: string; selected_model_id: string } }>(`select public.pin_private_primary_model($1, 'mac-mini-test', 'provider/primary-2026', 'Explicitly approved test primary.') as result`, [researchProfileId]);
    expect(pinned[0].result).toMatchObject({ model_route: 'selected-primary', selected_model_id: 'provider/primary-2026' });
    await asOperator(`insert into public.agent_tasks (id, profile_id, task_type, input, idempotency_key) values ($1, $2, 'discover_prospects', '{"targetAcceptedDossiers":2}'::jsonb, $3)`, [researchTaskId, researchProfileId, '60000000-0000-4000-0000-000000000085']);

    await expect(asOperator(`select public.claim_private_prospecting_task('browser-worker', 300)`)).rejects.toThrow();
    const claimed = await asPrivateWorker<{ task: { id: string; status: string } }>(`select public.claim_private_prospecting_task('mac-mini-test', 300) as task`);
    expect(claimed[0].task).toMatchObject({ id: researchTaskId, status: 'leased' });

    const firstReservation = await asPrivateWorker<{ reservation: { status: string } }>(`select public.reserve_private_model_usage($1, $2, 'mac-mini-test', $3, 'research', 'provider/primary-2026', 0.10) as reservation`, [researchProfileId, researchTaskId, '70000000-0000-4000-0000-000000000085']);
    expect(firstReservation[0].reservation.status).toBe('reserved');
    await asPrivateWorker(`select public.reserve_private_model_usage($1, $2, 'mac-mini-test', $3, 'research', 'provider/primary-2026', 0.10)`, [researchProfileId, researchTaskId, '70000000-0000-4000-0000-000000000086']);
    const thirdReservation = await asPrivateWorker<{ reservation: { status: string; reserved_cost: number } }>(`select public.reserve_private_model_usage($1, $2, 'mac-mini-test', $3, 'research', 'provider/primary-2026', 0.60) as reservation`, [researchProfileId, researchTaskId, '70000000-0000-4000-0000-000000000087']);
    expect(thirdReservation[0].reservation.status).toBe('reserved');
    expect(Number(thirdReservation[0].reservation.reserved_cost)).toBe(0.60);

    const dossier = {
      companyName: 'Citation-backed Studio',
      officialWebsite: 'https://citation-backed.example',
      icpReason: 'Public business information fits the service-business profile.',
      observedEvidence: [{ claim: 'The public website identifies a local studio.', citationUrls: ['https://citation-backed.example/about'] }],
      citations: [{ url: 'https://citation-backed.example/about', title: 'About Citation-backed Studio', excerpt: 'The studio describes its public services.' }],
      recommendedOfferAngle: 'Offer a focused conversion-path review.',
      contactPath: { type: 'email', value: 'Public business email', email: 'research-prospect@example.test' },
      suggestedOutreach: { subject: 'A focused conversion-path idea', body: 'This remains a human-reviewed draft.' },
    };
    const stored = await asPrivateWorker<{ result: { duplicate: boolean; id: string } }>(`select public.record_private_prospect_dossier($1, 'mac-mini-test', 'provider/primary-2026', $2::jsonb) as result`, [researchTaskId, JSON.stringify(dossier)]);
    expect(stored[0].result.duplicate).toBe(false);
    const duplicate = await asPrivateWorker<{ result: { duplicate: boolean } }>(`select public.record_private_prospect_dossier($1, 'mac-mini-test', 'provider/primary-2026', $2::jsonb) as result`, [researchTaskId, JSON.stringify(dossier)]);
    expect(duplicate[0].result.duplicate).toBe(true);

    await expect(asOperator(`select public.promote_prospect_dossier($1)`, [stored[0].result.id])).rejects.toThrow('dossier_promotion_not_allowed');
    await asPrivateWorker(`insert into public.worker_callback_nonces (nonce) values ('private-worker-replay-085')`);
    await expect(asPrivateWorker(`insert into public.worker_callback_nonces (nonce) values ('private-worker-replay-085')`)).rejects.toThrow();

    await asOperator(`update public.growth_profiles set emergency_stop = true where id = $1`, [researchProfileId]);
    await expect(asPrivateWorker(`select public.reserve_private_model_usage($1, $2, 'mac-mini-test', $3, 'research', 'provider/primary-2026', 0.01)`, [researchProfileId, researchTaskId, '70000000-0000-4000-0000-000000000088'])).rejects.toThrow('research_not_operational');
  });
});
