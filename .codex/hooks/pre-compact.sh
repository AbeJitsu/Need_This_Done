#!/bin/bash
# Pre-compact hook: save a small local work-state snapshot before Codex
# compacts the conversation.

WORK_STATE_FILE="/tmp/needthisdone-codex-work-state.json"

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

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "WORK STATE SAVED BEFORE COMPACTION"
echo "   Branch: $GIT_BRANCH"
if [ "$UNCOMMITTED_FILES" -gt 0 ]; then
  echo "   Uncommitted: $UNCOMMITTED_FILES files"
fi
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

exit 0
