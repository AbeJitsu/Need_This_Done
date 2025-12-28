#!/bin/bash
# Stop Hook: Ensure TODO.md is maintained before stopping
# What: Checks that TODO.md reflects session work
# Why: Prevents losing track of progress or leaving stale items
#
# Checks:
#   1. Too many completed items (>7) - should move to README.md

TODO_FILE="$CLAUDE_PROJECT_DIR/TODO.md"

# If no TODO file, nothing to check
if [ ! -f "$TODO_FILE" ]; then
  exit 0
fi

ERRORS=""

# Check: Too many completed items in TODO.md (should document in README)
COMPLETED_COUNT=$(grep -c "^\- \[x\]" "$TODO_FILE" 2>/dev/null || echo "0")
if [ "$COMPLETED_COUNT" -gt 7 ]; then
  ERRORS="${ERRORS}\n- $COMPLETED_COUNT completed items in TODO.md"
  ERRORS="${ERRORS}\n  Move production-ready features to README.md"
fi

# If there are errors, block the stop
if [ -n "$ERRORS" ]; then
  echo "" >&2
  echo "TODO.md CLEANUP NEEDED:" >&2
  echo -e "$ERRORS" >&2
  echo "" >&2
  echo "Flow: TODO.md → README.md (when production-ready)" >&2
  echo "" >&2
  exit 2
fi

# ============================================================================
# CRITICAL: Frontend changes require screenshots for verification
# ============================================================================
# Check tracking file from frontend-change-detector hook
TRACKING_FILE="$CLAUDE_PROJECT_DIR/.claude/frontend-changes.txt"

if [ -f "$TRACKING_FILE" ] && [ -s "$TRACKING_FILE" ]; then
  echo "" >&2
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" >&2
  echo "⚠️  SCREENSHOTS REQUIRED - Frontend files were modified" >&2
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" >&2
  echo "" >&2
  echo "Changed files:" >&2
  cat "$TRACKING_FILE" | sed 's/^/  → /' >&2
  echo "" >&2
  echo "Before committing, run:" >&2
  echo "  /document   (captures screenshots + changelog)" >&2
  echo "" >&2
  echo "Or manually:" >&2
  echo "  cd app && npm run screenshot:affected" >&2
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" >&2
  echo "" >&2

  # Block until screenshots are taken (exit 2 = blocking)
  exit 2
fi

# Also check git diff for any uncommitted frontend changes
FRONTEND_FILES=$(cd "$CLAUDE_PROJECT_DIR" && git diff --name-only 2>/dev/null | grep -E '^app/(app|components)/.*\.tsx$|\.css$|colors\.ts$' | head -5)

if [ -n "$FRONTEND_FILES" ]; then
  echo "" >&2
  echo "📸 Frontend changes detected - consider running /document" >&2
  echo "" >&2
fi

exit 0
