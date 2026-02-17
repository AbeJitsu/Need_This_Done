'use client';

// ============================================
// FLOATING "HELP ME CHOOSE" BUTTON
// ============================================
// Fixed-position button in the bottom-right corner.
// Positioned above the chatbot button (bottom-24 vs chatbot's bottom-6).

interface WizardFloatingButtonProps {
  onClick: () => void;
}

export default function WizardFloatingButton({ onClick }: WizardFloatingButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="fixed bottom-24 right-6 z-40 flex items-center gap-2 rounded-full bg-emerald-600 text-white px-5 py-3 text-sm font-semibold shadow-lg shadow-emerald-500/25 hover:bg-emerald-700 hover:shadow-xl hover:shadow-emerald-500/30 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
      aria-label="Help me choose the right plan"
    >
      <span aria-hidden="true">🤔</span>
      Help me choose
    </button>
  );
}
