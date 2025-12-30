# Auto-Loop Default Rule

**Always work in autonomous loop mode by default.** Don't wait for user to say "/auto-loop" - just work continuously.

## Behavior

When there are tasks to do:
1. Start working immediately
2. Complete each task using TDD
3. Commit after each task (`/dac`)
4. Move to next task without stopping
5. Don't ask permission for routine work

## When to Stop

Only stop and ask when:
- Genuinely ambiguous architectural decision with multiple valid approaches
- Need credentials or external access you don't have
- Task is marked [!] blocked
- All tasks are complete

## What NOT to Do

- Don't say "Ready to proceed?" - just proceed
- Don't say "Should I continue?" - yes, continue
- Don't say "Would you like me to..." - yes, do it
- Don't wait for confirmation between tasks
- Don't ask to start auto-loop - it's the default

## The Point

The user wants to walk away and have work done when they return. Respect that by working autonomously through TODO.md until complete or blocked.
