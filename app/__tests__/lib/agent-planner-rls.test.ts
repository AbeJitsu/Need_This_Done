import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { closePool, getPool } from '../../../supabase/tests/helpers';

const localDescribe = process.env.RUN_LOCAL_SUPABASE_TESTS === 'true' ? describe : describe.skip;
const operator = '00000000-0000-4860-8000-0000000000d1';
const member = '00000000-0000-4860-8000-0000000000d2';
const workerId = 'openclaw-planner-proof';
const profileId = '00000000-0000-4860-8000-0000000000d3';

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

async function asAdmin<T>(query: string, values: unknown[] = []) {
  return asRole<T>('authenticated', operator, query, values);
}

async function asWorker<T>(query: string, values: unknown[] = []) {
  return asRole<T>('service_role', null, query, values);
}

const step = {
  key: 'research',
  title: 'Research public evidence',
  instruction: 'Find distinct public businesses and cite every fit claim.',
  taskType: 'research_public_web',
  agentRole: 'public_web_researcher',
  capabilities: ['read_public_web', 'research_public_web'],
  expectedArtifacts: ['research dossier'],
  estimatedCostUsd: 0.02,
};

const forbiddenActions = [
  'send_external_messages',
  'publish_content',
  'spend_money',
  'change_connected_accounts',
  'deliver_external_content',
];

const instruction = {
  version: 1,
  executor: 'openclaw',
  approvalRequired: true,
  // These flags are persisted with every server-authored instruction so a
  // direct service-role caller cannot omit a forbidden delivery mode.
  delivery: {
    deliver: false,
    bestEffortDeliver: false,
    externalMessages: false,
    publishing: false,
    spending: false,
    accountChanges: false,
  },
};

const dossier = {
  companyName: 'Proof Studio',
  officialWebsite: 'https://proof.example.com',
  icpReason: 'The public site describes a local service with a clear follow-up opportunity.',
  observedEvidence: [{ claim: 'The business publishes a public booking path.', citationUrls: ['https://proof.example.com/about'] }],
  citations: [{ url: 'https://proof.example.com/about', title: 'Proof Studio about', excerpt: 'Proof Studio serves local operators.' }],
  recommendedOfferAngle: 'Offer a focused booking-path review.',
  contactPath: { type: 'contact_form', value: 'https://proof.example.com/contact' },
  suggestedOutreach: { subject: 'A booking-path idea', body: 'A human-reviewed draft only.' },
};

localDescribe.sequential('app planner and OpenClaw dispatch boundary', () => {
  beforeAll(async () => {
    const pool = getPool();
    await pool.query('begin');
    await pool.query(`set local session_replication_role = 'replica'`);
    await pool.query(`delete from public.prospecting_artifact_provenance where owner_id = $1`, [operator]);
    await pool.query(`delete from public.prospect_dossiers where profile_id = $1`, [profileId]);
    await pool.query(`delete from public.prospect_sources where prospect_id in (select id from public.prospects where profile_id = $1)`, [profileId]);
    await pool.query(`delete from public.prospects where profile_id = $1`, [profileId]);
    await pool.query(`delete from public.agent_plan_events where owner_id = $1`, [operator]);
    await pool.query(`delete from public.agent_artifact_versions where owner_id = $1`, [operator]);
    await pool.query(`delete from public.agent_artifacts where owner_id = $1`, [operator]);
    await pool.query(`delete from public.agent_task_dependencies where task_id in (select id from public.agent_orchestration_tasks where owner_id = $1) or depends_on_task_id in (select id from public.agent_orchestration_tasks where owner_id = $1)`, [operator]);
    await pool.query(`delete from public.agent_run_events where owner_id = $1`, [operator]);
    await pool.query(`delete from public.openclaw_model_usage_reservations where owner_id = $1`, [operator]);
    await pool.query(`delete from public.agent_orchestration_tasks where owner_id = $1`, [operator]);
    await pool.query(`delete from public.agent_runs where owner_id = $1`, [operator]);
    await pool.query(`delete from public.agent_plans where owner_id = $1`, [operator]);
    await pool.query(`delete from public.growth_profiles where id = $1`, [profileId]);
    await pool.query('commit');
    await pool.query(`delete from auth.users where id = any($1::uuid[])`, [[operator, member]]);
    await pool.query(`
      insert into auth.users (
        id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
        created_at, updated_at, confirmation_token, raw_app_meta_data, raw_user_meta_data
      ) values
        ($1, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'planner-operator@example.test', '', now(), now(), now(), '', '{}', '{}'),
        ($2, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'planner-member@example.test', '', now(), now(), now(), '', '{}', '{}')
    `, [operator, member]);
    await pool.query(`insert into public.user_roles (user_id, role) values ($1, 'admin') on conflict (user_id) do update set role = excluded.role`, [operator]);
    await pool.query(`delete from public.growth_profiles where id = $1`, [profileId]);
    await pool.query(`
      insert into public.growth_profiles (
        id, owner_id, target_market, geography, offer, sender_name, sender_email,
        model_route, selected_model_id, selected_model_rationale
      ) values ($1, $2, 'local service operators', 'New York', 'a focused growth review', 'Operator', 'operator@example.test', 'selected-primary', 'provider/pinned-model', 'local planner proof')
    `, [profileId, operator]);
  });

  afterAll(async () => {
    const pool = getPool();
    await pool.query('begin');
    await pool.query(`set local session_replication_role = 'replica'`);
    await pool.query(`delete from public.prospecting_artifact_provenance where owner_id = $1`, [operator]);
    await pool.query(`delete from public.prospect_dossiers where profile_id = $1`, [profileId]);
    await pool.query(`delete from public.prospect_sources where prospect_id in (select id from public.prospects where profile_id = $1)`, [profileId]);
    await pool.query(`delete from public.prospects where profile_id = $1`, [profileId]);
    await pool.query(`delete from public.agent_plan_events where owner_id = $1`, [operator]);
    await pool.query(`delete from public.agent_artifact_versions where owner_id = $1`, [operator]);
    await pool.query(`delete from public.agent_artifacts where owner_id = $1`, [operator]);
    await pool.query(`delete from public.agent_task_dependencies where task_id in (select id from public.agent_orchestration_tasks where owner_id = $1) or depends_on_task_id in (select id from public.agent_orchestration_tasks where owner_id = $1)`, [operator]);
    await pool.query(`delete from public.agent_run_events where owner_id = $1`, [operator]);
    await pool.query(`delete from public.openclaw_model_usage_reservations where owner_id = $1`, [operator]);
    await pool.query(`delete from public.agent_orchestration_tasks where owner_id = $1`, [operator]);
    await pool.query(`delete from public.agent_runs where owner_id = $1`, [operator]);
    await pool.query(`delete from public.agent_plans where owner_id = $1`, [operator]);
    await pool.query(`delete from public.growth_profiles where id = $1`, [profileId]);
    await pool.query('commit');
    await pool.query(`delete from public.user_roles where user_id = any($1::uuid[])`, [[operator, member]]);
    await pool.query(`delete from auth.users where id = any($1::uuid[])`, [[operator, member]]);
    await closePool();
  });

  it('requires approval, freezes the plan, dispatches OpenClaw tasks, and links citation-backed provenance', async () => {
    await expect(asRole('authenticated', member, `select public.create_agent_plan($1,$2,$3::jsonb,$4::jsonb,$5::jsonb,$6::jsonb,$7::uuid,$8,$9,$10,$11,$12,$13,$14,$15::jsonb,$16::jsonb,$17::uuid)`, [
      'not allowed', 'not allowed', JSON.stringify([step]), JSON.stringify(['research_public_web']), JSON.stringify(forbiddenActions), JSON.stringify(['research dossier']), profileId, 'research_outreach', 'provider/pinned-model', 'selected-primary', 100, 200, 0, 0.02, '{}', JSON.stringify(instruction), '40000000-0000-4000-8000-0000000000d1',
    ])).rejects.toThrow();

    const planKey = '40000000-0000-4000-8000-0000000000d1';
    const created = await asAdmin<{ result: { plan: { id: string; status: string }; duplicate: boolean } }>(`select public.create_agent_plan($1,$2,$3::jsonb,$4::jsonb,$5::jsonb,$6::jsonb,$7::uuid,$8,$9,$10,$11,$12,$13,$14,$15::jsonb,$16::jsonb,$17::uuid) as result`, [
      'Find one public business.', 'Research one public business and prepare a draft for review.', JSON.stringify([step]), JSON.stringify(['research_public_web']), JSON.stringify(forbiddenActions), JSON.stringify(['research dossier']), profileId, 'research_outreach', 'provider/pinned-model', 'selected-primary', 100, 200, 0, 0.02, '{}', JSON.stringify(instruction), planKey,
    ]);
    expect(created[0].result).toMatchObject({ plan: { status: 'draft' }, duplicate: false });
    const replay = await asAdmin<{ result: { plan: { id: string }; duplicate: boolean } }>(`select public.create_agent_plan($1,$2,$3::jsonb,$4::jsonb,$5::jsonb,$6::jsonb,$7::uuid,$8,$9,$10,$11,$12,$13,$14,$15::jsonb,$16::jsonb,$17::uuid) as result`, [
      'Find one public business.', 'Research one public business and prepare a draft for review.', JSON.stringify([step]), JSON.stringify(['research_public_web']), JSON.stringify(forbiddenActions), JSON.stringify(['research dossier']), profileId, 'research_outreach', 'provider/pinned-model', 'selected-primary', 100, 200, 0, 0.02, '{}', JSON.stringify(instruction), planKey,
    ]);
    expect(replay[0].result.duplicate).toBe(true);

    const planId = created[0].result.plan.id;
    await expect(asAdmin(`select public.dispatch_agent_plan($1::uuid,$2::uuid)`, [planId, '40000000-0000-4000-8000-0000000000d2'])).rejects.toThrow('agent_plan_must_be_approved');
    await asAdmin(`select public.approve_agent_plan($1::uuid,$2::uuid,'reviewed')`, [planId, '40000000-0000-4000-8000-0000000000d3']);
    const approved = await asAdmin<{ approved_snapshot: Record<string, unknown>; status: string }>(`select status, approved_snapshot from public.agent_plans where id = $1`, [planId]);
    expect(approved[0].status).toBe('approved');
    expect(approved[0].approved_snapshot).toMatchObject({ planId, openclawInstruction: instruction });

    const dispatched = await asAdmin<{ result: { run: { id: string; plan_id: string }; tasks: Array<{ id: string; plan_id: string; agent_provider: string; model_id: string; approved_plan_snapshot: Record<string, unknown> }>; duplicate: boolean } }>(`select public.dispatch_agent_plan($1::uuid,$2::uuid) as result`, [planId, '40000000-0000-4000-8000-0000000000d4']);
    expect(dispatched[0].result).toMatchObject({ run: { plan_id: planId }, duplicate: false });
    expect(dispatched[0].result.tasks).toHaveLength(1);
    expect(dispatched[0].result.tasks[0]).toMatchObject({ plan_id: planId, agent_provider: 'openclaw', model_id: 'provider/pinned-model', approved_plan_snapshot: { planId } });

    const taskId = dispatched[0].result.tasks[0].id;
    const claimed = await asWorker<{ task: { id: string; status: string } }>(`select public.claim_openclaw_agent_orchestration_task($1::uuid,$2,300) as task`, [operator, workerId]);
    expect(claimed[0].task).toMatchObject({ id: taskId, status: 'leased' });
    await asWorker(`select public.record_agent_task_event($1::uuid,$2,'progress','{"stage":"started"}'::jsonb,20)`, [taskId, workerId]);
    const reservationKey = '40000000-0000-4000-8000-0000000000d5';
    await asWorker(`select public.reserve_openclaw_model_usage($1::uuid,$2::uuid,$3::uuid,$4::uuid,$5,$6::uuid,0.02)`, [operator, planId, dispatched[0].result.run.id, taskId, workerId, reservationKey]);
    const usage = { prompt_tokens: 100, completion_tokens: 50, cost: 0.01 };
    const completed = await asWorker(`select public.complete_openclaw_task_with_provenance($1::uuid,$2,'succeeded','{"source":"fake-gateway"}'::jsonb,null,$3::jsonb,$4::uuid,0.01,'provider/pinned-model',$5::jsonb,$6::jsonb)`, [taskId, workerId, JSON.stringify([{ artifactType: 'research_dossier', title: 'Citation-backed dossier', contentText: JSON.stringify(dossier) }]), reservationKey, JSON.stringify(usage), JSON.stringify({ dossiers: [dossier] })]);
    expect(completed).toHaveLength(1);

    const provenance = await asAdmin<{ validation_status: string; model_id: string; worker_id: string; orchestration_task_id: string }>(`select validation_status, model_id, worker_id, orchestration_task_id from public.prospecting_artifact_provenance where plan_id = $1`, [planId]);
    expect(provenance).toMatchObject([{ validation_status: 'validated', model_id: 'provider/pinned-model', worker_id: workerId, orchestration_task_id: taskId }]);
    const dossiers = await asAdmin<{ orchestration_task_id: string; agent_artifact_id: string; model_usage_reservation_id: string; review_status: string }>(`select orchestration_task_id, agent_artifact_id, model_usage_reservation_id, review_status from public.prospect_dossiers where orchestration_task_id = $1`, [taskId]);
    expect(dossiers).toMatchObject([{ orchestration_task_id: taskId, model_usage_reservation_id: expect.any(String), review_status: 'pending_review' }]);
    const completedTask = await asAdmin<{ actual_model_id: string; provider_usage: Record<string, unknown> }>(`select actual_model_id, provider_usage from public.agent_orchestration_tasks where id = $1`, [taskId]);
    expect(completedTask).toEqual([{ actual_model_id: 'provider/pinned-model', provider_usage: { prompt_tokens: 100, completion_tokens: 50, cost: 0.01 } }]);
  });

  it('does not allow an authenticated browser to write plan rows directly', async () => {
    await expect(asAdmin(`insert into public.agent_plans (owner_id, growth_profile_id, workflow_type, original_request, rewritten_instruction, steps, allowed_capabilities, forbidden_actions, expected_artifacts, selected_model_id, model_route, estimated_prompt_tokens, estimated_completion_tokens, estimated_cost_usd, idempotency_key, request_hash, openclaw_instruction) values ($1,$2,'research_outreach','x','x','[]','[]','[]','[]','provider/pinned-model','selected-primary',1,1,0,$3,'x',$4::jsonb)`, [operator, profileId, '40000000-0000-4000-8000-0000000000d6', JSON.stringify(instruction)])).rejects.toThrow();
  });
});
