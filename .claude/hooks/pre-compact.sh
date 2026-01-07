#!/bin/bash
# Pre-Compact Hook - Save work state before context compression
# Saves git state so it can be restored after compaction.

WORK_STATE_FILE="/tmp/claude_work_state.json"

# Get current git status
GIT_BRANCH=$(git branch --show-current 2>/dev/null || echo "unknown")
UNCOMMITTED_FILES=$(git status --porcelain 2>/dev/null | wc -l | tr -d ' ')

# Save work state
cat > "$WORK_STATE_FILE" << EOF
{
  "timestamp": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "branch": "$GIT_BRANCH",
  "uncommitted_files": $UNCOMMITTED_FILES,
  "working_directory": "$(pwd)"
}
EOF

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" >&2
echo "💾 WORK STATE SAVED BEFORE COMPACTION" >&2
echo "   Branch: $GIT_BRANCH" >&2
if [ "$UNCOMMITTED_FILES" -gt 0 ]; then
  echo "   Uncommitted: $UNCOMMITTED_FILES files" >&2
fi
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" >&2

exit 0
