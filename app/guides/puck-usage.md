# Puck Visual Page Builder - Usage Guide

This guide shows how to use the Puck visual page builder that's integrated into the application.

## Quick Start

1. **Access Admin Dashboard**: Go to `/admin/pages` (requires admin authentication)
2. **Create or Edit Pages**: Use the Puck visual editor to compose pages
3. **Publish**: Make pages public so visitors can access them
4. **View**: Published pages are accessible at `/{slug}` (e.g., `/about`, `/features`)

## The 5 Available Components

All components are pre-configured and ready to use in the Puck editor:

### 1. PageHeader
A large title section with optional description.

**Fields**:
- `title` (text) - Main heading
- `description` (textarea, optional) - Subtitle or description text

**Example URL**: `/admin/pages/new` → Add PageHeader → "About Us" title

### 2. Button
Clickable button with color and size options.

**Fields**:
- `children` (text) - Button text
- `variant` (select) - Color: Purple, Blue, Green, Orange, Teal, Gray
- `size` (radio) - Size: Small (sm), Medium (md), Large (lg)
- `href` (text, optional) - Link URL (defaults to no link)

**Example**: Create a "Learn More" button in purple, medium size

### 3. Card
Reusable container with hover effects and border colors.

**Fields**:
- `children` (textarea) - Card content (text or basic HTML)
- `hoverColor` (select) - Border color on hover: Purple, Blue, Green, Orange, Teal
- `hoverEffect` (radio) - Hover animation: Lift, Glow, Tint, None

**Example**: Card with "Lift" effect that glows purple on hover

### 4. CTASection (Call-To-Action)
A complete call-to-action section with title, description, and multiple buttons.

**Fields**:
- `title` (text) - Section heading
- `description` (textarea, optional) - Supporting text
- `buttons` (array) - List of buttons with:
  - `text` - Button label
  - `variant` - Color
  - `href` - Link URL
  - `size` - Button size
- `hoverColor` (select) - Card background color on hover

**Example**: "Ready to get started?" section with multiple call-to-action buttons

### 5. CircleBadge
A numbered circle badge (e.g., "1", "2", "3" for step counters).

**Fields**:
- `number` (number) - The number to display
- `color` (select) - Badge color: Purple, Blue, Green, Orange, Teal
- `size` (radio) - Size: Small, Medium, Large

**Example**: Use three badges numbered 1, 2, 3 for a "3-step process" layout

## Workflow: Creating a Page

### Step 1: Create a New Page
1. Go to `/admin/pages`
2. Click **"Create New Page"** button
3. Enter a **slug** (lowercase letters, numbers, hyphens only):
   - Example: `about-us`, `features`, `pricing`
4. Enter a **title** (for internal reference):
   - Example: "About Us", "Our Features"
5. You'll be taken to the Puck editor

### Step 2: Design with Components
1. On the left panel, you'll see available components
2. Drag components onto the canvas to build your page
3. Click components to edit their properties
4. Use the preview to see how it looks

### Step 3: Publish
1. Click the **"Publish"** button in Puck (usually top-right)
2. You'll be redirected to the pages list
3. Your page appears as "Draft" initially

### Step 4: Make It Public
1. In the pages list, find your page
2. Click the **"Publish"** button next to it
3. Status changes to "Published"
4. The page is now public at `/{slug}`

## Workflow: Editing a Page

1. Go to `/admin/pages`
2. Find your page in the list
3. Click **"Edit"** button
4. Make changes in the Puck editor
5. Click **"Publish"** to save
6. Return to pages list - your changes are saved

## Workflow: Publishing & Unpublishing

**Publish** (make public):
1. Pages list → Find your page
2. Click **"Publish"** button (shows if currently Draft)
3. Status changes to "Published"
4. Page is now accessible at `/{slug}`

**Unpublish** (hide from public):
1. Pages list → Find your page
2. Click **"Unpublish"** button (shows if currently Published)
3. Status changes to "Draft"
4. Page returns 404 when accessed directly

## Workflow: Deleting a Page

1. Go to `/admin/pages`
2. Find your page in the list
3. Click **"Delete"** button
4. Confirm deletion in the dialog
5. Page is removed from database

## URL Structure

| Route | Purpose | Visibility |
|-------|---------|-----------|
| `/admin/pages` | Page management list | Admin only |
| `/admin/pages/new` | Create new page | Admin only |
| `/admin/pages/{slug}/edit` | Edit existing page | Admin only |
| `/{slug}` | View published page | Public (if published) |

**Examples**:
- Create page with slug `about` → Published → Accessible at `/about`
- Create page with slug `pricing-plans` → Published → Accessible at `/pricing-plans`
- Create page with slug `services` → Draft (not published) → Returns 404

## Tips & Best Practices

### Slugs
- Use lowercase letters only
- Use hyphens to separate words: `about-us` (not `about_us`)
- Keep them short and memorable
- Slugs become part of the public URL

### Component Organization
- Start with **PageHeader** to set the page title
- Group content in **Cards** for visual separation
- Use **CircleBadge** with **Cards** to number steps
- End with **CTASection** to encourage action

### Buttons & Links
- Always include `http://` or `https://` for external links
- Use relative paths for internal links: `/about`, `/contact`
- Test links after publishing

### Content
- Keep text concise and scannable
- Use **Cards** to break content into sections
- Combine elements to create visual hierarchy

## API Reference (for developers)

### Get All Pages (Admin Only)
```
GET /api/pages
Authorization: Bearer {admin-token}

Response:
{
  "pages": [
    {
      "id": "uuid",
      "slug": "about",
      "title": "About Us",
      "is_published": true,
      "published_at": "2024-01-01T00:00:00Z",
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    }
  ],
  "count": 1,
  "cached": false,
  "source": "database"
}
```

### Get Single Page
```
GET /api/pages/{slug}

Response:
{
  "page": {
    "id": "uuid",
    "slug": "about",
    "title": "About Us",
    "content": { /* Puck data structure */ },
    "is_published": true,
    "published_at": "2024-01-01T00:00:00Z"
  },
  "cached": true,
  "source": "redis"
}
```

### Create Page (Admin Only)
```
POST /api/pages
Content-Type: application/json
Authorization: Bearer {admin-token}

Request:
{
  "slug": "about",
  "title": "About Us",
  "content": { /* Puck data */ }
}

Response:
{
  "success": true,
  "page": { /* full page object */ }
}
```

### Update Page (Admin Only)
```
PUT /api/pages/{slug}
Content-Type: application/json
Authorization: Bearer {admin-token}

Request:
{
  "content": { /* Puck data */ }
}

Response:
{
  "success": true,
  "page": { /* updated page object */ }
}
```

### Delete Page (Admin Only)
```
DELETE /api/pages/{slug}
Authorization: Bearer {admin-token}

Response:
{
  "success": true,
  "message": "Page deleted successfully"
}
```

## Troubleshooting

### "Page not found" (404)
**Cause**: Page is not published
**Solution**: Go to `/admin/pages`, click "Publish" button for that page

### "Invalid slug" error
**Cause**: Slug contains uppercase letters, spaces, or special characters
**Solution**: Use only lowercase letters, numbers, and hyphens

### Changes not appearing on public page
**Cause**: Page content cached, or not published
**Solution**:
- Wait 5 minutes for cache to expire, or
- Publish the page if it's still a draft

### Component fields not showing
**Cause**: Component not properly configured in the editor
**Solution**:
- Refresh the page
- Try dragging the component again
- Contact development if issue persists

## Adding More Components

Currently available: Button, Card, PageHeader, CTASection, CircleBadge

To add more components (ServiceCard, PricingCard, etc.):
1. Ask development to add them to `app/lib/puck-config.tsx`
2. They'll appear in the Puck editor left panel
3. Use them the same way as existing components

---

**See Also**: [TODO.md](../../TODO.md) | [DESIGN_SYSTEM.md](../../docs/DESIGN_SYSTEM.md)
