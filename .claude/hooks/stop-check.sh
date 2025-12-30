#!/bin/bash
# ============================================================================
# Stop Hook: Session Status & Auto-Loop Management
# ============================================================================
# What: Manages session exit and autonomous loop continuation
# Why: Enables hours of uninterrupted autonomous work
#
# Behavior:
#   - Blocks on uncommitted changes (always)
#   - If loop active: checks limits, completion, or re-feeds prompt
#   - If loop inactive: shows status and exits normally

# Source shared utilities
source "$CLAUDE_PROJECT_DIR/.claude/hooks/lib/common.sh"

# Source loop helper if it exists
LOOP_HELPER="$CLAUDE_PROJECT_DIR/.claude/hooks/lib/loop-helper.sh"
if [[ -f "$LOOP_HELPER" ]]; then
  source "$LOOP_HELPER"
fi

TODO_FILE="$CLAUDE_PROJECT_DIR/TODO.md"

# ============================================================================
# CHECK 1: Uncommitted Changes (Session-Specific)
# BLOCKS - only for files THIS session modified
# ============================================================================
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

# ============================================================================
# CHECK 2: Auto-Loop Mode
# If loop is active, manage continuation
# ============================================================================
if type is_loop_active &>/dev/null && is_loop_active; then

  # Increment iteration count
  increment_iteration

  # --------------------------------------------
  # CHECK 2a: Time Limit
  # --------------------------------------------
  if is_time_limit_exceeded; then
    echo "" >&2
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" >&2
    echo "⏸️  LOOP PAUSED: TIME LIMIT" >&2
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" >&2
    echo "" >&2
    generate_summary >&2
    echo "" >&2
    echo "State saved. Run /auto-loop to resume." >&2
    echo "" >&2

    # Mark loop as paused (not deleted - can resume)
    end_loop
    exit 0
  fi

  # --------------------------------------------
  # CHECK 2b: All Tasks Complete
  # --------------------------------------------
  if all_tasks_complete; then
    echo "" >&2
    echo "All tasks complete. Running E2E tests to verify..." >&2

    # Run critical E2E tests (field-editability ~20s, not full suite ~27min)
    # SKIP_WEBSERVER=true reuses existing dev server instead of starting new one
    cd "$CLAUDE_PROJECT_DIR/app"
    if SKIP_WEBSERVER=true npx playwright test e2e/field-editability.spec.ts --project=e2e-bypass >/dev/null 2>&1; then
      echo "" >&2
      echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" >&2
      echo "✅ LOOP COMPLETE - ALL TESTS PASS" >&2
      echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" >&2
      echo "" >&2
      generate_summary >&2
      echo "" >&2
      echo "🎉 Great work! All tasks done and verified." >&2
      echo "" >&2

      # Clean up loop state
      delete_loop_state
      exit 0
    else
      echo "" >&2
      echo "⚠️  Tests failed. Continuing to fix..." >&2
      echo "" >&2
      # Fall through to continue loop
    fi
  fi

  # --------------------------------------------
  # CHECK 2c: Continue Loop
  # Block exit and re-feed prompt with specific next task
  # --------------------------------------------
  ITERATION=$(get_iteration_count)
  ELAPSED=$(get_elapsed_formatted)
  READY=$(count_ready_tasks)
  BLOCKED=$(count_blocked_tasks)
  IN_PROG=$(count_in_progress_tasks)

  # Get the specific next task to work on
  CURRENT_TASK=$(get_current_task)
  NEXT_READY=$(get_first_ready_task)

  echo "" >&2
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" >&2
  echo "🔄 LOOP ACTIVE - Iteration $ITERATION ($ELAPSED)" >&2
  echo "   Tasks: $READY ready, $IN_PROG in progress, $BLOCKED blocked" >&2
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" >&2
  echo "" >&2

  # Show the specific next action
  if [[ -n "$CURRENT_TASK" ]]; then
    echo "📌 CONTINUE: $CURRENT_TASK" >&2
    echo "" >&2
    echo "This task is in progress. Complete it using TDD:" >&2
    echo "  1. Write/run failing test" >&2
    echo "  2. Make it pass" >&2
    echo "  3. Mark [x] in TODO.md and run /dac" >&2
  elif [[ -n "$NEXT_READY" ]]; then
    echo "📌 NEXT TASK: $NEXT_READY" >&2
    echo "" >&2
    echo "Mark this task [→] in TODO.md and start with TDD:" >&2
    echo "  1. Write a failing test first" >&2
    echo "  2. Make it pass" >&2
    echo "  3. Mark [x] and run /dac when done" >&2
  else
    echo "No tasks found. Check TODO.md for blocked [!] items." >&2
  fi

  echo "" >&2

  # Block exit - Claude will see this message and continue
  exit 2
fi

# ============================================================================
# INFO: Quick Status (non-blocking, when not in loop)
# ============================================================================
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
  IN_PROGRESS=$(grep -v '^<!--' "$TODO_FILE" | grep -E '^-?\s*\[→\]' | head -1)
  if [[ -n "$IN_PROGRESS" ]]; then
    TASK_NAME=$(echo "$IN_PROGRESS" | sed 's/.*\[→\] //' | sed 's/\*\*//g')
    echo "📌 Task: $TASK_NAME" >&2
  fi
fi

# All good - normal exit
exit 0
