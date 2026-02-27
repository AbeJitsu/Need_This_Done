'use client';

import { useIndexingOptional, IndexingStatus } from './IndexingContext';

// ============================================================================
// Chatbot Button Component
// ============================================================================
// What: Floating pill button to open the chatbot
// Why: Always-accessible entry point for help on every page
// How: Mobile: left edge, vertically centered. Desktop: bottom-right, stacked above wizard

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
 * Floating chat pill button that appears in the bottom-right corner.
 *
 * Design features:
 * - Mobile: left edge, vertically centered; Desktop: bottom-right above wizard
 * - Blue pill with "Ask a question" text label
 * - Chat bubble icon + text for clear identification
 * - Hover and focus states for accessibility
 * - Dev mode: Shows indexing status indicator
 */
export default function ChatbotButton({ onClick }: ChatbotButtonProps) {
  const indexing = useIndexingOptional();

  // Show dev indicator only in development mode
  const showDevIndicator = indexing?.isDevMode && indexing.status !== 'unknown';

  return (
    <button
      onClick={onClick}
      className="fixed top-1/2 -translate-y-1/2 left-0 sm:translate-y-0 sm:top-auto sm:left-auto sm:bottom-20 sm:right-6 z-40
                 bg-white/40 backdrop-blur-xl
                 border border-white/50
                 text-gray-700
                 animate-pulse [animation-duration:3s]
                 hover:bg-gray-900 hover:text-white hover:border-transparent
                 hover:[animation:none]
                 rounded-r-2xl sm:rounded-full p-3 sm:px-5 sm:py-3
                 flex items-center gap-2
                 text-sm font-semibold
                 shadow-lg shadow-blue-500/20
                 hover:shadow-xl hover:shadow-blue-500/30
                 transition-all duration-200 ease-in-out
                 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      aria-label="Open AI chat assistant"
      title="Ask a question"
    >
      {/* Chat bubble icon */}
      <svg
        className="w-5 h-5"
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
      <span className="hidden sm:inline">Ask a question</span>

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
