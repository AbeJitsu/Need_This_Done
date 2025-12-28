// ============================================================================
// Status Badge Component - Display Project Status
// ============================================================================
// Shows the current status of a project with color-coded variants.
// Used throughout the app: in cards, modals, lists.
// Uses centralized colors from lib/colors.ts for consistency.

import { accentColors } from '@/lib/colors';

interface StatusBadgeProps {
  status: 'submitted' | 'in_review' | 'scheduled' | 'in_progress' | 'completed';
  size?: 'sm' | 'md';
}

export default function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  // ============================================================================
  // Define Status Styling - Using centralized color patterns
  // ============================================================================
  // Each status has a color, background, and label
  // Using accentColors pattern: -100 bg light / -500 bg dark, -700 text light / -100 text dark

  const statusConfig = {
    submitted: {
      bg: accentColors.gray.bg,
      text: accentColors.gray.text,
      label: 'Submitted',
    },
    in_review: {
      bg: accentColors.blue.bg,
      text: accentColors.blue.text,
      label: 'In Review',
    },
    scheduled: {
      bg: accentColors.orange.bg,
      text: accentColors.orange.text,
      label: 'Scheduled',
    },
    in_progress: {
      bg: accentColors.purple.bg,
      text: accentColors.purple.text,
      label: 'In Progress',
    },
    completed: {
      bg: accentColors.green.bg,
      text: accentColors.green.text,
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
