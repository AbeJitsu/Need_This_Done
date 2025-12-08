'use client';

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
 * Floating chat button that appears in the bottom-right corner.
 *
 * Design features:
 * - Fixed position, always visible
 * - Blue accent matching site theme
 * - Chat bubble icon
 * - Hover and focus states for accessibility
 * - Dark mode support
 */
export default function ChatbotButton({ onClick }: ChatbotButtonProps) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 right-6 z-40
                 bg-blue-600 hover:bg-blue-700
                 dark:bg-blue-500 dark:hover:bg-blue-600
                 text-white rounded-full
                 w-14 h-14 flex items-center justify-center
                 shadow-lg hover:shadow-xl
                 transition-all duration-200 ease-in-out
                 hover:scale-105
                 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                 dark:focus:ring-offset-gray-900"
      aria-label="Open chat assistant"
      title="Chat with us"
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
    </button>
  );
}
