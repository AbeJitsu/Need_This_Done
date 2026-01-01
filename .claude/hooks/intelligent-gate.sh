#!/bin/bash
# ============================================================================
# INTELLIGENT GATE HOOK
# ============================================================================
# Purpose: Additional safety checks beyond settings.json
#
# Note: Primary permissions are defined in settings.json (allow/deny lists)
# This hook only handles edge cases that can't be expressed in settings.json:
# - Database destructive operations (need pattern matching on SQL)
# - Payment infrastructure (extra caution layer)
#
# Philosophy: settings.json is the source of truth. This is defense-in-depth.
# ============================================================================

set -euo pipefail

# Read JSON input from stdin
input=$(cat)
tool_name=$(echo "$input" | jq -r '.tool_name // "unknown"')
tool_input=$(echo "$input" | jq -r '.tool_input // {}')

# Only check Bash commands for database operations
if [[ "$tool_name" == "Bash" ]]; then
  command=$(echo "$tool_input" | jq -r '.command // ""')

  # BLOCK: Database destructive operations (can't express in settings.json patterns)
  if [[ "$command" =~ supabase[[:space:]]db[[:space:]]reset ]] || \
     [[ "$command" =~ DROP[[:space:]]TABLE ]] || \
     [[ "$command" =~ TRUNCATE ]]; then
    echo '{"decision":"block","reason":"Database destructive operations require explicit user approval."}' | jq -c
    exit 0
  fi
fi

# Only check Edit/Write for payment infrastructure
if [[ "$tool_name" == "Edit" || "$tool_name" == "Write" ]]; then
  file_path=$(echo "$tool_input" | jq -r '.file_path // ""')

  # BLOCK: Payment infrastructure (extra caution)
  if [[ "$file_path" =~ app/api/.*/(stripe|payment) ]] || \
     [[ "$file_path" =~ lib/stripe ]]; then
    echo '{"decision":"block","reason":"Payment infrastructure changes require explicit approval."}' | jq -c
    exit 0
  fi
fi

# DEFAULT: Allow (settings.json handles everything else)
exit 0
