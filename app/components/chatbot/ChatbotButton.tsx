'use client';

import { useIndexingOptional, IndexingStatus } from './IndexingContext';
import { getSolidButtonColors } from '@/lib/colors';

// ============================================================================
// Chatbot Button Component
// ============================================================================
// What: Floating action button to open the chatbot
// Why: Always-accessible entry point for help on every page
// How: Fixed position bottom-right, opens modal on click

interface ChatbotButtonProps {
  onClick: () => void;
}

/**
 * Returns the color class for the indexing status indicator.
 */
function getStatusColor(status: IndexingStatus): string {
  switch (status) {
    case 'indexed':
      return 'bg-green-600';
    case 'indexing':
    case 'checking':
      return 'bg-gold-500 animate-pulse';
    case 'not_indexed':
    case 'error':
      return 'bg-red-600';
    default:
      return 'bg-gray-400';
  }
}

/**
 * Returns tooltip text for the indexing status.
 */
function getStatusTooltip(status: IndexingStatus): string {
  switch (status) {
    case 'indexed':
      return 'Page indexed';
    case 'indexing':
      return 'Indexing...';
    case 'checking':
      return 'Checking...';
    case 'not_indexed':
      return 'Not indexed';
    case 'error':
      return 'Indexing error';
    default:
      return 'Unknown';
  }
}

/**
 * Floating chat button that appears in the bottom-right corner.
 *
 * Design features:
 * - Fixed position, always visible
 * - Blue accent matching site theme
 * - Chat bubble icon
 * - Hover and focus states for accessibility
 * - Dark mode support
 * - Dev mode: Shows indexing status indicator
 */
export default function ChatbotButton({ onClick }: ChatbotButtonProps) {
  const indexing = useIndexingOptional();

  // Show dev indicator only in development mode
  const showDevIndicator = indexing?.isDevMode && indexing.status !== 'unknown';

  return (
    <button
      onClick={onClick}
      className={`fixed bottom-6 right-6 z-40
                 ${getSolidButtonColors('blue').bg} ${getSolidButtonColors('blue').hover}
                 ${getSolidButtonColors('blue').text} rounded-full
                 w-14 h-14 flex items-center justify-center
                 shadow-lg hover:shadow-xl
                 transition-all duration-200 ease-in-out
                 hover:scale-105
                 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                 dark:focus:ring-offset-gray-900`}
      aria-label="Open AI chat assistant"
      title="Chat with AI assistant"
    >
      {/* Chat bubble icon */}
      <svg
        className="w-6 h-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
        />
      </svg>

      {/* Dev mode: Indexing status indicator */}
      {showDevIndicator && (
        <span
          className={`absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-white
                      ${getStatusColor(indexing.status)}`}
          title={getStatusTooltip(indexing.status)}
        />
      )}
    </button>
  );
}
