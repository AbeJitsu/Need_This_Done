# Inline Editing Phase 2: Item-Level Editing

**Status:** Ready to implement
**Context:** [InlineEditContext.tsx](../../app/context/InlineEditContext.tsx), [app/components/InlineEditor/](../../app/components/InlineEditor/)

---

## Vision: The Complete System

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    INLINE EDITING SYSTEM ROADMAP                        │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  Phase 1: Section Editing ✅ DONE                                       │
│  ─────────────────────────                                              │
│  Click section → Edit all fields in sidebar                             │
│  Pattern: EditableSection wrapper on all marketing pages                │
│                                                                         │
│  Phase 2: Item-Level Editing ← CURRENT                                  │
│  ────────────────────────────                                           │
│  Click card/item → Edit just that item                                  │
│  Pattern: EditableItem wrapper for array items                          │
│  Breadcrumb: Section → Item navigation                                  │
│                                                                         │
│  Phase 2.5: Edit Mode UX                                                │
│  ────────────────────────                                               │
│  Block link clicks in edit mode                                         │
│  Show helpful hints and guidance                                        │
│  Visual feedback on all interactions                                    │
│                                                                         │
│  Phase 3: Component Creation                                            │
│  ──────────────────────────                                             │
│  [+ Add] buttons to create new items                                    │
│  Delete/reorder existing items                                          │
│  Component picker modal                                                 │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Phase 2: Item-Level Editing

### The Problem

Currently, clicking "Services" section shows ALL service cards in the sidebar. Users want to click on "Data & Documents" card specifically and edit just that card.

### The Solution

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         CLICK HIERARCHY                                 │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│   Page                                                                  │
│    │                                                                    │
│    ├── Section (EditableSection)                                        │
│    │    │                                                               │
│    │    ├── Item (EditableItem) ← click shows item fields only          │
│    │    ├── Item (EditableItem)                                         │
│    │    └── Item (EditableItem)                                         │
│    │                                                                    │
│    └── Section (EditableSection)                                        │
│         │                                                               │
│         ├── Item (EditableItem)                                         │
│         └── Item (EditableItem)                                         │
│                                                                         │
│   Click propagation: Item click → stops at Item (doesn't bubble)        │
│   Breadcrumb shows: Services > Data & Documents                         │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### Implementation Tasks

#### 2.1 Create EditableItem Component

**File:** `app/components/InlineEditor/EditableItem.tsx`

```typescript
interface EditableItemProps {
  sectionKey: string;      // e.g., "services"
  arrayField: string;      // e.g., "cards"
  index: number;           // e.g., 0
  label: string;           // e.g., "Data & Documents"
  content: Record<string, unknown>;
  children: ReactNode;
}
```

Behavior:
- Wraps individual items (cards, FAQ items, steps, etc.)
- Click selects this item (stops propagation to section)
- Shows hover outline in edit mode
- Updates `selectedItem` in context

#### 2.2 Update Sidebar for Item Editing

**File:** `app/components/InlineEditor/InlineEditSidebar.tsx`

Add:
- Breadcrumb navigation: `Section > Item`
- "← Back to Section" button
- Item-specific field rendering
- Support for `selectedItem` alongside `selectedSection`

#### 2.3 Update Context

**File:** `app/context/InlineEditContext.tsx`

Already has ItemSelection interface. Need to:
- Implement `selectItem()` function
- Implement `clearItemSelection()` function
- Add `selectedItem` to provider value

#### 2.4 Wrap Items in Marketing Pages

Update each page to wrap array items:

**Services page arrays:**
- `services.cards[]` - service cards
- `process.steps[]` - process steps

**Pricing page arrays:**
- `packages.items[]` - pricing packages

**FAQ page arrays:**
- `faqs.items[]` - FAQ accordion items

**How It Works arrays:**
- `steps.items[]` - process steps

---

## Phase 2.5: Edit Mode UX

### The Problem

In edit mode, clicking a link navigates away instead of selecting the component. Users get confused about what's clickable and what's editable.

### Edit Mode Click Behavior

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    CLICK BEHAVIOR IN EDIT MODE                          │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  EDITABLE AREAS (inside EditableSection/EditableItem)                   │
│  ─────────────────────────────────────────────────────                  │
│  Link click → BLOCKED, shows toast "Click to edit, ESC to exit"         │
│  Button click → BLOCKED, shows toast                                    │
│  Card click → Selects the card for editing                              │
│  Text click → Selects containing section/item                           │
│                                                                         │
│  NON-EDITABLE AREAS (nav, footer, edit bar itself)                      │
│  ───────────────────────────────────────────────────                    │
│  Link click → Works normally (navigate away)                            │
│  Edit toggle → Works normally (exit edit mode)                          │
│                                                                         │
│  ESCAPE KEY                                                             │
│  ──────────────                                                         │
│  If item selected → Go back to section                                  │
│  If section selected → Deselect                                         │
│  If nothing selected → Exit edit mode                                   │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### User Guidance System

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      USER GUIDANCE SYSTEM                               │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  1. PERSISTENT INDICATOR BAR (top of viewport)                          │
│  ┌────────────────────────────────────────────────────────────────┐     │
│  │ ✏️ Edit Mode: Click any section to edit • ESC to exit         │     │
│  └────────────────────────────────────────────────────────────────┘     │
│                                                                         │
│  2. HOVER STATES                                                        │
│  ┌─────────────────────────────────────────┐                            │
│  │ Section/Item                            │ ← Blue dashed outline      │
│  │                                         │   on hover                 │
│  │   "Click to edit this section"          │ ← Tooltip appears          │
│  └─────────────────────────────────────────┘                            │
│                                                                         │
│  3. SELECTION STATES                                                    │
│  ┌─────────────────────────────────────────┐                            │
│  │ Selected Section                        │ ← Solid blue outline       │
│  │                                         │   + light blue bg          │
│  └─────────────────────────────────────────┘                            │
│                                                                         │
│  4. BLOCKED ACTION FEEDBACK (toast)                                     │
│  ┌────────────────────────────────────────────────────────────────┐     │
│  │ 🔗 Links disabled in edit mode. Press ESC to exit and navigate │     │
│  └────────────────────────────────────────────────────────────────┘     │
│                                                                         │
│  5. BREADCRUMB IN SIDEBAR                                               │
│  ┌────────────────────────────────────────────────────────────────┐     │
│  │ Services > Data & Documents                                    │     │
│  │ ← Back to section                                              │     │
│  └────────────────────────────────────────────────────────────────┘     │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### Implementation Tasks

#### 2.5.1 Edit Mode Indicator Bar

**File:** `app/components/InlineEditor/EditModeBar.tsx`

- Fixed position at top of viewport
- Shows current state: "Click any section to edit"
- Updates based on selection: "Editing: Services > Data & Documents"
- ESC key handler at this level

#### 2.5.2 Click Interception

**File:** Update `EditableSection.tsx` and `EditableItem.tsx`

- Wrap children in a div that intercepts clicks
- Check if target is a link/button
- If so, prevent default and show toast
- Otherwise, select the section/item

#### 2.5.3 Toast System

**File:** `app/components/InlineEditor/EditModeToast.tsx`

- Simple toast component for feedback
- Auto-dismiss after 3 seconds
- Positioned bottom-center
- Used for blocked actions

#### 2.5.4 Hover States

Update CSS in EditableSection/EditableItem:
- `hover:outline-dashed hover:outline-2 hover:outline-blue-400`
- Tooltip on hover: "Click to edit"

---

## Key Files Reference

| File | Purpose |
|------|---------|
| `app/context/InlineEditContext.tsx` | State management for selections, pending changes |
| `app/components/InlineEditor/EditableSection.tsx` | Wrapper for clickable sections |
| `app/components/InlineEditor/InlineEditSidebar.tsx` | Sidebar form for editing |
| `app/components/InlineEditor/InlineEditToggle.tsx` | Floating pencil button |
| `app/components/services/ServicesPageClient.tsx` | Services page with EditableSection |
| `app/components/pricing/PricingPageClient.tsx` | Pricing page with EditableSection |
| `app/components/faq/FAQPageClient.tsx` | FAQ page with EditableSection |
| `app/components/how-it-works/HowItWorksPageClient.tsx` | How It Works with EditableSection |
| `app/components/home/HomePageClient.tsx` | Home page with EditableSection |

---

## Testing Checklist

- [ ] Click card → selects only that card (not whole section)
- [ ] Breadcrumb shows correct path
- [ ] "Back to section" works
- [ ] ESC key exits properly (item → section → deselect → exit)
- [ ] Links blocked in edit mode with toast
- [ ] Hover states show on sections/items
- [ ] Edit mode bar visible and accurate
- [ ] Changes save correctly for items
- [ ] Works on all 5 marketing pages

---

*Last Updated: December 29, 2025*
