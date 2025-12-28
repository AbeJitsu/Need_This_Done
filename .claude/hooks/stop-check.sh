#!/bin/bash
# Stop Hook: Validate before stopping
# What: Checks TODO.md cleanup, frontend screenshots, uncommitted work
# Why: Prevents stopping with broken builds or untracked progress

# Source shared utilities (includes recursion guard)
source "$CLAUDE_PROJECT_DIR/.claude/hooks/lib/common.sh"

TODO_FILE="$CLAUDE_PROJECT_DIR/TODO.md"

# ============================================
# CHECK 1: TODO.md Cleanup
# ============================================
if [[ -f "$TODO_FILE" ]]; then
  COMPLETED_COUNT=$(grep -c "^\- \[x\]" "$TODO_FILE" 2>/dev/null || echo "0")
  if [[ "$COMPLETED_COUNT" -gt 7 ]]; then
    echo "" >&2
    echo "TODO.md CLEANUP NEEDED:" >&2
    echo "- $COMPLETED_COUNT completed items in TODO.md" >&2
    echo "  Move production-ready features to README.md" >&2
    echo "" >&2
    exit 2
  fi
fi

# ============================================
# CHECK 2: Frontend Screenshots Required
# ============================================
if [[ -f "$FRONTEND_CHANGES_FILE" ]] && [[ -s "$FRONTEND_CHANGES_FILE" ]]; then
  CHANGE_COUNT=$(get_tracked_count "$FRONTEND_CHANGES_FILE")
  echo "" >&2
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" >&2
  echo "SCREENSHOTS REQUIRED - $CHANGE_COUNT frontend files modified" >&2
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" >&2
  echo "" >&2
  cat "$FRONTEND_CHANGES_FILE" | sed 's/^/  → /' >&2
  echo "" >&2
  echo "Run: /document" >&2
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" >&2
  echo "" >&2
  exit 2
fi

# ============================================
# CHECK 3: Uncommitted Changes Reminder
# ============================================
UNCOMMITTED=$(cd "$CLAUDE_PROJECT_DIR" && git status --porcelain 2>/dev/null | wc -l | tr -d ' ')

if [[ "$UNCOMMITTED" -gt 0 ]]; then
  STAGED=$(cd "$CLAUDE_PROJECT_DIR" && git diff --cached --name-only 2>/dev/null | wc -l | tr -d ' ')
  UNSTAGED=$(cd "$CLAUDE_PROJECT_DIR" && git diff --name-only 2>/dev/null | wc -l | tr -d ' ')

  echo "" >&2
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" >&2
  echo "UNCOMMITTED CHANGES DETECTED" >&2
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" >&2
  echo "" >&2
  echo "  Staged: $STAGED files" >&2
  echo "  Unstaged: $UNSTAGED files" >&2
  echo "" >&2
  echo "Run /dac to commit." >&2
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" >&2
  echo "" >&2
fi

exit 0
