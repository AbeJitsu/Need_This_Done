#!/usr/bin/env bash
set -euo pipefail

# launchd invokes this wrapper so the Gateway token stays in the private env
# file rather than in a plist or command-line argument.
: "${BRIDGE_ENV_FILE:?BRIDGE_ENV_FILE is required}"
: "${OPENCLAW_CONFIG_PATH:?OPENCLAW_CONFIG_PATH is required}"
: "${OPENCLAW_BINARY:?OPENCLAW_BINARY is required}"
: "${OPENCLAW_PROFILE:?OPENCLAW_PROFILE is required}"
: "${OPENCLAW_GATEWAY_PORT:?OPENCLAW_GATEWAY_PORT is required}"
configured_openclaw_binary="$OPENCLAW_BINARY"
configured_config_path="$OPENCLAW_CONFIG_PATH"
configured_profile="$OPENCLAW_PROFILE"
configured_port="$OPENCLAW_GATEWAY_PORT"
if [[ ! -f "$BRIDGE_ENV_FILE" ]] || [[ "$(stat -f '%Lp' "$BRIDGE_ENV_FILE")" != "600" ]]; then
  echo "OpenClaw private environment file is missing or not mode 600." >&2
  exit 65
fi
if [[ ! -f "$configured_config_path" ]] || [[ "$(stat -f '%Lp' "$configured_config_path")" != "600" ]]; then
  echo "OpenClaw read-only profile config is missing or not mode 600." >&2
  exit 66
fi
if [[ ! -x "$configured_openclaw_binary" ]]; then
  echo "The discovered OpenClaw binary is not executable." >&2
  exit 67
fi
if [[ ! "$configured_port" =~ ^[0-9]+$ ]] || (( configured_port < 1 || configured_port > 65535 )); then
  echo "OpenClaw Gateway port is invalid." >&2
  exit 68
fi
set -a
# shellcheck source=/dev/null
source "$BRIDGE_ENV_FILE"
set +a
export OPENCLAW_CONFIG="$configured_config_path"
exec "$configured_openclaw_binary" --profile "$configured_profile" gateway run --bind loopback --auth token --port "$configured_port"
