#!/bin/bash
# Stop Hook: Session Status & Gentle Reminders
# What: Shows helpful status, only blocks on uncommitted changes
# Why: Keep Claude informed without disrupting flow

# Source shared utilities
source "$CLAUDE_PROJECT_DIR/.claude/hooks/lib/common.sh"

TODO_FILE="$CLAUDE_PROJECT_DIR/TODO.md"

# ============================================
# CHECK 1: Uncommitted Changes (Session-Specific)
# BLOCKS - only for files THIS session modified
# ============================================
if [[ -f "$SESSION_CHANGES_FILE" ]] && [[ -s "$SESSION_CHANGES_FILE" ]]; then
  SESSION_UNCOMMITTED=0
  SESSION_FILES=""
  while read -r file; do
    # Check if this file has uncommitted changes
    if cd "$CLAUDE_PROJECT_DIR" && git status --porcelain "$file" 2>/dev/null | grep -q .; then
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

# ============================================
# INFO: Quick Status (non-blocking)
# ============================================
echo "" >&2

# Git status - one line summary
cd "$CLAUDE_PROJECT_DIR"
STAGED=$(git diff --cached --stat 2>/dev/null | tail -1 | grep -oE '[0-9]+ file' | head -1 || echo "")
UNSTAGED=$(git diff --stat 2>/dev/null | tail -1 | grep -oE '[0-9]+ file' | head -1 || echo "")
UNTRACKED=$(git status --porcelain 2>/dev/null | grep '^??' | wc -l | tr -d ' ')

if [[ -n "$STAGED" ]] || [[ -n "$UNSTAGED" ]] || [[ "$UNTRACKED" -gt 0 ]]; then
  STATUS_PARTS=""
  [[ -n "$STAGED" ]] && STATUS_PARTS="$STAGED staged"
  [[ -n "$UNSTAGED" ]] && STATUS_PARTS="${STATUS_PARTS:+$STATUS_PARTS, }$UNSTAGED changed"
  [[ "$UNTRACKED" -gt 0 ]] && STATUS_PARTS="${STATUS_PARTS:+$STATUS_PARTS, }$UNTRACKED untracked"
  echo "📁 Git: $STATUS_PARTS" >&2
fi

# Current task from TODO.md - info only
if [[ -f "$TODO_FILE" ]]; then
  IN_PROGRESS=$(grep -E '^\[→\].*\*\*' "$TODO_FILE" | head -1)
  if [[ -n "$IN_PROGRESS" ]]; then
    TASK_NAME=$(echo "$IN_PROGRESS" | sed 's/\[→\] \*\*\([^*]*\)\*\*.*/\1/')
    echo "📌 Task: $TASK_NAME" >&2
  fi
fi

# All good
exit 0
