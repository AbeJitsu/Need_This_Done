# Project Starter Template

This is a reusable project template with coding standards and best practices built-in.

## What's Included

### Configuration & Standards
- **`.claude/INSTRUCTIONS.md`** - Coding standards (DRY principle, separation of concerns, clear comments, naming conventions)
- **`.claude/TONE.md`** - Communication tone guidelines (inviting, focused, considerate, supportive, influential)
- **`.claude/settings.json`** - Claude permissions and settings
- **`.claude/commands/dac.md`** - Draft a commit command
- **`.claude/skills/draft_a_commit.md`** - Skill guide for writing meaningful commits
- **`CLAUDE.md`** - Meta-instruction file that references all standards
- **`.gitignore`** - Configured to ignore `.env` files

### Template Files (Ready to Customize)
- **`index.html`** - Basic HTML5 boilerplate
- **`styles.css`** - CSS reset + custom properties structure
- **`script.js`** - Empty JavaScript with section headers
- **`.env`** - Environment variables file (ignored by git)

---

## How to Use This Template

### Starting a New Project

1. **Copy the entire `project-starter` folder:**
   ```bash
   cp -r /path/to/project-starter /path/to/your-new-project
   cd /path/to/your-new-project
   ```

2. **Update this file (`PROJECT_INSTRUCTIONS.md`):**
   - Replace this content with your specific project requirements
   - Define user stories, features, and goals
   - Set your design system (colors, typography, spacing)
   - List any external resources or APIs you'll use

3. **Customize the starter files:**
   - **`index.html`** - Build your HTML structure
   - **`styles.css`** - Update CSS custom properties with your color palette
   - **`script.js`** - Implement your JavaScript functionality
   - **`.env`** - Add any API keys or environment variables

4. **Initialize git for your new project:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Project setup from template"
   ```

5. **Start building!**
   - Follow the coding standards in `.claude/INSTRUCTIONS.md`
   - Use the communication tone from `.claude/TONE.md`
   - Run `/dac` command when ready to commit your work

---

## Coding Standards Quick Reference

### Keep Things Organized (Separation of Concerns)
- HTML handles structure
- CSS handles appearance
- JavaScript handles behavior
- Each function does one specific task

### Don't Repeat Yourself (DRY)
- Write code once, use it everywhere
- Create helper functions for common tasks
- If you copy-paste code, create a reusable function instead

### Write for Humans (Clear Comments)
- Explain what sections do and why
- Use plain language, no jargon
- Use section dividers (====) to break up code
- Make it understandable to non-programmers

### Naming Conventions
- Use descriptive names: `playButton` not `btn1`
- Function names describe actions: `calculateTotal()` not `calc()`
- Variable names are specific: `currentUserName` not `name`

---

## Your Project Starts Here

Replace this section with your project details:

**Project Name:** [Your Project Name]

**Description:** [What does this project do?]

**Goals:**
- [ ] Goal 1
- [ ] Goal 2
- [ ] Goal 3

**Features:**
- Feature 1
- Feature 2
- Feature 3

**Design System:**
- Colors: [Define your palette]
- Typography: [Define your fonts]
- Spacing: [Define your spacing scale]

**Resources:**
- Resource 1
- Resource 2
