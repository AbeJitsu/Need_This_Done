import Link from 'next/link';

// ============================================================================
// Button Component - Centralized Button Styling
// ============================================================================
// A single source of truth for all button styling across the site.
// Handles both link buttons (with href) and action buttons (with onClick).
// Ensures consistent borders, colors, and hover states everywhere.

type ButtonVariant = 'purple' | 'blue' | 'green' | 'amber' | 'teal' | 'gray';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  children: React.ReactNode;
  variant: ButtonVariant;
  size?: ButtonSize;
  href?: string;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  type?: 'button' | 'submit';
}

// ============================================================================
// Color Definitions - All button colors in one place
// ============================================================================
// Pattern: Light mode uses pastel bg with dark text, inverts on hover
//          Dark mode uses bright bg with dark text, inverts on hover

const variantColors: Record<ButtonVariant, string> = {
  purple: 'bg-purple-200 text-purple-700 border-purple-300 dark:bg-purple-500 dark:text-gray-900 dark:border-purple-100 hover:bg-purple-700 hover:text-white hover:border-purple-700 dark:hover:bg-purple-200 dark:hover:text-purple-800 dark:hover:border-purple-300',
  blue: 'bg-blue-200 text-blue-700 border-blue-300 dark:bg-blue-500 dark:text-gray-900 dark:border-blue-100 hover:bg-blue-700 hover:text-white hover:border-blue-700 dark:hover:bg-blue-200 dark:hover:text-blue-800 dark:hover:border-blue-300',
  green: 'bg-green-200 text-green-700 border-green-300 dark:bg-green-500 dark:text-gray-900 dark:border-green-100 hover:bg-green-700 hover:text-white hover:border-green-700 dark:hover:bg-green-200 dark:hover:text-green-800 dark:hover:border-green-300',
  amber: 'bg-yellow-100 text-yellow-900 border-yellow-300 dark:bg-yellow-100 dark:text-yellow-900 dark:border-yellow-500 hover:border-yellow-400 dark:hover:border-yellow-700',
  teal: 'bg-teal-100 text-teal-900 border-teal-300 dark:bg-teal-500 dark:text-gray-900 dark:border-teal-100 hover:bg-teal-700 hover:text-white hover:border-teal-700 dark:hover:bg-teal-200 dark:hover:text-teal-800 dark:hover:border-teal-300',
  gray: 'bg-gray-200 text-gray-700 border-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-500 hover:bg-gray-700 hover:text-white hover:border-gray-700 dark:hover:bg-gray-200 dark:hover:text-gray-800 dark:hover:border-gray-300',
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
  variant,
  size = 'lg',
  href,
  onClick,
  disabled = false,
  className = '',
  type = 'button',
}: ButtonProps) {
  const baseClasses = `inline-flex items-center justify-center font-semibold rounded-full border-2 transition-all ${sizeClasses[size]} ${variantColors[variant]}`;
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
