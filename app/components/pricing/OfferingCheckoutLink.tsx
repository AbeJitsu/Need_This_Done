import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

interface OfferingCheckoutLinkProps {
  slug: string;
  title: string;
  variant?: 'primary' | 'secondary' | 'dark-secondary';
  className?: string;
}

export default function OfferingCheckoutLink({
  slug,
  title,
  variant = 'primary',
  className = '',
}: OfferingCheckoutLinkProps) {
  const baseStyles = 'flex items-center justify-center gap-2 rounded-xl font-semibold text-sm transition-all duration-300';
  const variantStyles = {
    primary: 'w-full py-3 px-6 bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-500/25',
    secondary: 'py-2 px-4 bg-gray-900 text-white hover:bg-gray-800',
    'dark-secondary': 'py-2 px-4 bg-white/15 text-white border border-white/20 hover:bg-white/25',
  };

  return (
    <Link
      href={`/api/offerings/${slug}/checkout`}
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
      aria-label={`Start with ${title}`}
    >
      Start Here
      <ArrowRight size={16} />
    </Link>
  );
}
