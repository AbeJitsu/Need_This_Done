'use client';

import { useState, ReactNode } from 'react';
import { getTabColors } from '@/lib/puck-utils';
import { uiChromeBg } from '@/lib/colors';

// ============================================================================
// INTERACTIVE TABS COMPONENT
// Client component that enables actual tab switching in Puck pages
// ============================================================================

interface Tab {
  label?: string;
  content?: string;
  icon?: string;
}

interface TabsComponentProps {
  tabs: Tab[];
  style: 'underline' | 'pills' | 'boxed';
  accentColor: string;
  fullWidth: 'yes' | 'no';
}

// Icon components for tab labels
const iconMap: Record<string, ReactNode> = {
  star: <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>,
  heart: <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" /></svg>,
  check: <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>,
  info: <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  settings: <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
};

export default function TabsComponent({ tabs, style, accentColor, fullWidth }: TabsComponentProps) {
  const [activeTab, setActiveTab] = useState(0);
  const colors = getTabColors(accentColor);

  // Empty state
  if (!tabs || tabs.length === 0) {
    return (
      <div className="text-center py-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl">
        <p className="text-gray-500 dark:text-gray-400">Add tabs to get started</p>
      </div>
    );
  }

  // Get tab button styles based on style variant and active state
  const getTabClass = (index: number) => {
    const isActive = index === activeTab;
    const baseClass = fullWidth === 'yes' ? 'flex-1 text-center' : '';

    if (style === 'underline') {
      return `px-4 py-3 font-medium text-sm border-b-2 -mb-px transition-colors cursor-pointer ${
        isActive
          ? `${colors.active} ${colors.border}`
          : 'text-gray-500 dark:text-gray-400 border-transparent hover:text-gray-700 dark:hover:text-gray-300'
      } ${baseClass}`;
    } else if (style === 'pills') {
      return `px-4 py-2 font-medium text-sm rounded-lg transition-colors cursor-pointer ${
        isActive
          ? `${colors.bg} text-white`
          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
      } ${baseClass}`;
    } else {
      // boxed style
      return `px-4 py-2 font-medium text-sm rounded-lg transition-colors cursor-pointer ${
        isActive
          ? 'bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-gray-100'
          : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
      } ${baseClass}`;
    }
  };

  // Container styles based on style variant
  const getContainerClass = () => {
    const baseClass = `flex ${fullWidth === 'yes' ? 'w-full' : ''}`;
    if (style === 'boxed') {
      return `${baseClass} ${uiChromeBg.panel} p-1 rounded-xl`;
    } else if (style === 'underline') {
      return `${baseClass} border-b border-gray-200 dark:border-gray-700`;
    }
    return `${baseClass} gap-2`;
  };

  return (
    <div className="w-full">
      {/* Tab Headers */}
      <div className={getContainerClass()} role="tablist">
        {tabs.map((tab, index) => (
          <button
            key={index}
            type="button"
            role="tab"
            aria-selected={index === activeTab}
            aria-controls={`tabpanel-${index}`}
            className={`flex items-center justify-center gap-2 ${getTabClass(index)}`}
            onClick={() => setActiveTab(index)}
          >
            {tab.icon && tab.icon !== 'none' && iconMap[tab.icon]}
            {tab.label || 'Tab'}
          </button>
        ))}
      </div>

      {/* Tab Content - Shows active tab's content */}
      <div
        id={`tabpanel-${activeTab}`}
        role="tabpanel"
        aria-labelledby={`tab-${activeTab}`}
        className="mt-4 p-4 text-gray-700 dark:text-gray-300"
      >
        {tabs[activeTab]?.content || 'No content'}
      </div>
    </div>
  );
}
