// ============================================================================
// PageHeader Component - Consistent Page Headers
// ============================================================================
// Single source of truth for all page headers. Eliminates repeated header
// patterns across Services, Pricing, How It Works, FAQ, and Contact pages.

interface PageHeaderProps {
  title: string;
  description?: string;
  className?: string;
}

export default function PageHeader({ title, description, className = '' }: PageHeaderProps) {
  return (
    <div className={`text-center mb-12 ${className}`}>
      <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900 dark:text-gray-100 mb-4">
        {title}
      </h1>
      {description && (
        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          {description}
        </p>
      )}
    </div>
  );
}
