#!/bin/bash
# UserPromptSubmit Hook: Testing Reminder
# What: Shows brief reminder when test-related keywords are detected
# Why: Gentle nudge to run tests before committing, without being verbose

# Read JSON input from stdin and extract prompt field
INPUT=$(cat)
USER_PROMPT=$(echo "$INPUT" | jq -r '.prompt // empty' 2>/dev/null)

# Check for testing-related keywords (case-insensitive)
if echo "$USER_PROMPT" | grep -qiE '\b(test|spec|e2e|playwright|a11y|vitest)\b'; then
  echo "Testing detected - run tests before committing (see CLAUDE.md)"
fi

exit 0
