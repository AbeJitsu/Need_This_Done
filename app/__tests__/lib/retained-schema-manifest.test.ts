import { afterAll, describe, expect, it } from 'vitest';
import { closePool, getPool } from '../../../supabase/tests/helpers';

const localDescribe = process.env.RUN_LOCAL_SUPABASE_TESTS === 'true' ? describe : describe.skip;

const retainedTables = [
  'agent_task_events',
  'agent_tasks',
  'ai_employee_check_in_schedules',
  'ai_employee_decisions',
  'ai_employee_operating_briefs',
  'ai_employee_outcomes',
  'ai_employee_work_items',
  'ai_employees',
  'customer_accounts',
  'customer_memberships',
  'google_calendar_tokens',
  'growth_profiles',
  'health_check',
  'model_evaluation_records',
  'operator_cockpit_actions',
  'operator_daily_reflections',
  'operator_weekly_priorities',
  'outreach_messages',
  'project_comments',
  'project_github_handoffs',
  'projects',
  'prospect_outcomes',
  'prospect_sources',
  'prospects',
  'sender_events',
  'site_reports',
  'suppression_records',
  'user_roles',
  'worker_callback_nonces',
  'workflow_runs',
] as const;

const requiredPolicies = [
  ['ai_employee_check_in_schedules', 'members read schedules', 'SELECT'],
  ['ai_employee_decisions', 'members read decisions', 'SELECT'],
  ['ai_employee_operating_briefs', 'members read briefs', 'SELECT'],
  ['ai_employee_outcomes', 'members read outcomes', 'SELECT'],
  ['ai_employee_work_items', 'members read work', 'SELECT'],
  ['ai_employees', 'members read employees', 'SELECT'],
  ['customer_accounts', 'members read customer', 'SELECT'],
  ['customer_memberships', 'members read memberships', 'SELECT'],
  ['project_comments', 'Users can read own project comments', 'SELECT'],
  ['projects', 'Users can read own projects, admins read all', 'SELECT'],
  ['site_reports', 'No direct insert', 'INSERT'],
  ['user_roles', 'Users can read own role', 'SELECT'],
  ['workflow_runs', 'Operators can read workflow runs', 'SELECT'],
  ['workflow_runs', 'Operators can update workflow runs', 'UPDATE'],
  ['operator_cockpit_actions', 'owners read cockpit actions', 'SELECT'],
  ['operator_daily_reflections', 'owners read daily reflections', 'SELECT'],
  ['operator_weekly_priorities', 'owners read weekly priorities', 'SELECT'],
    ['growth_profiles', 'admins read growth profiles', 'SELECT'],
    ['model_evaluation_records', 'admins read model evaluation records', 'SELECT'],
    ['prospects', 'admins read prospects', 'SELECT'],
    ['outreach_messages', 'admins read outreach', 'SELECT'],
    ['suppression_records', 'admins read suppression', 'SELECT'],
    ['agent_tasks', 'admins read agent tasks', 'SELECT'],
    ['sender_events', 'admins read sender events', 'SELECT'],
] as const;

localDescribe.sequential('retained Supabase schema manifest', () => {
  afterAll(async () => {
    await closePool();
  });

  it('rebuilds every retained public table with RLS enabled', async () => {
    const result = await getPool().query<{ relname: string; relrowsecurity: boolean }>(
      `select c.relname, c.relrowsecurity
       from pg_class c
       join pg_namespace n on n.oid = c.relnamespace
       where n.nspname = 'public'
         and c.relkind = 'r'
       order by c.relname`,
    );

    expect(result.rows.map((row) => row.relname)).toEqual([...retainedTables]);
    expect(result.rows.every((row) => row.relrowsecurity)).toBe(true);
  });

  it('preserves the critical retained columns and types', async () => {
    const expected = [
      ['ai_employee_decisions', 'idempotency_key', 'uuid'],
      ['ai_employee_outcomes', 'amount_cents', 'int8'],
      ['ai_employee_outcomes', 'cost_category', 'text'],
      ['ai_employee_outcomes', 'currency', 'text'],
      ['ai_employee_outcomes', 'idempotency_key', 'uuid'],
      ['ai_employee_outcomes', 'recorded_by', 'uuid'],
      ['ai_employee_work_items', 'completed_at', 'timestamptz'],
      ['ai_employee_work_items', 'completed_by', 'uuid'],
      ['ai_employee_work_items', 'completion_idempotency_key', 'uuid'],
      ['ai_employee_work_items', 'completion_notes', 'text'],
      ['ai_employee_work_items', 'created_by', 'uuid'],
      ['ai_employee_work_items', 'predecessor_work_item_id', 'uuid'],
      ['ai_employee_work_items', 'scheduled_date', 'date'],
      ['google_calendar_tokens', 'access_token_encrypted', 'bytea'],
      ['google_calendar_tokens', 'refresh_token_encrypted', 'bytea'],
      ['operator_cockpit_actions', 'completed_at', 'timestamptz'],
      ['operator_cockpit_actions', 'deferred_until', 'date'],
      ['operator_cockpit_actions', 'owner_id', 'uuid'],
      ['operator_cockpit_actions', 'priority_id', 'uuid'],
      ['operator_cockpit_actions', 'status', 'text'],
      ['operator_daily_reflections', 'owner_id', 'uuid'],
      ['operator_daily_reflections', 'reflection', 'text'],
      ['operator_daily_reflections', 'reflection_date', 'date'],
      ['operator_weekly_priorities', 'due_date', 'date'],
      ['operator_weekly_priorities', 'next_action', 'text'],
      ['operator_weekly_priorities', 'outcome', 'text'],
      ['operator_weekly_priorities', 'owner_id', 'uuid'],
      ['operator_weekly_priorities', 'owner_name', 'text'],
      ['operator_weekly_priorities', 'status', 'text'],
      ['operator_weekly_priorities', 'week_start', 'date'],
      ['project_github_handoffs', 'notification_status', 'text'],
      ['projects', 'alternate_consultation_at', 'timestamptz'],
      ['projects', 'attachments', '_text'],
      ['projects', 'consultation_type', 'text'],
      ['projects', 'customer_id', 'uuid'],
      ['projects', 'preferred_consultation_at', 'timestamptz'],
      ['workflow_runs', 'idempotency_key', 'text'],
    ];
    const result = await getPool().query<{ table_name: string; column_name: string; udt_name: string }>(
      `select table_name, column_name, udt_name
       from information_schema.columns
       where table_schema = 'public'
         and (table_name, column_name) in (
           select * from unnest($1::text[], $2::text[])
         )
       order by table_name, column_name`,
      [expected.map(([table]) => table), expected.map(([, column]) => column)],
    );

    expect(result.rows.map((row) => [row.table_name, row.column_name, row.udt_name])).toEqual(expected);
  });

  it('preserves isolation policies without anonymous site-report reads', async () => {
    const result = await getPool().query<{ tablename: string; policyname: string; cmd: string }>(
      `select tablename, policyname, cmd
       from pg_policies
       where schemaname = 'public'
         and tablename = any($1::text[])`,
      [retainedTables],
    );
    const actual = new Set(result.rows.map((row) => `${row.tablename}|${row.policyname}|${row.cmd}`));

    for (const [table, policy, command] of requiredPolicies) {
      expect(actual.has(`${table}|${policy}|${command}`)).toBe(true);
    }
    expect(result.rows.some((row) => row.tablename === 'site_reports' && row.cmd === 'SELECT')).toBe(false);
  });

  it('preserves decision, queue, history, and cascading-cleanup constraints', async () => {
    const requiredConstraints = [
      'ai_employee_decisions_idempotency_key_key',
      'ai_employee_decisions_work_item_id_key',
      'ai_employee_outcomes_financial_fields_check',
      'ai_employee_outcomes_idempotency_key_key',
      'ai_employee_outcomes_kind_check',
      'ai_employee_outcomes_positive_value_check',
      'ai_employee_work_items_completion_idempotency_key_key',
      'ai_employee_work_items_completion_state_check',
      'ai_employee_work_items_predecessor_work_item_id_key',
      'customer_memberships_pkey',
      'projects_consultation_preference_check',
      'projects_consultation_type_check',
      'workflow_runs_idempotency_key_key',
      'workflow_runs_source_type_source_id_key',
      'operator_daily_reflections_owner_id_reflection_date_key',
    ];
    const constraints = await getPool().query<{ conname: string }>(
      `select conname from pg_constraint where conname = any($1::text[]) order by conname`,
      [requiredConstraints],
    );
    expect(constraints.rows.map((row) => row.conname)).toEqual([...requiredConstraints].sort());

    const queueIndex = await getPool().query<{ indexdef: string }>(
      `select indexdef from pg_indexes
       where schemaname = 'public' and indexname = 'ai_employee_pending_queue_slot'`,
    );
    expect(queueIndex.rows[0]?.indexdef).toContain('UNIQUE INDEX');
    expect(queueIndex.rows[0]?.indexdef).toContain("WHERE (status = 'pending'::text)");

    const cascading = await getPool().query<{ conname: string; confdeltype: string }>(
      `select conname, confdeltype
       from pg_constraint
       where conname in (
         'customer_memberships_customer_id_fkey',
         'ai_employees_customer_id_fkey',
         'ai_employee_work_items_employee_id_fkey',
         'ai_employee_decisions_work_item_id_fkey',
         'project_comments_project_id_fkey',
         'project_github_handoffs_project_id_fkey'
       )
       order by conname`,
    );
    expect(cascading.rows).toHaveLength(6);
    expect(cascading.rows.every((row) => row.confdeltype === 'c')).toBe(true);
  });

  it('keeps the retained trigger set and no retired public views', async () => {
    const triggers = await getPool().query<{ trigger_name: string }>(
      `select trigger_name from information_schema.triggers
       where trigger_schema = 'public'
       order by trigger_name`,
    );
    expect(triggers.rows.map((row) => row.trigger_name)).toEqual([
      'agent_tasks_updated_at',
      'create_site_audit_workflow_run_after_insert',
      'growth_profiles_updated_at',
      'operator_cockpit_actions_updated_at',
      'operator_daily_reflections_updated_at',
      'operator_weekly_priorities_updated_at',
      'outreach_messages_updated_at',
      'project_status_change_comment',
      'prospects_updated_at',
      'update_google_calendar_tokens_updated_at',
      'update_project_github_handoffs_updated_at',
      'update_projects_updated_at',
      'update_workflow_runs_updated_at',
    ]);
    const views = await getPool().query(`select table_name from information_schema.views where table_schema = 'public'`);
    expect(views.rows).toEqual([]);
  });

  it('keeps retained RPC signatures and execution grants narrow', async () => {
    const rpcChecks = [
      ['public.record_ai_employee_decision(uuid,text,text,uuid,date)', true, true, false],
      ['public.provision_ai_employee_pilot(uuid,text,text,text,time without time zone,time without time zone,time without time zone,jsonb,jsonb,jsonb,text,jsonb)', true, true, false],
      ['public.create_ai_employee_work_item(uuid,text,date,text,jsonb,text,text,text,integer,text,text,uuid)', true, true, false],
      ['public.complete_ai_employee_work_item(uuid,text,uuid)', true, true, false],
      ['public.record_ai_employee_outcome(uuid,uuid,text,numeric,bigint,text,text,text,timestamp with time zone,uuid)', true, true, false],
      ['public.store_google_calendar_tokens(uuid,text,text,text,timestamp with time zone,text,text)', true, false, false],
      ['public.get_calendar_access_token(uuid,text)', true, false, false],
      ['public.get_calendar_refresh_token(uuid,text)', true, false, false],
    ] as const;

    for (const [signature, serviceRole, authenticated, anon] of rpcChecks) {
      const result = await getPool().query<{
        procedure_exists: boolean;
        service_role: boolean;
        authenticated: boolean;
        anon: boolean;
        security_definer: boolean;
      }>(
        `select
           to_regprocedure($1) is not null as procedure_exists,
           has_function_privilege('service_role', $1, 'EXECUTE') as service_role,
           has_function_privilege('authenticated', $1, 'EXECUTE') as authenticated,
           has_function_privilege('anon', $1, 'EXECUTE') as anon,
           coalesce((select prosecdef from pg_proc where oid = to_regprocedure($1)), false) as security_definer`,
        [signature],
      );
      expect(result.rows[0]).toEqual({
        procedure_exists: true,
        service_role: serviceRole,
        authenticated,
        anon,
        security_definer: true,
      });
    }
  });

  it('rebuilds project attachments as a private, server-controlled bucket', async () => {
    const bucket = await getPool().query<{
      public: boolean;
      file_size_limit: number;
      allowed_mime_types: string[];
    }>(
      `select public, file_size_limit::integer, allowed_mime_types
       from storage.buckets where id = 'project-attachments'`,
    );
    expect(bucket.rows).toHaveLength(1);
    expect(bucket.rows[0]).toEqual({
      public: false,
      file_size_limit: 5 * 1024 * 1024,
      allowed_mime_types: [
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain',
      ],
    });

    const policies = await getPool().query<{ policyname: string }>(
      `select policyname from pg_policies
       where schemaname = 'storage'
         and tablename = 'objects'
         and (qual like '%project-attachments%' or with_check like '%project-attachments%')`,
    );
    expect(policies.rows).toEqual([]);

    const allBuckets = await getPool().query<{ id: string }>(`select id from storage.buckets order by id`);
    expect(allBuckets.rows).toEqual([{ id: 'project-attachments' }]);
  });
});
