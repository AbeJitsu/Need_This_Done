# #!/bin/bash
# # Stop Hook: Autonomous Task Continuation
# # What: Blocks until all TODO.md tasks are complete
# # Why: Enables autonomous work - Claude keeps going until done

# # Source shared utilities
# source "$CLAUDE_PROJECT_DIR/.claude/hooks/lib/common.sh"

# TODO_FILE="$CLAUDE_PROJECT_DIR/TODO.md"

# # ============================================
# # CHECK 1: Frontend Changes → Auto-Document
# # ============================================
# CHANGELOG_FILE=""
# if [[ -f "$FRONTEND_CHANGES_FILE" ]] && [[ -s "$FRONTEND_CHANGES_FILE" ]]; then
#   CHANGE_COUNT=$(get_tracked_count "$FRONTEND_CHANGES_FILE")
#   echo "" >&2
#   echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" >&2
#   echo "AUTO-DOCUMENTING $CHANGE_COUNT frontend changes..." >&2
#   echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" >&2
#   cat "$FRONTEND_CHANGES_FILE" | sed 's/^/  → /' >&2
#   echo "" >&2

#   # Check if dev server is running
#   if curl -s --max-time 2 http://localhost:3000 >/dev/null 2>&1; then
#     # Dev server running - full screenshot capture
#     echo "  Dev server detected. Capturing screenshots..." >&2
#     SCREENSHOT_OUTPUT=$(cd "$CLAUDE_PROJECT_DIR/app" && npm run screenshot:affected 2>&1)
#     SCREENSHOT_EXIT=$?
#     echo "$SCREENSHOT_OUTPUT" | sed 's/^/  /' >&2

#     # Extract changelog file path from output
#     CHANGELOG_FILE=$(echo "$SCREENSHOT_OUTPUT" | grep "FILE:" | sed 's/.*FILE: //')

#     if [[ $SCREENSHOT_EXIT -eq 0 ]]; then
#       rm -f "$FRONTEND_CHANGES_FILE"
#       echo "" >&2
#       echo "✅ Screenshots + changelog template generated." >&2
#     else
#       rm -f "$FRONTEND_CHANGES_FILE"
#       echo "" >&2
#       echo "⚠️  Screenshot capture failed. Changelog template created." >&2
#     fi
#   else
#     # No dev server - create changelog template only
#     echo "  No dev server at localhost:3000. Creating changelog template..." >&2
#     SCREENSHOT_OUTPUT=$(cd "$CLAUDE_PROJECT_DIR/app" && npx tsx scripts/screenshot-affected.ts --skip-playwright 2>&1)
#     echo "$SCREENSHOT_OUTPUT" | sed 's/^/  /' >&2
#     CHANGELOG_FILE=$(echo "$SCREENSHOT_OUTPUT" | grep "FILE:" | sed 's/.*FILE: //')
#     rm -f "$FRONTEND_CHANGES_FILE"
#     echo "" >&2
#     echo "📝 Changelog template created. Run 'npm run dev' + 'npm run screenshot:affected' for screenshots." >&2
#   fi
#   echo "" >&2

#   # If changelog was created, prompt Claude to complete it
#   if [[ -n "$CHANGELOG_FILE" ]] && [[ -f "$CLAUDE_PROJECT_DIR/$CHANGELOG_FILE" ]]; then
#     echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" >&2
#     echo "CLAUDE: Complete the changelog entry" >&2
#     echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" >&2
#     echo "" >&2
#     echo "Read: $CHANGELOG_FILE" >&2
#     echo "" >&2
#     echo "Fill in these fields with user-friendly marketing copy:" >&2
#     echo "  • description - What changed (1-2 sentences)" >&2
#     echo "  • benefit - Why users will love it (1 sentence)" >&2
#     echo "  • howToUse - Steps to use the feature (array of strings)" >&2
#     echo "  • screenshots[].caption - Brief caption for each screenshot" >&2
#     echo "" >&2
#     echo "Use the _gitContext and _affectedRoutes fields for context." >&2
#     echo "Then remove the underscore-prefixed fields before saving." >&2
#     echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" >&2
#     exit 2
#   fi
# fi

# # ============================================
# # CHECK 2: Uncommitted Changes (Session-Specific)
# # Only blocks on files THIS session modified
# # ============================================
# if [[ -f "$SESSION_CHANGES_FILE" ]] && [[ -s "$SESSION_CHANGES_FILE" ]]; then
#   SESSION_UNCOMMITTED=0
#   SESSION_FILES=""
#   while read -r file; do
#     # Check if this file has uncommitted changes
#     if cd "$CLAUDE_PROJECT_DIR" && git status --porcelain "$file" 2>/dev/null | grep -q .; then
#       SESSION_UNCOMMITTED=1
#       SESSION_FILES="$SESSION_FILES\n  $file"
#     fi
#   done < "$SESSION_CHANGES_FILE"

#   if [[ "$SESSION_UNCOMMITTED" -eq 1 ]]; then
#     echo "" >&2
#     echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" >&2
#     echo "UNCOMMITTED CHANGES (this session) - Run /dac" >&2
#     echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" >&2
#     echo -e "$SESSION_FILES" >&2
#     exit 2
#   fi
# fi
# # No session files tracked = no blocking (allows other sessions to work)

# # ============================================
# # CHECK 2.5: Significant Work → Changelog Check
# # ============================================
# # Check if significant commits were made today without a changelog entry
# TODAY=$(date +%Y-%m-%d)
# CHANGELOG_DIR="$CLAUDE_PROJECT_DIR/content/changelog"

# # Get today's commits (excluding trivial ones like typos, formatting)
# TODAYS_COMMITS=$(cd "$CLAUDE_PROJECT_DIR" && git log --since="$TODAY 00:00" --oneline 2>/dev/null | grep -ivE "(typo|format|lint|merge|revert)" | wc -l | tr -d ' ')

# if [[ "$TODAYS_COMMITS" -gt 0 ]]; then
#   # Check if a changelog entry exists for today
#   TODAYS_CHANGELOG=$(find "$CHANGELOG_DIR" -name "*.json" -exec grep -l "\"date\": \"$TODAY\"" {} \; 2>/dev/null | wc -l | tr -d ' ')

#   if [[ "$TODAYS_CHANGELOG" -eq 0 ]]; then
#     # Get commit summary for context
#     COMMIT_SUMMARY=$(cd "$CLAUDE_PROJECT_DIR" && git log --since="$TODAY 00:00" --oneline 2>/dev/null | head -10)

#     echo "" >&2
#     echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" >&2
#     echo "CLAUDE: Review today's work for changelog" >&2
#     echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" >&2
#     echo "" >&2
#     echo "Today's commits ($TODAYS_COMMITS):" >&2
#     echo "$COMMIT_SUMMARY" | sed 's/^/  /' >&2
#     echo "" >&2
#     echo "If this work is user-facing or significant:" >&2
#     echo "  1. Create content/changelog/<feature-name>.json" >&2
#     echo "  2. Fill in: title, slug, date ($TODAY), category, description, benefit, howToUse" >&2
#     echo "" >&2
#     echo "If this is internal/trivial work, say 'skip changelog' to continue." >&2
#     echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" >&2
#     exit 2
#   fi
# fi

# # ============================================
# # CHECK 3: Task Continuation (autonomous loop)
# # ============================================
# if [[ -f "$TODO_FILE" ]]; then
#   # Parse task markers from In Progress section
#   # [→] = in progress, [ ] = ready, [x] = done, [!] = blocked
#   IN_PROGRESS=$(grep -E '^\[→\].*\*\*' "$TODO_FILE" | head -1)
#   READY_TASKS=$(grep -E '^\[ \].*\*\*' "$TODO_FILE" || true)
#   if [[ -z "$READY_TASKS" ]]; then
#     READY_COUNT=0
#   else
#     READY_COUNT=$(echo "$READY_TASKS" | wc -l | tr -d ' ')
#   fi

#   # Task in progress - keep working
#   if [[ -n "$IN_PROGRESS" ]]; then
#     TASK_NAME=$(echo "$IN_PROGRESS" | sed 's/\[→\] \*\*\([^*]*\)\*\*.*/\1/')
#     echo "" >&2
#     echo "═══════════════════════════════════════════════════════" >&2
#     echo "IN PROGRESS: $TASK_NAME" >&2
#     echo "═══════════════════════════════════════════════════════" >&2
#     echo "" >&2
#     echo "Complete this task, mark [x], run /dac, then continue." >&2
#     exit 2
#   fi

#   # Ready tasks exist - BLOCK until handled
#   if [[ "$READY_COUNT" -gt 0 ]]; then
#     NEXT_TASK=$(echo "$READY_TASKS" | head -1)
#     TASK_NAME=$(echo "$NEXT_TASK" | sed 's/\[ \] \*\*\([^*]*\)\*\*.*/\1/')
#     echo "" >&2
#     echo "═══════════════════════════════════════════════════════" >&2
#     echo "NEXT TASK: $TASK_NAME ($READY_COUNT remaining)" >&2
#     echo "═══════════════════════════════════════════════════════" >&2
#     echo "" >&2
#     echo "Mark [ ] as [→] to start, or [!] to skip." >&2
#     exit 2
#   fi
# fi

# # All checks passed - allow stop
# echo "" >&2
# echo "All TODO.md tasks complete. Clean exit." >&2
# exit 0
