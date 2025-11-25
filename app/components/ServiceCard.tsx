import React from 'react';

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
  color: 'blue' | 'purple' | 'green';
  variant?: 'compact' | 'full';
}

// Shared color classes used across the site for consistency
const titleColors = {
  blue: 'text-blue-600 dark:text-blue-400',
  purple: 'text-purple-600 dark:text-purple-400',
  green: 'text-green-600 dark:text-green-400',
};

const borderColors = {
  blue: 'border-l-blue-500 hover:border-l-blue-600',
  purple: 'border-l-purple-500 hover:border-l-purple-600',
  green: 'border-l-green-500 hover:border-l-green-600',
};

const topBorderColors = {
  blue: 'border-t-blue-500',
  purple: 'border-t-purple-500',
  green: 'border-t-green-500',
};

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
    ? `border-l-4 ${borderColors[color]}`
    : `border-t-4 ${topBorderColors[color]}`;

  return (
    <div
      className={`p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 ${borderClass} hover:shadow-lg transition-all`}
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
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {details}
            </p>
          )}
        </>
      )}
    </div>
  );
}
