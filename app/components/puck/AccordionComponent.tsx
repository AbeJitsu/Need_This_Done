'use client';

import { useState, useEffect } from 'react';
import { getPuckFullColors, PuckEmptyState } from '@/lib/puck-utils';
import { cardBgColors } from '@/lib/colors';

// ============================================================================
// INTERACTIVE ACCORDION COMPONENT
// Supports single/multiple open states and smooth animations
// DRY: Uses getPuckFullColors() from puck-utils for consistent color handling
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

export default function AccordionComponent({
  items,
  allowMultiple,
  style,
  accentColor,
}: AccordionComponentProps) {
  // Track which items are open
  const [openItems, setOpenItems] = useState<Set<number>>(new Set());

  // Get colors from centralized utility
  const colors = getPuckFullColors(accentColor);

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

  // Style classes - use centralized colors
  const styleClasses: Record<string, { wrapper: string; item: string }> = {
    bordered: {
      wrapper: `border ${colors.lightBorder} rounded-xl overflow-hidden divide-y divide-gray-200 dark:divide-gray-700`,
      item: '',
    },
    separated: {
      wrapper: 'space-y-3',
      item: `border ${colors.lightBorder} rounded-xl overflow-hidden`,
    },
    minimal: {
      wrapper: 'divide-y divide-gray-200 dark:divide-gray-700',
      item: '',
    },
  };
  const styles = styleClasses[style] || styleClasses.bordered;

  // Empty state - use shared component
  if (!items || items.length === 0) {
    return (
      <PuckEmptyState message="Add accordion items to get started" />
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
              className={`w-full flex items-center justify-between cursor-pointer px-5 py-4 ${colors.subtleBg} ${colors.hoverBg} transition-colors text-left`}
              aria-expanded={isOpen}
              aria-controls={`accordion-content-${index}`}
            >
              <span className="font-medium text-gray-900 dark:text-gray-100">
                {item.title || 'Untitled'}
              </span>
              <svg
                className={`w-5 h-5 ${colors.accentText} transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
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
              <div className={`px-5 py-4 text-gray-600 dark:text-gray-400 ${cardBgColors.base}`}>
                {item.content || 'No content'}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
