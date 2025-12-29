#!/bin/bash
# Stop Hook: Autonomous Task Continuation
# What: Blocks until all TODO.md tasks are complete
# Why: Enables autonomous work - Claude keeps going until done

# Source shared utilities
source "$CLAUDE_PROJECT_DIR/.claude/hooks/lib/common.sh"

TODO_FILE="$CLAUDE_PROJECT_DIR/TODO.md"

# ============================================
# CHECK 1: Frontend Changes → Auto-Document
# ============================================
if [[ -f "$FRONTEND_CHANGES_FILE" ]] && [[ -s "$FRONTEND_CHANGES_FILE" ]]; then
  CHANGE_COUNT=$(get_tracked_count "$FRONTEND_CHANGES_FILE")
  echo "" >&2
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" >&2
  echo "AUTO-DOCUMENTING $CHANGE_COUNT frontend changes..." >&2
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" >&2
  cat "$FRONTEND_CHANGES_FILE" | sed 's/^/  → /' >&2
  echo "" >&2

  # Run the screenshot/changelog script
  cd "$CLAUDE_PROJECT_DIR/app" && npm run screenshot:affected 2>&1 | sed 's/^/  /' >&2
  SCREENSHOT_EXIT=$?

  if [[ $SCREENSHOT_EXIT -eq 0 ]]; then
    # Success - clear tracking file
    rm -f "$FRONTEND_CHANGES_FILE"
    echo "" >&2
    echo "✅ Documentation generated. Changelog template ready for review." >&2
    echo "" >&2
  else
    # Failed - still clear tracking to avoid infinite loop, but warn
    rm -f "$FRONTEND_CHANGES_FILE"
    echo "" >&2
    echo "⚠️  Screenshot capture failed (exit $SCREENSHOT_EXIT)" >&2
    echo "   Changelog template created but may need manual screenshots." >&2
    echo "" >&2
  fi
fi

# ============================================
# CHECK 2: Uncommitted Changes
# ============================================
UNCOMMITTED=$(cd "$CLAUDE_PROJECT_DIR" && git status --porcelain 2>/dev/null | wc -l | tr -d ' ')
if [[ "$UNCOMMITTED" -gt 0 ]]; then
  echo "" >&2
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" >&2
  echo "UNCOMMITTED CHANGES - Run /dac before continuing" >&2
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" >&2
  exit 2
fi

# ============================================
# CHECK 3: Task Continuation (autonomous loop)
# ============================================
if [[ -f "$TODO_FILE" ]]; then
  # Parse task markers from In Progress section
  # [→] = in progress, [ ] = ready, [x] = done, [!] = blocked
  IN_PROGRESS=$(grep -E '^\[→\].*\*\*' "$TODO_FILE" | head -1)
  READY_TASKS=$(grep -E '^\[ \].*\*\*' "$TODO_FILE" || true)
  if [[ -z "$READY_TASKS" ]]; then
    READY_COUNT=0
  else
    READY_COUNT=$(echo "$READY_TASKS" | wc -l | tr -d ' ')
  fi

  # Task in progress - keep working
  if [[ -n "$IN_PROGRESS" ]]; then
    TASK_NAME=$(echo "$IN_PROGRESS" | sed 's/\[→\] \*\*\([^*]*\)\*\*.*/\1/')
    echo "" >&2
    echo "═══════════════════════════════════════════════════════" >&2
    echo "IN PROGRESS: $TASK_NAME" >&2
    echo "═══════════════════════════════════════════════════════" >&2
    echo "" >&2
    echo "Complete this task, mark [x], run /dac, then continue." >&2
    exit 2
  fi

  # Ready tasks exist - BLOCK until handled
  if [[ "$READY_COUNT" -gt 0 ]]; then
    NEXT_TASK=$(echo "$READY_TASKS" | head -1)
    TASK_NAME=$(echo "$NEXT_TASK" | sed 's/\[ \] \*\*\([^*]*\)\*\*.*/\1/')
    echo "" >&2
    echo "═══════════════════════════════════════════════════════" >&2
    echo "NEXT TASK: $TASK_NAME ($READY_COUNT remaining)" >&2
    echo "═══════════════════════════════════════════════════════" >&2
    echo "" >&2
    echo "Mark [ ] as [→] to start, or [!] to skip." >&2
    exit 2
  fi
fi

# All checks passed - allow stop
echo "" >&2
echo "All TODO.md tasks complete. Clean exit." >&2
exit 0
