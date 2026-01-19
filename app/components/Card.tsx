// ============================================================================
// Card Component - Reusable Card Container
// ============================================================================
// Base card component with consistent hover effects. Uses centralized colors
// from colors.ts for DRY, maintainable styling across all pages.

import { AccentVariant, accentColors, cardHoverBgTints, cardBgColors, cardBorderColors } from '@/lib/colors';

interface CardProps {
  children: React.ReactNode;
  hoverColor?: AccentVariant;
  hoverEffect?: 'lift' | 'glow' | 'tint' | 'none';
  className?: string;
  id?: string;
}

export default function Card({
  children,
  hoverColor,
  hoverEffect = 'lift',
  className = '',
  id
}: CardProps) {
  // Get hover classes from centralized color system
  const hoverBorderClass = hoverColor
    ? accentColors[hoverColor].cardHover
    : accentColors.gray.cardHover;

  // Optional: subtle background tint on hover
  const hoverBgClass = hoverEffect === 'tint' && hoverColor
    ? cardHoverBgTints[hoverColor]
    : '';

  // Hover effects: lift, glow, or none
  const effectClasses = hoverEffect === 'lift'
    ? 'hover:-translate-y-1 hover:shadow-xl'
    : hoverEffect === 'glow'
    ? 'hover:shadow-lg'
    : '';

  return (
    <div
      id={id}
      className={`
        ${cardBgColors.base}
        rounded-xl p-6
        ${cardBorderColors.subtle}
        transition-all duration-300
        ${hoverBorderClass}
        ${hoverBgClass}
        ${effectClasses}
        ${className}
      `}
    >
      {children}
    </div>
  );
}
