import Link from 'next/link';
import { AccentVariant, accentColors, accentBorderWidth, accentFontWeight } from '@/lib/colors';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

// ============================================================================
// Button Component - Centralized Button Styling
// ============================================================================
// Uses accentColors from colors.ts for all button variants.
// All buttons have: border + bg + text with proper dark mode inversion.
// Matches Navigation CTA buttons exactly for consistency.

type ButtonSize = 'sm' | 'md' | 'lg' | 'xl';
type ButtonStyle = 'solid' | 'outline' | 'ghost';

interface ButtonProps {
  children: React.ReactNode;
  variant?: AccentVariant;
  size?: ButtonSize;
  buttonStyle?: ButtonStyle;
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
  md: 'px-6 py-3 text-base',
  lg: 'px-8 py-4 text-lg',
  xl: 'px-10 py-5 text-xl',
};

// ============================================================================
// Button Component
// ============================================================================

export default function Button({
  children,
  variant = 'blue',
  size = 'lg',
  buttonStyle = 'solid',
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

  // Style variants for visual hierarchy - using variant-specific classes
  const solidClasses: Record<AccentVariant, string> = {
    blue: `${accentBorderWidth} bg-blue-600 text-white border-blue-600 hover:bg-blue-700 hover:border-blue-700 active:bg-blue-800 shadow-lg shadow-blue-500/25`,
    green: `${accentBorderWidth} bg-green-600 text-white border-green-600 hover:bg-green-700 hover:border-green-700 active:bg-green-800 shadow-lg shadow-green-500/25`,
    purple: `${accentBorderWidth} bg-purple-600 text-white border-purple-600 hover:bg-purple-700 hover:border-purple-700 active:bg-purple-800 shadow-lg shadow-purple-500/25`,
    gold: `${accentBorderWidth} bg-gold-600 text-white border-gold-600 hover:bg-gold-700 hover:border-gold-700 active:bg-gold-800 shadow-lg shadow-gold-500/25`,
    teal: `${accentBorderWidth} bg-teal-600 text-white border-teal-600 hover:bg-teal-700 hover:border-teal-700 active:bg-teal-800 shadow-lg shadow-teal-500/25`,
    gray: `${accentBorderWidth} bg-gray-600 text-white border-gray-600 hover:bg-gray-700 hover:border-gray-700 active:bg-gray-800 shadow-lg shadow-gray-500/25`,
    red: `${accentBorderWidth} bg-red-600 text-white border-red-600 hover:bg-red-700 hover:border-red-700 active:bg-red-800 shadow-lg shadow-red-500/25`,
  };

  const ghostClasses: Record<AccentVariant, string> = {
    blue: 'border-transparent hover:bg-blue-50',
    green: 'border-transparent hover:bg-green-50',
    purple: 'border-transparent hover:bg-purple-50',
    gold: 'border-transparent hover:bg-gold-50',
    teal: 'border-transparent hover:bg-teal-50',
    gray: 'border-transparent hover:bg-gray-50',
    red: 'border-transparent hover:bg-red-50',
  };

  const styleClasses = {
    solid: solidClasses[variant],
    outline: `${accentBorderWidth} ${colors.bg} ${colors.text} ${colors.border} ${colors.hoverText} ${colors.hoverBorder}`,
    ghost: `${ghostClasses[variant]} ${colors.text} ${colors.hoverText}`,
  };

  const baseClasses = `inline-flex items-center justify-center gap-2 ${accentFontWeight} rounded-xl transition-all duration-300 motion-safe:hover:scale-105 motion-safe:active:scale-95 ${colors.focusVisible} ${sizeClasses[size]} ${styleClasses[buttonStyle]}`;
  const disabledClasses = isDisabled ? 'opacity-60 cursor-not-allowed motion-safe:hover:scale-100 motion-safe:active:scale-100' : '';
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
