#!/bin/bash
# SessionStart Hook: Show current task focus and loop status
# What: Runs when session starts, resumes, or after compacting
# Why: Immediately see what to work on - autonomous mode
#
# Triggers: startup, resume, compact, clear

# ============================================
# SOURCE SHARED HELPERS (DRY - single source of truth)
# This sets $_PROJECT_DIR, LOOP_STATE_FILE, TODO_FILE
# ============================================
# Find the script's directory to locate loop-helper.sh
_SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")" && pwd)"
if [[ -f "$_SCRIPT_DIR/lib/loop-helper.sh" ]]; then
  source "$_SCRIPT_DIR/lib/loop-helper.sh"
else
  # Fallback: try relative to git root
  _GIT_ROOT="$(git rev-parse --show-toplevel 2>/dev/null)"
  if [[ -f "$_GIT_ROOT/.claude/hooks/lib/loop-helper.sh" ]]; then
    source "$_GIT_ROOT/.claude/hooks/lib/loop-helper.sh"
  fi
fi

# ============================================
# SESSION ID GENERATION
# Creates unique ID for multi-instance safety
# ============================================
STATE_DIR="$_PROJECT_DIR/.claude/state"
mkdir -p "$STATE_DIR" 2>/dev/null

# Generate unique session ID (PID + timestamp)
CLAUDE_SESSION_ID="${PPID:-$$}_$(date +%s)"
echo "$CLAUDE_SESSION_ID" > "$STATE_DIR/current-session-id"

# Clear this session's tracking file (fresh start)
rm -f "$STATE_DIR/session-$CLAUDE_SESSION_ID.txt"

# Cleanup old session files (older than 1 day)
find "$STATE_DIR" -name "session-*.txt" -mtime +1 -delete 2>/dev/null || true

# ============================================
# DISPLAY LOOP STATUS
# (loop-helper.sh already sourced at top - provides all functions)
# ============================================
if [[ -f "$LOOP_STATE_FILE" ]]; then
  LOOP_ACTIVE=$(jq -r '.active // false' "$LOOP_STATE_FILE" 2>/dev/null)

  if [[ "$LOOP_ACTIVE" == "true" ]]; then
    # Active loop - show status and reinject auto-loop context
    ELAPSED=$(get_elapsed_formatted 2>/dev/null || echo "unknown")
    MAX_HOURS=$(jq -r '.maxHours // 5' "$LOOP_STATE_FILE")
    ITERATIONS=$(jq -r '.iterationCount // 0' "$LOOP_STATE_FILE")
    COMPLETED=$(jq -r '.tasksCompleted // 0' "$LOOP_STATE_FILE")

    # Get current task info using helper functions (DRY)
    # TODO_FILE already set by loop-helper.sh
    CURRENT_TASK=""
    NEXT_READY=""
    if [[ -f "$TODO_FILE" ]]; then
      # Use helper functions for consistent pattern matching
      CURRENT_TASK=$(get_current_task 2>/dev/null || echo "")
      NEXT_READY=$(get_first_ready_task 2>/dev/null || echo "")
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
# Use helper functions for DRY pattern matching
# TODO_FILE already set by loop-helper.sh
# ============================================
if [ ! -f "$TODO_FILE" ]; then
  exit 0
fi

# Use helper functions if available, fall back to direct grep
if type -t get_current_task >/dev/null 2>&1; then
  CURRENT_TASK=$(get_current_task 2>/dev/null || echo "")
  READY_COUNT=$(count_ready_tasks 2>/dev/null || echo "0")
  FIRST_READY=$(get_first_ready_task 2>/dev/null || echo "")
else
  # Fallback patterns that match loop-helper.sh format
  CURRENT_TASK=$(grep -v '^<!--' "$TODO_FILE" 2>/dev/null | grep -E '^-?\s*\[→\]' | head -1 | sed 's/.*\[→\] //' | sed 's/\*\*//g')
  READY_COUNT=$(grep -v '^<!--' "$TODO_FILE" 2>/dev/null | grep -cE '^-?\s*\[ \]' 2>/dev/null || echo "0")
  FIRST_READY=$(grep -v '^<!--' "$TODO_FILE" 2>/dev/null | grep -E '^-?\s*\[ \]' | head -1 | sed 's/.*\[ \] //')
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [[ -n "$CURRENT_TASK" ]]; then
  echo "CURRENT TASK: $CURRENT_TASK"
else
  echo "NO TASK IN PROGRESS"
fi

echo "   $READY_COUNT tasks ready in TODO.md"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Show first ready task if no current task
if [[ "$READY_COUNT" -gt 0 ]] && [[ -z "$CURRENT_TASK" ]] && [[ -n "$FIRST_READY" ]]; then
  echo "Next ready: $FIRST_READY"
  echo ""
fi

exit 0
