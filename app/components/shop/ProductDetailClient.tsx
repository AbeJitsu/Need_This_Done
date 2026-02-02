'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import Button from '@/components/Button';
import ReviewForm from './ReviewForm';
import ReviewSection from './ReviewSection';
import type { Product } from '@/lib/medusa-client';
import { headingColors, formInputColors, alertColors, formValidationColors, productImageStyles, accentColors, cardBgColors, focusRingClasses } from '@/lib/colors';

// ============================================================================
// Product Detail Client Component
// ============================================================================
// What: Interactive parts of product detail page (cart, quantity)
// Why: Server Component fetches data instantly, this handles interactivity
// How: Receives product as prop, manages cart state client-side

interface ProductDetailClientProps {
  product: Product;
}

export default function ProductDetailClient({ product }: ProductDetailClientProps) {
  const { user } = useAuth();
  const { addItem, itemCount } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isManagingWishlist, setIsManagingWishlist] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState<string | null>(
    product?.variants?.[0]?.id || null
  );
  const [error, setError] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const [reviewsRefreshKey, setReviewsRefreshKey] = useState(0);

  const inWishlist = isInWishlist(product.id);

  // Get price from first variant's prices array (Medusa structure)
  const price = product.variants?.[0]?.prices?.[0]?.amount ?? 0;
  const image = product.images?.[0]?.url;
  const variants = product.variants || [];

  // ========================================================================
  // Handle wishlist toggle
  // ========================================================================
  const handleWishlistToggle = async () => {
    try {
      setIsManagingWishlist(true);
      setError('');

      if (inWishlist) {
        await removeFromWishlist(product.id);
        setToastMessage('Removed from wishlist');
      } else {
        await addToWishlist(
          product.id,
          product.title,
          price,
          image
        );
        setToastMessage('Added to wishlist!');
      }

      setTimeout(() => setToastMessage(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update wishlist');
    } finally {
      setIsManagingWishlist(false);
    }
  };

  // ========================================================================
  // Handle add to cart
  // ========================================================================
  const handleAddToCart = async () => {
    if (!selectedVariant) {
      setError('Please select a variant');
      return;
    }

    try {
      setIsAddingToCart(true);
      setError('');

      // Pass product info for instant optimistic display
      await addItem(selectedVariant, quantity, {
        title: product.title,
        unit_price: price,
        thumbnail: image,
      });

      // Reset and show success
      setQuantity(1);
      setToastMessage(`Added ${product?.title} to cart!`);

      // Clear toast after 3 seconds
      setTimeout(() => setToastMessage(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add item');
    } finally {
      setIsAddingToCart(false);
    }
  };

  // ========================================================================
  // Handle review submitted - refresh reviews section
  // ========================================================================
  const handleReviewSubmitted = () => {
    setReviewsRefreshKey((prev) => prev + 1);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 py-8">
      {/* Back link */}
      <Link href="/pricing" className={`${accentColors.blue.titleText} hover:underline mb-6 inline-block rounded ${focusRingClasses.blue}`}>
        ← Back to Pricing
      </Link>

      {/* Main content */}
      <div className="grid md:grid-cols-2 gap-8 mb-12">
        {/* Product image */}
        {image ? (
          <div className={`relative ${cardBgColors.elevated} rounded-lg overflow-hidden h-96`}>
            <Image
              src={image}
              alt={product.title}
              fill
              className="object-cover object-[50%_25%]"
              style={productImageStyles}
              unoptimized
            />
          </div>
        ) : (
          <div className={`${cardBgColors.elevated} rounded-lg h-96 flex items-center justify-center`}>
            <p className={formInputColors.helper}>No image available</p>
          </div>
        )}

        {/* Product details */}
        <div className="flex flex-col">
          <h1 className={`text-3xl font-bold ${headingColors.primary} mb-4`}>
            {product.title}
          </h1>

          <p className={`text-4xl font-bold ${headingColors.primary} mb-6`}>
            ${(price / 100).toFixed(2)}
          </p>

          {product.description && (
            <p className={`${formInputColors.helper} mb-8 leading-relaxed`}>
              {product.description}
            </p>
          )}

          {/* Error message */}
          {error && (
            <div className={`mb-6 p-4 ${alertColors.error.bg} ${alertColors.error.border} rounded-lg`}>
              <p className={`text-sm ${formValidationColors.error}`}>{error}</p>
            </div>
          )}

          {/* Toast notification */}
          {toastMessage && (
            <div className={`mb-6 p-4 ${alertColors.success.bg} ${alertColors.success.border} rounded-lg animate-fade-in`}>
              <p className={`text-sm ${formValidationColors.success}`}>{toastMessage}</p>
            </div>
          )}

          {/* Variant selection */}
          {variants.length > 0 && (
            <div className="mb-6">
              <label className={`block text-sm font-medium ${headingColors.primary} mb-2`}>
                Select Variant
              </label>
              <select
                value={selectedVariant || ''}
                onChange={(e) => setSelectedVariant(e.target.value)}
                className={`w-full px-4 py-2 border ${formInputColors.base} rounded-lg`}
              >
                {variants.map((variant: any) => (
                  <option key={variant.id} value={variant.id}>
                    {variant.title || `Option ${variant.id.slice(0, 8)}`}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Quantity selector */}
          <div className="mb-6">
            <label className={`block text-sm font-medium ${headingColors.primary} mb-2`}>
              Quantity
            </label>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className={`px-4 py-2 border ${formInputColors.base} rounded-lg ${cardBgColors.interactive} transition ${focusRingClasses.blue}`}
              >
                −
              </button>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                className={`w-16 px-3 py-2 border ${formInputColors.base} rounded-lg text-center`}
              />
              <button
                onClick={() => setQuantity(quantity + 1)}
                className={`px-4 py-2 border ${formInputColors.base} rounded-lg ${cardBgColors.interactive} transition ${focusRingClasses.blue}`}
              >
                +
              </button>
            </div>
          </div>

          {/* Cart info */}
          {itemCount > 0 && (
            <p className={`text-sm ${formInputColors.helper} mb-6`}>
              You have {itemCount} item{itemCount !== 1 ? 's' : ''} in your cart
            </p>
          )}

          {/* Action buttons */}
          <div className="flex flex-col gap-3 mt-auto">
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="purple"
                size="lg"
                onClick={handleAddToCart}
                disabled={isAddingToCart}
                className="flex-1"
              >
                {isAddingToCart ? 'Adding to Cart...' : 'Add to Cart'}
              </Button>
              <Button
                variant="gray"
                size="lg"
                href="/cart"
                className="flex-1"
              >
                View Cart
              </Button>
            </div>

            {/* Wishlist button */}
            <button
              onClick={handleWishlistToggle}
              disabled={isManagingWishlist}
              className={`w-full px-4 py-2 rounded-lg font-medium transition ${
                inWishlist
                  ? 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100'
                  : 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200'
              } disabled:opacity-50 disabled:cursor-not-allowed ${focusRingClasses.blue}`}
            >
              {isManagingWishlist ? 'Updating...' : inWishlist ? '❤️ Remove from Wishlist' : '🤍 Add to Wishlist'}
            </button>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="border-t border-gray-200 pt-12">
        <ReviewForm
          productId={product.id}
          onSubmitSuccess={handleReviewSubmitted}
          isAuthenticated={!!user}
        />
        <ReviewSection
          key={reviewsRefreshKey}
          productId={product.id}
        />
      </div>
    </div>
  );
}
