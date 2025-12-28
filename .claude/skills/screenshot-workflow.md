# Screenshot Workflow (Baseline Visual Regression)

Captures ALL 150+ pages across 4 variants for visual regression testing.

**Note:** For documenting specific frontend changes, use `/document` instead.

## Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    BASELINE SCREENSHOT WORKFLOW                         │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  Purpose: Capture ALL pages for visual regression testing               │
│                                                                         │
│  Variants captured:                                                     │
│  • Desktop Light (1280×720)                                             │
│  • Desktop Dark                                                         │
│  • Mobile Light (390×844)                                               │
│  • Mobile Dark                                                          │
│                                                                         │
│  Output: e2e/visual-regression/                                         │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

## Quick Commands

| Step | Command | Purpose |
|------|---------|---------|
| 1 | `/screenshot-branch` | Create 4 branches from main |
| 2 | `/screenshot-setup` | Generate test file for current branch |
| 3 | `/screenshot-test` | Run Playwright, capture screenshots |
| 4 | `/screenshot-view` | Open screenshots in Finder |
| 5 | `/screenshot-merge` | Merge all branches back to main |

## Detailed Workflow

### Step 1: Create Branches (`/screenshot-branch`)

Creates 4 branches from main:
- `screenshot-desktop-light`
- `screenshot-desktop-dark`
- `screenshot-mobile-light`
- `screenshot-mobile-dark`

Also sets up shared Playwright config and helpers.

**Run once at project start.**

### Step 2: Setup Test File (`/screenshot-setup`)

On each branch, generates the appropriate test file:
- Desktop: 1280×720 viewport
- Mobile: 390×844 viewport
- Dark: Includes dark mode toggle

**Run once per branch after checkout.**

### Step 3: Run Tests (`/screenshot-test`)

Runs Playwright with `--update-snapshots`:
```bash
npm run test:e2e -- screenshots-<variant>.spec.ts --update-snapshots
```

Screenshots saved to `e2e/visual-regression/`.

### Step 4: View Screenshots (`/screenshot-view`)

Opens screenshot folder in Finder/Explorer:
```bash
/screenshot-view          # All screenshots
/screenshot-view pricing  # Specific page
```

### Step 5: Merge Branches (`/screenshot-merge`)

Merges all 4 branches into main in order. Final result: each page folder has all 4 variants.

## Page Categories

| Category | Count | Examples |
|----------|-------|----------|
| Public | 13+ | /, /pricing, /about, /contact |
| Dashboard | 2 | /dashboard/user, /dashboard/admin |
| Admin | 13+ | /admin/*, /admin/products, /admin/blog |

## vs. `/document` Skill

| | Baseline Screenshots | `/document` |
|---|---------------------|-------------|
| **Scope** | ALL 150+ pages | Only changed pages |
| **When** | Major visual updates | Per-feature |
| **Output** | e2e/visual-regression/ | public/screenshots/<branch>/ |
| **Purpose** | Visual regression | User-facing changelog |
