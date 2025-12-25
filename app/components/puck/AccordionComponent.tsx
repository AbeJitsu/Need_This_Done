'use client';

import { useState, useEffect } from 'react';

// ============================================================================
// INTERACTIVE ACCORDION COMPONENT
// Supports single/multiple open states and smooth animations
// ============================================================================

interface AccordionItem {
  title?: string;
  content?: string;
  defaultOpen?: string;
}

interface AccordionComponentProps {
  items: AccordionItem[];
  allowMultiple: 'yes' | 'no';
  style: 'bordered' | 'separated' | 'minimal';
  accentColor: string;
}

// Color mapping for accent colors
const accentMap: Record<string, { border: string; bg: string; text: string; hover: string }> = {
  purple: {
    border: 'border-purple-200 dark:border-purple-800',
    bg: 'bg-purple-50 dark:bg-purple-900/20',
    text: 'text-purple-600 dark:text-purple-400',
    hover: 'hover:bg-purple-100 dark:hover:bg-purple-900/30',
  },
  blue: {
    border: 'border-blue-200 dark:border-blue-800',
    bg: 'bg-blue-50 dark:bg-blue-900/20',
    text: 'text-blue-600 dark:text-blue-400',
    hover: 'hover:bg-blue-100 dark:hover:bg-blue-900/30',
  },
  green: {
    border: 'border-green-200 dark:border-green-800',
    bg: 'bg-green-50 dark:bg-green-900/20',
    text: 'text-green-600 dark:text-green-400',
    hover: 'hover:bg-green-100 dark:hover:bg-green-900/30',
  },
  orange: {
    border: 'border-orange-200 dark:border-orange-800',
    bg: 'bg-orange-50 dark:bg-orange-900/20',
    text: 'text-orange-600 dark:text-orange-400',
    hover: 'hover:bg-orange-100 dark:hover:bg-orange-900/30',
  },
  teal: {
    border: 'border-teal-200 dark:border-teal-800',
    bg: 'bg-teal-50 dark:bg-teal-900/20',
    text: 'text-teal-600 dark:text-teal-400',
    hover: 'hover:bg-teal-100 dark:hover:bg-teal-900/30',
  },
  gray: {
    border: 'border-gray-200 dark:border-gray-700',
    bg: 'bg-gray-50 dark:bg-gray-800/50',
    text: 'text-gray-600 dark:text-gray-400',
    hover: 'hover:bg-gray-100 dark:hover:bg-gray-700/50',
  },
};

export default function AccordionComponent({
  items,
  allowMultiple,
  style,
  accentColor,
}: AccordionComponentProps) {
  // Track which items are open
  const [openItems, setOpenItems] = useState<Set<number>>(new Set());

  const colors = accentMap[accentColor] || accentMap.purple;

  // Initialize open items based on defaultOpen
  useEffect(() => {
    const initialOpen = new Set<number>();
    items.forEach((item, index) => {
      if (item.defaultOpen === 'open') {
        initialOpen.add(index);
      }
    });
    setOpenItems(initialOpen);
  }, [items]);

  // Handle toggle
  const handleToggle = (index: number) => {
    setOpenItems(prev => {
      const next = new Set(prev);

      if (next.has(index)) {
        // Close this item
        next.delete(index);
      } else {
        // Open this item
        if (allowMultiple === 'no') {
          // Close all others first
          next.clear();
        }
        next.add(index);
      }

      return next;
    });
  };

  // Style classes
  const styleClasses: Record<string, { wrapper: string; item: string }> = {
    bordered: {
      wrapper: `border ${colors.border} rounded-xl overflow-hidden divide-y divide-gray-200 dark:divide-gray-700`,
      item: '',
    },
    separated: {
      wrapper: 'space-y-3',
      item: `border ${colors.border} rounded-xl overflow-hidden`,
    },
    minimal: {
      wrapper: 'divide-y divide-gray-200 dark:divide-gray-700',
      item: '',
    },
  };
  const styles = styleClasses[style] || styleClasses.bordered;

  // Empty state
  if (!items || items.length === 0) {
    return (
      <div className="text-center py-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl">
        <p className="text-gray-500 dark:text-gray-400">Add accordion items to get started</p>
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      {items.map((item, index) => {
        const isOpen = openItems.has(index);

        return (
          <div key={index} className={styles.item}>
            {/* Header Button */}
            <button
              type="button"
              onClick={() => handleToggle(index)}
              className={`w-full flex items-center justify-between cursor-pointer px-5 py-4 ${colors.bg} ${colors.hover} transition-colors text-left`}
              aria-expanded={isOpen}
              aria-controls={`accordion-content-${index}`}
            >
              <span className="font-medium text-gray-900 dark:text-gray-100">
                {item.title || 'Untitled'}
              </span>
              <svg
                className={`w-5 h-5 ${colors.text} transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Content Panel - Animated */}
            <div
              id={`accordion-content-${index}`}
              className={`overflow-hidden transition-all duration-200 ease-in-out ${
                isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
              }`}
            >
              <div className="px-5 py-4 text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800">
                {item.content || 'No content'}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
