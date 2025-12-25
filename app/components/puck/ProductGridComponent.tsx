'use client';

import { useState, useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import Image from 'next/image';

// ============================================================================
// LIVE PRODUCT GRID COMPONENT
// Fetches multiple products from Medusa and displays in a responsive grid
// ============================================================================

interface Product {
  id: string;
  title: string;
  description: string;
  thumbnail: string | null;
  variants: Array<{
    id: string;
    title: string;
    prices: Array<{
      amount: number;
      currency_code: string;
    }>;
  }>;
}

interface ProductGridComponentProps {
  productIds: Array<{ id?: string }>;
  columns: '2' | '3' | '4';
  gap: 'sm' | 'md' | 'lg' | 'xl';
  showPrice: 'yes' | 'no';
  accentColor: string;
}

const columnsMap: Record<string, string> = {
  '2': 'grid-cols-1 sm:grid-cols-2',
  '3': 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
  '4': 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4',
};

const gapMap: Record<string, string> = {
  sm: 'gap-3',
  md: 'gap-4',
  lg: 'gap-6',
  xl: 'gap-8',
};

const accentMap: Record<string, { border: string; button: string; price: string }> = {
  purple: {
    border: 'hover:border-purple-400 dark:hover:border-purple-500',
    button: 'bg-purple-600 hover:bg-purple-700',
    price: 'text-purple-600 dark:text-purple-400',
  },
  blue: {
    border: 'hover:border-blue-400 dark:hover:border-blue-500',
    button: 'bg-blue-600 hover:bg-blue-700',
    price: 'text-blue-600 dark:text-blue-400',
  },
  green: {
    border: 'hover:border-green-400 dark:hover:border-green-500',
    button: 'bg-green-600 hover:bg-green-700',
    price: 'text-green-600 dark:text-green-400',
  },
  orange: {
    border: 'hover:border-orange-400 dark:hover:border-orange-500',
    button: 'bg-orange-600 hover:bg-orange-700',
    price: 'text-orange-600 dark:text-orange-400',
  },
  teal: {
    border: 'hover:border-teal-400 dark:hover:border-teal-500',
    button: 'bg-teal-600 hover:bg-teal-700',
    price: 'text-teal-600 dark:text-teal-400',
  },
  gray: {
    border: 'hover:border-gray-400 dark:hover:border-gray-500',
    button: 'bg-gray-600 hover:bg-gray-700',
    price: 'text-gray-600 dark:text-gray-400',
  },
};

export default function ProductGridComponent({
  productIds,
  columns,
  gap,
  showPrice,
  accentColor,
}: ProductGridComponentProps) {
  const [products, setProducts] = useState<Map<string, Product>>(new Map());
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState<string | null>(null);
  const { addItem } = useCart();

  const colors = accentMap[accentColor] || accentMap.purple;
  const validProductIds = productIds.filter(item => item.id?.trim());

  // Fetch all products
  useEffect(() => {
    if (validProductIds.length === 0) {
      setLoading(false);
      return;
    }

    async function fetchProducts() {
      setLoading(true);
      const productMap = new Map<string, Product>();

      // Fetch each product in parallel
      const promises = validProductIds.map(async (item) => {
        if (!item.id) return;
        try {
          const response = await fetch(`/api/shop/products/${item.id}`);
          if (response.ok) {
            const data = await response.json();
            if (data.product) {
              productMap.set(item.id, data.product);
            }
          }
        } catch (error) {
          console.error(`Failed to fetch product ${item.id}:`, error);
        }
      });

      await Promise.all(promises);
      setProducts(productMap);
      setLoading(false);
    }

    fetchProducts();
  }, [validProductIds.map(p => p.id).join(',')]);

  // Handle add to cart
  const handleAddToCart = async (product: Product) => {
    if (!product.variants?.[0]) return;

    setAddingToCart(product.id);
    try {
      const variant = product.variants[0];
      const price = variant.prices?.[0]?.amount || 0;
      await addItem(variant.id, 1, {
        title: product.title,
        unit_price: price,
        thumbnail: product.thumbnail || undefined,
      });
    } catch (error) {
      console.error('Failed to add to cart:', error);
    } finally {
      setAddingToCart(null);
    }
  };

  // Empty state
  if (validProductIds.length === 0) {
    return (
      <div className="text-center py-12 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl">
        <svg className="w-12 h-12 mx-auto text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
        <p className="text-gray-500 dark:text-gray-400">Add product IDs to display</p>
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className={`grid ${columnsMap[columns]} ${gapMap[gap]}`}>
        {validProductIds.map((_, index) => (
          <div key={index} className="bg-white dark:bg-gray-800 rounded-xl border-2 border-gray-200 dark:border-gray-700 overflow-hidden animate-pulse">
            <div className="aspect-square bg-gray-200 dark:bg-gray-700" />
            <div className="p-3">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2" />
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={`grid ${columnsMap[columns]} ${gapMap[gap]}`}>
      {validProductIds.map((item, index) => {
        const product = item.id ? products.get(item.id) : null;

        // Product not found
        if (!product) {
          return (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 rounded-xl border-2 border-red-200 dark:border-red-800 p-4 text-center"
            >
              <svg className="w-8 h-8 mx-auto text-red-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <p className="text-xs text-red-600 dark:text-red-400">Not found</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{item.id}</p>
            </div>
          );
        }

        // Get price from first variant
        const variant = product.variants?.[0];
        const price = variant?.prices?.[0]?.amount || 0;
        const formattedPrice = (price / 100).toLocaleString('en-US', {
          style: 'currency',
          currency: variant?.prices?.[0]?.currency_code?.toUpperCase() || 'USD',
        });

        return (
          <div
            key={index}
            className={`bg-white dark:bg-gray-800 rounded-xl border-2 border-gray-200 dark:border-gray-700 ${colors.border} overflow-hidden transition-all hover:shadow-lg group`}
          >
            {/* Product Image */}
            <div className="aspect-square bg-gray-100 dark:bg-gray-700 overflow-hidden relative">
              {product.thumbnail ? (
                <Image
                  src={product.thumbnail}
                  alt={product.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="p-3">
              <h3 className="font-medium text-sm text-gray-900 dark:text-gray-100 truncate group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                {product.title}
              </h3>

              {showPrice === 'yes' && (
                <p className={`text-sm font-semibold ${colors.price} mt-1`}>
                  {formattedPrice}
                </p>
              )}

              {/* Add to Cart Button */}
              <button
                onClick={() => handleAddToCart(product)}
                disabled={addingToCart === product.id || !variant}
                className={`mt-2 w-full py-1.5 px-3 rounded-lg text-white text-xs font-medium transition-colors ${colors.button} disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {addingToCart === product.id ? 'Adding...' : 'Add to Cart'}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
