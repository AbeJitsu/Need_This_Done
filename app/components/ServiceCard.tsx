'use client';

import Link from 'next/link';
import {
  AccentColor,
  accentColors,
  formInputColors,
  mutedTextColors,
  shadowClasses,
  cardBgColors,
  cardBorderColors,
} from '@/lib/colors';
import { CheckmarkCircle } from '@/components/ui/icons/CheckmarkCircle';
import { Editable } from '@/components/InlineEditor';

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
  onClick?: (e?: React.MouseEvent) => void;
  /** Text for the action link (compact variant only) */
  linkText?: string;
  /** Handler for when the link text is clicked (separate from card click) */
  onLinkClick?: (e: React.MouseEvent) => void;
  /** Base path for inline editing, e.g., "services.cards.0" */
  editBasePath?: string;
  /** Optional icon to display next to the title */
  icon?: React.ReactNode;
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
  linkText = 'Learn more →',
  onLinkClick,
  editBasePath,
  icon,
}: ServiceCardProps) {
  const isCompact = variant === 'compact';

  // Parse details string into bullet points (split by comma)
  const detailsList = details
    ? details.split(',').map(s => s.trim()).filter(s => s.length > 0)
    : [];

  // Helper to wrap content in Editable if editBasePath is provided
  const editable = (field: string, children: React.ReactNode) => {
    if (!editBasePath) return children;
    return <Editable path={`${editBasePath}.${field}`}>{children}</Editable>;
  };

  const cardContent = (
    <div className="flex flex-col h-full">
      {/* Title row with optional icon */}
      <div className="flex items-center gap-3 mb-3">
        {icon && <div className="flex-shrink-0">{icon}</div>}
        {editable('title', (
          <h2 className={`font-bold text-xl ${accentColors[color].titleText}`}>
            {title}
          </h2>
        ))}
      </div>

      {isCompact ? (
        // Compact: Just tagline as teaser
        <>
          {editable('tagline', (
            <p className={`${formInputColors.helper} text-base`}>
              {tagline}
            </p>
          ))}
          {/* Link text - uses span with click handler to avoid nested button issue */}
          {/* Note: No Editable wrapper here - linkText is edited via sidebar when "Edit Card" is selected */}
          <span
            role={onLinkClick ? 'button' : undefined}
            tabIndex={onLinkClick ? 0 : undefined}
            onClick={onLinkClick ? (e) => {
              e.stopPropagation();
              onLinkClick(e);
            } : undefined}
            onKeyDown={onLinkClick ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.stopPropagation();
                onLinkClick(e as unknown as React.MouseEvent);
              }
            } : undefined}
            className={`text-sm font-medium mt-auto pt-4 ${accentColors[color].titleText} ${onLinkClick ? 'cursor-pointer hover:underline' : ''}`}
          >
            {linkText}
          </span>
        </>
      ) : (
        // Full: Description + bullet points
        <>
          {editable('description', (
            <p className={`${formInputColors.helper} text-base mb-4`}>
              {description}
            </p>
          ))}

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

  const cardClasses = `p-6 ${cardBgColors.base} rounded-xl ${cardBorderColors.light} ${accentColors[color].topBorder} transition-all duration-300 ${accentColors[color].cardHover} ${shadowClasses.cardHover} h-full`;
  const interactiveClasses = onClick || href ? 'hover:-translate-y-1 active:scale-[0.98] active:translate-y-0' : '';

  // Wrap in Link if href is provided
  if (href) {
    return (
      <Link href={href} className={`block ${cardClasses} ${interactiveClasses}`}>
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
        className={`block text-left w-full ${cardClasses} ${interactiveClasses} cursor-pointer ${accentColors[color].focusVisible}`}
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
