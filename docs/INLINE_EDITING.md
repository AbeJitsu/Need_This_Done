# Universal Inline Editing System

The inline editing system allows admins to edit any page content directly on the live site. Click any text, edit it in the sidebar, save. No code changes required.

## Vision: Click Anything, Edit Anything

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    UNIVERSAL EDITABILITY                                │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│   Step 1: Admin enables edit mode (floating pencil button)              │
│   Step 2: Click ANY text on the page                                    │
│   Step 3: Sidebar opens with that field's editor                        │
│   Step 4: Modify, save, done                                            │
│                                                                         │
│   No code. No config. Just click and edit.                              │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

## Architecture Overview

### Core Components

| Component | Location | Purpose |
|-----------|----------|---------|
| `InlineEditContext` | `context/InlineEditContext.tsx` | Global state for edit mode |
| `InlineEditProvider` | `components/InlineEditor/InlineEditProvider.tsx` | Context provider wrapper |
| `EditableSection` | `components/InlineEditor/EditableSection.tsx` | Marks content as editable |
| `EditableItem` | `components/InlineEditor/EditableItem.tsx` | Wraps array items |
| `AdminSidebar` | `components/InlineEditor/AdminSidebar.tsx` | Field editor UI |
| `EditModeBar` | `components/InlineEditor/EditModeBar.tsx` | Top bar in edit mode |
| `useEditableContent` | `hooks/useEditableContent.ts` | Hook for page clients |
| `content-path-mapper` | `lib/content-path-mapper.ts` | Text → JSON path mapping |
| `useUniversalClick` | `hooks/useUniversalClick.ts` | Global click handler |

### Data Flow

```
┌──────────────────────────────────────────────────────────────────────────┐
│                           DATA FLOW                                       │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│   1. Page Load                                                           │
│      ┌─────────────────┐    ┌──────────────────┐    ┌───────────────┐   │
│      │ Server fetches  │───▶│ Passes content   │───▶│ Client stores │   │
│      │ /api/page-content│    │ to PageClient    │    │ in context    │   │
│      └─────────────────┘    └──────────────────┘    └───────────────┘   │
│                                                                          │
│   2. Edit Mode                                                           │
│      ┌─────────────────┐    ┌──────────────────┐    ┌───────────────┐   │
│      │ User clicks     │───▶│ content-path-    │───▶│ Sidebar opens │   │
│      │ on text         │    │ mapper finds path│    │ with editor   │   │
│      └─────────────────┘    └──────────────────┘    └───────────────┘   │
│                                                                          │
│   3. Save                                                                │
│      ┌─────────────────┐    ┌──────────────────┐    ┌───────────────┐   │
│      │ User modifies   │───▶│ PUT to           │───▶│ Database      │   │
│      │ field value     │    │ /api/page-content│    │ updated       │   │
│      └─────────────────┘    └──────────────────┘    └───────────────┘   │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

## Adding Inline Editing to a New Page

### Step 1: Define Content Type

Add your page's content structure to `lib/page-content-types.ts`:

```typescript
export interface MyPageContent {
  header: PageHeader;  // title, description
  sections: Array<{
    title: string;
    content: string;
  }>;
  cta: CTASection;
}
```

### Step 2: Add Default Content

Add fallback content to `lib/default-page-content.ts`:

```typescript
export const defaultMyPageContent: MyPageContent = {
  header: {
    title: 'My Page Title',
    description: 'My page description',
  },
  sections: [
    { title: 'Section 1', content: 'Content here' },
  ],
  cta: {
    title: 'Ready?',
    description: 'Take action now',
    buttons: [{ text: 'Get Started', variant: 'blue', href: '/contact' }],
  },
};
```

Update `defaultContentMap` to include your page:

```typescript
const defaultContentMap: Record<EditablePageSlug, PageContent> = {
  // ... existing pages
  'my-page': defaultMyPageContent,
};
```

### Step 3: Add Route Mapping

Add your page to `lib/editable-routes.ts`:

```typescript
export const editableRoutes: Record<string, EditablePageSlug> = {
  // ... existing routes
  '/my-page': 'my-page',
};
```

### Step 4: Create Page Client

Create `components/my-page/MyPageClient.tsx`:

```typescript
'use client';

import { useEditableContent } from '@/hooks/useEditableContent';
import { EditableSection } from '@/components/InlineEditor';
import type { MyPageContent } from '@/lib/page-content-types';

interface MyPageClientProps {
  initialContent: MyPageContent;
}

export default function MyPageClient({ initialContent }: MyPageClientProps) {
  const { content } = useEditableContent<MyPageContent>(initialContent);

  return (
    <main>
      <EditableSection sectionKey="header" label="Header">
        <h1>{content.header.title}</h1>
        <p>{content.header.description}</p>
      </EditableSection>

      <EditableSection sectionKey="sections" label="Sections">
        {content.sections.map((section, index) => (
          <div key={index}>
            <h2>{section.title}</h2>
            <p>{section.content}</p>
          </div>
        ))}
      </EditableSection>

      <EditableSection sectionKey="cta" label="Call to Action">
        <h2>{content.cta.title}</h2>
        <p>{content.cta.description}</p>
      </EditableSection>
    </main>
  );
}
```

### Step 5: Update Server Page

Update `app/my-page/page.tsx`:

```typescript
import { getDefaultContent } from '@/lib/default-page-content';
import type { MyPageContent } from '@/lib/page-content-types';
import MyPageClient from '@/components/my-page/MyPageClient';

async function getContent(): Promise<MyPageContent> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/page-content/my-page`, {
      next: { revalidate: 60 },
    });

    if (response.ok) {
      const data = await response.json();
      return data.content as MyPageContent;
    }
  } catch (error) {
    console.error('Failed to fetch content:', error);
  }

  return getDefaultContent('my-page') as MyPageContent;
}

export default async function MyPage() {
  const content = await getContent();
  return <MyPageClient initialContent={content} />;
}
```

## Supported Field Types

The sidebar automatically renders appropriate editors for each field type:

| Field Type | Editor | Detection |
|------------|--------|-----------|
| String (short) | Text input | `< 80 chars` |
| String (long) | Textarea | `> 80 chars` or named `description` |
| Color | Dropdown | Named `color` or `variant` |
| Boolean | Toggle switch | Named `popular`, `enabled`, or boolean type |
| Number | Number input | Named `number` or number type |
| Array | Clickable list | Array type with Add/Delete/Reorder |
| Object | Drill-down view | Nested object |

## Array Operations

Arrays (like FAQ items, service cards, pricing tiers) support:

- **Add**: Creates new item based on first item's structure
- **Delete**: Removes item with confirmation
- **Reorder**: Move up/down buttons
- **Edit**: Click to open item's fields

## Test Coverage

The system is validated by **52 E2E tests** in two independent suites:

### Test 1: Field Discovery (`e2e/field-discovery.spec.ts`)

Verifies that every expected section and field is discoverable:

```
✓ sidebar lists all expected sections (for each page)
✓ each section exposes editable fields (for each page)
```

### Test 2: Field Editability (`e2e/field-editability.spec.ts`)

Verifies that fields can actually be modified:

```
✓ can edit [field name] (for each page)
✓ shows unsaved changes count when modified
✓ complete edit and save cycle on homepage
✓ array operations work (add/delete/reorder)
✓ all pages have consistent edit mode behavior
```

Run tests:

```bash
npm run test:e2e -- e2e/field-discovery.spec.ts e2e/field-editability.spec.ts
```

## Troubleshooting

### Clicking doesn't open sidebar

1. Check `EditableSection` wrapper exists around content
2. Verify page uses `useEditableContent` hook
3. Confirm route is in `lib/editable-routes.ts`

### Wrong content shown in sidebar

1. Check `sectionKey` matches content structure
2. Verify `content-path-mapper` can find the text
3. Check for duplicate text on page

### Changes don't save

1. Verify API endpoint `/api/page-content/[slug]` exists
2. Check database connection
3. Look for console errors

## Related Files

- Content types: `lib/page-content-types.ts`
- Default content: `lib/default-page-content.ts`
- Route mapping: `lib/editable-routes.ts`
- Click-to-edit: `lib/content-path-mapper.ts`
- Hook: `hooks/useEditableContent.ts`
- Tests: `e2e/field-discovery.spec.ts`, `e2e/field-editability.spec.ts`

## Future Roadmap

See [TODO.md](../TODO.md) for Phase 5: Zero-Config Pages

```
Phase 5: Zero-Config Pages
──────────────────────────
content/about.json exists? Page is editable.
No hooks. No wrappers. Just JSON + components.
```
