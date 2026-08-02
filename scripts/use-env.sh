#!/usr/bin/env bash

# Safely select the Supabase-backed development environment.
# Usage: ./scripts/use-env.sh local|cloud [--dry-run]

set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ACTIVE_ENV="$PROJECT_ROOT/.env.local"
APP_ENV="$PROJECT_ROOT/app/.env.local"
LOCAL_PROFILE="$PROJECT_ROOT/.env.local.profile"
CLOUD_PROFILE="$PROJECT_ROOT/.env.cloud.profile"
LOCAL_URL="http://127.0.0.1:54321"
CLOUD_URL="https://oxhjtmozsdstbokwtnwa.supabase.co"

usage() {
  echo "Usage: $0 local|cloud [--dry-run]" >&2
  exit 2
}

target=""
dry_run=false
for argument in "$@"; do
  case "$argument" in
    local|cloud)
      [ -z "$target" ] || usage
      target="$argument"
      ;;
    --dry-run)
      dry_run=true
      ;;
    *)
      usage
      ;;
  esac
done
[ -n "$target" ] || usage

profile="$LOCAL_PROFILE"
expected_url="$LOCAL_URL"
if [ "$target" = "cloud" ]; then
  profile="$CLOUD_PROFILE"
  expected_url="$CLOUD_URL"
fi

if [ ! -f "$profile" ]; then
  echo "Environment profile is missing: $(basename "$profile")" >&2
  echo "Create it from the documented local/cloud credentials source, then retry." >&2
  exit 1
fi

if [ -L "$profile" ]; then
  echo "Refusing symlinked environment profile: $(basename "$profile")" >&2
  exit 1
fi

read_profile_value() {
  local name="$1"
  awk -F= -v name="$name" '
    $1 == name {
      sub(/^[^=]*=/, "")
      gsub(/^\"|\"$/, "")
      print
      found = 1
      exit
    }
    END { if (!found) exit 1 }
  ' "$profile"
}

profile_target="$(read_profile_value ENV_TARGET 2>/dev/null || true)"
profile_url="$(read_profile_value NEXT_PUBLIC_SUPABASE_URL 2>/dev/null || true)"
anon_key="$(read_profile_value NEXT_PUBLIC_SUPABASE_ANON_KEY 2>/dev/null || true)"
service_key="$(read_profile_value SUPABASE_SERVICE_ROLE_KEY 2>/dev/null || true)"

if [ "$profile_target" != "$target" ]; then
  echo "Profile marker mismatch in $(basename "$profile"): expected ENV_TARGET=$target" >&2
  exit 1
fi

if [ "$profile_url" != "$expected_url" ]; then
  echo "Profile URL does not match the approved $target endpoint." >&2
  echo "Expected: $expected_url" >&2
  exit 1
fi

if [ -z "$anon_key" ] || [ -z "$service_key" ] || [ "${#anon_key}" -le 20 ] || [ "${#service_key}" -le 20 ]; then
  echo "Profile is missing valid Supabase credentials: $(basename "$profile")" >&2
  exit 1
fi

if [ "$profile_url" = "https://needthisdone.supabase.co" ] || [[ "$profile_url" == *production* ]]; then
  echo "Refusing a production-looking Supabase endpoint." >&2
  exit 1
fi

if [ ! -L "$APP_ENV" ]; then
  echo "Refusing to switch: app/.env.local must remain a symlink to the root .env.local." >&2
  exit 1
fi

app_link="$(readlink "$APP_ENV")"
case "$app_link" in
  "$ACTIVE_ENV"|.env.local)
    ;;
  *)
    echo "Refusing to switch: app/.env.local points outside the active root environment." >&2
    exit 1
    ;;
esac

if $dry_run; then
  echo "Dry run: $(basename "$profile") is valid for $target ($profile_url)."
  echo "No environment link was changed and no database command was run."
  exit 0
fi

temporary_dir="$(mktemp -d "$PROJECT_ROOT/.env-switch.XXXXXX")"
cleanup() {
  rmdir "$temporary_dir" 2>/dev/null || true
}
trap cleanup EXIT

ln -s "$(basename "$profile")" "$temporary_dir/.env.local"
mv -f "$temporary_dir/.env.local" "$ACTIVE_ENV"

if [ "$(readlink "$ACTIVE_ENV")" != "$(basename "$profile")" ]; then
  echo "Environment switch did not complete atomically." >&2
  exit 1
fi

echo "Active environment: $target ($profile_url)"
echo "Credentials were not printed. app/.env.local remains linked to the root active profile."
