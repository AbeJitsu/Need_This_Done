import Link from 'next/link';
import { AccentVariant, accentColors } from '@/lib/colors';

// ============================================================================
// Button Component - Centralized Button Styling
// ============================================================================
// A single source of truth for all button styling across the site.
// Handles both link buttons (with href) and action buttons (with onClick).
// Uses shared accentColors for consistent styling with CircleBadge.

type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  children: React.ReactNode;
  variant?: AccentVariant;
  size?: ButtonSize;
  href?: string;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  type?: 'button' | 'submit';
}

// ============================================================================
// Hover States - Button-specific hover effects
// ============================================================================
const hoverStates: Record<AccentVariant, string> = {
  purple: 'hover:text-purple-800 hover:border-purple-600 dark:hover:border-purple-300',
  blue: 'hover:text-blue-800 hover:border-blue-600 dark:hover:border-blue-300',
  green: 'hover:text-green-900 hover:border-green-600 dark:hover:border-green-300',
  orange: 'hover:text-orange-900 hover:border-orange-600 dark:hover:border-orange-300',
  teal: 'hover:text-teal-900 hover:border-teal-600 dark:hover:border-teal-300',
  gray: 'hover:text-gray-800 hover:border-gray-600 dark:hover:border-gray-300',
};

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
  className = '',
  type = 'button',
}: ButtonProps) {
  const colors = accentColors[variant];
  const baseClasses = `inline-flex items-center justify-center font-semibold rounded-full border-2 transition-all duration-300 hover:scale-105 active:scale-95 focus-visible:ring-4 focus-visible:ring-purple-200 dark:focus-visible:ring-purple-800 ${sizeClasses[size]} ${colors.bg} ${colors.text} ${colors.border} ${hoverStates[variant]}`;
  const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed' : '';
  const fullClasses = `${baseClasses} ${disabledClasses} ${className}`.trim();

  // Render as Link if href is provided and not disabled
  if (href && !disabled) {
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
      disabled={disabled}
      className={fullClasses}
    >
      {children}
    </button>
  );
}
