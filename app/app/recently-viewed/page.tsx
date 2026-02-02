'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useBrowsingHistory } from '@/context/BrowsingHistoryContext';
import Button from '@/components/Button';
import PageHeader from '@/components/PageHeader';
import Card from '@/components/Card';
import { headingColors, formInputColors, focusRingClasses } from '@/lib/colors';

// ============================================================================
// Recently Viewed Products Page - /recently-viewed
// ============================================================================
// What: Display products the user has recently browsed
// Why: Customers want quick access to products they've looked at
// How: Shows browsing history from local context with remove/view actions

interface ProductData {
  id: string;
  title: string;
  thumbnail?: string;
  prices?: Array<{ amount: number }>;
}

export default function RecentlyViewedPage() {
  const { viewedProducts, removeViewedProduct, clearHistory, isLoading } = useBrowsingHistory();
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [productDetails, setProductDetails] = useState<Record<string, ProductData>>({});
  const [detailsLoading, setDetailsLoading] = useState(true);

  // ========================================================================
  // Load full product details for recently viewed items
  // ========================================================================
  useEffect(() => {
    if (isLoading || viewedProducts.length === 0) {
      setDetailsLoading(false);
      return;
    }

    const loadProductDetails = async () => {
      try {
        const uniqueProductIds = [...new Set(viewedProducts.map((p) => p.product_id))];
        const response = await fetch('/api/products/search?limit=100');

        if (response.ok) {
          const data = await response.json();
          const productsMap: Record<string, ProductData> = {};

          data.products?.forEach((product: ProductData) => {
            if (uniqueProductIds.includes(product.id)) {
              productsMap[product.id] = product;
            }
          });

          setProductDetails(productsMap);
        }
      } catch (err) {
        console.error('Failed to load product details:', err);
      } finally {
        setDetailsLoading(false);
      }
    };

    loadProductDetails();
  }, [viewedProducts, isLoading]);

  // ========================================================================
  // Handle remove from history
  // ========================================================================
  const handleRemove = async (productId: string) => {
    setRemovingId(productId);
    removeViewedProduct(productId);
    setTimeout(() => setRemovingId(null), 300);
  };

  // ========================================================================
  // Format viewing time
  // ========================================================================
  const formatViewTime = (dateStr: string): string => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffMinutes = Math.floor(diffTime / (1000 * 60));
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffMinutes < 1) return 'just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString();
  };

  if (isLoading || detailsLoading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 py-12">
        <PageHeader
          title="Recently Viewed"
          description="Loading your browsing history..."
        />
      </div>
    );
  }

  // ========================================================================
  // Empty state
  // ========================================================================
  if (viewedProducts.length === 0) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 py-12">
        <PageHeader
          title="Recently Viewed"
          description="You haven't browsed any products yet"
        />

        <div className="mt-12 bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl border border-blue-100 p-8 md:p-12">
          <div className="max-w-md mx-auto text-center">
            <div className="text-6xl mb-4">👀</div>
            <h2 className={`text-2xl font-bold ${headingColors.primary} mb-3`}>
              Start Browsing
            </h2>
            <p className={`${formInputColors.helper} mb-6 leading-relaxed`}>
              When you explore our products, they'll appear here for quick access later.
            </p>
            <Link href="/shop">
              <Button variant="blue" size="lg" className="w-full">
                Browse Products
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ========================================================================
  // Recently viewed content
  // ========================================================================
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 py-12">
      <PageHeader
        title="Recently Viewed"
        description={`${viewedProducts.length} product${viewedProducts.length !== 1 ? 's' : ''}`}
      />

      <div className="mt-8 grid gap-6">
        {viewedProducts.map((item) => {
          const product = productDetails[item.product_id];
          const price = product?.prices?.[0]?.amount;

          return (
            <Card
              key={item.product_id}
              className={`flex items-start gap-6 p-6 hover:shadow-lg transition ${
                removingId === item.product_id ? 'opacity-50' : ''
              }`}
            >
              {/* Product image */}
              {product?.thumbnail && (
                <div className="flex-shrink-0 w-32 h-32 rounded-lg overflow-hidden bg-gray-200">
                  <img
                    src={product.thumbnail}
                    alt={product.title || 'Product'}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Product info */}
              <div className="flex-1">
                <h3 className={`text-lg font-semibold ${headingColors.primary} mb-2`}>
                  {product?.title || item.title || `Product ${item.product_id.slice(0, 8)}`}
                </h3>
                {price && (
                  <p className="text-emerald-600 font-semibold mb-3">
                    ${(price / 100).toFixed(2)}
                  </p>
                )}
                <p className={`text-sm ${formInputColors.helper}`}>
                  Viewed {formatViewTime(item.viewed_at)}
                </p>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-3 mt-4 sm:mt-0 flex-col sm:flex-row">
                <Link href={`/shop/${item.product_id}`}>
                  <Button variant="blue" size="sm">
                    View Product
                  </Button>
                </Link>
                <button
                  onClick={() => handleRemove(item.product_id)}
                  disabled={removingId === item.product_id}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition ${
                    removingId === item.product_id
                      ? 'bg-red-100 text-red-400 border border-red-200 cursor-not-allowed'
                      : 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100'
                  } ${focusRingClasses.blue}`}
                >
                  {removingId === item.product_id ? 'Removing...' : 'Remove'}
                </button>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Clear history button */}
      {viewedProducts.length > 0 && (
        <div className="mt-8 flex justify-end">
          <button
            onClick={clearHistory}
            className={`px-4 py-2 rounded-lg font-medium text-sm text-gray-600 border border-gray-300 hover:bg-gray-50 transition ${focusRingClasses.blue}`}
          >
            Clear History
          </button>
        </div>
      )}

      {/* Continue browsing */}
      <div className="mt-12 p-6 bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl border border-purple-100">
        <p className={`${formInputColors.helper} mb-4`}>
          Want to explore more? Check out our full product catalog.
        </p>
        <Link href="/shop">
          <Button variant="purple">
            Browse All Products
          </Button>
        </Link>
      </div>
    </div>
  );
}
