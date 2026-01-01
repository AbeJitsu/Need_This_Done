# Universal Editing Specification

## Core Principle

**1 change = ALL pages editable. Zero per-page configuration.**

## Current Problem

```
Current: N pages × M changes = O(N×M) work
  - Each page needs PageClient.tsx
  - Each page needs content types in page-content-types.ts
  - Each page needs defaults in default-page-content.ts
  - Each page needs route mapping in editable-routes.ts
  - Each page needs EditableSection wrappers

This violates ETC. Adding a new page requires 5+ file edits.
```

## Target State

```
Target: 1 change = 1 file edit
  - Layout-level content detection (already exists)
  - Auto-discovery of content from ANY source
  - No wrappers, no hooks per page
  - Just render content → it's editable
```

## Architecture

### Layer 1: Content Sources (Backend)

All editable content comes from one of these sources:

| Source | Location | Example |
|--------|----------|---------|
| Page Content API | `/api/page-content/[slug]` | Marketing page text |
| Supabase | `page_content` table | Database-stored content |
| Static JSON | `/content/*.json` | Static content files |
| Component Props | React props | Data passed to components |

### Layer 2: Content Registry (Runtime)

A global registry that tracks what content is on the current page:

```typescript
interface ContentRegistry {
  // Maps text content to its source
  register(text: string, source: ContentSource): void;

  // Finds where a piece of text came from
  findSource(text: string): ContentSource | null;

  // Updates content at source
  update(source: ContentSource, newValue: unknown): Promise<void>;
}

interface ContentSource {
  type: 'api' | 'supabase' | 'json' | 'props';
  path: string;        // e.g., "header.title" or "/api/page-content/home"
  table?: string;      // For Supabase: which table
  column?: string;     // For Supabase: which column
  id?: string;         // For Supabase: row ID
}
```

### Layer 3: Universal Click Handler (Already Exists)

The existing `useUniversalClick` hook captures clicks and finds content.

**Current limitation**: It only searches `pageContent` from context.
**Fix**: Make it search the global ContentRegistry instead.

### Layer 4: Admin Sidebar (Already Exists)

Shows editors for selected content. No changes needed.

## Implementation Plan

### Step 1: Auto-Register on Render

Create a `<EditableText>` component that auto-registers its content:

```tsx
// BEFORE: Explicit registration needed
<h1>{content.title}</h1>

// AFTER: Component self-registers
<EditableText path="header.title">{content.title}</EditableText>
```

But wait - this still requires per-component changes.

### Step 2: True Zero-Config (The Real Solution)

Intercept ALL text rendering via a custom React context:

```tsx
// In layout.tsx - wraps entire app
<TextInterceptProvider>
  {children}
</TextInterceptProvider>

// TextInterceptProvider does:
// 1. Patches React's text rendering
// 2. Every text node gets tracked
// 3. Content registry auto-populated
```

This is complex. Simpler approach:

### Step 3: DOM-Based Content Mapping (Recommended)

After page renders, scan the DOM and map visible text to content sources:

```typescript
// After render, scan for editable content
function scanPageContent(pageSlug: string) {
  // 1. Fetch content for this route
  const content = await fetch(`/api/page-content/${pageSlug}`);

  // 2. For each text node in DOM, find its path in content
  const textNodes = getAllTextNodes(document.body);

  for (const node of textNodes) {
    const match = findTextInContent(content, node.textContent);
    if (match) {
      // Mark this DOM node as editable
      markEditable(node, match.path);
    }
  }
}
```

**This is exactly what we already have!** The issue is that `pageContent` isn't populated for pages that don't call `useEditableContent`.

### Step 4: The Real Fix

**Auto-populate `pageContent` for EVERY route:**

1. In `InlineEditProvider`, detect current route
2. Fetch content for that route automatically
3. No need for pages to call `useEditableContent`

```typescript
// InlineEditProvider.tsx
function InlineEditProvider({ children }) {
  const pathname = usePathname();

  useEffect(() => {
    // Auto-fetch content for this route
    const slug = getSlugFromPath(pathname);
    if (slug) {
      fetch(`/api/page-content/${slug}`)
        .then(res => res.json())
        .then(data => setPageContent(data.content));
    }
  }, [pathname]);

  return <Context.Provider value={{...}}>{children}</Context.Provider>;
}
```

## The Standards

### 1. No Per-Page Boilerplate

Pages should NOT need:
- `useEditableContent` hook calls
- `EditableSection` wrappers
- `EditableItem` wrappers
- PageClient.tsx files for editing

### 2. Automatic Content Detection

The system MUST:
- Detect route changes automatically
- Fetch appropriate content for each route
- Map visible text to content paths
- Enable editing without any page-specific code

### 3. Fallback Behavior

For pages without API content:
- Allow DOM-based editing (modify text in place)
- Store changes in a generic content table
- OR: Gracefully skip editing (no errors)

### 4. Admin-Only

All of this only activates for:
- Authenticated users
- With admin role
- When edit mode is enabled

### 5. Performance

The system MUST NOT:
- Add overhead for non-admin users
- Make extra API calls for regular visitors
- Affect page load time for non-edit scenarios

## Migration Path

### Phase 1: Central Content Loading (This Task)

1. Modify `InlineEditProvider` to auto-load content by route
2. Keep existing PageClient components working (backwards compatible)
3. Test that editing works without `useEditableContent` calls

### Phase 2: Remove Per-Page Wrappers

1. Remove `EditableSection` wrappers from pages
2. Remove `useEditableContent` calls from pages
3. PageClient files become optional (only needed for form state, etc.)

### Phase 3: Full Automation

1. Auto-generate content types from API responses
2. Auto-generate defaults from current page content
3. Zero configuration for new pages

## Success Criteria

1. **Admin can edit ANY page** by clicking edit toggle → clicking text
2. **No code changes** needed when adding new pages
3. **36 pages work** without 36 PageClient files
4. **Tests pass** for all existing editing functionality
