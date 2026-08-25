import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { closePool, getPool } from '../../../supabase/tests/helpers';

const localDescribe = process.env.RUN_LOCAL_SUPABASE_TESTS === 'true' ? describe : describe.skip;
const ownerId = '00000000-0000-4000-8000-000000000107';
const otherOwnerId = '00000000-0000-4000-8000-000000000108';
const workerId = 'daily-desk-mac-mini-test';

async function asOperator<T>(userId: string, query: string, values: unknown[] = []) {
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

async function asDeskWorker<T>(query: string, values: unknown[] = []) {
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
  } finally {
    client.release();
  }
}

const prospectPayload = [
  {
    companyName: 'Northstar Operations',
    officialWebsite: 'https://northstar-operations.example',
    role: 'Operations consultant',
    contactPath: 'https://northstar-operations.example/contact',
    observedEvidence: [{ claim: 'The firm works with local owner-led companies.', citationUrls: ['https://northstar-operations.example/about'] }],
    citations: [{ url: 'https://northstar-operations.example/about', title: 'About Northstar', excerpt: 'Public operations consulting details.' }],
    draftSubject: 'A conversion-clarity observation',
    draftBody: 'This is an approval-ready manual draft only.',
  },
  {
    companyName: 'Harbor Business Systems',
    officialWebsite: 'https://harbor-business-systems.example',
    role: 'Business consultant',
    contactPath: 'https://harbor-business-systems.example/contact',
    observedEvidence: [{ claim: 'The firm advises nearby small businesses.', citationUrls: ['https://harbor-business-systems.example/services'] }],
    citations: [{ url: 'https://harbor-business-systems.example/services', title: 'Services', excerpt: 'Public business systems consulting details.' }],
    draftSubject: 'A contained website-fix thought',
    draftBody: 'This is an approval-ready manual draft only.',
  },
];

localDescribe.sequential('Daily Desk durable boundary', () => {
  let briefId = '';
  let runId = '';
  let followUpId = '';
  let socialAssetId = '';

  beforeAll(async () => {
    const pool = getPool();
    for (const [id, email] of [[ownerId, 'daily-desk-owner@example.test'], [otherOwnerId, 'daily-desk-other@example.test']] as const) {
      await pool.query(`insert into auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at, confirmation_token, raw_app_meta_data, raw_user_meta_data)
        values ($1, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', $2, '', now(), now(), now(), '', '{}', '{}')
        on conflict (id) do nothing`, [id, email]);
      await pool.query(`insert into public.user_roles (user_id, role) values ($1, 'admin') on conflict (user_id) do update set role = 'admin'`, [id]);
    }
  });

  afterAll(async () => {
    const pool = getPool();
    await pool.query(`delete from public.daily_desk_outcomes where owner_id in ($1, $2)`, [ownerId, otherOwnerId]);
    await asDeskWorker(`delete from public.daily_desk_decisions where owner_id in ($1, $2)`, [ownerId, otherOwnerId]);
    await pool.query(`delete from public.daily_desk_cost_reservations where owner_id in ($1, $2)`, [ownerId, otherOwnerId]);
    await asDeskWorker(`delete from public.daily_desk_social_asset_versions where owner_id in ($1, $2)`, [ownerId, otherOwnerId]);
    await pool.query(`delete from public.daily_desk_social_assets where owner_id in ($1, $2)`, [ownerId, otherOwnerId]);
    await pool.query(`delete from public.daily_desk_follow_ups where owner_id in ($1, $2)`, [ownerId, otherOwnerId]);
    await pool.query(`delete from public.daily_desk_prospect_cards where owner_id in ($1, $2)`, [ownerId, otherOwnerId]);
    await pool.query(`delete from public.daily_desk_runs where owner_id in ($1, $2)`, [ownerId, otherOwnerId]);
    await pool.query(`delete from public.daily_desk_operating_briefs where owner_id in ($1, $2)`, [ownerId, otherOwnerId]);
    await pool.query(`delete from public.user_roles where user_id in ($1, $2)`, [ownerId, otherOwnerId]);
    await pool.query(`delete from auth.users where id in ($1, $2)`, [ownerId, otherOwnerId]);
    await closePool();
  });

  it('versions owner setup, creates one idempotent local-day run, and isolates it from another operator', async () => {
    const brief = await asOperator<{ result: { id: string; revision: number } }>(ownerId,
      `select public.create_daily_desk_operating_brief($1, $2, $3, $4, $5) as result`,
      ['Boston, Massachusetts', 'Website Fix', 'Local business & operations consultants', 'Conversion clarity and qualified sales conversations', 'America/New_York']);
    briefId = brief[0].result.id;
    expect(brief[0].result.revision).toBe(1);

    const localDate = await getPool().query<{ local_date: string }>(`select (now() at time zone 'America/New_York')::date::text as local_date`);
    const first = await asOperator<{ result: { id: string; duplicate: boolean } }>(ownerId,
      `select public.prepare_daily_desk_run($1, $2::date) as result`, [ownerId, localDate.rows[0].local_date]);
    const replay = await asOperator<{ result: { id: string; duplicate: boolean } }>(ownerId,
      `select public.prepare_daily_desk_run($1, $2::date) as result`, [ownerId, localDate.rows[0].local_date]);
    runId = first[0].result.id;
    expect(first[0].result.duplicate).toBe(false);
    expect(replay[0].result).toMatchObject({ id: runId, duplicate: true });

    expect(await asOperator<{ id: string }>(otherOwnerId, `select id from public.daily_desk_runs where id = $1`, [runId])).toEqual([]);
    await expect(asOperator(otherOwnerId, `select public.prepare_daily_desk_run($1, $2::date)`, [ownerId, localDate.rows[0].local_date])).rejects.toThrow('daily_desk_owner_required');
  });

  it('allows only the signed worker to claim a run, reserve cost, and create exactly two public-evidence cards', async () => {
    await expect(asOperator(ownerId, `select public.claim_daily_desk_run($1, $2, 300)`, [ownerId, workerId])).rejects.toThrow(/permission denied|daily_desk_worker_required/);
    const claimed = await asDeskWorker<{ result: { id: string; status: string } }>(`select public.claim_daily_desk_run($1, $2, 300) as result`, [ownerId, workerId]);
    expect(claimed[0].result).toMatchObject({ id: runId, status: 'leased' });

    const reservationKey = '00000000-0000-4000-8000-000000000701';
    await asDeskWorker(
      `select public.record_daily_desk_model_route($1, $2, $3, $4, $5, $6::jsonb, $7)`,
      [ownerId, runId, workerId, 'provider/quality-priced', 0.12,
        JSON.stringify({ require_parameters: true, data_collection: 'deny', zdr: true, allow_fallbacks: false }),
        'quality-approved and price-known test candidate'],
    );
    const reserved = await asDeskWorker<{ result: { status: string } }>(
      `select public.reserve_daily_desk_cost($1, $2, $3, $4, $5, $6, $7, $8::jsonb, $9) as result`,
      [ownerId, runId, workerId, reservationKey, 'provider/quality-priced', 0.12, 0.12,
        JSON.stringify({ require_parameters: true, data_collection: 'deny', zdr: true, allow_fallbacks: false }),
        'quality-approved and price-known test candidate'],
    );
    expect(reserved[0].result.status).toBe('reserved');
    await expect(asDeskWorker(
      `select public.reserve_daily_desk_cost($1, $2, $3, $4, $5, $6, $7, $8::jsonb, $9)`,
      [ownerId, runId, workerId, '00000000-0000-4000-8000-000000000706', 'provider/quality-priced', 0.12, 0.12,
        JSON.stringify({ require_parameters: true, data_collection: 'deny', zdr: true, allow_fallbacks: false, extra: true }), 'quality-approved and price-known test candidate'],
    )).rejects.toThrow('daily_desk_model_route_unverified');
    for (const key of ['00000000-0000-4000-8000-000000000711', '00000000-0000-4000-8000-000000000712', '00000000-0000-4000-8000-000000000713', '00000000-0000-4000-8000-000000000714', '00000000-0000-4000-8000-000000000715']) {
      await asDeskWorker(
        `select public.reserve_daily_desk_cost($1, $2, $3, $4, $5, $6, $7, $8::jsonb, $9)`,
        [ownerId, runId, workerId, key, 'provider/quality-priced', 0.12, 0.12,
          JSON.stringify({ require_parameters: true, data_collection: 'deny', zdr: true, allow_fallbacks: false }), 'quality-approved and price-known test candidate'],
      );
    }
    await expect(asDeskWorker(
      `select public.reserve_daily_desk_cost($1, $2, $3, $4, $5, $6, $7, $8::jsonb, $9)`,
      [ownerId, runId, workerId, '00000000-0000-4000-8000-000000000716', 'provider/quality-priced', 0.12, 0.12,
        JSON.stringify({ require_parameters: true, data_collection: 'deny', zdr: true, allow_fallbacks: false }), 'quality-approved and price-known test candidate'],
    )).rejects.toThrow('daily_desk_budget_exceeded');

    await asDeskWorker(`select public.reconcile_daily_desk_cost($1, $2::numeric, $3::jsonb)`, [reservationKey, 0.10, JSON.stringify({ prompt_tokens: 100, completion_tokens: 50, cost: 0.10 })]);
    await asDeskWorker(
      `select public.complete_daily_desk_run($1, $2, 'succeeded', $3::jsonb, null, $4, $5, $6::jsonb)`,
      [runId, workerId, JSON.stringify(prospectPayload), reservationKey, 'provider/quality-priced', JSON.stringify({ cost: 0.10 })],
    );
    const cards = await asOperator<{ id: string }>(ownerId, `select id from public.daily_desk_prospect_cards where run_id = $1 order by company_name`, [runId]);
    expect(cards).toHaveLength(2);
    const followUps = await asOperator<{ id: string; state: string }>(ownerId, `select id, state from public.daily_desk_follow_ups where run_id = $1 order by created_at`, [runId]);
    expect(followUps).toHaveLength(2);
    expect(followUps.every((row) => row.state === 'draft')).toBe(true);
    followUpId = followUps[0].id;
  });

  it('records immutable manual follow-up decisions without creating a provider operation', async () => {
    const before = await getPool().query<{ count: string }>(`select count(*)::text as count from public.provider_operations`);
    const decisionKey = '00000000-0000-4000-8000-000000000703';
    const result = await asOperator<{ result: { state: string; duplicate: boolean } }>(ownerId,
      `select public.record_daily_desk_follow_up_decision($1, 'ready', '', '', null, 'Ready for a human to copy manually.', $2) as result`,
      [followUpId, decisionKey]);
    expect(result[0].result).toMatchObject({ state: 'ready', duplicate: false });
    const replay = await asOperator<{ result: { duplicate: boolean } }>(ownerId,
      `select public.record_daily_desk_follow_up_decision($1, 'ready', '', '', null, 'Ready for a human to copy manually.', $2) as result`,
      [followUpId, decisionKey]);
    expect(replay[0].result.duplicate).toBe(true);
    await expect(getPool().query(`update public.daily_desk_decisions set note = 'tampered' where id = (select id from public.daily_desk_decisions where owner_id = $1 limit 1)`, [ownerId])).rejects.toThrow('daily_desk_decisions_are_immutable');
    const after = await getPool().query<{ count: string }>(`select count(*)::text as count from public.provider_operations`);
    expect(after.rows[0].count).toBe(before.rows[0].count);
  });

  it('keeps private social versions owner-scoped, revisioned, and ready only for manual posting while outcomes track qualified conversations', async () => {
    const asset = await asOperator<{ result: { id: string } }>(ownerId,
      `select public.ensure_daily_desk_social_asset($1) as result`, [runId]);
    socialAssetId = asset[0].result.id;
    const versionId = '00000000-0000-4000-8000-000000000704';
    const storagePath = `daily-desk/${ownerId}/${socialAssetId}/${versionId}.svg`;
    const version = await asOperator<{ result: { id: string; version_number: number } }>(ownerId,
      `select public.record_daily_desk_social_version($1, $2, $3, $4, $5, $6, $7::jsonb) as result`,
      [socialAssetId, versionId, storagePath, 'Private manual-posting caption.', 'Private neutral graphic alt text.', 'a'.repeat(64), JSON.stringify({ width: 1080, height: 1350, format: 'svg' })]);
    expect(version[0].result).toMatchObject({ id: versionId, version_number: 1 });
    expect(await asOperator<{ id: string }>(otherOwnerId, `select id from public.daily_desk_social_asset_versions where id = $1`, [versionId])).toEqual([]);

    const revised = await asOperator<{ result: { status: string } }>(ownerId,
      `select public.record_daily_desk_social_decision($1, 'revise', 'Tighten the caption.', $2) as result`, [socialAssetId, '00000000-0000-4000-8000-000000000705']);
    expect(revised[0].result.status).toBe('draft');
    const approved = await asOperator<{ result: { status: string } }>(ownerId,
      `select public.record_daily_desk_social_decision($1, 'approve', 'Ready for manual posting only.', $2) as result`, [socialAssetId, '00000000-0000-4000-8000-000000000707']);
    expect(approved[0].result.status).toBe('ready_for_manual_posting');
    const rejected = await asOperator<{ result: { status: string } }>(ownerId,
      `select public.record_daily_desk_social_decision($1, 'reject', 'Hold this version.', $2) as result`, [socialAssetId, '00000000-0000-4000-8000-000000000708']);
    expect(rejected[0].result.status).toBe('rejected');

    const cards = await asOperator<{ prospect_card_id: string }>(ownerId, `select prospect_card_id from public.daily_desk_follow_ups where id = $1`, [followUpId]);
    const outcome = await asOperator<{ result: { outcome_type: string; duplicate: boolean } }>(ownerId,
      `select public.record_daily_desk_outcome($1, $2, 'qualified_sales_conversation', 'The prospect agreed to a qualified sales conversation.', now(), $3) as result`,
      [cards[0].prospect_card_id, followUpId, '00000000-0000-4000-8000-000000000709']);
    expect(outcome[0].result).toMatchObject({ outcome_type: 'qualified_sales_conversation', duplicate: false });
  });

  it('records missing provider cost as a durable fail-closed ledger state', async () => {
    await asOperator(otherOwnerId,
      `select public.create_daily_desk_operating_brief($1, $2, $3, $4, $5)`,
      ['Providence, Rhode Island', 'Website Fix', 'Local business & operations consultants', 'Conversion clarity', 'America/New_York']);
    const localDate = await getPool().query<{ local_date: string }>(`select (now() at time zone 'America/New_York')::date::text as local_date`);
    const run = await asOperator<{ result: { id: string } }>(otherOwnerId,
      `select public.prepare_daily_desk_run($1, $2::date) as result`, [otherOwnerId, localDate.rows[0].local_date]);
    const missingCostRunId = run[0].result.id;
    await asDeskWorker(`select public.claim_daily_desk_run($1, $2, 300)`, [otherOwnerId, workerId]);
    await asDeskWorker(
      `select public.record_daily_desk_model_route($1, $2, $3, $4, $5, $6::jsonb, $7)`,
      [otherOwnerId, missingCostRunId, workerId, 'provider/quality-priced', 0.01,
        JSON.stringify({ require_parameters: true, data_collection: 'deny', zdr: true, allow_fallbacks: false }), 'quality-approved test candidate'],
    );
    const reservationKey = '00000000-0000-4000-8000-000000000710';
    await asDeskWorker(
      `select public.reserve_daily_desk_cost($1, $2, $3, $4, $5, $6, $7, $8::jsonb, $9)`,
      [otherOwnerId, missingCostRunId, workerId, reservationKey, 'provider/quality-priced', 0.01, 0.01,
        JSON.stringify({ require_parameters: true, data_collection: 'deny', zdr: true, allow_fallbacks: false }), 'quality-approved test candidate'],
    );
    const reconciled = await asDeskWorker<{ result: { status: string } }>(
      `select public.reconcile_daily_desk_cost($1, null, '{}'::jsonb) as result`, [reservationKey]);
    expect(reconciled[0].result.status).toBe('actual_cost_missing');
    await asDeskWorker(
      `select public.complete_daily_desk_run($1, $2, 'failed', '[]'::jsonb, null, $3, $4, '{}'::jsonb)`,
      [missingCostRunId, workerId, reservationKey, 'provider/quality-priced'],
    );
    const failedRun = await asOperator<{ status: string }>(otherOwnerId, `select status from public.daily_desk_runs where id = $1`, [missingCostRunId]);
    expect(failedRun[0].status).toBe('failed');
  });
});
