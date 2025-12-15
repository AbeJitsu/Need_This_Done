// ============================================================================
// Card Component - Reusable Card Container
// ============================================================================
// Base card component with consistent hover effects. Uses centralized colors
// from colors.ts for DRY, maintainable styling across all pages.

import { AccentVariant, cardHoverColors, cardHoverBgTints, cardBgColors, cardBorderColors } from '@/lib/colors';

interface CardProps {
  children: React.ReactNode;
  hoverColor?: AccentVariant;
  hoverEffect?: 'lift' | 'glow' | 'tint' | 'none';
  className?: string;
}

export default function Card({
  children,
  hoverColor,
  hoverEffect = 'lift',
  className = ''
}: CardProps) {
  // Get hover classes from centralized color system
  const hoverBorderClass = hoverColor
    ? cardHoverColors[hoverColor]
    : cardHoverColors.gray;

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
    <div className={`
      ${cardBgColors.base}
      rounded-xl p-6
      ${cardBorderColors.subtle}
      transition-all duration-300
      ${hoverBorderClass}
      ${hoverBgClass}
      ${effectClasses}
      ${className}
    `}>
      {children}
    </div>
  );
}
