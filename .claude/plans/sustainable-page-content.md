# Sustainable Page Content Architecture

## The Problem

Current state: **Unsustainable repetition**

Every editable page client repeats 15+ lines of identical boilerplate:

```tsx
// 1. Define mergeWithDefaults function (10-15 lines)
function mergeWithDefaults(content: Partial<XPageContent>): XPageContent {
  const defaults = getDefaultContent('x') as XPageContent;
  return { /* merge each field */ };
}

// 2. Get context
const { setPageSlug, setPageContent, pageContent } = useInlineEdit();

// 3. Memoize to prevent infinite re-renders
const safeInitialContent = useMemo(
  () => mergeWithDefaults(initialContent),
  [initialContent]
);

// 4. Initialize context on mount
useEffect(() => {
  setPageSlug('x');
  setPageContent(safeInitialContent);
}, [safeInitialContent, setPageSlug, setPageContent]);

// 5. Get live content (with pending edits)
const rawContent = (pageContent as XPageContent) || safeInitialContent;
const content = mergeWithDefaults(rawContent);
```

**Scale of the problem:**
- 36+ pages exist today
- 5 pages currently use this pattern
- Every new editable page must copy this boilerplate
- Bug in the pattern → fix in N places
- Easy to forget steps → infinite re-render bugs

---

## The Solution: Route-Aware Content Provider

Make the InlineEditProvider smart enough to handle content automatically.

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    CURRENT ARCHITECTURE                                  │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│   page.tsx (server) → fetch content                                     │
│         ↓                                                               │
│   PageClient.tsx (client) → 15+ lines of boilerplate                    │
│         ↓                                                               │
│   InlineEditContext ← manual setPageSlug, setPageContent                │
│                                                                         │
│   Problem: Each page must know HOW to initialize context                │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
                                   ↓
┌─────────────────────────────────────────────────────────────────────────┐
│                    NEW ARCHITECTURE                                      │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│   InlineEditProvider (root layout)                                      │
│         ↓                                                               │
│   usePathname() → detect current route                                  │
│         ↓                                                               │
│   Is this an editable page? (check editableRoutes config)               │
│         ↓ yes                                                           │
│   Auto-set pageSlug, auto-merge with defaults                           │
│         ↓                                                               │
│   PageClient.tsx → just renders UI, gets content from context           │
│                                                                         │
│   Result: Zero boilerplate in pages. Add slug to config = done.         │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Implementation Options

### Option A: Custom Hook (Minimal Change)

Create `usePageContent<T>()` hook that encapsulates the pattern.

**Pros:**
- Simple, incremental change
- Easy to understand
- Doesn't change provider architecture

**Cons:**
- Still requires each page to import and call the hook
- Still need to remember to use it for new pages
- Boilerplate reduced to 1 line, but still exists

```tsx
// Usage in each page client
const content = usePageContent<ServicesPageContent>('services', initialContent);
```

---

### Option B: Route-Aware Provider (Recommended)

Make InlineEditProvider detect the route and manage content automatically.

**Pros:**
- Zero boilerplate in pages
- Adding a new editable page = add slug to config
- Impossible to introduce infinite re-render bugs
- Content management centralized

**Cons:**
- Bigger architectural change
- Provider becomes more complex
- May need to handle edge cases (dynamic routes, etc.)

**How it works:**

```tsx
// lib/editable-routes.ts
export const editableRoutes: Record<string, EditablePageSlug> = {
  '/': 'home',
  '/services': 'services',
  '/pricing': 'pricing',
  '/faq': 'faq',
  '/how-it-works': 'how-it-works',
};

// InlineEditProvider.tsx
function InlineEditProvider({ children }) {
  const pathname = usePathname();
  const pageSlug = editableRoutes[pathname] ?? null;

  // Auto-initialize when route matches an editable page
  useEffect(() => {
    if (pageSlug) {
      // Content comes from props passed through layout/page
      // Or fetched here (if we want provider to own fetching)
    }
  }, [pageSlug]);
}
```

**Content Flow:**
1. Server page fetches content (unchanged)
2. Passes to client component via props (unchanged)
3. Client uses `useEditableContent()` to register with provider
4. Provider handles merging, memoization, context updates

---

### Option C: Hybrid (Hook + Auto-Detection)

Best of both worlds:
1. Provider auto-detects route and sets pageSlug
2. Simple `useEditableContent()` hook for pages that need content
3. Hook is minimal - just registers content with provider

```tsx
// In page client - one line
useEditableContent(initialContent);

// Provider auto-detected pageSlug from route
// Provider handles merging with defaults
// Provider handles memoization
// Content available via context
```

---

## Recommended Approach: Option C (Hybrid)

### Why:
- Minimal change to existing page structure
- Pages still receive content via props (server-side fetch preserved)
- Hook is simple (1 line) but explicit
- Provider handles all the complexity
- Easy to adopt incrementally

### Components:

1. **`lib/editable-routes.ts`** - Map of routes to page slugs
2. **`hooks/useEditableContent.ts`** - Simple registration hook
3. **Updated `InlineEditProvider`** - Route-aware, handles merging
4. **Refactored page clients** - Remove boilerplate, add 1-line hook

---

## Migration Plan

### Phase 1: Create New Infrastructure
- [ ] Create `lib/editable-routes.ts` with route → slug mapping
- [ ] Create `hooks/useEditableContent.ts` hook
- [ ] Update `InlineEditProvider` to be route-aware
- [ ] Add generic `mergeWithDefaults<T>()` to handle any page type

### Phase 2: Migrate Existing Pages
- [ ] ServicesPageClient.tsx
- [ ] HomePageClient.tsx
- [ ] FAQPageClient.tsx
- [ ] PricingPageClient.tsx
- [ ] HowItWorksPageClient.tsx

### Phase 3: Testing & Prevention
- [ ] Create test that detects duplicate boilerplate
- [ ] Create test for infinite re-render patterns
- [ ] Document the pattern for new pages

---

## New Page Workflow (After)

To make a new page editable:

1. Add type to `page-content-types.ts`
2. Add defaults to `default-page-content.ts`
3. Add route to `editable-routes.ts`: `'/new-page': 'new-page'`
4. In page client: `useEditableContent(initialContent);`

That's it. 4 steps, no boilerplate to copy, no bugs to introduce.

---

## Files to Create/Modify

| File | Action | Purpose |
|------|--------|---------|
| `lib/editable-routes.ts` | Create | Route → slug mapping |
| `hooks/useEditableContent.ts` | Create | 1-line registration hook |
| `context/InlineEditContext.tsx` | Modify | Add route detection, generic merge |
| `components/*/PageClient.tsx` (5 files) | Modify | Remove boilerplate |
| `__tests__/hooks/useEditableContent.test.tsx` | Create | Prevent regression |

---

*Created: December 29, 2025*
