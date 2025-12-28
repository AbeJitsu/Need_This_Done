# Frontend Documentation Rule

When modifying frontend files, document the changes before committing.

## Frontend Files (trigger documentation)

- `app/app/**/*.tsx` - Pages
- `app/components/**/*.tsx` - Components
- `app/lib/colors.ts` - Color system
- `**/*.css` - Styles

## Required Documentation

Create `content/changelog/<branch-name>.json`:

```json
{
  "title": "Feature Name",
  "slug": "branch-name",
  "date": "YYYY-MM-DD",
  "category": "Admin|Shop|Public|Dashboard",
  "description": "What changed",
  "benefit": "Why users care",
  "howToUse": ["Step 1", "Step 2"],
  "screenshots": []
}
```

## Environment-Aware Workflow

**Local (dev server available):**
1. Run `npm run screenshot:affected`
2. Screenshots auto-captured to `public/screenshots/<branch>/`
3. Fill in changelog fields

**Cloud (no dev server):**
1. Create changelog entry manually
2. Leave screenshots array empty
3. Screenshots added on next local run

## Quick Check

Before committing frontend changes, ask yourself:
- Did I create/update `content/changelog/<branch>.json`?
- Are title, description, and benefit filled in?
