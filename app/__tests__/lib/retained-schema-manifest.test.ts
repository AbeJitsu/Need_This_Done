import { afterAll, describe, expect, it } from 'vitest';
import { closePool, getPool } from '../../../supabase/tests/helpers';

const localDescribe = process.env.RUN_LOCAL_SUPABASE_TESTS === 'true' ? describe : describe.skip;

const retainedTables = [
  'agent_approval_decisions',
  'agent_artifact_versions',
  'agent_artifacts',
  'agent_orchestration_tasks',
  'agent_plan_events',
  'agent_plans',
  'agent_run_commands',
  'agent_run_events',
  'agent_runs',
  'agent_task_dependencies',
  'agent_task_events',
  'agent_tasks',
  'ai_employee_check_in_schedules',
  'ai_employee_decisions',
  'ai_employee_operating_briefs',
  'ai_employee_outcomes',
  'ai_employee_work_items',
  'ai_employees',
  'brand_profiles',
  'calendar_operation_references',
  'content_schedules',
  'customer_accounts',
  'customer_memberships',
  'google_calendar_tokens',
  'growth_profiles',
  'health_check',
  'media_usage_reservations',
  'model_benchmark_candidates',
  'model_evaluation_records',
  'model_usage_ledger',
  'openclaw_model_usage_reservations',
  'operator_cockpit_actions',
  'operator_daily_reflections',
  'operator_weekly_priorities',
  'outreach_messages',
  'project_comments',
  'project_github_handoffs',
  'projects',
  'prospect_dossiers',
  'prospect_outcomes',
  'prospect_sources',
  'prospecting_artifact_provenance',
  'prospects',
  'provider_operations',
  'provider_webhook_receipts',
  'public_engagement_daily_metrics',
  'resend_transactional_events',
  'resend_transactional_messages',
  'sender_events',
  'site_reports',
  'suppression_records',
  'user_roles',
  'website_improvement_invoice_references',
  'worker_callback_nonces',
  'worker_heartbeats',
  'workflow_runs',
] as const;

// These are the repository-retired public objects removed by the isolated
// cleanup gate. Keep the list explicit so a missing object cannot make a
// negative security assertion pass by accident.
const retiredTables = [
  'appointment_notification_log',
  'appointment_reminders',
  'appointment_requests',
  'campaign_clicks',
  'campaign_opens',
  'campaign_recipients',
  'email_campaigns',
  'email_templates',
  'loyalty_redemptions',
  'loyalty_points',
  'loyalty_points_config',
  'referral_credit_usage',
  'referral_transactions',
  'customer_referrals',
  'product_category_mappings',
  'product_categories',
  'product_waitlist',
  'saved_addresses',
  'waitlist_campaign_recipients',
  'waitlist_campaigns',
  'payment_attempts',
  'webhook_events',
  'page_content_history',
  'enrollments',
  'page_content',
  'page_embeddings',
  'page_views',
  'pages',
  'blog_posts',
  'changelog_entries',
  'media',
  'review_reports',
  'review_votes',
  'template_reviews',
  'template_purchases',
  'product_similarities',
  'product_interactions',
  'coupon_usage',
  'user_currency_preferences',
  'exchange_rates',
  'payments',
  'cart_reminders',
  'orders',
  'quotes',
  'reviews',
  'marketplace_templates',
  'template_categories',
  'coupons',
  'currencies',
  'stripe_customers',
  'subscriptions',
  'demo_items',
  'wizard_sessions',
  'account_holder',
  'api_key',
  'application_method_buy_rules',
  'application_method_target_rules',
  'auth_identity',
  'capture',
  'cart',
  'cart_address',
  'cart_line_item',
  'cart_line_item_adjustment',
  'cart_line_item_tax_line',
  'cart_payment_collection',
  'cart_promotion',
  'cart_shipping_method',
  'cart_shipping_method_adjustment',
  'cart_shipping_method_tax_line',
  'credit_line',
  'customer',
  'customer_account_holder',
  'customer_address',
  'customer_group',
  'customer_group_customer',
  'fulfillment',
  'fulfillment_address',
  'fulfillment_item',
  'fulfillment_label',
  'fulfillment_provider',
  'fulfillment_set',
  'geo_zone',
  'image',
  'inventory_item',
  'inventory_level',
  'invite',
  'link_module_migrations',
  'location_fulfillment_provider',
  'location_fulfillment_set',
  'mikro_orm_migrations',
  'notification',
  'notification_provider',
  'order',
  'order_address',
  'order_cart',
  'order_change',
  'order_change_action',
  'order_claim',
  'order_claim_item',
  'order_claim_item_image',
  'order_credit_line',
  'order_exchange',
  'order_exchange_item',
  'order_fulfillment',
  'order_item',
  'order_line_item',
  'order_line_item_adjustment',
  'order_line_item_tax_line',
  'order_payment_collection',
  'order_promotion',
  'order_shipping',
  'order_shipping_method',
  'order_shipping_method_adjustment',
  'order_shipping_method_tax_line',
  'order_summary',
  'order_transaction',
  'payment',
  'payment_collection',
  'payment_collection_payment_providers',
  'payment_provider',
  'payment_session',
  'price',
  'price_list',
  'price_list_rule',
  'price_preference',
  'price_rule',
  'price_set',
  'product',
  'product_category',
  'product_category_product',
  'product_collection',
  'product_option',
  'product_option_value',
  'product_sales_channel',
  'product_shipping_profile',
  'product_tag',
  'product_tags',
  'product_type',
  'product_variant',
  'product_variant_inventory_item',
  'product_variant_option',
  'product_variant_price_set',
  'product_variant_product_image',
  'promotion',
  'promotion_application_method',
  'promotion_campaign',
  'promotion_campaign_budget',
  'promotion_campaign_budget_usage',
  'promotion_promotion_rule',
  'promotion_rule',
  'promotion_rule_value',
  'provider_identity',
  'publishable_api_key_sales_channel',
  'refund',
  'refund_reason',
  'region',
  'region_country',
  'region_payment_provider',
  'reservation_item',
  'return',
  'return_fulfillment',
  'return_item',
  'return_reason',
  'sales_channel',
  'sales_channel_stock_location',
  'script_migrations',
  'service_zone',
  'shipping_option',
  'shipping_option_price_set',
  'shipping_option_rule',
  'shipping_option_type',
  'shipping_profile',
  'stock_location',
  'stock_location_address',
  'store',
  'store_currency',
  'store_locale',
  'tax_provider',
  'tax_rate',
  'tax_rate_rule',
  'tax_region',
  'user',
  'user_preference',
  'user_rbac_role',
  'view_configuration',
  'workflow_execution',
] as const;

const retiredViews = [
  'loyalty_points_balance',
  'page_view_stats',
  'cart_reminder_stats',
  'featured_templates',
  'popular_products',
  'popular_templates',
  'product_ratings',
  'trending_products',
] as const;

const retiredBuckets = ['media-library', 'product-images'] as const;

const requiredPolicies = [
  ['ai_employee_check_in_schedules', 'operators read employee schedules', 'SELECT'],
  ['ai_employee_decisions', 'operators read employee decisions', 'SELECT'],
  ['ai_employee_operating_briefs', 'operators read employee briefs', 'SELECT'],
  ['ai_employee_outcomes', 'operators read employee outcomes', 'SELECT'],
  ['ai_employee_work_items', 'operators read employee work', 'SELECT'],
  ['ai_employees', 'operators read employees', 'SELECT'],
  ['customer_accounts', 'operators read customer accounts', 'SELECT'],
  ['customer_memberships', 'operators read retired memberships', 'SELECT'],
  ['project_comments', 'operators read project comments', 'SELECT'],
  ['project_comments', 'operators create project comments', 'INSERT'],
  ['projects', 'operators read projects', 'SELECT'],
  ['projects', 'operators update projects', 'UPDATE'],
  ['site_reports', 'No direct insert', 'INSERT'],
  ['user_roles', 'Users can read own role', 'SELECT'],
  ['workflow_runs', 'Operators can read workflow runs', 'SELECT'],
  ['workflow_runs', 'Operators can update workflow runs', 'UPDATE'],
  ['operator_cockpit_actions', 'owners read cockpit actions', 'SELECT'],
  ['operator_daily_reflections', 'owners read daily reflections', 'SELECT'],
  ['operator_weekly_priorities', 'owners read weekly priorities', 'SELECT'],
    ['growth_profiles', 'admins read growth profiles', 'SELECT'],
      ['model_benchmark_candidates', 'admins read model benchmark candidates', 'SELECT'],
      ['model_evaluation_records', 'admins read model evaluation records', 'SELECT'],
      ['model_usage_ledger', 'admins read model usage ledger', 'SELECT'],
    ['prospect_dossiers', 'admins read prospect dossiers', 'SELECT'],
    ['prospects', 'admins read prospects', 'SELECT'],
    ['outreach_messages', 'admins read outreach', 'SELECT'],
    ['suppression_records', 'admins read suppression', 'SELECT'],
    ['agent_tasks', 'admins read agent tasks', 'SELECT'],
    ['sender_events', 'admins read sender events', 'SELECT'],
    ['agent_plans', 'operators own agent plans', 'SELECT'],
    ['agent_plan_events', 'operators read agent plan events', 'SELECT'],
    ['openclaw_model_usage_reservations', 'operators read OpenClaw usage', 'SELECT'],
    ['prospecting_artifact_provenance', 'operators read prospecting provenance', 'SELECT'],
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

  it('explicitly confirms retired public objects and buckets are absent', async () => {
    const relations = await getPool().query<{ relname: string }>(
      `select c.relname
       from pg_class c
       join pg_namespace n on n.oid = c.relnamespace
       where n.nspname = 'public'
         and c.relname = any($1::text[])
         and c.relkind in ('r', 'p', 'v', 'm', 'f')
       order by c.relname`,
      [[...retiredTables, ...retiredViews]],
    );
    expect(relations.rows).toEqual([]);

    const medusaSchema = await getPool().query<{ exists: boolean }>(
      `select to_regnamespace('medusa') is not null as exists`,
    );
    expect(medusaSchema.rows[0]?.exists).toBe(false);

    const buckets = await getPool().query<{ id: string }>(
      `select id from storage.buckets where id = any($1::text[]) order by id`,
      [retiredBuckets],
    );
    expect(buckets.rows).toEqual([]);
  });

  it('explicitly confirms the retained public tables remain present', async () => {
    const result = await getPool().query<{ relname: string }>(
      `select c.relname
       from pg_class c
       join pg_namespace n on n.oid = c.relnamespace
       where n.nspname = 'public'
         and c.relkind = 'r'
         and c.relname = any($1::text[])
       order by c.relname`,
      [retainedTables],
    );
    expect(result.rows.map((row) => row.relname)).toEqual([...retainedTables]);
  });

  it('preserves the critical retained columns and types', async () => {
    const expected = [
      ['agent_orchestration_tasks', 'actual_model_id', 'text'],
      ['agent_orchestration_tasks', 'provider_usage', 'jsonb'],
      ['agent_runs', 'scheduled_for', 'timestamptz'],
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
      ['customer_memberships', 'access_retired_at', 'timestamptz'],
      ['google_calendar_tokens', 'access_token_encrypted', 'bytea'],
      ['google_calendar_tokens', 'refresh_token_encrypted', 'bytea'],
      ['model_evaluation_records', 'actual_model_id', 'text'],
      ['model_usage_ledger', 'actual_model_id', 'text'],
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
      ['outreach_messages', 'provider_operation_id', 'uuid'],
      ['project_github_handoffs', 'notification_idempotency_key', 'uuid'],
      ['project_github_handoffs', 'notification_operation_id', 'uuid'],
      ['project_github_handoffs', 'notification_status', 'text'],
      ['projects', 'alternate_consultation_at', 'timestamptz'],
      ['projects', 'attachments', '_text'],
      ['projects', 'consultation_type', 'text'],
      ['projects', 'customer_id', 'uuid'],
      ['projects', 'preferred_consultation_at', 'timestamptz'],
      ['provider_operations', 'idempotency_key', 'text'],
      ['provider_webhook_receipts', 'payload_sha256', 'text'],
      ['website_improvement_invoice_references', 'amount_cents', 'int4'],
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
      'growth_profiles_selected_model_check',
      'model_evaluation_records_actual_model_id_check',
      'model_usage_ledger_actual_model_id_check',
      'model_benchmark_candidates_candidate_kind_check',
      'agent_plans_owner_id_idempotency_key_key',
      'agent_plans_run_id_key',
      'agent_plans_openclaw_safety_flags_present_check',
      'openclaw_model_usage_reservations_reservation_key_key',
      'provider_operations_provider_idempotency_key_key',
      'provider_webhook_receipts_provider_provider_event_id_key',
      'outreach_messages_provider_operation_id_fkey',
      'outreach_messages_provider_operation_id_key',
      'project_github_handoffs_notification_idempotency_key_key',
      'project_github_handoffs_notification_operation_id_fkey',
      'project_github_handoffs_notification_operation_id_key',
      'website_improvement_invoice_references_amount_cents_check',
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
      `select distinct trigger_name from information_schema.triggers
       where trigger_schema = 'public'
       order by trigger_name`,
    );
    expect(triggers.rows.map((row) => row.trigger_name)).toEqual([
      'agent_tasks_updated_at',
      'create_site_audit_workflow_run_after_insert',
      'github_handoff_provider_operation_link',
      'growth_profiles_updated_at',
      'model_benchmark_candidates_updated_at',
      'operator_cockpit_actions_updated_at',
      'operator_daily_reflections_updated_at',
      'operator_weekly_priorities_updated_at',
      'outreach_messages_updated_at',
      'outreach_provider_operation_link',
      'prevent_agent_approval_decision_mutation',
      'prevent_agent_artifact_version_update',
      'prevent_agent_run_command_mutation',
      'prevent_agent_run_event_mutation',
      'project_status_change_comment',
      'prospect_dossiers_updated_at',
      'prospects_updated_at',
      'provider_operations_request_immutable',
      'update_agent_artifacts_updated_at',
      'update_agent_orchestration_tasks_updated_at',
      'update_agent_plans_updated_at',
      'update_agent_runs_updated_at',
      'update_brand_profiles_updated_at',
      'update_content_schedules_updated_at',
      'update_google_calendar_tokens_updated_at',
      'update_project_github_handoffs_updated_at',
      'update_projects_updated_at',
      'update_worker_heartbeats_updated_at',
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
      ['public.claim_private_prospecting_task(text,integer)', true, false, false],
      ['public.queue_due_private_prospecting_tasks()', true, false, false],
      ['public.reserve_private_model_usage(uuid,uuid,text,uuid,text,text,numeric)', true, false, false],
      ['public.reconcile_private_model_usage(uuid,numeric,jsonb)', true, false, false],
      ['public.record_private_prospect_dossier(uuid,text,text,jsonb)', true, false, false],
      ['public.pin_private_primary_model(uuid,text,text,text)', true, false, false],
      ['public.record_private_model_actual(uuid,text)', true, false, false],
      ['public.promote_prospect_dossier(uuid)', true, true, false],
      ['public.create_agent_plan(text,text,jsonb,jsonb,jsonb,jsonb,uuid,text,text,text,integer,integer,integer,numeric,jsonb,jsonb,uuid)', true, true, false],
      ['public.update_agent_plan(uuid,text,jsonb,jsonb,jsonb,jsonb,jsonb,uuid)', true, true, false],
      ['public.reject_agent_plan(uuid,uuid,text)', true, true, false],
      ['public.approve_agent_plan(uuid,uuid,text)', true, true, false],
      ['public.dispatch_agent_plan(uuid,uuid)', true, true, false],
      ['public.reserve_openclaw_model_usage(uuid,uuid,uuid,uuid,text,uuid,numeric)', true, false, false],
      ['public.reconcile_openclaw_model_usage(uuid,numeric,jsonb)', true, false, false],
      ['public.record_openclaw_prospecting_result(uuid,text,text,uuid,uuid,jsonb)', true, false, false],
      ['public.complete_openclaw_orchestration_task(uuid,text,text,jsonb,text,jsonb,uuid,jsonb)', true, false, false],
      ['public.complete_agent_orchestration_task(uuid,text,text,jsonb,text,jsonb)', true, false, false],
      ['public.claim_openclaw_agent_orchestration_task(uuid,text,integer)', true, false, false],
      ['public.complete_openclaw_task_with_provenance(uuid,text,text,jsonb,text,jsonb,uuid,numeric,text,jsonb,jsonb)', true, false, false],
      ['public.abort_openclaw_task_before_provider(uuid,text,text)', true, false, false],
      ['public.upsert_provider_operation(text,text,text,text,text,jsonb,jsonb,text)', true, false, false],
      ['public.record_provider_webhook_receipt(text,text,text,boolean)', true, false, false],
      ['public.complete_provider_webhook_receipt(uuid)', true, false, false],
      ['public.fail_provider_webhook_receipt(uuid,text,boolean)', true, false, false],
      ['public.accept_resend_transactional_operation(uuid,uuid,text,text,text)', true, false, false],
      ['public.accept_github_handoff_operation(uuid,uuid,text,text,text)', true, false, false],
      ['public.accept_resend_prospecting_operation(uuid,uuid,text)', true, false, false],
      ['public.mark_resend_acceptance_unknown(uuid,text)', true, false, false],
      ['public.assert_provider_operation_retryable(uuid)', true, false, false],
      ['public.reconcile_resend_provider_operation(uuid,text,text)', true, false, false],
      ['public.record_resend_transactional_message(uuid,uuid,text,text,text,text)', true, false, false],
      ['public.record_resend_transactional_event(uuid,text,text,timestamp with time zone)', true, false, false],
      ['public.record_calendar_operation_reference(uuid,uuid,uuid,text,text,text)', true, false, false],
      ['public.accept_calendar_operation(uuid,uuid,uuid,text,text)', true, false, false],
      ['public.record_website_improvement_invoice_reference(uuid,uuid,text,text)', true, false, false],
      ['public.record_stripe_invoice_event(uuid,text,text)', true, false, false],
      ['public.accept_website_improvement_invoice(uuid,uuid,text)', true, false, false],
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
      expect(result.rows[0], signature).toEqual({
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

    const agentBucket = await getPool().query<{
      public: boolean;
      file_size_limit: number;
      allowed_mime_types: string[];
    }>(
      `select public, file_size_limit::integer, allowed_mime_types
       from storage.buckets where id = 'agent-media-private'`,
    );
    expect(agentBucket.rows).toEqual([{
      public: false,
      file_size_limit: 50 * 1024 * 1024,
      allowed_mime_types: [
        'image/png',
        'image/jpeg',
        'image/webp',
        'video/mp4',
        'audio/mpeg',
        'audio/wav',
        'text/vtt',
        'application/x-subrip',
        'text/plain',
      ],
    }]);

    const allBuckets = await getPool().query<{ id: string }>(`select id from storage.buckets order by id`);
    expect(allBuckets.rows).toEqual([
      { id: 'agent-media-private' },
      { id: 'project-attachments' },
    ]);
  });
});
