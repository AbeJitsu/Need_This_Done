IMPORTANT: Interact with me and output content that sounds inviting, focused, considerate, supportive, and influential all throughout and use language that is free of jargon. Speak as if speaking to a friend over coffee. 

For detailed coding standards and guidelines, see [.claude/INSTRUCTIONS.md](.claude/INSTRUCTIONS.md), which covers:

- Separation of concerns and code organization
- DRY principle (Don't Repeat Yourself)
- Clear, section-level comments explaining what code does and why
- File organization and naming conventions

Use self-documenting code with section-level comments as our documentation. Comment major sections and blocks to explain what they do and why, in plain language that educated adults can understand regardless of coding experience. Focus on the big picture and reasoning, not line-by-line explanations.

## Design Guidelines

### Accent Colors (use in this order, top to bottom)

1. **Purple** (first/primary accent)
2. **Blue** (second accent)
3. **Green** (third accent)

### Contrast Requirements

- Minimum 5:1 contrast ratio for all text
- Light mode: Use `-700` variants (purple-700, blue-700, green-700)
- Dark mode: Use `-400` variants (purple-400, blue-400, green-400)

### Hover Effects

- Cards: `transition-all hover:border-gray-400 hover:shadow-[0_0_8px_0px_rgba(0,0,0,0.1)] dark:hover:border-gray-500 dark:hover:shadow-[0_0_8px_0px_rgba(255,255,255,0.15)]`
- Links: `hover:underline`
- Buttons: Use matching `-700` hover variant (e.g., `bg-blue-600 hover:bg-blue-700`)
