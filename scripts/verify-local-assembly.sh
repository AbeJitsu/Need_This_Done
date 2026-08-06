#!/usr/bin/env bash

# Prove the retained NeedThisDone product with local infrastructure only.
# --fresh rebuilds and therefore erases only the local Supabase development DB.

set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
APP_ROOT="$PROJECT_ROOT/app"
FRESH=false

case "${1:-}" in
  "") ;;
  --fresh) FRESH=true ;;
  *) echo "Usage: $0 [--fresh]" >&2; exit 2 ;;
esac

cd "$PROJECT_ROOT"
./scripts/use-env.sh local

wait_for_local_auth() {
  local attempts=0
  while [ "$attempts" -lt 15 ]; do
    if curl -fsS http://127.0.0.1:54321/auth/v1/health >/dev/null 2>&1; then
      return 0
    fi
    attempts=$((attempts + 1))
    sleep 1
  done
  return 1
}

restart_local_gateway() {
  local docker_bin=""
  if command -v docker >/dev/null 2>&1; then
    docker_bin="$(command -v docker)"
  elif [ -x /Applications/Docker.app/Contents/Resources/bin/docker ]; then
    docker_bin=/Applications/Docker.app/Contents/Resources/bin/docker
  fi

  if [ -z "$docker_bin" ]; then
    echo "Local Supabase Auth is not reachable and Docker CLI was not found." >&2
    return 1
  fi

  "$docker_bin" restart "supabase_kong_$(basename "$PROJECT_ROOT")" >/dev/null
  wait_for_local_auth
}

if $FRESH; then
  echo "Fresh proof: resetting only the local Supabase development database."
  supabase db reset --local
  wait_for_local_auth || restart_local_gateway
fi

if ! wait_for_local_auth && ! restart_local_gateway; then
  echo "Required local Supabase Auth/API is not healthy. Start Docker and run: supabase start" >&2
  exit 1
fi
supabase db lint --local

# Keep local Supabase credentials from the selected profile, but make every
# optional external-provider boundary unavailable to this proof process.
export OFFLINE_ASSEMBLY_PROOF=true
export SKIP_EMAILS=true
export SKIP_CACHE=true
export REDIS_URL=
export OPENAI_API_KEY=
export RESEND_API_KEY=
export RESEND_ADMIN_EMAIL=
export RESEND_FROM_EMAIL=
export RESEND_WEBHOOK_SECRET=
export GOOGLE_CLIENT_ID=
export GOOGLE_CLIENT_SECRET=
export GOOGLE_REDIRECT_URI=
export GOOGLE_OAUTH_STATE_SECRET=
export CALENDAR_TOKEN_ENCRYPTION_KEY=
# NextAuth still needs local application signing material even when every
# external identity provider is unavailable. This deterministic value belongs
# only to the disposable assembly process; it is not a provider credential.
export NEXTAUTH_SECRET=provider-free-local-session-secret-00000001
export NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
export STRIPE_SECRET_KEY=
export STRIPE_TEST_SECRET_KEY=
export STRIPE_WEBHOOK_SECRET=
export OPENROUTER_API_KEY=

cd "$APP_ROOT"
npm run verify:code
npm run verify:database
npm run test:retained-smoke
npm run test:auth:e2e
npm run test:prospecting-workspace
npm run test:employee-workspace

echo "Provider-free assembly passed: local Supabase + repository code only."
