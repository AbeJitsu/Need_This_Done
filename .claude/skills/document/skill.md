---
name: document
description: Generate clear, accurate changelog entries from git context (project)
---

# Document Changes

Creates clear changelog entries that explain what changed, why it matters, and how users benefit.

## When to Use

This skill should be invoked:
1. **After completing a feature** - to document what changed
2. **Before creating a PR** - to summarize changes
3. **When asked to document changes** - explicit user request

## Your Task

### 1. Find Incomplete Changelog Entries

```bash
cd /Users/abereyes/Projects/Personal/Need_This_Done
grep -l "_needsCompletion" content/changelog/*.json 2>/dev/null | head -5
```

### 2. Analyze the Git Context

Read the changelog JSON to get:
- `_gitContext` - what files changed
- `_affectedRoutes` - which pages were affected

Also check recent commits:
```bash
cd /Users/abereyes/Projects/Personal/Need_This_Done
git log --oneline -10
```

### 3. Write Clear Content

Create a `changes` array with structured entries:

```json
{
  "changes": [
    {
      "what": "Brief description of the change",
      "why": "Why this matters to users",
      "where": "Which page/route is affected"
    }
  ]
}
```

**Focus on clarity over screenshots.** Good changelog entries:
- Explain what changed in plain language
- Say why users should care
- Point to where they can see it

### 4. Update the Entry

Edit the JSON file to:
1. Add the `changes` array
2. Write a clear `description` (summary)
3. Write `benefit` (why it matters)
4. Write `howToUse` (where to see it)
5. Set `screenshots: []` (unless a screenshot truly adds value)
6. Remove `_gitContext`, `_affectedRoutes`, `_needsCompletion`

### 5. Example Output

```json
{
  "title": "Pricing Page Improvements",
  "slug": "pricing-updates",
  "date": "2025-12-31",
  "category": "Public",
  "description": "Better card alignment and clearer pricing tiers.",
  "benefit": "Easier to compare options at a glance.",
  "changes": [
    {
      "what": "Fixed card height alignment",
      "why": "CTA buttons now align across all pricing tiers",
      "where": "/pricing"
    },
    {
      "what": "Added feature comparison table",
      "why": "Quickly see what's included in each tier",
      "where": "/pricing"
    }
  ],
  "howToUse": [
    "Visit /pricing to see the improvements"
  ],
  "screenshots": []
}
```

### 6. Report Results

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 CHANGELOG COMPLETE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Entry: [filename]
Changes: [count] items documented

Location: content/changelog/[slug].json
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## Content Guidelines

**DO:**
- Use plain language
- Focus on user impact
- Be specific about what/why/where

**DON'T:**
- Include screenshots unless they truly add value
- Use technical jargon
- Write vague descriptions like "various improvements"

## File Locations

- **Entries**: `content/changelog/[slug].json`
