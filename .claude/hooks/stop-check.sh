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
CHANGELOG_FILE=""
if [[ -f "$FRONTEND_CHANGES_FILE" ]] && [[ -s "$FRONTEND_CHANGES_FILE" ]]; then
  CHANGE_COUNT=$(get_tracked_count "$FRONTEND_CHANGES_FILE")
  echo "" >&2
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" >&2
  echo "AUTO-DOCUMENTING $CHANGE_COUNT frontend changes..." >&2
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" >&2
  cat "$FRONTEND_CHANGES_FILE" | sed 's/^/  → /' >&2
  echo "" >&2

  # Check if dev server is running
  if curl -s --max-time 2 http://localhost:3000 >/dev/null 2>&1; then
    # Dev server running - full screenshot capture
    echo "  Dev server detected. Capturing screenshots..." >&2
    SCREENSHOT_OUTPUT=$(cd "$CLAUDE_PROJECT_DIR/app" && npm run screenshot:affected 2>&1)
    SCREENSHOT_EXIT=$?
    echo "$SCREENSHOT_OUTPUT" | sed 's/^/  /' >&2

    # Extract changelog file path from output
    CHANGELOG_FILE=$(echo "$SCREENSHOT_OUTPUT" | grep "FILE:" | sed 's/.*FILE: //')

    if [[ $SCREENSHOT_EXIT -eq 0 ]]; then
      rm -f "$FRONTEND_CHANGES_FILE"
      echo "" >&2
      echo "✅ Screenshots + changelog template generated." >&2
    else
      rm -f "$FRONTEND_CHANGES_FILE"
      echo "" >&2
      echo "⚠️  Screenshot capture failed. Changelog template created." >&2
    fi
  else
    # No dev server - create changelog template only
    echo "  No dev server at localhost:3000. Creating changelog template..." >&2
    SCREENSHOT_OUTPUT=$(cd "$CLAUDE_PROJECT_DIR/app" && npx tsx scripts/screenshot-affected.ts --skip-playwright 2>&1)
    echo "$SCREENSHOT_OUTPUT" | sed 's/^/  /' >&2
    CHANGELOG_FILE=$(echo "$SCREENSHOT_OUTPUT" | grep "FILE:" | sed 's/.*FILE: //')
    rm -f "$FRONTEND_CHANGES_FILE"
    echo "" >&2
    echo "📝 Changelog template created. Run 'npm run dev' + 'npm run screenshot:affected' for screenshots." >&2
  fi
  echo "" >&2

  # If changelog was created, prompt Claude to complete it
  if [[ -n "$CHANGELOG_FILE" ]] && [[ -f "$CLAUDE_PROJECT_DIR/$CHANGELOG_FILE" ]]; then
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" >&2
    echo "CLAUDE: Complete the changelog entry" >&2
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" >&2
    echo "" >&2
    echo "Read: $CHANGELOG_FILE" >&2
    echo "" >&2
    echo "Fill in these fields with user-friendly marketing copy:" >&2
    echo "  • description - What changed (1-2 sentences)" >&2
    echo "  • benefit - Why users will love it (1 sentence)" >&2
    echo "  • howToUse - Steps to use the feature (array of strings)" >&2
    echo "  • screenshots[].caption - Brief caption for each screenshot" >&2
    echo "" >&2
    echo "Use the _gitContext and _affectedRoutes fields for context." >&2
    echo "Then remove the underscore-prefixed fields before saving." >&2
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" >&2
    exit 2
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
