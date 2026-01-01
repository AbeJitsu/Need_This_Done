---
name: cancel-loop
description: Stop autonomous work mode gracefully. Shows summary of progress and preserves state for potential resume.
---

# Cancel Loop: Stop Autonomous Work

Stop the current autonomous loop gracefully.

## Actions

1. Check if loop is active by reading .claude/loop-state.json
2. If not active, report "No active loop to cancel"
3. If active:
   - Set active=false in loop-state.json (preserve for resume)
   - Generate summary
   - Check for uncommitted changes

## Summary Format

```
🛑 LOOP CANCELLED
━━━━━━━━━━━━━━━━━

Duration:     Xh Ym
Iterations:   N
Commits:      M

Progress:
  [x] A completed
  [→] B in progress
  [ ] C remaining
  [!] D blocked

State saved. Run /auto-loop to resume later.
```

## Uncommitted Changes

If there are uncommitted changes:
```
⚠️  Uncommitted changes detected.
Run /dac to commit before closing session.
```

## Natural Language Triggers

- "stop"
- "cancel loop"
- "stop the loop"
- "take a break"
- "/cancel-loop"
