#!/usr/bin/env bash
set -euo pipefail

: "${BRIDGE_ENV_FILE:?BRIDGE_ENV_FILE is required}"
: "${WORKFLOW_SCHEDULER_ENTRYPOINT:?WORKFLOW_SCHEDULER_ENTRYPOINT is required}"
: "${NODE_BINARY:?NODE_BINARY is required}"
if [[ ! -f "$BRIDGE_ENV_FILE" ]] || [[ "$(stat -f '%Lp' "$BRIDGE_ENV_FILE")" != "600" ]]; then
  echo "Bridge private environment file is missing or not mode 600." >&2
  exit 65
fi
set -a
# shellcheck source=/dev/null
source "$BRIDGE_ENV_FILE"
set +a
if [[ ! -f "$WORKFLOW_SCHEDULER_ENTRYPOINT" ]] || [[ ! -x "$NODE_BINARY" ]]; then
  echo "The rendered workflow scheduler runtime is unavailable." >&2
  exit 67
fi
exec "$NODE_BINARY" "$WORKFLOW_SCHEDULER_ENTRYPOINT"
