import Link from 'next/link';
import {
  AccentColor,
  titleColors,
  leftBorderColors,
  topBorderColors,
  cardHoverColors,
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
  href?: string;
}

export default function ServiceCard({
  title,
  tagline,
  description,
  details,
  color,
  variant = 'full',
  href,
}: ServiceCardProps) {
  const isCompact = variant === 'compact';

  // Compact uses left border, full uses top border
  const borderClass = isCompact
    ? `border-l-4 ${leftBorderColors[color]}`
    : `border-t-4 ${topBorderColors[color]}`;

  const cardContent = (
    <>
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
    </>
  );

  const cardClasses = `p-6 bg-white dark:bg-gray-800 rounded-xl border-2 border-gray-400 dark:border-gray-500 ${borderClass} transition-all duration-300 ${cardHoverColors[color]} hover:shadow-lg hover:-translate-y-1 active:scale-98 dark:hover:shadow-[0_0_12px_0px_rgba(255,255,255,0.2)]`;

  // Wrap in Link if href is provided
  if (href) {
    return (
      <Link href={href} className={`block ${cardClasses}`}>
        {cardContent}
      </Link>
    );
  }

  return (
    <div className={cardClasses}>
      {cardContent}
    </div>
  );
}
