#!/bin/bash
# SessionStart Hook: Show current task focus and loop status
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

# ============================================
# LOOP STATUS CHECK
# Source loop helper if available
# ============================================
LOOP_HELPER="$CLAUDE_PROJECT_DIR/.claude/hooks/lib/loop-helper.sh"
LOOP_STATE_FILE="$CLAUDE_PROJECT_DIR/.claude/loop-state.json"

if [[ -f "$LOOP_HELPER" ]]; then
  # Temporarily disable recursion guard for sourcing
  unset CLAUDE_HOOK_RUNNING
  source "$LOOP_HELPER"
  export CLAUDE_HOOK_RUNNING=1
fi

# ============================================
# DISPLAY LOOP STATUS
# ============================================
if [[ -f "$LOOP_STATE_FILE" ]]; then
  LOOP_ACTIVE=$(jq -r '.active // false' "$LOOP_STATE_FILE" 2>/dev/null)

  if [[ "$LOOP_ACTIVE" == "true" ]]; then
    # Active loop - show status and reinject auto-loop context
    ELAPSED=$(get_elapsed_formatted 2>/dev/null || echo "unknown")
    MAX_HOURS=$(jq -r '.maxHours // 5' "$LOOP_STATE_FILE")
    ITERATIONS=$(jq -r '.iterationCount // 0' "$LOOP_STATE_FILE")
    COMPLETED=$(jq -r '.tasksCompleted // 0' "$LOOP_STATE_FILE")

    # Get current task info
    TODO_FILE="$CLAUDE_PROJECT_DIR/TODO.md"
    CURRENT_TASK=""
    NEXT_READY=""
    if [[ -f "$TODO_FILE" ]]; then
      CURRENT_TASK=$(grep -E '^\[→\]' "$TODO_FILE" | head -1 | sed 's/\[→\] //')
      NEXT_READY=$(grep -E '^\[ \]' "$TODO_FILE" | head -1 | sed 's/\[ \] //')
    fi

    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "🔄 AUTONOMOUS LOOP ACTIVE"
    echo "   Time: $ELAPSED / ${MAX_HOURS}h"
    echo "   Iterations: $ITERATIONS | Tasks completed: $COMPLETED"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""

    # Show specific task to work on
    if [[ -n "$CURRENT_TASK" ]]; then
      echo "📌 CONTINUE: $CURRENT_TASK"
      echo ""
      echo "Work autonomously using TDD:"
      echo "  1. Write/run failing test"
      echo "  2. Make it pass"
      echo "  3. Mark [x] in TODO.md and run /dac"
      echo "  4. Continue to next task (don't stop)"
    elif [[ -n "$NEXT_READY" ]]; then
      echo "📌 NEXT TASK: $NEXT_READY"
      echo ""
      echo "Mark [→] in TODO.md and work autonomously:"
      echo "  1. Write failing test first"
      echo "  2. Make it pass"
      echo "  3. Mark [x] and run /dac"
      echo "  4. Continue to next task (don't stop)"
    else
      echo "All tasks complete! Running final verification..."
    fi

    echo ""
    echo "KEY: Work continuously. Don't ask permission. Don't stop between tasks."
    echo ""
    exit 0

  elif [[ "$LOOP_ACTIVE" == "false" ]]; then
    # Paused loop - offer resume
    ITERATIONS=$(jq -r '.iterationCount // 0' "$LOOP_STATE_FILE")
    COMPLETED=$(jq -r '.tasksCompleted // 0' "$LOOP_STATE_FILE")

    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "⏸️  LOOP PAUSED"
    echo "   Previous: $ITERATIONS iterations, $COMPLETED tasks completed"
    echo "   Run /auto-loop to resume"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
  fi
fi

# ============================================
# NORMAL TASK STATUS (no active loop)
# ============================================
TODO_FILE="$CLAUDE_PROJECT_DIR/TODO.md"

if [ ! -f "$TODO_FILE" ]; then
  exit 0
fi

# Parse task markers from TODO.md
IN_PROGRESS=$(grep -E '^\[→\].*\*\*' "$TODO_FILE" | head -1)
READY_TASKS=$(grep -E '^\[ \].*\*\*' "$TODO_FILE" 2>/dev/null) || true
# Count lines directly - wc -l handles empty input correctly
if [[ -n "$READY_TASKS" ]]; then
  READY_COUNT=$(echo "$READY_TASKS" | wc -l | tr -d ' ')
else
  READY_COUNT=0
fi

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
