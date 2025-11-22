// ============================================================================
// Button Component
// ============================================================================
// Reusable button component for consistent styling and behavior
// Supports different href destinations and responsive sizing
// Includes touch-friendly sizing (min 44x44px) for mobile accessibility

interface ButtonProps {
  href: string;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
}

export default function Button({ href, children, variant = 'primary' }: ButtonProps) {
  const variantStyles = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 active:bg-gray-400',
  };

  return (
    <a
      href={href}
      className={`
        inline-block px-6 sm:px-8 py-2.5 sm:py-3 rounded-lg font-semibold
        transition active:scale-95 min-h-[44px] min-w-[44px]
        flex items-center justify-center
        ${variantStyles[variant]}
      `}
    >
      {children}
    </a>
  );
}
