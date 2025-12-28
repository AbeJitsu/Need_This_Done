#!/bin/bash
# SessionStart Hook: Present TODO.md priorities
# What: Runs when session starts, resumes, or after compacting
# Why: So you immediately see what's ready to work on
#
# Triggers: startup, resume, compact, clear

TODO_FILE="$CLAUDE_PROJECT_DIR/TODO.md"

if [ ! -f "$TODO_FILE" ]; then
  exit 0
fi

echo ""
echo "=== TODO.md Priorities ==="
echo ""

# Show In Progress section
echo "IN PROGRESS:"
awk '/^## In Progress$/,/^---$/' "$TODO_FILE" | grep -E "^\*\*|^- \[" | head -10

echo ""

# Show next up (Short Term from To Do)
echo "NEXT UP (Short Term):"
sed -n '/^### Short Term$/,/^### /p' "$TODO_FILE" | grep -E "^\*\*|^- \[" | head -8

echo ""
echo "==========================="
echo ""

# ============================================================================
# Improvement Prompt - Continuous Quality Focus
# ============================================================================
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎯 CONTINUOUS IMPROVEMENT"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "What is ONE high-value improvement we can make right now?"
echo ""
echo "Quality Lenses:"
echo "  UX  │ User delight, clarity, accessibility"
echo "  DX  │ Dev speed, tooling, documentation"
echo "  DRY │ Extract duplicates, centralize logic"
echo "  ⊥   │ Orthogonal modules, no coupling"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

exit 0
