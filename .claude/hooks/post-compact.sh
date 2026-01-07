#!/bin/bash
# Post-Compact Hook - Restore work state after context compression
# Displays git state after compaction so Claude can continue.

WORK_STATE_FILE="/tmp/claude_work_state.json"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" >&2
echo "🔄 CONTEXT COMPACTED - RESTORING WORK STATE" >&2
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" >&2

if [ -f "$WORK_STATE_FILE" ]; then
  BRANCH=$(cat "$WORK_STATE_FILE" | grep '"branch"' | cut -d'"' -f4)
  UNCOMMITTED=$(cat "$WORK_STATE_FILE" | grep '"uncommitted_files"' | sed 's/[^0-9]//g')

  echo "" >&2
  echo "📍 WORK CONTEXT:" >&2
  echo "   Branch: $BRANCH" >&2

  if [ "$UNCOMMITTED" -gt 0 ]; then
    echo "   Uncommitted changes: $UNCOMMITTED files" >&2
  fi
  echo "" >&2
fi

echo "💡 Run 'git status' to see current state" >&2
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" >&2

exit 0
