# Puck Visual Page Builder - Implementation Guide

This guide documents the complete Puck visual page builder implementation for this application.

## Overview

Puck enables admins to compose pages dynamically using a drag-and-drop editor. Pages are stored as JSON in Supabase and rendered server-side for SEO-friendly public URLs.

**Key Features**:
- Drag-and-drop visual editor
- 5 pre-configured components (Button, Card, PageHeader, CTASection, CircleBadge)
- Draft/Publish workflow
- Redis caching (5 min for public pages, 60 sec for admin list)
- Admin-only editing with RLS policies
- SEO-friendly URLs at `/{slug}`

## Architecture

### Database Layer (`supabase/migrations/005_create_pages_table.sql`)

```sql
pages table structure:
- id (UUID) - Primary key
- slug (TEXT, UNIQUE) - URL identifier
- title (TEXT) - Internal page title
- content (JSONB) - Puck configuration
- is_published (BOOLEAN) - Draft/Published status
- published_at (TIMESTAMP) - Publication timestamp
- created_by / updated_by (UUID) - User tracking
- created_at / updated_at (TIMESTAMP) - Timestamps
```

**Security**:
- Row-level security (RLS) policies enforce admin-only access
- Public can read published pages
- Admins see all pages (for preview)

**Auto-triggers**:
- Updated `updated_at` on every update
- Sets `published_at` when page is published
- Clears `published_at` when page is unpublished

### API Layer

#### GET `/api/pages` (Admin Only)
- Lists all pages with pagination metadata
- Cached 60 seconds (CACHE_TTL.MEDIUM)
- Returns: id, slug, title, is_published, timestamps

#### GET `/api/pages/{slug}` (Public/Admin)
- Fetches single page
- Public: sees only published pages
- Admin: sees all pages
- Cached 5 minutes (CACHE_TTL.LONG)
- Returns full page with content

#### POST `/api/pages` (Admin Only)
- Creates new page
- Validates: slug format (lowercase + hyphens), uniqueness
- Stores in Supabase with user tracking
- Invalidates admin list cache

#### PUT `/api/pages/{slug}` (Admin Only)
- Updates page content/title/status
- Invalidates both individual and list caches
- Returns updated page

#### DELETE `/api/pages/{slug}` (Admin Only)
- Removes page from database
- Invalidates caches
- Public returns 404 after deletion

### Puck Configuration (`app/lib/puck-config.tsx`)

Defines 5 components available in the visual editor:

1. **Button** - Color (6 options), Size (3), Link
2. **Card** - Content, Hover Color, Hover Effect
3. **PageHeader** - Title, Description
4. **CTASection** - Title, Description, Button Array, Hover Color
5. **CircleBadge** - Number, Color, Size

Each component:
- Maps to existing React components
- Has editable fields (text, textarea, select, radio, number, array)
- Includes default props
- Renders with type-safe props

### Admin Routes

```
/admin/pages              - List pages (admin only)
/admin/pages/new          - Create new page (admin only)
/admin/pages/{slug}/edit  - Edit existing page (admin only)
```

**Protection**: `useAuth()` hook checks `isAdmin` before rendering.

### Dynamic Page Route

```
/{slug}  - Render published page (public)
           Returns 404 if not published
```

**Rendering**:
- Async server component
- Fetches from `/api/pages/{slug}`
- Uses Puck `<Render />` component
- Error handling for fetch failures

## Components Available in Editor

### Button
**Fields**:
- children (text) - Button text
- variant (select) - Purple, Blue, Green, Orange, Teal, Gray
- size (radio) - sm, md, lg
- href (text, optional) - Link URL

### Card
**Fields**:
- children (textarea) - Content
- hoverColor (select) - Hover border color
- hoverEffect (radio) - Lift, Glow, Tint, None

### PageHeader
**Fields**:
- title (text) - Main heading
- description (textarea, optional) - Subtitle

### CTASection
**Fields**:
- title (text) - Section title
- description (textarea, optional) - Supporting text
- buttons (array) - List of buttons:
  - text (button label)
  - variant (color)
  - href (URL)
  - size (button size)
- hoverColor (select) - Card hover color

### CircleBadge
**Fields**:
- number (number) - Badge number
- color (select) - Badge color
- size (radio) - sm, md, lg

## Caching Strategy

**Cache Keys**:
- `admin:pages:all` - Admin pages list (60 sec)
- `page:{slug}` - Individual page (5 min)

**Invalidation**:
- On create: invalidate admin list
- On update: invalidate page + admin list
- On delete: invalidate page + admin list

**Strategy**: Cache-aside with Redis

## Implementation Files

### Database
- `supabase/migrations/005_create_pages_table.sql` - Schema with RLS

### API Routes
- `app/app/api/pages/route.ts` - GET list, POST create
- `app/app/api/pages/[slug]/route.ts` - GET, PUT, DELETE

### Puck Configuration
- `app/lib/puck-config.tsx` - Component definitions

### Admin UI
- `app/app/admin/pages/page.tsx` - Pages list management
- `app/app/admin/pages/new/page.tsx` - Create page with Puck
- `app/app/admin/pages/[slug]/edit/page.tsx` - Edit page with Puck

### Public Rendering
- `app/app/[slug]/page.tsx` - Dynamic page viewer

### Tests
- `app/e2e/pages-puck.spec.ts` - Full workflow tests

## Workflow: Creating a Page

1. Admin accesses `/admin/pages`
2. Clicks "Create New Page"
3. Enters slug (`about-us`) and title (`About Us`)
4. Puck editor opens
5. Admin drags components onto canvas
6. Clicks "Publish" to save as Draft
7. Returns to pages list
8. Admin clicks "Publish" to make public
9. Page accessible at `/about-us`

## Extending the System

### Adding a New Component

1. Ensure component exists in `/app/components/`
2. Add to `app/lib/puck-config.tsx`:
   ```typescript
   NewComponent: {
     fields: {
       prop1: { type: 'text', label: 'Label' },
       // ... define all editable props
     },
     defaultProps: {
       prop1: 'default value',
     },
     render: (props) => <NewComponent {...props} />
   }
   ```
3. Component appears in Puck automatically

### Future Enhancements

- [ ] Add Tier 2 components (ServiceCard, PricingCard, StepCard)
- [ ] Template library (pre-built page templates)
- [ ] SEO fields (meta title, description, og tags)
- [ ] Page versioning/history
- [ ] Team collaboration (multiple editors)
- [ ] Analytics integration
- [ ] A/B testing variants

## Testing

Run E2E tests:
```bash
npm run test:e2e
# or specific tests:
npx playwright test e2e/pages-puck.spec.ts
```

Tests cover:
- Page creation
- Page editing
- Publishing/unpublishing
- Page deletion
- Public visibility
- Permission enforcement

## Performance Notes

- **5-minute cache** for published pages reduces database queries
- **60-second cache** for admin list improves listing performance
- **Server-side rendering** for dynamic pages improves SEO
- **JSONB storage** enables flexible page structure
- **RLS policies** enforce security at database level

## Security Considerations

- **Authentication**: All admin operations require Supabase JWT
- **Authorization**: RLS policies check `is_admin` metadata flag
- **Slug validation**: Only lowercase letters, numbers, hyphens allowed
- **Input validation**: Required fields checked before create/update
- **Error handling**: Detailed errors only in logs, generic errors to client

---

**See Also**:
- [Puck Usage Guide](./puck-usage.md) - Day-to-day user guide
- [Roadmap.md](../../Roadmap.md) - Project roadmap
- [Puck Official Docs](https://puck.sh) - External documentation
