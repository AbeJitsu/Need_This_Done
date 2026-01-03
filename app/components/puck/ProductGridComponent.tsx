'use client';

import { useState, useEffect, useMemo } from 'react';
import { useCart } from '@/context/CartContext';
import Image from 'next/image';
import { getPuckFullColors, puckColumnsMap, puckGapMap, PuckEmptyState } from '@/lib/puck-utils';
import { cardHoverColors, getSolidButtonColors, cardBgColors, type AccentVariant } from '@/lib/colors';

// ============================================================================
// LIVE PRODUCT GRID COMPONENT
// Fetches multiple products from Medusa and displays in a responsive grid
// DRY: Uses getPuckFullColors() and layout utilities from puck-utils
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

  // Get colors from centralized utilities
  const colorVariant = accentColor as AccentVariant;
  const colors = getPuckFullColors(accentColor);
  const hoverBorder = cardHoverColors[colorVariant] || cardHoverColors.purple;
  const buttonColors = getSolidButtonColors(colorVariant);
  const validProductIds = useMemo(
    () => productIds.filter(item => item.id?.trim()),
    [productIds]
  );
  const productIdKey = useMemo(
    () => validProductIds.map(p => p.id).join(','),
    [validProductIds]
  );

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
  }, [productIdKey, validProductIds]);

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

  // Empty state - use shared component
  if (validProductIds.length === 0) {
    return (
      <PuckEmptyState
        message="Add product IDs to display"
        icon={
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        }
      />
    );
  }

  // Loading state - use puckColumnsMap and puckGapMap
  if (loading) {
    return (
      <div className={`grid ${puckColumnsMap[columns]} ${puckGapMap[gap]}`}>
        {validProductIds.map((_, index) => (
          <div key={index} className={`${cardBgColors.base} rounded-xl border-2 border-gray-200 dark:border-gray-700 overflow-hidden animate-pulse`}>
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
    <div className={`grid ${puckColumnsMap[columns]} ${puckGapMap[gap]}`}>
      {validProductIds.map((item, index) => {
        const product = item.id ? products.get(item.id) : null;

        // Product not found
        if (!product) {
          return (
            <div
              key={index}
              className={`${cardBgColors.base} rounded-xl border-2 border-red-200 dark:border-red-800 p-4 text-center`}
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
        const productVariant = product.variants?.[0];
        const price = productVariant?.prices?.[0]?.amount || 0;
        const formattedPrice = (price / 100).toLocaleString('en-US', {
          style: 'currency',
          currency: productVariant?.prices?.[0]?.currency_code?.toUpperCase() || 'USD',
        });

        return (
          <div
            key={index}
            className={`${cardBgColors.base} rounded-xl border-2 border-gray-200 dark:border-gray-700 ${hoverBorder} overflow-hidden transition-all hover:shadow-lg group`}
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
              <h3 className={`font-medium text-sm text-gray-900 dark:text-gray-100 truncate ${colors.groupHoverText} transition-colors`}>
                {product.title}
              </h3>

              {showPrice === 'yes' && (
                <p className={`text-sm font-semibold ${colors.accentText} mt-1`}>
                  {formattedPrice}
                </p>
              )}

              {/* Add to Cart Button - uses centralized button colors */}
              <button
                onClick={() => handleAddToCart(product)}
                disabled={addingToCart === product.id || !productVariant}
                className={`mt-2 w-full py-1.5 px-3 rounded-lg ${buttonColors.text} text-xs font-medium transition-colors ${buttonColors.bg} ${buttonColors.hover} disabled:opacity-50 disabled:cursor-not-allowed`}
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
