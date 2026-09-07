#!/usr/bin/env bash
set -euo pipefail

# This file is invoked by launchd, not sourced by a login shell. The private
# file path is supplied by the rendered plist and must never live in git.
: "${BRIDGE_ENV_FILE:?BRIDGE_ENV_FILE is required}"
: "${BRIDGE_ENTRYPOINT:?BRIDGE_ENTRYPOINT is required}"
: "${NODE_BINARY:?NODE_BINARY is required}"
configured_node_binary="$NODE_BINARY"
configured_bridge_entrypoint="$BRIDGE_ENTRYPOINT"
if [[ ! -f "$BRIDGE_ENV_FILE" ]] || [[ "$(stat -f '%Lp' "$BRIDGE_ENV_FILE")" != "600" ]]; then
  echo "Bridge private environment file is missing or not mode 600." >&2
  exit 65
fi
set -a
# shellcheck source=/dev/null
source "$BRIDGE_ENV_FILE"
set +a
if [[ ! -f "$configured_bridge_entrypoint" ]]; then
  echo "The rendered bridge entrypoint is missing." >&2
  exit 67
fi
if [[ ! -x "$configured_node_binary" ]]; then
  echo "The discovered Node binary is not executable." >&2
  exit 68
fi
exec "$configured_node_binary" "$configured_bridge_entrypoint"
