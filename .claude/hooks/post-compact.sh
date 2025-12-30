#!/bin/bash
# ============================================================================
# Post-Compact Hook - Restore work state after context compression
# ============================================================================
# Restores and displays work state after compaction so Claude can
# continue working without losing context.

WORK_STATE_FILE="/tmp/claude_work_state.json"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" >&2
echo "🔄 CONTEXT COMPACTED - RESTORING WORK STATE" >&2
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" >&2

# Check if we have saved state
if [ -f "$WORK_STATE_FILE" ]; then
  BRANCH=$(cat "$WORK_STATE_FILE" | grep '"branch"' | cut -d'"' -f4)
  CURRENT_TASK=$(cat "$WORK_STATE_FILE" | grep '"current_task"' | cut -d'"' -f4)
  UNCOMMITTED=$(cat "$WORK_STATE_FILE" | grep '"uncommitted_files"' | sed 's/[^0-9]//g')

  echo "" >&2
  echo "📍 WORK CONTEXT:" >&2
  echo "   Branch: $BRANCH" >&2

  if [ -n "$CURRENT_TASK" ] && [ "$CURRENT_TASK" != "" ]; then
    echo "   Active Task: $CURRENT_TASK" >&2
  fi

  if [ "$UNCOMMITTED" -gt 0 ]; then
    echo "   ⚠️  Uncommitted changes: $UNCOMMITTED files" >&2
  fi
  echo "" >&2
fi

# Show current TODO.md state
if [ -f "TODO.md" ]; then
  echo "📋 TODO.md STATUS:" >&2

  # Show in-progress tasks
  IN_PROGRESS=$(grep -E '^\[→\]' TODO.md 2>/dev/null | head -3)
  if [ -n "$IN_PROGRESS" ]; then
    echo "   In Progress:" >&2
    echo "$IN_PROGRESS" | while read -r line; do
      echo "   $line" >&2
    done
  fi

  # Count ready tasks
  READY_COUNT=$(grep -cE '^\[ \]' TODO.md 2>/dev/null || echo "0")
  echo "   Ready tasks: $READY_COUNT" >&2
fi

echo "" >&2
echo "💡 CONTINUE FROM:" >&2
echo "   1. Check TODO.md for current task" >&2
echo "   2. Run 'git status' to see uncommitted work" >&2
echo "   3. Resume working on the active task" >&2
echo "" >&2
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" >&2

exit 0
