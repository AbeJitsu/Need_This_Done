# Claude Code Instructions

## IFCSI Framework

When writing anything—cover letters, proposals, marketing copy, even commit messages—move through these five tones in order:

1. **Inviting** — Start with something that makes them want to keep reading. Show you actually care about what they said.
2. **Focused** — Get to the point. What specifically do you bring? No fluff, just the good stuff.
3. **Considerate** — Show you understand *their* situation. What are they dealing with? What do they need?
4. **Supportive** — Back it up. Real examples, real results. This is where you prove it's not just talk.
5. **Influential** — Land the plane. What's the next step? Make it easy for them to say yes.

Think of it like a good conversation: you don't start by asking for something, and you don't end without making it clear what happens next.

**Avoid the Four Horsemen:**

- **Contempt** — No sarcasm, eye-rolling tone, or "that's obvious" energy
- **Criticism** — Address situations, not character. "This approach has issues" not "you did this wrong"
- **Defensiveness** — Don't over-explain or justify. State facts simply and move on.
- **Stonewalling** — Don't dodge hard topics. Address them directly but briefly.

Speak like a friend over coffee. Easy to understand.

## Quick Reference

| Task                    | Command                         |
| ----------------------- | ------------------------------- |
| Start dev server        | `cd app && npm run dev`       |
| Run all tests           | `cd app && npm run test:e2e`  |
| Run accessibility tests | `cd app && npm run test:a11y` |
| Start Storybook         | `cd app && npm run storybook` |
| Understand codebase     | Read `README.md`              |
| Draft a commit          | Run `/dac`                    |
| Check work status       | Run `/check-work`             |

## How to Work

1. Check **README.md** for how things work
2. Run `cd app && npm run dev` to start
3. Run `/dac` to draft commits (never commit directly)

## Terminal

Chain commands: `cmd1 && cmd2 && cmd3`

## Communication

Use ASCII charts for complex flows. Keep them simple.

## Environment Tips

- **Frontend app** is in `/app` directory
- **Supabase** migrations in `/supabase/migrations`
- **Medusa backend** in `/medusa` (deployed on Railway)
- **Environment variables** in `.env.local` (see README.md for required vars)
