---
name: check-work
description: Check current work status and git context (project)
---

# Check Work Status

Get a quick overview of what's being worked on and what comes next.

## When to Use

This skill should be invoked:
1. **After the stop hook completes** - to verify work is done correctly
2. **At session start** - to understand current state
3. **Before committing** - to review what's changed
4. **When resuming work** - to pick up where you left off

## Your Task

### 1. Gather Context

Run these commands:

```bash
# Git status
git status

# What changed (summary)
git diff --stat

# Last 5 commits
git log --oneline -5

# Check TODO.md status
grep -E '^\[(→| |x|!)\]' TODO.md | head -10
```

### 2. Analyze the Situation

Determine:
- What task is currently in progress?
- Are there uncommitted changes?
- Are there failing tests?
- What logically comes next?

### 3. Report in This Format

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 WORK STATUS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Branch: [current branch]
Status: [clean / X files changed / X staged]

Current Task: [from TODO.md]
Progress: [description of where we are]

Uncommitted Changes:
  [list files if any]

Next Steps:
  1. [most logical next action]
  2. [follow-up action]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### 4. Decide: Continue or Stop?

If auto-loop is active:
- If work is incomplete: Continue with next task
- If work is complete: Report success and exit

If auto-loop is not active:
- Report status and wait for user input

## Integration with Stop Hook

This skill complements the stop hook:
1. Stop hook handles loop continuation logic
2. This skill provides detailed work status analysis
3. Together they enable informed autonomous work
