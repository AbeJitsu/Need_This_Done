#!/usr/bin/env bash
set -euo pipefail

# Review-only installer. It refuses to load jobs; the Mac runtime owner must
# inspect rendered files and run launchctl themselves during checklist item 13.
if [[ $# -ne 2 ]]; then
  echo "usage: $0 PRIVATE_RUNTIME_DIR OUTPUT_DIR" >&2
  exit 64
fi
runtime_dir="$1"
output_dir="$2"
if [[ "$runtime_dir" != /* ]] || [[ "$output_dir" != /* ]] || [[ "$runtime_dir" == *$'\n'* ]] || [[ "$output_dir" == *$'\n'* ]]; then
  echo "runtime and output paths must be absolute single-line paths" >&2
  exit 64
fi
if [[ "$runtime_dir" == *\<* || "$runtime_dir" == *\>* || "$runtime_dir" == *\&* || "$runtime_dir" == *\"* || "$runtime_dir" == *\'* || "$output_dir" == *\<* || "$output_dir" == *\>* || "$output_dir" == *\&* || "$output_dir" == *\"* || "$output_dir" == *\'* ]]; then
  echo "runtime and output paths contain unsafe XML characters" >&2
  exit 64
fi
if [[ ! -d "$runtime_dir" ]] || [[ ! -f "$runtime_dir/bridge.env" ]] || [[ ! -f "$runtime_dir/openclaw.json" ]]; then
  echo "private runtime requires bridge.env and openclaw.json" >&2
  exit 65
fi
if [[ "$(stat -f '%Lp' "$runtime_dir")" != "700" ]] || [[ "$(stat -f '%Lp' "$runtime_dir/bridge.env")" != "600" ]] || [[ "$(stat -f '%Lp' "$runtime_dir/openclaw.json")" != "600" ]]; then
  echo "private runtime must be 700 and bridge.env/openclaw.json must be mode 600" >&2
  exit 66
fi
mkdir -p "$output_dir"
umask 077
script_dir="$(cd "$(dirname "$0")" && pwd)"
for template in "$script_dir"/*.plist.template; do
  name="$(basename "$template" .template)"
  target="$output_dir/$name"
  sed -e "s|__PRIVATE_ENV_PATH__|$runtime_dir/bridge.env|g" -e "s|__PRIVATE_CONFIG_PATH__|$runtime_dir/openclaw.json|g" -e "s|__LOG_DIR__|$runtime_dir/logs|g" -e "s|__RUNNER_PATH__|$script_dir/run-bridge.sh|g" -e "s|__BRIDGE_ENTRYPOINT__|$script_dir/../dist/index.js|g" -e "s|__NODE_BINARY__|/usr/local/bin/node|g" -e "s|__OPENCLAW_BINARY__|/usr/local/bin/openclaw|g" "$template" > "$target"
  if rg -q '__[A-Z_]+__' "$target" || ! plutil -lint "$target" >/dev/null; then
    rm -f "$target"
    echo "template rendering failed validation" >&2
    exit 67
  fi
done
echo "Rendered review-only launchd files in $output_dir; no job was loaded."
