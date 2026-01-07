#!/bin/bash
# Stop Hook: Check for uncommitted changes
# What: Runs when session ends
# Why: Remind to commit work before leaving

# Source shared utilities
_SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")" && pwd)"
if [[ -f "$_SCRIPT_DIR/lib/common.sh" ]]; then
  source "$_SCRIPT_DIR/lib/common.sh"
else
  _GIT_ROOT="$(git rev-parse --show-toplevel 2>/dev/null)"
  source "$_GIT_ROOT/.claude/hooks/lib/common.sh"
fi

# Check for uncommitted changes from this session
if [[ -f "$SESSION_CHANGES_FILE" ]] && [[ -s "$SESSION_CHANGES_FILE" ]]; then
  SESSION_UNCOMMITTED=0
  SESSION_FILES=""
  while read -r file; do
    if cd "$_PROJECT_DIR" && git status --porcelain "$file" 2>/dev/null | grep -q .; then
      SESSION_UNCOMMITTED=1
      SESSION_FILES="$SESSION_FILES\n  $file"
    fi
  done < "$SESSION_CHANGES_FILE"

  if [[ "$SESSION_UNCOMMITTED" -eq 1 ]]; then
    echo "" >&2
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" >&2
    echo "UNCOMMITTED CHANGES - Run /dac to commit" >&2
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" >&2
    echo -e "$SESSION_FILES" >&2
    exit 2
  fi
fi

exit 0
