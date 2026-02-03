'use client';

import { Scale } from 'lucide-react';
import { useComparison, ComparisonProduct } from '@/context/ComparisonContext';
import { accentColors } from '@/lib/colors';

interface CompareButtonProps {
  product: {
    id: string;
    title: string;
    description?: string;
    images?: Array<{ url: string }>;
    variants?: Array<{
      calculated_price?: { calculated_amount: number };
    }>;
  };
}

export default function CompareButton({ product }: CompareButtonProps) {
  const { selectedProducts, addProduct, removeProduct } = useComparison();
  const isSelected = selectedProducts.some(p => p.id === product.id);
  const maxReached = selectedProducts.length >= 4 && !isSelected;

  const getPrice = (): number => {
    return product.variants?.[0]?.calculated_price?.calculated_amount ?? 0;
  };

  const handleToggleComparison = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isSelected) {
      removeProduct(product.id);
    } else if (!maxReached) {
      const comparisonProduct: ComparisonProduct = {
        id: product.id,
        title: product.title,
        description: product.description,
        price: getPrice(),
        image: product.images?.[0]?.url,
      };
      addProduct(comparisonProduct);
    }
  };

  return (
    <button
      onClick={handleToggleComparison}
      disabled={maxReached}
      aria-pressed={isSelected}
      className={`
        p-2 rounded-lg transition-all duration-200
        flex items-center gap-2 text-sm font-medium
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white
        ${isSelected
          ? `${accentColors.blue.bg} ${accentColors.blue.text}`
          : maxReached
          ? 'bg-gray-200 text-gray-500 cursor-not-allowed opacity-60'
          : `bg-gray-100 ${accentColors.blue.text} hover:bg-blue-100`
        }
      `}
      title={maxReached && !isSelected ? 'Maximum 4 products to compare' : undefined}
    >
      <Scale size={16} />
      {isSelected ? 'In Compare' : 'Compare'}
    </button>
  );
}
