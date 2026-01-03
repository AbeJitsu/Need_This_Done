'use client';

import { useState, useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import Image from 'next/image';
import { getPuckFullColors, puckAspectMap, PuckEmptyState } from '@/lib/puck-utils';
import { cardHoverColors, getSolidButtonColors, cardBgColors, type AccentVariant } from '@/lib/colors';

// ============================================================================
// LIVE PRODUCT CARD COMPONENT
// Fetches real product data from Medusa and enables Add to Cart
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

interface ProductCardComponentProps {
  productId: string;
  showPrice: 'yes' | 'no';
  showDescription: 'yes' | 'no';
  imageAspect: 'square' | 'landscape' | 'portrait';
  accentColor: string;
}

export default function ProductCardComponent({
  productId,
  showPrice,
  showDescription,
  imageAspect,
  accentColor,
}: ProductCardComponentProps) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const { addItem } = useCart();

  // Get colors from centralized utilities
  const colorVariant = accentColor as AccentVariant;
  const colors = getPuckFullColors(accentColor);
  const hoverBorder = cardHoverColors[colorVariant] || cardHoverColors.purple;
  const buttonColors = getSolidButtonColors(colorVariant);

  // Fetch product data
  useEffect(() => {
    if (!productId) {
      setLoading(false);
      return;
    }

    async function fetchProduct() {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`/api/shop/products/${productId}`);
        if (!response.ok) {
          throw new Error('Product not found');
        }
        const data = await response.json();
        setProduct(data.product);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load product');
      } finally {
        setLoading(false);
      }
    }

    fetchProduct();
  }, [productId]);

  // Handle add to cart
  const handleAddToCart = async () => {
    if (!product || !product.variants?.[0]) return;

    setAdding(true);
    try {
      const variant = product.variants[0];
      const price = variant.prices?.[0]?.amount || 0;
      await addItem(variant.id, 1, {
        title: product.title,
        unit_price: price,
        thumbnail: product.thumbnail || undefined,
      });
    } catch {
      console.error('Failed to add to cart');
    } finally {
      setAdding(false);
    }
  };

  // Empty state - no product ID provided - use shared component
  if (!productId) {
    return (
      <PuckEmptyState
        message="Enter a Product ID to display"
        icon={
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        }
      />
    );
  }

  // Loading state - use puckAspectMap
  if (loading) {
    return (
      <div className={`${cardBgColors.base} rounded-xl border-2 border-gray-200 dark:border-gray-700 overflow-hidden animate-pulse`}>
        <div className={`${puckAspectMap[imageAspect]} bg-gray-200 dark:bg-gray-700`} />
        <div className="p-4">
          <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-1" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mb-3" />
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
        </div>
      </div>
    );
  }

  // Error state
  if (error || !product) {
    return (
      <div className={`${cardBgColors.base} rounded-xl border-2 border-red-200 dark:border-red-800 p-6 text-center`}>
        <svg className="w-10 h-10 mx-auto text-red-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <p className="text-red-600 dark:text-red-400 text-sm">{error || 'Product not found'}</p>
        <p className="text-gray-500 dark:text-gray-400 text-xs mt-1">ID: {productId}</p>
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
    <div className={`${cardBgColors.base} rounded-xl border-2 border-gray-200 dark:border-gray-700 ${hoverBorder} overflow-hidden transition-all hover:shadow-lg group`}>
      {/* Product Image */}
      <div className={`${puckAspectMap[imageAspect]} bg-gray-100 dark:bg-gray-700 overflow-hidden relative`}>
        {product.thumbnail ? (
          <Image
            src={product.thumbnail}
            alt={product.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-4">
        <h3 className={`font-semibold text-gray-900 dark:text-gray-100 ${colors.groupHoverText} transition-colors`}>
          {product.title}
        </h3>

        {showDescription === 'yes' && product.description && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
            {product.description}
          </p>
        )}

        {showPrice === 'yes' && (
          <p className={`text-lg font-bold ${colors.accentText} mt-2`}>
            {formattedPrice}
          </p>
        )}

        {/* Add to Cart Button - uses centralized button colors */}
        <button
          onClick={handleAddToCart}
          disabled={adding || !productVariant}
          className={`mt-3 w-full py-2 px-4 rounded-lg ${buttonColors.text} font-medium transition-colors ${buttonColors.bg} ${buttonColors.hover} disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {adding ? 'Adding...' : 'Add to Cart'}
        </button>
      </div>
    </div>
  );
}
