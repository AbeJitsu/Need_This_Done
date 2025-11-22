// ============================================================================
// Button Component - Premium Semantic Variants
// ============================================================================
// Reusable button with semantic color variants that match their purpose:
// - primary: Main brand actions (blue)
// - secondary: Less prominent actions (grayscale)
// - success: Positive confirmations (green)
// - danger: Destructive/critical actions (red)
// - warning: Caution actions (yellow)
// - ghost: Minimal, text-like buttons

interface ButtonProps {
  href?: string;
  onClick?: () => void;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
}

export default function Button({
  href,
  onClick,
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
}: ButtonProps) {
  // ========================================================================
  // Semantic Color Variants - Each serves a specific purpose
  // ========================================================================
  const variantStyles = {
    // Primary: Main brand actions - blue dominant
    primary: 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 disabled:bg-blue-300',

    // Secondary: Less prominent actions - grayscale
    secondary:
      'bg-gray-100 text-gray-900 hover:bg-gray-200 active:bg-gray-300 disabled:bg-gray-50 border border-gray-300',

    // Success: Positive confirmations & approvals - green
    success: 'bg-green-600 text-white hover:bg-green-700 active:bg-green-800 disabled:bg-green-300',

    // Danger: Destructive & critical actions - red
    danger: 'bg-red-600 text-white hover:bg-red-700 active:bg-red-800 disabled:bg-red-300',

    // Warning: Caution actions - yellow (with dark text for contrast)
    warning: 'bg-yellow-600 text-white hover:bg-yellow-700 active:bg-yellow-800 disabled:bg-yellow-300',

    // Ghost: Minimal, text-like buttons - transparent with blue text
    ghost: 'bg-transparent text-blue-600 hover:bg-blue-50 active:bg-blue-100 disabled:text-gray-400',
  };

  // ========================================================================
  // Responsive Sizing
  // ========================================================================
  const sizeStyles = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-2.5 text-base',
    lg: 'px-8 py-3 text-lg',
  };

  // ========================================================================
  // Base Styles - Consistent across all variants
  // ========================================================================
  const baseStyles = `
    inline-flex items-center justify-center gap-2
    rounded-lg font-semibold
    transition-all duration-200
    active:scale-95
    disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100
    focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2
    focus-visible:outline-blue-600
    min-h-[44px] min-w-[44px]
    ${variantStyles[variant]}
    ${sizeStyles[size]}
  `;

  // Link variant
  if (href && !disabled) {
    return (
      <a href={href} className={baseStyles}>
        {children}
      </a>
    );
  }

  // Button variant
  return (
    <button type="button" onClick={onClick} disabled={disabled} className={baseStyles}>
      {children}
    </button>
  );
}
