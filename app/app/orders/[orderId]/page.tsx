// ============================================================================
// Order Detail Page - /orders/[orderId]
// ============================================================================
// Shows detailed information about a specific order

'use client';

import { useEffect, useState, use } from 'react';
import Image from 'next/image';
import Button from '@/components/Button';
import StatusBadge from '@/components/StatusBadge';
import OrderInvoice from '@/components/OrderInvoice';
import { accentColors } from '@/lib/colors';
import { medusaClient } from '@/lib/medusa-client';
import type { Order, LineItem } from '@/lib/medusa-client';

// ============================================================================
// Order Detail Page Component
// ============================================================================

export default function OrderDetailPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const resolvedParams = use(params);
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showInvoice, setShowInvoice] = useState(false);

  // ============================================================================
  // Load Order Details
  // ============================================================================

  useEffect(() => {
    async function loadOrder() {
      try {
        const orderData = await medusaClient.orders.get(resolvedParams.orderId);
        setOrder(orderData);
      } catch (err) {
        console.error('Error loading order:', err);
        setError('Failed to load order details. Please try again.');
      } finally {
        setLoading(false);
      }
    }

    loadOrder();
  }, [resolvedParams.orderId]);

  // ============================================================================
  // Format Helpers
  // ============================================================================

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
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
  // Order Timeline Stages
  // ============================================================================
  // Define the progression of an order through fulfillment stages

  interface TimelineStage {
    id: string;
    label: string;
    description: string;
    icon: string;
  }

  const timelineStages: TimelineStage[] = [
    {
      id: 'placed',
      label: 'Order Placed',
      description: 'Your order has been received',
      icon: '✓',
    },
    {
      id: 'processing',
      label: 'Processing',
      description: 'We are preparing your order',
      icon: '⚙',
    },
    {
      id: 'shipped',
      label: 'Shipped',
      description: 'Your order is on its way',
      icon: '📦',
    },
    {
      id: 'delivered',
      label: 'Delivered',
      description: 'Order has been delivered',
      icon: '🎉',
    },
  ];

  const getCurrentStageIndex = (): number => {
    // Map order status to timeline position
    // 'pending' shows placed + processing (index 1)
    // 'completed' shows all stages (index 3)
    // 'canceled' shows placed only (index 0)
    if (order?.status === 'completed') return 3;
    if (order?.status === 'pending') return 1;
    if (order?.status === 'canceled') return 0;
    return 0;
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
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================================
  // Error State
  // ============================================================================

  if (error || !order) {
    return (
      <div className="min-h-screen bg-white py-16 px-4 sm:px-6 md:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Order Not Found</h1>
            <p className="text-gray-600 mb-6">
              {error || "We couldn't find this order."}
            </p>
            <Button variant="blue" href="/orders">
              Back to Orders
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================================
  // Order Details View
  // ============================================================================

  return (
    <div className="min-h-screen bg-white py-16 px-4 sm:px-6 md:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Action Buttons */}
        <div className="mb-6 flex gap-3">
          <Button variant="gray" size="sm" href="/orders">
            ← Back to Orders
          </Button>
          <Button
            variant="blue"
            size="sm"
            onClick={() => setShowInvoice(true)}
          >
            📄 Invoice
          </Button>
        </div>

        {/* Order Header */}
        <div className="mb-8 pb-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h1 className={`text-3xl font-bold ${accentColors.blue.text}`}>
              Order #{order.id.slice(0, 8)}
            </h1>
            <StatusBadge status={getStatusVariant(order.status)} />
          </div>
          <p className="text-gray-600">
            Placed on {formatDate(order.created_at)}
          </p>
          <p className="text-sm text-gray-500">
            Order ID: {order.id}
          </p>
        </div>

        {/* Order Tracking Timeline */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Order Progress</h2>
          <div className="space-y-4">
            {timelineStages.map((stage, index) => {
              const isComplete = index <= getCurrentStageIndex();
              const isCanceled = order?.status === 'canceled';

              return (
                <div key={stage.id} className="flex gap-4">
                  {/* Timeline Dot and Line */}
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-semibold transition-all ${
                        isComplete && !isCanceled
                          ? 'bg-emerald-100 text-emerald-700 border-2 border-emerald-500'
                          : 'bg-gray-100 text-gray-400 border-2 border-gray-300'
                      }`}
                    >
                      {stage.icon}
                    </div>
                    {index < timelineStages.length - 1 && (
                      <div
                        className={`w-1 h-12 mt-2 ${
                          isComplete && !isCanceled
                            ? 'bg-emerald-300'
                            : 'bg-gray-200'
                        }`}
                      />
                    )}
                  </div>

                  {/* Timeline Content */}
                  <div className="pb-4 pt-2">
                    <h3
                      className={`font-semibold ${
                        isComplete && !isCanceled
                          ? 'text-emerald-700'
                          : 'text-gray-500'
                      }`}
                    >
                      {stage.label}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {stage.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Canceled Order Message */}
          {order?.status === 'canceled' && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">
                This order has been canceled. If you have questions, please contact support.
              </p>
            </div>
          )}
        </div>

        {/* Order Items */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Items</h2>
          <div className="space-y-4">
            {order.items.map((item: LineItem) => (
              <div
                key={item.id}
                className="flex gap-4 p-4 border border-gray-200 rounded-lg"
              >
                {/* Product Image */}
                {item.thumbnail && (
                  <div className="flex-shrink-0">
                    <Image
                      src={item.thumbnail}
                      alt={item.title || 'Product'}
                      width={80}
                      height={80}
                      unoptimized
                      className="object-cover rounded"
                    />
                  </div>
                )}

                {/* Product Details */}
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">
                    {item.title || 'Product'}
                  </h3>
                  {item.description && (
                    <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                  )}
                  <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                </div>

                {/* Item Price */}
                <div className="text-right">
                  <p className="font-semibold text-gray-900">
                    {formatPrice((item.unit_price || 0) * item.quantity)}
                  </p>
                  <p className="text-sm text-gray-500">
                    {formatPrice(item.unit_price || 0)} each
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Summary</h2>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="font-semibold text-gray-900">Total</span>
              <span className={`font-bold text-xl ${accentColors.blue.text}`}>
                {formatPrice(order.total)}
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              Includes all taxes and fees
            </p>
          </div>
        </div>

        {/* Order Info */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="border border-gray-200 rounded-lg p-6">
            <h3 className="font-semibold text-gray-900 mb-3">Order Information</h3>
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-gray-600">Email:</span>{' '}
                <span className="text-gray-900">{order.email}</span>
              </div>
              <div>
                <span className="text-gray-600">Status:</span>{' '}
                <span className="text-gray-900">{getStatusLabel(order.status)}</span>
              </div>
              <div>
                <span className="text-gray-600">Order Date:</span>{' '}
                <span className="text-gray-900">{formatDate(order.created_at)}</span>
              </div>
            </div>
          </div>

          <div className="border border-gray-200 rounded-lg p-6">
            <h3 className="font-semibold text-gray-900 mb-3">Need Help?</h3>
            <p className="text-sm text-gray-600 mb-4">
              Have questions about your order? We're here to help.
            </p>
            <Button variant="blue" size="sm" href="/contact">
              Contact Support
            </Button>
          </div>
        </div>
      </div>

      {/* Invoice Modal */}
      {showInvoice && order && (
        <OrderInvoice order={order} onClose={() => setShowInvoice(false)} isModal={true} />
      )}
    </div>
  );
}
