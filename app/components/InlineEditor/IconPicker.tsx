'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import * as LucideIcons from 'lucide-react';
import { cardBgColors, cardBorderColors } from '@/lib/colors';

// ============================================================================
// IconPicker - Searchable icon selector using lucide-react
// ============================================================================
// What: Modal picker that displays lucide icons with search
// Why: Allows users to customize icons throughout the site
// How: Click icon → opens picker → search/select → saves icon name

interface IconPickerProps {
  /** Currently selected icon name */
  currentIcon?: string;
  /** Callback when icon is selected */
  onSelect: (iconName: string) => void;
  /** Callback to close the picker */
  onClose: () => void;
  /** Position for the picker */
  position?: { top: number; left: number };
}

// Common/popular icons to show first
const POPULAR_ICONS = [
  'Check', 'CheckCircle', 'CheckCircle2', 'CircleCheck',
  'Star', 'Heart', 'ThumbsUp', 'Award', 'Trophy', 'Medal',
  'Sparkles', 'Zap', 'ArrowRight', 'ChevronRight', 'MoveRight',
  'Clock', 'Calendar', 'Timer', 'Shield', 'ShieldCheck', 'Lock', 'Key',
  'User', 'Users', 'UserCheck', 'Mail', 'MessageSquare', 'Phone',
  'Home', 'Building', 'Store', 'DollarSign', 'CreditCard', 'Wallet',
  'FileText', 'File', 'Folder', 'Settings', 'Wrench', 'Search', 'Eye',
  'Target', 'Rocket', 'Send', 'Share', 'Globe', 'Lightbulb', 'Flame',
];

export default function IconPicker({
  currentIcon = 'Check',
  onSelect,
  onClose,
  position,
}: IconPickerProps) {
  const [search, setSearch] = useState('');
  const [selectedIcon, setSelectedIcon] = useState(currentIcon);
  const pickerRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  // Get all icon names from lucide (computed once, memoized)
  const allIconNames = useMemo(() => {
    const icons = Object.keys(LucideIcons).filter((key) => {
      // Must start with uppercase
      if (!/^[A-Z]/.test(key)) return false;
      // Exclude Icon suffix versions (duplicates like CheckIcon vs Check)
      if (key.endsWith('Icon')) return false;
      // Exclude Lucide prefix versions
      if (key.startsWith('Lucide')) return false;
      // Must be a function/component
      const item = (LucideIcons as Record<string, unknown>)[key];
      return typeof item === 'function';
    });
    return icons;
  }, []);

  // Focus search on mount
  useEffect(() => {
    searchRef.current?.focus();
  }, []);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  // Filter icons based on search
  const filteredIcons = useMemo(() => {
    const searchLower = search.toLowerCase();
    if (!search) {
      // Show popular icons first, then all others
      const popularSet = new Set(POPULAR_ICONS);
      const others = allIconNames.filter((name) => !popularSet.has(name)).slice(0, 100);
      return [...POPULAR_ICONS.filter((name) => allIconNames.includes(name)), ...others];
    }
    return allIconNames.filter((name) => name.toLowerCase().includes(searchLower)).slice(0, 100);
  }, [search, allIconNames]);

  const handleSelect = (iconName: string) => {
    setSelectedIcon(iconName);
    onSelect(iconName);
    onClose();
  };

  // Render an icon by name
  const renderIcon = (iconName: string) => {
    const IconComponent = (LucideIcons as Record<string, React.ComponentType<{ size?: number; className?: string }>>)[iconName];
    if (!IconComponent) return null;
    return <IconComponent size={24} className="text-gray-700 dark:text-gray-300" />;
  };

  return (
    <div
      ref={pickerRef}
      data-admin-ui="true"
      className={`fixed z-[10001] ${cardBgColors.base} ${cardBorderColors.light} rounded-xl shadow-2xl p-4 w-80 max-h-96 overflow-hidden flex flex-col`}
      style={position ? { top: position.top, left: position.left } : { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-900 dark:text-gray-100">Choose Icon</h3>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-500 dark:text-gray-400"
          aria-label="Close"
        >
          <LucideIcons.X size={18} />
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-3">
        <LucideIcons.Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
        />
        <input
          ref={searchRef}
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search icons..."
          className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Icon Grid */}
      <div className="overflow-y-auto flex-1">
        <div className="grid grid-cols-6 gap-1">
          {filteredIcons.map((iconName) => (
            <button
              key={iconName}
              onClick={() => handleSelect(iconName)}
              title={iconName}
              className={`
                p-2 rounded-lg transition-colors flex items-center justify-center
                ${selectedIcon === iconName
                  ? 'bg-blue-100 dark:bg-blue-900 ring-2 ring-blue-500'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                }
              `}
            >
              {renderIcon(iconName)}
            </button>
          ))}
        </div>
        {filteredIcons.length === 0 && (
          <p className="text-center text-gray-500 dark:text-gray-400 py-4">
            {search
              ? `No icons found for "${search}"`
              : `Loading icons... (${allIconNames.length} available)`}
          </p>
        )}
      </div>

      {/* Current selection */}
      <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 flex items-center gap-2">
        <span className="text-xs text-gray-500 dark:text-gray-400">Selected:</span>
        <div className="flex items-center gap-1.5 px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">
          {renderIcon(selectedIcon)}
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{selectedIcon}</span>
        </div>
      </div>
    </div>
  );
}
