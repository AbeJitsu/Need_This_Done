#!/bin/bash
# SessionStart Hook: Show current task focus
# What: Runs when session starts, resumes, or after compacting
# Why: Immediately see what to work on - autonomous mode
#
# Triggers: startup, resume, compact, clear

# ============================================
# SESSION ID GENERATION
# Creates unique ID for multi-instance safety
# ============================================
STATE_DIR="$CLAUDE_PROJECT_DIR/.claude/state"
mkdir -p "$STATE_DIR" 2>/dev/null

# Generate unique session ID (PID + timestamp)
CLAUDE_SESSION_ID="${PPID:-$$}_$(date +%s)"
echo "$CLAUDE_SESSION_ID" > "$STATE_DIR/current-session-id"

# Clear this session's tracking file (fresh start)
rm -f "$STATE_DIR/session-$CLAUDE_SESSION_ID.txt"

# Cleanup old session files (older than 1 day)
find "$STATE_DIR" -name "session-*.txt" -mtime +1 -delete 2>/dev/null || true

TODO_FILE="$CLAUDE_PROJECT_DIR/TODO.md"

if [ ! -f "$TODO_FILE" ]; then
  exit 0
fi

# Parse task markers from TODO.md
IN_PROGRESS=$(grep -E '^\[→\].*\*\*' "$TODO_FILE" | head -1)
READY_TASKS=$(grep -E '^\[ \].*\*\*' "$TODO_FILE")
READY_COUNT=$(echo "$READY_TASKS" | grep -c '^\[ \]' 2>/dev/null || echo 0)

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [[ -n "$IN_PROGRESS" ]]; then
  # Extract task name and description
  TASK_NAME=$(echo "$IN_PROGRESS" | sed 's/\[→\] \*\*\([^*]*\)\*\*.*/\1/')
  echo "CURRENT TASK: $TASK_NAME"
else
  echo "NO TASK IN PROGRESS"
fi

echo "   $READY_COUNT tasks ready in TODO.md"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Show ready tasks if any
if [[ "$READY_COUNT" -gt 0 ]] && [[ -z "$IN_PROGRESS" ]]; then
  echo "Ready tasks:"
  echo "$READY_TASKS" | head -3 | sed 's/\[ \] \*\*/  → /g' | sed 's/\*\*.*//g'
  echo ""
fi

exit 0
