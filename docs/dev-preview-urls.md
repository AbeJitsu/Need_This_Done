# Dev Preview URLs

Quick reference for previewing pages during development without authentication.

## Dashboard Previews

| View | URL | Description |
|------|-----|-------------|
| Admin Dashboard | `localhost:3000/dashboard?preview=admin` | See all projects with filters |
| User Dashboard | `localhost:3000/dashboard?preview=user` | See user's own projects |

## How It Works

Add `?preview=admin` or `?preview=user` to the dashboard URL to bypass authentication and see mock data.

**Safety**: Only works in development mode (`NODE_ENV === 'development'`). Production ignores these parameters.

## Mock Data

Preview mode shows 4 sample projects with different statuses:
- Website Redesign (in_progress)
- Logo Design (completed)
- E-commerce Setup (submitted)
- Content Writing (in_review)
