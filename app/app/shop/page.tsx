'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import Button from '@/components/Button';
import PageHeader from '@/components/PageHeader';
import Card from '@/components/Card';
import type { Product } from '@/lib/medusa-client';

// ============================================================================
// Shop Page - Product Catalog
// ============================================================================
// What: Displays all available products/services for purchase
// Why: Enables customers to browse and add items to cart
// How: Fetches products from Medusa, displays in grid with add-to-cart buttons

export const metadata = {
  title: 'Shop - NeedThisDone',
  description: 'Browse and purchase our services. Quick tasks, standard projects, or premium work.',
};

export default function ShopPage() {
  const { addItem, itemCount, error: cartError } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [addingToCart, setAddingToCart] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState('');

  // ========================================================================
  // Fetch products on mount
  // ========================================================================
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/shop/products');
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to load products');
        }

        setProducts(data.products || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load products');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // ========================================================================
  // Handle add to cart
  // ========================================================================
  const handleAddToCart = async (product: Product) => {
    try {
      setAddingToCart(product.id);

      // Get first variant (simplified - real implementation would let user choose)
      const variant = product.variants?.[0];
      if (!variant) {
        throw new Error('No variants available for this product');
      }

      await addItem(variant.id, 1);
      setToastMessage(`Added ${product.title} to cart!`);

      // Clear toast after 3 seconds
      setTimeout(() => setToastMessage(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add item');
    } finally {
      setAddingToCart(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 py-8">
      {/* Header */}
      <PageHeader
        title="Shop Services"
        description="Pick the perfect service for your project. From quick tasks to premium work."
      />

      {/* Cart item count indicator */}
      {itemCount > 0 && (
        <div className="mb-6 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <p className="text-sm text-blue-900 dark:text-blue-200">
            You have <span className="font-semibold">{itemCount}</span> item{itemCount !== 1 ? 's' : ''} in your cart.{' '}
            <Link href="/cart" className="underline hover:text-blue-700 dark:hover:text-blue-300">
              View cart
            </Link>
          </p>
        </div>
      )}

      {/* Error messages */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-900 dark:text-red-200">{error}</p>
        </div>
      )}

      {cartError && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-900 dark:text-red-200">{cartError}</p>
        </div>
      )}

      {/* Toast notification */}
      {toastMessage && (
        <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg animate-fade-in">
          <p className="text-sm text-green-900 dark:text-green-200">{toastMessage}</p>
        </div>
      )}

      {/* Products grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <p className="text-gray-600 dark:text-gray-400">Loading products...</p>
        </div>
      ) : products.length === 0 ? (
        <div className="flex items-center justify-center py-20">
          <Card hoverEffect="none">
            <div className="p-8 text-center">
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                No products available yet. Check back soon!
              </p>
              <Button variant="purple" href="/">
                Go Home
              </Button>
            </div>
          </Card>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => {
            // Get price from first variant
            const price = product.prices?.[0]?.amount ?? 0;
            const currencyCode = product.prices?.[0]?.currency_code ?? 'USD';
            const image = product.images?.[0]?.url;

            // Map Medusa product handle to our pricing tiers
            const colorMap: Record<string, 'purple' | 'blue' | 'green'> = {
              'quick-task': 'purple',
              'standard-task': 'blue',
              'premium-service': 'green',
            };
            const hoverColor = (colorMap[product.handle] || 'purple') as 'purple' | 'blue' | 'green';

            return (
              <Card key={product.id} hoverColor={hoverColor} hoverEffect="lift">
                <div className="flex flex-col h-full">
                  {/* Product image */}
                  {image && (
                    <div className="w-full h-40 bg-gray-200 dark:bg-gray-700 rounded-t-lg overflow-hidden">
                      <img
                        src={image}
                        alt={product.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  <div className="p-6 flex flex-col flex-grow">
                    {/* Title and price */}
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                      {product.title}
                    </h3>

                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                      ${(price / 100).toFixed(2)}
                    </p>

                    {/* Description */}
                    {product.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 flex-grow">
                        {product.description}
                      </p>
                    )}

                    {/* Links and buttons */}
                    <div className="flex gap-2 mt-auto">
                      <Button
                        variant={hoverColor}
                        size="sm"
                        href={`/shop/${product.id}`}
                        className="flex-1"
                      >
                        Details
                      </Button>
                      <Button
                        variant="gray"
                        size="sm"
                        onClick={() => handleAddToCart(product)}
                        disabled={addingToCart === product.id}
                        className="flex-1"
                      >
                        {addingToCart === product.id ? 'Adding...' : 'Add Cart'}
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
