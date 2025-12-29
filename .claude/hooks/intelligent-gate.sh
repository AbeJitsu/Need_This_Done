#!/bin/bash
# ============================================================================
# INTELLIGENT GATE HOOK
# ============================================================================
# Purpose: Let Claude work autonomously while blocking risky operations
#
# Decision Matrix:
#   BLOCK (exit 2)  → Dangerous or needs human approval
#   ALLOW (exit 0)  → Safe to proceed
#   LOG ONLY        → Proceed but record for audit
#
# Philosophy: If it's reversible and follows project rules, allow it.
# ============================================================================

set -euo pipefail

# Read JSON input from stdin
input=$(cat)
tool_name=$(echo "$input" | jq -r '.tool_name // "unknown"')
tool_input=$(echo "$input" | jq -r '.tool_input // {}')

# Extract specific fields based on tool type
case "$tool_name" in
  "Bash")
    command=$(echo "$tool_input" | jq -r '.command // ""')
    ;;
  "Edit"|"Write")
    file_path=$(echo "$tool_input" | jq -r '.file_path // ""')
    ;;
  *)
    # Unknown tool, allow by default
    exit 0
    ;;
esac

# ============================================================================
# BASH COMMAND DECISIONS
# ============================================================================
if [[ "$tool_name" == "Bash" ]]; then

  # -------------------------------------------------------------------------
  # BLOCK: Package management (new deps need approval)
  # -------------------------------------------------------------------------
  if [[ "$command" =~ npm[[:space:]]install[[:space:]] ]] && \
     [[ ! "$command" =~ npm[[:space:]]install$ ]]; then
    # npm install with args = new package
    echo '{"decision":"block","reason":"New package installation requires approval. Run npm install without args, or ask user to approve the new dependency."}' | jq -c
    exit 0
  fi

  # -------------------------------------------------------------------------
  # BLOCK: Destructive operations
  # -------------------------------------------------------------------------
  if [[ "$command" =~ rm[[:space:]]+-rf[[:space:]]+[^[:space:]]+ ]] && \
     [[ ! "$command" =~ node_modules ]] && \
     [[ ! "$command" =~ \.next ]] && \
     [[ ! "$command" =~ dist ]]; then
    echo '{"decision":"block","reason":"Destructive rm -rf blocked. Only node_modules, .next, and dist can be removed."}' | jq -c
    exit 0
  fi

  # -------------------------------------------------------------------------
  # BLOCK: Database operations without explicit approval
  # -------------------------------------------------------------------------
  if [[ "$command" =~ supabase[[:space:]]db[[:space:]]reset ]] || \
     [[ "$command" =~ DROP[[:space:]]TABLE ]] || \
     [[ "$command" =~ TRUNCATE ]]; then
    echo '{"decision":"block","reason":"Database destructive operations require explicit user approval."}' | jq -c
    exit 0
  fi

  # -------------------------------------------------------------------------
  # ALLOW: Test commands (always safe)
  # -------------------------------------------------------------------------
  if [[ "$command" =~ npm[[:space:]]run[[:space:]]test ]] || \
     [[ "$command" =~ npx[[:space:]]playwright ]] || \
     [[ "$command" =~ npx[[:space:]]vitest ]] || \
     [[ "$command" =~ npm[[:space:]]run[[:space:]]lint ]]; then
    # Log but allow
    echo "ALLOW: Test command" >&2
    exit 0
  fi

  # -------------------------------------------------------------------------
  # ALLOW: Dev/Build commands (safe, reversible)
  # -------------------------------------------------------------------------
  if [[ "$command" =~ npm[[:space:]]run[[:space:]]dev ]] || \
     [[ "$command" =~ npm[[:space:]]run[[:space:]]build ]] || \
     [[ "$command" =~ npm[[:space:]]run[[:space:]]start ]]; then
    echo "ALLOW: Dev/build command" >&2
    exit 0
  fi

  # -------------------------------------------------------------------------
  # ALLOW: Git operations (already filtered by permissions)
  # -------------------------------------------------------------------------
  if [[ "$command" =~ ^git[[:space:]] ]]; then
    echo "ALLOW: Git command" >&2
    exit 0
  fi

  # -------------------------------------------------------------------------
  # ALLOW: Read-only commands
  # -------------------------------------------------------------------------
  if [[ "$command" =~ ^(ls|cat|head|tail|grep|find|pwd|echo|which|type) ]]; then
    exit 0
  fi

fi

# ============================================================================
# FILE EDIT/WRITE DECISIONS
# ============================================================================
if [[ "$tool_name" == "Edit" || "$tool_name" == "Write" ]]; then

  # -------------------------------------------------------------------------
  # BLOCK: Sensitive files (redundant with deny list, but defense in depth)
  # -------------------------------------------------------------------------
  if [[ "$file_path" =~ \.env ]] || \
     [[ "$file_path" =~ secrets\. ]] || \
     [[ "$file_path" =~ credentials\.json ]] || \
     [[ "$file_path" =~ \.pem$ ]] || \
     [[ "$file_path" =~ \.key$ ]]; then
    echo '{"decision":"block","reason":"Sensitive file modification blocked."}' | jq -c
    exit 0
  fi

  # -------------------------------------------------------------------------
  # BLOCK: Core infrastructure without careful review
  # -------------------------------------------------------------------------
  if [[ "$file_path" =~ app/api/.*/(stripe|payment) ]] || \
     [[ "$file_path" =~ lib/stripe ]] || \
     [[ "$file_path" =~ middleware\.ts$ ]]; then
    echo '{"decision":"block","reason":"Payment/auth infrastructure changes require explicit approval. Describe the change and ask user to approve."}' | jq -c
    exit 0
  fi

  # -------------------------------------------------------------------------
  # ALLOW: Test files (always safe to modify)
  # -------------------------------------------------------------------------
  if [[ "$file_path" =~ \.(test|spec)\.(ts|tsx|js|jsx)$ ]] || \
     [[ "$file_path" =~ __tests__/ ]] || \
     [[ "$file_path" =~ /e2e/ ]]; then
    echo "ALLOW: Test file" >&2
    exit 0
  fi

  # -------------------------------------------------------------------------
  # ALLOW: Component files (core work)
  # -------------------------------------------------------------------------
  if [[ "$file_path" =~ /components/ ]] || \
     [[ "$file_path" =~ /hooks/ ]] || \
     [[ "$file_path" =~ /lib/ ]] || \
     [[ "$file_path" =~ /context/ ]]; then
    echo "ALLOW: Component/hook/lib file" >&2
    exit 0
  fi

  # -------------------------------------------------------------------------
  # ALLOW: Content and config
  # -------------------------------------------------------------------------
  if [[ "$file_path" =~ /content/ ]] || \
     [[ "$file_path" =~ \.claude/ ]] || \
     [[ "$file_path" =~ \.md$ ]]; then
    echo "ALLOW: Content/config file" >&2
    exit 0
  fi

fi

# ============================================================================
# DEFAULT: Allow (trust Claude's judgment for unlisted operations)
# ============================================================================
exit 0
