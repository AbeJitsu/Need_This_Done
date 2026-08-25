#!/usr/bin/env bash

# Rebuild the disposable local database through the verified hosted head 095,
# then apply only the contiguous pending 096–109 range. The default mode is a
# read-only preflight; execution requires an exact local-reset acknowledgement.

set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
REQUIRED_ACKNOWLEDGEMENT="I_UNDERSTAND_THIS_RESETS_LOCAL_SUPABASE"
LOCAL_DB_CONTAINER="supabase_db_$(basename "$PROJECT_ROOT")"
mode="preflight"

if [ "${1:-}" = "--execute" ] && [ "$#" -eq 1 ]; then
  mode="execute"
elif [ "$#" -ne 0 ] && ! { [ "${1:-}" = "--preflight" ] && [ "$#" -eq 1 ]; }; then
  echo "Usage: $0 [--preflight|--execute]" >&2
  exit 2
fi

cd "$PROJECT_ROOT"
node scripts/verify-hosted-migration-stages.mjs

if [ "$mode" = "preflight" ]; then
  echo "Hosted-like rehearsal preflight passed: manifest head 095 and pending range 096–109 are valid."
  echo "No database was reset or migrated."
  exit 0
fi

if [ "${ALLOW_HOSTED_LIKE_REHEARSAL:-}" != "$REQUIRED_ACKNOWLEDGEMENT" ]; then
  echo "Execution requires this exact acknowledgement:" >&2
  echo "ALLOW_HOSTED_LIKE_REHEARSAL=$REQUIRED_ACKNOWLEDGEMENT" >&2
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

if command -v docker >/dev/null 2>&1; then
  DOCKER_BIN="$(command -v docker)"
elif [ -x /Applications/Docker.app/Contents/Resources/bin/docker ]; then
  DOCKER_BIN=/Applications/Docker.app/Contents/Resources/bin/docker
else
  echo "Docker CLI is unavailable." >&2
  exit 1
fi

if ! "$DOCKER_BIN" inspect "$LOCAL_DB_CONTAINER" >/dev/null 2>&1; then
  echo "Expected disposable local database container is unavailable: $LOCAL_DB_CONTAINER" >&2
  exit 1
fi

rehearsal_root="$(mktemp -d /tmp/needthisdone-hosted-095.XXXXXX)"
cleanup_required=false
restore_local_state() {
  if $cleanup_required; then
    echo "Restoring the normal sanitized local Supabase state through migration 109."
    supabase db reset --local
  fi
  if [[ "$rehearsal_root" == /tmp/needthisdone-hosted-095.* ]]; then
    rm -rf -- "$rehearsal_root"
  fi
}
trap restore_local_state EXIT

mkdir -p "$rehearsal_root/supabase/migrations" "$rehearsal_root/supabase/.temp"
cp supabase/config.toml "$rehearsal_root/supabase/config.toml"
for version_file in postgres-version rest-version storage-version gotrue-version; do
  cp "supabase/.temp/$version_file" "$rehearsal_root/supabase/.temp/$version_file"
done

for migration in supabase/migrations/*.sql; do
  filename="$(basename "$migration")"
  version="${filename%%_*}"
  if [ "$version" -le 95 ]; then
    cp "$migration" "$rehearsal_root/supabase/migrations/$filename"
  fi
done

echo "Resetting disposable local Supabase to the hosted-like migration head 095."
cleanup_required=true
supabase db reset --local --workdir "$rehearsal_root" --no-seed

run_local_sql() {
  "$DOCKER_BIN" exec "$LOCAL_DB_CONTAINER" \
    psql --username postgres --dbname postgres --set ON_ERROR_STOP=on -qAt -c "$1"
}

baseline_head="$(run_local_sql "select max(version) from supabase_migrations.schema_migrations")"
if [ "$baseline_head" != "095" ]; then
  echo "Hosted-like baseline did not stop at 095; found ${baseline_head:-none}." >&2
  exit 1
fi

for migration in supabase/migrations/*.sql; do
  filename="$(basename "$migration")"
  version="${filename%%_*}"
  if [ "$version" -ge 96 ] && [ "$version" -le 109 ]; then
    cp "$migration" "$rehearsal_root/supabase/migrations/$filename"
  fi
done

echo "Applying the contiguous pending migration range 096–109."
supabase migration up --local --workdir "$rehearsal_root"

final_head="$(run_local_sql "select max(version) from supabase_migrations.schema_migrations")"
pending_count="$(run_local_sql "select count(*) from supabase_migrations.schema_migrations where version between '096' and '109'")"
if [ "$final_head" != "109" ] || [ "$pending_count" != "14" ]; then
  echo "Pending migration proof failed: head=${final_head:-none}, range_count=${pending_count:-0}." >&2
  exit 1
fi

echo "Running the real schema, RLS, grant, and Daily Desk database gate at 109."
npm run verify:database

echo "Hosted-like disposable-local migration rehearsal passed: 095 → 109."
