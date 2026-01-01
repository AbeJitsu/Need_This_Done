---
name: loop-status
description: Show current autonomous loop status including time elapsed, iterations, and task progress.
---

# Loop Status: Check Autonomous Work Progress

Display the current state of the autonomous loop.

## Actions

1. Check if loop is active by reading .claude/loop-state.json
2. If no state file exists: "No loop state. Run /auto-loop to start."
3. If active=false: Show paused loop summary
4. If active=true: Show live status

## Active Loop Display

```
🔄 LOOP ACTIVE
━━━━━━━━━━━━━━

Time:         Xh Ym / 5h (Y% complete)
Iterations:   N

Current Task: [description]

Progress:
  [x] A completed
  [→] 1 in progress
  [ ] B remaining
  [!] C blocked
```

## Paused Loop Display

```
⏸️  LOOP PAUSED
━━━━━━━━━━━━━━━

Last active:  [timestamp]
Duration:     Xh Ym
Iterations:   N

Progress:
  [x] A completed
  [ ] B remaining
  [!] C blocked

Run /auto-loop to resume.
```

## No Loop Display

```
No active loop.

TODO.md status:
  [ ] X ready
  [!] Y blocked

Run /auto-loop to start autonomous work.
```

## Natural Language Triggers

- "loop status"
- "how's the loop"
- "check progress"
- "/loop-status"
