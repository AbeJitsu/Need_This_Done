#!/usr/bin/env bash

# Rehearse the hosted historical-data transition against disposable local
# Supabase. The default mode is read-only preflight. Execution requires an
# exact acknowledgement because it resets the local database and temporarily
# restores restricted historical data.

set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKUP_DIR_DEFAULT="/Users/abiezerreyes/Documents/NeedThisDone Backups/2026-07-29-pre-migration-072"
BACKUP_DIR="${NEEDTHISDONE_REHEARSAL_BACKUP_DIR:-$BACKUP_DIR_DEFAULT}"
DATA_FILE="$BACKUP_DIR/data.sql"
SCHEMA_FILE="$BACKUP_DIR/schema.sql"
ROLES_FILE="$BACKUP_DIR/roles.sql"
DOCKER_BIN="/Applications/Docker.app/Contents/Resources/bin/docker"
LOCAL_DB_CONTAINER="supabase_db_Need_This_Done"
REQUIRED_ACKNOWLEDGEMENT="I_UNDERSTAND_THIS_RESETS_LOCAL_SUPABASE"

expected_schema_hash="95a7b2df97c6c1647d0946f2cfac92deed82bb4af89a56cc1806f58abfc3307e"
expected_data_hash="d35203eb09ff045360303d4098149f7924e7128d5d87c416195b91e2e6f57da7"
expected_roles_hash="3c54bf4ccf2cc71e817c9c37cd550f0ca6af656e91eb6916f8697b6b8b41ce5f"

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
restore_sanitized_local_state() {
  if $cleanup_required; then
    echo "Restoring the normal sanitized local Supabase state."
    supabase db reset --local
  fi
}
trap restore_sanitized_local_state EXIT

echo "Resetting disposable local Supabase through migration 071."
cleanup_required=true
supabase db reset --local --version 071 --no-seed

echo "Restoring restricted historical data without printing row contents."
"$DOCKER_BIN" exec -i "$LOCAL_DB_CONTAINER" \
  psql --username postgres --dbname postgres --set ON_ERROR_STOP=on \
  < "$DATA_FILE" >/dev/null

echo "Applying local forward migrations 072 through 078."
supabase migration up --local

echo "Running the required retained database gate against migrated historical data."
npm run verify:database

echo "Historical-data migration rehearsal passed."
