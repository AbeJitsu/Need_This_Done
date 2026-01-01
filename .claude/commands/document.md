---
description: Screenshot changed pages and generate changelog documentation
allowed-tools: Bash(git diff:*), Bash(git status:*), Bash(npm run:*), Read(**/*), Write(**/*), Edit(**/*), Glob(**)
---

# Document Changes

Capture screenshots of changed frontend pages and generate user-facing changelog documentation.

## Automatic Mode (Default)

Frontend changes are now **automatically documented** when a session ends:
1. PostToolUse hook tracks frontend file changes
2. Stop hook auto-runs `npm run screenshot:affected`
3. Screenshots captured + changelog template created
4. You review and fill in the description/benefit fields

## Manual Mode

Run `/document` manually if you want to:
- Preview what will be documented before session ends
- Re-run documentation after making fixes
- Generate docs for changes not yet tracked

## Your Task

### Step 1: Detect Changes

Run `git diff --name-only HEAD` to find changed files. Look for:
- `app/app/**/*.tsx` - page changes
- `app/components/**/*.tsx` - component changes
- `app/lib/colors.ts` - color system changes
- `app/app/globals.css` - global style changes
- Any `.css` file changes

### Step 2: Map to Routes

Determine which routes are affected:

| Changed File | Affected Routes |
|--------------|-----------------|
| `layout.tsx`, `globals.css`, `colors.ts` | ALL routes |
| `Navigation.tsx`, `Footer.tsx` | ALL routes |
| `app/app/pricing/page.tsx` | `/pricing` only |
| `components/Button.tsx` | Check imports across pages |
| `components/AdminDashboard.tsx` | `/admin/*` routes |

### Step 3: Capture Screenshots

Run `npm run screenshot:affected` to:
1. Start the dev server
2. Navigate to each affected route
3. Capture desktop + mobile screenshots in light + dark modes
4. Save to `public/screenshots/<branch-name>/`

### Step 4: Generate Changelog Entry

Create a file at `content/changelog/<branch-name>.json`:

```json
{
  "title": "[Feature Name]",
  "slug": "[branch-name]",
  "date": "[today's date]",
  "category": "[Admin|Shop|Public|Dashboard]",
  "description": "[What the feature does]",
  "benefit": "[Why users care - the value proposition]",
  "howToUse": [
    "Step 1...",
    "Step 2...",
    "Step 3..."
  ],
  "screenshots": [
    {
      "src": "/screenshots/[branch]/[route]-desktop-light.png",
      "alt": "[Descriptive alt text]",
      "caption": "[What this screenshot shows]"
    }
  ]
}
```

### Step 5: Review with User

Present the changelog entry and screenshots to the user:
1. Show the generated changelog JSON
2. List the captured screenshots
3. Ask if any adjustments are needed

### Step 6: Clear Tracking File

After screenshots are captured, clear the frontend changes tracking file:
```bash
rm -f .claude/frontend-changes.txt
```

This prevents the stop-hook from blocking and confirms screenshots were taken.

### Step 7: Ready to Commit

Once approved, the changes are ready to commit:
- Screenshots in `public/screenshots/<branch>/`
- Changelog entry in `content/changelog/<branch>.json`

## Documentation Requirements

Every changelog entry must answer three questions:
1. **WHAT changed?** - Screenshots show the visual changes
2. **WHY it matters?** - The `benefit` field explains the value
3. **HOW to use it?** - The `howToUse` steps guide users

## Example Output

```
📸 Detected changes in:
  - app/components/editor/RichTextEditor.tsx
  - app/app/admin/blog/[slug]/edit/page.tsx

🗺️ Affected routes:
  - /admin/blog/[slug]/edit

📷 Capturing screenshots...
  ✓ admin-blog-edit-desktop-light.png
  ✓ admin-blog-edit-desktop-dark.png
  ✓ admin-blog-edit-mobile-light.png
  ✓ admin-blog-edit-mobile-dark.png

📝 Generated changelog entry:
  content/changelog/wysiwyg-blog-editor.json

Would you like to review the changelog entry?
```
