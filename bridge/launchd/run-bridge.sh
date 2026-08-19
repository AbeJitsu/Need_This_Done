#!/usr/bin/env bash
set -euo pipefail

# This file is invoked by launchd, not sourced by a login shell. The private
# file path is supplied by the rendered plist and must never live in git.
: "${BRIDGE_ENV_FILE:?BRIDGE_ENV_FILE is required}"
: "${BRIDGE_ENTRYPOINT:?BRIDGE_ENTRYPOINT is required}"
if [[ ! -f "$BRIDGE_ENV_FILE" ]] || [[ "$(stat -f '%Lp' "$BRIDGE_ENV_FILE")" != "600" ]]; then
  echo "Bridge private environment file is missing or not mode 600." >&2
  exit 65
fi
set -a
# shellcheck source=/dev/null
source "$BRIDGE_ENV_FILE"
set +a
exec "${NODE_BINARY:-/usr/local/bin/node}" "$BRIDGE_ENTRYPOINT"
