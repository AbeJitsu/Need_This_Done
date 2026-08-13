#!/usr/bin/env bash

# Rehearse the hosted historical-data transition against disposable local
# Supabase. The default mode is read-only preflight. Execution requires an
# exact acknowledgement because it resets the local database and temporarily
# restores restricted historical data.

set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKUP_DIR_DEFAULT="/Users/abiezerreyes/Documents/NeedThisDone Backups/2026-08-11-pre-migration-072-url-retry"
BACKUP_DIR="${NEEDTHISDONE_REHEARSAL_BACKUP_DIR:-$BACKUP_DIR_DEFAULT}"
DATA_FILE="$BACKUP_DIR/data.sql"
SCHEMA_FILE="$BACKUP_DIR/schema.sql"
ROLES_FILE="$BACKUP_DIR/roles.sql"
DOCKER_BIN="/Applications/Docker.app/Contents/Resources/bin/docker"
LOCAL_DB_CONTAINER="supabase_db_Need_This_Done"
REQUIRED_ACKNOWLEDGEMENT="I_UNDERSTAND_THIS_RESETS_LOCAL_SUPABASE"
REQUIRED_FINAL_ACKNOWLEDGEMENT="I_UNDERSTAND_THIS_RUNS_ISOLATED_FINAL_CLEANUP"

expected_schema_hash="b4c3bc0d7ad4c66fab7981a72078197957dcb4ea9578ce2e9e13ddaf329e81f9"
expected_data_hash="7c8345a3a6009b4f05e3ca9e399d856a0b6d8afab4849810792b1453b7fc878b"
expected_roles_hash="7441d05797e80e9101c5eb3696ef470c69238dd38928554aa19696369277a36b"

mode="preflight"
if [ "${1:-}" = "--execute" ] && [ "$#" -eq 1 ]; then
  mode="execute"
elif [ "$#" -ne 0 ] && ! { [ "${1:-}" = "--preflight" ] && [ "$#" -eq 1 ]; }; then
  echo "Usage: $0 [--preflight|--execute]" >&2
  exit 2
fi

cd "$PROJECT_ROOT"

require_command() {
  command -v "$1" >/dev/null 2>&1 || {
    echo "Required command is unavailable: $1" >&2
    exit 1
  }
}

hash_file() {
  shasum -a 256 "$1" | awk '{print $1}'
}

require_hash() {
  local file="$1"
  local expected="$2"
  local actual
  actual="$(hash_file "$file")"
  if [ "$actual" != "$expected" ]; then
    echo "Backup checksum mismatch: $(basename "$file")" >&2
    exit 1
  fi
}

require_command supabase
require_command shasum
require_command pgrep

if [ ! -x "$DOCKER_BIN" ]; then
  echo "Docker CLI is unavailable at the approved local path." >&2
  exit 1
fi

if ! "$DOCKER_BIN" inspect "$LOCAL_DB_CONTAINER" >/dev/null 2>&1; then
  echo "Expected local Supabase database container is unavailable: $LOCAL_DB_CONTAINER" >&2
  exit 1
fi

if [ ! -d "$BACKUP_DIR" ] || [ -L "$BACKUP_DIR" ]; then
  echo "Restricted backup directory is missing or symlinked." >&2
  exit 1
fi

for file in "$SCHEMA_FILE" "$DATA_FILE" "$ROLES_FILE"; do
  if [ ! -f "$file" ] || [ -L "$file" ]; then
    echo "Restricted backup asset is missing or symlinked: $(basename "$file")" >&2
    exit 1
  fi
done

directory_mode="$(stat -f '%Lp' "$BACKUP_DIR")"
if [ "$directory_mode" != "700" ]; then
  echo "Restricted backup directory must have mode 700; found $directory_mode." >&2
  exit 1
fi

for file in "$SCHEMA_FILE" "$DATA_FILE" "$ROLES_FILE"; do
  file_mode="$(stat -f '%Lp' "$file")"
  if [ "$file_mode" != "600" ]; then
    echo "Restricted backup asset must have mode 600: $(basename "$file")" >&2
    exit 1
  fi
done

require_hash "$SCHEMA_FILE" "$expected_schema_hash"
require_hash "$DATA_FILE" "$expected_data_hash"
require_hash "$ROLES_FILE" "$expected_roles_hash"

if [ ! -f "$BACKUP_DIR/SHA256SUMS-FINAL.txt" ] || ! (cd "$BACKUP_DIR" && shasum -a 256 -c SHA256SUMS-FINAL.txt >/dev/null); then
  echo "Protected backup final manifest verification failed." >&2
  exit 1
fi

if [ "$mode" = "preflight" ]; then
  echo "Preflight passed: restricted backup permissions and checksums match."
  echo "No database was reset, restored, queried, or migrated."
  exit 0
fi

if [ "${ALLOW_LOCAL_RESTORE_REHEARSAL:-}" != "$REQUIRED_ACKNOWLEDGEMENT" ]; then
  echo "Execution requires this exact acknowledgement:" >&2
  echo "ALLOW_LOCAL_RESTORE_REHEARSAL=$REQUIRED_ACKNOWLEDGEMENT" >&2
  exit 1
fi

if [ "${ALLOW_FINAL_DESTRUCTIVE_REHEARSAL:-}" != "$REQUIRED_FINAL_ACKNOWLEDGEMENT" ]; then
  echo "Execution requires a second acknowledgement for the isolated final cleanup:" >&2
  echo "ALLOW_FINAL_DESTRUCTIVE_REHEARSAL=$REQUIRED_FINAL_ACKNOWLEDGEMENT" >&2
  exit 1
fi

active_url="$(awk -F= '$1 == "NEXT_PUBLIC_SUPABASE_URL" { sub(/^[^=]*=/, ""); gsub(/^\"|\"$/, ""); print; exit }' .env.local)"
if [ "$active_url" != "http://127.0.0.1:54321" ]; then
  echo "Refusing rehearsal: the active application environment is not local Supabase." >&2
  exit 1
fi

if pgrep -f 'next dev|next start|npm run dev|npm run start' >/dev/null 2>&1; then
  echo "Refusing rehearsal while a Next.js application server is running." >&2
  exit 1
fi

cleanup_required=false
baseline_root=""
restore_sanitized_local_state() {
  if $cleanup_required; then
    echo "Restoring the normal sanitized local Supabase state."
    supabase db reset --local
  fi
  if [ -n "$baseline_root" ] && [[ "$baseline_root" == /tmp/needthisdone-supabase-baseline.* ]]; then
    rm -rf -- "$baseline_root"
  fi
}
trap restore_sanitized_local_state EXIT

echo "Resetting disposable local Supabase to its platform baseline."
cleanup_required=true
baseline_root="$(mktemp -d /tmp/needthisdone-supabase-baseline.XXXXXX)"
mkdir -p "$baseline_root/supabase/migrations"
cp supabase/config.toml "$baseline_root/supabase/config.toml"
mkdir -p "$baseline_root/supabase/.temp"
for version_file in postgres-version rest-version storage-version gotrue-version; do
  cp "supabase/.temp/$version_file" "$baseline_root/supabase/.temp/$version_file"
done
supabase db reset --local --workdir "$baseline_root" --no-seed

echo "Using platform-managed local roles; restricted role backup was checksum-verified."

echo "Restoring restricted hosted schema without printing object definitions."
"$DOCKER_BIN" exec -i "$LOCAL_DB_CONTAINER" \
  psql --username postgres --dbname postgres --set ON_ERROR_STOP=on \
  < "$SCHEMA_FILE" >/dev/null

echo "Restoring restricted historical data without printing row contents."
"$DOCKER_BIN" exec -i "$LOCAL_DB_CONTAINER" \
  psql --username postgres --dbname postgres --set ON_ERROR_STOP=on \
  < "$DATA_FILE" >/dev/null

run_local_sql() {
  "$DOCKER_BIN" exec "$LOCAL_DB_CONTAINER" \
    psql --username postgres --dbname postgres --set ON_ERROR_STOP=on -qAt -F '|' -c "$1"
}

normalize_hosted_baseline_acl() {
  # The protected dump already includes hosted migration 072, but a local
  # platform restore can reintroduce its default anon EXECUTE grant. Reapply
  # the exact 072 function-grant boundary without replaying 072's CREATE
  # POLICY statements against an already-populated snapshot.
  run_local_sql "revoke all on function public.record_ai_employee_decision(uuid, text, text, uuid, date) from public, anon; grant execute on function public.record_ai_employee_decision(uuid, text, text, uuid, date) to authenticated; revoke insert, update, delete on table public.ai_employee_decisions from anon, authenticated"
}

apply_migration() {
  local migration="$1"
  if [ ! -f "$migration" ] || [ -L "$migration" ]; then
    echo "Migration file is missing or symlinked: $migration" >&2
    exit 1
  fi
  echo "  Applying $(basename "$migration")"
  "$DOCKER_BIN" exec -i "$LOCAL_DB_CONTAINER" \
    psql --username postgres --dbname postgres --set ON_ERROR_STOP=on \
    < "$migration" >/dev/null
}

apply_stage() {
  local stage_name="$1"
  shift
  echo "Applying cumulative stage: $stage_name"
  for migration in "$@"; do
    apply_migration "$PROJECT_ROOT/supabase/migrations/$migration"
  done
}

table_inventory() {
  local table_name="$1"
  local relation
  relation="$(run_local_sql "select to_regclass('public.${table_name}')")"
  if [ -n "$relation" ]; then
    run_local_sql "select '${table_name}|' || count(*)::text from public.\"${table_name}\""
  else
    echo "${table_name}|absent"
  fi
}

capture_legacy_inventory() {
  for table_name in \
    blog_posts page_content page_content_history page_embeddings page_views \
    product product_category product_interactions cart cart_reminders orders; do
    table_inventory "$table_name"
  done
  run_local_sql "select 'medusa_schema|' || case when to_regnamespace('medusa') is null then 'absent' else 'present' end"
  run_local_sql "select 'medusa_tables|' || count(*)::text from pg_class c join pg_namespace n on n.oid = c.relnamespace where n.nspname = 'medusa' and c.relkind in ('r', 'p')"
  run_local_sql "select 'bucket:' || b.id || '|' || count(o.id)::text from storage.buckets b left join storage.objects o on o.bucket_id = b.id where b.id in ('media-library', 'product-images') group by b.id order by b.id"
}

assert_legacy_inventory_unchanged() {
  local expected="$1"
  local actual
  actual="$(capture_legacy_inventory)"
  if [ "$actual" != "$expected" ]; then
    echo "Legacy data changed before the isolated destructive gate." >&2
    echo "Expected inventory:" >&2
    echo "$expected" >&2
    echo "Actual inventory:" >&2
    echo "$actual" >&2
    exit 1
  fi
  echo "  Legacy table, Medusa, and retired-bucket inventory unchanged."
}

assert_pre_cleanup_security_and_retention() {
  local policy_count
  policy_count="$(run_local_sql "select count(*) from pg_policies where schemaname = 'public' and tablename = 'page_views' and policyname = 'Anyone can insert page views' and coalesce(with_check, '') like '%page_slug IS NOT NULL%'")"
  if [ "$policy_count" != "1" ]; then
    echo "Pre-cleanup page_views constraint proof failed." >&2
    exit 1
  fi
  for table_name in page_views page_content page_embeddings blog_posts product product_category cart orders; do
    if [ "$(run_local_sql "select count(*) from pg_class c join pg_namespace n on n.oid = c.relnamespace where n.nspname = 'public' and c.relname = '${table_name}' and c.relkind in ('r', 'p')")" != "1" ]; then
      echo "Expected retained historical object is missing before cleanup: public.$table_name" >&2
      exit 1
    fi
  done
  if [ "$(run_local_sql "select count(*) from pg_namespace where nspname = 'medusa'")" != "1" ]; then
    echo "Expected hosted Medusa schema is missing before cleanup." >&2
    exit 1
  fi
  echo "  Pre-cleanup page_views constraint and retained historical objects verified."
}

assert_final_object_boundaries() {
  local retired_tables="appointment_notification_log,appointment_reminders,appointment_requests,campaign_clicks,campaign_opens,campaign_recipients,email_campaigns,email_templates,loyalty_redemptions,loyalty_points,loyalty_points_config,referral_credit_usage,referral_transactions,customer_referrals,product_category_mappings,product_categories,product_waitlist,saved_addresses,waitlist_campaign_recipients,waitlist_campaigns,payment_attempts,webhook_events,page_content_history,enrollments,page_content,page_embeddings,page_views,pages,blog_posts,changelog_entries,media,review_reports,review_votes,template_reviews,template_purchases,product_similarities,product_interactions,coupon_usage,user_currency_preferences,exchange_rates,payments,cart_reminders,orders,quotes,reviews,marketplace_templates,template_categories,coupons,currencies,stripe_customers,subscriptions,demo_items,wizard_sessions,account_holder,api_key,application_method_buy_rules,application_method_target_rules,auth_identity,capture,cart,cart_address,cart_line_item,cart_line_item_adjustment,cart_line_item_tax_line,cart_payment_collection,cart_promotion,cart_shipping_method,cart_shipping_method_adjustment,cart_shipping_method_tax_line,credit_line,customer,customer_account_holder,customer_address,customer_group,customer_group_customer,fulfillment,fulfillment_address,fulfillment_item,fulfillment_label,fulfillment_provider,fulfillment_set,geo_zone,image,inventory_item,inventory_level,invite,link_module_migrations,location_fulfillment_provider,location_fulfillment_set,mikro_orm_migrations,notification,notification_provider,order,order_address,order_cart,order_change,order_change_action,order_claim,order_claim_item,order_claim_item_image,order_credit_line,order_exchange,order_exchange_item,order_fulfillment,order_item,order_line_item,order_line_item_adjustment,order_line_item_tax_line,order_payment_collection,order_promotion,order_shipping,order_shipping_method,order_shipping_method_adjustment,order_shipping_method_tax_line,order_summary,order_transaction,payment,payment_collection,payment_collection_payment_providers,payment_provider,payment_session,price,price_list,price_list_rule,price_preference,price_rule,price_set,product,product_category,product_category_product,product_collection,product_option,product_option_value,product_sales_channel,product_shipping_profile,product_tag,product_tags,product_type,product_variant,product_variant_inventory_item,product_variant_option,product_variant_price_set,product_variant_product_image,promotion,promotion_application_method,promotion_campaign,promotion_campaign_budget,promotion_campaign_budget_usage,promotion_promotion_rule,promotion_rule,promotion_rule_value,provider_identity,publishable_api_key_sales_channel,refund,refund_reason,region,region_country,region_payment_provider,reservation_item,return,return_fulfillment,return_item,return_reason,sales_channel,sales_channel_stock_location,script_migrations,service_zone,shipping_option,shipping_option_price_set,shipping_option_rule,shipping_option_type,shipping_profile,stock_location,stock_location_address,store,store_currency,store_locale,tax_provider,tax_rate,tax_rate_rule,tax_region,user,user_preference,user_rbac_role,view_configuration,workflow_execution"
  local retired_count
  retired_count="$(run_local_sql "select count(*) from pg_class c join pg_namespace n on n.oid = c.relnamespace where n.nspname = 'public' and c.relname = any(string_to_array('${retired_tables}', ',')::text[]) and c.relkind in ('r', 'p', 'v', 'm', 'f')")"
  if [ "$retired_count" != "0" ]; then
    echo "Retired public objects remain after the isolated cleanup: $retired_count" >&2
    exit 1
  fi
  if [ "$(run_local_sql "select count(*) from pg_namespace where nspname = 'medusa'")" != "0" ]; then
    echo "The retired Medusa schema remains after the isolated cleanup." >&2
    exit 1
  fi
  if [ "$(run_local_sql "select count(*) from storage.buckets where id in ('media-library', 'product-images')")" != "0" ]; then
    echo "Retired Storage buckets remain after the isolated cleanup." >&2
    exit 1
  fi
  for table_name in projects site_reports ai_employees growth_profiles model_evaluation_records agent_plans workflow_runs health_check; do
    if [ "$(run_local_sql "select count(*) from pg_class c join pg_namespace n on n.oid = c.relnamespace where n.nspname = 'public' and c.relname = '${table_name}' and c.relkind = 'r'")" != "1" ]; then
      echo "Retained object is missing after the isolated cleanup: public.$table_name" >&2
      exit 1
    fi
  done
  echo "  Retired objects are absent and retained objects remain present."
}

normalize_hosted_baseline_acl
legacy_inventory="$(capture_legacy_inventory)"
echo "Protected legacy inventory baseline (counts only):"
echo "$legacy_inventory"
assert_pre_cleanup_security_and_retention

apply_stage "calendar-token-security" \
  073_secure_google_calendar_tokens.sql
assert_legacy_inventory_unchanged "$legacy_inventory"

apply_stage "storage-bucket-normalization" \
  074_create_private_project_attachments_bucket.sql
assert_legacy_inventory_unchanged "$legacy_inventory"

apply_stage "additive-product-workflow" \
  075_add_financial_ai_employee_outcomes.sql \
  076_operable_internal_pilot.sql \
  077_fix_pilot_timezone_queue_author.sql \
  078_require_completion_evidence.sql \
  079_prospecting_outreach.sql \
  080_daily_cockpit.sql
assert_legacy_inventory_unchanged "$legacy_inventory"

apply_stage "growth-profile-evaluation" \
  081_bound_model_evaluation_budget.sql
assert_legacy_inventory_unchanged "$legacy_inventory"

apply_stage "research-agent-planner" \
  082_private_prospect_research_suite.sql \
  083_agent_operations_dashboard.sql \
  084_configured_openrouter_models.sql \
  085_agent_planner_openclaw_adapter.sql \
  086_agent_planner_write_boundary.sql \
  087_fix_agent_plan_dispatch_aggregate.sql \
  088_openclaw_claim_boundary.sql \
  089_agent_plan_fail_closed_validation.sql
assert_legacy_inventory_unchanged "$legacy_inventory"

echo "Applying isolated final destructive stage: destructive-retirement"
apply_migration "$PROJECT_ROOT/supabase/migrations/090_remove_local_only_legacy_schema.sql"
apply_migration "$PROJECT_ROOT/supabase/migrations/091_remove_content_and_search_schema.sql"
apply_migration "$PROJECT_ROOT/supabase/migrations/092_remove_marketplace_and_commerce_schema.sql"
assert_final_object_boundaries

echo "Running the required retained database gate against migrated historical data."
npm run verify:database

echo "Historical-data staged migration rehearsal passed through 092."
