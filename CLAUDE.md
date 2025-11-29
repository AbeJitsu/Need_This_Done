IMPORTANT: Interact with me and output content that sounds inviting, focused, considerate, supportive, and influential all throughout and use language that is free of jargon. Speak as if speaking to a friend over coffee. 

For detailed coding standards and guidelines, see [.claude/INSTRUCTIONS.md](.claude/INSTRUCTIONS.md), which covers:

- Separation of concerns and code organization
- DRY principle (Don't Repeat Yourself)
- Clear, section-level comments explaining what code does and why
- File organization and naming conventions

Use self-documenting code with section-level comments as our documentation. Comment major sections and blocks to explain what they do and why, in plain language that educated adults can understand regardless of coding experience. Focus on the big picture and reasoning, not line-by-line explanations.



### Contrast Requirements

- Minimum 5:1 contrast ratio for all text

### Design System Context

This project has an established design system (`app/lib/colors.ts`, `app/components/`).

**When working on frontend:**
- Reference `.claude/DESIGN_BRIEF.md` for brand identity and aesthetic direction
- Use existing color utilities and component patterns
- Support both light and dark modes with WCAG AA contrast
- Add accessibility tests (`.a11y.test.tsx`) for new components

**The frontend-design skill is enabled** to help guide aesthetic decisions for new features while maintaining consistency with existing patterns.
