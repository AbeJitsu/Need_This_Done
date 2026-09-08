#!/usr/bin/env bash
set -euo pipefail

# Review-only installer. It refuses to load jobs; the Mac runtime owner must
# inspect rendered files and run launchctl themselves during checklist item 13.
if [[ $# -lt 2 || $# -gt 3 ]]; then
  echo "usage: $0 PRIVATE_RUNTIME_DIR OUTPUT_DIR [OPENCLAW_CONFIG_PATH]" >&2
  exit 64
fi
runtime_dir="$1"
output_dir="$2"
config_path="${3:-$runtime_dir/openclaw.json}"
node_binary="${NODE_BINARY:-$(command -v node || true)}"
openclaw_binary="${OPENCLAW_BINARY:-$(command -v openclaw || true)}"
plutil_binary="${PLUTIL_BINARY:-$(command -v plutil || true)}"
gateway_port="${OPENCLAW_GATEWAY_PORT:-18789}"
openclaw_profile="${OPENCLAW_PROFILE:-needthisdone}"
if [[ "$runtime_dir" != /* ]] || [[ "$output_dir" != /* ]] || [[ "$config_path" != /* ]] || [[ "$runtime_dir" == *$'\n'* ]] || [[ "$output_dir" == *$'\n'* ]] || [[ "$config_path" == *$'\n'* ]]; then
  echo "runtime and output paths must be absolute single-line paths" >&2
  exit 64
fi
if [[ -z "$node_binary" || "$node_binary" != /* || ! -x "$node_binary" || -z "$openclaw_binary" || "$openclaw_binary" != /* || ! -x "$openclaw_binary" || -z "$plutil_binary" || "$plutil_binary" != /* || ! -x "$plutil_binary" ]]; then
  echo "Node, OpenClaw, and plutil must be executable absolute paths, discovered with command -v or supplied by the CLI." >&2
  exit 65
fi
for value in "$runtime_dir" "$output_dir" "$config_path" "$node_binary" "$openclaw_binary" "$openclaw_profile"; do
  if [[ "$value" == *\<* || "$value" == *\>* || "$value" == *\&* || "$value" == *\"* || "$value" == *\'* || "$value" == *\|* || "$value" == *\\* || "$value" == *$'\n'* ]]; then
    echo "runtime, binary, profile, or output values contain unsafe XML characters" >&2
    exit 64
  fi
done
if [[ ! "$gateway_port" =~ ^[0-9]+$ ]] || (( gateway_port < 1 || gateway_port > 65535 )); then
  echo "OPENCLAW_GATEWAY_PORT must be an integer between 1 and 65535." >&2
  exit 64
fi
if [[ ! -d "$runtime_dir" ]] || [[ ! -f "$runtime_dir/bridge.env" ]] || [[ ! -f "$config_path" ]]; then
  echo "private runtime requires bridge.env and the read-only OpenClaw config" >&2
  exit 65
fi
if [[ "$(stat -f '%Lp' "$runtime_dir")" != "700" ]] || [[ "$(stat -f '%Lp' "$runtime_dir/bridge.env")" != "600" ]] || [[ "$(stat -f '%Lp' "$config_path")" != "600" ]]; then
  echo "private runtime must be 700 and bridge.env/read-only OpenClaw config must be mode 600" >&2
  exit 66
fi
mkdir -p "$output_dir"
chmod 700 "$output_dir"
mkdir -p "$runtime_dir/logs"
chmod 700 "$runtime_dir/logs"
umask 077
script_dir="$(cd "$(dirname "$0")" && pwd)"
if [[ "$script_dir" == *\<* || "$script_dir" == *\>* || "$script_dir" == *\&* || "$script_dir" == *\"* || "$script_dir" == *\'* || "$script_dir" == *\|* || "$script_dir" == *\\* || "$script_dir" == *$'\n'* ]]; then
  echo "launchd script path contains unsafe XML characters" >&2
  exit 64
fi
for template in "$script_dir"/*.plist.template; do
  name="$(basename "$template" .template)"
  target="$output_dir/$name"
  sed -e "s|__PRIVATE_ENV_PATH__|$runtime_dir/bridge.env|g" -e "s|__PRIVATE_CONFIG_PATH__|$config_path|g" -e "s|__LOG_DIR__|$runtime_dir/logs|g" -e "s|__RUNNER_PATH__|$script_dir/run-bridge.sh|g" -e "s|__GATEWAY_RUNNER_PATH__|$script_dir/run-gateway.sh|g" -e "s|__BRIDGE_ENTRYPOINT__|$script_dir/../dist/index.js|g" -e "s|__NODE_BINARY__|$node_binary|g" -e "s|__OPENCLAW_BINARY__|$openclaw_binary|g" -e "s|__OPENCLAW_PROFILE__|$openclaw_profile|g" -e "s|__OPENCLAW_GATEWAY_PORT__|$gateway_port|g" "$template" > "$target"
  if rg -q '__[A-Z_]+__' "$target" || ! "$plutil_binary" -lint "$target" >/dev/null; then
    rm -f "$target"
    echo "template rendering failed validation" >&2
    exit 67
  fi
done
echo "Rendered review-only launchd files in $output_dir; no job was loaded."
