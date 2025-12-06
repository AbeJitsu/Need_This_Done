'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import Button from '@/components/Button';
import PageHeader from '@/components/PageHeader';
import Card from '@/components/Card';
import type { Product } from '@/lib/medusa-client';

// ============================================================================
// Product Detail Page - /shop/[productId]
// ============================================================================
// What: Shows full product details with quantity selector and add to cart
// Why: Lets customers review before adding to cart
// How: Fetches product by ID, displays variants, handles add to cart

export default function ProductDetailPage({
  params,
}: {
  params: { productId: string };
}) {
  const { addItem, itemCount } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState<string | null>(null);

  // ========================================================================
  // Fetch product details on mount
  // ========================================================================
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`/api/shop/products/${params.productId}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to load product');
        }

        setProduct(data.product);

        // Set first variant as default
        if (data.product?.variants?.[0]) {
          setSelectedVariant(data.product.variants[0].id);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load product');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [params.productId]);

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

      await addItem(selectedVariant, quantity);

      // Reset and show success
      setQuantity(1);
      alert(`Added ${product?.title} to cart!`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add item');
    } finally {
      setIsAddingToCart(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8 py-8">
        <div className="flex items-center justify-center py-20">
          <p className="text-gray-600 dark:text-gray-400">Loading product...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8 py-8">
        <Card hoverEffect="none">
          <div className="p-8 text-center">
            <p className="text-gray-600 dark:text-gray-400 mb-4">Product not found.</p>
            <Button variant="purple" href="/shop">
              Back to Shop
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const price = product.prices?.[0]?.amount ?? 0;
  const image = product.images?.[0]?.url;

  // Get variant options (simplified - real Medusa setup would have proper variants)
  const variants = product.variants || [];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8 py-8">
      {/* Back link */}
      <Link href="/shop" className="text-blue-600 dark:text-blue-400 hover:underline mb-6 inline-block">
        ← Back to Shop
      </Link>

      {/* Main content */}
      <div className="grid md:grid-cols-2 gap-8">
        {/* Product image */}
        {image ? (
          <div className="bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden h-96">
            <img
              src={image}
              alt={product.title}
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className="bg-gray-200 dark:bg-gray-700 rounded-lg h-96 flex items-center justify-center">
            <p className="text-gray-600 dark:text-gray-400">No image available</p>
          </div>
        )}

        {/* Product details */}
        <div className="flex flex-col">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            {product.title}
          </h1>

          <p className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-6">
            ${(price / 100).toFixed(2)}
          </p>

          {product.description && (
            <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
              {product.description}
            </p>
          )}

          {/* Error message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-900 dark:text-red-200">{error}</p>
            </div>
          )}

          {/* Variant selection */}
          {variants.length > 0 && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                Select Variant
              </label>
              <select
                value={selectedVariant || ''}
                onChange={(e) => setSelectedVariant(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
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
            <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
              Quantity
            </label>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
              >
                −
              </button>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-16 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-center bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
              />
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
              >
                +
              </button>
            </div>
          </div>

          {/* Cart info */}
          {itemCount > 0 && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              You have {itemCount} item{itemCount !== 1 ? 's' : ''} in your cart
            </p>
          )}

          {/* Action buttons */}
          <div className="flex gap-3 mt-auto">
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
        </div>
      </div>
    </div>
  );
}
