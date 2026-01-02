'use client';

import { useEffect, useRef } from 'react';

// ============================================================================
// Choice Menu - Context menu for edit mode actions
// ============================================================================
// What: Popup menu with choices when user clicks an editable element
// Why: Some elements have multiple edit targets (e.g., card vs modal)
// How: Positioned at click location, closes on selection or click outside

export interface ChoiceOption {
  label: string;
  icon?: string;
  action: () => void;
}

interface ChoiceMenuProps {
  options: ChoiceOption[];
  position: { x: number; y: number };
  onClose: () => void;
}

export default function ChoiceMenu({ options, position, onClose }: ChoiceMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    // Small delay to prevent immediate close
    const timer = setTimeout(() => {
      document.addEventListener('click', handleClickOutside);
    }, 50);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('click', handleClickOutside);
    };
  }, [onClose]);

  // Close on escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div
      ref={menuRef}
      data-admin-ui="true"
      className="fixed z-[9999] bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 py-1 min-w-[160px]"
      style={{
        top: position.y,
        left: position.x,
      }}
    >
      {options.map((option, index) => (
        <button
          key={index}
          onClick={() => {
            option.action();
            onClose();
          }}
          className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 transition-colors"
        >
          {option.icon && <span>{option.icon}</span>}
          {option.label}
        </button>
      ))}
    </div>
  );
}
