// ============================================================================
// Inline Editor Components - Export all inline editing components
// ============================================================================

// Section-based editing (for marketing pages like Home, Services, etc.)
export { default as AdminSidebar } from './AdminSidebar';
export { default as AdminSidebarToggle } from './AdminSidebarToggle';
export { default as EditableSection } from './EditableSection';
export { default as EditableItem } from './EditableItem';
export { default as EditModeBar } from './EditModeBar';
export { default as EditModeTutorial } from './EditModeTutorial';
export { default as SortableSections } from './SortableSections';
export { default as SortableItemsWrapper } from './SortableItemsWrapper';

// Inline text editor (click text to edit in place with TipTap)
export { default as InlineTextEditor } from './InlineTextEditor';

// Editable wrapper - wrap any element to make it editable
export { default as Editable } from './Editable';

// EditableLink - for elements that are both links and editable (conditional Link wrapper)
export { default as EditableLink } from './EditableLink';

// EditableCard - for card elements that are links in view mode but editable in edit mode
export { default as EditableCard } from './EditableCard';

// Choice menu - context menu for edit mode actions (edit card vs edit modal)
export { default as ChoiceMenu } from './ChoiceMenu';
export type { ChoiceOption } from './ChoiceMenu';

// Icon picker - searchable icon selector using lucide-react
export { default as IconPicker } from './IconPicker';

// Visual editing tools (resize, alignment)
export { default as ResizableWrapper } from './ResizableWrapper';
export { default as AlignmentToolbar, useAlignment, getTextAlignClass, getFlexAlignClass, getBlockAlignClass } from './AlignmentToolbar';
export type { Alignment } from './AlignmentToolbar';

// Note: AdminEditBar, PropertySidebar, and EditableWrapper
// are internal components used by the section-based editing system above.
