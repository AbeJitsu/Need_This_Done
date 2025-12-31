import Link from 'next/link';
import {
  AccentColor,
  titleColors,
  topBorderColors,
  cardHoverColors,
  formInputColors,
  mutedTextColors,
} from '@/lib/colors';
import { CheckmarkCircle } from '@/components/ui/icons/CheckmarkCircle';

// ============================================================================
// ServiceCard Component
// ============================================================================
// Reusable card for displaying service offerings.
// - "compact" variant: title + tagline (teaser for home page, links to services)
// - "full" variant: title + description + bullet details (complete info)

interface ServiceCardProps {
  title: string;
  tagline: string;
  description: string;
  details?: string;
  color: AccentColor;
  variant?: 'compact' | 'full';
  href?: string;
  onClick?: () => void;
}

export default function ServiceCard({
  title,
  tagline,
  description,
  details,
  color,
  variant = 'full',
  href,
  onClick,
}: ServiceCardProps) {
  const isCompact = variant === 'compact';

  // Parse details string into bullet points (split by comma)
  const detailsList = details
    ? details.split(',').map(s => s.trim()).filter(s => s.length > 0)
    : [];

  const cardContent = (
    <div className="flex flex-col h-full">
      <h2 className={`font-bold mb-3 text-xl ${titleColors[color]}`}>
        {title}
      </h2>

      {isCompact ? (
        // Compact: Just tagline as teaser
        <>
          <p className={`${formInputColors.helper} text-base`}>
            {tagline}
          </p>
          <p className={`text-sm font-medium mt-auto pt-4 ${titleColors[color]}`}>
            Learn more →
          </p>
        </>
      ) : (
        // Full: Description + bullet points
        <>
          <p className={`${formInputColors.helper} text-base mb-4`}>
            {description}
          </p>

          {detailsList.length > 0 && (
            <ul className="space-y-2 mt-auto">
              {detailsList.map((detail, index) => (
                <li key={index} className="flex items-start gap-2">
                  <CheckmarkCircle color={color} size="sm" className="mt-0.5" />
                  <span className={`${mutedTextColors.light} text-sm`}>
                    {detail}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );

  const cardClasses = `p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 border-t-4 ${topBorderColors[color]} transition-all duration-300 ${cardHoverColors[color]} hover:shadow-[0_0_8px_0px_rgba(0,0,0,0.1)] dark:hover:shadow-[0_0_8px_0px_rgba(255,255,255,0.15)] h-full`;

  // Wrap in Link if href is provided
  if (href) {
    return (
      <Link href={href} className={`block ${cardClasses}`}>
        {cardContent}
      </Link>
    );
  }

  // Make clickable button if onClick is provided
  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={`block text-left w-full ${cardClasses} cursor-pointer`}
      >
        {cardContent}
      </button>
    );
  }

  return (
    <div className={cardClasses}>
      {cardContent}
    </div>
  );
}
