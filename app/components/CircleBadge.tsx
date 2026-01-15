import { AccentVariant, accentColors, accentBorderWidth, accentFontWeight } from '@/lib/colors';

// ============================================================================
// CircleBadge Component
// ============================================================================
// A reusable numbered circle badge that can be used anywhere in the app.
// Uses the unified accentColors system from colors.ts for consistent styling
// with Button and Navigation. Border width is centralized for easy changes.

type BadgeSize = 'sm' | 'md' | 'lg';
type BadgeShape = 'circle' | 'pill';

interface CircleBadgeProps {
  number?: number;
  text?: string;
  color: AccentVariant;
  size?: BadgeSize;
  shape?: BadgeShape;
}

// Size-specific classes for circle shape
const circleSizeClasses: Record<BadgeSize, string> = {
  sm: 'w-10 h-10 text-base',
  md: 'w-14 h-14 text-xl',
  lg: 'w-20 h-20 text-2xl',
};

// Size-specific classes for pill shape (horizontal padding, fixed height)
const pillSizeClasses: Record<BadgeSize, string> = {
  sm: 'px-3 h-8 text-sm',
  md: 'px-5 h-11 text-lg',
  lg: 'px-6 h-14 text-xl',
};

export default function CircleBadge({
  number,
  text,
  color,
  size = 'md',
  shape = 'circle',
}: CircleBadgeProps) {
  // Fallback to blue if color is undefined or invalid
  const safeColor = color && accentColors[color] ? color : 'blue';
  const colors = accentColors[safeColor];
  const sizeClass = shape === 'pill' ? pillSizeClasses[size] : circleSizeClasses[size];

  // Uses centralized accentColors and accentBorderWidth from colors.ts
  return (
    <div
      className={`flex-shrink-0 ${sizeClass} ${colors.bg} ${accentBorderWidth} ${colors.border} ${colors.text} rounded-full flex items-center justify-center ${accentFontWeight}`}
    >
      {text ?? number}
    </div>
  );
}
