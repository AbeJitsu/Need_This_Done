'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import Button from '@/components/Button';
import Card from '@/components/Card';
import { formInputColors, linkHoverColors, alertColors, placeholderColors, headingColors, productImageStyles } from '@/lib/colors';
import type { Product } from '@/lib/medusa-client';

// ============================================================================
// Shop Client Component
// ============================================================================
// What: Interactive parts of shop page (cart, add buttons)
// Why: Server Component fetches data instantly, this handles interactivity
// How: Receives products as prop, manages cart state client-side

interface ShopClientProps {
  products: Product[];
}

export default function ShopClient({ products }: ShopClientProps) {
  const { addItem, itemCount, error: cartError } = useCart();
  const [addingToCart, setAddingToCart] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [toastMessage, setToastMessage] = useState('');

  // ========================================================================
  // Handle add to cart
  // ========================================================================
  const handleAddToCart = async (product: Product) => {
    try {
      setAddingToCart(product.id);

      // Get first variant
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
    <>
      {/* Back link to services */}
      <p className={`text-center mb-6 ${formInputColors.helper}`}>
        <Link href="/services" className={`font-medium ${linkHoverColors.blue}`}>
          ← Compare our full services
        </Link>
        {' · '}
        <Link href="/contact" className={`font-medium ${linkHoverColors.blue}`}>
          Request a free quote →
        </Link>
      </p>

      {/* Cart item count indicator */}
      {itemCount > 0 && (
        <div className={`mb-8 p-5 ${alertColors.info.bg} ${alertColors.info.border} rounded-lg`}>
          <p className={`text-sm ${alertColors.info.text}`}>
            You have <span className="font-semibold">{itemCount}</span> item{itemCount !== 1 ? 's' : ''} in your cart.
            <Link href="/cart" className={`ml-3 ${alertColors.info.link}`}>
              View cart
            </Link>
          </p>
        </div>
      )}

      {/* Error messages */}
      {error && (
        <div className={`mb-6 p-4 ${alertColors.error.bg} ${alertColors.error.border} rounded-lg`}>
          <p className={`text-sm ${alertColors.error.text}`}>{error}</p>
        </div>
      )}

      {cartError && (
        <div className={`mb-6 p-4 ${alertColors.error.bg} ${alertColors.error.border} rounded-lg`}>
          <p className={`text-sm ${alertColors.error.text}`}>{cartError}</p>
        </div>
      )}

      {/* Toast notification */}
      {toastMessage && (
        <div className={`mb-6 p-4 ${alertColors.success.bg} ${alertColors.success.border} rounded-lg animate-fade-in`}>
          <p className={`text-sm ${alertColors.success.text}`}>{toastMessage}</p>
        </div>
      )}

      {/* Products grid */}
      {products.length === 0 ? (
        <div className="flex items-center justify-center py-20">
          <Card hoverEffect="none">
            <div className="p-8 text-center">
              <p className={`${formInputColors.helper} mb-4`}>
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
            // Get price from first variant's prices array
            const price = product.variants?.[0]?.prices?.[0]?.amount ?? 0;
            const image = product.images?.[0]?.url;

            // Map consultation product handles to color tiers
            const colorMap: Record<string, 'purple' | 'blue' | 'green'> = {
              'consultation-15-min': 'green',
              'consultation-30-min': 'blue',
              'consultation-55-min': 'purple',
            };
            const hoverColor = (colorMap[product.handle] || 'purple') as 'purple' | 'blue' | 'green';

            return (
              <Card key={product.id} hoverColor={hoverColor} hoverEffect="lift">
                <div className="flex flex-col h-full">
                  {/* Product image */}
                  {image && (
                    <div className={`relative w-full h-40 ${placeholderColors.bg} rounded-t-lg overflow-hidden`}>
                      <img
                        src={image}
                        alt={product.title}
                        className="w-full h-full object-cover object-[50%_25%]"
                        style={productImageStyles}
                      />
                    </div>
                  )}

                  <div className="p-6 flex flex-col flex-grow">
                    {/* Title and price */}
                    <h3 className={`text-lg font-semibold ${headingColors.primary} mb-2`}>
                      {product.title}
                    </h3>

                    <p className={`text-2xl font-bold ${headingColors.primary} mb-4`}>
                      ${(price / 100).toFixed(2)}
                    </p>

                    {/* Description */}
                    {product.description && (
                      <p className={`text-sm ${formInputColors.helper} mb-6 flex-grow`}>
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
                        {addingToCart === product.id ? 'Adding...' : 'Add to Cart'}
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </>
  );
}
