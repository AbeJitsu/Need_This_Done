---
name: check-work
description: Check current work status and git context (project)
---

# Check Work Status

Get a quick overview of git state and what's changed.

## When to Use

This skill should be invoked:
1. **Before committing** - to review what's changed
2. **At session start** - to understand current state
3. **When resuming work** - to pick up where you left off

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
```

### 2. Report in This Format

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 WORK STATUS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Branch: [current branch]
Status: [clean / X files changed / X staged]

Uncommitted Changes:
  [list files if any]

Recent Commits:
  [last 3-5 commits]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```
