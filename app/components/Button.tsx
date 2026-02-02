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

  // Style variants for visual hierarchy
  const styleClasses = {
    solid: `${accentBorderWidth} bg-${variant}-600 text-white border-${variant}-600 hover:bg-${variant}-700 hover:border-${variant}-700 active:bg-${variant}-800 shadow-lg shadow-${variant}-500/25`,
    outline: `${accentBorderWidth} ${colors.bg} ${colors.text} ${colors.border} ${colors.hoverText} ${colors.hoverBorder}`,
    ghost: `border-transparent ${colors.text} ${colors.hoverText} hover:bg-${variant}-50`,
  };

  const baseClasses = `inline-flex items-center justify-center gap-2 ${accentFontWeight} rounded-xl transition-all duration-300 hover:scale-105 active:scale-95 ${colors.focusVisible} ${sizeClasses[size]} ${styleClasses[buttonStyle]}`;
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
