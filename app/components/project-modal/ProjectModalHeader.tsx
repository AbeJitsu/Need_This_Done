import { cardBgColors } from '@/lib/colors';

// ============================================================================
// Project Modal Header Component
// ============================================================================
// What: Displays the modal title, email, and close button.
// Why: Separates header concerns from main modal logic.
// How: Renders a sticky header with project name and close action.

interface ProjectModalHeaderProps {
  title: string;
  email?: string;
  onClose: () => void;
}

export default function ProjectModalHeader({
  title,
  email,
  onClose,
}: ProjectModalHeaderProps) {
  return (
    <div className={`sticky top-0 ${cardBgColors.base} border-b border-gray-200 dark:border-gray-700 p-6 flex items-center justify-between`}>
      <div>
        <h2
          id="project-modal-title"
          className="text-2xl font-bold text-gray-900 dark:text-gray-100"
        >
          {title}
        </h2>
        {email && (
          <p className="text-sm text-gray-600 dark:text-gray-400">{email}</p>
        )}
      </div>
      <button
        onClick={onClose}
        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-2xl"
      >
        ✕
      </button>
    </div>
  );
}
