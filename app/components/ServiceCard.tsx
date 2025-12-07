import Link from 'next/link';
import {
  AccentColor,
  titleColors,
  topBorderColors,
  cardHoverColors,
  checkmarkColors,
} from '@/lib/colors';

// ============================================================================
// ServiceCard Component
// ============================================================================
// Reusable card for displaying service offerings.
// - "compact" variant: title + description + bullet details (for home page)
// - "full" variant: title + description + details paragraph (for services page)

interface ServiceCardProps {
  title: string;
  tagline?: string;  // Kept for backwards compatibility
  description: string;
  details?: string;
  color: AccentColor;
  variant?: 'compact' | 'full';  // Kept for backwards compatibility
  href?: string;
}

export default function ServiceCard({
  title,
  description,
  details,
  color,
  href,
}: ServiceCardProps) {
  // Parse details string into bullet points (split by comma)
  const detailsList = details
    ? details.split(',').map(s => s.trim()).filter(s => s.length > 0)
    : [];

  const cardContent = (
    <div className="flex flex-col h-full">
      <h3 className={`font-bold mb-3 text-lg ${titleColors[color]}`}>
        {title}
      </h3>

      <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
        {description}
      </p>

      {detailsList.length > 0 && (
        <ul className="space-y-2 mt-auto">
          {detailsList.map((detail, index) => (
            <li key={index} className="flex items-start gap-2">
              <div className={`w-5 h-5 rounded-full ${checkmarkColors[color].bg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                <svg className={`w-3 h-3 ${checkmarkColors[color].icon}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="text-gray-500 dark:text-gray-400 text-xs">
                {detail}
              </span>
            </li>
          ))}
        </ul>
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

  return (
    <div className={cardClasses}>
      {cardContent}
    </div>
  );
}
