---
name: auto-loop
description: Enter autonomous work mode. Works through TODO.md tasks using TDD until complete or time limit (5 hours). Triggers on "work through TODO", "keep going", "continue", or when clear path detected after completing a task.
---

# Auto-Loop: Autonomous Work Mode

You are entering autonomous work mode. Work through TODO.md tasks continuously using TDD principles until all tasks are complete or the 5-hour time limit is reached.

## Activation Check

Before entering loop mode, verify these conditions:

### 1. Read TODO.md
Check the current state of tasks:
- Count [ ] ready tasks
- Count [→] in-progress tasks
- Count [x] completed tasks
- Count [!] blocked tasks

### 2. Validate Task Format
Ensure all tasks are leaf-level (no nested sub-items):

**VALID:**
```
[ ] Add search box to homepage
[ ] Fix login button alignment
```

**INVALID (must flatten first):**
```
[ ] Phase 5: Zero-Config Pages
    - Auto-discover content JSON     <- NESTED
    - Generate route manifest         <- NESTED
```

If nested tasks found, report them and ask user to flatten before proceeding.

### 3. Check for Blockers
- Tasks marked [!] are acceptable (will retry once per cycle)
- Tasks with "TBD", "needs discussion", or "choose between" need resolution first
- Tasks requiring browser/OAuth/credentials cannot be automated

### 4. Confirm Entry

If all checks pass, create the loop state and begin:

```bash
# Create loop state file
cat > .claude/loop-state.json << 'EOF'
{
  "active": true,
  "startTime": $(date +%s),
  "maxHours": 5,
  "maxConsecutiveFailures": 3,
  "iterationCount": 0,
  "failureCounts": {},
  "cycleNumber": 1,
  "tasksCompleted": 0
}
EOF
```

Display:
```
🔄 AUTONOMOUS LOOP STARTED
━━━━━━━━━━━━━━━━━━━━━━━━━━
Time limit:   5 hours
Max failures: 3 per task

Tasks: X ready, Y blocked

Starting first task...
```

## Work Loop

For each iteration:

### 1. Select Task
- If [→] exists: continue that task
- Else if [ ] exists: pick first one, mark [→]
- Else if [!] exists and not retried this cycle: pick it, mark [→]
- Else: all done, check completion

### 2. Work Using TDD
Follow the TDD rule strictly:
1. **RED**: Write a failing test for the task
2. **GREEN**: Write minimal code to pass
3. **REFACTOR**: Clean up while tests green
4. Run relevant tests to verify

### 3. Complete Task
When task passes:
- Mark [x] in TODO.md
- Run /dac to commit
- Continue to next task

### 4. Handle Failures
If tests fail after 3 attempts on same task:
- Mark [!] blocked in TODO.md
- Move to next task
- Will retry once in next cycle

## Exit Conditions

The loop ends when:

1. **SUCCESS**: All tasks [x] complete AND E2E tests pass
2. **TIME LIMIT**: 5 hours elapsed (state preserved for resume)
3. **USER CANCEL**: User runs /cancel-loop

## Key Rules

- **Never ask permission** for routine work (see autonomous-work.md)
- **Always commit** after completing each task (/dac)
- **Always test** before marking complete
- **Stay focused** on current task until done or blocked
- **TDD always** - tests first, code second

## Natural Language Triggers

This skill activates when user says:
- "work through TODO.md"
- "complete the remaining tasks"
- "keep going until done"
- "continue"
- "handle this autonomously"
- "you know what to do"
- "/auto-loop"

## Resume After Pause

If .claude/loop-state.json exists with active=false:
- Show previous session summary
- Ask: "Resume previous loop or start fresh?"
- If resume: set active=true, reset startTime, continue

## Proactive Initiation

After completing any task, if:
- More [ ] tasks remain
- No questions pending
- Clear path forward

Then announce:
```
✅ Task completed. X tasks remaining.
Continuing in auto-loop mode...
```

And continue working. Don't wait for user confirmation.
