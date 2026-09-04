#!/usr/bin/env bash
set -euo pipefail

# This validator deliberately does not call launchctl or the bridge entrypoint.
: "${BRIDGE_ENV_FILE:?BRIDGE_ENV_FILE is required}"
script_dir="$(cd "$(dirname "$0")" && pwd)"
validator="${BRIDGE_CONFIG_VALIDATOR:-$script_dir/../dist/validate-config.js}"

if [[ ! -f "$BRIDGE_ENV_FILE" ]] || [[ "$(stat -f '%Lp' "$BRIDGE_ENV_FILE")" != "600" ]]; then
  echo "Bridge private environment file is missing or not mode 600." >&2
  exit 65
fi
if [[ ! -f "$validator" ]]; then
  echo "Bridge configuration validator is missing; run npm run build first." >&2
  exit 66
fi

set -a
# shellcheck source=/dev/null
source "$BRIDGE_ENV_FILE"
set +a
exec "${NODE_BINARY:-/usr/local/bin/node}" "$validator"
