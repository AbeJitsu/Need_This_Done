import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { closePool, getPool } from '../../../supabase/tests/helpers';

const localDescribe = process.env.RUN_LOCAL_SUPABASE_TESTS === 'true' ? describe : describe.skip;

const operatorA = '00000000-0000-4860-8000-0000000000a1';
const operatorB = '00000000-0000-4860-8000-0000000000b1';
const member = '00000000-0000-4860-8000-0000000000c1';

type DatabaseRole = 'anon' | 'authenticated' | 'service_role';

async function asRole<T>(
  role: DatabaseRole,
  userId: string | null,
  query: string,
  values: unknown[] = [],
): Promise<T[]> {
  const client = await getPool().connect();
  try {
    await client.query('begin');
    await client.query(`set local role ${role}`);
    await client.query(`select set_config('request.jwt.claim.role', $1, true)`, [role]);
    if (userId) {
      await client.query(`select set_config('request.jwt.claim.sub', $1, true)`, [userId]);
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

async function asAdmin<T>(userId: string, query: string, values: unknown[] = []) {
  return asRole<T>('authenticated', userId, query, values);
}

async function asWorker<T>(query: string, values: unknown[] = []) {
  return asRole<T>('service_role', null, query, values);
}

async function createRun(
  ownerId: string,
  idempotencyKey: string,
  workflowType: 'research_outreach' | 'daily_content' = 'research_outreach',
  title = 'Local agent operations proof',
  localDate: string | null = null,
) {
  const scheduledFor = localDate ? `${localDate}T13:00:00.000Z` : null;
  const rows = await asAdmin<{ result: { run: { id: string; status: string }; duplicate: boolean } }>(
    ownerId,
    `select public.create_agent_run(
      $1, $2, $3::jsonb, $4::uuid, $5::date, 'America/New_York', $6::timestamptz
    ) as result`,
    [workflowType, title, JSON.stringify({ source: 'local-proof' }), idempotencyKey, localDate, scheduledFor],
  );
  return rows[0].result;
}

localDescribe.sequential('agent operations authenticated boundaries', () => {
  beforeAll(async () => {
    const pool = getPool();
    const users = [operatorA, operatorB, member];
    await pool.query(`delete from public.user_roles where user_id = any($1::uuid[])`, [users]);
    await pool.query(`delete from auth.users where id = any($1::uuid[])`, [users]);
    await pool.query(`
      insert into auth.users (
        id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
        created_at, updated_at, confirmation_token, raw_app_meta_data, raw_user_meta_data
      ) values
        ($1, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'agent-operator-a@example.test', '', now(), now(), now(), '', '{}', '{}'),
        ($2, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'agent-operator-b@example.test', '', now(), now(), now(), '', '{}', '{}'),
        ($3, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'agent-member@example.test', '', now(), now(), now(), '', '{}', '{}')
    `, users);
    await pool.query(`
      insert into public.user_roles (user_id, role)
      values ($1, 'admin'), ($2, 'admin')
      on conflict (user_id) do update set role = excluded.role
    `, [operatorA, operatorB]);
  });

  afterAll(async () => {
    const pool = getPool();
    const users = [operatorA, operatorB, member];
    await pool.query('begin');
    await pool.query(`set local session_replication_role = 'replica'`);
    await pool.query(`delete from public.agent_run_events where owner_id = any($1::uuid[])`, [users]);
    await pool.query(`delete from public.agent_approval_decisions where owner_id = any($1::uuid[])`, [users]);
    await pool.query(`delete from public.agent_artifact_versions where owner_id = any($1::uuid[])`, [users]);
    await pool.query(`
      delete from public.agent_task_dependencies
      where task_id in (select id from public.agent_orchestration_tasks where owner_id = any($1::uuid[]))
         or depends_on_task_id in (select id from public.agent_orchestration_tasks where owner_id = any($1::uuid[]))
    `, [users]);
    await pool.query(`delete from public.agent_artifacts where owner_id = any($1::uuid[])`, [users]);
    await pool.query(`delete from public.agent_run_commands where owner_id = any($1::uuid[])`, [users]);
    await pool.query(`delete from public.content_schedules where owner_id = any($1::uuid[])`, [users]);
    await pool.query(`delete from public.media_usage_reservations where owner_id = any($1::uuid[])`, [users]);
    await pool.query(`delete from public.worker_heartbeats where owner_id = any($1::uuid[])`, [users]);
    await pool.query(`delete from public.agent_orchestration_tasks where owner_id = any($1::uuid[])`, [users]);
    await pool.query(`delete from public.agent_runs where owner_id = any($1::uuid[])`, [users]);
    await pool.query(`delete from public.brand_profiles where owner_id = any($1::uuid[])`, [users]);
    await pool.query('commit');
    await pool.query(`delete from public.user_roles where user_id = any($1::uuid[])`, [users]);
    await pool.query(`delete from auth.users where id = any($1::uuid[])`, [users]);
    await closePool();
  });

  it('requires an admin, deduplicates exact retries, rejects changed retries, and isolates owners', async () => {
    const runKey = '10000000-4860-4000-8000-0000000000a1';
    await expect(asAdmin<{ result: unknown }>(member, `
      select public.create_agent_run(
        'research_outreach', 'Not allowed', '{}'::jsonb, $1::uuid, null, 'America/New_York', null
      ) as result
    `, [runKey])).rejects.toThrow('admin_required');

    await expect(asRole<{ result: unknown }>('anon', null, `
      select public.create_agent_run(
        'research_outreach', 'Not allowed', '{}'::jsonb, $1::uuid, null, 'America/New_York', null
      ) as result
    `, ['10000000-4860-4000-8000-0000000000a2'])).rejects.toThrow();

    const first = await createRun(operatorA, runKey);
    const replay = await createRun(operatorA, runKey);
    expect(first.duplicate).toBe(false);
    expect(replay).toMatchObject({ duplicate: true, run: { id: first.run.id } });

    await expect(createRun(operatorA, runKey, 'research_outreach', 'Changed retry details'))
      .rejects.toThrow('agent_run_idempotency_conflict');

    const tasks = await asAdmin<{ task_key: string }>(operatorA, `
      select task_key from public.agent_orchestration_tasks where run_id = $1 order by task_key
    `, [first.run.id]);
    expect(tasks.map((row) => row.task_key)).toEqual([
      'coordinator',
      'outreach-writer',
      'public-web-researcher',
      'reviewer',
    ]);

    const foreignRun = await asAdmin<{ id: string }>(operatorB, `
      select id from public.agent_runs where id = $1
    `, [first.run.id]);
    expect(foreignRun).toEqual([]);
    await expect(asAdmin(operatorB, `
      select public.control_agent_run($1::uuid, 'pause', $2::uuid, '')
    `, [first.run.id, '10000000-4860-4000-8000-0000000000a3'])).rejects.toThrow('agent_run_not_found');
    await asAdmin(operatorA, `
      select public.control_agent_run($1::uuid, 'cancel', $2::uuid, 'test cleanup')
    `, [first.run.id, '10000000-4860-4000-8000-0000000000a4']);
  });

  it('enforces worker-only leases, approval idempotency, and append-only history', async () => {
    const run = await createRun(operatorA, '20000000-4860-4000-8000-0000000000a1');
    const workerId = 'local-agent-worker-086';

    await expect(asAdmin(operatorA, `
      select public.claim_agent_orchestration_task($1::uuid, $2, 300)
    `, [operatorA, workerId])).rejects.toThrow();

    const claimed = await asWorker<{ task: { id: string; task_key: string; status: string } }>(`
      select public.claim_agent_orchestration_task($1::uuid, $2, 300) as task
    `, [operatorA, workerId]);
    expect(claimed[0].task).toMatchObject({ task_key: 'coordinator', status: 'leased' });

    const blockedByDependency = await asWorker<{ task: unknown }>(`
      select public.claim_agent_orchestration_task($1::uuid, $2, 300) as task
    `, [operatorA, workerId]);
    expect(blockedByDependency[0].task).toBeNull();

    await expect(asWorker(`
      select public.record_agent_task_event($1::uuid, 'another-worker', 'progress', '{}'::jsonb, 10)
    `, [claimed[0].task.id])).rejects.toThrow('task_lease_invalid');

    await asWorker(`
      select public.record_agent_task_event($1::uuid, $2, 'progress', '{"stage":"started"}'::jsonb, 20)
    `, [claimed[0].task.id, workerId]);
    await asWorker(`
      select public.complete_agent_orchestration_task($1::uuid, $2, 'succeeded', '{"stage":"coordinated"}'::jsonb, null, '[]'::jsonb)
    `, [claimed[0].task.id, workerId]);

    const researchTask = await asWorker<{ task: { id: string; task_key: string } }>(`
      select public.claim_agent_orchestration_task($1::uuid, $2, 300) as task
    `, [operatorA, workerId]);
    expect(researchTask[0].task.task_key).toBe('public-web-researcher');

    await expect(asWorker(`
      select public.complete_agent_orchestration_task(
        $1::uuid, $2, 'succeeded', null, null,
        $3::jsonb
      )
    `, [
      researchTask[0].task.id,
      workerId,
      JSON.stringify([{
        artifactType: 'research_dossier',
        title: 'Invalid path must fail closed',
        storagePath: 'agent-media/another-owner/another-run/another-task/file.txt',
      }]),
    ])).rejects.toThrow('invalid_agent_artifact');

    await asWorker(`
      select public.complete_agent_orchestration_task(
        $1::uuid, $2, 'succeeded', null, null,
        $3::jsonb
      )
    `, [
      researchTask[0].task.id,
      workerId,
      JSON.stringify([{
        artifactType: 'research_dossier',
        title: 'Public evidence dossier',
        contentText: 'A human-reviewable draft backed by public evidence.',
        metadata: { source: 'local-proof' },
      }]),
    ]);

    const artifacts = await asAdmin<{ id: string; status: string; current_version_id: string }>(operatorA, `
      select id, status, current_version_id
      from public.agent_artifacts where task_id = $1
    `, [researchTask[0].task.id]);
    expect(artifacts).toHaveLength(1);
    expect(artifacts[0].status).toBe('pending_review');

    const decisionKey = '20000000-4860-4000-8000-0000000000a2';
    const approved = await asAdmin<{ result: { artifact: { status: string }; duplicate: boolean } }>(operatorA, `
      select public.record_agent_artifact_decision(
        $1::uuid, 'approve', $2::uuid, 'Reviewed locally', null, '{}'::jsonb
      ) as result
    `, [artifacts[0].id, decisionKey]);
    const decisionReplay = await asAdmin<{ result: { artifact: { status: string }; duplicate: boolean } }>(operatorA, `
      select public.record_agent_artifact_decision(
        $1::uuid, 'approve', $2::uuid, 'Reviewed locally', null, '{}'::jsonb
      ) as result
    `, [artifacts[0].id, decisionKey]);
    expect(approved[0].result).toMatchObject({ artifact: { status: 'approved' }, duplicate: false });
    expect(decisionReplay[0].result).toMatchObject({ artifact: { status: 'approved' }, duplicate: true });
    await expect(asAdmin<{ result: unknown }>(operatorA, `
      select public.record_agent_artifact_decision(
        $1::uuid, 'approve', $2::uuid, 'Changed replay', null, '{}'::jsonb
      ) as result
    `, [artifacts[0].id, decisionKey])).rejects.toThrow('artifact_decision_idempotency_conflict');

    const foreignArtifact = await asAdmin<{ id: string }>(operatorB, `
      select id from public.agent_artifacts where id = $1
    `, [artifacts[0].id]);
    expect(foreignArtifact).toEqual([]);
    const decisions = await asAdmin<{ id: string }>(operatorA, `
      select id from public.agent_approval_decisions where artifact_id = $1
    `, [artifacts[0].id]);
    expect(decisions).toHaveLength(1);
    await expect(asWorker(`
      delete from public.agent_approval_decisions where id = $1
    `, [decisions[0].id])).rejects.toThrow('agent_history_is_immutable');
    await expect(asWorker(`
      update public.agent_artifact_versions set content_text = 'tampered' where id = $1
    `, [artifacts[0].current_version_id])).rejects.toThrow('agent_artifact_versions_are_immutable');
    await asAdmin(operatorA, `
      select public.control_agent_run($1::uuid, 'cancel', $2::uuid, 'test cleanup')
    `, [run.run.id, '20000000-4860-4000-8000-0000000000a3']);
  });

  it('deduplicates daily schedules and fails closed at the media ceiling', async () => {
    const localDate = '2030-08-09';
    const first = await createRun(
      operatorB,
      '30000000-4860-4000-8000-0000000000a1',
      'daily_content',
      'Scheduled local content',
      localDate,
    );
    const scheduleReplay = await createRun(
      operatorB,
      '30000000-4860-4000-8000-0000000000a2',
      'daily_content',
      'Different scheduled title',
      localDate,
    );
    expect(scheduleReplay).toMatchObject({ duplicate: true, run: { id: first.run.id } });

    const workerId = 'local-media-worker-086';
    const coordinator = await asWorker<{ task: { id: string } }>(`
      select public.claim_agent_orchestration_task($1::uuid, $2, 300) as task
    `, [operatorB, workerId]);
    await asWorker(`
      select public.complete_agent_orchestration_task($1::uuid, $2, 'succeeded', null, null, '[]'::jsonb)
    `, [coordinator[0].task.id, workerId]);
    const producer = await asWorker<{ task: { id: string; task_type: string } }>(`
      select public.claim_agent_orchestration_task($1::uuid, $2, 300) as task
    `, [operatorB, workerId]);
    expect(producer[0].task.task_type).toBe('produce_daily_content');

    await expect(asAdmin(operatorB, `
      select public.reserve_media_usage(
        $1::uuid, $2::uuid, $3::uuid, $4, $5::uuid, 'video', 'local-test', 0.90, $6::date
      )
    `, [
      operatorB,
      first.run.id,
      producer[0].task.id,
      workerId,
      '30000000-4860-4000-8000-0000000000b1',
      localDate,
    ])).rejects.toThrow();

    const reserved = await asWorker<{ reservation: { id: string; status: string } }>(`
      select public.reserve_media_usage(
        $1::uuid, $2::uuid, $3::uuid, $4, $5::uuid, 'video', 'local-test', 0.90, $6::date
      ) as reservation
    `, [
      operatorB,
      first.run.id,
      producer[0].task.id,
      workerId,
      '30000000-4860-4000-8000-0000000000b1',
      localDate,
    ]);
    const reservationReplay = await asWorker<{ reservation: { id: string; status: string } }>(`
      select public.reserve_media_usage(
        $1::uuid, $2::uuid, $3::uuid, $4, $5::uuid, 'video', 'local-test', 0.90, $6::date
      ) as reservation
    `, [
      operatorB,
      first.run.id,
      producer[0].task.id,
      workerId,
      '30000000-4860-4000-8000-0000000000b1',
      localDate,
    ]);
    expect(reservationReplay[0].reservation).toMatchObject({ id: reserved[0].reservation.id, status: 'reserved' });

    await expect(asWorker(`
      select public.reserve_media_usage(
        $1::uuid, $2::uuid, $3::uuid, $4, $5::uuid, 'video', 'local-test', 0.89, $6::date
      )
    `, [
      operatorB,
      first.run.id,
      producer[0].task.id,
      workerId,
      '30000000-4860-4000-8000-0000000000b1',
      localDate,
    ])).rejects.toThrow('media_reservation_key_conflict');
    await expect(asWorker(`
      select public.reserve_media_usage(
        $1::uuid, $2::uuid, $3::uuid, $4, $5::uuid, 'video', 'local-test', 0.10, $6::date
      )
    `, [
      operatorB,
      first.run.id,
      producer[0].task.id,
      workerId,
      '30000000-4860-4000-8000-0000000000b2',
      localDate,
    ])).rejects.toThrow('daily_media_budget_exceeded');

    const overage = await asWorker<{ reservation: { status: string; actual_cost: number } }>(`
      select public.reconcile_media_usage($1::uuid, 1.00, '{"provider":"local-proof"}'::jsonb) as reservation
    `, ['30000000-4860-4000-8000-0000000000b1']);
    expect(overage[0].reservation).toMatchObject({ status: 'overage', actual_cost: 1 });
    await asWorker(`
      select public.complete_agent_orchestration_task($1::uuid, $2, 'failed', null, 'Media ceiling overage', '[]'::jsonb)
    `, [producer[0].task.id, workerId]);

    const heartbeatWorker = 'local-heartbeat-086';
    await asWorker(`
      insert into public.worker_heartbeats (worker_id, owner_id, status, version, capabilities)
      values ($1, $2::uuid, 'online', 'test', '["claim","complete"]'::jsonb)
    `, [heartbeatWorker, operatorB]);
    const ownHeartbeat = await asAdmin<{ worker_id: string }>(operatorB, `
      select worker_id from public.worker_heartbeats where worker_id = $1
    `, [heartbeatWorker]);
    const foreignHeartbeat = await asAdmin<{ worker_id: string }>(operatorA, `
      select worker_id from public.worker_heartbeats where worker_id = $1
    `, [heartbeatWorker]);
    expect(ownHeartbeat).toEqual([{ worker_id: heartbeatWorker }]);
    expect(foreignHeartbeat).toEqual([]);
    await expect(asAdmin(operatorB, `
      insert into public.worker_heartbeats (worker_id, owner_id) values ('unauthorized-086', $1::uuid)
    `, [operatorB])).rejects.toThrow();
  });
});
