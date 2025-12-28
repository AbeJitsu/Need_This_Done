'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import Button from '@/components/Button';
import Card from '@/components/Card';
import type { Product, Order } from '@/lib/medusa-client';
import { alertColors, statusBadgeColors } from '@/lib/colors';

// ============================================================================
// Admin Shop Dashboard - /admin/shop
// ============================================================================
// What: Central hub for managing ecommerce (products and orders)
// Why: Admins need to manage inventory and track orders
// How: Fetches products and orders from Medusa, displays in admin UI

export default function AdminShopDashboard() {
  const router = useRouter();
  const { isAuthenticated, isAdmin, isLoading: authLoading } = useAuth();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<'products' | 'orders'>('products');
  const [products, setProducts] = useState<Product[]>([]);
  const [orders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // ========================================================================
  // Auth protection
  // ========================================================================
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    } else if (!authLoading && isAuthenticated && !isAdmin) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, isAdmin, authLoading, router]);

  // ========================================================================
  // Fetch products and orders
  // ========================================================================
  useEffect(() => {
    if (!isAdmin) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');

        // Fetch products
        const productsResponse = await fetch('/api/shop/products');
        if (!productsResponse.ok) {
          throw new Error('Failed to load products');
        }
        const productsData = await productsResponse.json();
        setProducts(productsData.products || []);

        // Fetch orders (from Medusa admin API)
        // Note: This would need admin auth token in real implementation
        // For now, we show the products list
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load shop data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isAdmin]);

  // ========================================================================
  // Auth loading state
  // ========================================================================
  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600 dark:text-gray-400">Loading...</p>
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Shop Management
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage products and track orders
        </p>
      </div>

      {/* Error message */}
      {error && (
        <div className={`mb-6 p-4 rounded-lg ${alertColors.error.bg} ${alertColors.error.border}`}>
          <p className={`text-sm ${alertColors.error.text}`}>{error}</p>
        </div>
      )}

      {/* Tab navigation */}
      <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex gap-1" role="tablist" aria-label="Shop management sections">
          <button
            onClick={() => setActiveTab('products')}
            role="tab"
            aria-selected={activeTab === 'products'}
            aria-controls="products-panel"
            id="products-tab"
            className={`px-4 py-3 font-medium border-b-2 transition-colors ${
              activeTab === 'products'
                ? 'text-blue-600 dark:text-blue-400 border-blue-600 dark:border-blue-400'
                : 'text-gray-600 dark:text-gray-400 border-transparent hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            Products ({products.length})
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            role="tab"
            aria-selected={activeTab === 'orders'}
            aria-controls="orders-panel"
            id="orders-tab"
            className={`px-4 py-3 font-medium border-b-2 transition-colors ${
              activeTab === 'orders'
                ? 'text-blue-600 dark:text-blue-400 border-blue-600 dark:border-blue-400'
                : 'text-gray-600 dark:text-gray-400 border-transparent hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            Orders ({orders.length})
          </button>
        </div>
      </div>

      {/* Products Tab */}
      {activeTab === 'products' && (
        <div role="tabpanel" id="products-panel" aria-labelledby="products-tab">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              Products
            </h2>
            <Button variant="purple" href="/admin/shop/products/new">
              Add Product
            </Button>
          </div>

          {products.length === 0 ? (
            <Card hoverEffect="none">
              <div className="p-8 text-center">
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  No products yet. Create your first product to get started.
                </p>
                <Button variant="purple" href="/admin/shop/products/new">
                  Create Product
                </Button>
              </div>
            </Card>
          ) : (
            <div className="grid gap-4">
              {products.map((product) => (
                <Card key={product.id} hoverEffect="lift">
                  <div className="p-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                          {product.title}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                          ID: {product.id}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Handle: {product.handle}
                        </p>
                        {product.prices && product.prices.length > 0 && (
                          <p className="text-lg font-semibold text-gray-900 dark:text-gray-100 mt-2">
                            ${(product.prices[0].amount / 100).toFixed(2)} {product.prices[0].currency_code}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="blue"
                          href={`/admin/shop/products/${product.id}/edit`}
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="gray"
                          onClick={() => showToast('Delete product functionality coming soon', 'info')}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Orders Tab */}
      {activeTab === 'orders' && (
        <div role="tabpanel" id="orders-panel" aria-labelledby="orders-tab">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
            Recent Orders
          </h2>

          {orders.length === 0 ? (
            <Card hoverEffect="none">
              <div className="p-8 text-center">
                <p className="text-gray-600 dark:text-gray-400">
                  No orders yet. Orders will appear here when customers make purchases.
                </p>
              </div>
            </Card>
          ) : (
            <div className="grid gap-4">
              {orders.map((order) => (
                <Card key={order.id} hoverEffect="lift">
                  <div className="p-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                          Order #{order.id.slice(0, 8)}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                          Customer: {order.email}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Items: {order.items?.length || 0}
                        </p>
                        <p className="text-lg font-semibold text-gray-900 dark:text-gray-100 mt-2">
                          ${(order.total / 100).toFixed(2)}
                        </p>
                      </div>
                      <div>
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${
                            order.status === 'completed'
                              ? `${statusBadgeColors.completed.bg} ${statusBadgeColors.completed.text}`
                              : order.status === 'pending'
                              ? `${statusBadgeColors.pending.bg} ${statusBadgeColors.pending.text}`
                              : `${statusBadgeColors.cancelled.bg} ${statusBadgeColors.cancelled.text}`
                          }`}
                        >
                          {order.status}
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
