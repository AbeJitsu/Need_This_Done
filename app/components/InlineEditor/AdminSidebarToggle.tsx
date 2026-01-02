'use client';

import { useAuth } from '@/context/AuthContext';
import { useInlineEdit } from '@/context/InlineEditContext';
import { focusRingClasses } from '@/lib/colors';

// ============================================================================
// Admin Sidebar Toggle - Floating button to open editing sidebar
// ============================================================================
// What: A floating gear button that appears for admins
// Why: Provides easy access to page editing without cluttering the UI
// How: Shows on all pages for admins, toggles the edit sidebar open/closed

export default function AdminSidebarToggle() {
  const { isAdmin, isAuthenticated } = useAuth();
  const { setSidebarOpen, isEditMode, setEditMode } = useInlineEdit();

  // Only show for authenticated admins
  if (!isAuthenticated || !isAdmin) {
    return null;
  }

  const handleToggle = () => {
    if (isEditMode) {
      // Exit edit mode entirely
      setEditMode(false);
      setSidebarOpen(false);
    } else {
      // Enter edit mode - DON'T auto-open sidebar
      // User can click on any text to edit it directly
      setEditMode(true);
      // Sidebar stays closed - inline editing is primary
    }
  };

  return (
    // z-[60] is higher than sidebar (z-50) so toggle remains clickable when sidebar is open
    <button
      onClick={handleToggle}
      className={`
        fixed bottom-24 right-6 z-[60]
        w-12 h-12 rounded-full
        bg-gray-900 dark:bg-gray-100
        text-white dark:text-gray-900
        shadow-lg hover:shadow-xl
        flex items-center justify-center
        transition-all duration-200
        hover:scale-110
        ${isEditMode ? 'ring-2 ring-blue-500 ring-offset-2' : ''}
        ${focusRingClasses.blue}
      `}
      title={isEditMode ? 'Close editor' : 'Edit this page'}
      aria-label={isEditMode ? 'Close editor' : 'Edit this page'}
    >
      {isEditMode ? (
        // X icon when open
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      ) : (
        // Pencil icon when closed
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      )}
    </button>
  );
}
