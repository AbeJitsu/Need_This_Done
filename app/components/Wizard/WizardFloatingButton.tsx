'use client';

// ============================================
// FLOATING "HELP ME CHOOSE" BUTTON
// ============================================
// Fixed-position pill button in the bottom-right corner (prime CTA spot).
// Chatbot pill sits above at bottom-20; admin edit toggle is bottom-left.

interface WizardFloatingButtonProps {
  onClick: () => void;
}

export default function WizardFloatingButton({ onClick }: WizardFloatingButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="fixed bottom-6 right-0 sm:right-6 z-40 flex items-center gap-2
                 rounded-l-2xl sm:rounded-full
                 bg-[#08562666] backdrop-blur-xl backdrop-brightness-50
                 hover:bg-[#08562680]
                 text-white [text-shadow:0_1px_2px_rgba(0,0,0,0.3)]
                 border border-white/20 hover:border-white/30
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
