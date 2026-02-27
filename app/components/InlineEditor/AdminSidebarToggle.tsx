'use client';

import { useAuth } from '@/context/AuthContext';
import { useInlineEdit } from '@/context/InlineEditContext';
import { focusRingClasses } from '@/lib/colors';

// ============================================================================
// Admin Sidebar Toggle - Floating button to open editing sidebar
// ============================================================================
// What: A floating pencil button that appears for admins in the bottom-left corner
// Why: Provides easy access to page editing without cluttering visitor-facing UI
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
        fixed bottom-20 left-4 sm:bottom-6 sm:left-6 z-[60]
        w-12 h-12 rounded-full
        flex items-center justify-center
        transition-all duration-200
        ${isEditMode
          ? 'bg-gray-900 text-white shadow-lg shadow-blue-500/20 ring-2 ring-blue-500 ring-offset-2 hover:shadow-xl hover:shadow-blue-500/30'
          : 'bg-white/40 backdrop-blur-xl border border-white/50 text-gray-700 shadow-lg shadow-blue-500/20 animate-pulse [animation-duration:3s] hover:bg-gray-900 hover:text-white hover:border-transparent hover:shadow-xl hover:shadow-blue-500/30 hover:[animation:none]'}
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
