import Link from 'next/link';
import { AccentVariant, accentColors, accentBorderWidth, accentFontWeight } from '@/lib/colors';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

// ============================================================================
// Button Component - Centralized Button Styling
// ============================================================================
// Uses the unified accentColors system from colors.ts for consistent styling
// with CircleBadge and Navigation. All color definitions are centralized.
// Handles both link buttons (with href) and action buttons (with onClick).

type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  children: React.ReactNode;
  variant?: AccentVariant;
  size?: ButtonSize;
  href?: string;
  onClick?: () => void;
  disabled?: boolean;
  isLoading?: boolean;
  loadingText?: string;
  className?: string;
  type?: 'button' | 'submit';
}

// ============================================================================
// Size Classes - Consistent padding and font sizes
// ============================================================================

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-3',
  lg: 'px-8 py-3',
};

// ============================================================================
// Button Component
// ============================================================================

export default function Button({
  children,
  variant = 'blue',
  size = 'lg',
  href,
  onClick,
  disabled = false,
  isLoading = false,
  loadingText,
  className = '',
  type = 'button',
}: ButtonProps) {
  const colors = accentColors[variant];
  const isDisabled = disabled || isLoading;
  // All color classes come from the centralized accentColors system
  const baseClasses = `inline-flex items-center justify-center gap-2 ${accentFontWeight} rounded-full ${accentBorderWidth} transition-all duration-300 hover:scale-105 active:scale-95 focus-visible:ring-4 focus-visible:ring-blue-300 dark:focus-visible:ring-blue-700 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-gray-900 ${sizeClasses[size]} ${colors.bg} ${colors.text} ${colors.border} ${colors.hoverText} ${colors.hoverBorder}`;
  const disabledClasses = isDisabled ? 'opacity-60 cursor-not-allowed hover:scale-100 active:scale-100' : '';
  const fullClasses = `${baseClasses} ${disabledClasses} ${className}`.trim();

  // Render as Link if href is provided and not disabled
  if (href && !isDisabled) {
    return (
      <Link href={href} className={fullClasses}>
        {children}
      </Link>
    );
  }

  // Render as button for actions or disabled state
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      className={fullClasses}
      aria-busy={isLoading}
    >
      {isLoading && <LoadingSpinner size="sm" color="current" />}
      {isLoading && loadingText ? loadingText : children}
    </button>
  );
}
