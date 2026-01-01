// ============================================================================
// Item Editor View - Edit a specific array item (card, FAQ, etc.)
// ============================================================================
// What: The view for editing a specific item when clicked on the page
// Why: Extracted from AdminSidebar to reduce its size
// How: Shows breadcrumb, array operations bar, and item fields

import { BackButton, ItemBreadcrumb } from './SectionNavigation';
import { solidButtonColors } from '@/lib/colors';

interface ItemEditorViewProps {
  sectionLabel: string;
  itemLabel: string;
  itemIndex: number;
  arrayLength: number;
  onNavigateUp: () => void;
  onMoveItem: (direction: 'up' | 'down') => void;
  onAddItem: () => void;
  onDeleteItem: () => void;
  children: React.ReactNode; // The item fields
}

export default function ItemEditorView({
  sectionLabel,
  itemLabel,
  itemIndex,
  arrayLength,
  onNavigateUp,
  onMoveItem,
  onAddItem,
  onDeleteItem,
  children,
}: ItemEditorViewProps) {
  return (
    <div>
      {/* Breadcrumb navigation */}
      <BackButton onClick={onNavigateUp} label="All Sections" />

      {/* Breadcrumb path */}
      <ItemBreadcrumb sectionLabel={sectionLabel} itemLabel={itemLabel} />

      {/* Array Operations Bar */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200 dark:border-gray-700">
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => onMoveItem('up')}
            disabled={itemIndex === 0}
            className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30 transition-colors"
            aria-label="Move up"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => onMoveItem('down')}
            disabled={itemIndex === arrayLength - 1}
            className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30 transition-colors"
            aria-label="Move down"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onAddItem}
            className={`
              flex items-center gap-1 px-2 py-1 rounded text-xs font-medium
              ${solidButtonColors.green.bg} ${solidButtonColors.green.hover} ${solidButtonColors.green.text}
              transition-colors
            `}
            aria-label="Add new item"
          >
            <span aria-hidden="true">+</span> Add
          </button>
          <button
            type="button"
            onClick={onDeleteItem}
            className="flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-red-500 text-white hover:opacity-90 transition-opacity"
            aria-label="Delete item"
          >
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Delete
          </button>
        </div>
      </div>

      {/* Item fields */}
      {children}
    </div>
  );
}
