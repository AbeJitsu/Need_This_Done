#!/usr/bin/env bash
set -euo pipefail

profile="needthisdone"
model="openai/gpt-5.6-luna"
oauth_profile="openai:needthisdone-oauth"
expected_version="2026.8.1"
script_dir="$(cd "$(dirname "$0")" && pwd)"
docker_cli_dir="/Applications/Docker.app/Contents/Resources/bin"

if ! command -v docker >/dev/null 2>&1; then
  if [[ ! -x "$docker_cli_dir/docker" ]]; then
    echo "Docker CLI is required for the fail-closed sandbox." >&2
    exit 69
  fi
  export PATH="$docker_cli_dir:$PATH"
fi
if ! docker version --format '{{.Server.Version}}' >/dev/null 2>&1; then
  echo "Docker Desktop must be running before the proof starts." >&2
  exit 69
fi

if [[ $# -ne 1 ]] || [[ "$1" != /* ]]; then
  echo "usage: $0 ABSOLUTE_EVIDENCE_DIRECTORY" >&2
  exit 64
fi
evidence_dir="$1"
if [[ "$evidence_dir" == *$'\n'* ]]; then
  echo "evidence directory must be a single-line absolute path" >&2
  exit 64
fi
: "${OPENCLAW_GATEWAY_TOKEN:?Set a new random OPENCLAW_GATEWAY_TOKEN in this shell only.}"
if (( ${#OPENCLAW_GATEWAY_TOKEN} < 32 )); then
  echo "OPENCLAW_GATEWAY_TOKEN must contain at least 32 characters." >&2
  exit 65
fi
if [[ "$(openclaw --version)" != *"$expected_version"* ]]; then
  echo "OpenClaw $expected_version is required." >&2
  exit 66
fi

mkdir -p "$evidence_dir"
chmod 700 "$evidence_dir"
umask 077

config_path="$(openclaw --profile "$profile" config file | tail -n 1)"
openclaw --profile "$profile" config validate
openclaw --profile "$profile" models auth list --provider openai --json > "$evidence_dir/auth-list.raw.json"
node "$script_dir/verify-profile.mjs" "$config_path" "$evidence_dir/auth-list.raw.json" > "$evidence_dir/profile.json"

openclaw --profile "$profile" models status --check > "$evidence_dir/model-status-check.raw.txt" 2>&1
openclaw --profile "$profile" models status --probe --probe-provider openai --probe-profile "$oauth_profile" --probe-max-tokens 16 --json \
  > "$evidence_dir/model-status.raw.json" 2> "$evidence_dir/model-status.stderr.raw.log"
node "$script_dir/verify-results.mjs" status "$evidence_dir/model-status.raw.json" "$evidence_dir/model-status-check.raw.txt" > "$evidence_dir/model-status.json"
openclaw --profile "$profile" models list --provider openai --json > "$evidence_dir/model-catalog.raw.json"
node "$script_dir/verify-results.mjs" catalog "$evidence_dir/model-catalog.raw.json" > "$evidence_dir/catalog.json"
openclaw --profile "$profile" plugins info duckduckgo --json > "$evidence_dir/search-plugin.raw.json"
node "$script_dir/verify-results.mjs" plugin "$evidence_dir/search-plugin.raw.json" > "$evidence_dir/search-plugin.json"

env -u OPENAI_API_KEY -u OPENROUTER_API_KEY -u CODEX_API_KEY \
  openclaw --profile "$profile" infer model run --local --model "$model" --thinking max \
  --prompt 'Reply with exactly NEEDTHISDONE_LUNA_MAX_OK and nothing else.' --json \
  > "$evidence_dir/direct-inference.raw.json"
node "$script_dir/verify-results.mjs" inference "$evidence_dir/direct-inference.raw.json" NEEDTHISDONE_LUNA_MAX_OK > "$evidence_dir/direct-inference.json"

env -u OPENAI_API_KEY -u OPENROUTER_API_KEY -u CODEX_API_KEY \
  openclaw --profile "$profile" gateway run --bind loopback --auth token --port 18789 \
  > "$evidence_dir/gateway.log" 2> "$evidence_dir/gateway.error.log" &
gateway_pid=$!
cleanup() {
  kill "$gateway_pid" 2>/dev/null || true
  wait "$gateway_pid" 2>/dev/null || true
}
trap cleanup EXIT INT TERM

ready=0
for _ in {1..30}; do
  if openclaw --profile "$profile" gateway status --require-rpc --json > "$evidence_dir/gateway-status.raw.json" 2>/dev/null; then
    ready=1
    break
  fi
  sleep 1
done
if [[ "$ready" -ne 1 ]]; then
  echo "loopback gateway did not become ready" >&2
  exit 67
fi
node "$script_dir/verify-results.mjs" gateway "$evidence_dir/gateway-status.raw.json" > "$evidence_dir/gateway-status.json"
env -u OPENAI_API_KEY -u OPENROUTER_API_KEY -u CODEX_API_KEY \
  node "$script_dir/probe-forbidden.mjs" http://127.0.0.1:18789 \
  > "$evidence_dir/live-forbidden.raw.json"
node "$script_dir/verify-results.mjs" live-forbidden "$evidence_dir/live-forbidden.raw.json" > "$evidence_dir/live-forbidden.json"

env -u OPENAI_API_KEY -u OPENROUTER_API_KEY -u CODEX_API_KEY \
  openclaw --profile "$profile" infer model run --gateway --model "$model" --thinking max \
  --prompt 'Reply with exactly NEEDTHISDONE_GATEWAY_LUNA_MAX_OK and nothing else.' --json \
  > "$evidence_dir/gateway-inference.raw.json"
node "$script_dir/verify-results.mjs" inference "$evidence_dir/gateway-inference.raw.json" NEEDTHISDONE_GATEWAY_LUNA_MAX_OK > "$evidence_dir/gateway-inference.json"

env -u OPENAI_API_KEY -u OPENROUTER_API_KEY -u CODEX_API_KEY \
  openclaw --profile "$profile" agent --agent main --model "$model" --thinking max --json \
  --message 'Research the current official OpenAI description of GPT-5.6 Luna using only public web_search and web_fetch. Return two concise factual bullets with direct HTTPS citations. Do not use any other tool.' \
  > "$evidence_dir/public-web.raw.json"
node "$script_dir/verify-results.mjs" research "$evidence_dir/public-web.raw.json" > "$evidence_dir/public-web.json"

openclaw --profile "$profile" sandbox explain --agent main --json > "$evidence_dir/effective-policy.raw.json"
node "$script_dir/verify-results.mjs" policy "$evidence_dir/effective-policy.raw.json" > "$evidence_dir/effective-policy.json"

openclaw --profile "$profile" security audit --deep --json > "$evidence_dir/security-audit.raw.json"
node "$script_dir/verify-results.mjs" security "$evidence_dir/security-audit.raw.json" > "$evidence_dir/security-audit.json"

node "$script_dir/verify-results.mjs" forbidden "$config_path" > "$evidence_dir/forbidden-actions.json"
node "$script_dir/verify-results.mjs" bundle "$evidence_dir" > "$evidence_dir/summary.json"

rm -f "$evidence_dir/auth-list.raw.json" "$evidence_dir/model-status.raw.json" \
  "$evidence_dir/model-catalog.raw.json" "$evidence_dir/search-plugin.raw.json" \
  "$evidence_dir/direct-inference.raw.json" \
  "$evidence_dir/model-status-check.raw.txt" \
  "$evidence_dir/model-status.stderr.raw.log" \
  "$evidence_dir/gateway-status.raw.json" "$evidence_dir/gateway-inference.raw.json" \
  "$evidence_dir/live-forbidden.raw.json" \
  "$evidence_dir/public-web.raw.json" "$evidence_dir/effective-policy.raw.json" \
  "$evidence_dir/security-audit.raw.json" "$evidence_dir/gateway.log" \
  "$evidence_dir/gateway.error.log"
chmod 600 "$evidence_dir"/*
echo "Redacted proof evidence written to $evidence_dir/summary.json"
