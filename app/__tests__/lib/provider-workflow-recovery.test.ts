import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { closePool, getPool } from '../../../supabase/tests/helpers';

const localDescribe = process.env.RUN_LOCAL_SUPABASE_TESTS === 'true' ? describe : describe.skip;

const operatorId = '00000000-0000-4000-8000-000000000106';
const projectId = '10000000-0000-4000-8000-000000000106';
const handoffId = '20000000-0000-4000-8000-000000000106';
const profileId = '30000000-0000-4000-8000-000000000106';
const prospectId = '40000000-0000-4000-8000-000000000106';
const messageId = '50000000-0000-4000-8000-000000000106';
const webhookEventId = 'provider-workflow-recovery-106';
const payloadHash = 'a'.repeat(64);

async function asRole<T>(role: 'anon' | 'authenticated' | 'service_role', query: string, values: unknown[] = []) {
  const client = await getPool().connect();
  try {
    await client.query('begin');
    await client.query(`set local role ${role}`);
    await client.query(`select set_config('request.jwt.claim.role', $1, true)`, [role]);
    if (role === 'authenticated') {
      await client.query(`select set_config('request.jwt.claim.sub', $1, true)`, [operatorId]);
    }
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

localDescribe.sequential('provider workflow recovery links', () => {
  beforeAll(async () => {
    const pool = getPool();
    await pool.query(`delete from public.resend_transactional_events where receipt_id in (
      select id from public.provider_webhook_receipts where provider_event_id = $1
    )`, [webhookEventId]);
    await pool.query(`delete from public.provider_webhook_receipts where provider_event_id = $1`, [webhookEventId]);
    await pool.query(`delete from public.project_github_handoffs where id = $1`, [handoffId]);
    await pool.query(`delete from public.outreach_messages where id = $1`, [messageId]);
    await pool.query(`delete from public.resend_transactional_messages where operation_id in (
      select id from public.provider_operations
      where idempotency_key like 'recovery-106-%'
        or request_metadata->>'handoff_id' = $1
        or request_metadata->>'message_id' = $2
    )`, [handoffId, messageId]);
    await pool.query(`delete from public.provider_operations
      where idempotency_key like 'recovery-106-%'
        or request_metadata->>'handoff_id' = $1
        or request_metadata->>'message_id' = $2`, [handoffId, messageId]);
    await pool.query(`delete from public.projects where id = $1`, [projectId]);
    await pool.query(`delete from public.growth_profiles where id = $1`, [profileId]);
    await pool.query(`delete from public.user_roles where user_id = $1`, [operatorId]);
    await pool.query(`delete from auth.users where id = $1`, [operatorId]);

    await pool.query(`insert into auth.users (
      id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, confirmation_token, raw_app_meta_data, raw_user_meta_data
    ) values (
      $1, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
      'provider-recovery@example.test', '', now(), now(), now(), '', '{}', '{}'
    )`, [operatorId]);
    await pool.query(`insert into public.user_roles (user_id, role) values ($1, 'admin')`, [operatorId]);
    await pool.query(`insert into public.projects (id, name, email, company, message, user_id)
      values ($1, 'Provider recovery', 'operator@example.test', 'NeedThisDone', 'Local database proof', $2)`,
    [projectId, operatorId]);
    await pool.query(`insert into public.growth_profiles (
      id, owner_id, target_market, geography, offer, sender_name, sender_email
    ) values ($1, $2, 'service businesses', 'New York', 'Website Fix', 'Abe', 'abe@example.test')`,
    [profileId, operatorId]);
    await pool.query(`insert into public.prospects (
      id, profile_id, company_name, contact_name, email, website_url, deduplication_key
    ) values ($1, $2, 'Example Studio', 'Jordan', 'jordan@example.test', 'https://example.test', 'recovery-106-prospect')`,
    [prospectId, profileId]);
  });

  afterAll(async () => {
    const pool = getPool();
    await pool.query(`delete from public.resend_transactional_events where receipt_id in (
      select id from public.provider_webhook_receipts where provider_event_id = $1
    )`, [webhookEventId]);
    await pool.query(`delete from public.provider_webhook_receipts where provider_event_id = $1`, [webhookEventId]);
    await pool.query(`delete from public.project_github_handoffs where id = $1`, [handoffId]);
    await pool.query(`delete from public.outreach_messages where id = $1`, [messageId]);
    await pool.query(`delete from public.resend_transactional_messages where operation_id in (
      select id from public.provider_operations
      where idempotency_key like 'recovery-106-%'
        or request_metadata->>'handoff_id' = $1
        or request_metadata->>'message_id' = $2
    )`, [handoffId, messageId]);
    await pool.query(`delete from public.provider_operations
      where idempotency_key like 'recovery-106-%'
        or request_metadata->>'handoff_id' = $1
        or request_metadata->>'message_id' = $2`, [handoffId, messageId]);
    await pool.query(`delete from public.projects where id = $1`, [projectId]);
    await pool.query(`delete from public.growth_profiles where id = $1`, [profileId]);
    await pool.query(`delete from public.user_roles where user_id = $1`, [operatorId]);
    await pool.query(`delete from auth.users where id = $1`, [operatorId]);
    await closePool();
  });

  it('links every new handoff and outreach message to one safe durable operation', async () => {
    await asRole('service_role', `insert into public.project_github_handoffs (
      id, project_id, github_url, note, created_by, notification_status,
      notification_idempotency_key
    ) values ($1, $2, 'https://github.com/example/private-repository', 'Do not persist this note in provider metadata.', $3, 'draft', $4)`,
    [handoffId, projectId, operatorId, '60000000-0000-4000-8000-000000000106']);
    await asRole('authenticated', `insert into public.outreach_messages (
      id, prospect_id, profile_id, subject, body, personalization_evidence,
      sender_email, recipient_email, idempotency_key
    ) values ($1, $2, $3, 'Private subject', 'Private body', '[]'::jsonb,
      'abe@example.test', 'jordan@example.test', $4)`,
    [messageId, prospectId, profileId, '70000000-0000-4000-8000-000000000106']);

    const links = await getPool().query<{
      domain: string;
      operation_count: number;
      provider: string;
      operation_type: string;
      request_metadata: Record<string, string>;
    }>(`select 'handoff' as domain, count(operation.id)::int as operation_count,
        min(operation.provider) as provider, min(operation.operation_type) as operation_type,
        min(operation.request_metadata::text)::jsonb as request_metadata
      from public.project_github_handoffs handoff
      join public.provider_operations operation on operation.id = handoff.notification_operation_id
      where handoff.id = $1
      union all
      select 'outreach', count(operation.id)::int, min(operation.provider), min(operation.operation_type),
        min(operation.request_metadata::text)::jsonb
      from public.outreach_messages message
      join public.provider_operations operation on operation.id = message.provider_operation_id
      where message.id = $2
      order by domain`, [handoffId, messageId]);

    expect(links.rows).toEqual([
      {
        domain: 'handoff',
        operation_count: 1,
        provider: 'resend_transactional',
        operation_type: 'github_handoff_notification',
        request_metadata: { handoff_id: handoffId, project_id: projectId },
      },
      {
        domain: 'outreach',
        operation_count: 1,
        provider: 'resend_prospecting',
        operation_type: 'send_outreach_message',
        request_metadata: { message_id: messageId, profile_id: profileId, prospect_id: prospectId },
      },
    ]);
    expect(JSON.stringify(links.rows)).not.toContain('example.test');
    expect(JSON.stringify(links.rows)).not.toContain('Private');
  });

  it('denies provider records and recovery functions to browser roles', async () => {
    const operation = await getPool().query<{ id: string }>(
      `select notification_operation_id as id from public.project_github_handoffs where id = $1`,
      [handoffId],
    );
    await expect(asRole('authenticated', `select id from public.provider_operations limit 1`)).rejects.toThrow();
    await expect(asRole('anon', `select id from public.provider_webhook_receipts limit 1`)).rejects.toThrow();
    await expect(asRole('authenticated', `select public.assert_provider_operation_retryable($1)`,
      [operation.rows[0].id])).rejects.toThrow();
    await expect(asRole('authenticated', `select public.reconcile_resend_provider_operation(
      $1, 'confirmed_not_accepted', null
    )`, [operation.rows[0].id])).rejects.toThrow();
  });

  it('keeps request metadata immutable and rejects mismatched replays', async () => {
    const first = await asRole<{ result: { id: string; status: string } }>('service_role', `select public.upsert_provider_operation(
      'resend_transactional', 'send_email', 'recovery-106-immutable', 'pending', null,
      '{"domain_reference":"safe-reference"}'::jsonb, '{}'::jsonb, null
    ) as result`);
    const replay = await asRole<{ result: { id: string; status: string } }>('service_role', `select public.upsert_provider_operation(
      'resend_transactional', 'send_email', 'recovery-106-immutable', 'failed_retryable', null,
      '{"domain_reference":"safe-reference"}'::jsonb, '{}'::jsonb, 'local fake failure'
    ) as result`);
    expect(replay[0].result).toMatchObject({ id: first[0].result.id, status: 'failed_retryable' });
    await expect(asRole('service_role', `select public.upsert_provider_operation(
      'resend_transactional', 'send_email', 'recovery-106-immutable', 'pending', null,
      '{"domain_reference":"changed"}'::jsonb, '{}'::jsonb, null
    )`)).rejects.toThrow('provider_operation_replay_mismatch');
    await expect(getPool().query(`update public.provider_operations
      set request_metadata = '{"domain_reference":"direct-change"}'::jsonb
      where id = $1`, [first[0].result.id])).rejects.toThrow('provider_operation_request_immutable');
    await expect(asRole('service_role', `select public.upsert_provider_operation(
      'resend_transactional', 'different_action', 'recovery-106-immutable', 'pending', null,
      '{"domain_reference":"safe-reference"}'::jsonb, '{}'::jsonb, null
    )`)).rejects.toThrow('provider_operation_replay_mismatch');
  });

  it('rolls back provider acceptance when the handoff transition cannot commit', async () => {
    const handoff = await getPool().query<{ notification_operation_id: string }>(
      `select notification_operation_id from public.project_github_handoffs where id = $1`, [handoffId],
    );
    await asRole('service_role', `select public.upsert_provider_operation(
      'resend_transactional', 'send_email', 'recovery-106-collision', 'pending', null,
      '{"domain_reference":"collision"}'::jsonb, '{}'::jsonb, null
    )`);
    const collision = await getPool().query<{ id: string }>(
      `select id from public.provider_operations where idempotency_key = 'recovery-106-collision'`,
    );
    await asRole('service_role', `select public.accept_resend_transactional_operation(
      $1, $2, 'collision-hash', 'Collision subject', 'resend-message-collision-106'
    )`, [collision.rows[0].id, projectId]);

    await expect(asRole('service_role', `select public.accept_github_handoff_operation(
      $1, $2, 'handoff-recipient-hash', 'Your GitHub handoff', 'resend-message-collision-106'
    )`, [handoff.rows[0].notification_operation_id, handoffId])).rejects.toThrow();

    const unchanged = await getPool().query<{ operation_status: string; notification_status: string }>(
      `select operation.status as operation_status, handoff.notification_status
       from public.project_github_handoffs handoff
       join public.provider_operations operation on operation.id = handoff.notification_operation_id
       where handoff.id = $1`, [handoffId],
    );
    expect(unchanged.rows[0]).toEqual({ operation_status: 'pending', notification_status: 'draft' });

    const accepted = await asRole<{ result: { notification_status: string; notification_provider_id: string } }>(
      'service_role',
      `select public.accept_github_handoff_operation(
        $1, $2, 'handoff-recipient-hash', 'Your GitHub handoff', 'resend-message-handoff-106'
      ) as result`,
      [handoff.rows[0].notification_operation_id, handoffId],
    );
    expect(accepted[0].result).toMatchObject({
      notification_status: 'sent',
      notification_provider_id: 'resend-message-handoff-106',
    });
    await expect(asRole('service_role', `select public.accept_github_handoff_operation(
      $1, $2, 'changed-hash', 'Your GitHub handoff', 'resend-message-handoff-106'
    )`, [handoff.rows[0].notification_operation_id, handoffId])).rejects.toThrow('github_handoff_acceptance_mismatch');
  });

  it('commits prospecting acceptance and its outreach transition together', async () => {
    const message = await getPool().query<{ provider_operation_id: string }>(
      `select provider_operation_id from public.outreach_messages where id = $1`, [messageId],
    );
    await expect(asRole('service_role', `select public.accept_resend_prospecting_operation(
      $1, $2, 'resend-message-outreach-106'
    )`, [message.rows[0].provider_operation_id, messageId])).rejects.toThrow('outreach_message_not_approved');

    await getPool().query(`update public.outreach_messages set approval_status = 'approved',
      approved_by = $2, approved_at = now() where id = $1`, [messageId, operatorId]);
    const accepted = await asRole<{ result: { approval_status: string; provider_message_id: string } }>(
      'service_role',
      `select public.accept_resend_prospecting_operation($1, $2, 'resend-message-outreach-106') as result`,
      [message.rows[0].provider_operation_id, messageId],
    );
    expect(accepted[0].result).toMatchObject({
      approval_status: 'sent',
      provider_message_id: 'resend-message-outreach-106',
    });
    const operation = await getPool().query<{ status: string; provider_reference: string }>(
      `select status, provider_reference from public.provider_operations where id = $1`,
      [message.rows[0].provider_operation_id],
    );
    expect(operation.rows[0]).toEqual({ status: 'succeeded', provider_reference: 'resend-message-outreach-106' });
    await expect(asRole('service_role', `select public.accept_resend_prospecting_operation(
      $1, $2, 'changed-provider-message-id'
    )`, [message.rows[0].provider_operation_id, messageId])).rejects.toThrow('prospecting_acceptance_mismatch');
  });

  it('requires reconciliation before an old unknown Resend operation may retry', async () => {
    const created = await asRole<{ result: { id: string } }>('service_role', `select public.upsert_provider_operation(
      'resend_transactional', 'send_email', 'recovery-106-unknown', 'pending', null,
      '{"domain_reference":"unknown"}'::jsonb, '{}'::jsonb, null
    ) as result`);
    await asRole('service_role', `select public.mark_resend_acceptance_unknown($1, 'Provider response timed out')`, [created[0].result.id]);
    await getPool().query(`update public.provider_operations set attempted_at = now() - interval '25 hours' where id = $1`, [created[0].result.id]);
    const unknownReplay = await asRole<{ result: { status: string; attempted_at: string } }>(
      'service_role',
      `select public.mark_resend_acceptance_unknown($1, 'Provider response timed out') as result`,
      [created[0].result.id],
    );
    expect(unknownReplay[0].result.status).toBe('acceptance_unknown');
    expect(Date.parse(unknownReplay[0].result.attempted_at)).toBeLessThan(Date.now() - (24 * 60 * 60 * 1000));
    await expect(asRole('service_role', `select public.assert_provider_operation_retryable($1)`, [created[0].result.id]))
      .rejects.toThrow('provider_acceptance_reconciliation_required');
    await expect(asRole('service_role', `select public.upsert_provider_operation(
      'resend_transactional', 'send_email', 'recovery-106-unknown', 'pending', null,
      '{"domain_reference":"unknown"}'::jsonb, '{}'::jsonb, null
    )`)).rejects.toThrow('provider_acceptance_reconciliation_required');

    const reconciled = await asRole<{ result: { status: string } }>('service_role',
      `select public.reconcile_resend_provider_operation($1, 'confirmed_not_accepted', null) as result`,
      [created[0].result.id],
    );
    expect(reconciled[0].result.status).toBe('failed_retryable');
    const reconciliationReplay = await asRole<{ result: { status: string } }>(
      'service_role',
      `select public.reconcile_resend_provider_operation($1, 'confirmed_not_accepted', null) as result`,
      [created[0].result.id],
    );
    expect(reconciliationReplay[0].result.status).toBe('failed_retryable');
    const retryable = await asRole<{ result: { retryable: boolean } }>('service_role',
      `select public.assert_provider_operation_retryable($1) as result`, [created[0].result.id],
    );
    expect(retryable[0].result.retryable).toBe(true);

    const acceptedUnknown = await asRole<{ result: { id: string } }>('service_role', `select public.upsert_provider_operation(
      'resend_prospecting', 'send_outreach_message', 'recovery-106-confirmed', 'pending', null,
      '{"domain_reference":"confirmed"}'::jsonb, '{}'::jsonb, null
    ) as result`);
    await asRole('service_role', `select public.mark_resend_acceptance_unknown($1, 'Provider response timed out')`, [acceptedUnknown[0].result.id]);
    const accepted = await asRole<{ result: { status: string; provider_reference: string } }>(
      'service_role',
      `select public.reconcile_resend_provider_operation($1, 'confirmed_accepted', 'resend-confirmed-106') as result`,
      [acceptedUnknown[0].result.id],
    );
    expect(accepted[0].result).toMatchObject({ status: 'reconciled', provider_reference: 'resend-confirmed-106' });
    const acceptedReplay = await asRole<{ result: { status: string; provider_reference: string } }>(
      'service_role',
      `select public.reconcile_resend_provider_operation($1, 'confirmed_accepted', 'resend-confirmed-106') as result`,
      [acceptedUnknown[0].result.id],
    );
    expect(acceptedReplay[0].result).toMatchObject({ status: 'reconciled', provider_reference: 'resend-confirmed-106' });
  });

  it('keeps failed webhook persistence retryable and rejects changed payloads', async () => {
    const first = await asRole<{ result: { duplicate: boolean; receipt: { id: string } } }>(
      'service_role',
      `select public.record_provider_webhook_receipt(
        'resend_transactional', $1, $2, true
      ) as result`,
      [webhookEventId, payloadHash],
    );
    expect(first[0].result.duplicate).toBe(false);
    await asRole('service_role', `select public.fail_provider_webhook_receipt($1, 'Database write failed', false)`,
      [first[0].result.receipt.id]);
    const retry = await asRole<{ result: { duplicate: boolean; receipt: { status: string } } }>(
      'service_role',
      `select public.record_provider_webhook_receipt(
        'resend_transactional', $1, $2, true
      ) as result`,
      [webhookEventId, payloadHash],
    );
    expect(retry[0].result).toMatchObject({ duplicate: false, receipt: { status: 'failed_retryable' } });
    await expect(asRole('service_role', `select public.record_provider_webhook_receipt(
      'resend_transactional', $1, $2, true
    )`, [webhookEventId, 'b'.repeat(64)])).rejects.toThrow('provider_webhook_replay_mismatch');
    await asRole('service_role', `select public.complete_provider_webhook_receipt($1)`, [first[0].result.receipt.id]);
    const duplicate = await asRole<{ result: { duplicate: boolean } }>(
      'service_role',
      `select public.record_provider_webhook_receipt(
        'resend_transactional', $1, $2, true
      ) as result`,
      [webhookEventId, payloadHash],
    );
    expect(duplicate[0].result.duplicate).toBe(true);
  });
});
