// ============================================================================
// Order History Page - /orders
// ============================================================================
// Customer-facing page to view past orders
// Uses existing /api/user/orders endpoint

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/Button';
import StatusBadge from '@/components/StatusBadge';
import { accentColors } from '@/lib/colors';

// ============================================================================
// Types
// ============================================================================

interface Order {
  id: string;
  medusa_order_id: string;
  total: number;
  status: 'pending' | 'completed' | 'canceled';
  email: string;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// Order History Page Component
// ============================================================================

export default function OrderHistoryPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ============================================================================
  // Load Orders on Mount
  // ============================================================================

  useEffect(() => {
    async function loadOrders() {
      try {
        const response = await fetch('/api/user/orders');

        if (response.status === 401) {
          // Not authenticated - redirect to login
          router.push('/login?redirect=/orders');
          return;
        }

        if (!response.ok) {
          throw new Error('Failed to load orders');
        }

        const data = await response.json();
        setOrders(data.orders || []);
      } catch (err) {
        console.error('Error loading orders:', err);
        setError('Failed to load your orders. Please try again.');
      } finally {
        setLoading(false);
      }
    }

    loadOrders();
  }, [router]);

  // ============================================================================
  // Format Helpers
  // ============================================================================

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(cents / 100);
  };

  const getStatusVariant = (status: string): 'completed' | 'in_progress' | 'submitted' => {
    switch (status) {
      case 'completed':
        return 'completed';
      case 'pending':
        return 'in_progress';
      case 'canceled':
        return 'submitted';
      default:
        return 'submitted';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Completed';
      case 'pending':
        return 'Processing';
      case 'canceled':
        return 'Canceled';
      default:
        return 'Unknown';
    }
  };

  // ============================================================================
  // Loading State
  // ============================================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-white py-16 px-4 sm:px-6 md:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="space-y-3 mt-8">
              <div className="h-32 bg-gray-200 rounded"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================================
  // Error State
  // ============================================================================

  if (error) {
    return (
      <div className="min-h-screen bg-white py-16 px-4 sm:px-6 md:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Order History</h1>
            <div className={`${accentColors.red.bg} ${accentColors.red.text} p-4 rounded-lg mb-6`}>
              {error}
            </div>
            <Button variant="blue" onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================================
  // Empty State
  // ============================================================================

  if (orders.length === 0) {
    return (
      <div className="min-h-screen bg-white py-16 px-4 sm:px-6 md:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Order History</h1>
            <p className="text-gray-600 mb-8">
              You haven't placed any orders yet.
            </p>
            <Button variant="blue" href="/shop">
              Browse Products
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================================
  // Orders List
  // ============================================================================

  return (
    <div className="min-h-screen bg-white py-16 px-4 sm:px-6 md:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className={`text-3xl font-bold ${accentColors.blue.text} mb-2`}>
            Order History
          </h1>
          <p className="text-gray-600">
            View and track your past orders
          </p>
        </div>

        {/* Orders List */}
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="border border-gray-200 rounded-lg p-6 hover:border-blue-300 transition-colors"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                {/* Order Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Order #{order.medusa_order_id.slice(0, 8)}
                    </h3>
                    <StatusBadge
                      status={getStatusVariant(order.status)}
                      size="sm"
                    />
                  </div>
                  <p className="text-sm text-gray-600 mb-1">
                    Placed on {formatDate(order.created_at)}
                  </p>
                  <p className="text-sm text-gray-600">
                    Status: {getStatusLabel(order.status)}
                  </p>
                </div>

                {/* Order Total */}
                <div className="text-right">
                  <p className="text-sm text-gray-600 mb-1">Total</p>
                  <p className={`text-2xl font-bold ${accentColors.blue.text}`}>
                    {formatPrice(order.total)}
                  </p>
                </div>
              </div>

              {/* Order Actions */}
              <div className="mt-4 pt-4 border-t border-gray-200 flex gap-3">
                <Button
                  variant="blue"
                  size="sm"
                  href={`/orders/${order.medusa_order_id}`}
                >
                  View Details
                </Button>
                {order.status === 'completed' && (
                  <Button
                    variant="gray"
                    size="sm"
                    href="/contact"
                  >
                    Need Help?
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Back Button */}
        <div className="mt-8 text-center">
          <Button variant="gray" href="/admin/dashboard">
            Back to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}
