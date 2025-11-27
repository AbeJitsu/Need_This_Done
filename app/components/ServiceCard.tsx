import {
  AccentColor,
  titleColors,
  leftBorderColors,
  topBorderColors,
} from '@/lib/colors';

// ============================================================================
// ServiceCard Component
// ============================================================================
// Reusable card for displaying service offerings.
// - "compact" variant: title + tagline (for home page)
// - "full" variant: title + description + details (for services page)

interface ServiceCardProps {
  title: string;
  tagline: string;
  description: string;
  details?: string;
  color: AccentColor;
  variant?: 'compact' | 'full';
}

export default function ServiceCard({
  title,
  tagline,
  description,
  details,
  color,
  variant = 'full',
}: ServiceCardProps) {
  const isCompact = variant === 'compact';

  // Compact uses left border, full uses top border
  const borderClass = isCompact
    ? `border-l-4 ${leftBorderColors[color]}`
    : `border-t-4 ${topBorderColors[color]}`;

  return (
    <div
      className={`p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 ${borderClass} transition-all hover:border-gray-400 hover:shadow-[0_0_8px_0px_rgba(0,0,0,0.1)] dark:hover:border-gray-500 dark:hover:shadow-[0_0_8px_0px_rgba(255,255,255,0.15)]`}
    >
      <h3 className={`font-semibold mb-2 text-lg ${titleColors[color]}`}>
        {title}
      </h3>
      {isCompact ? (
        <p className="text-gray-600 dark:text-gray-300 text-sm">
          {tagline}
        </p>
      ) : (
        <>
          <p className="text-gray-600 dark:text-gray-300 mb-2">
            {description}
          </p>
          {details && (
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {details}
            </p>
          )}
        </>
      )}
    </div>
  );
}
