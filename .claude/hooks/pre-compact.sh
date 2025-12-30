#!/bin/bash
# ============================================================================
# Pre-Compact Hook - Save work state before context compression
# ============================================================================
# Saves current work state so it can be restored after compaction.
# This enables continuous work across context limits.

WORK_STATE_FILE="/tmp/claude_work_state.json"

# Get current git status
GIT_BRANCH=$(git branch --show-current 2>/dev/null || echo "unknown")
GIT_STATUS=$(git status --porcelain 2>/dev/null | head -20)
UNCOMMITTED_FILES=$(git status --porcelain 2>/dev/null | wc -l | tr -d ' ')

# Get current task from TODO.md
CURRENT_TASK=""
if [ -f "TODO.md" ]; then
  CURRENT_TASK=$(grep -E '^\[→\]' TODO.md 2>/dev/null | head -1 | sed 's/\[→\] //' | tr -d '\n')
fi

# Get in-progress items from internal todo if available
PENDING_TODOS=""
if [ -f ".claude/todo-state.json" ]; then
  PENDING_TODOS=$(cat .claude/todo-state.json 2>/dev/null)
fi

# Save work state
cat > "$WORK_STATE_FILE" << EOF
{
  "timestamp": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "branch": "$GIT_BRANCH",
  "uncommitted_files": $UNCOMMITTED_FILES,
  "current_task": "$(echo "$CURRENT_TASK" | sed 's/"/\\"/g')",
  "git_status": "$(echo "$GIT_STATUS" | head -5 | tr '\n' ' ' | sed 's/"/\\"/g')",
  "working_directory": "$(pwd)"
}
EOF

# Notify that state is saved
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" >&2
echo "💾 WORK STATE SAVED BEFORE COMPACTION" >&2
echo "   Branch: $GIT_BRANCH" >&2
if [ -n "$CURRENT_TASK" ]; then
  echo "   Task: $CURRENT_TASK" >&2
fi
if [ "$UNCOMMITTED_FILES" -gt 0 ]; then
  echo "   Uncommitted: $UNCOMMITTED_FILES files" >&2
fi
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" >&2

exit 0
