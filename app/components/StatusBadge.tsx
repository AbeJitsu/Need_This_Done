// ============================================================================
// Status Badge Component - Display Project Status
// ============================================================================
// Shows the current status of a project with color-coded variants.
// Used throughout the app: in cards, modals, lists.

interface StatusBadgeProps {
  status: 'submitted' | 'in_review' | 'scheduled' | 'in_progress' | 'completed';
  size?: 'sm' | 'md';
}

export default function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  // ============================================================================
  // Define Status Styling
  // ============================================================================
  // Each status has a color, background, and label

  const statusConfig = {
    submitted: {
      bg: 'bg-gray-100 dark:bg-gray-700',
      text: 'text-gray-700 dark:text-gray-300',
      label: 'Submitted',
    },
    in_review: {
      bg: 'bg-blue-100 dark:bg-blue-900',
      text: 'text-blue-700 dark:text-blue-300',
      label: 'In Review',
    },
    scheduled: {
      bg: 'bg-amber-100 dark:bg-amber-900',
      text: 'text-amber-700 dark:text-amber-300',
      label: 'Scheduled',
    },
    in_progress: {
      bg: 'bg-purple-100 dark:bg-purple-900',
      text: 'text-purple-700 dark:text-purple-300',
      label: 'In Progress',
    },
    completed: {
      bg: 'bg-green-100 dark:bg-green-900',
      text: 'text-green-700 dark:text-green-300',
      label: 'Completed',
    },
  };

  const config = statusConfig[status];
  const sizeClass = size === 'sm' ? 'px-2 py-1 text-xs' : 'px-3 py-1 text-sm';

  return (
    <span
      className={`${sizeClass} ${config.bg} ${config.text} font-medium rounded-full whitespace-nowrap`}
    >
      {config.label}
    </span>
  );
}
