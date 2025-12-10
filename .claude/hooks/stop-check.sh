#!/bin/bash

# ============================================================================
# Stop Hook - Check Progress Checklist Before Stopping
# ============================================================================
# Runs when Claude is about to stop. Checks if work is complete.
# If incomplete tasks remain, prompts user to continue.

CHECKLIST_FILE="$CLAUDE_PROJECT_DIR/DRY_VIOLATIONS_CHECKLIST.md"

# Check if checklist exists
if [ ! -f "$CHECKLIST_FILE" ]; then
  echo "ℹ️  No active checklist found. Safe to stop."
  exit 0
fi

# Count incomplete tasks
INCOMPLETE_COUNT=$(grep -c "^- \[ \]" "$CHECKLIST_FILE" 2>/dev/null || echo "0")
TOTAL_COUNT=$(grep -c "^- \[" "$CHECKLIST_FILE" 2>/dev/null || echo "0")
COMPLETE_COUNT=$((TOTAL_COUNT - INCOMPLETE_COUNT))

# If all tasks complete, allow stop
if [ "$INCOMPLETE_COUNT" -eq 0 ]; then
  echo "✅ All tasks complete! Safe to stop."
  echo ""
  echo "📊 Final Stats:"
  echo "   Completed: $COMPLETE_COUNT/$TOTAL_COUNT tasks"
  exit 0
fi

# If incomplete, show warning
echo "⚠️  Work is not complete!"
echo ""
echo "📊 Progress:"
echo "   Completed: $COMPLETE_COUNT/$TOTAL_COUNT tasks"
echo "   Remaining: $INCOMPLETE_COUNT tasks"
echo ""
echo "📋 Next incomplete tasks:"
grep "^- \[ \]" "$CHECKLIST_FILE" | head -5 | sed 's/^/   /'
echo ""

# Allow stop anyway (just inform user)
# Exit 0 to not block - this is informational only
exit 0
