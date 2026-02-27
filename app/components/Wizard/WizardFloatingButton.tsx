'use client';

// ============================================
// FLOATING "HELP ME CHOOSE" BUTTON
// ============================================
// Mobile: right edge, vertically centered. Desktop: bottom-right (prime CTA spot).
// Chatbot pill mirrors on the left edge on mobile; both revert to bottom-right on desktop.

interface WizardFloatingButtonProps {
  onClick: () => void;
}

export default function WizardFloatingButton({ onClick }: WizardFloatingButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="fixed top-1/2 -translate-y-1/2 right-0 sm:translate-y-0 sm:top-auto sm:bottom-6 sm:right-6 z-40 flex items-center gap-2
                 rounded-l-2xl sm:rounded-full
                 bg-white/40 backdrop-blur-xl
                 border border-white/50
                 text-gray-700
                 animate-pulse [animation-duration:3s]
                 hover:bg-gray-900 hover:text-white hover:border-transparent
                 hover:[animation:none]
                 p-3 sm:px-5 sm:py-3 text-sm font-semibold
                 shadow-lg shadow-emerald-500/20
                 hover:shadow-xl hover:shadow-emerald-500/30
                 transition-all duration-200
                 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
      aria-label="Help me choose the right plan"
    >
      <span aria-hidden="true">🤔</span>
      <span className="hidden sm:inline">Help me choose</span>
    </button>
  );
}
