'use client';

import { ReactNode } from 'react';
import { softBgColors, uiChromeBg } from '@/lib/colors';

// ============================================================================
// ArrayField - Repeatable Item List
// ============================================================================
// What: Manages a list of items (FAQ questions, pricing tiers, etc.)
// Why: Many content types have arrays of similar items
// How: Render function pattern for flexibility, add/remove/reorder controls

interface ArrayFieldProps<T> {
  label: string;
  items: T[];
  onChange: (items: T[]) => void;
  renderItem: (item: T, index: number, onChange: (item: T) => void) => ReactNode;
  createItem: () => T;
  itemLabel?: (item: T, index: number) => string;
  maxItems?: number;
  minItems?: number;
  hint?: string;
  className?: string;
}

export default function ArrayField<T>({
  label,
  items,
  onChange,
  renderItem,
  createItem,
  itemLabel,
  maxItems,
  minItems = 0,
  hint,
  className = '',
}: ArrayFieldProps<T>) {
  const canAdd = maxItems === undefined || items.length < maxItems;
  const canRemove = items.length > minItems;

  const handleAdd = () => {
    if (canAdd) {
      onChange([...items, createItem()]);
    }
  };

  const handleRemove = (index: number) => {
    if (canRemove) {
      onChange(items.filter((_, i) => i !== index));
    }
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= items.length) return;

    const newItems = [...items];
    [newItems[index], newItems[newIndex]] = [newItems[newIndex], newItems[index]];
    onChange(newItems);
  };

  const handleItemChange = (index: number, newItem: T) => {
    const newItems = [...items];
    newItems[index] = newItem;
    onChange(newItems);
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
          <span className="ml-2 text-xs text-gray-400 dark:text-gray-500">
            ({items.length} {items.length === 1 ? 'item' : 'items'})
          </span>
        </label>

        {canAdd && (
          <button
            type="button"
            onClick={handleAdd}
            className={`
              px-3 py-1 text-xs font-medium rounded-full
              ${softBgColors.blue}
              text-blue-600 dark:text-blue-200
              hover:bg-blue-200 dark:hover:bg-blue-700
              transition-colors duration-150
            `}
          >
            + Add Item
          </button>
        )}
      </div>

      {hint && (
        <p className="text-xs text-gray-500 dark:text-gray-400">{hint}</p>
      )}

      {/* Items */}
      <div className="space-y-3">
        {items.map((item, index) => (
          <div
            key={index}
            className={`
              relative p-4 rounded-lg
              ${uiChromeBg.panel}
              border border-gray-200 dark:border-gray-600
            `}
          >
            {/* Item header with controls */}
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                {itemLabel ? itemLabel(item, index) : `Item ${index + 1}`}
              </span>

              <div className="flex items-center gap-1">
                {/* Move up */}
                <button
                  type="button"
                  onClick={() => handleMove(index, 'up')}
                  disabled={index === 0}
                  className="
                    p-1 rounded text-gray-400 dark:text-gray-500
                    hover:text-gray-600 dark:hover:text-gray-300
                    hover:bg-gray-200 dark:hover:bg-gray-600
                    disabled:opacity-30 disabled:cursor-not-allowed
                    transition-colors duration-150
                  "
                  title="Move up"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  </svg>
                </button>

                {/* Move down */}
                <button
                  type="button"
                  onClick={() => handleMove(index, 'down')}
                  disabled={index === items.length - 1}
                  className="
                    p-1 rounded text-gray-400 dark:text-gray-500
                    hover:text-gray-600 dark:hover:text-gray-300
                    hover:bg-gray-200 dark:hover:bg-gray-600
                    disabled:opacity-30 disabled:cursor-not-allowed
                    transition-colors duration-150
                  "
                  title="Move down"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Remove */}
                {canRemove && (
                  <button
                    type="button"
                    onClick={() => handleRemove(index)}
                    className="
                      p-1 rounded text-gray-400 dark:text-gray-500
                      hover:text-red-600 dark:hover:text-red-400
                      hover:bg-red-50 dark:hover:bg-red-900/30
                      transition-colors duration-150
                    "
                    title="Remove item"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            </div>

            {/* Item content - rendered by parent */}
            {renderItem(item, index, (newItem) => handleItemChange(index, newItem))}
          </div>
        ))}
      </div>

      {/* Empty state */}
      {items.length === 0 && (
        <div className="p-6 text-center rounded-lg border-2 border-dashed border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No items yet. Click &ldquo;Add Item&rdquo; to get started.
          </p>
        </div>
      )}
    </div>
  );
}
