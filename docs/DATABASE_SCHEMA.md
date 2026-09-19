# Private Hosted Supabase Database Inventory

**Generated:** 2026-09-19T03:51:56.546431+00:00
**Project:** `oxhjtmozsdstbokwtnwa`
**Migration entries:** 110

> Internal repository document. This inventory contains schema metadata only; it does not contain table rows, user identifiers, token values, credentials, connection strings, or secrets. Do not publish it on the public site.

## Authority and scope

- GitHub `supabase/migrations/` is the versioned change history.
- Hosted Supabase migration history is the applied-state record.
- This file is a generated, human-readable snapshot of the hosted public schema; it never replaces migrations.
- Scope: public tables, partitioned tables, views, materialized views, RLS policies, public function signatures/security modes, and role grants for `anon`, `authenticated`, and `service_role`.

## Applied migration ledger

| Version | Name |
| --- | --- |
| 001 | create_demo_items_table |
| 002 | create_projects_table |
| 003 | add_user_id_and_admin_roles |
| 004 | create_project_comments |
| 005 | create_pages_table |
| 006 | create_medusa_orders_table |
| 007 | enable_pgvector |
| 008 | create_page_embeddings |
| 009 | create_page_content_table |
| 010 | create_stripe_tables |
| 011 | add_requires_appointment_to_orders |
| 012 | create_google_calendar_tokens |
| 013 | create_appointment_requests |
| 014 | create_product_images_storage |
| 015 | create_medusa_schema |
| 016 | create_health_check_table |
| 017 | fix_status_comment_trigger |
| 020 | create_media_library_storage |
| 021 | create_blog_posts_table |
| 022 | create_page_views_table |
| 023 | create_enrollments_table |
| 024 | create_cart_reminders_table |
| 025 | create_product_interactions_table |
| 026 | create_coupons_table |
| 027 | create_currencies_table |
| 028 | create_reviews_table |
| 029 | create_templates_marketplace_table |
| 032 | fix_function_search_paths |
| 033 | move_extensions_from_public |
| 034 | fix_record_product_interaction |
| 035 | create_page_content_history |
| 036 | create_changelog_entries |
| 037 | create_quotes_table |
| 038 | add_quote_id_to_orders |
| 039 | repair_orders_table |
| 040 | create_webhook_events_table |
| 041 | create_quote_transaction_function |
| 042 | create_appointment_reminders_table |
| 043 | prevent_appointment_double_booking |
| 044 | track_appointment_notifications |
| 045 | create_product_waitlist_table |
| 046 | create_saved_addresses_table |
| 047 | create_product_categories_table |
| 048 | create_waitlist_campaigns_table |
| 049 | create_referral_system |
| 050 | create_email_templates_tables |
| 051 | create_loyalty_points_system |
| 052 | add_deposit_payment_fields |
| 053 | add_payment_attempts_table |
| 054 | workflow_automation |
| 055 | database_security_hardening |
| 056 | fix_function_bugs |
| 057 | database_security_hardening_repair |
| 058 | comprehensive_security_fix |
| 059 | final_security_fixes |
| 060 | fix_remaining_always_true_policies |
| 061 | move_vector_to_extensions_schema |
| 062 | fix_unused_variables |
| 063 | fix_appointment_admin_policies |
| 064 | site_reports |
| 065 | wizard_sessions |
| 066 | remove_workflow_automation |
| 067 | secure_site_reports |
| 068 | add_project_consultation_preferences |
| 069 | provision_initial_operator_roles |
| 070 | create_operator_workflow_runs |
| 071 | create_project_github_handoffs |
| 072 | ai_employee_customer_boundary |
| 073 | secure_google_calendar_tokens |
| 074 | create_private_project_attachments_bucket |
| 075 | add_financial_ai_employee_outcomes |
| 076 | operable_internal_pilot |
| 077 | fix_pilot_timezone_queue_author |
| 078 | require_completion_evidence |
| 079 | prospecting_outreach |
| 080 | daily_cockpit |
| 081 | bound_model_evaluation_budget |
| 082 | private_prospect_research_suite |
| 083 | agent_operations_dashboard |
| 084 | configured_openrouter_models |
| 085 | agent_planner_openclaw_adapter |
| 086 | agent_planner_write_boundary |
| 087 | fix_agent_plan_dispatch_aggregate |
| 088 | openclaw_claim_boundary |
| 089 | agent_plan_fail_closed_validation |
| 090 | remove_local_only_legacy_schema |
| 091 | remove_content_and_search_schema |
| 092 | remove_marketplace_and_commerce_schema |
| 093 | revoke_anonymous_project_attachments_policies |
| 094 | restore_service_worker_claim_context |
| 095 | allow_hosted_parity_fixture_cleanup |
| 096 | openrouter_dynamic_route_evidence |
| 097 | retire_hardcoded_deepseek_fallback |
| 098 | fail_closed_openclaw_schedule_and_provenance |
| 099 | harden_frozen_plan_worker_boundary |
| 100 | provider_operation_and_webhook_ledger |
| 101 | resend_provider_records |
| 102 | calendar_provider_references |
| 103 | website_improvement_invoice_references |
| 104 | provider_recovery_atomicity |
| 105 | operator_only_private_surfaces |
| 106 | provider_workflow_recovery_links |
| 20260915183432 | 115_lock_down_retired_public_tables |
| 20260919021328 | 110_harden_hermes_frozen_plan_claims |
| 20260919021354 | 111_split_hermes_planner_and_openclaw_executor_models |
| 20260919021425 | 112_match_crib_public_journey |
| 20260919021451 | 113_mcp_access_tokens |
| 20260919021515 | 114_authenticated_workspace_read_surface |
| 20260919021547 | 115_hermes_scheduler_draft_runs |
| 20260919021901 | 116_lock_down_hermes_scheduler_browser_grants |

## Installed extensions

| Extension | Version |
| --- | --- |
| pg_stat_statements | 1.11 |
| pg_trgm | 1.6 |
| pgcrypto | 1.3 |
| plpgsql | 1.0 |
| supabase_vault | 0.3.1 |
| uuid-ossp | 1.1 |
| vector | 0.8.0 |

## Public relations

### `account_holder` (table)

- RLS: **enabled**
- Primary key: `id`

| Column | Type | Nullable |
| --- | --- | --- |
| `id` | text | no |
| `provider_id` | text | no |
| `external_id` | text | no |
| `email` | text | yes |
| `data` | jsonb | no |
| `metadata` | jsonb | yes |
| `created_at` | timestamp with time zone (timestamptz) | no |
| `updated_at` | timestamp with time zone (timestamptz) | no |
| `deleted_at` | timestamp with time zone (timestamptz) | yes |

### `agent_approval_decisions` (table)

- RLS: **enabled**
- Primary key: `id`

| Column | Type | Nullable |
| --- | --- | --- |
| `id` | uuid | no |
| `owner_id` | uuid | no |
| `artifact_id` | uuid | no |
| `operator_id` | uuid | no |
| `decision` | text | no |
| `note` | text | no |
| `idempotency_key` | uuid | no |
| `request_hash` | text | no |
| `created_at` | timestamp with time zone (timestamptz) | no |

Foreign keys:
- `agent_approval_decisions_artifact_id_fkey`: `artifact_id` → `agent_artifacts` (`id`)
- `agent_approval_decisions_operator_id_fkey`: `operator_id` → `auth.users` (`id`)
- `agent_approval_decisions_owner_id_fkey`: `owner_id` → `auth.users` (`id`)

### `agent_artifact_versions` (table)

- RLS: **enabled**
- Primary key: `id`

| Column | Type | Nullable |
| --- | --- | --- |
| `id` | uuid | no |
| `owner_id` | uuid | no |
| `artifact_id` | uuid | no |
| `version_number` | integer (int4) | no |
| `content_text` | text | yes |
| `storage_path` | text | yes |
| `mime_type` | text | yes |
| `byte_size` | bigint (int8) | yes |
| `sha256` | text | yes |
| `metadata` | jsonb | no |
| `created_by` | text | no |
| `created_at` | timestamp with time zone (timestamptz) | no |

Foreign keys:
- `agent_artifact_versions_artifact_id_fkey`: `artifact_id` → `agent_artifacts` (`id`)
- `agent_artifact_versions_owner_id_fkey`: `owner_id` → `auth.users` (`id`)

### `agent_artifacts` (table)

- RLS: **enabled**
- Primary key: `id`

| Column | Type | Nullable |
| --- | --- | --- |
| `id` | uuid | no |
| `owner_id` | uuid | no |
| `run_id` | uuid | no |
| `task_id` | uuid | yes |
| `artifact_type` | text | no |
| `title` | text | no |
| `status` | text | no |
| `current_version_id` | uuid | yes |
| `metadata` | jsonb | no |
| `reviewed_by` | uuid | yes |
| `reviewed_at` | timestamp with time zone (timestamptz) | yes |
| `created_at` | timestamp with time zone (timestamptz) | no |
| `updated_at` | timestamp with time zone (timestamptz) | no |

Foreign keys:
- `agent_artifacts_current_version_fk`: `current_version_id` → `agent_artifact_versions` (`id`)
- `agent_artifacts_owner_id_fkey`: `owner_id` → `auth.users` (`id`)
- `agent_artifacts_reviewed_by_fkey`: `reviewed_by` → `auth.users` (`id`)
- `agent_artifacts_run_id_fkey`: `run_id` → `agent_runs` (`id`)
- `agent_artifacts_task_id_fkey`: `task_id` → `agent_orchestration_tasks` (`id`)

### `agent_orchestration_tasks` (table)

- RLS: **enabled**
- Primary key: `id`

| Column | Type | Nullable |
| --- | --- | --- |
| `id` | uuid | no |
| `owner_id` | uuid | no |
| `run_id` | uuid | no |
| `task_key` | text | no |
| `agent_role` | text | no |
| `agent_provider` | text | no |
| `model_id` | text | yes |
| `capabilities` | jsonb | no |
| `task_type` | text | no |
| `status` | text | no |
| `input` | jsonb | no |
| `output` | jsonb | yes |
| `attempt_count` | integer (int4) | no |
| `max_attempts` | integer (int4) | no |
| `leased_by` | text | yes |
| `lease_expires_at` | timestamp with time zone (timestamptz) | yes |
| `progress` | integer (int4) | no |
| `last_error` | text | yes |
| `created_at` | timestamp with time zone (timestamptz) | no |
| `started_at` | timestamp with time zone (timestamptz) | yes |
| `completed_at` | timestamp with time zone (timestamptz) | yes |
| `updated_at` | timestamp with time zone (timestamptz) | no |
| `plan_id` | uuid | yes |
| `growth_profile_id` | uuid | yes |
| `approved_plan_snapshot` | jsonb | yes |
| `actual_model_id` | text | yes |
| `provider_usage` | jsonb | no |

Foreign keys:
- `agent_orchestration_tasks_growth_profile_id_fkey`: `growth_profile_id` → `growth_profiles` (`id`)
- `agent_orchestration_tasks_owner_id_fkey`: `owner_id` → `auth.users` (`id`)
- `agent_orchestration_tasks_plan_id_fkey`: `plan_id` → `agent_plans` (`id`)
- `agent_orchestration_tasks_run_id_fkey`: `run_id` → `agent_runs` (`id`)

### `agent_plan_events` (table)

- RLS: **enabled**
- Primary key: `id`

| Column | Type | Nullable |
| --- | --- | --- |
| `id` | bigint (int8) | no |
| `owner_id` | uuid | no |
| `plan_id` | uuid | no |
| `event_type` | text | no |
| `payload` | jsonb | no |
| `idempotency_key` | uuid | no |
| `request_hash` | text | no |
| `created_at` | timestamp with time zone (timestamptz) | no |

Foreign keys:
- `agent_plan_events_owner_id_fkey`: `owner_id` → `auth.users` (`id`)
- `agent_plan_events_plan_id_fkey`: `plan_id` → `agent_plans` (`id`)

### `agent_plans` (table)

- RLS: **enabled**
- Primary key: `id`

| Column | Type | Nullable |
| --- | --- | --- |
| `id` | uuid | no |
| `owner_id` | uuid | no |
| `growth_profile_id` | uuid | no |
| `workflow_type` | text | no |
| `original_request` | text | no |
| `rewritten_instruction` | text | no |
| `steps` | jsonb | no |
| `allowed_capabilities` | jsonb | no |
| `forbidden_actions` | jsonb | no |
| `expected_artifacts` | jsonb | no |
| `selected_model_id` | text | no |
| `model_route` | text | no |
| `estimated_prompt_tokens` | integer (int4) | no |
| `estimated_completion_tokens` | integer (int4) | no |
| `estimated_web_search_calls` | integer (int4) | no |
| `estimated_cost_usd` | numeric | no |
| `planner_usage` | jsonb | no |
| `openclaw_instruction` | jsonb | no |
| `status` | text | no |
| `idempotency_key` | uuid | no |
| `request_hash` | text | no |
| `approved_snapshot` | jsonb | yes |
| `approved_by` | uuid | yes |
| `approved_at` | timestamp with time zone (timestamptz) | yes |
| `rejected_by` | uuid | yes |
| `rejected_at` | timestamp with time zone (timestamptz) | yes |
| `run_id` | uuid | yes |
| `dispatch_idempotency_key` | uuid | yes |
| `created_at` | timestamp with time zone (timestamptz) | no |
| `updated_at` | timestamp with time zone (timestamptz) | no |
| `executor_model_id` | text | no |

Foreign keys:
- `agent_plans_approved_by_fkey`: `approved_by` → `auth.users` (`id`)
- `agent_plans_growth_profile_id_fkey`: `growth_profile_id` → `growth_profiles` (`id`)
- `agent_plans_owner_id_fkey`: `owner_id` → `auth.users` (`id`)
- `agent_plans_rejected_by_fkey`: `rejected_by` → `auth.users` (`id`)
- `agent_plans_run_id_fkey`: `run_id` → `agent_runs` (`id`)

### `agent_run_commands` (table)

- RLS: **enabled**
- Primary key: `id`

| Column | Type | Nullable |
| --- | --- | --- |
| `id` | uuid | no |
| `owner_id` | uuid | no |
| `run_id` | uuid | no |
| `command` | text | no |
| `idempotency_key` | uuid | no |
| `request_hash` | text | no |
| `result` | jsonb | no |
| `created_at` | timestamp with time zone (timestamptz) | no |

Foreign keys:
- `agent_run_commands_owner_id_fkey`: `owner_id` → `auth.users` (`id`)
- `agent_run_commands_run_id_fkey`: `run_id` → `agent_runs` (`id`)

### `agent_run_events` (table)

- RLS: **enabled**
- Primary key: `id`

| Column | Type | Nullable |
| --- | --- | --- |
| `id` | bigint (int8) | no |
| `owner_id` | uuid | no |
| `run_id` | uuid | no |
| `task_id` | uuid | yes |
| `event_type` | text | no |
| `payload` | jsonb | no |
| `created_at` | timestamp with time zone (timestamptz) | no |

Foreign keys:
- `agent_run_events_owner_id_fkey`: `owner_id` → `auth.users` (`id`)
- `agent_run_events_run_id_fkey`: `run_id` → `agent_runs` (`id`)
- `agent_run_events_task_id_fkey`: `task_id` → `agent_orchestration_tasks` (`id`)

### `agent_runs` (table)

- RLS: **enabled**
- Primary key: `id`

| Column | Type | Nullable |
| --- | --- | --- |
| `id` | uuid | no |
| `owner_id` | uuid | no |
| `workflow_type` | text | no |
| `status` | text | no |
| `title` | text | no |
| `input` | jsonb | no |
| `output` | jsonb | yes |
| `idempotency_key` | uuid | no |
| `request_hash` | text | no |
| `requested_by` | uuid | no |
| `paused_at` | timestamp with time zone (timestamptz) | yes |
| `completed_at` | timestamp with time zone (timestamptz) | yes |
| `created_at` | timestamp with time zone (timestamptz) | no |
| `updated_at` | timestamp with time zone (timestamptz) | no |
| `plan_id` | uuid | yes |
| `approved_plan_snapshot` | jsonb | yes |
| `scheduled_for` | timestamp with time zone (timestamptz) | no |

Foreign keys:
- `agent_runs_owner_id_fkey`: `owner_id` → `auth.users` (`id`)
- `agent_runs_plan_id_fkey`: `plan_id` → `agent_plans` (`id`)
- `agent_runs_requested_by_fkey`: `requested_by` → `auth.users` (`id`)

### `agent_task_dependencies` (table)

- RLS: **enabled**
- Primary key: `task_id`, `depends_on_task_id`

| Column | Type | Nullable |
| --- | --- | --- |
| `task_id` | uuid | no |
| `depends_on_task_id` | uuid | no |
| `created_at` | timestamp with time zone (timestamptz) | no |

Foreign keys:
- `agent_task_dependencies_depends_on_task_id_fkey`: `depends_on_task_id` → `agent_orchestration_tasks` (`id`)
- `agent_task_dependencies_task_id_fkey`: `task_id` → `agent_orchestration_tasks` (`id`)

### `agent_task_events` (table)

- RLS: **enabled**
- Primary key: `id`

| Column | Type | Nullable |
| --- | --- | --- |
| `id` | bigint (int8) | no |
| `task_id` | uuid | no |
| `event_type` | text | no |
| `payload` | jsonb | no |
| `created_at` | timestamp with time zone (timestamptz) | no |

Foreign keys:
- `agent_task_events_task_id_fkey`: `task_id` → `agent_tasks` (`id`)

### `agent_tasks` (table)

- RLS: **enabled**
- Primary key: `id`

| Column | Type | Nullable |
| --- | --- | --- |
| `id` | uuid | no |
| `profile_id` | uuid | no |
| `task_type` | text | no |
| `status` | text | no |
| `input` | jsonb | no |
| `output` | jsonb | yes |
| `attempt_count` | integer (int4) | no |
| `max_attempts` | integer (int4) | no |
| `idempotency_key` | uuid | no |
| `leased_by` | text | yes |
| `lease_expires_at` | timestamp with time zone (timestamptz) | yes |
| `last_error` | text | yes |
| `model_name` | text | yes |
| `prompt_tokens` | integer (int4) | yes |
| `completion_tokens` | integer (int4) | yes |
| `cost` | numeric | no |
| `created_at` | timestamp with time zone (timestamptz) | no |
| `started_at` | timestamp with time zone (timestamptz) | yes |
| `completed_at` | timestamp with time zone (timestamptz) | yes |
| `updated_at` | timestamp with time zone (timestamptz) | no |

Foreign keys:
- `agent_tasks_profile_id_fkey`: `profile_id` → `growth_profiles` (`id`)

### `ai_employee_check_in_schedules` (table)

- RLS: **enabled**
- Primary key: `id`

| Column | Type | Nullable |
| --- | --- | --- |
| `id` | uuid | no |
| `employee_id` | uuid | no |
| `check_in_type` | text | no |
| `local_time` | time without time zone (time) | no |
| `timezone` | text | no |
| `enabled` | boolean (bool) | no |

Foreign keys:
- `ai_employee_check_in_schedules_employee_id_fkey`: `employee_id` → `ai_employees` (`id`)

### `ai_employee_decisions` (table)

- RLS: **enabled**
- Primary key: `id`

| Column | Type | Nullable |
| --- | --- | --- |
| `id` | uuid | no |
| `work_item_id` | uuid | no |
| `decided_by` | uuid | no |
| `decision` | text | no |
| `instructions` | text | yes |
| `idempotency_key` | uuid | no |
| `created_at` | timestamp with time zone (timestamptz) | no |

Foreign keys:
- `ai_employee_decisions_decided_by_fkey`: `decided_by` → `auth.users` (`id`)
- `ai_employee_decisions_work_item_id_fkey`: `work_item_id` → `ai_employee_work_items` (`id`)

### `ai_employee_operating_briefs` (table)

- RLS: **enabled**
- Primary key: `id`

| Column | Type | Nullable |
| --- | --- | --- |
| `id` | uuid | no |
| `employee_id` | uuid | no |
| `version` | integer (int4) | no |
| `responsibilities` | jsonb | no |
| `prohibited_actions` | jsonb | no |
| `channels` | jsonb | no |
| `tone` | text | yes |
| `approval_rules` | jsonb | no |
| `created_at` | timestamp with time zone (timestamptz) | no |

Foreign keys:
- `ai_employee_operating_briefs_employee_id_fkey`: `employee_id` → `ai_employees` (`id`)

### `ai_employee_outcomes` (table)

- RLS: **enabled**
- Primary key: `id`

| Column | Type | Nullable |
| --- | --- | --- |
| `id` | uuid | no |
| `employee_id` | uuid | no |
| `work_item_id` | uuid | yes |
| `kind` | text | no |
| `value` | numeric | no |
| `notes` | text | yes |
| `occurred_at` | timestamp with time zone (timestamptz) | no |
| `amount_cents` | bigint (int8) | yes |
| `currency` | text | yes |
| `cost_category` | text | yes |
| `recorded_by` | uuid | yes |
| `idempotency_key` | uuid | yes |

Foreign keys:
- `ai_employee_outcomes_employee_id_fkey`: `employee_id` → `ai_employees` (`id`)
- `ai_employee_outcomes_recorded_by_fkey`: `recorded_by` → `auth.users` (`id`)
- `ai_employee_outcomes_work_item_id_fkey`: `work_item_id` → `ai_employee_work_items` (`id`)

### `ai_employee_work_items` (table)

- RLS: **enabled**
- Primary key: `id`

| Column | Type | Nullable |
| --- | --- | --- |
| `id` | uuid | no |
| `employee_id` | uuid | no |
| `predecessor_work_item_id` | uuid | yes |
| `source_type` | text | yes |
| `source_id` | text | yes |
| `queue` | text | no |
| `scheduled_date` | date | no |
| `title` | text | no |
| `evidence` | jsonb | no |
| `proposed_action` | text | no |
| `expected_outcome` | text | yes |
| `risk_level` | text | no |
| `priority` | integer (int4) | no |
| `status` | text | no |
| `external_action_key` | text | yes |
| `created_at` | timestamp with time zone (timestamptz) | no |
| `completed_by` | uuid | yes |
| `completed_at` | timestamp with time zone (timestamptz) | yes |
| `completion_notes` | text | yes |
| `completion_idempotency_key` | uuid | yes |
| `created_by` | uuid | yes |

Foreign keys:
- `ai_employee_work_items_completed_by_fkey`: `completed_by` → `auth.users` (`id`)
- `ai_employee_work_items_created_by_fkey`: `created_by` → `auth.users` (`id`)
- `ai_employee_work_items_employee_id_fkey`: `employee_id` → `ai_employees` (`id`)
- `ai_employee_work_items_predecessor_work_item_id_fkey`: `predecessor_work_item_id` → `ai_employee_work_items` (`id`)

### `ai_employees` (table)

- RLS: **enabled**
- Primary key: `id`

| Column | Type | Nullable |
| --- | --- | --- |
| `id` | uuid | no |
| `customer_id` | uuid | no |
| `name` | text | no |
| `role_name` | text | no |
| `status` | text | no |
| `created_at` | timestamp with time zone (timestamptz) | no |

Foreign keys:
- `ai_employees_customer_id_fkey`: `customer_id` → `customer_accounts` (`id`)

### `api_key` (table)

- RLS: **enabled**
- Primary key: `id`

| Column | Type | Nullable |
| --- | --- | --- |
| `id` | text | no |
| `token` | text | no |
| `salt` | text | no |
| `redacted` | text | no |
| `title` | text | no |
| `type` | text | no |
| `last_used_at` | timestamp with time zone (timestamptz) | yes |
| `created_by` | text | no |
| `created_at` | timestamp with time zone (timestamptz) | no |
| `revoked_by` | text | yes |
| `revoked_at` | timestamp with time zone (timestamptz) | yes |
| `updated_at` | timestamp with time zone (timestamptz) | no |
| `deleted_at` | timestamp with time zone (timestamptz) | yes |

### `application_method_buy_rules` (table)

- RLS: **enabled**
- Primary key: `application_method_id`, `promotion_rule_id`

| Column | Type | Nullable |
| --- | --- | --- |
| `application_method_id` | text | no |
| `promotion_rule_id` | text | no |

Foreign keys:
- `application_method_buy_rules_application_method_id_foreign`: `application_method_id` → `promotion_application_method` (`id`)
- `application_method_buy_rules_promotion_rule_id_foreign`: `promotion_rule_id` → `promotion_rule` (`id`)

### `application_method_target_rules` (table)

- RLS: **enabled**
- Primary key: `application_method_id`, `promotion_rule_id`

| Column | Type | Nullable |
| --- | --- | --- |
| `application_method_id` | text | no |
| `promotion_rule_id` | text | no |

Foreign keys:
- `application_method_target_rules_application_method_id_foreign`: `application_method_id` → `promotion_application_method` (`id`)
- `application_method_target_rules_promotion_rule_id_foreign`: `promotion_rule_id` → `promotion_rule` (`id`)

### `auth_identity` (table)

- RLS: **enabled**
- Primary key: `id`

| Column | Type | Nullable |
| --- | --- | --- |
| `id` | text | no |
| `app_metadata` | jsonb | yes |
| `created_at` | timestamp with time zone (timestamptz) | no |
| `updated_at` | timestamp with time zone (timestamptz) | no |
| `deleted_at` | timestamp with time zone (timestamptz) | yes |

### `brand_profiles` (table)

- RLS: **enabled**
- Primary key: `id`

| Column | Type | Nullable |
| --- | --- | --- |
| `id` | uuid | no |
| `owner_id` | uuid | no |
| `name` | text | no |
| `voice` | text | no |
| `audience` | text | no |
| `timezone` | text | no |
| `daily_media_cap` | numeric | no |
| `default_schedule_time` | time without time zone (time) | no |
| `default_duration_seconds` | integer (int4) | no |
| `default_aspect_ratio` | text | no |
| `created_at` | timestamp with time zone (timestamptz) | no |
| `updated_at` | timestamp with time zone (timestamptz) | no |

Foreign keys:
- `brand_profiles_owner_id_fkey`: `owner_id` → `auth.users` (`id`)

### `calendar_operation_references` (table)

- RLS: **enabled**
- Primary key: `id`

| Column | Type | Nullable |
| --- | --- | --- |
| `id` | uuid | no |
| `operation_id` | uuid | no |
| `project_id` | uuid | no |
| `calendar_token_id` | uuid | yes |
| `external_event_id` | text | yes |
| `action` | text | no |
| `status` | text | no |
| `created_at` | timestamp with time zone (timestamptz) | no |
| `updated_at` | timestamp with time zone (timestamptz) | no |

Foreign keys:
- `calendar_operation_references_calendar_token_id_fkey`: `calendar_token_id` → `google_calendar_tokens` (`id`)
- `calendar_operation_references_operation_id_fkey`: `operation_id` → `provider_operations` (`id`)
- `calendar_operation_references_project_id_fkey`: `project_id` → `projects` (`id`)

### `capture` (table)

- RLS: **enabled**
- Primary key: `id`

| Column | Type | Nullable |
| --- | --- | --- |
| `id` | text | no |
| `amount` | numeric | no |
| `raw_amount` | jsonb | no |
| `payment_id` | text | no |
| `created_at` | timestamp with time zone (timestamptz) | no |
| `updated_at` | timestamp with time zone (timestamptz) | no |
| `deleted_at` | timestamp with time zone (timestamptz) | yes |
| `created_by` | text | yes |
| `metadata` | jsonb | yes |

Foreign keys:
- `capture_payment_id_foreign`: `payment_id` → `payment` (`id`)

### `cart` (table)

- RLS: **enabled**
- Primary key: `id`

| Column | Type | Nullable |
| --- | --- | --- |
| `id` | text | no |
| `region_id` | text | yes |
| `customer_id` | text | yes |
| `sales_channel_id` | text | yes |
| `email` | text | yes |
| `currency_code` | text | no |
| `shipping_address_id` | text | yes |
| `billing_address_id` | text | yes |
| `metadata` | jsonb | yes |
| `created_at` | timestamp with time zone (timestamptz) | no |
| `updated_at` | timestamp with time zone (timestamptz) | no |
| `deleted_at` | timestamp with time zone (timestamptz) | yes |
| `completed_at` | timestamp with time zone (timestamptz) | yes |
| `locale` | text | yes |

Foreign keys:
- `cart_billing_address_id_foreign`: `billing_address_id` → `cart_address` (`id`)
- `cart_shipping_address_id_foreign`: `shipping_address_id` → `cart_address` (`id`)

### `cart_address` (table)

- RLS: **enabled**
- Primary key: `id`

| Column | Type | Nullable |
| --- | --- | --- |
| `id` | text | no |
| `customer_id` | text | yes |
| `company` | text | yes |
| `first_name` | text | yes |
| `last_name` | text | yes |
| `address_1` | text | yes |
| `address_2` | text | yes |
| `city` | text | yes |
| `country_code` | text | yes |
| `province` | text | yes |
| `postal_code` | text | yes |
| `phone` | text | yes |
| `metadata` | jsonb | yes |
| `created_at` | timestamp with time zone (timestamptz) | no |
| `updated_at` | timestamp with time zone (timestamptz) | no |
| `deleted_at` | timestamp with time zone (timestamptz) | yes |

### `cart_line_item` (table)

- RLS: **enabled**
- Primary key: `id`

| Column | Type | Nullable |
| --- | --- | --- |
| `id` | text | no |
| `cart_id` | text | no |
| `title` | text | no |
| `subtitle` | text | yes |
| `thumbnail` | text | yes |
| `quantity` | integer (int4) | no |
| `variant_id` | text | yes |
| `product_id` | text | yes |
| `product_title` | text | yes |
| `product_description` | text | yes |
| `product_subtitle` | text | yes |
| `product_type` | text | yes |
| `product_collection` | text | yes |
| `product_handle` | text | yes |
| `variant_sku` | text | yes |
| `variant_barcode` | text | yes |
| `variant_title` | text | yes |
| `variant_option_values` | jsonb | yes |
| `requires_shipping` | boolean (bool) | no |
| `is_discountable` | boolean (bool) | no |
| `is_tax_inclusive` | boolean (bool) | no |
| `compare_at_unit_price` | numeric | yes |
| `raw_compare_at_unit_price` | jsonb | yes |
| `unit_price` | numeric | no |
| `raw_unit_price` | jsonb | no |
| `metadata` | jsonb | yes |
| `created_at` | timestamp with time zone (timestamptz) | no |
| `updated_at` | timestamp with time zone (timestamptz) | no |
| `deleted_at` | timestamp with time zone (timestamptz) | yes |
| `product_type_id` | text | yes |
| `is_custom_price` | boolean (bool) | no |
| `is_giftcard` | boolean (bool) | no |

Foreign keys:
- `cart_line_item_cart_id_foreign`: `cart_id` → `cart` (`id`)

### `cart_line_item_adjustment` (table)

- RLS: **enabled**
- Primary key: `id`

| Column | Type | Nullable |
| --- | --- | --- |
| `id` | text | no |
| `description` | text | yes |
| `promotion_id` | text | yes |
| `code` | text | yes |
| `amount` | numeric | no |
| `raw_amount` | jsonb | no |
| `provider_id` | text | yes |
| `metadata` | jsonb | yes |
| `created_at` | timestamp with time zone (timestamptz) | no |
| `updated_at` | timestamp with time zone (timestamptz) | no |
| `deleted_at` | timestamp with time zone (timestamptz) | yes |
| `item_id` | text | yes |
| `is_tax_inclusive` | boolean (bool) | no |

Foreign keys:
- `cart_line_item_adjustment_item_id_foreign`: `item_id` → `cart_line_item` (`id`)

### `cart_line_item_tax_line` (table)

- RLS: **enabled**
- Primary key: `id`

| Column | Type | Nullable |
| --- | --- | --- |
| `id` | text | no |
| `description` | text | yes |
| `tax_rate_id` | text | yes |
| `code` | text | no |
| `rate` | real (float4) | no |
| `provider_id` | text | yes |
| `metadata` | jsonb | yes |
| `created_at` | timestamp with time zone (timestamptz) | no |
| `updated_at` | timestamp with time zone (timestamptz) | no |
| `deleted_at` | timestamp with time zone (timestamptz) | yes |
| `item_id` | text | yes |

Foreign keys:
- `cart_line_item_tax_line_item_id_foreign`: `item_id` → `cart_line_item` (`id`)

### `cart_payment_collection` (table)

- RLS: **enabled**
- Primary key: `cart_id`, `payment_collection_id`

| Column | Type | Nullable |
| --- | --- | --- |
| `cart_id` | character varying (varchar) | no |
| `payment_collection_id` | character varying (varchar) | no |
| `id` | character varying (varchar) | no |
| `created_at` | timestamp with time zone (timestamptz) | no |
| `updated_at` | timestamp with time zone (timestamptz) | no |
| `deleted_at` | timestamp with time zone (timestamptz) | yes |

### `cart_promotion` (table)

- RLS: **enabled**
- Primary key: `cart_id`, `promotion_id`

| Column | Type | Nullable |
| --- | --- | --- |
| `cart_id` | character varying (varchar) | no |
| `promotion_id` | character varying (varchar) | no |
| `id` | character varying (varchar) | no |
| `created_at` | timestamp with time zone (timestamptz) | no |
| `updated_at` | timestamp with time zone (timestamptz) | no |
| `deleted_at` | timestamp with time zone (timestamptz) | yes |

### `cart_shipping_method` (table)

- RLS: **enabled**
- Primary key: `id`

| Column | Type | Nullable |
| --- | --- | --- |
| `id` | text | no |
| `cart_id` | text | no |
| `name` | text | no |
| `description` | jsonb | yes |
| `amount` | numeric | no |
| `raw_amount` | jsonb | no |
| `is_tax_inclusive` | boolean (bool) | no |
| `shipping_option_id` | text | yes |
| `data` | jsonb | yes |
| `metadata` | jsonb | yes |
| `created_at` | timestamp with time zone (timestamptz) | no |
| `updated_at` | timestamp with time zone (timestamptz) | no |
| `deleted_at` | timestamp with time zone (timestamptz) | yes |

Foreign keys:
- `cart_shipping_method_cart_id_foreign`: `cart_id` → `cart` (`id`)

### `cart_shipping_method_adjustment` (table)

- RLS: **enabled**
- Primary key: `id`

| Column | Type | Nullable |
| --- | --- | --- |
| `id` | text | no |
| `description` | text | yes |
| `promotion_id` | text | yes |
| `code` | text | yes |
| `amount` | numeric | no |
| `raw_amount` | jsonb | no |
| `provider_id` | text | yes |
| `metadata` | jsonb | yes |
| `created_at` | timestamp with time zone (timestamptz) | no |
| `updated_at` | timestamp with time zone (timestamptz) | no |
| `deleted_at` | timestamp with time zone (timestamptz) | yes |
| `shipping_method_id` | text | yes |

Foreign keys:
- `cart_shipping_method_adjustment_shipping_method_id_foreign`: `shipping_method_id` → `cart_shipping_method` (`id`)

### `cart_shipping_method_tax_line` (table)

- RLS: **enabled**
- Primary key: `id`

| Column | Type | Nullable |
| --- | --- | --- |
| `id` | text | no |
| `description` | text | yes |
| `tax_rate_id` | text | yes |
| `code` | text | no |
| `rate` | real (float4) | no |
| `provider_id` | text | yes |
| `metadata` | jsonb | yes |
| `created_at` | timestamp with time zone (timestamptz) | no |
| `updated_at` | timestamp with time zone (timestamptz) | no |
| `deleted_at` | timestamp with time zone (timestamptz) | yes |
| `shipping_method_id` | text | yes |

Foreign keys:
- `cart_shipping_method_tax_line_shipping_method_id_foreign`: `shipping_method_id` → `cart_shipping_method` (`id`)

### `content_schedules` (table)

- RLS: **enabled**
- Primary key: `id`

| Column | Type | Nullable |
| --- | --- | --- |
| `id` | uuid | no |
| `owner_id` | uuid | no |
| `brand_profile_id` | uuid | no |
| `run_id` | uuid | yes |
| `local_date` | date | no |
| `timezone` | text | no |
| `scheduled_for` | timestamp with time zone (timestamptz) | no |
| `status` | text | no |
| `created_at` | timestamp with time zone (timestamptz) | no |
| `updated_at` | timestamp with time zone (timestamptz) | no |

Foreign keys:
- `content_schedules_brand_profile_id_fkey`: `brand_profile_id` → `brand_profiles` (`id`)
- `content_schedules_owner_id_fkey`: `owner_id` → `auth.users` (`id`)
- `content_schedules_run_id_fkey`: `run_id` → `agent_runs` (`id`)

### `credit_line` (table)

- RLS: **enabled**
- Primary key: `id`

| Column | Type | Nullable |
| --- | --- | --- |
| `id` | text | no |
| `cart_id` | text | no |
| `reference` | text | yes |
| `reference_id` | text | yes |
| `amount` | numeric | no |
| `raw_amount` | jsonb | no |
| `metadata` | jsonb | yes |
| `created_at` | timestamp with time zone (timestamptz) | no |
| `updated_at` | timestamp with time zone (timestamptz) | no |
| `deleted_at` | timestamp with time zone (timestamptz) | yes |

Foreign keys:
- `credit_line_cart_id_foreign`: `cart_id` → `cart` (`id`)

### `currency` (table)

- RLS: **enabled**
- Primary key: `code`

| Column | Type | Nullable |
| --- | --- | --- |
| `code` | text | no |
| `symbol` | text | no |
| `symbol_native` | text | no |
| `decimal_digits` | integer (int4) | no |
| `rounding` | numeric | no |
| `raw_rounding` | jsonb | no |
| `name` | text | no |
| `created_at` | timestamp with time zone (timestamptz) | no |
| `updated_at` | timestamp with time zone (timestamptz) | no |
| `deleted_at` | timestamp with time zone (timestamptz) | yes |

### `customer` (table)

- RLS: **enabled**
- Primary key: `id`

| Column | Type | Nullable |
| --- | --- | --- |
| `id` | text | no |
| `company_name` | text | yes |
| `first_name` | text | yes |
| `last_name` | text | yes |
| `email` | text | yes |
| `phone` | text | yes |
| `has_account` | boolean (bool) | no |
| `metadata` | jsonb | yes |
| `created_at` | timestamp with time zone (timestamptz) | no |
| `updated_at` | timestamp with time zone (timestamptz) | no |
| `deleted_at` | timestamp with time zone (timestamptz) | yes |
| `created_by` | text | yes |

### `customer_account_holder` (table)

- RLS: **enabled**
- Primary key: `customer_id`, `account_holder_id`

| Column | Type | Nullable |
| --- | --- | --- |
| `customer_id` | character varying (varchar) | no |
| `account_holder_id` | character varying (varchar) | no |
| `id` | character varying (varchar) | no |
| `created_at` | timestamp with time zone (timestamptz) | no |
| `updated_at` | timestamp with time zone (timestamptz) | no |
| `deleted_at` | timestamp with time zone (timestamptz) | yes |

### `customer_accounts` (table)

- RLS: **enabled**
- Primary key: `id`

| Column | Type | Nullable |
| --- | --- | --- |
| `id` | uuid | no |
| `name` | text | no |
| `created_at` | timestamp with time zone (timestamptz) | no |

### `customer_address` (table)

- RLS: **enabled**
- Primary key: `id`

| Column | Type | Nullable |
| --- | --- | --- |
| `id` | text | no |
| `customer_id` | text | no |
| `address_name` | text | yes |
| `is_default_shipping` | boolean (bool) | no |
| `is_default_billing` | boolean (bool) | no |
| `company` | text | yes |
| `first_name` | text | yes |
| `last_name` | text | yes |
| `address_1` | text | yes |
| `address_2` | text | yes |
| `city` | text | yes |
| `country_code` | text | yes |
| `province` | text | yes |
| `postal_code` | text | yes |
| `phone` | text | yes |
| `metadata` | jsonb | yes |
| `created_at` | timestamp with time zone (timestamptz) | no |
| `updated_at` | timestamp with time zone (timestamptz) | no |
| `deleted_at` | timestamp with time zone (timestamptz) | yes |

Foreign keys:
- `customer_address_customer_id_foreign`: `customer_id` → `customer` (`id`)

### `customer_group` (table)

- RLS: **enabled**
- Primary key: `id`

| Column | Type | Nullable |
| --- | --- | --- |
| `id` | text | no |
| `name` | text | no |
| `metadata` | jsonb | yes |
| `created_by` | text | yes |
| `created_at` | timestamp with time zone (timestamptz) | no |
| `updated_at` | timestamp with time zone (timestamptz) | no |
| `deleted_at` | timestamp with time zone (timestamptz) | yes |

### `customer_group_customer` (table)

- RLS: **enabled**
- Primary key: `id`

| Column | Type | Nullable |
| --- | --- | --- |
| `id` | text | no |
| `customer_id` | text | no |
| `customer_group_id` | text | no |
| `metadata` | jsonb | yes |
| `created_at` | timestamp with time zone (timestamptz) | no |
| `updated_at` | timestamp with time zone (timestamptz) | no |
| `created_by` | text | yes |
| `deleted_at` | timestamp with time zone (timestamptz) | yes |

Foreign keys:
- `customer_group_customer_customer_group_id_foreign`: `customer_group_id` → `customer_group` (`id`)
- `customer_group_customer_customer_id_foreign`: `customer_id` → `customer` (`id`)

### `customer_memberships` (table)

- RLS: **enabled**
- Primary key: `customer_id`, `user_id`

| Column | Type | Nullable |
| --- | --- | --- |
| `customer_id` | uuid | no |
| `user_id` | uuid | no |
| `role` | text | no |
| `created_at` | timestamp with time zone (timestamptz) | no |
| `access_retired_at` | timestamp with time zone (timestamptz) | no |

Foreign keys:
- `customer_memberships_customer_id_fkey`: `customer_id` → `customer_accounts` (`id`)
- `customer_memberships_user_id_fkey`: `user_id` → `auth.users` (`id`)

### `fulfillment` (table)

- RLS: **enabled**
- Primary key: `id`

| Column | Type | Nullable |
| --- | --- | --- |
| `id` | text | no |
| `location_id` | text | no |
| `packed_at` | timestamp with time zone (timestamptz) | yes |
| `shipped_at` | timestamp with time zone (timestamptz) | yes |
| `delivered_at` | timestamp with time zone (timestamptz) | yes |
| `canceled_at` | timestamp with time zone (timestamptz) | yes |
| `data` | jsonb | yes |
| `provider_id` | text | yes |
| `shipping_option_id` | text | yes |
| `metadata` | jsonb | yes |
| `delivery_address_id` | text | yes |
| `created_at` | timestamp with time zone (timestamptz) | no |
| `updated_at` | timestamp with time zone (timestamptz) | no |
| `deleted_at` | timestamp with time zone (timestamptz) | yes |
| `marked_shipped_by` | text | yes |
| `created_by` | text | yes |
| `requires_shipping` | boolean (bool) | no |

Foreign keys:
- `fulfillment_delivery_address_id_foreign`: `delivery_address_id` → `fulfillment_address` (`id`)
- `fulfillment_provider_id_foreign`: `provider_id` → `fulfillment_provider` (`id`)
- `fulfillment_shipping_option_id_foreign`: `shipping_option_id` → `shipping_option` (`id`)

### `fulfillment_address` (table)

- RLS: **enabled**
- Primary key: `id`

| Column | Type | Nullable |
| --- | --- | --- |
| `id` | text | no |
| `company` | text | yes |
| `first_name` | text | yes |
| `last_name` | text | yes |
| `address_1` | text | yes |
| `address_2` | text | yes |
| `city` | text | yes |
| `country_code` | text | yes |
| `province` | text | yes |
| `postal_code` | text | yes |
| `phone` | text | yes |
| `metadata` | jsonb | yes |
| `created_at` | timestamp with time zone (timestamptz) | no |
| `updated_at` | timestamp with time zone (timestamptz) | no |
| `deleted_at` | timestamp with time zone (timestamptz) | yes |

### `fulfillment_item` (table)

- RLS: **enabled**
- Primary key: `id`

| Column | Type | Nullable |
| --- | --- | --- |
| `id` | text | no |
| `title` | text | no |
| `sku` | text | no |
| `barcode` | text | no |
| `quantity` | numeric | no |
| `raw_quantity` | jsonb | no |
| `line_item_id` | text | yes |
| `inventory_item_id` | text | yes |
| `fulfillment_id` | text | no |
| `created_at` | timestamp with time zone (timestamptz) | no |
| `updated_at` | timestamp with time zone (timestamptz) | no |
| `deleted_at` | timestamp with time zone (timestamptz) | yes |

Foreign keys:
- `fulfillment_item_fulfillment_id_foreign`: `fulfillment_id` → `fulfillment` (`id`)

### `fulfillment_label` (table)

- RLS: **enabled**
- Primary key: `id`

| Column | Type | Nullable |
| --- | --- | --- |
| `id` | text | no |
| `tracking_number` | text | no |
| `tracking_url` | text | no |
| `label_url` | text | no |
| `fulfillment_id` | text | no |
| `created_at` | timestamp with time zone (timestamptz) | no |
| `updated_at` | timestamp with time zone (timestamptz) | no |
| `deleted_at` | timestamp with time zone (timestamptz) | yes |

Foreign keys:
- `fulfillment_label_fulfillment_id_foreign`: `fulfillment_id` → `fulfillment` (`id`)

### `fulfillment_provider` (table)

- RLS: **enabled**
- Primary key: `id`

| Column | Type | Nullable |
| --- | --- | --- |
| `id` | text | no |
| `is_enabled` | boolean (bool) | no |
| `created_at` | timestamp with time zone (timestamptz) | no |
| `updated_at` | timestamp with time zone (timestamptz) | no |
| `deleted_at` | timestamp with time zone (timestamptz) | yes |

### `fulfillment_set` (table)

- RLS: **enabled**
- Primary key: `id`

| Column | Type | Nullable |
| --- | --- | --- |
| `id` | text | no |
| `name` | text | no |
| `type` | text | no |
| `metadata` | jsonb | yes |
| `created_at` | timestamp with time zone (timestamptz) | no |
| `updated_at` | timestamp with time zone (timestamptz) | no |
| `deleted_at` | timestamp with time zone (timestamptz) | yes |

### `geo_zone` (table)

- RLS: **enabled**
- Primary key: `id`

| Column | Type | Nullable |
| --- | --- | --- |
| `id` | text | no |
| `type` | text | no |
| `country_code` | text | no |
| `province_code` | text | yes |
| `city` | text | yes |
| `service_zone_id` | text | no |
| `postal_expression` | jsonb | yes |
| `metadata` | jsonb | yes |
| `created_at` | timestamp with time zone (timestamptz) | no |
| `updated_at` | timestamp with time zone (timestamptz) | no |
| `deleted_at` | timestamp with time zone (timestamptz) | yes |

Foreign keys:
- `geo_zone_service_zone_id_foreign`: `service_zone_id` → `service_zone` (`id`)

### `google_calendar_tokens` (table)

- RLS: **enabled**
- Primary key: `id`

| Column | Type | Nullable |
| --- | --- | --- |
| `id` | uuid | no |
| `user_id` | uuid | no |
| `access_token` | text | yes |
| `refresh_token` | text | yes |
| `token_type` | text | yes |
| `expires_at` | timestamp with time zone (timestamptz) | no |
| `google_email` | text | yes |
| `google_calendar_id` | text | yes |
| `created_at` | timestamp with time zone (timestamptz) | yes |
| `updated_at` | timestamp with time zone (timestamptz) | yes |
| `access_token_encrypted` | bytea | yes |
| `refresh_token_encrypted` | bytea | yes |

Foreign keys:
- `google_calendar_tokens_user_id_fkey`: `user_id` → `auth.users` (`id`)

### `growth_profiles` (table)

- RLS: **enabled**
- Primary key: `id`

| Column | Type | Nullable |
| --- | --- | --- |
| `id` | uuid | no |
| `owner_id` | uuid | no |
| `name` | text | no |
| `target_market` | text | no |
| `geography` | text | no |
| `business_size` | text | no |
| `pain_signals` | jsonb | no |
| `exclusion_rules` | jsonb | no |
| `offer` | text | no |
| `sender_name` | text | yes |
| `sender_email` | text | yes |
| `daily_prospect_cap` | integer (int4) | no |
| `daily_send_cap` | integer (int4) | no |
| `working_hours_start` | time without time zone (time) | no |
| `working_hours_end` | time without time zone (time) | no |
| `timezone` | text | no |
| `follow_up_days` | ARRAY (_int4) | no |
| `model_route` | text | no |
| `fallback_model` | text | no |
| `emergency_stop` | boolean (bool) | no |
| `created_at` | timestamp with time zone (timestamptz) | no |
| `updated_at` | timestamp with time zone (timestamptz) | no |
| `selected_model_id` | text | yes |
| `selected_model_rationale` | text | no |
| `model_selected_at` | timestamp with time zone (timestamptz) | yes |

Foreign keys:
- `growth_profiles_owner_id_fkey`: `owner_id` → `auth.users` (`id`)

### `health_check` (table)

- RLS: **enabled**
- Primary key: `id`

| Column | Type | Nullable |
| --- | --- | --- |
| `id` | integer (int4) | no |
| `status` | text | no |
| `created_at` | timestamp with time zone (timestamptz) | yes |

### `hermes_schedule_runs` (table)

- RLS: **enabled**
- Primary key: `id`

| Column | Type | Nullable |
| --- | --- | --- |
| `id` | uuid | no |
| `schedule_id` | uuid | no |
| `owner_id` | uuid | no |
| `scheduled_for` | timestamp with time zone (timestamptz) | no |
| `request_snapshot` | jsonb | no |
| `status` | text | no |
| `materialized_at` | timestamp with time zone (timestamptz) | no |

Foreign keys:
- `hermes_schedule_runs_owner_id_fkey`: `owner_id` → `auth.users` (`id`)
- `hermes_schedule_runs_schedule_id_fkey`: `schedule_id` → `hermes_schedules` (`id`)

### `hermes_schedules` (table)

- RLS: **enabled**
- Primary key: `id`

| Column | Type | Nullable |
| --- | --- | --- |
| `id` | uuid | no |
| `owner_id` | uuid | no |
| `name` | text | no |
| `request_template` | jsonb | no |
| `timezone` | text | no |
| `local_time` | time without time zone (time) | no |
| `recurrence_kind` | text | no |
| `status` | text | no |
| `next_run_at` | timestamp with time zone (timestamptz) | no |
| `last_materialized_at` | timestamp with time zone (timestamptz) | yes |
| `created_at` | timestamp with time zone (timestamptz) | no |
| `updated_at` | timestamp with time zone (timestamptz) | no |

Foreign keys:
- `hermes_schedules_owner_id_fkey`: `owner_id` → `auth.users` (`id`)

### `image` (table)

- RLS: **enabled**
- Primary key: `id`

| Column | Type | Nullable |
| --- | --- | --- |
| `id` | text | no |
| `url` | text | no |
| `metadata` | jsonb | yes |
| `created_at` | timestamp with time zone (timestamptz) | no |
| `updated_at` | timestamp with time zone (timestamptz) | no |
| `deleted_at` | timestamp with time zone (timestamptz) | yes |
| `rank` | integer (int4) | no |
| `product_id` | text | no |

Foreign keys:
- `image_product_id_foreign`: `product_id` → `product` (`id`)

### `inventory_item` (table)

- RLS: **enabled**
- Primary key: `id`

| Column | Type | Nullable |
| --- | --- | --- |
| `id` | text | no |
| `created_at` | timestamp with time zone (timestamptz) | no |
| `updated_at` | timestamp with time zone (timestamptz) | no |
| `deleted_at` | timestamp with time zone (timestamptz) | yes |
| `sku` | text | yes |
| `origin_country` | text | yes |
| `hs_code` | text | yes |
| `mid_code` | text | yes |
| `material` | text | yes |
| `weight` | integer (int4) | yes |
| `length` | integer (int4) | yes |
| `height` | integer (int4) | yes |
| `width` | integer (int4) | yes |
| `requires_shipping` | boolean (bool) | no |
| `description` | text | yes |
| `title` | text | yes |
| `thumbnail` | text | yes |
| `metadata` | jsonb | yes |

### `inventory_level` (table)

- RLS: **enabled**
- Primary key: `id`

| Column | Type | Nullable |
| --- | --- | --- |
| `id` | text | no |
| `created_at` | timestamp with time zone (timestamptz) | no |
| `updated_at` | timestamp with time zone (timestamptz) | no |
| `deleted_at` | timestamp with time zone (timestamptz) | yes |
| `inventory_item_id` | text | no |
| `location_id` | text | no |
| `stocked_quantity` | numeric | no |
| `reserved_quantity` | numeric | no |
| `incoming_quantity` | numeric | no |
| `metadata` | jsonb | yes |
| `raw_stocked_quantity` | jsonb | yes |
| `raw_reserved_quantity` | jsonb | yes |
| `raw_incoming_quantity` | jsonb | yes |

Foreign keys:
- `inventory_level_inventory_item_id_foreign`: `inventory_item_id` → `inventory_item` (`id`)

### `invite` (table)

- RLS: **enabled**
- Primary key: `id`

| Column | Type | Nullable |
| --- | --- | --- |
| `id` | text | no |
| `email` | text | no |
| `accepted` | boolean (bool) | no |
| `token` | text | no |
| `expires_at` | timestamp with time zone (timestamptz) | no |
| `metadata` | jsonb | yes |
| `created_at` | timestamp with time zone (timestamptz) | no |
| `updated_at` | timestamp with time zone (timestamptz) | no |
| `deleted_at` | timestamp with time zone (timestamptz) | yes |

### `link_module_migrations` (table)

- RLS: **enabled**
- Primary key: `id`

| Column | Type | Nullable |
| --- | --- | --- |
| `id` | integer (int4) | no |
| `table_name` | character varying (varchar) | no |
| `link_descriptor` | jsonb | no |
| `created_at` | timestamp without time zone (timestamp) | yes |

### `location_fulfillment_provider` (table)

- RLS: **enabled**
- Primary key: `stock_location_id`, `fulfillment_provider_id`

| Column | Type | Nullable |
| --- | --- | --- |
| `stock_location_id` | character varying (varchar) | no |
| `fulfillment_provider_id` | character varying (varchar) | no |
| `id` | character varying (varchar) | no |
| `created_at` | timestamp with time zone (timestamptz) | no |
| `updated_at` | timestamp with time zone (timestamptz) | no |
| `deleted_at` | timestamp with time zone (timestamptz) | yes |

### `location_fulfillment_set` (table)

- RLS: **enabled**
- Primary key: `stock_location_id`, `fulfillment_set_id`

| Column | Type | Nullable |
| --- | --- | --- |
| `stock_location_id` | character varying (varchar) | no |
| `fulfillment_set_id` | character varying (varchar) | no |
| `id` | character varying (varchar) | no |
| `created_at` | timestamp with time zone (timestamptz) | no |
| `updated_at` | timestamp with time zone (timestamptz) | no |
| `deleted_at` | timestamp with time zone (timestamptz) | yes |

### `mcp_access_tokens` (table)

- RLS: **enabled**
- Primary key: `id`

| Column | Type | Nullable |
| --- | --- | --- |
| `id` | uuid | no |
| `owner_id` | uuid | no |
| `token_hash` | text | no |
| `token_prefix` | text | no |
| `name` | text | no |
| `created_at` | timestamp with time zone (timestamptz) | no |
| `last_used_at` | timestamp with time zone (timestamptz) | yes |
| `revoked_at` | timestamp with time zone (timestamptz) | yes |
| `expires_at` | timestamp with time zone (timestamptz) | yes |

Foreign keys:
- `mcp_access_tokens_owner_id_fkey`: `owner_id` → `auth.users` (`id`)

### `media_usage_reservations` (table)

- RLS: **enabled**
- Primary key: `id`

| Column | Type | Nullable |
| --- | --- | --- |
| `id` | uuid | no |
| `owner_id` | uuid | no |
| `run_id` | uuid | yes |
| `task_id` | uuid | yes |
| `reservation_key` | uuid | no |
| `media_kind` | text | no |
| `reserved_cost` | numeric | no |
| `actual_cost` | numeric | yes |
| `status` | text | no |
| `local_usage_date` | date | no |
| `provider` | text | no |
| `provider_usage` | jsonb | no |
| `created_at` | timestamp with time zone (timestamptz) | no |
| `reconciled_at` | timestamp with time zone (timestamptz) | yes |

Foreign keys:
- `media_usage_reservations_owner_id_fkey`: `owner_id` → `auth.users` (`id`)
- `media_usage_reservations_run_id_fkey`: `run_id` → `agent_runs` (`id`)
- `media_usage_reservations_task_id_fkey`: `task_id` → `agent_orchestration_tasks` (`id`)

### `mikro_orm_migrations` (table)

- RLS: **enabled**
- Primary key: `id`

| Column | Type | Nullable |
| --- | --- | --- |
| `id` | integer (int4) | no |
| `name` | character varying (varchar) | yes |
| `executed_at` | timestamp with time zone (timestamptz) | yes |

### `model_benchmark_candidates` (table)

- RLS: **enabled**
- Primary key: `id`

| Column | Type | Nullable |
| --- | --- | --- |
| `id` | uuid | no |
| `profile_id` | uuid | no |
| `candidate_id` | text | no |
| `provider_model_id` | text | no |
| `candidate_kind` | text | no |
| `catalog_metadata` | jsonb | no |
| `is_active` | boolean (bool) | no |
| `discovered_at` | timestamp with time zone (timestamptz) | no |
| `updated_at` | timestamp with time zone (timestamptz) | no |

Foreign keys:
- `model_benchmark_candidates_profile_id_fkey`: `profile_id` → `growth_profiles` (`id`)

### `model_evaluation_records` (table)

- RLS: **enabled**
- Primary key: `id`

| Column | Type | Nullable |
| --- | --- | --- |
| `id` | uuid | no |
| `owner_id` | uuid | no |
| `candidate_id` | text | no |
| `provider_model_id` | text | no |
| `task_id` | text | no |
| `quality_score` | numeric | no |
| `tool_use_score` | numeric | no |
| `latency_ms` | integer (int4) | no |
| `cost_usd` | numeric | no |
| `failed` | boolean (bool) | no |
| `repair_required` | boolean (bool) | no |
| `evaluated_on` | date | no |
| `notes` | text | no |
| `created_at` | timestamp with time zone (timestamptz) | no |
| `actual_model_id` | text | yes |

Foreign keys:
- `model_evaluation_records_owner_id_fkey`: `owner_id` → `auth.users` (`id`)

### `model_usage_ledger` (table)

- RLS: **enabled**
- Primary key: `id`

| Column | Type | Nullable |
| --- | --- | --- |
| `id` | uuid | no |
| `profile_id` | uuid | no |
| `task_id` | uuid | yes |
| `reservation_key` | uuid | no |
| `usage_kind` | text | no |
| `model_id` | text | no |
| `reserved_cost` | numeric | no |
| `actual_cost` | numeric | yes |
| `status` | text | no |
| `local_usage_date` | date | no |
| `provider_usage` | jsonb | no |
| `created_at` | timestamp with time zone (timestamptz) | no |
| `reconciled_at` | timestamp with time zone (timestamptz) | yes |
| `actual_model_id` | text | yes |

Foreign keys:
- `model_usage_ledger_profile_id_fkey`: `profile_id` → `growth_profiles` (`id`)
- `model_usage_ledger_task_id_fkey`: `task_id` → `agent_tasks` (`id`)

### `notification` (table)

- RLS: **enabled**
- Primary key: `id`

| Column | Type | Nullable |
| --- | --- | --- |
| `id` | text | no |
| `to` | text | no |
| `channel` | text | no |
| `template` | text | yes |
| `data` | jsonb | yes |
| `trigger_type` | text | yes |
| `resource_id` | text | yes |
| `resource_type` | text | yes |
| `receiver_id` | text | yes |
| `original_notification_id` | text | yes |
| `idempotency_key` | text | yes |
| `external_id` | text | yes |
| `provider_id` | text | yes |
| `created_at` | timestamp with time zone (timestamptz) | no |
| `updated_at` | timestamp with time zone (timestamptz) | no |
| `deleted_at` | timestamp with time zone (timestamptz) | yes |
| `status` | text | no |
| `from` | text | yes |
| `provider_data` | jsonb | yes |

Foreign keys:
- `notification_provider_id_foreign`: `provider_id` → `notification_provider` (`id`)

### `notification_provider` (table)

- RLS: **enabled**
- Primary key: `id`

| Column | Type | Nullable |
| --- | --- | --- |
| `id` | text | no |
| `handle` | text | no |
| `name` | text | no |
| `is_enabled` | boolean (bool) | no |
| `channels` | ARRAY (_text) | no |
| `created_at` | timestamp with time zone (timestamptz) | no |
| `updated_at` | timestamp with time zone (timestamptz) | no |
| `deleted_at` | timestamp with time zone (timestamptz) | yes |

### `openclaw_model_usage_reservations` (table)

- RLS: **enabled**
- Primary key: `id`

| Column | Type | Nullable |
| --- | --- | --- |
| `id` | uuid | no |
| `owner_id` | uuid | no |
| `growth_profile_id` | uuid | no |
| `plan_id` | uuid | no |
| `run_id` | uuid | no |
| `task_id` | uuid | no |
| `worker_id` | text | no |
| `reservation_key` | uuid | no |
| `provider` | text | no |
| `model_id` | text | no |
| `reserved_cost` | numeric | no |
| `actual_cost` | numeric | yes |
| `status` | text | no |
| `local_usage_date` | date | no |
| `provider_usage` | jsonb | no |
| `created_at` | timestamp with time zone (timestamptz) | no |
| `reconciled_at` | timestamp with time zone (timestamptz) | yes |

Foreign keys:
- `openclaw_model_usage_reservations_growth_profile_id_fkey`: `growth_profile_id` → `growth_profiles` (`id`)
- `openclaw_model_usage_reservations_owner_id_fkey`: `owner_id` → `auth.users` (`id`)
- `openclaw_model_usage_reservations_plan_id_fkey`: `plan_id` → `agent_plans` (`id`)
- `openclaw_model_usage_reservations_run_id_fkey`: `run_id` → `agent_runs` (`id`)
- `openclaw_model_usage_reservations_task_id_fkey`: `task_id` → `agent_orchestration_tasks` (`id`)

### `operator_cockpit_actions` (table)

- RLS: **enabled**
- Primary key: `id`

| Column | Type | Nullable |
| --- | --- | --- |
| `id` | uuid | no |
| `owner_id` | uuid | no |
| `week_start` | date | no |
| `priority_id` | uuid | yes |
| `source_type` | text | no |
| `source_id` | text | no |
| `action_type` | text | no |
| `title` | text | no |
| `description` | text | no |
| `due_date` | date | yes |
| `rank` | smallint (int2) | no |
| `status` | text | no |
| `deferred_until` | date | yes |
| `completed_at` | timestamp with time zone (timestamptz) | yes |
| `completion_note` | text | yes |
| `created_at` | timestamp with time zone (timestamptz) | no |
| `updated_at` | timestamp with time zone (timestamptz) | no |

Foreign keys:
- `operator_cockpit_actions_owner_id_fkey`: `owner_id` → `auth.users` (`id`)
- `operator_cockpit_actions_priority_id_fkey`: `priority_id` → `operator_weekly_priorities` (`id`)

### `operator_daily_reflections` (table)

- RLS: **enabled**
- Primary key: `id`

| Column | Type | Nullable |
| --- | --- | --- |
| `id` | uuid | no |
| `owner_id` | uuid | no |
| `reflection_date` | date | no |
| `reflection` | text | no |
| `created_at` | timestamp with time zone (timestamptz) | no |
| `updated_at` | timestamp with time zone (timestamptz) | no |

Foreign keys:
- `operator_daily_reflections_owner_id_fkey`: `owner_id` → `auth.users` (`id`)

### `operator_weekly_priorities` (table)

- RLS: **enabled**
- Primary key: `id`

| Column | Type | Nullable |
| --- | --- | --- |
| `id` | uuid | no |
| `owner_id` | uuid | no |
| `week_start` | date | no |
| `position` | smallint (int2) | no |
| `outcome` | text | no |
| `owner_name` | text | no |
| `due_date` | date | no |
| `status` | text | no |
| `next_action` | text | no |
| `created_at` | timestamp with time zone (timestamptz) | no |
| `updated_at` | timestamp with time zone (timestamptz) | no |

Foreign keys:
- `operator_weekly_priorities_owner_id_fkey`: `owner_id` → `auth.users` (`id`)

### `order` (table)

- RLS: **enabled**
- Primary key: `id`

| Column | Type | Nullable |
| --- | --- | --- |
| `id` | text | no |
| `region_id` | text | yes |
| `display_id` | integer (int4) | yes |
| `customer_id` | text | yes |
| `version` | integer (int4) | no |
| `sales_channel_id` | text | yes |
| `status` | USER-DEFINED (order_status_enum) | no |
| `is_draft_order` | boolean (bool) | no |
| `email` | text | yes |
| `currency_code` | text | no |
| `shipping_address_id` | text | yes |
| `billing_address_id` | text | yes |
| `no_notification` | boolean (bool) | yes |
| `metadata` | jsonb | yes |
| `created_at` | timestamp with time zone (timestamptz) | no |
| `updated_at` | timestamp with time zone (timestamptz) | no |
| `deleted_at` | timestamp with time zone (timestamptz) | yes |
| `canceled_at` | timestamp with time zone (timestamptz) | yes |
| `custom_display_id` | text | yes |
| `locale` | text | yes |

Foreign keys:
- `order_billing_address_id_foreign`: `billing_address_id` → `order_address` (`id`)
- `order_shipping_address_id_foreign`: `shipping_address_id` → `order_address` (`id`)

### `order_address` (table)

- RLS: **enabled**
- Primary key: `id`

| Column | Type | Nullable |
| --- | --- | --- |
| `id` | text | no |
| `customer_id` | text | yes |
| `company` | text | yes |
| `first_name` | text | yes |
| `last_name` | text | yes |
| `address_1` | text | yes |
| `address_2` | text | yes |
| `city` | text | yes |
| `country_code` | text | yes |
| `province` | text | yes |
| `postal_code` | text | yes |
| `phone` | text | yes |
| `metadata` | jsonb | yes |
| `created_at` | timestamp with time zone (timestamptz) | no |
| `updated_at` | timestamp with time zone (timestamptz) | no |
| `deleted_at` | timestamp with time zone (timestamptz) | yes |

### `order_cart` (table)

- RLS: **enabled**
- Primary key: `order_id`, `cart_id`

| Column | Type | Nullable |
| --- | --- | --- |
| `order_id` | character varying (varchar) | no |
| `cart_id` | character varying (varchar) | no |
| `id` | character varying (varchar) | no |
| `created_at` | timestamp with time zone (timestamptz) | no |
| `updated_at` | timestamp with time zone (timestamptz) | no |
| `deleted_at` | timestamp with time zone (timestamptz) | yes |

### `order_change` (table)

- RLS: **enabled**
- Primary key: `id`

| Column | Type | Nullable |
| --- | --- | --- |
| `id` | text | no |
| `order_id` | text | no |
| `version` | integer (int4) | no |
| `description` | text | yes |
| `status` | text | no |
| `internal_note` | text | yes |
| `created_by` | text | yes |
| `requested_by` | text | yes |
| `requested_at` | timestamp with time zone (timestamptz) | yes |
| `confirmed_by` | text | yes |
| `confirmed_at` | timestamp with time zone (timestamptz) | yes |
| `declined_by` | text | yes |
| `declined_reason` | text | yes |
| `metadata` | jsonb | yes |
| `declined_at` | timestamp with time zone (timestamptz) | yes |
| `canceled_by` | text | yes |
| `canceled_at` | timestamp with time zone (timestamptz) | yes |
| `created_at` | timestamp with time zone (timestamptz) | no |
| `updated_at` | timestamp with time zone (timestamptz) | no |
| `change_type` | text | yes |
| `deleted_at` | timestamp with time zone (timestamptz) | yes |
| `return_id` | text | yes |
| `claim_id` | text | yes |
| `exchange_id` | text | yes |
| `carry_over_promotions` | boolean (bool) | yes |

Foreign keys:
- `order_change_order_id_foreign`: `order_id` → `"order"` (`id`)

### `order_change_action` (table)

- RLS: **enabled**
- Primary key: `id`

| Column | Type | Nullable |
| --- | --- | --- |
| `id` | text | no |
| `order_id` | text | yes |
| `version` | integer (int4) | yes |
| `ordering` | bigint (int8) | no |
| `order_change_id` | text | yes |
| `reference` | text | yes |
| `reference_id` | text | yes |
| `action` | text | no |
| `details` | jsonb | yes |
| `amount` | numeric | yes |
| `raw_amount` | jsonb | yes |
| `internal_note` | text | yes |
| `applied` | boolean (bool) | no |
| `created_at` | timestamp with time zone (timestamptz) | no |
| `updated_at` | timestamp with time zone (timestamptz) | no |
| `deleted_at` | timestamp with time zone (timestamptz) | yes |
| `return_id` | text | yes |
| `claim_id` | text | yes |
| `exchange_id` | text | yes |

Foreign keys:
- `order_change_action_order_change_id_foreign`: `order_change_id` → `order_change` (`id`)

### `order_claim` (table)

- RLS: **enabled**
- Primary key: `id`

| Column | Type | Nullable |
| --- | --- | --- |
| `id` | text | no |
| `order_id` | text | no |
| `return_id` | text | yes |
| `order_version` | integer (int4) | no |
| `display_id` | integer (int4) | no |
| `type` | USER-DEFINED (order_claim_type_enum) | no |
| `no_notification` | boolean (bool) | yes |
| `refund_amount` | numeric | yes |
| `raw_refund_amount` | jsonb | yes |
| `metadata` | jsonb | yes |
| `created_at` | timestamp with time zone (timestamptz) | no |
| `updated_at` | timestamp with time zone (timestamptz) | no |
| `deleted_at` | timestamp with time zone (timestamptz) | yes |
| `canceled_at` | timestamp with time zone (timestamptz) | yes |
| `created_by` | text | yes |

### `order_claim_item` (table)

- RLS: **enabled**
- Primary key: `id`

| Column | Type | Nullable |
| --- | --- | --- |
| `id` | text | no |
| `claim_id` | text | no |
| `item_id` | text | no |
| `is_additional_item` | boolean (bool) | no |
| `reason` | USER-DEFINED (claim_reason_enum) | yes |
| `quantity` | numeric | no |
| `raw_quantity` | jsonb | no |
| `note` | text | yes |
| `metadata` | jsonb | yes |
| `created_at` | timestamp with time zone (timestamptz) | no |
| `updated_at` | timestamp with time zone (timestamptz) | no |
| `deleted_at` | timestamp with time zone (timestamptz) | yes |

### `order_claim_item_image` (table)

- RLS: **enabled**
- Primary key: `id`

| Column | Type | Nullable |
| --- | --- | --- |
| `id` | text | no |
| `claim_item_id` | text | no |
| `url` | text | no |
| `metadata` | jsonb | yes |
| `created_at` | timestamp with time zone (timestamptz) | no |
| `updated_at` | timestamp with time zone (timestamptz) | no |
| `deleted_at` | timestamp with time zone (timestamptz) | yes |

### `order_credit_line` (table)

- RLS: **enabled**
- Primary key: `id`

| Column | Type | Nullable |
| --- | --- | --- |
| `id` | text | no |
| `order_id` | text | no |
| `reference` | text | yes |
| `reference_id` | text | yes |
| `amount` | numeric | no |
| `raw_amount` | jsonb | no |
| `metadata` | jsonb | yes |
| `created_at` | timestamp with time zone (timestamptz) | no |
| `updated_at` | timestamp with time zone (timestamptz) | no |
| `deleted_at` | timestamp with time zone (timestamptz) | yes |
| `version` | integer (int4) | no |

Foreign keys:
- `order_credit_line_order_id_foreign`: `order_id` → `"order"` (`id`)

### `order_exchange` (table)

- RLS: **enabled**
- Primary key: `id`

| Column | Type | Nullable |
| --- | --- | --- |
| `id` | text | no |
| `order_id` | text | no |
| `return_id` | text | yes |
| `order_version` | integer (int4) | no |
| `display_id` | integer (int4) | no |
| `no_notification` | boolean (bool) | yes |
| `allow_backorder` | boolean (bool) | no |
| `difference_due` | numeric | yes |
| `raw_difference_due` | jsonb | yes |
| `metadata` | jsonb | yes |
| `created_at` | timestamp with time zone (timestamptz) | no |
| `updated_at` | timestamp with time zone (timestamptz) | no |
| `deleted_at` | timestamp with time zone (timestamptz) | yes |
| `canceled_at` | timestamp with time zone (timestamptz) | yes |
| `created_by` | text | yes |

### `order_exchange_item` (table)

- RLS: **enabled**
- Primary key: `id`

| Column | Type | Nullable |
| --- | --- | --- |
| `id` | text | no |
| `exchange_id` | text | no |
| `item_id` | text | no |
| `quantity` | numeric | no |
| `raw_quantity` | jsonb | no |
| `note` | text | yes |
| `metadata` | jsonb | yes |
| `created_at` | timestamp with time zone (timestamptz) | no |
| `updated_at` | timestamp with time zone (timestamptz) | no |
| `deleted_at` | timestamp with time zone (timestamptz) | yes |

### `order_fulfillment` (table)

- RLS: **enabled**
- Primary key: `order_id`, `fulfillment_id`

| Column | Type | Nullable |
| --- | --- | --- |
| `order_id` | character varying (varchar) | no |
| `fulfillment_id` | character varying (varchar) | no |
| `id` | character varying (varchar) | no |
| `created_at` | timestamp with time zone (timestamptz) | no |
| `updated_at` | timestamp with time zone (timestamptz) | no |
| `deleted_at` | timestamp with time zone (timestamptz) | yes |

### `order_item` (table)

- RLS: **enabled**
- Primary key: `id`

| Column | Type | Nullable |
| --- | --- | --- |
| `id` | text | no |
| `order_id` | text | no |
| `version` | integer (int4) | no |
| `item_id` | text | no |
| `quantity` | numeric | no |
| `raw_quantity` | jsonb | no |
| `fulfilled_quantity` | numeric | no |
| `raw_fulfilled_quantity` | jsonb | no |
| `shipped_quantity` | numeric | no |
| `raw_shipped_quantity` | jsonb | no |
| `return_requested_quantity` | numeric | no |
| `raw_return_requested_quantity` | jsonb | no |
| `return_received_quantity` | numeric | no |
| `raw_return_received_quantity` | jsonb | no |
| `return_dismissed_quantity` | numeric | no |
| `raw_return_dismissed_quantity` | jsonb | no |
| `written_off_quantity` | numeric | no |
| `raw_written_off_quantity` | jsonb | no |
| `metadata` | jsonb | yes |
| `created_at` | timestamp with time zone (timestamptz) | no |
| `updated_at` | timestamp with time zone (timestamptz) | no |
| `deleted_at` | timestamp with time zone (timestamptz) | yes |
| `delivered_quantity` | numeric | no |
| `raw_delivered_quantity` | jsonb | no |
| `unit_price` | numeric | yes |
| `raw_unit_price` | jsonb | yes |
| `compare_at_unit_price` | numeric | yes |
| `raw_compare_at_unit_price` | jsonb | yes |

Foreign keys:
- `order_item_item_id_foreign`: `item_id` → `order_line_item` (`id`)
- `order_item_order_id_foreign`: `order_id` → `"order"` (`id`)

### `order_line_item` (table)

- RLS: **enabled**
- Primary key: `id`

| Column | Type | Nullable |
| --- | --- | --- |
| `id` | text | no |
| `totals_id` | text | yes |
| `title` | text | no |
| `subtitle` | text | yes |
| `thumbnail` | text | yes |
| `variant_id` | text | yes |
| `product_id` | text | yes |
| `product_title` | text | yes |
| `product_description` | text | yes |
| `product_subtitle` | text | yes |
| `product_type` | text | yes |
| `product_collection` | text | yes |
| `product_handle` | text | yes |
| `variant_sku` | text | yes |
| `variant_barcode` | text | yes |
| `variant_title` | text | yes |
| `variant_option_values` | jsonb | yes |
| `requires_shipping` | boolean (bool) | no |
| `is_discountable` | boolean (bool) | no |
| `is_tax_inclusive` | boolean (bool) | no |
| `compare_at_unit_price` | numeric | yes |
| `raw_compare_at_unit_price` | jsonb | yes |
| `unit_price` | numeric | no |
| `raw_unit_price` | jsonb | no |
| `metadata` | jsonb | yes |
| `created_at` | timestamp with time zone (timestamptz) | no |
| `updated_at` | timestamp with time zone (timestamptz) | no |
| `deleted_at` | timestamp with time zone (timestamptz) | yes |
| `is_custom_price` | boolean (bool) | no |
| `product_type_id` | text | yes |
| `is_giftcard` | boolean (bool) | no |

Foreign keys:
- `order_line_item_totals_id_foreign`: `totals_id` → `order_item` (`id`)

### `order_line_item_adjustment` (table)

- RLS: **enabled**
- Primary key: `id`

| Column | Type | Nullable |
| --- | --- | --- |
| `id` | text | no |
| `description` | text | yes |
| `promotion_id` | text | yes |
| `code` | text | yes |
| `amount` | numeric | no |
| `raw_amount` | jsonb | no |
| `provider_id` | text | yes |
| `created_at` | timestamp with time zone (timestamptz) | no |
| `updated_at` | timestamp with time zone (timestamptz) | no |
| `item_id` | text | no |
| `deleted_at` | timestamp with time zone (timestamptz) | yes |
| `is_tax_inclusive` | boolean (bool) | no |
| `version` | integer (int4) | no |

Foreign keys:
- `order_line_item_adjustment_item_id_foreign`: `item_id` → `order_line_item` (`id`)

### `order_line_item_tax_line` (table)

- RLS: **enabled**
- Primary key: `id`

| Column | Type | Nullable |
| --- | --- | --- |
| `id` | text | no |
| `description` | text | yes |
| `tax_rate_id` | text | yes |
| `code` | text | no |
| `rate` | numeric | no |
| `raw_rate` | jsonb | no |
| `provider_id` | text | yes |
| `created_at` | timestamp with time zone (timestamptz) | no |
| `updated_at` | timestamp with time zone (timestamptz) | no |
| `item_id` | text | no |
| `deleted_at` | timestamp with time zone (timestamptz) | yes |

Foreign keys:
- `order_line_item_tax_line_item_id_foreign`: `item_id` → `order_line_item` (`id`)

### `order_payment_collection` (table)

- RLS: **enabled**
- Primary key: `order_id`, `payment_collection_id`

| Column | Type | Nullable |
| --- | --- | --- |
| `order_id` | character varying (varchar) | no |
| `payment_collection_id` | character varying (varchar) | no |
| `id` | character varying (varchar) | no |
| `created_at` | timestamp with time zone (timestamptz) | no |
| `updated_at` | timestamp with time zone (timestamptz) | no |
| `deleted_at` | timestamp with time zone (timestamptz) | yes |

### `order_promotion` (table)

- RLS: **enabled**
- Primary key: `order_id`, `promotion_id`

| Column | Type | Nullable |
| --- | --- | --- |
| `order_id` | character varying (varchar) | no |
| `promotion_id` | character varying (varchar) | no |
| `id` | character varying (varchar) | no |
| `created_at` | timestamp with time zone (timestamptz) | no |
| `updated_at` | timestamp with time zone (timestamptz) | no |
| `deleted_at` | timestamp with time zone (timestamptz) | yes |

### `order_shipping` (table)

- RLS: **enabled**
- Primary key: `id`

| Column | Type | Nullable |
| --- | --- | --- |
| `id` | text | no |
| `order_id` | text | no |
| `version` | integer (int4) | no |
| `shipping_method_id` | text | no |
| `created_at` | timestamp with time zone (timestamptz) | no |
| `updated_at` | timestamp with time zone (timestamptz) | no |
| `deleted_at` | timestamp with time zone (timestamptz) | yes |
| `return_id` | text | yes |
| `claim_id` | text | yes |
| `exchange_id` | text | yes |

Foreign keys:
- `order_shipping_order_id_foreign`: `order_id` → `"order"` (`id`)

### `order_shipping_method` (table)

- RLS: **enabled**
- Primary key: `id`

| Column | Type | Nullable |
| --- | --- | --- |
| `id` | text | no |
| `name` | text | no |
| `description` | jsonb | yes |
| `amount` | numeric | no |
| `raw_amount` | jsonb | no |
| `is_tax_inclusive` | boolean (bool) | no |
| `shipping_option_id` | text | yes |
| `data` | jsonb | yes |
| `metadata` | jsonb | yes |
| `created_at` | timestamp with time zone (timestamptz) | no |
| `updated_at` | timestamp with time zone (timestamptz) | no |
| `deleted_at` | timestamp with time zone (timestamptz) | yes |
| `is_custom_amount` | boolean (bool) | no |

### `order_shipping_method_adjustment` (table)

- RLS: **enabled**
- Primary key: `id`

| Column | Type | Nullable |
| --- | --- | --- |
| `id` | text | no |
| `description` | text | yes |
| `promotion_id` | text | yes |
| `code` | text | yes |
| `amount` | numeric | no |
| `raw_amount` | jsonb | no |
| `provider_id` | text | yes |
| `created_at` | timestamp with time zone (timestamptz) | no |
| `updated_at` | timestamp with time zone (timestamptz) | no |
| `shipping_method_id` | text | no |
| `deleted_at` | timestamp with time zone (timestamptz) | yes |

Foreign keys:
- `order_shipping_method_adjustment_shipping_method_id_foreign`: `shipping_method_id` → `order_shipping_method` (`id`)

### `order_shipping_method_tax_line` (table)

- RLS: **enabled**
- Primary key: `id`

| Column | Type | Nullable |
| --- | --- | --- |
| `id` | text | no |
| `description` | text | yes |
| `tax_rate_id` | text | yes |
| `code` | text | no |
| `rate` | numeric | no |
| `raw_rate` | jsonb | no |
| `provider_id` | text | yes |
| `created_at` | timestamp with time zone (timestamptz) | no |
| `updated_at` | timestamp with time zone (timestamptz) | no |
| `shipping_method_id` | text | no |
| `deleted_at` | timestamp with time zone (timestamptz) | yes |

Foreign keys:
- `order_shipping_method_tax_line_shipping_method_id_foreign`: `shipping_method_id` → `order_shipping_method` (`id`)

### `order_summary` (table)

- RLS: **enabled**
- Primary key: `id`

| Column | Type | Nullable |
| --- | --- | --- |
| `id` | text | no |
| `order_id` | text | no |
| `version` | integer (int4) | no |
| `totals` | jsonb | yes |
| `created_at` | timestamp with time zone (timestamptz) | no |
| `updated_at` | timestamp with time zone (timestamptz) | no |
| `deleted_at` | timestamp with time zone (timestamptz) | yes |

Foreign keys:
- `order_summary_order_id_foreign`: `order_id` → `"order"` (`id`)

### `order_transaction` (table)

- RLS: **enabled**
- Primary key: `id`

| Column | Type | Nullable |
| --- | --- | --- |
| `id` | text | no |
| `order_id` | text | no |
| `version` | integer (int4) | no |
| `amount` | numeric | no |
| `raw_amount` | jsonb | no |
| `currency_code` | text | no |
| `reference` | text | yes |
| `reference_id` | text | yes |
| `created_at` | timestamp with time zone (timestamptz) | no |
| `updated_at` | timestamp with time zone (timestamptz) | no |
| `deleted_at` | timestamp with time zone (timestamptz) | yes |
| `return_id` | text | yes |
| `claim_id` | text | yes |
| `exchange_id` | text | yes |

Foreign keys:
- `order_transaction_order_id_foreign`: `order_id` → `"order"` (`id`)

### `outreach_messages` (table)

- RLS: **enabled**
- Primary key: `id`

| Column | Type | Nullable |
| --- | --- | --- |
| `id` | uuid | no |
| `prospect_id` | uuid | no |
| `profile_id` | uuid | no |
| `campaign` | text | no |
| `sequence_step` | integer (int4) | no |
| `subject` | text | no |
| `body` | text | no |
| `personalization_evidence` | jsonb | no |
| `approval_status` | text | no |
| `sender_email` | text | no |
| `recipient_email` | text | no |
| `provider_message_id` | text | yes |
| `idempotency_key` | uuid | no |
| `approved_by` | uuid | yes |
| `approved_at` | timestamp with time zone (timestamptz) | yes |
| `sent_at` | timestamp with time zone (timestamptz) | yes |
| `replied_at` | timestamp with time zone (timestamptz) | yes |
| `bounced_at` | timestamp with time zone (timestamptz) | yes |
| `unsubscribed_at` | timestamp with time zone (timestamptz) | yes |
| `follow_up_eligible` | boolean (bool) | no |
| `next_action_at` | timestamp with time zone (timestamptz) | yes |
| `created_at` | timestamp with time zone (timestamptz) | no |
| `updated_at` | timestamp with time zone (timestamptz) | no |
| `provider_operation_id` | uuid | no |

Foreign keys:
- `outreach_messages_approved_by_fkey`: `approved_by` → `auth.users` (`id`)
- `outreach_messages_profile_id_fkey`: `profile_id` → `growth_profiles` (`id`)
- `outreach_messages_prospect_id_fkey`: `prospect_id` → `prospects` (`id`)
- `outreach_messages_provider_operation_id_fkey`: `provider_operation_id` → `provider_operations` (`id`)

### `payment` (table)

- RLS: **enabled**
- Primary key: `id`

| Column | Type | Nullable |
| --- | --- | --- |
| `id` | text | no |
| `amount` | numeric | no |
| `raw_amount` | jsonb | no |
| `currency_code` | text | no |
| `provider_id` | text | no |
| `data` | jsonb | yes |
| `created_at` | timestamp with time zone (timestamptz) | no |
| `updated_at` | timestamp with time zone (timestamptz) | no |
| `deleted_at` | timestamp with time zone (timestamptz) | yes |
| `captured_at` | timestamp with time zone (timestamptz) | yes |
| `canceled_at` | timestamp with time zone (timestamptz) | yes |
| `payment_collection_id` | text | no |
| `payment_session_id` | text | no |
| `metadata` | jsonb | yes |

Foreign keys:
- `payment_payment_collection_id_foreign`: `payment_collection_id` → `payment_collection` (`id`)

### `payment_collection` (table)

- RLS: **enabled**
- Primary key: `id`

| Column | Type | Nullable |
| --- | --- | --- |
| `id` | text | no |
| `currency_code` | text | no |
| `amount` | numeric | no |
| `raw_amount` | jsonb | no |
| `authorized_amount` | numeric | yes |
| `raw_authorized_amount` | jsonb | yes |
| `captured_amount` | numeric | yes |
| `raw_captured_amount` | jsonb | yes |
| `refunded_amount` | numeric | yes |
| `raw_refunded_amount` | jsonb | yes |
| `created_at` | timestamp with time zone (timestamptz) | no |
| `updated_at` | timestamp with time zone (timestamptz) | no |
| `deleted_at` | timestamp with time zone (timestamptz) | yes |
| `completed_at` | timestamp with time zone (timestamptz) | yes |
| `status` | text | no |
| `metadata` | jsonb | yes |

### `payment_collection_payment_providers` (table)

- RLS: **enabled**
- Primary key: `payment_collection_id`, `payment_provider_id`

| Column | Type | Nullable |
| --- | --- | --- |
| `payment_collection_id` | text | no |
| `payment_provider_id` | text | no |

Foreign keys:
- `payment_collection_payment_providers_payment_col_aa276_foreign`: `payment_collection_id` → `payment_collection` (`id`)
- `payment_collection_payment_providers_payment_pro_2d555_foreign`: `payment_provider_id` → `payment_provider` (`id`)

### `payment_provider` (table)

- RLS: **enabled**
- Primary key: `id`

| Column | Type | Nullable |
| --- | --- | --- |
| `id` | text | no |
| `is_enabled` | boolean (bool) | no |
| `created_at` | timestamp with time zone (timestamptz) | no |
| `updated_at` | timestamp with time zone (timestamptz) | no |
| `deleted_at` | timestamp with time zone (timestamptz) | yes |

### `payment_session` (table)

- RLS: **enabled**
- Primary key: `id`

| Column | Type | Nullable |
| --- | --- | --- |
| `id` | text | no |
| `currency_code` | text | no |
| `amount` | numeric | no |
| `raw_amount` | jsonb | no |
| `provider_id` | text | no |
| `data` | jsonb | no |
| `context` | jsonb | yes |
| `status` | text | no |
| `authorized_at` | timestamp with time zone (timestamptz) | yes |
| `payment_collection_id` | text | no |
| `metadata` | jsonb | yes |
| `created_at` | timestamp with time zone (timestamptz) | no |
| `updated_at` | timestamp with time zone (timestamptz) | no |
| `deleted_at` | timestamp with time zone (timestamptz) | yes |

Foreign keys:
- `payment_session_payment_collection_id_foreign`: `payment_collection_id` → `payment_collection` (`id`)

### `price` (table)

- RLS: **enabled**
- Primary key: `id`

| Column | Type | Nullable |
| --- | --- | --- |
| `id` | text | no |
| `title` | text | yes |
| `price_set_id` | text | no |
| `currency_code` | text | no |
| `raw_amount` | jsonb | no |
| `rules_count` | integer (int4) | yes |
| `created_at` | timestamp with time zone (timestamptz) | no |
| `updated_at` | timestamp with time zone (timestamptz) | no |
| `deleted_at` | timestamp with time zone (timestamptz) | yes |
| `price_list_id` | text | yes |
| `amount` | numeric | no |
| `min_quantity` | numeric | yes |
| `max_quantity` | numeric | yes |
| `raw_min_quantity` | jsonb | yes |
| `raw_max_quantity` | jsonb | yes |

Foreign keys:
- `price_price_list_id_foreign`: `price_list_id` → `price_list` (`id`)
- `price_price_set_id_foreign`: `price_set_id` → `price_set` (`id`)

### `price_list` (table)

- RLS: **enabled**
- Primary key: `id`

| Column | Type | Nullable |
| --- | --- | --- |
| `id` | text | no |
| `status` | text | no |
| `starts_at` | timestamp with time zone (timestamptz) | yes |
| `ends_at` | timestamp with time zone (timestamptz) | yes |
| `rules_count` | integer (int4) | yes |
| `title` | text | no |
| `description` | text | no |
| `type` | text | no |
| `created_at` | timestamp with time zone (timestamptz) | no |
| `updated_at` | timestamp with time zone (timestamptz) | no |
| `deleted_at` | timestamp with time zone (timestamptz) | yes |

### `price_list_rule` (table)

- RLS: **enabled**
- Primary key: `id`

| Column | Type | Nullable |
| --- | --- | --- |
| `id` | text | no |
| `price_list_id` | text | no |
| `created_at` | timestamp with time zone (timestamptz) | no |
| `updated_at` | timestamp with time zone (timestamptz) | no |
| `deleted_at` | timestamp with time zone (timestamptz) | yes |
| `value` | jsonb | yes |
| `attribute` | text | no |

Foreign keys:
- `price_list_rule_price_list_id_foreign`: `price_list_id` → `price_list` (`id`)

### `price_preference` (table)

- RLS: **enabled**
- Primary key: `id`

| Column | Type | Nullable |
| --- | --- | --- |
| `id` | text | no |
| `attribute` | text | no |
| `value` | text | yes |
| `is_tax_inclusive` | boolean (bool) | no |
| `created_at` | timestamp with time zone (timestamptz) | no |
| `updated_at` | timestamp with time zone (timestamptz) | no |
| `deleted_at` | timestamp with time zone (timestamptz) | yes |

### `price_rule` (table)

- RLS: **enabled**
- Primary key: `id`

| Column | Type | Nullable |
| --- | --- | --- |
| `id` | text | no |
| `value` | text | no |
| `priority` | integer (int4) | no |
| `price_id` | text | no |
| `created_at` | timestamp with time zone (timestamptz) | no |
| `updated_at` | timestamp with time zone (timestamptz) | no |
| `deleted_at` | timestamp with time zone (timestamptz) | yes |
| `attribute` | text | no |
| `operator` | text | no |

Foreign keys:
- `price_rule_price_id_foreign`: `price_id` → `price` (`id`)

### `price_set` (table)

- RLS: **enabled**
- Primary key: `id`

| Column | Type | Nullable |
| --- | --- | --- |
| `id` | text | no |
| `created_at` | timestamp with time zone (timestamptz) | no |
| `updated_at` | timestamp with time zone (timestamptz) | no |
| `deleted_at` | timestamp with time zone (timestamptz) | yes |

### `product` (table)

- RLS: **enabled**
- Primary key: `id`

| Column | Type | Nullable |
| --- | --- | --- |
| `id` | text | no |
| `title` | text | no |
| `handle` | text | no |
| `subtitle` | text | yes |
| `description` | text | yes |
| `is_giftcard` | boolean (bool) | no |
| `status` | text | no |
| `thumbnail` | text | yes |
| `weight` | text | yes |
| `length` | text | yes |
| `height` | text | yes |
| `width` | text | yes |
| `origin_country` | text | yes |
| `hs_code` | text | yes |
| `mid_code` | text | yes |
| `material` | text | yes |
| `collection_id` | text | yes |
| `type_id` | text | yes |
| `discountable` | boolean (bool) | no |
| `external_id` | text | yes |
| `created_at` | timestamp with time zone (timestamptz) | no |
| `updated_at` | timestamp with time zone (timestamptz) | no |
| `deleted_at` | timestamp with time zone (timestamptz) | yes |
| `metadata` | jsonb | yes |

Foreign keys:
- `product_collection_id_foreign`: `collection_id` → `product_collection` (`id`)
- `product_type_id_foreign`: `type_id` → `product_type` (`id`)

### `product_category` (table)

- RLS: **enabled**
- Primary key: `id`

| Column | Type | Nullable |
| --- | --- | --- |
| `id` | text | no |
| `name` | text | no |
| `description` | text | no |
| `handle` | text | no |
| `mpath` | text | no |
| `is_active` | boolean (bool) | no |
| `is_internal` | boolean (bool) | no |
| `rank` | integer (int4) | no |
| `parent_category_id` | text | yes |
| `created_at` | timestamp with time zone (timestamptz) | no |
| `updated_at` | timestamp with time zone (timestamptz) | no |
| `deleted_at` | timestamp with time zone (timestamptz) | yes |
| `metadata` | jsonb | yes |

Foreign keys:
- `product_category_parent_category_id_foreign`: `parent_category_id` → `product_category` (`id`)

### `product_category_product` (table)

- RLS: **enabled**
- Primary key: `product_id`, `product_category_id`

| Column | Type | Nullable |
| --- | --- | --- |
| `product_id` | text | no |
| `product_category_id` | text | no |

Foreign keys:
- `product_category_product_product_category_id_foreign`: `product_category_id` → `product_category` (`id`)
- `product_category_product_product_id_foreign`: `product_id` → `product` (`id`)

### `product_collection` (table)

- RLS: **enabled**
- Primary key: `id`

| Column | Type | Nullable |
| --- | --- | --- |
| `id` | text | no |
| `title` | text | no |
| `handle` | text | no |
| `metadata` | jsonb | yes |
| `created_at` | timestamp with time zone (timestamptz) | no |
| `updated_at` | timestamp with time zone (timestamptz) | no |
| `deleted_at` | timestamp with time zone (timestamptz) | yes |

### `product_option` (table)

- RLS: **enabled**
- Primary key: `id`

| Column | Type | Nullable |
| --- | --- | --- |
| `id` | text | no |
| `title` | text | no |
| `product_id` | text | no |
| `metadata` | jsonb | yes |
| `created_at` | timestamp with time zone (timestamptz) | no |
| `updated_at` | timestamp with time zone (timestamptz) | no |
| `deleted_at` | timestamp with time zone (timestamptz) | yes |

Foreign keys:
- `product_option_product_id_foreign`: `product_id` → `product` (`id`)

### `product_option_value` (table)

- RLS: **enabled**
- Primary key: `id`

| Column | Type | Nullable |
| --- | --- | --- |
| `id` | text | no |
| `value` | text | no |
| `option_id` | text | yes |
| `metadata` | jsonb | yes |
| `created_at` | timestamp with time zone (timestamptz) | no |
| `updated_at` | timestamp with time zone (timestamptz) | no |
| `deleted_at` | timestamp with time zone (timestamptz) | yes |

Foreign keys:
- `product_option_value_option_id_foreign`: `option_id` → `product_option` (`id`)

### `product_sales_channel` (table)

- RLS: **enabled**
- Primary key: `product_id`, `sales_channel_id`

| Column | Type | Nullable |
| --- | --- | --- |
| `product_id` | character varying (varchar) | no |
| `sales_channel_id` | character varying (varchar) | no |
| `id` | character varying (varchar) | no |
| `created_at` | timestamp with time zone (timestamptz) | no |
| `updated_at` | timestamp with time zone (timestamptz) | no |
| `deleted_at` | timestamp with time zone (timestamptz) | yes |

### `product_shipping_profile` (table)

- RLS: **enabled**
- Primary key: `product_id`, `shipping_profile_id`

| Column | Type | Nullable |
| --- | --- | --- |
| `product_id` | character varying (varchar) | no |
| `shipping_profile_id` | character varying (varchar) | no |
| `id` | character varying (varchar) | no |
| `created_at` | timestamp with time zone (timestamptz) | no |
| `updated_at` | timestamp with time zone (timestamptz) | no |
| `deleted_at` | timestamp with time zone (timestamptz) | yes |

### `product_tag` (table)

- RLS: **enabled**
- Primary key: `id`

| Column | Type | Nullable |
| --- | --- | --- |
| `id` | text | no |
| `value` | text | no |
| `metadata` | jsonb | yes |
| `created_at` | timestamp with time zone (timestamptz) | no |
| `updated_at` | timestamp with time zone (timestamptz) | no |
| `deleted_at` | timestamp with time zone (timestamptz) | yes |

### `product_tags` (table)

- RLS: **enabled**
- Primary key: `product_id`, `product_tag_id`

| Column | Type | Nullable |
| --- | --- | --- |
| `product_id` | text | no |
| `product_tag_id` | text | no |

Foreign keys:
- `product_tags_product_id_foreign`: `product_id` → `product` (`id`)
- `product_tags_product_tag_id_foreign`: `product_tag_id` → `product_tag` (`id`)

### `product_type` (table)

- RLS: **enabled**
- Primary key: `id`

| Column | Type | Nullable |
| --- | --- | --- |
| `id` | text | no |
| `value` | text | no |
| `metadata` | json | yes |
| `created_at` | timestamp with time zone (timestamptz) | no |
| `updated_at` | timestamp with time zone (timestamptz) | no |
| `deleted_at` | timestamp with time zone (timestamptz) | yes |

### `product_variant` (table)

- RLS: **enabled**
- Primary key: `id`

| Column | Type | Nullable |
| --- | --- | --- |
| `id` | text | no |
| `title` | text | no |
| `sku` | text | yes |
| `barcode` | text | yes |
| `ean` | text | yes |
| `upc` | text | yes |
| `allow_backorder` | boolean (bool) | no |
| `manage_inventory` | boolean (bool) | no |
| `hs_code` | text | yes |
| `origin_country` | text | yes |
| `mid_code` | text | yes |
| `material` | text | yes |
| `weight` | integer (int4) | yes |
| `length` | integer (int4) | yes |
| `height` | integer (int4) | yes |
| `width` | integer (int4) | yes |
| `metadata` | jsonb | yes |
| `variant_rank` | integer (int4) | yes |
| `product_id` | text | yes |
| `created_at` | timestamp with time zone (timestamptz) | no |
| `updated_at` | timestamp with time zone (timestamptz) | no |
| `deleted_at` | timestamp with time zone (timestamptz) | yes |
| `thumbnail` | text | yes |

Foreign keys:
- `product_variant_product_id_foreign`: `product_id` → `product` (`id`)

### `product_variant_inventory_item` (table)

- RLS: **enabled**
- Primary key: `variant_id`, `inventory_item_id`

| Column | Type | Nullable |
| --- | --- | --- |
| `variant_id` | character varying (varchar) | no |
| `inventory_item_id` | character varying (varchar) | no |
| `id` | character varying (varchar) | no |
| `required_quantity` | integer (int4) | no |
| `created_at` | timestamp with time zone (timestamptz) | no |
| `updated_at` | timestamp with time zone (timestamptz) | no |
| `deleted_at` | timestamp with time zone (timestamptz) | yes |

### `product_variant_option` (table)

- RLS: **enabled**
- Primary key: `variant_id`, `option_value_id`

| Column | Type | Nullable |
| --- | --- | --- |
| `variant_id` | text | no |
| `option_value_id` | text | no |

Foreign keys:
- `product_variant_option_option_value_id_foreign`: `option_value_id` → `product_option_value` (`id`)
- `product_variant_option_variant_id_foreign`: `variant_id` → `product_variant` (`id`)

### `product_variant_price_set` (table)

- RLS: **enabled**
- Primary key: `variant_id`, `price_set_id`

| Column | Type | Nullable |
| --- | --- | --- |
| `variant_id` | character varying (varchar) | no |
| `price_set_id` | character varying (varchar) | no |
| `id` | character varying (varchar) | no |
| `created_at` | timestamp with time zone (timestamptz) | no |
| `updated_at` | timestamp with time zone (timestamptz) | no |
| `deleted_at` | timestamp with time zone (timestamptz) | yes |

### `product_variant_product_image` (table)

- RLS: **enabled**
- Primary key: `id`

| Column | Type | Nullable |
| --- | --- | --- |
| `id` | text | no |
| `variant_id` | text | no |
| `image_id` | text | no |
| `created_at` | timestamp with time zone (timestamptz) | no |
| `updated_at` | timestamp with time zone (timestamptz) | no |
| `deleted_at` | timestamp with time zone (timestamptz) | yes |

Foreign keys:
- `product_variant_product_image_image_id_foreign`: `image_id` → `image` (`id`)

### `project_comments` (table)

- RLS: **enabled**
- Primary key: `id`

| Column | Type | Nullable |
| --- | --- | --- |
| `id` | uuid | no |
| `project_id` | uuid | no |
| `user_id` | uuid | no |
| `content` | text | no |
| `is_internal` | boolean (bool) | yes |
| `created_at` | timestamp with time zone (timestamptz) | yes |

Foreign keys:
- `project_comments_project_id_fkey`: `project_id` → `projects` (`id`)
- `project_comments_user_id_fkey`: `user_id` → `auth.users` (`id`)

### `project_github_handoffs` (table)

- RLS: **enabled**
- Primary key: `id`

| Column | Type | Nullable |
| --- | --- | --- |
| `id` | uuid | no |
| `project_id` | uuid | no |
| `github_url` | text | no |
| `note` | text | yes |
| `created_by` | uuid | yes |
| `notification_status` | text | no |
| `notification_attempts` | integer (int4) | no |
| `notification_sent_at` | timestamp with time zone (timestamptz) | yes |
| `notification_provider_id` | text | yes |
| `notification_error` | text | yes |
| `created_at` | timestamp with time zone (timestamptz) | no |
| `updated_at` | timestamp with time zone (timestamptz) | no |
| `notification_idempotency_key` | uuid | no |
| `notification_operation_id` | uuid | no |

Foreign keys:
- `project_github_handoffs_created_by_fkey`: `created_by` → `auth.users` (`id`)
- `project_github_handoffs_notification_operation_id_fkey`: `notification_operation_id` → `provider_operations` (`id`)
- `project_github_handoffs_project_id_fkey`: `project_id` → `projects` (`id`)

### `projects` (table)

- RLS: **enabled**
- Primary key: `id`

| Column | Type | Nullable |
| --- | --- | --- |
| `id` | uuid | no |
| `name` | text | no |
| `email` | text | no |
| `company` | text | yes |
| `service` | text | yes |
| `message` | text | no |
| `attachments` | ARRAY (_text) | yes |
| `status` | USER-DEFINED (project_status) | yes |
| `created_at` | timestamp with time zone (timestamptz) | yes |
| `updated_at` | timestamp with time zone (timestamptz) | yes |
| `user_id` | uuid | yes |
| `consultation_type` | text | yes |
| `preferred_consultation_at` | timestamp with time zone (timestamptz) | yes |
| `alternate_consultation_at` | timestamp with time zone (timestamptz) | yes |
| `customer_id` | uuid | yes |
| `intake_context` | jsonb | yes |

Foreign keys:
- `projects_customer_id_fkey`: `customer_id` → `customer_accounts` (`id`)
- `projects_user_id_fkey`: `user_id` → `auth.users` (`id`)

### `promotion` (table)

- RLS: **enabled**
- Primary key: `id`

| Column | Type | Nullable |
| --- | --- | --- |
| `id` | text | no |
| `code` | text | no |
| `campaign_id` | text | yes |
| `is_automatic` | boolean (bool) | no |
| `type` | text | no |
| `created_at` | timestamp with time zone (timestamptz) | no |
| `updated_at` | timestamp with time zone (timestamptz) | no |
| `deleted_at` | timestamp with time zone (timestamptz) | yes |
| `status` | text | no |
| `is_tax_inclusive` | boolean (bool) | no |
| `limit` | integer (int4) | yes |
| `used` | integer (int4) | no |
| `metadata` | jsonb | yes |

Foreign keys:
- `promotion_campaign_id_foreign`: `campaign_id` → `promotion_campaign` (`id`)

### `promotion_application_method` (table)

- RLS: **enabled**
- Primary key: `id`

| Column | Type | Nullable |
| --- | --- | --- |
| `id` | text | no |
| `value` | numeric | yes |
| `raw_value` | jsonb | yes |
| `max_quantity` | integer (int4) | yes |
| `apply_to_quantity` | integer (int4) | yes |
| `buy_rules_min_quantity` | integer (int4) | yes |
| `type` | text | no |
| `target_type` | text | no |
| `allocation` | text | yes |
| `promotion_id` | text | no |
| `created_at` | timestamp with time zone (timestamptz) | no |
| `updated_at` | timestamp with time zone (timestamptz) | no |
| `deleted_at` | timestamp with time zone (timestamptz) | yes |
| `currency_code` | text | yes |

Foreign keys:
- `promotion_application_method_promotion_id_foreign`: `promotion_id` → `promotion` (`id`)

### `promotion_campaign` (table)

- RLS: **enabled**
- Primary key: `id`

| Column | Type | Nullable |
| --- | --- | --- |
| `id` | text | no |
| `name` | text | no |
| `description` | text | yes |
| `campaign_identifier` | text | no |
| `starts_at` | timestamp with time zone (timestamptz) | yes |
| `ends_at` | timestamp with time zone (timestamptz) | yes |
| `created_at` | timestamp with time zone (timestamptz) | no |
| `updated_at` | timestamp with time zone (timestamptz) | no |
| `deleted_at` | timestamp with time zone (timestamptz) | yes |

### `promotion_campaign_budget` (table)

- RLS: **enabled**
- Primary key: `id`

| Column | Type | Nullable |
| --- | --- | --- |
| `id` | text | no |
| `type` | text | no |
| `campaign_id` | text | no |
| `limit` | numeric | yes |
| `raw_limit` | jsonb | yes |
| `used` | numeric | no |
| `raw_used` | jsonb | no |
| `created_at` | timestamp with time zone (timestamptz) | no |
| `updated_at` | timestamp with time zone (timestamptz) | no |
| `deleted_at` | timestamp with time zone (timestamptz) | yes |
| `currency_code` | text | yes |
| `attribute` | text | yes |

Foreign keys:
- `promotion_campaign_budget_campaign_id_foreign`: `campaign_id` → `promotion_campaign` (`id`)

### `promotion_campaign_budget_usage` (table)

- RLS: **enabled**
- Primary key: `id`

| Column | Type | Nullable |
| --- | --- | --- |
| `id` | text | no |
| `attribute_value` | text | no |
| `used` | numeric | no |
| `budget_id` | text | no |
| `raw_used` | jsonb | no |
| `created_at` | timestamp with time zone (timestamptz) | no |
| `updated_at` | timestamp with time zone (timestamptz) | no |
| `deleted_at` | timestamp with time zone (timestamptz) | yes |

Foreign keys:
- `promotion_campaign_budget_usage_budget_id_foreign`: `budget_id` → `promotion_campaign_budget` (`id`)

### `promotion_promotion_rule` (table)

- RLS: **enabled**
- Primary key: `promotion_id`, `promotion_rule_id`

| Column | Type | Nullable |
| --- | --- | --- |
| `promotion_id` | text | no |
| `promotion_rule_id` | text | no |

Foreign keys:
- `promotion_promotion_rule_promotion_id_foreign`: `promotion_id` → `promotion` (`id`)
- `promotion_promotion_rule_promotion_rule_id_foreign`: `promotion_rule_id` → `promotion_rule` (`id`)

### `promotion_rule` (table)

- RLS: **enabled**
- Primary key: `id`

| Column | Type | Nullable |
| --- | --- | --- |
| `id` | text | no |
| `description` | text | yes |
| `attribute` | text | no |
| `operator` | text | no |
| `created_at` | timestamp with time zone (timestamptz) | no |
| `updated_at` | timestamp with time zone (timestamptz) | no |
| `deleted_at` | timestamp with time zone (timestamptz) | yes |

### `promotion_rule_value` (table)

- RLS: **enabled**
- Primary key: `id`

| Column | Type | Nullable |
| --- | --- | --- |
| `id` | text | no |
| `promotion_rule_id` | text | no |
| `value` | text | no |
| `created_at` | timestamp with time zone (timestamptz) | no |
| `updated_at` | timestamp with time zone (timestamptz) | no |
| `deleted_at` | timestamp with time zone (timestamptz) | yes |

Foreign keys:
- `promotion_rule_value_promotion_rule_id_foreign`: `promotion_rule_id` → `promotion_rule` (`id`)

### `prospect_dossiers` (table)

- RLS: **enabled**
- Primary key: `id`

| Column | Type | Nullable |
| --- | --- | --- |
| `id` | uuid | no |
| `profile_id` | uuid | no |
| `prospect_id` | uuid | no |
| `task_id` | uuid | yes |
| `company_name` | text | no |
| `official_website_url` | text | no |
| `icp_reason` | text | no |
| `observed_evidence` | jsonb | no |
| `citations` | jsonb | no |
| `recommended_offer_angle` | text | no |
| `contact_path` | jsonb | no |
| `suggested_subject` | text | no |
| `suggested_body` | text | no |
| `model_id` | text | no |
| `review_status` | text | no |
| `promoted_message_id` | uuid | yes |
| `reviewed_by` | uuid | yes |
| `reviewed_at` | timestamp with time zone (timestamptz) | yes |
| `created_at` | timestamp with time zone (timestamptz) | no |
| `updated_at` | timestamp with time zone (timestamptz) | no |
| `orchestration_task_id` | uuid | yes |
| `agent_artifact_id` | uuid | yes |
| `model_usage_reservation_id` | uuid | yes |
| `worker_id` | text | yes |

Foreign keys:
- `prospect_dossiers_agent_artifact_id_fkey`: `agent_artifact_id` → `agent_artifacts` (`id`)
- `prospect_dossiers_model_usage_reservation_id_fkey`: `model_usage_reservation_id` → `openclaw_model_usage_reservations` (`id`)
- `prospect_dossiers_orchestration_task_id_fkey`: `orchestration_task_id` → `agent_orchestration_tasks` (`id`)
- `prospect_dossiers_profile_id_fkey`: `profile_id` → `growth_profiles` (`id`)
- `prospect_dossiers_promoted_message_id_fkey`: `promoted_message_id` → `outreach_messages` (`id`)
- `prospect_dossiers_prospect_id_fkey`: `prospect_id` → `prospects` (`id`)
- `prospect_dossiers_reviewed_by_fkey`: `reviewed_by` → `auth.users` (`id`)
- `prospect_dossiers_task_id_fkey`: `task_id` → `agent_tasks` (`id`)

### `prospect_outcomes` (table)

- RLS: **enabled**
- Primary key: `id`

| Column | Type | Nullable |
| --- | --- | --- |
| `id` | uuid | no |
| `prospect_id` | uuid | no |
| `message_id` | uuid | yes |
| `outcome_type` | text | no |
| `notes` | text | no |
| `occurred_at` | timestamp with time zone (timestamptz) | no |
| `recorded_by` | uuid | yes |
| `idempotency_key` | uuid | no |

Foreign keys:
- `prospect_outcomes_message_id_fkey`: `message_id` → `outreach_messages` (`id`)
- `prospect_outcomes_prospect_id_fkey`: `prospect_id` → `prospects` (`id`)
- `prospect_outcomes_recorded_by_fkey`: `recorded_by` → `auth.users` (`id`)

### `prospect_sources` (table)

- RLS: **enabled**
- Primary key: `id`

| Column | Type | Nullable |
| --- | --- | --- |
| `id` | uuid | no |
| `prospect_id` | uuid | no |
| `source_url` | text | no |
| `source_type` | text | no |
| `evidence` | jsonb | no |
| `contact_path` | text | yes |
| `email_status` | text | no |
| `discovered_by` | text | no |
| `created_at` | timestamp with time zone (timestamptz) | no |

Foreign keys:
- `prospect_sources_prospect_id_fkey`: `prospect_id` → `prospects` (`id`)

### `prospecting_artifact_provenance` (table)

- RLS: **enabled**
- Primary key: `id`

| Column | Type | Nullable |
| --- | --- | --- |
| `id` | uuid | no |
| `owner_id` | uuid | no |
| `growth_profile_id` | uuid | no |
| `plan_id` | uuid | no |
| `run_id` | uuid | no |
| `orchestration_task_id` | uuid | no |
| `artifact_id` | uuid | no |
| `model_usage_reservation_id` | uuid | yes |
| `model_id` | text | no |
| `worker_id` | text | no |
| `prospect_ids` | jsonb | no |
| `validation_status` | text | no |
| `validation_errors` | jsonb | no |
| `created_at` | timestamp with time zone (timestamptz) | no |

Foreign keys:
- `prospecting_artifact_provenance_artifact_id_fkey`: `artifact_id` → `agent_artifacts` (`id`)
- `prospecting_artifact_provenance_growth_profile_id_fkey`: `growth_profile_id` → `growth_profiles` (`id`)
- `prospecting_artifact_provenance_model_usage_reservation_id_fkey`: `model_usage_reservation_id` → `openclaw_model_usage_reservations` (`id`)
- `prospecting_artifact_provenance_orchestration_task_id_fkey`: `orchestration_task_id` → `agent_orchestration_tasks` (`id`)
- `prospecting_artifact_provenance_owner_id_fkey`: `owner_id` → `auth.users` (`id`)
- `prospecting_artifact_provenance_plan_id_fkey`: `plan_id` → `agent_plans` (`id`)
- `prospecting_artifact_provenance_run_id_fkey`: `run_id` → `agent_runs` (`id`)

### `prospects` (table)

- RLS: **enabled**
- Primary key: `id`

| Column | Type | Nullable |
| --- | --- | --- |
| `id` | uuid | no |
| `profile_id` | uuid | no |
| `company_name` | text | no |
| `contact_name` | text | yes |
| `contact_title` | text | yes |
| `email` | text | yes |
| `website_url` | text | no |
| `deduplication_key` | text | no |
| `icp_match_score` | integer (int4) | no |
| `icp_match_reason` | text | no |
| `outreach_status` | text | no |
| `suppression_status` | text | no |
| `discovered_at` | timestamp with time zone (timestamptz) | no |
| `last_contacted_at` | timestamp with time zone (timestamptz) | yes |
| `last_replied_at` | timestamp with time zone (timestamptz) | yes |
| `created_at` | timestamp with time zone (timestamptz) | no |
| `updated_at` | timestamp with time zone (timestamptz) | no |

Foreign keys:
- `prospects_profile_id_fkey`: `profile_id` → `growth_profiles` (`id`)

### `provider_identity` (table)

- RLS: **enabled**
- Primary key: `id`

| Column | Type | Nullable |
| --- | --- | --- |
| `id` | text | no |
| `entity_id` | text | no |
| `provider` | text | no |
| `auth_identity_id` | text | no |
| `user_metadata` | jsonb | yes |
| `provider_metadata` | jsonb | yes |
| `created_at` | timestamp with time zone (timestamptz) | no |
| `updated_at` | timestamp with time zone (timestamptz) | no |
| `deleted_at` | timestamp with time zone (timestamptz) | yes |

Foreign keys:
- `provider_identity_auth_identity_id_foreign`: `auth_identity_id` → `auth_identity` (`id`)

### `provider_operations` (table)

- RLS: **enabled**
- Primary key: `id`

| Column | Type | Nullable |
| --- | --- | --- |
| `id` | uuid | no |
| `provider` | text | no |
| `operation_type` | text | no |
| `idempotency_key` | text | no |
| `status` | text | no |
| `provider_reference` | text | yes |
| `request_metadata` | jsonb | no |
| `response_metadata` | jsonb | no |
| `last_error` | text | yes |
| `attempted_at` | timestamp with time zone (timestamptz) | yes |
| `completed_at` | timestamp with time zone (timestamptz) | yes |
| `created_at` | timestamp with time zone (timestamptz) | no |
| `updated_at` | timestamp with time zone (timestamptz) | no |

### `provider_webhook_receipts` (table)

- RLS: **enabled**
- Primary key: `id`

| Column | Type | Nullable |
| --- | --- | --- |
| `id` | uuid | no |
| `provider` | text | no |
| `provider_event_id` | text | no |
| `payload_sha256` | text | no |
| `signature_verified` | boolean (bool) | no |
| `status` | text | no |
| `received_at` | timestamp with time zone (timestamptz) | no |
| `processed_at` | timestamp with time zone (timestamptz) | yes |
| `failure_reason` | text | yes |

### `public_engagement_daily_metrics` (table)

- RLS: **enabled**
- Primary key: `metric_date`, `event`, `route`, `element`, `variant`

| Column | Type | Nullable |
| --- | --- | --- |
| `metric_date` | date | no |
| `event` | text | no |
| `route` | text | no |
| `element` | text | no |
| `variant` | text | no |
| `count` | bigint (int8) | no |

### `publishable_api_key_sales_channel` (table)

- RLS: **enabled**
- Primary key: `publishable_key_id`, `sales_channel_id`

| Column | Type | Nullable |
| --- | --- | --- |
| `publishable_key_id` | character varying (varchar) | no |
| `sales_channel_id` | character varying (varchar) | no |
| `id` | character varying (varchar) | no |
| `created_at` | timestamp with time zone (timestamptz) | no |
| `updated_at` | timestamp with time zone (timestamptz) | no |
| `deleted_at` | timestamp with time zone (timestamptz) | yes |

### `refund` (table)

- RLS: **enabled**
- Primary key: `id`

| Column | Type | Nullable |
| --- | --- | --- |
| `id` | text | no |
| `amount` | numeric | no |
| `raw_amount` | jsonb | no |
| `payment_id` | text | no |
| `created_at` | timestamp with time zone (timestamptz) | no |
| `updated_at` | timestamp with time zone (timestamptz) | no |
| `deleted_at` | timestamp with time zone (timestamptz) | yes |
| `created_by` | text | yes |
| `metadata` | jsonb | yes |
| `refund_reason_id` | text | yes |
| `note` | text | yes |

Foreign keys:
- `refund_payment_id_foreign`: `payment_id` → `payment` (`id`)

### `refund_reason` (table)

- RLS: **enabled**
- Primary key: `id`

| Column | Type | Nullable |
| --- | --- | --- |
| `id` | text | no |
| `label` | text | no |
| `description` | text | yes |
| `metadata` | jsonb | yes |
| `created_at` | timestamp with time zone (timestamptz) | no |
| `updated_at` | timestamp with time zone (timestamptz) | no |
| `deleted_at` | timestamp with time zone (timestamptz) | yes |
| `code` | text | no |

### `region` (table)

- RLS: **enabled**
- Primary key: `id`

| Column | Type | Nullable |
| --- | --- | --- |
| `id` | text | no |
| `name` | text | no |
| `currency_code` | text | no |
| `metadata` | jsonb | yes |
| `created_at` | timestamp with time zone (timestamptz) | no |
| `updated_at` | timestamp with time zone (timestamptz) | no |
| `deleted_at` | timestamp with time zone (timestamptz) | yes |
| `automatic_taxes` | boolean (bool) | no |

### `region_country` (table)

- RLS: **enabled**
- Primary key: `iso_2`

| Column | Type | Nullable |
| --- | --- | --- |
| `iso_2` | text | no |
| `iso_3` | text | no |
| `num_code` | text | no |
| `name` | text | no |
| `display_name` | text | no |
| `region_id` | text | yes |
| `metadata` | jsonb | yes |
| `created_at` | timestamp with time zone (timestamptz) | no |
| `updated_at` | timestamp with time zone (timestamptz) | no |
| `deleted_at` | timestamp with time zone (timestamptz) | yes |

Foreign keys:
- `region_country_region_id_foreign`: `region_id` → `region` (`id`)

### `region_payment_provider` (table)

- RLS: **enabled**
- Primary key: `region_id`, `payment_provider_id`

| Column | Type | Nullable |
| --- | --- | --- |
| `region_id` | character varying (varchar) | no |
| `payment_provider_id` | character varying (varchar) | no |
| `id` | character varying (varchar) | no |
| `created_at` | timestamp with time zone (timestamptz) | no |
| `updated_at` | timestamp with time zone (timestamptz) | no |
| `deleted_at` | timestamp with time zone (timestamptz) | yes |

### `resend_transactional_events` (table)

- RLS: **enabled**
- Primary key: `id`

| Column | Type | Nullable |
| --- | --- | --- |
| `id` | uuid | no |
| `message_id` | uuid | yes |
| `receipt_id` | uuid | no |
| `event_type` | text | no |
| `occurred_at` | timestamp with time zone (timestamptz) | no |
| `metadata` | jsonb | no |

Foreign keys:
- `resend_transactional_events_message_id_fkey`: `message_id` → `resend_transactional_messages` (`id`)
- `resend_transactional_events_receipt_id_fkey`: `receipt_id` → `provider_webhook_receipts` (`id`)

### `resend_transactional_messages` (table)

- RLS: **enabled**
- Primary key: `id`

| Column | Type | Nullable |
| --- | --- | --- |
| `id` | uuid | no |
| `operation_id` | uuid | no |
| `project_id` | uuid | yes |
| `recipient_hash` | text | no |
| `subject` | text | no |
| `provider_message_id` | text | yes |
| `status` | text | no |
| `created_at` | timestamp with time zone (timestamptz) | no |
| `updated_at` | timestamp with time zone (timestamptz) | no |

Foreign keys:
- `resend_transactional_messages_operation_id_fkey`: `operation_id` → `provider_operations` (`id`)
- `resend_transactional_messages_project_id_fkey`: `project_id` → `projects` (`id`)

### `reservation_item` (table)

- RLS: **enabled**
- Primary key: `id`

| Column | Type | Nullable |
| --- | --- | --- |
| `id` | text | no |
| `created_at` | timestamp with time zone (timestamptz) | no |
| `updated_at` | timestamp with time zone (timestamptz) | no |
| `deleted_at` | timestamp with time zone (timestamptz) | yes |
| `line_item_id` | text | yes |
| `location_id` | text | no |
| `quantity` | numeric | no |
| `external_id` | text | yes |
| `description` | text | yes |
| `created_by` | text | yes |
| `metadata` | jsonb | yes |
| `inventory_item_id` | text | no |
| `allow_backorder` | boolean (bool) | yes |
| `raw_quantity` | jsonb | yes |

Foreign keys:
- `reservation_item_inventory_item_id_foreign`: `inventory_item_id` → `inventory_item` (`id`)

### `return` (table)

- RLS: **enabled**
- Primary key: `id`

| Column | Type | Nullable |
| --- | --- | --- |
| `id` | text | no |
| `order_id` | text | no |
| `claim_id` | text | yes |
| `exchange_id` | text | yes |
| `order_version` | integer (int4) | no |
| `display_id` | integer (int4) | no |
| `status` | USER-DEFINED (return_status_enum) | no |
| `no_notification` | boolean (bool) | yes |
| `refund_amount` | numeric | yes |
| `raw_refund_amount` | jsonb | yes |
| `metadata` | jsonb | yes |
| `created_at` | timestamp with time zone (timestamptz) | no |
| `updated_at` | timestamp with time zone (timestamptz) | no |
| `deleted_at` | timestamp with time zone (timestamptz) | yes |
| `received_at` | timestamp with time zone (timestamptz) | yes |
| `canceled_at` | timestamp with time zone (timestamptz) | yes |
| `location_id` | text | yes |
| `requested_at` | timestamp with time zone (timestamptz) | yes |
| `created_by` | text | yes |

### `return_fulfillment` (table)

- RLS: **enabled**
- Primary key: `return_id`, `fulfillment_id`

| Column | Type | Nullable |
| --- | --- | --- |
| `return_id` | character varying (varchar) | no |
| `fulfillment_id` | character varying (varchar) | no |
| `id` | character varying (varchar) | no |
| `created_at` | timestamp with time zone (timestamptz) | no |
| `updated_at` | timestamp with time zone (timestamptz) | no |
| `deleted_at` | timestamp with time zone (timestamptz) | yes |

### `return_item` (table)

- RLS: **enabled**
- Primary key: `id`

| Column | Type | Nullable |
| --- | --- | --- |
| `id` | text | no |
| `return_id` | text | no |
| `reason_id` | text | yes |
| `item_id` | text | no |
| `quantity` | numeric | no |
| `raw_quantity` | jsonb | no |
| `received_quantity` | numeric | no |
| `raw_received_quantity` | jsonb | no |
| `note` | text | yes |
| `metadata` | jsonb | yes |
| `created_at` | timestamp with time zone (timestamptz) | no |
| `updated_at` | timestamp with time zone (timestamptz) | no |
| `deleted_at` | timestamp with time zone (timestamptz) | yes |
| `damaged_quantity` | numeric | no |
| `raw_damaged_quantity` | jsonb | no |

### `return_reason` (table)

- RLS: **enabled**
- Primary key: `id`

| Column | Type | Nullable |
| --- | --- | --- |
| `id` | character varying (varchar) | no |
| `value` | character varying (varchar) | no |
| `label` | character varying (varchar) | no |
| `description` | character varying (varchar) | yes |
| `metadata` | jsonb | yes |
| `parent_return_reason_id` | character varying (varchar) | yes |
| `created_at` | timestamp with time zone (timestamptz) | no |
| `updated_at` | timestamp with time zone (timestamptz) | no |
| `deleted_at` | timestamp with time zone (timestamptz) | yes |

Foreign keys:
- `return_reason_parent_return_reason_id_foreign`: `parent_return_reason_id` → `return_reason` (`id`)

### `sales_channel` (table)

- RLS: **enabled**
- Primary key: `id`

| Column | Type | Nullable |
| --- | --- | --- |
| `id` | text | no |
| `name` | text | no |
| `description` | text | yes |
| `is_disabled` | boolean (bool) | no |
| `metadata` | jsonb | yes |
| `created_at` | timestamp with time zone (timestamptz) | no |
| `updated_at` | timestamp with time zone (timestamptz) | no |
| `deleted_at` | timestamp with time zone (timestamptz) | yes |

### `sales_channel_stock_location` (table)

- RLS: **enabled**
- Primary key: `sales_channel_id`, `stock_location_id`

| Column | Type | Nullable |
| --- | --- | --- |
| `sales_channel_id` | character varying (varchar) | no |
| `stock_location_id` | character varying (varchar) | no |
| `id` | character varying (varchar) | no |
| `created_at` | timestamp with time zone (timestamptz) | no |
| `updated_at` | timestamp with time zone (timestamptz) | no |
| `deleted_at` | timestamp with time zone (timestamptz) | yes |

### `script_migrations` (table)

- RLS: **enabled**
- Primary key: `id`

| Column | Type | Nullable |
| --- | --- | --- |
| `id` | integer (int4) | no |
| `script_name` | character varying (varchar) | no |
| `created_at` | timestamp with time zone (timestamptz) | yes |
| `finished_at` | timestamp with time zone (timestamptz) | yes |

### `sender_events` (table)

- RLS: **enabled**
- Primary key: `id`

| Column | Type | Nullable |
| --- | --- | --- |
| `id` | uuid | no |
| `message_id` | uuid | yes |
| `event_type` | text | no |
| `provider_event_id` | text | no |
| `provider_message_id` | text | yes |
| `address` | text | yes |
| `payload` | jsonb | no |
| `occurred_at` | timestamp with time zone (timestamptz) | no |
| `created_at` | timestamp with time zone (timestamptz) | no |

Foreign keys:
- `sender_events_message_id_fkey`: `message_id` → `outreach_messages` (`id`)

### `service_zone` (table)

- RLS: **enabled**
- Primary key: `id`

| Column | Type | Nullable |
| --- | --- | --- |
| `id` | text | no |
| `name` | text | no |
| `metadata` | jsonb | yes |
| `fulfillment_set_id` | text | no |
| `created_at` | timestamp with time zone (timestamptz) | no |
| `updated_at` | timestamp with time zone (timestamptz) | no |
| `deleted_at` | timestamp with time zone (timestamptz) | yes |

Foreign keys:
- `service_zone_fulfillment_set_id_foreign`: `fulfillment_set_id` → `fulfillment_set` (`id`)

### `shipping_option` (table)

- RLS: **enabled**
- Primary key: `id`

| Column | Type | Nullable |
| --- | --- | --- |
| `id` | text | no |
| `name` | text | no |
| `price_type` | text | no |
| `service_zone_id` | text | no |
| `shipping_profile_id` | text | yes |
| `provider_id` | text | yes |
| `data` | jsonb | yes |
| `metadata` | jsonb | yes |
| `shipping_option_type_id` | text | no |
| `created_at` | timestamp with time zone (timestamptz) | no |
| `updated_at` | timestamp with time zone (timestamptz) | no |
| `deleted_at` | timestamp with time zone (timestamptz) | yes |

Foreign keys:
- `shipping_option_provider_id_foreign`: `provider_id` → `fulfillment_provider` (`id`)
- `shipping_option_service_zone_id_foreign`: `service_zone_id` → `service_zone` (`id`)
- `shipping_option_shipping_option_type_id_foreign`: `shipping_option_type_id` → `shipping_option_type` (`id`)
- `shipping_option_shipping_profile_id_foreign`: `shipping_profile_id` → `shipping_profile` (`id`)

### `shipping_option_price_set` (table)

- RLS: **enabled**
- Primary key: `shipping_option_id`, `price_set_id`

| Column | Type | Nullable |
| --- | --- | --- |
| `shipping_option_id` | character varying (varchar) | no |
| `price_set_id` | character varying (varchar) | no |
| `id` | character varying (varchar) | no |
| `created_at` | timestamp with time zone (timestamptz) | no |
| `updated_at` | timestamp with time zone (timestamptz) | no |
| `deleted_at` | timestamp with time zone (timestamptz) | yes |

### `shipping_option_rule` (table)

- RLS: **enabled**
- Primary key: `id`

| Column | Type | Nullable |
| --- | --- | --- |
| `id` | text | no |
| `attribute` | text | no |
| `operator` | text | no |
| `value` | jsonb | yes |
| `shipping_option_id` | text | no |
| `created_at` | timestamp with time zone (timestamptz) | no |
| `updated_at` | timestamp with time zone (timestamptz) | no |
| `deleted_at` | timestamp with time zone (timestamptz) | yes |

Foreign keys:
- `shipping_option_rule_shipping_option_id_foreign`: `shipping_option_id` → `shipping_option` (`id`)

### `shipping_option_type` (table)

- RLS: **enabled**
- Primary key: `id`

| Column | Type | Nullable |
| --- | --- | --- |
| `id` | text | no |
| `label` | text | no |
| `description` | text | yes |
| `code` | text | no |
| `created_at` | timestamp with time zone (timestamptz) | no |
| `updated_at` | timestamp with time zone (timestamptz) | no |
| `deleted_at` | timestamp with time zone (timestamptz) | yes |

### `shipping_profile` (table)

- RLS: **enabled**
- Primary key: `id`

| Column | Type | Nullable |
| --- | --- | --- |
| `id` | text | no |
| `name` | text | no |
| `type` | text | no |
| `metadata` | jsonb | yes |
| `created_at` | timestamp with time zone (timestamptz) | no |
| `updated_at` | timestamp with time zone (timestamptz) | no |
| `deleted_at` | timestamp with time zone (timestamptz) | yes |

### `site_reports` (table)

- RLS: **enabled**
- Primary key: `id`

| Column | Type | Nullable |
| --- | --- | --- |
| `id` | uuid | no |
| `url` | text | no |
| `email` | text | no |
| `score` | integer (int4) | no |
| `grade` | text | no |
| `categories` | jsonb | no |
| `accessibility` | jsonb | no |
| `metrics` | jsonb | no |
| `ai_analysis` | text | no |
| `executive_summary` | text | no |
| `pages_crawled` | integer (int4) | no |
| `created_at` | timestamp with time zone (timestamptz) | yes |

### `stock_location` (table)

- RLS: **enabled**
- Primary key: `id`

| Column | Type | Nullable |
| --- | --- | --- |
| `id` | text | no |
| `created_at` | timestamp with time zone (timestamptz) | no |
| `updated_at` | timestamp with time zone (timestamptz) | no |
| `deleted_at` | timestamp with time zone (timestamptz) | yes |
| `name` | text | no |
| `address_id` | text | yes |
| `metadata` | jsonb | yes |

Foreign keys:
- `stock_location_address_id_foreign`: `address_id` → `stock_location_address` (`id`)

### `stock_location_address` (table)

- RLS: **enabled**
- Primary key: `id`

| Column | Type | Nullable |
| --- | --- | --- |
| `id` | text | no |
| `created_at` | timestamp with time zone (timestamptz) | no |
| `updated_at` | timestamp with time zone (timestamptz) | no |
| `deleted_at` | timestamp with time zone (timestamptz) | yes |
| `address_1` | text | no |
| `address_2` | text | yes |
| `company` | text | yes |
| `city` | text | yes |
| `country_code` | text | no |
| `phone` | text | yes |
| `province` | text | yes |
| `postal_code` | text | yes |
| `metadata` | jsonb | yes |

### `store` (table)

- RLS: **enabled**
- Primary key: `id`

| Column | Type | Nullable |
| --- | --- | --- |
| `id` | text | no |
| `name` | text | no |
| `default_sales_channel_id` | text | yes |
| `default_region_id` | text | yes |
| `default_location_id` | text | yes |
| `metadata` | jsonb | yes |
| `created_at` | timestamp with time zone (timestamptz) | no |
| `updated_at` | timestamp with time zone (timestamptz) | no |
| `deleted_at` | timestamp with time zone (timestamptz) | yes |

### `store_currency` (table)

- RLS: **enabled**
- Primary key: `id`

| Column | Type | Nullable |
| --- | --- | --- |
| `id` | text | no |
| `currency_code` | text | no |
| `is_default` | boolean (bool) | no |
| `store_id` | text | yes |
| `created_at` | timestamp with time zone (timestamptz) | no |
| `updated_at` | timestamp with time zone (timestamptz) | no |
| `deleted_at` | timestamp with time zone (timestamptz) | yes |

Foreign keys:
- `store_currency_store_id_foreign`: `store_id` → `store` (`id`)

### `store_locale` (table)

- RLS: **enabled**
- Primary key: `id`

| Column | Type | Nullable |
| --- | --- | --- |
| `id` | text | no |
| `locale_code` | text | no |
| `store_id` | text | yes |
| `created_at` | timestamp with time zone (timestamptz) | no |
| `updated_at` | timestamp with time zone (timestamptz) | no |
| `deleted_at` | timestamp with time zone (timestamptz) | yes |

Foreign keys:
- `store_locale_store_id_foreign`: `store_id` → `store` (`id`)

### `suppression_records` (table)

- RLS: **enabled**
- Primary key: `id`

| Column | Type | Nullable |
| --- | --- | --- |
| `id` | uuid | no |
| `normalized_address` | text | no |
| `reason` | text | no |
| `source_message_id` | uuid | yes |
| `created_by` | uuid | yes |
| `created_at` | timestamp with time zone (timestamptz) | no |

Foreign keys:
- `suppression_records_created_by_fkey`: `created_by` → `auth.users` (`id`)
- `suppression_records_source_message_id_fkey`: `source_message_id` → `outreach_messages` (`id`)

### `tax_provider` (table)

- RLS: **enabled**
- Primary key: `id`

| Column | Type | Nullable |
| --- | --- | --- |
| `id` | text | no |
| `is_enabled` | boolean (bool) | no |
| `created_at` | timestamp with time zone (timestamptz) | no |
| `updated_at` | timestamp with time zone (timestamptz) | no |
| `deleted_at` | timestamp with time zone (timestamptz) | yes |

### `tax_rate` (table)

- RLS: **enabled**
- Primary key: `id`

| Column | Type | Nullable |
| --- | --- | --- |
| `id` | text | no |
| `rate` | real (float4) | yes |
| `code` | text | no |
| `name` | text | no |
| `is_default` | boolean (bool) | no |
| `is_combinable` | boolean (bool) | no |
| `tax_region_id` | text | no |
| `metadata` | jsonb | yes |
| `created_at` | timestamp with time zone (timestamptz) | no |
| `updated_at` | timestamp with time zone (timestamptz) | no |
| `created_by` | text | yes |
| `deleted_at` | timestamp with time zone (timestamptz) | yes |

Foreign keys:
- `FK_tax_rate_tax_region_id`: `tax_region_id` → `tax_region` (`id`)

### `tax_rate_rule` (table)

- RLS: **enabled**
- Primary key: `id`

| Column | Type | Nullable |
| --- | --- | --- |
| `id` | text | no |
| `tax_rate_id` | text | no |
| `reference_id` | text | no |
| `reference` | text | no |
| `metadata` | jsonb | yes |
| `created_at` | timestamp with time zone (timestamptz) | no |
| `updated_at` | timestamp with time zone (timestamptz) | no |
| `created_by` | text | yes |
| `deleted_at` | timestamp with time zone (timestamptz) | yes |

Foreign keys:
- `FK_tax_rate_rule_tax_rate_id`: `tax_rate_id` → `tax_rate` (`id`)

### `tax_region` (table)

- RLS: **enabled**
- Primary key: `id`

| Column | Type | Nullable |
| --- | --- | --- |
| `id` | text | no |
| `provider_id` | text | yes |
| `country_code` | text | no |
| `province_code` | text | yes |
| `parent_id` | text | yes |
| `metadata` | jsonb | yes |
| `created_at` | timestamp with time zone (timestamptz) | no |
| `updated_at` | timestamp with time zone (timestamptz) | no |
| `created_by` | text | yes |
| `deleted_at` | timestamp with time zone (timestamptz) | yes |

Foreign keys:
- `FK_tax_region_parent_id`: `parent_id` → `tax_region` (`id`)
- `FK_tax_region_provider_id`: `provider_id` → `tax_provider` (`id`)

### `user` (table)

- RLS: **enabled**
- Primary key: `id`

| Column | Type | Nullable |
| --- | --- | --- |
| `id` | text | no |
| `first_name` | text | yes |
| `last_name` | text | yes |
| `email` | text | no |
| `avatar_url` | text | yes |
| `metadata` | jsonb | yes |
| `created_at` | timestamp with time zone (timestamptz) | no |
| `updated_at` | timestamp with time zone (timestamptz) | no |
| `deleted_at` | timestamp with time zone (timestamptz) | yes |

### `user_preference` (table)

- RLS: **enabled**
- Primary key: `id`

| Column | Type | Nullable |
| --- | --- | --- |
| `id` | text | no |
| `user_id` | text | no |
| `key` | text | no |
| `value` | jsonb | no |
| `created_at` | timestamp with time zone (timestamptz) | no |
| `updated_at` | timestamp with time zone (timestamptz) | no |
| `deleted_at` | timestamp with time zone (timestamptz) | yes |

### `user_rbac_role` (table)

- RLS: **enabled**
- Primary key: `user_id`, `rbac_role_id`

| Column | Type | Nullable |
| --- | --- | --- |
| `user_id` | character varying (varchar) | no |
| `rbac_role_id` | character varying (varchar) | no |
| `id` | character varying (varchar) | no |
| `created_at` | timestamp with time zone (timestamptz) | no |
| `updated_at` | timestamp with time zone (timestamptz) | no |
| `deleted_at` | timestamp with time zone (timestamptz) | yes |

### `user_roles` (table)

- RLS: **enabled**
- Primary key: `user_id`

| Column | Type | Nullable |
| --- | --- | --- |
| `user_id` | uuid | no |
| `role` | text | no |
| `created_at` | timestamp with time zone (timestamptz) | yes |
| `updated_at` | timestamp with time zone (timestamptz) | yes |

Foreign keys:
- `user_roles_user_id_fkey`: `user_id` → `auth.users` (`id`)

### `view_configuration` (table)

- RLS: **enabled**
- Primary key: `id`

| Column | Type | Nullable |
| --- | --- | --- |
| `id` | text | no |
| `entity` | text | no |
| `name` | text | yes |
| `user_id` | text | yes |
| `is_system_default` | boolean (bool) | no |
| `configuration` | jsonb | no |
| `created_at` | timestamp with time zone (timestamptz) | no |
| `updated_at` | timestamp with time zone (timestamptz) | no |
| `deleted_at` | timestamp with time zone (timestamptz) | yes |

### `website_improvement_invoice_references` (table)

- RLS: **enabled**
- Primary key: `id`

| Column | Type | Nullable |
| --- | --- | --- |
| `id` | uuid | no |
| `operation_id` | uuid | no |
| `project_id` | uuid | no |
| `stripe_invoice_id` | text | yes |
| `amount_cents` | integer (int4) | no |
| `currency` | text | no |
| `test_mode` | boolean (bool) | no |
| `status` | text | no |
| `created_at` | timestamp with time zone (timestamptz) | no |
| `updated_at` | timestamp with time zone (timestamptz) | no |

Foreign keys:
- `website_improvement_invoice_references_operation_id_fkey`: `operation_id` → `provider_operations` (`id`)
- `website_improvement_invoice_references_project_id_fkey`: `project_id` → `projects` (`id`)

### `worker_callback_nonces` (table)

- RLS: **enabled**
- Primary key: `nonce`

| Column | Type | Nullable |
| --- | --- | --- |
| `nonce` | text | no |
| `created_at` | timestamp with time zone (timestamptz) | no |

### `worker_heartbeats` (table)

- RLS: **enabled**
- Primary key: `worker_id`

| Column | Type | Nullable |
| --- | --- | --- |
| `worker_id` | text | no |
| `owner_id` | uuid | no |
| `status` | text | no |
| `version` | text | no |
| `capabilities` | jsonb | no |
| `last_seen_at` | timestamp with time zone (timestamptz) | no |
| `last_error` | text | yes |
| `active_task_id` | uuid | yes |
| `updated_at` | timestamp with time zone (timestamptz) | no |

Foreign keys:
- `worker_heartbeats_active_task_id_fkey`: `active_task_id` → `agent_orchestration_tasks` (`id`)
- `worker_heartbeats_owner_id_fkey`: `owner_id` → `auth.users` (`id`)

### `workflow_execution` (table)

- RLS: **enabled**
- Primary key: `workflow_id`, `transaction_id`, `run_id`

| Column | Type | Nullable |
| --- | --- | --- |
| `id` | character varying (varchar) | no |
| `workflow_id` | character varying (varchar) | no |
| `transaction_id` | character varying (varchar) | no |
| `execution` | jsonb | yes |
| `context` | jsonb | yes |
| `state` | character varying (varchar) | no |
| `created_at` | timestamp without time zone (timestamp) | no |
| `updated_at` | timestamp without time zone (timestamp) | no |
| `deleted_at` | timestamp without time zone (timestamp) | yes |
| `retention_time` | integer (int4) | yes |
| `run_id` | text | no |

### `workflow_runs` (table)

- RLS: **enabled**
- Primary key: `id`

| Column | Type | Nullable |
| --- | --- | --- |
| `id` | uuid | no |
| `workflow_type` | text | no |
| `status` | text | no |
| `source_type` | text | no |
| `source_id` | uuid | no |
| `idempotency_key` | text | no |
| `input` | jsonb | no |
| `outcome` | jsonb | yes |
| `decided_by` | uuid | yes |
| `decided_at` | timestamp with time zone (timestamptz) | yes |
| `created_at` | timestamp with time zone (timestamptz) | no |
| `updated_at` | timestamp with time zone (timestamptz) | no |

Foreign keys:
- `workflow_runs_decided_by_fkey`: `decided_by` → `auth.users` (`id`)

## Row-level security policies

| Relation | Policy | Command | Roles | Using | Check |
| --- | --- | --- | --- | --- | --- |
| `agent_approval_decisions` | operators read decisions | SELECT | public | (is_admin(auth.uid()) AND (owner_id = auth.uid())) | — |
| `agent_artifact_versions` | authenticated owners read artifact versions | SELECT | public | (owner_id = auth.uid()) | — |
| `agent_artifact_versions` | operators read artifact versions | SELECT | public | (is_admin(auth.uid()) AND (owner_id = auth.uid())) | — |
| `agent_artifacts` | authenticated owners read agent artifacts | SELECT | public | (owner_id = auth.uid()) | — |
| `agent_artifacts` | operators own artifacts | SELECT | public | (is_admin(auth.uid()) AND (owner_id = auth.uid())) | — |
| `agent_orchestration_tasks` | operators read own orchestration tasks | SELECT | public | (is_admin(auth.uid()) AND (owner_id = auth.uid())) | — |
| `agent_plan_events` | authenticated owners read agent plan events | SELECT | public | (owner_id = auth.uid()) | — |
| `agent_plan_events` | operators read agent plan events | SELECT | public | (is_admin(auth.uid()) AND (owner_id = auth.uid())) | — |
| `agent_plans` | authenticated owners read agent plans | SELECT | public | (owner_id = auth.uid()) | — |
| `agent_plans` | operators own agent plans | SELECT | public | (is_admin(auth.uid()) AND (owner_id = auth.uid())) | — |
| `agent_run_commands` | operators read commands | SELECT | public | (is_admin(auth.uid()) AND (owner_id = auth.uid())) | — |
| `agent_run_events` | authenticated owners read agent run events | SELECT | public | (owner_id = auth.uid()) | — |
| `agent_run_events` | operators read run events | SELECT | public | (is_admin(auth.uid()) AND (owner_id = auth.uid())) | — |
| `agent_runs` | authenticated owners read agent runs | SELECT | public | (owner_id = auth.uid()) | — |
| `agent_runs` | operators own agent runs | ALL | public | (is_admin(auth.uid()) AND (owner_id = auth.uid())) | (is_admin(auth.uid()) AND (owner_id = auth.uid()) AND (requested_by = auth.uid())) |
| `agent_task_dependencies` | operators read own task dependencies | SELECT | public | (is_admin(auth.uid()) AND (EXISTS ( SELECT 1    FROM agent_orchestration_tasks task   WHERE ((task.id = agent_task_dependencies.task_id) AND (task.owner_id = auth.uid()))))) | — |
| `agent_task_events` | admins insert task events | INSERT | public | — | is_admin(auth.uid()) |
| `agent_task_events` | admins read task events | SELECT | public | is_admin(auth.uid()) | — |
| `agent_tasks` | admins manage agent tasks | ALL | public | is_admin(auth.uid()) | is_admin(auth.uid()) |
| `agent_tasks` | admins read agent tasks | SELECT | public | is_admin(auth.uid()) | — |
| `ai_employee_check_in_schedules` | operators read employee schedules | SELECT | public | is_admin(auth.uid()) | — |
| `ai_employee_decisions` | operators read employee decisions | SELECT | public | is_admin(auth.uid()) | — |
| `ai_employee_operating_briefs` | operators read employee briefs | SELECT | public | is_admin(auth.uid()) | — |
| `ai_employee_outcomes` | operators read employee outcomes | SELECT | public | is_admin(auth.uid()) | — |
| `ai_employee_work_items` | operators read employee work | SELECT | public | is_admin(auth.uid()) | — |
| `ai_employees` | operators read employees | SELECT | public | is_admin(auth.uid()) | — |
| `brand_profiles` | operators own brand profiles | ALL | public | (is_admin(auth.uid()) AND (owner_id = auth.uid())) | (is_admin(auth.uid()) AND (owner_id = auth.uid())) |
| `content_schedules` | operators own content schedules | ALL | public | (is_admin(auth.uid()) AND (owner_id = auth.uid())) | (is_admin(auth.uid()) AND (owner_id = auth.uid())) |
| `customer_accounts` | operators read customer accounts | SELECT | public | is_admin(auth.uid()) | — |
| `customer_memberships` | operators read retired memberships | SELECT | public | is_admin(auth.uid()) | — |
| `google_calendar_tokens` | Service role can manage tokens | ALL | public | (auth.role() = 'service_role'::text) | — |
| `google_calendar_tokens` | Users can read own tokens | SELECT | public | (auth.uid() = user_id) | — |
| `growth_profiles` | admins manage growth profiles | ALL | public | is_admin(auth.uid()) | is_admin(auth.uid()) |
| `growth_profiles` | admins read growth profiles | SELECT | public | is_admin(auth.uid()) | — |
| `health_check` | Anyone can read health_check | SELECT | public | true | — |
| `hermes_schedule_runs` | authenticated owners read Hermes schedule runs | SELECT | public | (owner_id = auth.uid()) | — |
| `hermes_schedules` | authenticated owners read Hermes schedules | SELECT | public | (owner_id = auth.uid()) | — |
| `media_usage_reservations` | operators read media reservations | SELECT | public | (is_admin(auth.uid()) AND (owner_id = auth.uid())) | — |
| `model_benchmark_candidates` | admins manage model benchmark candidates | ALL | public | is_admin(auth.uid()) | is_admin(auth.uid()) |
| `model_benchmark_candidates` | admins read model benchmark candidates | SELECT | public | is_admin(auth.uid()) | — |
| `model_evaluation_records` | admins manage model evaluation records | ALL | public | is_admin(auth.uid()) | is_admin(auth.uid()) |
| `model_evaluation_records` | admins read model evaluation records | SELECT | public | is_admin(auth.uid()) | — |
| `model_usage_ledger` | admins manage model usage ledger | ALL | public | is_admin(auth.uid()) | is_admin(auth.uid()) |
| `model_usage_ledger` | admins read model usage ledger | SELECT | public | is_admin(auth.uid()) | — |
| `openclaw_model_usage_reservations` | operators read OpenClaw usage | SELECT | public | (is_admin(auth.uid()) AND (owner_id = auth.uid())) | — |
| `operator_cockpit_actions` | owners manage cockpit actions | ALL | public | (owner_id = auth.uid()) | (owner_id = auth.uid()) |
| `operator_cockpit_actions` | owners read cockpit actions | SELECT | public | (owner_id = auth.uid()) | — |
| `operator_daily_reflections` | owners manage daily reflections | ALL | public | (owner_id = auth.uid()) | (owner_id = auth.uid()) |
| `operator_daily_reflections` | owners read daily reflections | SELECT | public | (owner_id = auth.uid()) | — |
| `operator_weekly_priorities` | owners manage weekly priorities | ALL | public | (owner_id = auth.uid()) | (owner_id = auth.uid()) |
| `operator_weekly_priorities` | owners read weekly priorities | SELECT | public | (owner_id = auth.uid()) | — |
| `outreach_messages` | admins manage outreach | ALL | public | is_admin(auth.uid()) | is_admin(auth.uid()) |
| `outreach_messages` | admins read outreach | SELECT | public | is_admin(auth.uid()) | — |
| `project_comments` | operators create project comments | INSERT | public | — | (is_admin(auth.uid()) AND (user_id = auth.uid())) |
| `project_comments` | operators read project comments | SELECT | public | is_admin(auth.uid()) | — |
| `projects` | operators delete projects | DELETE | public | is_admin(auth.uid()) | — |
| `projects` | operators read projects | SELECT | public | is_admin(auth.uid()) | — |
| `projects` | operators update projects | UPDATE | public | is_admin(auth.uid()) | is_admin(auth.uid()) |
| `prospect_dossiers` | admins manage prospect dossiers | ALL | public | is_admin(auth.uid()) | is_admin(auth.uid()) |
| `prospect_dossiers` | admins read prospect dossiers | SELECT | public | is_admin(auth.uid()) | — |
| `prospect_outcomes` | admins manage outcomes | ALL | public | is_admin(auth.uid()) | is_admin(auth.uid()) |
| `prospect_outcomes` | admins read outcomes | SELECT | public | is_admin(auth.uid()) | — |
| `prospect_sources` | admins manage prospect sources | ALL | public | is_admin(auth.uid()) | is_admin(auth.uid()) |
| `prospect_sources` | admins read prospect sources | SELECT | public | is_admin(auth.uid()) | — |
| `prospecting_artifact_provenance` | operators read prospecting provenance | SELECT | public | (is_admin(auth.uid()) AND (owner_id = auth.uid())) | — |
| `prospects` | admins manage prospects | ALL | public | is_admin(auth.uid()) | is_admin(auth.uid()) |
| `prospects` | admins read prospects | SELECT | public | is_admin(auth.uid()) | — |
| `sender_events` | admins manage sender events | ALL | public | is_admin(auth.uid()) | is_admin(auth.uid()) |
| `sender_events` | admins read sender events | SELECT | public | is_admin(auth.uid()) | — |
| `site_reports` | No direct insert | INSERT | public | — | false |
| `suppression_records` | admins manage suppression | ALL | public | is_admin(auth.uid()) | is_admin(auth.uid()) |
| `suppression_records` | admins read suppression | SELECT | public | is_admin(auth.uid()) | — |
| `user_roles` | Admins can read all roles | SELECT | public | is_admin(auth.uid()) | — |
| `user_roles` | Users can read own role | SELECT | public | (user_id = auth.uid()) | — |
| `worker_heartbeats` | operators read worker heartbeats | SELECT | public | (is_admin(auth.uid()) AND (owner_id = auth.uid())) | — |
| `workflow_runs` | Operators can read workflow runs | SELECT | public | is_admin(auth.uid()) | — |
| `workflow_runs` | Operators can update workflow runs | UPDATE | public | is_admin(auth.uid()) | is_admin(auth.uid()) |

## Public functions and RPCs

| Function | Arguments | Returns | Security | Volatility |
| --- | --- | --- | --- | --- |
| `abort_openclaw_task_before_provider` | target_task_id uuid, target_worker text, target_error text | jsonb | definer | volatile |
| `accept_calendar_operation` | target_operation_id uuid, target_project_id uuid, target_calendar_token_id uuid, target_external_event_id text, target_action text | jsonb | definer | volatile |
| `accept_github_handoff_operation` | target_operation_id uuid, target_handoff_id uuid, target_recipient_hash text, target_subject text, target_provider_message_id text | jsonb | definer | volatile |
| `accept_resend_prospecting_operation` | target_operation_id uuid, target_message_id uuid, target_provider_message_id text | jsonb | definer | volatile |
| `accept_resend_transactional_operation` | target_operation_id uuid, target_project_id uuid, target_recipient_hash text, target_subject text, target_provider_message_id text | jsonb | definer | volatile |
| `accept_website_improvement_invoice` | target_operation_id uuid, target_project_id uuid, target_stripe_invoice_id text | jsonb | definer | volatile |
| `agent_plan_request_hash` | target_original_request text, target_rewritten_instruction text, target_steps jsonb, target_allowed_capabilities jsonb, target_forbidden_actions jsonb, target_expected_artifacts jsonb, target_growth_profile_id uuid, target_workflow_type text, target_model_id text, target_estimated_cost numeric, target_openclaw_instruction jsonb | text | invoker | immutable |
| `approve_agent_plan` | target_plan_id uuid, target_idempotency_key uuid, target_note text | jsonb | definer | volatile |
| `assert_provider_operation_retryable` | target_operation_id uuid | jsonb | definer | volatile |
| `claim_agent_orchestration_task` | target_owner_id uuid, target_worker text, target_lease_seconds integer | jsonb | definer | volatile |
| `claim_openclaw_agent_orchestration_task` | target_owner_id uuid, target_worker text, target_lease_seconds integer | jsonb | definer | volatile |
| `claim_private_prospecting_task` | target_worker text, target_lease_seconds integer | jsonb | definer | volatile |
| `claim_prospecting_task` | target_worker text, target_lease_seconds integer | jsonb | definer | volatile |
| `complete_agent_orchestration_task` | target_task_id uuid, target_worker text, target_status text, target_output jsonb, target_error text, target_artifacts jsonb | jsonb | definer | volatile |
| `complete_agent_orchestration_task_internal` | target_task_id uuid, target_worker text, target_status text, target_output jsonb, target_error text, target_artifacts jsonb | jsonb | definer | volatile |
| `complete_ai_employee_work_item` | target_work_item_id uuid, target_completion_notes text, target_idempotency_key uuid | jsonb | definer | volatile |
| `complete_openclaw_orchestration_task` | target_task_id uuid, target_worker text, target_status text, target_output jsonb, target_error text, target_artifacts jsonb, target_model_reservation_key uuid, target_prospecting jsonb | jsonb | definer | volatile |
| `complete_openclaw_orchestration_task_internal` | target_task_id uuid, target_worker text, target_status text, target_output jsonb, target_error text, target_artifacts jsonb, target_model_reservation_key uuid, target_prospecting jsonb | jsonb | definer | volatile |
| `complete_openclaw_task_with_provenance` | target_task_id uuid, target_worker text, target_status text, target_output jsonb, target_error text, target_artifacts jsonb, target_model_reservation_key uuid, target_model_actual_cost numeric, target_actual_model_id text, target_provider_usage jsonb, target_prospecting jsonb | jsonb | definer | volatile |
| `complete_provider_webhook_receipt` | target_receipt_id uuid | jsonb | definer | volatile |
| `control_agent_run` | target_run_id uuid, target_command text, target_idempotency_key uuid, target_note text | jsonb | definer | volatile |
| `create_agent_plan` | target_original_request text, target_rewritten_instruction text, target_steps jsonb, target_allowed_capabilities jsonb, target_forbidden_actions jsonb, target_expected_artifacts jsonb, target_growth_profile_id uuid, target_workflow_type text, target_model_id text, target_model_route text, target_estimated_prompt_tokens integer, target_estimated_completion_tokens integer, target_estimated_web_search_calls integer, target_estimated_cost numeric, target_planner_usage jsonb, target_openclaw_instruction jsonb, target_idempotency_key uuid | jsonb | definer | volatile |
| `create_agent_plan_with_executor` | target_original_request text, target_rewritten_instruction text, target_steps jsonb, target_allowed_capabilities jsonb, target_forbidden_actions jsonb, target_expected_artifacts jsonb, target_growth_profile_id uuid, target_workflow_type text, target_model_id text, target_executor_model_id text, target_model_route text, target_estimated_prompt_tokens integer, target_estimated_completion_tokens integer, target_estimated_web_search_calls integer, target_estimated_cost numeric, target_planner_usage jsonb, target_openclaw_instruction jsonb, target_idempotency_key uuid | jsonb | definer | volatile |
| `create_agent_run` | target_workflow_type text, target_title text, target_input jsonb, target_idempotency_key uuid, target_local_date date, target_timezone text, target_scheduled_for timestamp with time zone | jsonb | definer | volatile |
| `create_ai_employee_work_item` | target_employee_id uuid, target_queue text, target_scheduled_date date, target_title text, target_evidence jsonb, target_proposed_action text, target_expected_outcome text, target_risk_level text, target_priority integer, target_source_type text, target_source_id text, target_idempotency_key uuid | jsonb | definer | volatile |
| `create_site_audit_workflow_run` |  | trigger | definer | volatile |
| `create_status_update_comment` |  | trigger | invoker | volatile |
| `dispatch_agent_plan` | target_plan_id uuid, target_idempotency_key uuid | jsonb | definer | volatile |
| `dispatch_agent_plan_legacy` | target_plan_id uuid, target_idempotency_key uuid | jsonb | definer | volatile |
| `fail_provider_webhook_receipt` | target_receipt_id uuid, target_failure_reason text, target_permanent boolean | jsonb | definer | volatile |
| `get_calendar_access_token` | token_id uuid, p_encryption_key text | text | definer | stable |
| `get_calendar_refresh_token` | token_id uuid, p_encryption_key text | text | definer | stable |
| `increment_public_engagement_metric` | p_event text, p_route text, p_element text, p_variant text | void | definer | volatile |
| `is_admin` |  | boolean | definer | volatile |
| `is_admin` | check_user_id uuid | boolean | definer | stable |
| `is_customer_member` | target_customer_id uuid | boolean | definer | stable |
| `manage_github_handoff_provider_operation` |  | trigger | definer | volatile |
| `manage_outreach_provider_operation` |  | trigger | definer | volatile |
| `mark_resend_acceptance_unknown` | target_operation_id uuid, target_error text | jsonb | definer | volatile |
| `materialize_due_hermes_schedule_runs` | target_owner_id uuid, target_limit integer | TABLE(schedule_run_id uuid, schedule_id uuid, scheduled_for timestamp with time zone) | definer | volatile |
| `normalize_outreach_address` | value text | text | invoker | immutable |
| `pin_private_primary_model` | target_profile_id uuid, target_worker text, target_model_id text, target_rationale text | jsonb | definer | volatile |
| `prevent_agent_artifact_version_mutation` |  | trigger | definer | volatile |
| `prevent_agent_history_mutation` |  | trigger | definer | volatile |
| `prevent_provider_operation_request_mutation` |  | trigger | invoker | volatile |
| `private_research_model_route_allowed` | target_route text | boolean | invoker | immutable |
| `private_worker_access` |  | boolean | invoker | stable |
| `promote_prospect_dossier` | target_dossier_id uuid | jsonb | definer | volatile |
| `provision_ai_employee_pilot` | target_project_id uuid, target_employee_name text, target_role_name text, target_timezone text, target_morning_time time without time zone, target_midday_time time without time zone, target_evening_time time without time zone, target_responsibilities jsonb, target_prohibited_actions jsonb, target_channels jsonb, target_tone text, target_approval_rules jsonb | jsonb | definer | volatile |
| `queue_due_private_prospecting_tasks` |  | SETOF agent_tasks | definer | volatile |
| `reconcile_media_usage` | target_reservation_key uuid, target_actual_cost numeric, target_provider_usage jsonb | jsonb | definer | volatile |
| `reconcile_openclaw_model_usage` | target_reservation_key uuid, target_actual_cost numeric, target_provider_usage jsonb | jsonb | definer | volatile |
| `reconcile_openclaw_model_usage_internal` | target_reservation_key uuid, target_actual_cost numeric, target_provider_usage jsonb | jsonb | definer | volatile |
| `reconcile_private_model_usage` | target_reservation_key uuid, target_actual_cost numeric, target_provider_usage jsonb | jsonb | definer | volatile |
| `reconcile_resend_provider_operation` | target_operation_id uuid, target_resolution text, target_provider_message_id text | jsonb | definer | volatile |
| `record_agent_artifact_decision` | target_artifact_id uuid, target_decision text, target_idempotency_key uuid, target_note text, target_content_text text, target_metadata jsonb | jsonb | definer | volatile |
| `record_agent_task_event` | target_task_id uuid, target_worker text, target_event_type text, target_payload jsonb, target_progress integer | jsonb | definer | volatile |
| `record_ai_employee_decision` | target_work_item_id uuid, target_decision text, target_instructions text, target_idempotency_key uuid, target_defer_date date | jsonb | definer | volatile |
| `record_ai_employee_outcome` | target_employee_id uuid, target_work_item_id uuid, target_kind text, target_value numeric, target_amount_cents bigint, target_currency text, target_cost_category text, target_notes text, target_occurred_at timestamp with time zone, target_idempotency_key uuid | jsonb | definer | volatile |
| `record_calendar_operation_reference` | target_operation_id uuid, target_project_id uuid, target_calendar_token_id uuid, target_external_event_id text, target_action text, target_status text | jsonb | definer | volatile |
| `record_openclaw_prospecting_result` | target_task_id uuid, target_worker text, target_model_id text, target_artifact_id uuid, target_reservation_key uuid, target_result jsonb | jsonb | definer | volatile |
| `record_openclaw_task_provenance` | target_task_id uuid, target_worker text, target_actual_model_id text, target_provider_usage jsonb | jsonb | definer | volatile |
| `record_openclaw_task_provenance_internal` | target_task_id uuid, target_worker text, target_actual_model_id text, target_provider_usage jsonb | jsonb | definer | volatile |
| `record_outreach_decision` | target_message_id uuid, target_decision text, target_subject text, target_body text, target_next_action_at timestamp with time zone | jsonb | definer | volatile |
| `record_private_model_actual` | target_reservation_key uuid, target_actual_model_id text | jsonb | definer | volatile |
| `record_private_prospect_dossier` | target_task_id uuid, target_worker text, target_model_id text, target_dossier jsonb | jsonb | definer | volatile |
| `record_provider_webhook_receipt` | target_provider text, target_provider_event_id text, target_payload_sha256 text, target_signature_verified boolean | jsonb | definer | volatile |
| `record_resend_transactional_event` | target_receipt_id uuid, target_provider_message_id text, target_event_type text, target_occurred_at timestamp with time zone | jsonb | definer | volatile |
| `record_resend_transactional_message` | target_operation_id uuid, target_project_id uuid, target_recipient_hash text, target_subject text, target_provider_message_id text, target_status text | jsonb | definer | volatile |
| `record_sender_event` | target_provider_event_id text, target_event_type text, target_provider_message_id text, target_address text, target_payload jsonb, target_occurred_at timestamp with time zone | jsonb | definer | volatile |
| `record_stripe_invoice_event` | target_receipt_id uuid, target_stripe_invoice_id text, target_status text | jsonb | definer | volatile |
| `record_website_improvement_invoice_reference` | target_operation_id uuid, target_project_id uuid, target_stripe_invoice_id text, target_status text | jsonb | definer | volatile |
| `reject_agent_plan` | target_plan_id uuid, target_idempotency_key uuid, target_note text | jsonb | definer | volatile |
| `reserve_media_usage` | target_owner_id uuid, target_run_id uuid, target_task_id uuid, target_worker text, target_reservation_key uuid, target_media_kind text, target_provider text, target_reserved_cost numeric, target_local_usage_date date | jsonb | definer | volatile |
| `reserve_openclaw_model_usage` | target_owner_id uuid, target_plan_id uuid, target_run_id uuid, target_task_id uuid, target_worker text, target_reservation_key uuid, target_reserved_cost numeric | jsonb | definer | volatile |
| `reserve_private_model_usage` | target_profile_id uuid, target_task_id uuid, target_worker text, target_reservation_key uuid, target_usage_kind text, target_model_id text, target_reserved_cost numeric | jsonb | definer | volatile |
| `store_google_calendar_tokens` | p_user_id uuid, p_access_token text, p_refresh_token text, p_token_type text, p_expires_at timestamp with time zone, p_google_email text, p_encryption_key text | void | definer | volatile |
| `update_agent_plan` | target_plan_id uuid, target_rewritten_instruction text, target_steps jsonb, target_allowed_capabilities jsonb, target_forbidden_actions jsonb, target_expected_artifacts jsonb, target_openclaw_instruction jsonb, target_idempotency_key uuid | jsonb | definer | volatile |
| `update_agent_plan_timestamp` |  | trigger | invoker | volatile |
| `update_updated_at_column` |  | trigger | invoker | volatile |
| `upsert_discovered_prospect` | target_profile_id uuid, target_company_name text, target_contact_name text, target_contact_title text, target_email text, target_website_url text, target_icp_match_score integer, target_icp_match_reason text, target_source_url text, target_evidence jsonb, target_contact_path text, target_email_status text, target_idempotency_key uuid | jsonb | definer | volatile |
| `upsert_provider_operation` | target_provider text, target_operation_type text, target_idempotency_key text, target_status text, target_provider_reference text, target_request_metadata jsonb, target_response_metadata jsonb, target_error text | jsonb | definer | volatile |
| `validate_agent_plan_payload` | target_steps jsonb, target_allowed_capabilities jsonb, target_forbidden_actions jsonb, target_expected_artifacts jsonb, target_openclaw_instruction jsonb | void | invoker | immutable |
| `validate_hermes_schedule_timezone` |  | trigger | invoker | volatile |

## Role access summary — tables

| Relation | anon | authenticated | service_role |
| --- | --- | --- | --- |
| `account_holder` | — | — | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| `agent_approval_decisions` | — | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| `agent_artifact_versions` | — | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| `agent_artifacts` | — | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| `agent_orchestration_tasks` | — | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| `agent_plan_events` | — | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| `agent_plans` | — | REFERENCES, SELECT, TRIGGER, TRUNCATE | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| `agent_run_commands` | — | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| `agent_run_events` | — | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| `agent_runs` | — | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| `agent_task_dependencies` | — | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| `agent_task_events` | — | INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| `agent_tasks` | — | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| `ai_employee_check_in_schedules` | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| `ai_employee_decisions` | REFERENCES, SELECT, TRIGGER, TRUNCATE | REFERENCES, SELECT, TRIGGER, TRUNCATE | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| `ai_employee_operating_briefs` | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| `ai_employee_outcomes` | REFERENCES, SELECT, TRIGGER, TRUNCATE | REFERENCES, SELECT, TRIGGER, TRUNCATE | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| `ai_employee_work_items` | REFERENCES, SELECT, TRIGGER, TRUNCATE | REFERENCES, SELECT, TRIGGER, TRUNCATE | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| `ai_employees` | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| `api_key` | — | — | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| `application_method_buy_rules` | — | — | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| `application_method_target_rules` | — | — | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| `auth_identity` | — | — | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| `brand_profiles` | — | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| `calendar_operation_references` | — | — | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| `capture` | — | — | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| `cart` | — | — | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| `cart_address` | — | — | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| `cart_line_item` | — | — | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| `cart_line_item_adjustment` | — | — | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| `cart_line_item_tax_line` | — | — | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| `cart_payment_collection` | — | — | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| `cart_promotion` | — | — | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| `cart_shipping_method` | — | — | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| `cart_shipping_method_adjustment` | — | — | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| `cart_shipping_method_tax_line` | — | — | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| `content_schedules` | — | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| `credit_line` | — | — | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| `currency` | — | — | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| `customer` | — | — | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| `customer_account_holder` | — | — | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| `customer_accounts` | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| `customer_address` | — | — | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| `customer_group` | — | — | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| `customer_group_customer` | — | — | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| `customer_memberships` | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| `fulfillment` | — | — | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| `fulfillment_address` | — | — | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| `fulfillment_item` | — | — | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| `fulfillment_label` | — | — | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| `fulfillment_provider` | — | — | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| `fulfillment_set` | — | — | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| `geo_zone` | — | — | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| `google_calendar_tokens` | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| `growth_profiles` | — | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| `health_check` | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| `hermes_schedule_runs` | — | SELECT | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| `hermes_schedules` | — | SELECT | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| `image` | — | — | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| `inventory_item` | — | — | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| `inventory_level` | — | — | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| `invite` | — | — | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| `link_module_migrations` | — | — | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| `location_fulfillment_provider` | — | — | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| `location_fulfillment_set` | — | — | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| `mcp_access_tokens` | — | — | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| `media_usage_reservations` | — | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| `mikro_orm_migrations` | — | — | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| `model_benchmark_candidates` | — | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| `model_evaluation_records` | — | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| `model_usage_ledger` | — | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| `notification` | — | — | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| `notification_provider` | — | — | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| `openclaw_model_usage_reservations` | — | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| `operator_cockpit_actions` | — | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| `operator_daily_reflections` | — | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| `operator_weekly_priorities` | — | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| `order` | — | — | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| `order_address` | — | — | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| `order_cart` | — | — | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| `order_change` | — | — | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| `order_change_action` | — | — | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| `order_claim` | — | — | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| `order_claim_item` | — | — | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| `order_claim_item_image` | — | — | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| `order_credit_line` | — | — | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| `order_exchange` | — | — | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| `order_exchange_item` | — | — | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| `order_fulfillment` | — | — | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| `order_item` | — | — | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| `order_line_item` | — | — | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| `order_line_item_adjustment` | — | — | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| `order_line_item_tax_line` | — | — | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| `order_payment_collection` | — | — | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| `order_promotion` | — | — | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| `order_shipping` | — | — | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| `order_shipping_method` | — | — | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| `order_shipping_method_adjustment` | — | — | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| `order_shipping_method_tax_line` | — | — | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| `order_summary` | — | — | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| `order_transaction` | — | — | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| `outreach_messages` | — | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| `payment` | — | — | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| `payment_collection` | — | — | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| `payment_collection_payment_providers` | — | — | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| `payment_provider` | — | — | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| `payment_session` | — | — | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| `price` | — | — | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| `price_list` | — | — | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| `price_list_rule` | — | — | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| `price_preference` | — | — | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| `price_rule` | — | — | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| `price_set` | — | — | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| `product` | — | — | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| `product_category` | — | — | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| `product_category_product` | — | — | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| `product_collection` | — | — | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| `product_option` | — | — | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| `product_option_value` | — | — | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| `product_sales_channel` | — | — | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| `product_shipping_profile` | — | — | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| `product_tag` | — | — | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| `product_tags` | — | — | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| `product_type` | — | — | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| `product_variant` | — | — | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| `product_variant_inventory_item` | — | — | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| `product_variant_option` | — | — | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| `product_variant_price_set` | — | — | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| `product_variant_product_image` | — | — | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| `project_comments` | REFERENCES, SELECT, TRIGGER, TRUNCATE | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| `project_github_handoffs` | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| `projects` | REFERENCES, SELECT, TRIGGER, TRUNCATE | REFERENCES, SELECT, TRIGGER, TRUNCATE | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| `promotion` | — | — | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| `promotion_application_method` | — | — | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| `promotion_campaign` | — | — | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| `promotion_campaign_budget` | — | — | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| `promotion_campaign_budget_usage` | — | — | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| `promotion_promotion_rule` | — | — | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| `promotion_rule` | — | — | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| `promotion_rule_value` | — | — | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| `prospect_dossiers` | — | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| `prospect_outcomes` | — | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| `prospect_sources` | — | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| `prospecting_artifact_provenance` | — | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| `prospects` | — | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| `provider_identity` | — | — | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| `provider_operations` | — | — | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| `provider_webhook_receipts` | — | — | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| `public_engagement_daily_metrics` | — | — | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| `publishable_api_key_sales_channel` | — | — | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| `refund` | — | — | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| `refund_reason` | — | — | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| `region` | — | — | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| `region_country` | — | — | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| `region_payment_provider` | — | — | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| `resend_transactional_events` | — | — | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| `resend_transactional_messages` | — | — | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| `reservation_item` | — | — | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| `return` | — | — | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| `return_fulfillment` | — | — | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| `return_item` | — | — | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| `return_reason` | — | — | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| `sales_channel` | — | — | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| `sales_channel_stock_location` | — | — | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| `script_migrations` | — | — | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| `sender_events` | — | INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| `service_zone` | — | — | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| `shipping_option` | — | — | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| `shipping_option_price_set` | — | — | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| `shipping_option_rule` | — | — | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| `shipping_option_type` | — | — | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| `shipping_profile` | — | — | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| `site_reports` | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| `stock_location` | — | — | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| `stock_location_address` | — | — | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| `store` | — | — | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| `store_currency` | — | — | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| `store_locale` | — | — | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| `suppression_records` | — | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| `tax_provider` | — | — | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| `tax_rate` | — | — | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| `tax_rate_rule` | — | — | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| `tax_region` | — | — | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| `user` | — | — | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| `user_preference` | — | — | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| `user_rbac_role` | — | — | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| `user_roles` | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| `view_configuration` | — | — | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| `website_improvement_invoice_references` | — | — | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| `worker_callback_nonces` | — | — | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| `worker_heartbeats` | — | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| `workflow_execution` | — | — | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| `workflow_runs` | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |

## Role access summary — functions

| Function | anon | authenticated | service_role |
| --- | --- | --- | --- |
| `abort_openclaw_task_before_provider` | — | — | EXECUTE |
| `accept_calendar_operation` | — | — | EXECUTE |
| `accept_github_handoff_operation` | — | — | EXECUTE |
| `accept_resend_prospecting_operation` | — | — | EXECUTE |
| `accept_resend_transactional_operation` | — | — | EXECUTE |
| `accept_website_improvement_invoice` | — | — | EXECUTE |
| `agent_plan_request_hash` | EXECUTE | EXECUTE | EXECUTE |
| `approve_agent_plan` | — | EXECUTE | EXECUTE |
| `assert_provider_operation_retryable` | — | — | EXECUTE |
| `claim_agent_orchestration_task` | — | — | EXECUTE |
| `claim_openclaw_agent_orchestration_task` | — | — | EXECUTE |
| `claim_private_prospecting_task` | — | — | EXECUTE |
| `claim_prospecting_task` | — | EXECUTE | EXECUTE |
| `complete_agent_orchestration_task` | — | — | EXECUTE |
| `complete_ai_employee_work_item` | — | EXECUTE | EXECUTE |
| `complete_openclaw_orchestration_task` | — | — | EXECUTE |
| `complete_openclaw_task_with_provenance` | — | — | EXECUTE |
| `complete_provider_webhook_receipt` | — | — | EXECUTE |
| `control_agent_run` | — | EXECUTE | EXECUTE |
| `create_agent_plan` | — | EXECUTE | EXECUTE |
| `create_agent_plan_with_executor` | — | EXECUTE | EXECUTE |
| `create_agent_run` | — | EXECUTE | EXECUTE |
| `create_ai_employee_work_item` | — | EXECUTE | EXECUTE |
| `create_site_audit_workflow_run` | EXECUTE | EXECUTE | EXECUTE |
| `create_status_update_comment` | EXECUTE | EXECUTE | EXECUTE |
| `dispatch_agent_plan` | — | EXECUTE | EXECUTE |
| `dispatch_agent_plan_legacy` | — | — | EXECUTE |
| `fail_provider_webhook_receipt` | — | — | EXECUTE |
| `get_calendar_access_token` | — | — | EXECUTE |
| `get_calendar_refresh_token` | — | — | EXECUTE |
| `increment_public_engagement_metric` | — | — | EXECUTE |
| `is_admin` | EXECUTE | EXECUTE | EXECUTE |
| `is_customer_member` | — | EXECUTE | EXECUTE |
| `mark_resend_acceptance_unknown` | — | — | EXECUTE |
| `materialize_due_hermes_schedule_runs` | — | — | EXECUTE |
| `normalize_outreach_address` | EXECUTE | EXECUTE | EXECUTE |
| `pin_private_primary_model` | — | — | EXECUTE |
| `prevent_agent_artifact_version_mutation` | EXECUTE | EXECUTE | EXECUTE |
| `prevent_agent_history_mutation` | EXECUTE | EXECUTE | EXECUTE |
| `private_research_model_route_allowed` | — | — | EXECUTE |
| `private_worker_access` | EXECUTE | EXECUTE | EXECUTE |
| `promote_prospect_dossier` | — | EXECUTE | EXECUTE |
| `provision_ai_employee_pilot` | — | EXECUTE | EXECUTE |
| `queue_due_private_prospecting_tasks` | — | — | EXECUTE |
| `reconcile_media_usage` | — | — | EXECUTE |
| `reconcile_openclaw_model_usage` | — | — | EXECUTE |
| `reconcile_private_model_usage` | — | — | EXECUTE |
| `reconcile_resend_provider_operation` | — | — | EXECUTE |
| `record_agent_artifact_decision` | — | EXECUTE | EXECUTE |
| `record_agent_task_event` | — | — | EXECUTE |
| `record_ai_employee_decision` | — | EXECUTE | EXECUTE |
| `record_ai_employee_outcome` | — | EXECUTE | EXECUTE |
| `record_calendar_operation_reference` | — | — | EXECUTE |
| `record_openclaw_prospecting_result` | — | — | EXECUTE |
| `record_openclaw_task_provenance` | — | — | EXECUTE |
| `record_outreach_decision` | — | EXECUTE | EXECUTE |
| `record_private_model_actual` | — | — | EXECUTE |
| `record_private_prospect_dossier` | — | — | EXECUTE |
| `record_provider_webhook_receipt` | — | — | EXECUTE |
| `record_resend_transactional_event` | — | — | EXECUTE |
| `record_resend_transactional_message` | — | — | EXECUTE |
| `record_sender_event` | — | EXECUTE | EXECUTE |
| `record_stripe_invoice_event` | — | — | EXECUTE |
| `record_website_improvement_invoice_reference` | — | — | EXECUTE |
| `reject_agent_plan` | — | EXECUTE | EXECUTE |
| `reserve_media_usage` | — | — | EXECUTE |
| `reserve_openclaw_model_usage` | — | — | EXECUTE |
| `reserve_private_model_usage` | — | — | EXECUTE |
| `store_google_calendar_tokens` | — | — | EXECUTE |
| `update_agent_plan` | — | EXECUTE | EXECUTE |
| `update_agent_plan_timestamp` | EXECUTE | EXECUTE | EXECUTE |
| `update_updated_at_column` | EXECUTE | EXECUTE | EXECUTE |
| `upsert_discovered_prospect` | — | EXECUTE | EXECUTE |
| `upsert_provider_operation` | — | — | EXECUTE |
| `validate_agent_plan_payload` | EXECUTE | EXECUTE | EXECUTE |
| `validate_hermes_schedule_timezone` | EXECUTE | EXECUTE | EXECUTE |

## Maintenance rules

1. Create and review schema changes as migrations; never edit this inventory to make hosted state appear different.
2. After an approved hosted migration, regenerate this file from metadata-only introspection and commit it with the migration evidence.
3. Compare the applied migration ledger with GitHub before any hosted push; preserve direct hosted changes rather than overwriting them.
4. Keep this file private. Public explanations belong on `/system` and must describe the architecture without exposing operational schema or access details.
