# TODO Tracking Rule

When the user reports an issue or makes a request, add it to TODO.md immediately.

## Why

- Issues get lost in conversation context
- Auto-loop needs tasks tracked in TODO.md to work on them
- Creates accountability and visibility

## When to Add

Add to TODO.md when the user:
- Reports a bug ("X is broken")
- Requests a feature ("add Y")
- Points out an issue ("Z doesn't work in dark mode")
- Asks for changes ("the button should...")

## How to Add

1. Find the appropriate section in TODO.md (In Progress, To Do, etc.)
2. Add task with clear description
3. Use markers: `[ ]` ready, `[→]` in progress, `[!]` blocked
4. Include relevant context (file names, symptoms)

## Example

User: "the CTA buttons are broken in dark mode"

Add to TODO.md:
```markdown
**CTA Button System Broken**
- [ ] Fix CTA buttons dark mode - colors not rendering correctly
  - Symptoms: wrong background and text colors in dark mode
  - Location: Navigation "Get a Quote", homepage CTAs
```

## Don't Skip This

Even if you're about to fix it immediately, add it to TODO.md first:
1. Creates documentation of what was broken
2. Allows auto-loop to pick up if conversation ends
3. Shows progress when marked complete
