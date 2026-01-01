import { titleColors, formInputColors } from '@/lib/colors';
import type { AccentVariant } from '@/lib/colors';

// ============================================================================
// PageHeader Component - Consistent Page Headers
// ============================================================================
// Single source of truth for all page headers. Eliminates repeated header
// patterns across Services, Pricing, How It Works, FAQ, and Contact pages.
// Default blue color adds personality to match homepage hero style.

interface PageHeaderProps {
  title: string;
  description?: string;
  className?: string;
  color?: AccentVariant; // Default: blue for consistent personality
}

export default function PageHeader({ title, description, className = '', color = 'blue' }: PageHeaderProps) {
  return (
    <div className={`text-center mb-12 ${className}`}>
      <h1 className={`text-4xl md:text-5xl font-bold tracking-tight ${titleColors[color]} mb-4`}>
        {title}
      </h1>
      {description && (
        <p className={`text-xl ${formInputColors.helper} max-w-2xl mx-auto`}>
          {description}
        </p>
      )}
    </div>
  );
}
