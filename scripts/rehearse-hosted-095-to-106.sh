#!/usr/bin/env bash

# Rebuild the disposable local database through the verified hosted head 106,
# then apply the reviewed 110 and 111 stages. Versions 107–109 are deliberately
# absent retired local-only history, so this rehearsal proves both the intended
# omission and the exact 106 → 110 → 111 boundary. The default mode is a
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
  echo "Hosted-like rehearsal preflight passed: manifest permits hosted head 106, omits only 107–109, and stages 110 then 111."
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

rehearsal_root="$(mktemp -d /tmp/needthisdone-hosted-106.XXXXXX)"
cleanup_required=false
restore_local_state() {
  if $cleanup_required; then
    echo "Restoring the fixture-free disposable local Supabase state through migration 111."
    supabase db reset --local --no-seed
  fi
  if [[ "$rehearsal_root" == /tmp/needthisdone-hosted-106.* ]]; then
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
  if [ "$version" -le 106 ]; then
    cp "$migration" "$rehearsal_root/supabase/migrations/$filename"
  fi
done

echo "Resetting disposable local Supabase to the hosted-like migration head 106."
cleanup_required=true
supabase db reset --local --workdir "$rehearsal_root" --no-seed

run_local_sql() {
  "$DOCKER_BIN" exec "$LOCAL_DB_CONTAINER" \
    psql --username postgres --dbname postgres --set ON_ERROR_STOP=on -qAt -c "$1"
}

baseline_head="$(run_local_sql "select max(version) from supabase_migrations.schema_migrations")"
if [ "$baseline_head" != "106" ]; then
  echo "Hosted-like baseline did not stop at 106; found ${baseline_head:-none}." >&2
  exit 1
fi

for version in 110 111; do
  migration="$(find supabase/migrations -maxdepth 1 -type f -name "${version}_*.sql" -print -quit)"
  if [ -z "$migration" ] || [ -L "$migration" ]; then
    echo "Reviewed migration ${version} is missing or symlinked." >&2
    exit 1
  fi
  cp "$migration" "$rehearsal_root/supabase/migrations/"
  echo "Applying reviewed migration ${version} from the hosted-like 106 baseline."
  supabase migration up --local --workdir "$rehearsal_root"
  actual_head="$(run_local_sql "select max(version) from supabase_migrations.schema_migrations")"
  if [ "$actual_head" != "$version" ]; then
    echo "Migration ${version} did not become the local head; found ${actual_head:-none}." >&2
    exit 1
  fi
done

retired_count="$(run_local_sql "select count(*) from supabase_migrations.schema_migrations where version in ('107', '108', '109')")"
applied_versions="$(run_local_sql "select string_agg(version, ',' order by version) from supabase_migrations.schema_migrations where version in ('110', '111')")"
if [ "$retired_count" != "0" ] || [ "$applied_versions" != "110,111" ]; then
  echo "Migration-history proof failed: retired_count=${retired_count:-0}, reviewed_versions=${applied_versions:-none}." >&2
  exit 1
fi

echo "Running the real schema, RLS, grant, and provider-workflow database gate at 111."
npm run verify:database

echo "Hosted-like disposable-local migration rehearsal passed: 106 → 110 → 111 (107–109 absent)."
