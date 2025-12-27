// ============================================================================
// Page Container Component - Consistent page spacing
// ============================================================================
// Ensures all pages have the same max-width and padding patterns.
// Use this wrapper around page content for visual consistency.

interface PageContainerProps {
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClasses = {
  sm: 'max-w-3xl',
  md: 'max-w-4xl',
  lg: 'max-w-6xl',
};

export default function PageContainer({
  children,
  size = 'lg',
  className = '',
}: PageContainerProps) {
  return (
    <div className={`${sizeClasses[size]} mx-auto px-4 sm:px-6 md:px-8 py-8 ${className}`}>
      {children}
    </div>
  );
}
