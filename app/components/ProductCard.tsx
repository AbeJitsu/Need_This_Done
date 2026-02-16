'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ShoppingCart, Heart } from 'lucide-react';
import { accentColors, cardBgColors, cardBorderColors, headingColors, mutedTextColors } from '@/lib/colors';
import { useWishlist } from '@/context/WishlistContext';
import CompareButton from './CompareButton';

// ============================================================================
// Product Card Component - Display Product Summary
// ============================================================================
// Shows product with image, title, price, and quick actions.
// What: Displays product summary in grid format.
// Why: Provides visual preview of products in listing.
// How: Used in product listing page; link opens detail page.

interface ProductCardProps {
  product: {
    id: string;
    title: string;
    description?: string;
    images?: Array<{ url: string }>;
    metadata?: Record<string, unknown>;
    variants?: Array<{
      calculated_price?: { calculated_amount: number };
    }>;
  };
  price: string;
  priceCents?: number;
  href: string;
}

export default function ProductCard({ product, price, priceCents, href }: ProductCardProps) {
  const router = useRouter();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const inWishlist = isInWishlist(product.id);
  const [isNavigating, setIsNavigating] = useState(false);
  const [isWishlistLoading, setIsWishlistLoading] = useState(false);

  const imageUrl = product.images?.[0]?.url;
  const shortDescription = product.description
    ? product.description.slice(0, 80) + (product.description.length > 80 ? '...' : '')
    : '';

  // Determine product icon and gradient based on metadata type
  const getProductIcon = () => {
    const type = product.metadata?.type as string | undefined;
    if (type === 'package') return { icon: '🌐', gradient: 'from-emerald-500 to-blue-500' };
    if (type === 'addon') return { icon: '✨', gradient: 'from-purple-500 to-blue-500' };
    if (type === 'service') return { icon: '⚙️', gradient: 'from-blue-500 to-purple-500' };
    if (type === 'subscription') return { icon: '🤖', gradient: 'from-purple-500 to-emerald-500' };
    return { icon: '📦', gradient: 'from-slate-600 to-slate-800' };
  };

  const iconInfo = getProductIcon();

  // Navigate to detail page when button clicked
  const handleCartClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsNavigating(true);
    router.push(href);
  };

  // Handle wishlist toggle with loading state
  const handleWishlistToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsWishlistLoading(true);
    try {
      if (inWishlist) {
        removeFromWishlist(product.id);
      } else {
        addToWishlist(product.id, product.title, 0);
      }
    } finally {
      setIsWishlistLoading(false);
    }
  };

  return (
    <Link href={href} className="group">
      <div className={`
        h-full ${cardBgColors.base} rounded-xl border-2 ${cardBorderColors.light}
        shadow-lg shadow-slate-200/50
        transition-all duration-300 hover:shadow-xl hover:shadow-emerald-500/10 hover:-translate-y-1 hover:border-emerald-500
        active:scale-[0.98] flex flex-col focus-within:outline-none focus-within:ring-2 focus-within:ring-emerald-500 focus-within:ring-offset-2 focus-within:ring-offset-white
        group-hover:border-emerald-500 dark:group-hover:border-emerald-300
      `}>
        {/* Product Image */}
        <div className="relative w-full h-48 bg-gray-100 rounded-t-lg overflow-hidden flex-shrink-0">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={product.title}
              fill
              className="object-cover"
              unoptimized
            />
          ) : (
            <div className={`w-full h-full flex items-center justify-center bg-gradient-to-br ${iconInfo.gradient}`}>
              <div className="text-center">
                <span className="text-5xl block mb-2">{iconInfo.icon}</span>
                <span className="text-white/70 text-sm font-medium">{product.title}</span>
              </div>
            </div>
          )}

          {/* Wishlist Button - Floating */}
          <button
            onClick={handleWishlistToggle}
            disabled={isWishlistLoading}
            className={`
              absolute top-3 right-3 p-2 rounded-lg backdrop-blur-sm
              transition-all duration-200 z-10 motion-safe:hover:scale-110 motion-safe:active:scale-95
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-white
              disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:animate-pulse
              ${inWishlist
                ? `${accentColors.green.bg} ${accentColors.green.text} focus-visible:ring-green-500`
                : 'bg-white/80 hover:bg-white text-gray-600 hover:text-gray-900 focus-visible:ring-gray-400'
              }
            `}
            aria-label={isWishlistLoading ? 'Loading...' : (inWishlist ? 'Remove from wishlist' : 'Add to wishlist')}
            aria-pressed={inWishlist}
            aria-busy={isWishlistLoading}
            title={isWishlistLoading ? 'Loading...' : (inWishlist ? 'Remove from wishlist' : 'Add to wishlist')}
          >
            <Heart
              className={`w-5 h-5 ${isWishlistLoading ? 'animate-pulse' : ''}`}
              fill={inWishlist ? 'currentColor' : 'none'}
            />
          </button>
        </div>

        {/* Product Info */}
        <div className="flex-1 flex flex-col p-4">
          <h3 className={`text-lg font-semibold ${headingColors.primary} mb-2 line-clamp-2`}>
            {product.title}
          </h3>

          {shortDescription && (
            <p className={`text-sm ${mutedTextColors.normal} mb-4 line-clamp-2`}>
              {shortDescription}
            </p>
          )}

          {/* Price and Deposit Info */}
          <div className="mt-auto">
            <span className="text-2xl font-bold text-emerald-600">
              {price}
            </span>
            {priceCents && priceCents >= 50000 && product.metadata?.type !== 'subscription' && (
              <p className="text-sm text-emerald-600 font-medium mt-1">
                Start for ${(Math.ceil(priceCents / 2) / 100).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} · 50% deposit
              </p>
            )}
            {product.metadata?.billing_period === 'monthly' && (
              <p className="text-sm text-purple-600 font-medium mt-1">/month</p>
            )}
          </div>
        </div>

        {/* Add to Cart Button and Compare */}
        <div className="px-4 pb-4 space-y-2">
          <button
            onClick={handleCartClick}
            disabled={isNavigating}
            aria-label={`View ${product.title} and add to cart`}
            className={`
            w-full py-2 px-4 rounded-lg font-medium transition-all duration-200
            flex items-center justify-center gap-2
            ${accentColors.green.bg} ${accentColors.green.text}
            motion-safe:hover:scale-105 motion-safe:active:scale-95
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white
            disabled:opacity-70 disabled:cursor-not-allowed disabled:scale-100
          `}>
            {isNavigating ? (
              <>
                <svg
                  className="animate-spin w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                Opening...
              </>
            ) : (
              <>
                <ShoppingCart className="w-5 h-5" />
                View Details
              </>
            )}
          </button>
          <CompareButton product={product} />
        </div>
      </div>
    </Link>
  );
}
