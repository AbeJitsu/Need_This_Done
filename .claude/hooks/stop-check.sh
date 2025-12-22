#!/bin/bash
# Stop Hook: Ensure TODO.md and README.md are properly maintained
# What: Checks for completed items in TODO.md that should be moved to README.md
# Why: TODO.md should only have in-progress/pending tasks; completed work goes to README.md

TODO_FILE="$CLAUDE_PROJECT_DIR/TODO.md"

if [ -f "$TODO_FILE" ]; then
  # Count completed items in Recently Completed section
  COMPLETED=$(grep -c "^\- \[x\]" "$TODO_FILE" 2>/dev/null || echo "0")

  # Count COMPLETE sections that might need moving to README
  COMPLETE_SECTIONS=$(grep -c "✅ COMPLETE" "$TODO_FILE" 2>/dev/null || echo "0")

  if [ "$COMPLETED" -gt 10 ] || [ "$COMPLETE_SECTIONS" -gt 5 ]; then
    echo ""
    echo "🧹 ACTION REQUIRED: Clean up documentation before stopping."
    echo ""
    echo "TODO.md has $COMPLETE_SECTIONS completed sections and $COMPLETED checked items."
    echo ""
    echo "Please do the following:"
    echo "1. Move production-ready completed features from TODO.md to README.md"
    echo "2. Keep only the 5-7 most recent completions in TODO.md"
    echo "3. Remove older completed items that are already documented"
    echo ""
  fi
fi

exit 0
