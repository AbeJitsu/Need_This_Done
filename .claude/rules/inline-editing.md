# Inline Editing Rule

Components that trigger actions (modals, navigation, form submissions) must respect edit mode.

## Pattern

When a component has click handlers that do something other than navigation:

```typescript
import { useInlineEdit } from '@/context/InlineEditContext';

export default function MyComponent() {
  const { isEditMode } = useInlineEdit();

  const handleClick = () => {
    // Block action in edit mode - let EditableItem handle the click
    if (isEditMode) return;

    // Normal action here
    openModal();
  };
}
```

## When to Apply

Apply this pattern when:
- Component opens a modal on click
- Component triggers form submission
- Component has custom click behavior beyond simple links

## Wrapping with EditableItem

Array items in marketing pages should be wrapped with EditableItem:

```typescript
import { EditableItem } from '@/components/InlineEditor';

{items.map((item, index) => (
  <EditableItem
    key={index}
    sectionKey="sectionName"
    arrayField="items"
    index={index}
    label={item.title}
    content={item as unknown as Record<string, unknown>}
  >
    <YourComponent {...item} />
  </EditableItem>
))}
```

## Marketing Pages Checklist

All marketing pages (Home, Services, Pricing, FAQ, How It Works) should:
1. Be wrapped in `InlineEditProvider` at the layout level
2. Have sections wrapped in `EditableSection`
3. Have array items wrapped in `EditableItem`
4. Have interactive components respect `isEditMode`
